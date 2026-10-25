// Moteur d'étalonnage : fonctions pures utilisées par l'aperçu, l'export et les Web Workers.

const HSL_BANDS = [
  { id: 'red', label: 'Rouge', center: 0, swatch: '#ef4444' },
  { id: 'orange', label: 'Orange', center: 30, swatch: '#f97316' },
  { id: 'yellow', label: 'Jaune', center: 60, swatch: '#eab308' },
  { id: 'green', label: 'Vert', center: 120, swatch: '#22c55e' },
  { id: 'cyan', label: 'Cyan', center: 180, swatch: '#06b6d4' },
  { id: 'blue', label: 'Bleu', center: 240, swatch: '#3b82f6' },
  { id: 'purple', label: 'Violet', center: 275, swatch: '#a855f7' },
  { id: 'magenta', label: 'Magenta', center: 320, swatch: '#ec4899' }
];
const bandKey = (type, id) => `${type}${id[0].toUpperCase()}${id.slice(1)}`;

// ============================================================
// MOTEUR D'ÉTALONNAGE (fonctions pures, partagées aperçu + export)
// Le même code produit l'aperçu et le fichier final : ce que
// vous voyez est exactement ce que vous exportez (et ça marche
// aussi sur Safari, qui ne supporte pas ctx.filter).
// ============================================================

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const srgbToLinear = (x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
const linearToSrgb = (x) => (x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) SRGB_TO_LINEAR[i] = srgbToLinear(i / 255);

const hueDistance = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

// Matrice de dithering (bruit triangulaire, 64x64) : supprime le banding
// (« marches d'escalier ») dans les dégradés après étalonnage.
const DITHER_SIZE = 64;
const DITHER_TILE = (() => {
  const tile = new Float32Array(DITHER_SIZE * DITHER_SIZE);
  let s = 123456789;
  const rnd = () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
  for (let i = 0; i < tile.length; i++) tile[i] = (rnd() + rnd() - 1) * 0.75;
  return tile;
})();

// ---------- Courbe tonale : spline monotone passant par 5 points ----------
function buildCurveLut(values) {
  const xs = [0, 0.25, 0.5, 0.75, 1];
  const ys = xs.map((x, i) => clamp(x + (values[i] / 100) * 0.22, 0, 1));
  const d = [];
  for (let i = 0; i < 4; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  const m = [d[0], 0, 0, 0, d[3]];
  for (let i = 1; i < 4; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < 4; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  const lut = new Float32Array(256);
  for (let k = 0; k < 256; k++) {
    const x = k / 255;
    const seg = Math.min(3, Math.floor(x / 0.25));
    const h = 0.25, t = (x - xs[seg]) / h, t2 = t * t, t3 = t2 * t;
    const y =
      (2 * t3 - 3 * t2 + 1) * ys[seg] +
      (t3 - 2 * t2 + t) * h * m[seg] +
      (-2 * t3 + 3 * t2) * ys[seg + 1] +
      (t3 - t2) * h * m[seg + 1];
    lut[k] = clamp(y, 0, 1);
  }
  return lut;
}

// ---------- Balance des blancs (gains en lumière linéaire) ----------
function whiteBalanceGains(temperature, tint) {
  const t = temperature / 100, g = tint / 100;
  const r = Math.pow(2, 0.4 * t);
  const b = Math.pow(2, -0.4 * t);
  const gg = Math.pow(2, -0.25 * g);
  const y = 0.2126 * r + 0.7152 * gg + 0.0722 * b; // conserve la luminance globale
  return [r / y, gg / y, b / y];
}

// ---------- Courbe de tons (appliquée par canal, valeurs 0..1) ----------
function toneCurve(y, a, curveLut) {
  if (a.brightness) y = Math.pow(y, Math.pow(2, (-a.brightness / 100) * 0.8));
  if (a.contrast) {
    const c = a.contrast / 100;
    const g = c > 0 ? 1 + c * 1.2 : 1 / (1 + -c * 1.2);
    y = y < 0.5 ? 0.5 * Math.pow(2 * y, g) : 1 - 0.5 * Math.pow(2 * (1 - y), g);
  }
  if (a.shadows) y += (a.shadows / 100) * 0.28 * smoothstep(0, 0.1, y) * (1 - smoothstep(0.35, 0.7, y));
  if (a.highlights) y += (a.highlights / 100) * 0.28 * smoothstep(0.3, 0.65, y) * (1 - smoothstep(0.9, 1, y));
  if (a.whites) y += (a.whites / 100) * 0.2 * smoothstep(0.6, 1, y);
  if (a.blacks) y += (a.blacks / 100) * 0.2 * (1 - smoothstep(0, 0.4, y));
  y = clamp(y, 0, 1);
  if (a.dehaze > 0) {
    const k = (a.dehaze / 100) * 0.12;
    y = clamp((y - k) / (1 - k), 0, 1);
  } else if (a.dehaze < 0) {
    const k = (-a.dehaze / 100) * 0.2;
    y = y * (1 - k) + k * 0.8;
  }
  if (a.fade > 0) {
    const f = a.fade / 100;
    y = f * 0.2 + y * (1 - f * 0.25);
  } else if (a.fade < 0) {
    const k = (-a.fade / 100) * 0.15;
    y = clamp((y - k) / (1 - k), 0, 1);
  }
  if (curveLut) y = curveLut[clamp(Math.round(y * 255), 0, 255)];
  return clamp(y, 0, 1);
}

// ---------- Matrices 3x3 (spécification CSS filter) ----------
const mul3 = (A, B) => {
  const o = new Float32Array(9);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      o[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
  return o;
};
const saturateMatrix = (s) => [
  0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s
];
const hueMatrix = (deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072
  ];
};
const sepiaMatrix = (amt) => {
  const k = 1 - amt;
  return [
    0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k,
    0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k,
    0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k
  ];
};
const grayMatrix = (amt) => {
  const k = 1 - amt;
  return [
    0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k,
    0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k,
    0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k
  ];
};

function hexToUnitRgb(hex) {
  const m = String(hex || '').match(/^#?([0-9a-f]{6})$/i);
  const h = m ? m[1] : '808080';
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

function hslToRgbInto(h, s, l, out) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  out[0] = (r + m) * 255;
  out[1] = (g + m) * 255;
  out[2] = (b + m) * 255;
}

// Convertit une couleur de roue (teinte pleine saturation) en hex.
function hueToHex(hue) {
  const o = [0, 0, 0];
  hslToRgbInto(hue, 1, 0.5, o);
  return `#${o.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

// ---------- Réglages fusionnés (preset × intensité + réglages manuels) ----------
const ADJUST_KEYS = [
  'exposure', 'contrast', 'shadows', 'highlights', 'whites', 'blacks',
  'saturation', 'vibrance', 'temperature', 'tint', 'fade', 'clarity',
  'dehaze', 'vignette', 'grain', 'sharpness', 'denoise', 'skinSmooth', 'bloom'
];

function resolveAdjustments(filter, intensity, cs, extras) {
  const f = clamp(num(intensity), 0, 100) / 100;
  const preset = filter || {};
  const s = cs || {};
  const film = (extras && extras.film) || {};
  const fa = clamp(num(extras && extras.filmAmount), 0, 100) / 100;
  const a = {};
  // L'intensité ne module que le preset ; les réglages manuels restent tels quels.
  // La pellicule (film) s'ajoute avec sa propre force.
  for (const key of ADJUST_KEYS) {
    a[key] = clamp(num(preset[key]) * f + num(film[key]) * fa + num(s[key]), -100, 100);
  }
  for (const key of ['grain', 'denoise', 'skinSmooth', 'bloom']) a[key] = clamp(a[key], 0, 100);
  a.grainSize = clamp(num(film.grainSize) * fa + num(s.grainSize), 0, 100);
  a.skinProtect = clamp(num(s.skinProtect), 0, 100) / 100;
  a.match = extras && extras.match ? extras.match : null;
  a.matchAmount = clamp(num(extras && extras.matchAmount), 0, 100) / 100;
  a.lut = extras && extras.lut ? extras.lut : null;
  a.lutAmount = clamp(num(extras && extras.lutAmount), 0, 100) / 100;
  a.brightness = clamp(num(s.brightness), -100, 100);
  a.hue = clamp(num(s.hue), -100, 100);
  a.sepia = clamp(num(s.sepia), 0, 100);
  a.monochrome = clamp(num(s.monochrome), 0, 100);
  a.curves = ['curveShadows', 'curveDarks', 'curveMidtones', 'curveLights', 'curveHighlights'].map((k) =>
    clamp(num(s[k]), -100, 100)
  );
  a.wheels = ['wheelShadows', 'wheelMidtones', 'wheelHighlights'].map((k) => ({
    rgb: hexToUnitRgb(s[k]),
    amount: clamp(num(s[`${k}Amount`]), 0, 100) / 100
  }));
  a.bands = HSL_BANDS.map((b) => ({
    hue: clamp(num(s[bandKey('hue', b.id)]), -100, 100),
    sat: clamp(num(s[bandKey('sat', b.id)]), -100, 100),
    lum: clamp(num(s[bandKey('lum', b.id)]), -100, 100)
  }));
  return a;
}

// ---------- Préparation (LUT + matrices), faite une fois par changement ----------
function prepareGrade(a) {
  const hasCurves = a.curves.some((v) => v !== 0);
  const hasTone =
    a.exposure || a.temperature || a.tint || a.brightness || a.contrast || a.shadows ||
    a.highlights || a.whites || a.blacks || a.dehaze || a.fade || hasCurves;

  let luts = null;
  const hasMatch = Boolean(a.match && a.matchAmount > 0);
  if (hasTone || hasMatch) {
    const wb = whiteBalanceGains(a.temperature, a.tint);
    const expGain = Math.pow(2, (a.exposure / 100) * 2);
    const curve = hasCurves ? buildCurveLut(a.curves) : null;
    luts = [0, 1, 2].map((c) => {
      const gain = wb[c] * expGain;
      const lut = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        let y = i / 255;
        if (gain !== 1) y = clamp(linearToSrgb(SRGB_TO_LINEAR[i] * gain), 0, 1);
        let v = toneCurve(y, a, curve) * 255;
        if (hasMatch) {
          // Correspondance de couleur (transfert de statistiques depuis une image de référence).
          const m = a.match.luts[c];
          const lo = Math.min(254, Math.floor(v)), t = v - lo;
          const mapped = m[lo] * (1 - t) + m[lo + 1] * t;
          v = v + (mapped - v) * a.matchAmount;
        }
        lut[i] = v;
      }
      return lut;
    });
  }

  // Saturation → teinte → sépia → noir & blanc, fusionnés en une seule matrice.
  let matrix = null;
  const satFactor = Math.max(0, 1 + a.saturation / 100) * (1 + (a.dehaze > 0 ? a.dehaze / 100 : 0) * 0.15);
  if (satFactor !== 1 || a.hue || a.sepia || a.monochrome) {
    let M = saturateMatrix(satFactor);
    if (a.hue) M = mul3(hueMatrix(a.hue * 1.8), M);
    if (a.sepia) M = mul3(sepiaMatrix(a.sepia / 100), M);
    if (a.monochrome) M = mul3(grayMatrix(a.monochrome / 100), M);
    matrix = Float32Array.from(M);
  }

  // Bandes HSL : table de 360 entrées, interpolation douce entre les bandes voisines.
  let bandLut = null;
  if (a.bands.some((b) => b.hue || b.sat || b.lum)) {
    bandLut = new Float32Array(360 * 3);
    const n = HSL_BANDS.length;
    for (let deg = 0; deg < 360; deg++) {
      let k = n - 1;
      for (let i = 0; i < n; i++) if (HSL_BANDS[i].center <= deg) k = i;
      const c0 = HSL_BANDS[k].center;
      const k1 = (k + 1) % n;
      const c1 = k1 === 0 ? 360 : HSL_BANDS[k1].center;
      const span = c1 - c0;
      const t = clamp((deg - c0) / span, 0, 1);
      const b0 = a.bands[k], b1 = a.bands[k1];
      bandLut[deg * 3] = (b0.hue * (1 - t) + b1.hue * t) * 0.3; // ±100 → ±30°
      bandLut[deg * 3 + 1] = (b0.sat * (1 - t) + b1.sat * t) / 100;
      bandLut[deg * 3 + 2] = (b0.lum * (1 - t) + b1.lum * t) / 100;
    }
  }

  const wheels = a.wheels
    .map((w, idx) => {
      const [r, g, b] = w.rgb;
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return { idx, amount: w.amount, v: [r - y, g - y, b - y] };
    })
    .filter((w) => w.amount > 0);

  const vibrance = a.vibrance / 100;
  const skinProtect = a.skinProtect;
  const lut3d = a.lut && a.lutAmount > 0 ? { size: a.lut.size, data: a.lut.data, amount: a.lutAmount } : null;
  const identity =
    !luts && !matrix && !bandLut && !wheels.length && !vibrance && !lut3d &&
    !a.clarity && !a.sharpness && !a.vignette && !a.grain &&
    !a.denoise && !a.skinSmooth && !a.bloom;

  // `global` : l'effet dépend de tout le cadre (flous) → pas de découpage en bandes.
  const global = Boolean(a.clarity || a.sharpness > 0 || a.denoise || a.skinSmooth || a.bloom);

  return {
    identity, global, luts, matrix, bandLut, wheels, vibrance, skinProtect, lut3d,
    clarity: a.clarity, sharpness: a.sharpness, vignette: a.vignette, grain: a.grain,
    grainSize: a.grainSize, denoise: a.denoise, skinSmooth: a.skinSmooth, bloom: a.bloom
  };
}

// ---------- Flou (netteté, clarté, débruitage, peau, lueur) ----------
let SCRATCH = { luma: null, tmp: null, blurS: null, blurM: null, n: 0 };
function getScratch(n) {
  if (SCRATCH.n < n) {
    SCRATCH = {
      luma: new Float32Array(n), tmp: new Float32Array(n),
      blurS: new Float32Array(n), blurM: new Float32Array(n), n
    };
  }
  return SCRATCH;
}

function boxPass(src, dst, tmp, w, h, r) {
  const inv = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += src[row + clamp(k, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc * inv;
      acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
  const col = new Float32Array(w);
  for (let k = -r; k <= r; k++) {
    const row = clamp(k, 0, h - 1) * w;
    for (let x = 0; x < w; x++) col[x] += tmp[row + x];
  }
  for (let y = 0; y < h; y++) {
    const row = y * w;
    const add = Math.min(h - 1, y + r + 1) * w;
    const sub = Math.max(0, y - r) * w;
    for (let x = 0; x < w; x++) {
      dst[row + x] = col[x] * inv;
      col[x] += tmp[add + x] - tmp[sub + x];
    }
  }
}

// Flou ≈ gaussien : deux passes de flou boîte. Résultat dans dst.
function blurPlane(src, dst, tmp, w, h, r) {
  r = Math.max(1, Math.min(r, (Math.min(w, h) >> 1) - 1));
  boxPass(src, dst, tmp, w, h, r);
  boxPass(dst, dst, tmp, w, h, r);
}

function lumaPlane(data, n, out) {
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    out[p] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
}

// Version réduite d'un plan de luminance (mode « bloom » : ne garde que les hautes lumières).
function lowResPlane(luma, w, h, ds, bloomMode) {
  const lw = Math.ceil(w / ds), lh = Math.ceil(h / ds);
  const small = new Float32Array(lw * lh), cnt = new Float32Array(lw * lh);
  for (let y = 0; y < h; y++) {
    const ly = Math.min(lh - 1, (y / ds) | 0) * lw;
    for (let x = 0; x < w; x++) {
      const li = ly + Math.min(lw - 1, (x / ds) | 0);
      let v = luma[y * w + x];
      if (bloomMode) { v = Math.max(0, v / 255 - 0.62) / 0.38; v *= v; }
      small[li] += v;
      cnt[li]++;
    }
  }
  for (let i = 0; i < small.length; i++) small[i] /= cnt[i] || 1;
  return { small, lw, lh };
}

function sampleLow(plane, lw, lh, x, y, ds) {
  const fx = clamp((x + 0.5) / ds - 0.5, 0, lw - 1), fy = clamp((y + 0.5) / ds - 0.5, 0, lh - 1);
  const x0 = fx | 0, y0 = fy | 0, x1 = Math.min(lw - 1, x0 + 1), y1 = Math.min(lh - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  return (
    (plane[y0 * lw + x0] * (1 - tx) + plane[y0 * lw + x1] * tx) * (1 - ty) +
    (plane[y1 * lw + x0] * (1 - tx) + plane[y1 * lw + x1] * tx) * ty
  );
}

// ---------- LUT 3D (.cube) ----------
function parseCubeLut(text) {
  let size = 0, title = '';
  const values = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('TITLE')) { title = line.replace(/^TITLE\s*/, '').replace(/"/g, ''); continue; }
    if (line.startsWith('LUT_1D_SIZE')) throw new Error('Les LUT 1D ne sont pas prises en charge (utilisez une LUT 3D).');
    if (line.startsWith('LUT_3D_SIZE')) { size = parseInt(line.split(/\s+/)[1], 10); continue; }
    if (/^[A-Z_]+/.test(line)) continue; // DOMAIN_MIN / DOMAIN_MAX, etc.
    const parts = line.split(/\s+/).map(Number);
    if (parts.length >= 3 && parts.every(Number.isFinite)) values.push(parts[0], parts[1], parts[2]);
  }
  if (!size || size < 2 || size > 128) throw new Error('Fichier .cube invalide (LUT_3D_SIZE manquant).');
  if (values.length !== size * size * size * 3) throw new Error('Fichier .cube incomplet ou corrompu.');
  return { size, title, data: Float32Array.from(values) };
}

function sampleLut3d(L, N, fr, fg, fb, out) {
  const r0 = fr | 0, g0 = fg | 0, b0 = fb | 0;
  const r1 = Math.min(N - 1, r0 + 1), g1 = Math.min(N - 1, g0 + 1), b1 = Math.min(N - 1, b0 + 1);
  const tr = fr - r0, tg = fg - g0, tb = fb - b0;
  const i000 = ((b0 * N + g0) * N + r0) * 3, i100 = ((b0 * N + g0) * N + r1) * 3;
  const i010 = ((b0 * N + g1) * N + r0) * 3, i110 = ((b0 * N + g1) * N + r1) * 3;
  const i001 = ((b1 * N + g0) * N + r0) * 3, i101 = ((b1 * N + g0) * N + r1) * 3;
  const i011 = ((b1 * N + g1) * N + r0) * 3, i111 = ((b1 * N + g1) * N + r1) * 3;
  for (let c = 0; c < 3; c++) {
    const c00 = L[i000 + c] * (1 - tr) + L[i100 + c] * tr;
    const c10 = L[i010 + c] * (1 - tr) + L[i110 + c] * tr;
    const c01 = L[i001 + c] * (1 - tr) + L[i101 + c] * tr;
    const c11 = L[i011 + c] * (1 - tr) + L[i111 + c] * tr;
    out[c] = ((c00 * (1 - tg) + c10 * tg) * (1 - tb) + (c01 * (1 - tg) + c11 * tg) * tb) * 255;
  }
}

// ---------- Traitement d'une image (aperçu ou export) ----------
// `region` (optionnel) : { offsetY, fullHeight } quand `imageData` n'est qu'une bande de lignes
// d'une image plus grande (traitement multi-cœurs). Le résultat est identique au traitement complet.
function processImageData(imageData, plan, seed = 0, region = null) {
  if (!plan || plan.identity) return;
  const { data, width: w, height: h } = imageData;
  const fullH = region ? region.fullHeight : h;
  const offY = region ? region.offsetY : 0;
  const n = w * h;
  const { luts, matrix: M, bandLut, wheels, vibrance, vignette, grain, lut3d } = plan;
  const lutR = luts ? luts[0] : null, lutG = luts ? luts[1] : null, lutB = luts ? luts[2] : null;
  const minSide = Math.min(w, fullH);

  const hasSharp = plan.sharpness > 0;
  const hasClarity = plan.clarity !== 0;
  const hasDenoise = plan.denoise > 0;
  const hasSkin = plan.skinSmooth > 0;
  const hasBloom = plan.bloom > 0;
  const hasDetail = hasSharp || hasClarity || hasDenoise || hasSkin;
  const needLuma = hasDetail || hasBloom;

  let luma = null, blurS = null, blurM = null;
  let clarityLow = null, cLw = 0, cLh = 0, cDs = 1;
  let bloomLow = null, bLw = 0, bLh = 0, bDs = 1;
  if (needLuma) {
    const sc = getScratch(n);
    luma = sc.luma;
    lumaPlane(data, n, luma);
    if (hasSharp || hasDenoise) {
      blurS = sc.blurS;
      blurPlane(luma, blurS, sc.tmp, w, h, Math.max(1, Math.round(minSide / 800)));
    }
    if (hasSkin) {
      blurM = sc.blurM;
      blurPlane(luma, blurM, sc.tmp, w, h, Math.max(2, Math.round(minSide / 220)));
    }
    if (hasClarity) {
      cDs = Math.max(1, Math.floor(minSide / 360));
      const low = lowResPlane(luma, w, h, cDs, false);
      cLw = low.lw; cLh = low.lh;
      clarityLow = new Float32Array(cLw * cLh);
      blurPlane(low.small, clarityLow, new Float32Array(cLw * cLh), cLw, cLh, Math.max(2, Math.round(Math.min(cLw, cLh) / 14)));
    }
    if (hasBloom) {
      bDs = Math.max(1, Math.floor(minSide / 240));
      const low = lowResPlane(luma, w, h, bDs, true);
      bLw = low.lw; bLh = low.lh;
      bloomLow = new Float32Array(bLw * bLh);
      blurPlane(low.small, bloomLow, new Float32Array(bLw * bLh), bLw, bLh, Math.max(2, Math.round(Math.min(bLw, bLh) / 9)));
    }
  }
  const kClarity = (plan.clarity / 100) * 1.2;
  const kSharp = (plan.sharpness / 100) * 1.4;
  const kDenoise = (plan.denoise / 100) * 0.9;
  const kSkin = (plan.skinSmooth / 100) * 0.9;
  const kBloom = (plan.bloom / 100) * 2.2;

  const vib = vibrance;
  const skinProt = plan.skinProtect || 0;
  const bandRgb = [0, 0, 0];
  const lutOut = [0, 0, 0];
  const lutScale = lut3d ? (lut3d.size - 1) / 255 : 0;
  const wheelStrength = 0.22 * 255;
  const vAmt = vignette > 0 ? Math.min(0.9, (vignette / 100) * 0.9) : Math.min(0.7, (-vignette / 100) * 0.7);
  const gAmt = (grain / 100) * 0.2 * 255;
  const gCell = Math.max(1, Math.round((minSide / 1080) * (1 + (plan.grainSize / 100) * 3)));
  const seedMix = Math.imul(seed + 1, 2246822519);
  const cx = w / 2, cy = fullH / 2;

  for (let y = 0, p = 0, i = 0; y < h; y++) {
    const yy = y + offY;
    const dRow = (yy & (DITHER_SIZE - 1)) * DITHER_SIZE;
    const ny = (yy + 0.5 - cy) / cy;
    for (let x = 0; x < w; x++, p++, i += 4) {
      const sr = data[i], sg = data[i + 1], sb = data[i + 2];
      let r = sr, g = sg, b = sb;
      const srcY = needLuma ? luma[p] : 0;

      if (luts) { r = lutR[r]; g = lutG[g]; b = lutB[b]; }

      if (hasDetail) {
        let d = 0;
        if (hasSharp) {
          const diff = srcY - blurS[p];
          const ad = Math.abs(diff) - 1.5;
          if (ad > 0) d += kSharp * (diff > 0 ? ad : -ad);
        }
        if (hasDenoise) {
          const diff = blurS[p] - srcY;
          d += diff * kDenoise * (1 - smoothstep(4, 24, Math.abs(diff)));
        }
        if (hasSkin) {
          const dl = sr - sb;
          if (sr > sg && sg >= sb && dl > 14) {
            const t = (sg - sb) / dl, sat = dl / sr;
            const mask =
              smoothstep(0.04, 0.14, t) * (1 - smoothstep(0.7, 0.92, t)) *
              smoothstep(0.08, 0.17, sat) * (1 - smoothstep(0.55, 0.75, sat)) *
              smoothstep(35, 80, srcY);
            if (mask > 0) {
              const diff = blurM[p] - srcY;
              d += diff * kSkin * mask * (1 - smoothstep(8, 34, Math.abs(diff)));
            }
          }
        }
        if (hasClarity) {
          const low = sampleLow(clarityLow, cLw, cLh, x, y, cDs);
          const yn = srcY / 255;
          d += kClarity * (1 - 0.8 * (2 * yn - 1) * (2 * yn - 1)) * (srcY - low);
        }
        r += d; g += d; b += d;
      }

      if (M) {
        const nr = M[0] * r + M[1] * g + M[2] * b;
        const ng = M[3] * r + M[4] * g + M[5] * b;
        const nb = M[6] * r + M[7] * g + M[8] * b;
        r = nr; g = ng; b = nb;
      }

      if (vib !== 0) {
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const s = mx > 0 ? (mx - mn) / mx : 0;
        let k = vib > 0 ? 1 + vib * (1 - s) : 1 + vib * s;
        if (skinProt > 0) {
          const dl = r - b;
          if (r > g && g >= b && dl > 12) {
            const t = (g - b) / dl, sat = dl / Math.max(r, 1);
            const m =
              smoothstep(0.04, 0.14, t) * (1 - smoothstep(0.7, 0.92, t)) *
              smoothstep(0.08, 0.17, sat) * (1 - smoothstep(0.55, 0.75, sat));
            k = 1 + (k - 1) * (1 - skinProt * m * 0.85);
          }
        }
        const yl = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = yl + (r - yl) * k; g = yl + (g - yl) * k; b = yl + (b - yl) * k;
      }

      if (bandLut) {
        r = clamp(r, 0, 255); g = clamp(g, 0, 255); b = clamp(b, 0, 255);
        const rn = r / 255, gn = g / 255, bn = b / 255;
        const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn), dl = mx - mn;
        if (dl > 0.004) {
          const l = (mx + mn) / 2;
          const sat = dl / (1 - Math.abs(2 * l - 1) + 1e-6);
          let hue;
          if (mx === rn) hue = ((gn - bn) / dl) % 6;
          else if (mx === gn) hue = (bn - rn) / dl + 2;
          else hue = (rn - gn) / dl + 4;
          hue *= 60; if (hue < 0) hue += 360;
          const bi = ((hue | 0) % 360) * 3;
          const gate = smoothstep(0.04, 0.25, sat);
          const nh = hue + bandLut[bi] * gate;
          const ns = clamp(sat * (1 + bandLut[bi + 1] * gate), 0, 1);
          const lm = bandLut[bi + 2] * gate * 0.6;
          const nl = lm > 0 ? l + (1 - l) * lm : l + l * lm;
          hslToRgbInto(nh, ns, clamp(nl, 0, 1), bandRgb);
          r = bandRgb[0]; g = bandRgb[1]; b = bandRgb[2];
        }
      }

      if (wheels.length) {
        const yn = clamp((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, 0, 1);
        for (let j = 0; j < wheels.length; j++) {
          const wh = wheels[j];
          const range = wh.idx === 0 ? 1 - smoothstep(0, 0.55, yn) : wh.idx === 1 ? 4 * yn * (1 - yn) : smoothstep(0.45, 1, yn);
          const k = wh.amount * range * wheelStrength;
          r += wh.v[0] * k; g += wh.v[1] * k; b += wh.v[2] * k;
        }
      }

      if (lut3d) {
        sampleLut3d(lut3d.data, lut3d.size, clamp(r, 0, 255) * lutScale, clamp(g, 0, 255) * lutScale, clamp(b, 0, 255) * lutScale, lutOut);
        const a = lut3d.amount;
        r = r * (1 - a) + lutOut[0] * a;
        g = g * (1 - a) + lutOut[1] * a;
        b = b * (1 - a) + lutOut[2] * a;
      }

      if (hasBloom) {
        const add = Math.min(0.9, kBloom * sampleLow(bloomLow, bLw, bLh, x, y, bDs));
        r = 255 - (255 - r) * (1 - add);
        g = 255 - (255 - g) * (1 - add * 0.9);
        b = 255 - (255 - b) * (1 - add * 0.78);
      }

      if (vignette) {
        const nx = (x + 0.5 - cx) / cx;
        const rr = Math.sqrt(nx * nx + ny * ny) * 0.7071;
        const f = smoothstep(0.35, 1, rr);
        if (vignette > 0) {
          const m = 1 - vAmt * f;
          r *= m; g *= m; b *= m;
        } else {
          const t = vAmt * f;
          r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t;
        }
      }

      if (grain > 0) {
        const gx = (x / gCell) | 0, gy = (yy / gCell) | 0;
        let hsh = Math.imul(gx, 374761393) + Math.imul(gy, 668265263) + seedMix;
        hsh = Math.imul(hsh ^ (hsh >>> 13), 1274126177);
        hsh ^= hsh >>> 16;
        const nz = (hsh & 0xffff) / 65535 - 0.5;
        const yn = clamp((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, 0, 1);
        const gv = nz * gAmt * (0.35 + 0.65 * 4 * yn * (1 - yn));
        r += gv; g += gv; b += gv;
      }

      const dth = plan.noDither ? 0 : DITHER_TILE[dRow + (x & (DITHER_SIZE - 1))];
      data[i] = r + dth;
      data[i + 1] = g + dth;
      data[i + 2] = b + dth;
    }
  }
}

// ---------- Analyse automatique d'une image (correction auto) ----------
function analyzeAutoCorrection(pixels) {
  const hist = new Uint32Array(256);
  let count = 0, sumR = 0, sumG = 0, sumB = 0, wbCount = 0, satSum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 13) continue;
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    hist[y]++; count++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const s = mx ? (mx - mn) / mx : 0;
    satSum += s;
    if (y > 38 && y < 225 && s < 0.35) {
      sumR += SRGB_TO_LINEAR[r]; sumG += SRGB_TO_LINEAR[g]; sumB += SRGB_TO_LINEAR[b]; wbCount++;
    }
  }
  if (!count) return null;
  const pct = (q) => {
    const target = count * q;
    let acc = 0;
    for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= target) return i / 255; }
    return 1;
  };
  const p005 = pct(0.005), p50 = pct(0.5), p995 = pct(0.995);
  const result = {};
  result.blacks = Math.round(-Math.min(50, Math.max(0, ((p005 - 0.015) / 0.16) * 100)));
  result.whites = Math.round(Math.min(40, Math.max(0, ((0.98 - p995) / 0.2) * 100)));
  const stops = Math.log2(srgbToLinear(0.46) / Math.max(1e-4, srgbToLinear(Math.max(0.02, p50))));
  result.exposure = Math.round(clamp(((stops / 2) * 100) * 0.7, -35, 35));
  const spread = p995 - p005;
  result.contrast = Math.round(clamp((0.85 - spread) * 60, -8, 25));
  if (wbCount > count * 0.02) {
    const mr = sumR / wbCount, mg = sumG / wbCount, mb = sumB / wbCount;
    result.temperature = Math.round(clamp((100 * Math.log2(mb / mr)) / 0.8, -25, 25));
    result.tint = Math.round(clamp((-100 * Math.log2((mr + mb) / 2 / mg)) / 0.25, -15, 15));
  } else {
    result.temperature = 0;
    result.tint = 0;
  }
  result.vibrance = Math.round(clamp((0.34 - satSum / count) * 100, -10, 25));
  // Ombres / hautes lumières : on ouvre les ombres si trop de pixels sont très sombres,
  // et on récupère les hautes lumières si trop de pixels sont proches du blanc.
  let dark = 0, bright = 0;
  for (let i = 0; i < 256; i++) { if (i < 38) dark += hist[i]; if (i > 242) bright += hist[i]; }
  result.shadows = Math.round(clamp((dark / count - 0.12) * 120, 0, 40));
  result.highlights = Math.round(-clamp((bright / count - 0.05) * 160, 0, 45)) + 0;
  return result;
}


// ---------- Statistiques de canaux + correspondance de couleur ----------
function channelStats(data) {
  const step = Math.max(1, Math.floor(data.length / 4 / 60000)) * 4;
  const sum = [0, 0, 0], sq = [0, 0, 0];
  let count = 0;
  for (let i = 0; i < data.length; i += step) {
    if (data[i + 3] < 13) continue;
    for (let c = 0; c < 3; c++) { const v = data[i + c]; sum[c] += v; sq[c] += v * v; }
    count++;
  }
  if (!count) return { mean: [128, 128, 128], std: [64, 64, 64] };
  const mean = sum.map((s) => s / count);
  const std = sq.map((s, c) => Math.sqrt(Math.max(1, s / count - mean[c] * mean[c])));
  return { mean, std };
}

// Table (par canal) qui rapproche les statistiques de l'image source de celles de la référence.
function buildMatchLuts(src, ref) {
  return [0, 1, 2].map((c) => {
    const ratio = clamp(ref.std[c] / Math.max(1, src.std[c]), 0.6, 1.6);
    const lut = new Float32Array(256);
    for (let i = 0; i < 256; i++) lut[i] = clamp((i - src.mean[c]) * ratio + ref.mean[c], 0, 255);
    return lut;
  });
}

// ---------- Détection automatique de scène ----------
const SCENE_PATCHES = {
  night: { exposure: 12, shadows: 20, blacks: -5, denoise: 35, vibrance: 10 },
  highkey: { highlights: -25, whites: -10, contrast: 8, dehaze: 10 },
  portrait: { skinSmooth: 25, vibrance: 12, skinProtect: 70, highlights: -10 },
  sunset: { contrast: 10, vibrance: 8, highlights: -15, shadows: 15 },
  nature: { vibrance: 18, clarity: 15, dehaze: 8 },
  sky: { vibrance: 12, contrast: 8, highlights: -12 },
  lowcontrast: { contrast: 18, dehaze: 20, blacks: -8, whites: 8 },
  desaturated: { vibrance: 25 }
};
const SCENE_LABELS = {
  night: 'Scène sombre / nuit',
  highkey: 'Scène très lumineuse (neige, ciel clair)',
  portrait: 'Visage / portrait détecté',
  sunset: 'Lumière chaude (coucher de soleil)',
  nature: 'Végétation',
  sky: 'Ciel / eau (dominante bleue)',
  lowcontrast: 'Image peu contrastée ou voilée',
  desaturated: 'Image peu colorée'
};
const SCENE_PRESET = { night: 'dramatique', highkey: 'frais', portrait: 'cinema', sunset: 'Lueur-dorée', nature: 'frais', sky: 'frais', lowcontrast: 'cinema' };

function detectScene(pixels) {
  const step = Math.max(1, Math.floor(pixels.length / 4 / 60000)) * 4;
  let n = 0, sumY = 0, sumSat = 0, dark = 0, bright = 0, skin = 0, blue = 0, green = 0, warm = 0;
  const hist = new Uint32Array(256);
  for (let i = 0; i < pixels.length; i += step) {
    if (pixels[i + 3] < 13) continue;
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    const sat = mx ? d / mx : 0;
    n++; sumY += y; sumSat += sat; hist[Math.round(y)]++;
    if (y < 40) dark++;
    if (y > 215) bright++;
    if (d > 20) {
      let hue;
      if (mx === r) hue = (((g - b) / d) % 6) * 60;
      else if (mx === g) hue = ((b - r) / d + 2) * 60;
      else hue = ((r - g) / d + 4) * 60;
      if (hue < 0) hue += 360;
      if (sat > 0.2 && hue >= 190 && hue <= 260) blue++;
      if (sat > 0.2 && hue >= 80 && hue <= 160) green++;
      if (sat > 0.35 && hue >= 10 && hue <= 50) warm++;
      if (r > g && g >= b && sat > 0.1 && sat < 0.7 && y > 50 && hue >= 8 && hue <= 50) skin++;
    }
  }
  if (!n) return { tags: [], patch: {}, presetId: null, metrics: {} };
  const pct = (q) => { let acc = 0; for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= n * q) return i / 255; } return 1; };
  const meanY = sumY / n / 255, meanSat = sumSat / n;
  const spread = pct(0.95) - pct(0.05);
  const f = { dark: dark / n, bright: bright / n, skin: skin / n, blue: blue / n, green: green / n, warm: warm / n };

  const found = [];
  if (meanY < 0.22 && f.dark > 0.55) found.push('night');
  if (meanY > 0.62 && f.bright > 0.3) found.push('highkey');
  if (f.skin > 0.08) found.push('portrait');
  if (f.warm > 0.3 && meanSat > 0.3) found.push('sunset');
  if (f.green > 0.25) found.push('nature');
  if (f.blue > 0.3) found.push('sky');
  if (spread < 0.5) found.push('lowcontrast');
  if (meanSat < 0.12) found.push('desaturated');

  // Fusion des suggestions (plafonnée) + balance des blancs automatique.
  const patch = {};
  found.forEach((id) => {
    Object.entries(SCENE_PATCHES[id]).forEach(([k, v]) => { patch[k] = clamp((patch[k] || 0) + v, -100, 100); });
  });
  const auto = analyzeAutoCorrection(pixels);
  if (auto) { patch.temperature = auto.temperature; patch.tint = auto.tint; }
  const presetKey = found.find((id) => SCENE_PRESET[id]);
  return {
    tags: found.map((id) => ({ id, label: SCENE_LABELS[id] })),
    patch,
    presetId: presetKey ? SCENE_PRESET[presetKey] : null,
    metrics: { meanY, meanSat, spread, ...f }
  };
}

// ---------- Moniteurs (histogramme, forme d'onde, vectorscope) ----------
function drawScope(canvas, frame, mode) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const { data, width: fw, height: fh } = frame;
  ctx.clearRect(0, 0, W, H);

  if (mode === 'wave') {
    const acc = new Uint16Array(W * H);
    const sy = Math.max(1, Math.floor(fh / 120));
    for (let y = 0; y < fh; y += sy) {
      for (let x = 0; x < fw; x++) {
        const i = (y * fw + x) * 4;
        const yl = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        const col = Math.min(W - 1, ((x / fw) * W) | 0);
        const row = H - 1 - Math.round((yl / 255) * (H - 1));
        acc[row * W + col]++;
      }
    }
    const colMax = Math.max(1, (fh / sy) * (fw / W));
    const img = ctx.createImageData(W, H);
    for (let k = 0; k < acc.length; k++) {
      if (!acc[k]) continue;
      const v = Math.min(1, (acc[k] * 14) / colMax);
      img.data[k * 4] = 90 * v; img.data[k * 4 + 1] = 255 * v; img.data[k * 4 + 2] = 150 * v; img.data[k * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const yy = Math.round(4 + t * (H - 8)) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    });
    return;
  }

  if (mode === 'vector') {
    const S = Math.min(W, H), cx = W / 2, cy = H / 2, R = S / 2 - 6;
    const acc = new Uint16Array(W * H);
    const step = Math.max(1, Math.floor((fw * fh) / 60000));
    for (let p = 0; p < fw * fh; p += step) {
      const i = p * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const yl = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const cb = (b - yl) / 1.8556 / 255, cr = (r - yl) / 1.5748 / 255;
      const px = Math.round(cx + cb * 2 * R), py = Math.round(cy - cr * 2 * R);
      if (px >= 0 && px < W && py >= 0 && py < H) acc[py * W + px]++;
    }
    const img = ctx.createImageData(W, H);
    for (let k = 0; k < acc.length; k++) {
      if (!acc[k]) continue;
      const v = Math.min(1, 0.35 + acc[k] / 6);
      img.data[k * 4] = 255 * v; img.data[k * 4 + 1] = 255 * v; img.data[k * 4 + 2] = 255 * v; img.data[k * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R / 2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    // Ligne des tons chair (≈ 123° depuis l'axe Cb)
    ctx.strokeStyle = 'rgba(251,191,36,0.9)';
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos((123 * Math.PI) / 180) * R, cy - Math.sin((123 * Math.PI) / 180) * R);
    ctx.stroke();
    // Cibles des couleurs primaires/secondaires à 75 %
    [[191, 0, 0, '#ef4444'], [191, 191, 0, '#eab308'], [0, 191, 0, '#22c55e'], [0, 191, 191, '#06b6d4'], [0, 0, 191, '#3b82f6'], [191, 0, 191, '#ec4899']].forEach(([r, g, b, c]) => {
      const yl = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const px = cx + ((b - yl) / 1.8556 / 255) * 2 * R, py = cy - ((r - yl) / 1.5748 / 255) * 2 * R;
      ctx.strokeStyle = c;
      ctx.strokeRect(px - 3, py - 3, 6, 6);
    });
    return;
  }

  // Histogramme RVB
  const R = new Uint32Array(256), G = new Uint32Array(256), B = new Uint32Array(256);
  const step = Math.max(1, Math.floor(data.length / 4 / 40000)) * 4;
  for (let i = 0; i < data.length; i += step) { R[data[i]]++; G[data[i + 1]]++; B[data[i + 2]]++; }
  let max = 1;
  for (let i = 1; i < 255; i++) max = Math.max(max, R[i], G[i], B[i]);
  ctx.globalCompositeOperation = 'lighter';
  [[R, 'rgba(239,68,68,0.85)'], [G, 'rgba(34,197,94,0.85)'], [B, 'rgba(59,130,246,0.85)']].forEach(([bins, color]) => {
    ctx.fillStyle = color;
    for (let i = 0; i < 256; i++) {
      const hgt = Math.min(1, bins[i] / max) * (H - 2);
      ctx.fillRect((i / 256) * W, H - hgt, Math.ceil(W / 256), hgt);
    }
  });
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- Avertissement d'écrêtage (aperçu uniquement) ----------
// Rouge = hautes lumières brûlées, bleu = noirs bouchés.
function applyClippingOverlay(data) {
  for (let i = 0; i < data.length; i += 4) {
    const mx = Math.max(data[i], data[i + 1], data[i + 2]);
    const mn = Math.min(data[i], data[i + 1], data[i + 2]);
    if (mn >= 253) { data[i] = 255; data[i + 1] = 40; data[i + 2] = 40; }
    else if (mx <= 2) { data[i] = 40; data[i + 1] = 90; data[i + 2] = 255; }
  }
}

export {
  clamp, num, SRGB_TO_LINEAR, HSL_BANDS, bandKey, hueDistance, hexToUnitRgb, hueToHex,
  buildCurveLut, resolveAdjustments, prepareGrade, processImageData, parseCubeLut,
  analyzeAutoCorrection, drawScope, applyClippingOverlay,
  channelStats, buildMatchLuts, detectScene
};
