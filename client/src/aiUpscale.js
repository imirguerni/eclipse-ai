// Agrandissement par IA dans le navigateur (ONNX Runtime Web, WebGPU ou WASM).
//
// Principe du TUILAGE : une image 4K envoyée d'un bloc au réseau de neurones créerait un tenseur gigantesque
// et ferait « perdre » le GPU (device lost). On découpe donc l'image en tuiles de taille fixe, avec un
// RECOUVREMENT (overlap) : chaque tuile est traitée avec une marge autour d'elle, puis seule sa zone centrale
// est conservée. Les morceaux sont réassemblés en mémoire : aucune « ligne de coupe » n'est visible.
//
// Ce module n'importe PAS onnxruntime-web : vous le passez en paramètre (`ort`), ce qui évite les soucis de
// bundler et vous laisse choisir la variante (WebGPU ou WASM) :
//
//   import * as ort from 'onnxruntime-web/webgpu';          // npm i onnxruntime-web
//   const upscaler = createUpscaler({ ort, modelUrl: '/models/realesr-general-x4v3.onnx' });
//   const canvas = await upscaler.upscale(imageOuCanvas, { onProgress, shouldStop });
//
// Le modèle doit être un réseau de super-résolution (ex. Real-ESRGAN) : entrée float32 [1,3,H,W] en 0..1,
// sortie float32 [1,3,H*s,W*s] en 0..1.

const clampi = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const MAX_AI_OUTPUT_PIXELS = 40_000_000;

export function webgpuAvailable() {
  return typeof navigator !== 'undefined' && Boolean(navigator.gpu);
}

// Taille de tuile conseillée selon la mémoire GPU annoncée (heuristique prudente).
export function suggestTileSize() {
  const mem = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 4;
  if (!webgpuAvailable()) return 128; // WASM : petites tuiles
  return mem >= 8 ? 384 : mem >= 4 ? 256 : 192;
}

