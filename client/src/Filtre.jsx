import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Input,
  ALL_FORMATS,
  BlobSource,
  CanvasSink,
  Output,
  Mp4OutputFormat,
  CanvasSource,
  AudioSampleSink,
  AudioSampleSource,
  BufferTarget
} from 'mediabunny';

import {
  clamp, num, SRGB_TO_LINEAR, HSL_BANDS, bandKey, hueDistance, hexToUnitRgb, hueToHex,
  buildCurveLut, resolveAdjustments, prepareGrade, processImageData, parseCubeLut,
  analyzeAutoCorrection, drawScope, applyClippingOverlay,
  channelStats, buildMatchLuts, detectScene
} from './gradeEngine.js';
import { GradePool, detectCores, workersSupported } from './gradePool.js';
import * as MB from 'mediabunny';
import {
  createSegments, splitAt, toggleRemoved, keptRanges, keptDuration, isTrimmed,
  detectSceneCuts, playbackJump, removeRange, trimEdge, tickStep, generateThumbnails
} from './timeline.js';
import { collectOriginalAudio, renderMix, iterateSamples } from './audioMix.js';

// ============================================================
// CONSTANTES
// ============================================================

const PREVIEW_SIDES = { eco: 640, standard: 960, high: 1280 };
const EXPORT_RESOLUTIONS = [['original', 'Originale'], ['2160', '2160p (4K)'], ['1440', '1440p'], ['1080', '1080p'], ['720', '720p'], ['480', '480p']];
const PERF_STORAGE_KEY = 'ovx-filtre-perf-v1';
const MAX_IMAGE_PIXELS = 16_000_000; // limite canvas de Safari / iOS
const FALLBACK_MEDIA =
  'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1185-large.mp4';

const DEFAULT_COLOR_SETTINGS = Object.freeze({
  exposure: 0, contrast: 0, brightness: 0, shadows: 0, highlights: 0, whites: 0, blacks: 0,
  saturation: 0, vibrance: 0, temperature: 0, tint: 0, hue: 0,
  clarity: 0, dehaze: 0, sharpness: 0, vignette: 0, grain: 0, grainSize: 0, fade: 0, sepia: 0, monochrome: 0,
  denoise: 0, skinSmooth: 0, bloom: 0, skinProtect: 0,
  curveShadows: 0, curveDarks: 0, curveMidtones: 0, curveLights: 0, curveHighlights: 0,
  wheelShadows: '#808080', wheelShadowsAmount: 0,
  wheelMidtones: '#808080', wheelMidtonesAmount: 0,
  wheelHighlights: '#808080', wheelHighlightsAmount: 0,
  ...Object.fromEntries(
    HSL_BANDS.flatMap((b) => [[bandKey('hue', b.id), 0], [bandKey('sat', b.id), 0], [bandKey('lum', b.id), 0]])
  )
});

const EXPORT_QUALITIES = {
  standard: { label: 'Standard', bitsPerPixel: 0.15 },
  high: { label: 'Haute', bitsPerPixel: 0.25 },
  max: { label: 'Maximale', bitsPerPixel: 0.4 }
};

const IMAGE_FORMATS = {
  png: { label: 'PNG (sans perte)', mime: 'image/png', ext: 'png', quality: undefined },
  jpeg: { label: 'JPEG (léger)', mime: 'image/jpeg', ext: 'jpg', quality: 0.95 },
  webp: { label: 'WebP (léger)', mime: 'image/webp', ext: 'webp', quality: 0.95 }
};

// ============================================================
// FILTRES PRÉDÉFINIS
// Clés numériques possibles : exposure, contrast, shadows, highlights,
// whites, blacks, saturation, vibrance, temperature, tint, fade,
// clarity, vignette, grain, sharpness. `swatch` sert de vignette
// quand il n'y a pas d'image `thumb`.
// ============================================================

const PRESET_FILTERS = [
  { id: 'none', name: 'Aucun', thumb: null },
  {
    id: 'eclairage', name: 'Éclairage',
    contrast: -20, shadows: 15, blacks: 25, temperature: 10, grain: 30,
    thumb: '/images/eclairage.webp'
  },
  {
    id: 'vintage', name: 'Vintage',
    contrast: 10, shadows: -10, blacks: 10, saturation: -30, temperature: 25, grain: 50,
    thumb: '/images/vintage.webp'
  },
  {
    id: 'noir', name: 'Noir & Blanc Profond',
    contrast: 40, shadows: -20, blacks: -10, saturation: -100, grain: 40,
    thumb: '/images/noir et blanc.webp'
  },
  {
    id: 'cyberpunk2', name: 'Cyberpunk Neon',
    contrast: 30, shadows: 20, blacks: -15, saturation: 40, temperature: -30, grain: 20,
    thumb: '/images/cyberpunk2.webp'
  },
  {
    id: 'Lueur-dorée', name: 'Lueur dorée',
    contrast: 5, shadows: 10, blacks: 5, saturation: 20, temperature: 35, grain: 10,
    thumb: '/images/Lueur-dorée.webp'
  },
  {
    id: 'cinema', name: 'Cinéma',
    contrast: 18, shadows: 8, blacks: -8, saturation: 12, temperature: 8, tint: -4, vignette: 18, sharpness: 15,
    thumb:  '/images/ecran-cinema.webp' }, 
  {
    id: 'pastel', name: 'Pastel doux',
    contrast: -15, blacks: 20, saturation: -10, vibrance: 15, fade: 20, temperature: 5,
  thumb:  '/images/lumiere-naturel.webp' }, 
  
  {
    id: 'dramatique', name: 'Dramatique',
    contrast: 35, shadows: -15, saturation: -15, clarity: 25, vignette: 25, grain: 15,
    thumb:  '/images/dramatique.webp' }, 
  
  {
    id: 'frais', name: 'lumineux',
    contrast: 8, whites: 10, vibrance: 30, temperature: -10, sharpness: 20,
     thumb:  '/images/dramatique.webp' 
  }
];

const TOP_TABS = [
  { id: 'filters', label: 'Filtre', icon: '🎞️' },
  { id: 'color', label: 'Couleur', icon: '🎨' },
  { id: 'lighting', label: 'Éclairage IA', icon: '💡' },
  { id: 'environment', label: 'Environnement IA', icon: '🏞️' },
  { id: 'camera', label: 'Caméra IA', icon: '🎥' }
];
// Onglets qui affichent l'aperçu de la vidéo / image.
const PREVIEW_TABS = ['filters', 'color'];

const AI_ACTIONS = [
  {
    id: 'color', label: 'Modifier la couleur', shortLabel: 'Couleur', icon: '🎨',
    prompt: 'Adjust the color grading, tones and overall color appearance while preserving the scene, characters and actions.'
  },
  {
    id: 'style', label: 'Changer le style', shortLabel: 'Style IA', icon: '🖌️',
    prompt: 'Change the visual style and appearance while preserving the same scene, characters and actions.'
  },
  {
    id: 'character', label: 'Modifier le personnage', shortLabel: 'Personnage IA', icon: '👤',
    prompt: "Modify the appearance of the main character while preserving the character's identity, actions and scene."
  },
  {
    id: 'environment', label: 'Changer le décor', shortLabel: 'Décor IA', icon: '🏞️',
    prompt: 'Change the environment and background while preserving the characters, actions and camera movement.'
  },
  {
    id: 'lighting', label: "Modifier l'éclairage", shortLabel: 'Éclairage IA', icon: '💡',
    prompt: 'Change the lighting and atmosphere while preserving the scene, characters and actions.'
  },
  {
    id: 'effect', label: 'Ajouter un effet', shortLabel: 'Effet IA', icon: '✨',
    prompt: 'Add a cinematic visual effect while preserving the original scene, characters and actions.'
  },
  {
    id: 'camera', label: 'Modifier la caméra', shortLabel: 'Caméra IA', icon: '🎥',
    prompt: 'Change the camera movement and framing while preserving the scene, characters and actions.'
  },
  {
    id: 'extend', label: 'Prolonger la vidéo', shortLabel: 'Prolonger', icon: '⏩',
    prompt: 'Continue the video seamlessly from the final frame. Preserve the same characters, environment, visual style, lighting and camera continuity. Continue the action naturally.'
  }
];

// [vignette (image/vidéo), nom affiché, prompt envoyé à l'IA]
const AI_OPTIONS = {
  color: {
    title: 'Modifier la couleur',
    subtitle: 'Choisissez la nouvelle ambiance colorimétrique.',
    options: [
      ['/images/chaud.jpg', 'Chaud', 'Apply warm cinematic color tones while preserving the scene, characters and actions.'],
      ['/images/froid.jpg', 'Froid', 'Apply cool blue color tones while preserving the scene, characters and actions.'],
      ['/images/cinema.jpg', 'Cinéma', 'Apply cinematic color grading with balanced contrast and professional tones.'],
      ['/images/vif.jpg', 'Vif', 'Enhance vibrant and rich colors while preserving the scene and characters.'],
      ['/images/sombre.jpg', 'Sombre', 'Apply a dark and moody cinematic color grading while preserving the scene.'],
      ['/images/desature.jpg', 'Désaturé', 'Reduce color saturation for a muted cinematic appearance.']
    ]
  },
  environment: {
    title: 'Environnement & Météo',
    subtitle: 'Changez le décor et les conditions météo de la scène.',
    options: [
      ['/images/pluie.webp', 'Pluie', 'Add realistic rain and storm atmosphere while preserving the main subject and actions.'],
      ['/images/neige.webp', 'Neige', 'Add realistic falling snow and winter environment while preserving the main subject.'],
      ['/images/foret.webp', 'Forêt', 'Replace the background with a detailed cinematic forest.'],
      ['/images/cyberpunk3.webp', 'Ville Cyberpunk', 'Replace the background with a cinematic cyberpunk city.'],
      ['/images/desert.webp', 'Désert', 'Replace the background with a cinematic desert landscape.'],
      ['/images/ocean.webp', 'Océan', 'Replace the background with a cinematic ocean view.'],
      ['/images/Particules.webp', 'Particules', 'Add magical floating spark particles, with warm glints, soft depth, and subtle atmosphere.'],
      ['/images/brume.webp', 'Brume', 'Add a misty morning fog atmosphere, with soft diffused light, low contrast, and gentle depth layers.'],
      ['/images/tornade.webp', 'Tornade', 'Add a violent F5 tornado tearing through the scene and destroying everything in its path, bathing the scene in a dark, oppressive atmosphere.']
    ]
  },
  style: {
    title: 'Changer le style',
    subtitle: "Transformez l'apparence visuelle de la vidéo.",
    options: [
      ['/images/cinematique.jpg', 'Cinématique', 'Transform the video into a cinematic visual style.'],
      ['/images/artistique.jpg', 'Artistique', 'Give the video an artistic and stylized visual appearance.'],
      ['/images/film35mm.jpg', 'Film 35mm', 'Give the video a realistic 35mm film look.'],
      ['/images/anime.jpg', 'Anime', 'Transform the visual style into a detailed anime style.'],
      ['/images/3d.jpg', '3D', 'Transform the visual appearance into a polished 3D style.'],
      ['/images/peinture.jpg', 'Peinture', 'Transform the visual appearance into a cinematic painted style.']
    ]
  },
  character: {
    title: 'Modifier le personnage',
    subtitle: "Modifiez l'apparence du personnage principal.",
    options: [
      ['/images/vetements.jpg', 'Vêtements', 'Change the character clothing while preserving identity and actions.'],
      ['/images/coiffure.jpg', 'Coiffure', 'Change the character hairstyle while preserving identity.'],
      ['/images/apparence.jpg', 'Apparence', 'Modify the character appearance while preserving identity and actions.'],
      ['/images/armure.jpg', 'Armure', 'Give the character a detailed cinematic armor while preserving identity.'],
      ['/images/fantastique.jpg', 'Fantastique', 'Transform the character into a detailed fantasy character while preserving identity.'],
      ['/images/futuriste.jpg', 'Futuriste', 'Give the character a futuristic appearance while preserving identity and actions.']
    ]
  },
  lighting: {
    title: "Modifier l'éclairage",
    subtitle: 'Choisissez le nouvel éclairage de la scène.',
    options: [
      ['/images/lumiere-naturel.webp', 'Lumière naturelle', 'Use realistic natural daylight with soft cinematic shadows.'],
      ['/images/Lueur-dorée.webp', 'Lumière dorée', 'Low golden late-afternoon light casting long stretched shadows and bathing the scene in warm tones.'],
      ['/images/nuit.webp', 'Nuit', 'Transform the lighting into a realistic cinematic night scene.'],
      ['/videos/Couloir-sombre.webp', 'Cinématique', 'Use dramatic cinematic lighting with controlled highlights and shadows.'],
      ['/images/lumière-exterieur.webp', 'Lumière extérieure', 'Adjust the lighting to achieve a cinematic outdoor look, featuring soft, directional highlights, natural shadows, and an elegant contrast with the interior.'],
      ['/images/lueur-aux-chandelles.webp', 'Lueur aux chandelles', 'Change the lighting to warm candlelight with flickering amber highlights, soft falloff, and intimate, low-light shadows.']
    ]
  },
  effect: {
    title: 'Ajouter un effet',
    subtitle: 'Ajoutez un effet visuel à votre vidéo.',
    options: [
      ['/images/particules.jpg', 'Particules', 'Add cinematic floating particles while preserving the scene.'],
      ['/images/feu.jpg', 'Feu', 'Add realistic cinematic fire effects while preserving the scene.'],
      ['/images/electricite.jpg', 'Électricité', 'Add cinematic electrical energy effects while preserving the scene.'],
      ['/images/brouillard.jpg', 'Brouillard', 'Add realistic atmospheric cinematic fog.'],
      ['/images/explosion.jpg', 'Explosion', 'Add a cinematic explosion effect while preserving the scene.'],
      ['/images/pluie.jpg', 'Pluie', 'Add realistic cinematic rain while preserving the scene.']
    ]
  },
  camera: {
    title: 'Modifier la caméra',
    subtitle: 'Modifiez le mouvement et le cadrage.',
    options: [
      ['/videos/Couloir-sombre.webm', 'Zoom', 'Add a smooth cinematic camera zoom.'],
      ['/videos/smooth-cinematic.webm', 'Travelling', 'Add a smooth cinematic tracking camera movement.'],
      ['/videos/encore-une.webm', 'Rotation', 'Add a smooth cinematic camera rotation.'],
      ['/videos/plan_large.webm', 'Plan large', 'Change the framing into a cinematic wide shot.'],
      ['/videos/gros_plan.webm', 'Gros plan', 'Change the framing into a cinematic close-up.'],
      ['/videos/Foret-sombre.webm', 'Drone vue aérienne', 'The camera rises smoothly and moves backward, transitioning from a low-angle shot to an aerial, high-angle view.'],
      ['/videos/camera_fixe.webm', 'Caméra fixe', 'Keep the camera completely static, locked on a tripod, with no movement or zoom.']
    ]
  },
  extend: {
    title: 'Prolonger la vidéo',
    subtitle: 'Continuez naturellement la vidéo à partir de sa dernière image.',
    options: [
      ['/images/continuer.jpg', 'Continuer', 'Continue the action naturally from the final frame.'],
      ['/images/continuite.jpg', 'Continuité cinéma', 'Continue the scene with cinematic visual continuity.'],
      ['/images/action.jpg', "Continuer l'action", 'Continue the current action naturally and seamlessly.']
    ]
  }
};

// Sliders de l'onglet Couleur : [libellé, clé, min]
const TONE_SLIDERS = [
  ['Exposition', 'exposure', -100],
  ['Contraste', 'contrast', -100],
  ['Luminosité', 'brightness', -100],
  ['Ombres', 'shadows', -100],
  ['Hautes lumières', 'highlights', -100],
  ['Blancs', 'whites', -100],
  ['Noirs', 'blacks', -100]
];

const COLOR_SLIDERS = [
  ['Saturation', 'saturation', -100],
  ['Vibrance (protège les tons saturés)', 'vibrance', -100],
  ['Protéger les tons chair', 'skinProtect', 0],
  ['Température', 'temperature', -100],
  ['Teinte vert / magenta', 'tint', -100],
  ['Teinte globale', 'hue', -100],
  ['Fondu / effet mat', 'fade', -100],
  ['Sépia', 'sepia', 0],
  ['Noir et blanc', 'monochrome', 0]
];

const DETAIL_SLIDERS = [
  ['Clarté (contraste local)', 'clarity', -100],
  ['Correction du voile', 'dehaze', -100],
  ['Netteté', 'sharpness', 0],
  ['Réduction du bruit', 'denoise', 0],
  ['Lissage de la peau', 'skinSmooth', 0],
  ['Lueur (bloom)', 'bloom', 0],
  ['Grain', 'grain', 0],
  ['Taille du grain', 'grainSize', 0],
  ['Vignettage', 'vignette', -100]
];

