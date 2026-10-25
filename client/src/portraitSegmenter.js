// Détection automatique de la personne (MediaPipe « Image Segmenter », exécuté dans le navigateur).
// Le modèle et la bibliothèque sont chargés à la demande depuis un CDN : rien à installer.
// Vous pouvez héberger ces fichiers vous-même et passer vos propres adresses.

const DEFAULTS = {
  bundleUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
  wasmUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
  modelUrl:
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'
};

let cached = null;

export function loadPortraitSegmenter(options = {}) {
  if (cached) return cached;
  const cfg = { ...DEFAULTS, ...options };
  cached = (async () => {
    const mod = await import(/* @vite-ignore */ /* webpackIgnore: true */ cfg.bundleUrl);
    const fileset = await mod.FilesetResolver.forVisionTasks(cfg.wasmUrl);
    let segmenter = null;
    let delegateUsed = 'GPU';
    let lastError = null;
    for (const delegate of ['GPU', 'CPU']) {
      try {
        segmenter = await mod.ImageSegmenter.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: cfg.modelUrl, delegate },
          runningMode: 'IMAGE',
          outputConfidenceMasks: true,
          outputCategoryMask: false
        });
        delegateUsed = delegate;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!segmenter) throw lastError || new Error('Impossible de démarrer le détecteur de personne.');
    return {
      delegate: delegateUsed,
      // Retourne { data: Float32Array (probabilité « personne » 0..1), width, height } ou null.
      segment(source) {
        const result = segmenter.segment(source);
        const masks = result && result.confidenceMasks;
        if (!masks || !masks.length) { result?.close?.(); return null; }
        const background = masks[0]; // le modèle fournit la probabilité du fond en premier
        const bg = background.getAsFloat32Array();
        const person = new Float32Array(bg.length);
        for (let i = 0; i < bg.length; i++) person[i] = 1 - bg[i];
        const info = { data: person, width: background.width, height: background.height };
        masks.forEach((m) => m.close?.());
        result.close?.();
        return info;
      }
    };
  })().catch((error) => {
    cached = null; // permet de réessayer
    throw error;
  });
  return cached;
}
