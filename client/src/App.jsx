import Navbar from './Navbar'; 
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './App.css';
import logoEclipse from './assets/logo-eclipse.webp';
import LandingPage from './LandingPage';
import TermsPage from './TermsPage'; 
import PrivacyPage from './PrivacyPage'; 
import AuthModal from './AuthModal'; 
import TokenManager from './TokenManager';
import logoEclair from './assets/logo-token.webp';
import Pricing from './Pricing'; 
import { PRICING_DATA, PLAN_TO_PRICE, packs, ALLOWED_ENGINES } from "./pricingConfig";
import { auth, db, createUserProfile, syncCreditsToDB } from "./firebase";
import {
  onAuthStateChanged,
  getRedirectResult
} from "firebase/auth";
import MyHistoryPage from './MyHistoryPage'; 
import Success from "./Success";
import ProfilePage from './ProfilePage';
import PrivacyPolicyPage from './PrivacyPolicyPage'; 

import CgvPage from './CgvPage';
import LegalNoticePage from './LegalNoticePage';
import VideoPreview from "./VideoPreview";
import DevelopersPage from './DevelopersPage';
import ContactModal from './ContactModal';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc } from "firebase/firestore";
import './i18n';

import { useTranslation } from 'react-i18next'; 
import Filtre from './Filtre';
import Outils from './Outils';

const IMAGE_TUTORIAL_GUIDE_IDS = ["gpt_image2", "flux2pro", "nano_banana2_lite"];
const VIDEO_TUTORIAL_GUIDE_IDS = ["default", "veo3.1", "veo3.1_fast", "seedance25", "seedance20", "seedance", "kling2.6", "kling26_motion", "kling30", "hailuo", "minimax_h3", "pixverse6"];
const getImageTutorialGuide = (id, t) => {
  const guideId = IMAGE_TUTORIAL_GUIDE_IDS.includes(String(id || "").toLowerCase()) ? String(id).toLowerCase() : "gpt_image2";
  return {
    objective: t(`tutorials.image.${guideId}.objective`),
    features: t(`tutorials.image.${guideId}.features`, { returnObjects: true }),
    steps: t(`tutorials.image.${guideId}.steps`, { returnObjects: true }),
    prompt: t(`tutorials.image.${guideId}.prompt`),
    resourceUrl: t(`tutorials.image.${guideId}.resourceUrl`, { defaultValue: "" }),
    resourceLabel: t(`tutorials.image.${guideId}.resourceLabel`, { defaultValue: "" })
  };
};
const getVideoTutorialGuide = (id, t) => {
  const guideId = VIDEO_TUTORIAL_GUIDE_IDS.includes(String(id || "").toLowerCase()) ? String(id).toLowerCase() : "default";
  return {
    objective: t(`tutorials.video.${guideId}.objective`),
    features: t(`tutorials.video.${guideId}.features`, { returnObjects: true }),
    steps: t(`tutorials.video.${guideId}.steps`, { returnObjects: true }),
    prompt: t(`tutorials.video.${guideId}.prompt`)
  };
};

const VIDEO_TUTORIAL_RESOURCES = {
  "seedance20": { videoId: "tfs8U3CbAOs", videoTitleKey: "tutorialResourceLabels.seedance20Title", resourceUrl: "https://github.com/seedance-official/Seedance-2.0", resourceLabelKey: "tutorialResourceLabels.seedance20" },
  "hailuo": { videoId: "KYAlcVKJx8o", videoTitleKey: "tutorialResourceLabels.hailuoTitle", resourceUrl: "https://www.minimax.io/news/minimax-hailuo-23", resourceLabelKey: "tutorialResourceLabels.hailuo" },
  "kling2.6": { resourceUrl: "https://kling.ai/fr/quickstart", resourceLabelKey: "tutorialResourceLabels.kling2_6" },
  "kling26_motion": { resourceUrl: "https://kling.ai/fr/quickstart", resourceLabelKey: "tutorialResourceLabels.kling26_motion" },
  "kling30": { resourceUrl: "https://kling.ai/fr/quickstart", resourceLabelKey: "tutorialResourceLabels.kling30" },
  "veo3.1": { resourceUrl: "https://ai.google.dev/gemini-api/docs/veo?hl=fr", resourceLabelKey: "tutorialResourceLabels.veo3_1" },
  "veo3.1_fast": { resourceUrl: "https://ai.google.dev/gemini-api/docs/veo?hl=fr", resourceLabelKey: "tutorialResourceLabels.veo3_1_fast" },
  "minimax_h3": { resourceUrl: "https://github.com/MiniMax-AI/skills/blob/main/skills/frontend-dev/references/minimax-video-guide.md", resourceLabelKey: "tutorialResourceLabels.minimax_h3" },
  "seedance25": { resourceUrl: "https://www.seedance.tv/blog/seedance-2-0-tutorial", resourceLabelKey: "tutorialResourceLabels.seedance25" },
  "seedance": { resourceUrl: "https://github.com/seedance-official/Seedance-2.0", resourceLabelKey: "tutorialResourceLabels.seedance" }
};

const getVideoTutorialGuideKey = (engine) => {
  const id = String(engine?.id || "").toLowerCase();
  return VIDEO_TUTORIAL_GUIDE_IDS.includes(id) ? id : "default";
};

// Limites de prompt par moteur (caractères) : basées sur les schémas Runware connus.
const VIDEO_PROMPT_LIMITS = { "veo3.1": 3000, "veo3.1_fast": 3000, "seedance25": 10000, "seedance20": 10000, "seedance": 3000, "minimax_h3": 7000, "pixverse6": 5000, "kling30": 2500, "kling26_motion": 2500, "kling2.6": 2500, "hailuo": 2500 };
const getPromptLimit = (mode, engineId, hasFrameImages = false, hasSourceVideo = false) => {
  if (String(mode || "").toUpperCase() === "TEXTE") return 10000;
  const id = String(engineId || "").toLowerCase();
  if (id.includes("veo3.1")) return 3000;
  if (id.includes("seedance25") || id.includes("seedance-2.5")) return hasSourceVideo ? 9800 : 10000;
  if (id.includes("seedance20") || id.includes("seedance-2.0")) return 10000;
  if (id.includes("seedance")) return 3000;
  if (id.includes("minimax_h3") || id.includes("minimax-h3")) return hasSourceVideo ? 6800 : 7000;
  if (id.includes("pixverse6") || id.includes("pixverse-v6")) return hasFrameImages ? 2048 : hasSourceVideo ? 4900 : 5000;
  if (id.includes("kling")) return 2500;
  if (id.includes("hailuo")) return 2500;
  return VIDEO_PROMPT_LIMITS[id] || 2500;
};

// Plafond par fichier importé : image 20 Mo, vidéo 64 Mo, audio 20 Mo.
const MEDIA_UPLOAD_LIMITS = { image: 20 * 1024 * 1024, video: 64 * 1024 * 1024, audio: 20 * 1024 * 1024, other: 20 * 1024 * 1024 };
const getMediaKind = (file) => {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(name)) return "image";
  if (type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi|mkv|mpeg|mpg)$/.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac|opus)$/.test(name)) return "audio";
  return "other";
};
const getMediaLimitBytes = (file) => MEDIA_UPLOAD_LIMITS[getMediaKind(file)] || MEDIA_UPLOAD_LIMITS.other;
const formatMo = (bytes) => `${(bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;

const SUGGESTION_KEYS = [
  { id: 1, titleKey: "suggestions.image.1.title", promptKey: "suggestions.image.1.prompt", img: "/videos/Ville-Cyberpunk.webp", url: "/videos/Ville-Cyberpunk.webp" },
  { id: 2, titleKey: "suggestions.image.2.title", promptKey: "suggestions.image.2.prompt", img: "/videos/Sniper.webp", url: "/videos/Sniper.webp" },
  { id: 3, titleKey: "suggestions.image.3.title", promptKey: "suggestions.image.3.prompt", img: "/videos/Coucher-de-soleil.webp", url: "/videos/Coucher-de-soleil.webp" },
  { id: 4, titleKey: "suggestions.image.4.title", promptKey: "suggestions.image.4.prompt", img: "/videos/Combat.webp", url: "/videos/Combat.webp" },
  { id: 5, titleKey: "suggestions.image.5.title", promptKey: "suggestions.image.5.prompt", img: "/videos/penthouse-nocturne.webp", url: "/videos/penthouse-nocturne.webp" },
  { id: 6, titleKey: "suggestions.image.6.title", promptKey: "suggestions.image.6.prompt", img: "/videos/Anime1.webp", url: "/videos/Anime1.webp" },
  { id: 7, titleKey: "suggestions.image.7.title", promptKey: "suggestions.image.7.prompt", img: "/videos/Lune.webp", url: "/videos/Lune.webp" },
  { id: 8, titleKey: "suggestions.image.8.title", promptKey: "suggestions.image.8.prompt", img: "/videos/3D.webp", url: "/videos/3D.webp" },
  { id: 9, titleKey: "suggestions.image.9.title", promptKey: "suggestions.image.9.prompt", img: "/videos/Submersion.webp", url: "/videos/Submersion.webp" },
  { id: 10, titleKey: "suggestions.image.10.title", promptKey: "suggestions.image.10.prompt", img: "/videos/Foret-sombre.webp", url: "/videos/Foret-sombre.webp" },
  { id: 11, titleKey: "suggestions.image.11.title", promptKey: "suggestions.image.11.prompt", img: "/videos/Magazine.webp", url: "/videos/Magazine.webp" },
  { id: 12, titleKey: "suggestions.image.12.title", promptKey: "suggestions.image.12.prompt", img: "/videos/Intégration-décor.webp", url: "/videos/Intégration-décor.webp" },
  { id: 13, titleKey: "suggestions.image.13.title", promptKey: "suggestions.image.13.prompt", img: "/videos/Marketing.webp", url: "/videos/Marketing.webp" },
  { id: 14, titleKey: "suggestions.image.14.title", promptKey: "suggestions.image.14.prompt", img: "/videos/Aquarelle.webp", url: "/videos/Aquarelle.webp" },
  { id: 15, titleKey: "suggestions.image.15.title", promptKey: "suggestions.image.15.prompt", img: "/videos/Cyberpunk.webp", url: "/videos/Cyberpunk.webp" }
];

const VIDEO_SUGGESTION_KEYS = [
  { id: 1, titleKey: "suggestions.video.1.title", typeStyleKey: "suggestions.video.1.typeStyle", promptKey: "line6_suggestions_video_1_prompt", img: "/videos/crépuscule.webp", url: "/videos/crépuscule.webm" },
  { id: 2, titleKey: "suggestions.video.2.title", typeStyleKey: "suggestions.video.2.typeStyle", promptKey: "line6_suggestions_video_2_prompt", img: "/videos/Cyberpunk.webp", url: "/videos/Cyberpunk.webm" },
  { id: 3, titleKey: "suggestions.video.3.title", typeStyleKey: "suggestions.video.3.typeStyle", promptKey: "line6_suggestions_video_3_prompt", img: "/videos/Foret-sombre.webp", url: "/videos/Foret-sombre.webm" },
  { id: 4, titleKey: "suggestions.video.4.title", typeStyleKey: "suggestions.video.4.typeStyle", promptKey: "line6_suggestions_video_4_prompt", img: "/videos/Cours.webp", url: "/videos/Cours.webm" },
  { id: 5, titleKey: "suggestions.video.5.title", typeStyleKey: "suggestions.video.5.typeStyle", promptKey: "line6_suggestions_video_5_prompt", img: "/videos/Astronaute.webp", url: "/videos/Astronaute.webm" },
  { id: 6, titleKey: "suggestions.video.6.title", typeStyleKey: "suggestions.video.6.typeStyle", promptKey: "line7_suggestions_video_6_prompt", img: "/videos/Anime1.webp", url: "/videos/Anime1.webm" },
  { id: 7, titleKey: "suggestions.video.7.title", typeStyleKey: "suggestions.video.7.typeStyle", promptKey: "line7_suggestions_video_7_prompt", img: "/videos/encore-une.webp", url: "/videos/encore-une.webm" },
  { id: 8, titleKey: "suggestions.video.8.title", typeStyleKey: "suggestions.video.8.typeStyle", promptKey: "line7_suggestions_video_8_prompt", img: "/videos/lac-montagneuse.webp", url: "/videos/lac-montagneuse.webm" },
  { id: 9, titleKey: "suggestions.video.9.title", typeStyleKey: "suggestions.video.9.typeStyle", promptKey: "suggestions.video.9.prompt", img: "/videos/penthouse-nocturne.webp", url: "/videos/tiktok-5.webm" },
  { id: 10, titleKey: "suggestions.video.10.title", typeStyleKey: "suggestions.video.10.typeStyle", promptKey: "suggestions.video.10.prompt", img: "/videos/poupee.webp", url: "/videos/poupee.webm" },
  { id: 11, titleKey: "suggestions.video.11.title", typeStyleKey: "suggestions.video.11.typeStyle", promptKey: "suggestions.video.11.prompt", img: "/videos/caméra.webp", url: "/videos/caméra.webm" },
  { id: 12, titleKey: "suggestions.video.12.title", typeStyleKey: "suggestions.video.12.typeStyle", promptKey: "suggestions.video.12.prompt", img: "/videos/Coucher-de-soleil.webp", url: "/videos/ocean.webm" },
  { id: 13, titleKey: "suggestions.video.13.title", typeStyleKey: "suggestions.video.13.typeStyle", promptKey: "suggestions.video.13.prompt", img: "/videos/attaque.webp", url: "/videos/attaque.webm" },
  { id: 14, titleKey: "suggestions.video.14.title", typeStyleKey: "suggestions.video.14.typeStyle", promptKey: "suggestions.video.14.prompt", img: "/videos/volcan.webp", url: "/videos/volcan.webm" },
  { id: 15, titleKey: "suggestions.video.15.title", typeStyleKey: "suggestions.video.15.typeStyle", promptKey: "suggestions.video.15.prompt", img: "/videos/Couloir-sombre.webp", url: "/videos/Couloir-sombre.webm" }
];

function App() {
  
  const { t, i18n } = useTranslation();
  const SUGGESTIONS = SUGGESTION_KEYS.map(({ titleKey, promptKey, ...item }) => ({ ...item, promptKey, title: t(titleKey), prompt: t(promptKey) }));
  const VIDEO_SUGGESTIONS = VIDEO_SUGGESTION_KEYS.map(({ titleKey, promptKey, typeStyleKey, ...item }) => ({ ...item, promptKey, title: t(titleKey), prompt: t(promptKey), typeStyle: t(typeStyleKey) }));
  // --- 1. ÉTATS DES JETONS (Lecture initiale du LocalStorage) ---
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem("eclipse_tokens");
    return saved ? parseInt(saved) : 0;
  });

  const [packTokens, setPackTokens] = useState(() => {
    const savedPack = localStorage.getItem("eclipse_pack_tokens");
    return savedPack ? parseInt(savedPack) : 0; 
  });

  // Ajout de diamants lors d'un achat
  const handlePurchase = (amount) => {
    setPackTokens(prev => prev + amount);
  };
  
// Logique universelle de consommation (Préparée pour le Cloud)
const consumeToken = async () => {
  // 1. On récupère le prix dynamique (ex: 350 ou 450)
  const currentPrice = calculateCurrentPrice();

  // 2. Priorité aux éclairs (tokens gratuits)
  if (tokens >= currentPrice) {
    const newTokens = tokens - currentPrice;
    setTokens(newTokens);
    // Optionnel : syncCreditsToDB(user.uid, newTokens, packTokens);
    return true; 
  } 
  
  // 3. Sinon, on utilise les diamants (packTokens payants)
  else if (packTokens >= currentPrice) {
    const newPack = packTokens - currentPrice;
    setPackTokens(newPack);
    // Optionnel : syncCreditsToDB(user.uid, tokens, newPack);
    return true; 
  } 
  
  // 4. Si aucun des deux n'est suffisant
  else {
    alert(t("app.error.insufficientCredits", { price: currentPrice }));
    setShowPricing(true); 
    return false; 
  }
};
// --- ÉTATS DE L'INTERFACE ---
const [showLogin, setShowLogin] = useState(false);
const [showStudio, setShowStudio] = useState(false);
const [mode, setMode] = useState("VIDEO"); // ✅ On commence en mode VIDEO
const [prompt, setPrompt] = useState("");
  const selectedSuggestionPromptRef = useRef(null);
  useEffect(() => {
    const selected = selectedSuggestionPromptRef.current;
    if (!selected) return;
    if (prompt !== selected.lastText) { selectedSuggestionPromptRef.current = null; return; }
    const translatedPrompt = t(selected.promptKey);
    selectedSuggestionPromptRef.current = { ...selected, lastText: translatedPrompt };
    setPrompt(translatedPrompt);
    setActiveItem((current) => current && current.id === `inspi-${selected.id}` ? { ...current, prompt: translatedPrompt } : current);
  }, [i18n.language]);
const [selectedStyle, setSelectedStyle] = useState("Réaliste");
const [aspectRatio, setAspectRatio] = useState("16:9");
const [selectedModel, setSelectedModel] = useState("Hailuo AI"); // ✅ On met direct Hailuo
const isVeoPanelModel = (selectedModel || "")
  .toLowerCase()
  .includes("veo");
const [isLoading, setIsLoading] = useState(false);
const [isThinking, setIsThinking] = useState(false);
const [chatMessages, setChatMessages] = useState([]);
const [progress, setProgress] = useState(0);

const [statusMsg, setStatusMsg] = useState("");
const [user, setUser] = useState(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [errorMsg, setErrorMsg] = useState(null);

// Retour de la connexion Google sur mobile
useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log(
          "✅ Retour Google confirmé :",
          result.user.email
        );
      }
    })
    .catch((error) => {
      console.error(
        "❌ Erreur au retour de Google :",
        error.code,
        error.message
      );
    });
}, []);

const API_BASE_URL = "${import.meta.env.VITE_API_URL}";
const [itemToDelete, setItemToDelete] = useState(null);
const [remixStrength, setRemixStrength] = useState(0.5); // 0.5 = équilibre parfait
const [uploadedImage, setUploadedImage] = useState(null);
const promptRef = useRef(null);
const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
const [showVideoTutorial, setShowVideoTutorial] = useState(false);
const [videoTutorialTab, setVideoTutorialTab] = useState("guide");
const [showImageTutorial, setShowImageTutorial] = useState(false);
const [imageTutorialTab, setImageTutorialTab] = useState("guide");
const [tutorialCopyState, setTutorialCopyState] = useState("");

const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
const [neededAmount, setNeededAmount] = useState(0);
const [showCgv, setShowCgv] = useState(false);
const [showLegal, setShowLegal] = useState(false);

const [showProfile, setShowProfile] = useState(false);
const [userPlan, setUserPlan] = useState("debutant");
const [isInitializing, setIsInitializing] = useState(true);

const [videoSource, setVideoSource] = useState(null);
const [videoSourceDuration, setVideoSourceDuration] = useState(0);
// Opération vidéo spécifique à Veo 3.1
const [veoVideoOperation, setVeoVideoOperation] = useState(null);
const [veoReferenceImage, setVeoReferenceImage] = useState(null);
const [showReferencePanel, setShowReferencePanel] = useState(false);
useEffect(() => {
  console.log("👁️ showReferencePanel CHANGÉ :", showReferencePanel);
}, [showReferencePanel]);
const [veoEditVideo, setVeoEditVideo] = useState(null);
const [h3ReferenceImages, setH3ReferenceImages] = useState([]);
const [h3ReferenceVideos, setH3ReferenceVideos] = useState([]);
const [h3ReferenceAudios, setH3ReferenceAudios] = useState([]);
const [h3Dialogue, setH3Dialogue] = useState("");
const [h3Seed, setH3Seed] = useState("");
const [h3PromptExpansion, setH3PromptExpansion] = useState("balanced");
const [minimaxH3VideoOperation, setMinimaxH3VideoOperation] = useState("edit");
const [modelReferenceImages, setModelReferenceImages] = useState([]); // Références des modèles image
const [seedanceReferenceImages, setSeedanceReferenceImages] = useState([]);
const [seedanceReferenceVideos, setSeedanceReferenceVideos] = useState([]);
const [seedanceReferenceAudios, setSeedanceReferenceAudios] = useState([]);
const [nanoReferenceVideo, setNanoReferenceVideo] = useState(null);
const [pixverseNegativePrompt, setPixverseNegativePrompt] = useState("");
const [pixverseMultiClip, setPixverseMultiClip] = useState(false);
const [pixverseStyle, setPixverseStyle] = useState("");
const [pixverseThinking, setPixverseThinking] = useState("auto");
const [seedance25Operation, setSeedance25Operation] = useState("extend");
const [pixverseSeed, setPixverseSeed] = useState("");
const [seedanceSeed, setSeedanceSeed] = useState("");
const [seedanceAudioEnabled, setSeedanceAudioEnabled] = useState(true);
const [imageSeed, setImageSeed] = useState("");
const [imageOutputFormat, setImageOutputFormat] = useState("JPG");
const [gptImageQuality, setGptImageQuality] = useState("auto");
const [gptImageModeration, setGptImageModeration] = useState("auto");
const [fluxSafetyTolerance, setFluxSafetyTolerance] = useState("2");
const [nanoThinking, setNanoThinking] = useState("MINIMAL");
const [nanoTemperature, setNanoTemperature] = useState("1");
const [nanoTopP, setNanoTopP] = useState("0.95");
const [nanoSystemPrompt, setNanoSystemPrompt] = useState("");
const [showH3ReferencePanel, setShowH3ReferencePanel] = useState(false);
useEffect(() => {
  if (!videoSource || !selectedModel) return;
  const normalizedModel = selectedModel.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalizedModel.includes("seedance20")) {
    setSeedanceReferenceVideos(prev => prev.slice(0, 2));
  }
  if (normalizedModel.includes("minimaxh3")) {
    setH3ReferenceVideos(prev => prev.slice(0, 2));
  }
}, [videoSource, selectedModel]);

const [selectedOptionModal, setSelectedOptionModal] = useState('');
const [showEditor, setShowEditor] = useState(false);
const [h3ReferenceSlot, setH3ReferenceSlot] = useState(null);
const [isAuthLoading, setIsAuthLoading] = useState(true);
const [showDropdown, setShowDropdown] = useState(false);
const [cost, setCost] = useState(0);
const [forceDiamonds, setForceDiamonds] = useState(false);
const [duration, setDuration] = useState("5"); 
const [showTerms, setShowTerms] = useState(false);
const [showContactModal, setShowContactModal] = useState(false);
const [showPrivacy, setShowPrivacy] = useState(false);
const [showPricing, setShowPricing] = useState(false);
const [wantsAudio, setWantsAudio] = useState(false);
const [veoMode, setVeoMode] = useState("text-to-video");
const [veoAudioSource, setVeoAudioSource] = useState(null);
const [veoReferenceImages, setVeoReferenceImages] = useState([]);
const [veoReferenceSlot, setVeoReferenceSlot] = useState(null);
const veoReferenceSlotRef = useRef(null);
const [resolution, setResolution] = useState("1080p");

useEffect(() => {
  if (mode !== "VIDEO" || !selectedModel) return;

  const model = selectedModel
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (model.includes("minimaxh3")) {
    setShowH3ReferencePanel(true);
  } else {
    setShowH3ReferencePanel(false);
  }

  if (model.includes("seedance25") && !["480p", "720p", "1080p", "full hd"].includes(String(resolution).toLowerCase())) {
    setResolution("720p");
  }
}, [selectedModel, mode, resolution]);
const [startImage, setStartImage] = useState(null);
const [startImagePreview, setStartImagePreview] = useState(null);
const [endImage, setEndImage] = useState(null);

const [colorSettings, setColorSettings] = useState({
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  brightness: 0
});

const [activeSubTab, setActiveSubTab] = useState('Éclairage');
const scrollContainerRef = useRef(null); 
const [hoverItem, setHoverItem] = useState(null); // Pour stocker la miniature survolée

const outilsRef = useRef(null);

// Historique
// ✅ Nouveau code : 100% Firebase, 0% localStorage
const [history, setHistory] = useState([]);

  const [activeItem, setActiveItem] = useState(history[0] || null);
  const [randomInspirations, setRandomInspirations] = useState([]);


  // --- RÉFÉRENCES ---
  
  const chatEndRef = useRef(null);
  const successAudio = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3"));
  const scrollInspiRef = useRef(null);
const [view, setView] = useState('studio');
  // --- EFFETS ---

  // RECHARGE QUOTIDIENNE (Abonnement 0€)

useEffect(() => {
  // On ne force plus setTokens(0) ici. 
  // C'est la fonction onAuthStateChanged qui s'en occupe proprement.
  
// On considère comme débutant uniquement si on a reçu les infos ET que c'est le plan gratuit
const isDebutant = userPlan === "debutant" ;

// On crée un état de chargement pour les crédits
const isProfileLoading = user && !userPlan;

  if (isDebutant) {
    console.log("🛡️ Profil Débutant détecté.");
  } else {
    console.log(`💎 Profil Abonné détecté : ${userPlan}`);
  }
}, [userPlan]);
const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      // Vérifie si le contenu dépasse la hauteur du cadre
      const isScrollable = el.scrollHeight > el.clientHeight;
      setCanScroll(isScrollable);
    }
  };
  useEffect(() => {
  console.log("🚀 Lancement écoute Auth");

  // On écoute l'authentification
  const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
    setIsAuthLoading(true);

    if (authUser) {
      setUser(authUser);
      
      // 1. On lance l'écouteur temps réel sur Firestore
      const userRef = doc(db, "users", authUser.uid);
      
      const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("🔄 Mise à jour temps réel Firestore reçue :", data);
          
          setUserPlan(data.userPlan || "discovery");
          setTokens(data.tokens || 0);
          setPackTokens(data.packTokens || 0);
        } else {
          // Si le document n'existe pas, on le crée
          createUserProfile(authUser);
        }
      }, (error) => {
        console.error("❌ Erreur écoute Firestore :", error);
      });

      // 2. On stocke l'unsubscribe pour le clean-up
      // Note : Comme on ne peut pas mettre de clean-up direct dans l'async, 
      // on gère la déconnexion proprement ci-dessous.
      window.unsubUser = unsubscribeSnapshot; 

    } else {
      console.log("👤 Aucun utilisateur");
      setUser(null);
      setUserPlan("discovery");
      setTokens(0);
      setPackTokens(0);
      setShowStudio(false);
      
      // On arrête l'écouteur si l'utilisateur se déconnecte
      if (window.unsubUser) window.unsubUser();
    }
    
    setIsAuthLoading(false);
    setIsInitializing(false);
  });

  return () => {
    unsubscribeAuth();
    if (window.unsubUser) window.unsubUser();
  };
}, []);


  useEffect(() => {
    if (mode === "IMAGE") {
      setSelectedModel("Flux Pro");
    } else if (mode === "VIDEO") {
      setSelectedModel("Hailuo AI");
      setResolution("768p");
    }
  }, [mode]);
     
// Tarifs centralisés dans pricingConfig.js (source unique pour le client et le serveur).
const currentUserPrice = PLAN_TO_PRICE[userPlan] || "0.00";
const p = PRICING_DATA[currentUserPrice] || PRICING_DATA["0.00"];
const engines = [

  {
    id: "veo3.1_fast",
    name: "Veo 3.1 fast",
    type: "VIDEO",
    runwareModel: "google:3@3",
    canDualImage: false,
    minPriceForLightning: "12.99",
    prices: {
      "4": {
        "720p": p.veo3_lite?.hd4 || 128,
        "1080p": p.veo3_lite?.fhd4 || 128
      },
      "6": {
        "720p": p.veo3_lite?.hd6 || 191,
        "1080p": p.veo3_lite?.fhd6 || 191
      },
      "8": {
        "720p": p.veo3_lite?.hd8 || 253,
        "1080p": p.veo3_lite?.fhd8 || 253
      }
    },
    providerSettings: {
      google: {
        enhancePrompt: true,
        generateAudio: true
      }
    },
    annotation: t("line3_app_annotation_veo3_1_fast")
  },

  // --- VIDÉO HAUT DE GAMME ---
  {
    id: "veo3.1",
    name: "Veo 3.1",
    type: "VIDEO",
    runwareModel: "google:3@2",
    canDualImage: false,
    minPriceForLightning: "12.99",
    prices: {
      "4": {
        "720p": p.veo3?.hd4 || 263,
        "1080p": p.veo3?.fhd4 || 263
      },
      "6": {
        "720p": p.veo3?.hd6 || 393,
        "1080p": p.veo3?.fhd6 || 393
      },
      "8": {
        "720p": p.veo3?.hd8 || 523,
        "1080p": p.veo3?.fhd8 || 523
      }
    },
    providerSettings: {
      google: {
        enhancePrompt: true,
        generateAudio: true
      }
    },
    annotation: t("line3_app_annotation_veo3_1")
  },

  {
    id: "kling26_motion",
    name: "Kling 2.6 Motion Control",
    type: "VIDEO",
    canDualImage: false,
    minPriceForLightning: "12.99",
    prices: {
      "5": {
        "1080p": p.kling26_motion?.fhd5 || 110
      },
      "10": {
        "1080p": p.kling26_motion?.fhd10 || 217
      }
    },
    endpoint: "klingai:kling-video@2.6-pro",
    annotation: t("line3_app_annotation_kling26_motion")
  },

  {
    id: "kling30",
    name: "Kling 3.0",
    type: "VIDEO",
    canDualImage: true,
    minPriceForLightning: "12.99",
    prices: (function() {
      const dynamicPrices = {};

      for (let i = 3; i <= 15; i++) {
        dynamicPrices[i.toString()] = {
          "720p": p.kling30?.[`hd${i}`] || 200,
          "1080p": p.kling30?.[`fhd${i}`] || 500
        };
      }

      return dynamicPrices;
    })(),
    runwareModel: "klingai:kling-video@3-standard",
    standardModel: "klingai:kling-video@3-standard",
    proModel: "klingai:kling-video@3-pro",
    annotation: t("line3_app_annotation_kling30")
  },

  {
    id: "kling2.6",
    name: "Kling 2.6 Pro",
    type: "VIDEO",
    runwareModel: "klingai:kling-video@2.6-pro",
    canDualImage: false,
    minPriceForLightning: "12.99",
    prices: {
      "5": {
        "1080p": p.kling26?.fhd5 || 110
      },
      "10": {
        "1080p": p.kling26?.fhd10 || 217
      }
    },
    providerSettings: {
      klingai: {
        sound: true
      }
    },
    annotation: t("line3_app_annotation_kling26")
  },

  {
    id: "hailuo",
    name: "Hailuo 2.3 fast",
    type: "VIDEO",
    runwareModel: "minimax:4@2",
    canDualImage: false,
    minPriceForLightning: "12.99",
    prices: {
      "6": {
        "768p": p.hailuo?.hd6 || 91,
        "1080p": p.hailuo?.fhd6 || 179
      },
      "10": {
        "768p": p.hailuo?.hd10 || 160
      }
    },
    annotation: t("line3_app_annotation_hailuo")
  },

  {
    id: "minimax_h3",
    name: "MiniMax H3",
    type: "VIDEO",
    runwareModel: "minimax:h3@0",
    canDualImage: true,
    minPriceForLightning: "12.99",
    model: "minimax:h3@0",
    prices: (function() {
      const dynamicPrices = {};

      for (let i = 4; i <= 15; i++) {
        dynamicPrices[i.toString()] = {
          "768p": p.minimax_h3?.[`hd${i}`] || 378,
          "1440p": p.minimax_h3?.[`2k${i}`] || 603
        };
      }

      return dynamicPrices;
    })(),
    annotation: t("line3_app_annotation_minimax_h3")
  },

  // --- VIDÉO ACCESSIBLE ---
  {
    id: "pixverse6",
    name: "Pixverse V6",
    type: "VIDEO",
    canDualImage: true,
    minPriceForLightning: "12.99",
    prices: (function() {
      const dynamicPrices = {};

      for (let i = 1; i <= 15; i++) {
        dynamicPrices[i.toString()] = {
          "360p": p.pixverse6?.[`p360_${i}`] || 117,
          "540p": p.pixverse6?.[`p540_${i}`] || 162,
          "720p": p.pixverse6?.[`hd${i}`] || 207,
          "1080p": p.pixverse6?.[`fhd${i}`] || 426
        };
      }

      return dynamicPrices;
    })(),
    runwareModel: "pixverse:1@8",
    annotation: t("line3_app_annotation_pixverse6")
  },

  {
    id: "seedance25",
    name: "seedance 2.5",
    type: "VIDEO",
    canDualImage: true,
    minPriceForLightning: "12.99",
    prices: (function() {
      const dynamicPrices = {};

      for (let i = 4; i <= 30; i++) {
        dynamicPrices[i.toString()] = {
          "480p": p.seedance25?.[`sd${i}`] || 998,
          "720p": p.seedance25?.[`hd${i}`] || 2248,
          "1080p": p.seedance25?.[`fhd${i}`] || 5989
        };
      }

      return dynamicPrices;
    })(),
    runwareModel: "bytedance:seedance@2.5",
    annotation: t("line3_app_annotation_seedance25")
  },

  {
    id: "seedance20",
    name: "seedance 2.0",
    type: "VIDEO",
    canDualImage: true,
    minPriceForLightning: "12.99",
    prices: (function() {
      const dynamicPrices = {};

      for (let i = 4; i <= 15; i++) {
        dynamicPrices[i.toString()] = {
          "480p": p.seedance20?.[`sd${i}`] || (i === 5 ? 123 : i === 10 ? 243 : i === 15 ? 363 : Math.round(24.3 * i)),
          "720p": p.seedance20?.[`hd${i}`] || (i === 5 ? 173 : i === 10 ? 343 : i === 15 ? 513 : Math.round(34.3 * i)),
          "1080p": p.seedance20?.[`fhd${i}`] || (i === 5 ? 383 : i === 10 ? 763 : i === 15 ? 1143 : Math.round(76.3 * i))
        };
      }

      return dynamicPrices;
    })(),
    runwareModel: "bytedance:seedance@2.0",
    annotation: t("line3_app_annotation_seedance20")
  },

  {
    id: "seedance",
    name: "Seedance 1.5 Pro",
    type: "VIDEO",
    canDualImage: false,
    minPriceForLightning: "12.99",
    prices: (function() {
      const dynamicPrices = {};

      for (let i = 4; i <= 12; i++) {
        dynamicPrices[i.toString()] = {
          "480p": p.seedance?.[`sd${i}`] || 59,
          "720p": p.seedance?.[`hd${i}`] || 132,
          "1080p": p.seedance?.[`fhd${i}`] || 298
        };
      }

      return dynamicPrices;
    })(),
    endpoint: "fal-ai/bytedance/seedance/v1.5/pro/text-to-video",
    annotation: t("line3_app_annotation_seedance")
  },

  // --- IMAGES ---
  {
    id: "gpt_image2",
    name: "GPT Image 2",
    type: "IMAGE",
    runwareModel: "openai:gpt-image@2",
    minPriceForLightning: "12.99",
    prices: { "0": { "1080p": p.flux?.pro || 18 } },
    maxReferenceImages: 26,
    annotation: t("line3_app_annotation_gpt_image2")
  },

  {
    id: "flux2pro",
    name: "FLUX.2 Pro",
    type: "IMAGE",
    runwareModel: "bfl:5@1",
    minPriceForLightning: "12.99",
    prices: { "0": { "1080p": p.flux?.dev || 14 } },
    maxReferenceImages: 14,
    annotation: t("line3_app_annotation_flux2pro")
  },

  {
    id: "nano_banana2_lite",
    name: "Nano Banana 2 Lite",
    type: "IMAGE",
    runwareModel: "google:nano-banana@2-lite",
    minPriceForLightning: "12.99",
    prices: { "0": { "1080p": p.flux?.schnell || 15 } },
    maxReferenceImages: 15,
    annotation: t("line3_app_annotation_nano_banana2_lite")
  }

]; // Fermeture correcte de l'array engines
// Réduit immédiatement un ancien prompt si l'utilisateur change de moteur
// ou ajoute une image/vidéo qui impose une limite plus stricte.
useEffect(() => {
  const selectedId = String(engines.find(e => e.name === selectedModel)?.id || selectedModel || "").toLowerCase();
  const limit = getPromptLimit(mode, selectedId, Boolean(startImage || endImage), Boolean(videoSource));
  if (prompt.length > limit) setPrompt(prompt.slice(0, limit));
}, [mode, selectedModel, startImage, endImage, videoSource, prompt]);



function getPriceDisplay(engine, duration, resolution, userPlan) {
    const planKey = PLAN_TO_PRICE[String(userPlan || "debutant").toLowerCase()] || "0.00";
    const imageModelKeys = {
        gpt_image2: { table: "gptImage2", text: "textToImage", reference: "referenceToImage" },
        flux2pro: { table: "flux2pro", sizes: ["mp1", "mp2", "mp4"] },
        nano_banana2_lite: { table: "nanoBanana2Lite", text: "k1", reference: "reference1k" }
    };
    const imageSpec = imageModelKeys[engine?.id];
    if (engine?.type === "IMAGE" && imageSpec) {
        const diamondTable = PRICING_DATA["0.00"]?.[imageSpec.table];
        const lightningTable = PRICING_DATA[planKey]?.[imageSpec.table];
        const hasReference = Boolean(startImage || uploadedImage || (Array.isArray(modelReferenceImages) && modelReferenceImages.length));
        let priceKey;
        if (engine.id === "gpt_image2") {
            priceKey = hasReference ? imageSpec.reference : imageSpec.text;
        } else if (engine.id === "nano_banana2_lite") {
            priceKey = hasReference || Boolean(nanoReferenceVideo) ? imageSpec.reference : imageSpec.text;
        } else {
            const ratio = aspectRatio || "1:1";
            const dimensionsByRatio = {
                "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [1024, 1024],
                "4:3": [1152, 864], "3:4": [864, 1152], "3:2": [1264, 848],
                "2:3": [848, 1264], "4:5": [928, 1152], "5:4": [1152, 928],
                "21:9": [1584, 672]
            };
            const dimensions = dimensionsByRatio[ratio] || dimensionsByRatio["1:1"];
            const mp = dimensions[0] * dimensions[1] / 1000000;
            priceKey = mp <= 1.5 ? "mp1" : mp <= 3 ? "mp2" : "mp4";
        }
        const required = packs.indexOf(String(engine.minPriceForLightning));
        const current = packs.indexOf(planKey);
        const lightningPrice = lightningTable?.[priceKey];
        if (current >= 0 && required >= 0 && current >= required && Number.isFinite(Number(lightningPrice)) && Number(lightningPrice) > 0) {
            return `${lightningPrice} ⚡`;
        }
        const diamondPrice = diamondTable?.[priceKey];
        return Number.isFinite(Number(diamondPrice)) && Number(diamondPrice) > 0 ? `${diamondPrice} 💎` : "Tarif indisponible";
    }

    const isFullHD = String(resolution || "").toLowerCase().includes("1080") || String(resolution || "").toLowerCase().includes("full hd") || String(resolution || "").toLowerCase().includes("fhd");
    const resKey = isFullHD ? "fhd" : "hd";
    const lookupKey = duration === "0" ? resKey : `${resKey}${duration}`;
    const price = PRICING_DATA[planKey]?.[engine?.id]?.[lookupKey];
    const diamondPrice = PRICING_DATA["0.00"]?.[engine?.id]?.[lookupKey] || engine?.rubyPrice;
    const required = packs.indexOf(String(engine?.minPriceForLightning));
    const current = packs.indexOf(planKey);
    return current >= 0 && required >= 0 && current >= required && price !== undefined ? `${price} ⚡` : `${diamondPrice ?? "—"} 💎`;
}
const styles = [
  t("app.style.realistic", { defaultValue: "Réaliste" }),
  t("app.style.cyberpunk", { defaultValue: "Cyberpunk" }),
  t("app.style.anime", { defaultValue: "Anime" }),
  t("app.style.watercolor", { defaultValue: "Aquarelle" }),
  t("app.style.animation3d", { defaultValue: "Animation 3D" })
]; 
// 🔄 Détection de génération en cours si la page a été rafraîchie/réouverte
useEffect(() => {
    if (!user) return;
const checkPendingGeneration = async () => {
        try {
            // 🔍 Ajoute cette ligne pour voir l'URL exacte :
            console.log("URL de l'API ciblée :", import.meta.env.VITE_API_URL);

            // 🔑 Récupération du token Firebase de l'utilisateur
            const token = await user.getIdToken();

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/check-active-generation?userId=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await res.json();

            if (data.hasActive) {
                console.log("⏳ Génération interrompue/en cours détectée :", data.lock);
                
                // Réactivation visuelle du grand carré et du loader
                setIsLoading(true);
                setProgress(50); // Valeur indicative pendant le chargement
                setStatusMsg(
  t("app.status.generationFinalizing", {
    defaultValue: t("line3_app_status_generationFinalizing")
  })
);
            }
        } catch (err) {
            console.error("Impossible de vérifier l'état des générations :", err);
        }
    };

    checkPendingGeneration();
}, [user]);


useEffect(() => {
  if (window.location.pathname === '/success') {
    setView('success');
  }
}, 

[]);
const refreshInspirations = () => {
  // On choisit la source selon le mode
  const source = mode === "VIDEO" ? VIDEO_SUGGESTIONS : SUGGESTIONS;
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  setRandomInspirations(shuffled);
};

useEffect(() => {
  // 🚫 SÉCURITÉ : Si par hasard le mode passe sur "TEXTE", on le redirige immédiatement vers VIDEO
  if (mode === "TEXTE") {
    setMode("VIDEO");
    return;
  }

  // 1. Rafraîchir les exemples en bas de page
  refreshInspirations();

  // 2. Paramétrage spécifique selon le mode
  if (mode === "IMAGE") {
    setResolution("1080p");
    
    // SÉCURITÉ : Sélectionne automatiquement le premier moteur Image (ex: Flux Pro)
    const firstImageEngine = engines.find(e => e.type === "IMAGE");
    if (firstImageEngine) setSelectedModel(firstImageEngine.name);

  } else if (mode === "VIDEO") {
    
    // SÉCURITÉ : Sélectionne automatiquement le premier moteur Vidéo (ex: Hailuo AI)
    const firstVideoEngine = engines.find(e => e.type === "VIDEO");
    if (firstVideoEngine) setSelectedModel(firstVideoEngine.name);
    
  } else if (mode === "TEXTE") {
    setSelectedModel("Gemini 1.5 Flash"); // Ton modèle de chat par défaut
  }
}, 

[mode, i18n.language]); // Rafraîchit aussi les suggestions quand la langue change.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
  localStorage.setItem("pixpro_history", JSON.stringify(history));
}, [history]);

  useEffect(() => {
    if (activeItem && activeItem.type === "TEXTE") {
      setChatMessages(activeItem.messages || []);
    }
  }, [activeItem]);

  // Logique de scroll
  const handleScrollInspi = (direction) => {
  if (scrollInspiRef.current) {
    const container = scrollInspiRef.current;
    // On calcule la largeur visible du carré
    const scrollAmount = container.offsetWidth; 

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
};
const handleFileToUrl = async (e, previewOrImageSetter, maybeImageSetter) => {
  // La modal Filtre appelle cette fonction avec un objet File ; les autres
  // zones de l'application l'appellent avec un événement input classique.
  const directFile = typeof File !== "undefined" && e instanceof File;
  const file = directFile ? e : e?.target?.files?.[0];
  if (!file) return null;

  console.log("📁 FICHIER SÉLECTIONNÉ :", file);
  console.log("📦 Taille :", file.size, "octets");
  console.log("🖼️ Type :", file.type);

  const maxBytes = getMediaLimitBytes(file);
  if (file.size > maxBytes) {
    const kind = getMediaKind(file);
    const label = kind === "image" ? t("line1_app_file_kind_image") : kind === "video" ? t("line1_app_file_kind_video") : kind === "audio" ? t("line1_app_file_kind_audio") : t("line1_app_file_kind_other");
    setErrorMsg?.(`${file.name} dépasse la limite de ${formatMo(maxBytes)} pour ${label}. Taille du fichier : ${formatMo(file.size)}.`);
    if (!directFile && e?.target) e.target.value = "";
    return null;
  }

  // ============================================================
  // APERÇU LOCAL
  // ============================================================
  const previewUrl = URL.createObjectURL(file);

  // Appel direct depuis la modal : retourner l'URL publique, sans attendre
  // un callback d'événement qui n'existe pas dans ce cas.
  if (directFile) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`Erreur upload (${response.status})`);
      const data = await response.json();
      const publicUrl = data.url || data.filePath;
      if (!publicUrl) throw new Error('Le serveur n’a retourné aucune URL.');
      URL.revokeObjectURL(previewUrl);
      return publicUrl;
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      console.error('❌ Échec de l’upload de la référence Veo :', error);
      setErrorMsg?.(`Impossible d’envoyer l’image ${file.name}.`);
      throw error;
    }
  }

  if (typeof previewOrImageSetter === 'function') {
    previewOrImageSetter(previewUrl);
  }

  console.log("👁️ APERÇU LOCAL :", previewUrl);

  // ============================================================
  // CAS 1 : UN SEUL SETTER
  // ============================================================
  if (typeof maybeImageSetter !== 'function') {

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log("☁️ Upload de l'image vers le serveur...");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      console.log("📡 Réponse /api/upload :", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur upload :", errorText);
        return;
      }

      const data = await response.json();

      console.log("☁️ RÉPONSE COMPLÈTE UPLOAD :", data);

      const publicUrl = data.url || data.filePath;

      console.log("🌐 URL IMAGE PUBLIQUE :", publicUrl);

      if (!publicUrl) {
        console.error("❌ /api/upload n'a retourné aucune URL.");
        return;
      }

      // Remplace le blob local par l'URL serveur
      if (typeof previewOrImageSetter === 'function') {
        previewOrImageSetter(publicUrl);
      }

      console.log("✅ IMAGE PRÊTE POUR LE SERVEUR :", publicUrl);

    } catch (err) {
      console.error("❌ ERREUR UPLOAD SERVEUR :", err);
    }

    return;
  }

  // ============================================================
  // CAS 2 : PREVIEW + IMAGE
  // ============================================================

  const reader = new FileReader();

  reader.onloadend = () => {
    if (typeof maybeImageSetter === 'function') {
      maybeImageSetter(reader.result);
    }

    console.log("✅ IMAGE CONVERTIE EN BASE64");
  };

  reader.readAsDataURL(file);
};

const uploadFilesToPublicUrls = async (files) => {
  const urls = [];
  for (const file of Array.from(files || [])) {
    const maxBytes = getMediaLimitBytes(file);
    if (file.size > maxBytes) {
      const kind = getMediaKind(file);
      const label = kind === "image" ? t("line1_app_file_kind_image") : kind === "video" ? t("line1_app_file_kind_video") : kind === "audio" ? t("line1_app_file_kind_audio") : t("line1_app_file_kind_other");
      setErrorMsg(`Le fichier ${file.name} dépasse la limite de ${formatMo(maxBytes)} pour ${label} (taille : ${formatMo(file.size)}).`);
      continue;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error(`Upload échoué (${response.status})`);
      const data = await response.json();
      const url = data.url || data.filePath;
      if (url) urls.push(url);
    } catch (error) {
      console.error("❌ Échec d'upload d'une référence :", error);
      setErrorMsg?.(`Impossible d'envoyer le fichier ${file.name}.`);
    }
  }
  return [...new Set(urls)];
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const maxBytes = getMediaLimitBytes(file);
  if (file.size > maxBytes) {
    const kind = getMediaKind(file);
    const label = kind === "image" ? t("line1_app_file_kind_image") : kind === "video" ? t("line1_app_file_kind_video") : kind === "audio" ? t("line1_app_file_kind_audio") : t("line1_app_file_kind_other");
    setErrorMsg(`Le fichier ${file.name} dépasse la limite de ${formatMo(maxBytes)} pour ${label}.`);
    e.target.value = "";
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    setIsLoading(true);
    setStatusMsg(
  t("app.status.fileLoading", {
    defaultValue: "Chargement du fichier..."
  })
);

const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: formData });      const data = await res.json();
      if (data.url) {
        const newItem = { id: Date.now(), url: data.url, prompt: t("line3_app_status_fileImported"), type: "IMAGE" };
        setActiveItem(newItem);
        confetti();
      }
    } catch (err) { console.error("Erreur upload:", err); } 
    finally { setIsLoading(false); setStatusMsg(""); }
  };