// Émulation de pellicule : s'ajoute au preset, avec sa propre force.
const FILM_STOCKS = [
  { id: 'none', name: 'Aucune' },
  { id: 'negatif-chaud', name: 'Négatif chaud (portrait)', temperature: 10, tint: 3, fade: 12, blacks: 10, contrast: -5, highlights: -10, vibrance: 10, grain: 25, grainSize: 10 },
  { id: 'negatif-frais', name: 'Négatif frais (paysage)', temperature: -6, tint: -6, contrast: 12, saturation: 8, shadows: 5, grain: 22, grainSize: 10 },
  { id: 'argentique-nb', name: 'Argentique noir & blanc', saturation: -100, contrast: 25, fade: 6, grain: 55, grainSize: 25 },
  { id: 'cine-tungstene', name: 'Cinéma tungstène 500', temperature: -12, contrast: 10, shadows: 10, saturation: 5, bloom: 12, vignette: 10, grain: 35, grainSize: 15 },
  { id: 'cine-jour', name: 'Cinéma lumière du jour 50', contrast: 8, saturation: -4, fade: 8, vibrance: 6, grain: 14 }
];

const LOOKS_STORAGE_KEY = 'ovx-filtre-looks-v1';
const MAX_SAVED_LOOKS = 30;

const CURVE_SLIDERS = [
  ['Noirs', 'curveShadows'],
  ['Tons foncés', 'curveDarks'],
  ['Tons moyens', 'curveMidtones'],
  ['Tons clairs', 'curveLights'],
  ['Blancs', 'curveHighlights']
];

const WHEELS = [
  ['Ombres', 'wheelShadows'],
  ['Tons moyens', 'wheelMidtones'],
  ['Hautes lumières', 'wheelHighlights']
];


// ============================================================
// UTILITAIRES UI
// ============================================================

const toEven = (n) => Math.max(2, Math.round(n / 2) * 2);

