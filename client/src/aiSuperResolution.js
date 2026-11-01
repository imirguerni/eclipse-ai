import { createUpscaler } from './aiUpscale.js';
import { DEFAULT_SUPER_RESOLUTION_MODEL } from './aiModels.js';

/** Super-résolution ONNX x4 (Real-ESRGAN), distincte de la restauration x1. */
export function createAiSuperResolution({
  ort,
  modelUrl = DEFAULT_SUPER_RESOLUTION_MODEL.url,
  tileSize = 128,
  overlap = 16,
  wasmPaths = null,
  executionProviders = ['webgpu', 'wasm'],
  maxOutputPixels,
  numThreads = 1
} = {}) {
  if (!ort?.InferenceSession || !ort?.Tensor) throw new Error('OVortex Super Resolution : onnxruntime-web est requis.');
  if (typeof modelUrl !== 'string' || !/^https:\/\//i.test(modelUrl.trim())) throw new Error('OVortex Super Resolution : URL HTTPS ONNX invalide.');
  const engine = createUpscaler({ ort, modelUrl: modelUrl.trim(), tileSize, overlap, wasmPaths, executionProviders, maxOutputPixels, numThreads });
  let disposed = false;
  let validation = null;
  async function validate() {
    if (!validation) {
      validation = engine.selfTest().then((r) => {
        if (r.scale !== 4) throw new Error(`Real-ESRGAN x4plus attendu ; facteur détecté : x${r.scale}.`);
        return r;
      }).catch((e) => { validation = null; throw e; });
    }
    return validation;
  }
  async function upscale(source, options = {}) {
    if (disposed) throw new Error('OVortex Super Resolution est fermé.');
    await validate();
    if (disposed) throw new Error('OVortex Super Resolution est fermé.');
    const result = await engine.upscale(source, options);
    if (result.width !== (source.naturalWidth || source.videoWidth || source.width) * 4 ||
        result.height !== (source.naturalHeight || source.videoHeight || source.height) * 4) {
      throw new Error('Le modèle chargé ne produit pas une sortie x4 conforme.');
    }
    return result;
  }
  async function dispose() { if (disposed) return; disposed = true; await engine.dispose(); }
  return { upscale, selfTest: validate, dispose, model: DEFAULT_SUPER_RESOLUTION_MODEL, get provider() { return engine.provider; }, get tileSize() { return engine.tileSize; } };
}
