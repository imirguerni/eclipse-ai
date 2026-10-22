import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback
} from 'react';

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

// ============================================================
// FILTRES PRÉDÉFINIS
// ============================================================

const PRESET_FILTERS = [
  {
    id: 'none',
    name: 'Aucun',
    contrast: 0,
    shadows: 0,
    blacks: 0,
    saturation: 0,
    temperature: 0,
    grain: 0,
    thumb: null
  },
  {
    id: 'eclairage',
    name: 'eclairage',
    contrast: -20,
    shadows: 15,
    blacks: 25,
    saturation: 0,
    temperature: 10,
    grain: 30,
    thumb: '/images/eclairage.webp'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    contrast: 10,
    shadows: -10,
    blacks: 10,
    saturation: -30,
    temperature: 25,
    grain: 50,
    thumb: '/images/vintage.webp'
  },
  {
    id: 'noir',
    name: 'Noir & Blanc Profond',
    contrast: 40,
    shadows: -20,
    blacks: -10,
    saturation: -100,
    temperature: 0,
    grain: 40,
    thumb: '/images/noir et blanc.webp'
  },
  {
    id: 'cyberpunk2',
    name: 'Cyberpunk Neon',
    contrast: 30,
    shadows: 20,
    blacks: -15,
    saturation: 40,
    temperature: -30,
    grain: 20,
    thumb: '/images/cyberpunk2.webp'
  },
  {
    id: 'Lueur-dorée',
    name: "Lueur dorée",
    contrast: 5,
    shadows: 10,
    blacks: 5,
    saturation: 20,
    temperature: 35,
    grain: 10,
    thumb: '/images/Lueur-dorée.webp'
  },
];

const TOP_TABS = [
  { id: 'filters', label: 'Filtre', icon: '' },
  { id: 'color', label: 'Couleur', icon: '' },
  { id: 'lighting', label: 'Éclairage IA', icon: '' },
  { id: 'environment', label: 'Environnement IA', icon: '' },
  { id: 'camera', label: 'Caméra', icon: '🎥' }
];

