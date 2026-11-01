/**
 * Registre des modèles IA OVortex.
 * Les poids sont téléchargés à la demande depuis leurs dépôts publics ; ils ne sont
 * pas copiés dans le bundle JavaScript. Vérifier les licences avant redistribution.
 */
export const AI_MODELS = Object.freeze({
  restorationX1: Object.freeze({
    id: 'swinir-denoise-color25-x1',
    name: 'SwinIR Color Denoising σ=25',
    task: 'denoise-x1',
    url: 'https://huggingface.co/Heliosoph/swinir-onnx/resolve/a4a77e2/swinir_denoising_color_25.onnx',
    inputName: 'image',
    outputName: 'denoised',
    inputSize: 128,
    outputScale: 1,
    approxSizeMB: 54.9,
    license: 'Apache-2.0',
    source: 'https://huggingface.co/Heliosoph/swinir-onnx',
    limitation: 'Modèle de débruitage entraîné pour un bruit gaussien de niveau σ=25 ; ce n’est pas un restaurateur aveugle universel.'
  }),
  superResolutionX4: Object.freeze({
    id: 'realesrgan-x4plus',
    name: 'Real-ESRGAN x4plus',
    task: 'super-resolution-x4',
    url: 'https://huggingface.co/skillsafe-ai/realesrgan-x4plus/resolve/main/model.onnx',
    inputName: 'input',
    outputName: 'output',
    inputSize: 128,
    outputScale: 4,
    approxSizeMB: 63.95,
    license: 'BSD-3-Clause',
    source: 'https://huggingface.co/skillsafe-ai/realesrgan-x4plus',
    limitation: 'Super-résolution x4 ; le modèle peut inventer des détails plausibles et ne garantit pas une fidélité parfaite à la source.'
  })
});

export const DEFAULT_RESTORATION_MODEL = AI_MODELS.restorationX1;
export const DEFAULT_SUPER_RESOLUTION_MODEL = AI_MODELS.superResolutionX4;
