import React, { useEffect } from 'react';
import './TermsPage.css';

const TermsPage = ({ onBack, onContactClick }) => {

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
          <h1>Conditions Générales d'Utilisation</h1>
          <p>
            Dernière mise à jour : 8 septembre 2026 — Eclipse IA
          </p>
        </header>

        <div className="terms-content">

          {/* ======================================================
              1. OBJET ET ÉDITEUR
          ====================================================== */}
          <section className="terms-section">
            <h2>1. Objet et Éditeur du Service</h2>

            <p>
              Les présentes Conditions Générales d'Utilisation (« CGU »)
              régissent l'utilisation de la plateforme Eclipse IA,
              accessible depuis son site internet et ses interfaces associées.
            </p>

            <p>
              Eclipse IA est un studio de création multimodale permettant
              notamment de générer, transformer et traiter des contenus
              textuels, visuels, audio et vidéo à l'aide de technologies
              d'intelligence artificielle.
            </p>

            <p>
              <strong>Éditeur du service :</strong> Eclipse IA est exploité par l'éditeur identifié dans les Mentions légales du site. Les informations légales complètes (identifiants, coordonnées, hébergeur, etc.) sont disponibles sur la page « Mentions légales ».
            </p>
          </section>


          {/* ======================================================
              2. ÉLIGIBILITÉ
          ====================================================== */}
          <section className="terms-section">
            <h2>2. Conditions d'Éligibilité et d'Âge</h2>

            <p>
              L'utilisation d'Eclipse IA est réservée aux personnes
              âgées de 13 ans ou plus, sous réserve des règles d'âge
              applicables dans leur pays de résidence.
            </p>

            <p>
              Lorsque la législation applicable impose un âge minimum
              supérieur, cet âge minimum prévaut.
            </p>

            <p>
              Les utilisateurs mineurs doivent disposer, lorsque la loi
              l'exige, de l'autorisation de leur représentant légal.
            </p>

            <p>
              Si vous utilisez Eclipse IA au nom d'une entreprise,
              d'une association ou de toute autre organisation, vous
              garantissez disposer des pouvoirs nécessaires pour agir
              au nom de cette entité.
            </p>
          </section>


          {/* ======================================================
              3. COMPTE
          ====================================================== */}
          <section className="terms-section">
            <h2>3. Compte et Sécurité</h2>

            <p>
              L'utilisateur est responsable de l'exactitude des
              informations fournies lors de la création et de
              l'utilisation de son compte.
            </p>

            <p>
              L'utilisateur est responsable de la confidentialité de
              ses identifiants et doit prendre les mesures nécessaires
              pour empêcher tout accès non autorisé à son compte.
            </p>

            <p>
              Il est interdit de :
            </p>

            <ul>
              <li>
                créer plusieurs comptes afin de contourner les
                limitations, restrictions ou promotions du service ;
              </li>

              <li>
                partager, vendre ou louer ses identifiants ;
              </li>

              <li>
                utiliser frauduleusement le compte ou les moyens de
                paiement d'un tiers ;
              </li>

              <li>
                fournir volontairement des informations fausses ou
                trompeuses.
              </li>
            </ul>
          </section>


          {/* ======================================================
              4. ABONNEMENTS ET CRÉDITS
          ====================================================== */}
          <section className="section-critical">
            <h2>4. Abonnements, Éclairs et Diamants</h2>

            <p>
              Eclipse IA peut proposer différents abonnements payants
               ainsi que des unités de consommation appelées
              « Éclairs » et « Diamants ».
            </p>

            <h3>4.1 Abonnements</h3>

            <p>
              Les abonnements sont facturés selon la périodicité et le
              tarif indiqués lors de la souscription.
            </p>

            <p>
              Sauf indication contraire, les abonnements sont
              renouvelés automatiquement à chaque échéance.
            </p>

            <h3>4.2 Résiliation</h3>

            <p>
              L'utilisateur peut résilier son abonnement depuis
              l'interface de gestion de son compte lorsque cette
              fonctionnalité est disponible.
            </p>

            <p>
              La résiliation empêche le renouvellement automatique.
              Sauf disposition contraire ou suspension pour violation
              des présentes conditions, l'accès aux fonctionnalités
              payantes reste disponible jusqu'à la fin de la période
              déjà payée.
            </p>

            <h3>4.3 Éclairs</h3>

            <p>
              Les Éclairs sont des unités de consommation attribuées
              dans le cadre de certains abonnements.
            </p>

            <p>
              Les Éclairs inclus dans un abonnement sont soumis aux
              règles de validité affichées au moment de la souscription.
              Sauf indication contraire, les Éclairs inclus dans une
              période d'abonnement ne sont pas automatiquement
              reportés à la période suivante.
            </p>

            <h3>4.4 Diamants</h3>

            <p>
              Les Diamants sont des unités de consommation pouvant être
              achetées séparément ou proposées dans certaines offres.
            </p>

            <p>
              Sauf indication contraire affichée lors de l'achat,
              les Diamants achetés disposent d'une durée de validité
              d'un an à compter de leur date d'achat.
            </p>

            <p>
              Les crédits et unités de consommation ne constituent
              pas de la monnaie électronique, un compte bancaire ou
              un instrument financier et ne peuvent être convertis
              en espèces.
            </p>
          </section>


          {/* ======================================================
              5. PAIEMENTS ET REMBOURSEMENTS
          ====================================================== */}
          <section className="section-critical">
            <h2>5. Paiements, Échecs de Génération et Remboursements</h2>

            <h3>5.1 Paiement</h3>

            <p>
              Les paiements sont effectués via les moyens de paiement
              proposés lors de la commande et peuvent être traités par
              des prestataires de paiement tiers.
            </p>

            <p>
              L'utilisateur garantit être autorisé à utiliser le moyen
              de paiement sélectionné.
            </p>

            <h3>5.2 Génération réussie</h3>

            <p>
              Lorsqu'une génération est correctement exécutée par le
              service, les unités de consommation correspondant à
              cette génération peuvent être considérées comme utilisées,
              même si le résultat obtenu ne correspond pas aux attentes
              artistiques ou subjectives de l'utilisateur.
            </p>

            <div className="alert-box">
              <p className="alert-title">
                ⚠️ Résultats génératifs
              </p>

              <p>
                Les technologies d'intelligence artificielle sont
                probabilistes. Les résultats peuvent varier d'une
                génération à l'autre et ne sont pas garantis comme
                identiques à une demande précédente.
              </p>

              <p>
                Une insatisfaction subjective concernant le style,
                l'apparence, le mouvement, le rendu artistique ou la
                qualité d'un résultat généré ne constitue pas, à elle
                seule, un motif automatique de remboursement ou de
                recrédit.
              </p>
            </div>

            <h3>5.3 Génération échouée techniquement</h3>

            <p>
              Lorsqu'une génération échoue en raison d'une erreur
              technique imputable à Eclipse IA et que les crédits ont
              été débités, Eclipse IA peut procéder au recrédit
              automatique des unités consommées.
            </p>

            <p>
              Les erreurs provenant notamment d'un fichier invalide,
              d'un contenu interdit, d'un paramètre incompatible,
              d'un fournisseur tiers ou d'une limitation propre à
              un modèle peuvent faire l'objet d'une vérification
              avant tout recrédit.
            </p>

            <h3>5.4 Remboursements</h3>

            <p>
              Les achats de crédits et abonnements ne donnent pas
              automatiquement droit à un remboursement du seul fait
              que l'utilisateur change d'avis ou n'apprécie pas le
              résultat généré, sous réserve des droits impératifs
              prévus par la législation applicable.
            </p>

            <p>
              Cette disposition ne limite pas les droits légaux dont
              bénéficie un consommateur, notamment lorsqu'un
              remboursement est légalement obligatoire en raison
              d'un défaut de conformité, d'une défaillance du service
              ou de toute autre situation prévue par la réglementation
              applicable.
            </p>

            <h3>5.5 Droit de rétractation</h3>

            <p>
              Lorsque la législation applicable accorde au consommateur
              un droit de rétractation, les conditions relatives à ce
              droit sont présentées lors du processus de commande.
            </p>

            <p>
              Lorsque l'exécution immédiate d'un contenu ou service
              numérique entraîne légalement la perte du droit de
              rétractation, le consentement et les informations
              nécessaires sont recueillis conformément aux exigences
              légales applicables.
            </p>
          </section>


          {/* ======================================================
              6. IA
          ====================================================== */}
          <section className="terms-section">
            <h2>6. Fonctionnement des Technologies d'Intelligence Artificielle</h2>

            <p>
              Eclipse IA utilise des technologies d'intelligence
              artificielle générative et peut intégrer différents
              modèles ou fournisseurs techniques.
            </p>

            <p>
              En raison de la nature probabiliste de ces technologies,
              Eclipse IA ne garantit pas qu'un résultat :
            </p>

            <ul>
              <li>
                sera identique à une génération précédente ;
              </li>

              <li>
                correspondra exactement à la demande formulée ;
              </li>

              <li>
                sera exempt d'erreurs visuelles, textuelles, audio,
                vidéo ou conceptuelles ;
              </li>

              <li>
                sera disponible avec chaque modèle à tout moment.
              </li>
            </ul>

            <p>
              Certains modèles peuvent être temporairement indisponibles,
              modifiés, remplacés ou retirés par leurs fournisseurs.
            </p>
          </section>


          {/* ======================================================
              7. CONTENUS IMPORTÉS
          ====================================================== */}
          <section className="terms-section">
            <h2>7. Contenus Importés par l'Utilisateur</h2>

            <p>
              L'utilisateur conserve ses droits sur les images,
              vidéos, fichiers audio, textes et autres éléments
              qu'il importe dans Eclipse IA.
            </p>

            <p>
              En important un contenu, l'utilisateur garantit disposer
              des droits, autorisations et licences nécessaires pour
              permettre son traitement par Eclipse IA et les
              prestataires techniques nécessaires à l'exécution
              de la génération demandée.
            </p>

            <p>
              L'utilisateur reste responsable des contenus qu'il
              fournit au service.
            </p>

            <p>
              L'utilisateur ne doit notamment pas importer de contenu
              dont le traitement serait contraire à la loi ou porterait
              atteinte aux droits de tiers.
            </p>
          </section>


          {/* ======================================================
              8. CONTENUS GÉNÉRÉS
          ====================================================== */}
          <section className="terms-section">
            <h2>8. Contenus Générés et Propriété Intellectuelle</h2>

            <p>
              Dans la mesure permise par la législation applicable,
              l'utilisateur peut utiliser les contenus générés via
              Eclipse IA conformément à son offre et aux présentes
              conditions.
            </p>

            <p>
              L'utilisateur demeure responsable de vérifier que
              l'utilisation d'un contenu généré ne porte pas atteinte
              aux droits de propriété intellectuelle, au droit à
              l'image, aux droits de la personnalité ou à tout autre
              droit d'un tiers.
            </p>

            <p>
              En raison de la nature des technologies génératives,
              des résultats similaires ou identiques peuvent être
              générés pour différents utilisateurs. Eclipse IA ne
              garantit donc pas l'exclusivité ou l'unicité d'un
              résultat généré.
            </p>

            <p>
              L'utilisateur autorise Eclipse IA à héberger, stocker
              temporairement et traiter les contenus nécessaires à
              l'exécution des fonctionnalités demandées.
            </p>
          </section>


          {/* ======================================================
              9. FOURNISSEURS TIERS
          ====================================================== */}
          <section className="terms-section">
            <h2>9. Services et Modèles de Fournisseurs Tiers</h2>

            <p>
              Pour fournir certaines fonctionnalités, Eclipse IA peut
              utiliser des infrastructures, API, modèles d'intelligence
              artificielle, services de stockage ou services techniques
              fournis par des sociétés tierces.
            </p>

            <p>
              Ces fournisseurs peuvent notamment intervenir dans le
              traitement des prompts, images, vidéos, fichiers audio
              ou autres données nécessaires à l'exécution d'une
              génération.
            </p>

            <p>
              La disponibilité, les performances, les limitations et
              les caractéristiques de ces services peuvent évoluer
              indépendamment d'Eclipse IA.
            </p>

            <p>
              Eclipse IA peut modifier, remplacer, suspendre ou
              supprimer temporairement l'accès à un modèle ou à un
              fournisseur lorsque cela est nécessaire au fonctionnement,
              à la sécurité ou à l'évolution du service.
            </p>
          </section>


          {/* ======================================================
              10. RESTRICTIONS
          ====================================================== */}
          <section className="terms-section">
            <h2>10. Restrictions d'Utilisation</h2>

            <p>
              Il est interdit d'utiliser Eclipse IA pour :
            </p>

            <ul>
              <li>
                générer ou diffuser du contenu illégal ;
              </li>

              <li>
                générer du contenu pédopornographique ou sexuel
                impliquant des mineurs ;
              </li>

              <li>
                générer du contenu haineux ou destiné à encourager
                la violence ou la discrimination illégale ;
              </li>

              <li>
                porter atteinte aux droits de propriété intellectuelle
                ou aux droits de tiers ;
              </li>

              <li>
                usurper l'identité d'une personne ou utiliser
                frauduleusement son image ;
              </li>

              <li>
                contourner les systèmes de sécurité ou les limites
                techniques du service ;
              </li>

              <li>
                effectuer du scraping ou de l'extraction automatisée
                non autorisée ;
              </li>

              <li>
                rétro-concevoir ou tenter d'extraire les modèles,
                systèmes ou mécanismes propriétaires d'Eclipse IA ;
              </li>

              <li>
                utiliser des bots, scripts ou systèmes automatisés
                destinés à contourner les limitations ou à surcharger
                volontairement l'infrastructure.
              </li>
            </ul>

            <p
              style={{
                marginTop: '10px',
                fontSize: '0.95em',
                color: '#ff6b6b'
              }}
            >
              <em>
                Toute utilisation frauduleuse ou manifestement abusive
                peut entraîner la suspension ou la résiliation du compte.
              </em>
            </p>
          </section>


          {/* ======================================================
              11. DISPONIBILITÉ
          ====================================================== */}
          <section className="terms-section">
            <h2>11. Disponibilité et Interruptions</h2>

            <p>
              Eclipse IA s'efforce de maintenir le service disponible
              mais ne garantit pas une disponibilité permanente ou
              ininterrompue.
            </p>

            <p>
              Le service peut être temporairement indisponible en
              raison notamment :
            </p>

            <ul>
              <li>de maintenances ;</li>
              <li>d'incidents techniques ;</li>
              <li>de pannes d'infrastructure ;</li>
              <li>de problèmes affectant un fournisseur tiers ;</li>
              <li>de mises à jour ou évolutions du service.</li>
            </ul>
          </section>


          {/* ======================================================
              12. RESPONSABILITÉ
          ====================================================== */}
          <section className="terms-section">
            <h2>12. Garanties et Responsabilité</h2>

            <p>
              Le service est fourni dans la mesure permise par la loi
              applicable et selon les caractéristiques présentées lors
              de son utilisation.
            </p>

            <p>
              Eclipse IA ne saurait être tenue responsable de
              l'utilisation faite par l'utilisateur des contenus
              générés.
            </p>

            <p>
              L'utilisateur est seul responsable de vérifier
              l'adéquation d'un contenu généré à son usage prévu,
              notamment lorsqu'il est utilisé dans un contexte
              commercial, publicitaire, professionnel ou artistique.
            </p>

            <p>
              Aucune disposition des présentes conditions n'a pour
              objet d'exclure ou de limiter une responsabilité qui ne
              peut légalement être exclue ou limitée.
            </p>
          </section>


          {/* ======================================================
              13. SUSPENSION
          ====================================================== */}
          <section className="terms-section">
            <h2>13. Suspension et Résiliation</h2>

            <p>
              Eclipse IA peut suspendre temporairement ou résilier
              un compte lorsqu'une utilisation présente un risque
              de fraude, de sécurité, d'abus manifeste ou de violation
              des présentes conditions.
            </p>

            <p>
              Lorsque les circonstances le permettent, Eclipse IA
              peut informer l'utilisateur du motif de la suspension
              ou de la résiliation.
            </p>

            <p>
              Les mesures prises ne privent pas l'utilisateur des
              droits impératifs qui lui sont accordés par la loi.
            </p>
          </section>


          {/* ======================================================
              14. MODIFICATION DES CONDITIONS
          ====================================================== */}
          <section className="terms-section">
            <h2>14. Modification des Conditions</h2>

            <p>
              Eclipse IA peut faire évoluer les présentes conditions
              afin de tenir compte de l'évolution du service, des
              technologies utilisées, de la réglementation ou de
              ses pratiques commerciales.
            </p>

            <p>
              En cas de modification substantielle, Eclipse IA peut
              en informer les utilisateurs par tout moyen approprié,
              notamment par l'intermédiaire du service ou par courrier
              électronique lorsque cela est nécessaire.
            </p>
          </section>


          {/* ======================================================
              15. INDEMNISATION
          ====================================================== */}
          <section className="terms-section">
            <h2>15. Responsabilité de l'Utilisateur</h2>

            <p>
              L'utilisateur est responsable des conséquences résultant
              de l'utilisation illégale ou abusive du service et des
              contenus qu'il importe ou génère.
            </p>

            <p>
              Lorsque la loi applicable le permet, l'utilisateur
              s'engage à indemniser Eclipse IA contre les réclamations
              résultant directement d'une violation des présentes
              conditions ou d'une utilisation manifestement illégale
              du service.
            </p>
          </section>


        {/* ======================================================
              16. RÉCLAMATIONS ET LITIGES
          ====================================================== */}
          <section className="terms-section">
            <h2>16. Réclamations et Résolution des Litiges</h2>

            <p>
              En cas de difficulté, l'utilisateur est invité à
              contacter en premier lieu le support Eclipse IA afin
              de rechercher une solution amiable.
            </p>

            <p>
              Pour toute réclamation, vous pouvez joindre notre équipe 
              via le bouton de contact ci-dessous ou directement 
              depuis votre espace client. Nous nous efforcerons de 
              traiter votre demande dans les meilleurs délais.
            </p>

            <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
              En l'absence de solution amiable ou pour tout litige relatif 
              à l'interprétation ou à l'exécution des présentes conditions, 
              les tribunaux compétents seront déterminés selon les règles 
              légales applicables.
            </p>
          </section>

          {/* ======================================================
              17. CONTACT
          ====================================================== */}
          <section className="contact-box">
            <h2>Contact</h2>

            <p>
              Pour toute question concernant les présentes conditions,
              votre abonnement, vos crédits ou l'utilisation du service,
              contactez le support Eclipse IA.
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


          {/* ======================================================
              RECAPTCHA
          ====================================================== */}
          <div
            style={{
              fontSize: '12px',
              color: '#888',
              textAlign: 'center',
              marginTop: '30px',
              padding: '0 20px'
            }}
          >
            Ce site est protégé par reCAPTCHA et les
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#aaa', marginLeft: '4px' }}
            >
              Règles de confidentialité
            </a>
            {' '}et
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#aaa', marginLeft: '4px' }}
            >
              Conditions d'utilisation
            </a>
            {' '}de Google s'appliquent.
          </div>

        </div>

        <footer className="terms-footer">
          © 2026 Eclipse IA — Studio de Création Multimodale.
        </footer>

      </div>
    </div>
  );
};

export default TermsPage;