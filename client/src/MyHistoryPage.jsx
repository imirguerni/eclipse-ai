import React, { useState } from 'react';

const MyHistoryPage = ({ history, onBack, onRemix, onDownload, onDelete }) => {
  const [filter, setFilter] = useState('IMAGE'); 
  // État pour gérer le média sélectionné dans le lecteur plein écran
  const [selectedMedia, setSelectedMedia] = useState(null);

  const filteredData = history.filter(item => (item.type || 'IMAGE') === filter);

  return (
    <div style={{ 
      flex: 1, background: '#080808', padding: '30px',
      height: '100vh', color: 'white', width: '100%', fontFamily: 'sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden' /* 👈 Empêche toute la page de scroller */
    }} className="history-page-container">
      
      {/* CODE STYLE INJECTÉ POUR LE RESPONSIVE & L'EFFET FIGÉ */}
      <style>{`
        /* L'en-tête ne bouge plus du tout */
        .history-header {
          flex-shrink: 0 !important;
          background: #080808 !important;
          padding-bottom: 20px !important;
          margin-bottom: 20px !important;
        }

        /* C'est ce conteneur qui prend le scroll maintenant */
        .history-scroll-area {
          flex: 1 !important;
          overflow-y: auto !important;
          padding-right: 5px !important;
        }

        @media (max-width: 768px) {
          .history-page-container {
            padding: 16px !important;
          }
          .history-header {
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
            padding-bottom: 16px !important;
            margin-bottom: 16px !important;
          }
          .btn-back-studio {
            width: 100% !important;
            text-align: center !important;
            padding: 12px !important;
          }
          .filter-container {
            width: 100% !important;
            display: flex !important;
          }
          .filter-container button {
            flex: 1 !important;
            text-align: center !important;
            padding: 12px !important;
          }
          .history-grid {
            grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)) !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* EN-TÊTE COMPLÈTEMENT FIXE */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          flexWrap: 'wrap', gap: '20px' 
        }} className="history-header">
          <button 
            onClick={onBack} 
            style={{ 
              background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', 
              color: '#a855f7', padding: '10px 20px', borderRadius: '12px', 
              cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
            }}
            className="btn-back-studio"
          >
            ← Retour au Studio
          </button>
          
          <div style={{ 
            display: 'flex', gap: '8px', background: '#111', padding: '5px', 
            borderRadius: '14px', border: '1px solid #222' 
          }} className="filter-container">
            <button 
              onClick={() => setFilter('IMAGE')} 
              style={{ 
                padding: '10px 25px', borderRadius: '10px', border: 'none', 
                background: filter === 'IMAGE' ? '#a855f7' : 'transparent', 
                color: 'white', cursor: 'pointer', fontWeight: '600', transition: '0.2s'
              }}
            >
              🖼️ Images
            </button>
            <button 
              onClick={() => setFilter('VIDEO')} 
              style={{ 
                padding: '10px 25px', borderRadius: '10px', border: 'none', 
                background: filter === 'VIDEO' ? '#a855f7' : 'transparent', 
                color: 'white', cursor: 'pointer', fontWeight: '600', transition: '0.2s'
              }}
            >
              🎬 Vidéos
            </button>
          </div>
        </div>

        {/* ZONE DE SCROLL UNIQUEMENT POUR LA GRILLE */}
        <div className="history-scroll-area">
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' 
          }} className="history-grid">
            {filteredData.length > 0 ? filteredData.map(item => (
              <div key={item.id} style={{ 
                background: '#111', borderRadius: '20px', overflow: 'hidden', 
                border: '1px solid #222', display: 'flex', flexDirection: 'column'
              }}>
                
                {/* VISUEL CLIQUABLE POUR OUVRIR LE LECTEUR */}
                <div 
                  onClick={() => setSelectedMedia(item)}
                  style={{ 
                    aspectRatio: '1/1', background: '#000', position: 'relative', 
                    overflow: 'hidden', cursor: 'pointer' 
                  }}
                  title="Cliquez pour agrandir"
                >
                  {filter === 'IMAGE' ? (
                    <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="IA" />
                  ) : (
                    <video 
                      src={item.url || item.videoUrl} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
                      muted 
                      playsInline 
                      preload="auto"
                      crossOrigin="anonymous"
                      autoPlay={true}
                      controls={false}
                      onTimeUpdate={(e) => {
                        if (e.target.currentTime >= 4.1) {
                          e.target.pause();
                        }
                      }}
                      onLoadedData={(e) => {
                        e.target.currentTime = 4.0;
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
                  {/* Petit indicateur visuel au survol */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s',
                    fontSize: '24px'
                  }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0}>
                    {filter === 'IMAGE' ? '🔍' : '▶️'}
                  </div>
                </div>

                {/* CONTENU & ACTIONS */}
                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ 
                    fontSize: '13px', color: '#ccc', margin: 0, height: '56px',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5'
                  }}>
                    {item.prompt}
                  </p>

                  {/* BARRE DE BOUTONS ACTIONS */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onRemix(item)}
                      style={{ 
                        flex: 1, background: '#7c3aed', color: 'white', border: 'none', 
                        padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                      }}
                    >
                      🪄 Remix
                    </button>
                    <button 
                      onClick={() => onDownload(item)}
                      style={{ 
                        background: '#222', color: 'white', border: '1px solid #333', 
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' 
                      }}
                      title="Télécharger"
                    >
                      📥
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', 
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' 
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* META DATA */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#555' }}>
                      {isNaN(item.id) ? "Fichier Local" : new Date(Number(item.id)).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '10px', background: '#1a1a1a', padding: '2px 8px', borderRadius: '4px', color: '#a855f7', border: '1px solid #333' }}>
                      {item.model || (filter === 'IMAGE' ? 'Flux Pro' : 'Hailuo AI')}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px' }}>
                <h3 style={{ color: '#444' }}>Historique vide</h3>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================== */}
      {/* ⭐ COMPOSANT INTEGRÉ : MODALE LECTEUR PLEIN ÉCRAN ⭐ */}
      {/* ========================================================== */}
      {selectedMedia && (
        <div 
          onClick={() => setSelectedMedia(null)} // Ferme la fenêtre si on clique en dehors
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.92)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
          }}
        >
          {/* Bouton de fermeture en haut à droite */}
          <button 
            onClick={() => setSelectedMedia(null)}
            style={{
              position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)',
              border: 'none', color: 'white', fontSize: '20px', width: '45px', height: '45px',
              borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>

          {/* Zone du Média principal adaptative */}
          <div 
            onClick={(e) => e.stopPropagation()} // Évite de fermer si on clique sur le lecteur lui-même
            style={{
              maxWidth: '90%', maxHeight: '75vh', borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)', background: '#000', display: 'flex'
            }}
          >
            {(selectedMedia.type === 'VIDEO' || (selectedMedia.url && selectedMedia.url.includes('.mp4'))) ? (
              <video
                src={selectedMedia.url || selectedMedia.videoUrl}
                controls
                autoPlay
                playsInline
                crossOrigin="anonymous"
                style={{ maxWidth: '100%', maxHeight: '75vh', width: 'auto', height: 'auto' }}
              />
            ) : (
              <img 
                src={selectedMedia.url} 
                alt="Grand format" 
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
              />
            )}
          </div>

          {/* Affichage du Prompt sous le lecteur */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px', width: '100%', textAlign: 'center', marginTop: '20px',
              background: 'rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', color: '#ddd', lineHeight: '1.5' }}>
              {selectedMedia.prompt || "Sans description"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHistoryPage;