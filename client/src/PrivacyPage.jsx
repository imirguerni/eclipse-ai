import React, { useEffect } from 'react';

const PrivacyPage = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#000000', 
      color: '#ffffff', 
      minHeight: '100vh', 
      padding: '60px 20px',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      lineHeight: '1.7',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        <button 
          onClick={onBack}
          style={{ 
            marginBottom: '40px', 
            cursor: 'pointer', 
            background: 'rgba(255, 255, 255, 0.05)', 
            color: '#ffffff', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            padding: '10px 24px', 
            borderRadius: '99px',
            fontSize: '14px'
          }}
        >
          ← Retour au Studio
        </button>

        <header style={{ borderBottom: '1px solid #222', paddingBottom: '30px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>
            Politique de Confidentialité
          </h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>
            Dernière mise à jour : 18 Mars 2026 — Eclipse IA
          </p>
        </header>

        <div style={{ fontSize: '15px', color: '#d4d4d8' }}>
          
          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px' }}>1. Collecte des Données</h2>
            <p>Lorsque vous utilisez Eclipse IA, nous collectons les informations suivantes :</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#a1a1aa' }}>
              <li><strong>Informations de compte :</strong> Votre adresse e-mail et nom d'utilisateur fournis lors de l'inscription.</li>
              <li><strong>Contenus générés :</strong> Les prompts (instructions textuelles) et les images/vidéos générées pour permettre leur affichage dans votre historique.</li>
              <li><strong>Données de paiement :</strong> Les transactions sont gérées par <strong>Stripe</strong>. Eclipse IA n'a jamais accès à vos numéros de carte bancaire.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px' }}>2. Utilisation des Données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#a1a1aa' }}>
              <li>Fournir et maintenir le Service Eclipse IA.</li>
              <li>Gérer votre abonnement et vos crédits de génération.</li>
              <li>Améliorer l'interface utilisateur et la rapidité des générations.</li>
              <li>Assurer la sécurité et prévenir les fraudes (multi-comptes abusifs).</li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px' }}>3. Conservation et Stockage</h2>
            <p><strong>Stockage Local :</strong> Pour votre confort, Eclipse IA utilise le stockage local de votre navigateur (localStorage) pour mémoriser vos préférences et votre historique récent.</p>
            <p style={{ marginTop: '10px' }}><strong>Serveurs :</strong> Vos données essentielles (compte, abonnements) sont stockées sur des serveurs sécurisés. Nous supprimons les données inutilisées après une période d'inactivité prolongée.</p>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px' }}>4. Partage avec des Tiers</h2>
            <p>Nous ne vendons jamais vos données personnelles. Nous partageons des informations uniquement avec nos prestataires essentiels :</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#a1a1aa' }}>
              <li><strong>Fournisseurs d'IA :</strong> Les prompts sont envoyés de manière anonymisée aux API de génération (Flux, OpenAI, etc.).</li>
              <li><strong>Stripe :</strong> Pour le traitement sécurisé des paiements.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px' }}>5. Vos Droits (RGPD)</h2>
            <p>Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez demander la clôture de votre compte et la purge de vos données depuis les réglages de votre profil.</p>
          </section>

          <section style={{ marginBottom: '35px', padding: '20px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px' }}>Sécurité</h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
              Nous mettons en œuvre des mesures techniques avancées pour protéger vos données. Cependant, aucune méthode de transmission sur Internet n'est sûre à 100%. En utilisant Eclipse IA, vous reconnaissez ce risque résiduel.
            </p>
          </section>
        </div>

        <footer style={{ marginTop: '60px', paddingBottom: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '12px' }}>
          © 2026 Eclipse IA — Protection des données garantie.
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPage;