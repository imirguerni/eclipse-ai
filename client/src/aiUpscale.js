// OVortex — agrandissement neuronal local (ONNX Runtime Web).
// Le module reçoit ORT en dépendance : aucune importation implicite du runtime.
// Entrée modèle attendue : float32 [1,3,H,W], RGB normalisé 0..1.
// Sortie attendue : float32 [1,3,H*s,W*s], RGB normalisé 0..1.

const clampi = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const MAX_AI_OUTPUT_PIXELS = 40_000_000;

export function webgpuAvailable() {
  return typeof navigator !== 'undefined' && Boolean(navigator.gpu);
}

// Heuristique de départ uniquement : deviceMemory est la RAM déclarée, pas la VRAM.
export function suggestTileSize() {
  const mem = typeof navigator !== 'undefined' && Number(navigator.deviceMemory)
    ? Number(navigator.deviceMemory)
    : 4;
  if (!webgpuAvailable()) return 128;
  return mem >= 8 ? 256 : mem >= 4 ? 192 : 128;
}

async function canRequestWebGPU() {
  try {
    if (!webgpuAvailable() || typeof navigator.gpu.requestAdapter !== 'function') return false;
    const adapter = await navigator.gpu.requestAdapter();
    return Boolean(adapter);
  } catch {
    return false;
  }
}

