import { createUpscaler, webgpuAvailable } from './aiUpscale.js';
import { DEFAULT_RESTORATION_MODEL } from './aiModels.js';

/**
 * Restauration neuronale ONNX x1.
 * Le modèle SwinIR fourni attend obligatoirement des tuiles RGB 128x128.
 * Il est spécialisé dans le débruitage gaussien σ=25 : ne pas le présenter
 * comme un déflouteur ou un modèle universel de reconstruction de détails.
 */
export function createAiEnhancer({
  ort,
  modelUrl = DEFAULT_RESTORATION_MODEL.url,
  tileSize = DEFAULT_RESTORATION_MODEL.inputSize,
  overlap = 16,
  wasmPaths = null,
  executionProviders = ['webgpu', 'wasm'],
  maxOutputPixels,
  numThreads = 1
} = {}) {
  if (!ort || !ort.InferenceSession || !ort.Tensor) {
    throw new Error('OVortex AI Enhance : onnxruntime-web est requis.');
  }
  if (typeof modelUrl !== 'string' || !/^https:\/\//i.test(modelUrl.trim())) {
    throw new Error('OVortex AI Enhance : URL HTTPS du modèle ONNX manquante ou invalide.');
  }
  const fixedTile = Number(tileSize);
  if (fixedTile !== DEFAULT_RESTORATION_MODEL.inputSize) {
    throw new Error(`SwinIR exige des tuiles de ${DEFAULT_RESTORATION_MODEL.inputSize} × ${DEFAULT_RESTORATION_MODEL.inputSize} pixels.`);
  }

  const engine = createUpscaler({
    ort,
    modelUrl: modelUrl.trim(),
    tileSize: DEFAULT_RESTORATION_MODEL.inputSize,
    overlap,
    wasmPaths,
    executionProviders,
    maxOutputPixels,
    numThreads
  });
  let disposed = false;
  let validation = null;

  async function validateModel() {
    if (!validation) {
      validation = engine.selfTest().then((result) => {
        if (result.scale !== 1) {
          throw new Error(`Modèle incompatible : sortie ×${result.scale}. Une restauration x1 est exigée.`);
        }
        return result;
      }).catch((error) => {
        validation = null;
        throw error;
      });
    }
    return validation;
  }

  async function enhance(source, options = {}) {
    if (disposed) throw new Error('OVortex AI Enhance est fermé.');
    await validateModel();
    if (disposed) throw new Error('OVortex AI Enhance est fermé.');
    const result = await engine.upscale(source, options);
    if (disposed) throw new Error('OVortex AI Enhance a été fermé pendant le traitement.');
    const sourceWidth = source.naturalWidth || source.videoWidth || source.width;
    const sourceHeight = source.naturalHeight || source.videoHeight || source.height;
    if (result.width !== sourceWidth || result.height !== sourceHeight) {
      throw new Error('Le modèle chargé ne produit pas une restauration x1 à dimensions constantes.');
    }
    return result;
  }

  async function selfTest() {
    if (disposed) throw new Error('OVortex AI Enhance est fermé.');
    const result = await validateModel();
    return { ...result, mode: 'restoration-x1', model: DEFAULT_RESTORATION_MODEL.id };
  }

  async function dispose() {
    if (disposed) return;
    disposed = true;
    await engine.dispose();
  }

  return {
    enhance,
    selfTest,
    dispose,
    model: DEFAULT_RESTORATION_MODEL,
    get provider() { return engine.provider; },
    get tileSize() { return engine.tileSize; },
    get overlap() { return engine.overlap; },
    get webgpuSupported() { return webgpuAvailable(); }
  };
}
