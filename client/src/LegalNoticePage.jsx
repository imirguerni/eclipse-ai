import React, { useEffect } from 'react';
import './TermsPage.css';

const LegalNoticePage = ({ onBack, onContactClick, onShowPrivacy }) => {
      useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-wrapper">
      <div className="terms-container">

        <button onClick={onBack} className="btn-back">
          ← Retour au Studio
        </button>

        <header className="terms-header">
          <h1>Mentions Légales</h1>
          <p>
            Dernière mise à jour : 8 septembre 2026 — Eclipse IA
          </p>
        </header>

        <div className="terms-content">

          <section className="terms-section">
            <h2>1. Éditeur du site</h2>
            <p>
              Le site et studio de création <strong>Eclipse IA</strong> est édité par :
            </p>
            <ul>
              <li><strong>Statut / Forme juridique :</strong> Entrepreneur individuel</li>
              <li><strong>Nom du responsable / Dirigeant :</strong> GUERNI IMIR</li>
              <li><strong>Adresse du siège :</strong> 15 AVENUE VICTOR HUGO, 95630 MERIEL</li>
              <li><strong>Numéro SIRET :</strong> 	999 682 198 00018</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>2. Hébergement</h2>
            <p>
              Le site et les services d'infrastructure d'Eclipse IA sont hébergés par :
            </p>
            <ul>
              <li><strong>Hébergeur :</strong> Google Cloud / Firebase (Google LLC)</li>
              <li><strong>Adresse :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</li>
              <li><strong>Site web :</strong> https://firebase.google.com</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Propriété Intellectuelle</h2>
            <p>
              L'ensemble de la structure du site Eclipse IA, ses logos, ses éléments graphiques, ses textes, ses bases de données et son code source sont la propriété exclusive d'Eclipse IA ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite.
            </p>
            <p>
              Conformément à nos CGU, vous conservez l'entière propriété des prompts que vous saisissez et des créations vidéo/image générées par nos outils d'IA.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Données Personnelles et Cookies</h2>
            <p>
La collecte et le traitement de vos données personnelles sont encadrés par notre <a href="#" onClick={(e) => { e.preventDefault(); if (onShowPrivacy) onShowPrivacy(); }}>Politique de Confidentialité</a>, en conformité avec le RGPD.            </p>
          </section>

          <section className="contact-box">
            <h2>Besoin d'informations complémentaires ?</h2>
            <p>Pour toute question d'ordre légal ou technique, vous pouvez joindre notre équipe.</p>
            <button
              onClick={onContactClick}
              className="btn-contact-support"
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Contacter le support
            </button>
          </section>

        </div>

        <footer className="terms-footer">
          © 2026 Eclipse IA — Studio de Création Multimodale.
        </footer>

      </div>
    </div>
  );
};

export default LegalNoticePage;