const fmtTime = (s) => {
  const t = Math.max(0, Number(s) || 0);
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const hexToHue = (hex) => {
  const [r, g, b] = hexToUnitRgb(hex);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (!d) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Palettes « Mojo » : teinte des ombres, tons moyens et hautes lumières en un clic.
const wheelPatch = (sh, shA, mid, midA, hi, hiA, extra = {}) => ({
  wheelShadows: hueToHex(sh), wheelShadowsAmount: shA,
  wheelMidtones: hueToHex(mid), wheelMidtonesAmount: midA,
  wheelHighlights: hueToHex(hi), wheelHighlightsAmount: hiA,
  ...extra
});
const MOJO_PALETTES = [
  { id: 'teal-orange', name: 'Teal & orange', patch: wheelPatch(185, 45, 30, 12, 35, 40, { contrast: 10 }) },
  { id: 'dore-bleute', name: 'Doré & bleuté', patch: wheelPatch(220, 35, 40, 10, 45, 35, { contrast: 6 }) },
  { id: 'neon', name: 'Néon cyan / magenta', patch: wheelPatch(190, 50, 280, 15, 320, 45, { saturation: 10, contrast: 8 }) },
  { id: 'matrix', name: 'Vert matrice', patch: wheelPatch(130, 40, 120, 25, 100, 20, { contrast: 10, saturation: -8 }) },
  { id: 'froid', name: 'Froid désaturé', patch: wheelPatch(215, 40, 205, 12, 200, 20, { saturation: -25, contrast: 8 }) }
];

// Groupes de la correction automatique (étapes guidées).
const AUTO_GROUPS = {
  all: ['exposure', 'contrast', 'blacks', 'whites', 'shadows', 'highlights', 'temperature', 'tint', 'vibrance'],
  tone: ['exposure', 'contrast', 'blacks', 'whites', 'shadows', 'highlights'],
  wb: ['temperature', 'tint'],
  color: ['vibrance']
};

// Préférences de performance (mémorisées dans le navigateur).
function loadPerf() {
  const cores = detectCores();
  const defaults = {
    enabled: workersSupported() && cores >= 4,
    threads: Math.max(1, Math.min(8, cores - 1)),
    previewQuality: 'standard'
  };
  try {
    const saved = JSON.parse(window.localStorage.getItem(PERF_STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return defaults;
    return {
      enabled: typeof saved.enabled === 'boolean' ? saved.enabled && workersSupported() : defaults.enabled,
      threads: clamp(Math.round(num(saved.threads)) || defaults.threads, 1, Math.min(16, Math.max(cores, 2))),
      previewQuality: PREVIEW_SIDES[saved.previewQuality] ? saved.previewQuality : defaults.previewQuality
    };
  } catch {
    return defaults;
  }
}
function persistPerf(value) {
  try { window.localStorage.setItem(PERF_STORAGE_KEY, JSON.stringify(value)); } catch { /* ignoré */ }
}

// Looks personnalisés : sauvegarde locale + import/export JSON.
function loadLooks() {
  try {
    if (typeof window === 'undefined') return [];
    const list = JSON.parse(window.localStorage.getItem(LOOKS_STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list.filter((l) => l && typeof l.name === 'string' && l.colorSettings).slice(0, MAX_SAVED_LOOKS) : [];
  } catch {
    return [];
  }
}
function persistLooks(list) {
  try { window.localStorage.setItem(LOOKS_STORAGE_KEY, JSON.stringify(list)); } catch { /* stockage indisponible */ }
}
// Ne garde que des clés et des valeurs valides (fichier importé = donnée non fiable).
function sanitizeColorSettings(input) {
  const out = {};
  for (const [key, def] of Object.entries(DEFAULT_COLOR_SETTINGS)) {
    const v = input ? input[key] : undefined;
    if (typeof def === 'number') out[key] = clamp(num(v), -100, 100);
    else out[key] = /^#[0-9a-f]{6}$/i.test(v || '') ? v : def;
  }
  return out;
}

const sectionStyle = { padding: '14px 15px', borderBottom: '1px solid rgba(255,255,255,0.06)' };
function PanelTitle({ children, onReset }) {
  return (
    <div style={{ ...panelTitleStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{children}</span>
      {onReset && (
        <button type="button" onClick={onReset} title="Réinitialiser cette section" aria-label="Réinitialiser cette section" style={{ border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '12px', padding: 0 }}>↺</button>
      )}
    </div>
  );
}

const sectionTitleStyle = { fontSize: '12px', fontWeight: '700', marginBottom: '8px' };
const panelStyle = { background: '#18181b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', minWidth: 0, boxSizing: 'border-box' };
const panelTitleStyle = { fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px', letterSpacing: '.5px' };
const ghostButtonStyle = { padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#27272a', color: '#f87171', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const toolChipStyle = (active, disabled) => ({
  padding: '5px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
  border: active ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)',
  background: active ? 'rgba(0,180,216,0.2)' : '#27272a', color: active ? '#38bdf8' : '#d1d5db', opacity: disabled ? 0.4 : 1
});
const selectStyle = { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#27272a', color: '#fff', fontSize: '11px' };

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function PanelHeader({ title, subtitle }) {
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{title}</div>
      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px', lineHeight: '1.3' }}>{subtitle}</div>
    </div>
  );
}

// Curseur réutilisable. Double-clic = remise à zéro du réglage.
function SliderRow({ label, value, onChange, min = -100, max = 100, suffix = '', compact = false }) {
  const v = Number(value) || 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '2px' : '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: compact ? '9px' : '11px', fontWeight: compact ? 400 : 600, color: compact ? '#bbb' : '#d1d5db' }}>{label}</span>
        <span style={{ fontSize: compact ? '9px' : '10px', color: '#00b4d8', fontWeight: 700 }}>{v}{suffix}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={() => onChange(0)}
        title="Double-clic pour réinitialiser"
        style={{ width: '100%', height: compact ? '5px' : '6px', margin: 0, accentColor: '#00b4d8', cursor: 'pointer' }}
      />
    </div>
  );
}

function PresetTile({ filter, active, onSelect, onHover }) {
  const hasThumb = Boolean(filter.thumb);
  const swatch = filter.swatch;
  const background = hasThumb
    ? { backgroundImage: `url("${filter.thumb}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : swatch
      ? { background: `linear-gradient(135deg, ${swatch[0]}, ${swatch[1]})` }
      : { background: '#121216', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <button
      type="button"
      onClick={() => onSelect(filter)}
      onMouseEnter={() => onHover?.(filter)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(filter)}
      onBlur={() => onHover?.(null)}
      aria-pressed={active}
      style={{
        position: 'relative', aspectRatio: '16 / 9', padding: 0, overflow: 'hidden', borderRadius: '4px',
        border: active ? '2px solid #00b4d8' : '2px solid transparent', cursor: 'pointer', color: '#fff', textAlign: 'left',
        ...background
      }}
    >
      {filter.id === 'none' && <span style={{ fontSize: '16px', color: '#ef4444', fontWeight: 'bold' }}>✕</span>}
      <span style={{ position: 'absolute', left: '4px', right: '4px', bottom: '3px', fontSize: '12px', fontWeight: '600', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>
        {filter.name}
      </span>
    </button>
  );
}

function AIOptionTile({ option, active, onSelect }) {
  const [src, name] = option;
  const videoRef = useRef(null);
  const isVideoThumb = /\.(webm|mp4)$/i.test(src);
  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      aria-pressed={active}
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      style={{
        position: 'relative', aspectRatio: '16 / 9', padding: 0, overflow: 'hidden', borderRadius: '6px',
        border: active ? '2px solid #00b4d8' : '2px solid transparent',
        background: active ? 'rgba(0,180,216,0.15)' : 'rgba(255,255,255,0.02)', cursor: 'pointer'
      }}
    >
      {isVideoThumb ? (
        <video ref={videoRef} src={src} loop muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <span style={{ position: 'absolute', left: '6px', bottom: '6px', fontSize: '12px', fontWeight: '600', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', zIndex: 2 }}>{name}</span>
    </button>
  );
}

// Courbe tonale réelle (la même spline que celle appliquée à l'image).
function CurveGraph({ values }) {
  const lut = useMemo(() => buildCurveLut(values), [values]);
  const points = [];
  for (let k = 0; k <= 255; k += 5) points.push(`${(10 + (k / 255) * 200).toFixed(1)},${(68 - lut[k] * 64).toFixed(1)}`);
  const ctrl = [0, 0.25, 0.5, 0.75, 1].map((x, i) => [10 + x * 200, 68 - lut[Math.round(x * 255)] * 64, i]);
  return (
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '6px 8px', marginBottom: '8px' }}>
      <svg viewBox="0 0 220 72" width="100%" height="64" role="img" aria-label="Courbe tonale">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={10 + i * 50} y1="4" x2={10 + i * 50} y2="68" stroke="#303030" strokeWidth="1" />
            <line x1="10" y1={4 + i * 16} x2="210" y2={4 + i * 16} stroke="#303030" strokeWidth="1" />
          </g>
        ))}
        <line x1="10" y1="68" x2="210" y2="4" stroke="#666" strokeDasharray="3 3" />
        <polyline points={points.join(' ')} fill="none" stroke="#00d4f0" strokeWidth="2.5" strokeLinejoin="round" />
        {ctrl.map(([x, y, i]) => <circle key={i} cx={x} cy={y} r="2.8" fill="#fff" />)}
      </svg>
    </div>
  );
}

function ColorWheel({ label, hex, amount, onChange }) {
  const valid = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : '#808080';
  const marker = (() => {
    const angle = ((hexToHue(valid) - 90) * Math.PI) / 180;
    const radius = (Math.max(0, Math.min(100, amount)) / 100) * 29;
    return { left: `${37 + Math.cos(angle) * radius}px`, top: `${37 + Math.sin(angle) * radius}px` };
  })();

  const pick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const radius = Math.sqrt(x * x + y * y);
    const norm = Math.max(0, Math.min(1, radius / (Math.min(rect.width, rect.height) / 2 - 4)));
    const hue = (Math.atan2(y, x) * 180 / Math.PI + 450) % 360; // rouge en haut, sens horaire
    onChange(hueToHex(hue), Math.round(norm * 100));
  };

  return (
    <div style={{ background: '#202024', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#d1d5db' }}>{label}</span>
        <button type="button" aria-label={`Réinitialiser ${label}`} title="Réinitialiser" onClick={() => onChange('#808080', 0)} style={{ border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '11px', padding: 0 }}>↺</button>
      </div>
      <div
        role="slider"
        aria-label={`Roue chromatique ${label}`}
        aria-valuenow={amount}
        style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', position: 'relative', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7)', cursor: 'crosshair', border: '2px solid rgba(255,255,255,0.15)', touchAction: 'none' }}
        onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); pick(e); }}
        onPointerMove={(e) => { if (e.buttons === 1) pick(e); }}
        title="Cliquez ou faites glisser : teinte (angle) et intensité (distance)"
      >
        <div style={{ position: 'absolute', ...marker, width: '10px', height: '10px', background: valid, border: '2px solid #fff', borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
      </div>
      <div style={{ width: '100%' }}>
        <SliderRow compact label="Dose" min={0} max={100} suffix="%" value={amount} onChange={(v) => onChange(valid, v)} />
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

// ============================================================
// FRISE CHRONOLOGIQUE (style « CapCut »)
// - Une section supprimée disparaît et le vide se referme tout seul.
// - Clips avec vignettes, règle graduée, tête de lecture glissable, poignées de rognage.
// - Zoom : curseur ou Ctrl + molette ; défilement horizontal quand on zoome.
// ============================================================
const TL_PAD = 16;
const TL_RULER_H = 26;
const TL_TRACK_H = 58;
const TL_GAP = 8;

// Position dans la vidéo finale d'un instant de la vidéo source (zone supprimée → début de la section suivante).
function outTimeOf(clips, t) {
  if (!clips.length) return 0;
  for (const c of clips) {
    if (t >= c.start - 1e-6 && t <= c.end + 1e-6) return c.outStart + Math.min(Math.max(t - c.start, 0), c.end - c.start);
  }
  const next = clips.find((c) => c.start >= t);
  if (next) return next.outStart;
  const last = clips[clips.length - 1];
  return last.outStart + (last.end - last.start);
}

// Instant de la vidéo source correspondant à une position dans la vidéo finale.
function sourceTimeOf(clips, o) {
  if (!clips.length) return 0;
  const c = clips.find((x) => o >= x.outStart && o < x.outStart + (x.end - x.start)) || clips[clips.length - 1];
  return Math.min(c.end, c.start + Math.max(0, o - c.outStart));
}

function Timeline({ duration, segments, selectedId, onSelect, onSeek, onChange, getTime, currentTime, isPlaying, thumbs, zoom, onZoom }) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const playheadRef = useRef(null);
  const dragRef = useRef(null);
  const geo = useRef({});
  const [viewW, setViewW] = useState(640);

  const clips = useMemo(() => {
    let out = 0;
    return segments
      .filter((s) => !s.removed)
      .map((s) => {
        const clip = { ...s, outStart: out };
        out += s.end - s.start;
        return clip;
      });
  }, [segments]);
  const outDuration = clips.length ? clips[clips.length - 1].outStart + (clips[clips.length - 1].end - clips[clips.length - 1].start) : duration;
  const pps = ((viewW - 2 * TL_PAD) / Math.max(outDuration, 0.1)) * zoom;
  const contentW = Math.max(viewW, outDuration * pps + 2 * TL_PAD);
  geo.current = { clips, pps, outDuration, duration, segments };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const update = () => setViewW(el.clientWidth || 640);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ctrl + molette = zoom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      onZoom((prev) => clamp(prev * factor, 1, 40));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onZoom]);

  // Tête de lecture (déplacée directement dans le DOM pour rester fluide à 60 i/s).
  const place = useCallback(
    (srcT) => {
      const el = playheadRef.current;
      if (!el) return;
      const x = TL_PAD + outTimeOf(clips, srcT) * pps;
      el.style.transform = `translateX(${x}px)`;
      const sc = scrollRef.current;
      if (sc && !dragRef.current) {
        const margin = 48;
        if (x < sc.scrollLeft + margin || x > sc.scrollLeft + sc.clientWidth - margin) sc.scrollLeft = Math.max(0, x - sc.clientWidth / 2);
      }
    },
    [clips, pps]
  );
  useEffect(() => { place(getTime()); }, [place, currentTime, getTime]);
  useEffect(() => {
    if (!isPlaying) return undefined;
    let id = 0;
    const loop = () => { place(getTime()); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isPlaying, place, getTime]);

  const xToOut = (clientX) => {
    const rect = contentRef.current.getBoundingClientRect();
    return clamp((clientX - rect.left - TL_PAD) / geo.current.pps, 0, geo.current.outDuration);
  };
  // Aimantation : la tête de lecture « colle » aux bords des clips.
  const snap = (o) => {
    const { clips: cl, pps: p } = geo.current;
    let best = o;
    let bestDist = 8 / p;
    cl.forEach((c) => {
      [c.outStart, c.outStart + (c.end - c.start)].forEach((edge) => {
        const d = Math.abs(edge - o);
        if (d < bestDist) { bestDist = d; best = edge; }
      });
    });
    return best;
  };
  const scrubTo = (clientX) => {
    const o = snap(xToOut(clientX));
    onSeek(sourceTimeOf(geo.current.clips, Math.min(o, Math.max(0, geo.current.outDuration - 0.001))));
  };

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const edgeEl = e.target.closest ? e.target.closest('[data-edge]') : null;
    const clipEl = e.target.closest ? e.target.closest('[data-clip]') : null;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (edgeEl) {
      const { id, side } = edgeEl.dataset;
      const seg = geo.current.segments.find((s) => s.id === id);
      if (!seg) return;
      onSelect(id);
      dragRef.current = { kind: 'trim', id, side, base: geo.current.segments, startX: e.clientX, origT: side === 'start' ? seg.start : seg.end, pps: geo.current.pps };
      return;
    }
    if (clipEl) onSelect(clipEl.dataset.clip);
    dragRef.current = { kind: 'scrub' };
    scrubTo(e.clientX);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.kind === 'scrub') { scrubTo(e.clientX); return; }
    const t = clamp(d.origT + (e.clientX - d.startX) / d.pps, 0, geo.current.duration);
    const next = trimEdge(d.base, d.id, d.side, t);
    if (next !== geo.current.segments) onChange(next);
    onSeek(d.side === 'start' ? t : Math.max(0, t - 0.04));
  };
  const onPointerUp = (e) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // Règle graduée
  const step = tickStep(pps, 90);
  const ticks = [];
  for (let k = 0; k * step <= outDuration + 1e-6; k++) ticks.push(k * step);
  const minorCount = step * pps >= 60 ? 5 : 2;
  const tickLabel = (t) => (step < 1 ? `${t.toFixed(1)}s` : fmtTime(t));

  const tileW = thumbs && thumbs.length ? Math.max(40, Math.round(TL_TRACK_H * (thumbs[0].ratio || 16 / 9))) : 0;

  return (
    <div
      ref={scrollRef}
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', background: '#0b0b0e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
    >
      <div
        ref={contentRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ position: 'relative', width: contentW, height: TL_RULER_H + TL_TRACK_H + TL_GAP * 2 + 4, touchAction: 'none', userSelect: 'none', cursor: 'pointer' }}
      >
        {/* règle */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: contentW, height: TL_RULER_H, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {ticks.map((t) => {
            const x = TL_PAD + t * pps;
            return (
              <React.Fragment key={t}>
                <div style={{ position: 'absolute', left: x, top: 12, width: 1, height: 12, background: 'rgba(255,255,255,0.45)' }} />
                <span style={{ position: 'absolute', left: x + 4, top: 3, fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{tickLabel(t)}</span>
                {Array.from({ length: minorCount - 1 }, (_, j) => (
                  <div key={j} style={{ position: 'absolute', left: x + ((j + 1) * step * pps) / minorCount, top: 18, width: 1, height: 6, background: 'rgba(255,255,255,0.2)' }} />
                ))}
              </React.Fragment>
            );
          })}
        </div>

        {/* clips */}
        <div style={{ position: 'absolute', left: 0, top: TL_RULER_H + TL_GAP, width: contentW, height: TL_TRACK_H }}>
          {clips.map((c) => {
            const w = (c.end - c.start) * pps;
            const sel = c.id === selectedId;
            const tiles = [];
            if (tileW) {
              const n = Math.min(300, Math.ceil(w / tileW));
              for (let k = 0; k < n; k++) {
                const ts = c.start + (k * tileW + tileW / 2) / pps;
                const idx = clamp(Math.floor((ts / duration) * thumbs.length), 0, thumbs.length - 1);
                tiles.push(<div key={k} style={{ flex: `0 0 ${tileW}px`, height: '100%', backgroundImage: `url(${thumbs[idx].url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />);
              }
            }
            return (
              <div
                key={c.id}
                data-clip={c.id}
                style={{
                  position: 'absolute', left: TL_PAD + c.outStart * pps + 1, width: Math.max(3, w - 2), top: 0, height: TL_TRACK_H,
                  borderRadius: '6px', overflow: 'hidden', boxSizing: 'border-box',
                  background: 'linear-gradient(180deg, #14677a, #0d4452)',
                  outline: sel ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.14)', outlineOffset: sel ? '-2px' : '-1px',
                  boxShadow: sel ? '0 0 0 1px rgba(0,180,216,0.6)' : 'none'
                }}
              >
                <div style={{ display: 'flex', height: '100%', pointerEvents: 'none' }}>{tiles}</div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 45%, rgba(0,0,0,0.35))', pointerEvents: 'none' }} />
                {w > 46 && (
                  <span style={{ position: 'absolute', left: 8, top: 4, fontSize: '9px', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.9)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                    {(c.end - c.start).toFixed(1)} s
                  </span>
                )}
                {sel && w > 24 && (
                  <>
                    <div data-edge="1" data-side="start" data-id={c.id} title="Tirer pour rogner le début" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 11, background: '#fff', cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 2, height: 18, borderRadius: 1, background: '#0d4452', pointerEvents: 'none' }} />
                    </div>
                    <div data-edge="1" data-side="end" data-id={c.id} title="Tirer pour rogner la fin" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 11, background: '#fff', cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 2, height: 18, borderRadius: 1, background: '#0d4452', pointerEvents: 'none' }} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* tête de lecture */}
        <div ref={playheadRef} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 0, pointerEvents: 'none', zIndex: 5, willChange: 'transform' }}>
          <div style={{ position: 'absolute', left: -1, top: 8, bottom: 0, width: 2, background: '#ffffff', boxShadow: '0 0 4px rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'absolute', left: -6, top: 0, width: 12, height: 10, background: '#ffffff', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
      </div>
    </div>
  );
}

const Filtre = ({
  mediaSrc,
  onBack,
  onApply,
  selectedOptionModal,
  setSelectedOptionModal,
  setVeoVideoOperation,
  prompt,
  setPrompt,
  handleGenerate,
  initialTool,
  colorSettings: colorSettingsProp,
  setColorSettings: setColorSettingsProp,
  uploadResult, // optionnel : async (result, { onProgress, settings, meta }) => ({ url, storagePath?, docId? }) — envoi vers votre stockage (voir firebaseUpload.js)
  looks: looksProp, // optionnel : looks enregistrés par l'application (compte utilisateur)
  onLooksChange // optionnel : (looks) => void, appelé à chaque changement
}) => {
  // ---------- État ----------
  const [localColor, setLocalColor] = useState({ ...DEFAULT_COLOR_SETTINGS });
  const controlled = Boolean(colorSettingsProp) && typeof setColorSettingsProp === 'function';
  const rawColor = controlled ? colorSettingsProp : localColor;
  const setColorRaw = controlled ? setColorSettingsProp : setLocalColor;
  const colorSettings = useMemo(() => ({ ...DEFAULT_COLOR_SETTINGS, ...(rawColor || {}) }), [rawColor]);

  const [selectedFilter, setSelectedFilter] = useState(PRESET_FILTERS[0]);
  const [intensity, setIntensity] = useState(100);
  const [comparePosition, setComparePosition] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [exportError, setExportError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [exportQuality, setExportQuality] = useState('high');
  const [imageFormat, setImageFormat] = useState('png');

  const [activeTool, setActiveTool] = useState(initialTool || 'filters');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [selectedAIOption, setSelectedAIOption] = useState(null);
  const [advancedTab, setAdvancedTab] = useState('curves');
  const [activeBand, setActiveBand] = useState('red');
  const [pipetteMode, setPipetteMode] = useState(null); // null | 'hsl' | 'wb'
  const isEyedropperActive = pipetteMode !== null;
  const setIsEyedropperActive = (v) => setPipetteMode(v ? (typeof v === 'string' ? v : 'hsl') : null);
  const [scopeMode, setScopeMode] = useState('hist');
  const [hoverFilter, setHoverFilter] = useState(null);
  const [filmId, setFilmId] = useState('none');
  const [filmAmount, setFilmAmount] = useState(100);
  const [lut, setLut] = useState(null);
  const [lutAmount, setLutAmount] = useState(100);
  const [localLooks, setLocalLooks] = useState(loadLooks);
  const looksControlled = Array.isArray(looksProp) && typeof onLooksChange === 'function';
  const customLooks = looksControlled ? looksProp : localLooks;
  // Si l'application fournit `looks` + `onLooksChange`, les looks sont stockés chez elle
  // (base de données, compte) ; sinon ils restent dans ce navigateur.
  const commitLooks = (next) => {
    if (looksControlled) onLooksChange(next);
    else { setLocalLooks(next); persistLooks(next); }
  };
  const [lookName, setLookName] = useState('');

  // Performance, confort, historique
  const cores = useMemo(() => detectCores(), []);
  const perfSaved = useMemo(() => loadPerf(), []);
  const [perfEnabled, setPerfEnabled] = useState(perfSaved.enabled);
  const [threads, setThreads] = useState(perfSaved.threads);
  const [previewQuality, setPreviewQuality] = useState(perfSaved.previewQuality);
  const [poolStatus, setPoolStatus] = useState('off'); // 'off' | 'ready' | 'fallback'
  const [previewMs, setPreviewMs] = useState(0);
  const [exportResolution, setExportResolution] = useState('original');
  const [exportEta, setExportEta] = useState('');
  const lastResultRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null); // null | 0..1
  const [hasLastResult, setHasLastResult] = useState(false);
  const [showClipping, setShowClipping] = useState(false);
  const [gridMode, setGridMode] = useState('off');
  const [showOriginal, setShowOriginal] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);

  // Découpe de la vidéo, son de l'aperçu, détection automatique
  const [segments, setSegments] = useState([]);
  const [selectedSegId, setSelectedSegId] = useState(null);
  const [sceneProgress, setSceneProgress] = useState(null); // null | 0..1
  const [soundOn, setSoundOn] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [thumbs, setThumbs] = useState([]);
  const thumbsKeyRef = useRef('');
  const [sceneInfo, setSceneInfo] = useState(null);
  const [matchData, setMatchData] = useState(null); // { name, refStats }
  const [matchAmount, setMatchAmount] = useState(80);
  const [matchLuts, setMatchLuts] = useState(null);
  const [sampledColor, setSampledColor] = useState('#00b4d8');

  // ---------- Références ----------
  const mediaRef = useRef(null);
  const canvasRef = useRef(null);
  const histRef = useRef(null);
  const compareBoxRef = useRef(null);
  const isDraggingCompare = useRef(false);
  const rafRef = useRef(0);
  const planRef = useRef(null);
  const commitPlanRef = useRef(null);
  const scopeModeRef = useRef('hist');
  const lutFileRef = useRef(null);
  const poolRef = useRef(null);
  const previewBusyRef = useRef(false);
  const previewDirtyRef = useRef(false);
  const showClippingRef = useRef(false);
  const previewQualityRef = useRef('standard');
  const lastMsRef = useRef(0);
  const historyRef = useRef({ stack: [], index: -1 });
  const shortcutRef = useRef(null);
  const segmentsRef = useRef([]);
  const segmentsKeyRef = useRef('');
  const matchFileRef = useRef(null);
  const sceneStopRef = useRef(false);
  const audioNoticeRef = useRef('');
  const looksFileRef = useRef(null);
  const cancelExportRef = useRef(false);
  const pendingUrlRef = useRef(null);

  // ---------- Média ----------
  const activeMedia = mediaSrc || FALLBACK_MEDIA;
  const isVideo = useMemo(
    () =>
      typeof activeMedia === 'string' &&
      (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(activeMedia) ||
        activeMedia.startsWith('data:video/') ||
        (activeMedia.startsWith('http') && !/\.(jpg|jpeg|png|webp|gif)(\?|#|$)/i.test(activeMedia))),
    [activeMedia]
  );

  // ---------- Réglages → plan d'étalonnage ----------
  const film = useMemo(() => FILM_STOCKS.find((f) => f.id === filmId) || FILM_STOCKS[0], [filmId]);
  const extras = useMemo(
    () => ({ film, filmAmount, lut, lutAmount, match: matchLuts ? { luts: matchLuts } : null, matchAmount }),
    [film, filmAmount, lut, lutAmount, matchLuts, matchAmount]
  );
  const adjustments = useMemo(
    () => resolveAdjustments(selectedFilter, intensity, colorSettings, extras),
    [selectedFilter, intensity, colorSettings, extras]
  );
  const plan = useMemo(() => prepareGrade(adjustments), [adjustments]);
  // Nombre de réglages de l'onglet Couleur encore actifs (pour avertir dans l'onglet Filtre).
  const colorActiveCount = useMemo(
    () => Object.keys(DEFAULT_COLOR_SETTINGS).filter((k) => colorSettings[k] !== DEFAULT_COLOR_SETTINGS[k]).length,
    [colorSettings]
  );
  // Aperçu au survol d'un preset (l'export utilise toujours `plan`).
  const previewPlan = useMemo(
    () =>
      hoverFilter && hoverFilter.id !== selectedFilter.id
        ? prepareGrade(resolveAdjustments(hoverFilter, 100, colorSettings, extras))
        : plan,
    [hoverFilter, selectedFilter.id, colorSettings, extras, plan]
  );

  const updateColor = useCallback(
    (patch) => {
      setColorRaw((prev) => ({ ...DEFAULT_COLOR_SETTINGS, ...(prev || {}), ...patch }));
      setExportError('');
      setSaveMessage('');
    },
    [setColorRaw]
  );

  // ---------- Historique (annuler / rétablir) ----------
  const snapshot = useMemo(
    () => ({ colorSettings, filterId: selectedFilter.id, intensity, filmId, filmAmount, lutAmount, segments }),
    [colorSettings, selectedFilter.id, intensity, filmId, filmAmount, lutAmount, segments]
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      const h = historyRef.current;
      const key = JSON.stringify(snapshot);
      if (h.index >= 0 && JSON.stringify(h.stack[h.index]) === key) return;
      const parsed = JSON.parse(key);
      const last = h.stack[h.index];
      // Création initiale des sections : on remplace l'entrée vide au lieu d'ajouter une étape à annuler.
      if (last && (!last.segments || last.segments.length === 0) && parsed.segments.length > 0 &&
          JSON.stringify({ ...last, segments: [] }) === JSON.stringify({ ...parsed, segments: [] })) {
        h.stack[h.index] = parsed;
        return;
      }
      h.stack = h.stack.slice(0, h.index + 1);
      h.stack.push(parsed);
      if (h.stack.length > 60) h.stack.shift();
      h.index = h.stack.length - 1;
      setHistoryTick((t) => t + 1);
    }, 350);
    return () => clearTimeout(timer);
  }, [snapshot]);

  const applySnapshot = (snap) => {
    setColorRaw(sanitizeColorSettings(snap.colorSettings));
    setSelectedFilter(PRESET_FILTERS.find((p) => p.id === snap.filterId) || PRESET_FILTERS[0]);
    setIntensity(snap.intensity);
    setFilmId(snap.filmId);
    setFilmAmount(snap.filmAmount);
    setLutAmount(snap.lutAmount);
    if (Array.isArray(snap.segments) && snap.segments.length) setSegments(snap.segments);
  };
  const undo = () => {
    const h = historyRef.current;
    if (h.index > 0) { h.index -= 1; applySnapshot(h.stack[h.index]); setHistoryTick((t) => t + 1); }
  };
  const redo = () => {
    const h = historyRef.current;
    if (h.index < h.stack.length - 1) { h.index += 1; applySnapshot(h.stack[h.index]); setHistoryTick((t) => t + 1); }
  };
  const canUndo = historyRef.current.index > 0 && historyTick >= 0;
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1 && historyTick >= 0;

  // ---------- Effets de base ----------
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => { if (initialTool) setActiveTool(initialTool); }, [initialTool]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
  }, []);

  segmentsRef.current = segments;

  // Une nouvelle vidéo (ou durée) : le montage repart d'une seule section.
  useEffect(() => {
    if (!isVideo || !(duration > 0)) return;
    const key = `${activeMedia}:${duration.toFixed(2)}`;
    if (segmentsKeyRef.current === key) return;
    segmentsKeyRef.current = key;
    setSegments(createSegments(duration));
    setSelectedSegId(null);
  }, [isVideo, duration, activeMedia]);

  // Quand la découpe change, la tête de lecture ne doit jamais rester dans une zone supprimée.
  useEffect(() => {
    const video = mediaRef.current;
    if (!isVideo || !video || !segments.length) return;
    const jump = playbackJump(segments, video.currentTime);
    if (jump !== undefined && Math.abs(jump - video.currentTime) > 0.02) {
      video.currentTime = jump;
      setCurrentTime(jump);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // Vignettes des clips (une seule fois par vidéo, uniquement dans l'onglet Filtre).
  useEffect(() => {
    if (!isVideo || !(duration > 0) || activeTool !== 'filters') return undefined;
    const key = `${activeMedia}:${duration.toFixed(2)}`;
    if (thumbsKeyRef.current === key) return undefined;
    let stop = false;
    generateThumbnails(activeMedia, duration, { count: 24, height: 58, shouldStop: () => stop }).then((list) => {
      if (stop) return;
      thumbsKeyRef.current = key;
      setThumbs(list);
    });
    return () => { stop = true; };
  }, [isVideo, duration, activeMedia, activeTool]);

  // ---------- Aperçu étalonné (canvas) ----------
  const drawGradedPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const src = mediaRef.current;
    if (!canvas || !src) return;
    const sw = isVideo ? src.videoWidth : src.naturalWidth;
    const sh = isVideo ? src.videoHeight : src.naturalHeight;
    if (!sw || !sh || (isVideo && src.readyState < 2)) return;

    const pool = poolRef.current;
    const plan = planRef.current;
    const useWorkers = Boolean(pool && !pool.failed && plan && !plan.identity);
    // Les workers travaillent en arrière-plan : on saute les images si ils sont occupés.
    if (useWorkers && previewBusyRef.current) { previewDirtyRef.current = true; return; }

    const maxSide = PREVIEW_SIDES[previewQualityRef.current] || PREVIEW_SIDES.standard;
    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const cw = Math.max(2, Math.round(sw * scale));
    const ch = Math.max(2, Math.round(sh * scale));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, cw, ch);

    let frame;
    try {
      frame = ctx.getImageData(0, 0, cw, ch);
    } catch (error) {
      console.error('Aperçu étalonné impossible :', error);
      setPreviewError('Aperçu précis indisponible : le média doit autoriser CORS.');
      return;
    }
    const seed = isVideo ? Math.floor(src.currentTime * 24) : 0;
    const t0 = performance.now();

    const finish = () => {
      lastMsRef.current = performance.now() - t0;
      drawScope(histRef.current, frame, scopeModeRef.current);
      if (showClippingRef.current) applyClippingOverlay(frame.data);
      ctx.putImageData(frame, 0, 0);
      setPreviewError((prev) => (prev ? '' : prev));
    };

    if (!useWorkers) {
      processImageData(frame, plan, seed);
      finish();
      return;
    }

    previewBusyRef.current = true;
    pool
      .processFrame(frame, seed)
      .catch((error) => {
        console.warn('Workers indisponibles, retour au thread principal :', error);
        poolRef.current = null;
        setPoolStatus('fallback');
        processImageData(frame, plan, seed); // `frame` n'a pas été modifié par le pool
      })
      .then(() => {
        if (canvasRef.current === canvas) finish();
      })
      .finally(() => {
        previewBusyRef.current = false;
        if (previewDirtyRef.current) {
          previewDirtyRef.current = false;
          scheduleDrawRef.current?.();
        }
      });
  }, [isVideo]);

  const scheduleDrawRef = useRef(null);
  const scheduleDraw = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      drawGradedPreview();
    });
  }, [drawGradedPreview]);
  scheduleDrawRef.current = scheduleDraw;

  // Pool de workers de l'aperçu (recréé quand l'option ou le nombre de threads change).
  useEffect(() => {
    previewBusyRef.current = false;
    previewDirtyRef.current = false;
    if (!perfEnabled || !workersSupported() || threads < 1) {
      poolRef.current = null;
      setPoolStatus('off');
      return undefined;
    }
    let pool = null;
    try {
      pool = new GradePool(threads);
      if (planRef.current) pool.setPlan(planRef.current);
      poolRef.current = pool;
      setPoolStatus('ready');
    } catch (error) {
      console.warn('Impossible de créer les workers :', error);
      poolRef.current = null;
      setPoolStatus('fallback');
    }
    scheduleDraw();
    return () => {
      poolRef.current = null;
      pool?.terminate();
    };
  }, [perfEnabled, threads, scheduleDraw]);

  useEffect(() => {
    persistPerf({ enabled: perfEnabled, threads, previewQuality });
  }, [perfEnabled, threads, previewQuality]);

  useEffect(() => {
    showClippingRef.current = showClipping;
    previewQualityRef.current = previewQuality;
    scheduleDraw();
  }, [showClipping, previewQuality, scheduleDraw]);

  // Temps de traitement affiché (mis à jour 1 fois par seconde environ).
  useEffect(() => {
    const timer = setInterval(() => setPreviewMs(Math.round(lastMsRef.current)), 900);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    planRef.current = previewPlan;
    poolRef.current?.setPlan(previewPlan);
    commitPlanRef.current = plan;
    scheduleDraw();
  }, [previewPlan, plan, scheduleDraw, activeTool, isInspectorOpen]);

  useEffect(() => {
    scopeModeRef.current = scopeMode;
    scheduleDraw();
  }, [scopeMode, scheduleDraw]);

  // Lecture vidéo : on redessine à chaque image réellement décodée.
  useEffect(() => {
    if (!isVideo) return undefined;
    const video = mediaRef.current;
    if (!video) return undefined;
    let stopped = false;
    let handle = 0;
    const hasVfc = typeof video.requestVideoFrameCallback === 'function';

    const loop = () => {
      if (stopped) return;
      const step = () => {
        if (stopped) return;
        const jump = playbackJump(segmentsRef.current, video.currentTime);
        if (jump !== undefined) video.currentTime = jump;
        drawGradedPreview();
        if (!video.paused && !video.ended) loop();
      };
      handle = hasVfc ? video.requestVideoFrameCallback(step) : requestAnimationFrame(step);
    };
    const onPlay = () => { setIsPlaying(true); loop(); };
    const onPause = () => { setIsPlaying(false); scheduleDraw(); };
    const onSeeked = () => { setCurrentTime(video.currentTime); scheduleDraw(); };
    const onTime = () => setCurrentTime(video.currentTime);
    const onMeta = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration);
      scheduleDraw();
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('loadeddata', onMeta);
    if (video.readyState >= 1 && Number.isFinite(video.duration)) setDuration(video.duration);
    if (video.readyState >= 2) scheduleDraw();
    setIsPlaying(!video.paused);
    if (!video.paused) loop();

    return () => {
      stopped = true;
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('loadeddata', onMeta);
      if (hasVfc && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(handle);
      else cancelAnimationFrame(handle);
    };
  }, [isVideo, activeMedia, activeTool, isInspectorOpen, drawGradedPreview, scheduleDraw]);

  // ---------- Son de l'aperçu ----------
  useEffect(() => {
    const video = mediaRef.current;
    if (video && isVideo) {
      video.muted = !soundOn;
      video.volume = 1;
    }
  }, [soundOn, isVideo, activeTool, isInspectorOpen]);

  // ---------- Actions ----------
  const togglePlay = async () => {
    const video = mediaRef.current;
    if (!isVideo || !video) return;
    try {
      if (video.paused) await video.play();
      else video.pause();
    } catch (error) {
      console.error('Erreur lecture vidéo :', error);
    }
  };

  const seekTo = (value) => {
    const video = mediaRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleSelectFilter = (filter) => {
    setActiveTool('filters');
    setSelectedFilter(filter);
    setIntensity(100);
    setExportError('');
    setSaveMessage('');
    setSelectedOptionModal?.(null);
  };

  // Remet TOUT à zéro : preset, pellicule, LUT et réglages de l'onglet Couleur.
  const handleFiltersReset = () => {
    setSelectedFilter(PRESET_FILTERS[0]);
    setIntensity(100);
    setFilmId('none');
    setFilmAmount(100);
    setLut(null);
    setLutAmount(100);
    setHoverFilter(null);
    setColorRaw({ ...DEFAULT_COLOR_SETTINGS });
    resetEdit();
    setExportError('');
    setSaveMessage('Tous les réglages et la découpe ont été réinitialisés.');
  };

  const resetKeys = (sliders) =>
    updateColor(Object.fromEntries(sliders.map(([, key]) => [key, 0])));

  const handleColorReset = () => {
    setColorRaw({ ...DEFAULT_COLOR_SETTINGS });
    setExportError('');
    setSaveMessage('');
  };

  const handleAIReset = () => {
    setSelectedAIOption(null);
    setPrompt?.('');
  };

  // Récupère l'image courante du média original, réduite (analyse / pipette).
  const grabFrame = (maxSide) => {
    const src = mediaRef.current;
    if (!src) throw new Error('Aucun média disponible.');
    const sw = isVideo ? src.videoWidth : src.naturalWidth;
    const sh = isVideo ? src.videoHeight : src.naturalHeight;
    if (!sw || !sh) throw new Error('Le média n’est pas encore chargé.');
    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas non disponible.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const runAuto = (group, message) => {
    try {
      const frame = grabFrame(320);
      const result = analyzeAutoCorrection(frame.data);
      if (!result) throw new Error('Impossible d’analyser les pixels du média.');
      const patch = {};
      AUTO_GROUPS[group].forEach((key) => { if (key in result) patch[key] = result[key]; });
      updateColor(patch);
      setSaveMessage(message);
    } catch (error) {
      console.error('Correction automatique impossible :', error);
      setExportError(error?.message || 'La correction automatique a échoué. Vérifiez que le média est accessible.');
    }
  };

  const handleAutoColorCorrection = () =>
    runAuto('all', 'Correction automatique appliquée. Affinez avec les curseurs.');

  const applyPalette = (palette) => {
    updateColor(palette.patch);
    setSaveMessage(`Palette « ${palette.name} » appliquée.`);
  };

  // ---------- Découpe (frise) ----------
  const finalDuration = keptDuration(segments);
  const keptSegs = segments.filter((s) => !s.removed);
  const liveTime = () => (isVideo && mediaRef.current ? mediaRef.current.currentTime : currentTime);
  const getVideoTime = useCallback(() => (mediaRef.current ? mediaRef.current.currentTime : 0), []);
  const clipAt = (t) => segmentsRef.current.find((s) => !s.removed && t >= s.start - 1e-6 && t <= s.end + 1e-6) || null;

  const doSplit = () => {
    const next = splitAt(segmentsRef.current, liveTime());
    if (next === segmentsRef.current) { setExportError('Impossible de couper ici (trop près d’un bord ou d’une coupure existante).'); return; }
    setSegments(next);
    setExportError('');
    setSaveMessage('Vidéo coupée. Cliquez sur une partie puis appuyez sur Suppr pour la supprimer.');
  };

  // Supprime la section sélectionnée (ou celle sous la tête de lecture) : le vide se referme.
  const doDeleteSelected = () => {
    const list = segmentsRef.current.filter((s) => !s.removed);
    if (list.length <= 1) { setExportError('Impossible de supprimer la dernière section de la vidéo.'); return; }
    const target = (selectedSegId && list.find((s) => s.id === selectedSegId)) || clipAt(liveTime());
    if (!target) return;
    const idx = list.findIndex((s) => s.id === target.id);
    const after = list[idx + 1] || null;
    const before = list[idx - 1] || null;
    setSegments((prev) => toggleRemoved(prev, target.id));
    setSelectedSegId(after ? after.id : before ? before.id : null);
    seekTo(after ? after.start : Math.max(0, before.end - 0.05));
    setExportError('');
    setSaveMessage('Section supprimée, le vide s’est refermé. Ctrl+Z pour annuler.');
  };

  // Supprime ce qui est à gauche / à droite de la tête de lecture, dans la section courante.
  const doDeleteSide = (side) => {
    const t = liveTime();
    const clip = clipAt(t);
    if (!clip) return;
    const next = side === 'left' ? removeRange(segmentsRef.current, clip.start, t) : removeRange(segmentsRef.current, t, clip.end);
    if (next === segmentsRef.current) { setExportError('Rien à supprimer ici : placez la tête de lecture à l’intérieur d’une section.'); return; }
    setSegments(next);
    setExportError('');
    if (side === 'right') seekTo(Math.max(clip.start, t - 0.04));
  };

  // Image par image (1/30 s) ou seconde par seconde (Maj), en sautant les zones supprimées.
  const stepTime = (dir, big) => {
    const list = segmentsRef.current;
    const kept = list.filter((s) => !s.removed);
    if (!kept.length) return;
    let t = liveTime() + (big ? 1 : 1 / 30) * dir;
    t = clamp(t, kept[0].start, kept[kept.length - 1].end - 0.001);
    const hit = list.find((s) => t >= s.start && t < s.end);
    if (hit && hit.removed) {
      if (dir > 0) { const nxt = kept.find((s) => s.start >= hit.end - 1e-6); if (nxt) t = nxt.start; }
      else { const prv = [...kept].reverse().find((s) => s.end <= hit.start + 1e-6); if (prv) t = prv.end - 1 / 60; }
    }
    seekTo(clamp(t, 0, Math.max(0, duration - 0.001)));
  };

  const resetEdit = () => { setSegments(createSegments(duration)); setSelectedSegId(null); seekTo(0); };

  const runSceneDetect = async () => {
    if (!isVideo || !(duration > 0)) return;
    sceneStopRef.current = false;
    setSceneProgress(0);
    setExportError('');
    try {
      const cuts = await detectSceneCuts(activeMedia, duration, {
        onProgress: setSceneProgress,
        shouldStop: () => sceneStopRef.current
      });
      setSegments((prev) => cuts.reduce((acc, t) => splitAt(acc, t), prev));
      setSaveMessage(cuts.length ? `${cuts.length} changement(s) de plan détecté(s) : la vidéo est découpée. Sélectionnez une section pour la supprimer.` : 'Aucun changement de plan détecté.');
    } catch (error) {
      console.error('Détection des scènes impossible :', error);
      setExportError(error?.message || 'Détection des scènes impossible (la vidéo doit autoriser CORS).');
    } finally {
      setSceneProgress(null);
    }
  };

  // ---------- Capture d'écran (téléchargement PNG) ----------
// ---------- Capture d'écran vers le moteur IA ----------
  const captureFrame = async () => {
    const src = mediaRef.current;
    if (!src) {
      setExportError('Ouvrez un onglet avec l’aperçu pour capturer une image.');
      return;
    }
    try {
      let w = isVideo ? src.videoWidth : src.naturalWidth;
      let h = isVideo ? src.videoHeight : src.naturalHeight;
      if (!w || !h) throw new Error('Le média n’est pas encore chargé.');
      
      if (w * h > MAX_IMAGE_PIXELS) { 
        const k = Math.sqrt(MAX_IMAGE_PIXELS / (w * h)); 
        w = Math.floor(w * k); 
        h = Math.floor(h * k); 
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = w; 
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, w, h);
      
      // Applique les filtres et l'étalonnage en cours sur l'image capturée
      const plan = commitPlanRef.current;
      if (plan && !plan.identity) {
        const frame = ctx.getImageData(0, 0, w, h);
        processImageData(frame, plan, 0);
        ctx.putImageData(frame, 0, 0);
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const time = isVideo ? src.currentTime : 0;

      const resultObject = {
        blob,
        url: dataUrl,
        mimeType: 'image/png',
        fileName: `capture-${fmtTime(time).replace(':', 'm')}s.png`,
        type: 'IMAGE',
        colorGradingBakedIn: true
      };

      // Si une fonction onApply est fournie par le parent, on lui envoie l'image et on ferme l'éditeur
      if (typeof onApply === 'function') {
        const stored = await persistResult(resultObject, { meta: { filterName: selectedFilter.name, originalUrl: activeMedia } });
        await onApply({ ...resultObject, ...stored });
        setSaveMessage('Image capturée et transmise au moteur IA.');
        setTimeout(() => {
          closeInspector();
        }, 500);
      } else {
        // Fallback : si aucun parent n'écoute, on garde le téléchargement classique
        downloadBlob(blob, resultObject.fileName);
        setSaveMessage(`Capture téléchargée (${fmtTime(time)}).`);
      }

      setExportError('');
    } catch (error) {
      console.error('Capture impossible :', error);
      setExportError(error?.message || 'Capture impossible (le média doit autoriser CORS).');
    }
  };

  // ---------- Détection automatique (scène, couleur de référence) ----------
  const analyzeScene = () => {
    try {
      const frame = grabFrame(320);
      setSceneInfo(detectScene(frame.data));
      setExportError('');
    } catch (error) {
      setExportError(error?.message || 'Analyse impossible.');
    }
  };
  const applyScenePatch = () => {
    if (!sceneInfo) return;
    updateColor(sceneInfo.patch);
    setSaveMessage('Corrections suggérées appliquées. Ajustez-les avec les curseurs.');
  };
  const applyScenePreset = () => {
    const preset = PRESET_FILTERS.find((p) => p.id === sceneInfo?.presetId);
    if (preset) { setSelectedFilter(preset); setIntensity(70); setSaveMessage(`Preset « ${preset.name} » appliqué à 70 %.`); }
  };
  const computeMatch = (refStats, name) => {
    const srcStats = channelStats(grabFrame(320).data);
    setMatchLuts(buildMatchLuts(srcStats, refStats));
    setMatchData({ name, refStats });
  };
  const importMatchImage = async (file) => {
    try {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('Image illisible.')); img.src = url; });
      const s = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.naturalWidth * s)); cv.height = Math.max(1, Math.round(img.naturalHeight * s));
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      computeMatch(channelStats(cx.getImageData(0, 0, cv.width, cv.height).data), file.name);
      setExportError('');
      setSaveMessage(`Couleurs de « ${file.name} » copiées sur votre média. Réglez la force avec le curseur.`);
    } catch (error) {
      setExportError(error?.message || 'Impossible de copier les couleurs de cette image.');
    }
  };

  // ---------- Looks, LUT ----------
  const saveCurrentLook = () => {
    const name = lookName.trim() || `Look ${customLooks.length + 1}`;
    const look = { id: `look-${Date.now()}`, name, presetId: selectedFilter.id, intensity, filmId, filmAmount, colorSettings: { ...colorSettings } };
    const next = [look, ...customLooks].slice(0, MAX_SAVED_LOOKS);
    commitLooks(next);
    setLookName('');
    setSaveMessage(`Look « ${name} » enregistré.`);
  };

  const applyLook = (look) => {
    setSelectedFilter(PRESET_FILTERS.find((p) => p.id === look.presetId) || PRESET_FILTERS[0]);
    setIntensity(clamp(Number.isFinite(Number(look.intensity)) ? Number(look.intensity) : 100, 0, 100));
    setFilmId(FILM_STOCKS.some((f) => f.id === look.filmId) ? look.filmId : 'none');
    setFilmAmount(clamp(Number.isFinite(Number(look.filmAmount)) ? Number(look.filmAmount) : 100, 0, 100));
    setColorRaw(sanitizeColorSettings(look.colorSettings));
    setExportError('');
    setSaveMessage(`Look « ${look.name} » appliqué.`);
  };

  const deleteLook = (id) => {
    const next = customLooks.filter((l) => l.id !== id);
    commitLooks(next);
  };

  // Fige le look actuel en LUT 3D (.cube), lisible par DaVinci Resolve, Premiere, etc.
  // Vignettage, grain, flous et lueur dépendent de l'image : ils ne peuvent pas être figés.
  const exportCubeLut = () => {
    const current = commitPlanRef.current;
    if (!current || current.identity) {
      setExportError('Aucun réglage à exporter : modifiez d’abord un filtre ou une couleur.');
      return;
    }
    const N = 33;
    const total = N * N * N;
    const lutPlan = { ...current, vignette: 0, grain: 0, sharpness: 0, clarity: 0, denoise: 0, skinSmooth: 0, bloom: 0, global: false, noDither: true };
    const data = new Uint8ClampedArray(total * 4);
    for (let b = 0, k = 0; b < N; b++) {
      for (let g = 0; g < N; g++) {
        for (let r = 0; r < N; r++, k += 4) {
          data[k] = Math.round((r / (N - 1)) * 255);
          data[k + 1] = Math.round((g / (N - 1)) * 255);
          data[k + 2] = Math.round((b / (N - 1)) * 255);
          data[k + 3] = 255;
        }
      }
    }
    processImageData({ data, width: total, height: 1 }, lutPlan, 0);
    const lines = [`TITLE "${(lookName.trim() || selectedFilter.name || 'Look').replace(/"/g, '')}"`, `LUT_3D_SIZE ${N}`, 'DOMAIN_MIN 0.0 0.0 0.0', 'DOMAIN_MAX 1.0 1.0 1.0'];
    for (let k = 0; k < data.length; k += 4) {
      lines.push(`${(data[k] / 255).toFixed(6)} ${(data[k + 1] / 255).toFixed(6)} ${(data[k + 2] / 255).toFixed(6)}`);
    }
    downloadBlob(new Blob([`${lines.join('\n')}\n`], { type: 'text/plain' }), `look-${Date.now()}.cube`);
    setSaveMessage('LUT .cube exportée. Vignettage, grain, flous et lueur ne sont pas inclus.');
  };

  const exportLooks = () => {
    const blob = new Blob([JSON.stringify({ format: 'ovx-looks', version: 1, looks: customLooks }, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'mes-looks.json');
  };

  const importLooks = async (file) => {
    try {
      if (!file || file.size > 2_000_000) throw new Error('Fichier trop volumineux.');
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : parsed?.looks;
      if (!Array.isArray(list)) throw new Error('Format inconnu.');
      const imported = list
        .filter((l) => l && typeof l.name === 'string' && l.colorSettings && typeof l.colorSettings === 'object')
        .map((l, k) => ({
          id: `look-${Date.now()}-${k}`,
          name: String(l.name).slice(0, 60),
          presetId: String(l.presetId || 'none'),
          intensity: num(l.intensity) || 100,
          filmId: String(l.filmId || 'none'),
          filmAmount: Number.isFinite(Number(l.filmAmount)) ? Number(l.filmAmount) : 100,
          colorSettings: sanitizeColorSettings(l.colorSettings)
        }));
      if (!imported.length) throw new Error('Aucun look valide dans ce fichier.');
      const next = [...imported, ...customLooks].slice(0, MAX_SAVED_LOOKS);
      commitLooks(next);
      setSaveMessage(`${imported.length} look(s) importé(s).`);
    } catch (error) {
      setExportError(error?.message ? `Import impossible : ${error.message}` : 'Fichier de looks invalide.');
    }
  };

  const importLut = async (file) => {
    try {
      if (!file) return;
      if (file.size > 40_000_000) throw new Error('LUT trop volumineuse (40 Mo max).');
      const parsed = parseCubeLut(await file.text());
      setLut({ ...parsed, name: file.name });
      setLutAmount(100);
      setExportError('');
      setSaveMessage(`LUT « ${file.name} » chargée.`);
    } catch (error) {
      setExportError(error?.message || 'Impossible de lire cette LUT.');
    }
  };

  // ---------- Pointeur : comparaison + pipette ----------
  const updateCompare = (clientX) => {
    const box = compareBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    if (!rect.width) return;
    setComparePosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  const pickColorAt = (e) => {
    const src = mediaRef.current;
    if (!src) return;
    const sw = isVideo ? src.videoWidth : src.naturalWidth;
    const sh = isVideo ? src.videoHeight : src.naturalHeight;
    if (!sw || !sh) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Le média est affiché en « contain » : on retire les bandes noires.
    const scale = Math.min(rect.width / sw, rect.height / sh);
    const dw = sw * scale, dh = sh * scale;
    const u = (e.clientX - rect.left - (rect.width - dw) / 2) / dw;
    const v = (e.clientY - rect.top - (rect.height - dh) / 2) / dh;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;
    try {
      const c = document.createElement('canvas');
      c.width = 5; c.height = 5;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(src, Math.round(u * sw) - 2, Math.round(v * sh) - 2, 5, 5, 0, 0, 5, 5);
      const d = ctx.getImageData(0, 0, 5, 5).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      r = Math.round(r / 25); g = Math.round(g / 25); b = Math.round(b / 25);
      const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
      setSampledColor(hex);
      if (pipetteMode === 'wb') {
        // Le point choisi doit devenir neutre : on calcule température et teinte à compenser.
        const lr = Math.max(0.002, SRGB_TO_LINEAR[r]), lg = Math.max(0.002, SRGB_TO_LINEAR[g]), lb = Math.max(0.002, SRGB_TO_LINEAR[b]);
        const targetTemp = Math.round((100 * Math.log2(lb / lr)) / 0.8);
        const targetTint = Math.round((-100 * Math.log2((lr + lb) / 2 / lg)) / 0.25);
        updateColor({
          temperature: clamp(targetTemp - (adjustments.temperature - num(colorSettings.temperature)), -100, 100),
          tint: clamp(targetTint - (adjustments.tint - num(colorSettings.tint)), -100, 100)
        });
        setSaveMessage('Balance des blancs réglée sur le point choisi.');
      } else {
        const hue = hexToHue(hex);
        let best = HSL_BANDS[0];
        HSL_BANDS.forEach((band) => { if (hueDistance(hue, band.center) < hueDistance(hue, best.center)) best = band; });
        setActiveBand(best.id);
        setAdvancedTab('hsl');
      }
      setIsEyedropperActive(false);
    } catch (error) {
      console.error('Pipette impossible :', error);
      setExportError('Impossible de lire la couleur (le média doit autoriser CORS).');
      setIsEyedropperActive(false);
    }
  };

  const onCompareDown = (e) => {
    if (isEyedropperActive) { pickColorAt(e); return; }
    isDraggingCompare.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateCompare(e.clientX);
  };
  const onCompareMove = (e) => { if (isDraggingCompare.current) updateCompare(e.clientX); };
  const onCompareUp = () => { isDraggingCompare.current = false; };

  // ---------- Export ----------
  const setPendingUrl = (url) => {
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    pendingUrlRef.current = url;
  };

  // Crée un pool de workers dédié à l'export (arrêté à la fin), ou null.
  const createExportPool = (exportPlan) => {
    if (!perfEnabled || !workersSupported() || exportPlan.identity) return null;
    try {
      const pool = new GradePool(Math.max(1, threads));
      pool.setPlan(exportPlan);
      return pool;
    } catch (error) {
      console.warn('Export sans workers :', error);
      return null;
    }
  };

const exportImage = async () => {
    setIsExporting(true);
    setExportError('');
    setExportProgress(0);
    setExportEta('');
    const exportPlan = commitPlanRef.current;
    const fmt = IMAGE_FORMATS[imageFormat] || IMAGE_FORMATS.png;
    let pool = null;
    try {
      const src = mediaRef.current;
      if (!src) throw new Error('Aucun média disponible.');

      let width = src.naturalWidth || 1920;
      let height = src.naturalHeight || 1080;
      if (!width || !height) throw new Error('L’image n’est pas encore chargée.');

      if (exportResolution !== 'original') {
        const targetH = Number(exportResolution);
        if (height > targetH) { width = Math.round((width * targetH) / height); height = targetH; }
      }
      if (width * height > MAX_IMAGE_PIXELS) {
        const k = Math.sqrt(MAX_IMAGE_PIXELS / (width * height));
        width = Math.floor(width * k);
        height = Math.floor(height * k);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas non disponible.');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (fmt.mime === 'image/jpeg') { 
        ctx.fillStyle = '#fff'; 
        ctx.fillRect(0, 0, width, height); 
      }

      // 1. On dessine l'image source aux dimensions cibles
      ctx.drawImage(src, 0, 0, width, height);

      // 2. On applique physiquement les modifications de filtres et de couleurs (le "baking")
      if (exportPlan && !exportPlan.identity) {
        const frame = ctx.getImageData(0, 0, width, height);
        pool = createExportPool(exportPlan);
        if (pool) {
          try {
            await pool.processFrame(frame, 0);
          } catch (poolError) {
            console.warn('Workers en échec, traitement sur le thread principal :', poolError);
            processImageData(frame, exportPlan, 0);
          }
        } else {
          processImageData(frame, exportPlan, 0);
        }
        ctx.putImageData(frame, 0, 0);
      }

      // 3. Conversion propre en Blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('Impossible de créer l’image.'))),
          fmt.mime,
          fmt.quality
        );
      });

      const url = URL.createObjectURL(blob);
      setPendingUrl(url);
      setExportProgress(1);

      return {
        blob,
        url,
        mimeType: fmt.mime,
        fileName: `filtre-${Date.now()}.${fmt.ext}`,
        type: 'IMAGE',
        colorGradingBakedIn: true
      };
    } catch (error) {
      console.error('Erreur export image :', error);
      setExportError(error?.message || 'Impossible de générer l’image filtrée.');
      throw error;
    } finally {
      pool?.terminate();
      setIsExporting(false);
    }
  };
  const exportVideo = async () => {
    setIsExporting(true);
    setExportError('');
    setExportProgress(0);
    setExportEta('');
    cancelExportRef.current = false;
    const exportPlan = commitPlanRef.current;
    const startedAt = performance.now();
    let output = null;
    let videoSource = null;
    let audioSource = null;
    let pool = null;
    let finalized = false;
    let aborted = false;

    try {
      const response = await fetch(activeMedia);
      if (!response.ok) throw new Error(`Impossible de récupérer la vidéo source (${response.status}).`);
      const sourceBlob = await response.blob();
      const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(sourceBlob) });
      const inputVideoTrack = await input.getPrimaryVideoTrack();
      if (!inputVideoTrack) throw new Error('Aucune piste vidéo trouvée.');
      if (!(await inputVideoTrack.canDecode())) throw new Error('Mediabunny ne peut pas décoder cette vidéo.');

      const sourceDuration = await inputVideoTrack.computeDuration();
      if (!sourceDuration || !Number.isFinite(sourceDuration)) throw new Error('Durée vidéo invalide.');

      // Montage : sections conservées (une seule section = toute la vidéo).
      const trimmed = isTrimmed(segmentsRef.current, sourceDuration);
      const ranges = trimmed
        ? keptRanges(segmentsRef.current).map((r) => ({ ...r, end: Math.min(r.end, sourceDuration) }))
        : [{ start: 0, end: sourceDuration, outStart: 0 }];
      const outDuration = ranges.reduce((sum, r) => sum + (r.end - r.start), 0);
      if (!(outDuration > 0)) throw new Error('Toutes les sections sont supprimées.');

      // Dimensions paires (exigence H.264), éventuellement réduites (jamais agrandies).
      const srcW = await inputVideoTrack.getDisplayWidth();
      const srcH = await inputVideoTrack.getDisplayHeight();
      const targetH = exportResolution === 'original' ? srcH : Math.min(srcH, Number(exportResolution));
      const ratio = targetH / srcH;
      const width = toEven(srcW * ratio);
      const height = toEven(srcH * ratio);

      // Cadence réelle de la source (repli : 30 i/s).
      let frameRate = 30;
      try {
        const stats = await inputVideoTrack.computePacketStats(120);
        if (stats?.averagePacketRate && Number.isFinite(stats.averagePacketRate)) {
          frameRate = Math.min(120, Math.max(10, Math.round(stats.averagePacketRate * 100) / 100));
        }
      } catch { /* on garde 30 i/s */ }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!ctx) throw new Error('Canvas non disponible.');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });

      const bpp = (EXPORT_QUALITIES[exportQuality] || EXPORT_QUALITIES.high).bitsPerPixel;
      videoSource = new CanvasSource(canvas, {
        codec: 'avc',
        bitrate: Math.round(Math.max(4_000_000, Math.min(60_000_000, width * height * frameRate * bpp))),
        keyFrameInterval: 2
      });
      output.addVideoTrack(videoSource, { frameRate });

      // Audio : copie directe si rien n'est coupé ; sinon le son suit les sections conservées.
      const needMix = trimmed;
      let audioSink = null;
      let mixedBuffer = null;
      let useBufferSource = false;
      audioNoticeRef.current = '';
      try {
        const inputAudioTrack = await input.getPrimaryAudioTrack();
        const hasOriginalAudio = Boolean(inputAudioTrack && (await inputAudioTrack.canDecode()));
        if (!needMix) {
          if (hasOriginalAudio) {
            audioSink = new AudioSampleSink(inputAudioTrack);
            audioSource = new AudioSampleSource({ codec: 'aac', bitrate: 192000 });
            output.addAudioTrack(audioSource);
          }
        } else if (hasOriginalAudio) {
          const chunks = await collectOriginalAudio(MB, inputAudioTrack, sourceBlob, sourceDuration);
          mixedBuffer = await renderMix({
            ranges,
            totalDuration: outDuration,
            originalChunks: chunks,
            originalVolume: 1,
            music: null
          });
          if (typeof MB.AudioBufferSource === 'function') {
            audioSource = new MB.AudioBufferSource({ codec: 'aac', bitrate: 192000 });
            useBufferSource = true;
          } else if (typeof MB.AudioSample === 'function') {
            audioSource = new AudioSampleSource({ codec: 'aac', bitrate: 192000 });
          } else {
            throw new Error('cette version de mediabunny ne permet pas le mixage audio.');
          }
          output.addAudioTrack(audioSource);
        }
      } catch (audioSetupError) {
        console.warn('Audio indisponible, export sans audio :', audioSetupError);
        audioSink = null;
        audioSource = null;
        mixedBuffer = null;
        audioNoticeRef.current = `Audio non inclus : ${audioSetupError?.message || 'erreur inconnue'}`;
      }

      await output.start();

      const sink = new CanvasSink(inputVideoTrack, { width, height, fit: 'contain', poolSize: 2, alpha: false });

      const audioPromise = audioSource
        ? (async () => {
            if (mixedBuffer) {
              if (useBufferSource) {
                await audioSource.add(mixedBuffer);
              } else {
                for (const sample of iterateSamples(MB, mixedBuffer)) {
                  if (aborted) break;
                  await audioSource.add(sample);
                  sample.close?.();
                }
              }
              audioSource.close();
              return;
            }
            for await (const sample of audioSink.samples(0, sourceDuration)) {
              try {
                if (aborted) break;
                await audioSource.add(sample);
              } finally {
                sample.close();
              }
            }
            audioSource.close();
          })()
        : Promise.resolve();
      audioPromise.catch(() => {}); // évite un « unhandled rejection » si la vidéo échoue avant

      // Multi-cœurs : une image par worker, plusieurs images en cours en même temps.
      pool = createExportPool(exportPlan);
      const windowSize = pool ? Math.max(2, threads + 1) : 0;
      const inflight = [];

      const reportProgress = (timestamp) => {
        const progress = Math.min(1, timestamp / outDuration);
        setExportProgress(progress);
        const elapsed = (performance.now() - startedAt) / 1000;
        if (progress > 0.03) setExportEta(fmtTime(elapsed / progress - elapsed));
      };

      const flush = async (item) => {
        let pixels;
        try {
          pixels = await item.promise;
        } catch (poolError) {
          console.warn('Worker en échec, image traitée sur le thread principal :', poolError);
          processImageData(item.frame, exportPlan, item.seed);
          pixels = item.frame.data;
        }
        ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
        await videoSource.add(item.timestamp, item.duration);
        reportProgress(item.timestamp);
      };

      const needsPixels = !exportPlan.identity;
      let frameIndex = 0;
      for (const range of ranges) {
        for await (const frame of sink.canvases(range.start, range.end)) {
          if (cancelExportRef.current) throw new Error('Export annulé.');
          const outTs = frame.timestamp - range.start + range.outStart;
          ctx.drawImage(frame.canvas, 0, 0, width, height);

          if (!needsPixels) {
            await videoSource.add(outTs, frame.duration);
            if (frameIndex % 4 === 0) reportProgress(outTs);
          } else {
            const data = ctx.getImageData(0, 0, width, height);
            if (exportPlan.identity) {
              ctx.putImageData(data, 0, 0);
              await videoSource.add(outTs, frame.duration);
              if (frameIndex % 4 === 0) reportProgress(outTs);
            } else if (!pool) {
              processImageData(data, exportPlan, frameIndex);
              ctx.putImageData(data, 0, 0);
              await videoSource.add(outTs, frame.duration);
              if (frameIndex % 4 === 0) reportProgress(outTs);
            } else {
              inflight.push({
                promise: pool.processWhole(data, frameIndex),
                frame: data,
                seed: frameIndex,
                timestamp: outTs,
                duration: frame.duration
              });
              if (inflight.length >= windowSize) await flush(inflight.shift());
            }
          }
          frameIndex++;
        }
      }
      while (inflight.length) await flush(inflight.shift());

      await audioPromise;
      videoSource.close();
      audioSource?.close?.();
      await output.finalize();
      finalized = true;

      const buffer = output.target.buffer;
      if (!buffer) throw new Error('Impossible de récupérer le fichier MP4 généré.');
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setPendingUrl(url);
      setExportProgress(1);
      return { blob, url, mimeType: 'video/mp4', fileName: `filtre-${Date.now()}.mp4`, type: 'VIDEO', colorGradingBakedIn: true };
    } catch (error) {
      aborted = true;
      console.error('Erreur export Mediabunny :', error);
      setExportError(error?.message || 'Impossible de générer la vidéo.');
      throw error;
    } finally {
      pool?.terminate();
      if (!finalized) {
        try { await output?.cancel?.(); } catch { /* ignoré */ }
      }
      try { videoSource?.close(); } catch { /* ignoré */ }
      try { audioSource?.close?.(); } catch { /* ignoré */ }
      setExportEta('');
      setIsExporting(false);
    }
  };

  // Envoie le fichier vers votre stockage (si `uploadResult` est fourni) et renvoie les champs à fusionner dans l'objet transmis à onApply.
  const persistResult = async (result, { settings = null, meta = null } = {}) => {
    if (typeof uploadResult !== 'function') {
      if (typeof result.url === 'string' && result.url.startsWith('blob:')) {
        console.warn('[Filtre] Aucun « uploadResult » fourni : l’adresse envoyée à onApply est temporaire (blob:) et disparaîtra à l’actualisation. Voir firebaseUpload.js.');
      }
      return { persisted: false };
    }
    setSaveMessage('Envoi vers votre stockage en ligne…');
    setUploadProgress(0);
    try {
      const uploaded = await uploadResult(result, { onProgress: setUploadProgress, settings, meta });
      if (!uploaded || !uploaded.url) throw new Error('uploadResult doit renvoyer { url } (l’adresse permanente du fichier).');
      return { persisted: true, localUrl: result.url, url: uploaded.url, storagePath: uploaded.storagePath ?? null, docId: uploaded.docId ?? null };
    } catch (error) {
      throw new Error(`Envoi vers le stockage impossible : ${error?.message || error}`);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleApply = async () => {
    if (isExporting || isSaving) return;
    try {
      setIsSaving(true);
      setSaveMessage('');
      setExportError('');

      const settings = {
        filter: selectedFilter,
        colorSettings,
        intensity,
        adjustments: { ...adjustments, lut: undefined },
        film: film.id,
        filmAmount: film.id === 'none' ? undefined : filmAmount,
        lutName: lut ? lut.name : null,
        lutAmount: lut ? lutAmount : undefined,
        contrast: adjustments.contrast,
        shadows: adjustments.shadows,
        highlights: adjustments.highlights,
        saturation: adjustments.saturation,
        temperature: adjustments.temperature,
        grain: adjustments.grain,
        exportResolution,
        edit: isVideo ? { trimmed: isTrimmed(segments, duration), ranges: keptRanges(segments) } : undefined,
        match: matchLuts ? { name: matchData?.name, amount: matchAmount } : null,
        threads: perfEnabled ? threads : 1,
        exportQuality: isVideo ? exportQuality : undefined,
        imageFormat: isVideo ? undefined : imageFormat
      };

      const result = isVideo ? await exportVideo() : await exportImage();
      if (!result || !result.blob || !result.blob.size) throw new Error('Le fichier généré est vide : rien à enregistrer.');
      lastResultRef.current = result;
      setHasLastResult(true);

      let safeSettings = null;
      try { safeSettings = JSON.parse(JSON.stringify(settings)); } catch { safeSettings = null; }
      const stored = typeof onApply === 'function'
        ? await persistResult(result, { settings: safeSettings, meta: { filterName: selectedFilter.name, originalUrl: activeMedia, intensity } })
        : { persisted: false };

      if (typeof onApply === 'function') {
        const payload = {
          ...result,
          ...stored,
          ...(typeof File === 'function' ? { file: new File([result.blob], result.fileName, { type: result.mimeType }) } : {}),
          size: result.blob.size,
          settings: safeSettings,
          originalUrl: activeMedia,
          filterName: selectedFilter.name,
          intensity
        };
        console.info('[Filtre] Envoi à l’historique :', { type: payload.type, fileName: payload.fileName, size: payload.size, persisted: payload.persisted, url: payload.url });
        const saved = await onApply(payload);
        if (saved === false) throw new Error('Votre application a refusé l’enregistrement dans l’historique (onApply a renvoyé false).');
        pendingUrlRef.current = null; // l'URL appartient maintenant au parent
        setSaveMessage(audioNoticeRef.current ? `Le média est enregistré. ${audioNoticeRef.current}` : 'Le média est enregistré dans votre historique.');
        await new Promise((resolve) => setTimeout(resolve, 1200));
        closeInspector();
      } else {
        downloadBlob(result.blob, result.fileName);
        setSaveMessage('Fichier téléchargé.');
      }
    } catch (error) {
      console.error('❌ Erreur application filtre :', error);
      setExportError(error?.message || 'Impossible d’appliquer les modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Navigation ----------
  const openInspector = (tool) => {
    setActiveTool(tool);
    setIsInspectorOpen(true);
    setIsEyedropperActive(false);
    if (tool === 'color') setSelectedOptionModal?.('Modifier la couleur');
    if (tool === 'filters') setSelectedOptionModal?.(null);
    if (tool === 'lighting' || tool === 'camera' || tool === 'environment') {
      const item = AI_ACTIONS.find((a) => a.id === tool);
      setSelectedAIOption(null);
      if (item) {
        setVeoVideoOperation?.('edit');
        setSelectedOptionModal?.(item.label);
      }
    }
  };

  const closeInspector = () => {
    setIsInspectorOpen(false);
    if (onBack) onBack();
  };

  // Raccourcis : Échap, Espace (lecture), Ctrl/Cmd+Z / Ctrl+Y (historique), antislash (maintenir : original).
  // Découpe (onglet Filtre) : Suppr supprime la section, S divise, Q / W suppriment à gauche / à droite, flèches = image par image.
  shortcutRef.current = (e, isUp) => {
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && e.target.type !== 'range' && e.target.type !== 'checkbox');
    if (e.key === '\\') { if (!typing) setShowOriginal(!isUp); return; }
    if (isUp || typing) return;
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === 'Escape') {
      if (isEyedropperActive) setIsEyedropperActive(false);
      else if (!isExporting && !isSaving) closeInspector();
    } else if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    } else if (mod && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    } else if (isVideo && activeTool === 'filters' && tag !== 'INPUT' && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      doDeleteSelected();
    } else if (isVideo && activeTool === 'filters' && tag !== 'INPUT' && ((!mod && e.key.toLowerCase() === 's') || (mod && e.key.toLowerCase() === 'b'))) {
      e.preventDefault();
      doSplit();
    } else if (isVideo && activeTool === 'filters' && tag !== 'INPUT' && !mod && e.key.toLowerCase() === 'q') {
      e.preventDefault();
      doDeleteSide('left');
    } else if (isVideo && activeTool === 'filters' && tag !== 'INPUT' && !mod && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      doDeleteSide('right');
    } else if (isVideo && activeTool === 'filters' && tag !== 'INPUT' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      stepTime(e.key === 'ArrowRight' ? 1 : -1, e.shiftKey);
    } else if (isVideo && activeTool === 'filters' && tag !== 'INPUT' && (e.key === 'Home' || e.key === 'End')) {
      e.preventDefault();
      const list = segmentsRef.current.filter((s) => !s.removed);
      if (list.length) seekTo(e.key === 'Home' ? list[0].start : Math.max(0, list[list.length - 1].end - 0.05));
    } else if (e.key === ' ' && isVideo && tag !== 'INPUT') {
      e.preventDefault();
      togglePlay();
    }
  };
  useEffect(() => {
    if (!isInspectorOpen) return undefined;
    const down = (e) => shortcutRef.current?.(e, false);
    const up = (e) => shortcutRef.current?.(e, true);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [isInspectorOpen]);

  // ============================================================
  // RENDU
  // ============================================================

  const renderPreview = () => {
    if (!PREVIEW_TABS.includes(activeTool)) return null;
    const mediaStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' };

    return (
      <div style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#101014', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
        <div
          ref={compareBoxRef}
          id="compare-container"
          onPointerDown={onCompareDown}
          onPointerMove={onCompareMove}
          onPointerUp={onCompareUp}
          onPointerCancel={onCompareUp}
          style={{
            position: 'relative', width: '100%', maxWidth: '760px', margin: '0 auto', aspectRatio: '16 / 9',
            background: '#000', overflow: 'hidden', borderRadius: '8px',
            border: isEyedropperActive ? '2px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)',
            cursor: isEyedropperActive ? 'crosshair' : 'ew-resize', userSelect: 'none', touchAction: 'none',
            boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
          }}
        >
          {isVideo ? (
            <video ref={mediaRef} src={activeMedia} playsInline loop crossOrigin="anonymous" style={mediaStyle} />
          ) : (
            <img ref={mediaRef} src={activeMedia} alt="Original" crossOrigin="anonymous" draggable={false} onLoad={scheduleDraw} style={mediaStyle} />
          )}

          {/* Rendu étalonné : exactement le même moteur que l'export */}
          <canvas ref={canvasRef} style={{ ...mediaStyle, clipPath: `inset(0 ${100 - comparePosition}% 0 0)`, pointerEvents: 'none', opacity: showOriginal ? 0 : 1 }} />

          {gridMode !== 'off' && (
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 9, pointerEvents: 'none' }}>
              {(gridMode === 'thirds' ? [33.333, 66.667] : [50]).map((pos) => (
                <React.Fragment key={pos}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: '1px', background: 'rgba(255,255,255,0.45)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: `${pos}%`, height: '1px', background: 'rgba(255,255,255,0.45)' }} />
                </React.Fragment>
              ))}
            </div>
          )}

          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${comparePosition}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '28px', height: '28px', borderRadius: '50%', background: '#00b4d8', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', boxSizing: 'border-box' }}>↔</div>
          </div>

          {isEyedropperActive && (
            <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', padding: '6px 12px', background: 'rgba(0,180,216,0.9)', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: '700', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
              {pipetteMode === 'wb' ? '⚪ Cliquez sur une zone grise ou blanche (Échap pour annuler)' : '🎯 Cliquez sur une couleur (Échap pour annuler)'}
            </div>
          )}
          {previewError && (
            <div role="alert" style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', padding: '5px 8px', background: 'rgba(127,29,29,0.9)', color: '#fecaca', borderRadius: '4px', fontSize: '10px', zIndex: 20 }}>{previewError}</div>
          )}
          <div style={{ position: 'absolute', top: '8px', left: '8px', padding: '3px 6px', background: 'rgba(0,0,0,0.7)', borderRadius: '3px', fontSize: '9px', zIndex: 12 }}>{showOriginal ? 'Original (maintenu)' : 'Modifié'}</div>
          <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '3px 6px', background: 'rgba(0,0,0,0.7)', borderRadius: '3px', fontSize: '9px', zIndex: 12 }}>Original</div>
        </div>

        <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', minHeight: '46px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px', background: '#141418', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', boxSizing: 'border-box', borderRadius: '0 0 8px 8px' }}>
          {isVideo && (
            <>
              <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Lecture'} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#00b4d8', color: '#fff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <input
                type="range"
                aria-label="Position dans la vidéo"
                min={0}
                max={duration || 0}
                step={0.01}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => seekTo(Number(e.target.value))}
                style={{ flex: 1, minWidth: 0, accentColor: '#00b4d8', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap' }}>{fmtTime(currentTime)} / {fmtTime(duration)}</span>
            </>
          )}
          {!isVideo && <div style={{ flex: 1 }} />}
          <span style={{ fontSize: '10px', color: '#00b4d8', whiteSpace: 'nowrap' }}>{activeTool === 'color' ? 'Couleur' : hoverFilter && hoverFilter.id !== selectedFilter.id ? `Aperçu : ${hoverFilter.name}` : `${selectedFilter.name}${selectedFilter.id !== 'none' ? ` ${intensity}%` : ''}`}</span>
        </div>

        <div style={{ width: '100%', maxWidth: '760px', margin: '8px auto 0', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <button type="button" onClick={undo} disabled={!canUndo} aria-label="Annuler" title="Annuler (Ctrl+Z)" style={toolChipStyle(false, !canUndo)}>↶ Annuler</button>
          <button type="button" onClick={redo} disabled={!canRedo} aria-label="Rétablir" title="Rétablir (Ctrl+Y)" style={toolChipStyle(false, !canRedo)}>↷ Rétablir</button>
          <button
            type="button"
            title="Maintenir pour voir l’original (touche antislash)"
            onPointerDown={() => setShowOriginal(true)}
            onPointerUp={() => setShowOriginal(false)}
            onPointerLeave={() => setShowOriginal(false)}
            onPointerCancel={() => setShowOriginal(false)}
            style={toolChipStyle(showOriginal, false)}
          >👁 Original</button>
          <button type="button" onClick={captureFrame} title="Capturer l’image affichée (PNG)" style={toolChipStyle(false, false)}>📸 Capturer</button>
          {isVideo && (
            <button type="button" aria-pressed={soundOn} onClick={() => setSoundOn((v) => !v)} title="Écouter le son dans l’aperçu" style={toolChipStyle(soundOn, false)}>{soundOn ? '🔊 Son' : '🔇 Son'}</button>
          )}
          <button type="button" aria-pressed={showClipping} onClick={() => setShowClipping((v) => !v)} title="Rouge : hautes lumières brûlées · Bleu : noirs bouchés" style={toolChipStyle(showClipping, false)}>⚠ Écrêtage</button>
          <select aria-label="Grille de composition" value={gridMode} onChange={(e) => setGridMode(e.target.value)} style={{ ...selectStyle, width: 'auto', padding: '4px 6px', fontSize: '10px' }}>
            <option value="off">Grille : aucune</option>
            <option value="thirds">Grille : tiers</option>
            <option value="center">Grille : centre</option>
          </select>
        </div>
      </div>
    );
  };

  const renderExportOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#9ca3af' }}>
          {isVideo ? 'Qualité d’export' : 'Format'}
          {isVideo ? (
            <select aria-label="Qualité d’export" value={exportQuality} onChange={(e) => setExportQuality(e.target.value)} style={selectStyle}>
              {Object.entries(EXPORT_QUALITIES).map(([id, q]) => <option key={id} value={id}>{q.label}</option>)}
            </select>
          ) : (
            <select aria-label="Format d’image" value={imageFormat} onChange={(e) => setImageFormat(e.target.value)} style={selectStyle}>
              {Object.entries(IMAGE_FORMATS).map(([id, f]) => <option key={id} value={id}>{f.label}</option>)}
            </select>
          )}
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#9ca3af' }}>
          Résolution de sortie
          <select aria-label="Résolution de sortie" value={exportResolution} onChange={(e) => setExportResolution(e.target.value)} style={selectStyle}>
            {EXPORT_RESOLUTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
      </div>

      <details style={{ background: '#1b1b20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 10px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#d1d5db' }}>
          ⚡ Performance {perfEnabled && poolStatus === 'ready' ? `· ${threads} threads actifs` : '· thread principal'}
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#e5e7eb', cursor: workersSupported() ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={perfEnabled}
              disabled={!workersSupported()}
              onChange={(e) => setPerfEnabled(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#00b4d8' }}
            />
            <span>
              Accélération multi-cœurs (Web Workers)
              <span style={{ display: 'block', fontSize: '9px', color: '#888', marginTop: '2px', lineHeight: 1.35 }}>
                Utilise plusieurs cœurs de votre processeur pour l’aperçu et l’export : l’interface reste fluide et les exports sont bien plus rapides. Désactivez-la si votre ordinateur chauffe ou ralentit.
              </span>
            </span>
          </label>
          <div style={{ opacity: perfEnabled ? 1 : 0.4 }}>
            <SliderRow
              compact
              label={`Threads utilisés (processeur : ${cores} cœurs logiques)`}
              min={1}
              max={Math.min(16, Math.max(cores, 2))}
              value={threads}
              onChange={(v) => setThreads(Math.max(1, v))}
            />
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#9ca3af' }}>
            Qualité de l’aperçu
            <select aria-label="Qualité de l’aperçu" value={previewQuality} onChange={(e) => setPreviewQuality(e.target.value)} style={selectStyle}>
              <option value="eco">Économique (640 px) — le plus fluide</option>
              <option value="standard">Standard (960 px)</option>
              <option value="high">Haute (1280 px) — plus précis</option>
            </select>
          </label>
          <div style={{ fontSize: '9px', color: '#777', lineHeight: 1.4 }}>
            {poolStatus === 'ready' && `Workers actifs. Dernier traitement de l’aperçu : ${previewMs} ms.`}
            {poolStatus === 'off' && `Traitement sur le thread principal. Dernier traitement de l’aperçu : ${previewMs} ms.`}
            {poolStatus === 'fallback' && 'Les workers n’ont pas pu démarrer : le traitement se fait sur le thread principal.'}
          </div>
        </div>
      </details>
    </div>
  );

  const renderStatus = () => (
    <>
      {isExporting && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isVideo && (
            <>
              <div style={{ height: '6px', borderRadius: '3px', background: '#27272a', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(exportProgress * 100)}%`, height: '100%', background: '#00b4d8', transition: 'width .2s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                <span>Export en cours… {Math.round(exportProgress * 100)}%{exportEta ? ` · ~${exportEta} restant` : ''}</span>
                <button type="button" onClick={() => { cancelExportRef.current = true; }} style={{ border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>Annuler</button>
              </div>
            </>
          )}
        </div>
      )}
      {uploadProgress !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ height: '6px', borderRadius: '3px', background: '#27272a', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round(uploadProgress * 100)}%`, height: '100%', background: '#4ade80', transition: 'width .2s' }} />
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>Envoi vers votre stockage… {Math.round(uploadProgress * 100)}%</div>
        </div>
      )}
      {saveMessage && <div role="status" style={{ color: '#4ade80', fontSize: '11px', lineHeight: 1.4 }}>{saveMessage}</div>}
      {exportError && <div role="alert" style={{ color: '#fca5a5', fontSize: '11px', lineHeight: 1.4 }}>{exportError}</div>}
      {exportError && hasLastResult && !isExporting && (
        <button
          type="button"
          onClick={() => { const r = lastResultRef.current; if (r) downloadBlob(r.blob, r.fileName); }}
          style={{ ...ghostButtonStyle, color: '#7dd3fc', justifyContent: 'center' }}
        >
          💾 Télécharger le résultat quand même
        </button>
      )}
    </>
  );

  const applyLabel = isSaving || isExporting ? 'Traitement en cours…' : 'Appliquer les modifications';

  const renderFiltersEditor = () => (
    <div className="ovx-color-editor-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#111' }}>
      <div className="ovx-color-editor-layout" style={{ display: 'grid', gridTemplateColumns: '330px minmax(0, 1fr) 330px', gap: '16px', alignItems: 'start', width: '100%', minWidth: 0 }}>
        {/* GAUCHE : presets + intensité */}
        <div className="ovx-color-editor-panel" style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 15px 0 15px' }}>
            <PanelHeader title="Filtres" subtitle="Survolez un preset pour le prévisualiser, cliquez pour l'appliquer." />
          </div>
          <div style={sectionStyle}>
            <div className="ovx-filter-presets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              {PRESET_FILTERS.map((filter) => (
                <PresetTile key={filter.id} filter={filter} active={selectedFilter.id === filter.id} onSelect={handleSelectFilter} onHover={setHoverFilter} />
              ))}
            </div>
          </div>
          <div style={{ ...sectionStyle, borderBottom: 'none' }}>
            <SliderRow label="Intensité du filtre" min={0} max={100} suffix="%" value={intensity} onChange={(v) => { setIntensity(v); setExportError(''); setSaveMessage(''); }} />
          </div>
        </div>

        {/* CENTRE : vidéo + outils */}
        <div className="ovx-color-editor-center" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          {renderPreview()}
          {colorActiveCount > 0 && (
            <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.3)', color: '#7dd3fc', fontSize: '11px', maxWidth: '760px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
              <span>🎨 {colorActiveCount} réglage(s) de couleur actif(s)</span>
              <span style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => openInspector('color')} style={{ ...ghostButtonStyle, color: '#7dd3fc', padding: '3px 8px', fontSize: '10px' }}>Voir</button>
                <button type="button" onClick={handleColorReset} style={{ ...ghostButtonStyle, padding: '3px 8px', fontSize: '10px' }}>Remettre à zéro</button>
              </span>
            </div>
          )}
        </div>

        {/* DROITE : pellicule, LUT, looks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div className="ovx-color-editor-panel" style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Émulation de pellicule</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select aria-label="Pellicule" value={filmId} onChange={(e) => { setFilmId(e.target.value); setExportError(''); }} style={{ ...selectStyle, flex: 1 }}>
            {FILM_STOCKS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div style={{ flex: 1, minWidth: 0, opacity: filmId === 'none' ? 0.4 : 1 }}>
            <SliderRow compact label="Force" min={0} max={100} suffix="%" value={filmAmount} onChange={setFilmAmount} />
          </div>
        </div>
        <div style={{ fontSize: '9px', color: '#777', marginTop: '6px' }}>Réponse colorimétrique et grain de pellicule, ajustables dans l’onglet Couleur.</div>
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>LUT (.cube)</div>
        <input ref={lutFileRef} type="file" accept=".cube" hidden onChange={(e) => { importLut(e.target.files?.[0]); e.target.value = ''; }} />
        {lut ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lut.name} · {lut.size}³</span>
              <button type="button" onClick={() => setLut(null)} style={{ ...ghostButtonStyle, padding: '3px 8px', fontSize: '10px' }}>Retirer</button>
            </div>
            <SliderRow compact label="Force de la LUT" min={0} max={100} suffix="%" value={lutAmount} onChange={setLutAmount} />
          </div>
        ) : (
          <button type="button" onClick={() => lutFileRef.current?.click()} style={{ ...ghostButtonStyle, color: '#7dd3fc', width: '100%', justifyContent: 'center' }}>📂 Importer une LUT 3D (.cube)</button>
        )}
      </div>
          </div>
          <div className="ovx-color-editor-panel" style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
      <div style={{ ...sectionStyle, borderBottom: 'none' }}>
        <div style={sectionTitleStyle}>Mes looks</div>
        <input ref={looksFileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { importLooks(e.target.files?.[0]); e.target.value = ''; }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={lookName}
            maxLength={40}
            aria-label="Nom du look"
            placeholder="Nom du look"
            onChange={(e) => setLookName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentLook(); }}
            style={{ ...selectStyle, flex: 1, minWidth: 0 }}
          />
          <button type="button" onClick={saveCurrentLook} style={{ ...ghostButtonStyle, color: '#7dd3fc', whiteSpace: 'nowrap' }}>💾 Enregistrer</button>
        </div>
        {customLooks.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {customLooks.map((look) => (
              <span key={look.id} style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', background: '#27272a', overflow: 'hidden' }}>
                <button type="button" onClick={() => applyLook(look)} style={{ border: 'none', background: 'transparent', color: '#e5e7eb', fontSize: '11px', fontWeight: 600, padding: '4px 4px 4px 10px', cursor: 'pointer' }}>{look.name}</button>
                <button type="button" aria-label={`Supprimer ${look.name}`} onClick={() => deleteLook(look.id)} style={{ border: 'none', background: 'transparent', color: '#9ca3af', fontSize: '13px', padding: '2px 8px 2px 4px', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => looksFileRef.current?.click()} style={{ ...ghostButtonStyle, color: '#d1d5db', flex: 1, justifyContent: 'center' }}>Importer</button>
          <button type="button" onClick={exportLooks} disabled={!customLooks.length} style={{ ...ghostButtonStyle, color: '#d1d5db', flex: 1, justifyContent: 'center', opacity: customLooks.length ? 1 : 0.4 }}>Exporter</button>
          <button type="button" onClick={exportCubeLut} title="Exporter le look en LUT 3D (.cube) pour DaVinci, Premiere, etc." style={{ ...ghostButtonStyle, color: '#7dd3fc', flex: 1, justifyContent: 'center' }}>LUT .cube</button>
        </div>
      </div>
          </div>
          <div className="ovx-color-editor-panel" style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {renderExportOptions()}
            {renderStatus()}
            <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={handleFiltersReset} style={{ flex: 1, padding: '11px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            🔄 Tout réinitialiser
          </button>
          <button type="button" onClick={handleApply} disabled={isSaving || isExporting} style={{ flex: 2, padding: '11px 12px', borderRadius: '10px', border: 'none', background: isSaving || isExporting ? '#777' : '#ffffff', color: '#000000', fontSize: '13px', fontWeight: '700', cursor: isSaving || isExporting ? 'not-allowed' : 'pointer', opacity: isSaving || isExporting ? 0.7 : 1 }}>
            {isSaving || isExporting ? 'Veuillez patienter…' : 'Appliquer'}
          </button>
            </div>
          </div>
        </div>
      </div>

      {renderTimelineBlock()}
    </div>
  );

  // ---------- Découpe de la vidéo ----------
  const renderTimelineBlock = () => {
    if (!isVideo) return null;
    const edited = segments.length > 1 || finalDuration < duration - 0.05;
    const zoomPos = Math.round((Math.log(timelineZoom) / Math.log(40)) * 100);
    const iconBtn = (disabled, active) => ({ ...toolChipStyle(active, disabled), display: 'inline-flex', alignItems: 'center', gap: '5px' });
    const kbd = { fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.12)', color: '#d1d5db', fontWeight: 700 };
    return (
      <div className="ovx-color-editor-panel" style={{ ...panelStyle, width: '100%', boxSizing: 'border-box' }}>
        <PanelTitle onReset={edited ? resetEdit : undefined}>✂ DÉCOUPE DE LA VIDÉO</PanelTitle>
        {duration > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <button type="button" onClick={doSplit} title="Couper à la position de la tête de lecture (S)" style={iconBtn(false, false)}>✂ Diviser <span style={kbd}>S</span></button>
              <button type="button" onClick={() => doDeleteSide('left')} title="Supprimer ce qui est avant la tête de lecture (Q)" style={iconBtn(false, false)}>⇤ Supprimer à gauche <span style={kbd}>Q</span></button>
              <button type="button" onClick={() => doDeleteSide('right')} title="Supprimer ce qui est après la tête de lecture (W)" style={iconBtn(false, false)}>⇥ Supprimer à droite <span style={kbd}>W</span></button>
              <button type="button" onClick={doDeleteSelected} disabled={keptSegs.length <= 1} title="Supprimer la section sélectionnée (touche Suppr)" style={{ ...iconBtn(keptSegs.length <= 1, false), color: '#fca5a5' }}>🗑 Supprimer <span style={kbd}>Suppr</span></button>
              <button type="button" onClick={sceneProgress === null ? runSceneDetect : () => { sceneStopRef.current = true; }} style={iconBtn(false, sceneProgress !== null)}>
                {sceneProgress === null ? '🔎 Détecter les scènes' : `Analyse… ${Math.round(sceneProgress * 100)} % (arrêter)`}
              </button>
              <span style={{ flex: 1 }} />
              <button type="button" aria-label="Zoom arrière" title="Zoom arrière" onClick={() => setTimelineZoom((z) => clamp(z / 1.5, 1, 40))} style={iconBtn(false, false)}>−</button>
              <input
                type="range"
                aria-label="Zoom de la frise"
                min={0}
                max={100}
                value={zoomPos}
                onChange={(e) => setTimelineZoom(Math.pow(40, Number(e.target.value) / 100))}
                style={{ width: '110px', accentColor: '#00b4d8', cursor: 'pointer' }}
              />
              <button type="button" aria-label="Zoom avant" title="Zoom avant (Ctrl + molette sur la frise)" onClick={() => setTimelineZoom((z) => clamp(z * 1.5, 1, 40))} style={iconBtn(false, false)}>+</button>
            </div>

            <Timeline
              duration={duration}
              segments={segments}
              selectedId={selectedSegId}
              onSelect={setSelectedSegId}
              onSeek={seekTo}
              onChange={setSegments}
              getTime={getVideoTime}
              currentTime={currentTime}
              isPlaying={isPlaying}
              thumbs={thumbs}
              zoom={timelineZoom}
              onZoom={setTimelineZoom}
            />

            <div style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.6 }}>
              Durée finale : <strong style={{ color: '#fff' }}>{fmtTime(finalDuration)}</strong> sur {fmtTime(duration)} · {keptSegs.length} section(s).
              <br />
              <span style={kbd}>Clic</span> sélectionne une section · <span style={kbd}>Suppr</span> la supprime et referme le vide · tirez les <b>poignées blanches</b> pour rogner · <span style={kbd}>←</span> <span style={kbd}>→</span> image par image · <span style={kbd}>Ctrl</span> + molette pour zoomer · <span style={kbd}>Ctrl</span> <span style={kbd}>Z</span> annule.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Chargement de la vidéo…</div>
        )}
      </div>
    );
  };

  // ---------- Détection automatique (onglet Couleur) ----------
  const renderAutoDetect = () => (
    <div style={panelStyle}>
      <div style={panelTitleStyle}>DÉTECTION AUTOMATIQUE</div>
      <button type="button" onClick={analyzeScene} style={{ ...ghostButtonStyle, color: '#7dd3fc', width: '100%', justifyContent: 'center' }}>🔎 Analyser la scène</button>
      {sceneInfo && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sceneInfo.tags.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {sceneInfo.tags.map((t) => (
                <span key={t.id} style={{ padding: '3px 8px', borderRadius: '999px', background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.35)', color: '#7dd3fc', fontSize: '10px', fontWeight: 600 }}>{t.label}</span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>Aucune particularité détectée : image équilibrée.</div>
          )}
          <button type="button" onClick={applyScenePatch} style={{ ...ghostButtonStyle, color: '#d1d5db', justifyContent: 'center' }}>Appliquer les corrections suggérées</button>
          {sceneInfo.presetId && (
            <button type="button" onClick={applyScenePreset} style={{ ...ghostButtonStyle, color: '#d1d5db', justifyContent: 'center' }}>
              Essayer le preset « {PRESET_FILTERS.find((p) => p.id === sceneInfo.presetId)?.name} »
            </button>
          )}
        </div>
      )}
      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#d1d5db', marginBottom: '6px' }}>Copier les couleurs d’une image</div>
        <input ref={matchFileRef} type="file" accept="image/*" hidden onChange={(e) => { importMatchImage(e.target.files?.[0]); e.target.value = ''; }} />
        {matchData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{matchData.name}</span>
              <button type="button" onClick={() => { setMatchData(null); setMatchLuts(null); }} style={{ ...ghostButtonStyle, padding: '3px 8px', fontSize: '10px' }}>Retirer</button>
            </div>
            <SliderRow compact label="Force" min={0} max={100} suffix="%" value={matchAmount} onChange={setMatchAmount} />
            <button type="button" onClick={() => { try { computeMatch(matchData.refStats, matchData.name); } catch (error) { setExportError(error?.message || 'Recalcul impossible.'); } }} style={{ ...ghostButtonStyle, color: '#d1d5db', justifyContent: 'center', fontSize: '10px' }}>Recalculer sur l’image actuelle</button>
          </div>
        ) : (
          <button type="button" onClick={() => matchFileRef.current?.click()} style={{ ...ghostButtonStyle, color: '#d1d5db', width: '100%', justifyContent: 'center' }}>📂 Choisir une image de référence</button>
        )}
      </div>
    </div>
  );

  const renderAIPanel = (action) => {
    const config = AI_OPTIONS[action.id];
    if (!config) return null;
    const canGenerate = Boolean((prompt || '').trim());
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 15px 0 15px', gap: '8px' }}>
          <PanelHeader title={config.title} subtitle={config.subtitle} />
          <button type="button" onClick={handleAIReset} style={{ ...ghostButtonStyle, flexShrink: 0 }}>🔄 Réinitialiser</button>
        </div>
        <div style={{ padding: '14px 15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {config.options.map((option) => (
              <AIOptionTile
                key={option[1]}
                option={option}
                active={selectedAIOption === option[1]}
                onSelect={() => { setSelectedAIOption(option[1]); setPrompt?.(option[2]); }}
              />
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>Prompt</span>
            <span style={{ fontSize: '9px', color: '#00b4d8' }}>{selectedOptionModal || action.label}</span>
          </div>
          <textarea
            value={prompt || ''}
            onChange={(e) => setPrompt?.(e.target.value)}
            placeholder="Décrivez votre modification..."
            style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box', resize: 'vertical', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#15151a', color: '#fff', padding: '10px', outline: 'none', fontSize: '11px', lineHeight: '1.4', fontFamily: 'inherit' }}
          />
          {typeof handleGenerate === 'function' && (
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isExporting || !canGenerate}
              style={{ width: '100%', height: '36px', marginTop: '6px', border: 'none', borderRadius: '6px', background: canGenerate ? '#00b4d8' : '#3f3f46', color: '#fff', cursor: canGenerate ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: '700' }}
            >
              ✨ Générer la modification IA
            </button>
          )}
        </div>
      </>
    );
  };

  const bandIsEdited = (id) =>
    ['hue', 'sat', 'lum'].some((type) => Number(colorSettings[bandKey(type, id)] || 0) !== 0);
  const currentBand = HSL_BANDS.find((b) => b.id === activeBand) || HSL_BANDS[0];

  const renderAdvanced = () => (
    <div style={panelStyle}>
      <div style={{ ...panelTitleStyle, marginBottom: '8px' }}>ÉTALONNAGE AVANCÉ</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', marginBottom: '12px' }}>
        {[['curves', 'Courbes'], ['wheels', 'Roues'], ['hsl', 'HSL']].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setAdvancedTab(id)}
            style={{ padding: '6px 4px', borderRadius: '6px', border: advancedTab === id ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.08)', background: advancedTab === id ? 'rgba(0,180,216,0.15)' : '#27272a', color: advancedTab === id ? '#38bdf8' : '#9ca3af', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </div>

      {advancedTab === 'curves' && (
        <div>
          <CurveGraph values={adjustments.curves} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 12px' }}>
            {CURVE_SLIDERS.map(([label, key]) => (
              <SliderRow key={key} compact label={label} value={colorSettings[key]} onChange={(v) => updateColor({ [key]: v })} />
            ))}
          </div>
        </div>
      )}

      {advancedTab === 'wheels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: '#888', fontSize: '9px' }}>Teintez les ombres, les tons moyens et les hautes lumières sans changer la luminosité.</div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#d1d5db', marginBottom: '6px' }}>Palettes cinéma en un clic</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {MOJO_PALETTES.map((palette) => (
                <button key={palette.id} type="button" onClick={() => applyPalette(palette)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', background: '#27272a', color: '#e5e7eb', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  <span style={{ width: '22px', height: '10px', borderRadius: '5px', background: `linear-gradient(90deg, ${palette.patch.wheelShadows}, ${palette.patch.wheelHighlights})` }} />
                  {palette.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
            {WHEELS.map(([label, key]) => (
              <ColorWheel
                key={key}
                label={label}
                hex={colorSettings[key]}
                amount={Number(colorSettings[`${key}Amount`] || 0)}
                onChange={(hex, amount) => updateColor({ [key]: hex, [`${key}Amount`]: amount })}
              />
            ))}
          </div>
        </div>
      )}

      {advancedTab === 'hsl' && (
        <div>
          <div style={{ color: '#888', fontSize: '9px', marginBottom: '8px' }}>Réglez teinte, saturation et luminance par famille de couleurs. La pipette 🎯 choisit la famille automatiquement.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {HSL_BANDS.map((band) => {
              const on = band.id === activeBand;
              return (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => setActiveBand(band.id)}
                  aria-pressed={on}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 8px', borderRadius: '999px', border: on ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.08)', background: on ? 'rgba(0,180,216,0.15)' : '#27272a', color: on ? '#fff' : '#bbb', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: band.swatch, outline: bandIsEdited(band.id) ? '2px solid #fff' : 'none', outlineOffset: '1px' }} />
                  {band.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[['Teinte', 'hue'], ['Saturation', 'sat'], ['Luminance', 'lum']].map(([name, type]) => {
              const key = bandKey(type, currentBand.id);
              return <SliderRow key={key} label={`${name} — ${currentBand.label}`} value={colorSettings[key]} onChange={(v) => updateColor({ [key]: v })} />;
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderColorEditor = () => (
    <div className="ovx-color-editor-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleAutoColorCorrection} style={{ ...ghostButtonStyle, border: '1px solid rgba(0,180,216,0.35)', background: 'rgba(0,180,216,0.12)', color: '#7dd3fc' }}>
          ✨ Correction automatique
        </button>
        <button type="button" onClick={handleColorReset} style={ghostButtonStyle}>🔄 Réinitialiser les couleurs</button>
      </div>

      <div className="ovx-color-editor-layout" style={{ display: 'grid', gridTemplateColumns: '290px 1fr 290px', gap: '16px', alignItems: 'start', width: '100%', minWidth: 0 }}>
        {/* GAUCHE : lumière & tonalité */}
        <div className="ovx-color-editor-panel" style={panelStyle}>
          <div style={{ ...panelTitleStyle, marginBottom: '8px' }}>MONITEURS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' }}>
            {[['hist', 'Histogramme'], ['wave', 'Forme d’onde'], ['vector', 'Vectorscope']].map(([id, label]) => (
              <button key={id} type="button" aria-pressed={scopeMode === id} onClick={() => setScopeMode(id)} style={{ padding: '4px 2px', borderRadius: '5px', border: scopeMode === id ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.08)', background: scopeMode === id ? 'rgba(0,180,216,0.15)' : '#27272a', color: scopeMode === id ? '#38bdf8' : '#9ca3af', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
          <canvas ref={histRef} width={256} height={160} aria-label="Moniteur du rendu" style={{ width: '100%', aspectRatio: '256 / 160', background: '#0c0c0f', borderRadius: '6px', marginBottom: '14px', display: 'block' }} />

          <div style={panelTitleStyle}>CORRECTION GUIDÉE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <button type="button" onClick={() => runAuto('tone', 'Étape 1 : exposition, contraste, noirs et blancs équilibrés.')} style={{ ...ghostButtonStyle, color: '#d1d5db', justifyContent: 'flex-start' }}>1 · Équilibrer l’exposition</button>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => runAuto('wb', 'Étape 2 : balance des blancs corrigée automatiquement.')} style={{ ...ghostButtonStyle, color: '#d1d5db', flex: 1, justifyContent: 'center' }}>2 · Blancs auto</button>
              <button type="button" onClick={() => setPipetteMode(pipetteMode === 'wb' ? null : 'wb')} style={{ ...ghostButtonStyle, color: pipetteMode === 'wb' ? '#38bdf8' : '#d1d5db', border: pipetteMode === 'wb' ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)', flex: 1, justifyContent: 'center' }}>⚪ Point neutre</button>
            </div>
            <button type="button" onClick={() => runAuto('color', 'Étape 3 : vibrance ajustée.')} style={{ ...ghostButtonStyle, color: '#d1d5db', justifyContent: 'flex-start' }}>3 · Raviver les couleurs</button>
            <button type="button" onClick={() => { setActiveBand('orange'); setAdvancedTab('hsl'); }} style={{ ...ghostButtonStyle, color: '#fbbf24', justifyContent: 'flex-start' }}>4 · Isoler les tons chair (HSL)</button>
          </div>
          <PanelTitle onReset={() => resetKeys(TONE_SLIDERS)}>LUMIÈRE & TONALITÉ</PanelTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TONE_SLIDERS.map(([label, key, min]) => (
              <SliderRow key={key} label={label} min={min} value={colorSettings[key]} onChange={(v) => updateColor({ [key]: v })} />
            ))}
          </div>
        </div>

        {/* CENTRE : aperçu + étalonnage avancé */}
        <div className="ovx-color-editor-center" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          {renderPreview()}
          {renderAdvanced()}
        </div>

        {/* DROITE : pipette, couleur, détails */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {renderAutoDetect()}
          <div className="ovx-color-editor-panel" style={panelStyle}>
            <div style={{ ...panelTitleStyle, marginBottom: '8px' }}>COULEUR DU POINT</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '10px', lineHeight: '1.3' }}>Cliquez sur la photo pour sélectionner la famille de couleur correspondante dans HSL.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPipetteMode(pipetteMode === 'hsl' ? null : 'hsl')}
                style={{ flex: 1, height: '32px', borderRadius: '6px', border: isEyedropperActive ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)', background: isEyedropperActive ? 'rgba(0,180,216,0.2)' : '#27272a', color: isEyedropperActive ? '#38bdf8' : '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
              >
                🎯 {pipetteMode === 'hsl' ? 'Actif (cliquez sur l’image)' : 'Pipette'}
              </button>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: sampledColor, border: '2px solid rgba(255,255,255,0.2)' }} title={`Couleur échantillonnée : ${sampledColor}`} />
            </div>
          </div>

          <div style={panelStyle}>
            <PanelTitle onReset={() => resetKeys(COLOR_SLIDERS)}>COULEUR & AMBIANCE</PanelTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {COLOR_SLIDERS.map(([label, key, min]) => (
                <SliderRow key={key} label={label} min={min} value={colorSettings[key]} onChange={(v) => updateColor({ [key]: v })} />
              ))}
            </div>
          </div>

          <div style={panelStyle}>
            <PanelTitle onReset={() => resetKeys(DETAIL_SLIDERS)}>DÉTAILS & FINITION</PanelTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DETAIL_SLIDERS.map(([label, key, min]) => (
                <SliderRow key={key} label={label} min={min} value={colorSettings[key]} onChange={(v) => updateColor({ [key]: v })} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {renderStatus()}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {renderExportOptions()}
        <button
          type="button"
          onClick={handleApply}
          disabled={isSaving || isExporting}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', background: isSaving || isExporting ? '#52525b' : '#ffffff', color: '#09090b', fontSize: '13px', fontWeight: '700', cursor: isSaving || isExporting ? 'not-allowed' : 'pointer', opacity: isSaving || isExporting ? 0.7 : 1, boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }}
        >
          {applyLabel}
        </button>
      </div>
    </div>
  );

  const tabButtonStyle = (active, size) => ({
    border: 'none',
    background: active ? 'rgba(0,180,216,0.18)' : 'transparent',
    color: active ? '#00b4d8' : size === 'lg' ? '#fff' : '#aaa',
    cursor: 'pointer',
    fontSize: size === 'lg' ? '14px' : '11px',
    fontWeight: active ? 600 : size === 'lg' ? 400 : 600,
    padding: size === 'lg' ? '8px 12px' : '0 12px',
    height: size === 'lg' ? undefined : '30px',
    borderRadius: size === 'lg' ? '8px' : '4px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  });

  return (
    <div className="ovx-filter-root" style={{ width: '100%', height: '100%', minHeight: '680px', display: 'flex', flexDirection: 'column', background: '#121216', color: '#fff', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .ovx-filter-root { min-width: 0; position: relative; }
        .ovx-filter-dialog-tabs { flex-shrink: 0; }
        .ovx-filter-presets-grid { min-width: 0; }
        .ovx-color-editor-layout > * { min-width: 0; }
        .ovx-filter-root button:focus-visible, .ovx-filter-root input:focus-visible, .ovx-filter-root select:focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
        @media (max-width: 1100px) {
          .ovx-color-editor-layout { grid-template-columns: minmax(0, 1fr) !important; }
          .ovx-color-editor-layout > .ovx-color-editor-center { order: -1; }
        }
        @media (max-width: 760px) {
          .ovx-filter-root { min-height: 0 !important; height: 100dvh !important; position: relative !important; }
          .ovx-filter-dialog { position: absolute !important; inset: 90px 0 0 0 !important; padding: 0 !important; align-items: stretch !important; justify-content: stretch !important; background: #111 !important; backdrop-filter: none !important; }
          .ovx-filter-dialog-content { width: 100% !important; max-width: none !important; max-height: none !important; height: 100% !important; border-radius: 0 !important; box-shadow: none !important; }
          .ovx-filter-dialog-tabs { display: none !important; }
          .ovx-filter-dialog-content > div:last-child { min-height: 0 !important; }
          .ovx-filter-presets-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 8px !important; width: 100% !important; overflow: visible !important; padding: 2px 1px 8px !important; }
          .ovx-filter-presets-grid > button { width: 100% !important; min-width: 0 !important; min-height: 54px !important; }
          .ovx-filter-presets-grid > button > span { font-size: 9px !important; }
          .ovx-color-editor-scroll { padding: 10px !important; gap: 10px !important; }
          .ovx-color-editor-panel { width: 100% !important; padding: 10px !important; }
          .ovx-color-editor-center { width: 100% !important; }
          .ovx-color-editor-center #compare-container { max-width: 100% !important; }
        }
        @media (max-width: 420px) {
          .ovx-filter-presets-grid { gap: 6px !important; }
          .ovx-filter-presets-grid > button { min-height: 48px !important; }
          .ovx-color-editor-scroll { padding: 7px !important; gap: 8px !important; }
        }
        @media (prefers-reduced-motion: reduce) { .ovx-filter-root * { transition: none !important; } }
      `}</style>

      <div style={{ height: '48px', minHeight: '48px', display: 'flex', alignItems: 'center', padding: '0 16px', background: '#18181d', borderBottom: '1px solid rgba(255,255,255,0.08)', boxSizing: 'border-box' }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 10px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
          <span>←</span><span>Retour</span>
        </button>
      </div>

      <div role="tablist" style={{ height: '42px', minHeight: '42px', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px', background: '#151519', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', boxSizing: 'border-box' }}>
        {TOP_TABS.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={activeTool === tab.id} onClick={() => openInspector(tab.id)} style={tabButtonStyle(activeTool === tab.id, 'sm')}>
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {!isInspectorOpen && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#0d0d10' }}>
          <div style={{ textAlign: 'center', color: '#777', fontSize: '12px' }}>
            Sélectionnez<br /><strong style={{ color: '#00b4d8' }}>Filtre</strong> ou <strong style={{ color: '#00b4d8' }}>Couleur</strong> pour ouvrir l'éditeur.
          </div>
        </div>
      )}

      {isInspectorOpen && (
        <div
          className="ovx-filter-dialog"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !isExporting && !isSaving) closeInspector(); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(6px)', boxSizing: 'border-box' }}
        >
          <div
            className="ovx-filter-dialog-content"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: PREVIEW_TABS.includes(activeTool) ? '1500px' : '900px', maxHeight: '94vh', background: '#111', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', transition: 'max-width 0.2s ease' }}
          >
            <div className="ovx-filter-dialog-tabs" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#181818', overflowX: 'auto' }}>
              <button type="button" onClick={closeInspector} disabled={isExporting || isSaving} style={{ ...tabButtonStyle(false, 'lg'), color: '#fff' }}>← Retour</button>
              {TOP_TABS.map((tab) => (
                <button key={tab.id} type="button" onClick={() => { openInspector(tab.id); }} style={tabButtonStyle(activeTool === tab.id, 'lg')}>{tab.label}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={closeInspector} disabled={isExporting || isSaving} aria-label="Fermer" style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '26px', lineHeight: 1, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              {activeTool === 'color' ? (
                renderColorEditor()
              ) : activeTool === 'filters' ? (
                renderFiltersEditor()
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', minHeight: 0, scrollbarGutter: 'stable' }}>
                    {(activeTool === 'lighting' || activeTool === 'camera' || activeTool === 'environment') &&
                      (() => {
                        const item = AI_ACTIONS.find((a) => a.id === activeTool);
                        return item ? renderAIPanel(item) : null;
                      })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filtre;
