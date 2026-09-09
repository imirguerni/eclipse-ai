import React from 'react';
import './EclairsCounter.css';

const EclairsCounter = ({ monthlyCredits, maxMonthly, packCredits }) => {
  // Calcul du pourcentage pour la jauge
  const percentage = (monthlyCredits / maxMonthly) * 100;

  return (
    <div className="eclairs-status-container">
      {/* COMPTEUR MENSUEL (AVEC JAUGE) */}
      <div className="status-item monthly-stats">
        <div className="status-info">
          <span className="status-label">Abonnement</span>
          <span className="status-number">⚡ {monthlyCredits} <small>/ {maxMonthly}</small></span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* COMPTEUR PACKS (RÉSERVE) */}
      <div className="status-item pack-stats">
        <div className="status-info">
          <span className="status-label">Réserve Pack</span>
          <span className="status-value">💎 {packCredits}</span>
        </div>
        <div className="pack-badge-mini">ILLIMITÉ</div>
      </div>
    </div>
  );
};

export default EclairsCounter;