// --- ICI ON EST JUSTE AVANT HANDLE GENERATE ---
const handleLogout = async () => {
  try {
    await auth.signOut();
    setUser(null);
    setShowDropdown(false);
    setShowStudio(false);
    console.log("Déconnexion réussie");
  } catch (error) {
    console.error("❌ Erreur déconnexion :", error);
  }
};useEffect(() => {
  if (!user?.uid) {
    setHistory([]);
    return;
  }
console.log("👤 USER UID ACTUEL :", user.uid);
  // Écoute directement la collection imageLocks pour cet utilisateur
  const q = query(
    collection(db, "imageLocks"),
    where("userId", "==", user.uid),
    where("status", "==", "completed"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const firestoreItems = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // ⚠️ NORMALISATION DE L'URL : On s'assure qu'un champ 'url' existe TOUJOURS
      const mediaUrl = data.url || data.videoUrl || data.imageUrl || data.resultUrl || (data.video && data.video.url);

      return {
        id: doc.id,
        ...data,
        url: mediaUrl, // Force la présence de .url
        type: data.type || (mediaUrl?.includes('.mp4') ? 'VIDEO' : 'IMAGE') // Force le type si manquant
      };
    });

    setHistory(firestoreItems);
    console.log("🔥 Historique synchronisé :", firestoreItems.length, "élément(s)");
  }, (error) => {
    console.error("❌ Erreur récupération historique :", error);
  });

  return () => unsubscribe();
}, [user?.uid]);


useEffect(() => {
  if (mode === "TEXTE") {
    setCost(0);
    setForceDiamonds(false);
    return;
  }

  const currentEngineId = selectedModel?.toLowerCase() || "";
  const currentEngineData = engines.find(e => e.name === selectedModel || e.id === currentEngineId);
  
  if (currentEngineData) {
    const currentEngineId = currentEngineData.id; 
    const packsList = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];
    
    const isHighResMode = mode === "IMAGE" || 
                        resolution === "Full HD" || 
                        resolution === "1080p" || 
                        resolution?.toLowerCase().includes("fhd");

    // 1. DÉTERMINATION DU PLAN (Éclairs ou Diamants)
    const currentPlanPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
    const userTierIdx = packsList.indexOf(currentPlanPrice);
    const reqTierIdx = packsList.indexOf(String(currentEngineData.minPriceForLightning));
    const masterIdx = packsList.indexOf("12.99");

    // FIX CHIRURGICAL : Si l'utilisateur possède des Éclairs (tokens > 0), on ne le force JAMAIS sur les diamants
    const hasTokensToSpend = tokens > 0;
    
    const mustForce = !hasTokensToSpend && (
                      (currentPlanPrice === "0.00") || 
                      (userTierIdx < reqTierIdx) || 
                      (mode === "VIDEO" && isHighResMode && userTierIdx < masterIdx)
    );
    
    setForceDiamonds(mustForce);

// 2. HARMONISATION DE LA DURÉE
let calcDuration = "5"; 
if (mode === "IMAGE") {
    calcDuration = "0"; 
} else {
    // Sécurité : on extrait le chiffre
    const cleanDurationStr = duration.toString().replace(/\D/g, "");
    const isLongChosen = (duration === "long" || ["10", "12", "8", "9", "15"].includes(cleanDurationStr)); 
    
    if (currentEngineId === "veo3_lite") {
        calcDuration = cleanDurationStr === "6" ? "6" : (cleanDurationStr === "8" ? "8" : "4");
    } else if (currentEngineId === "veo3") {
        calcDuration = cleanDurationStr === "6" ? "6" : (cleanDurationStr === "8" ? "8" : "4");

          } else if (currentEngineId === "seedance25") {
        // ✅ GESTION SPÉCIFIQUE SEEDANCE 2.5 (De 4 à 30 secondes libres)
        const numDur = parseInt(cleanDurationStr, 10) || 5;
        const pricingDuration = seedance25Operation === "edit" && videoSourceDuration > 0
          ? Math.ceil(videoSourceDuration)
          : numDur;
        calcDuration = Math.max(4, Math.min(30, pricingDuration)).toString();

} else if (currentEngineId.includes("pixverse")) {
        // ✅ GESTION SPÉCIFIQUE PIXVERSE V6 (Libre de 1 à 15 secondes)
        const numDur = parseInt(cleanDurationStr, 10) || 5;
        calcDuration = Math.max(1, Math.min(15, numDur)).toString();

} else if (currentEngineId === "kling30" || currentEngineId.includes("kling3")) {
        // ✅ GESTION SPÉCIFIQUE KLING 3.0 (Par exemple, support natif jusqu'à 15s)
        const numDur = parseInt(cleanDurationStr, 10) || 5;
        calcDuration = Math.max(3, Math.min(15, numDur)).toString();
        
} else if (currentEngineId.includes("seedance20") || currentEngineId.includes("seedance-2.0")) {
    // ✅ GESTION SPÉCIFIQUE SEEDANCE 2.0
    const numDur = parseInt(cleanDurationStr, 10) || 5;
    calcDuration = Math.max(4, Math.min(15, numDur)).toString();


    } else if (currentEngineId === "kling26" || currentEngineId === "kling2.6") {
        // Kling 2.6 Pro : durées tarifées de 5 ou 10 secondes.
        calcDuration = cleanDurationStr === "10" ? "10" : "5";

       }   else if (currentEngineId === "veo3.1" || currentEngineId === "veo3.1_fast") {
        // Veo supporte des durées flexibles (ex: 4, 6, 8 secondes)
        calcDuration = cleanDurationStr === "6" ? "6" : (cleanDurationStr === "8" ? "8" : "4");
          
    } else if (currentEngineId.includes("seedance")) {
        // Ancienne version v1.5
         const numDur = parseInt(cleanDurationStr, 10) || 5;
        calcDuration = Math.max(4, Math.min(12, numDur)).toString();

    } else if (currentEngineId.includes("hailuo")) {
        calcDuration = isHighResMode ? "6" : (isLongChosen ? "10" : "6");

    } else if (currentEngineId.includes("minimax_h3")) {
             const numDur = parseInt(cleanDurationStr, 10) || 5;
        calcDuration = Math.max(4, Math.min(15, numDur)).toString();

} else if (currentEngineId === "kling26" || currentEngineId === "kling26_motion") {
        // ✅ Forçage strict 5s ou 10s pour Kling 2.6
        calcDuration = cleanDurationStr === "10" ? "10" : "5";
    } else if (cleanDurationStr === "15" && currentEngineId !== "kling26" && currentEngineId !== "kling26_motion") {
        calcDuration = "15";
    } else {
        calcDuration = isLongChosen ? "10" : "5";
    }
}
    // 3. RÉCUPÉRATION DU PRIX SUR LE BON ID
const pricingId = currentEngineId.includes("minimax") || currentEngineId.includes("h3") ? "minimax_h3" :
                        currentEngineId.includes("pixverse") ? "pixverse6" : 
                        currentEngineId.includes("veo3.1") ? "veo3.1" :
                        currentEngineId.includes("seedance25") ? "seedance25" :
                        currentEngineId === "kling2.6" ? "kling26" :
                        currentEngineId;

const isMinimax = currentEngineId.includes("minimax") || currentEngineId.includes("h3"); 
const isPixverse = currentEngineId.includes("pixverse");           
const isHailuo = currentEngineId.includes("hailuo");
const normalizedResolution = resolution?.toLowerCase().replace(/\s/g, "");

const is360p = normalizedResolution === "360p" || normalizedResolution === "sd";
const is540p = normalizedResolution === "540p";
const is512p = normalizedResolution === "512p"; // Gardé pour Hailuo si nécessaire
const isSD = normalizedResolution === "480p" || normalizedResolution === "sd";
let priceKey;

if (isHailuo && is512p) {
    // ⚙️ Logique spécifique pour Hailuo (512p)
    priceKey = calcDuration === "10" ? "p512_10" : "p512_6";
} 
else if (isPixverse) {
    // ⚙️ Logique dynamique 1s-15s pour Pixverse (360p, 540p, 720p=hd, 1080p=fhd)
    if (is360p) {
        priceKey = `p360_${calcDuration}`;
    } else if (is540p) {
        priceKey = `p540_${calcDuration}`;
    } else {
        const resPrefix = isHighResMode || normalizedResolution === "1080p" ? "fhd" : "hd";
        priceKey = `${resPrefix}${calcDuration}`;
    }
}
else if (isMinimax) {
    // ⚙️ Logique spécifique pour MiniMax (768p -> hd, 2K -> fhd)
    const is2K = resolution === "2K" || resolution?.toLowerCase().includes("2k") || isHighResMode;
    const resPrefix = is2K ? "fhd" : "hd";
    priceKey = `${resPrefix}${calcDuration}`;
}
else {
    // 🛡️ CORRECTION : On force le préfixe fhd pour Kling 2.6 et Kling 2.6 Motion
    const isKling26Engine = currentEngineId?.includes("kling26") || currentEngineId === "kling2.6";
    const resPrefix = isKling26Engine ? "fhd" : (isSD ? "sd" : (isHighResMode ? "fhd" : "hd"));
    priceKey = `${resPrefix}${calcDuration}`;
}

    console.log("DEBUG PRIX 512P", {
        resolution,
        normalizedResolution,
        is512p,
        calcDuration,
        priceKey
    });
    // Si l'utilisateur utilise ses éclairs bonus, on regarde la table tarifaire de son plan réel, sinon plan "0.00"
    const targetPlan = mustForce ? "0.00" : currentPlanPrice;
    console.log("DEBUG IDENTIFICATION PRIX", {
    currentEngineId,
    pricingId,
    targetPlan,
    tableTrouvee: PRICING_DATA[targetPlan]?.[pricingId]
});
    let baseCost = 0;

    // Tarification dédiée aux moteurs d'images.
    // Si la table du forfait actif est incomplète, on reprend la valeur de référence
    // du tableau 0.00 au lieu d'afficher 0 éclair.
    if (mode === "IMAGE") {
        const imageTable = PRICING_DATA[targetPlan] || {};
        const fallbackImageTable = PRICING_DATA["0.00"] || {};
        const hasReferenceImage = (Array.isArray(modelReferenceImages) && modelReferenceImages.length > 0) || Boolean(startImage || uploadedImage);
        if (currentEngineId === "gpt_image2") {
            const imageKey = hasReferenceImage ? "referenceToImage" : "textToImage";
            baseCost = imageTable?.gptImage2?.[imageKey] || fallbackImageTable?.gptImage2?.[imageKey] || (hasReferenceImage ? 23 : 15);
        } else if (currentEngineId === "flux2pro") {
            const imageWidth = aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 720 : 1024;
            const imageHeight = aspectRatio === "16:9" ? 720 : aspectRatio === "9:16" ? 1280 : 1024;
            const pixels = imageWidth * imageHeight;
            const megapixels = pixels / 1_000_000;
            const sizeKey = megapixels <= 1.5 ? "mp1" : megapixels <= 3 ? "mp2" : "mp4";
            const fallbackFluxCost = sizeKey === "mp1" ? 14 : sizeKey === "mp2" ? 20 : 30;
            baseCost = imageTable?.flux2pro?.[sizeKey] ?? fallbackImageTable?.flux2pro?.[sizeKey] ?? fallbackFluxCost;
        } else if (currentEngineId === "nano_banana2_lite") {
            const imageKey = hasReferenceImage || Boolean(nanoReferenceVideo) ? "reference1k" : "k1";
            baseCost = imageTable?.nanoBanana2Lite?.[imageKey] ?? fallbackImageTable?.nanoBanana2Lite?.[imageKey] ?? 15;
        }
    } else {
        baseCost = PRICING_DATA[targetPlan]?.[pricingId]?.[priceKey] || 0;
    }

    // Fallback de sécurité corrigé pour Hailuo ; ne pas remplacer un tarif d'image manquant par un ancien prix FLUX.
    if (mode === "VIDEO" && baseCost === 0) {
        const fallbackData = currentEngineData.prices?.[calcDuration] || Object.values(currentEngineData.prices || {})[0];
        
        let defaultResKey = isHighResMode ? "1080p" : "720p";
  if (currentEngineId === "kling2.6" || currentEngineId.includes("kling26")) {
    defaultResKey = "1080p";
} else if (isHailuo) {
    defaultResKey = is512p
        ? (calcDuration === "10" ? "p512_10" : "p512_6")
        : "hd" + calcDuration;
} else if (isPixverse) {
        // ⚙️ Fallback Pixverse dynamique selon résolution demandée
        defaultResKey = is360p ? `p360_${calcDuration}`
                      : is540p ? `p540_${calcDuration}`
                      : isHighResMode ? `fhd${calcDuration}`
                      : `hd${calcDuration}`;
    }

        baseCost = fallbackData?.[defaultResKey] || currentEngineData.rubyPrice || 20;
    }

// 4. MULTIPLICATEURS ET ARRONDIS
if (mode === "VIDEO") {
        const techId = currentEngineId.toLowerCase();

        // 💡 UTILISE TA VARIABLE EXISTANTE
        const hasVideo = Boolean(videoSource);

        // Si Luma + vidéo source : on additionne le prix de base (ex: 20 + 20 = 40)
        if (techId.includes("luma") && hasVideo) {
            baseCost += baseCost; 
        }

        if (wantsAudio) {
            // ✅ On s'assure que seedance25 n'applique PAS de multiplicateur audio (audio gratuit)
        const multi = (techId.includes("seedance25")) ? 1.0 :
              techId.includes("minimax") ? 1.0 :
              techId.includes("seedance20") ? 1.0 :
              techId.includes("kling30") ? 1.5 :
              techId.includes("pixverse") ? 1.3 :
              techId.includes("hailuo") ? 1.0 :
              (techId.includes("veo") && (techId.includes("veo3_lite") || techId.includes("veo3.1_fast"))) ? 1.5 :
              (techId.includes("kling")  || techId.includes("veo") || techId.includes("luma")) ? 2.0 : 
              (techId.includes("seedance") ? 2.0 : 1.25);

            baseCost *= multi;
        }

        if (endImage && userTierIdx < masterIdx) {
            baseCost += 1;
        }

        const isExactPriceModel = techId.includes("minimax") || 
                                       techId.includes("lite") || 
                                       techId.includes("kling") || 
                                       techId.includes("hailuo") || 
                                       techId.includes("pixverse") || 
                                       techId.includes("seedance") ||
                                       techId.includes("veo");

        if (isExactPriceModel) {
            baseCost = Math.ceil(baseCost);
        } else {
            baseCost = baseCost > 20 ? Math.ceil(baseCost / 5) * 5 : Math.ceil(baseCost);
        }
    } else {
        baseCost = Math.ceil(baseCost);
    }

    setCost(baseCost);
  }
},

