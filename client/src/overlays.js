// Cadrage (rotation, miroir, format, zoom), texte, fondus et fondu audio.
// Fonctions pures + dessin canvas : utilisées à l'identique par l'aperçu et par l'export.

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const DEFAULT_TRANSFORM = Object.freeze({ rotate: 0, flipH: false, flipV: false, ratio: 'original', zoom: 1, panX: 0, panY: 0 });
export const DEFAULT_TEXT = Object.freeze({ text: '', size: 7, color: '#ffffff', pos: 'bottom', align: 'center', bg: 'none', bold: true });
export const DEFAULT_FX = Object.freeze({ inSec: 0, outSec: 0, color: 'black', fadeAudio: true, volume: 100, mute: false });

export const RATIOS = [
  { id: 'original', label: 'Original' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '1:1', label: '1:1' },
  { id: '4:5', label: '4:5' },
  { id: '4:3', label: '4:3' },
  { id: '21:9', label: '21:9' }
];

export const isTransformActive = (t) =>
  Boolean(t && (t.rotate % 360 !== 0 || t.flipH || t.flipV || (t.ratio && t.ratio !== 'original') || t.zoom > 1.001));

// Zone visible (dans l'image après rotation) pour un format, un zoom et une position donnés.
export function geometry(srcW, srcH, t) {
  const rot = (((t.rotate || 0) % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;
  const RW = swap ? srcH : srcW;
  const RH = swap ? srcW : srcH;
  let cw = RW;
  let ch = RH;
  if (t.ratio && t.ratio !== 'original') {
    const [a, b] = t.ratio.split(':').map(Number);
    const target = a / b;
    if (RW / RH > target) cw = RH * target;
    else ch = RW / target;
  }
  const zoom = clamp(t.zoom || 1, 1, 4);
  cw /= zoom;
  ch /= zoom;
  const maxX = RW - cw;
  const maxY = RH - ch;
  return {
    rot, RW, RH, w: cw, h: ch,
    x: maxX / 2 + clamp(t.panX || 0, -1, 1) * (maxX / 2),
    y: maxY / 2 + clamp(t.panY || 0, -1, 1) * (maxY / 2)
  };
}

// Taille (en pixels de la source) de l'image finale après cadrage.
export function outputSize(srcW, srcH, t) {
  const g = geometry(srcW, srcH, t);
  return { w: Math.max(2, Math.round(g.w)), h: Math.max(2, Math.round(g.h)) };
}

// Dessine `src` (taille srcW × srcH) dans le canvas, cadré et transformé, sur outW × outH pixels.
export function drawTransformed(ctx, src, srcW, srcH, outW, outH, t) {
  if (!isTransformActive(t)) {
    ctx.drawImage(src, 0, 0, outW, outH);
    return;
  }
  const g = geometry(srcW, srcH, t);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(outW / g.w, outH / g.h);
  ctx.translate(-g.x, -g.y);
  if (t.flipH) { ctx.translate(g.RW, 0); ctx.scale(-1, 1); }
  if (t.flipV) { ctx.translate(0, g.RH); ctx.scale(1, -1); }
  ctx.translate(g.RW / 2, g.RH / 2);
  ctx.rotate((g.rot * Math.PI) / 180);
  ctx.translate(-srcW / 2, -srcH / 2);
  ctx.drawImage(src, 0, 0, srcW, srcH);
  ctx.restore();
}

// Opacité du fondu (0 = image normale, 1 = écran noir/blanc) à l'instant `outTime` de la vidéo finale.
export function fadeAmount(outTime, total, fx) {
  if (!fx || !(total > 0)) return 0;
  let a = 0;
  if (fx.inSec > 0 && outTime < fx.inSec) a = Math.max(a, 1 - outTime / fx.inSec);
  if (fx.outSec > 0 && outTime > total - fx.outSec) a = Math.max(a, 1 - (total - outTime) / fx.outSec);
  return clamp(a, 0, 1);
}

function roundedRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
}

// Texte puis fondu, dessinés par-dessus l'image déjà étalonnée.
export function drawOverlays(ctx, w, h, overlays, outTime = 0, total = 0) {
  const tx = overlays && overlays.text;
  if (tx && tx.text && tx.text.trim()) {
    const fontPx = Math.max(8, (h * clamp(tx.size || 7, 1, 40)) / 100);
    const lineH = fontPx * 1.2;
    const lines = tx.text.split('\n').slice(0, 8);
    const margin = h * 0.05;
    const pad = fontPx * 0.35;
    ctx.save();
    ctx.font = `${tx.bold ? 700 : 400} ${fontPx}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = tx.align || 'center';
    const blockH = lines.length * lineH;
    const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const y0 = tx.pos === 'top' ? margin : tx.pos === 'middle' ? (h - blockH) / 2 : h - margin - blockH;
    const ax = tx.align === 'left' ? margin : tx.align === 'right' ? w - margin : w / 2;
    if (tx.bg === 'dark' || tx.bg === 'light') {
      const bx = tx.align === 'left' ? ax - pad : tx.align === 'right' ? ax - maxW - pad : ax - maxW / 2 - pad;
      ctx.fillStyle = tx.bg === 'dark' ? 'rgba(0,0,0,0.58)' : 'rgba(255,255,255,0.78)';
      roundedRect(ctx, bx, y0 - pad * 0.6, maxW + pad * 2, blockH + pad * 1.2, fontPx * 0.25);
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.75)';
      ctx.shadowBlur = fontPx * 0.14;
      ctx.shadowOffsetY = fontPx * 0.04;
    }
    ctx.fillStyle = tx.color || '#ffffff';
    lines.forEach((line, i) => ctx.fillText(line, ax, y0 + i * lineH));
    ctx.restore();
  }
  const a = fadeAmount(outTime, total, overlays && overlays.fx);
  if (a > 0) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = overlays.fx.color === 'white' ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// Fondu audio (entrée / sortie) appliqué directement sur un AudioBuffer.
export function applyAudioFade(buffer, inSec, outSec) {
  if (!buffer || (!(inSec > 0) && !(outSec > 0))) return;
  const sr = buffer.sampleRate;
  const total = buffer.length;
  const nIn = Math.min(total, Math.round(inSec * sr));
  const nOut = Math.min(total, Math.round(outSec * sr));
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < nIn; i++) data[i] *= i / nIn;
    for (let i = 0; i < nOut; i++) data[total - 1 - i] *= i / nOut;
  }
}
