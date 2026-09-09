import React, { useState } from 'react'; // Rajout de useState
import './Navbar.css';
const Navbar = ({ 
  user, 
  tokens, 
  packTokens, 
  userPlan,
  userPrice, 
  logoEclipse, 
  logoEclair, 
  onStart, 
  onShowPricing, 
  onLogout, 
  showDropdown, 
  setShowDropdown,
  onBackToHome,   
  resetDate,  
  expiryDate,  
  onOpenProfile,
  onShowHistory    
  
}) => {

  // --- RAJOUT : ÉTAT POUR LE MENU MOBILE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- CONFIGURATION DYNAMIQUE DES PLANS (TON CODE) ---
const planConfig = {
  "legende": { name: "LÉGENDE", color: "#ff4757" },
  "elite": { name: "ELITE", color: "#ffa502" },
  "master": { name: "MASTER", color: "#2ed573" },
  "standard": { name: "STANDARD", color: "#1e90ff" },
  "essentiel": { name: "ESSENTIEL", color: "#70a1ff" },
  "debutant": { name: "DÉBUTANT", color: "#a4b0be" }
};

const currentPlan = planConfig[userPlan?.toLowerCase()] || planConfig["debutant"];

  return (
    <nav className="landing-nav">
      {/* --- RAJOUT : CSS RESPONSIVE POUR TOUT ADAPTER --- */}
    <style>{`
.dropdown-expiry-info {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 10px;
          font-size: 11px;
          border-left: 3px solid #a855f7;
        }
        .expiry-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          color: #a1a1aa;
        }
        .expiry-item:last-child { margin-bottom: 0; }
        .expiry-date-val {
          color: #ffffff;
          font-weight: bold;
    }
  }
`}</style>

      <div className="nav-container">
        {/* --- RAJOUT : BOUTON BURGER --- */}
<div 
  className="burger-menu" 
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label="Menu"
  style={{ display: 'none', flexDirection: 'column', gap: '5px', cursor: 'pointer', zIndex: 1000 }}
>
  <span style={{
    width: '25px', height: '2px', background: 'white', transition: '0.3s',
    transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none'
  }}></span>
  <span style={{
    width: '25px', height: '2px', background: 'white', transition: '0.3s',
    opacity: isMobileMenuOpen ? 0 : 1
  }}></span>
  <span style={{
    width: '25px', height: '2px', background: 'white', transition: '0.3s',
    transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'
  }}></span>
</div>
        <img 
          src={logoEclipse} 
          alt="Eclipse IA" 
          className="nav-logo-img" 
          onClick={onBackToHome}
          style={{ cursor: 'pointer' }}
        />
<div className={`nav-links-center ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <a href="#generate-section" className="nav-link-item" onClick={(e) => { e.preventDefault(); onStart("IMAGE"); setIsMobileMenuOpen(false); }}>
          <span className="nav-link-icon">🎨</span> Du texte à l'image
        </a>
        <a href="#generate-section" className="nav-link-item" onClick={(e) => { e.preventDefault(); onStart("VIDEO"); setIsMobileMenuOpen(false); }}>
          <span className="nav-link-icon">🎬</span> De l'image à la vidéo
        </a>
        
{/* BLOC CHIRURGICAL : Menu déroulant avec pont invisible pour le curseur */}
        <div 
          className="dropdown" 
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => {
            const el = document.getElementById('production-dropdown');
            if (el) el.style.display = 'block';
          }}
          onMouseLeave={() => {
            const el = document.getElementById('production-dropdown');
            if (el) el.style.display = 'none';
          }}
        >
          <span 
            className="nav-link-item" 
            style={{ 
              cursor: 'not-allowed', 
              color: '#64748b', 
              whiteSpace: 'nowrap',
              paddingBottom: '10px' 
            }}
          >
            <span className="nav-link-icon">💬</span> Production (bientot) ▾
          </span>
            
            <div 
              id="production-dropdown"
              className="dropdown-content" 
              style={{
                display: 'none',
                position: 'absolute', 
                top: '100%', 
                left: '0', 
                paddingTop: '8px', // Le secret est là : l'espace vide fait maintenant partie du menu !
                zIndex: 10005
              }}
            >
              {/* Le vrai contenu visuel du menu */}
              <div style={{
                backgroundColor: '#0f172a',
                minWidth: '220px', 
                boxShadow: '0px 8px 16px rgba(0,0,0,0.5)', 
                borderRadius: '12px',
                padding: '6px 0', 
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
               <div 
  style={{
    color: '#64748b', padding: '12px 16px', cursor: 'not-allowed', fontSize: '13px', 
    fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none'
  }}
>
  🚀 API & Module Développeur
</div>
                <div style={{
                  color: '#475569', padding: '10px 16px', fontSize: '12px', 
                  borderTop: '1px solid rgba(255,255,255,0.05)', userSelect: 'none'
                }}>
                  ⚙️ Autres outils (Bientôt)
                </div>
              </div>
            </div>
          </div>
        
        <div className="nav-divider-vertical" style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>
         
  <span 
  className="nav-link-item" 
  style={{ cursor: 'pointer' }}
  onClick={(e) => { 
    e.preventDefault(); 
    setIsMobileMenuOpen(false); 
    if (!user) {
      onStart(); // 🔐 Ouvre la modale de connexion si pas connecté
    } else if (onShowHistory) {
      onShowHistory(); // ✅ Ouvre l'historique si connecté
    }
  }}
>
  Mes Historiques
</span>
        
        {/* L'espaceur est ici sur Tarifs pour repousser proprement le bloc de droite (LÉGENDE / Connexion) */}
        <a 
          href="#tarifs" 
          className="nav-link-item" 
          style={{ marginRight: '15px' }} 
          onClick={(e) => { e.preventDefault(); if (typeof onShowPricing === 'function') onShowPricing(); setIsMobileMenuOpen(false); }}
        >
          Tarifs
        </a>
      </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          
          {user && (
            <div className="tokens-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '5px' }}>
              
              <div className="badge-plan-mobile" style={{
                fontSize: '12px',
                fontWeight: '900',
                padding: '4px 10px',
                borderRadius: '8px',
                border: `1.5px solid ${currentPlan.color}`,
                color: currentPlan.color,
                background: 'rgba(0, 0, 0, 0.2)',
                marginRight: '5px',
                letterSpacing: '0.5px'
              }}>
                {currentPlan.name}
              </div>

              <div className="token-display-dee" style={{ display: 'flex', alignItems: 'center' }}>
                <img src={logoEclair} alt="Crédits" className="token-icon-dee-lightning" style={{ width: '18px', height: '18px', marginRight: '4px' }} />
                <span className="token-text-dee" style={{ fontSize: '14px', color: '#fffd8f', fontWeight: 'bold' }}>{tokens}</span>
              </div>

              <div className="token-display-dee pack-tokens" style={{ display: 'flex', alignItems: 'center', padding: '7px 8px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '10px' }}>
                <span style={{ fontSize: '15px', marginRight: '4px' }}>💎</span>
                <span className="token-text-dee" style={{ fontSize: '14px', color: '#3498db', fontWeight: 'bold' }}>{packTokens || 0}</span>
              </div>
            </div>
          )}

          {user ? (
            <div className="user-menu-container" style={{ position: 'relative', marginLeft: '10px' }}>
              <div className="user-nav-profile" onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <img 
  src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'default'}`} 
  alt="Profil" 
  style={{ 
    width: '36px', 
    height: '36px', 
    borderRadius: '50%', 
    border: `2px solid ${currentPlan.color}`,
    boxShadow: `0 0 10px ${currentPlan.color}33`,
    marginLeft: '-5px' 
  }} 
/>
              </div>

              {showDropdown && (
                <div className="dropdown-menu shadow-glow">

                  <div className="dropdown-item" 
  onClick={() => {
    setShowDropdown(false);
    onShowPricing(); // Appelle directement la fonction passée en props
  }}
  style={{ cursor: 'pointer' }}
>
  💎 Tarification</div>


<div className="dropdown-item" onClick={() => { setShowDropdown(false); onOpenProfile(); }}>
  👤 Mon Compte
</div>               

{/* --- NOUVEAU BLOC AMÉLIORÉ --- */}
<div style={{
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '16px',
  margin: '10px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}}>
  {/* Ligne Éclairs */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
    <div style={{ fontSize: '18px', filter: 'drop-shadow(0 0 5px rgba(234, 179, 8, 0.4))' }}>⚡</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' }}>
        Reset Éclairs
      </span>
      <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '500' }}>
        {user?.tokensResetDate?.seconds 
  ? new Date(user.tokensResetDate.seconds * 1000).toLocaleDateString('fr-FR') 
  : "Sous 30 jours"}
      </span>
    </div>
  </div>

  {/* Séparateur Dégradé */}
  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.2), transparent)', width: '100%' }}></div>

{/* Ligne Diamants */}
<div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
  <div style={{ fontSize: '18px', filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.4))' }}>💎</div>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' }}>
      Validité Diamants
    </span>
<span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '500' }}>
  {/* On utilise packExpiryDate car c'est le nom exact dans ta base Firebase */}
  {user?.packExpiryDate?.seconds 
    ? new Date(user.packExpiryDate.seconds * 1000).toLocaleDateString('fr-FR') 
    : "Valable 1 an"}
</span>
  </div>
</div>
</div>
{/* --- FIN DU BLOC --- */}

                 <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout" onClick={(e) => { e.stopPropagation(); onLogout(); setShowDropdown(false); }}>🚪 Déconnexion</div>
                </div>
              )}
            </div> 
          ) : (
            <button className="btn-secondary" onClick={() => onStart()}>Connexion</button>
          )}
        </div>
      </div> 
    </nav>
  );
};

export default Navbar;