// Et dans ton tableau de dépendances, mets bien ta vraie variable au lieu de hasVideoSource :
[selectedModel, resolution, mode, duration, wantsAudio, endImage, userPlan, videoSource, videoSourceDuration, seedance25Operation, modelReferenceImages, startImage, uploadedImage, nanoReferenceVideo, aspectRatio]);
const getEndpoint = (engineData, hasStartImage, hasVideoSource) => {
  if (!engineData || !engineData.id) return "";
  const engineId = String(engineData.id).toLowerCase();

  // Runware identifie directement les modèles vidéo : aucun endpoint fournisseur côté client.
  if (engineData.runwareModel ||
      engineId.includes("veo3.1") ||
      engineId === "kling26_motion" ||
      engineId.includes("kling") ||
      engineId.includes("hailuo") ||
      engineId.includes("minimax_h3") ||
      engineId === "pixverse6" ||
      engineId === "seedance25" ||
      engineId === "seedance20") {
    return engineData.runwareModel || engineData.endpoint || "";
  }

  // Fal est conservé exclusivement pour Seedance 1.5 Pro.
  if (engineId === "seedance") {
    return hasStartImage
      ? "fal-ai/bytedance/seedance/v1.5/pro/image-to-video"
      : "fal-ai/bytedance/seedance/v1.5/pro/text-to-video";
  }
  return engineData.textEndpoint || engineData.endpoint || "";
};
// --- FONCTION handleGenerate ---
const handleGenerate = async () => {
  // 🛑 BLOQUE EN 0ms SI CRÉDITS INSUFFISANTS (Pas de spinner, pas d'API)
  const requiredCost = parseInt(cost || 0, 10);
  const availableEclairs = tokens || 0;
  const availableDiamonds = packTokens || 0;

  const hasEnough = forceDiamonds 
    ? (availableDiamonds >= requiredCost)
    : ((availableEclairs + availableDiamonds) >= requiredCost);

  if (!hasEnough) {
    if (typeof setNeededAmount === 'function') setNeededAmount(requiredCost);
    if (typeof setShowInsufficientFunds === 'function') setShowInsufficientFunds(true);
    return; // STOP TOTAL INSTANTANÉ !
  }
  setIsLoading(true);
// 🧪 MODE TEST (Placé au bon endroit)
  const TEST_MODE = false;
  console.log("🧪 TEST_MODE =", TEST_MODE);

  if (TEST_MODE) {
    // Fausse URL pour éviter l'erreur "finalUrl is not defined"
    const fakeUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    console.log("🎯 --- VÉRIFICATION TEST KLING 3.0 ---");
    console.log("📐 Résolution choisie :", resolution);
    console.log("🔗 Endpoint généré :", targetModelEndpoint);
    console.log("-------------------------------------");

    const item = {
      id: Date.now(),
      url: fakeUrl,
      type: mode,
      prompt,
      model: selectedModel,
      style: selectedStyle,
      aspectRatio,
      duration,        
      resolution,        
      startImage: startImage || null, 
      endImage: endImage || null,    
      wantsAudio: wantsAudio || false, 
      createdAt: new Date().toISOString()
    };

setActiveItem(item);

    setIsLoading(false);
    return;
  }

  console.log("🚀 Début de handleGenerate");
  if (!prompt) return;
const activeEngineId = selectedModel?.toLowerCase() || "";

const engineData = engines.find(e =>
  e.id === selectedModel ||
  e.name === selectedModel ||
  e.id === activeEngineId ||
  e.name?.toLowerCase() === activeEngineId
);

if (!engineData) {
  console.error("❌ Moteur introuvable :", selectedModel);
  setIsLoading(false);
  return;
}

  const styleKey = (selectedStyle || "").trim().toLowerCase();
  let cleanPrompt = prompt ? prompt.trim().slice(0, getPromptLimit(mode, engineData.id, Boolean(startImage || endImage), Boolean(videoSource))) : "";
  let styleSuffix = "";

  // Définition des suffixes selon le style
switch (styleKey) {
    case "cyberpunk":
      styleSuffix = "Cyberpunk style, futuristic, neon lighting, night city, 8k details, cinematic";
      break;
    case "anime":
    case "manga":
      styleSuffix = "Japanese anime style, modern manga illustration, clean lines, vibrant colors, masterpiece quality";
      break;
    case "réaliste":
    case "real":
    case "film":
      styleSuffix = "photorealistic, extreme realism, Hollywood cinema quality, 8k, detailed skin textures, volumetric lighting, HDR";
      break;
    case "animation 3d":
      styleSuffix = "3D animation style, Pixar aesthetic, a cute little robot holding a glowing neon crystal in a magical enchanted forest at night, volumetric lighting, bioluminescent glowing plants, highly detailed textures, expressive character design, cinematic depth of field, 8k resolution, smooth motion.";
      break;
    case "art":
      styleSuffix = "oil painting style, textured brushstrokes, classical fine art aesthetic, rich color palette, masterpiece canvas texture";
      break;
    case "espace":
      styleSuffix = "espace profond, ambiance cosmique, étoiles précises, qualité IMAX, éclairage spatial réaliste";
      break;
    case "animation":
      styleSuffix = "style film d'animation 3D, couleurs riches, décors magistraux, féerique, style Pixar ou Disney moderne";
      break;
    case "marketing":
      styleSuffix = "photographie publicitaire premium, style magazine de luxe, éclairage de studio professionnel, esthétique glamour, netteté extrême";
      break;
    case "aquarelle":
      styleSuffix = "style peinture aquarelle, touches artistiques fluides, éclaboussures de peinture fine, couleurs vives";
      break;
    case "stop motion":
      styleSuffix = "style stop-motion en pâte à modeler, textures tactiles et artisanales visibles, animation image par image";
      break;
    default:
      styleSuffix = "qualité supérieure, ultra détaillé";
  }
  // 🛡️ Anti-doublon : On vérifie si la première expression du style est déjà dans le prompt
  const firstKeyword = styleSuffix.split(',')[0].trim().toLowerCase();
  
  let finalPrompt = cleanPrompt;
  if (!cleanPrompt.toLowerCase().includes(firstKeyword)) {
      finalPrompt = `${cleanPrompt}, ${styleSuffix}`;
  }

  // Nettoyage final des doubles virgules et espaces multiples
  finalPrompt = finalPrompt.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').slice(0, getPromptLimit(mode, engineData.id, Boolean(startImage || endImage), Boolean(videoSource)));
// --- 🔍 LOG DE VÉRIFICATION ---
  console.log("--- PROMPT FINAL ENVOYÉ À L'API ---");
  console.log("Moteur:", selectedModel);
  console.log("Prompt:", finalPrompt);
  console.log("Style appliqué:", selectedStyle);


if (engineData.id === "seedance25" && videoSource && seedance25Operation === "edit" && !(videoSourceDuration > 0)) {
  setErrorMsg(t("line3_app_error_waitSourceDuration"));
  return;
}
// Déclaration unique au début
let finalModelId = engineData.id;
const isKlingMotion = finalModelId === "kling26_motion";

if (isKlingMotion && !startImage && !uploadedImage) {
  if (typeof setErrorMsg === 'function') setErrorMsg(t("line3_app_error_selectCharacterImage"));
  return;
}

if (isKlingMotion && !videoSource) {
  if (typeof setErrorMsg === 'function') setErrorMsg(t("line3_app_error_importMotionVideo"));
  return;
}

  // --- 1. CONFIGURATION DES PALIERS ---
  const packs = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];
  const userPlanPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
  const userTierIndex = packs.indexOf(userPlanPrice);
  const masterTierIndex = packs.indexOf("34.99"); 
  const isPriorityUser = userPlanPrice === "59.99" || userPlanPrice === "159.99";

  // --- 2. DÉTERMINATION DE L'ID MODÈLE ET DURÉE ---
finalModelId = engineData.id;  let effectiveDuration = mode === "IMAGE" ? "0" : duration.toString().replace(/\D/g, "");
const isHighRes = (resolution === "Full HD" || resolution === "1080p");

  // 🛡️ SÉCURITÉ VEO : On nettoie les entrées avant de préparer l'objet final
if (
  finalModelId.toLowerCase().includes("veo") &&
  !veoVideoOperation
) {
  console.warn("⚠️ Nettoyage des paramètres Veo.");
  setVideoSource(null);
  setEndImage(null);
}

  // --- 3. RÉCUPÉRATION DU COÛT ET DU TYPE (DEPUIS LE STUDIO) ---
  // On utilise finalCost et costType pour être raccord avec l'affichage à l'écran
  const finalCost = cost; 
  const finalType = forceDiamonds ? "diamonds" : "tokens";

// --- LOGIQUE DE DÉBIT UNIQUE (Ne pas déclarer deux fois !) ---

  let finalEclairs = tokens;
  let finalDiamonds = packTokens;
  let paymentDetail = { eclairs: 0, diamonds: 0 };

  if (finalType === "diamonds") {
      paymentDetail.diamonds = finalCost;
      finalDiamonds = packTokens - finalCost;
  } else {
      let remainingToPay = finalCost;
      if (tokens > 0) {
          const deduction = Math.min(tokens, remainingToPay);
          paymentDetail.eclairs = deduction;
          finalEclairs = tokens - deduction;
          remainingToPay -= deduction;
      }
      if (remainingToPay > 0) {
          paymentDetail.diamonds = remainingToPay;
          finalDiamonds = packTokens - remainingToPay;
      }
  }
  // --- 6. LANCEMENT DE LA GÉNÉRATION ---

  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (mode !== "TEXTE") setProgress(15);

  try {
    // ... ton fetch vers l'API commence ici
      if (mode === "TEXTE") {
        // ... (Ton code texte existant)
      } else {
        // --- LOGIQUE IMAGE / VIDEO ---

       // ✅ 1. Gestion des messages de statut
if (isPriorityUser) {
    setStatusMsg(`⚡ Priorité Max : ${selectedModel} vous répond immédiatement...`);
} else {
    // On utilise selectedModel pour que le message change selon ton choix
    const actionVerb = mode === "IMAGE" ? t("line1_app_status_prepareImage") : t("line1_app_status_stageVideo");
    setStatusMsg(`⏳ ${selectedModel} : ${actionVerb}...`);
}

        let width = 1024, height = 1024;
        if (aspectRatio === "16:9") { width = 1280; height = 720; }
        if (aspectRatio === "9:16") { width = 720; height = 1280; }

// --- 4. PRÉPARATION DES PARAMÈTRES POUR LUMA ---
const lumaParams = {
    prompt: finalPrompt, // ✅ CORRIGÉ : On utilise finalPrompt (qui contient le style appliqué) au lieu de userPrompt
    resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p",
    duration: (effectiveDuration === "10" || effectiveDuration === "9") ? "9s" : "5s",
    aspect_ratio: aspectRatio || "16:9", // ✅ CORRIGÉ : On utilise la variable globale aspectRatio
    image_url: startImage || uploadedImage || null,
    
    // Ajoute cette ligne pour activer l'interpolation (A -> B)
    end_image_url: endImage || null, 
    
    loop: false 
};

// --- 1. Calcul du modèle final (Mutation vers Image-to-Image)
// On vérifie startImage OU uploadedImage pour être sûr de couvrir tous les cas de Remix
// ✅ CORRIGÉ : Pas de "let" (on réassigne la variable déjà créée plus haut) et on utilise engineData
finalModelId = engineData.id.toLowerCase();
const hasImageSource = startImage || uploadedImage;

// 2. Choix de l'endpoint
const endpoint = mode === "IMAGE" ? 'generate-image' : 'generate-video';    
const isKling = finalModelId.includes("kling");
const isV26 = finalModelId.includes("v2.6");

const imageKey = isKling ? (isV26 ? "start_image_url" : "image_url") : "start_image_url";
const tailKey = isKling ? (isV26 ? "end_image_url" : "tail_image_url") : "end_image_url";

// ... juste avant le "const endpoint = ..."

// 2. Choix dynamique de l'endpoint via la nouvelle fonction

const hasStartImage =
  !!(startImage || uploadedImage);

const hasVideoSource =
  typeof videoSource !== 'undefined'
    ? !!videoSource
    : false;

const targetModelEndpoint =
  getEndpoint(
    engineData,
    hasStartImage,
    hasVideoSource
  );

// --- 📊 RÉSUMÉ DES PARAMÈTRES DE GÉNÉRATION ---
console.log("--- 📊 PARAMÈTRES DE GÉNÉRATION ---");
console.log("🤖 Moteur :", selectedModel);
console.log("🔗 Endpoint choisi :", targetModelEndpoint);
console.log("📐 Résolution :", resolution);
console.log("📏 Format (Aspect Ratio) :", aspectRatio);
console.log("⏱️ Durée :", effectiveDuration);
console.log("🎨 Style :", selectedStyle);
console.log("🖼️ Image de début :", !!(startImage || uploadedImage));
console.log("🏁 Image de fin :", !!endImage);
console.log("🔊 Audio activé :", wantsAudio);
console.log("----------------------------------");
// 3. Appel API (Détermination dynamique de la route)
const targetRoute = mode === "VIDEO" ? "generate-video" : "generate-image";

// Préparation dynamique de la configuration par moteur
const engineSpecificParams = (function() {
    // Fonction utilitaire pour valider la durée selon le modèle
const getValidDuration = (modelId, dur) => {
    const d = parseInt(dur, 10);

    if (modelId.includes("veo")) {
        return [4, 6, 8].includes(d) ? d : 4;
    }

    return d;
};

// ============================================================
// RUNWARE — OPTIONS PIXVERSE V6
// ============================================================
if (finalModelId === "pixverse6") {
    return {
        prompt: finalPrompt,
        resolution: ["360p", "540p", "720p", "1080p"].includes(resolution) ? resolution : "720p",
        duration: Math.max(1, Math.min(15, parseFloat(effectiveDuration) || 5)),
        enable_audio: Boolean(wantsAudio),
        negativePrompt: pixverseNegativePrompt.trim(),
        ...(pixverseSeed.trim() !== "" && Number.isInteger(Number(pixverseSeed)) && Number(pixverseSeed) >= 0 ? { seed: Number(pixverseSeed) } : {}),
        settings: {
            audio: Boolean(wantsAudio),
            multiClip: Boolean(pixverseMultiClip),
            ...(pixverseStyle ? { style: pixverseStyle } : {}),
            thinking: pixverseThinking
        },
        ...(videoSource ? { video_url: videoSource } : {}),
        ...(startImage || uploadedImage ? { start_image_url: startImage || uploadedImage } : {}),
        ...(endImage ? { end_image_url: endImage } : {})
    };
}

// ============================================================
// RUNWARE — SEEDANCE 2.0 / 2.5 : RÉFÉRENCES MULTIMODALES
// ============================================================
if (finalModelId === "seedance20" || finalModelId === "seedance25") {
    return {
        prompt: finalPrompt,
        aspect_ratio: aspectRatio || "16:9",
        resolution: resolution || "720p",
        duration: Math.max(4, Math.min(finalModelId === "seedance25" ? 30 : 15, parseInt(effectiveDuration, 10) || 5)),
        ...(seedanceSeed.trim() !== "" && Number.isInteger(Number(seedanceSeed)) && Number(seedanceSeed) >= 0 ? { seed: Number(seedanceSeed) } : {}),
        enable_audio: seedanceAudioEnabled,
        settings: {
            audio: seedanceAudioEnabled,
            ...(finalModelId === "seedance25" && videoSource ? { operation: seedance25Operation } : {})
        },
        ...(videoSource ? { video_url: videoSource } : {}),
        ...(startImage || uploadedImage ? { start_image_url: startImage || uploadedImage } : {}),
        ...(endImage ? { end_image_url: endImage } : {}),
        ...(seedanceReferenceImages.length ? { referenceImages: seedanceReferenceImages } : {}),
        ...(seedanceReferenceVideos.length ? { referenceVideos: seedanceReferenceVideos } : {}),
        ...(seedanceReferenceAudios.length ? { referenceAudios: seedanceReferenceAudios } : {})
    };
}

// ============================================================
// RUNWARE — MODÈLES IMAGE
// ============================================================
if (["gpt_image2", "flux2pro", "nano_banana2_lite"].includes(finalModelId)) {
    return {
        prompt: finalPrompt,
        width,
        height,
        aspect_ratio: aspectRatio || "1:1",
        outputFormat: imageOutputFormat,
        ...(imageSeed.trim() !== "" && Number.isInteger(Number(imageSeed)) && Number(imageSeed) >= 0 ? { seed: Number(imageSeed) } : {}),
        ...(finalModelId === "gpt_image2" ? { providerSettings: { openai: { quality: gptImageQuality, moderation: gptImageModeration } } } : {}),
        ...(finalModelId === "flux2pro" ? { providerSettings: { bfl: { safetyTolerance: Number(fluxSafetyTolerance) } } } : {}),
        ...(finalModelId === "nano_banana2_lite" ? { settings: { thinking: nanoThinking, temperature: Number(nanoTemperature), topP: Number(nanoTopP), ...(nanoSystemPrompt.trim() ? { systemPrompt: nanoSystemPrompt.trim().slice(0, 50000) } : {}) } } : {}),
        ...(modelReferenceImages.length ? { referenceImages: modelReferenceImages } : {}),
        ...(finalModelId === "nano_banana2_lite" && nanoReferenceVideo ? { referenceVideos: [nanoReferenceVideo] } : {})
    };
}

// ============================================================
// 🛡️ VEO 3.1 / VEO 3.1 FAST — RUNWARE
// ============================================================
if (finalModelId.includes("veo3.1")) {

    const isFast =
        finalModelId.includes("fast") ||
        finalModelId.includes("flash");

    const hasVid = Boolean(videoSource);
    const hasImg = Boolean(startImage || uploadedImage);

    return {
        prompt: finalPrompt,

        aspect_ratio:
            aspectRatio || "16:9",

        duration:
            getValidDuration(
                finalModelId,
                effectiveDuration
            ),

        resolution:
            (resolution === "Full HD" ||
             resolution === "1080p")
                ? "1080p"
                : "720p",

        enable_audio:
            wantsAudio,

        // Modèle Runware
        runwareModel:
            isFast
                ? "google:3@3"
                : "google:3@2",

        // Vidéo source
        ...(hasVid
            ? {
                video_url: videoSource
              }
            : {}),

        // Image de départ
        ...(hasImg
            ? {
                image_url:
                    startImage ||
                    uploadedImage
              }
            : {})
    };
}
// ============================================================
// 🎬 KLING 2.6 PRO FULL HD — RUNWARE
// ============================================================
if (finalModelId === "kling2.6") {

    const hasVid = Boolean(videoSource);
    const hasImg = Boolean(startImage || uploadedImage);

    return {
        prompt: finalPrompt,

        aspect_ratio:
            aspectRatio || "16:9",

        duration:
            getValidDuration(
                finalModelId,
                effectiveDuration
            ),

        // Kling 2.6 Pro = Full HD uniquement
        resolution: "1080p",

        enable_audio:
            wantsAudio,

        // Modèle Runware
        runwareModel:
            "klingai:kling-video@2.6-pro",

        // ====================================================
        // 🎥 VIDÉO SOURCE → VIDEO TO VIDEO
        // ====================================================
        ...(hasVid
            ? {
                video_url: videoSource
              }
            : {}),

        // ====================================================
        // 🖼️ IMAGE DE DÉPART → IMAGE TO VIDEO
        // ====================================================
        ...(hasImg
            ? {
                image_url:
                    startImage ||
                    uploadedImage
              }
            : {})
    };
}
// ============================================================
// 🎬 KLING 2.6 MOTION CONTROL — RUNWARE
// ============================================================
if (isKlingMotion) {

    const motionImage =
        startImage ||
        uploadedImage ||
        null;

    const motionVideo =
        videoSource ||
        null;

    return {

        prompt:
            finalPrompt,

        duration:
            getValidDuration(
                finalModelId,
                effectiveDuration
            ),

        resolution:
            "1080p",

        // Modèle Runware
        runwareModel:
            "klingai:kling-video@2.6-pro",

        // Image du personnage
        image_url:
            motionImage,

        // Vidéo contenant les mouvements
        video_url:
            motionVideo,

        // Orientation du personnage
        character_orientation:
            (
                typeof characterOrientation !== "undefined" &&
                characterOrientation
            )
                ? characterOrientation
                : "video",

        // Conserver le son original de la vidéo
        keep_original_sound:
            (
                typeof wantsAudio !== "undefined"
            )
                ? wantsAudio
                : true
    };
}
// ✅ GESTION SPÉCIFIQUE MINIMAX (H3)
// ============================================================
// 🎬 MINIMAX H3 — RUNWARE
// ============================================================
if (finalModelId === "minimax_h3") {

    const h3Duration = Math.max(
        4,
        Math.min(
            15,
            parseInt(effectiveDuration, 10) || 5
        )
    );

    const h3Resolution =
        resolution === "2K" ||
        resolution === "1440p"
            ? "1440p"
            : "768p";

    const hasVid = Boolean(videoSource);
    const hasStart = Boolean(startImage || uploadedImage);
    const hasEnd = Boolean(endImage);

    return {
        prompt: finalPrompt,

        resolution: h3Resolution,

        duration: h3Duration,

        // Image de départ
        ...(hasStart
            ? {
                startImage:
                    startImage ||
                    uploadedImage
              }
            : {}),

        // Image de fin
        ...(hasEnd
            ? {
                endImage: endImage
              }
            : {}),

        // Vidéo de référence + opération choisie dans l'interface
        ...(hasVid
            ? {
                video: videoSource,
                video_url: videoSource,
                operation: minimaxH3VideoOperation
              }
            : {}),

        // Références multimodales : Runware impose une image ou une vidéo si l'audio est fourni.
        ...(h3ReferenceImages.length ? { referenceImages: h3ReferenceImages.slice(0, 9) } : {}),
        ...(h3ReferenceVideos.length ? { video_urls: h3ReferenceVideos.slice(0, 3) } : {}),
        ...(h3ReferenceAudios.length ? { audio_urls: h3ReferenceAudios.slice(0, 3) } : {}),
        ...(h3Dialogue.trim() ? { dialogue: h3Dialogue.trim().slice(0, 2000) } : {}),
        ...(h3Seed.trim() !== "" && Number.isInteger(Number(h3Seed)) && Number(h3Seed) >= 0 ? { seed: Number(h3Seed) } : {}),
        settings: { promptExpansion: h3PromptExpansion },
        enable_audio: true
    };
}
    // 1. ISOLATION DE VEO LITE
    /*
if (finalModelId.includes("veo3_lite")) {
    return { 
        prompt: finalPrompt, 
        duration: getValidDuration(finalModelId, effectiveDuration),
        enable_audio: wantsAudio, 
        resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p", 
        aspect_ratio: aspectRatio,
        ...((typeof videoSource !== 'undefined' && videoSource) ? { video_url: videoSource } : { image_url: startImage || uploadedImage || null }) 
    };
}
    
    // 2. VEO STANDARD (Correction ici)
    if (finalModelId.includes("veo")) {
        return { 
            prompt: finalPrompt, 
            duration: getValidDuration(finalModelId, effectiveDuration), // <--- Utilise la fonction de sécurité
            enable_audio: wantsAudio, 
            resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p", 
            aspect_ratio: aspectRatio, 
            ...((typeof videoSource !== 'undefined' && videoSource) ? { video_url: videoSource } : { image_url: startImage || uploadedImage || null }) 
        };
    }
*/

    // ... tes autres conditions (kling, pixverse, etc.) ...
    if (finalModelId.includes("kling")) return { prompt: finalPrompt, [imageKey]: startImage || uploadedImage || null, [tailKey]: endImage || null, generate_audio: wantsAudio, aspect_ratio: aspectRatio, duration: ["15", "10", "5"].includes(effectiveDuration) ? effectiveDuration : "5", negative_prompt: "blur, distort, and low quality" };
// Les traitements PixVerse V6 et Seedance 2.0/2.5 sont définis plus haut avec leurs paramètres Runware dédiés.
if (finalModelId === "seedance") {
        return {
            prompt: finalPrompt,
            aspect_ratio: aspectRatio || "16:9",
            resolution: resolution || "720p",
            duration: parseInt(effectiveDuration) || 5,
            generate_audio: wantsAudio,
            image_url: startImage || uploadedImage || null,
            end_image_url: endImage || null
        };
    }

 if (finalModelId.includes("hailuo")) 
return { 
    prompt: finalPrompt, 
    image_url: startImage || uploadedImage || null, 
    prompt_optimizer: true, 
    aspect_ratio: aspectRatio,
    resolution:
        (resolution === "Full HD" || resolution === "1080p")
            ? "1080p"
            : "768p",
    duration: parseInt(effectiveDuration, 10)
};   if (finalModelId.includes("lite")) return { prompt: finalPrompt, image_url: startImage || uploadedImage || null, end_image_url: endImage || null, duration: parseInt(effectiveDuration), resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p", aspect_ratio: aspectRatio };
    
    return { prompt: finalPrompt, start_image_url: startImage || uploadedImage || null, end_image_url: endImage || null, aspect_ratio: aspectRatio };
})();

// Détection explicite de l'image disponible
const currentStartImg =
    (typeof startImage === "string" && startImage.trim())
        ? startImage
        : (typeof uploadedImage === "string" && uploadedImage.trim()
            ? uploadedImage
            : null);

console.log(
    "🖼️ IMAGE DE DÉPART ENVOYÉE :",
    currentStartImg
        ? (currentStartImg.startsWith("data:")
            ? "DATA URL / BASE64"
            : currentStartImg)
        : "AUCUNE IMAGE"
);
let recaptchaToken = "";

try {
    console.log("🛡️ Attente de reCAPTCHA Enterprise...");

    if (!window.grecaptcha?.enterprise) {
        throw new Error("reCAPTCHA Enterprise n'est pas chargé.");
    }

    // Attendre que Google ait terminé son initialisation
    await new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(resolve);
    });

    console.log("✅ reCAPTCHA Enterprise prêt.");

recaptchaToken = await window.grecaptcha.enterprise.execute(
    "6LdYEaItAAAAALoBXNIY3bjruS-UiAla3Ns2M1sq",
    {
        action: mode === "IMAGE" ? "generate_image" : "generate_video"
    }
);

    if (!recaptchaToken) {
        throw new Error("Google n'a retourné aucun token reCAPTCHA.");
    }

    console.log("✅ Token reCAPTCHA généré : OUI");

} catch (e) {
    console.error("❌ Erreur reCAPTCHA :", e);

    setIsLoading(false);
    setProgress(0);
    setStatusMsg("");

    if (typeof setErrorMsg === "function") {
        setErrorMsg(
            t("line3_app_error_securityUnavailable")
        );
    }

    return;
}
console.log("🔍 Valeur actuelle de videoSource :", videoSource);
const payload = { 
    userId: user.uid,
    engineId: finalModelId,
    modelEndpoint: targetModelEndpoint,
    cost: cost,
    costType: forceDiamonds ? "diamonds" : "tokens",
    enable_audio: wantsAudio,
    prompt: finalPrompt,
    
    recaptchaToken: recaptchaToken,

    aspect_ratio: aspectRatio, 
    
    duration: effectiveDuration,

resolution: (finalModelId.includes("hailuo") || finalModelId.includes("seedance20") || finalModelId.includes("seedance25") || finalModelId.includes("seedance")) 
    ? resolution 
    : ((["540p", "Full HD", "1080p", "720p", "480p"].includes(resolution)) ? resolution : "720p"),

    // Transmission des images sous les différents formats attendus
  
 // Pour Veo, l'image de départ sera envoyée uniquement via
 // engineSpecificParams.image_url.
 ...(!finalModelId.toLowerCase().includes("veo3.1")
    ? {
        startImage: currentStartImg,
        start_image_url: currentStartImg,
        image_url: currentStartImg
      }
    : {}),

 end_image_url: endImage || null,


video: videoSource || null,

...(finalModelId === "minimax_h3" &&
    h3ReferenceVideos.length > 0 && {
      video_urls: h3ReferenceVideos
    }),

video_url: videoSource || null,

// Opération Veo 3.1 : modification ou prolongation

...(finalModelId.toLowerCase().includes("veo3.1") &&
    videoSource &&
    veoVideoOperation && {
        videoOperation: veoVideoOperation
    }),


...(finalModelId.toLowerCase().includes("veo3.1") &&
    veoReferenceImages.filter(
        url => url && url !== currentStartImg
    ).length > 0 && {
        referenceImages: [
            ...new Set(
                veoReferenceImages.filter(
                    url => url && url !== currentStartImg
                )
            )
        ].slice(0, 3)
    }),

    // Images de référence MiniMax H3
...(finalModelId === "minimax_h3" &&
    h3ReferenceImages.length > 0 && {
        referenceImages: h3ReferenceImages.slice(0, 9)
    }),
    // Références d'image pour les modèles image Runware
...(["gpt_image2", "flux2pro", "nano_banana2_lite"].includes(finalModelId) && modelReferenceImages.length > 0 && {
    referenceImages: modelReferenceImages
}),
    // Références multimodales Seedance 2.0/2.5
...(["seedance20", "seedance25"].includes(finalModelId) && seedanceReferenceImages.length > 0 && {
    referenceImages: seedanceReferenceImages
}),
...(["seedance20", "seedance25"].includes(finalModelId) && seedanceReferenceVideos.length > 0 && {
    referenceVideos: seedanceReferenceVideos
}),
...(["seedance20", "seedance25"].includes(finalModelId) && seedanceReferenceAudios.length > 0 && {
    referenceAudios: seedanceReferenceAudios
}),
...(finalModelId === "nano_banana2_lite" && nanoReferenceVideo ? { referenceVideos: [nanoReferenceVideo] } : {}),

    width: width,
    height: height,
    engine: selectedModel,
    priority: isPriorityUser ? "high" : "normal",
    style: selectedStyle,
    
    // Fusion des paramètres spécifiques à chaque moteur
    ...engineSpecificParams,
    
    // Condition pour le mode remix/image
    ...(mode === "IMAGE" && hasImageSource && { strength: 1 - (remixStrength || 0.5) })
};
// 1. Nettoyage du payload : on supprime les valeurs nulles/indéfinies pour ne pas polluer l'API
const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
);

// 🛡️ SÉCURITÉ : On s'assure que le token reCAPTCHA n'est jamais supprimé par le filtre ci-dessus
if (recaptchaToken) {
    cleanPayload.recaptchaToken = recaptchaToken;
}

console.log("🔍 [DEBUG] Payload nettoyé envoyé au serveur :", JSON.stringify(cleanPayload, null, 2));

const currentUser = auth.currentUser;
const token = currentUser ? await currentUser.getIdToken() : '';

const res = await fetch(`${import.meta.env.VITE_API_URL}/${targetRoute}`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(cleanPayload)
});

// --- 1. GESTION DE L'ERREUR SERVEUR (0 CRÉDIT, ETC.) ---// 🛑 1. GESTION DES ERREURS HTTP (400, 500, etc.)
if (!res.ok) {
    let errorMessage = t("line3_app_error_generation");
    try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
        errorMessage = await res.text().catch(() => errorMessage);
    }
    
    console.error("❌ Erreur serveur détaillée :", errorMessage);

    // Arrêt strict du loader et réinitialisation de l'UI
    setIsLoading(false);
    setProgress(0);
    setStatusMsg("");
    if (typeof setErrorMsg === 'function') {
        setErrorMsg(errorMessage);
    } else {
        alert(errorMessage);
    }

    // ⚡ RABAISSEMENT ET RAFRAÎCHISSEMENT DES CRÉDITS UTILISATEUR
    if (typeof fetchUserProfile === 'function') {
        fetchUserProfile(); 
    }
    return; // On stoppe l'exécution immédiatement !
}

// --- PARSAGE COMPATIBLE JSON RUNWARE + FLUX SSE (VEO / SEEDANCE 1.5) ---
let data = null;
const contentType = (res.headers.get("content-type") || "").toLowerCase();

