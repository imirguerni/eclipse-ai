import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import logoEclipse from './assets/logo-eclipse.jpg';
import logoEclair from './assets/logo-token.jpg';

import Navbar from './Navbar';

// LES LOGOS (Vérifie bien que ces fichiers existent dans src/assets)
import googleLogo from './assets/google-ai.png';
import lumaLogo from './assets/luma.png';
import klingLogo from './assets/kling.png';
import hailuoLogo from './assets/hailuo.png';
import seedanceLogo from './assets/seedance.png';
import fluxLogo from './assets/flux.png';
import geminiLogo from './assets/gemini.png';
import { Link } from 'react-router-dom';


const LandingPage = ({ user, tokens, packTokens, logoEclair, onStart, onLogout, onShowTerms, onShowPrivacy, onShowCgv, onShowLegal, onShowPricing, onPurchase }) => {
  // --- ÉTATS ET LOGIQUE (BIEN À L'INTÉRIEUR DU COMPOSANT) ---
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [startEndIndex, setStartEndIndex] = useState(0);
  const [captureIndex, setCaptureIndex] = useState(0); 
  const [displayedText, setDisplayedText] = useState("");
  // ... garde tout le reste de tes states comme ils sont

  const nextStartEnd = () => {
    setStartEndIndex((prev) => (prev === startEndLibrary.length - 1 ? 0 : prev + 1));
  };

  const prevStartEnd = () => {
    setStartEndIndex((prev) => (prev === 0 ? startEndLibrary.length - 1 : prev - 1));
  };

  // Ajout des fonctions pour Capture Control
  const nextCapture = () => {
    setCaptureIndex((prev) => (prev === captureControlLibrary.length - 1 ? 0 : prev + 1));
  };

  const prevCapture = () => {
    setCaptureIndex((prev) => (prev === 0 ? captureControlLibrary.length - 1 : prev - 1));
  };

// NE RAJOUTE PAS D'AUTRES "import React" EN DESSOUS !
const backgroundVideoUrl = "/videos/extrait1.mp4"; 

const heroVideos = [
  { id: 1, videoUrl: "/videos/caméra.mp4", prompt: "Scène ultra-réaliste : un homme s'approche d'un bonhomme de neige et, soudain, un chat surgit et l'attaque au visage...", model: "IA", time: "4.2s" },
  { id: 2, videoUrl: "/videos/zombies.mp4", prompt: "Scène ultra-réaliste de zombies dans les rues de New York...", model: "IA", time: "3.8s" },
  { id: 3, videoUrl: "/videos/anime2.mp4", prompt: "Un anime style, fille aux cheveux roses courts assise à table avec un verre de jus d'orange et une part de gâteau aux fraises.", model: "IA", time: "4s" },

];

const replaceLibrary = [
  {
  id: 1,
    title: "La liberté créative absolue",
    desc: "Remplacer n’importe quel objet devient un jeu d'enfant. Importez votre photo, décrivez votre vision, et l'IA génère un rendu réaliste en quelques secondes. Plus besoin d'outils complexes : votre imagination est la seule limite.",
    prompt: "Retire le chat en arriere plan",
    source: "/videos/12.jpg",
    result: "/videos/11.jpg"
  },
  {
    id: 2,
    title: "Design d'intérieur : Mobilier IA",
    desc: "Réinventez votre espace sans effort. Remplacez un vieux meuble par une pièce moderne en gardant l'éclairage naturel.",
    prompt: "Retire la paille et le citron.",
    source: "/videos/13.jpg", // Change par tes noms de fichiers
    result: "/videos/14.jpg"
  },
  {
    id: 3,
    title: "Automobile : Personnalisation",
    desc: "Visualisez n'importe quelle modification sur un véhicule. Changez la couleur ou les jantes avec une précision chirurgicale.",
    prompt: "Retire la pelle",
    source: "/videos/15.jpg", // Change par tes noms de fichiers
    result: "/videos/16.jpg"
  }
];
  {/* ======================================================== */}
      {/*motion control*/}
   {/* ======================================================== */}

const captureControlLibrary = [
  {
    id: 1,
    title: "Contrôle précis des mouvements de caméra",
    desc: "Définissez des trajectoires de caméra fluides (zoom, panoramique, travelling) pour donner une dimension professionnelle à vos scènes.",
    prompt: "Anime entre 2 images.",
    source: "/videos/model.png", // Remplace par tes chemins d'images/sources
    motionVid: "/videos/mouvement2.mp4",
    result: "/videos/mouvement1.mp4"

  }
];


   {/* ======================================================== */}
      {/* image de debut et de fin */}
   {/* ======================================================== */}
const startEndLibrary = [
  {
    id: 1,
    title: "Cohérence totale du début à la fin",
    desc: "Définissez une image de départ et une image de fin. L'IA génère toute la transition fluide entre les deux cadres pour un contrôle artistique absolu.",
    prompt: "Transition fluide entre 2 images. Camera en mouvement, elle avance jusqu'a sa victime.",
    startImg: "/videos/tueuse1.png", // Remplace par tes chemins d'images
    endImg: "/videos/tueuse2.png",     // Remplace par tes chemins d'images
    resultVid: "/videos/tueuse3.mp4"
  },
  {
    id: 2,
    title: "Métamorphose fluide",
    desc: "Guidez l'évolution d'un personnage ou d'un décor d'un état A à un état B sans rupture visuelle.",
    prompt: "Transition entre deux images : elle discute complètement bourrée, et puis elle fait une grimasse et vomit.",
    startImg: "/videos/femme1.png",
    endImg: "/videos/femme2.png",
    resultVid: "/videos/femme3.mp4"
      },
  {
    id: 3,
    title: "Métamorphose fluide",
    desc: "Guidez l'évolution d'un personnage ou d'un décor d'un état A à un état B sans rupture visuelle.",
    prompt: "Transition entre deux images : elle se met en position de combat",
    startImg: "/videos/combat1.png",
    endImg: "/videos/combat2.png",
    resultVid: "/videos/combat3.mp4"
  }
];
   {/* ======================================================== */}
      {/* image de debut */}
   {/* ======================================================== */}

const imageToVideoLibrary = [
  { 
    id: 1, 
    img: "/videos/videoimage.jpg", 
    vid: "/videos/videoimage.mp4",
    prompt: "Le crabe qui dance." 
  },
  { 
    id: 2, 
    img: "/videos/autre-video.jpg", 
    vid: "/videos/autre-video.mp4",
    prompt: "Une femme désorientée, au regard égaré, semblant perdue." 
  },
  { 
    id: 3, 
    img: "/videos/encore-une.jpg", 
    vid: "/videos/encore-une.mp4",
    prompt: "Travelling avant jusqu’au gros plan du visage de la femme, qui semble exténuée." 
     },
  { 
    id: 4, 
    img: "/videos/punk1.png", 
    vid: "/videos/punk2.mp4",
    prompt: "anime cette image : elle fume et regarde la camera" 
  },
];

const faqData = [
  {
    question: "Qu'est-ce que Eclipse et comment ça fonctionne ?",
    answer: "Eclipse est un studio de création propulsé par l'IA qui transforme vos idées en œuvres cinématographiques. Nous utilisons une architecture hybride combinant les meilleurs moteurs de génération actuels avec notre propre technologie d'optimisation pour garantir une fluidité et une esthétique professionnelle."
  },
  {
    question: "Ai-je besoin de compétences techniques pour utiliser Eclipse ?",
    answer: "Absolument pas. Eclipse a été conçu pour simplifier la création. Il vous suffit de décrire votre scène ou d'importer une image, et notre interface s'occupe de configurer les réglages complexes des moteurs pour générer un résultat de haute qualité."
  },
  {
    question: "Quels sont les moteurs de génération utilisés ?",
    answer: "Plutôt que de nous limiter à un seul modèle, Eclipse sélectionne dynamiquement le moteur le plus performant selon votre demande. Que ce soit pour un rendu cinématographique, de l'animation stylisée ou des mouvements de caméra complexes, nous exploitons la puissance des moteurs leaders du marché pour vous offrir le meilleur résultat possible."
  },
  {
    question: "Les vidéos générées m'appartiennent-elles ?",
    answer: "Oui, vous détenez l'intégralité des droits sur les contenus créés avec Eclipse. Vous pouvez les utiliser pour vos réseaux sociaux, vos publicités ou vos projets personnels sans aucune restriction."
  },
  {
    question: "Quelle est la durée maximale des vidéos ?",
    answer: "Actuellement, vous pouvez générer des clips allant de 4 à 15 secondes. Grâce à notre fonction d'extension, vous pouvez ensuite prolonger ces séquences pour créer des récits plus longs tout en conservant une cohérence visuelle parfaite."
  }
];

  const [mousePos, setMousePos] = useState({ x: 50, y: 120 }); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [tick, setTick] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [libIndex, setLibIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPricing, setShowPricing] = useState(false);  

// --- NOUVEL ÉTAT POUR LA SECTION SOCIAL MEDIA ---
  const [socialIndex, setSocialIndex] = useState(0);

  const nextSocial = () => {
    setSocialIndex((prev) => (prev === replaceLibrary.length - 1 ? 0 : prev + 1));
  };

  const prevSocial = () => {
    setSocialIndex((prev) => (prev === 0 ? replaceLibrary.length - 1 : prev - 1));
  };

  const nextExample = () => {
    setLibIndex((prev) => (prev === imageToVideoLibrary.length - 1 ? 0 : prev + 1));
  };

  const prevExample = () => {
    setLibIndex((prev) => (prev === 0 ? imageToVideoLibrary.length - 1 : prev - 1));
  };

  const showcaseVideos = [
  { id: 101, videoUrl: "/videos/3d.mp4", prompt: "Cyberpunk street market..." },
  { id: 102, videoUrl: "/videos/anime.mp4", prompt: "Anime landscape..." },
  { id: 103, videoUrl: "/videos/musée.mp4", prompt: "Macro nature shot..." },
  { id: 104, videoUrl: "/videos/Astronaute.mp4", prompt: "Astronaut floating in nebula..." },
  { id: 105, videoUrl: "/videos/ocean.mp4", prompt: "Deep sea glowing jellyfish..." }
];
const motionVideoRef = React.useRef(null);
  const resultVideoRef = React.useRef(null);

  // Synchronisation et pilotage rigoureux des deux vidéos
  useEffect(() => {
    const motionEl = motionVideoRef.current;
    const resultEl = resultVideoRef.current;

    if (!motionEl || !resultEl) return;

    // Fonction pour lancer la lecture de pair
    const playBoth = () => {
      motionEl.currentTime = 0;
      resultEl.currentTime = 0;
      motionEl.play().catch(() => {});
      resultEl.play().catch(() => {});
    };

    // Lancement initial dès que les métadonnées sont chargées
    motionEl.onloadedmetadata = playBoth;
    resultEl.onloadedmetadata = playBoth;

    if (motionEl.readyState >= 1 && resultEl.readyState >= 1) {
      playBoth();
    }

    // Correction en direct si un décalage de plus de 0.1s survient pendant la lecture
    const handleTimeUpdate = () => {
      if (Math.abs(motionEl.currentTime - resultEl.currentTime) > 0.1) {
        resultEl.currentTime = motionEl.currentTime;
      }
    };

    // Remise à zéro synchronisée en fin de boucle
    const handleLoop = () => {
      motionEl.currentTime = 0;
      resultEl.currentTime = 0;
      motionEl.play().catch(() => {});
      resultEl.play().catch(() => {});
    };

    motionEl.addEventListener('timeupdate', handleTimeUpdate);
    motionEl.addEventListener('ended', handleLoop);

    return () => {
      if (motionEl) {
        motionEl.removeEventListener('timeupdate', handleTimeUpdate);
        motionEl.removeEventListener('ended', handleLoop);
        motionEl.onloadedmetadata = null;
      }
      if (resultEl) {
        resultEl.onloadedmetadata = null;
      }
    };
  }, [captureIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === showcaseVideos.length - 1 ? 0 : prev + 1));
    }, 4000); // Change toutes les 4 secondes
    
    
    return () => clearInterval(timer);
  }, []);

  // --- 2. LOGIQUE DE L'ANIMATION DU HAUT (Hero Prompt) ---
  useEffect(() => {
    let isMounted = true; 
    let i = 0;
    const fullText = heroVideos[currentIndex].prompt;
    
    setDisplayedText(""); 
    setMousePos({ x: 50, y: 120 });
    setIsGenerating(false);
    
    const typingInterval = setInterval(() => {
      if (!isMounted) return;
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      
      if (i >= fullText.length) {
        clearInterval(typingInterval);
        
        setTimeout(() => {
          if (!isMounted) return;
          setMousePos({ x: 92, y: 50 }); 

          setTimeout(() => {
            if (!isMounted) return;
            setIsGenerating(true); 

            setTimeout(() => {
              if (!isMounted) return;
              setIsGenerating(false); 

              setTimeout(() => {
                if (!isMounted) return;
                setCurrentIndex((prev) => (prev === heroVideos.length - 1 ? 0 : prev + 1));
                setTick(prev => prev + 1); 
              }, 500); 

            }, 3500); 
          }, 800);
        }, 100);
      }
    }, 20);

    return () => {
      isMounted = false;
      clearInterval(typingInterval);
    };
  }, [currentIndex, tick]);

  return (
    <div className="landing-container">
      <div className="main-glow"></div>  
<header className="hero">
  <div className="hero-badge">seedance 2.0 disponible</div>
  
                
  <h1 className="hero-title">
    Créez en un instant. <br />
    
  </h1>
 
  <p className="hero-subtitle">
    Transformez vos idées en visuels cinématographiques de haute qualité 
    grâce à la puissance de l'intelligence artificielle générative.
  </p>       
        
        <button className="main-launch-btn" onClick={onStart}>Générer 🚀</button>

        <div className="video-showcase-container">
          <div className="hero-mockup-modern">
            <video src={backgroundVideoUrl} autoPlay muted playsInline loop className="main-video" />
          </div>

          <div className="video-reflection"></div>

          <div className="prompt-showcase">
          {/* --- 2ème TITRE (Dans la section prompt-showcase) --- */}
<div className="prompt-header">
  <h2 className="prompt-main-title">
    Du texte à l'image <span className="purple-glow-text">cinématique</span>
  </h2>
  <p className="prompt-subtitle">L'IA interprète chaque détail de votre imagination.</p>
</div>

            <div className="prompt-content-wrapper">
              <div className="demo-pagination">
                {heroVideos.map((_, index) => (
                  <div key={index} className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}></div>
                ))}
              </div>

              <div className="prompt-input-bar">
                <div className="virtual-cursor" style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}>
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M5 2l12 12-4 1 3 5-2 1-3-5-4 4V2z" fill="white" stroke="black" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="prompt-typing-area">
                  <span className="ai-icon">✦</span>
                  <p className="typing-text">{displayedText}<span className="cursor">|</span></p>
                </div>
                <button className={`generate-pill-btn ${isGenerating ? 'active-click' : ''}`}>Generate ✨</button>
              </div>

              <div className={`video-result-preview ${isGenerating ? 'visible' : ''}`}>
                <video 
                  key={`preview-${currentIndex}`} 
                  src={heroVideos[currentIndex].videoUrl} 
                  autoPlay muted loop playsInline
                />
              </div>
              
              <div className="prompt-footer-info">
                <span className="dot-pulse"></span>
                <span>Modèle : <span className="text-purple">{heroVideos[currentIndex].model}</span></span>
                <span className="separator"> | </span>
                <span>Rendu : <span className="text-white">{heroVideos[currentIndex].time}</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>
{/* SÉPARATEUR EN V - EFFET LASER DYNAMIQUE */}
<div className="section-divider-v">
  <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
    <defs>
      {/* Dégradé pour que les bords soient sombres et le centre éclatant */}
      <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="50%" stopColor="#a855f7" /> {/* Violet intense au centre */}
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    
    {/* La forme noire du fond */}
    <path d="M0 0 L720 80 L1440 0 V100 H0 Z" fill="#000000" />
    
    {/* La ligne laser avec le dégradé appliqué */}
    <path 
      d="M0 0 L720 80 L1440 0" 
      stroke="url(#laserGradient)" 
      strokeWidth="2"
      fill="none"
      className="laser-line"
    />
  </svg>
