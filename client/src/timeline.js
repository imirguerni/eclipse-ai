// Montage : sections d'une vidéo (couper, supprimer, détecter les scènes). Fonctions pures + 1 détecteur DOM.

export const MIN_SEGMENT = 0.1; // durée minimale d'une section (secondes)
let counter = 0;
const newId = () => `seg-${Date.now().toString(36)}-${counter++}`;

export const createSegments = (duration) =>
  duration > 0 ? [{ id: newId(), start: 0, end: duration, removed: false }] : [];

// Coupe la section qui contient `t` en deux (si les deux morceaux restent assez longs).
export function splitAt(segments, t) {
  const idx = segments.findIndex((s) => t > s.start + MIN_SEGMENT && t < s.end - MIN_SEGMENT);
  if (idx < 0) return segments;
  const s = segments[idx];
  return [
    ...segments.slice(0, idx),
    { id: newId(), start: s.start, end: t, removed: s.removed },
    { id: newId(), start: t, end: s.end, removed: s.removed },
    ...segments.slice(idx + 1)
  ];
}

// Garde au moins une section : on ne peut pas tout supprimer.
export function toggleRemoved(segments, id) {
  const target = segments.find((s) => s.id === id);
  if (!target) return segments;
  if (!target.removed && segments.filter((s) => !s.removed).length <= 1) return segments;
  return segments.map((s) => (s.id === id ? { ...s, removed: !s.removed } : s));
}

export const segmentAt = (segments, t) => segments.find((s) => t >= s.start && t < s.end) || null;

// Sections conservées, fusionnées si elles se suivent, avec leur position dans la vidéo finale.
export function keptRanges(segments) {
  const ranges = [];
  let outStart = 0;
  segments.forEach((s) => {
    if (s.removed) return;
    const last = ranges[ranges.length - 1];
    if (last && Math.abs(last.end - s.start) < 1e-6) {
      last.end = s.end;
    } else {
      ranges.push({ start: s.start, end: s.end, outStart: 0 });
    }
  });
  ranges.forEach((r) => { r.outStart = outStart; outStart += r.end - r.start; });
  return ranges;
}

export const keptDuration = (segments) =>
  segments.reduce((sum, s) => (s.removed ? sum : sum + (s.end - s.start)), 0);

export const isTrimmed = (segments, duration) =>
  segments.length > 1 || (segments[0] && (segments[0].start > 0.05 || segments[0].end < duration - 0.05));

// Lecture : si `t` tombe dans une section supprimée, retourne où sauter (ou null s'il n'y a plus rien).
export function skipTarget(segments, t) {
  const s = segmentAt(segments, t);
  if (!s || !s.removed) return undefined; // pas de saut
  const next = segments.find((x) => !x.removed && x.start >= s.end - 1e-6);
  return next ? next.start : null;
}

// Position dans la vidéo finale d'un instant de la vidéo source (null si la section est supprimée).
export function outputTimeAt(ranges, t) {
  const r = ranges.find((x) => t >= x.start - 1e-6 && t < x.end);
  return r ? r.outStart + (t - r.start) : null;
}

// Pendant la lecture : où sauter (undefined = continuer). Gère sections supprimées, début/fin rognés.
export function playbackJump(segments, t) {
  if (!segments.length) return undefined;
  const kept = segments.filter((s) => !s.removed);
  if (!kept.length) return undefined;
  if (t >= segments[segments.length - 1].end - 0.03) return kept[0].start;
  if (t < segments[0].start - 0.03) return kept[0].start;
  const target = skipTarget(segments, t);
  if (target === undefined) return undefined;
  return target === null ? kept[0].start : target;
}

// Réglage des bornes : on déplace le début de la première section / la fin de la dernière.
export function setBoundary(segments, which, t, duration) {
  if (!segments.length) return segments;
  const out = segments.map((s) => ({ ...s }));
  if (which === 'start') {
    const first = out[0];
    first.start = Math.max(0, Math.min(t, first.end - MIN_SEGMENT));
  } else {
    const last = out[out.length - 1];
    last.end = Math.min(duration, Math.max(t, last.start + MIN_SEGMENT));
  }
  return out;
}

// Détection automatique des changements de plan : compare des histogrammes d'images échantillonnées.
export async function detectSceneCuts(videoUrl, duration, { step = 0.5, threshold = 0.45, minGap = 1, onProgress, shouldStop } = {}) {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.preload = 'auto';
  video.src = videoUrl;
  const waitFor = (name, ms = 4000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => { cleanup(); reject(new Error('Délai dépassé pendant la lecture de la vidéo.')); }, ms);
      const ok = () => { cleanup(); resolve(); };
      const ko = () => { cleanup(); reject(new Error('Lecture de la vidéo impossible.')); };
      const cleanup = () => { clearTimeout(timer); video.removeEventListener(name, ok); video.removeEventListener('error', ko); };
      video.addEventListener(name, ok);
      video.addEventListener('error', ko);
    });
  try {
    if (video.readyState < 2) await waitFor('loadeddata', 10000);
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 36;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const BINS = 16;
    const histogram = () => {
      const d = ctx.getImageData(0, 0, 64, 36).data;
      const h = new Float32Array(BINS * 3);
      for (let i = 0; i < d.length; i += 4) {
        h[(d[i] >> 4)]++; h[BINS + (d[i + 1] >> 4)]++; h[BINS * 2 + (d[i + 2] >> 4)]++;
      }
      const n = d.length / 4;
      for (let i = 0; i < h.length; i++) h[i] /= n;
      return h;
    };
    const cuts = [];
    let prev = null;
    let lastCut = -Infinity;
    const total = Math.floor(duration / step);
    for (let k = 0; k <= total; k++) {
      if (shouldStop && shouldStop()) break;
      const t = Math.min(duration - 0.05, k * step);
      video.currentTime = t;
      await waitFor('seeked');
      ctx.drawImage(video, 0, 0, 64, 36);
      const h = histogram();
      if (prev) {
        let diff = 0;
        for (let i = 0; i < h.length; i++) diff += Math.abs(h[i] - prev[i]);
        diff /= 3; // 0..2
        if (diff > threshold && t - lastCut >= minGap) { cuts.push(Number((t - step / 2).toFixed(2))); lastCut = t; }
      }
      prev = h;
      if (onProgress) onProgress(k / total);
    }
    return cuts.filter((c) => c > MIN_SEGMENT && c < duration - MIN_SEGMENT);
  } finally {
    video.removeAttribute('src');
    video.load();
  }
}