if (contentType.includes("application/json")) {
    // Les moteurs Runware synchrones renvoient du JSON classique.
    data = await res.json();
    if (data?.status === "failed" || data?.error) {
        setIsLoading(false);
        setProgress(0);
        setStatusMsg("");
        setErrorMsg(data.error || t("line3_app_error_generationFailed"));
        if (typeof fetchUserProfile === "function") fetchUserProfile();
        return;
    }
} else {
    // Veo et Seedance 1.5 utilisent encore un flux SSE.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let sseBuffer = "";
    const parseSseLine = (line) => {
        if (!line.startsWith("data:")) return false;
        try {
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) return false;
            const parsed = JSON.parse(jsonStr);
            data = parsed;
            if (parsed.status === "failed" || parsed.error) {
                setIsLoading(false);
                setProgress(0);
                setStatusMsg("");
                setErrorMsg(parsed.error || t("line3_app_error_technicalGeneration"));
                if (typeof fetchUserProfile === "function") fetchUserProfile();
                return true;
            }
        } catch (e) {
            console.warn("Événement SSE JSON ignoré :", e.message);
        }
        return false;
    };
    while (true) {
        const { value, done } = await reader.read();
        sseBuffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = sseBuffer.split(/\r?\n/);
        sseBuffer = lines.pop() || "";
        for (const line of lines) {
            if (parseSseLine(line)) return;
        }
        if (done) break;
    }
    if (sseBuffer.trim() && parseSseLine(sseBuffer.trim())) return;
}

if (!data) {
    console.error("❌ Impossible de lire le flux de données");
    setIsLoading(false);
    return;

}
// 4. Extraction de l'URL directe
let finalUrl = data.videoURL || data.videoUrl || data.imageUrl || data.url || data.video_url || data.resultUrl;
console.log("✅ DATA FINALE :", data);
console.log("URL IMMÉDIATE :", finalUrl || "Aucune URL retournée");
setStatusMsg("");
setIsLoading(false);
if (!finalUrl) {
    setErrorMsg(t("line3_app_error_noResultUrl"));
    return;
}
// ==========================================================
// 1. CAS SUCCÈS IMMÉDIAT (Simulation / Direct)
// ==========================================================
if (finalUrl) {
    console.log("🎉 Génération immédiate réussie ! URL :", finalUrl);

    const newItem = { 
        id: Date.now(), 
        url: finalUrl, 
        prompt: prompt, 
        type: mode,     
        model: selectedModel,
        style: selectedStyle,
        aspectRatio: aspectRatio, 
        ...(mode === "VIDEO" && {
            resolution: resolution,
            duration: duration,
            startImage: startImage, 
            endImage: endImage,   
            wantsAudio: wantsAudio
        })
    };

// Mise à jour de l'état (uniquement l'élément actif)
    setActiveItem(newItem);

    // 🛑 ARRÊT STRICT DU CHARGEMENT
    setIsLoading(false);
    setProgress(100);
    setStatusMsg("");

    // Nettoyage de l'UI
    setPrompt(""); 
    setStartImage(null); 
    setEndImage(null);
    setWantsAudio(false); 
    setDuration("5");           
    
    if (successAudio.current) successAudio.current.play().catch(() => {});          
    console.log(`✅ ${mode} affichée et enregistrée avec succès.`);
    return;
}




  // Fallback Pollinations pour les images
if (mode === "IMAGE" && finalUrl && finalUrl.includes("pollinations.ai")) {
          const cleanPrompt = encodeURIComponent(`${prompt}, ${selectedStyle} style`);
          finalUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;
        }

        // Sécurité pour éviter le doublon avec un traitement asynchrone
        if (finalUrl && !data.async) {
          // ✅ MISE À JOUR : Objet newItem ultra-complet pour Remix (Image & Vidéo)
          const newItem = { 
            id: Date.now(), 
            url: finalUrl, 
            prompt: prompt, 
            type: mode,     
            
            // --- PARAMÈTRES COMMUNS (Essentiels pour le Remix Image) ---
            model: selectedModel,
            style: selectedStyle,
            aspectRatio: aspectRatio, 
            
            // --- PARAMÈTRES SPÉCIFIQUES VIDÉO (Conditionnels) ---
            ...(mode === "VIDEO" && {
              resolution: resolution,
              duration: duration,
              startImage: startImage, 
              endImage: endImage,   
               wantsAudio: wantsAudio
            })
          };

      // Mise à jour de l'état (uniquement l'élément actif)
         setActiveItem(newItem);
          
          // ✅ NETTOYAGE COMPLET APRÈS SUCCÈS
          setPrompt(""); 
          setStartImage(null); 
          setEndImage(null);
          setWantsAudio(false); 
          setDuration("5");          
          setProgress(100);  
                   setStatusMsg("");
          if(successAudio.current) successAudio.current.play().catch(() => {});          
          console.log(`✅ ${mode} enregistrée dans l'historique avec succès.`);        
        }
      }
// ... fin de ton code de génération (newItem, etc.)
} catch (e) { 
    console.error("❌ Erreur génération:", e);
    
    // 🛑 ARRÊT IMMÉDIAT DU LOADER
    setIsLoading(false);
    setProgress(0);
    setStatusMsg("");

    // Message à l'utilisateur
setErrorMsg(
    e.message && e.message.includes("400")
        ? t("app.error.insufficientCredits", {
            defaultValue: t("line3_app_error_insufficientCreditsVideo")
          })
        : t("app.error.technicalGeneration", {
            defaultValue: t("line3_app_error_refundTechnical")
          })
);

    setTimeout(() => {
        setErrorMsg(null);
    }, 5000);
}
};

const handleSimulation = () => {
  setIsLoading(true); 
  setStatusMsg("Simulation : Test de l'interface...");
  
  setTimeout(() => {
    setIsLoading(false);
    setStatusMsg("");
    console.log("Simulation terminée");
  }, 3000);
};
const handleOptimize = async () => {
    if (!prompt) return;
    setIsThinking(true);
    try {
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken() : '';

 const res = await fetch(`${API_BASE_URL}/intelligence`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ 
    prompt: prompt, // On envoie uniquement le texte saisi par l'utilisateur
    instruction: "Améliore ce prompt pour une IA génératrice de vidéo, sois très précis, donne uniquement le prompt amélioré sans aucun commentaire, sans signature et sans publicité."
  })
});
      
      // 🛡️ Si le serveur renvoie une erreur (ex: 500), on stoppe et on lit le texte brut
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur serveur backend :", errorText);
        throw new Error(`Erreur ${res.status} du serveur`);
      }

      const data = await res.json();
      
      if (!data || !data.result) {
        console.warn("Réponse vide de l'API intelligence", data);
        return;
      }

      let cleanedResult = data.result;
      const separators = ["---", "Pollinations", "Try out", "Généré par", "\n\n"];
      
      separators.forEach(sep => {
        if (cleanedResult && typeof cleanedResult === 'string' && cleanedResult.includes(sep)) {
          cleanedResult = cleanedResult.split(sep)[0];
        }
      });

      if (cleanedResult) {
        setPrompt(cleanedResult.trim());
      }
    } catch (e) { 
      console.error("Erreur lors de l'optimisation :", e); 
    } finally { 
      setIsThinking(false); 
    }
  };