export function createUpscaler({
  ort,
  modelUrl,
  tileSize = 256,
  overlap = 16,
  wasmPaths = null,
  executionProviders = ['webgpu', 'wasm']
}) {
  if (!ort || !ort.InferenceSession || !ort.Tensor) throw new Error('createUpscaler : « ort » (onnxruntime-web) est obligatoire.');
  if (!modelUrl) throw new Error('createUpscaler : « modelUrl » est obligatoire.');
  const T = Math.max(32, Math.round(tileSize));
  const O = Math.max(4, Math.min(Math.round(overlap), Math.floor((T - 8) / 2)));
  const step = T - 2 * O; // zone centrale conservée de chaque tuile
  let session = null;
  let loading = null;
  let scale = 0; // facteur détecté au premier passage

  async function getSession() {
    if (session) return session;
    if (!loading) {
      if (wasmPaths && ort.env && ort.env.wasm) ort.env.wasm.wasmPaths = wasmPaths;
      loading = ort.InferenceSession.create(modelUrl, { executionProviders, graphOptimizationLevel: 'all' }).then((s) => {
        session = s;
        return s;
      });
      loading.catch(() => { loading = null; });
    }
    return loading;
  }

  // Traite UNE tuile : `data` = image source RGBA, (x0, y0) = coin de la zone centrale.
  async function runTile(sess, data, W, H, x0, y0) {
    const plane = T * T;
    const input = new Float32Array(3 * plane);
    for (let ty = 0; ty < T; ty++) {
      const sy = clampi(y0 - O + ty, 0, H - 1); // bords : on répète les pixels du bord
      for (let tx = 0; tx < T; tx++) {
        const sx = clampi(x0 - O + tx, 0, W - 1);
        const i = (sy * W + sx) * 4;
        const o = ty * T + tx;
        input[o] = data[i] / 255;
        input[plane + o] = data[i + 1] / 255;
        input[2 * plane + o] = data[i + 2] / 255;
      }
    }
    const feeds = { [sess.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, T, T]) };
    const results = await sess.run(feeds);
    const out = results[sess.outputNames[0]];
    const dims = out.dims; // [1, 3, T*s, T*s]
    const s = Math.round(dims[3] / T);
    if (!s || dims[3] !== T * s || dims[2] !== T * s) throw new Error(`Sortie du modèle inattendue (${dims.join('×')}) : modèle de super-résolution requis.`);
    return { out: out.data, s };
  }

  // Agrandit une image ou un canvas. Retourne un canvas (taille source × facteur du modèle).
  async function upscale(source, { onProgress, shouldStop } = {}) {
    const W = source.naturalWidth || source.videoWidth || source.width;
    const H = source.naturalHeight || source.videoHeight || source.height;
    if (!W || !H) throw new Error('Image source vide.');
    const sess = await getSession();

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = W;
    srcCanvas.height = H;
    const sctx = srcCanvas.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(source, 0, 0, W, H);
    const data = sctx.getImageData(0, 0, W, H).data;

    const nx = Math.ceil(W / step);
    const ny = Math.ceil(H / step);
    const total = nx * ny;
    let outW = 0;
    let outH = 0;
    let outData = null;
    let done = 0;

    for (let ty = 0; ty < ny; ty++) {
      for (let tx = 0; tx < nx; tx++) {
        if (shouldStop && shouldStop()) throw new Error('Agrandissement annulé.');
        const x0 = tx * step;
        const y0 = ty * step;
        const { out, s } = await runTile(sess, data, W, H, x0, y0);

        if (!outData) {
          scale = s;
          outW = W * s;
          outH = H * s;
          if (outW * outH > MAX_AI_OUTPUT_PIXELS) throw new Error(`Image trop grande après agrandissement (${outW}×${outH}). Réduisez la source ou le facteur.`);
          outData = new Uint8ClampedArray(outW * outH * 4);
          for (let a = 3; a < outData.length; a += 4) outData[a] = 255;
        }

        const tp = T * s; // côté de la tuile agrandie
        const tplane = tp * tp;
        const cw = Math.min(step, W - x0);
        const ch = Math.min(step, H - y0);
        const ox = O * s; // on saute la marge de recouvrement
        for (let yy = 0; yy < ch * s; yy++) {
          const dy = y0 * s + yy;
          let di = (dy * outW + x0 * s) * 4;
          let si = (ox + yy) * tp + ox; // ligne de la zone centrale dans la tuile agrandie
          for (let xx = 0; xx < cw * s; xx++, di += 4, si++) {
            outData[di] = out[si] * 255; // le Uint8ClampedArray arrondit et plafonne à 0..255
            outData[di + 1] = out[tplane + si] * 255;
            outData[di + 2] = out[2 * tplane + si] * 255;
          }
        }
        done++;
        if (onProgress) onProgress(done / total);
        await tick(); // laisse respirer l'interface (progression, annulation)
      }
    }

    const result = document.createElement('canvas');
    result.width = outW;
    result.height = outH;
    result.getContext('2d').putImageData(new ImageData(outData, outW, outH), 0, 0);
    return result;
  }

  // Vérifie que le modèle se charge et fonctionne ; retourne { ms, scale, webgpu }.
  async function selfTest() {
    const t0 = performance.now();
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 96, 96);
    g.addColorStop(0, '#223355');
    g.addColorStop(1, '#ffcc88');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
    ctx.fillStyle = '#fff';
    ctx.fillRect(30, 30, 36, 36);
    await upscale(c);
    return { ms: Math.round(performance.now() - t0), scale, webgpu: webgpuAvailable() };
  }

  async function dispose() {
    try { if (session && session.release) await session.release(); } catch { /* ignoré */ }
    session = null;
    loading = null;
  }

  return { upscale, selfTest, dispose, get scale() { return scale; }, tileSize: T, overlap: O };
}
