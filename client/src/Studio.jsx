import React, { useState } from 'react';
import './Studio.css';

const Studio = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  const handleGenerate = () => {
    if (!prompt) return alert("Écris quelque chose d'abord !");
    
    setIsGenerating(true);
    console.log("Génération lancée pour :", prompt);

    // Simulation de l'IA (On connectera l'API réelle plus tard)
    setTimeout(() => {
      setIsGenerating(false);
      // Image de test pour voir si le cadre fonctionne
      setResultImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"); 
    }, 3000);
  };

  return (
    <div className="studio-container">
      <div className="prompt-wrapper">
        <textarea 
          className="prompt-input"
          placeholder="Décrivez l'image ou la vidéo de vos rêves..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="generate-btn" onClick={handleGenerate}>
          <i className="fas fa-bolt"></i> {isGenerating ? "Génération..." : "Générer"}
        </button>
      </div>
      
      <div className="studio-options">
        <span className="option-tag">16:9</span>
        <span className="option-tag">HD Quality</span>
        <span className="option-tag">V6 Model</span>
      </div>

      {/* --- NOUVELLE ZONE DE RÉSULTAT --- */}
      <div className="result-container">
        {isGenerating ? (
          <div className="loading-skeleton">
            <div className="shimmer"></div>
            <p>L'IA analyse votre prompt...</p>
          </div>
        ) : resultImage ? (
          <div className="result-card">
            <img src={resultImage} alt="Résultat" className="generated-media" />
            <div className="result-actions">
              <button className="action-btn" title="Télécharger">
                <i className="fas fa-download"></i>
              </button>
              <button className="action-btn" title="Partager">
                <i className="fas fa-share"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-magic"></i>
            <p>Votre création apparaîtra ici</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;