const handleDownload = async () => {
    if (!activeItem?.url) return;
    try {
        const response = await fetch(activeItem.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const extension = activeItem.type === "VIDEO" ? 'mp4' : 'jpg';
        link.download = `eclipse-ia-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Erreur de téléchargement", error);
        window.open(activeItem.url, '_blank');
    }
};

const deleteHistoryItem = async (e, id, itemDocId = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    console.log("🗑️ Tentative de suppression de l'élément :", id);

    // 1. Si c'est un fichier vidéo local importé du PC
    if (typeof id === 'string' && (id.includes('.mp4') || id.includes('local'))) {
        console.log("⚡ Élément local détecté, suppression de l'état local uniquement.");
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory);

        if (activeItem?.id === id) {
            const nextItem = newHistory[0] || null;
            setActiveItem(nextItem);
            if (!nextItem || nextItem.type === "TEXTE") {
                setChatMessages(nextItem?.messages || []);
            }
            setPrompt("");
        }
        return; 
    }
  
    // 2. Si c'est un élément de Firestore (imageLocks)
const currentUser = auth.currentUser;
const realUserId = currentUser.uid;
if (!currentUser) {
    setErrorMsg("Votre session utilisateur n'est plus disponible. Veuillez vous reconnecter.");
    return;
}
const token = await currentUser.getIdToken();

console.log("🔐 Token Firebase récupéré :", !!token);

    if (!realUserId) {
        alert(t("app.error.sessionExpired"));
        return;
    }

    // Utilise l'ID du document Firestore (requestId) transmis ou l'id par défaut
    const targetId = itemDocId || id;

    try {
      // 🔑 ÉTAPE CLÉ AJOUTÉE : Récupération du token d'authentification Firebase
      const token = await currentUser.getIdToken();

      const url = `${import.meta.env.VITE_API_URL}/api/generations/${realUserId}/${targetId}`;
      
      // 🔑 ÉTAPE CLÉ AJOUTÉE : Ajout des headers avec 'Authorization'
      const response = await fetch(url, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la suppression sur le serveur");
      }

      console.log("✅ Élément supprimé de imageLocks et de l'historique !");

      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);

      if (activeItem?.id === id) {
        const nextItem = newHistory[0] || null;
        setActiveItem(nextItem);

        if (!nextItem || nextItem.type === "TEXTE") {
          setChatMessages(nextItem?.messages || []);
        }

        setPrompt("");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
      alert(t("app.error.deleteFailed"));
    }
};

  // Fonction de rendu visuel pour chaque élément de la barre d'historique
  const renderHistoryItem = (item) => {
    console.log("Rendu de l'historique pour :", item.url);
    return (
      <div key={item.id} className="history-card" onClick={() => handleRemix(item)}>
        {/* Miniature Visuelle Média */}
        <div className="history-thumbnail-wrapper">
          {item.type === "IMAGE" ? (
            <img src={item.url} alt={item.prompt} className="history-thumbnail" />
          ) : (
            <video src={item.url} className="history-thumbnail" muted playsInline preload="metadata" />
          )}
          <span className="history-type-badge">
            {item.type === "IMAGE" ? "📸" : "🎬"}
          </span>
        </div>

        {/* Infos de la carte (Prompt & Actions) */}
        <div className="history-info">
          <p className="history-prompt-text">{item.prompt || item.description || item.text || t("app.history.noDescription")}</p>
          <div className="history-actions">
            <button className="btn-remix-small" onClick={(e) => { e.stopPropagation(); handleRemix(item); }}>{t("app.history.remixButton")}</button>
            {item.type === "VIDEO" && (item.url || item.videoUrl) && (
              <button
                type="button"
                className="btn-remix-small"
                onClick={(e) => { e.stopPropagation(); handleEditHistoryItem(item); }}
                title={t("app.history.editVideoTitle")}
              >{t("app.history.editButton")}</button>
            )}
<button
    className="btn-delete-small"
    onClick={(e) => deleteHistoryItem(e, item.id)}
>
    ✕
</button>
         </div>
        </div>
      </div>
    );
  };
// Remplace ton ancienne ligne par celle-ci (un tableau vide)
// 1. On ne met plus un tableau vide, mais on définit une fonction d'import automatique
const importLocalVideos = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return; 
        const token = user ? await user.getIdToken() : '';

        // On ajoute l'en-tête d'authentification pour éviter le 401
        const response = await fetch('${import.meta.env.VITE_API_URL}/api/list-videos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json(); 

        // 🛡️ Sécurité : on s'assure que 'data' est bien un tableau avant de faire .map
        const fileNames = Array.isArray(data) ? data : [];

        const localItems = fileNames.map(fileName => ({
            id: `local-${fileName}`, 
            url: `${import.meta.env.VITE_API_URL}/videos/${fileName}`,
            prompt: `Fichier local : ${fileName}`,
            type: "VIDEO",
            model: "Local",
            resolution: "1080p",
            duration: "5"
        }));

        setHistory(prev => {
            const newItems = localItems.filter(item => !prev.some(p => p.id === item.id));
            return [...newItems, ...prev];
        });
        
        console.log("✅ Vidéos locales importées avec succès :", localItems.length);
    } catch (error) {
        console.error("❌ Erreur lors de l'import des vidéos locales :", error);
    }
};

// 2. IMPORTANT : Appelle cette fonction dès que le composant se charge
// ✅ Le gardien qui s'aligne STRICTEMENT sur ton code d'origine
useEffect(() => {
    if (mode !== "VIDEO" || !selectedModel) return;

const model = selectedModel.toLowerCase();
const cleanModel = model.replace(/[^a-z0-9]/g, '');
    const d = duration.toString();

    let allowed = [];

if (cleanModel.includes("seedance25") || cleanModel.includes("seedance-2.5")) {
    // ✅ GESTION SPÉCIFIQUE SEEDANCE 2.5 : Génère toujours toutes les durées de 4 à 30 secondes
    allowed = Array.from({ length: 27 }, (_, i) => String(i + 4));

    
    } else if (cleanModel.includes("veo3") && !model.includes("lite")) {
        allowed = ["4", "6", "8"];
    } else if (model.includes("lite")) {
        allowed = ["4", "8"];
} else if (cleanModel.includes("seedance20") || cleanModel.includes("seedance-2.0") || cleanModel.includes("seedance 2.0")) {
    // ✅ GESTION SPÉCIFIQUE SEEDANCE 2.0 : Génère toutes les durées de 4 à 15 secondes (12 valeurs)
    allowed = Array.from({ length: 12 }, (_, i) => String(i + 4));
    } else if (cleanModel.includes("minimaxh3")) {

    // MiniMax H3 : toutes les durées de 4 à 15 secondes
    allowed = Array.from(
        { length: 12 },
        (_, i) => String(i + 4)
    );


    } else {
        // Logique miroir exacte de ton "CAS GÉNÉRAL"
        const firstOption = model.includes("seedance") ? "4" : model.includes("hailuo") ? "6" : "5";
        allowed.push(firstOption);

        const isHailuoPro = model.includes("hailuo") && (resolution === "Full HD" || resolution === "1080p");
        if (!isHailuoPro) {
            const secondOption = model.includes("seedance") ? "12" : model.includes("luma") ? "9" : "10";
            allowed.push(secondOption);
        }

        if (model.includes("kling")) {
            allowed.push("15");
        }
    }

    // Si la durée active n'est pas prévue par ton select, on applique la première option valide
    if (!allowed.includes(d)) {
        setDuration(allowed[0]);
    }
},

[selectedModel]); // Réinitialise uniquement au changement de moteur pour laisser choisir 480p, 720p ou 1080p
// 🔄 Réinitialise la résolution à 480p si on passe sur Seedance 2 et qu'elle n'est pas adaptée
useEffect(() => {
  if (!selectedModel) return;
  const modelLower = selectedModel.toLowerCase();
  const normalizedModel = modelLower.replace(/[^a-z0-9]/g, "");

  // Le nom affiché « seedance 2.5 » contient un espace : utiliser l'identifiant normalisé
  // pour éviter de le confondre avec Seedance 1.5/2.0 et de lui imposer 480p.
  if (normalizedModel.includes("seedance25")) {
    if (!["720p", "1080p", "Full HD", "480p"].includes(resolution)) {
      setResolution("720p");
    }
  } else if (modelLower.includes("seedance")) {
    if (resolution !== "480p" && resolution !== "sd") {
      setResolution("480p");
    }
  } else if (modelLower.includes("hailuo")) {
    // Si Hailuo n'a pas une résolution valide (ex: 480p ou 1080p non supporté par défaut), on met 768p ou 512p
    if (resolution !== "768p" && resolution !== "512p" && resolution !== "1080p") {
      setResolution("768p");
    }
} else if (modelLower.includes("pixverse")) {
    // ✅ Autorise 360p, 540p, 720p et 1080p pour Pixverse, sinon met 720p par défaut
    if (!["360p", "540p", "720p", "1080p"].includes(resolution)) {
        setResolution("720p");
    }

} else if (modelLower.includes("minimax_h3")) {

    if (
        resolution !== "768p" &&
        resolution !== "1440p" &&
        resolution !== "2K"
    ) {
        setResolution("768p");
    }
}
}, [selectedModel]);

const handleEditHistoryItem = (item) => {
  if (!item) return;

  console.log("✏️ Ouverture de l'éditeur pour :", item);

  const mediaUrl = item.url || item.videoUrl || null;

  if (!mediaUrl) {
    console.error("❌ Aucune vidéo disponible pour l'édition.");
    return;
  }

  setActiveItem(item);
  setMode(item.type || "VIDEO");

  const modelForItem = String(item.model || item.engine || "");
  if (modelForItem) setSelectedModel(modelForItem);
  const isVeoItem = /veo/i.test(modelForItem);

  setVeoEditVideo(mediaUrl);
  setVideoSource(isVeoItem ? mediaUrl : null);
  setVeoVideoOperation(isVeoItem ? "edit" : null);
  if (!isVeoItem) {
    setVeoReferenceImages([]);
    setVeoReferenceSlot(null);
    veoReferenceSlotRef.current = null;
    setShowReferencePanel(false);
  }

  setPrompt(
    item.prompt && item.prompt.startsWith("Fichier local :")
      ? ""
      : (item.prompt || "")
  );

  setShowEditor(true);
};

const handleRemix = (item) => {
  if (!item) return;

const itemModel = String(
  item.model || item.engine || ""
).toLowerCase();

const isVeoVideo =
  item.type === "VIDEO" &&
  itemModel.includes("veo3.1");

  setMode(item.type);

  // 1. Prompt et Uploads
  setPrompt(item.prompt && item.prompt.startsWith("Fichier local :") ? "" : (item.prompt || ""));
  setActiveItem(item);
  setUploadedImage(item.url || item.videoUrl || null);
    
  // 2. Synchronisation des paramètres (Modèle, Style, AspectRatio)
  if (item.model) setSelectedModel(item.model);
  if (item.aspectRatio) setAspectRatio(item.aspectRatio);
  if (item.style) setSelectedStyle(item.style);
  
  // 3. Gestion spécifique au type
if (item.type === "VIDEO") {
    setResolution(item.resolution || "720p");

    setStartImage(item.startImage || null);
    setEndImage(item.endImage || null);
    setWantsAudio(item.wantsAudio || false);

    // 🎬 VE0 3.1 : préparer la vidéo pour le mode EDIT / REMIX
    if (isVeoVideo) {
        setVeoVideoOperation("edit");
        setUploadedImage(null);
        setVideoSource(item.url || item.videoUrl || null);
    }
  } else {
    // SI C'EST UNE IMAGE
    setStartImage(null); 
    setEndImage(null);
    setResolution("1080p"); 
    setWantsAudio(false);
    setDuration("4"); // Correction ici aussi pour l'image par défaut
  }

  // 4. Feedback et UI
  setStatusMsg(item.type === "VIDEO" ? t("line3_app_status_videoLoaded") : t("line3_app_status_imageLoaded"));
  
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setTimeout(() => setStatusMsg(""), 3000);
};

const handleNewGeneration = () => {
  setActiveItem(null); 
  setUploadedImage(null);
  setStartImage(null);
  setEndImage(null);
  setPrompt("");
  setChatMessages([]); // Permet de vider l'historique de chat en même temps
  setMode("TEXTE"); 
  
  if (typeof setStatusMsg === "function") {
    setStatusMsg("Nouveau projet lancé !");
    setTimeout(() => setStatusMsg(""), 2000);
  }
};

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };
const getDaysRemaining = (targetDate) => {
  if (!targetDate) return null;

  try {
    let end;

    // 1. VERIFICATION : Est-ce un Timestamp Firebase ? (possède une propriété .seconds)
    if (targetDate && typeof targetDate === 'object' && targetDate.seconds) {
      end = new Date(targetDate.seconds * 1000); // Conversion en Date JS
    } else {
      // 2. Sinon, on traite comme une String ISO (ton ancien format)
      end = new Date(targetDate);
    }

    const now = new Date();
    
    // Sécurité si la date est invalide
    if (isNaN(end.getTime())) return null;

    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Aujourd'hui";
    return `${days} jour${days > 1 ? 's' : ''}`;
  } catch (e) {
    console.error("Erreur calcul jours:", e);
    return null;
  }
};
  if (view === 'success') {
  return <Success onBack={() => { 
    setView('studio'); 
    setShowStudio(true); 
    window.history.pushState({}, '', '/'); // Nettoie l'URL
  }} />;
}

if (showPricing) {
    // On passe le userPlan pour que Pricing sache s'il doit diviser les prix par 2
    return <Pricing onBack={() => setShowPricing(false)} userPlan={userPlan} />;

  }
// 1. Conditions d'Utilisation
  // 2. Politique de Confidentialité
  if (showPrivacy) {
    return (
      <>
        <PrivacyPage
          onBack={() => setShowPrivacy(false)}
          onContactClick={() => setShowContactModal(true)}
        />

        {showContactModal && (
          <ContactModal
            user={user}
            onClose={() => setShowContactModal(false)}
          />
        )}
      </>
    );
  }


// 2. Politique de Confidentialité
if (showPrivacy) {
  return (
    <>
      <PrivacyPolicyPage 
        onBack={() => setShowPrivacy(false)} 
        onContactClick={() => {
          console.log("Bouton cliqué (Privacy) !");
          setShowContactModal(true);
        }} 
      />

      {showContactModal && (
        <ContactModal 
          user={user} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </>
  );
}

// 3. Conditions Générales de Vente (CGV)
if (showCgv) {
  return (
    <>
      <CgvPage 
        onBack={() => setShowCgv(false)} 
        onContactClick={() => {
          console.log("Bouton cliqué (CGV) !");
          setShowContactModal(true);
        }} 
      />

      {showContactModal && (
        <ContactModal 
          user={user} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </>
  );
}

  // 4. Mentions légales
  if (showLegal) {
    return (
      <>
        <LegalNoticePage
          onBack={() => setShowLegal(false)}
          onShowPrivacy={() => {
            setShowLegal(false);
            setShowPrivacy(true);
          }}
          onContactClick={() => {
            setShowContactModal(true);
          }}
        />

        {showContactModal && (
          <ContactModal
            user={user}
            onClose={() => setShowContactModal(false)}
          />
        )}
      </>
    );
  }

  // 3. Politique de confidentialité traduite
  if (showPrivacy) {
    return (
      <>
        <PrivacyPage
          onBack={() => setShowPrivacy(false)}
          onContactClick={() => setShowContactModal(true)}
        />

        {showContactModal && (
          <ContactModal
            user={user}
            onClose={() => setShowContactModal(false)}
          />
        )}
      </>
    );
  }

if (isAuthLoading || isInitializing) {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#000',
      color: '#fff',
      zIndex: 9999 
    }}>
      {/* Ton logo ou un petit spinner ici */}
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #9333ea', // Violet
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p style={{ letterSpacing: '1px', fontSize: '14px', opacity: 0.8 }}>
        {t("app.security.sync", {
  defaultValue: "SYNCHRONISATION SÉCURISÉE..."
})}
      </p>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
 // --- 4. LE RENDU FINAL (UN SEUL ET UNIQUE) ---
 
 return (
  <div className="app-container" style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden' // INTERDIT le scroll global qui fait tout sauter
  }}> 

          {/* NAVBAR (Toujours en haut) */}
<Navbar 
  logoEclipse={logoEclipse}
  user={user}
  tokens={tokens}
  onOpenProfile={() => setShowProfile(true)} // Garde cette ligne, supprime l'autre
  packTokens={
    user?.packExpiryDate && new Date() > (user.packExpiryDate.seconds ? new Date(user.packExpiryDate.seconds * 1000) : new Date(user.packExpiryDate))
    ? 0 
    : packTokens
  }
  userPlan={userPlan || "debutant"} 
  userPrice={userPlan ? (PLAN_TO_PRICE[userPlan.toLowerCase()] || "0.00") : "0.00"} 
  resetDate={getDaysRemaining(user?.tokensResetDate) || "Sous 30 jours"} 
  expiryDate={
    user?.packExpiryDate 
      ? (user.packExpiryDate.seconds 
          ? new Date(user.packExpiryDate.seconds * 1000) 
          : new Date(user.packExpiryDate) 
        ).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(':', 'h')
      : "12 mois"
  }

  logoEclair={logoEclair}
  onBackToHome={() => {
    setShowStudio(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  onShowHistory={() => {
    setView('history');
    setShowStudio(true); 
  }}
  onStart={(m) => { 
    if (m) setMode(m); 
    setView('studio'); 
    user ? setShowStudio(true) : setShowLogin(true); 
  }}
  onLogout={handleLogout}
  onShowPricing={() => setShowPricing(true)}
  showDropdown={showDropdown} 
  setShowDropdown={setShowDropdown}
/>

<Outils
  ref={outilsRef}
  user={user}
  db={db}
  activeItem={activeItem}
  onMediaImported={(media) => {
    console.log('📥 Média importé depuis Outils :', media);
    setActiveItem(media);
  }}
  onMediaApplied={(historyItem) => {
    console.log('🎨 Média appliqué depuis Outils :', historyItem);
    setActiveItem(historyItem);
  }}
  onHistoryUpdate={(historyItem) => {
    console.log('🗂️ Historique mis à jour depuis Outils :', historyItem);
  }}
/>

{statusMsg && (
      <div className="notification-toast" style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#a855f7',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '30px',
        zIndex: 10000,
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        fontWeight: '600',
        pointerEvents: 'none'
      }}>
        {statusMsg}
        
      </div>
)}

<div className="main-viewport" 
  style={{ 
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    // ✅ CHANGEMENT ICI : On utilise 'auto' pour que le scroll apparaisse dès que le contenu dépasse
    // On enlève la condition !showStudio qui verrouillait le scroll
    overflowY: 'auto', 
    position: 'relative',
    height: '100%', 
    scrollbarWidth: 'none', 
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
  }}
>
        <style>{`.main-viewport::-webkit-scrollbar { display: none !important; }`}</style>

        {!showStudio ? (
          <div className="app-landing-wrapper" style={{ width: '100%' }}>
            <LandingPage
              user={user} 
              tokens={tokens}   
              packTokens={packTokens}
              onPurchase={handlePurchase}
              logoEclair={logoEclair} 
              onShowTerms={() => setShowTerms(true)}
              onShowCgv={() => setShowCgv(true)}
              onShowLegal={() => setShowLegal(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
              onShowPricing={() => setShowPricing(true)}
              onLogout={handleLogout} 
              onStart={(modeOption) => {
                if (modeOption && typeof modeOption === 'string') setMode(modeOption);
                user ? setShowStudio(true) : setShowLogin(true);
              }} 
            />
          </div>) : (
          /* --- B. TON MOTEUR COMPLET (STUDIO) --- */
          <>
          {/* CONDITION 1 : Si le mode est REMASTERISE, on affiche UNIQUEMENT l'espace développeur */}
          {mode === "REMASTERISE" ? (
            <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
              <DevelopersPage />
            </div>
          ) : view === 'history' ? (
            /* CONDITION 2 : Si on est dans l'historique */
            <MyHistoryPage 
              history={history} 
              onBack={() => setView('studio')} 
              onRemix={(item) => {
                handleRemix(item);
                setView('studio'); 
              }}
              onEdit={(item) => {
                handleEditHistoryItem(item);
                setView('studio');
              }}
              onDownload={(item) => handleDownload(item)}
              onDelete={(id) => setItemToDelete(id)} 
            />
          ) : (
              /* SINON, ON AFFICHE TON CODE SANS RIEN CHANGER DEDANS */
              <div className="app-layout" style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
                <aside className="sidebar" style={{ 
                  height: '100%', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '15px' 
                }}>                  
                  {/* ... Ton code de sidebar continue ici ... */}
    
<button className="new-chat-btn" onClick={handleNewGeneration}>
  {t("app.newDiscussion", { defaultValue: "Nouvelle discussion" })}
</button>

    {uploadedImage && (
      <div className="control-group" style={{ 
        marginTop: '20px', 
        padding: '12px', 
        background: 'rgba(168, 85, 247, 0.08)', 
        borderRadius: '15px',
        border: '1px solid rgba(168, 85, 247, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
<label className="field-label-tiny" style={{ color: '#a855f7', fontWeight: 'bold' }}>
  {t("app.remix.fidelity", { defaultValue: "FIDÉLITÉ AU REMIX" })}</label>
  <span style={{ color: '#fff', fontSize: '12px' }}>{Math.round(remixStrength * 100)}%</span>
        </div>
        
        <input 
          type="range" 
          min="0.1" 
          max="0.9" 
          step="0.05" 
          value={remixStrength} 
          onChange={(e) => setRemixStrength(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
      <span>{t("app.remix.creative", { defaultValue: "Créatif" })}</span>
<span>{t("app.remix.strict", { defaultValue: "Strict" })}</span>
        </div>
      </div>
    )}

    <div className="history-section" style={{ marginTop: '20px' }}>
<p className="field-label-tiny">
  {t("app.history.title", {
    defaultValue: "HISTORIQUE"
  })} ({history.length})
</p>      <div className="history-list">

{/* --- HISTORIQUE OPTIMISÉ : --- */}

{history.map(item => {
  // 1. Récupération de l'URL brute du média
  let mediaUrl = item.url || item.videoUrl || item.imageUrl || (item.video && item.video.url);          
  const isVideo = item.type === "VIDEO" || (mediaUrl && (mediaUrl.includes(".mp4") || mediaUrl.includes(".mp4")));

  return (
    <div 
      key={item.id} 
      className={`history-card ${activeItem?.id === item.id ? 'active' : ''}`} 
      onClick={() => {
        setActiveItem(item);
        if (isVideo && mediaUrl) {
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: activeItem?.id === item.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        border: activeItem?.id === item.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0px',
        marginBottom: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Zone d'affichage du Média (Format Paysage Large) */}
      <div style={{ position: 'relative', width: '100%', height: '110px', background: '#0a0a0c', overflow: 'hidden' }}>
        
        {!isVideo ? (
          /* 📸 RENDU IMAGE */
          <img 
            src={mediaUrl} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          /* 🎬 RENDU VIDÉO : Forçage à la 4ème seconde pour éviter le noir */
 <video 
  src={mediaUrl} 
  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
  muted 
  playsInline 
  preload="auto"
  crossOrigin="anonymous"
  autoPlay
  controls={false}

  onLoadedMetadata={(e) => {
    const video = e.target;
    video.currentTime = 4.0;
  }}

  onCanPlay={(e) => {
    const video = e.target;
    if (video.currentTime < 3.9) {
      video.currentTime = 4.0;
    }
  }}

  onTimeUpdate={(e) => {
    const video = e.target;
    if (video.currentTime >= 4.1) {
      video.pause();
    }
  }}

  onError={(e) => {
    e.target.style.opacity = '0';
    const parent = e.target.parentElement;
    if (parent) {
      parent.style.background = 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)';
    }
  }}
/>
        )}

        {/* Badge Icône type de média */}
        <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', color: '#fff', zIndex: 2 }}>
          {isVideo ? "🎬" : "📸"}
        </span>

        {/* Bouton de suppression */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            setItemToDelete(item.id);
          }}
          style={{ 
            position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', border: 'none', 
            color: '#ef4444', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', zIndex: 3 
          }}
        >
          ✕
        </button>
      </div>

      {/* Infos Bas de Carte */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
         {item.prompt || item.description || item.text || t("app.history.noDescription")}
        </p>

{activeItem?.id === item.id && (

  <div
    style={{
      display: 'flex',
      gap: '6px',
      width: '100%'
    }}
  >
    {/* 🪄 REMIXER — recharge le prompt dans le Studio */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        handleRemix(item);
        setView('studio');
      }}
      style={{ 
        flex: 1,
        background: '#a855f7',
        color: '#fff',
        border: 'none',
        borderRadius: '6px', 
        padding: '6px 0',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}
    >
      🪄 Remixer
    </button>

    {/* ✏️ MODIFIER — ouvre directement la modal Filtre */}
    {item.type === "VIDEO" && (item.url || item.videoUrl) && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEditHistoryItem(item);
        }}
        style={{
          flex: 1,
          background: '#333',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '6px',
          padding: '6px 0',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        ✏️ Modifier
      </button>
    )}
  </div>
)}
      </div>
    </div>
  );
})}
        {/* --- FIN DE LA BOUCLE --- */}
      </div>
    </div>
  </aside>

<main className="main-content" style={{ 
  flex: 1, 
  height: '100%', 
  overflowY: 'auto', // Permet le scroll UNIQUEMENT ici si le formulaire est trop long
  padding: '20px',
  scrollbarWidth: 'none', // Pour Firefox
  msOverflowStyle: 'none' // Pour IE/Edge
    
}}>
<div className="generator-grid">
                 
{/* PANNEAU DE CONTROLE */}
<div className="control-panel glass-card">
<div className="mode-toggle">
{["IMAGE", "VIDEO", "REMASTERISE"].map(m => {
  const modeLabel = {
    IMAGE: t("control_mode_image"),
    VIDEO: t("control_mode_video"),
    REMASTERISE: t("control_mode_remasterise")
  }[m];  if (m === "REMASTERISE") {
    return (
    <button
        key={m}
        disabled // 🚫 Bloque le bouton au niveau HTML
        className="tab-btn" // On retire la classe "active" dynamique le temps du dev
        onClick={(e) => {
          e.preventDefault(); // 🔥 Bloque complètement le clic
        }}
        style={{ 
          cursor: 'not-allowed', // 🚫 Curseur de blocageS
          color: mode === "REMASTERISE" ? '#fff' : '#94a3b8',
          border: mode === "REMASTERISE" ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
<span style={{ fontSize: "12px" }}></span>
{modeLabel}     </button>
    );
  }

  // SINON : On laisse les boutons normaux pour IMAGE et VIDEO
  return (
    <button 
      key={m} 
      className={mode === m ? "active" : ""} 
      onClick={() => {
        setMode(m); // Le useEffect s'occupe de mettre "Flux Pro" ou "Hailuo AI"
        setChatMessages([]);
        setActiveItem(null);
        setStartImage(null);
        setEndImage(null);
      }}
    >
      {modeLabel}
    </button>
  );
})}
</div>

<label className="field-label">
  {mode === "TEXTE"
    ? t("app.prompt.aiDiscussion", {
        defaultValue: "Discussion IA"
      })
    : t("app.prompt.creative", {
        defaultValue: "PROMPT CRÉATIF"
      })}
</label>

<textarea
  value={prompt}
  maxLength={getPromptLimit(mode, (engines.find(e => e.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource))}
  onChange={(e) => {
    selectedSuggestionPromptRef.current = null;
    setPrompt(e.target.value.slice(0, getPromptLimit(mode, (engines.find(model => model.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource))));
  }}
  placeholder={
    mode === "TEXTE"
      ? t("app.prompt.askQuestion", {
          defaultValue: "Posez votre question..."
        })
      : mode === "VIDEO" && (engines.find(e => e.name === selectedModel)?.id || "").toLowerCase() === "seedance25" && videoSource
        ? seedance25Operation === "extend"
          ? t("line1_app_prompt_seedanceExtendSource")
          : t("line1_app_prompt_seedanceEditSource")
      : mode === "VIDEO" && ["veo3.1", "veo3.1_fast"].includes((engines.find(e => e.name === selectedModel)?.id || "").toLowerCase()) && videoSource && veoVideoOperation === "extend"
        ? t("line1_app_prompt_veoExtendSource")
      : mode === "VIDEO" && ["veo3.1", "veo3.1_fast"].includes((engines.find(e => e.name === selectedModel)?.id || "").toLowerCase()) && videoSource && veoVideoOperation === "edit"
        ? t("line1_app_prompt_veoEditSource")
      : mode === "VIDEO" && (engines.find(e => e.name === selectedModel)?.id || "").toLowerCase().includes("minimax_h3") && videoSource
        ? minimaxH3VideoOperation === "extend" ? t("line1_app_prompt_minimaxExtendSource") : t("line1_app_prompt_minimaxEditSource")
      : mode === "VIDEO" && (engines.find(e => e.name === selectedModel)?.id || "").toLowerCase() === "pixverse6" && videoSource
        ? t("line1_app_prompt_pixverseSourceChanges")
        : t("app.prompt.describeIdea", {
            defaultValue: t("app.video.describeIdea")
          })
  }
  style={{
    height: mode === "TEXTE" ? "150px" : "200px",
    transition: "height 0.3s ease"
  }}
/>
<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5, marginBottom: 8, color: prompt.length >= getPromptLimit(mode, (engines.find(e => e.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource)) ? "#fca5a5" : "#8b8b98", fontSize: 11 }}>
  {prompt.length.toLocaleString("fr-FR")} / {getPromptLimit(mode, (engines.find(e => e.name === selectedModel)?.id || selectedModel || "").toLowerCase(), Boolean(startImage || endImage), Boolean(videoSource)).toLocaleString("fr-FR")} {t("line4_prompt_characters", { defaultValue: "caractères" })}
</div>

{mode === "VIDEO" && (() => {
  const selectedId = String(engines.find(e => e.name === selectedModel)?.id || selectedModel || "").toLowerCase();
  const isVeoOperationModel = ["veo3.1", "veo3.1_fast"].includes(selectedId);
  const isSeedance25OperationModel = selectedId === "seedance25";
  const isH3OperationModel = selectedId.includes("minimax_h3");
  const isPixverseEditModel = selectedId === "pixverse6";
  if (!(isVeoOperationModel || isSeedance25OperationModel || isH3OperationModel || isPixverseEditModel)) return null;
  const buttonStyle = (active) => ({ flex: 1, minWidth: 0, padding: "9px 8px", borderRadius: 9, border: active ? "1px solid #8b5cf6" : "1px solid rgba(255,255,255,.13)", background: active ? "rgba(139,92,246,.22)" : "rgba(255,255,255,.04)", color: "#f4f4f5", cursor: "pointer", fontSize: 11, fontWeight: 700 });
  const activeOperation = isVeoOperationModel ? veoVideoOperation : isSeedance25OperationModel ? seedance25Operation : isPixverseEditModel ? "edit" : minimaxH3VideoOperation;
  return <div style={{ margin: "8px 0 12px", padding: 11, borderRadius: 11, border: "1px solid rgba(168,85,247,.24)", background: "rgba(139,92,246,.055)" }}>
    <div style={{ color: "#ddd", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>🎬 {t("app.video.existingOperations")}</div>
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {!isPixverseEditModel && <button type="button" style={buttonStyle(activeOperation === "extend")} onClick={() => {
        if (isVeoOperationModel) setVeoVideoOperation("extend");
        else if (isSeedance25OperationModel) setSeedance25Operation("extend");
        else setMinimaxH3VideoOperation("extend");
      }}>⏩ {t("app.video.extend")}</button>}
      <button type="button" style={buttonStyle(activeOperation === "edit")} onClick={() => {
        if (isVeoOperationModel) setVeoVideoOperation("edit");
        else if (isSeedance25OperationModel) setSeedance25Operation("edit");
        else if (isH3OperationModel) setMinimaxH3VideoOperation("edit");
        else setPrompt(prev => {
          const text = prev.trim();
          if (!text) return "In Video 1, change only [describe the desired modification]. Preserve the same subject, identity, actions, camera movement and duration. Do not change anything else.";
          if (/^(edit the source video|in video 1|transform the source video)/i.test(text)) return text;
          return `In Video 1, ${text}. Preserve all elements not explicitly changed, including identity, actions, framing and camera movement.`;
        });
      }}>🛠️ {t("app.video.edit")}</button>
    </div>
    <div style={{ color: "#b7b7c4", fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>
      {videoSource ? (activeOperation === "extend" ? t("app.video.extendDescription") : t("app.video.editDescription")) : t("app.video.importSourceFirst")}
    </div>
  </div>;
})()}

{mode === "VIDEO" && (videoSource || (activeItem?.type === "VIDEO" && (activeItem?.url || activeItem?.videoUrl))) && (
  <div style={{ display: "flex", gap: 8, margin: "4px 0 12px" }}>
    <button type="button" onClick={() => {
      setVeoEditVideo(videoSource || activeItem?.url || activeItem?.videoUrl);
      setSelectedOptionModal(null);
      setShowEditor(true);
    }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(96,165,250,.4)", background: "rgba(59,130,246,.13)", color: "#eff6ff", cursor: "pointer", fontWeight: 750, fontSize: 12 }}>
      🎨 {t("app.video.changeAppearance")}
    </button>
  </div>
)}

{mode === "VIDEO" && ["veo3.1", "veo3.1_fast"].includes((engines.find(e => e.name === selectedModel)?.id || "").toLowerCase()) && veoVideoOperation && !videoSource && (
  <div style={{ color: "#fbbf24", fontSize: 11, margin: "0 0 10px" }}>{t("app.video.addSourceForVeo", { operation: veoVideoOperation === "extend" ? t("app.video.extend") : t("app.video.edit") })}</div>
)}

{mode === "VIDEO" && ["veo3.1", "veo3.1_fast"].includes((engines.find(e => e.name === selectedModel)?.id || "").toLowerCase()) && videoSource && veoVideoOperation && (
  <div style={{ marginTop: 9, marginBottom: 12, padding: "12px 13px", borderRadius: 10, background: "rgba(59,130,246,.08)", border: "1px solid rgba(96,165,250,.25)", color: "#dbeafe", fontSize: 12, lineHeight: 1.55 }}>
    <div style={{ fontWeight: 750, marginBottom: 5 }}>
      {veoVideoOperation === "extend" ? `🎬 ${t("app.video.extendGuideTitle")} ${(engines.find(e => e.name === selectedModel)?.id || "") === "veo3.1_fast" ? "Veo 3.1 Fast" : "Veo 3.1"}` : `🛠️ ${t("app.video.editGuideTitle")} ${(engines.find(e => e.name === selectedModel)?.id || "") === "veo3.1_fast" ? "Veo 3.1 Fast" : "Veo 3.1"}`}
    </div>
    {veoVideoOperation === "extend" ? (
      <>
        <div>{t("app.video.extendDescription")} </div>
        <div style={{ marginTop: 7, color: "#bfdbfe" }}><strong>{t("tutorialUi.promptExample")}</strong> {t("line5_prompt_veo_extend")}</div>
        <button type="button" onClick={() => setPrompt(t("line5_prompt_veo_extend"))} style={{ marginTop: 9, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(96,165,250,.4)", background: "rgba(59,130,246,.18)", color: "#eff6ff", fontWeight: 650, cursor: "pointer" }}>{t("app.video.useExtendExample")}</button>
      </>
    ) : (
      <>
        <div>{t("app.video.editDescription")}</div>
        <div style={{ marginTop: 7, color: "#bfdbfe" }}><strong>{t("tutorialUi.promptExample")}</strong> {t("line5_prompt_veo_edit")}</div>
        <button type="button" onClick={() => setPrompt(t("line5_prompt_veo_edit"))} style={{ marginTop: 9, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(96,165,250,.4)", background: "rgba(59,130,246,.18)", color: "#eff6ff", fontWeight: 650, cursor: "pointer" }}>{t("app.video.useEditExample")}</button>
      </>
    )}
  </div>
)}

{mode === "VIDEO" && (engines.find(e => e.name === selectedModel)?.id || "").toLowerCase() === "seedance25" && (
  <div style={{ marginTop: 9, marginBottom: 12, padding: "12px 13px", borderRadius: 10, background: "rgba(59,130,246,.08)", border: "1px solid rgba(96,165,250,.25)", color: "#dbeafe", fontSize: 12, lineHeight: 1.55 }}>
    <div style={{ fontWeight: 750, marginBottom: 5 }}>
      {videoSource ? (seedance25Operation === "extend" ? `🎬 ${t("app.video.extendGuideTitle")}` : `🛠️ ${t("app.video.editGuideTitle")}`) : `🎬 ${t("app.video.extendOrEditGuideTitle")}`}
    </div>
    {!videoSource && <div style={{ marginBottom: 7, color: "#bfdbfe" }}>{t("app.video.addSourceSeedance")}</div>}
    {seedance25Operation === "extend" ? (
      <>
        <div>{t("app.video.extendSeedanceHelp")}</div>
        <div style={{ marginTop: 7, color: "#bfdbfe" }}><strong>{t("tutorialUi.promptExample")}</strong> {t("line5_prompt_seedance_extend")}</div>
        <button type="button" onClick={() => setPrompt(t("line5_prompt_seedance_extend"))} style={{ marginTop: 9, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(96,165,250,.4)", background: "rgba(59,130,246,.18)", color: "#eff6ff", fontWeight: 650, cursor: "pointer" }}>{t("app.video.useExtendExample")}</button>
      </>
    ) : (
      <>
        <div>{t("app.video.editSeedanceHelp")}</div>
        <div style={{ marginTop: 7, color: "#bfdbfe" }}><strong>{t("tutorialUi.promptExample")}</strong> {t("line5_prompt_seedance_edit")}</div>
        <button type="button" onClick={() => setPrompt(t("line5_prompt_seedance_edit"))} style={{ marginTop: 9, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(96,165,250,.4)", background: "rgba(59,130,246,.18)", color: "#eff6ff", fontWeight: 650, cursor: "pointer" }}>{t("app.video.useEditExample")}</button>
      </>
    )}
  </div>
)}

<div
  className="action-bar"
  style={{
    display: 'flex',
    gap: '10px',
    marginBottom: '-5px'
  }}
>

  {/* Le bouton Optimiser reste visible en IMAGE et VIDEO */}
  {mode !== "TEXTE" && (
    <button
      className="ai-treat-btn"
      onClick={handleOptimize}
      disabled={isThinking || !prompt}
      style={{ flex: 1 }}
    >
      {isThinking
        ? t("app.optimize.analyzing", {
            defaultValue: "⏳ Analyse..."
          })
        : t("app.optimize.button", {
            defaultValue: "✨ Optimiser"
          })}
    </button>
  )}

  {/* ✅ On affiche "Charger" seulement si on est en mode IMAGE */}
  {mode === "IMAGE" && (
    <>
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={(e) => handleFileToUrl(e, setStartImage)}
        accept="image/*"
      />

      {!startImage ? (
        <button
          className="ai-treat-btn"
       onClick={() => outilsRef.current?.openImport()}
          style={{
            flex: 1,
            background: '#444'
          }}
        >
          {t("app.upload.load", {
            defaultValue: "📁 Charger"
          })}
        </button>
      ) : (
        <div
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '8px',
            border: '1px solid #a855f7',
            background: `url(${startImage}) center/cover no-repeat`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '5px'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStartImage(null);
            }}
            style={{
              background: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )}
</div>


{/* --- MESSAGE D'ASTUCE SEEDANCE 2.5 --- */}
{selectedModel?.toLowerCase().replace(/[^a-z0-9]/g, "").includes("seedance25") && (
  <div style={{
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>🚀</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
<strong>
  {t("app.tip.seedance25.title", {
    defaultValue: "Astuce Seedance 2.5 :"
  })}
</strong>{" "}
{t("app.tip.seedance25.text", {
  defaultValue:
    "Profitez de durées entièrement libres de 4 à 30 secondes avec gestion audio intégrée et options d'images de référence."
})}
    </span>
  </div>
)}

{/* --- MESSAGE D'ASTUCE Seedance 2.0 / 1.5  --- */}
{selectedModel?.toLowerCase().replace(/[^a-z0-9]/g, "").includes("seedance") && !selectedModel?.toLowerCase().replace(/[^a-z0-9]/g, "").includes("seedance25") && (
  <div style={{
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>🚀</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
<strong>
  {t("app.tip.seedance.title", {
    defaultValue: "Astuce Seedance :"
  })}
</strong>{" "}
{t("app.tip.seedance.text", {
  defaultValue:
    "Utilisez vos slots pour combiner images et vidéos de référence afin de guider précisément la mise en scène et le style."
})}
    </span>
  </div>
)}
{/* --- MESSAGE D'ASTUCE kling 2.6 capture ENTRE LES MOTEURS ET LES SLOTS --- */}

{selectedModel?.toLowerCase().includes("kling") && (
  <div style={{
    background: "rgba(236, 72, 153, 0.1)",
    border: "1px solid rgba(236, 72, 153, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>💃</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
<strong>
  {t("app.tip.kling.title", {
    defaultValue: "Astuce Kling Motion Control :"
  })}
</strong>{" "}
{t("app.tip.kling.text", {
  defaultValue:
    "Combinez une Image de personnage et une Vidéo source pour transférer les mouvements et la chorégraphie de la vidéo sur votre personnage."
})}
    </span>
  </div>
)}
{/* --- MESSAGE D'ASTUCE luma ENTRE LES MOTEURS ET LES SLOTS --- */}

{selectedModel?.toLowerCase().includes("luma") && (
  <div style={{
    background: "rgba(234, 179, 8, 0.1)",
    border: "1px solid rgba(234, 179, 8, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>🎬</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
<strong>
  {t("app.tip.luma.title", {
    defaultValue: "Astuce Luma Ray 2 :"
  })}
</strong>{" "}
{t("app.tip.luma.text", {
  defaultValue:
    "Ajoutez une Vidéo source pour transformer ou modifier le style et l'ambiance de votre vidéo existante via le prompt."
})}
    </span>
  </div>
)}


{/* --- MESSAGE D'ASTUCE PIXVERSE ENTRE LES MOTEURS ET LES SLOTS --- */}
{selectedModel?.toLowerCase().includes("pixverse") && (
  <div style={{
    background: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>✨</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
<strong>
  {t("app.tip.pixverse.title", {
    defaultValue: "Astuce PixVerse V6 :"
  })}
</strong>{" "}
{t("app.tip.pixverse.text", {
  defaultValue:
    "Ajoutez une Vidéo source uniquement pour étendre la durée de votre vidéo existante."
})}
   </span>
  </div>
)}

{/* --- ICI annotations moteurs et (Image début, Vidéo source, Image fin) --- */}

<div className="simple-controls">
  {/* LIGNE 1 : MOTEUR ET RÉSOLUTION */}
  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
    
    {/* 🚀 MOTEUR PERSONNALISÉ (SANS LA FLÈCHE AJOUTÉE) */}
    <div style={{ flex: 1.2, position: 'relative' }}>
<label className="field-label-tiny">
  {t("app.formatStyle", { defaultValue: "FORMAT & STYLE" })}
</label>

      {/* BOUTON PRINCIPAL (utilise ta classe CSS d'origine avec sa propre flèche native) */}
      <div 
        className="artlist-select" 
        onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(() => {
            const currentEng = engines.find(e => e.name === selectedModel);
            const currentUserPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
            const costIcon = parseFloat(currentUserPrice) >= parseFloat(currentEng?.minPriceForLightning || 0) ? "⚡" : "💎";
            return `${currentEng?.icon || "✨"} ${selectedModel} ${costIcon}`;
          })()}
        </span>
      </div>

      {/* MENU DÉROULANT ÉLARGI */}
      {isEngineMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: '380px',
          backgroundColor: '#13111c',
          border: '1px solid #2d2640',
          borderRadius: '10px',
          marginTop: '4px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          padding: '6px'
        }}>
          {engines
            .filter(e => e.type === mode)
            .map(e => {
              const currentUserPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
              const userHasAccessToLightning = parseFloat(currentUserPrice) >= parseFloat(e.minPriceForLightning);
              const costIcon = userHasAccessToLightning ? "⚡" : "💎";

              return (
                <div 
                  key={e.id}
                  onClick={() => {
                    setSelectedModel(e.name);
                    setIsEngineMenuOpen(false);
                  }}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    backgroundColor: selectedModel === e.name ? '#251b37' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(el) => el.currentTarget.style.backgroundColor = '#1d152a'}
                  onMouseLeave={(el) => el.currentTarget.style.backgroundColor = selectedModel === e.name ? '#251b37' : 'transparent'}
                >
                  {/* LIGNE 1 : Icône, Nom, Coût et Badges principaux */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {e.icon} {e.name} {costIcon}
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {e.isNew && (
                        <span style={{ fontSize: '9px', backgroundColor: '#059669', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {t("app.badge.new", { defaultValue: "Nouveau" })}
                        </span>
                      )}
                      {e.isTopArena && (
                        <span style={{ fontSize: '9px', backgroundColor: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {t("app.badge.topArena", { defaultValue: "Top 5 de l'Arena" })}      
                          </span>
                      )}
                    </div>
                  </div>

                  {/* LIGNE 2 : ANNOTATION */}
                  {e.annotation && (
                    <span style={{ 
                      fontSize: '12px', 
                      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#c4b5fd', 
                      letterSpacing: '0.2px',
                      lineHeight: '1.4',
                      fontWeight: '400'
                    }}>
                      {e.annotation}
                    </span>
                  )}

                  {/* LIGNE 3 : PETITS BADGES DE FONCTIONNALITÉS */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '3px' }}>
                    {e.canDualImage && (
                      <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {t("app.badge.startEnd", { defaultValue: " Début / Fin" })}
                      </span>
                    )}
                    

{/* BADGES VEO 3.1 */}
{e.name.toLowerCase().includes("veo 3.1") && (
  <>
    {/* 🔊 Audio */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {t("line3_app_ui_audio", { defaultValue: "Audio" })}
    </span>

    {/* 🖼️ Images de référence */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {t("line3_app_ui_referenceImagesUpTo3")}
    </span>

    {/* ✨ Résolution */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      720p / 1080p
    </span>

    {/* ⏱️ Durée */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      4s / 6s / 8s
    </span>

    {/* 🎬 Image début / fin */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {t("line3_app_ui_startEndFrames")}
    </span>

    {/* ✏️ Modifier la vidéo */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {t("line3_app_ui_editVideo")}
    </span>

    {/* 🪄 Remixer */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {t("line3_app_ui_remix", { defaultValue: "Remixer" })}
    </span>

    {/* ➡️ Étendre */}
    <span style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '3px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {t("line3_app_ui_extendVideo")}
    </span>
  </>
)}

{/* BADGES KLING 2.6 PRO */}
{(() => {
  const klingId = e.id?.toLowerCase() || "";
  const klingName = e.name?.toLowerCase() || "";

  const isKlingMotionVariant =
    klingId.includes("kling26_motion") ||
    klingId.includes("kling2.6_motion") ||
    klingName.includes("motion control");

  const isKling26 = !isKlingMotionVariant && (
    klingId.includes("kling2.6") ||
    klingId.includes("kling26") ||
    klingName.includes("kling 2.6")
  );

  if (!isKling26) return null;

  return (
    <>
      {/* 🔊 Audio natif */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_nativeAudio", { defaultValue: "Audio natif" })}
      </span>

      {/* 🖼️ Image → Vidéo */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_imageToVideo")}
      </span>

      {/* ✨ Full HD */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        1080p
      </span>

      {/* ⏱️ Durée */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        5s / 10s
      </span>
    </>
  );
})()}

{/* BADGES KLING 3.0 */}
{(() => {
  const klingId = e.id?.toLowerCase() || "";
  const klingName = e.name?.toLowerCase() || "";

  const isKling30 =
    klingId === "kling30" ||
    klingId === "kling3" ||
    klingName.includes("kling 3.0");

  if (!isKling30) return null;

  return (
    <>
      {/* 🔊 Audio natif */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_nativeAudio", { defaultValue: "Audio natif" })}
      </span>

      {/* 🖼️ Image → Vidéo */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_imageToVideo")}
      </span>

      {/* ✨ Résolution */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        720p / 1080p
      </span>

      {/* ⏱️ Durée */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        3s → 15s
      </span>
    </>
  );
})()}

{/* BADGES KLING MOTION CONTROL 2.6 */}
{(() => {
  const klingId = e.id?.toLowerCase() || "";
  const klingName = e.name?.toLowerCase() || "";

  const isKlingMotion26 =
    klingId.includes("kling26_motion") ||
    klingId.includes("kling2.6_motion") ||
    (klingName.includes("kling 2.6") && klingName.includes("motion"));

  if (!isKlingMotion26) return null;

  return (
    <>
      {/* 🎥 Vidéo de référence */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_videoReference")}
      </span>

      {/* 🖼️ Image personnage */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_characterImage", { defaultValue: "Image personnage" })}
      </span>

      {/* 🕺 Contrôle du mouvement */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_motionControl")}
      </span>

      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        1080p
      </span>

      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        5s / 10s
      </span>
    </>
  );
})()}

{/* BADGES HAILUO 2.3 */}
{(() => {
  const hailuoId = e.id?.toLowerCase() || "";
  const hailuoName = e.name?.toLowerCase() || "";

  const isHailuo23 =
    hailuoId.includes("hailuo") ||
    hailuoName.includes("hailuo 2.3") ||
    hailuoName.includes("hailuo");

  if (!isHailuo23) return null;

  return (
    <>
      {/* 🖼️ Image → Vidéo */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_imageToVideo")}
      </span>

      {/* 🎬 Text → Vidéo */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_textToVideo")}
      </span>

      {/* HD */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        768p / 1080p
      </span>

      {/* ⏱️ Durée */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        6s
      </span>

      {/* ⏱️ 10 secondes — 768p uniquement */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_10s768pOnly", { defaultValue: "10s - 768p uniquement" })}
      </span>
    </>
  );
})()}

{/* BADGES MINIMAX H3 */}
{(() => {
  const h3Id = e.id?.toLowerCase() || "";
  const h3Name = e.name?.toLowerCase() || "";

  const isMinimaxH3 =
    h3Id.includes("minimax-h3") ||
    h3Id.includes("minimax_h3") ||
    h3Id === "minimax_h3" ||
    h3Name.includes("minimax h3");

  if (!isMinimaxH3) return null;

  return (
    <>
      {/* 🎬 Text → Vidéo */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_textToVideo")}
      </span>

      {/* 🖼️ Image → Vidéo */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_imageToVideo")}
      </span>

      {/* 🎞️ Première + dernière image */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_firstLastFrame", { defaultValue: "First + Last Frame" })}
      </span>

      {/* 🖼️ Images de référence */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_referenceImageCount")}
      </span>

      {/* 🎥 Vidéo de référence */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_referenceVideoCount")}
      </span>

      {/* 🔊 Audio de référence */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_referenceAudioCount")}
      </span>

      {/* 🔊 Audio génératif */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {t("line3_app_ui_generativeAudio")}
      </span>

      {/* 🖥️ Résolution */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        768p / 1440p (2K)
      </span>

      {/* ⏱️ Durée */}
      <span style={{
        fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#e5e7eb', padding: '2px 7px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', gap: '3px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        4–15s
      </span>
    </>
  );
})()}


{/* BADGES COMPLÉMENTAIRES — moteurs dont les fonctionnalités n'étaient pas toutes affichées */}
{(() => {
  const id = String(e.id || "").toLowerCase();
  const badges = [];
  const add = (...items) => badges.push(...items);

  // Moteurs image
  if (e.type === "IMAGE" && id === "gpt_image2") {
    add(t("line4_badge_text_to_image", { defaultValue: "Texte → Image" }), t("line4_badge_image_to_image", { defaultValue: "Image → Image" }), t("line4_badge_up_to_16_refs", { defaultValue: "Jusqu'à 16 références" }), t("line4_badge_adjustable_quality", { defaultValue: "Qualité réglable" }), t("line4_badge_adjustable_moderation", { defaultValue: "Modération réglable" }));
  } else if (e.type === "IMAGE" && id === "flux2pro") {
    add(t("line4_badge_text_to_image", { defaultValue: "Texte → Image" }), t("line4_badge_image_to_image", { defaultValue: "Image → Image" }), t("line4_badge_up_to_9_refs", { defaultValue: "Jusqu'à 9 références" }), t("line4_badge_safety_tolerance", { defaultValue: "Tolérance de sécurité 0–5" }));
  } else if (e.type === "IMAGE" && id === "nano_banana2_lite") {
    add(t("line4_badge_text_to_image", { defaultValue: "Texte → Image" }), t("line4_badge_image_to_image", { defaultValue: "Image → Image" }), t("line4_badge_up_to_14_images", { defaultValue: "Jusqu'à 14 images" }), t("line4_badge_one_reference_video", { defaultValue: "1 vidéo de référence" }), t("line4_badge_adjustable_reasoning", { defaultValue: "Réflexion réglable" }));
  }

  // Seedance 2.5 : génération, références multimodales et opérations sur vidéo source.
  if (id === "seedance25") {
    add(t("line4_badge_text_to_video", { defaultValue: "Texte → Vidéo" }), t("line4_badge_image_to_video", { defaultValue: "Image → Vidéo" }), t("line4_badge_reference_images", { defaultValue: "Images de référence" }), t("line4_badge_reference_video", { defaultValue: "Vidéo de référence" }), t("line4_badge_reference_audio", { defaultValue: "Audio de référence" }), t("line4_badge_edit_video", { defaultValue: "Modifier la vidéo" }), t("line4_badge_extend_video", { defaultValue: "Étendre la vidéo" }), "480p / 720p / 1080p", t("line4_badge_4_30_seconds", { defaultValue: "4–30s" }));
  } else if (id === "seedance20") {
    add(t("line4_badge_text_to_video", { defaultValue: "Texte → Vidéo" }), t("line4_badge_image_to_video", { defaultValue: "Image → Vidéo" }), t("line4_badge_up_to_9_images", { defaultValue: "Jusqu'à 9 images" }), t("line4_badge_up_to_3_videos", { defaultValue: "Jusqu'à 3 vidéos" }), t("line4_badge_up_to_3_audio", { defaultValue: "Jusqu'à 3 audios" }), "480p / 720p / 1080p", t("line4_badge_4_15_seconds", { defaultValue: "4–15s" }));
  } else if (id === "seedance") {
    add(t("line4_badge_text_to_video", { defaultValue: "Texte → Vidéo" }), t("line4_badge_image_to_video", { defaultValue: "Image → Vidéo" }), t("line4_badge_start_end_images", { defaultValue: "Image début / fin" }), t("line4_badge_native_audio_lipsync", { defaultValue: "Audio natif & lip-sync" }), "480p / 720p / 1080p", t("line4_badge_4_12_seconds", { defaultValue: "4–12s" }));
  }

  // PixVerse V6 : capacités déclarées dans la configuration de l'interface.
  if (id === "pixverse6") {
    add(t("line4_badge_text_to_video", { defaultValue: "Texte → Vidéo" }), t("line4_badge_image_to_video", { defaultValue: "Image → Vidéo" }), t("line4_badge_audio", { defaultValue: "Audio" }), t("line4_badge_multishot", { defaultValue: "Multi-shot" }), "360p / 540p / 720p / 1080p", t("line4_badge_1_15_seconds", { defaultValue: "1–15s" }));
  }

  if (!badges.length) return null;
  return badges.map((label, index) => (
    <span key={`feature-badge-${id}-${index}`} style={{
      fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#e5e7eb',
      padding: '2px 7px', borderRadius: '6px', display: 'flex', alignItems: 'center',
      gap: '3px', border: '1px solid rgba(255,255,255,0.08)'
    }}>{label}</span>
  ));
})()}

                  </div>
                </div>
              );
            })}
        </div>
      )}
      {mode === "VIDEO" && (
        <button
          type="button"
          onClick={() => { setVideoTutorialTab("guide"); setTutorialCopyState(""); setShowVideoTutorial(true); }}
          style={{
            marginTop: "7px", width: "190%", padding: "8px 10px", borderRadius: "8px", 
            border: "1px solid rgba(168,85,247,0.45)", background: "rgba(168,85,247,0.10)",
            color: "#ddd6fe", fontSize: "12px", fontWeight: 700, cursor: "pointer", textAlign: "left"
          }}
        >
          🎓 {t("line4_tutorial_model_title", { model: selectedModel, defaultValue: `Tutoriel de ${selectedModel} — guide, vidéo et prompts` })}
        </button>
      )}
    </div>
    
{mode !== "TEXTE" && (

  <div style={{ flex: 1 }}>
<label className="field-label-tiny">
  {t("app.resolution", { defaultValue: "RÉSOLUTION" })}
</label>

    {(() => {

      // 🛡️ Définition de isKling26 ici
const currentModelLower = (selectedModel || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const isKling26 = (currentModelLower.includes("kling26") || currentModelLower.includes("26pro")) 
                  && !currentModelLower.includes("motion");    
    const isLuma = selectedModel?.toLowerCase().includes("luma");
      const isHailuo = selectedModel?.toLowerCase().includes("hailuo");
      const isPixverse = selectedModel?.toLowerCase().includes("pixverse");
      const isSeedance2 = selectedModel?.toLowerCase().includes("seedance 2");

      const isHailuo512Invalid = isHailuo && resolution === "512p" && !startImage;

      return (
        <div>
          <select 
            className="artlist-select" 
            value={resolution} 
            onChange={(e) => {
              const selectedRes = e.target.value;
              setResolution(selectedRes);
              if (isHailuo && selectedRes === "512p" && !startImage) {
                setErrorMsg(
  t("app.error.hailuo512Image", {
    defaultValue: "La résolution 512p pour Hailuo nécessite une IMAGE DÉBUT."
  })
);
              }
            }}
          >
            {(() => {
              const currentUserPrice = parseFloat(PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00");
              const currentEngine = engines.find(e => e.name === selectedModel);
              const engineReq = parseFloat(currentEngine?.minPriceForLightning || "0.00");

              const hasLightningPlan = currentUserPrice > 0 && currentUserPrice >= engineReq;
              const p480Icon = hasLightningPlan ? "⚡" : "💎";
              const p512Icon = hasLightningPlan ? "⚡" : "💎";
              const p360Icon = hasLightningPlan ? "⚡" : "💎";
               const p540Icon = hasLightningPlan ? "⚡" : "💎";
              const p768Icon = hasLightningPlan ? "⚡" : "💎";
              const hdIcon = hasLightningPlan ? "⚡" : "💎";
              const fhdIcon = (hasLightningPlan && currentUserPrice >= 12.99) ? "⚡" : "💎";
              const currentModelId = selectedModel?.toLowerCase() || "";
              const normalizedModelId = currentModelId.replace(/[^a-z0-9]/g, "");
              const isSeedance25 = normalizedModelId.includes("seedance25");
              const isAnySeedance = normalizedModelId.includes("seedance") && !isSeedance25;
              return (
                <>{mode === "VIDEO" && (
                <>
                  {/* Options 512p et 768p pour Hailuo */}
{isHailuo && (
    <>
        <option value="768p"> 768P {p512Icon} </option>
    </>
)}


{/* Options SD / SD+ réservées à PixVerse */}
{isPixverse && (
    <>
        <option value="540p">540P {p540Icon}</option>
        <option value="360p">360P {p360Icon || p540Icon}</option>
    </>
)}              
                      {/* ✅ Uniquement pour Seedance 2.0 et Seedance 1.5 Pro (Exclut Seedance 2.5) */}
                      {isAnySeedance && !isSeedance25 && (
                        <option value="480p"> 480P {p480Icon} </option>
                      )}

                      {/* Seedance 2.5 : SD, HD et Full HD pris en charge par l'API Runware */}
                      {isSeedance25 && (
                        <>
                          <option value="480p"> SD (480p) {p480Icon} </option>
                          <option value="720p"> HD (720p) {hdIcon} </option>
                          <option value="1080p"> FULL HD (1080p) {fhdIcon} </option>
                        </>
                      )}

                     {!isHailuo && !isKling26 && !isSeedance25 && !currentModelId.includes("motion") && (
                        <option value="720p"> HD {hdIcon} </option>
                      )}
                    </>
                  )}
                  
                  {/* FULL HD pour les autres moteurs ; Seedance 2.5 possède ses propres options SD/HD/Full HD ci-dessus. */}
{/* RÉSOLUTION MINIMAX H3 */}
{normalizedModelId.includes("minimaxh3") && (
  <>
    <option value="768p"> 768P {p768Icon} </option>
    <option value="1440p"> 1440P (2K) {fhdIcon} </option>
  </>
)}

{/* FULL HD POUR LES AUTRES MODÈLES */}
{!normalizedModelId.includes("minimaxh3") && !isSeedance25 && (
  <option value="1080p"> FULL HD {fhdIcon} </option>
)}                </>
              );
            })()}
          </select>

          {/* ⚠️ MESSAGE D'AVERTISSEMENT ROUGE */}
          {isHailuo512Invalid && (
            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px', fontWeight: 'bold' }}>
              ⚠️ 512p nécessite une image de début.
            </div>
          )}
        </div>
      );
    })()}
  </div>
)}
  </div>
{/* LIGNE 2 : INPUTS MÉDIAS - IMAGE & VIDÉO TO VIDEO (Conditionnel) */}
{mode === "VIDEO" && (() => {
  // Recalcul local pour éviter les erreurs de référence "undefined"
  const currentEngine = engines.find(e => e.name === selectedModel || e.id === selectedModel?.toLowerCase());
  const engineId = currentEngine?.id?.toLowerCase() || "";
  const userPlanPrice = PLAN_TO_PRICE[userPlan] || "0.00";
  const packs = ["0.00", "12.99", "24.99", "34.99", "39.99", "59.99", "159.99"];

  // Détection des compatibilités du moteur sélectionné
const isVeo = engineId.includes("veo");

// 1. Nettoyage de l'identifiant pour la recherche (minuscules sans espaces ni tirets)
const cleanId = (engineId + " " + (selectedModel || "")).toLowerCase().replace(/[-_ ]/g, "");

// 2. Détection ciblée et élargie (capture klingv3, kling3, v3pro, v3standard, etc.)
const isKling26 = cleanId.includes("kling26") || cleanId.includes("26pro");
const isKlingV3I2V = cleanId.includes("klingv3") || cleanId.includes("kling3") || cleanId.includes("v3pro") || cleanId.includes("v3standard");

// Distinction précise entre Seedance 1.5 (qui prend les 2 images et bloque le V2V) et Seedance 2.0
const isSeedance15 = cleanId.includes("seedance") && (cleanId.includes("15") || cleanId.includes("v15") || cleanId.includes("pro"));
const isSeedance25 = cleanId.includes("seedance25") || cleanId.includes("seedance-2.5");
const isSeedance2 = cleanId.includes("seedance") && cleanId.includes("2") && !isSeedance25;

const isDualAllowed = (currentEngine?.canDualImage || engineId.includes("lite") || isSeedance15 || isSeedance25) && !isVeo;

const isMotion = cleanId.includes("motion") || cleanId.includes("motioncontrol");
// L'image de début est bloquée si sur Luma/Pixverse ou si Seedance 2
const hasSeedanceReferences = (isSeedance2 || isSeedance25) && (seedanceReferenceImages.length > 0 || seedanceReferenceVideos.length > 0 || seedanceReferenceAudios.length > 0);
const hasH3References = engineId.includes("minimax_h3") && (h3ReferenceImages.length > 0 || h3ReferenceVideos.length > 0 || h3ReferenceAudios.length > 0);
const isStartBlocked = (Boolean(videoSource) && (cleanId.includes("luma") || cleanId.includes("pixverse") || engineId.includes("minimax_h3") || isSeedance2 || isSeedance25)) || hasSeedanceReferences || hasH3References;

// 3. Condition d'autorisation V2V (Seedance 2 et 2.5 retrouvent leur comportement vidéo)
const isVideoToVideoAllowed = 
engineId.includes("veo3.1") ||
engineId.includes("minimax_h3") ||
  isMotion || 
  isSeedance2 || 
  isSeedance25 ||
  ((engineId.includes("kling") || 
    engineId.includes("pixverse") || 
    engineId.includes("luma")) 
   && !isKling26 
   && !isKlingV3I2V 
   && !engineId.includes("lite")
   && !isSeedance15);
      
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
      <div style={{ width: "100%", color: "#888", fontSize: 10, marginBottom: 1 }}>{t("app.upload.fileLimits")}</div>

{/* 1. SLOT IMAGE DÉBUT */}
<div 
  className="img-upload-slot"   
  onClick={() => !isStartBlocked && document.getElementById('start-img-input').click()}
  style={{
    flex: 1, 
    height: '80px', 
    borderRadius: '10px', 
    border: isStartBlocked ? '1px dashed rgba(255,255,255,0.05)' : '1px dashed rgba(255,255,255,0.2)',
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    cursor: isStartBlocked ? 'not-allowed' : 'pointer', 
    background: 'rgba(255,255,255,0.03)',
    position: 'relative',
    overflow: 'hidden', 
    transition: 'all 0.2s',
    opacity: isStartBlocked ? 0.35 : 1,
    filter: isStartBlocked ? 'grayscale(1)' : 'none'
  }}
>
<input 
  type="file" 
  id="start-img-input" 
  hidden 
  onChange={(e) => {
    handleFileToUrl(e, (url) => {
      setStartImage(url);

      // Pour Veo 3.1 :
      // l'image de début devient automatiquement
      // la première image de référence.
 if (isVeo) {
  console.log("🎯 VEO DÉTECTÉ", {
    selectedModel,
    currentEngine,
    engineId,
    isVeo,
    url
  });

  // Conserver le panneau de trois images de référence dans le moteur Veo.
  // Les emplacements sont retirés uniquement de la fenêtre universelle Filtre/Éclairage IA.
  setShowReferencePanel(true);
} else {
  console.log("❌ VEO NON DÉTECTÉ", {
    selectedModel,
    currentEngine,
    engineId,
    isVeo
  });
}
    });
  }}
  accept="image/*" 
  disabled={isStartBlocked}
/>

  {!startImage ? (
    <>
      <span style={{fontSize: '1rem'}}>{isStartBlocked ? "🔒" : "🖼️"}</span>
      <span style={{fontSize: '0.62rem', fontWeight: 'bold', color: isStartBlocked ? '#888' : '#fff', marginTop: '2px'}}>
        {isStartBlocked
  ? t("app.slot.startBlocked", { defaultValue: "DÉBUT BLOQUÉ" })
  : t("app.slot.startImage", { defaultValue: "IMAGE DÉBUT" })}
      </span>
    </>
  ) : (
    <>
      {/* Aperçu propre de l'image de début */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `url("${startImagePreview || startImage}") center/cover no-repeat`,
        zIndex: 1
      }} />

      {/* Croix rouge pour supprimer l'image de début */}
      <div 
    onClick={(e) => { 
  e.stopPropagation(); 
  setStartImage(null); 
  setStartImagePreview(null); 

  if (isVeo) {
    setVeoReferenceImages(prev => prev.slice(1));
  }
}}
        style={{
          position: 'absolute', 
          top: '6px', 
          right: '6px', 
          background: 'rgba(255,0,0,0.8)', 
          width: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '10px', 
          color: 'white', 
          zIndex: 2,
          cursor: 'pointer'
        }}
      >
        ✕
      </div>
    </>
  )}


</div>{/* 2. SLOT VIDÉO SOURCE (VIDEO TO VIDEO - Verrouillé si image active sur PixVerse ou Luma) */}
      {(() => {
        const modelLower = selectedModel?.toLowerCase() || "";
        const selectedEngineId = (engines.find(e => e.name === selectedModel)?.id || "").toLowerCase();
        const isPixverseOrLuma = modelLower.includes("pixverse") || modelLower.includes("luma");
        const hasSeedance25References = selectedEngineId === "seedance25" && (seedanceReferenceImages.length > 0 || seedanceReferenceVideos.length > 0 || seedanceReferenceAudios.length > 0);
        const isVideoLockedByImage = (isPixverseOrLuma && Boolean(startImage || endImage)) || hasSeedance25References;
        const canUseVideo = isVideoToVideoAllowed && !isVideoLockedByImage;

        // Fonction pour récupérer le coût Luma
        const getLumaCost = () => {
          const res = resolution === "1080p" ? "fhd" : "hd"; 
          const dur = duration === 9 || duration === 10 ? "9" : "5";
          const lumaPrices = { hd5: 20, fhd5: 40, hd9: 36, fhd9: 75 };
          return lumaPrices[`${res}${dur}`] || 40; 
        };

        const currentLumaCost = getLumaCost();

        return (
          <div 
            className="img-upload-slot" 
            onClick={() => canUseVideo && document.getElementById('video-source-input').click()}
            style={{
              flex: 1, height: '80px', borderRadius: '10px', 
              border: videoSource ? '1px solid #a855f7' : '1px dashed rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: canUseVideo ? 'pointer' : 'not-allowed', 
              backgroundColor: 'rgba(255,255,255,0.02)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
              opacity: canUseVideo ? 1 : 0.35,
              filter: canUseVideo ? 'none' : 'grayscale(1)'
            }}
          >
            <input 
              type="file" 
              id="video-source-input" 
              hidden 
              onChange={(e) => { handleFileToUrl(e, setVideoSource); e.target.value = ""; }} 
              accept="video/*" 
              disabled={!canUseVideo}
            />
       {!videoSource ? (
  <>
    <span style={{ fontSize: '1rem' }}>{canUseVideo ? "🎬" : "🔒"}</span>
    <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: '#888', textAlign: 'center', marginTop: '2px' }}>
{isVideoLockedByImage
  ? t("app.slot.videoBlocked", { defaultValue: "VIDÉO BLOQUÉE" })
  : (
      isVideoToVideoAllowed
        ? t("app.slot.videoSource", { defaultValue: "VIDÉO SOURCE" })
        : t("app.slot.v2vUnavailable", { defaultValue: "V2V INDISPO." })
    )}
      {/* AFFICHAGE DU COÛT UNIQUEMENT POUR LUMA (État vide) */}
      {canUseVideo && !isVideoLockedByImage && isVideoToVideoAllowed && modelLower.includes("luma") && (
        <div style={{ color: '#ffd700', fontSize: '0.55rem', marginTop: '1px', fontWeight: 'bold' }}>
          +{currentLumaCost} ⚡
        </div>
      )}
    </span>              
  </>
) : (
  <>
    {/* Miniature vidéo locale */}
    <video 
      key={videoSource} 
      src={videoSource || ""}
      onLoadedMetadata={(e) => setVideoSourceDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      controls 
      autoPlay 
      muted 
      playsInline 
    />

    {/* Bouton de suppression */}
    <div 
      onClick={(e) => { e.stopPropagation(); setVideoSource(null); setVideoSourceDuration(0); setVeoVideoOperation(null);}} 
      
      style={{
        position:'absolute', top:'5px', right:'5px', background:'rgba(255,0,0,0.6)', 
        width:'18px', height:'18px', borderRadius:'50%', display:'flex', 
        alignItems:'center', justifyContent:'center', fontSize:'9px', color:'white', zIndex: 2, cursor: 'pointer'
      }}
    >✕</div>

    {/* BADGE DE COÛT INTÉGRÉ (Vidéo chargée) */}
    {modelLower.includes("luma") && (
      <div style={{
        position: 'absolute', bottom: '5px', left: '5px', background: '#ffd700', 
        color: '#000', padding: '2px 5px', borderRadius: '4px', fontSize: '0.5rem', fontWeight: 'bold', zIndex: 2
      }}>
        +{currentLumaCost} {typeof mustForce !== 'undefined' && mustForce ? "💎" : "⚡"}
      </div>
    )}
  </>
)}
        </div>
    );
  })()}

  {/* 3. SLOT IMAGE DE FIN (Propre, sans erreur de syntaxe) */}
  {(() => {
const isModelSeedance2 = cleanId.includes("seedance2"); // Attrape seedance 2.0 et seedance 2.5
    const isKling26Model = cleanId.includes("kling26") || cleanId.includes("26pro");
    const isEndBlocked = !isDualAllowed || isKling26Model || (!!videoSource && !isMotion) || hasSeedanceReferences || hasH3References;

    return (
      <div 
        className="img-upload-slot" 
        onClick={() => !isEndBlocked && document.getElementById('end-img-input').click()}
        style={{
          flex: 1, height: '80px', borderRadius: '10px', 
          border: endImage ? '1px solid #ffd700' : '1px dashed rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: !isEndBlocked ? 'pointer' : 'not-allowed', 
          backgroundImage: endImage ? `url("${endImage}")` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: 'rgba(255,255,255,0.02)',
          position: 'relative', transition: 'all 0.2s',
          opacity: !isEndBlocked ? 1 : 0.35,
          filter: !isEndBlocked ? 'none' : 'grayscale(1)'
        }}
      >
        <input 
          type="file" 
          id="end-img-input" 
          hidden 
          onChange={(e) => handleFileToUrl(e, setEndImage)} 
          accept="image/*" 
          disabled={isEndBlocked}
        />
        
        {!endImage ? (
          <>
            <span style={{fontSize: '1rem'}}>{!isEndBlocked ? "🏁" : "🔒"}</span>
            <span style={{fontSize: '0.62rem', fontWeight: 'bold', color: '#888', textAlign: 'center', marginTop: '2px'}}>
              {isKling26Model
  ? t("app.slot.endBlocked", { defaultValue: "FIN BLOQUÉE" })
  : (
      !isDualAllowed
        ? t("app.slot.endUnavailable", { defaultValue: "FIN INDISPO." })
        : t("app.slot.endImage", { defaultValue: "IMAGE FIN" })
    )}
            </span>
          </>
        ) : (
          <div 
            onClick={(e) => { e.stopPropagation(); setEndImage(null); }} 
            style={{
              position:'absolute', top:'5px', right:'5px', background:'rgba(255,0,0,0.6)', 
              width:'18px', height:'18px', borderRadius:'50%', display:'flex', 
              alignItems:'center', justifyContent:'center', fontSize:'9px', color: 'white', zIndex: 2
            }}
          >✕</div>
        )}
      </div>
    );
  })()}
</div>
  );
})()}
{mode !== "TEXTE" && (
  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
  {mode === "VIDEO" && (
  <div style={{ flex: 1 }}>
    <label className="field-label-tiny" style={{ display: 'block', marginBottom: '4px' }}>  {t("app.duration", { defaultValue: "DURÉE" })}
</label>

    {(() => {
      // Détermination dynamique des limites et du pas selon le modèle (selectedModel)
      const model = selectedModel?.toLowerCase() || "";
      let minSec = 4;
      let maxSec = 10;
      let stepVal = 1; // Par défaut de 1 en 1

      if (model.includes("veo")) {
        minSec = 4;
        maxSec = 8;
        stepVal = 2; // Paliers de 2 en 2 (4s, 6s, 8s)
      } else if (model.includes("seedance 2.5")) {
        minSec = 4;
        maxSec = 30;
        stepVal = 1;
      } else if (model.includes("seedance 2.0")) {
        minSec = 4;
        maxSec = 15;
        stepVal = 1;
      } else if (model.includes("seedance")) {
        minSec = 4;
        maxSec = 12;
        stepVal = 1;
      } else if (model.includes("hailuo")) {
        const isHd = resolution === "Full HD" || resolution === "1080p";
        minSec = 6;
        maxSec = isHd ? 6 : 10;
        stepVal = 4;
      } else if (model.includes("minimax")) {
        minSec = 4;
        maxSec = 15;
        stepVal = 1;
  } else if (model.includes("kling") && (model.includes("3.0") || model.includes("3"))) {
        // ✅ Pour Kling 3.0 / v3
        minSec = 3;
        maxSec = 15;
        stepVal = 1; // Remets 5 si tu ne veux que des blocs de 5 en 5
      } else if (model.includes("kling")) {
        // ✅ Pour Kling 2.5 et les autres versions de Kling par défaut
        minSec = 5;
        maxSec = 10;
        stepVal = 5; 
          } else if (model.includes("pixverse")) {
        // ✅ Pour Kling 2.5 et les autres versions de Kling par défaut
        minSec = 1;
        maxSec = 15;
        stepVal = 1; 
      }

      const isDisabled = Boolean(model.includes("hailuo") && (resolution === "Full HD" || resolution === "1080p"));

      return (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '10px', 
          padding: '0 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '42px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="range"
              min={minSec}
              max={maxSec}
              step={stepVal}
              value={duration}
              disabled={isDisabled}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                accentColor: '#a855f7',
                height: '4px',
                borderRadius: '2px',
                opacity: isDisabled ? 0.5 : 1
              }}
            />
            <span style={{ 
              color: '#d8b4fe', 
              fontSize: '12px', 
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              minWidth: '32px',
              textAlign: 'right'
            }}>
              {duration}s
            </span>
          </div>
        </div>
      );
    })()}
        
    {/* Rappel visuel dynamique pour Hailuo */}
    {selectedModel === "Hailuo AI" && (
      <div style={{ fontSize: '9px', color: '#a855f7', marginTop: '4px', fontWeight: 'bold' }}>
        {resolution === "Full HD" || resolution === "1080p" 
          ? t("line1_app_video_hailuoProLimit") 
          : t("line1_app_video_hailuoStandardLimit")}
      </div>
    )}
  </div>
)}

    {/* BLOC FORMAT & STYLE (Reste identique) */}
    <div style={{ flex: 1 }}>
      <label className="field-label-tiny">{t("app.formatStyle")}</label>
      <div style={{ display: 'flex', gap: '5px' }}>
        <select className="artlist-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
<option value="16:9">▭ 16:9</option>
      <option value="1:1">◻ 1:1</option>
      <option value="9:16">▯ 9:16</option>
        </select>
        <select className="artlist-select" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </div>)}{
  
  /* ✅ SELECTEUR AUDIO IA AVEC MESSAGE EXTÉRIEUR */}
{mode === "VIDEO" && (() => {
  const currentEngine = engines.find(e => e.name === selectedModel || e.id === selectedModel?.toLowerCase());
  const engineId = currentEngine?.id?.toLowerCase() || "";
  const isHailuo = engineId.includes("hailuo");
  const isSeedanceAudioToggleModel = engineId.includes("seedance20") || engineId.includes("seedance25");

  // MiniMax H3 produit toujours son audio natif ; Seedance 2.0/2.5 permet de l'activer ou non.
  const hasNativeAudio = engineId.includes("minimax") || engineId.includes("h3");
  const isAudioDisabled = isHailuo || (hasNativeAudio && !isSeedanceAudioToggleModel);
  const isAudioActive = isSeedanceAudioToggleModel ? seedanceAudioEnabled : (hasNativeAudio ? true : (isHailuo ? false : wantsAudio));

  return (
    <div style={{ marginBottom: '15px' }}>
      <div 
        className="audio-toggle-container" 
        style={{
          padding: '12px 16px',
          background: isAudioDisabled 
            ? 'rgba(255, 255, 255, 0.02)' 
            : (isAudioActive ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)'),
          borderRadius: '12px',
          border: '1px solid',
          borderColor: isAudioDisabled 
            ? 'rgba(255, 255, 255, 0.05)' 
            : (isAudioActive ? '#a855f7' : 'rgba(255,255,255,0.1)'),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          // Si c'est MiniMax, on met 'default' ou 'not-allowed' pour indiquer que c'est géré automatiquement
          cursor: isAudioDisabled || hasNativeAudio ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          userSelect: 'none',
          opacity: isAudioDisabled ? 0.4 : 1 
        }} 
        onClick={() => {
          if (isAudioDisabled) return;
          if (isSeedanceAudioToggleModel) setSeedanceAudioEnabled(!seedanceAudioEnabled);
          else if (!hasNativeAudio) setWantsAudio(!wantsAudio);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            fontSize: '1.2rem', 
            filter: isAudioDisabled ? 'grayscale(100%)' : 'none' 
          }}>
            {isAudioActive ? '🔊' : '🔇'}
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              color: isAudioDisabled ? '#666' : '#fff', 
              fontWeight: '600', 
              fontSize: '0.85rem' 
            }}>
{t("app.audio.ai", { defaultValue: "Audio par IA" })}
            </div>
            <div style={{ color: (hasNativeAudio || isSeedanceAudioToggleModel) ? '#a855f7' : '#666', fontSize: '0.7rem' }}>
              {(hasNativeAudio || isSeedanceAudioToggleModel)
                ? (isSeedanceAudioToggleModel ? (seedanceAudioEnabled ? t("line1_app_audio_nativeEnabled") : t("line1_app_audio_nativeDisabled")) : t("app.audio.native", { defaultValue: "Inclus nativement" }))
                : t("app.audio.soundDesign", { defaultValue: "Sound design" })}
            </div>
          </div>
        </div>
        
        {/* Switch Visuel */}
        <div style={{
          width: '36px',
          height: '18px',
          background: isAudioDisabled ? '#222' : (isAudioActive ? '#a855f7' : '#444'),
          borderRadius: '20px',
          position: 'relative'
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            background: isAudioDisabled ? '#444' : '#fff',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: isAudioActive ? '20px' : '2px',
            transition: '0.3s'
          }} />
        </div>
      </div>

      {/* ✅ MESSAGE EXTÉRIEUR : Audio inclus */}
      {hasNativeAudio && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          marginTop: '6px', 
          marginLeft: '4px' 
        }}>
          <span style={{ fontSize: '10px' }}>✨</span>
          <span style={{ 
            color: '#a855f7', 
            fontSize: '10px', 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            {t("app.audio.included", {
  defaultValue: "AUDIO INCLUS AVEC CE MOTEUR"
})}
          </span>
        </div>
      )}

      {/* ⚠️ MESSAGE EXTÉRIEUR : Hailuo pas d'audio */}
      {isHailuo && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          marginTop: '6px', 
          marginLeft: '4px' 
        }}>
          <span style={{ fontSize: '10px' }}>⚠️</span>
          <span style={{ 
            color: '#eab308', 
            fontSize: '10px', 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            {t("app.audio.unavailable", {
  defaultValue: "AUDIO NON DISPONIBLE POUR CE MOTEUR"
})}
          </span>
        </div>
      )}
    </div>
  );
})()}

{/* --- AFFICHAGE DU COÛT DYNAMIQUE --- */}
{(() => {
    const current = engines.find(e => e.name === selectedModel || e.id === selectedModel?.toLowerCase());
    if (!current || mode === "TEXTE") return null;
    
    const userPlanPrice = PLAN_TO_PRICE[userPlan] || "0.00";
    const packs = ["0.00", "12.99", "24.99", "34.99",  "59.99", "159.99"];
    const userTierIndex = packs.indexOf(userPlanPrice);
    const masterTierIndex = packs.indexOf("34.99");

    // On utilise DIRECTEMENT "forceDiamonds" calculé par ton useEffect
    // pour savoir s'il faut afficher l'icône 💎 ou ⚡
    const showAsDiamonds = forceDiamonds;

    // Indicateur visuel pour le +1 diamant (uniquement si plan < Master)
    const needsExtraDiamond = mode === "VIDEO" && endImage && current.canDualImage && userTierIndex < masterTierIndex;

    const accentColor = showAsDiamonds ? '#3498db' : '#ff9f43';

    return (
        <div style={{ 
            padding: '12px', borderRadius: '12px', background: `${accentColor}1A`, 
            border: `1px solid ${accentColor}66`, textAlign: 'center', marginBottom: '15px',
            color: accentColor, fontSize: '14px', fontWeight: 'bold', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{showAsDiamonds ? "💎" : "⚡"}</span> 
                {/* On affiche la variable 'cost' du useEffect : elle contient déjà le 200 ou le prix Éclair */}
                {t("app.cost.total", { defaultValue: "COÛT TOTAL" })} : {cost}{" "}
{showAsDiamonds
  ? t("app.cost.diamonds", { defaultValue: "DIAMANTS" })
  : t("app.cost.tokens", { defaultValue: "ÉCLAIRS" })}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {showAsDiamonds && (resolution === "Full HD" || resolution === "1080p") && (
                    <span style={{fontSize: '10px', opacity: 0.8, fontWeight: 'normal'}}>
                        ({t("line1_cost_full_hd_diamonds")})
                    </span>
                )}
                {needsExtraDiamond && (
                    <span style={{fontSize: '10px', opacity: 0.8, fontWeight: 'normal'}}>
                        (+1 💎 {t("line1_cost_end_image")})
                    </span>
                )}
                {mode === "VIDEO" && wantsAudio && (
                    <span style={{fontSize: '10px', opacity: 0.8, fontWeight: 'normal'}}>
                        ({t("line1_cost_ai_audio")})
                    </span>
                )}
            </div>
        </div>
    );
})()}
{errorMsg && (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#e74c3c',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideIn 0.3s ease-out'
  }}>
    <span style={{ fontSize: '20px' }}>⚠️</span>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{errorMsg}</span>
    <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px' }}>✕</button>
  </div>
)}
{/* BOUTON GÉNÉRER */}
{(() => {

  const isHailuo = selectedModel?.toLowerCase().includes("hailuo");
  const isHailuo512Invalid = isHailuo && resolution === "512p" && !startImage;

  const isSeedance = selectedModel?.toLowerCase().includes("seedance");
  const isSeedance25 = selectedModel?.toLowerCase().replace(/[^a-z0-9]/g, "").includes("seedance25");
  const isSeedance480Invalid = isSeedance && !isSeedance25 && resolution === "480p" && !startImage;
  // Détection du modèle Motion Control
  const isMotionControl = selectedModel?.toLowerCase().includes("motion");



  // On vérifie directement ton vrai useState : videoSource
  const hasVideo = !!videoSource;

  // Le bouton se bloque SI c'est du Motion Control ET qu'il manque l'image OU la vidéo
  const isMotionControlInvalid = isMotionControl && (!startImage || !hasVideo);

  const isButtonDisabled = isLoading || !prompt || isHailuo512Invalid || isMotionControlInvalid;

  return (
    <div style={{ marginTop: 'auto', paddingTop: '5px' }}>
      <button 
        className="magic-btn" 
        onClick={handleGenerate} 
        disabled={isButtonDisabled} 
        style={{ 
          width: '100%', 
          height: '46px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          paddingLeft: '0px',
          paddingRight: '0px',
          gap: '8px',
          opacity: isButtonDisabled ? 0.5 : 1,
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          filter: (isHailuo512Invalid || isMotionControlInvalid) ? 'grayscale(1)' : 'none'
        }}
title={
  isMotionControlInvalid
    ? t("app.error.motionImages", {
        defaultValue: t("line3_app_error_startAndSourceRequired")
      })
    : isHailuo512Invalid
    ? t("app.error.hailuo512Title", {
        defaultValue: t("line3_app_error_startImageFor512")
      })
    : ""
}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
        
       {isLoading ? (
  <>{t("app.generate.inProgress", { defaultValue: "⚡ Génération en cours..." })}</>
) : isMotionControlInvalid ? (
  <>{t("app.generate.imageVideoRequired", { defaultValue: "⚠️ IMAGE + VIDÉO REQUISES" })}</>
) : isHailuo512Invalid ? (
  <>{t("app.generate.imageRequired512", { defaultValue: "🖼️ IMAGE REQUISE POUR 512P" })}</>
) : mode === "TEXTE" ? (
  t("app.generate.send", { defaultValue: "🚀 Envoyer" })
) : (
            <>
              {cost > 0 && (forceDiamonds ? "💎" : "⚡")}
              {t("app.generate.button", { defaultValue: "GÉNÉRER" })}{" "}
{cost > 0 ? `(${cost})` : ""}
            </>
          )}
        </span>
      </button>
    </div>
  );
})()}
</div> {/* Fermeture finale de simple-controls */}
</div>
          
  {/* --- COLONNE DE DROITE (CONTENEUR PARENT) --- */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minWidth: 0 }}>
  
  {/* GRANDE CASE (RENDER ZONE) */}

<div 
  className={`render-zone glass-card ${mode !== "TEXTE" ? "compact-render" : ""}`} 
  style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden', 
    padding: '0', 
    height: '450px',   /* 👈 HAUTEUR FIXE pour verrouiller la carte (ajuste les pixels selon tes besoins) */
    minHeight: '450px' /* 👈 Empêche tout changement de taille */
  }}
>
  
{/* ZONE 1 : AFFICHAGE DU RÉSULTAT */}
  
  <div style={{ 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    justify: 'center', 
    position: 'relative', 
    padding: '15px 20px 5px 20px',
    overflow: 'hidden',
    minHeight: 0 
  }}>
{(() => {

  // 1. SI CHARGEMENT EN COURS : ON AFFICHE LE SPINNER EN PRIORITÉ ABSOLUE
  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <div className="spinner"></div>
<div className="loading-text" style={{ marginTop: '12px', color: '#fff' }}>
  {t("app.loading.generation", { defaultValue: "Génération en cours..." })}
</div>
    </div>
    );
  }

  const displayItem = activeItem || hoverItem;

  // 2. SI RIEN N'EST SÉLECTIONNÉ (ET PAS EN CHARGEMENT) : AFFICHAGE PAR DÉFAUT
  if (!displayItem) {
    const isVideoMode = mode === "VIDEO";
    const defaultSuggestion = isVideoMode ? VIDEO_SUGGESTIONS[0] : SUGGESTIONS[0];
    const defaultMediaSrc = isVideoMode ? defaultSuggestion?.url : defaultSuggestion?.img;

    return (
      <div className="empty-state" style={{
        position: 'relative', width: '100%', height: '100%', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px'
      }}>
        {isVideoMode ? (
          <video 
            key={defaultMediaSrc} 
            src={defaultMediaSrc} 
            autoPlay loop muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', pointerEvents: 'none' }} 
          />
        ) : (
          <img 
            key={defaultMediaSrc}
            src={defaultMediaSrc} 
alt={t("app.defaultImageAlt", {
  defaultValue: "Illustration par défaut"
})}
   style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', pointerEvents: 'none' }} 
          />
        )}
        
        <div style={{
          position: 'absolute', bottom: '20px', background: 'rgba(5, 5, 8, 0.75)', 
          padding: '8px 16px', borderRadius: '20px', backdropFilter: 'blur(4px)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <span style={{ color: 'var(--text-gray)', fontSize: '13px', fontWeight: '500' }}>
{t("app.waitingCreation", {
  defaultValue: "En attente de création..."
})}
    </span>
        </div>
      </div>
    );
  }

  // 3. SI UN MÉDIA EST SÉLECTIONNÉ ET PAS DE CHARGEMENT : ON L'AFFICHE
  return (
    <div className="result-display" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {displayItem?.url ? (
          displayItem.type === "VIDEO" ? (
            <video
              key={displayItem.id}
              src={displayItem.url}
              autoPlay
              controls
              playsInline
              style={{ width: '100%', maxHeight: '320px', borderRadius: '12px', objectFit: 'contain', background: '#000' }}
            />
          ) : (
            <img
              src={displayItem.url}
              className="render-media"
              alt="IA"
              style={{ width: '100%', height: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'contain' }}
            />
          )
        ) : (
<div style={{ color: '#666' }}>
  {t("app.noSelection", { defaultValue: "Aucune sélection" })}
</div>
   )}
      </div>
    </div>
  );
})()}
</div>

{activeItem && !isLoading && (
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    padding: '10px 20px', 
    margin: '0', 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    boxSizing: 'border-box' 
  }}>
{!String(activeItem.id || '').startsWith('inspi-') && (
  <button
    className="btn-modern btn-remix"
    onClick={() => handleRemix(activeItem)}
  >
    <span>
      {t("app.history.remix", { defaultValue: "Remixer" })}
    </span>
  </button>
)}
{activeItem.type === "VIDEO" &&
 activeItem.url && (
  
<button
  className="btn-modern btn-remix"
  onClick={() => handleEditHistoryItem(activeItem)}
>
  <span>{t("app.history.editButton")}</span>
</button>
)}

    {activeItem.type !== "TEXTE" && !String(activeItem.id || '').startsWith('inspi-') && (
      <button className="btn-modern btn-download" onClick={() => handleDownload(activeItem)}>
<span>
  {t("app.download", { defaultValue: "Télécharger" })}
</span>
      </button>
    )}
  </div>
)}



    {/* ZONE 2 : EXPLORER (BAS - INSPIRATIONS DÉPLACÉES ICI) */}
   {(mode === "IMAGE" || mode === "VIDEO") && randomInspirations.length > 0 && (
  <div className="explorer-section" style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '15px 15px 18px 15px', borderRadius: '0 0 16px 16px', marginTop: 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
<span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00bcd4', letterSpacing: '1px' }}>
  {t("app.explorer.title", {
    defaultValue: "🔍 EXPLORER LES EXEMPLES"
  })}
</span>
      <div style={{ display: 'flex', gap: '5px' }}>
         <button className="nav-arrow-mini" onClick={() => handleScrollInspi('left')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>‹</button>
         <button className="nav-arrow-mini" onClick={() => handleScrollInspi('right')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>›</button>
      </div>
    </div>

        <div className="thumbnails-wrapper" style={{ overflow: 'hidden' }}>
          <div className="inspi-scroll-row" ref={scrollInspiRef} style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '5px' }}>
{randomInspirations.map((item) => (
  <div 
    key={item.id} 
    className="inspi-horizontal-card"
    style={{ 
      minWidth: '130px', 
      height: '75px', 
      position: 'relative', 
      cursor: 'pointer', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s ease'
    }}
    

    // Dès que la souris sort, l'aperçu dynamique disparaît
    onMouseLeave={() => setHoverItem(null)}

    // ✅ LE CORRIGÉ : Le clic enregistre le prompt ET fixe le média à l'écran
    onClick={() => {
      selectedSuggestionPromptRef.current = item.promptKey ? { id: item.id, promptKey: item.promptKey, lastText: item.prompt } : null;
      setPrompt(item.prompt);
      setActiveItem({
        id: `inspi-${item.id}`,
        url: item.video || item.url,
        type: mode, 
        prompt: item.prompt,
        title: item.title
      });
    }}
  >
    {mode === "VIDEO" && (item.video || item.url) ? (
      <video 
        src={item.video || item.url} 
        muted 
        poster={item.img} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 100 }} 
      />
    ) : (
      <img 
        src={item.img} 
        alt={item.title} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 100 }} 
      />
    )}
    
    <div className="inspi-overlay-text" style={{ 
      position: 'absolute', 
      bottom: '5px', 
      left: '8px', 
      fontSize: '10px', 
      color: 'white', 
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.8)' 
    }}>
      {item.title}
    </div>
  </div>
))}
          </div>
        </div>
        
      </div>
    )}
    
  </div>

{/* ZONE IMAGES DE RÉFÉRENCE MINIMAX H3 */}
{showH3ReferencePanel && (
  <div
    style={{
      width: '97%',
      marginTop: '1px',
      padding: '14px',
      background: 'rgba(17,17,17,0.96)',
      border: '1px solid rgba(168,85,247,0.35)',
      borderRadius: '14px',
      boxSizing: 'border-box'
    }}
  >

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}
    >
      <div>
        <div
          style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '700'
          }}
        >
          🖼️ {t("line3_app_settings_referenceImages")}
        </div>

        <div
          style={{
            color: '#888',
            fontSize: '10px',
            marginTop: '3px'
          }}
        >
          {t("line1_app_references_maxImagesH3")}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span
          style={{
            color: '#aaa',
            fontSize: '11px',
            fontWeight: '600'
          }}
        >
          {h3ReferenceImages.length}/9
        </span>

        <button
          type="button"
          onClick={() => setShowH3ReferencePanel(false)}
          style={{
            width: '26px',
            height: '26px',
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          ✕
        </button>
      </div>
    </div>

    {/* 9 SLOTS */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        width: '100%'
      }}
    >
      {Array.from({ length: 9 }, (_, slotIndex) => {
        const image = h3ReferenceImages[slotIndex];

        return (
          <div
            key={`h3-reference-slot-${slotIndex}`}
            style={{
              position: 'relative',
              height: '90px',
              borderRadius: '9px',
              overflow: 'hidden',
              border: image
                ? '1px solid rgba(168,85,247,0.55)'
                : '1px dashed rgba(255,255,255,0.22)',
              background: image
                ? '#080808'
                : 'rgba(255,255,255,0.025)',
              boxSizing: 'border-box'
            }}
          >

            {image ? (
              <>
                <img
                  src={image}
                  alt={`Référence H3 ${slotIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    left: '5px',
                    bottom: '5px',
                    padding: '2px 6px',
                    borderRadius: '5px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '700'
                  }}
                >
                  {slotIndex + 1}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setH3ReferenceImages(prev =>
                      prev.filter((_, i) => i !== slotIndex)
                    );
                  }}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '21px',
                    height: '21px',
                    border: 'none',
                    borderRadius: '50%',
                    background: 'rgba(255,0,0,0.8)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '10px',
                    padding: 0
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <label
                htmlFor="h3-reference-images-input"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor:
                    h3ReferenceImages.length < 9
                      ? 'pointer'
                      : 'default'
                }}
              >
                <span
                  style={{
                    fontSize: '22px',
                    color: '#aaa',
                    lineHeight: 1
                  }}
                >
                  ＋
                </span>

                <span
                  style={{
                    color: '#aaa',
                    fontSize: '10px',
                    marginTop: '5px'
                  }}
                >
                  {t("line1_app_references_referenceImageSlot", { number: slotIndex + 1 })}
                </span>
              </label>
            )}

          </div>
        );
      })}
    </div>


