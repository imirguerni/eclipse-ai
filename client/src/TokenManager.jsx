import React from 'react';

const TokenManager = ({ tokens, onBuyMore }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255, 255, 255, 0.03)',
      padding: '8px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(168, 85, 247, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Crédits Restants
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#a855f7', fontSize: '18px' }}>⚡</span>
          <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>{tokens}</span>
        </div>
      </div>

      <button 
        onClick={onBuyMore}
        style={{
          marginLeft: '10px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: 'none',
          background: '#a855f7',
          color: 'white',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        Recharger
      </button>
    </div>
  );
};

export default TokenManager;