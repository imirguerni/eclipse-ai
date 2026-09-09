import React, { useState, useEffect } from 'react';
import femmeBg from './assets/Femme.png'; 
import * as ort from 'onnxruntime-web'; 

// Configuration globale d'ONNX Runtime pour optimiser agressivement le WebGPU
ort.env.webgpu.powerPreference = "high-performance";

// 1. Fonction de conversion SOURCING (Canvas -> Tenseur IA)
function imageDataToTensor(imageData, width, height) {
  const { data } = imageData; 
  const floatData = new Float32Array(width * height * 3);
  
  let rIndex = 0;
  let gIndex = width * height;
  let bIndex = width * height * 2;
  
  for (let i = 0; i < data.length; i += 4) {
    floatData[rIndex++] = data[i] / 255.0;     // R
    floatData[gIndex++] = data[i + 1] / 255.0; // V
    floatData[bIndex++] = data[i + 2] / 255.0; // B
  }
  
  return new ort.Tensor('float32', floatData, [1, 3, height, width]);
}

// 2. Fonction de conversion SORTIE avec FILTRE MODERN COULEUR (Tenseur IA -> Canvas)
function tensorToImageData(outputTensor, width, height, forceRecolor) {
  const floatData = outputTensor.data; 
  const imageData = new ImageData(width, height);
  const { data } = imageData; 
  
  let rIndex = 0;
  let gIndex = width * height;
  let bIndex = width * height * 2;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = floatData[rIndex] !== undefined ? floatData[rIndex++] * 255 : 0;
    let g = floatData[gIndex] !== undefined ? floatData[gIndex++] * 255 : 0;
    let b = floatData[bIndex] !== undefined ? floatData[bIndex++] * 255 : 0;

    // 🎨 LE FILTRE MODERNE COULEUR (S'active si la case est cochée)
    if (forceRecolor) {
      r = Math.pow(Math.max(0, r) / 255, 0.82) * 255 * 1.15;
      g = Math.pow(Math.max(0, g) / 255, 0.82) * 255 * 1.15;
      b = Math.pow(Math.max(0, b) / 255, 0.78) * 255 * 1.10; 
    }

    data[i]     = Math.min(255, Math.max(0, r)); 
    data[i + 1] = Math.min(255, Math.max(0, g)); 
    data[i + 2] = Math.min(255, Math.max(0, b)); 
    data[i + 3] = 255; 
  }
  
  return imageData;
}