{/* INPUT */}
<input
  id="h3-reference-images-input"
  type="file"
  accept="image/*"
  multiple
  hidden
  onChange={async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (!files.length) return;

    const remaining = 9 - h3ReferenceImages.length;
    if (remaining <= 0) return;

    const selectedFiles = files.slice(0, remaining);

    const totalNow = h3ReferenceImages.length + h3ReferenceVideos.length + h3ReferenceAudios.length + (videoSource && !h3ReferenceVideos.includes(videoSource) ? 1 : 0);
    const allowedCount = Math.max(0, Math.min(9 - h3ReferenceImages.length, 12 - totalNow));
    const uploadedUrls = await uploadFilesToPublicUrls(selectedFiles.slice(0, allowedCount));
    setH3ReferenceImages(prev => [...new Set([...prev, ...uploadedUrls])].slice(0, 9));
  }}
/>

    <div
      style={{
        marginTop: '10px',
        color: '#777',
        fontSize: '10px'
      }}
    >
      {t("line1_app_references_selectedImagesCount", { count: h3ReferenceImages.length })}
    </div>

  </div>
)}


{/* ZONE VIDÉOS DE RÉFÉRENCE MINIMAX H3 */}
{mode === "VIDEO" &&
  (selectedModel || "").toLowerCase().includes("minimax h3") && (
    <div
      style={{
        width: "97%",
        marginTop: "10px",
        padding: "14px",
        background: "rgba(17,17,17,0.96)",
        border: "1px solid rgba(168,85,247,0.35)",
        borderRadius: "14px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}
      >
        <div>
          <div style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>
            🎬 {t("line1_app_references_referenceVideos")}
          </div>
          <div style={{ color: "#888", fontSize: "10px", marginTop: "3px" }}>
            {t("line1_app_references_videoFormatsLimit")}
          </div>
        </div>
        <span style={{ color: "#aaa", fontSize: "11px" }}>
          {h3ReferenceVideos.length}/{videoSource ? 2 : 3}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "10px"
        }}
      >
        {Array.from({ length: 3 }, (_, index) => {
          const video = h3ReferenceVideos[index];
          const maxRefs = videoSource ? 2 : 3;
          const slotAvailable = index < maxRefs;

          return (
            <div
              key={`h3-video-reference-${index}`}
              style={{
                position: "relative",
                height: "90px",
                overflow: "hidden",
                borderRadius: "9px",
                border: video
                  ? "1px solid rgba(168,85,247,0.65)"
                  : "1px dashed rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.025)"
              }}
            >
              {video ? (
                <>
                  <video
                    src={video}
                    controls
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setH3ReferenceVideos(prev =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "21px",
                      height: "21px",
                      border: "none",
                      borderRadius: "50%",
                      background: "rgba(255,0,0,0.85)",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <label
                  htmlFor="h3-reference-videos-input"
                  onClick={e => {
                    if (!slotAvailable || h3ReferenceVideos.length >= maxRefs) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: slotAvailable ? "pointer" : "not-allowed",
                    color: slotAvailable ? "#aaa" : "#555",
                    fontSize: "10px"
                  }}
                >
                  <span style={{ fontSize: "22px" }}>＋</span>
                  {t("line1_app_references_referenceVideoSlot", { number: index + 1 })}
                </label>
              )}
            </div>
          );
        })}
      </div>

  <input
    id="h3-reference-videos-input"
    type="file"
    accept="video/mp4,video/quicktime,.mp4,.mov"
    multiple
    hidden
    onChange={async e => {
      const files = Array.from(e.target.files || []);
      e.target.value = "";

      if (!files.length) return;

      const maxRefs = videoSource ? 2 : 3;
      const remaining = Math.max(
        0,
        maxRefs - h3ReferenceVideos.length
      );

      if (remaining <= 0) return;

      const totalNow = h3ReferenceImages.length + h3ReferenceVideos.length + h3ReferenceAudios.length + (videoSource && !h3ReferenceVideos.includes(videoSource) ? 1 : 0);
      const totalRemaining = Math.max(0, 12 - totalNow);
      const selectedFiles = files.slice(0, Math.min(remaining, totalRemaining));
      const newUrls = await uploadFilesToPublicUrls(selectedFiles);
      setH3ReferenceVideos(prev => {
        const currentMax = videoSource ? 2 : 3;
        return [...new Set([...prev, ...newUrls])].slice(0, currentMax);
      });
    }}
  />



      <div style={{ marginTop: "10px", color: "#777", fontSize: "10px" }}>
        {t("line3_app_ui_referenceVideoGuidance")}
      </div>
    </div>
  )}

{/* ZONE AUDIO DE RÉFÉRENCE ET DIALOGUE MINIMAX H3 */}
{mode === "VIDEO" && (selectedModel || "").toLowerCase().includes("minimax h3") && (
  <div style={{ width: "97%", marginTop: "10px", padding: "14px", background: "rgba(17,17,17,0.96)", border: "1px solid rgba(168,85,247,0.35)", borderRadius: "14px", boxSizing: "border-box" }}>
    <div style={{ color: "#fff", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>🔊 {t("app.audio.referenceDialogue")}</div>
    <div style={{ color: "#aaa", fontSize: "11px", marginBottom: "10px" }}>{t("app.audio.referenceHelp")}</div>
    <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac" multiple onChange={async (e) => {
      const files = Array.from(e.target.files || []); e.target.value = "";
      const totalNow = h3ReferenceImages.length + h3ReferenceVideos.length + h3ReferenceAudios.length + (videoSource && !h3ReferenceVideos.includes(videoSource) ? 1 : 0);
      const allowedCount = Math.max(0, Math.min(3 - h3ReferenceAudios.length, 12 - totalNow));
      const urls = await uploadFilesToPublicUrls(files.slice(0, allowedCount));
      setH3ReferenceAudios(prev => [...new Set([...prev, ...urls])].slice(0, 3));
    }} />
    {h3ReferenceAudios.map((url, i) => <div key={`h3-audio-${url}`} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", color: "#ddd", fontSize: "11px" }}><audio controls src={url} style={{ width: "min(75%, 360px)", height: "32px" }} /><button type="button" onClick={() => setH3ReferenceAudios(prev => prev.filter((_, idx) => idx !== i))}>{t("app.audio.remove")}</button></div>)}
    <label style={{ display: "block", color: "#ddd", fontSize: "11px", marginTop: "12px", marginBottom: "5px" }}>{t("app.audio.exactDialogue")}</label>
    <textarea value={h3Dialogue} onChange={e => setH3Dialogue(e.target.value.slice(0, 2000))} maxLength={2000} rows={3} placeholder={t("app.audio.dialogueExample")} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#090909", color: "#fff", border: "1px solid #333", borderRadius: "8px", padding: "9px" }} />
    <div style={{ color: "#777", fontSize: "10px", marginTop: "5px" }}>{t("app.audio.referenceLimit")}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", marginTop: "10px" }}>
      <label style={{ color: "#bbb", fontSize: "10px" }}>{t("app.audio.promptExpansion")}<select value={h3PromptExpansion} onChange={e => setH3PromptExpansion(e.target.value)} style={{ display: "block", width: "100%", marginTop: "4px", padding: "7px", background: "#090909", color: "#fff", border: "1px solid #333", borderRadius: "6px" }}><option value="disabled">{t("app.audio.disabledMoreFaithful")}</option><option value="balanced">{t("app.audio.balanced")}</option><option value="quality">{t("app.audio.qualityPriority")}</option></select></label>
      <label style={{ color: "#bbb", fontSize: "10px" }}>{t("app.audio.seedOptional")}<input type="number" min="0" max="4294967295" value={h3Seed} onChange={e => setH3Seed(e.target.value)} style={{ display: "block", width: "100%", marginTop: "4px", padding: "7px", background: "#090909", color: "#fff", border: "1px solid #333", borderRadius: "6px" }} /></label>
    </div>
  </div>
)}

{/* OPTIONS PIXVERSE V6 — PANNEAU PERSONNALISÉ */}
{mode === "VIDEO" && (engines.find(e => e.name === selectedModel)?.id || "") === "pixverse6" && (
  <section style={{ width: "97%", marginTop: 12, padding: 16, background: "linear-gradient(145deg, rgba(26,20,40,.98), rgba(13,16,27,.98))", border: "1px solid rgba(168,85,247,.38)", borderRadius: 16, boxSizing: "border-box", color: "#f4f4f5", boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(168,85,247,.16)", border: "1px solid rgba(168,85,247,.28)", fontSize: 19 }}>✦</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 750, letterSpacing: ".1px" }}>PixVerse V6 <span style={{ color: "#c4b5fd", fontWeight: 500, fontSize: 11 }}>{t("app.settings.pixverseAdvanced")}</span></div>
        <div style={{ color: "#a1a1aa", fontSize: 11, marginTop: 3 }}>{t("app.settings.pixverseDescription")}</div>
      </div>
    </div>
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 13px", borderRadius: 11, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer", marginBottom: 13 }}>
      <span><span style={{ display: "block", fontSize: 12, fontWeight: 650 }}>{t("app.settings.multiShot")}</span><span style={{ display: "block", color: "#a1a1aa", fontSize: 10, marginTop: 3 }}>{t("app.settings.multiShotHelp")}</span></span>
      <input type="checkbox" checked={pixverseMultiClip} onChange={e => setPixverseMultiClip(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#a855f7", flexShrink: 0 }} />
    </label>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 11 }}>
      <label style={{ display: "block", color: "#d4d4d8", fontSize: 11, fontWeight: 600 }}>{t("line1_app_settings_visualStyle")}
        <select value={pixverseStyle} onChange={e => setPixverseStyle(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 11px", borderRadius: 9, background: "#101019", color: "#f4f4f5", border: "1px solid #393344", outlineColor: "#a855f7" }}><option value="">{t("app.settings.automatic")}</option><option value="anime">{t("app.style.anime")}</option><option value="3d_animation">{t("app.style.animation3d")}</option><option value="clay">{t("app.settings.clay")}</option><option value="comic">{t("app.settings.comic")}</option><option value="cyberpunk">{t("app.style.cyberpunk")}</option></select>
      </label>
      <label style={{ display: "block", color: "#d4d4d8", fontSize: 11, fontWeight: 600 }}>{t("line3_app_ui_thinkingLevel")}
        <select value={pixverseThinking} onChange={e => setPixverseThinking(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 11px", borderRadius: 9, background: "#101019", color: "#f4f4f5", border: "1px solid #393344" }}><option value="auto">{t("app.settings.automatic")}</option><option value="enabled">{t("app.settings.enhanced")}</option><option value="disabled">{t("app.settings.fast")}</option></select>
      </label>
      <label style={{ display: "block", color: "#d4d4d8", fontSize: 11, fontWeight: 600 }}>{t("app.settings.seedOptional")} 
        <input type="number" min="0" max="2147483647" value={pixverseSeed} onChange={e => setPixverseSeed(e.target.value)} placeholder={t("app.settings.random")} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 11px", borderRadius: 9, background: "#101019", color: "#f4f4f5", border: "1px solid #393344" }} />
      </label>
    </div>
    <label style={{ display: "block", color: "#d4d4d8", fontSize: 11, fontWeight: 600, marginTop: 13 }}>{t("app.settings.negativePromptLabel")} <span style={{ color: "#71717a", fontWeight: 400 }}>{t("app.settings.avoidElements")}</span>
      <textarea value={pixverseNegativePrompt} onChange={e => setPixverseNegativePrompt(e.target.value.slice(0, 2048))} rows={3} maxLength={2048} placeholder={t("app.settings.negativePromptExample")} style={{ display: "block", width: "100%", boxSizing: "border-box", resize: "vertical", marginTop: 6, padding: "11px 12px", borderRadius: 9, background: "#101019", color: "#f4f4f5", border: "1px solid #393344", lineHeight: 1.45 }} />
      <span style={{ display: "block", textAlign: "right", color: "#71717a", fontSize: 10, marginTop: 4 }}>{pixverseNegativePrompt.length}/2048</span>
    </label>
  </section>
)}

{/* RÉFÉRENCES MULTIMODALES SEEDANCE 2.0 / 2.5 — PANNEAU PERSONNALISÉ */}
{mode === "VIDEO" && ["seedance20", "seedance25"].includes((engines.find(e => e.name === selectedModel)?.id || "").toLowerCase()) && (() => {
  const currentId = (engines.find(e => e.name === selectedModel)?.id || "").toLowerCase();
  const is25 = currentId === "seedance25";
  const maxImages = is25 ? 30 : 9;
  const maxVideos = is25 ? 10 : (videoSource ? 2 : 3);
  const maxAudios = is25 ? 10 : 3;
  const totalFiles = seedanceReferenceImages.length + seedanceReferenceVideos.length + seedanceReferenceAudios.length + (videoSource && !seedanceReferenceVideos.includes(videoSource) ? 1 : 0);
  const uploadList = async (e, kind, max) => {
    const files = Array.from(e.target.files || []); e.target.value = "";
    if (!files.length) return;
    const existing = kind === "image" ? seedanceReferenceImages : kind === "video" ? seedanceReferenceVideos : seedanceReferenceAudios;
    const totalExisting = seedanceReferenceImages.length + seedanceReferenceVideos.length + seedanceReferenceAudios.length + (videoSource && !seedanceReferenceVideos.includes(videoSource) ? 1 : 0);
    const totalRemaining = is25 ? Number.POSITIVE_INFINITY : Math.max(0, 12 - totalExisting);
    const allowedCount = Math.max(0, Math.min(max - existing.length, totalRemaining));
    if (allowedCount <= 0) return;
    const urls = await uploadFilesToPublicUrls(files.slice(0, allowedCount));
    const setter = kind === "image" ? setSeedanceReferenceImages : kind === "video" ? setSeedanceReferenceVideos : setSeedanceReferenceAudios;
    setter(prev => [...new Set([...prev, ...urls])].slice(0, max));
  };
  const fieldCard = { padding: 12, borderRadius: 11, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)", minWidth: 0 };
  const addButton = { display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8, padding: "9px 12px", borderRadius: 8, background: "rgba(59,130,246,.12)", color: "#bfdbfe", border: "1px solid rgba(96,165,250,.35)", fontSize: 11, fontWeight: 650, cursor: "pointer" };
  const renderList = (label, list, setter, max, accept, kind, description) => (
    <div style={fieldCard}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ color: "#f4f4f5", fontSize: 12, fontWeight: 650 }}>{label}</div>
        <span style={{ padding: "3px 7px", borderRadius: 999, background: "rgba(255,255,255,.07)", color: "#cbd5e1", fontSize: 10, whiteSpace: "nowrap" }}>{list.length} / {max}</span>
      </div>
      <div style={{ color: "#8b93a5", fontSize: 10, marginTop: 4, lineHeight: 1.4 }}>{description}</div>
      <label style={{ ...addButton, opacity: is25 && kind !== "image" && Boolean(videoSource) ? .45 : 1 }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>＋</span> {t("line1_app_references_addMedia")} {kind === "image" ? t("app.settings.addImages") : kind === "video" ? t("app.settings.addVideos") : t("app.settings.addAudios")}
        <input type="file" accept={accept} multiple style={{ display: "none" }} disabled={(is25 && kind !== "image" && Boolean(videoSource)) || list.length >= max || (!is25 && totalFiles >= 12)} onChange={e => uploadList(e, kind, max)} />
      </label>
      {list.length > 0 && <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
        {list.map((url, i) => <div key={`${kind}-${url}`} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, padding: "7px 8px", borderRadius: 8, background: "rgba(15,23,42,.7)", border: "1px solid rgba(255,255,255,.06)" }}>
          <span style={{ width: 44, height: 44, position: "relative", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden", borderRadius: 7, background: "rgba(96,165,250,.12)", color: "#93c5fd", fontSize: 14 }}>
            {kind === "image" ? <><span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>▧</span><img src={url} alt={t("line1_app_references_referenceImageSlot", { number: i + 1 })} loading="lazy" onError={event => { event.currentTarget.style.display = "none"; }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "#111", zIndex: 1 }} /></> : kind === "video" ? "▶" : "♫"}
          </span>
          <span style={{ flex: 1, minWidth: 0, color: "#d4d4d8", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kind === "image" ? t("app.settings.referenceImage", { number: i + 1 }) : kind === "video" ? t("line1_app_settings_referenceVideo", { number: i + 1 }) : t("app.settings.referenceAudio", { number: i + 1 })}</span>
          <button type="button" aria-label={t("line4_remove_media", { media: label.toLowerCase(), number: i + 1, defaultValue: `Retirer ${label.toLowerCase()} ${i + 1}` })} onClick={() => setter(prev => prev.filter((_, idx) => idx !== i))} style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 7, background: "rgba(248,113,113,.1)", color: "#fca5a5", border: "1px solid rgba(248,113,113,.18)", cursor: "pointer" }}>×</button>
        </div>)}
      </div>}
    </div>
  );
  return <section style={{ width: "97%", marginTop: 12, padding: 16, background: "linear-gradient(145deg, rgba(13,25,43,.98), rgba(13,16,27,.98))", border: "1px solid rgba(59,130,246,.36)", borderRadius: 16, boxSizing: "border-box", color: "#f4f4f5", boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(59,130,246,.15)", border: "1px solid rgba(96,165,250,.25)", fontSize: 18 }}>🎬</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 750 }}>{t("line3_app_ui_multimodalReferences")} {is25 ? "2.5" : "2.0"}</div>
        <div style={{ color: "#93c5fd", fontSize: 10, marginTop: 3 }}>{is25 ? t("line3_app_ui_seedance25Limit") : t("line3_app_ui_seedance20Limit", { count: totalFiles })}</div>
      </div>
    </div>
    <div style={{ padding: "10px 12px", marginBottom: 12, borderRadius: 9, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", color: "#a1a1aa", fontSize: 10, lineHeight: 1.5 }}>
      {is25 ? t("line3_app_ui_seedance25Notice") : t("line3_app_ui_seedance20Notice")}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", gap: 10 }}>
      {renderList(t("line3_app_ui_referenceImages"), seedanceReferenceImages, setSeedanceReferenceImages, maxImages, "image/*", "image", is25 ? t("line3_app_ui_seedanceCharacterObjects") : t("line3_app_ui_seedanceNineImages"))}
      {renderList(t("line3_app_ui_videoReference"), seedanceReferenceVideos, setSeedanceReferenceVideos, maxVideos, "video/mp4,video/quicktime,.mp4,.mov", "video", is25 ? t("line3_app_ui_seedanceReferenceClips") : t("line3_app_ui_seedanceThreeVideos"))}
      {renderList(t("line3_app_ui_referenceAudioCount"), seedanceReferenceAudios, setSeedanceReferenceAudios, maxAudios, "audio/*,.mp3,.wav,.m4a,.aac", "audio", t("line3_app_ui_audioAmbience"))}
    </div>
    {is25 && <div style={{ marginTop: 12, padding: 12, borderRadius: 11, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ color: "#e4e4e7", fontSize: 11, fontWeight: 650 }}>{t("line3_app_ui_seedanceOperation")} {seedance25Operation === "extend" ? t("line3_app_ui_extend") : t("line3_app_ui_modify")}</div>
      <div style={{ color: "#cbd5e1", fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>{seedance25Operation === "extend" ? t("line3_app_ui_seedanceExtendHelp") : t("line3_app_ui_seedanceEditHelp")}</div>
    </div>}
  </section>;
})()}

{/* RÉFÉRENCES IMAGE POUR GPT IMAGE 2 / FLUX.2 PRO / NANO BANANA 2 LITE */}
{mode === "IMAGE" && ["gpt_image2", "flux2pro", "nano_banana2_lite"].includes((engines.find(e => e.name === selectedModel)?.id || "").toLowerCase()) && (() => {
  const currentEngine = engines.find(e => e.name === selectedModel);
  const engineId = (currentEngine?.id || "").toLowerCase();
  const maxRefs = currentEngine?.maxReferenceImages || 9;
  const remainingRefs = Math.max(0, maxRefs - modelReferenceImages.length);
  const fieldStyle = { display: "block", width: "100%", boxSizing: "border-box", marginTop: 7, padding: "10px 11px", background: "#0b0b12", color: "#f4f4f5", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, outline: "none", fontSize: 12 };
  const labelStyle = { display: "block", color: "#c4c4d0", fontSize: 11, fontWeight: 650, minWidth: 0 };
  const uploadReferenceFiles = async (filesLike) => {
    const files = Array.from(filesLike || []).filter(file => file && file.type.startsWith("image/"));
    if (!files.length || remainingRefs <= 0) return;
    const urls = await uploadFilesToPublicUrls(files.slice(0, remainingRefs));
    setModelReferenceImages(prev => [...new Set([...prev, ...urls])].slice(0, maxRefs));
  };
  return <section style={{ width: "97%", marginTop: 14, padding: 16, boxSizing: "border-box", color: "#f8fafc", background: "linear-gradient(145deg, rgba(23,19,37,.98), rgba(12,12,18,.98))", border: "1px solid rgba(168,85,247,.32)", borderRadius: 18, boxShadow: "0 12px 36px rgba(0,0,0,.20)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, minWidth: 0, flex: 1 }}>
        <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 13, background: "linear-gradient(135deg, rgba(168,85,247,.28), rgba(99,102,241,.15))", border: "1px solid rgba(196,181,253,.22)", fontSize: 21 }}>🖼️</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: "-.2px" }}>{t("app.references.imagesTitle")}</div>
          <div style={{ color: "#aaa7b8", fontSize: 11, lineHeight: 1.55, marginTop: 4 }}>{t("app.references.guideText")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
            <span style={{ padding: "4px 8px", borderRadius: 999, background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.22)", color: "#d8b4fe", fontSize: 10, fontWeight: 700 }}>{modelReferenceImages.length}/{maxRefs} {t("app.references.images")}</span>
            <span style={{ padding: "4px 8px", borderRadius: 999, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", color: "#b8b7c5", fontSize: 10 }}>{engineId === "gpt_image2" ? t("app.references.preciseEditing") : engineId === "flux2pro" ? t("app.references.guidedComposition") : t("app.references.multipleReferences")}</span>
          </div>
        </div>
      </div>
      <button type="button" onClick={() => { setImageTutorialTab("guide"); setShowImageTutorial(true); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 12px", borderRadius: 11, border: "1px solid rgba(196,181,253,.3)", background: "rgba(168,85,247,.13)", color: "#e9d5ff", cursor: "pointer", fontSize: 11, fontWeight: 750, whiteSpace: "nowrap" }}><span>🎓</span> {t("app.references.tutorialButton")} <span>↗</span></button>
    </div>

    <label htmlFor={`image-reference-upload-${engineId}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 7, marginTop: 15, padding: "22px 14px", borderRadius: 14, border: "1px dashed rgba(196,181,253,.42)", background: "linear-gradient(135deg, rgba(168,85,247,.075), rgba(99,102,241,.045))", cursor: remainingRefs ? "pointer" : "not-allowed", opacity: remainingRefs ? 1 : .55, transition: "border-color .2s, background .2s" }}>
      <input id={`image-reference-upload-${engineId}`} type="file" accept="image/*" multiple disabled={!remainingRefs} style={{ display: "none" }} onChange={async e => { const files = Array.from(e.target.files || []); e.target.value = ""; await uploadReferenceFiles(files); }} />
      <span style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 13, background: "rgba(168,85,247,.16)", color: "#e9d5ff", fontSize: 22 }}>＋</span>
      <span style={{ color: "#f4f0ff", fontSize: 12, fontWeight: 750 }}>{remainingRefs ? t("app.references.addImages") : t("app.references.imageLimit")}</span>
      <span style={{ color: "#a7a4b5", fontSize: 10, lineHeight: 1.5 }}>{remainingRefs ? t("app.references.chooseFiles") : t("app.references.removeToAdd")}</span>
      <span style={{ color: "#c4b5fd", fontSize: 10, fontWeight: 700 }}>{t("line1_app_references_imageFormatsMaximum", { max: maxRefs })}</span>
    </label>

    {modelReferenceImages.length > 0 ? <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 9 }}><span style={{ color: "#e4e4e7", fontSize: 11, fontWeight: 750 }}>{t("app.settings.referencesAdded")}</span><span style={{ color: "#888697", fontSize: 10 }}>{t("app.settings.removeImageHint")}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 9 }}>
        {modelReferenceImages.map((url, i) => <div key={`image-model-ref-${url}`} style={{ position: "relative", overflow: "hidden", aspectRatio: "1 / 1", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "#09090f", boxShadow: "0 5px 14px rgba(0,0,0,.18)" }}>
          <img src={url} alt={t("app.settings.referenceImage", { number: i + 1 })} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <span style={{ position: "absolute", left: 6, bottom: 6, padding: "4px 6px", borderRadius: 6, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: 9, fontWeight: 750 }}>{t("line1_app_references_referenceImageSlot", { number: i + 1 })}</span>
          <button type="button" aria-label={t("line1_app_references_removeReferenceImage", { number: i + 1 })} onClick={() => setModelReferenceImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 5, right: 5, width: 25, height: 25, display: "grid", placeItems: "center", padding: 0, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(8,8,12,.82)", color: "#fff", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>)}
      </div>
    </div> : <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.025)", color: "#8f8c9d", fontSize: 10, lineHeight: 1.5 }}>{t("app.settings.noImageReferences")}</div>}

    <div style={{ marginTop: 16, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ color: "#f4f4f5", fontSize: 12, fontWeight: 800, marginBottom: 10 }}>{t("app.settings.engineSettings")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 11 }}>
        <label style={labelStyle}>{t("app.settings.outputFormat")}<select value={imageOutputFormat} onChange={e => setImageOutputFormat(e.target.value)} style={fieldStyle}><option value="JPG">JPG</option><option value="PNG">PNG</option><option value="WEBP">WEBP</option></select></label>
        <label style={labelStyle}>{t("app.settings.optionalSeed")}<input type="number" min="0" value={imageSeed} onChange={e => setImageSeed(e.target.value)} placeholder={t("app.settings.random")} style={fieldStyle} /></label>
        {engineId === "gpt_image2" && <><label style={labelStyle}>{t("app.settings.imageQuality")}<select value={gptImageQuality} onChange={e => setGptImageQuality(e.target.value)} style={fieldStyle}><option value="auto">{t("app.settings.automatic")}</option><option value="low">{t("line1_app_settings_imageQualityFastLow")}</option><option value="medium">{t("app.audio.balanced")}</option><option value="high">{t("line1_app_settings_imageQualityHigh")}</option></select></label><label style={labelStyle}>{t("app.settings.moderation")}<select value={gptImageModeration} onChange={e => setGptImageModeration(e.target.value)} style={fieldStyle}><option value="auto">{t("line1_app_settings_moderationStandard")}</option><option value="low">{t("line1_app_settings_moderationLessRestrictive")}</option></select></label></>}
        {engineId === "flux2pro" && <label style={labelStyle}>{t("app.settings.safetyTolerance")}<select value={fluxSafetyTolerance} onChange={e => setFluxSafetyTolerance(e.target.value)} style={fieldStyle}>{[0,1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}</option>)}</select></label>}
        {engineId === "nano_banana2_lite" && <><label style={labelStyle}>{t("app.settings.thinking")}<select value={nanoThinking} onChange={e => setNanoThinking(e.target.value)} style={fieldStyle}><option value="MINIMAL">{t("app.settings.minimalFaster")}</option><option value="HIGH">{t("line1_app_settings_high")}</option></select></label><label style={labelStyle}>{t("app.settings.temperature")}<input type="number" min="0" max="2" step="0.01" value={nanoTemperature} onChange={e => setNanoTemperature(e.target.value)} style={fieldStyle} /></label><label style={labelStyle}>{t("app.settings.topP")}<input type="number" min="0" max="1" step="0.01" value={nanoTopP} onChange={e => setNanoTopP(e.target.value)} style={fieldStyle} /></label><label style={{...labelStyle, gridColumn: "1 / -1"}}>{t("line1_app_settings_systemInstruction")} <span style={{ color: "#888697", fontWeight: 400 }}>({t("line1_app_settings_optional")})</span><textarea rows={3} value={nanoSystemPrompt} onChange={e => setNanoSystemPrompt(e.target.value.slice(0, 50000))} placeholder={t("app.settings.generalInstructions")} style={{...fieldStyle, resize: "vertical", lineHeight: 1.5}} /></label></>}
      </div>
    </div>

    {engineId === "nano_banana2_lite" && <div style={{ marginTop: 14, padding: 13, borderRadius: 13, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, background: "rgba(168,85,247,.14)", border: "1px solid rgba(196,181,253,.22)", fontSize: 16 }}>🎞️</span><div><div style={{ color: "#f4f4f5", fontSize: 12, fontWeight: 800 }}>{t("line1_app_settings_referenceVideoTitle")} <span style={{ color: "#a5a1b4", fontWeight: 500 }}>({t("line1_app_settings_oneVideoMaximum")})</span></div><div style={{ color: "#9692a5", fontSize: 10, marginTop: 3 }}>{t("app.settings.referenceVideoNote")}</div></div></div>
      <input id="nano-banana-reference-video-input" type="file" accept="video/*,.mp4,.mov,.webm" onChange={async e => { const files = Array.from(e.target.files || []); e.target.value = ""; if (!files.length) return; const urls = await uploadFilesToPublicUrls(files.slice(0, 1)); setNanoReferenceVideo(urls[0] || null); }} style={{ display: "none" }} />
      <label htmlFor="nano-banana-reference-video-input" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "1px solid rgba(196,181,253,.35)", color: "#fff", fontSize: 11, fontWeight: 750, cursor: "pointer", boxShadow: "0 4px 14px rgba(109,40,217,.2)" }}><span>＋</span> {t("line1_app_settings_chooseVideo")} <span style={{ opacity: .8 }}>MP4 · MOV · WEBM</span></label>
      {nanoReferenceVideo && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 9, padding: "10px 12px", borderRadius: 10, background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.22)", color: "#bbf7d0", fontSize: 11 }}><span style={{ display: "flex", alignItems: "center", gap: 8 }}><span>✓</span><span><strong>{t("app.settings.videoAdded")}</strong><span style={{ display: "block", color: "#a7f3d0", fontSize: 10, marginTop: 2 }}>{t("app.settings.usedAsVisualReference")}</span></span></span><button type="button" onClick={() => setNanoReferenceVideo(null)} style={{ border: "1px solid rgba(252,165,165,.25)", borderRadius: 8, padding: "6px 9px", background: "rgba(239,68,68,.08)", color: "#fca5a5", cursor: "pointer", fontSize: 10, fontWeight: 750 }}>{t("app.audio.remove")}</button></div>}
    </div>}
    <div style={{ marginTop: 12, color: "#8f8c9d", fontSize: 10, lineHeight: 1.5 }}>{t("app.settings.referenceTip")}</div>
  </section>;
})()}

{/* ZONE IMAGES DE RÉFÉRENCE VEO */}

{mode === "VIDEO" && isVeoPanelModel && (
  <div
    style={{
      width: '97%',
      marginTop: '1px',
      padding: '14px',
      background: 'rgba(17,17,17,0.96)',
      border: '1px solid rgba(168,85,247,0.35)',
      borderRadius: '14px',
      boxSizing: 'border-box'
    }}
  >

    {/* EN-TÊTE */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}
    >
      <div>
        <div
          style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '700'
          }}
        >
          🖼️ {t("line3_app_settings_referenceImages")}
        </div>

        <div
          style={{
            color: '#888',
            fontSize: '10px',
            marginTop: '3px'
          }}
        >
          {t("line1_app_references_referenceAppearanceHelp")}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span
          style={{
            color: '#aaa',
            fontSize: '11px',
            fontWeight: '600'
          }}
        >
          {veoReferenceImages.length}/3
        </span>

        <button
          type="button"
          onClick={() => setShowReferencePanel(false)}
          style={{
            width: '26px',
            height: '26px',
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          ✕
        </button>
      </div>
    </div>

{/* LIGNE DES 3 IMAGES DE RÉFÉRENCE */}
<div
  style={{
    display: 'flex',
    gap: '10px',
    width: '100%',
    overflowX: 'auto'
  }}
>
  {[0, 1, 2].map((slotIndex) => {
    const image = veoReferenceImages[slotIndex];

    return (
      <div
        key={`veo-reference-slot-${slotIndex}`}
        style={{
          position: 'relative',
          flex: '0 0 110px',
          height: '90px',
          borderRadius: '9px',
          overflow: 'hidden',
          border: image
            ? '1px solid rgba(168,85,247,0.55)'
            : '1px dashed rgba(255,255,255,0.22)',
          background: image
            ? '#080808'
            : 'rgba(255,255,255,0.025)',
          boxSizing: 'border-box'
        }}
      >

        {image ? (
          <>
            {/* IMAGE */}
            <img
              src={image}
              alt={`Référence ${slotIndex + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* NUMÉRO */}
            <div
              style={{
                position: 'absolute',
                left: '5px',
                bottom: '5px',
                padding: '2px 6px',
                borderRadius: '5px',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: '700'
              }}
            >
              {slotIndex + 1}
            </div>

            {/* SUPPRIMER */}
            <button
              type="button"
              onClick={() => {
                setVeoReferenceImages(prev =>
                  prev.filter((_, i) => i !== slotIndex)
                );
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '21px',
                height: '21px',
                border: 'none',
                borderRadius: '50%',
                background: 'rgba(255,0,0,0.8)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '10px',
                padding: 0
              }}
            >
              ✕
            </button>
          </>
        ) : (
          /* EMPLACEMENT VIDE */
      <label
  htmlFor={
    veoReferenceImages.length < 3
      ? 'veo-reference-images-input'
      : undefined
  }
  onClick={() => {
    veoReferenceSlotRef.current = slotIndex;
    setVeoReferenceSlot(slotIndex);
  }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor:
                veoReferenceImages.length < 3
                  ? 'pointer'
                  : 'default'
            }}
          >
            <span
              style={{
                fontSize: '22px',
                color: '#aaa',
                lineHeight: 1
              }}
            >
              ＋
            </span>

            <span
              style={{
                color: '#aaa',
                fontSize: '10px',
                marginTop: '5px'
              }}
            >
              {t("line1_app_references_referenceImageSlot", { number: slotIndex + 1 })}
            </span>
          </label>
        )}

      </div>
    );
  })}

    </div>

    {/* INPUT FICHIER */}
    <input
      id="veo-reference-images-input"
      type="file"
      accept="image/*"
      multiple
      hidden
  onChange={async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  if (!files.length) return;

  try {
    const url = await handleFileToUrl(files[0]);
    if (!url) return;
    const requestedSlot = veoReferenceSlotRef.current ?? veoReferenceSlot;
    setVeoReferenceImages(prev => {
      const next = [...prev];
      const slot = Number.isInteger(requestedSlot) && requestedSlot >= 0 && requestedSlot < 3
        ? requestedSlot
        : Math.min(prev.length, 2);
      if (slot <= next.length) next[slot] = url;
      else next.push(url);
      return next.filter(Boolean).slice(0, 3);
    });
  } catch (error) {
    console.error('❌ Impossible de charger l’image de référence Veo :', error);
  } finally {
    setVeoReferenceSlot(null);
    veoReferenceSlotRef.current = null;
  }
}}
    />

    {/* BAS DU PANNEAU */}
    <div
      style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span
        style={{
          color: '#777',
          fontSize: '10px'
        }}
      >
        {veoReferenceImages.length} / 3 image
        {veoReferenceImages.length > 1 ? 's' : ''} sélectionnée
        {veoReferenceImages.length > 1 ? 's' : ''}
      </span>

    </div>

  </div>
)}

</div> {/* FIN COLONNE DE DROITE */}
        </div> {/* FIN generator-grid */}
      </main>
    </div> /* FIN de app-layout */
  )} 
</>
)}
</div> /* FIN de main-viewport */

{/* MODAL DE CONFIRMATION DESIGN */}
{itemToDelete && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
  }}>
    <div className="glass-card" style={{
      width: '90%', maxWidth: '400px', padding: '30px', textAlign: 'center',
      border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px'
    }}>
    <h3 style={{ color: '#fff', marginBottom: '15px' }}>
  {t("app.delete.title", {
    defaultValue: t("line3_app_error_deleteCreation")
  })}
</h3>


      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setItemToDelete(null)}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
{t("app.cancel", { defaultValue: "Annuler" })}
        </button>

<button 
          onClick={() => {
            // On simule un événement pour éviter que e.stopPropagation() dans deleteHistoryItem ne plante
            const simulatedEvent = { stopPropagation: () => {} };
            
            // On appelle ta vraie fonction qui gère TOUTE la logique (filtre + reset UI)
            deleteHistoryItem(simulatedEvent, itemToDelete);
            
            // On ferme la modale
            setItemToDelete(null);
          }}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
{t("app.delete.button", { defaultValue: "Supprimer" })}
        </button>
      </div>
    </div>
  </div>
)}

