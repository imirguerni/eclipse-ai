// Web Worker : applique l'étalonnage sur un bloc de pixels, hors du thread principal.
import { processImageData } from './gradeEngine.js';

let plan = null;

self.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === 'plan') {
    plan = msg.plan;
    return;
  }
  if (msg.type !== 'job') return;
  try {
    const img = { data: new Uint8ClampedArray(msg.buffer), width: msg.width, height: msg.height };
    processImageData(img, plan, msg.seed, msg.region);
    self.postMessage({ type: 'done', id: msg.id, buffer: img.data.buffer }, [img.data.buffer]);
  } catch (error) {
    self.postMessage({ type: 'error', id: msg.id, message: String((error && error.message) || error) });
  }
};