export function createUpscaler({
  ort,
  modelUrl,
  tileSize,
  overlap = 16,
  wasmPaths = null,
  executionProviders = ['webgpu', 'wasm'],
  maxOutputPixels = MAX_AI_OUTPUT_PIXELS,
  numThreads = 2
}) {
  if (!ort || !ort.InferenceSession || !ort.Tensor) {
    throw new Error('createUpscaler : « ort » (onnxruntime-web) est obligatoire.');
  }
  if (typeof modelUrl !== 'string' || !modelUrl.trim()) {
    throw new Error('createUpscaler : « modelUrl » est obligatoire.');
  }

  const requestedTile = Number(tileSize);
  const T = Math.max(32, Math.min(512, Math.round(Number.isFinite(requestedTile) && requestedTile > 0 ? requestedTile : suggestTileSize())));
  const requestedOverlap = Number(overlap);
  const safeOverlap = Number.isFinite(requestedOverlap) ? Math.round(requestedOverlap) : 16;
  const O = Math.max(4, Math.min(safeOverlap, Math.floor((T - 8) / 2)));
  const requestedMaxPixels = Number(maxOutputPixels);
  const configuredMaxPixels = Number.isSafeInteger(requestedMaxPixels) && requestedMaxPixels > 0 ? requestedMaxPixels : MAX_AI_OUTPUT_PIXELS;
  const memoryGb = typeof navigator !== 'undefined' && Number(navigator.deviceMemory) > 0 ? Number(navigator.deviceMemory) : 4;
  const devicePixelCap = memoryGb <= 4 ? 12_000_000 : memoryGb <= 8 ? 24_000_000 : MAX_AI_OUTPUT_PIXELS;
  const outputPixelLimit = Math.min(configuredMaxPixels, devicePixelCap);
  const resolvedModelUrl = modelUrl.trim();
  const step = T - 2 * O;
  const providers = Array.isArray(executionProviders) ? executionProviders : ['wasm'];
  const uniqueProviders = [...new Set(providers.filter((p) => p === 'webgpu' || p === 'wasm'))];
  if (!uniqueProviders.includes('wasm')) uniqueProviders.push('wasm');

  let session = null;
  let loading = null;
  let activeProvider = null;
  let scale = 0;
  let disposed = false;

  function configureWasm() {
    if (!ort.env || !ort.env.wasm) return;
    if (wasmPaths) ort.env.wasm.wasmPaths = wasmPaths;
    // Évite de surcharger les appareils modestes ; ORT peut ignorer ce réglage selon la version.
    const requestedThreads = Number(numThreads);
    const requested = Math.max(1, Math.min(4, Number.isFinite(requestedThreads) ? Math.round(requestedThreads) : 1));
    // Les threads WASM partagés nécessitent l'isolation cross-origin ; sinon rester en mono-thread.
    ort.env.wasm.numThreads = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated ? requested : 1;
    ort.env.wasm.proxy = false;
  }

  async function createProviderSession(provider) {
    const created = await ort.InferenceSession.create(resolvedModelUrl, {
      executionProviders: [provider],
      graphOptimizationLevel: 'all'
    });
    if (created.inputNames?.length !== 1 || created.outputNames?.length !== 1) {
      try { await created.release?.(); } catch { /* libération best effort */ }
      throw new Error('Le modèle ONNX doit déclarer exactement une entrée et une sortie RGB.');
    }
    return created;
  }

  async function getSession() {
    if (disposed) throw new Error('Moteur IA fermé. Créez une nouvelle instance.');
    if (session) return session;
    if (loading) return loading;

    loading = (async () => {
      configureWasm();
      const ordered = [];
      if (uniqueProviders.includes('webgpu') && await canRequestWebGPU()) ordered.push('webgpu');
      if (uniqueProviders.includes('wasm')) ordered.push('wasm');
      if (!ordered.length) ordered.push('wasm');
      const failures = [];
      for (const provider of ordered) {
        if (disposed) throw new Error('Chargement du moteur annulé.');
        try {
          const created = await createProviderSession(provider);
          if (disposed) {
            try { await created.release?.(); } catch { /* libération best effort */ }
            throw new Error('Chargement du moteur annulé.');
          }
          session = created;
          activeProvider = provider;
          return session;
        } catch (error) {
          failures.push(`${provider}: ${error?.message || error}`);
        }
      }
      throw new Error(`Impossible de charger le modèle ONNX. ${failures.join(' | ')}`);
    })();
    try {
      return await loading;
    } finally {
      loading = null;
    }
  }

  async function switchToWasm() {
    if (disposed) throw new Error('Moteur IA fermé.');
    if (activeProvider === 'wasm') throw new Error('Le moteur WASM a également échoué.');
    const previous = session;
    session = null;
    activeProvider = null;
    try { await previous?.release?.(); } catch { /* device perdu : libération best effort */ }
    configureWasm();
    const fallbackSession = await createProviderSession('wasm');
    if (disposed) {
      try { await fallbackSession.release?.(); } catch { /* libération best effort */ }
      throw new Error('Moteur IA fermé pendant le basculement WASM.');
    }
    session = fallbackSession;
    activeProvider = 'wasm';
    return session;
  }

  function validateTensorOutput(out, inputHeight, inputWidth) {
    const d = out?.dims;
    if (!d || d.length !== 4 || d[0] !== 1 || d[1] !== 3) {
      throw new Error(`Sortie ONNX incompatible : ${d ? d.join('×') : 'dimensions absentes'}. Format RGB [1,3,H,W] requis.`);
    }
    const scaleX = d[3] / inputWidth;
    const scaleY = d[2] / inputHeight;
    if (!Number.isInteger(scaleX) || !Number.isInteger(scaleY) || scaleX < 1 || scaleX !== scaleY) {
      throw new Error(`Facteur de super-résolution invalide : ${d.join('×')}.`);
    }
    const expected = d[0] * d[1] * d[2] * d[3];
    if (!out.data || out.data.length !== expected) {
      throw new Error('La sortie du modèle ONNX ne contient pas le nombre de valeurs attendu.');
    }
    return scaleX;
  }

  async function runTileOnce(sess, data, W, H, x0, y0) {
    const plane = T * T;
    const input = new Float32Array(3 * plane);
    for (let ty = 0; ty < T; ty++) {
      const sy = clampi(y0 - O + ty, 0, H - 1);
      for (let tx = 0; tx < T; tx++) {
        const sx = clampi(x0 - O + tx, 0, W - 1);
        const i = (sy * W + sx) * 4;
        const o = ty * T + tx;
        input[o] = data[i] / 255;
        input[plane + o] = data[i + 1] / 255;
        input[2 * plane + o] = data[i + 2] / 255;
      }
    }

    const inputName = sess.inputNames[0];
    const outputName = sess.outputNames[0];
    const feeds = { [inputName]: new ort.Tensor('float32', input, [1, 3, T, T]) };
    const results = await sess.run(feeds);
    const out = results?.[outputName];
    const s = validateTensorOutput(out, T, T);
    return { out: out.data, s };
  }

  async function runTile(data, W, H, x0, y0) {
    const current = await getSession();
    try {
      return await runTileOnce(current, data, W, H, x0, y0);
    } catch (error) {
      // Un device WebGPU peut être perdu après la création de la session.
      // Dans ce cas, bascule réellement sur WASM et rejoue la tuile concernée.
      if (activeProvider !== 'webgpu') throw error;
      const fallback = await switchToWasm();
      try {
        return await runTileOnce(fallback, data, W, H, x0, y0);
      } catch (fallbackError) {
        throw new Error(`Échec WebGPU (${error?.message || error}) puis WASM (${fallbackError?.message || fallbackError}).`);
      }
    }
  }

  async function upscale(source, { onProgress, shouldStop } = {}) {
    if (disposed) throw new Error('Moteur IA fermé. Créez une nouvelle instance.');
    if (!source) throw new Error('Image source absente.');
    const W = Math.floor(source.naturalWidth || source.videoWidth || source.width || 0);
    const H = Math.floor(source.naturalHeight || source.videoHeight || source.height || 0);
    if (!Number.isSafeInteger(W) || !Number.isSafeInteger(H) || W <= 0 || H <= 0) throw new Error('Image source vide ou dimensions invalides.');
    const sourcePixelsCount = W * H;
    if (!Number.isSafeInteger(sourcePixelsCount) || sourcePixelsCount > outputPixelLimit) throw new Error(`Image source trop grande (${W}×${H}). Limite adaptée à cet appareil : ${outputPixelLimit.toLocaleString()} pixels.`);
    if (typeof document === 'undefined') throw new Error('Le traitement nécessite un navigateur avec Canvas.');
    if (shouldStop?.()) throw new Error('Agrandissement annulé.');

    await getSession();
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = W;
    srcCanvas.height = H;
    const sctx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!sctx) throw new Error('Impossible de créer le contexte Canvas 2D.');

    let sourcePixels;
    try {
      sctx.drawImage(source, 0, 0, W, H);
      sourcePixels = sctx.getImageData(0, 0, W, H).data;
    } catch (error) {
      throw new Error(`Lecture de l’image impossible (origine/CORS ou mémoire) : ${error?.message || error}`);
    }

    const nx = Math.ceil(W / step);
    const ny = Math.ceil(H / step);
    const total = nx * ny;
    let outW = 0;
    let outH = 0;
    let outData = null;
    let detectedScale = 0;
    let done = 0;

    try {
      for (let ty = 0; ty < ny; ty++) {
        for (let tx = 0; tx < nx; tx++) {
          if (disposed || shouldStop?.()) throw new Error('Agrandissement annulé.');
          const x0 = tx * step;
          const y0 = ty * step;
          const { out, s } = await runTile(sourcePixels, W, H, x0, y0);
          if (disposed || shouldStop?.()) throw new Error('Agrandissement annulé.');

          if (!outData) {
            detectedScale = s;
            outW = W * s;
            outH = H * s;
            const outputPixels = outW * outH;
            if (!Number.isSafeInteger(outputPixels) || outputPixels > outputPixelLimit) {
              throw new Error(`Image trop grande après agrandissement (${outW}×${outH}, ${outputPixels.toLocaleString()} pixels). Limite adaptée à cet appareil : ${outputPixelLimit.toLocaleString()} pixels.`);
            }
            outData = new Uint8ClampedArray(outputPixels * 4);
          } else if (s !== detectedScale) {
            throw new Error('Le modèle a renvoyé des facteurs d’agrandissement différents entre les tuiles.');
          }

          const tp = T * s;
          const tplane = tp * tp;
          const cw = Math.min(step, W - x0);
          const ch = Math.min(step, H - y0);
          const crop = O * s;
          for (let yy = 0; yy < ch * s; yy++) {
            const srcY = y0 * s + yy;
            let dstIndex = (srcY * outW + x0 * s) * 4;
            let modelIndex = (crop + yy) * tp + crop;
            // La zone centrale est copiée une seule fois ; les tuiles couvrent toute l'image.
            for (let xx = 0; xx < cw * s; xx++, dstIndex += 4, modelIndex++) {
              const r = out[modelIndex];
              const g = out[tplane + modelIndex];
              const b = out[2 * tplane + modelIndex];
              outData[dstIndex] = Number.isFinite(r) ? r * 255 : 0;
              outData[dstIndex + 1] = Number.isFinite(g) ? g * 255 : 0;
              outData[dstIndex + 2] = Number.isFinite(b) ? b * 255 : 0;
              // Préserve la transparence de l'image d'origine au lieu de rendre tout opaque.
              const sourceX = Math.min(W - 1, x0 + Math.floor(xx / s));
              const sourceY = Math.min(H - 1, y0 + Math.floor(yy / s));
              outData[dstIndex + 3] = sourcePixels[(sourceY * W + sourceX) * 4 + 3];
            }
          }

          done++;
          if (typeof onProgress === 'function') onProgress(done / total);
          await tick();
        }
      }

      if (disposed || shouldStop?.()) throw new Error('Agrandissement annulé.');
      const result = document.createElement('canvas');
      result.width = outW;
      result.height = outH;
      const resultContext = result.getContext('2d');
      if (!resultContext) throw new Error('Impossible de créer le Canvas de sortie.');
      resultContext.putImageData(new ImageData(outData, outW, outH), 0, 0);
      scale = detectedScale;
      return result;
    } catch (error) {
      // Évite de conserver un tampon massif après une annulation ou une erreur.
      outData = null;
      throw error;
    }
  }

  async function selfTest() {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D indisponible pour le test.');
    const g = ctx.createLinearGradient(0, 0, 96, 96);
    g.addColorStop(0, '#223355');
    g.addColorStop(1, '#ffcc88');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
    ctx.fillStyle = '#fff';
    ctx.fillRect(30, 30, 36, 36);
    await upscale(c);
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return { ms: Math.round(t1 - t0), scale, webgpu: activeProvider === 'webgpu', provider: activeProvider };
  }

  async function dispose() {
    disposed = true;
    if (loading) {
      try { await loading; } catch { /* échec/annulation du chargement */ }
    }
    const current = session;
    session = null;
    loading = null;
    activeProvider = null;
    if (current?.release) {
      try { await current.release(); } catch { /* libération best effort */ }
    }
  }

  return {
    upscale,
    selfTest,
    dispose,
    get scale() { return scale; },
    get provider() { return activeProvider; },
    tileSize: T,
    overlap: O,
    tileStep: step
  };
}
