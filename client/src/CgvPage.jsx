import React, { useEffect } from 'react';
import './TermsPage.css';

const CgvPage = ({ onBack, onContactClick }) => {
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
          <h1>Conditions Générales de Vente (CGV)</h1>
          <p>
            Dernière mise à jour : 8 septembre 2026 — Eclipse IA
          </p>
        </header>

        <div className="terms-content">

          <section className="terms-section">
            <h2>1. Champ d'application</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des ventes de services, d'abonnements, de packs de jetons ("Éclairs") et de "Diamants" réalisées sur la plateforme Eclipse IA. Tout achat effectué sur le site implique l'adhésion entière et sans réserve de l'utilisateur aux présentes CGV.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Produits et Tarifs</h2>
            <p>
              Eclipse IA propose l'accès à son studio de création de contenu par intelligence artificielle sous forme de crédits virtuels (Éclairs / Diamants) ou d'abonnements.
            </p>
            <ul>
              <li>Les prix sont affichés en Euros (€) toutes taxes comprises (TTC).</li>
              <li>Eclipse IA se réserve le droit de modifier ses prix à tout moment, mais les services facturés le seront sur la base des tarifs en vigueur au moment de la validation de la commande.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Modalités de Paiement et Sécurité</h2>
            <p>
              Le règlement des achats s'effectue par carte bancaire ou via les solutions de paiement sécurisées proposées sur la plateforme (ex. Stripe). 
            </p>
            <p>
              Le débit est immédiat au moment de la validation de la transaction. Aucune donnée bancaire sensible n'est stockée sur les serveurs d'Eclipse IA.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Absence de Droit de Rétractation</h2>
            <p>
              Conformément à l'article L. 221-28 du Code de la consommation, les services de génération de contenu numérique fournis sur un support immatériel et dont l'exécution commence immédiatement après l'achat (consommation de crédits / génération de vidéos par l'IA) ne bénéficient pas du droit de rétractation, ce que l'utilisateur reconnaît et accepte expressément lors de sa commande.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Remboursement et Utilisation des Crédits</h2>
            <p>
              Les Éclairs et Diamants achetés sont strictement personnels, non cessibles et non remboursables, y compris en cas de clôture du compte, qu'elle soit à l'initiative de l'utilisateur ou d'Eclipse IA en cas de non-respect des CGU.
            </p>
          </section>

          <section className="contact-box">
            <h2>Une question concernant une commande ?</h2>
            <p>Notre équipe de support est à votre disposition pour résoudre tout problème de facturation.</p>
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

export default CgvPage;