{showEditor && (
  <Filtre
    mediaSrc={veoEditVideo || videoSource || activeItem?.url || activeItem?.videoUrl}
    onBack={() => setShowEditor(false)}

    selectedOptionModal={selectedOptionModal}
    setSelectedOptionModal={setSelectedOptionModal}

    prompt={prompt}
    setPrompt={setPrompt}

    colorSettings={colorSettings}
    setColorSettings={setColorSettings}

    handleFileToUrl={handleFileToUrl}
    handleGenerate={handleGenerate}

    onApply={async (result) => {
      console.log(
        '🎨 Vidéo filtrée reçue dans App.jsx :',
        result
      );

      if (outilsRef.current?.applyMedia) {
        await outilsRef.current.applyMedia(result);
      } else {
        console.error(
          '❌ Outils.applyMedia() est introuvable'
        );
      }
    }}
  />
)}

<AuthModal 
  isOpen={showLogin} 
  onClose={() => setShowLogin(false)} 
  onSuccess={() => { setShowLogin(false); setShowStudio(true); }}
  onShowTerms={() => { setShowLogin(false); setShowTerms(true); }}
  onShowPrivacy={() => { setShowLogin(false); setShowPrivacy(true); }}
/>

{showProfile && (
  <ProfilePage 
    user={user}
    userPlan={userPlan || "Débutant"}
    tokens={tokens}
    packTokens={packTokens}
    /* --- ON GARDE TA LOGIQUE EN AJOUTANT LA CONVERSION POUR ÉVITER LE CRASH --- */
    resetDate={
      user?.tokensResetDate?.seconds 
        ? new Date(user.tokensResetDate.seconds * 1000).toLocaleDateString('fr-FR')
        : (user?.tokensResetDate || "Sous 30 jours")
    }
    /* --- AJOUT DE LA FONCTION EXPIRY SANS RIEN SUPPRIMER --- */
expiryDate={
  user?.packExpiryDate?.seconds
    ? new Date(user.packExpiryDate.seconds * 1000).toLocaleDateString('fr-FR')
    : "Valable 1 an"
}
    onBack={() => setShowProfile(false)}
    onShowPricing={() => {
      setShowProfile(false); 
      setShowPricing(true);
    }}
  />
)}

