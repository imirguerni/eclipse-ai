/** Charge ONNX Runtime Web sans exiger qu'il soit injecté par le composant parent. */
export async function loadOnnxRuntime(providedRuntime = null, importer = (name) => import(name)) {
  const normalize = (module) => {
    const candidate = module?.default?.InferenceSession ? module.default : module;
    if (!candidate?.InferenceSession || !candidate?.Tensor) {
      throw new Error('ONNX Runtime Web est chargé mais son API InferenceSession/Tensor est indisponible.');
    }
    return candidate;
  };

  if (providedRuntime) return normalize(providedRuntime);

  let webgpuError = null;
  try {
    return normalize(await importer('onnxruntime-web/webgpu'));
  } catch (error) {
    webgpuError = error;
  }

  try {
    return normalize(await importer('onnxruntime-web'));
  } catch (wasmError) {
    const detail = wasmError?.message || webgpuError?.message || 'import impossible';
    throw new Error(`ONNX Runtime Web est absent ou incompatible. Installez-le dans le dossier client avec npm install onnxruntime-web. Détail : ${detail}`);
  }
}
