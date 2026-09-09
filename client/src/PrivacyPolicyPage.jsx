import React, { useEffect } from 'react';
import './TermsPage.css'; // Tu peux réutiliser le même fichier CSS

const PrivacyPolicyPage = ({ onBack, onContactClick }) => {

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
          <h1>Politique de Confidentialité</h1>
          <p>
            Dernière mise à jour : 8 septembre 2026 — Eclipse IA
          </p>
        </header>

        <div className="terms-content">

          {/* ======================================================
              1. INTRODUCTION
          ====================================================== */}
          <section className="terms-section">
            <h2>1. Introduction et Responsable du Traitement</h2>

            <p>
              La présente Politique de Confidentialité décrit la manière dont
              Eclipse IA collecte, utilise, traite et protège vos données
              personnelles lorsque vous utilisez notre studio de création multimodale.
            </p>

            <p>
              Nous accordons une importance majeure à la protection de votre vie
              privée et nous engageons à traiter vos données conformément au
              Règlement Général sur la Protection des Données (RGPD) et à la
              législation française applicable.
            </p>

            <p>
              Pour toute question relative à vos données personnelles ou pour
              exercer vos droits, vous pouvez contacter notre support.
            </p>
          </section>


          {/* ======================================================
              2. DONNÉES COLLECTÉES
          ====================================================== */}
          <section className="terms-section">
            <h2>2. Données Collectées</h2>

            <p>
              Dans le cadre de l'utilisation d'Eclipse IA, nous sommes amenés
              à collecter les catégories de données suivantes :
            </p>

            <ul>
              <li>
                <strong>Données de compte :</strong> Adresse e-mail, nom d'utilisateur,
                mot de passe (crypté) et identifiants de connexion.
              </li>
              <li>
                <strong>Données de transaction :</strong> Historique des achats,
                abonnements, solde d'Éclairs et de Diamants. Les données bancaires
                sont traitées directement par nos prestataires de paiement sécurisés
                et ne sont jamais stockées sur nos serveurs.
              </li>
              <li>
                <strong>Contenus et prompts :</strong> Textes, images, fichiers audio
                ou vidéo que vous importez, ainsi que les instructions (prompts)
                saisis et les créations générées par l'intelligence artificielle.
              </li>
              <li>
                <strong>Données techniques et de navigation :</strong> Adresse IP,
                type de navigateur, données de connexion, journaux d'activité (logs)
                et données collectées via les cookies nécessaires au fonctionnement
                du service.
              </li>
            </ul>
          </section>


          {/* ======================================================
              3. FINALITÉS DES TRAITEMENTS
          ====================================================== */}
          <section className="terms-section">
            <h2>3. Finalités et Base Légale des Traitements</h2>

            <p>
              Vos données personnelles sont collectées et traitées pour des
              finalités précises reposant sur des bases légales :
            </p>

            <ul>
              <li>
                <strong>Exécution du contrat :</strong> Gestion de votre compte,
                fourniture des services de génération d'IA, gestion de vos crédits
                et abonnements, support client.
              </li>
              <li>
                <strong>Intérêt légitime :</strong> Sécurisation de la plateforme,
                lutte contre la fraude, amélioration et optimisation de nos
                services et de nos modèles.
              </li>
              <li>
                <strong>Obligations légales :</strong> Conservation des données
                financières et de facturation exigée par la loi fiscale et comptable.
              </li>
              <li>
                <strong>Consentement :</strong> Envoi éventuel de communications
                commerciales ou utilisation de cookies non essentiels (lorsqu'applicable).
              </li>
            </ul>
          </section>


          {/* ======================================================
              4. TIERS ET FOURNISSEURS
          ====================================================== */}
          <section className="terms-section">
            <h2>4. Partage des Données et Prestataires Tiers</h2>

            <p>
              Pour faire fonctionner Eclipse IA, nous faisons appel à des
              partenaires techniques de confiance agissant en tant que sous-traitants :
            </p>

            <ul>
              <li>
                <strong>Hébergement et authentification :</strong> Infrastructure
                technique et base de données (ex. Firebase / Google Cloud).
              </li>
              <li>
                <strong>Paiements :</strong> Prestataires de services de paiement
                sécurisés (ex. Stripe).
              </li>
              <li>
                <strong>Fournisseurs d'Intelligence Artificielle :</strong> API et
                modèles tiers nécessaires au traitement de vos prompts et à la
                génération des contenus multimodaux.
              </li>
            </ul>

            <p>
              Vos données ne sont ni vendues ni louées à des tiers à des fins
              commerciales ou publicitaires.
            </p>
          </section>


          {/* ======================================================
              5. CONSERVATION
          ====================================================== */}
          <section className="terms-section">
            <h2>5. Durée de Conservation des Données</h2>

            <p>
              Vos données personnelles sont conservées aussi longtemps que
              nécessaire pour satisfaire aux finalités pour lesquelles elles ont
              été collectées :
            </p>

            <ul>
              <li>
                <strong>Compte actif :</strong> Les données de votre profil et
                vos créations sont conservées pendant toute la durée d'utilisation
                de votre compte.
              </li>
              <li>
                <strong>Compte supprimé :</strong> En cas de suppression de compte,
                vos données personnelles sont effacées ou anonymisées, à l'exception
                des pièces comptables et justificatives que nous avons l'obligation
                légale de conserver (généralement 10 ans).
              </li>
            </ul>
          </section>


          {/* ======================================================
              6. SÉCURITÉ
          ====================================================== */}
          <section className="terms-section">
            <h2>6. Sécurité des Données</h2>

            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées (chiffrement des communications via HTTPS, protocoles
              de sécurité Firebase, hachage des mots de passe) afin de protéger
              vos données contre tout accès non autorisé, perte, altération ou
              divulgation.
            </p>
          </section>


          {/* ======================================================
              7. VOS DROITS
          ====================================================== */}
          <section className="terms-section">
            <h2>7. Vos Droits (RGPD)</h2>

            <p>
              Conformément à la réglementation européenne sur la protection des
              données, vous disposez des droits suivants concernant vos informations :
            </p>

            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données.</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes.</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de votre compte et de vos données.</li>
              <li><strong>Droit à la limitation ou d'opposition :</strong> limiter ou vous opposer à certains traitements.</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré.</li>
            </ul>

            <p>
              Vous pouvez exercer ces droits directement depuis les paramètres
              de votre compte ou en contactant notre support.
            </p>
          </section>


          {/* ======================================================
              8. CONTACT
          ====================================================== */}
          <section className="contact-box">
            <h2>Des questions sur vos données ?</h2>

            <p>
              Pour toute demande relative à notre politique de confidentialité
              ou pour exercer vos droits, notre équipe est à votre écoute.
            </p>

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

export default PrivacyPolicyPage;