{showInsufficientFunds && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)'
  }}>
    <div style={{
      background: '#111', padding: '30px', borderRadius: '24px',
      border: '1px solid #a855f7', width: '95%', maxWidth: '420px', textAlign: 'center',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      <div style={{ fontSize: '50px', marginBottom: '10px' }}>
        {forceDiamonds ? '💎' : '⚡'}
      </div>
      
      <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px' }}>
        {forceDiamonds
          ? t("app.insufficient.diamonds", { defaultValue: "Diamants insuffisants" })
          : t("app.insufficient.tokens", { defaultValue: "Éclairs insuffisants" })}
      </h2>
      
 <p style={{ color: '#ccc', lineHeight: '1.5', fontSize: '15px' }}>
  {t("app.insufficient.cost", {
    defaultValue: "Cette action coûte"
  })}{" "}
  <strong>
    {neededAmount}{" "}
    {forceDiamonds
      ? t("app.cost.diamondsLower", { defaultValue: "diamants" })
      : t("app.cost.tokensLower", { defaultValue: "éclairs" })}
  </strong>.
</p>

      {/* MESSAGE PÉDAGOGIQUE ADAPTATIF */}
      {!forceDiamonds ? (
        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px' }}>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            {t("app.insufficient.tokensHelp", {
              defaultValue:
                "⚡ Pour obtenir plus d'éclairs, vous pouvez changer d'abonnement.\n\n📅 En attendant la recharge du début de mois prochain, vous pouvez aussi acheter des diamants pour continuer à créer immédiatement."
            })}
          </p>
        </div>
      ) : (
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '15px' }}>
          {t("line3_app_error_diamondsInsufficient")}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '25px' }}>
        {/* BOUTON PRINCIPAL */}
        <button 
          onClick={() => { setShowInsufficientFunds(false); setShowPricing(true); }}
          style={{
            padding: '14px', borderRadius: '12px', border: 'none',
            background: '#a855f7', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
            fontSize: '16px', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
          }}
        >
          {forceDiamonds ? t("line3_app_ui_buyDiamonds") : t("line3_app_ui_subscribeOrBuyDiamonds")}
        </button>

        {/* BOUTON RETOUR */}
        <button 
          onClick={() => setShowInsufficientFunds(false)}
          style={{
            padding: '12px', borderRadius: '12px', border: '1px solid #333',
            background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '14px'
          }}
        >
          {t("line3_app_ui_stayInStudio")}
        </button>
      </div>
    </div>
  </div>
)}

{showVideoTutorial && mode === "VIDEO" && (() => {
  const tutorialEngine = engines.find(e => e.name === selectedModel) || { id: selectedModel?.toLowerCase(), name: selectedModel };
  const tutorialGuideKey = getVideoTutorialGuideKey(tutorialEngine);
  const tutorial = getVideoTutorialGuide(tutorialGuideKey, t);
  const tutorialResourceRaw = VIDEO_TUTORIAL_RESOURCES[String(tutorialEngine.id || "").toLowerCase()] || {};
  const tutorialResource = { ...tutorialResourceRaw, resourceLabel: tutorialResourceRaw.resourceLabelKey ? t(tutorialResourceRaw.resourceLabelKey) : "", videoTitle: tutorialResourceRaw.videoTitleKey ? t(tutorialResourceRaw.videoTitleKey) : "" };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${t("tutorialUi.stepByStep")} ${tutorialEngine.name || selectedModel}`}
      onClick={() => setShowVideoTutorial(false)}
      style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(3,3,8,0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: "min(900px, 100%)", maxHeight: "92vh", overflowY: "auto", background: "#111018", border: "1px solid rgba(168,85,247,0.45)", borderRadius: "18px", boxShadow: "0 25px 80px rgba(0,0,0,0.65)", color: "#f8fafc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", padding: "20px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <div style={{ color: "#c4b5fd", fontSize: "11px", fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase" }}>{t("tutorialUi.academyVideo")}</div>
            <h2 style={{ margin: "6px 0 5px", fontSize: "22px", lineHeight: 1.2 }}>{tutorialEngine.icon || "🎬"} {tutorialEngine.name || selectedModel}</h2>
            <p style={{ margin: 0, color: "#a1a1aa", fontSize: "13px", lineHeight: 1.5 }}>{tutorial.objective}</p>
          </div>
          <button type="button" aria-label={t("tutorialUi.closeTutorial")} onClick={() => setShowVideoTutorial(false)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "9px", width: "36px", height: "36px", cursor: "pointer", fontSize: "20px", flexShrink: 0 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: "8px", padding: "14px 22px 0", flexWrap: "wrap" }}>
          {[["guide", t("line1_tutorial_tab_guide")], ["video", t("line1_tutorial_tab_resources")], ["prompt", t("line1_tutorial_tab_prompts")]].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setVideoTutorialTab(key)} style={{ padding: "9px 12px", borderRadius: "9px", border: videoTutorialTab === key ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.10)", background: videoTutorialTab === key ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)", color: videoTutorialTab === key ? "#e9d5ff" : "#cbd5e1", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: "18px 22px 24px" }}>
          {videoTutorialTab === "guide" && (
            <div>
              <h3 style={{ fontSize: "16px", margin: "0 0 12px" }}>{t("tutorialUi.featuresTitle")}</h3>
              <ul style={{ margin: "0 0 18px", paddingLeft: "22px", display: "grid", gap: "9px", color: "#c4b5fd", fontSize: "13px", lineHeight: 1.6 }}>
                {(tutorial.features || []).map((feature, index) => <li key={`${tutorialEngine.id}-feature-${index}`}>{feature}</li>)}
              </ul>
              <h3 style={{ fontSize: "16px", margin: "0 0 12px" }}>{t("tutorialUi.stepByStep")}</h3>
              <ol style={{ margin: 0, paddingLeft: "22px", display: "grid", gap: "11px", color: "#d4d4d8", fontSize: "14px", lineHeight: 1.6 }}>
                {tutorial.steps.map((step, index) => <li key={`${tutorialEngine.id}-step-${index}`}>{step}</li>)}
              </ol>
              <div style={{ marginTop: "18px", padding: "13px 14px", borderRadius: "11px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.20)", color: "#d8b4fe", fontSize: "13px", lineHeight: 1.55 }}>
                <strong>{t("tutorialUi.tip")}</strong> {t("tutorialUi.modelOptionsMayVary")}
              </div>
            </div>
          )}
          {videoTutorialTab === "video" && (
            <div>
              {tutorialResource.videoId ? (
                <div>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: "12px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <iframe src={`https://www.youtube-nocookie.com/embed/${tutorialResource.videoId}`} title={tutorialResource.videoTitle || `${t("tutorialUi.stepByStep")} ${tutorialEngine.name}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                  </div>
                  <p style={{ color: "#d4d4d8", fontSize: "13px", lineHeight: 1.5 }}>{tutorialResource.videoTitle}</p>
                </div>
              ) : (
                <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📚</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>{t("tutorialUi.resources")}</h3>
                  <p style={{ color: "#a1a1aa", fontSize: "13px", lineHeight: 1.5 }}>{t("tutorialUi.resourcesPending")}</p>
                </div>
              )}
              {tutorialResource.resourceUrl && <p style={{ marginTop: "14px", fontSize: "13px" }}><a href={tutorialResource.resourceUrl} target="_blank" rel="noreferrer" style={{ color: "#c4b5fd" }}>↗ {tutorialResource.resourceLabel || t("tutorialUi.engineDocs")}</a></p>}
            </div>
          )}
          {videoTutorialTab === "prompt" && (
            <div>
              <p style={{ color: "#a1a1aa", fontSize: "13px", lineHeight: 1.5, marginTop: 0 }}>{t("tutorialUi.promptHint")}</p>
              <textarea readOnly value={tutorial.prompt} style={{ width: "100%", minHeight: "190px", resize: "vertical", boxSizing: "border-box", padding: "14px", borderRadius: "11px", background: "#09090f", border: "1px solid rgba(255,255,255,0.13)", color: "#f4f4f5", fontSize: "13px", lineHeight: 1.6 }} />
              <div style={{ display: "flex", gap: "9px", flexWrap: "wrap", marginTop: "12px" }}>
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(tutorial.prompt); setTutorialCopyState(t("tutorialUi.copied")); } catch { setTutorialCopyState(t("tutorialUi.copyUnavailable")); } }} style={{ padding: "10px 13px", borderRadius: "9px", border: "1px solid rgba(168,85,247,0.45)", background: "rgba(168,85,247,0.16)", color: "#e9d5ff", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>{t("tutorialUi.copyPrompt")}</button>
                <button type="button" onClick={() => { setPrompt(tutorial.prompt); setShowVideoTutorial(false); setTutorialCopyState(""); }} style={{ padding: "10px 13px", borderRadius: "9px", border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>{t("tutorialUi.usePrompt")}</button>
              </div>
              {tutorialCopyState && <p role="status" style={{ color: tutorialCopyState === t("tutorialUi.copied") ? "#86efac" : "#fbbf24", fontSize: "12px", marginBottom: 0 }}>{tutorialCopyState}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
})()}

{showImageTutorial && mode === "IMAGE" && (() => {
  const tutorialEngine = engines.find(e => e.name === selectedModel) || { id: selectedModel?.toLowerCase(), name: selectedModel };
  const guide = getImageTutorialGuide(String(tutorialEngine.id || "").toLowerCase(), t);
  return <div role="dialog" aria-modal="true" aria-label={`${t("tutorialUi.stepByStep")} ${tutorialEngine.name || selectedModel}`} onClick={() => setShowImageTutorial(false)} style={{ position: "fixed", inset: 0, zIndex: 20001, background: "rgba(3,3,8,.84)", backdropFilter: "blur(9px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
    <div onClick={e => e.stopPropagation()} style={{ width: "min(820px, 100%)", maxHeight: "92vh", overflowY: "auto", background: "linear-gradient(145deg,#171321,#0d0d14 60%)", border: "1px solid rgba(168,85,247,.4)", borderRadius: 19, boxShadow: "0 25px 90px rgba(0,0,0,.7)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, padding: "20px 22px 17px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ minWidth: 0 }}><div style={{ color: "#c4b5fd", fontSize: 10, fontWeight: 850, letterSpacing: 1.5 }}>{t("tutorialUi.academyImage")}</div><h2 style={{ margin: "7px 0 6px", fontSize: 22, lineHeight: 1.25 }}>{tutorialEngine.icon || "🖼️"} {tutorialEngine.name || selectedModel}</h2><p style={{ margin: 0, color: "#b4b1c1", fontSize: 12, lineHeight: 1.6 }}>{guide.objective}</p></div>
        <button type="button" aria-label={t("tutorialUi.closeTutorial")} onClick={() => setShowImageTutorial(false)} style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#fff", cursor: "pointer", fontSize: 21 }}>×</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "14px 22px 0" }}>
        {[["guide", t("tutorialUi.stepGuide")], ["prompt", t("tutorialUi.promptExample")]].map(([key,label]) => <button key={key} type="button" onClick={() => setImageTutorialTab(key)} style={{ padding: "9px 12px", borderRadius: 10, border: imageTutorialTab === key ? "1px solid rgba(192,132,252,.75)" : "1px solid rgba(255,255,255,.1)", background: imageTutorialTab === key ? "rgba(168,85,247,.18)" : "rgba(255,255,255,.035)", color: imageTutorialTab === key ? "#e9d5ff" : "#c4c4d0", cursor: "pointer", fontSize: 11, fontWeight: 750 }}>{label}</button>)}
      </div>
      <div style={{ padding: "19px 22px 23px" }}>
        {imageTutorialTab === "guide" && <div>
          <div style={{ padding: 13, borderRadius: 12, background: "rgba(168,85,247,.07)", border: "1px solid rgba(168,85,247,.16)", marginBottom: 17 }}><div style={{ color: "#e9d5ff", fontSize: 12, fontWeight: 800, marginBottom: 9 }}>{t("tutorialUi.aboutEngine")}</div><ul style={{ margin: 0, paddingLeft: 19, display: "grid", gap: 7, color: "#d4d4dc", fontSize: 12, lineHeight: 1.55 }}>{guide.features.map((feature,i) => <li key={`img-feature-${i}`}>{feature}</li>)}</ul></div>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>{t("tutorialUi.recommendedSteps")}</h3><ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 11, color: "#d4d4dc", fontSize: 12, lineHeight: 1.65 }}>{guide.steps.map((step,i) => <li key={`img-step-${i}`}>{step}</li>)}</ol>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 19, padding: 13, borderRadius: 12, background: "rgba(34,197,94,.055)", border: "1px solid rgba(34,197,94,.16)" }}><span style={{ color: "#bbf7d0", fontSize: 11, lineHeight: 1.5 }}>{t("tutorialUi.tip")}</span><button type="button" onClick={() => setImageTutorialTab("prompt")} style={{ padding: "9px 11px", border: 0, borderRadius: 9, background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 750, cursor: "pointer" }}>{t("tutorialUi.seeExample")}</button></div>
        </div>}
        {imageTutorialTab === "prompt" && <div><p style={{ color: "#a7a4b5", fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>{t("tutorialUi.imagePromptHint")}</p><textarea readOnly value={guide.prompt} style={{ width: "100%", minHeight: 190, resize: "vertical", boxSizing: "border-box", padding: 14, borderRadius: 12, background: "#08080e", border: "1px solid rgba(255,255,255,.13)", color: "#e9d5ff", fontSize: 12, lineHeight: 1.65 }} /><div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(guide.prompt); setTutorialCopyState(t("tutorialUi.promptCopied")); } catch { setTutorialCopyState(t("tutorialUi.copyUnavailableImage")); } }} style={{ padding: "10px 13px", borderRadius: 10, border: "1px solid rgba(196,181,253,.32)", background: "rgba(168,85,247,.13)", color: "#e9d5ff", cursor: "pointer", fontSize: 11, fontWeight: 750 }}>{t("tutorialUi.copyPrompt")}</button><button type="button" onClick={() => { setPrompt(guide.prompt); setShowImageTutorial(false); setTutorialCopyState(""); }} style={{ padding: "10px 13px", borderRadius: 10, border: 0, background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 750 }}>{t("tutorialUi.usePrompt")}</button></div>{tutorialCopyState && <p role="status" style={{ color: tutorialCopyState === t("tutorialUi.promptCopied") ? "#86efac" : "#fbbf24", fontSize: 11, marginBottom: 0 }}>{tutorialCopyState}</p>}</div>}
        {guide.resourceUrl && <div style={{ marginTop: 17, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 11 }}><a href={guide.resourceUrl} target="_blank" rel="noreferrer" style={{ color: "#c4b5fd", textDecoration: "none" }}>↗ {guide.resourceLabel}</a></div>}
      </div>
    </div>
  </div>;
})()}

{showContactModal && (
  <ContactModal 
    user={user} 
    onClose={() => setShowContactModal(false)} 
  />
)}


    </div>
  );
}

export default App;