const AI_ACTIONS = [
  {
    id: 'color',
    label: 'Modifier la couleur',
    shortLabel: 'Couleur',
    icon: '🎨',
    prompt:
      'Adjust the color grading, tones and overall color appearance while preserving the scene, characters and actions.'
  },
  {
    id: 'style',
    label: 'Changer le style',
    shortLabel: 'Style IA',
    icon: '🎨',
    prompt:
      'Change the visual style and appearance while preserving the same scene, characters and actions.'
  },
  {
    id: 'character',
    label: 'Modifier le personnage',
    shortLabel: 'Personnage IA',
    icon: '👤',
    prompt:
      "Modify the appearance of the main character while preserving the character's identity, actions and scene."
  },
  {
    id: 'environment',
    label: 'Changer le décor',
    shortLabel: 'Décor IA',
    icon: '🏞️',
    prompt:
      'Change the environment and background while preserving the characters, actions and camera movement.'
  },
  {
    id: 'lighting',
    label: "Modifier l'éclairage",
    shortLabel: 'Éclairage IA',
    icon: '💡',
    prompt:
      'Change the lighting and atmosphere while preserving the scene, characters and actions.'
  },
  {
    id: 'effect',
    label: 'Ajouter un effet',
    shortLabel: 'Effet IA',
    icon: '✨',
    prompt:
      'Add a cinematic visual effect while preserving the original scene, characters and actions.'
  },
  {
    id: 'camera',
    label: 'Modifier la caméra',
    shortLabel: 'Caméra IA',
    icon: '🎥',
    prompt:
      'Change the camera movement and framing while preserving the scene, characters and actions.'
  },
  {
    id: 'extend',
    label: 'Prolonger la vidéo',
    shortLabel: 'Prolonger',
    icon: '⏩',
    prompt:
      'Continue the video seamlessly from the final frame. Preserve the same characters, environment, visual style, lighting and camera continuity. Continue the action naturally.'
  }
];

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
      ['/images/cyberpunk3.webp', 'Ville Cyberpunk ', 'Replace the background with a cinematic cyberpunk city.'],
      ['/images/desert.webp', 'Désert', 'Replace the background with a cinematic desert landscape.'],
      ['/images/ocean.webp', 'Océan', 'Replace the background with a cinematic ocean view.'],
      ['/images/Particules.webp', 'Particules', 'Add magical floating spark particles, with warm glints, soft depth, and subtle  atmosphere.'],
      ['/images/brume.webp', 'Brume', 'Add a misty morning fog atmosphere, with soft diffused light, low contrast, and gentle depth layers.'],
      ['/images/tornade.webp', 'Tornade', ' Ajoute une violente tornade de catégorie F5 déferle et ravage tout sur son passage, baignant la scène dans une atmosphère sombre et pesante.']

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
    subtitle: "Choisissez le nouvel éclairage de la scène.",
    options: [
      ['/images/lumiere-naturel.webp', 'Lumière naturelle', 'Use realistic natural daylight with soft cinematic shadows.'],
      ['/images/Lueur-dorée.webp', 'Lumière dorée', 'Lumière rasante dorée de fin de journée projetant de longues ombres étirées et baignant la scène dans des teintes chaudes'],
      ['/images/nuit.webp', 'Nuit', 'Transform the lighting into a realistic cinematic night scene.'],
      ['/videos/Couloir-sombre.webp', 'Cinématique', 'Use dramatic cinematic lighting with controlled highlights and shadows.'],
      ['/images/lumière-exterieur.webp', 'Lumière exterieur', 'Adjust the lighting to achieve a cinematic outdoor look, featuring soft, directional highlights, natural shadows, and an elegant contrast with the interior.'],
      ['/images/lueur-aux-chandelles.webp', 'lueur aux chandelles', 'Change the lighting to warm candlelight with flickering amber highlights, soft falloff, and intimate, low-light shadows.']
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
      ['/videos/Foret-sombre.webm', 'Drone high-angle view', 'The camera rises smoothly and moves backward, transitioning from a low-angle shot to an aerial, high-angle view.'],
      ['/videos/camera_fixe.webm', 'Camera fixe', 'add a fixed camera.']

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

const Filtre = ({
  mediaSrc,
  onBack,
  onApply,
  selectedOptionModal,
  setSelectedOptionModal,
  setVeoVideoOperation,
  prompt,
  setPrompt,
  veoReferenceImages,
  setVeoReferenceImages,
  handleFileToUrl,
  handleGenerate,
  initialTool,
  colorSettings = {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    brightness: 0,
    shadows: 0,
    highlights: 0,
    hue: 0,
    fade: 0,
    sepia: 0,
    monochrome: 0
  },
  setColorSettings
}) => {
  const [selectedFilter, setSelectedFilter] = useState(PRESET_FILTERS[0]);

  const [intensity, setIntensity] = useState(100);
  const [comparePosition, setComparePosition] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTool, setActiveTool] = useState(initialTool || 'filters');

  const [selectedAIOption, setSelectedAIOption] = useState(null);
  const [activeColorAdvancedTab, setActiveColorAdvancedTab] = useState('curves');

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(35.24);

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [sampledColor, setSampledColor] = useState('#00b4d8');

  const originalVideoRef = useRef(null);
  const filteredVideoRef = useRef(null);
  const isDraggingCompare = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    setIsInspectorOpen(true);
  }, []);

  const activeMedia =
    mediaSrc ||
    'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1185-large.mp4';

  const isVideo =
    typeof activeMedia === 'string' &&
    (
      /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(activeMedia) ||
      (
        activeMedia.startsWith('http') &&
        !/\.(jpg|jpeg|png|webp|gif)(\?|#|$)/i.test(activeMedia)
      )
    );

  const factor = intensity / 100;

  const currentContrast =
    (selectedFilter.contrast + (colorSettings.contrast || 0)) * factor;

  const currentShadows =
    (selectedFilter.shadows + (colorSettings.shadows || 0)) * factor;

  const currentHighlights = (colorSettings.highlights || 0) * factor;

  const currentSaturation =
    (selectedFilter.saturation + (colorSettings.saturation || 0)) * factor;

  const currentTemperature =
    (selectedFilter.temperature + (colorSettings.temperature || 0)) * factor;

  const currentGrain = (selectedFilter.grain || 0) * factor;

  const currentExposure = colorSettings.exposure || 0;
  const currentBrightness = colorSettings.brightness || 0;
  const currentHue = colorSettings.hue || 0;
  const currentFade = colorSettings.fade || 0;
  const currentSepia = colorSettings.sepia || 0;
  const currentMonochrome = colorSettings.monochrome || 0;
  const currentTint = Number(colorSettings.tint || 0);
  const currentVibrance = Number(colorSettings.vibrance || 0);
  const currentWhites = Number(colorSettings.whites || 0);
  const currentBlacks = Number(colorSettings.blacks || 0);
  const currentClarity = Number(colorSettings.clarity || 0);
  const currentDehaze = Number(colorSettings.dehaze || 0);
  const currentVignette = Number(colorSettings.vignette || 0);

  const curvePreview =
    ['curveShadows', 'curveDarks', 'curveMidtones', 'curveLights', 'curveHighlights'].reduce(
      (sum, key) => sum + Number(colorSettings[key] || 0),
      0
    ) / 5;

  const hslNames = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Magenta'];
  const totalHslHueChange = hslNames.reduce((sum, key) => sum + Number(colorSettings[`hue${key}`] || 0), 0);
  const totalHslSatChange = hslNames.reduce((sum, key) => sum + Number(colorSettings[`sat${key}`] || 0), 0);
  const totalHslLumChange = hslNames.reduce((sum, key) => sum + Number(colorSettings[`lum${key}`] || 0), 0);

  const filterStyle = {
    filter: `
      contrast(${Math.max(0, 100 + currentContrast - currentFade * 0.35 + curvePreview * 0.3 + currentClarity * 0.28 + currentDehaze * 0.22)}%)
      brightness(${
        100 +
        currentExposure * 0.5 +
        currentBrightness * 0.3 +
        currentShadows * 0.2 +
        currentHighlights * 0.3 +
        currentFade * 0.12 +
        curvePreview * 0.2 +
        totalHslLumChange * 0.25 + currentWhites * 0.18 + currentBlacks * 0.18
      }%)
      saturate(${Math.max(0, 100 + currentSaturation + totalHslSatChange * 0.45 + currentVibrance * 0.4 + currentDehaze * 0.12)}%)
      hue-rotate(${currentHue * 3.6 + totalHslHueChange * 1.2}deg)
      sepia(${currentSepia}%)
      grayscale(${currentMonochrome}%)
    `,
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  };

  const temperatureOpacity = Math.abs(currentTemperature) / 300;

  const temperatureStyle = {
    position: 'absolute',
    inset: 0,
    background:
      currentTemperature > 0
        ? `rgba(255,140,0,${temperatureOpacity})`
        : `rgba(0,150,255,${temperatureOpacity})`,
    mixBlendMode: 'color',
    pointerEvents: 'none'
  };

  const tintOpacity = Math.min(0.28, Math.abs(currentTint) / 350);
  const tintStyle = {
    position: 'absolute',
    inset: 0,
    background: currentTint > 0
      ? `rgba(255, 0, 110, ${tintOpacity})`
      : `rgba(0, 255, 90, ${tintOpacity})`,
    mixBlendMode: 'color',
    pointerEvents: 'none'
  };

  const vignetteStyle = {
    position: 'absolute',
    inset: 0,
    background: currentVignette >= 0
      ? `radial-gradient(ellipse at center, transparent ${Math.max(12, 82 - currentVignette * 0.55)}%, rgba(0,0,0,${Math.min(0.82, currentVignette / 120)}) 100%)`
      : `radial-gradient(ellipse at center, rgba(255,255,255,${Math.min(0.35, Math.abs(currentVignette) / 300)}) 0%, transparent 78%)`,
    pointerEvents: 'none'
  };

  const wheelPreviewStyle = (key, placement) => {
    const hex = /^#[0-9a-f]{6}$/i.test(colorSettings?.[key] || '') ? colorSettings[key] : '#808080';
    const amount = Math.max(0, Math.min(100, Number(colorSettings?.[`${key}Amount`] || 0)));
    const opacity = amount / 100 * 0.34;
    const gradient = placement === 'shadows'
      ? `linear-gradient(to top, ${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent 72%)`
      : placement === 'highlights'
        ? `linear-gradient(to bottom, ${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent 72%)`
        : `radial-gradient(ellipse at center, ${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent 78%)`;
    return { position: 'absolute', inset: 0, background: gradient, mixBlendMode: 'color', pointerEvents: 'none' };
  };

  const getWheelMarkerStyle = (hex, amount) => {
    const raw = String(hex || '#808080').replace('#', '');
    const r = parseInt(raw.slice(0, 2), 16) / 255;
    const g = parseInt(raw.slice(2, 4), 16) / 255;
    const b = parseInt(raw.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let hue = 0;
    if (d) {
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue = (hue * 60 + 360) % 360;
    }
    const angle = (hue - 90) * Math.PI / 180;
    const radius = Math.max(0, Math.min(1, Number(amount || 0) / 100)) * 29;
    return { position: 'absolute', left: `${37 + Math.cos(angle) * radius}px`, top: `${37 + Math.sin(angle) * radius}px`, width: '10px', height: '10px', background: hex, border: '2px solid #fff', borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' };
  };

  const updateColorWheelFromPointer = (event, key) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const radius = Math.sqrt(x * x + y * y);
    const normalizedRadius = Math.max(0, Math.min(1, radius / (Math.min(rect.width, rect.height) / 2 - 4)));
    const hue = (Math.atan2(y, x) * 180 / Math.PI + 450) % 360;
    const c = Math.abs((hue % 120) / 60 - 1);
    let r = 0, g = 0, b = 0;
    if (hue < 60) { r = 1; g = c; }
    else if (hue < 120) { r = c; g = 1; }
    else if (hue < 180) { g = 1; b = c; }
    else if (hue < 240) { g = c; b = 1; }
    else if (hue < 300) { r = c; b = 1; }
    else { r = 1; b = c; }
    const toHex = value => Math.round(value * 255).toString(16).padStart(2, '0');
    const newHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const amount = Math.round(normalizedRadius * 100);
    setColorSettings?.(prev => ({ ...prev, [key]: newHex, [`${key}Amount`]: amount }));
    setIsApplied(false);
    setExportError('');
  };

  useEffect(() => {
    if (!isVideo) return;
    const original = originalVideoRef.current;
    const filtered = filteredVideoRef.current;
    if (!original || !filtered) return;

    const handleLoadedMetadata = () => {
      if (original.duration && Number.isFinite(original.duration)) {
        setDuration(original.duration);
      }
    };

    const syncFiltered = () => {
      if (Math.abs(filtered.currentTime - original.currentTime) > 0.05) {
        try {
          filtered.currentTime = original.currentTime;
        } catch {}
      }
      if (original.duration) {
        setCurrentTime(original.currentTime);
      }
    };

    const handlePlay = () => {
      filtered.play().catch(() => {});
      setIsPlaying(true);
    };
    const handlePause = () => {
      filtered.pause();
      setIsPlaying(false);
    };

    original.addEventListener('loadedmetadata', handleLoadedMetadata);
    original.addEventListener('play', handlePlay);
    original.addEventListener('pause', handlePause);
    original.addEventListener('timeupdate', syncFiltered);

    return () => {
      original.removeEventListener('loadedmetadata', handleLoadedMetadata);
      original.removeEventListener('play', handlePlay);
      original.removeEventListener('pause', handlePause);
      original.removeEventListener('timeupdate', syncFiltered);
    };
  }, [isVideo, activeMedia, isInspectorOpen]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const togglePlay = async () => {
    if (!isVideo) return;
    const original = originalVideoRef.current;
    const filtered = filteredVideoRef.current;
    if (!original || !filtered) return;

    if (original.paused) {
      try {
        await Promise.all([original.play(), filtered.play()]);
        setIsPlaying(true);
      } catch (error) {
        console.error('Erreur lecture vidéo :', error);
      }
    } else {
      original.pause();
      filtered.pause();
      setIsPlaying(false);
    }
  };

  const handleSelectFilter = (filter) => {
    setActiveTool('filters');
    setSelectedFilter(filter);
    setIntensity(100);
    setIsApplied(false);
    setExportError('');
    setSelectedOptionModal?.(null);
  };

  const handleFiltersReset = () => {
    setSelectedFilter(PRESET_FILTERS[0]);
    setIntensity(100);
    setIsApplied(false);
    setExportError('');
  };

  const handleColorReset = () => {
    setColorSettings?.({
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      brightness: 0,
      shadows: 0,
      highlights: 0,
      hue: 0,
      fade: 0,
      sepia: 0,
      monochrome: 0,
      tint: 0, vibrance: 0, whites: 0, blacks: 0, clarity: 0, dehaze: 0, vignette: 0,
      curveShadows: 0, curveDarks: 0, curveMidtones: 0, curveLights: 0, curveHighlights: 0,
      wheelShadows: '#808080', wheelShadowsAmount: 0,
      wheelMidtones: '#808080', wheelMidtonesAmount: 0,
      wheelHighlights: '#808080', wheelHighlightsAmount: 0,
      ...Object.fromEntries(['red','orange','yellow','green','cyan','blue','purple','magenta'].flatMap(c => [[`hue${c[0].toUpperCase()}${c.slice(1)}`,0],[`sat${c[0].toUpperCase()}${c.slice(1)}`,0],[`lum${c[0].toUpperCase()}${c.slice(1)}`,0]]))
    });
    setIsApplied(false);
    setExportError('');
  };

  const handleAutoColorCorrection = () => {
    try {
      const source = isVideo ? originalVideoRef.current : document.querySelector('#compare-container img');
      if (!source) throw new Error('Aucune image disponible pour la correction automatique.');

      const sourceWidth = isVideo ? source.videoWidth : source.naturalWidth;
      const sourceHeight = isVideo ? source.videoHeight : source.naturalHeight;
      if (!sourceWidth || !sourceHeight) throw new Error('Le média n’est pas encore chargé.');

      const scale = Math.min(1, 256 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas non disponible.');
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let lumSum = 0, lumSqSum = 0, rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3] / 255;
        if (a < 0.05) continue;
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        lumSum += lum;
        lumSqSum += lum * lum;
        rSum += r; gSum += g; bSum += b;
        count++;
      }
      if (!count) throw new Error('Impossible d’analyser les pixels du média.');

      const meanLum = lumSum / count;
      const deviation = Math.sqrt(Math.max(0, lumSqSum / count - meanLum * meanLum));
      const meanR = rSum / count, meanG = gSum / count, meanB = bSum / count;
      const exposure = Math.max(-35, Math.min(35, Math.round((0.46 - meanLum) * 75)));
      const contrast = Math.max(-20, Math.min(25, Math.round((0.22 - deviation) * 85)));
      const saturation = Math.max(-15, Math.min(22, Math.round((42 - (Math.max(meanR, meanG, meanB) - Math.min(meanR, meanG, meanB))) * 0.18)));
      const temperature = Math.max(-18, Math.min(18, Math.round((meanB - meanR) / 12)));
      const tint = Math.max(-12, Math.min(12, Math.round((meanR + meanB - 2 * meanG) / 28)));

      setColorSettings?.((prev) => ({
        ...(prev || {}),
        exposure,
        contrast,
        saturation,
        temperature,
        tint
      }));
      setIsApplied(false);
      setExportError('');
      setSaveMessage('Correction automatique calculée. Ajustez les curseurs si nécessaire.');
    } catch (error) {
      console.error('Correction automatique impossible :', error);
      setExportError(error?.message || 'La correction automatique a échoué. Vérifiez que le média est accessible.');
    }
  };

  const handleAIReset = () => {
    setSelectedAIOption(null);
    setPrompt?.('');
  };

  const handleCompareMove = useCallback((clientX, targetElement) => {
    if (!targetElement) return;
    const rect = targetElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setComparePosition(percentage);
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      const container = document.getElementById('compare-container');
      if (isDraggingCompare.current) {
        handleCompareMove(e.clientX, container);
      }
    };
    const onMouseUp = () => {
      isDraggingCompare.current = false;
    };
    const onTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const container = document.getElementById('compare-container');
      if (isDraggingCompare.current) {
        handleCompareMove(touch.clientX, container);
      }
    };
    const onTouchEnd = () => {
      isDraggingCompare.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleCompareMove]);

  const getCanvasFilter = () => {
    return `
      contrast(${Math.max(0, 100 + currentContrast - currentFade * 0.35 + currentClarity * 0.28 + currentDehaze * 0.22)}%)
      brightness(${Math.max(0, 100 + currentExposure * 0.5 + currentBrightness * 0.3 + currentShadows * 0.2 + currentFade * 0.12)}%)
      saturate(${Math.max(0, 100 + currentSaturation + currentDehaze * 0.12)}%)
      hue-rotate(${currentHue * 3.6}deg)
      sepia(${Math.max(0, Math.min(100, currentSepia))}%)
      grayscale(${Math.max(0, Math.min(100, currentMonochrome))}%)
    `;
  };

  const applyAdvancedColorGrading = (ctx, width, height) => {
    const settings = colorSettings || {};
    const curveKeys = ['curveShadows', 'curveDarks', 'curveMidtones', 'curveLights', 'curveHighlights'];
    const curveValues = curveKeys.map((key) => Number(settings[key] || 0));
    const hslColors = [
      ['red', 0], ['orange', 30], ['yellow', 60], ['green', 120],
      ['cyan', 180], ['blue', 240], ['purple', 275], ['magenta', 320]
    ];
    const wheelKeys = ['wheelShadows', 'wheelMidtones', 'wheelHighlights'];
    const wheelColors = wheelKeys.map((key, i) => ({
      color: settings[key] || '#808080',
      amount: Math.max(0, Math.min(100, Number(settings[`${key}Amount`] || 0))) / 100,
      range: i
    }));

    let frame;
    try {
      frame = ctx.getImageData(0, 0, width, height);
    } catch (e) {
      console.error('Étalonnage avancé impossible sur le rendu final :', e);
      return;
    }
    const data = frame.data;
    const wheelRGB = wheelColors.map((w) => {
      const m = String(w.color).match(/^#?([0-9a-f]{6})$/i);
      const hex = m ? m[1] : '808080';
      return {
        ...w,
        rgb: [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
      };
    });

    const rgbToHsl = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      let h = 0, l = (max + min) / 2, sat = 0;
      if (d) {
        sat = d / (1 - Math.abs(2 * l - 1));
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60; if (h < 0) h += 360;
      }
      return [h, sat, l];
    };

    const hslToRgb = (h, s, l) => {
      h = ((h % 360) + 360) % 360;
      s = Math.max(0, Math.min(1, s));
      l = Math.max(0, Math.min(1, l));
      const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
      let rr = 0, gg = 0, bb = 0;
      if (h < 60) { rr = c; gg = x; }
      else if (h < 120) { rr = x; gg = c; }
      else if (h < 180) { gg = c; bb = x; }
      else if (h < 240) { gg = x; bb = c; }
      else if (h < 300) { rr = x; bb = c; }
      else { rr = c; bb = x; }
      return [(rr + m) * 255, (gg + m) * 255, (bb + m) * 255];
    };

    const hueDistance = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
    const bands = hslColors.map(([name, center]) => ({
      name,
      center,
      hue: Number(settings[`hue${name[0].toUpperCase()}${name.slice(1)}`] || 0),
      sat: Number(settings[`sat${name[0].toUpperCase()}${name.slice(1)}`] || 0),
      lum: Number(settings[`lum${name[0].toUpperCase()}${name.slice(1)}`] || 0)
    }));

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];
      let [h, sat, l] = rgbToHsl(r, g, b);

      let hueShift = 0, satShift = 0, lumShift = 0, totalWeight = 0;
      for (const band of bands) {
        const dist = hueDistance(h, band.center);
        const weight = Math.max(0, 1 - dist / 38);
        if (weight > 0) {
          hueShift += band.hue * weight;
          satShift += band.sat * weight;
          lumShift += band.lum * weight;
          totalWeight += weight;
        }
      }
      if (totalWeight > 0) {
        h += hueShift / totalWeight;
        sat = Math.max(0, Math.min(1, sat + (satShift / totalWeight / 100) * 0.65));
        l = Math.max(0, Math.min(1, l + (lumShift / totalWeight / 100) * 0.5));
      }
      sat = Math.max(0, Math.min(1, sat + (currentVibrance / 100) * (1 - sat) * 0.55));
      [r, g, b] = hslToRgb(h, sat, l);

      const tintShift = currentTint * 0.22;
      r += tintShift * 0.55;
      g -= tintShift * 0.75;
      b += tintShift * 0.55;

      const pixelLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const whiteWeight = Math.max(0, Math.min(1, (pixelLum - 0.55) / 0.45));
      const blackWeight = Math.max(0, Math.min(1, (0.45 - pixelLum) / 0.45));
      const tonalShift = currentWhites * whiteWeight * 0.42 + currentBlacks * blackWeight * 0.42;
      r += tonalShift; g += tonalShift; b += tonalShift;
      if (pixelLum > 0.6) {
        const highlightWeight = (pixelLum - 0.6) / 0.4;
        r += currentHighlights * 0.4 * highlightWeight;
        g += currentHighlights * 0.4 * highlightWeight;
        b += currentHighlights * 0.4 * highlightWeight;
      }

      const weights = [
        Math.max(0, 1 - pixelLum * 4),
        Math.max(0, 1 - Math.abs(pixelLum - 0.28) * 3),
        Math.max(0, 1 - Math.abs(pixelLum - 0.5) * 3),
        Math.max(0, 1 - Math.abs(pixelLum - 0.72) * 3),
        Math.max(0, (pixelLum - 0.7) / 0.3)
      ];
      let curveDelta = 0;
      for (let j = 0; j < 5; j++) curveDelta += curveValues[j] * weights[j];
      r += curveDelta * 0.42;
      g += curveDelta * 0.42;
      b += curveDelta * 0.42;

      const ranges = [
        Math.max(0, 1 - pixelLum * 2.2),
        Math.max(0, 1 - Math.abs(pixelLum - 0.5) * 2.2),
        Math.max(0, (pixelLum - 0.35) * 1.55)
      ];
      for (let j = 0; j < 3; j++) {
        const w = wheelRGB[j], amount = w.amount * ranges[j] * 0.38;
        if (amount) {
          r = r * (1 - amount) + w.rgb[0] * amount;
          g = g * (1 - amount) + w.rgb[1] * amount;
          b = b * (1 - amount) + w.rgb[2] * amount;
        }
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(frame, 0, 0);
  };

  const drawTemperatureOverlay = (ctx, width, height) => {
    if (currentTemperature === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = currentTemperature > 0 ? `rgba(255,140,0,${temperatureOpacity})` : `rgba(0,150,255,${temperatureOpacity})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  const drawVignette = (ctx, width, height) => {
    if (!currentVignette) return;
    const gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.5, Math.min(width, height) * 0.18,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.72
    );
    if (currentVignette > 0) {
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.55, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.82, currentVignette / 120)})`);
    } else {
      gradient.addColorStop(0, `rgba(255,255,255,${Math.min(0.28, Math.abs(currentVignette) / 350)})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
    }
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  const drawGrain = (ctx, width, height) => {
    if (currentGrain <= 0) return;
    const amount = Math.min(0.18, currentGrain / 500);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * amount;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const exportImage = async () => {
    setIsExporting(true);
    setExportError('');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Impossible de charger l’image."));
        img.src = activeMedia;
      });
      const width = img.naturalWidth || 1920;
      const height = img.naturalHeight || 1080;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas non disponible.');

      ctx.filter = getCanvasFilter();
      ctx.drawImage(img, 0, 0, width, height);
      ctx.filter = 'none';

      applyAdvancedColorGrading(ctx, width, height);
      drawTemperatureOverlay(ctx, width, height);
      drawVignette(ctx, width, height);
      if (currentGrain > 0) drawGrain(ctx, width, height);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (!result) { reject(new Error("Impossible de créer l’image.")); return; }
          resolve(result);
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);

      return {
        blob,
        url,
        mimeType: 'image/png',
        fileName: `filtre-${Date.now()}.png`,
        type: 'IMAGE',
        colorGradingBakedIn: true
      };
    } catch (error) {
      console.error('Erreur export image :', error);
      setExportError('Impossible de générer l’image filtrée.');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const exportVideoMediabunny = async () => {
    setIsExporting(true);
    setExportError('');
    let output = null;
    let videoSource = null;
    let audioSource = null;

    try {
      const response = await fetch(activeMedia);
      if (!response.ok) {
        throw new Error(`Impossible de récupérer la vidéo source (${response.status}).`);
      }
      const sourceBlob = await response.blob();
      const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(sourceBlob) });
      const inputVideoTrack = await input.getPrimaryVideoTrack();
      if (!inputVideoTrack) throw new Error('Aucune piste vidéo trouvée.');
      if (!(await inputVideoTrack.canDecode())) {
        throw new Error('Mediabunny ne peut pas décoder cette vidéo.');
      }

      const sourceDuration = await inputVideoTrack.computeDuration();
      if (!sourceDuration || !Number.isFinite(sourceDuration)) {
        throw new Error('Durée vidéo invalide.');
      }

      const width = Math.max(2, Math.round(await inputVideoTrack.getDisplayWidth()));
      const height = Math.max(2, Math.round(await inputVideoTrack.getDisplayHeight()));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!ctx) throw new Error('Canvas non disponible.');

      output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget()
      });

      videoSource = new CanvasSource(canvas, {
        codec: 'avc',
        bitrate: Math.max(8_000_000, Math.min(24_000_000, width * height * 12)),
        keyFrameInterval: 2
      });
      output.addVideoTrack(videoSource, { frameRate: 30 });

      let audioSink = null;
      try {
        const inputAudioTrack = await input.getPrimaryAudioTrack();
        if (inputAudioTrack && await inputAudioTrack.canDecode()) {
          audioSink = new AudioSampleSink(inputAudioTrack);
          audioSource = new AudioSampleSource({ codec: 'aac', bitrate: 128000 });
          output.addAudioTrack(audioSource);
        }
      } catch (audioSetupError) {
        console.warn('Piste audio indisponible, export vidéo sans audio :', audioSetupError);
        audioSink = null;
        audioSource = null;
      }

      await output.start();

      const sink = new CanvasSink(inputVideoTrack, {
        width,
        height,
        fit: 'contain',
        poolSize: 2,
        alpha: false
      });

      const audioPromise = audioSink && audioSource
        ? (async () => {
            try {
              for await (const sample of audioSink.samples(0, sourceDuration)) {
                try {
                  await audioSource.add(sample);
                } finally {
                  sample.close();
                }
              }
            } finally {
              audioSource?.close();
            }
          })()
        : Promise.resolve();

      for await (const frame of sink.canvases(0, sourceDuration)) {
        ctx.clearRect(0, 0, width, height);
        ctx.filter = getCanvasFilter();
        ctx.drawImage(frame.canvas, 0, 0, width, height);
        ctx.filter = 'none';

        applyAdvancedColorGrading(ctx, width, height);
        drawTemperatureOverlay(ctx, width, height);
        drawVignette(ctx, width, height);
        if (currentGrain > 0) drawGrain(ctx, width, height);

        await videoSource.add(frame.timestamp, frame.duration);
      }

      await audioPromise;
      videoSource.close();
      audioSource?.close();
      await output.finalize();

      const buffer = output.target.buffer;
      if (!buffer) throw new Error('Impossible de récupérer le fichier MP4 généré.');

      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);

      return {
        blob,
        url,
        mimeType: 'video/mp4',
        fileName: `filtre-${Date.now()}.mp4`,
        type: 'VIDEO',
        colorGradingBakedIn: true
      };
    } catch (error) {
      console.error('Erreur export Mediabunny :', error);
      setExportError(error?.message || 'Impossible de générer la vidéo.');
      throw error;
    } finally {
      try { videoSource?.close(); } catch {}
      try { audioSource?.close(); } catch {}
      setIsExporting(false);
    }
  };

  const generateFilteredMedia = async () => {
    if (isVideo) return await exportVideoMediabunny();
    return await exportImage();
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
        contrast: currentContrast,
        shadows: currentShadows,
        highlights: currentHighlights,
        saturation: currentSaturation,
        temperature: currentTemperature,
        grain: currentGrain
      };

      const result = await generateFilteredMedia();
      if (!result) throw new Error('Aucun résultat généré par le filtre.');

      setIsApplied(true);
      if (typeof onApply === 'function') {
        const mediaToApply = {
          ...result,
          settings,
          originalUrl: activeMedia,
          filterName: selectedFilter.name,
          intensity
        };
        await onApply(mediaToApply);
        setSaveMessage('Le média est enregistré dans votre historique.');
        await new Promise((resolve) => setTimeout(resolve, 1200));
        closeInspector();
      }
    } catch (error) {
      console.error('❌ Erreur application filtre :', error);
      setIsApplied(false);
      setExportError(error?.message || 'Impossible d’appliquer les modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (activeTool !== 'filters' && activeTool !== 'color') return null;

    return (
      <div style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#08080b' }}>
        <div
          id="compare-container"
          onMouseDown={(e) => {
            if (isEyedropperActive) {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const imgEl = originalVideoRef.current || e.currentTarget.querySelector('img');
              if (imgEl) {
                canvas.width = imgEl.videoWidth || imgEl.naturalWidth || 800;
                canvas.height = imgEl.videoHeight || imgEl.naturalHeight || 600;
                ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
                const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
                const pixel = ctx.getImageData(x, y, 1, 1).data;
                const hex = `#${[pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`;
                setSampledColor(hex);
                setIsEyedropperActive(false);

                const r = pixel[0] / 255, g = pixel[1] / 255, b = pixel[2] / 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
                let h = 0;
                if (d !== 0) {
                  if (max === r) h = ((g - b) / d) % 6;
                  else if (max === g) h = (b - r) / d + 2;
                  else h = (r - g) / d + 4;
                  h = Math.round(h * 60);
                  if (h < 0) h += 360;
                }
                let targetColor = 'red';
                if (h >= 15 && h < 45) targetColor = 'orange';
                else if (h >= 45 && h < 75) targetColor = 'yellow';
                else if (h >= 75 && h < 150) targetColor = 'green';
                else if (h >= 150 && h < 210) targetColor = 'cyan';
                else if (h >= 210 && h < 265) targetColor = 'blue';
                else if (h >= 265 && h < 300) targetColor = 'purple';
                else if (h >= 300 && h < 345) targetColor = 'magenta';

                setActiveColorAdvancedTab('hsl');
                const cap = targetColor[0].toUpperCase() + targetColor.slice(1);
                setColorSettings?.((prev) => ({ ...prev, [`sat${cap}`]: Math.min(100, Number(prev[`sat${cap}`] || 0) + 25) }));
                return;
              }
            }

            isDraggingCompare.current = true;
            handleCompareMove(e.clientX, e.currentTarget);
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            if (!touch) return;
            isDraggingCompare.current = true;
            handleCompareMove(touch.clientX, e.currentTarget);
          }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            aspectRatio: '16 / 9',
            background: '#000',
            overflow: 'hidden',
            borderRadius: '8px',
            border: isEyedropperActive ? '2px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)',
            cursor: isEyedropperActive ? 'crosshair' : 'ew-resize',
            userSelect: 'none',
            touchAction: 'none',
            boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
          }}
        >
          {isVideo ? (
            <video ref={originalVideoRef} src={activeMedia} muted playsInline loop crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          ) : (
            <img src={activeMedia} alt="Original" crossOrigin="anonymous" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          )}

          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${comparePosition}%`, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${100 / Math.max(comparePosition / 100, 0.01)}%`, minWidth: '100%' }}>
              {isVideo ? (
                <video ref={filteredVideoRef} src={activeMedia} muted playsInline loop crossOrigin="anonymous" style={filterStyle} />
              ) : (
                <img src={activeMedia} alt="Filtered" crossOrigin="anonymous" draggable={false} style={filterStyle} />
              )}
              <div style={temperatureStyle} />
              <div style={tintStyle} />
              <div style={wheelPreviewStyle('wheelShadows', 'shadows')} />
              <div style={wheelPreviewStyle('wheelMidtones', 'midtones')} />
              <div style={wheelPreviewStyle('wheelHighlights', 'highlights')} />
              <div style={vignetteStyle} />
            </div>
          </div>

          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${comparePosition}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '28px', height: '28px', borderRadius: '50%', background: '#00b4d8', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', boxSizing: 'border-box' }}>
              ↔
            </div>
          </div>

          {isEyedropperActive && (
            <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', padding: '6px 12px', background: 'rgba(0, 180, 216, 0.9)', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: '700', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
              🎯 Cliquez sur une couleur dans la vidéo...
            </div>
          )}

          <div style={{ position: 'absolute', top: '8px', left: '8px', padding: '3px 6px', background: 'rgba(0,0,0,0.7)', borderRadius: '3px', fontSize: '9px', zIndex: 12 }}>
            Modifié
          </div>
          <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '3px 6px', background: 'rgba(0,180,216,0.85)', borderRadius: '3px', fontSize: '9px', zIndex: 12 }}>
            {selectedFilter.name}
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', height: '46px', minHeight: '46px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px', background: '#141418', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', boxSizing: 'border-box', borderRadius: '0 0 8px 8px' }}>
          {isVideo && (
            <button type="button" onClick={togglePlay} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#00b4d8', color: '#fff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
          )}
          <div style={{ fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' }}>
            {activeTool === 'color' ? 'Couleur' : selectedFilter.name}
          </div>
          <span style={{ fontSize: '10px', color: '#888' }}>{intensity}%</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '9px', color: '#666' }}>Original ↔ Modifié</span>
        </div>
      </div>
    );
  };

  const renderFiltersPanel = () => (
    <>
      <div style={{ padding: '14px 15px 0 15px' }}>
        <PanelHeader title="Filtres" subtitle="Ajustez l'apparence visuelle de votre vidéo." />
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Presets</div>
        
        <div className="ovx-filter-presets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>
          {PRESET_FILTERS.map((filter) => {
            const active = selectedFilter.id === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleSelectFilter(filter)}
                style={{
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: '4px',
                  border: active ? '2px solid #00b4d8' : '0px solid rgba(255,255,255,0.1)',
                  ...(filter.thumb
                    ? {
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.0), rgba(0,0,0,0.0)), url("${filter.thumb}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : {
                        background: '#121216',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }),
                  cursor: 'pointer',
                  color: '#fff',
                  textAlign: 'left'
                }}
              >
                {!filter.thumb && (
                  <span style={{ fontSize: '16px', color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                )}
                <span style={{ position: 'absolute', left: '4px', right: '4px', bottom: '3px', fontSize: '12px', fontWeight: '600' }}>
                  {filter.name}
                </span>
              </button>
            );
          })}
          
        </div>
             <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>Intensité</span>
          <span style={{ fontSize: '11px', color: '#00b4d8', fontWeight: '700' }}>{intensity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => {
            setIntensity(Number(e.target.value));
            setIsApplied(false);
            setExportError('');
          }}
          style={{ width: '100%', accentColor: '#00b4d8', cursor: 'pointer' }}
        />
      </div>
      </div>
 <div style={{ display: 'flex', gap: '8px', padding: '0 15px 16px 15px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={handleFiltersReset}
          style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <span>🔄</span> <span>Réinitialiser</span>
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={isSaving}
          style={{ flex: 2, padding: '7px 12px', borderRadius: '8px', border: 'none', background: isSaving ? '#777' : '#ffffff', color: '#000000', fontSize: '13px', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? 'Veuillez patienter…' : 'Appliquer'}
        </button>
      </div>
      {saveMessage && <div style={{ marginTop: '6px', textAlign: 'center', fontSize: '11px', color: '#4ade80', fontWeight: '600' }}>{saveMessage}</div>}
 
    </>
  );

  const renderAIPanel = (action) => {
    const config = AI_OPTIONS[action.id];
    if (!config) return null;

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 15px 0 15px' }}>
          <PanelHeader title={config.title} subtitle={config.subtitle} />
          <button
            type="button"
            onClick={handleAIReset}
            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#27272a', color: '#f87171', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
          >
            <span>🔄</span> <span>Réinitialiser</span>
          </button>
        </div>
        <div style={{ padding: '14px 15px' }}>
<div className="ovx-ai-presets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>        {config.options.map((option) => {
  const [iconOrImage, name] = option;
  const active = selectedAIOption === name;
  const isVideo = typeof iconOrImage === 'string' && (iconOrImage.endsWith('.webm') || iconOrImage.endsWith('.mp4'));
  const isImagePath = typeof iconOrImage === 'string' && (iconOrImage.startsWith('/') || iconOrImage.startsWith('http'));

  return (
    <button
      key={name}
      type="button"
      onClick={() => {
        setSelectedAIOption(name);
        setPrompt?.(option[2]);
      }}
      style={{
        position: 'relative',
        aspectRatio: '16 / 9',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '6px',
        border: active ? '2px solid #00b4d8' : '0px solid rgba(255,255,255,0.08)',
        background: active ? 'rgba(0,180,216,0.15)' : 'rgba(255,255,255,0.02)',
        cursor: 'pointer'
      }}
    >
      {isVideo ? (
        <video
          src={iconOrImage}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
      ) : isImagePath ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${iconOrImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ) : (
        <span style={{ fontSize: '18px' }}>{iconOrImage}</span>
      )}

      <span
        style={{
          position: 'absolute',
          left: '6px',
          bottom: '6px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          zIndex: 2
        }}
      >
        {name}
      </span>
    </button>
  );
})}
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
              disabled={isExporting}
              style={{ width: '100%', height: '36px', marginTop: '6px', border: 'none', borderRadius: '6px', background: '#00b4d8', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
            >
              ✨ Générer la modification IA
            </button>
          )}
        </div>
      </>
    );
  };

  function PanelHeader({ title, subtitle }) {
    return (
      <div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{title}</div>
        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px', lineHeight: '1.3' }}>{subtitle}</div>
      </div>
    );
  }

  const sectionStyle = { padding: '14px 15px', borderBottom: '1px solid rgba(255,255,255,0.06)' };
  const sectionTitleStyle = { fontSize: '12px', fontWeight: '700', marginBottom: '8px' };

  const openInspector = (tool) => {
    setActiveTool(tool);
    setIsInspectorOpen(true);
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

  return (
    <div className="ovx-filter-root" style={{ width: '100%', height: '100%', minHeight: '680px', display: 'flex', flexDirection: 'column', background: '#121216', color: '#fff', overflow: 'hidden', fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        .ovx-filter-root { min-width: 0; position: relative; }
        .ovx-filter-dialog-tabs { flex-shrink: 0; }
        .ovx-filter-presets-grid { min-width: 0; }
        .ovx-color-editor-layout > * { min-width: 0; }
        @media (max-width: 760px) {
          .ovx-filter-root { min-height: 0 !important; height: 100dvh !important; position: relative !important; }
          .ovx-filter-dialog { position: absolute !important; inset: 90px 0 0 0 !important; padding: 0 !important; align-items: stretch !important; justify-content: stretch !important; background: #111 !important; backdrop-filter: none !important; }
          .ovx-filter-dialog-content { width: 100% !important; max-width: none !important; max-height: none !important; height: 100% !important; border-radius: 0 !important; box-shadow: none !important; }
          .ovx-filter-dialog-tabs { display: none !important; }
          .ovx-filter-dialog-content > div:last-child { min-height: 0 !important; }
          .ovx-filter-dialog-content .ovx-color-editor-scroll { min-height: 0 !important; }
          .ovx-filter-dialog-content .ovx-filter-presets-grid { flex-shrink: 0 !important; }
          .ovx-filter-presets-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            grid-auto-rows: auto !important;
            gap: 8px !important;
            width: 100% !important;
            overflow: visible !important;
            padding: 2px 1px 8px !important;
          }
          .ovx-filter-presets-grid > button {
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            aspect-ratio: 16 / 9 !important;
            min-height: 54px !important;
          }
          .ovx-filter-presets-grid > button > span { font-size: 9px !important; }
          .ovx-ai-presets-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .ovx-ai-presets-grid > button {
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            aspect-ratio: 16 / 9 !important;
            min-height: 54px !important;
          }
          .ovx-ai-presets-grid > button > span {
            font-size: 9px !important;
            line-height: 1.1 !important;
            white-space: normal !important;
            word-break: break-word !important;
          }
          .ovx-color-editor-scroll { padding: 10px !important; gap: 10px !important; }
          .ovx-color-editor-layout {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }
          .ovx-color-editor-panel { width: 100% !important; padding: 10px !important; }
          .ovx-color-editor-center { width: 100% !important; }
          .ovx-color-editor-center #compare-container { max-width: 100% !important; }
        }
        @media (max-width: 420px) {
          .ovx-filter-presets-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 6px !important; }
          .ovx-filter-presets-grid > button { width: 100% !important; min-width: 0 !important; min-height: 48px !important; height: auto !important; aspect-ratio: 16 / 9 !important; }
          .ovx-color-editor-scroll { padding: 7px !important; gap: 8px !important; }
          .ovx-filter-dialog-content .ovx-color-editor-panel { padding: 8px !important; }
        }
      `}</style>
      <div style={{ height: '48px', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#18181d', borderBottom: '1px solid rgba(255,255,255,0.08)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 10px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            <span>←</span><span>Retour</span>
          </button>
        </div>
      </div>

      <div style={{ height: '42px', minHeight: '42px', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px', background: '#151519', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', boxSizing: 'border-box' }}>
        {TOP_TABS.map((tab) => {
          const isActive = activeTool === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => openInspector(tab.id)}
              style={{ height: '30px', padding: '0 12px', borderRadius: '4px', border: 'none', background: isActive ? 'rgba(0,180,216,0.2)' : 'transparent', color: isActive ? '#00b4d8' : '#aaa', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
            >
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {!isInspectorOpen && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#0d0d10' }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' }}>
              <div style={{ textAlign: 'center', color: '#777', fontSize: '12px' }}>
                Sélectionnez<br /><strong style={{ color: '#00b4d8' }}>Filtre</strong> ou <strong style={{ color: '#00b4d8' }}>Couleur</strong> pour ouvrir l'éditeur.
              </div>
            </div>
          </div>
        </div>
      )}

 {isInspectorOpen && (
        <div className="ovx-filter-dialog" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) closeInspector(); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(6px)', boxSizing: 'border-box' }}>
          <div className="ovx-filter-dialog-content" onMouseDown={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: activeTool === 'color' ? '1500px' : '900px', maxHeight: '94vh', background: '#111', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', transition: 'max-width 0.2s ease' }}>
            
            <div className="ovx-filter-dialog-tabs" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#181818', flexShrink: 0, overflowX: 'auto' }}>
              <button type="button" onClick={closeInspector} style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: '8px 10px', borderRadius: '8px', whiteSpace: 'nowrap' }}>← Retour</button>
              <button type="button" onClick={() => { setActiveTool('filters'); setSelectedOptionModal?.(null); setSelectedAIOption(null); }} style={{ border: 'none', background: activeTool === 'filters' ? 'rgba(0,180,216,0.18)' : 'transparent', color: activeTool === 'filters' ? '#00b4d8' : '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: activeTool === 'filters' ? 600 : 400, padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>Filtre</button>
              <button type="button" onClick={() => { setActiveTool('color'); setSelectedOptionModal?.('Modifier la couleur'); setSelectedAIOption(null); }} style={{ border: 'none', background: activeTool === 'color' ? 'rgba(0,180,216,0.18)' : 'transparent', color: activeTool === 'color' ? '#00b4d8' : '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: activeTool === 'color' ? 600 : 400, padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>Couleur</button>
              <button type="button" onClick={() => openInspector('lighting')} style={{ border: 'none', background: activeTool === 'lighting' ? 'rgba(0,180,216,0.18)' : 'transparent', color: activeTool === 'lighting' ? '#00b4d8' : '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: activeTool === 'lighting' ? 600 : 400, padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>Éclairage IA</button>
              <button type="button" onClick={() => openInspector('environment')} style={{ border: 'none', background: activeTool === 'environment' ? 'rgba(0,180,216,0.18)' : 'transparent', color: activeTool === 'environment' ? '#00b4d8' : '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: activeTool === 'environment' ? 600 : 400, padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>Environnement IA</button>
              <button type="button" onClick={() => openInspector('camera')} style={{ border: 'none', background: activeTool === 'camera' ? 'rgba(0,180,216,0.18)' : 'transparent', color: activeTool === 'camera' ? '#00b4d8' : '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: activeTool === 'camera' ? 600 : 400, padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>Caméra IA</button>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={closeInspector} aria-label="Fermer" style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '26px', lineHeight: 1, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              {activeTool === 'color' ? (
                <div className="ovx-color-editor-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#111' }}>
                  
                  {/* BOUTON RESET GLOBAL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '-8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleAutoColorCorrection}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(0,180,216,0.35)', background: 'rgba(0,180,216,0.12)', color: '#7dd3fc', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <span>✨</span> <span>Correction automatique</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleColorReset}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#27272a', color: '#f87171', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <span>🔄</span> <span>Réinitialiser les réglages</span>
                    </button>
                  </div>

                  <div className="ovx-color-editor-layout" style={{ display: 'grid', gridTemplateColumns: '290px 1fr 290px', gap: '16px', alignItems: 'start', width: '100%', minWidth: 0 }}>
                    
                    {/* 1. PALETTE GAUCHE : LUMIÈRE & TONALITÉ */}
                    <div className="ovx-color-editor-panel" style={{ background: '#18181b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', minWidth: 0, boxSizing: 'border-box' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px', letterSpacing: '.5px' }}>LUMIÈRE & TONALITÉ</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          ['Exposition', 'exposure'],
                          ['Contraste', 'contrast'],
                          ['Luminosité', 'brightness'],
                          ['Ombres', 'shadows'],
                          ['Hautes lumières', 'highlights']
                        ].map(([label, key]) => (
                          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#d1d5db' }}>{label}</span>
                              <span style={{ fontSize: '10px', color: '#00b4d8', fontWeight: '700' }}>{colorSettings?.[key] ?? 0}</span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={colorSettings?.[key] ?? 0}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                requestAnimationFrame(() => {
                                  setColorSettings?.((prev) => ({ ...(prev || {}), [key]: val }));
                                  setIsApplied(false);
                                  setExportError('');
                                });
                              }}
                              style={{ width: '100%', height: '6px', accentColor: '#00b4d8', cursor: 'pointer', background: '#27272a', borderRadius: '3px' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. CENTRE : LECTEUR VIDÉO + ÉTALONNAGE AVANCÉ COMPLET */}
                    <div className="ovx-color-editor-center" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                      {renderPreview()}

                      <div style={{ background: '#18181b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', letterSpacing: '.5px' }}>ÉTALONNAGE AVANCÉ</div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', marginBottom: '12px' }}>
                          {[
                            ['curves', 'Courbes'],
                            ['wheels', 'Roues'],
                            ['hsl', 'HSL']
                          ].map(([id, label]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setActiveColorAdvancedTab(id)}
                              style={{
                                padding: '6px 4px',
                                borderRadius: '6px',
                                border: activeColorAdvancedTab === id ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.08)',
                                background: activeColorAdvancedTab === id ? 'rgba(0,180,216,0.15)' : '#27272a',
                                color: activeColorAdvancedTab === id ? '#38bdf8' : '#9ca3af',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        <div>
                          {activeColorAdvancedTab === 'curves' && (
                            <div>
                              <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '6px 8px', marginBottom: '8px' }}>
                                <svg viewBox="0 0 220 72" width="100%" height="56" role="img" aria-label="Aperçu de la courbe tonale">
                                  {[0,1,2,3,4].map(i => <g key={i}><line x1={10+i*50} y1="4" x2={10+i*50} y2="68" stroke="#303030" strokeWidth="1"/><line x1="10" y1={4+i*16} x2="210" y2={4+i*16} stroke="#303030" strokeWidth="1"/></g>)}
                                  <line x1="10" y1="68" x2="210" y2="4" stroke="#666" strokeDasharray="3 3"/>
                                  <polyline points={`10,${68-(Number(colorSettings.curveShadows||0)*.25)} 60,${52-(Number(colorSettings.curveDarks||0)*.25)} 110,${36-(Number(colorSettings.curveMidtones||0)*.25)} 160,${20-(Number(colorSettings.curveLights||0)*.25)} 210,${4-(Number(colorSettings.curveHighlights||0)*.25)}`} fill="none" stroke="#00d4f0" strokeWidth="2.5" strokeLinejoin="round"/>
                                </svg>
                                <div style={{ color: '#777', fontSize: '9px', textAlign: 'center' }}>Courbe tonale</div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 12px' }}>
                                {[
                                  ['Noirs / ombres', 'curveShadows'],
                                  ['Tons foncés', 'curveDarks'],
                                  ['Tons moyens', 'curveMidtones'],
                                  ['Tons clairs', 'curveLights'],
                                  ['Blancs / hautes lumières', 'curveHighlights']
                                ].map(([label, key]) => (
                                  <div key={key} style={{ marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: '9px', marginBottom: '2px' }}>
                                      <span>{label}</span>
                                      <span style={{ color: '#00b4d8' }}>{Number(colorSettings[key] || 0)}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="-100"
                                      max="100"
                                      value={Number(colorSettings[key] || 0)}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        requestAnimationFrame(() => {
                                          setColorSettings?.((prev) => ({ ...prev, [key]: val }));
                                          setIsApplied(false);
                                          setExportError('');
                                        });
                                      }}
                                      style={{ width: '100%', height: '5px', margin: 0, accentColor: '#00b4d8', background: '#27272a', borderRadius: '3px' }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeColorAdvancedTab === 'wheels' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ color: '#888', fontSize: '9px', marginBottom: '2px' }}>Roues chromatiques professionnelles (Style Lightroom).</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                                {[
                                  ['Ombres', 'wheelShadows'],
                                  ['Tons moyens', 'wheelMidtones'],
                                  ['Hautes lumières', 'wheelHighlights']
                                ].map(([label, key]) => {
                                  const currentHex = /^#[0-9a-f]{6}$/i.test(colorSettings[key] || '') ? colorSettings[key] : '#808080';
                                  return (
                                    <div key={key} style={{ background: '#202024', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ fontSize: '10px', fontWeight: '600', color: '#d1d5db' }}>{label}</div>
                                      
                                      <div
                                        style={{
                                          width: '74px',
                                          height: '74px',
                                          borderRadius: '50%',
                                          background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                                          position: 'relative',
                                          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7)',
                                          cursor: 'crosshair',
                                          border: '2px solid rgba(255,255,255,0.15)',
                                          touchAction: 'none'
                                        }}
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.setPointerCapture?.(e.pointerId);
                                          updateColorWheelFromPointer(e, key);
                                        }}
                                        onPointerMove={(e) => {
                                          if (e.buttons === 1 || e.pressure > 0) updateColorWheelFromPointer(e, key);
                                        }}
                                        title="Cliquez ou faites glisser pour choisir la teinte et son intensité"
                                      >
                                        <div style={getWheelMarkerStyle(currentHex, Number(colorSettings[`${key}Amount`] || 0))} />
                                      </div>

                                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#9ca3af' }}>
                                          <span>Dose</span>
                                          <span style={{ color: '#00b4d8' }}>{Number(colorSettings[`${key}Amount`] || 0)}%</span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={Number(colorSettings[`${key}Amount`] || 0)}
                                          onChange={(e) => {
                                            const val = Number(e.target.value);
                                            requestAnimationFrame(() => {
                                              setColorSettings?.((prev) => ({ ...prev, [`${key}Amount`]: val }));
                                              setIsApplied(false);
                                              setExportError('');
                                            });
                                          }}
                                          style={{ width: '100%', height: '4px', margin: 0, accentColor: '#00b4d8', background: '#18181b', borderRadius: '2px' }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {activeColorAdvancedTab === 'hsl' && (
                            <div>
                              <div style={{ color: '#888', fontSize: '9px', marginBottom: '6px' }}>Réglez la teinte, la saturation et la luminance par famille de couleurs.</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '5px' }}>
                                {[
                                  ["Rouge", 'red'], ['Orange', 'orange'], ['Jaune', 'yellow'], ['Vert', 'green'],
                                  ['Cyan', 'cyan'], ['Bleu', 'blue'], ['Violet', 'purple'], ['Magenta', 'magenta']
                                ].map(([label, color]) => {
                                  const cap = color[0].toUpperCase() + color.slice(1);
                                  return (
                                    <details key={color} style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 8px' }}>
                                      <summary style={{ cursor: 'pointer', color: '#ddd', fontSize: '10px', fontWeight: 700 }}>
                                        {label}
                                        <span style={{ float: 'right', color: '#777', fontWeight: 400, fontSize: '9px' }}>{Number(colorSettings[`sat${cap}`] || 0)} sat.</span>
                                      </summary>
                                      {[
                                        ['Teinte', `hue${cap}`, -100, 100],
                                        ['Saturation', `sat${cap}`, -100, 100],
                                        ['Luminance', `lum${cap}`, -100, 100]
                                      ].map(([name, key, min, max]) => (
                                        <div key={key} style={{ marginTop: '5px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#aaa', marginBottom: '2px' }}>
                                            <span>{name}</span>
                                            <span style={{ color: '#00b4d8' }}>{Number(colorSettings[key] || 0)}</span>
                                          </div>
                                          <input
                                            type="range"
                                            min={min}
                                            max={max}
                                            value={Number(colorSettings[key] || 0)}
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              requestAnimationFrame(() => {
                                                setColorSettings?.((prev) => ({ ...prev, [key]: val }));
                                                setIsApplied(false);
                                                setExportError('');
                                              });
                                            }}
                                            style={{ width: '100%', height: '4px', margin: 0, accentColor: '#00b4d8' }}
                                          />
                                        </div>
                                      ))}
                                    </details>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. PALETTE DROITE : COULEUR DU POINT & AMBIANCE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {/* COULEUR DU POINT (PIPETTE) */}
                      <div className="ovx-color-editor-panel" style={{ background: '#18181b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', minWidth: 0, boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', letterSpacing: '.5px' }}>COULEUR DU POINT</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '10px', lineHeight: '1.3' }}>
                          Sélectionnez une couleur dans votre photo.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                            style={{
                              flex: 1,
                              height: '32px',
                              borderRadius: '6px',
                              border: isEyedropperActive ? '1px solid #00b4d8' : '1px solid rgba(255,255,255,0.1)',
                              background: isEyedropperActive ? 'rgba(0,180,216,0.2)' : '#27272a',
                              color: isEyedropperActive ? '#38bdf8' : '#fff',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>🎯</span> <span>{isEyedropperActive ? 'Actif (Cliquez sur l’image)' : 'Pipette'}</span>
                          </button>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: sampledColor, border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} title={`Couleur échantillonnée: ${sampledColor}`} />
                        </div>
                      </div>

                      <div style={{ background: '#18181b', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px', letterSpacing: '.5px' }}>COULEUR & AMBIANCE</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            ['Saturation', 'saturation'],
                            ['Vibrance (tons peu saturés)', 'vibrance'],
                            ['Température', 'temperature'],
                            ['Teinte globale', 'hue'],
                            ['Teinte vert / magenta', 'tint'],
                            ['Blancs', 'whites'],
                            ['Noirs', 'blacks'],
                            ['Clarté / contraste local (approx.)', 'clarity'],
                            ['Correction du voile (approx.)', 'dehaze'],
                            ['Vignettage', 'vignette'],
                            ['Fondu / effet mat', 'fade'],
                            ['Sépia', 'sepia'],
                            ['Noir et blanc', 'monochrome']
                          ].map(([label, key]) => (
                            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#d1d5db' }}>{label}</span>
                                <span style={{ fontSize: '10px', color: '#00b4d8', fontWeight: '700' }}>{colorSettings?.[key] ?? 0}</span>
                              </div>
                              <input
                                type="range"
                                min={key === 'sepia' || key === 'monochrome' ? 0 : -100}
                                max="100"
                                value={colorSettings?.[key] ?? 0}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  requestAnimationFrame(() => {
                                    setColorSettings?.((prev) => ({ ...(prev || {}), [key]: val }));
                                    setIsApplied(false);
                                    setExportError('');
                                  });
                                }}
                                style={{ width: '100%', height: '6px', accentColor: '#00b4d8', cursor: 'pointer', background: '#27272a', borderRadius: '3px' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {saveMessage && <div role="status" style={{ color: '#4ade80', fontSize: '11px', lineHeight: 1.4 }}>{saveMessage}</div>}
                  {exportError && <div role="alert" style={{ color: '#fca5a5', fontSize: '11px', lineHeight: 1.4 }}>{exportError}</div>}
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isSaving || isExporting}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', background: isSaving ? '#52525b' : '#ffffff', color: '#09090b', fontSize: '13px', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, marginTop: '10px', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }}
                  >
                    {isSaving || isExporting ? 'Traitement en cours…' : 'Appliquer les modifications'}
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ flex: '0 0 auto', position: 'relative', zIndex: 2, background: '#08080b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {renderPreview()}
                  </div>
                  <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', minHeight: 0, scrollbarGutter: 'stable' }}>
                    {activeTool === 'filters' && renderFiltersPanel()}
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