</div>
      {/* 1. SECTION VIDEOS (SHOWCASE) */}
      <section className="showcase-section">
        <div className="showcase-header">
          <p className="showcase-subtitle">
            Votre texte devient réalité. Créez des vidéos captivantes instantanément grâce à la puissance de l'IA.
          </p>
        </div>

        <div className="slider-container">
          <div className="slider-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
            {showcaseVideos.map((video, index) => (
              <div key={video.id} className={`slide-item ${index === activeSlide ? 'focused' : ''}`}>
                <video src={video.videoUrl} autoPlay muted loop playsInline />
              </div>
            ))}
          </div>
        </div>
      </section>
   {/* PREMIER TRAIT LASER - ÉCLAT RENFORCÉ */}
<div className="section-line-divider">
  <svg viewBox="0 0 1440 20" preserveAspectRatio="none" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="mainLaserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="40%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
      <filter id="laserBlur">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect 
      x="0" 
      y="9" 
      width="1440" 
      height="2" 
      fill="url(#mainLaserGradient)" 
      filter="url(#laserBlur)"      
    />
  </svg>
</div>

 {/* --- SECTION IMAGE TO VIDEO --- */}
    <section className="image-to-video-section">
      <div className="img-vid-container">
        {/* TITRE HARMONISÉ (Même taille que les autres) */}
        <div className="social-footer-text section-spacing">
          <h2 className="social-main-title fade-in-up">
            De l'image à la <span className="purple-glow-text">vidéo cinématique</span>
          </h2>
          <p className="social-subtitle fade-in-up-delay">
            Importez vos visuels et laissez l'IA insuffler la vie à vos idées.
          </p>
        </div>

        <div className="library-slider-wrapper">
          <button className="lib-nav-btn" onClick={prevExample}>‹</button>
          <div className="deevid-style-wrapper">
            <div className="media-comparison-row">
              <div className="comparison-column">
                <div className="compare-box">
                  <div className="box-label">IMAGE SOURCE</div>
                  <img key={`img-${libIndex}`} src={imageToVideoLibrary[libIndex].img} alt="Source" className="compare-media animated-media" />
                </div>
              </div>
              <div className="compare-separator"><div className="sep-icon">»</div></div>
              <div className="comparison-column">
                <div className="compare-box">
                  <div className="box-label">RÉSULTAT IA</div>
                  <video key={`vid-${libIndex}`} src={imageToVideoLibrary[libIndex].vid} autoPlay muted loop playsInline className="compare-media animated-media" />
                </div>
              </div>
            </div>
            <div className="prompt-instruction-container">
              <div className="prompt-pill-display">
                <span className="prompt-badge">PROMPT</span>
                <p key={`txt-${libIndex}`} className="instruction-text-styled fade-in-text">
                  "{imageToVideoLibrary[libIndex].prompt}"
                </p>
              </div>
            </div>
          </div>
          <button className="lib-nav-btn" onClick={nextExample}>›</button>
        </div>
        <div className="lib-counter">{libIndex + 1} / {imageToVideoLibrary.length}</div>
      </div>
    </section>

    {/* --- SÉPARATEUR LASER EN V --- */}
    <div className="section-divider-v bottom-transition">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="laserGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#a855f7" /> 
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M0 0 L720 80 L1440 0" stroke="url(#laserGradientBottom)" strokeWidth="3" fill="none" className="laser-line" />
      </svg><div className="laser-glow-dot"></div>
    </div>

{/* --- SECTION CAPTURE CONTROL --- */}
<section className="image-to-video-section" style={{ marginTop: '60px' }}>
  <div className="img-vid-container">
    
    <div className="social-footer-text section-spacing" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 className="social-main-title fade-in-up">
        {captureControlLibrary[captureIndex].title}
      </h2>
      <p className="social-subtitle fade-in-up-delay">
        {captureControlLibrary[captureIndex].desc}
      </p>
    </div>

    <div className="library-slider-wrapper">
      <div className="deevid-style-wrapper">
        <div className="media-comparison-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* 1. Image Source */}
          <div className="comparison-column">
            <div className="compare-box">
              <div className="box-label">IMAGE SOURCE</div>
              <img 
                key={`cap-src-${captureIndex}`} 
                src={captureControlLibrary[captureIndex].source} 
                alt="Source" 
                className="compare-media animated-media" 
              />
            </div>
          </div>

          <div className="compare-separator"><div className="sep-icon">+</div></div>

          {/* 2. Modèle de mouvement (Synchro avec ref) */}
          <div className="comparison-column">
            <div className="compare-box">
              <div className="box-label">MODÈLE DE MOUVEMENT</div>
              <video 
                ref={motionVideoRef}
                key={`cap-motion-${captureIndex}`} 
                src={captureControlLibrary[captureIndex].motionVid} 
                autoPlay muted loop playsInline 
                className="compare-media animated-media" 
              />
            </div>
          </div>

          <div className="compare-separator"><div className="sep-icon">»</div></div>

          {/* 3. Résultat Final (Synchro avec ref) */}
          <div className="comparison-column">
            <div className="compare-box">
              <div className="box-label">RÉSULTAT CAMÉRA CONTROL</div>
              <video 
                ref={resultVideoRef}
                key={`cap-res-${captureIndex}`} 
                src={captureControlLibrary[captureIndex].result} 
                autoPlay muted loop playsInline 
                className="compare-media animated-media" 
              />
            </div>
          </div>

        </div>

        <div className="prompt-instruction-container" style={{ marginTop: '20px' }}>
          <div className="prompt-pill-display">
            <span className="prompt-badge">PROMPT</span>
            <p key={`cap-txt-${captureIndex}`} className="instruction-text-styled fade-in-text">
              "{captureControlLibrary[captureIndex].prompt}"
            </p>
          </div>
        </div>
      </div>

    </div>

    {captureControlLibrary.length > 1 && (
      <div className="lib-counter" style={{ margin: '15px auto 0', width: 'fit-content', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#a855f7', fontWeight: 'bold' }}>
        Exemple {captureIndex + 1} / {captureControlLibrary.length}
      </div>
    )}

  </div>
</section>

{/* --- SECTION SOCIAL MEDIA & REMPLACEMENT IA --- */}
    <section className="social-media-section" style={{ marginTop: '80px' }}>
      <div className="social-content">
        
        {/* TITRE PRINCIPAL DE LA SECTION */}
        <div className="social-footer-text" style={{ marginBottom: '60px' }}>
          <h2 className="social-main-title fade-in-up">
            Réinventez vos photos : Remplacez n'importe quel objet <span className="purple-glow-text">instantanément</span>
          </h2>
          <p className="social-subtitle fade-in-up-delay">
            Essayez l’outil IA pour effacer et remplacer un objet indésirable par l’élément de votre choix.
          </p>
        </div>

        {/* BLOC INTERACTIF : VISUEL + TEXTE DYNAMIQUE */}
        <div className="social-feature-layout">
          
          {/* CÔTÉ GAUCHE : LES VISUELS (CHANGENT AVEC L'INDEX) */}
          <div className="social-visual-side">
            <button className="lib-nav-btn" onClick={prevSocial}>‹</button>

            <div className="mobile-mockup-container">
              <div className="mobile-card source-card">
                <img 
                  key={`src-${socialIndex}`}
                  src={replaceLibrary[socialIndex].source} 
                  className="mobile-img animated-media" 
                />
                <div className="card-badge">SOURCE</div>
                <div className="floating-mini-prompt">
                  "{replaceLibrary[socialIndex].prompt}"
                </div>
              </div>

              <div className="mobile-card result-card">
                <img 
                  key={`res-${socialIndex}`}
                  src={replaceLibrary[socialIndex].result} 
                  className="mobile-img animated-media" 
                />
                <div className="card-badge purple">RÉSULTAT IA</div>
              </div>
            </div>

            <button className="lib-nav-btn" onClick={nextSocial}>›</button>
          </div>

          {/* CÔTÉ DROIT : LE TEXTE (CHANGE AUSSI AVEC L'INDEX) */}
          <div className="social-text-side">
            <h3 className="feature-main-title" key={`title-${socialIndex}`}>
              {replaceLibrary[socialIndex].title}
            </h3>
            <p className="feature-description" key={`desc-${socialIndex}`}>
              {replaceLibrary[socialIndex].desc}
            </p>
            
           <div className="lib-counter" style={{ 
    width: 'fit-content',    
    marginRight: 'auto',     
    display: 'block',        
    padding: '8px 20px',    
    borderRadius: '25px',   
    border: '1px solid rgba(168, 85, 247, 0.3)', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    marginBottom: '20px', 
    color: '#a855f7', 
    fontWeight: 'bold',
    fontSize: '0.9rem'
}}>
  Modèle {socialIndex + 1} / {replaceLibrary.length}
</div>

            <button className="neon-download-btn" onClick={onStart}>
              Générer ✨
            </button>
          </div>
        </div>

       {/* TITRE DE FIN DE SECTION */}
        <div className="social-footer-text" style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <h2 className="social-main-title fade-in-up">
            Dominez l'attention sur les <span className="purple-glow-text">réseaux sociaux</span>
          </h2>
          <p className="social-subtitle fade-in-up-delay">
            Transformez vos idées en contenus viraux optimisés pour TikTok et Instagram.
          </p>

          {/* --- BLOC DES MINIATURES --- */}
          <div className="tiktok-scroll-container">
            <div className="tiktok-track">
              {[1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7].map((id, index) => (
                <div key={index} className="tiktok-miniature">
                  <video 
                    src={`/videos/tiktok-${id}.mp4`} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    preload="metadata"
                    className="tiktok-video-element"
                  />
                </div>
              ))}
            </div>
          </div>

          <button className="neon-download-btn" onClick={onStart} style={{ marginTop: '40px' }}>
            Générer ✨
          </button>
        </div>
      </div>
    </section>

{/* TRAIT LASER FAQ - ÉCLAT MAXIMUM */}
<div className="section-line-divider faq-divider">
  <svg viewBox="0 0 1440 20" preserveAspectRatio="none" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="faqLaserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="40%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#ffffff" /> 
        <stop offset="60%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
      <filter id="glowFAQ">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect 
      x="0" 
      y="9" 
      width="1440" 
      height="2" 
      fill="url(#faqLaserGradient)" 
      filter="url(#glowFAQ)" 
    />
  </svg>
</div>

{/* --- Section Moteurs --- */}
<section className="engines-section" style={{ padding: '100px 0 60px' }}>
  <div className="engines-container">
    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
      <span style={{ 
        color: '#a855f7', 
        textTransform: 'uppercase', 
        fontSize: '0.85rem', 
        fontWeight: '700', 
        letterSpacing: '3px',
        display: 'block',
        marginBottom: '15px'
      }}>
        Technologie de pointe
      </span>
      
      <h3 className="engines-title" style={{ 
        fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
        fontWeight: '900',
        lineHeight: '1.1',
        margin: '0 auto',
        maxWidth: '800px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #666666 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))'
      }}>
        Propulsé par les moteurs <br/> les plus avancés au monde
      </h3>
      
      <div style={{ 
        width: '60px', 
        height: '4px', 
        background: '#a855f7', 
        margin: '30px auto 0',
        borderRadius: '2px'
      }}></div>
    </div>

    <div className="engines-grid">
      {[
        { id: "veo", name: "Google Veo 3", logo: typeof googleLogo !== 'undefined' ? googleLogo : null, type: "VIDEO" },
        { id: "seedance", name: "Seedance 2.0", logo: typeof seedanceLogo !== 'undefined' ? seedanceLogo : null, type: "HYBRIDE" },
        { id: "kling", name: "Kling 3.0", logo: typeof klingLogo !== 'undefined' ? klingLogo : null, type: "VIDEO" },
        { id: "hailuo", name: "Hailuo AI", logo: typeof hailuoLogo !== 'undefined' ? hailuoLogo : null, type: "VIDEO" },
        { id: "luma", name: "Luma Dream Machine", logo: typeof lumaLogo !== 'undefined' ? lumaLogo : null, type: "VIDEO" },
        { id: "flux", name: "Flux Schnell", logo: typeof fluxLogo !== 'undefined' ? fluxLogo : null, type: "IMAGE" },
        { id: "gemini", name: "Gemini 1.5 Pro", logo: typeof geminiLogo !== 'undefined' ? geminiLogo : null, type: "TEXTE" }
      ].map((engine) => (
        <div 
          className="engine-card" 
          key={engine.id} 
          onClick={onStart} 
          style={{ 
            padding: '15px', 
            height: '260px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = '#a855f7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >         
          <div className="engine-logo-wrapper" style={{ width: '100%', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '10px' }}>
            <img 
              src={engine.logo || "https://api.dicebear.com/7.x/shapes/svg?seed=" + engine.id} 
              alt={engine.name} 
              style={{ width: '100%', height: '100%', maxWidth: '160px', maxHeight: '120px', objectFit: 'contain' }}
              onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=" + engine.id; }}
            />
          </div>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <span className="engine-name" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '0.95rem' }}>
              {engine.name || engine.id.toUpperCase()}
            </span>
            <span className={`engine-type-badge ${engine.type.toLowerCase()}`}>
              {engine.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* --- SECTION FAQ --- */}
<section className="faq-section">
  <div className="faq-container">
    <h2 className="social-main-title">Foire Aux <span className="purple-glow-text">Questions</span></h2>
    
    <div className="faq-list">
      {faqData.map((item, index) => (
        <div 
          key={index} 
          className={`faq-item ${openFaq === index ? 'active' : ''}`}
          onClick={() => setOpenFaq(openFaq === index ? null : index)}
        >
          <div className="faq-question">
            <span>{item.question}</span>
            <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
          </div>
          <div className={`faq-answer ${openFaq === index ? 'show' : ''}`}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* --- FOOTER --- */}
<footer className="footer-section">
  <div className="footer-container">
    <div className="footer-content">
      <div className="footer-brand">
        <img src={logoEclipse} alt="Eclipse Logo" className="footer-logo" />
        <p className="footer-tagline">L'excellence cinématique accessible à tous.</p>
      </div>
      
      <div className="footer-links">
        <div className="footer-col">
          <h4>Outils</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); onStart("IMAGE"); }}>Du texte à l'image</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onStart("VIDEO"); }}>De l'image à la vidéo</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onStart("VIDEO"); }}>Générer</a>
        </div>
        <div className="footer-col">
          <h4>Entreprise</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); onShowTerms && onShowTerms(); }}>Conditions d'Utilisation</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onShowPrivacy && onShowPrivacy(); }}>Politique de Confidentialité</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onShowCgv && onShowCgv(); }}>Conditions Générales de Vente</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onShowLegal && onShowLegal(); }}>Mentions Légales</a>
          
          <a href="#" onClick={(e) => { 
            e.preventDefault(); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.scrollTo({ top: 0, behavior: 'smooth' });
            const mainContent = document.querySelector('.main-content');
            if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.scrollTo({ top: 0, behavior: 'smooth' });
            const landingContainer = document.querySelector('.landing-container');
            if (landingContainer) landingContainer.scrollTo({ top: 0, behavior: 'smooth' });
            const mainViewport = document.querySelector('.main-viewport');
            if (mainViewport) mainViewport.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            Revenir en haut
          </a>

          <a href="#" onClick={(e) => { 
            e.preventDefault(); 
            if (typeof onShowPricing === 'function') onShowPricing(); 
          }}>
            Tarifs
          </a>
        </div>
        <div className="footer-col">
          <h4>Communauté</h4>
          <a href="https://www.instagram.com/eclipse.studio.ia?igsi=cWlqZHM0cmFhdnN0" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </div>
    
    <div className="footer-bottom">
      <p>© 2026 Eclipse AI. Tous droits réservés.</p>
      <span className="api-mention">Propulsé par les moteurs de génération leaders du marché.</span>
    </div>
  </div>
</footer>
</div> 

);
};

export default LandingPage;