export default function DevelopersPage() {
  // --- ÉTATS DU MODULE LOCAL (WebGPU) ---
  const [videoFile, setVideoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [options, setOptions] = useState({
    upscale: '1080p',
    recolor: false,
    fpsBoost: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // 🌟 POP-UP DE SUCCÈS DESIGN
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Instance globale du modèle ONNX session et gestionnaire d'erreurs
  const [session, setSession] = useState(null);
  const [modelLoadingError, setModelLoadingError] = useState(false);

  // Chargement asynchrone du modèle au montage de la page
useEffect(() => {
    async function loadModel() {
      const modelUrl = `${window.location.origin}/model.onnx`;
      const dataUrl = `${window.location.origin}/model.onnx.data`;

      // ⚙️ CONFIGURATION GLOBALE D'ONNX POUR LE MODE CPU (WASM)
      ort.env.wasm.numThreads = 2; // Limite à 2 cœurs pour éviter de saturer le PC à 100%
      ort.env.wasm.proxy = true;      // Déporte les calculs dans un Web Worker (évite le freeze à 46%)

      try {
        console.log("⏳ Initialisation du modèle intelligent WebGPU...");
        
        const inferenceSession = await ort.InferenceSession.create(modelUrl, {
          executionProviders: ['webgpu'],
          externalData: [
            { path: 'model.onnx.data', data: dataUrl }
          ]
        });
        setSession(inferenceSession);
        console.log("✅ IA prête sur le GPU local.");
      } catch (e) {
        console.warn("Échec du chargement WebGPU (normal sur GT 440), bascule sur CPU optimisé (WASM) :", e);
        try {
          const inferenceSession = await ort.InferenceSession.create(modelUrl, {
            executionProviders: ['wasm'],
            // 🔥 Optimisations pour que le CPU ne lâche pas en cours de route
            executionMode: 'sequential',
            graphOptimizationLevel: 'all',
            externalData: [
              { path: 'model.onnx.data', data: dataUrl }
            ]
          });
          setSession(inferenceSession);
          console.log("✅ IA prête sur le CPU (WASM) et stabilisée.");
        } catch (err) {
          console.error("Erreur critique d'initialisation ONNX :", err);
          setModelLoadingError(true);
        }
      }
    }
    loadModel();
  }, []);

  // Gestion du Drag & Drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) { setVideoFile(file); }
  };
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  // --- LE MOTEUR 
  console.log(document.getElementById('canvasOutput'))
  
const startLocalProcessing = async () => {
  if (!videoFile || !session) return;
  setIsProcessing(true);
  setProgress(1);

  try {
    const videoElement = document.getElementById('videoSource');
    const outputCanvas = document.getElementById('canvasOutput');
    const outputCtx = outputCanvas.getContext('2d');
    
    videoElement.src = URL.createObjectURL(videoFile);
    videoElement.muted = true;
    await videoElement.play();

    outputCanvas.width = 1280;
    outputCanvas.height = 960;

    const analyzeCanvas = document.createElement('canvas');
    analyzeCanvas.width = 640;
    analyzeCanvas.height = 480;
    const analyzeCtx = analyzeCanvas.getContext('2d');

    const processNextFrame = async () => {
      // 1. Vérification d'arrêt : Si mis en pause ou terminé
      if (videoElement.paused) {
        setIsProcessing(false);
        return;
      }

      // 2. Traitement de la frame
      analyzeCtx.drawImage(videoElement, 0, 0, 640, 480);
      const frameData = analyzeCtx.getImageData(0, 0, 640, 480);
      
      const inputTensor = imageDataToTensor(frameData, 640, 480);
      const outputMap = await session.run({ input: inputTensor });
      
      const finalFrame = tensorToImageData(outputMap.output, 1280, 960, options.recolor);
      outputCtx.putImageData(finalFrame, 0, 0);

      inputTensor.dispose();
      outputMap.output?.dispose();

      // 3. Calcul progression
      const pct = Math.floor((videoElement.currentTime / videoElement.duration) * 100);
      setProgress(Math.min(pct, 100));

      // 4. Condition de fin : Si on est arrivé au bout
      if (videoElement.ended || pct >= 99) {
        videoElement.pause();
        setIsProcessing(false);
        setProgress(100);
        setShowSuccessModal(true);
        return; // On arrête la boucle
      }

      // 5. Continuer la boucle
      if (videoElement.requestVideoFrameCallback) {
        videoElement.requestVideoFrameCallback(processNextFrame);
      } else {
        requestAnimationFrame(processNextFrame);
      }
    };

    processNextFrame();

  } catch (err) {
    console.error("ERREUR DANS LE TRAITEMENT:", err);
    setIsProcessing(false);
  }
};

  return (
    <div style={{
      color: 'white',
      fontFamily: "'Inter', sans-serif",
      padding: '40px 20px',
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      position: 'relative'
    }}>
      
      {/* 🌟 POP-UP DE SUCCÈS DESIGN */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.3)',
            padding: '35px', borderRadius: '24px', maxWidth: '420px', width: '90%',
            textAlign: 'center', boxShadow: '0 0 40px rgba(168, 85, 247, 0.15)',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <style>{`
              @keyframes scaleUp {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `}</style>
            <div style={{ fontSize: '50px', marginBottom: '15px', filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.4))' }}>✨</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700', color: '#fff' }}>Traitement Terminé !</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>
              La remasterisation locale de votre vidéo s'est achevée avec succès via l'API <span style={{ color: '#c084fc', fontWeight: '600' }}>WebGPU</span>.
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #4f46e5 100%)',
                color: 'white', border: 'none', width: '100%', padding: '12px',
                borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                transition: '0.2s', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              Génial !
            </button>
          </div>
        </div>
      )}

      {/* --- SECTION 1 : EN-TÊTE --- */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(135deg, #fff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Console Développeur & Remasterisation
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '700px', lineHeight: '1.6' }}>
          Découvrez la puissance du traitement décentralisé. Utilisez votre carte graphique locale gratuitement ou intégrez notre API de pointe dans vos propres applications.
        </p>
      </div>

      {/* --- SECTION 2 : GRILLE DE FONCTIONNALITÉS (2 COLONNES) --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '25px'
      }}>
        
        {/* BLOC A : MODULE INTERACTIF LOCAL (WebGPU) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.06)',
          padding: '30px', borderRadius: '24px', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💻</span>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Module Local Éco</h3>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#c084fc', fontWeight: '700' }}>
                ⚡ 0 ÉCLAIR (GRATUIT)
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'left' }}>
              Exécutez notre IA de traitement directement sur <strong>votre carte graphique</strong> via l'API WebGPU. Aucun fichier ne quitte votre ordinateur.
            </p>

            {!videoFile ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed #a855f7' : '2px dashed rgba(255, 255, 255, 0.15)',
                  background: isDragging ? 'rgba(168, 85, 247, 0.04)' : 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '16px', padding: '30px 20px', textAlign: 'center', cursor: 'pointer', transition: '0.2s', position: 'relative'
                }}
              >
                <input type="file" accept="video/*" onChange={handleFileSelect} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎬</div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>Glissez votre vidéo ou cliquez pour parcourir</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>MP4, MKV, AVI (Animés, films rétro...)</p>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(isProcessing || progress > 0) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#000' }}>
                    <div style={{ position: 'relative' }}>
                      <video id="videoSource" muted style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#94a3b8' }}>Source Originale</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <canvas id="canvasOutput" width="1280" height="960" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#000' }} /> 
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(168, 85, 247, 0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>Rendu WebGPU (IA)</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <span style={{ fontSize: '20px' }}>🎞️</span>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{videoFile.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button disabled={isProcessing} onClick={() => { setVideoFile(null); setProgress(0); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Supprimer</button>
                  </div>
                )}
              </div>
            )}

            {/* Options de configurations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Résolution cible</label>
                <select disabled={isProcessing} value={options.upscale} onChange={(e) => setOptions({...options, upscale: e.target.value})} style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '10px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
                  <option value="1080p">Super-Resolution HD (1080p)</option>
                  <option value="4k">Remaster Ultra-HD (4K)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" disabled={isProcessing} checked={options.recolor} onChange={(e) => setOptions({...options, recolor: e.target.checked})} style={{ accentColor: '#a855f7' }} />
                  🎨 Recolorisation intelligente de la source
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" disabled={isProcessing} checked={options.fpsBoost} onChange={(e) => setOptions({...options, fpsBoost: e.target.checked})} style={{ accentColor: '#a855f7' }} />
                  🚀 Interpolation de fluide (Boost 60 FPS)
                </label>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            {isProcessing ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Calcul local anti-sature (VRAM)...</span>
                  <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #6366f1)', transition: 'width 0.1s linear' }}></div>
                </div>
              </div>
            ) : (
              <button 
                disabled={!videoFile || !session} 
                onClick={startLocalProcessing} 
                style={{
                  width: '100%', background: (videoFile && session) ? 'linear-gradient(135deg, #a855f7 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.03)',
                  border: 'none', color: (videoFile && session) ? '#fff' : '#475569', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
                  cursor: (videoFile && session) ? 'pointer' : 'not-allowed', transition: '0.2s', boxShadow: (videoFile && session) ? '0 4px 15px rgba(168, 85, 247, 0.2)' : 'none'
                }}
              >
                {modelLoadingError ? "❌ Échec de chargement" : !session ? "⏳ Chargement de l'IA (Veuillez patienter...)" : "🚀 Lancer le rendu local"}
              </button>
            )}
          </div>
        </div>

        {/* BLOC B : ACCÈS API (B2B Payant) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(168, 85, 247, 0.2)',
          padding: '30px', borderRadius: '24px', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.05)', position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Image de fond restaurée */}
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: '280px', height: '280px',
            backgroundImage: `url(${femmeBg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom right', opacity: 0.15, pointerEvents: 'none', zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#c084fc' }}>Intégration API Cloud</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'left' }}>
              Vous gérez un site de streaming, un blog ou un outil vidéo ? Connectez votre plateforme à nos serveurs de rendu GPU haute performance. Traitez des vidéos de manière automatisée à grande échelle.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <input 
                type="text" 
                readOnly 
                value="sk-eclipse-active-8f3b20ce81ac82bfbc44e11" 
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                  padding: '12px', borderRadius: '12px', color: '#a855f7', fontFamily: 'monospace', fontSize: '13px'
                }}
              />
              <button 
                onClick={() => navigator.clipboard.writeText("sk-eclipse-active-8f3b20ce81ac82bfbc44e11")}
                style={{ background: '#a855f7', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                Copier
              </button>
            </div>
          </div>
const videoElement = document.getElementById('videoSource');
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Tarif : 0.02€ / seconde de rendu</span>
            <span style={{ fontSize: '13px', color: '#2ed573', fontWeight: '600' }}>Statut : Actif</span>
          </div>
        </div>

      </div>

      {/* --- SECTION 3 : DOCUMENTATION RAPIDE --- */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.25)', border: '1px solid rgba(255,255,255,0.04)',
        padding: '30px', borderRadius: '24px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', textAlign: 'left' }}>🛠️ Exemple de code d'intégration rapide (cURL)</h4>
        <pre style={{
          background: '#090d16', padding: '20px', borderRadius: '14px',
          overflowX: 'auto', fontFamily: 'monospace', fontSize: '13px', color: '#38bdf8', border: '1px solid rgba(255,255,255,0.02)', margin: 0, textAlign: 'left'
        }}>
{`curl -X POST "https://api.eclipse-ia.com/v1/remaster" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "video_url": "https://monsite.com/video_retro.mp4",
    "style": "modern_anime_2026",
    "resolution": "4K"
  }'`}
        </pre>
      </div>

    </div>
  );
}