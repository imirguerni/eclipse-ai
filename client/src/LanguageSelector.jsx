import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'fr', label: 'Français' },
    { code: 'zh', label: '中文' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[3];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bouton plus compact pour ne pas casser la navbar connecté */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          padding: '5px 10px',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
      >
        <span style={{ fontSize: '14px' }}>🌐</span>
        <span>{currentLanguage.label}</span>
        <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: '2px' }}>▼</span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: '0',
          backgroundColor: '#0f172a',
          minWidth: '130px',
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.5)',
          borderRadius: '10px',
          padding: '5px 0',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10006,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(10px)'
        }}>
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  background: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                  color: isActive ? '#c084fc' : '#e2e8f0',
                  border: 'none',
                  padding: '8px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'background 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;