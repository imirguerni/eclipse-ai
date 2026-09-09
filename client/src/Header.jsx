import React, { useEffect } from 'react';
import EclairsCounter from './EclairsCounter'; 
import './Header.css';

// 1. Configuration des plans
const PLAN_CONFIG = {
  "0.00":   { name: "Discovery", color: "#7f8c8d" },
  "12.99":  { name: "Essentiel", color: "#27ae60" },
  "19.99":  { name: "Standard",  color: "#2980b9" },
  "34.99":  { name: "Master",    color: "#8e44ad" },
  "59.99":  { name: "Elite",     color: "#e67e22" },
  "159.99": { name: "Légende",   color: "#d4af37" }
};

const Header = ({ user, tokens, packTokens, onShowPricing, userPrice }) => {
  
  const config = PLAN_CONFIG[userPrice] || PLAN_CONFIG["0.00"];

  return (
    <header className="main-header">
      {/* GAUCHE : Logo */}
      <div className="logo-container">
        <div className="logo-icon">⚡</div>
        <span className="logo-text">ECLIPSE <span className="logo-ai">AI</span></span>
      </div>

      {/* CENTRE : Navigation + TRADUCTEUR */}
      <nav className="main-nav">
        <a href="#studio" className="active">Studio</a>
        <a href="#galerie">Galerie</a>
        <a href="#pricing" onClick={(e) => { e.preventDefault(); onShowPricing(); }}>Tarifs</a>
        
        {/* --- LE TRADUCTEUR GOOGLE (Positionné au centre) --- */}
        <div id="google_translate_element" className="google-translate-header"></div>
      </nav>

      {/* DROITE : Pack + Compteurs + Profil */}
      <div className="header-right">
        
        {/* Badge du nom de l'abonnement */}
        <div className="plan-badge-container">
            <span style={{
                backgroundColor: config.color,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: userPrice === "159.99" ? '0 0 10px rgba(212, 175, 55, 0.5)' : 'none',
                border: userPrice === "159.99" ? '1px solid #fff' : 'none'
            }}>
                {config.name}
            </span>
        </div>

        <div className="clickable-counter" onClick={onShowPricing} style={{ cursor: 'pointer' }}>
          <EclairsCounter 
            monthlyCredits={tokens || 0} 
            maxMonthly={10} 
            packCredits={packTokens || 0} 
          />
        </div>

        <div className="user-profile-btn">
          <div className="avatar-mini">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <span className="username" style={{ marginLeft: '8px' }}>{user?.name || 'Mon Compte'}</span>
        </div>
      </div>

      {/* CSS INTERNE POUR RENDRE LE BOUTON GOOGLE PLUS BEAU */}
      <style>{`
        .google-translate-header {
          margin-left: 15px;
          display: inline-block;
          vertical-align: middle;
        }
        .goog-te-gadget-simple {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 3px 8px !important;
          border-radius: 8px !important;
          font-family: inherit !important;
        }
        .goog-te-gadget-simple span {
          color: rgba(255,255,255,0.7) !important;
          font-size: 12px !important;
        }
        .goog-te-gadget-icon { display: none !important; }
        .goog-te-menu-value span:nth-child(3) { display: none !important; }
        .goog-te-menu-value span:nth-child(5) { display: none !important; }
      `}</style>
    </header>
  );
};

export default Header;