import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  "fr": {    
    "terms": {
  "backToStudio": "Retour au Studio",
  "title": "Conditions Générales d'Utilisation",
  "lastUpdated": "Dernière mise à jour : 8 septembre 2026 — Eclipse IA",
  "sections": {
    "object": {
      "title": "1. Objet et Éditeur du Service"
    },
    "eligibility": {
      "title": "2. Conditions d'Éligibilité et d'Âge"
    },
    "account": {
      "title": "3. Compte et Sécurité"
    },
    "subscriptions": {
      "title": "4. Abonnements, Éclairs et Diamants"
    },
    "payments": {
      "title": "5. Paiements, Échecs de Génération et Remboursements"
    }
  },
  "contact": {
    "title": "Contact",
    "description": "Pour toute question concernant les présentes conditions, votre abonnement, vos crédits ou l'utilisation du service, contactez le support Eclipse IA.",
    "button": "Contacter le support"
  }
},
    "translation": { 
        "line3_app_ui_audio": "Audio",
"line3_app_ui_remix": "Remixer",
"line3_app_ui_nativeAudio": "Audio natif",
"line3_app_ui_characterImage": "Image du personnage",
"line3_app_ui_firstLastFrame": "Première et dernière image",
"line3_app_ui_10s768pOnly": "10 s — 768p uniquement",
      "control_mode_image": "IMAGE",
"control_mode_video": "VIDÉO",
"control_mode_remasterise": "REMASTERISÉ",
"line3_app_annotation_veo3_1_fast": "Veo 3.1 Fast — génération vidéo rapide",
"line3_app_annotation_veo3_1": "Veo 3.1 — génération vidéo haute qualité",
"line3_app_annotation_kling26_motion": "Transfert de mouvement d'une vidéo vers une image",
"line3_app_annotation_kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
"line3_app_annotation_kling26": "Kling 2.6 Pro — génération vidéo",
"line3_app_annotation_hailuo": "Mouvements ultra-réalistes",
"line3_app_annotation_minimax_h3": "MiniMax H3 — génération vidéo",
"line3_app_annotation_pixverse6": "PixVerse V6 — 360p à 1080p, 1 à 15 secondes, audio et multi-shot",
"line3_app_annotation_seedance25": "Seedance 2.5 — références image, vidéo et audio, édition et extension",
"line3_app_annotation_seedance20": "Seedance 2.0 — jusqu'à 9 images, 3 vidéos et 3 références audio",
"line3_app_annotation_seedance": "Audio natif et synchronisation labiale",
"line3_app_annotation_gpt_image2": "Génération et édition d'images, jusqu'à 16 références",
"line3_app_annotation_flux2pro": "FLUX.2 Pro — édition guidée par jusqu'à 9 images",
"line3_app_annotation_nano_banana2_lite": "Génération et édition rapides, jusqu'à 14 images de référence",
      "welcome": "Ovortex",
      "continue google": "Continuer avec Google",
      "continue email": "Continuer avec l'e-mail",
      "password": "Mot de passe",
      "login": "Se connecter",
      "register": "Créer un compte",
      "forgot password": "Mot de passe oublié ?",
      "otp title": "Double Authentification",
      "otp subtitle": "Entrez le code à 6 chiffres reçu par e-mail.",
      "validate code": "Valider le code",
      "remember device": "Se souvenir de ce navigateur pendant 30 jours",
      "text to image": "Du texte à l'image",
      "image to video": "De l'image à la vidéo",
      "production soon": "Production (bientôt)",
      "other tools soon": "Autres outils (Bientôt)",
      "history": "Mes Historiques",
      "pricing": "Tarification",
      "my account": "Mon Compte",
      "logout": "Déconnexion",
      "reset lightning": "Reset Éclairs",
      "validity diamonds": "Validité Diamants",
      "under 30 days": "Sous 30 jours",
      "valid 1 year": "Valable 1 an",
      "legend": "LÉGENDE",
      "elite": "ELITE",
      "master": "MASTER",
      "standard": "STANDARD",
      "essential": "ESSENTIEL",
      "api developer": "API & Module Développeur",
      "beginner": "DÉBUTANT",
      "custom volume title": "Volume sur mesure",
      "loyalty benefit": "Avantage Fidélité",
      "applied to order": "appliqué sur votre commande",
      "adjust slider exact amount": "Ajustez le curseur pour choisir votre montant exact",
      "diamonds": "Diamants",
      "buy volume": "Acheter ce volume",
      "unit price": "Prix unitaire",
      "diamond": "diamant",
      "seedance available": "seedance 2.5 disponible",
      "create instantly": "Créez en un instant.",
      "hero subtitle": "Transformez vos idées en visuels cinématographiques de haute qualité grâce à la puissance de l'intelligence artificielle générative.",
      "generate": "Générer",
      "text to image title": "Du texte à l'image",
      "cinematic image": "cinématique",
      "ai interprets imagination": "L'IA interprète chaque détail de votre imagination.",
      "generate button": "Generate",
      "model": "Modèle",
      "render": "Rendu",
      "contact": {
        "successTitle": "Message envoyé !",
        "successMessage": "Merci {{name}}, nous avons bien reçu votre demande.",
        "replySoon": "Nous vous répondrons bientôt.",
        "title": "Nous contacter",
        "subjectLabel": "Objet de votre demande",
        "subjectInfo": "Renseignement",
        "subjectProblem": "Signaler un problème",
        "subjectQuote": "Demande de devis",
        "messageLabel": "Votre message",
        "messagePlaceholder": "Comment pouvons-nous vous aider ?",
        "back": "Retour",
        "sending": "Envoi...",
        "send": "Envoyer",
        "sendError": "L’envoi a échoué. Veuillez réessayer."
      },
"profile": {
  "within30Days": "Sous 30 jours",
"validYear": "Valable 1 an",
  "back": "Retour",
  "avatarAlt": "Profil",
  "accountStatus": "Statut du compte",
  "lightning": "Éclairs",
  "nextReset": "Prochain reset :",
  "diamonds": "Diamants",
  "expiration": "Expiration :",
  "validYear": "Valable 1 an",
  "changeSubscription": "Modifier mon abonnement",
  "subscriptionCancelled": "Abonnement résilié",
  "cancelling": "Résiliation en cours...",
  "cancelSubscription": "Résilier mon abonnement",
  "contactUs": "Contactez-nous",
  "deleteAccount": "Supprimer mon compte",
  "irreversible": "Action irréversible",
  "activeSubscriptionTitle": "Abonnement actif détecté :",
  "activeSubscriptionMessage": "Vous devez impérativement résilier votre abonnement avant de pouvoir supprimer votre compte.",
  "understood": "Compris",
  "deleteWarning": "La suppression de votre compte entraînera la perte définitive de vos 💎 {{diamonds}} diamants et ⚡ {{lightning}} éclairs.",
  "typeDelete": "Tapez SUPPRIMER pour confirmer :",
  "writeHere": "Écrivez ici...",
  "reconnect": "Se reconnecter",
  "delete": "Supprimer",
  "cancelTitle": "Résilier l'abonnement",
  "cancelConfirmMessage": "Êtes-vous sûr de vouloir résilier votre abonnement ? Vous garderez vos avantages jusqu'à la fin de la période payée.",
  "cancel": "Annuler",
  "confirm": "Confirmer",
  "cancelServerError": "Impossible de joindre le serveur de résiliation."
},

      "hero prompt 1": "Scène ultra-réaliste : un homme s'approche d'un bonhomme de neige et, soudain, un chat surgit et l'attaque au visage...",
      "hero prompt 2": "Scène ultra-réaliste de zombies dans les rues de New York...",
      "hero prompt 3": "Un anime style, fille aux cheveux roses courts assise à table avec un verre de jus d'orange et une part de gâteau aux fraises.",
      "showcase subtitle": "Votre texte devient réalité. Créez des vidéos captivantes instantanément grâce à la puissance de l'IA.",
      "showcase prompt 1": "Cyberpunk street market...",
      "showcase prompt 2": "Anime landscape...",
      "showcase prompt 3": "Macro nature shot...",
      "showcase prompt 4": "Astronaut floating in nebula...",
      "showcase prompt 5": "Deep sea glowing jellyfish...",
      "image to video title": "De l'image à la",
      "cinematic video": "vidéo cinématique",
      "image to video subtitle": "Importez vos visuels et laissez l'IA insuffler la vie à vos idées.",
      "source image": "IMAGE SOURCE",
      "ai result": "RÉSULTAT IA",
      "prompt": "PROMPT",
      "image video prompt 1": "Le crabe qui dance.",
      "image video prompt 2": "Une femme désorientée, au regard égaré, semblant perdue.",
      "image video prompt 3": "Travelling avant jusqu’au gros plan du visage de la femme, qui semble exténuée.",
      "image video prompt 4": "anime cette image : elle fume et regarde la camera",
      "start end title 1": "Cohérence totale du début à la fin",
      "start end desc 1": "Définissez une image de départ et une image de fin. L'IA génère toute la transition fluide entre les deux cadres pour un contrôle artistique absolu.",
      "start end prompt 1": "Transition fluide entre 2 images. Camera en mouvement, elle avance jusqu'a sa victime.",
      "start end title 2": "Métamorphose fluide",
      "start end desc 2": "Guidez l'évolution d'un personnage ou d'un décor d'un état A à un état B sans rupture visuelle.",
      "start end prompt 2": "Transition entre deux images : elle discute complètement bourrée, et puis elle fait une grimasse et vomit.",
      "start end title 3": "Métamorphose fluide",
      "start end desc 3": "Guidez l'évolution d'un personnage ou d'un décor d'un état A à un état B sans rupture visuelle.",
      "start end prompt 3": "Transition entre deux images : elle se met en position de combat",
      "start image": "IMAGE DÉBUT",
      "end image": "IMAGE FIN",
      "transition result": "RÉSULTAT TRANSITION",
      "example": "Exemple",
      "capture title": "Contrôle précis des mouvements de caméra",
      "capture desc": "Définissez des trajectoires de caméra fluides (zoom, panoramique, travelling) pour donner une dimension professionnelle à vos scènes.",
      "capture prompt": "Anime entre 2 images.",
      "motion model": "MODÈLE DE MOUVEMENT",
      "camera control result": "RÉSULTAT CAMÉRA CONTROL",
      "replace title 1": "La liberté créative absolue",
      "replace desc 1": "Remplacer n’importe quel objet devient un jeu d'enfant. Importez votre photo, décrivez votre vision, et l'IA génère un rendu réaliste en quelques secondes. Plus besoin d'outils complexes : votre imagination est la seule limite.",
      "replace prompt 1": "Retire le chat en arriere plan",
      "replace title 2": "Design d'intérieur : Mobilier IA",
      "replace desc 2": "Réinventez votre espace sans effort. Remplacez un vieux meuble par une pièce moderne en gardant l'éclairage naturel.",
      "replace prompt 2": "Retire la paille et le citron.",
      "replace title 3": "Automobile : Personnalisation",
      "replace desc 3": "Visualisez n'importe quelle modification sur un véhicule. Changez la couleur ou les jantes avec une précision chirurgicale.",
      "replace prompt 3": "Retire la pelle",
      "replace photos title": "Réinventez vos photos : Remplacez n'importe quel objet",
      "instant": "instantanément",
      "replace subtitle": "Essayez l’outil IA pour effacer et remplacer un objet indésirable par l’élément de votre choix.",
      "model example": "Modèle",
      "social media title": "Dominez l'attention sur les",
      "social media": "réseaux sociaux",
      "social media subtitle": "Transformez vos idées en contenus viraux optimisés pour TikTok et Instagram.",
      "cutting edge technology": "Technologie de pointe",
      "advanced engines": "Propulsé par les moteurs",
      "most advanced in world": "les plus avancés au monde",
      "video": "VIDEO",
      "hybride": "HYBRIDE",
      "image": "IMAGE",
      "texte": "TEXTE",
      "faq title": "Foire Aux",
      "faq highlight": "Questions",
      "faq question 1": "Qu'est-ce que Eclipse et comment ça fonctionne ?",
      "faq answer 1": "Eclipse est un studio de création propulsé par l'IA qui transforme vos idées en œuvres cinématographiques. Nous utilisons une architecture hybride combinant les meilleurs moteurs de génération actuels avec notre propre technologie d'optimisation pour garantir une fluidité et une esthétique professionnelle.",
      "faq question 2": "Ai-je besoin de compétences techniques pour utiliser Eclipse ?",
      "faq answer 2": "Absolument pas. Eclipse a été conçu pour simplifier la création. Il vous suffit de décrire votre scène ou d'importer une image, et notre interface s'occupe de configurer les réglages complexes des moteurs pour générer un résultat de haute qualité.",
      "faq question 3": "Quels sont les moteurs de génération utilisés ?",
      "faq answer 3": "Plutôt que de nous limiter à un seul modèle, Eclipse sélectionne dynamiquement le moteur le plus performant selon votre demande. Que ce soit pour un rendu cinématographique, de l'animation stylisée ou des mouvements de caméra complexes, nous exploitons la puissance des moteurs leaders du marché pour vous offrir le meilleur résultat possible.",
      "faq question 4": "Les vidéos générées m'appartiennent-elles ?",
      "faq answer 4": "Oui, vous détenez l'intégralité des droits sur les contenus créés avec Eclipse. Vous pouvez les utiliser pour vos réseaux sociaux, vos publicités ou vos projets personnels sans aucune restriction.",
      "faq question 5": "Quelle est la durée maximale des vidéos ?",
      "faq answer 5": "Actuellement, vous pouvez générer des clips allant de 4 à 15 secondes. Grâce à notre fonction d'extension, vous pouvez ensuite prolonger ces séquences pour créer des récits plus longs tout en conservant une cohérence visuelle parfaite.",
      "cinematic excellence accessible": "L'excellence cinématique accessible à tous.",
      "tools": "Outils",
      "terms of sale": "Conditions Générales de Vente",
      "company": "Entreprise",
      "legal notice": "Mentions Légales",
      "back to top": "Revenir en haut",
      "community": "Communauté",
      "all rights reserved": "Tous droits réservés.",
      "powered by leading engines": "Propulsé par les moteurs de génération leaders du marché.",
      "quick boost title": "Besoin d'un boost rapide ?",
      "subscriber rate active": "Tarif abonné activé !",
      "exclusive discounts": "Profitez de vos réductions exclusives",
      "diamonds valid one year": "Les Diamants sont valables pendant 1 an",
      "popular": "POPULAIRE",
      "best value": "MEILLEUR TAUX",
      "diamond pack spark": "Étincelle",
      "diamond pack supernova": "Supernova",
      "diamond pack galaxy": "Galaxie",
      "diamond pack pulsar": "Pulsar",
      "diamond pack quasar": "Quasar",
      "diamond pack universe": "Univers",
      "buy": "Acheter",
      "continue apple": "Continuer avec Apple",
      "or": "OU",
      "your email": "Votre e-mail",
      "create my account": "Créer mon compte",
      "already have account": "Déjà un compte ?",
      "new here": "Nouveau ici ?",
      "create account": "Créer un compte",
      "reset password": "Réinitialiser le mot de passe",
      "reset password description": "Entrez votre e-mail pour recevoir un lien de récupération.",
      "send link": "Envoyer le lien",
      "back to login": "Retour à la connexion",
      "by continuing you accept": "En continuant, vous acceptez les",
      "terms of use": "Conditions d'utilisation",
      "and": "et la",
      "privacy policy": "Politique de Confidentialité",
      "allow popups login": "Autorisez les popups pour vous connecter",
      "google login error": "Erreur lors de la connexion avec Google",
      "apple login error": "Erreur lors de la connexion avec Apple",
      "enter email": "Saisissez votre e-mail",
      "link sent to": "Lien envoyé à",
      "account not found": "Compte inexistant",
      "check email": "Vérifiez votre e-mail",
      "otp sending error": "Erreur lors de l'envoi du code OTP",
      "verification code sent": "Un code de vérification vous a été envoyé par e-mail.",
      "email already in use": "Cet e-mail est déjà associé à un compte.",
      "invalid email password": "Adresse e-mail ou mot de passe incorrect.",
      "invalid email format": "Le format de l'adresse e-mail est invalide.",
      "weak password": "Le mot de passe doit contenir au moins 6 caractères.",
      "unexpected error": "Une erreur est survenue. Veuillez réessayer.",
      "invalid code": "Code invalide",
      "code validation error": "Erreur lors de la validation du code",
      "custom serenity pack": "Personnalisez votre Pack Sérénité",
      "support type": "Nature de l'accompagnement",
      "one time project": "Projet Ponctuel",
      "monthly support": "Accompagnement Mensuel (Sérénité)",
      "professional photos": "Nombre de photos pro",
      "ai professional videos": "Nombre de vidéos (IA Pro)",
      "social media management": "Gestion des réseaux sociaux",
      "one time estimate": "Estimation de votre projet unique",
      "monthly estimate": "Estimation de votre investissement mensuel",
      "per month": "/mois",
      "one time": "Ponctuel",
      "monthly serenity": "Mensuel (Pack Sérénité)",
      "hello": "Bonjour,",
      "quote request intro": "Je souhaite obtenir un devis pour un Pack Sérénité personnalisé :",
      "type label": "TYPE",
      "photos label": "PHOTOS",
      "professional visuals": "visuels pro",
      "videos label": "VIDÉOS",
      "ai sequences": "séquences IA",
      "social media label": "RÉSEAUX SOCIAUX",
      "yes included": "OUI (Inclus)",
      "no": "NON",
      "estimate label": "ESTIMATION",
      "thank you": "Merci.",
      "request serenity quote": "Demander mon Devis Sérénité",
      "free analysis 24h": "Analyse gratuite de votre projet sous 24h",
      "back": "Retour",
      "choose your power": "Choisissez votre puissance",
      "power your creativity": "Propulsez votre créativité avec les meilleurs moteurs d'IA mondiaux",
      "monthly": "Mensuel",
      "yearly": "Annuel",
      "no commitment": "Sans Engagement",
      "ideal to test engines": "Idéal pour tester nos moteurs",
      "lightnings": "Éclairs",
      "month": "mois",
      "reset each month": "réinitialisés chaque mois",
      "access all engines": "Accès à tous les moteurs (selon les packs)",
      "optimized prompt": "Fonction prompt optimisée",
      "prompt models access": "Accès aux modèles de prompts",
      "packs purchase access": "Accès à l'achat de Packs",
      "explore studio": "Explorer le Studio",
      "best value quality price": "LE MEILLEUR RAPPORT QUALITÉ/PRIX",
      "hd image flux": "Image Haute Définition : Flux Dev / Schnell",
      "hd video engines": "Vidéo Haute Définition : HD & FULL HD",
      "up to 33 videos or 300 images": "Jusqu'à 33 vidéos HD ou 300 images",
      "subscribe now": "S'abonner maintenant",
      "most popular": "PLUS POPULAIRE",
      "all image video engines hd": "Tous les moteurs Image & Vidéo inclus HD & FULL HD",
      "up to 77 videos or 700 images": "Jusqu'à 77 vidéos HD ou 700 images",
      "become standard": "Devenir Standard",
      "plus 60 creative power": "+60% DE PUISSANCE CRÉATIVE",
      "up to 134 videos or 1200 images": "Jusqu'à 134 vidéos HD ou 1200 images",
      "upgrade master": "Passer au Master",
      "ultimate offer": "OFFRE ULTIME",
      "for intensive creators": "POUR LES CRÉATEURS INTENSIFS",
      "up to 277 videos or 2500 images": "Jusqu'à 277 vidéos HD ou 2500 images",
      "max server priority": "Priorité Max sur les serveurs (No queue)",
      "join elite": "Rejoindre l'Elite",
      "premium agency": "PREMIUM AGENCE",
      "ultimate tool pro studios": "L'OUTIL ULTIME DES STUDIOS PRO",
      "up to 888 videos or 8000 images": "Jusqu'à 888 vidéos HD ou 8000 images",
      "become legend": "Devenir une Légende",
      "concierge": "CONCIERGERIE",
      "zero effort pro result": "ZÉRO EFFORT, RÉSULTAT PRO",
      "quote": "Sur Devis",
      "project": "projet",
      "we prompt for you": "On prompte à votre place",
      "high quality image video": "Génération d'images & vidéos haute qualité",
      "upscale pro retouching": "Upscale et retouches pro incluses",
      "contact us": "Contactez-nous",
      "recharge on demand": "Ou Rechargez à la carte",
      "subscription diamonds note": "Les Éclairs d'abonnement expirent chaque mois. Les Diamants (recharges) sont conservés pendant un an.",
      "request sent": "Demande envoyée !",
      "request received": "Nous avons bien reçu vos informations, nous reviendrons vers vous rapidement.",
      "quote request": "Demande de devis",
      "information": "Renseignement",
      "report problem": "Signaler un problème",
      "request details placeholder": "Détaillez votre demande ici...",
      "cancel": "Annuler",
      "sending": "Envoi...",
      "send": "Envoyer",
      "login required diamonds": "Erreur : Tu dois être connecté pour acheter des diamants !",
      "login required subscription": "Veuillez vous connecter pour vous abonner.",
      "tutorialUi": {
        "academyImage": "OVORTEX ACADEMY · IMAGE",
        "academyVideo": "OVORTEX ACADEMY · VIDÉO",
        "stepGuide": "📘 Guide pas à pas",
        "promptExample": "✨ Exemple de prompt",
        "featuresTitle": "Fonctions propres à ce moteur",
        "stepByStep": "Guide pas à pas",
        "tip": "Conseil : changez un seul élément à la fois pour comprendre ce qui améliore le résultat.",
        "resources": "Documentation et ressources",
        "resourcesPending": "Cette section sera complétée avec des ressources vidéo vérifiées pour ce modèle. En attendant, consultez la documentation du moteur lorsqu’un lien officiel est disponible.",
        "engineDocs": "Documentation du moteur",
        "promptHint": "Remplacez les éléments entre crochets par votre idée. Ce modèle est un point de départ : adaptez-le aux images et options que vous avez ajoutées.",
        "imagePromptHint": "Remplacez les indications entre crochets par votre idée. Les numéros d’images doivent correspondre aux références ajoutées dans le panneau.",
        "copied": "Copié !",
        "copyUnavailable": "Copie indisponible dans ce navigateur : sélectionnez le texte ci-dessus.",
        "copyUnavailableImage": "Copie indisponible : sélectionnez le texte puis copiez-le.",
        "copyPrompt": "📋 Copier le prompt",
        "usePrompt": "Utiliser dans le champ de génération",
        "promptCopied": "Prompt copié !",
        "aboutEngine": "À savoir sur ce moteur",
        "recommendedSteps": "Étapes recommandées",
        "seeExample": "Voir le prompt exemple →",
        "closeTutorial": "Fermer le tutoriel",
        "videoPromptHint": "Remplacez les éléments entre crochets par les détails de votre vidéo.",
        "modelOptionsMayVary": "les réglages disponibles peuvent varier selon le moteur. Fiez-vous aux options réellement affichées dans Ovortex plutôt qu’à celles présentées dans une vidéo externe."
      },
      "tutorials": {
        "image": {
          "gpt_image2": {
            "objective": "Créer une image précise ou retoucher une image existante en conservant les éléments importants.",
            "features": [
              "Jusqu’à 16 images de référence.",
              "Réglage de qualité : Auto, faible, équilibrée ou haute.",
              "Utile pour les retouches guidées et les consignes détaillées."
            ],
            "steps": [
              "Ajoutez les images utiles dans la zone de dépôt. Utilisez une référence par rôle : visage, tenue, décor, produit ou style.",
              "Dans le prompt, nommez les références par numéro et expliquez ce qu’il faut reprendre de chacune.",
              "Séparez les éléments à conserver des changements demandés : ‘garder le visage, changer le décor’.",
              "Choisissez la qualité. Commencez par Auto ou Équilibrée, puis passez en Haute si le niveau de détail est prioritaire.",
              "Si le résultat n’est pas assez fidèle, simplifiez la demande et précisez les détails à préserver."
            ],
            "prompt": "Utilise l’image 1 comme référence principale pour [SUJET / IDENTITÉ]. Utilise l’image 2 pour [VÊTEMENTS / COULEURS / STYLE] et l’image 3 pour [DÉCOR / COMPOSITION], si elles sont fournies. Crée [RÉSULTAT SOUHAITÉ]. Conserve impérativement [ÉLÉMENTS À PRÉSERVER]. Modifie uniquement [ÉLÉMENTS À CHANGER]. Éclairage : [TYPE]. Rendu : [STYLE / NIVEAU DE RÉALISME]."
          },
          "flux2pro": {
            "objective": "Construire une image avec une composition maîtrisée, des détails précis et des références visuelles cohérentes.",
            "features": [
              "Jusqu’à 9 images de référence.",
              "Réglage de tolérance de sécurité de 0 à 5.",
              "Les références peuvent guider le sujet, la palette, les textures ou la composition."
            ],
            "steps": [
              "Ajoutez jusqu’à 9 références nettes et complémentaires.",
              "Attribuez une fonction à chaque image : sujet, cadrage, matière, palette ou décor.",
              "Décrivez la composition finale et les éléments à conserver, sans donner de consignes contradictoires.",
              "Gardez la tolérance de sécurité sur sa valeur habituelle si vous n’avez pas de raison de la modifier.",
              "Ajustez le prompt par petites étapes : sujet, lumière, composition, puis détails."
            ],
            "prompt": "Prends l’image 1 comme référence du sujet principal et de sa silhouette. Utilise l’image 2 pour la palette de couleurs et les matières, et l’image 3 pour l’ambiance du décor. Crée [TYPE D’IMAGE] avec [COMPOSITION / CADRAGE], [ÉCLAIRAGE] et [STYLE]. Préserve [DÉTAILS IMPORTANTS]. Ne reprends pas [ÉLÉMENTS À EXCLURE] des références.",
            "resourceUrl": "https://runware.ai/models/bfl-flux-2-pro",
            "resourceLabel": "Fiche du modèle sur Runware"
          },
          "nano_banana2_lite": {
            "objective": "Créer ou transformer rapidement une image en combinant plusieurs références visuelles et, si besoin, une vidéo de référence.",
            "features": [
              "Jusqu’à 14 images et une vidéo de référence.",
              "La vidéo sert de référence visuelle pour guider la création d’une IMAGE FIXE : elle ne produit pas une vidéo.",
              "Le modèle peut s’inspirer de l’apparence, des couleurs, des objets, du décor ou de l’ambiance visibles dans le clip ; il ne faut pas compter sur une reproduction exacte de chaque mouvement ou de chaque image.",
              "Réflexion minimale ou élevée. Avec des images de référence, Ovortex envoie une résolution 1K ; le format peut suivre les images fournies."
            ],
            "steps": [
              "Ajoutez jusqu’à 14 images de référence dans la grille, chacune avec un rôle clair : personnage, objet, décor, style ou palette.",
              "Pour ajouter une vidéo, cliquez sur ‘Choisir une vidéo’, sélectionnez un fichier vidéo, puis attendez la confirmation d’ajout. Une seule vidéo peut être utilisée à la fois.",
              "Important : la vidéo est une référence pour guider l’apparence de l’image finale. Nano Banana 2 Lite génère ici une image fixe, pas une vidéo animée à partir de votre clip.",
              "Dans votre prompt, précisez ce que le modèle doit reprendre de la vidéo (par exemple l’ambiance du décor, les couleurs, les vêtements ou un objet visible) et ce qu’il ne doit pas reprendre. Les mouvements du clip ne seront pas nécessairement reproduits fidèlement dans l’image.",
              "Décrivez ensuite ce qui doit rester identique et ce qui doit être transformé. Nommez les images par numéro pour éviter toute ambiguïté.",
              "Choisissez ‘Minimale’ pour privilégier la rapidité ou ‘Élevée’ pour accorder plus de réflexion au modèle. Laissez Température, Top P et l’instruction système à leurs valeurs initiales si vous ne maîtrisez pas ces réglages.",
              "Si vous fournissez des images, leur format peut influencer celui du résultat."
            ],
            "prompt": "Utilise l’image 1 pour [SUJET / IDENTITÉ], l’image 2 pour [DÉCOR / STYLE] et l’image 3 pour [COULEURS / OBJET], si disponibles. Inspire-toi de la vidéo de référence pour [APPARENCE DU DÉCOR / PALETTE / OBJETS / AMBIANCE VISUELLE], sans chercher à reproduire exactement ses mouvements. Crée une IMAGE FIXE montrant [SCÈNE SOUHAITÉE]. Conserve [ÉLÉMENTS À GARDER] et transforme [ÉLÉMENTS À MODIFIER]. Lumière : [TYPE]. Rendu : [STYLE].",
            "resourceUrl": "https://runware.ai/models/google-nano-banana-2-lite",
            "resourceLabel": "Fiche du modèle sur Runware"
          }
        },
        "video": {
          "default": {
            "objective": "Guide de démarrage pour le moteur vidéo sélectionné.",
            "features": [
              "Les options visibles dans Ovortex sont la référence pour ce moteur."
            ],
            "steps": [
              "Choisissez Texte → Vidéo ou Image → Vidéo selon les options proposées.",
              "Décrivez le sujet, son action et le décor avec des éléments concrets.",
              "Ajoutez un mouvement de caméra et une ambiance lumineuse cohérents.",
              "Vérifiez la durée, la résolution, les médias de référence et l'audio disponibles pour ce modèle.",
              "Pour améliorer un résultat, ne changez qu'un ou deux éléments à la fois."
            ],
            "prompt": "Plan vidéo : [SUJET] réalise [ACTION PRÉCISE] dans [LIEU]. Cadrage : [TYPE DE PLAN]. Caméra : [MOUVEMENT]. Lumière : [ÉCLAIRAGE]. Ambiance : [TON]. Décrire une action continue, des mouvements crédibles et une apparence cohérente. Préserver [ÉLÉMENTS À CONSERVER]."
          },
          "veo3.1": {
            "objective": "Veo 3.1 : piloter une scène avec des images de référence, de l'audio natif et, sur ce modèle, des opérations sur une vidéo source.",
            "features": [
              "Jusqu'à 3 images de référence dans le panneau Veo : utilisez-les pour guider l'apparence des personnages, des objets ou de l'univers visuel.",
              "Audio natif activé dans la configuration du moteur ; décrivez les sons, l'ambiance ou les dialogues souhaités dans le prompt.",
              "Durées proposées dans Ovortex : 4, 6 ou 8 secondes ; résolutions affichées : 720p et 1080p.",
              "Le code d'Ovortex prévoit les opérations de modification ou de prolongation avec une vidéo source pour Veo 3.1."
            ],
            "steps": [
              "Ajoutez jusqu'à trois images de référence et attribuez mentalement un rôle à chacune : personnage, décor, objet ou style.",
              "Dans le prompt, précisez ce qui doit être repris de chaque référence et ce qui doit évoluer pendant le plan.",
              "Décrivez séparément l'action, le cadrage, le mouvement de caméra et l'ambiance sonore.",
              "Si vous travaillez sur une vidéo existante, chargez la vidéo source et choisissez l'opération proposée par l'interface.",
              "Vérifiez la durée et la résolution avant la génération ; une consigne concise et non contradictoire facilite le contrôle du résultat."
            ],
            "prompt": "Créer un plan cinématographique de [DURÉE] : [PERSONNAGE / SUJET] effectue [ACTION] dans [DÉCOR]. Référence 1 : préserver [APPARENCE DU PERSONNAGE]. Référence 2 : reprendre [DÉCOR / PALETTE DE COULEURS]. Référence 3 : reprendre [OBJET / STYLE], si elle est fournie. Caméra : [CADRAGE ET MOUVEMENT]. Éclairage : [LUMIÈRE]. Audio : [AMBIANCE, EFFETS SONORES ET/OU DIALOGUE]. Garder les mouvements naturels et la continuité visuelle."
          },
          "veo3.1_fast": {
            "objective": "Veo 3.1 fast : créer rapidement un clip guidé par un prompt et jusqu'à trois images de référence.",
            "features": [
              "Jusqu'à 3 images de référence via le panneau Veo.",
              "Audio natif et amélioration de prompt activés dans la configuration du moteur.",
              "Durées proposées : 4, 6 ou 8 secondes ; résolutions affichées : 720p et 1080p.",
              "Les opérations de prolongation et de modification avec une vidéo source sont disponibles dans Ovortex pour Veo 3.1 et Veo 3.1 Fast."
            ],
            "steps": [
              "Choisissez ce modèle lorsque vous souhaitez itérer rapidement sur une idée.",
              "Ajoutez jusqu'à trois images de référence si vous devez conserver un personnage, un objet ou une direction artistique.",
              "Décrivez une action principale et un mouvement de caméra simple.",
              "Précisez l'audio souhaité dans le prompt puisque la génération audio est activée.",
              "Testez d'abord une version courte, puis ajustez le prompt ou les références si nécessaire."
            ],
            "prompt": "Clip cinématographique : [SUJET] réalise [ACTION UNIQUE] dans [LIEU]. Utiliser les références pour conserver [APPARENCE / OBJETS / STYLE]. Plan [CADRAGE], caméra [MOUVEMENT SIMPLE], éclairage [TYPE]. Audio : [SONS D'AMBIANCE / EFFETS / DIALOGUE]. Mouvement fluide, identité visuelle constante, scène lisible sans action contradictoire."
          },
          "seedance25": {
            "objective": "Seedance 2.5 : composer une vidéo avec de nombreuses références multimodales, ou modifier/prolonger une vidéo source.",
            "features": [
              "Jusqu'à 30 images de référence, 10 vidéos de référence et 10 audios de référence selon le mode utilisé.",
              "Durées configurées dans Ovortex de 4 à 30 secondes ; résolutions tarifées actuellement : 480p et 720p.",
              "Opération sur la vidéo source : Prolonger ou Modifier.",
              "Le mode vidéo source prend la priorité : il ne se combine pas avec le panneau de références multimodales ni les slots première/dernière image."
            ],
            "steps": [
              "Pour un projet guidé par références, ajoutez des images de personnages, costumes, accessoires, lieux ou style. Le panneau permet jusqu'à 30 images.",
              "Ajoutez, si utile, des vidéos pour guider le mouvement et des audios pour guider l'ambiance sonore ou la voix ; respectez les limites affichées.",
              "Dans le prompt, expliquez le rôle des références par groupes : identité du personnage, décor, mouvement, palette, ambiance ou son.",
              "Pour prolonger ou modifier une vidéo existante, utilisez le slot de vidéo source et sélectionnez l'opération correspondante. Ce mode remplace l'utilisation des références multimodales dans l'interface actuelle.",
              "Choisissez une durée adaptée à la quantité d'actions : structurez le prompt dans l'ordre chronologique et évitez de multiplier les scènes sans nécessité."
            ],
            "prompt": "Créer une séquence de [DURÉE] à partir des médias fournis. Références personnage : [IMAGES À UTILISER POUR L'IDENTITÉ ET LES VÊTEMENTS]. Références décor : [IMAGES DES LIEUX]. Références de mouvement : [VIDÉOS ET MOUVEMENTS À REPRENDRE]. Référence audio : [AMBIANCE / VOIX / RYTHME]. Déroulement : 1) [ACTION INITIALE], 2) [ACTION SUIVANTE], 3) [FIN DU PLAN]. Caméra : [CADRAGE ET MOUVEMENT]. Préserver la cohérence des personnages, des objets, de la lumière et du mouvement."
          },
          "seedance20": {
            "objective": "Seedance 2.0 : diriger la génération avec des références image, vidéo et audio dans un ensemble multimodal.",
            "features": [
              "Jusqu'à 9 images, 3 vidéos et 3 audios de référence, dans la limite de 12 fichiers au total.",
              "Si une vidéo source est déjà ajoutée, le nombre de vidéos de référence autorisées est réduit dans l'interface.",
              "Durées configurées : 4 à 15 secondes ; résolutions disponibles dans le catalogue : 480p, 720p et 1080p.",
              "Le panneau multimodal ne se combine pas avec les slots première/dernière image dans l'interface actuelle."
            ],
            "steps": [
              "Ajoutez des images pour les personnages, accessoires ou décors ; utilisez des vidéos pour les mouvements et des audios pour le rythme ou l'ambiance sonore.",
              "Restez dans la limite de 12 médias combinés et gardez à l'esprit les maxima propres à chaque type de média.",
              "Associez chaque référence à une fonction dans le prompt : par exemple, image 1 pour le personnage, image 2 pour le décor, vidéo 1 pour le mouvement.",
              "Décrivez le déroulement dans l'ordre : début, action principale, résultat final.",
              "Choisissez la résolution et la durée selon le niveau de détail et le coût souhaités."
            ],
            "prompt": "Créer une vidéo cohérente en utilisant les médias de référence selon leur rôle : image 1 = [PERSONNAGE], image 2 = [DÉCOR], image 3 = [OBJET / STYLE], vidéo 1 = [MOUVEMENT À REPRENDRE], audio 1 = [AMBIANCE / RYTHME] si fourni. Action : [DÉBUT], puis [ACTION], puis [FIN]. Caméra : [CADRAGE / MOUVEMENT]. Conserver l'identité, les proportions et la continuité de la scène."
          },
          "seedance": {
            "objective": "Seedance 1.5 Pro : créer des clips avec audio natif et synchronisation labiale, ou guider une transition avec des images de début/fin.",
            "features": [
              "Audio natif et lip-sync synchronisés selon l'annotation du moteur dans Ovortex.",
              "Durées configurées : 4 à 12 secondes ; résolutions proposées : 480p, 720p et 1080p.",
              "Le catalogue indique la prise en charge des images de début/fin, mais pas le mode double image classique."
            ],
            "steps": [
              "Décrivez le personnage, le dialogue ou le son attendu et l'action en une séquence claire.",
              "Pour un personnage qui parle, écrivez les paroles exactes et indiquez le ton, l'émotion et le rythme de diction.",
              "Si vous utilisez des images de début et de fin, assurez-vous qu'elles représentent des étapes visuellement compatibles.",
              "Décrivez le mouvement de caméra et les changements entre les deux images sans surcharger le prompt.",
              "Vérifiez la durée, la résolution et les options réellement affichées dans le studio."
            ],
            "prompt": "Plan avec audio synchronisé : [PERSONNAGE] dans [DÉCOR]. Il/elle [ACTION] et dit : « [DIALOGUE EXACT] », avec une émotion [ÉMOTION] et un rythme [RYTHME]. Caméra [CADRAGE / MOUVEMENT], lumière [ÉCLAIRAGE]. Synchronisation labiale naturelle, expressions cohérentes, mouvement fluide."
          },
          "kling2.6": {
            "objective": "Kling 2.6 Pro : produire un clip en Full HD avec mouvement maîtrisé et audio selon la configuration du moteur.",
            "features": [
              "Durées tarifées/configurées dans Ovortex : 5 ou 10 secondes, en 1080p.",
              "Audio activé dans la configuration du modèle.",
              "Le catalogue actuel n'active pas le mode double image classique pour ce modèle."
            ],
            "steps": [
              "Pour Image → Vidéo, choisissez une image nette où le sujet et ses contours sont bien visibles.",
              "Décrivez précisément le mouvement du sujet et ce qui doit rester stable : visage, vêtements, décor ou accessoires.",
              "Choisissez un seul mouvement de caméra dominant pour garder un résultat lisible.",
              "Si l'audio est pertinent, décrivez les sons ou dialogues souhaités sans mélanger plusieurs événements incompatibles.",
              "Utilisez 5 secondes pour une action simple et 10 secondes si l'action nécessite davantage de temps."
            ],
            "prompt": "À partir de l'image de départ, conserver l'identité, le visage, les vêtements et le décor. [SUJET] effectue [ACTION EN UNE SÉQUENCE]. Caméra : [MOUVEMENT]. Éclairage : [LUMIÈRE]. Audio : [AMBIANCE / EFFETS / DIALOGUE]. Mouvement naturel, continuité visuelle, proportions cohérentes, aucun changement non demandé."
          },
          "kling26_motion": {
            "objective": "Kling 2.6 Motion Control : transférer le mouvement d'une vidéo de référence vers un personnage fourni en image.",
            "features": [
              "Fonction centrale : vidéo de mouvement source + image du personnage à animer.",
              "Durées disponibles dans le catalogue : 5 ou 10 secondes, en 1080p.",
              "Ce modèle n'utilise pas le mode double image classique."
            ],
            "steps": [
              "Importez une image du personnage avec le corps aussi visible que possible et sans membres importants coupés par le cadre.",
              "Ajoutez une vidéo source où le mouvement est lisible, bien éclairé et reste dans le cadre.",
              "Choisissez une vidéo dont la posture, l'orientation et la silhouette sont compatibles avec le personnage de l'image.",
              "Le mouvement vient principalement de la vidéo source : utilisez le prompt pour guider le rendu, l'apparence et le décor.",
              "Si le transfert est instable, simplifiez le mouvement ou essayez une source plus claire plutôt que d'ajouter des instructions contradictoires."
            ],
            "prompt": "Transférer le mouvement de la vidéo source sur le personnage de l'image de référence. Préserver son identité, son visage, ses vêtements et ses proportions. Décor : [DÉCOR]. Style : [STYLE VISUEL]. Éclairage : [LUMIÈRE]. Garder un mouvement fluide et fidèle à la vidéo, sans déformation du corps ni changement d'identité."
          },
          "kling30": {
            "objective": "Kling 3.0 : construire un plan ou une séquence avec contrôle du début et de la fin lorsque les deux images sont utilisées.",
            "features": [
              "Durées proposées dans le catalogue : 3 à 15 secondes.",
              "Standard en 720p et Pro en 1080p selon le choix de modèle effectué par l'application.",
              "Le catalogue active le support de deux images : utilisez les images de début/fin lorsque l'interface les propose."
            ],
            "steps": [
              "Choisissez le mode texte ou image selon votre point de départ.",
              "Si vous définissez une image de début et une image de fin, vérifiez que le sujet, la perspective et le décor permettent une transition plausible.",
              "Décrivez ce qui change entre les deux images, dans l'ordre chronologique.",
              "Choisissez Standard pour un flux 720p ou Pro pour 1080p selon les options disponibles.",
              "Adaptez la durée à la complexité du mouvement et gardez un objectif principal par clip."
            ],
            "prompt": "Créer une transition continue entre l'image de début et l'image de fin. [SUJET] passe de [ÉTAT INITIAL] à [ÉTAT FINAL] en effectuant [ACTION]. Caméra [MOUVEMENT]. Garder la même identité, les vêtements et les éléments du décor cohérents. Transition fluide, physique crédible, sans coupe ni apparition d'objets non demandés."
          },
          "hailuo": {
            "objective": "Hailuo 2.3 : mettre l'accent sur le mouvement réaliste, les expressions et la continuité du sujet.",
            "features": [
              "Le catalogue Ovortex propose 6 secondes en 768p ou 1080p, et 10 secondes en 768p.",
              "Moteur présenté dans l'interface comme orienté vers des mouvements ultra-réalistes.",
              "Le catalogue ne déclare pas la prise en charge du mode double image classique."
            ],
            "steps": [
              "Choisissez une image avec une silhouette claire si vous animez une image existante.",
              "Décrivez une action physique simple, les expressions du visage et les réactions des vêtements ou du décor.",
              "Utilisez un mouvement de caméra modéré pour préserver la stabilité du sujet.",
              "Sélectionnez 6 secondes pour une action courte ; 10 secondes est proposé en 768p dans le catalogue actuel.",
              "Si le résultat se déforme, réduisez le nombre d'actions simultanées et simplifiez le mouvement."
            ],
            "prompt": "[PERSONNAGE] réalise [ACTION PHYSIQUE] avec une expression [ÉMOTION]. Les cheveux, les vêtements et les éléments du décor réagissent naturellement. Plan [CADRAGE], caméra [MOUVEMENT], lumière [ÉCLAIRAGE]. Visage stable, anatomie crédible, mouvement continu et réaliste."
          },
          "minimax_h3": {
            "objective": "MiniMax H3 : travailler avec des références multimodales et un contrôle détaillé de la scène lorsque les options correspondantes sont disponibles.",
            "features": [
              "Le catalogue propose des durées de 4 à 15 secondes.",
              "Résolutions tarifées dans le catalogue : 768p et 1440p (2K).",
              "Le studio dispose d'un panneau de références multimodales pour images, vidéos et audios ; les images de référence sont limitées à 9 dans le code actuel.",
              "La configuration du studio traite l'audio natif de ce modèle comme inclus."
            ],
            "steps": [
              "Utilisez les images pour guider l'identité ou le décor et les médias vidéo/audio pour les éléments qu'ils doivent apporter, selon les options affichées.",
              "Décrivez le rôle de chaque référence plutôt que de laisser le modèle deviner comment les combiner.",
              "Précisez une action principale, puis le mouvement de caméra et le rythme de la scène.",
              "Choisissez 768p ou 1440p selon le niveau de détail recherché et le coût affiché.",
              "Si vous souhaitez un résultat stable, évitez de demander simultanément des changements de personnage, de décor et de style trop importants."
            ],
            "prompt": "Créer une séquence de [DURÉE]. Sujet : [PERSONNAGE / OBJET]. Utiliser les références image pour [IDENTITÉ / DÉCOR], la référence vidéo pour [MOUVEMENT] et l'audio pour [AMBIANCE / VOIX] si fournis. Action : [ACTION]. Caméra : [CADRAGE ET MOUVEMENT]. Lumière : [ÉCLAIRAGE]. Conserver la cohérence des formes, des mouvements et du son."
          },
          "pixverse6": {
            "objective": "PixVerse V6 : ajuster finement la durée, la qualité, le multi-shot et les paramètres créatifs disponibles dans le studio.",
            "features": [
              "Durées proposées : 1 à 15 secondes.",
              "Résolutions disponibles dans le catalogue : 360p, 540p, 720p et 1080p.",
              "Annotation du modèle : audio et multi-shot.",
              "Le panneau PixVerse expose notamment un mode de réflexion, une graine (seed) facultative et un prompt négatif."
            ],
            "steps": [
              "Choisissez la durée en fonction du nombre de plans ou d'actions demandés.",
              "Pour un clip multi-shot, décrivez les plans dans l'ordre et séparez clairement les changements de cadrage.",
              "Utilisez le prompt négatif pour signaler les défauts à éviter, par exemple les déformations ou le flou.",
              "La seed facultative permet de fixer une valeur de génération lorsque vous souhaitez comparer des essais ; elle ne garantit pas à elle seule un résultat identique.",
              "Choisissez la résolution selon vos besoins et les coûts affichés avant de générer."
            ],
            "prompt": "Séquence multi-shot : Plan 1 — [SUJET ET ACTION], cadrage [CADRAGE]. Plan 2 — [ÉVOLUTION DE L'ACTION], caméra [MOUVEMENT]. Plan 3 — [RÉSULTAT FINAL], si la durée le permet. Style [STYLE], lumière [LUMIÈRE], audio [AMBIANCE / EFFETS]. Maintenir l'identité du sujet, la cohérence des mouvements et la continuité visuelle."
          }
        }
      },
      "suggestions": {
        "image": {
          "1": {
            "title": "Ville Cyberpunk",
            "prompt": "Une vue de central park cyberpunk futuriste avec des néons, un éclairage cinématographique, 8k, ultra détaillé"
          },
          "2": {
            "title": "Sniper",
            "prompt": "Un sniper en tenue de camouflage neige, allongé dans la neige profonde, haute montagne, réalisme extrême, angle de vue au ras du sol, focus net sur le fusil, ambiance hivernale hostile, lumière crue de haute altitude"
          },
          "3": {
            "title": "Coucher de soleil",
            "prompt": "Un crabe sur un rocher observe le coucher de soleil sur une plage. La mise au point de la plage est légèrement floutée."
          },
          "4": {
            "title": "Combat dans les ruines urbaines",
            "prompt": "Scène ultra réaliste, Une femme tactique aux cheveux bleus atterrit sur le sol dans un environnement d'immeuble en ruine, le regard perçant et concentré. Sa veste flotte dans les airs alors qu'elle vise le spectateur."
          },
          "5": {
            "title": "Femme dans un penthouse nocturne",
            "prompt": "Illustration anime cinématographique, personnage féminin antagoniste en pied, debout dans un luxueux bureau de penthouse moderne de nuit, braquant un pistolet directement vers la caméra, posture dominante et menaçante, contre-plongée marquée, veste de costume noire élégante, chemise noire ajustée légèrement ouverte au col, pantalon noir cintré, chaîne métallique discrète à la ceinture, une main dans la poche, coupe de cheveux courte dégradée noire, yeux rouges lumineux, peau pâle, expression froide et déterminée, éclairage dramatique, détails ultra-réalistes du visage et des cheveux, sol en marbre noir brillant, grand bureau de direction à l’arrière-plan, fauteuil en cuir, immenses baies vitrées donnant sur une ville illuminée la nuit, reflets réalistes sur les surfaces, ambiance sombre et sophistiquée, style néo-noir, ombres cinématographiques, style anime réaliste, qualité chef-d’œuvre, netteté extrême, éclairage volumétrique, profondeur de champ, contraste élevé, illustration conceptuelle professionnelle, qualité 8K, atmosphère de thriller d’action."
          },
          "6": {
            "title": "Anime",
            "prompt": "Style anime, une jeune femme aux longs cheveux blonds ondulés et aux yeux jaune d'or, assise au centre d'un banc de parc en bois vert. Elle a un bandage elle porte une veste verte ouverte sur un uniforme sombre orné de boutons dorés et d'une écharpe rouge et noire. Un badge rouge est visible sur sa manche. Ses mains sont posées sur ses genoux sur une jupe plissée blanche. Elle se trouve dans un parc. Elle regarde directement l'observateur avec une expression sérieuse."
          },
          "7": {
            "title": "L'Île sous la Pleine Lune",
            "prompt": "Magnifique temple asiatique traditionnel composé de plusieurs pagodes illuminées, situé au bord d'un lac parfaitement calme reflétant l'ensemble de la scène. Immense pleine lune dorée dominant le ciel, reflet complet de la lune dans l'eau. Vallée montagneuse spectaculaire avec falaises verticales majestueuses enveloppées de brume. Forêt d'automne aux couleurs chaudes orange, rouge et or entourant le temple. Lanternes lumineuses créant une ambiance mystique et chaleureuse. Brouillard cinématographique flottant entre les montagnes. Architecture asiatique richement détaillée avec toitures courbées, bois sculpté et éclairages traditionnels. Atmosphère paisible, féerique et spirituelle. Éclairage volumétrique, rayons lumineux subtils, reflets ultra réalistes sur l'eau, composition symétrique parfaite, profondeur de champ naturelle, couleurs riches et contrastées, photoréalisme extrême, ultra detailed, masterpiece, cinematic fantasy landscape, HDR, global illumination, ray tracing, Unreal Engine quality, 8K, ultra sharp focus, highly detailed textures, professional landscape photography, breathtaking scenery, panoramic composition, golden moonlight, realistic mist, award-winning photography."
          },
          "8": {
            "title": "3D",
            "prompt": "Un immense trône royal recouvert de velours rouge et d'ornements dorés richement sculptés, décoré de motifs héraldiques et de statues de lions. Un rat majestueux dort paisiblement sur le trône comme un roi, portant une couronne incrustée de pierres précieuses bleues et dorées. Il tient un sceptre royal délicatement entre ses pattes. L'environnement est une ancienne cathédrale gothique en ruine, avec de gigantesques arches en pierre, des colonnes monumentales et des débris dispersés au sol. De puissants rayons de lumière traversent les hautes fenêtres, illuminant le rat et le trône dans une ambiance sacrée et dramatique. Particules de poussière flottant dans les faisceaux lumineux. Textures ultra détaillées du velours, du bois sculpté, de la pierre ancienne et de la fourrure du rat. Atmosphère cinématographique, fantasy médiévale réaliste, photoréalisme extrême, profondeur de champ naturelle, éclairage volumétrique, ray tracing, HDR, global illumination, Unreal Engine 5 quality, ultra realistic, masterpiece, highly detailed, 8K, cinematic fantasy, dramatic lighting, award-winning photography."
          },
          "9": {
            "title": "Submersion aquatique",
            "prompt": "Guerrier samouraï japonais vu de profil sur le côté droit de l'image, regard déterminé dirigé vers l'horizon. Cheveux noirs attachés en chignon traditionnel, barbe légère, kimono sombre richement texturé, katana visible à la ceinture. Derrière lui apparaît son double spirituel entièrement composé d'eau cristalline et de fluides translucides. Le personnage aquatique est inversé et regarde dans la direction opposée, créant un contraste visuel fort. Silhouette d'eau formée de vagues, éclaboussures, filaments liquides et gouttelettes suspendues. Fond abstrait composé d'encres bleues, bleu nuit, gris et blanc, avec effets aquarelle et projections de peinture. Atmosphère mystique, spirituelle et contemplative. Éclairage cinématographique dramatique, détails extrêmes sur le visage, les cheveux, le tissu et l'eau. Reflets réalistes, transparence parfaite, textures ultra détaillées, composition artistique haut de gamme, concept art photoréaliste, masterpiece, ultra realistic, cinematic lighting, volumetric lighting, fantasy realism, hyper detailed, 8K, HDR, sharp focus, award-winning digital art."
          },
          "10": {
            "title": "forêt sombre",
            "prompt": "Femme terrifiée courant dans une forêt sombre et dense, brouillard épais enveloppant les arbres morts et les branches cassées, ambiance de thriller ou d’horreur. Elle tient une lampe torche qui projette un faisceau de lumière perçant la brume, mettant en valeur son visage paniqué et son corps couvert de boue et de traces de lutte. Vêtements déchirés et salis par la course et les obstacles naturels. Lumière dramatique, atmosphère oppressante, humidité et texture réaliste du sol forestier, feuilles et branches détaillées. Arbres hauts et fins, profondeur de champ naturelle, textures ultra détaillées sur le visage, les vêtements et le sol. Photographie cinématographique en style thriller d’horreur, ultra réaliste, HDR, 8K, contraste élevé, réalisme extrême, maîtrise de la lumière et des ombres."
          },
          "11": {
            "title": "Magazine",
            "prompt": "Femme blonde assise avec assurance sur le capot d'une voiture ancienne couleur crème des années 1960, vue en contre-plongée dramatique. Elle porte une combinaison verte élégante et des bottes militaires beiges à lacets. Une jambe est tendue vers l'objectif, mettant en valeur la semelle de la chaussure au premier plan. Expression sérieuse et regard direct vers la caméra. Route bordée de quelques palmiers espacés, lumière dorée du coucher de soleil, ambiance californienne. Reflets réalistes sur la carrosserie chromée de la voiture vintage. Profondeur de champ cinématographique, détails ultra nets sur le visage, les vêtements et le véhicule. Éclairage naturel golden hour, ombres douces, couleurs réalistes, photographie de mode haut de gamme, composition professionnelle, ultra-réaliste, 8K, HDR, photoréalisme extrême, texture de peau détaillée, objectif grand-angle 24 mm, qualité magazine de luxe."
          },
          "12": {
            "title": "Intégration décors",
            "prompt": "Modifie la photo en rajoutant, un manteau gris foncé et d'une longue jupe plissée vert forêt. Pose : Elle se tient debout sur un chemin pavé, une main dans la poche de son manteau, adoptant une pose élégante et légèrement tournée vers l'objectif. Décor : La scène se déroule à Central Park en automne, avec des arbres aux feuillages orangés et dorés encadrant la vue, et la silhouette des gratte-ciel new-yorkais visible en arrière-plan. Détails d'ambiance : Le sol est parsemé de feuilles mortes et de quelques pages de livres, créant une atmosphère poétique et mélancolique. Élément supplémentaire : Dans le coin supérieur gauche, une petite vignette encadrée montre un gros plan portrait de la même femme sous un angle différent."
          },
          "13": {
            "title": "Marketing",
            "prompt": "Portrait beauté ultra-réaliste d'une femme blonde aux yeux verts, regard intense face caméra, taches de rousseur naturelles, lèvres brillantes bordeaux, maquillage professionnel haut de gamme, tenant un rouge à lèvres rose près de son visage, ongles rouges élégants, boucles d'oreilles dorées, éclairage rouge dramatique, ambiance luxe et glamour, peau lumineuse avec texture réaliste, photographie cosmétique premium, publicité de marque de maquillage, profondeur de champ cinématographique, détails extrêmes, photoréalisme, qualité magazine de mode, studio professionnel, 8K, ultra détaillé."
          },
          "14": {
            "title": "Portrait Aquarelle",
            "prompt": "Logo de haute qualité, style logo, aquarelle, puissant logo représentant une tête de renard colorée vue de face, arrière-plan monochrome, par Yukisakura, magnifiques couleurs vives et complètes, format carré."
          },
          "15": {
            "title": "Femme Cyberpunk",
            "prompt": "Dans un futur cyberpunk dystopique, une jeune Coréenne de petite taille, à l’apparence fragile et vulnérable, marche dans une rue d’une petite ville cyberpunk. Elle a des cheveux courts violets ébouriffés, agrémentés de touches néon lumineuses. Elle porte des vêtements très usés : un pantalon cargo, un crop top court déchiré et un long manteau. Un cyberdeck est fixé sur le haut de sa cuisse gauche à l’aide de sangles. Son visage exprime la fatigue, l’épuisement et un profond sentiment d’impuissance."
          }
        },
        "video": {
          "1": {
            "title": "crépuscule",
            "prompt": "Samouraï solitaire en armure détaillée debout sur une colline d’herbes hautes, face à un coucher de soleil rouge intense sur une ville japonaise lointaine. Le vent souffle fort, faisant bouger ses vêtements et les herbes. Atmosphère épique et mélancolique, ciel dramatique avec nuages très lumineux. Caméra : départ en plan moyen derrière le samouraï, puis travelling arrière rapide et fluide révélant la vallée et la ville, suivi d’une légère rotation orbitale de 180° autour du personnage pour un effet cinématique final. Lumière golden hour très contrastée, lens flare réaliste, profondeur de champ cinématographique, rendu ultra réaliste, style film japonais blockbuster."
          },
          "2": {
            "title": "Futuriste",
            "prompt": "Jeune femme cyberpunk aux cheveux violets marchant dans une ruelle coréenne humide et animée. Début en très gros plan sur ses bottes qui avancent lentement sur l'asphalte mouillé, reflets des néons colorés visibles dans les flaques d'eau. Caméra en travelling arrière fluide suivant ses pas. Après une seconde, la caméra remonte progressivement le long de ses jambes, de son équipement tactique et de son manteau usé. Elle continue de marcher avec assurance, mains dans les poches. La caméra poursuit son mouvement vertical jusqu'à son visage, révélant en arrière plan toute la ruelle, les enseignes coréennes lumineuses, la vapeur sortant des bouches d'égout et les passants en arrière-plan. Ambiance cyberpunk réaliste, mouvements naturels, lumière cinématographique, profondeur de champ réaliste, reflets sur le sol mouillé, ultra réaliste, 8K, qualité film, détails extrêmes."
          },
          "3": {
            "title": "Forêt sinistre",
            "prompt": "Au cœur d'une forêt sombre et brumeuse en pleine nuit, une femme terrifiée court à pleine vitesse sur un étroit sentier boueux serpentant entre des arbres morts et des branches enchevêtrées. Ses vêtements sont sales et déchirés, son visage couvert de sueur, de boue et marqué par la peur. Elle serre fermement une lampe torche dont le faisceau perce l'épais brouillard. Mouvement de course naturel et réaliste, placement précis des pieds, transfert du poids du corps fidèle à la réalité, respiration subtile, cheveux et vêtements réagissant naturellement à chacun de ses mouvements. Aucun ralenti. La caméra débute par un travelling en contre-plongée dramatique, au ras du sol, suivant la femme alors qu'elle court vers l'objectif. Racines humides, éclaboussures de boue et branches cassées défilent rapidement au premier plan. Le faisceau de la lampe torche balaie les arbres, créant des ombres mouvantes et un éclairage volumétrique spectaculaire à travers la brume. Alors qu'elle poursuit sa fuite, la caméra s'élève progressivement et recule en douceur, passant d'une poursuite en contre-plongée à une vue aérienne de plus en plus haute. La forêt se dévoile sous elle, révélant l'immensité sauvage et isolée qui l'entoure. La femme devient une petite silhouette perdue dans l'obscurité, fuyant désespérément à travers ce paysage inquiétant. Grand plan aérien cinématographique, échelle épique, épais brouillard dérivant entre les arbres, profondeur atmosphérique réaliste, lumière lunaire filtrant naturellement à travers la canopée. Ambiance de thriller horrifique ultra réaliste, éclairage cinématographique, brouillard volumétrique, éclairage réaliste de la lampe torche, mouvements de caméra naturels, environnement forestier richement détaillé, reflets sur le sol humide, textures photoréalistes, large plage dynamique (HDR), tension dramatique permanente, qualité visuelle digne d'une superproduction hollywoodienne, rendu 8K, niveau de détail extrême, mise en scène immersive d'horreur cinématographique."
          },
          "4": {
            "title": "Cours",
            "prompt": "Plan cinématographique ultra dynamique dans une forêt dense transformée en parcours de compétition. Deux lapins anthropomorphes très détaillés s’affrontent en course sprint sur un sentier de terre étroit. Le lapin blanc en t-shirt bleu et sac à dos est en tête, poursuivi de près par le lapin gris en t-shirt rouge, expression de détermination intense. Caméra basse au sol en travelling avant très rapide, légèrement tremblée comme une caméra de course professionnelle. Accent fort sur la vitesse, motion blur sur les jambes et les bras, poussière et particules de terre qui explosent à chaque foulée. Végétation luxuriante sur les côtés, spectateurs animaux flous en arrière-plan (effet profondeur de champ). Style sport extrême, ambiance de finale de course, lumière dorée dramatique filtrant à travers les arbres, rendu 3D ultra réaliste type film d’animation haut budget, tension et énergie maximale."
          },
          "5": {
            "title": "Astronaute",
            "prompt": "Un astronaute solitaire flotte dans l'espace profond au-dessus de la Terre. La caméra démarre en plan extrêmement large, montrant l'immensité du cosmos, la courbure de la Terre et l'astronaute minuscule au centre du cadre. La caméra avance progressivement vers l'astronaute avec un travelling avant fluide et rapide. À mesure qu'elle se rapproche, les détails de la combinaison deviennent visibles, les reflets du Soleil apparaissent sur la visière. Arrivée à distance moyenne, la caméra effectue une rotation orbitale de 180 degrés autour de l'astronaute, révélant successivement la Terre en arrière-plan puis le vide spatial étoilé. Mouvement parfaitement stable, sensation de gravité zéro, éclairage réaliste de l'espace, reflets physiques, qualité IMAX, photoréalisme extrême, profondeur de champ cinématographique, rendu 8K, style documentaire spatial à gros budget, motion blur naturel, détails ultra-réalistes, atmosphère épique et contemplative."
          },
          "6": {
            "title": "Parc",
            "prompt": "Style animé : une femme assise sur un banc dans un parc, un chat monte sur ses genoux et elle le caresse."
          },
          "7": {
            "title": "Traveling",
            "prompt": "Scene ultra réaliste : Dans une chambre d’hôtel luxueuse, légèrement désordonnée. Une femme blonde est assise sur le lit, le maquillage noir recouvrant une grande partie de ses yeux. Travelling avant jusqu’au gros plan de son visage, qui semble exténué."
          },
          "8": {
            "title": "Lac montagneuse",
            "prompt": "Fluide doré en mouvement, ondes magnétiques, luxe, abstrait 3D"
          },
          "9": {
            "title": "Femme dans un penthouse nocturne",
            "prompt": "Illustration anime cinématographique, personnage féminin antagoniste en pied, debout dans un luxueux bureau de penthouse moderne de nuit, braquant un pistolet directement vers la caméra, posture dominante et menaçante, contre-plongée au fera mesure qu'elle avance la camera recule au rythme que la personne avance, veste de costume noire élégante, chemise noire ajustée légèrement ouverte au col, pantalon noir cintré, chaîne métallique discrète à la ceinture, une main dans la poche, coupe de cheveux courte dégradée noire, yeux rouges lumineux, peau pâle, expression froide et déterminée, éclairage dramatique, détails ultra-réalistes du visage et des cheveux, sol en marbre noir brillant, grand bureau de direction à l’arrière-plan, fauteuil en cuir, immenses baies vitrées donnant sur une ville illuminée la nuit, reflets réalistes sur les surfaces puis la camera fait un zoom sur le visage, ambiance sombre et sophistiquée, style néo-noir, ombres cinématographiques, style anime réaliste, qualité chef-d’œuvre, netteté extrême, éclairage volumétrique, profondeur de champ, contraste élevé, illustration conceptuelle professionnelle, qualité 8K, atmosphère de thriller d’action."
          },
          "10": {
            "title": "La poupée maudite",
            "prompt": "Vieille maison abandonnée victorienne, pièce sombre et délabrée, papier peint déchiré, poussière flottant dans l'air, toiles d'araignée, éclairage cinématographique. Une poupée terrifiante en porcelaine fissurée est assise immobile dans un vieux fauteuil en velours au centre de la pièce. La caméra effectue un lent travelling avant depuis un plan large vers un plan rapproché. Une faible lumière lunaire traverse la fenêtre tandis qu'une bougie vacillante projette des ombres mouvantes sur les murs. Les cheveux emmêlés de la poupée bougent légèrement sous un courant d'air. Dans les deux dernières secondes, sa tête pivote lentement vers la caméra avec un mouvement anormal et inquiétant, ses yeux semblant suivre l'objectif. Ambiance oppressante, horreur psychologique, ultra réaliste, qualité cinéma hollywoodien, éclairage volumétrique, profondeur de champ cinématographique, détails extrêmes, 4K, format 16:9."
          },
          "11": {
            "title": "Caméra de surveillance",
            "prompt": "Vidéo de télésurveillance ultra réaliste filmée de nuit dans un jardin entièrement recouvert de neige fraîche. La scène est capturée par une caméra de sécurité fixe en vision infrarouge noir et blanc, avec un léger bruit numérique, des artefacts de compression et un horodatage visible dans le coin de l'écran. Au centre du jardin se trouve un grand bonhomme de neige immobile. Un homme avance dans la neige en direction du bonhomme de neige, laissant des traces de pas derrière lui. Alors qu'il s'approche à moins d'un mètre, un chat surgit soudainement de l'intérieur du bonhomme de neige à une vitesse fulgurante. Le chat bondit directement vers le visage de l'homme, qui recule brutalement en criant de surprise. La caméra enregistre la scène avec des mouvements saccadés, une qualité de surveillance authentique et une ambiance inquiétante. Éclairage nocturne réaliste, ombres naturelles, détails photoréalistes, rendu cinématographique 4K, style vidéo virale de phénomène inexpliqué capturée par caméra de sécurité réelle."
          },
          "12": {
            "title": "coucher de soleil",
            "prompt": "Un crabe sur un rocher observe le coucher de soleil sur une plage. La mise au point de la plage est légèrement floutée."
          },
          "13": {
            "title": "Attaque de zombies",
            "prompt": "Scène ultra-réaliste et cinématographique. Une immense horde de zombies envahit Times Square en pleine nuit. Des centaines de civils paniqués tentent de fuir dans toutes les directions tandis que les zombies les poursuivent à travers les rues illuminées. Véhicules abandonnés, collisions, explosions, cris et chaos total plongent la ville dans l'apocalypse. Caméra dynamique, mouvements nerveux, ambiance de film catastrophe à gros budget, éclairages urbains réalistes, détails photoréalistes, qualité 4K. Plan final spectaculaire : vue aérienne de New York. La ville entière est en flammes, d'immenses colonnes de fumée noire s'élèvent dans le ciel et recouvrent l'horizon. Plusieurs quartiers sont ravagés par les incendies. Atmosphère apocalyptique, lumière rougeoyante des flammes, destruction massive, rendu ultra-réaliste. Dernière séquence : vue depuis les berges de New York. est dévastée, enveloppée par la fumée et les incendies. Des hélicoptères survolent la ville en détresse tandis que des explosions illuminent l'horizon. Ambiance de fin du monde, cinématographie épique, détails extrêmes, qualité 4K, style blockbuster hollywoodien."
          },
          "14": {
            "title": "Volcan",
            "prompt": "Plan cinématique ultra réaliste d’un monde préhistorique luxuriant au moment d’une éruption volcanique massive. La caméra débute en plan large aérien au-dessus d’une jungle extrêmement dense et détaillée. Les dinosaures au sol (T-Rex, tricératops, sauropodes) lèvent tous la tête et regardent vers le volcan en éruption au loin. Explosion volcanique spectaculaire avec projection de lave et nuage de cendres gigantesque. Pterodactyles en vol dans un ciel dramatique. Végétation très abondante, jungle humide, brouillard volumétrique et lumière dorée de fin de journée. Mouvement caméra fluide avec léger travelling avant + légère rotation vers le volcan. Style film blockbuster, hyperréaliste, profondeur de champ cinématographique, 4K."
          },
          "15": {
            "title": "Couloir sombre",
            "prompt": "Caméra fixe dans un couloir sombre et abandonné d’une vieille maison délabrée, éclairage naturel faible venant d’une fenêtre au fond avec rideaux qui bougent légèrement. Une femme d’environ 40 ans, en pyjama sale et déchiré, rampe lentement sur un sol en bois humide vers la caméra. Elle est en état de panique extrême, respiration lourde, tremblante. Elle s’arrête soudainement, tourne lentement la tête vers l’arrière avec un regard terrifié, comme si quelque chose la poursuivait hors champ. L’ambiance est oppressante, silencieuse, tension progressive. La caméra reste stable, légère vibration réaliste type caméra tenue à la main. Style film d’horreur ultra réaliste, lumière froide, grain cinéma, 4K, profondeur de champ faible, atmosphère lourde et glauque. Durée 10 secondes, mouvement lent et continu, tension qui monte jusqu’au regard final vers l’arrière."
          }
        }
      },
      "tutorialResourceLabels": {
        "seedance20": "Présentation et informations du modèle",
        "hailuo": "Présentation officielle de Hailuo 2.3",
        "kling2_6": "Guides officiels Kling, dont le guide 2.6",
        "kling26_motion": "Guides officiels Kling et Motion Control",
        "kling30": "Guide officiel Kling 3.0",
        "veo3_1": "Guide officiel Veo 3.1",
        "veo3_1_fast": "Guide officiel Veo 3.1",
        "minimax_h3": "Guide vidéo MiniMax",
        "seedance25": "Guide pratique Seedance",
        "seedance": "Documentation de la famille Seedance",
        "hailuoTitle": "Hailuo 2.3 — tutoriel vidéo",
        "seedance20Title": "The Complete Seedance 2.0 Tutorial for Beginners"
      },
      "app": {
        "prompt": {
          "aiDiscussion": "Discussion IA",
          "creative": "PROMPT CRÉATIF",
          "askQuestion": "Posez votre question...",
          "describeIdea": "Décrivez votre idée en détail..."
        },
        "optimize": {
          "analyzing": "⏳ Analyse...",
          "button": "✨ Optimiser"
        },
        "upload": {
          "load": "📁 Charger",
          "fileLimits": "Limites par fichier : image 20 Mo · vidéo 64 Mo · audio 20 Mo."
        },
        "style": {
          "realistic": "Réaliste",
          "cyberpunk": "Cyberpunk",
          "anime": "Anime",
          "watercolor": "Aquarelle",
          "animation3d": "Animation 3D"
        },
        "status": {
          "generationFinalizing": "Génération en cours de finalisation...",
          "fileLoading": "Chargement du fichier...",
          "fileImported": "Fichier importé",
          "generatingOnModel": "⏳ Génération en cours sur {{model}}...",
          "priorityMax": "⚡ Priorité Max : {{model}} vous répond immédiatement...",
          "videoLoaded": "🎬 Vidéo chargée dans le Studio !",
          "imageLoaded": "🖼️ Image chargée dans le Studio !",
          "newProject": "Nouveau projet lancé !"
        },
        "error": {
          "selectCharacterImage": "Veuillez sélectionner une image pour le personnage.",
          "importMotionVideo": "Veuillez importer une vidéo de référence pour le mouvement.",
          "generation": "Erreur lors de la génération",
          "falTimeout": "Temps d’attente dépassé pour Fal.ai.",
          "securityUnavailable": "La vérification de sécurité n'est pas disponible. Veuillez actualiser la page puis réessayer.",
          "videoUnavailable": "Traitement terminé, mais la vidéo est indisponible. Veuillez réessayer.",
          "sessionExpired": "Votre session a expiré. Reconnectez-vous puis réessayez.",
          "notLoggedIn": "Erreur : Utilisateur non connecté ou session expirée.",
          "hailuo512Image": "Hailuo 512 nécessite une image de départ. Ajoutez une image pour continuer.",
          "hailuo512Title": "Image de départ requise",
          "insufficientCredits": "Crédits insuffisants ! Cette génération coûte {{price}} 💎.",
          "motionImages": "Ajoutez les images de référence de mouvement requises par ce moteur.",
          "technicalGeneration": "Une erreur technique est survenue pendant la génération. Réessayez.",
          "deleteFailed": "Impossible de supprimer l’élément.",
          "deleteServerFailed": "Erreur lors de la suppression sur le serveur.",
          "fileTooLarge": "Le fichier « {{fileName}} » dépasse la limite de {{maxSize}} pour {{label}} (taille du fichier : {{actualSize}}).",
          "fileTooLargeSimple": "Le fichier « {{fileName}} » dépasse la limite de {{maxSize}} pour {{label}}.",
          "fileUploadFailed": "Impossible d’envoyer le fichier « {{fileName}} ».",
          "serverRequestFailed": "La demande a échoué (erreur serveur {{status}}). Réessayez dans quelques instants.",
          "rateLimited": "Trop de demandes en peu de temps. Patientez un instant puis réessayez.",
          "requestTimeout": "La demande a pris trop de temps. Réessayez."
        },
        "history": {
          "noDescription": "Sans description",
          "remix": "Remixer",
          "title": "Historique des créations",
          "remixButton": "Remixer",
          "editButton": "Modifier",
          "editVideoTitle": "Modifier cette vidéo"
        },
        "insufficient": {
          "diamondsMessage": "Votre solde de diamants est trop faible pour cette opération.",
          "buyDiamonds": "🛒 Acheter des diamants",
          "subscribeOrBuy": "🚀 S'abonner ou Acheter des Diamants",
          "stayStudio": "Rester sur le studio",
          "cost": "Coût de cette génération : {{cost}}",
          "diamonds": "Diamants disponibles : {{count}}",
          "tokens": "Éclairs disponibles : {{count}}",
          "tokensHelp": "Les éclairs proviennent de votre abonnement. Les diamants sont achetés séparément."
        },
        "edit": "Modifier",
        "settings": {
          "pixverseAdvanced": "OPTIONS AVANCÉES",
          "pixverseDescription": "Personnalisez le style, le rythme et la cohérence de la génération.",
          "multiShot": "Multi-plans / changements d’angle",
          "multiShotHelp": "Autorise plusieurs plans dans une même vidéo.",
          "visualStyle": "Style visuel",
          "automatic": "Automatique",
          "clay": "Pâte à modeler",
          "comic": "Bande dessinée",
          "thinkingLevel": "Niveau de réflexion",
          "enhanced": "Renforcée",
          "fast": "Rapide",
          "random": "Aléatoire",
          "negativePrompt": "Prompt négatif",
          "negativePromptExample": "Ex. : flou, artefacts, mouvements saccadés, texte déformé…",
          "addImages": "Ajouter des images",
          "addVideos": "Ajouter des vidéos",
          "addAudios": "Ajouter des audios",
          "referenceImage": "Image de référence {{number}}",
          "referenceVideo": "Vidéo de référence {{number}}",
          "referenceAudio": "Audio de référence {{number}}",
          "imageEditPrecise": "Édition précise",
          "guidedComposition": "Composition guidée",
          "multipleReferences": "Références multiples",
          "addReferenceImages": "Ajouter des images de référence",
          "imageLimitReached": "Limite d’images atteinte",
          "chooseFiles": "Cliquez pour choisir des fichiers depuis votre ordinateur",
          "referencesAdded": "Références ajoutées",
          "removeImageHint": "Cliquez sur × pour retirer une image",
          "noImageReferences": "Aucune image ajoutée. Les références sont facultatives : vous pouvez aussi générer uniquement à partir du prompt.",
          "engineSettings": "Réglages du moteur",
          "outputFormat": "Format de sortie",
          "optionalSeed": "Seed facultative",
          "imageQuality": "Qualité GPT Image 2",
          "moderation": "Modération",
          "standard": "Standard",
          "lessRestrictive": "Moins restrictive",
          "safetyTolerance": "Tolérance de sécurité (0–5)",
          "thinking": "Réflexion",
          "minimalFaster": "Minimale · plus rapide",
          "temperature": "Température (0–2)",
          "topP": "Top P (0–1)",
          "systemInstruction": "Instruction système",
          "optional": "facultative",
          "generalInstructions": "Consignes générales à respecter…",
          "referenceVideoNote": "Elle guide l’image fixe générée ; elle ne transforme pas le résultat en vidéo.",
          "chooseVideo": "Choisir une vidéo",
          "videoAdded": "Vidéo ajoutée",
          "usedAsVisualReference": "Elle sera utilisée comme référence visuelle pour l’image.",
          "referenceTip": "Astuce : dans votre prompt, indiquez le rôle de chaque image et précisez les éléments à conserver ou à modifier.",
          "tutorialEngine": "Tutoriel du moteur",
          "seedOptional": "Seed — facultative",
          "negativePromptLabel": "Prompt négatif",
          "avoidElements": "— éléments à éviter"
        },
        "video": {
          "existingOperations": "Opérations sur une vidéo existante",
          "extend": "Rallonger la vidéo",
          "edit": "Modifier la vidéo",
          "extendDescription": "Décrivez la suite après la dernière image. La durée et le résultat dépendent du modèle sélectionné.",
          "editDescription": "Décrivez les changements souhaités et précisez ce qui doit rester identique.",
          "importSourceFirst": "Importez d’abord une vidéo source dans le panneau des médias pour utiliser ces opérations.",
          "changeAppearance": "Modifier l’apparence · Filtres et Éclairage IA",
          "addSourceForVeo": "Ajoutez une vidéo source pour activer le mode « {{operation}} » de Veo.",
          "describeIdea": "Décrivez votre idée en détail...",
          "characters": "{{count}} caractères",
          "changeAppearanceLabel": "Filtres et Éclairage IA",
          "extendGuideTitle": "Comment rallonger votre vidéo",
          "editGuideTitle": "Comment modifier votre vidéo",
          "extendOrEditGuideTitle": "Pour rallonger ou modifier une vidéo",
          "addSourceSeedance": "Ajoutez d’abord une vidéo source dans le panneau Seedance 2.5, puis choisissez « Prolonger la vidéo » ou « Modifier la vidéo ».",
          "extendSeedanceHelp": "Décrivez la suite souhaitée après la dernière image : quelle action continue, ce qui doit apparaître et combien de secondes ajouter. Précisez que le personnage, le décor et le mouvement de caméra doivent rester cohérents.",
          "editSeedanceHelp": "Indiquez exactement ce qui doit changer, puis ce qui doit rester identique. Pour éviter les changements indésirables, précisez de conserver les personnages, les mouvements, le cadrage et la durée originale si nécessaire.",
          "useExtendExample": "Utiliser un exemple de rallongement",
          "useEditExample": "Utiliser un exemple de modification",
          "characterCount": "{{count}} caractères"
        },
        "audio": {
          "ai": "Audio IA",
          "included": "Audio inclus",
          "native": "Audio natif",
          "soundDesign": "Design sonore",
          "unavailable": "Audio non disponible",
          "referenceDialogue": "Audio de référence et dialogue",
          "referenceHelp": "Jusqu'à 3 audios pour guider la voix. Il faut également ajouter une image ou une vidéo dans le panneau Références (les seuls slots Première/Dernière image ne suffisent pas pour l'audio de référence).",
          "remove": "Retirer",
          "exactDialogue": "Dialogue exact à prononcer (facultatif)",
          "dialogueExample": "Ex. : Le personnage dit : « Nous devons partir maintenant. »",
          "referenceLimit": "L'audio guide la voix et la diction, mais ne garantit pas une copie exacte de l'enregistrement. Maximum 12 fichiers de référence au total ; les audios et vidéos partagés ne doivent pas dépasser 15 secondes au total.",
          "promptExpansion": "Expansion du prompt",
          "disabledMoreFaithful": "Désactivée (plus fidèle)",
          "balanced": "Équilibrée",
          "qualityPriority": "Priorité qualité",
          "seedOptional": "Seed facultative"
        },
        "badge": {
          "new": "Nouveau",
          "startEnd": "Début + fin",
          "topArena": "Top Arena"
        },
        "cancel": "Annuler",
        "cost": {
          "diamonds": "Diamants",
          "diamondsLower": "diamants",
          "tokens": "Éclairs",
          "tokensLower": "éclairs",
          "total": "Coût total"
        },
        "defaultImageAlt": "Image générée",
        "delete": {
          "button": "Supprimer",
          "title": "Confirmer la suppression"
        },
        "download": "Télécharger",
        "duration": "Durée",
        "explorer": {
          "title": "Explorer les créations"
        },
        "formatStyle": "Format et style",
        "generate": {
          "button": "Générer",
          "imageRequired512": "Ce modèle nécessite une image de départ au format 512.",
          "imageVideoRequired": "Ajoutez une image ou une vidéo de référence pour continuer.",
          "inProgress": "Génération en cours…",
          "send": "Envoyer pour génération"
        },
        "loading": {
          "generation": "Préparation de la génération…"
        },
        "mode": {
          "remastered": "Remastérisé"
        },
        "newDiscussion": "Nouvelle discussion",
        "noSelection": "Aucun élément sélectionné",
        "remix": {
          "creative": "Créatif",
          "fidelity": "Fidélité",
          "strict": "Strict"
        },
        "resolution": "Résolution",
        "security": {
          "sync": "Synchronisation sécurisée en cours…"
        },
        "slot": {
          "endBlocked": "L’image de fin n’est pas prise en charge par ce moteur.",
          "endImage": "Image de fin",
          "endUnavailable": "Image de fin indisponible",
          "startBlocked": "L’image de départ n’est pas prise en charge par ce moteur.",
          "startImage": "Image de départ",
          "v2vUnavailable": "La vidéo-à-vidéo n’est pas disponible pour ce moteur.",
          "videoBlocked": "La vidéo source n’est pas prise en charge par ce moteur.",
          "videoSource": "Vidéo source"
        },
        "tip": {
          "kling": {
            "text": "Utilisez une description claire du mouvement et de la caméra.",
            "title": "Conseil Kling"
          },
          "luma": {
            "text": "Décrivez le mouvement souhaité sans surcharger le prompt.",
            "title": "Conseil Luma"
          },
          "pixverse": {
            "text": "Précisez le style visuel, le rythme et les changements de plan souhaités.",
            "title": "Conseil PixVerse"
          },
          "seedance": {
            "text": "Décrivez le mouvement principal et gardez les actions successives cohérentes.",
            "title": "Conseil Seedance"
          },
          "seedance25": {
            "text": "Pour plusieurs plans, indiquez clairement chaque plan et sa transition.",
            "title": "Conseil Seedance 2.5"
          }
        },
        "waitingCreation": "En attente de la création…",
        "references": {
          "imagesTitle": "Images de référence",
          "guideText": "Guidez le sujet, l’apparence, le décor ou le style de votre création.",
          "imageCount": "{{count}} images",
          "tutorialButton": "Tutoriel du moteur",
          "addImages": "Ajouter des images de référence",
          "imageLimit": "Limite d’images atteinte",
          "chooseFiles": "Cliquez pour choisir des fichiers depuis votre ordinateur",
          "removeToAdd": "Retirez une image pour en ajouter une autre",
          "preciseEditing": "Édition précise",
          "guidedComposition": "Composition guidée",
          "multipleReferences": "Références multiples",
          "tutorialEngine": "Tutoriel du moteur",
          "images": "images"
        }
      },
      "line3_app_ui_referenceImages": "Images de référence",
      "line3_app_ui_referenceImagesUpTo3": "Jusqu’à 3 images de référence",
      "line3_app_ui_startEndFrames": "Début / Fin",
      "line3_app_ui_editVideo": "Modifier la vidéo",
      "line3_app_ui_extendVideo": "Étendre la vidéo",
      "line3_app_ui_imageToVideo": "Image → Vidéo",
      "line3_app_ui_videoReference": "Vidéo de référence",
      "line3_app_ui_remix": "Remixer",
      "line3_app_ui_characterImage": "Image du personnage",
      "line3_app_ui_motionControl": "Contrôle du mouvement",
      "line3_app_ui_textToVideo": "Text → Vidéo",
      "line3_app_ui_referenceImageCount": "1–9 images de référence",
      "line3_app_ui_referenceVideoCount": "1–3 vidéos de référence",
      "line3_app_ui_referenceAudioCount": "1–3 audios de référence",
      "line3_app_ui_generativeAudio": "Audio génératif",
      "line3_app_ui_thinkingLevel": "Niveau de réflexion",
      "line3_app_ui_multimodalReferences": "Références multimodales — Seedance",
      "line3_app_ui_seedance25Limit": "Jusqu’à 30 images, 10 vidéos et 10 audios selon le mode utilisé.",
      "line3_app_ui_seedance20Limit": "Jusqu’à 12 fichiers de référence au total · {{count}}/12 utilisés",
      "line3_app_ui_seedance25Notice": "Les références multimodales ne se combinent pas avec les emplacements Première/Dernière image. Pour modifier ou prolonger une vidéo, utilisez l’emplacement Vidéo source ci-dessus : il est prioritaire sur ces références.",
      "line3_app_ui_seedance20Notice": "Les références multimodales ne se combinent pas avec les emplacements Première/Dernière image. Une vidéo source compte dans la limite vidéo et dans les 12 fichiers au total. Les fichiers doivent respecter les limites de taille acceptées par le serveur.",
      "line3_app_ui_seedanceCharacterObjects": "Images de personnages, objets ou décors.",
      "line3_app_ui_seedanceNineImages": "Jusqu’à 9 images pour guider le rendu.",
      "line3_app_ui_seedanceReferenceClips": "Clips de référence, hors mode vidéo source.",
      "line3_app_ui_seedanceThreeVideos": "Jusqu’à 3 vidéos ; 2 si une vidéo source est déjà sélectionnée.",
      "line3_app_ui_audioAmbience": "Audio d’ambiance, voix ou référence sonore.",
      "line3_app_ui_referenceVideoGuidance": "Ces vidéos guident les mouvements, les actions et les mouvements de caméra.",
      "line3_app_ui_buyDiamonds": "🛒 Acheter des diamants",
      "line3_app_ui_subscribeOrBuyDiamonds": "🚀 S’abonner ou acheter des diamants",
      "line3_app_ui_stayInStudio": "Rester sur le studio",
      "line3_app_error_waitSourceDuration": "Attendez que la durée de la vidéo source soit détectée avant de lancer le mode Modifier, afin de calculer correctement le coût.",
      "line3_app_error_selectCharacterImage": "Veuillez sélectionner une image pour le personnage.",
      "line3_app_error_importMotionVideo": "Veuillez importer une vidéo de référence pour le mouvement.",
      "line3_app_error_securityUnavailable": "La vérification de sécurité n’est pas disponible. Veuillez actualiser la page puis réessayer.",
      "line3_app_error_generation": "Erreur lors de la génération",
      "line3_app_error_generationFailed": "La génération a échoué.",
      "line3_app_error_technicalGeneration": "Problème technique pendant la génération.",
      "line3_app_error_noResultUrl": "Le serveur a terminé sans retourner d’URL de résultat. Vérifiez les logs du serveur.",
      "line3_app_error_insufficientCreditsVideo": "Crédits insuffisants pour générer cette vidéo.",
      "line3_app_error_refundTechnical": "Problème technique, veuillez réessayer plus tard. Vos crédits ont été restitués.",
      "line3_app_error_startAndSourceRequired": "Une image de début et une vidéo source sont requises",
      "line3_app_error_startImageFor512": "Ajoutez une image de début pour utiliser la résolution 512p",
      "line3_app_error_deleteCreation": "Supprimer la création ?",
      "line3_app_error_diamondsInsufficient": "Votre solde de diamants est trop faible pour cette opération.",
      "line3_app_status_generationFinalizing": "Génération en cours de finalisation...",
      "line3_app_status_fileImported": "Fichier importé",
      "app.status.newProject": "Nouveau projet lancé !",
      "line3_app_status_videoLoaded": "🎬 Vidéo chargée dans le Studio !",
      "line3_app_status_imageLoaded": "🖼️ Image chargée dans le Studio !",
      "line3_app_ui_seedanceOperation": "Opération sur la vidéo source :",
      "line3_app_ui_extend": "Prolonger",
      "line3_app_ui_modify": "Modifier",
      "line3_app_ui_seedanceExtendHelp": "Prolongement : ajoutez une vidéo source, puis décrivez dans le prompt ce qui doit se passer après sa dernière image. La durée sélectionnée correspond à la durée supplémentaire.",
      "line1_app_file_kind_image": "une image",
      "line1_app_file_kind_video": "une vidéo",
      "line1_app_file_kind_audio": "un fichier audio",
      "line1_app_file_kind_other": "ce fichier",
      "line1_app_status_prepareImage": "Préparation de votre image",
      "line1_app_status_stageVideo": "Mise en scène de votre vidéo",
      "line1_app_prompt_seedanceExtendSource": "Décrivez ce qui doit se passer après la fin de votre vidéo… (ex. : continuez la scène pendant 5 secondes…)",
      "line1_app_prompt_seedanceEditSource": "Décrivez précisément ce que vous voulez modifier dans la vidéo et ce qui doit rester identique…",
      "line1_app_prompt_veoExtendSource": "Décrivez ce qui doit se passer après la dernière image de votre vidéo…",
      "line1_app_prompt_veoEditSource": "Décrivez les changements à apporter à la vidéo et ce qui doit rester identique…",
      "line1_app_prompt_minimaxExtendSource": "Décrivez comment continuer la vidéo après sa dernière image…",
      "line1_app_prompt_minimaxEditSource": "Décrivez ce qu’il faut modifier dans la vidéo en conservant le reste…",
      "line1_app_prompt_pixverseSourceChanges": "Décrivez les changements à appliquer à la vidéo source et les éléments à préserver…",
      "line1_app_video_hailuoProLimit": "⚠️ MODE PRO : LIMITÉ À 6S",
      "line1_app_video_hailuoStandardLimit": "✅ MODE STANDARD : JUSQU’À 10S",
      "line1_app_audio_nativeEnabled": "Audio natif activé",
      "line1_app_audio_nativeDisabled": "Audio natif désactivé",
      "line1_app_settings_high": "Élevée",
      "line1_app_settings_systemInstruction": "Instruction système",
      "line1_app_settings_optional": "facultative",
      "line1_app_settings_referenceVideoTitle": "Vidéo de référence",
      "line1_app_settings_referenceVideo": "Vidéo de référence {{number}}",
      "line1_app_settings_oneVideoMaximum": "facultative · 1 maximum",
      "line1_app_settings_chooseVideo": "Choisir une vidéo",
      "line1_app_settings_visualStyle": "Style visuel",
      "line1_app_settings_imageQualityFastLow": "Rapide / faible",
      "line1_app_settings_imageQualityHigh": "Haute",
      "line1_app_settings_moderationStandard": "Standard",
      "line1_app_settings_moderationLessRestrictive": "Moins restrictive",
      "line3_app_settings_referenceImages": "Images de référence",
      "line1_app_references_maxImagesH3": "Jusqu’à 9 images de référence",
      "line1_app_references_referenceAppearanceHelp": "Guidez l’apparence des personnages, des objets ou des décors.",
      "line1_app_references_selectedImagesCount": "{{count}} image(s) sélectionnée(s)",
      "line1_app_references_referenceVideos": "Vidéos de référence",
      "line1_app_references_videoFormatsLimit": "MP4 ou MOV — 3 vidéos maximum au total, vidéo source comprise",
      "line1_app_references_referenceImageSlot": "Image {{number}}",
      "line1_app_references_referenceVideoSlot": "Vidéo {{number}}",
      "line1_app_references_addMedia": "Ajouter",
      "line1_app_references_imageFormatsMaximum": "Formats image · {{max}} fichiers maximum",
      "line1_app_references_removeReferenceImage": "Retirer l’image de référence {{number}}",
      "line1_tutorial_tab_guide": "📘 Guide écrit",
      "line1_tutorial_tab_resources": "📚 Ressources",
      "line1_tutorial_tab_prompts": "✨ Prompts prêts à copier",
      "line1_cost_full_hd_diamonds": "Mode Full HD : Diamants",
      "line1_cost_end_image": "Image de fin",
      "line1_cost_ai_audio": "Audio IA",
      "line3_app_ui_seedanceEditHelp": "Modification : ajoutez une vidéo source, puis décrivez les changements à effectuer et les éléments à conserver. La vidéo modifiée garde la durée de la source.",
      "line4_badge_text_to_image": "Texte → Image",
      "line4_badge_image_to_image": "Image → Image",
      "line4_badge_up_to_16_refs": "Jusqu'à 16 références",
      "line4_badge_up_to_9_refs": "Jusqu'à 9 références",
      "line4_badge_up_to_14_images": "Jusqu'à 14 images",
      "line4_badge_one_reference_video": "1 vidéo de référence",
      "line4_badge_adjustable_reasoning": "Réflexion réglable",
      "line4_badge_adjustable_quality": "Qualité réglable",
      "line4_badge_adjustable_moderation": "Modération réglable",
      "line4_badge_safety_tolerance": "Tolérance de sécurité 0–5",
      "line4_badge_text_to_video": "Texte → Vidéo",
      "line4_badge_image_to_video": "Image → Vidéo",
      "line4_badge_reference_images": "Images de référence",
      "line4_badge_reference_video": "Vidéo de référence",
      "line4_badge_reference_audio": "Audio de référence",
      "line4_badge_edit_video": "Modifier la vidéo",
      "line4_badge_extend_video": "Étendre la vidéo",
      "line4_badge_up_to_3_videos": "Jusqu'à 3 vidéos",
      "line4_badge_up_to_3_audio": "Jusqu'à 3 audios",
      "line4_badge_up_to_9_images": "Jusqu'à 9 images",
      "line4_badge_start_end_images": "Image début / fin",
      "line4_badge_native_audio_lipsync": "Audio natif & lip-sync",
      "line4_badge_audio": "Audio",
      "line4_badge_multishot": "Multi-shot",
      "line4_badge_4_30_seconds": "4–30 s",
      "line4_badge_4_15_seconds": "4–15 s",
      "line4_badge_4_12_seconds": "4–12 s",
      "line4_badge_1_15_seconds": "1–15 s",
      "line4_tutorial_model_title": "Tutoriel de {{model}} — guide, vidéo et prompts",
      "line4_prompt_characters": "caractères",
      "line4_remove_media": "Retirer {{media}} {{number}}",
      "line5_prompt_veo_extend": "Continuez naturellement la vidéo à partir de sa dernière image pendant 7 secondes supplémentaires. Le personnage poursuit sa marche sur le sentier forestier, puis entre dans une clairière ensoleillée. Conservez le même personnage, les mêmes vêtements, le même environnement, le même éclairage, le même mouvement de caméra et le même style cinématographique. Assurez une transition fluide, sans coupe brusque.",
      "line5_prompt_veo_edit": "Modifiez la vidéo source uniquement pour remplacer l’éclairage de jour par une scène nocturne cinématographique, éclairée par une douce lumière bleue de lune. Conservez les mêmes personnages, actions, environnement, cadrage, mouvements de caméra et continuité visuelle. Ne changez rien d’autre.",
      "line5_prompt_seedance_extend": "Continuez @Video1 immédiatement après sa dernière image pendant 5 secondes supplémentaires. Le personnage poursuit sa marche et entre dans la clairière. Conservez le même personnage, les mêmes vêtements, le même décor, le même éclairage, le même mouvement de caméra et le même style visuel. Assurez une transition fluide, sans coupe brusque ni changement d’identité.",
      "line5_prompt_seedance_edit": "Modifiez @Video1 : changez uniquement l’éclairage pour transformer la scène de jour en une scène nocturne cinématographique éclairée par une douce lumière lunaire. Conservez les personnages, leurs mouvements, le décor, le cadrage, les mouvements de caméra et la durée d’origine. Ne changez rien d’autre.",
      "line6_suggestions_video_1_prompt": "Samouraï solitaire en armure détaillée debout sur une colline d’herbes hautes, face à un coucher de soleil rouge intense sur une ville japonaise lointaine. Le vent souffle fort, faisant bouger ses vêtements et les herbes. Atmosphère épique et mélancolique, ciel dramatique avec nuages très lumineux. Caméra : départ en plan moyen derrière le samouraï, puis travelling arrière rapide et fluide révélant la vallée et la ville, suivi d’une légère rotation orbitale de 180° autour du personnage pour un effet cinématique final. Lumière golden hour très contrastée, lens flare réaliste, profondeur de champ cinématographique, rendu ultra réaliste, style film japonais blockbuster.",
      "line6_suggestions_video_2_prompt": "Jeune femme cyberpunk aux cheveux violets marchant dans une ruelle coréenne humide et animée. Début en très gros plan sur ses bottes qui avancent lentement sur l'asphalte mouillé, reflets des néons colorés visibles dans les flaques d'eau. Caméra en travelling arrière fluide suivant ses pas. Après une seconde, la caméra remonte progressivement le long de ses jambes, de son équipement tactique et de son manteau usé. Elle continue de marcher avec assurance, mains dans les poches. La caméra poursuit son mouvement vertical jusqu'à son visage, révélant en arrière plan toute la ruelle, les enseignes coréennes lumineuses, la vapeur sortant des bouches d'égout et les passants en arrière-plan. Ambiance cyberpunk réaliste, mouvements naturels, lumière cinématographique, profondeur de champ réaliste, reflets sur le sol mouillé, ultra réaliste, 8K, qualité film, détails extrêmes.",
      "line6_suggestions_video_3_prompt": "Au cœur d'une forêt sombre et brumeuse en pleine nuit, une femme terrifiée court à pleine vitesse sur un étroit sentier boueux serpentant entre des arbres morts et des branches enchevêtrées. Ses vêtements sont sales et déchirés, son visage couvert de sueur, de boue et marqué par la peur. Elle serre fermement une lampe torche dont le faisceau perce l'épais brouillard. Mouvement de course naturel et réaliste, placement précis des pieds, transfert du poids du corps fidèle à la réalité, respiration subtile, cheveux et vêtements réagissant naturellement à chacun de ses mouvements. Aucun ralenti. La caméra débute par un travelling en contre-plongée dramatique, au ras du sol, suivant la femme alors qu'elle court vers l'objectif. Racines humides, éclaboussures de boue et branches cassées défilent rapidement au premier plan. Le faisceau de la lampe torche balaie les arbres, créant des ombres mouvantes et un éclairage volumétrique spectaculaire à travers la brume. Alors qu'elle poursuit sa fuite, la caméra s'élève progressivement et recule en douceur, passant d'une poursuite en contre-plongée à une vue aérienne de plus en plus haute. La forêt se dévoile sous elle, révélant l'immensité sauvage et isolée qui l'entoure. La femme devient une petite silhouette perdue dans l'obscurité, fuyant désespérément à travers ce paysage inquiétant. Grand plan aérien cinématographique, échelle épique, épais brouillard dérivant entre les arbres, profondeur atmosphérique réaliste, lumière lunaire filtrant naturellement à travers la canopée. Ambiance de thriller horrifique ultra réaliste, éclairage cinématographique, brouillard volumétrique, éclairage réaliste de la lampe torche, mouvements de caméra naturels, environnement forestier richement détaillé, reflets sur le sol humide, textures photoréalistes, large plage dynamique (HDR), tension dramatique permanente, qualité visuelle digne d'une superproduction hollywoodienne, rendu 8K, niveau de détail extrême, mise en scène immersive d'horreur cinématographique.",
      "line6_suggestions_video_4_prompt": "Plan cinématographique ultra dynamique dans une forêt dense transformée en parcours de compétition. Deux lapins anthropomorphes très détaillés s’affrontent en course sprint sur un sentier de terre étroit. Le lapin blanc en t-shirt bleu et sac à dos est en tête, poursuivi de près par le lapin gris en t-shirt rouge, expression de détermination intense. Caméra basse au sol en travelling avant très rapide, légèrement tremblée comme une caméra de course professionnelle. Accent fort sur la vitesse, motion blur sur les jambes et les bras, poussière et particules de terre qui explosent à chaque foulée. Végétation luxuriante sur les côtés, spectateurs animaux flous en arrière-plan (effet profondeur de champ). Style sport extrême, ambiance de finale de course, lumière dorée dramatique filtrant à travers les arbres, rendu 3D ultra réaliste type film d’animation haut budget, tension et énergie maximale.",
      "line6_suggestions_video_5_prompt": "Un astronaute solitaire flotte dans l'espace profond au-dessus de la Terre. La caméra démarre en plan extrêmement large, montrant l'immensité du cosmos, la courbure de la Terre et l'astronaute minuscule au centre du cadre. La caméra avance progressivement vers l'astronaute avec un travelling avant fluide et rapide. À mesure qu'elle se rapproche, les détails de la combinaison deviennent visibles, les reflets du Soleil apparaissent sur la visière. Arrivée à distance moyenne, la caméra effectue une rotation orbitale de 180 degrés autour de l'astronaute, révélant successivement la Terre en arrière-plan puis le vide spatial étoilé. Mouvement parfaitement stable, sensation de gravité zéro, éclairage réaliste de l'espace, reflets physiques, qualité IMAX, photoréalisme extrême, profondeur de champ cinématographique, rendu 8K, style documentaire spatial à gros budget, motion blur naturel, détails ultra-réalistes, atmosphère épique et contemplative.",
      "line7_suggestions_video_6_prompt": "Style animé : une femme assise sur un banc dans un parc, un chat monte sur ses genoux et elle le caresse.",
      "line7_suggestions_video_7_prompt": "Scene ultra réaliste : Dans une chambre d’hôtel luxueuse, légèrement désordonnée. Une femme blonde est assise sur le lit, le maquillage noir recouvrant une grande partie de ses yeux. Travelling avant jusqu’au gros plan de son visage, qui semble exténué.",
      "line7_suggestions_video_8_prompt": "Fluide doré en mouvement, ondes magnétiques, luxe, abstrait 3D"
    ,
      "engineAnnotations": {
              "kling26_motion": "Transfert de mouvement d’une vidéo vers une image",
              "kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
              "hailuo": "Mouvements ultra-réalistes",
              "pixverse6": "PixVerse V6 — 360p à 1080p, 1 à 15 s, audio et multi-shot",
              "seedance25": "Seedance 2.5 — références image/vidéo/audio, édition et extension, 4 à 30 s",
              "seedance20": "Seedance 2.0 — jusqu’à 9 images, 3 vidéos et 3 audios de référence",
              "seedance": "Audio natif et synchronisation labiale (lip-sync)",
              "gpt_image2": "Génération et édition d’images, jusqu’à 16 références",
              "flux2pro": "FLUX.2 Pro — édition guidée par jusqu’à 9 images",
              "nano_banana2_lite": "Génération et édition rapide, jusqu’à 14 images de référence"
      }}
  },
  "en": {
    "terms": {
  "backToStudio": "Back to Studio",
  "title": "Terms and Conditions of Use",
  "lastUpdated": "Last updated: September 8, 2026 — Eclipse IA",
  "sections": {
    "object": {
      "title": "1. Purpose and Service Provider"
    },
    "eligibility": {
      "title": "2. Eligibility and Age Requirements"
    },
    "account": {
      "title": "3. Account and Security"
    },
    "subscriptions": {
      "title": "4. Subscriptions, Lightning Credits and Diamonds"
    },
    "payments": {
      "title": "5. Payments, Generation Failures and Refunds"
    }
  },
  "contact": {
    "title": "Contact",
    "description": "For questions about these terms, your subscription, credits or use of the service, please contact Eclipse IA support.",
    "button": "Contact Support"
  }
},
    "translation": {  
      "line3_app_ui_audio": "Audio",
"line3_app_ui_remix": "Remix",
"line3_app_ui_nativeAudio": "Native audio",
"line3_app_ui_characterImage": "Character image",
"line3_app_ui_firstLastFrame": "First + Last Frame",
"line3_app_ui_10s768pOnly": "10s — 768p only",
      "control_mode_image": "IMAGE",
"control_mode_video": "VIDEO",
"control_mode_remasterise": "REMASTERED",
"line3_app_annotation_veo3_1_fast": "Veo 3.1 Fast — fast video generation",
"line3_app_annotation_veo3_1": "Veo 3.1 — high-quality video generation",
"line3_app_annotation_kling26_motion": "Transfer motion from a video to an image",
"line3_app_annotation_kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
"line3_app_annotation_kling26": "Kling 2.6 Pro — video generation",
"line3_app_annotation_hailuo": "Ultra-realistic motion",
"line3_app_annotation_minimax_h3": "MiniMax H3 — video generation",
"line3_app_annotation_pixverse6": "PixVerse V6 — 360p to 1080p, 1–15 seconds, audio and multi-shot",
"line3_app_annotation_seedance25": "Seedance 2.5 — image, video and audio references, editing and extension",
"line3_app_annotation_seedance20": "Seedance 2.0 — up to 9 images, 3 videos and 3 audio references",
"line3_app_annotation_seedance": "Native audio and lip synchronization",
"line3_app_annotation_gpt_image2": "Image generation and editing, up to 16 references",
"line3_app_annotation_flux2pro": "FLUX.2 Pro — editing guided by up to 9 images",
"line3_app_annotation_nano_banana2_lite": "Fast generation and editing, up to 14 reference images",
      "seedance available": "Seedance 2.5 available",
      "create instantly": "Create instantly.",
      "hero subtitle": "Turn your ideas into high-quality cinematic visuals thanks to the power of generative artificial intelligence.",
      "generate": "Generate",
      "text to image title": "From text to",
      "cinematic image": "cinematic image",
      "ai interprets imagination": "AI interprets every detail of your imagination.",
      "generate button": "Generate",
      "model": "Model",
      "render": "Render",
      "contact": {
        "successTitle": "Message sent!",
        "successMessage": "Thank you {{name}}, we have received your request.",
        "replySoon": "We will get back to you soon.",
        "title": "Contact us",
        "subjectLabel": "Subject of your request",
        "subjectInfo": "General inquiry",
        "subjectProblem": "Report a problem",
        "subjectQuote": "Request a quote",
        "messageLabel": "Your message",
        "messagePlaceholder": "How can we help you?",
        "back": "Back",
        "sending": "Sending...",
        "send": "Send",
        "sendError": "Sending failed. Please try again."
      },
        "profile": {
          "within30Days": "Within 30 days",
"validYear": "Valid for 1 year",
  "back": "Back",
  "avatarAlt": "Profile",
  "accountStatus": "Account status",
  "lightning": "Lightning credits",
  "nextReset": "Next reset:",
  "diamonds": "Diamonds",
  "expiration": "Expires:",
  "validYear": "Valid for 1 year",
  "changeSubscription": "Change my subscription",
  "subscriptionCancelled": "Subscription cancelled",
  "cancelling": "Cancelling...",
  "cancelSubscription": "Cancel my subscription",
  "contactUs": "Contact us",
  "deleteAccount": "Delete my account",
  "irreversible": "Irreversible action",
  "activeSubscriptionTitle": "Active subscription detected:",
  "activeSubscriptionMessage": "You must cancel your subscription before you can delete your account.",
  "understood": "Got it",
  "deleteWarning": "Deleting your account will permanently remove your 💎 {{diamonds}} diamonds and ⚡ {{lightning}} lightning credits.",
  "typeDelete": "Type SUPPRIMER to confirm:",
  "writeHere": "Type here...",
  "reconnect": "Sign in again",
  "delete": "Delete",
  "cancelTitle": "Cancel subscription",
  "cancelConfirmMessage": "Are you sure you want to cancel your subscription? You will keep your benefits until the end of the paid period.",
  "cancel": "Cancel",
  "confirm": "Confirm",
  "cancelServerError": "Unable to reach the cancellation server."
},
      "hero prompt 1": "Ultra-realistic scene: a man approaches a snowman and suddenly a cat jumps out and attacks his face...",
      "hero prompt 2": "Ultra-realistic scene of zombies in the streets of New York...",
      "hero prompt 3": "An anime style, girl with short pink hair sitting at a table with a glass of orange juice and a slice of strawberry cake.",
      "showcase subtitle": "Your text becomes reality. Create captivating videos instantly with the power of AI.",
      "showcase prompt 1": "Cyberpunk street market...",
      "showcase prompt 2": "Anime landscape...",
      "showcase prompt 3": "Macro nature shot...",
      "showcase prompt 4": "Astronaut floating in nebula...",
      "showcase prompt 5": "Deep sea glowing jellyfish...",
      "image to video title": "From image to",
      "cinematic video": "cinematic video",
      "image to video subtitle": "Import your visuals and let AI bring your ideas to life.",
      "source image": "SOURCE IMAGE",
      "ai result": "AI RESULT",
      "prompt": "PROMPT",
      "image video prompt 1": "The crab dancing.",
      "image video prompt 2": "A disoriented woman, with a wandering gaze, seemingly lost.",
      "image video prompt 3": "Camera tracking forward to a close-up of the woman's face, who appears exhausted.",
      "image video prompt 4": "Animate this image: she smokes and looks at the camera.",
      "start end title 1": "Total consistency from beginning to end",
      "start end desc 1": "Define a starting image and an ending image. AI generates the entire smooth transition between the two frames for absolute artistic control.",
      "start end prompt 1": "Smooth transition between 2 images. Camera moving forward until it reaches its victim.",
      "start end title 2": "Smooth transformation",
      "start end desc 2": "Guide the evolution of a character or setting from state A to state B without any visual break.",
      "start end prompt 2": "Transition between two images: she is completely drunk while talking, then makes a grimace and vomits.",
      "start end title 3": "Smooth transformation",
      "start end desc 3": "Guide the evolution of a character or setting from state A to state B without any visual break.",
      "start end prompt 3": "Transition between two images: she gets into a fighting stance.",
      "start image": "START IMAGE",
      "end image": "END IMAGE",
      "transition result": "TRANSITION RESULT",
      "example": "Example",
      "capture title": "Precise camera movement control",
      "capture desc": "Define smooth camera trajectories (zoom, pan, tracking shots) to give your scenes a professional dimension.",
      "capture prompt": "Animate between 2 images.",
      "motion model": "MOTION MODEL",
      "camera control result": "CAMERA CONTROL RESULT",
      "replace title 1": "Absolute creative freedom",
      "replace desc 1": "Replacing any object becomes child's play. Import your photo, describe your vision, and AI generates a realistic result in seconds. No more complex tools: your imagination is the only limit.",
      "replace prompt 1": "Remove the cat in the background",
      "replace title 2": "Interior design: AI furniture",
      "replace desc 2": "Reinvent your space effortlessly. Replace an old piece of furniture with a modern one while keeping the natural lighting.",
      "replace prompt 2": "Remove the straw and the lemon.",
      "replace title 3": "Automotive: Customization",
      "replace desc 3": "Visualize any modification on a vehicle. Change the color or rims with surgical precision.",
      "replace prompt 3": "Remove the shovel",
      "replace photos title": "Reinvent your photos: Replace any object",
      "instant": "instantly",
      "replace subtitle": "Try the AI tool to erase and replace an unwanted object with any element of your choice.",
      "model example": "Model",
      "social media title": "Dominate attention on",
      "social media": "social media",
      "social media subtitle": "Turn your ideas into viral content optimized for TikTok and Instagram.",
      "cutting edge technology": "Cutting-edge technology",
      "advanced engines": "Powered by the world's",
      "most advanced in world": "most advanced generation engines",
      "video": "VIDEO",
      "hybride": "HYBRID",
      "image": "IMAGE",
      "texte": "TEXT",
      "faq title": "Frequently Asked",
      "faq highlight": "Questions",
      "faq question 1": "What is Eclipse and how does it work?",
      "faq answer 1": "Eclipse is an AI-powered creative studio that transforms your ideas into cinematic works. We use a hybrid architecture combining the best generation engines currently available with our own optimization technology to ensure professional fluidity and aesthetics.",
      "faq question 2": "Do I need technical skills to use Eclipse?",
      "faq answer 2": "Absolutely not. Eclipse was designed to simplify creation. Simply describe your scene or import an image, and our interface handles configuring the engines' complex settings to generate a high-quality result.",
      "faq question 3": "Which generation engines are used?",
      "faq answer 3": "Rather than limiting ourselves to a single model, Eclipse dynamically selects the most efficient engine according to your request. Whether for cinematic rendering, stylized animation or complex camera movements, we harness the power of leading market engines to offer you the best possible result.",
      "faq question 4": "Do the generated videos belong to me?",
      "faq answer 4": "Yes, you retain all rights to the content created with Eclipse. You can use it for your social networks, advertisements or personal projects without any restrictions.",
      "faq question 5": "What is the maximum video duration?",
      "faq answer 5": "Currently, you can generate clips ranging from 4 to 15 seconds. Thanks to our extension feature, you can then extend these sequences to create longer stories while maintaining perfect visual consistency.",
      "cinematic excellence accessible": "Cinematic excellence accessible to everyone.",
      "tools": "Tools",
      "company": "Company",
      "footer terms": "Terms of Use",
      "footer privacy": "Privacy Policy",
      "footer cgv": "Terms and Conditions of Sale",
      "legal notice": "Legal Notice",
      "back to top": "Back to top",
      "pricing footer": "Pricing",
      "community": "Community",
      "all rights reserved": "All rights reserved.",
      "powered by leading engines": "Powered by leading generation engines on the market.",
      "welcome": "Ovortex",
      "continue google": "Continue with Google",
      "continue email": "Continue with Email",
      "password": "Password",
      "login": "Log in",
      "register": "Sign up",
      "forgot password": "Forgot password?",
      "otp title": "Two-Factor Authentication",
      "otp subtitle": "Enter the 6-digit code received by email.",
      "validate code": "Verify code",
      "remember device": "Remember this device for 30 days",
      "text to image": "Text to Image",
      "image to video": "Image to Video",
      "production soon": "Production (soon)",
      "other tools soon": "Other tools (Soon)",
      "history": "My History",
      "pricing": "Pricing",
      "my account": "My Account",
      "logout": "Log out",
      "reset lightning": "Lightning Reset",
      "validity diamonds": "Diamond Validity",
      "under 30 days": "Within 30 days",
      "valid 1 year": "Valid for 1 year",
      "legend": "LEGEND",
      "elite": "ELITE",
      "master": "MASTER",
      "standard": "STANDARD",
      "essential": "ESSENTIAL",
      "api developer": "API & Developer Module",
      "beginner": "BEGINNER",
      "continue apple": "Continue with Apple",
      "or": "OR",
      "your email": "Your email",
      "create my account": "Create my account",
      "already have account": "Already have an account?",
      "new here": "New here?",
      "create account": "Create an account",
      "reset password": "Reset password",
      "reset password description": "Enter your email to receive a recovery link.",
      "send link": "Send link",
      "back to login": "Back to login",
      "by continuing you accept": "By continuing, you accept the",
      "terms of use": "Terms of Use",
      "and": "and the",
      "privacy policy": "Privacy Policy",
      "allow popups login": "Please allow popups to log in",
      "google login error": "Error signing in with Google",
      "apple login error": "Error signing in with Apple",
      "enter email": "Enter your email",
      "link sent to": "Link sent to",
      "account not found": "Account not found",
      "check email": "Please check your email",
      "otp sending error": "Error sending the OTP code",
      "verification code sent": "A verification code has been sent to your email.",
      "email already in use": "This email is already associated with an account.",
      "invalid email password": "Incorrect email address or password.",
      "invalid email format": "The email address format is invalid.",
      "weak password": "The password must contain at least 6 characters.",
      "unexpected error": "An error occurred. Please try again.",
      "invalid code": "Invalid code",
      "code validation error": "Error validating the code",
      "custom volume title": "Custom Volume",
      "loyalty benefit": "Loyalty Benefit",
      "applied to order": "applied to your order",
      "adjust slider exact amount": "Adjust the slider to choose your exact amount",
      "diamonds": "Diamonds",
      "buy volume": "Buy this volume",
      "unit price": "Unit price",
      "diamond": "diamond",
      "quick boost title": "Need a quick boost?",
      "subscriber rate active": "Subscriber rate active!",
      "exclusive discounts": "Enjoy your exclusive discounts",
      "diamonds valid one year": "Diamonds are valid for 1 year",
      "popular": "POPULAR",
      "best value": "BEST VALUE",
      "diamond pack spark": "Spark",
      "diamond pack supernova": "Supernova",
      "diamond pack galaxy": "Galaxy",
      "diamond pack pulsar": "Pulsar",
      "diamond pack quasar": "Quasar",
      "diamond pack universe": "Universe",
      "buy": "Buy",
      "custom serenity pack": "Customize your Serenity Pack",
      "support type": "Type of support",
      "one time project": "One-time Project",
      "monthly support": "Monthly Support (Serenity)",
      "professional photos": "Number of professional photos",
      "ai professional videos": "Number of professional AI videos",
      "social media management": "Social media management",
      "one time estimate": "Estimated one-time project cost",
      "monthly estimate": "Estimated monthly investment",
      "per month": "/month",
      "one time": "One-time",
      "monthly serenity": "Monthly (Serenity Pack)",
      "hello": "Hello,",
      "quote request intro": "I would like a quote for a customized Serenity Pack:",
      "type label": "TYPE",
      "photos label": "PHOTOS",
      "professional visuals": "professional visuals",
      "videos label": "VIDEOS",
      "ai sequences": "AI sequences",
      "social media label": "SOCIAL MEDIA",
      "yes included": "YES (Included)",
      "no": "NO",
      "estimate label": "ESTIMATE",
      "thank you": "Thank you.",
      "request serenity quote": "Request my Serenity Quote",
      "free analysis 24h": "Free project analysis within 24 hours",
      "back": "Back",
      "choose your power": "Choose your power",
      "power your creativity": "Power your creativity with the world's best AI engines",
      "monthly": "Monthly",
      "yearly": "Yearly",
      "no commitment": "No Commitment",
      "ideal to test engines": "Ideal for testing our engines",
      "lightnings": "Lightnings",
      "month": "month",
      "reset each month": "reset each month",
      "access all engines": "Access to all engines (depending on packs)",
      "optimized prompt": "Optimized prompt feature",
      "prompt models access": "Access to prompt models",
      "packs purchase access": "Access to pack purchases",
      "explore studio": "Explore Studio",
      "best value quality price": "BEST VALUE FOR MONEY",
      "hd image flux": "High Definition Image: Flux Dev / Schnell",
      "hd video engines": "High Definition Video: HD & FULL HD",
      "up to 33 videos or 300 images": "Up to 33 HD videos or 300 images",
      "subscribe now": "Subscribe now",
      "most popular": "MOST POPULAR",
      "all image video engines hd": "All Image & Video engines in HD & FULL HD",
      "up to 77 videos or 700 images": "Up to 77 HD videos or 700 images",
      "become standard": "Become Standard",
      "plus 60 creative power": "+60% CREATIVE POWER",
      "up to 134 videos or 1200 images": "Up to 134 HD videos or 1,200 images",
      "upgrade master": "Upgrade to Master",
      "ultimate offer": "ULTIMATE OFFER",
      "for intensive creators": "FOR INTENSIVE CREATORS",
      "up to 277 videos or 2500 images": "Up to 277 HD videos or 2,500 images",
      "max server priority": "Maximum server priority (No queue)",
      "join elite": "Join Elite",
      "premium agency": "PREMIUM AGENCY",
      "ultimate tool pro studios": "THE ULTIMATE TOOL FOR PRO STUDIOS",
      "up to 888 videos or 8000 images": "Up to 888 HD videos or 8,000 images",
      "become legend": "Become a Legend",
      "concierge": "CONCIERGE",
      "zero effort pro result": "ZERO EFFORT, PRO RESULT",
      "quote": "By Quote",
      "project": "project",
      "we prompt for you": "We create the prompts for you",
      "high quality image video": "High-quality image & video generation",
      "upscale pro retouching": "Professional upscaling and retouching included",
      "contact us": "Contact us",
      "recharge on demand": "Or Recharge on Demand",
      "subscription diamonds note": "Subscription Lightnings expire every month. Purchased Diamonds remain valid for one year.",
      "request sent": "Request sent!",
      "request received": "We have received your information and will get back to you shortly.",
      "quote request": "Quote request",
      "information": "Information",
      "report problem": "Report a problem",
      "request details placeholder": "Describe your request here...",
      "cancel": "Cancel",
      "sending": "Sending...",
      "send": "Send",
      "login required diamonds": "You must be logged in to buy Diamonds.",
      "login required subscription": "Please log in to subscribe.",
      "tutorialUi": {
        "academyImage": "OVORTEX ACADEMY · IMAGE",
        "academyVideo": "OVORTEX ACADEMY · VIDEO",
        "stepGuide": "📘 Step-by-step guide",
        "promptExample": "✨ Prompt example",
        "featuresTitle": "Features of this model",
        "stepByStep": "Step-by-step guide",
        "tip": "Tip: change one element at a time to understand what improves the result.",
        "resources": "Documentation and resources",
        "resourcesPending": "This section will be completed with verified video resources for this model. In the meantime, consult the model documentation when an official link is available.",
        "engineDocs": "Model documentation",
        "promptHint": "Replace the bracketed elements with your idea. This template is a starting point: adapt it to the images and options you added.",
        "imagePromptHint": "Replace the bracketed instructions with your idea. Image numbers must match the references added in the panel.",
        "copied": "Copied!",
        "copyUnavailable": "Copy is unavailable in this browser: select the text above.",
        "copyUnavailableImage": "Copy is unavailable: select the text and copy it.",
        "copyPrompt": "📋 Copy prompt",
        "usePrompt": "Use in the generation field",
        "promptCopied": "Prompt copied!",
        "aboutEngine": "About this model",
        "recommendedSteps": "Recommended steps",
        "seeExample": "View prompt example →",
        "closeTutorial": "Close tutorial",
        "videoPromptHint": "Replace the bracketed items with details about your video.",
        "modelOptionsMayVary": "Available settings may vary by model. Use the options actually shown in Ovortex rather than those shown in an external video."
      },
      "suggestions": {
        "image": {
          "1": {
            "title": "Cyberpunk City",
            "prompt": "A futuristic cyberpunk view of Central Park, filled with neon lights, cinematic lighting, 8K, ultra-detailed."
          },
          "2": {
            "title": "Sniper",
            "prompt": "A sniper wearing white snow camouflage lies in deep snow in a high mountain setting. Extreme realism, ground-level camera angle, sharp focus on the rifle, hostile winter atmosphere and harsh high-altitude light."
          },
          "3": {
            "title": "Sunset",
            "prompt": "A crab perched on a rock watches the sunset over a beach. Keep the beach slightly out of focus."
          },
          "4": {
            "title": "Fight in Urban Ruins",
            "prompt": "Ultra-realistic scene: a blue-haired tactical woman lands on the ground inside a ruined building. Her gaze is piercing and focused, and her jacket floats in the air as she aims directly at the viewer."
          },
          "5": {
            "title": "Woman in a Night Penthouse",
            "prompt": "Cinematic anime illustration, full-body female antagonist standing in a luxurious modern penthouse office at night, pointing a pistol directly at the camera. Dominant, threatening pose, pronounced low-angle view, elegant black suit jacket, fitted black shirt slightly open at the collar, tailored black trousers, discreet metal chain at the belt, one hand in her pocket, short black layered haircut, glowing red eyes, pale skin, cold and determined expression. Dramatic lighting, ultra-realistic face and hair details, glossy black marble floor, executive desk and leather chair in the background, huge windows overlooking a brightly lit city at night, realistic surface reflections. Dark, sophisticated neo-noir atmosphere, cinematic shadows, realistic anime style, masterpiece quality, extreme sharpness, volumetric lighting, depth of field, high contrast, professional concept art, 8K, action-thriller mood."
          },
          "6": {
            "title": "Anime",
            "prompt": "Anime style: a young woman with long, wavy blonde hair and golden-yellow eyes sits in the center of a green wooden park bench. She has a bandage and wears an open green jacket over a dark uniform decorated with gold buttons, with a red-and-black scarf. A red badge is visible on her sleeve. Her hands rest on her knees above a white pleated skirt. She is in a park, looking directly at the viewer with a serious expression."
          },
          "7": {
            "title": "The Island Under the Full Moon",
            "prompt": "A magnificent traditional Asian temple made of several illuminated pagodas stands beside a perfectly still lake reflecting the entire scene. An enormous golden full moon dominates the sky and is fully reflected in the water. A spectacular mountain valley with majestic vertical cliffs is wrapped in mist. An autumn forest in warm orange, red and gold surrounds the temple. Glowing lanterns create a mystical, welcoming atmosphere, while cinematic fog drifts between the mountains. Richly detailed Asian architecture with curved roofs, carved wood and traditional lighting. Peaceful, magical and spiritual mood. Volumetric lighting, subtle light rays, ultra-realistic water reflections, perfectly symmetrical composition, natural depth of field, rich contrasting colors, extreme photorealism, ultra-detailed masterpiece, cinematic fantasy landscape, HDR, global illumination, ray tracing, Unreal Engine quality, 8K, razor-sharp focus, highly detailed textures, professional landscape photography, breathtaking panoramic scenery, golden moonlight, realistic mist, award-winning photography."
          },
          "8": {
            "title": "3D",
            "prompt": "An enormous royal throne covered in red velvet and richly carved gold ornaments, decorated with heraldic motifs and lion statues. A majestic rat sleeps peacefully on the throne like a king, wearing a crown set with blue and gold gemstones and delicately holding a royal scepter between its paws. The setting is an ancient ruined Gothic cathedral with gigantic stone arches, monumental columns and debris scattered across the floor. Powerful beams of light pass through tall windows, illuminating the rat and throne with a sacred, dramatic atmosphere. Dust particles float in the light beams. Ultra-detailed textures of velvet, carved wood, ancient stone and the rat's fur. Cinematic atmosphere, realistic medieval fantasy, extreme photorealism, natural depth of field, volumetric lighting, ray tracing, HDR, global illumination, Unreal Engine 5 quality, ultra-realistic masterpiece, highly detailed, 8K, cinematic fantasy, dramatic lighting, award-winning photography."
          },
          "9": {
            "title": "Underwater Submersion",
            "prompt": "A Japanese samurai warrior in profile on the right side of the image, gazing determinedly toward the horizon. Black hair tied in a traditional topknot, light beard, richly textured dark kimono, katana visible at his belt. Behind him appears his spiritual double, made entirely of crystalline water and translucent fluids. The watery figure is reversed and faces the opposite direction, creating a strong visual contrast. Its silhouette is formed from waves, splashes, liquid filaments and suspended droplets. Abstract background of blue, midnight blue, gray and white inks, watercolor effects and paint splashes. Mystical, spiritual, contemplative atmosphere. Dramatic cinematic lighting, extreme detail in the face, hair, fabric and water. Realistic reflections, perfect transparency, ultra-detailed textures, premium artistic composition, photorealistic concept art, masterpiece, ultra-realistic, cinematic and volumetric lighting, fantasy realism, hyper-detailed, 8K, HDR, sharp focus, award-winning digital art."
          },
          "10": {
            "title": "Sinister Forest",
            "prompt": "A terrified woman runs through a dark, dense forest. Thick fog envelops dead trees and broken branches, creating a horror-thriller atmosphere. She holds a flashlight whose beam cuts through the mist, revealing her panicked face and body covered in mud and signs of a struggle. Her clothes are torn and soiled from running and pushing through natural obstacles. Dramatic light, oppressive mood, dampness and realistic forest-floor textures, detailed leaves and branches. Tall, slender trees, natural depth of field, ultra-detailed face, clothing and ground textures. Cinematic horror-thriller photography, ultra-realistic, HDR, 8K, high contrast, extreme realism, masterful light and shadow."
          },
          "11": {
            "title": "Magazine",
            "prompt": "A blonde woman sits confidently on the hood of a cream-colored 1960s vintage car, seen from a dramatic low angle. She wears an elegant green jumpsuit and beige lace-up military boots. One leg extends toward the lens, making the shoe sole prominent in the foreground. Serious expression, direct eye contact with the camera. A road lined with a few widely spaced palm trees, golden sunset light and a Californian atmosphere. Realistic reflections on the vintage car's chrome bodywork. Cinematic depth of field, ultra-sharp details on her face, clothing and vehicle. Natural golden-hour lighting, soft shadows, realistic colors, high-end fashion photography, professional composition, ultra-realistic, 8K, HDR, extreme photorealism, detailed skin texture, 24 mm wide-angle lens, luxury magazine quality."
          },
          "12": {
            "title": "Scene Integration",
            "prompt": "Edit the photo by adding a dark-gray coat and a long forest-green pleated skirt. Pose: she stands on a paved path, one hand in her coat pocket, in an elegant stance turned slightly toward the camera. Setting: Central Park in autumn, with orange and golden foliage framing the view and the New York skyscraper skyline visible in the background. Atmosphere: fallen leaves and a few book pages scatter across the ground, creating a poetic, melancholy mood. Additional element: a small framed inset in the upper-left corner shows a portrait close-up of the same woman from a different angle."
          },
          "13": {
            "title": "Marketing",
            "prompt": "Ultra-realistic beauty portrait of a blonde woman with green eyes, an intense direct gaze, natural freckles and glossy burgundy lips. High-end professional makeup; she holds a pink lipstick near her face and has elegant red nails and gold earrings. Dramatic red lighting, luxurious glamorous mood, luminous skin with realistic texture, premium cosmetics photography, makeup-brand advertising, cinematic depth of field, extreme detail, photorealism, fashion-magazine quality, professional studio, 8K, ultra-detailed."
          },
          "14": {
            "title": "Watercolor Portrait",
            "prompt": "High-quality logo in watercolor style: a powerful, colorful fox head viewed from the front, on a monochrome background. By Yukisakura, beautiful vivid and rich colors, square format."
          },
          "15": {
            "title": "Cyberpunk Woman",
            "prompt": "In a dystopian cyberpunk future, a petite young Korean woman with a fragile, vulnerable appearance walks along a street in a small cyberpunk city. She has short, tousled purple hair accented with glowing neon highlights. She wears heavily worn clothing: cargo pants, a torn crop top and a long coat. A cyberdeck is strapped to the upper part of her left thigh. Her face conveys fatigue, exhaustion and a deep sense of helplessness."
          }
        },
        "video": {
          "1": {
            "title": "Twilight",
            "typeStyle": "MANGA",
            "prompt": "A lone samurai in detailed armor stands on a hill of tall grass, facing an intense red sunset over a distant Japanese city. Strong wind moves his clothing and the grass. Epic, melancholic mood; dramatic sky with luminous clouds. Camera: begin with a medium shot from behind, then make a fast, smooth pullback revealing the valley and city, followed by a slight 180-degree orbit around the samurai for a cinematic ending. High-contrast golden-hour light, realistic lens flare, cinematic depth of field, ultra-realistic Japanese blockbuster-film look."
          },
          "2": {
            "title": "Futuristic",
            "typeStyle": "Cyberpunk",
            "prompt": "A young cyberpunk woman with purple hair walks through a lively, wet Korean alley. Begin with an extreme close-up of her boots slowly crossing wet asphalt, with colorful neon reflections in puddles. Smooth tracking shot moving backward with her steps. After one second, the camera gradually rises along her legs, tactical gear and worn coat. She walks confidently with her hands in her pockets. Continue upward to her face, revealing the whole alley, glowing Korean signs, steam rising from drains and pedestrians in the background. Realistic cyberpunk atmosphere, natural movement, cinematic lighting, realistic depth of field and wet-ground reflections, ultra-realistic, 8K, film quality, extreme detail."
          },
          "3": {
            "title": "Sinister Forest",
            "typeStyle": "Realistic",
            "prompt": "In the heart of a dark, foggy forest at night, a terrified woman runs at full speed along a narrow muddy path winding between dead trees and tangled branches. Her clothes are dirty and torn; her face is sweaty, muddy and frightened. She grips a flashlight whose beam cuts through the thick fog. Natural, realistic running mechanics, accurate foot placement and weight transfer, subtle breathing, hair and clothes reacting naturally. No slow motion. Start with a dramatic low-angle tracking shot close to the ground as she runs toward the camera; wet roots, mud splashes and broken branches rush past in the foreground. The flashlight sweeps across trees, creating moving shadows and volumetric light through the mist. As she keeps fleeing, the camera gradually rises and smoothly pulls back, changing from a low chase shot to an increasingly high aerial view. Reveal the vast, isolated forest; the woman becomes a tiny silhouette fleeing through the darkness. Cinematic aerial wide shot, drifting dense fog, realistic atmospheric depth, moonlight filtering through the canopy. Ultra-realistic horror-thriller mood, cinematic lighting, volumetric fog, realistic flashlight illumination, natural camera motion, detailed forest, wet-ground reflections, photorealistic textures, HDR, constant dramatic tension, Hollywood blockbuster quality, 8K, immersive cinematic horror."
          },
          "4": {
            "title": "Race",
            "typeStyle": "3D",
            "prompt": "An ultra-dynamic cinematic shot in a dense forest transformed into a racecourse. Two highly detailed anthropomorphic rabbits sprint against each other along a narrow dirt trail. The white rabbit in a blue T-shirt and backpack leads, closely chased by a gray rabbit in a red T-shirt, both intensely determined. Low ground-level camera with a very fast forward tracking move and slight professional race-camera shake. Emphasize speed, motion blur on arms and legs, dust and dirt particles bursting with every stride. Lush vegetation at the sides, blurred animal spectators in the background with shallow depth of field. Extreme-sports style, championship-race atmosphere, dramatic golden light filtering through trees, ultra-realistic high-budget animated-film 3D rendering, maximum tension and energy."
          },
          "5": {
            "title": "Astronaut",
            "typeStyle": "SPACE",
            "prompt": "A lone astronaut floats in deep space above Earth. Begin with an extremely wide shot showing the vast cosmos, Earth's curvature and the tiny astronaut at the center. The camera gradually advances in a smooth, fast dolly-in. As it approaches, details of the spacesuit become visible and sunlight reflects in the visor. At medium distance, the camera makes a 180-degree orbit around the astronaut, successively revealing Earth behind them and then the star-filled void. Perfectly stable movement, convincing zero gravity, realistic space lighting and physical reflections, IMAX quality, extreme photorealism, cinematic depth of field, 8K, big-budget space-documentary style, natural motion blur, ultra-realistic details, epic and contemplative mood."
          },
          "6": {
            "title": "Park",
            "typeStyle": "ANIME",
            "prompt": "Animated style: a woman sits on a park bench; a cat climbs onto her lap and she gently strokes it."
          },
          "7": {
            "title": "Realistic",
            "typeStyle": "Realistic",
            "prompt": "Ultra-realistic scene in a luxurious, slightly messy hotel room. A blonde woman sits on the bed, with black makeup covering much of the area around her eyes. The camera slowly tracks forward into a close-up of her exhausted-looking face."
          },
          "8": {
            "title": "Mountain Landscape",
            "typeStyle": "Film",
            "prompt": "Moving golden fluid, magnetic waves, luxury, abstract 3D art."
          },
          "9": {
            "title": "Neo-noir Anime",
            "typeStyle": "Anime",
            "prompt": "Cinematic anime illustration: a full-body female antagonist stands in a luxurious modern penthouse office at night, aiming a pistol directly at the camera. Dominant, threatening stance and a strong low angle; as she advances, the camera tracks backward at her pace. Elegant black suit jacket, fitted black shirt slightly open at the collar, tailored black trousers, a subtle metal chain at the belt, one hand in her pocket, short tapered black hair, glowing red eyes, pale skin, and a cold, determined expression. Dramatic lighting, highly detailed face and hair, glossy black marble floor, executive desk, leather chair, and huge windows overlooking a brightly lit city at night. Realistic reflections on surfaces, then a camera zoom toward her face. Dark, sophisticated neo-noir mood, cinematic shadows, realistic anime style, masterpiece quality, extreme sharpness, volumetric lighting, depth of field, high contrast, professional concept art, 8K quality, action-thriller atmosphere."
          },
          "10": {
            "title": "Creepy Doll",
            "typeStyle": "Horror",
            "prompt": "An abandoned Victorian house; a dark, decaying room with torn wallpaper, floating dust, cobwebs, and cinematic lighting. A terrifying cracked porcelain doll sits motionless in an old velvet armchair at the center of the room. The camera slowly dollies forward from a wide shot to a closer shot. Faint moonlight enters through the window while a flickering candle casts moving shadows across the walls. The doll's tangled hair shifts slightly in a draft. During the final two seconds, its head slowly turns toward the camera in an unnatural, disturbing movement, its eyes seeming to follow the lens. Oppressive atmosphere, psychological horror, ultra-realistic, Hollywood film quality, volumetric lighting, cinematic depth of field, extreme detail, 4K, 16:9."
          },
          "11": {
            "title": "Moving Camera",
            "typeStyle": "Realistic",
            "prompt": "Ultra-realistic nighttime surveillance footage of a garden completely covered in fresh snow. A fixed black-and-white infrared security camera captures the scene, with slight digital noise, compression artifacts, and a visible timestamp in the corner. A large, motionless snowman stands in the center of the garden. A man walks through the snow toward it, leaving footprints behind. When he comes within one meter, a cat suddenly bursts out from inside the snowman at tremendous speed and leaps straight at the man's face; he recoils sharply, shouting in surprise. The camera records the event with choppy movement, authentic surveillance quality, and an unsettling mood. Realistic nighttime lighting, natural shadows, photorealistic detail, cinematic 4K, like a viral video of an unexplained event captured by a real security camera."
          },
          "12": {
            "title": "Ocean",
            "typeStyle": "3D",
            "prompt": "A crab on a rock watches the sunset over a beach. The beach is slightly out of focus."
          },
          "13": {
            "title": "Attack",
            "typeStyle": "Realistic",
            "prompt": "Ultra-realistic cinematic scene: an enormous horde of zombies overruns Times Square at night. Hundreds of panicked civilians flee in every direction as zombies chase them through illuminated streets. Abandoned vehicles, collisions, explosions, screams, and total chaos plunge the city into an apocalypse. Dynamic camera, frantic movement, big-budget disaster-film mood, realistic urban lighting, photorealistic detail, 4K. Spectacular final aerial shot of New York: the entire city is ablaze, huge columns of black smoke cover the horizon, and several neighborhoods are devastated by fires. Apocalyptic atmosphere, glowing firelight, massive destruction, ultra-realistic rendering. Final sequence from the devastated New York waterfront, shrouded in smoke and flames. Helicopters fly over the stricken city as explosions light up the horizon. End-of-the-world mood, epic cinematography, extreme detail, 4K, Hollywood blockbuster style."
          },
          "14": {
            "title": "Volcano",
            "typeStyle": "Animation",
            "prompt": "Ultra-realistic cinematic shot of a lush prehistoric world during a massive volcanic eruption. The camera opens on a wide aerial view above an extremely dense, detailed jungle. Dinosaurs on the ground (T-Rex, triceratops, and sauropods) raise their heads and look toward the erupting volcano in the distance. A spectacular volcanic blast throws lava into the air beneath a gigantic ash cloud. Pterodactyls fly across a dramatic sky. Abundant vegetation, humid jungle, volumetric fog, and golden late-afternoon light. Smooth camera movement with a slight forward dolly and a gentle turn toward the volcano. Blockbuster style, hyper-realistic, cinematic depth of field, 4K."
          },
          "15": {
            "title": "Cinematic",
            "typeStyle": "Cinematic",
            "prompt": "A fixed camera in the dark, abandoned hallway of a dilapidated old house. Faint natural light comes from a window at the far end, with curtains moving slightly. A woman around 40, wearing a dirty, torn pajama set, slowly crawls toward the camera across a damp wooden floor. She is extremely panicked, breathing heavily and trembling. She suddenly stops and slowly turns her head backward with a terrified look, as if something off-screen is pursuing her. Oppressive atmosphere, silence, and steadily rising tension. The camera remains still, with a subtle realistic handheld-camera vibration. Ultra-realistic horror-film style, cold light, cinematic grain, 4K, shallow depth of field, grim, heavy atmosphere. Duration: 10 seconds; slow, continuous movement, tension building until her final backward glance."
          }
        }
      },
      "tutorialResourceLabels": {
        "seedance20": "Model overview and information",
        "hailuo": "Official Hailuo 2.3 overview",
        "kling2_6": "Official Kling guides, including guide 2.6",
        "kling26_motion": "Official Kling and Motion Control guides",
        "kling30": "Official Kling 3.0 guide",
        "veo3_1": "Official Veo 3.1 guide",
        "veo3_1_fast": "Official Veo 3.1 guide",
        "minimax_h3": "MiniMax video guide",
        "seedance25": "Seedance practical guide",
        "seedance": "Seedance family documentation",
        "hailuoTitle": "Hailuo 2.3 — video tutorial",
        "seedance20Title": "The Complete Seedance 2.0 Tutorial for Beginners"
      },
      "app": {
        "prompt": {
          "aiDiscussion": "AI Discussion",
          "creative": "CREATIVE PROMPT",
          "askQuestion": "Ask your question...",
          "describeIdea": "Describe your idea in detail..."
        },
        "optimize": {
          "analyzing": "⏳ Analyzing...",
          "button": "✨ Optimize"
        },
        "upload": {
          "load": "📁 Upload",
          "fileLimits": "Per-file limits: image 20 MB · video 64 MB · audio 20 MB."
        },
        "style": {
          "realistic": "Realistic",
          "cyberpunk": "Cyberpunk",
          "anime": "Anime",
          "watercolor": "Watercolor",
          "animation3d": "3D Animation"
        },
        "status": {
          "generationFinalizing": "Generation is being finalized...",
          "fileLoading": "Loading file...",
          "fileImported": "Imported file",
          "generatingOnModel": "⏳ Generation in progress on {{model}}...",
          "priorityMax": "⚡ Max Priority: {{model}} responds immediately...",
          "videoLoaded": "🎬 Video loaded into Studio!",
          "imageLoaded": "🖼️ Image loaded into Studio!",
          "newProject": "New project started!"
        },
        "error": {
          "selectCharacterImage": "Please select an image for the character.",
          "importMotionVideo": "Please upload a reference video for the motion.",
          "generation": "Generation error",
          "falTimeout": "Fal.ai request timed out.",
          "securityUnavailable": "Security verification is unavailable. Please refresh the page and try again.",
          "videoUnavailable": "Processing finished, but the video is unavailable. Please try again.",
          "sessionExpired": "Your session has expired. Sign in again and retry.",
          "notLoggedIn": "Error: User is not logged in or the session has expired.",
          "hailuo512Image": "Hailuo 512 requires a starting image. Add an image to continue.",
          "hailuo512Title": "Starting image required",
          "insufficientCredits": "Not enough credits! This generation costs {{price}} 💎.",
          "motionImages": "Add the motion reference images required by this model.",
          "technicalGeneration": "A technical error occurred during generation. Please try again.",
          "deleteFailed": "Unable to delete this item.",
          "deleteServerFailed": "An error occurred while deleting the item on the server.",
          "fileTooLarge": "File “{{fileName}}” exceeds the {{maxSize}} limit for {{label}} (file size: {{actualSize}}).",
          "fileTooLargeSimple": "File “{{fileName}}” exceeds the {{maxSize}} limit for {{label}}.",
          "fileUploadFailed": "Unable to upload file “{{fileName}}”.",
          "serverRequestFailed": "The request failed (server error {{status}}). Please try again shortly.",
          "rateLimited": "Too many requests in a short time. Wait a moment and try again.",
          "requestTimeout": "The request took too long. Please try again."
        },
        "history": {
          "noDescription": "No description",
          "remix": "Remix",
          "title": "Creation history",
          "remixButton": "Remix",
          "editButton": "Edit",
          "editVideoTitle": "Edit this video"
        },
        "insufficient": {
          "diamondsMessage": "Your diamond balance is too low for this operation.",
          "buyDiamonds": "🛒 Buy diamonds",
          "subscribeOrBuy": "🚀 Subscribe or Buy Diamonds",
          "stayStudio": "Stay in the studio",
          "cost": "Cost of this generation: {{cost}}",
          "diamonds": "Available diamonds: {{count}}",
          "tokens": "Available bolts: {{count}}",
          "tokensHelp": "Bolts come with your subscription. Diamonds are purchased separately."
        },
      
        "edit": "Edit",
        "settings": {
          "pixverseAdvanced": "ADVANCED OPTIONS",
          "pixverseDescription": "Customize the style, pacing, and consistency of generation.",
          "multiShot": "Multiple shots / angle changes",
          "multiShotHelp": "Allows multiple shots in a single video.",
          "visualStyle": "Visual style",
          "automatic": "Automatic",
          "clay": "Clay",
          "comic": "Comic book",
          "thinkingLevel": "Reasoning level",
          "enhanced": "Enhanced",
          "fast": "Fast",
          "random": "Random",
          "negativePrompt": "Negative prompt",
          "negativePromptExample": "E.g. blur, artifacts, jerky motion, distorted text…",
          "addImages": "Add images",
          "addVideos": "Add videos",
          "addAudios": "Add audio files",
          "referenceImage": "Reference image {{number}}",
          "referenceVideo": "Reference video {{number}}",
          "referenceAudio": "Reference audio {{number}}",
          "imageEditPrecise": "Precise editing",
          "guidedComposition": "Guided composition",
          "multipleReferences": "Multiple references",
          "addReferenceImages": "Add reference images",
          "imageLimitReached": "Image limit reached",
          "chooseFiles": "Click to choose files from your computer",
          "referencesAdded": "References added",
          "removeImageHint": "Click × to remove an image",
          "noImageReferences": "No images added. References are optional; you can also generate from the prompt alone.",
          "engineSettings": "Model settings",
          "outputFormat": "Output format",
          "optionalSeed": "Optional seed",
          "imageQuality": "GPT Image 2 quality",
          "moderation": "Moderation",
          "standard": "Standard",
          "lessRestrictive": "Less restrictive",
          "safetyTolerance": "Safety tolerance (0–5)",
          "thinking": "Thinking",
          "minimalFaster": "Minimal · faster",
          "temperature": "Temperature (0–2)",
          "topP": "Top P (0–1)",
          "systemInstruction": "System instruction",
          "optional": "optional",
          "generalInstructions": "General instructions to follow…",
          "referenceVideoNote": "It guides the generated still image; it does not turn the result into a video.",
          "chooseVideo": "Choose a video",
          "videoAdded": "Video added",
          "usedAsVisualReference": "It will be used as a visual reference for the image.",
          "referenceTip": "Tip: describe each image’s role in your prompt and specify what to keep or change.",
          "tutorialEngine": "Model tutorial",
          "seedOptional": "Seed — optional",
          "negativePromptLabel": "Negative prompt",
          "avoidElements": "— elements to avoid"
        },
        "video": {
          "existingOperations": "Operations on an existing video",
          "extend": "Extend video",
          "edit": "Edit video",
          "extendDescription": "Describe what happens after the last frame. Duration and results depend on the selected model.",
          "editDescription": "Describe the desired changes and specify what must remain the same.",
          "importSourceFirst": "Import a source video in the media panel first to use these operations.",
          "changeAppearance": "Change appearance · AI filters and lighting",
          "addSourceForVeo": "Add a source video to enable Veo’s “{{operation}}” mode.",
          "describeIdea": "Describe your idea in detail...",
          "characters": "{{count}} characters",
          "changeAppearanceLabel": "AI filters and lighting",
          "extendGuideTitle": "How to extend your video",
          "editGuideTitle": "How to edit your video",
          "extendOrEditGuideTitle": "To extend or edit a video",
          "addSourceSeedance": "First add a source video in the Seedance 2.5 panel, then choose “Extend video” or “Edit video”.",
          "extendSeedanceHelp": "Describe what should happen after the last frame, what action continues, what appears, and how many seconds to add. Keep the character, setting, and camera movement consistent.",
          "editSeedanceHelp": "State exactly what should change and what must remain the same. To avoid unwanted changes, specify that characters, motion, framing, and original duration should be preserved.",
          "useExtendExample": "Use extension example",
          "useEditExample": "Use editing example",
          "characterCount": "{{count}} characters"
        },
        "audio": {
          "ai": "AI audio",
          "included": "Audio included",
          "native": "Native audio",
          "soundDesign": "Sound design",
          "unavailable": "Audio unavailable",
          "referenceDialogue": "Reference audio and dialogue",
          "referenceHelp": "Use up to 3 audio files to guide the voice. You must also add an image or video in the References panel; first/last-frame slots alone are not enough for reference audio.",
          "remove": "Remove",
          "exactDialogue": "Exact dialogue to speak (optional)",
          "dialogueExample": "E.g. The character says: “We need to leave now.”",
          "referenceLimit": "Audio guides voice and delivery but does not guarantee an exact copy of the recording. Up to 12 reference files total; combined reference audio and video must not exceed 15 seconds.",
          "promptExpansion": "Prompt expansion",
          "disabledMoreFaithful": "Disabled (more faithful)",
          "balanced": "Balanced",
          "qualityPriority": "Quality priority",
          "seedOptional": "Optional seed"
        },
        "badge": {
          "new": "New",
          "startEnd": "Start + end",
          "topArena": "Top Arena"
        },
        "cancel": "Cancel",
        "cost": {
          "diamonds": "Diamonds",
          "diamondsLower": "diamonds",
          "tokens": "Bolts",
          "tokensLower": "bolts",
          "total": "Total cost"
        },
        "defaultImageAlt": "Generated image",
        "delete": {
          "button": "Delete",
          "title": "Confirm deletion"
        },
        "download": "Download",
        "duration": "Duration",
        "explorer": {
          "title": "Explore creations"
        },
        "formatStyle": "Format and style",
        "generate": {
          "button": "Generate",
          "imageRequired512": "This model requires a 512-format starting image.",
          "imageVideoRequired": "Add a reference image or video to continue.",
          "inProgress": "Generating…",
          "send": "Submit for generation"
        },
        "loading": {
          "generation": "Preparing generation…"
        },
        "mode": {
          "remastered": "Remastered"
        },
        "newDiscussion": "New conversation",
        "noSelection": "Nothing selected",
        "remix": {
          "creative": "Creative",
          "fidelity": "Fidelity",
          "strict": "Strict"
        },
        "resolution": "Resolution",
        "security": {
          "sync": "Secure sync in progress…"
        },
        "slot": {
          "endBlocked": "End image is not supported by this model.",
          "endImage": "End image",
          "endUnavailable": "End image unavailable",
          "startBlocked": "Starting image is not supported by this model.",
          "startImage": "Starting image",
          "v2vUnavailable": "Video-to-video is unavailable for this model.",
          "videoBlocked": "Source video is not supported by this model.",
          "videoSource": "Source video"
        },
        "tip": {
          "kling": {
            "text": "Describe the motion and camera movement clearly.",
            "title": "Kling tip"
          },
          "luma": {
            "text": "Describe the desired motion without overloading the prompt.",
            "title": "Luma tip"
          },
          "pixverse": {
            "text": "Specify the visual style, pacing, and desired shot changes.",
            "title": "PixVerse tip"
          },
          "seedance": {
            "text": "Describe the main motion and keep sequential actions consistent.",
            "title": "Seedance tip"
          },
          "seedance25": {
            "text": "For multiple shots, clearly describe each shot and its transition.",
            "title": "Seedance 2.5 tip"
          }
        },
        "waitingCreation": "Waiting for creation…",
        "references": {
          "imagesTitle": "Reference images",
          "guideText": "Guide the subject, appearance, setting, or style of your creation.",
          "imageCount": "{{count}} images",
          "tutorialButton": "Model tutorial",
          "addImages": "Add reference images",
          "imageLimit": "Image limit reached",
          "chooseFiles": "Click to choose files from your computer",
          "removeToAdd": "Remove an image to add another",
          "preciseEditing": "Precise editing",
          "guidedComposition": "Guided composition",
          "multipleReferences": "Multiple references",
          "tutorialEngine": "Model tutorial",
          "images": "images"
        }
      },
      "line3_app_ui_referenceImages": "Reference images",
      "line3_app_ui_referenceImagesUpTo3": "Up to 3 reference images",
      "line3_app_ui_startEndFrames": "Start / End",
      "line3_app_ui_editVideo": "Edit video",
      "line3_app_ui_extendVideo": "Extend video",
      "line3_app_ui_imageToVideo": "Image → Video",
      "line3_app_ui_videoReference": "Reference video",
      "line3_app_ui_remix": "Remix",
      "line3_app_ui_characterImage": "Character image",
      "line3_app_ui_motionControl": "Motion control",
      "line3_app_ui_textToVideo": "Text → Video",
      "line3_app_ui_referenceImageCount": "1–9 reference images",
      "line3_app_ui_referenceVideoCount": "1–3 reference videos",
      "line3_app_ui_referenceAudioCount": "1–3 reference audio files",
      "line3_app_ui_generativeAudio": "Generated audio",
      "line3_app_ui_thinkingLevel": "Reasoning level",
      "line3_app_ui_multimodalReferences": "Multimodal references — Seedance",
      "line3_app_ui_seedance25Limit": "Up to 30 images, 10 videos, and 10 audio files depending on the selected mode.",
      "line3_app_ui_seedance20Limit": "Up to 12 reference files total · {{count}}/12 used",
      "line3_app_ui_seedance25Notice": "Multimodal references cannot be combined with the Start/End frame slots. To edit or extend a video, use the Source video slot above; it takes priority over these references.",
      "line3_app_ui_seedance20Notice": "Multimodal references cannot be combined with the Start/End frame slots. A source video counts toward both the video limit and the 12-file total. Files must meet the server’s size limits.",
      "line3_app_ui_seedanceCharacterObjects": "Images of characters, objects, or settings.",
      "line3_app_ui_seedanceNineImages": "Up to 9 images to guide the result.",
      "line3_app_ui_seedanceReferenceClips": "Reference clips, excluding source-video mode.",
      "line3_app_ui_seedanceThreeVideos": "Up to 3 videos; 2 if a source video is already selected.",
      "line3_app_ui_audioAmbience": "Ambient audio, voice, or sound reference.",
      "line3_app_ui_referenceVideoGuidance": "These videos guide motion, actions, and camera movement.",
      "line3_app_ui_buyDiamonds": "🛒 Buy diamonds",
      "line3_app_ui_subscribeOrBuyDiamonds": "🚀 Subscribe or buy diamonds",
      "line3_app_ui_stayInStudio": "Stay in studio",
      "line3_app_error_waitSourceDuration": "Wait for the source video duration to be detected before starting Edit mode so the cost can be calculated correctly.",
      "line3_app_error_selectCharacterImage": "Please select an image for the character.",
      "line3_app_error_importMotionVideo": "Please import a reference video for motion.",
      "line3_app_error_securityUnavailable": "Security verification is unavailable. Refresh the page and try again.",
      "line3_app_error_generation": "Generation error",
      "line3_app_error_generationFailed": "Generation failed.",
      "line3_app_error_technicalGeneration": "A technical problem occurred during generation.",
      "line3_app_error_noResultUrl": "The server finished without returning a result URL. Check the server logs.",
      "line3_app_error_insufficientCreditsVideo": "Not enough credits to generate this video.",
      "line3_app_error_refundTechnical": "A technical problem occurred. Please try again later. Your credits have been refunded.",
      "line3_app_error_startAndSourceRequired": "A start image and a source video are required",
      "line3_app_error_startImageFor512": "Add a start image to use 512p resolution",
      "line3_app_error_deleteCreation": "Delete this creation?",
      "line3_app_error_diamondsInsufficient": "Your diamond balance is too low for this operation.",
      "line3_app_status_generationFinalizing": "Finalizing generation...",
      "line3_app_status_fileImported": "File imported",
      "app.status.newProject": "New project started!",
      "line3_app_status_videoLoaded": "🎬 Video loaded in Studio!",
      "line3_app_status_imageLoaded": "🖼️ Image loaded in Studio!",
      "line3_app_ui_seedanceOperation": "Source video operation:",
      "line3_app_ui_extend": "Extend",
      "line3_app_ui_modify": "Edit",
      "line3_app_ui_seedanceExtendHelp": "Extension: add a source video, then describe in the prompt what should happen after its last frame. The selected duration is the additional time.",
      "line1_app_file_kind_image": "an image",
      "line1_app_file_kind_video": "a video",
      "line1_app_file_kind_audio": "an audio file",
      "line1_app_file_kind_other": "this file",
      "line1_app_status_prepareImage": "Preparing your image",
      "line1_app_status_stageVideo": "Setting up your video scene",
      "line1_app_prompt_seedanceExtendSource": "Describe what should happen after your video ends… (e.g. continue the scene for 5 seconds…)",
      "line1_app_prompt_seedanceEditSource": "Describe exactly what you want to change in the video and what must stay the same…",
      "line1_app_prompt_veoExtendSource": "Describe what should happen after the last frame of your video…",
      "line1_app_prompt_veoEditSource": "Describe the changes to make to the video and what must remain the same…",
      "line1_app_prompt_minimaxExtendSource": "Describe how to continue the video after its last frame…",
      "line1_app_prompt_minimaxEditSource": "Describe what to change in the video while keeping everything else…",
      "line1_app_prompt_pixverseSourceChanges": "Describe the changes to apply to the source video and the elements to preserve…",
      "line1_app_video_hailuoProLimit": "⚠️ PRO MODE: LIMITED TO 6S",
      "line1_app_video_hailuoStandardLimit": "✅ STANDARD MODE: UP TO 10S",
      "line1_app_audio_nativeEnabled": "Native audio enabled",
      "line1_app_audio_nativeDisabled": "Native audio disabled",
      "line1_app_settings_high": "High",
      "line1_app_settings_systemInstruction": "System instruction",
      "line1_app_settings_optional": "optional",
      "line1_app_settings_referenceVideoTitle": "Reference video",
      "line1_app_settings_referenceVideo": "Reference video {{number}}",
      "line1_app_settings_oneVideoMaximum": "optional · 1 maximum",
      "line1_app_settings_chooseVideo": "Choose a video",
      "line1_app_settings_visualStyle": "Visual style",
      "line1_app_settings_imageQualityFastLow": "Fast / low",
      "line1_app_settings_imageQualityHigh": "High",
      "line1_app_settings_moderationStandard": "Standard",
      "line1_app_settings_moderationLessRestrictive": "Less restrictive",
      "line3_app_settings_referenceImages": "Reference images",
      "line1_app_references_maxImagesH3": "Up to 9 reference images",
      "line1_app_references_referenceAppearanceHelp": "Guide the appearance of characters, objects, or settings.",
      "line1_app_references_selectedImagesCount": "{{count}} image(s) selected",
      "line1_app_references_referenceVideos": "Reference videos",
      "line1_app_references_videoFormatsLimit": "MP4 or MOV — up to 3 videos total, including the source video",
      "line1_app_references_referenceImageSlot": "Image {{number}}",
      "line1_app_references_referenceVideoSlot": "Video {{number}}",
      "line1_app_references_addMedia": "Add",
      "line1_app_references_imageFormatsMaximum": "Image formats · {{max}} files maximum",
      "line1_app_references_removeReferenceImage": "Remove reference image {{number}}",
      "line1_tutorial_tab_guide": "📘 Written guide",
      "line1_tutorial_tab_resources": "📚 Resources",
      "line1_tutorial_tab_prompts": "✨ Ready-to-copy prompts",
      "line1_cost_full_hd_diamonds": "Full HD mode: Diamonds",
      "line1_cost_end_image": "End image",
      "line1_cost_ai_audio": "AI audio",
      "line3_app_ui_seedanceEditHelp": "Editing: add a source video, then describe the changes and what must remain. The edited video keeps the source duration.",
      "line4_badge_text_to_image": "Text → Image",
      "line4_badge_image_to_image": "Image → Image",
      "line4_badge_up_to_16_refs": "Up to 16 references",
      "line4_badge_up_to_9_refs": "Up to 9 references",
      "line4_badge_up_to_14_images": "Up to 14 images",
      "line4_badge_one_reference_video": "1 reference video",
      "line4_badge_adjustable_reasoning": "Adjustable reasoning",
      "line4_badge_adjustable_quality": "Adjustable quality",
      "line4_badge_adjustable_moderation": "Adjustable moderation",
      "line4_badge_safety_tolerance": "Safety tolerance 0–5",
      "line4_badge_text_to_video": "Text → Video",
      "line4_badge_image_to_video": "Image → Video",
      "line4_badge_reference_images": "Reference images",
      "line4_badge_reference_video": "Reference video",
      "line4_badge_reference_audio": "Reference audio",
      "line4_badge_edit_video": "Edit video",
      "line4_badge_extend_video": "Extend video",
      "line4_badge_up_to_3_videos": "Up to 3 videos",
      "line4_badge_up_to_3_audio": "Up to 3 audio tracks",
      "line4_badge_up_to_9_images": "Up to 9 images",
      "line4_badge_start_end_images": "Start / end image",
      "line4_badge_native_audio_lipsync": "Native audio & lip-sync",
      "line4_badge_audio": "Audio",
      "terms of sale": "Terms and Conditions of Sale",
      "line4_badge_multishot": "Multi-shot",
      "line4_badge_4_30_seconds": "4–30 s",
      "line4_badge_4_15_seconds": "4–15 s",
      "line4_badge_4_12_seconds": "4–12 s",
      "line4_badge_1_15_seconds": "1–15 s",
      "line4_tutorial_model_title": "{{model}} tutorial — guide, video and prompts",
      "line4_prompt_characters": "characters",
      "line4_remove_media": "Remove {{media}} {{number}}",
      "line5_prompt_veo_extend": "Continue naturally from the source video's final frame for 7 additional seconds. The character keeps walking along the forest path, then enters a sunlit clearing. Preserve the same character, clothing, environment, lighting, camera movement, and cinematic style. Make the transition seamless, with no abrupt cut.",
      "line5_prompt_veo_edit": "Edit the source video only to change the lighting from daytime to a cinematic night scene with soft blue moonlight. Preserve the same characters, actions, environment, framing, camera movement, and visual continuity. Do not change anything else.",
      "line5_prompt_seedance_extend": "Continue @Video1 immediately after its final frame for 5 additional seconds. The character continues walking into the clearing. Preserve the same character, clothing, setting, lighting, camera movement, and visual style. Make the transition seamless, with no abrupt cut or change in identity.",
      "line5_prompt_seedance_edit": "Edit @Video1: change only the lighting to transform the daytime scene into a cinematic night scene with soft moonlight. Preserve the characters, their movements, the setting, framing, camera movement, and original duration. Do not change anything else.",
      "line6_suggestions_video_1_prompt": "A lone samurai in detailed armor stands on a hill covered with tall grass, facing an intense red sunset over a distant Japanese city. Strong wind moves his clothing and the grass. Epic, melancholic mood; dramatic sky with luminous clouds. Camera: begin in a medium shot from behind the samurai, then make a fast, smooth dolly backward to reveal the valley and city, followed by a slight 180-degree orbit around the character for a cinematic finish. High-contrast golden-hour light, realistic lens flare, cinematic depth of field, ultra-realistic rendering, Japanese blockbuster-film style.",
      "line6_suggestions_video_2_prompt": "A young cyberpunk woman with purple hair walks through a lively, wet Korean alley. Begin with an extreme close-up of her boots moving slowly over wet asphalt, with colorful neon reflections in puddles. The camera smoothly tracks backward with her steps. After one second, it gradually tilts and rises along her legs, tactical gear, and worn coat. She keeps walking confidently with her hands in her pockets. Continue upward to reveal her face and the full alley behind her: glowing Korean signs, steam rising from manholes, and pedestrians in the background. Realistic cyberpunk atmosphere, natural movement, cinematic lighting, realistic depth of field, wet-ground reflections, ultra-realistic 8K film quality, extreme detail.",
      "line6_suggestions_video_3_prompt": "In the heart of a dark, foggy forest at night, a terrified woman runs at full speed along a narrow muddy trail winding between dead trees and tangled branches. Her clothes are dirty and torn; her face is sweaty, muddy, and frightened. She grips a flashlight whose beam cuts through the dense fog. Show natural, realistic running mechanics, accurate foot placement and body weight shifts, subtle breathing, and hair and clothing reacting naturally. No slow motion. Start with a dramatic low-angle tracking shot near the ground as she runs toward the lens; wet roots, mud splashes, and broken branches rush past the foreground. The flashlight beam sweeps across the trees, creating moving shadows and dramatic volumetric light in the mist. As she keeps fleeing, the camera gradually rises and pulls back smoothly into an increasingly high aerial view, revealing the vast isolated forest. She becomes a tiny silhouette lost in the darkness. Epic cinematic aerial shot, drifting dense fog, realistic atmospheric depth, moonlight filtering through the canopy. Ultra-realistic horror-thriller mood, cinematic lighting, realistic flashlight illumination, natural camera movement, richly detailed forest, wet-ground reflections, photorealistic textures, HDR, sustained dramatic tension, Hollywood-feature visual quality, 8K, immersive cinematic horror.",
      "line6_suggestions_video_4_prompt": "An ultra-dynamic cinematic shot in a dense forest transformed into a competitive racecourse. Two highly detailed anthropomorphic rabbits sprint against each other on a narrow dirt trail. The white rabbit, wearing a blue T-shirt and backpack, leads; a gray rabbit in a red T-shirt follows closely, intensely determined. A very fast, low-to-the-ground forward tracking camera shakes slightly like professional racing footage. Emphasize speed, motion blur on arms and legs, and dust and dirt particles bursting with every stride. Lush vegetation lines the trail; blurred animal spectators appear in the background with shallow depth of field. Extreme-sports style, championship-finale energy, dramatic golden light filtering through the trees, ultra-realistic high-budget 3D animation, maximum tension and energy.",
      "line6_suggestions_video_5_prompt": "A lone astronaut floats in deep space above Earth. Begin with an extremely wide shot showing the vast cosmos, Earth's curvature, and the tiny astronaut centered in frame. The camera moves smoothly and quickly toward the astronaut. As it approaches, details of the spacesuit emerge and sunlight reflects from the visor. At medium distance, the camera makes a 180-degree orbital move around the astronaut, revealing Earth behind them and then the star-filled void. Perfectly stable motion, convincing zero gravity, realistic space lighting and physical reflections, IMAX quality, extreme photorealism, cinematic depth of field, 8K, big-budget space-documentary style, natural motion blur, ultra-realistic detail, epic and contemplative atmosphere.",
      "line7_suggestions_video_6_prompt": "Animated style: a woman sits on a park bench. A cat climbs onto her lap, and she gently pets it.",
      "line7_suggestions_video_7_prompt": "Ultra-realistic scene in a luxurious, slightly messy hotel room. A blonde woman sits on the bed, with black makeup covering much of the area around her eyes. The camera slowly dollies forward until it reaches a close-up of her exhausted-looking face.",
      "line7_suggestions_video_8_prompt": "Flowing golden liquid in motion, magnetic waves, luxury, abstract 3D art.",
      "tutorials": {
        "image": {
          "gpt_image2": {
            "objective": "Create a precise image or edit an existing one while preserving key elements.",
            "features": [
              "Up to 16 reference images.",
              "Assign a clear role to each reference: identity, clothing, setting, colors, or style.",
              "Describe what must change and what must remain unchanged."
            ],
            "steps": [
              "Add useful images to the reference area. Give each reference a role: face, outfit, setting, or visual style.",
              "Describe the desired result and the relationship between the references.",
              "Specify framing, lighting, materials, and details to preserve.",
              "For an edit, explicitly list what must not change.",
              "Generate, inspect the result, then refine only the elements that need correction."
            ],
            "prompt": "Use image 1 as the main reference for [SUBJECT / IDENTITY]. Use image 2 for [CLOTHING / COLORS / STYLE] and image 3 for [SETTING / COMPOSITION], when available. Create [DESIRED RESULT]. Preserve [ELEMENTS TO KEEP]. Change only [ELEMENTS TO MODIFY]. Composition: [FRAMING]. Lighting: [LIGHTING]. Materials and details: [DETAILS]. High-quality, coherent result; do not add unrequested elements."
          },
          "flux2pro": {
            "objective": "Build an image with controlled composition, precise details, and consistent visual references.",
            "features": [
              "Up to 9 reference images.",
              "Best for controlled composition, materials, and visual consistency.",
              "Separate the subject, palette, texture, and setting references."
            ],
            "steps": [
              "Add up to 9 clear, complementary references.",
              "Use one reference per main role: subject, color palette, materials, or environment.",
              "Describe the composition and relative placement of the elements.",
              "Specify textures, lighting, and details that must stay consistent.",
              "Generate and refine the prompt if the composition or materials need adjustment."
            ],
            "prompt": "Use image 1 as the reference for the main subject and silhouette. Use image 2 for the color palette and materials, and image 3 for the setting and composition, if available. Create [SCENE]. Composition: [LAYOUT AND CAMERA ANGLE]. Materials: [TEXTURES]. Lighting: [LIGHTING]. Preserve [KEY DETAILS]. Avoid unwanted objects, inconsistent anatomy, and changes to the subject identity.",
            "resourceUrl": "https://runware.ai/models/bfl-flux-2-pro",
            "resourceLabel": "Fiche du modèle sur Runware"
          },
          "nano_banana2_lite": {
            "objective": "Quickly create or transform an image using multiple visual references and, if needed, a reference video.",
            "features": [
              "Up to 14 images and one reference video.",
              "Give each reference a specific role.",
              "Use a video reference to guide motion or the overall visual atmosphere when supported by the selected mode.",
              "Clearly distinguish required changes from elements to preserve."
            ],
            "steps": [
              "Add up to 14 image references to the grid, each with a clear role: character, object, setting, or style.",
              "If the selected mode supports it, add a reference video.",
              "Explain how the references should be combined.",
              "Describe precisely what should change and what must remain untouched.",
              "Specify composition, lighting, colors, and output style.",
              "Review the result and refine only the parts that are incorrect.",
              "Use the model information panel to confirm available input types."
            ],
            "prompt": "Use image 1 for [SUBJECT / IDENTITY], image 2 for [SETTING / STYLE], and image 3 for [COLORS / OBJECT], when available. Take inspiration from the reference video for [MOTION / ATMOSPHERE], if supported. Create [TARGET RESULT]. Preserve [FEATURES TO KEEP] and change only [REQUESTED CHANGES]. Composition: [COMPOSITION]. Lighting: [LIGHTING]. Style: [STYLE].",
            "resourceUrl": "https://runware.ai/models/google-nano-banana-2-lite",
            "resourceLabel": "Fiche du modèle sur Runware"
          }
        },
        "video": {
          "default": {
            "objective": "Getting started with the selected video engine.",
            "features": [
              "The options shown in Ovortex are the reference for this engine."
            ],
            "steps": [
              "Choose Text to Video or Image to Video according to the available options.",
              "Describe one clear action and its setting.",
              "Specify shot size, camera movement, lighting, and mood.",
              "If you use an image, state which visual details must remain consistent.",
              "Generate a first version and refine the prompt based on the result."
            ],
            "prompt": "Video plan: [SUBJECT] performs [SPECIFIC ACTION] in [LOCATION]. Framing: [SHOT TYPE]. Camera: [MOVEMENT]. Lighting: [LIGHTING]. Mood: [TONE]. Duration: [DURATION]. Preserve [CONTINUITY DETAILS]. Natural movement, coherent physics, no unwanted cuts or extra subjects."
          },
          "veo3.1": {
            "objective": "Veo 3.1: guide a scene with reference images, native audio, and supported operations on a source video.",
            "features": [
              "Up to 3 reference images in the Veo panel to guide character appearance, objects, and setting.",
              "Native audio is available according to the selected mode.",
              "Source-video operations depend on the options enabled in Ovortex.",
              "Use explicit descriptions to maintain visual continuity."
            ],
            "steps": [
              "Add up to three reference images and assign each a role: character, setting, or object.",
              "Describe the action as a continuous, filmable sequence.",
              "Specify camera movement, shot size, lighting, and sound or dialogue if needed.",
              "For source-video operations, describe only the changes you want.",
              "Check continuity of character identity, clothing, and environment."
            ],
            "prompt": "Create a cinematic [DURATION] shot: [CHARACTER / SUBJECT] performs [ACTION] in [SETTING]. Reference 1: preserve [CHARACTER APPEARANCE]. Reference 2: guide [SETTING]. Reference 3: guide [OBJECT / STYLE]. Camera: [MOVEMENT]. Lighting: [LIGHTING]. Audio: [SOUND / DIALOGUE, IF NEEDED]. Maintain continuity and realistic motion."
          },
          "veo3.1_fast": {
            "objective": "Veo 3.1 Fast: quickly create a clip guided by a prompt and up to three reference images.",
            "features": [
              "Up to 3 reference images through the Veo panel.",
              "Designed for quick iterations on an idea.",
              "Keep the action simple and clearly described.",
              "Use references to maintain the intended appearance."
            ],
            "steps": [
              "Choose this model when you want to iterate quickly.",
              "Describe one main action and one setting.",
              "Add up to three references if available.",
              "Specify framing, movement, and lighting.",
              "Review the clip and refine the prompt."
            ],
            "prompt": "Cinematic clip: [SUBJECT] performs [SINGLE ACTION] in [LOCATION]. Use the references to preserve [APPEARANCE / OBJECTS / STYLE]. Shot: [FRAMING]. Camera: [MOVEMENT]. Lighting: [LIGHTING]. Mood: [MOOD]. Natural motion and consistent details."
          },
          "seedance25": {
            "objective": "Seedance 2.5: compose video with many multimodal references, or edit or extend a source video.",
            "features": [
              "Depending on the mode, up to 30 reference images, 10 videos, and 10 audio files.",
              "Assign a specific purpose to each reference.",
              "Can support source-video editing or extension when the relevant mode is available.",
              "Check the selected mode and available inputs in Ovortex."
            ],
            "steps": [
              "For a reference-driven project, add character, costume, prop, and location images.",
              "Add video references for movement or camera language when supported.",
              "Add audio references only when the selected mode accepts them.",
              "Describe the timeline and how each reference should influence the result.",
              "For editing or extension, specify what to preserve and what to change."
            ],
            "prompt": "Create a [DURATION] sequence using the supplied media. Character references: [IMAGES FOR IDENTITY AND CLOTHING]. Setting references: [LOCATION IMAGES]. Motion reference: [VIDEO AND MOVEMENT]. Audio reference: [SOUND, IF AVAILABLE]. Sequence: [ACTION BEATS]. Camera: [MOVEMENT]. Preserve identity, wardrobe, lighting, and continuity. Change only [REQUESTED EDITS]."
          },
          "seedance20": {
            "objective": "Seedance 2.0: direct generation with image, video, and audio references in a multimodal workflow.",
            "features": [
              "Up to 9 images, 3 videos, and 3 audio references, with a maximum of 12 files in total.",
              "Images can guide characters, props, or locations.",
              "Video references can guide movement; audio references can guide sound when supported.",
              "Give every reference a clear role in the prompt."
            ],
            "steps": [
              "Add images for characters, props, or settings; use videos for movement and audio for sound when supported.",
              "Keep the total number of files within the mode limit.",
              "Describe the role of each reference in the prompt.",
              "Write the action in a clear chronological order.",
              "Review the result for identity, motion, and audio consistency."
            ],
            "prompt": "Create a coherent video using the reference media by role: image 1 = [CHARACTER], image 2 = [SETTING], image 3 = [OBJECT / STYLE], video 1 = [MOVEMENT], audio 1 = [SOUND, IF SUPPORTED]. Action: [SEQUENCE]. Camera: [MOVEMENT]. Keep the character and visual style consistent."
          },
          "seedance": {
            "objective": "Seedance 1.5 Pro: create clips with native audio and lip-sync, or guide a transition with start and end images.",
            "features": [
              "Native audio and lip-sync depend on the engine settings shown in Ovortex.",
              "Start/end images can guide a transition when the selected mode supports them.",
              "Dialogue, emotion, and timing should be described explicitly."
            ],
            "steps": [
              "Describe the character, expected dialogue or sound, and action in one clear sequence.",
              "Write exact dialogue in quotation marks.",
              "Specify emotion, speaking rhythm, and camera movement.",
              "If using start and end images, describe the intended transition.",
              "Check that the speech and action remain synchronized."
            ],
            "prompt": "Shot with synchronized audio: [CHARACTER] in [SETTING]. They [ACTION] and say: “[EXACT DIALOGUE]”, with [EMOTION] and [SPEAKING RHYTHM]. Camera: [MOVEMENT]. Sound: [AMBIENCE / EFFECTS]. Maintain natural lip-sync, consistent appearance, and a coherent scene."
          },
          "kling2.6": {
            "objective": "Kling 2.6 Pro: create a Full HD clip with controlled motion and audio according to the engine configuration.",
            "features": [
              "Configured durations in Ovortex: 5 or 10 seconds at 1080p.",
              "For Image to Video, a clear source image helps preserve the subject.",
              "Describe a single, readable movement sequence."
            ],
            "steps": [
              "For Image to Video, choose a sharp image with clearly visible subject outlines.",
              "Describe the action from beginning to end.",
              "Specify camera movement and environmental reactions.",
              "Keep identity, face, clothing, and setting consistent.",
              "Avoid requesting many unrelated actions in one clip."
            ],
            "prompt": "Starting from the input image, preserve identity, face, clothing, and setting. [SUBJECT] performs [ACTION IN ONE SEQUENCE]. Camera: [MOVEMENT]. Environment: [REACTIONS]. Lighting: [LIGHTING]. Natural physics, stable appearance, and smooth motion."
          },
          "kling26_motion": {
            "objective": "Kling 2.6 Motion Control: transfer movement from a reference video to a character supplied as an image.",
            "features": [
              "Main inputs: a source motion video and an image of the character to animate.",
              "A clear view of the character helps motion transfer.",
              "Keep the character’s identity and proportions consistent."
            ],
            "steps": [
              "Import a character image showing as much of the body as possible, without important limbs cropped out.",
              "Add the source video containing the movement to transfer.",
              "Check that the pose and framing are compatible between the image and video.",
              "Describe any appearance details that must be preserved.",
              "Review the result for body proportions and movement continuity."
            ],
            "prompt": "Transfer the movement from the source video to the character in the reference image. Preserve identity, face, clothing, and body proportions. Follow the source movement as closely as possible. Keep the background and visual style consistent, with natural motion and no unwanted deformation."
          },
          "kling30": {
            "objective": "Kling 3.0: create a shot or sequence with start and end control when both images are used.",
            "features": [
              "Available durations in the catalogue: 3 to 15 seconds.",
              "Use start and end images to guide the transition when supported.",
              "Describe the intermediate action connecting both states."
            ],
            "steps": [
              "Choose text or image mode according to your starting point.",
              "Add start and end images if you want to control both ends of the clip.",
              "Describe how the subject moves from the initial to the final state.",
              "Specify camera movement, lighting, and pace.",
              "Check that the transition is continuous and the subject remains consistent."
            ],
            "prompt": "Create a continuous transition between the start image and the end image. [SUBJECT] moves from [INITIAL STATE] to [FINAL STATE] by performing [ACTION]. Camera: [MOVEMENT]. Pace: [PACE]. Lighting: [LIGHTING]. Preserve the subject’s identity and make the transition smooth and physically plausible."
          },
          "hailuo": {
            "objective": "Hailuo 2.3: focus on realistic movement, expressions, and subject continuity.",
            "features": [
              "The Ovortex catalogue offers 6 seconds at 768p or 1080p, and 10 seconds at 768p.",
              "A clear silhouette is helpful when animating an existing image.",
              "Keep actions and facial expressions specific."
            ],
            "steps": [
              "Choose an image with a clear silhouette if animating an existing image.",
              "Describe the physical action and the intended emotion.",
              "Explain how hair, clothing, and the environment react to movement.",
              "Keep the camera movement simple and purposeful.",
              "Check facial expression and body motion for realism."
            ],
            "prompt": "[CHARACTER] performs [PHYSICAL ACTION] with a [EMOTION] expression. Hair, clothing, and environmental elements react naturally. Camera: [MOVEMENT]. Lighting: [LIGHTING]. Realistic facial expression, coherent anatomy, natural movement, and consistent appearance."
          },
          "minimax_h3": {
            "objective": "MiniMax H3: work with multimodal references and detailed scene control when the corresponding options are available.",
            "features": [
              "The catalogue offers durations from 4 to 15 seconds.",
              "Use image references for identity and setting.",
              "Video and audio inputs depend on the selected mode.",
              "Keep reference roles and action timing explicit."
            ],
            "steps": [
              "Use images to guide identity or setting, and video/audio media for the elements supported by the selected mode.",
              "Describe the sequence in chronological order.",
              "Specify the camera, lighting, and desired pace.",
              "State which details must remain consistent.",
              "Review the output for continuity across the scene."
            ],
            "prompt": "Create a [DURATION] sequence. Subject: [CHARACTER / OBJECT]. Use image references for [IDENTITY / SETTING], the video reference for [MOVEMENT], and audio reference for [SOUND] when supported. Action: [CHRONOLOGICAL SEQUENCE]. Camera: [MOVEMENT]. Preserve continuity, visual identity, and realistic motion."
          },
          "pixverse6": {
            "objective": "PixVerse V6: fine-tune duration, quality, multi-shot structure, and the creative settings available in the studio.",
            "features": [
              "Available durations: 1 to 15 seconds.",
              "Multi-shot structure can separate distinct beats of the action.",
              "Use the studio controls to select the available quality and creative settings.",
              "Keep continuity consistent between shots."
            ],
            "steps": [
              "Choose a duration based on the number of shots or actions.",
              "Break the scene into clear shots with a distinct purpose for each.",
              "Describe framing and camera movement for every shot.",
              "Specify how the action and visual continuity connect between shots.",
              "Check the final timing and transitions."
            ],
            "prompt": "Multi-shot sequence: Shot 1 — [SUBJECT AND ACTION], framing [FRAMING]. Shot 2 — [ACTION DEVELOPMENT], camera [MOVEMENT]. Shot 3 — [FINAL RESULT], framing [FRAMING]. Maintain continuity of subject, wardrobe, setting, and lighting. Duration: [DURATION]. Style: [STYLE]."
          }
        }
      }
    ,
      "engineAnnotations": {
              "kling26_motion": "Transfer motion from a reference video to an image",
              "kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
              "hailuo": "Ultra-realistic motion",
              "pixverse6": "PixVerse V6 — 360p to 1080p, 1–15 s, audio and multi-shot",
              "seedance25": "Seedance 2.5 — image/video/audio references, editing and extension, 4–30 s",
              "seedance20": "Seedance 2.0 — up to 9 reference images, 3 videos and 3 audio files",
              "seedance": "Native audio and synchronized lip-sync",
              "gpt_image2": "Image generation and editing, up to 16 references",
              "flux2pro": "FLUX.2 Pro — image editing guided by up to 9 references",
              "nano_banana2_lite": "Fast image generation and editing, up to 14 reference images"
      }}
  },
  "ko": {
    "translation": {  
      "line3_app_ui_audio": "오디오",
"line3_app_ui_remix": "리믹스",
"line3_app_ui_nativeAudio": "네이티브 오디오",
"line3_app_ui_characterImage": "캐릭터 이미지",
"line3_app_ui_firstLastFrame": "첫 프레임 + 마지막 프레임",
"line3_app_ui_10s768pOnly": "10초 — 768p 전용",
      "control_mode_image": "이미지",
"control_mode_video": "동영상",
"control_mode_remasterise": "리마스터링",
       "line3_app_annotation_veo3_1_fast": "Veo 3.1 Fast — 빠른 동영상 생성",
"line3_app_annotation_veo3_1": "Veo 3.1 — 고품질 동영상 생성",
"line3_app_annotation_kling26_motion": "동영상의 움직임을 이미지로 전송",
"line3_app_annotation_kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
"line3_app_annotation_kling26": "Kling 2.6 Pro — 동영상 생성",
"line3_app_annotation_hailuo": "초현실적인 움직임",
"line3_app_annotation_minimax_h3": "MiniMax H3 — 동영상 생성",
"line3_app_annotation_pixverse6": "PixVerse V6 — 360p~1080p, 1~15초, 오디오 및 멀티 샷",
"line3_app_annotation_seedance25": "Seedance 2.5 — 이미지·동영상·오디오 참조, 편집 및 확장",
"line3_app_annotation_seedance20": "Seedance 2.0 — 최대 이미지 9개, 동영상 3개, 오디오 참조 3개",
"line3_app_annotation_seedance": "네이티브 오디오 및 립싱크",
"line3_app_annotation_gpt_image2": "이미지 생성 및 편집, 최대 16개 참조 이미지",
"line3_app_annotation_flux2pro": "FLUX.2 Pro — 최대 9개 이미지 기반 편집",
"line3_app_annotation_nano_banana2_lite": "빠른 생성 및 편집, 최대 14개 참조 이미지",
      "seedance available": "Seedance 2.5 사용 가능",
      "create instantly": "즉시 만들어 보세요.",
      "hero subtitle": "생성형 인공지능의 강력한 기능을 통해 아이디어를 고품질 시네마틱 비주얼로 만들어 보세요.",
      "generate": "생성",
      "text to image title": "텍스트에서",
      "cinematic image": "시네마틱 이미지로",
      "ai interprets imagination": "AI가 상상의 모든 디테일을 해석합니다.",
      "generate button": "Generate",
      "model": "모델",
      "render": "렌더링",
      "contact": {
        "successTitle": "메시지가 전송되었습니다!",
        "successMessage": "{{name}}님, 문의가 접수되었습니다. 감사합니다.",
        "replySoon": "빠른 시일 내에 답변드리겠습니다.",
        "title": "문의하기",
        "subjectLabel": "문의 유형",
        "subjectInfo": "일반 문의",
        "subjectProblem": "문제 신고",
        "subjectQuote": "견적 요청",
        "messageLabel": "메시지",
        "messagePlaceholder": "무엇을 도와드릴까요?",
        "back": "뒤로",
        "sending": "전송 중...",
        "send": "보내기",
        "sendError": "전송에 실패했습니다. 다시 시도해 주세요."
      },
      "profile": {
        "within30Days": "30일 이내",
"validYear": "1년간 유효",
  "back": "뒤로",
  "avatarAlt": "프로필",
  "accountStatus": "계정 상태",
  "lightning": "번개 크레딧",
  "nextReset": "다음 초기화:",
  "diamonds": "다이아몬드",
  "expiration": "만료일:",
  "validYear": "1년간 유효",
  "changeSubscription": "구독 변경",
  "subscriptionCancelled": "구독이 취소되었습니다",
  "cancelling": "취소 처리 중...",
  "cancelSubscription": "구독 취소",
  "contactUs": "문의하기",
  "deleteAccount": "계정 삭제",
  "irreversible": "되돌릴 수 없는 작업",
  "activeSubscriptionTitle": "활성 구독이 감지되었습니다:",
  "activeSubscriptionMessage": "계정을 삭제하려면 먼저 구독을 취소해야 합니다.",
  "understood": "확인",
  "deleteWarning": "계정을 삭제하면 💎 다이아몬드 {{diamonds}}개와 ⚡ 번개 크레딧 {{lightning}}개가 영구적으로 삭제됩니다.",
  "typeDelete": "확인을 위해 SUPPRIMER를 입력하세요:",
  "writeHere": "여기에 입력하세요...",
  "reconnect": "다시 로그인",
  "delete": "삭제",
  "cancelTitle": "구독 취소",
  "cancelConfirmMessage": "정말 구독을 취소하시겠습니까? 결제 기간이 끝날 때까지 구독 혜택을 유지할 수 있습니다.",
  "cancel": "취소",
  "confirm": "확인",
  "cancelServerError": "구독 취소 서버에 연결할 수 없습니다."
},
      "hero prompt 1": "초현실적인 장면: 한 남자가 눈사람에게 다가가고 갑자기 고양이가 나타나 그의 얼굴을 공격한다...",
      "hero prompt 2": "뉴욕 거리의 좀비들을 묘사한 초현실적인 장면...",
      "hero prompt 3": "애니메이션 스타일, 짧은 분홍색 머리의 소녀가 테이블에 앉아 오렌지 주스 한 잔과 딸기 케이크 한 조각을 앞에 두고 있다.",
      "showcase subtitle": "당신의 텍스트가 현실이 됩니다. AI의 강력한 기능으로 매력적인 영상을 즉시 만들어 보세요.",
      "showcase prompt 1": "사이버펑크 거리 시장...",
      "showcase prompt 2": "애니메이션 풍경...",
      "showcase prompt 3": "자연의 매크로 샷...",
      "showcase prompt 4": "성운 속을 떠다니는 우주비행사...",
      "showcase prompt 5": "깊은 바다에서 빛나는 해파리...",
      "image to video title": "이미지에서",
      "cinematic video": "시네마틱 영상으로",
      "image to video subtitle": "비주얼을 가져오고 AI가 아이디어에 생명을 불어넣도록 하세요.",
      "source image": "원본 이미지",
      "ai result": "AI 결과",
      "prompt": "프롬프트",
      "image video prompt 1": "춤추는 게.",
      "image video prompt 2": "방향을 잃은 듯한 시선으로 혼란스러워 보이는 여성.",
      "image video prompt 3": "지쳐 보이는 여성의 얼굴을 향해 클로즈업으로 이동하는 카메라 트래킹.",
      "image video prompt 4": "이 이미지를 애니메이션으로 만들어 주세요: 그녀가 담배를 피우며 카메라를 바라본다.",
      "start end title 1": "처음부터 끝까지 완벽한 일관성",
      "start end desc 1": "시작 이미지와 종료 이미지를 지정하세요. AI가 두 프레임 사이의 전체 전환을 부드럽게 생성하여 완벽한 예술적 제어를 제공합니다.",
      "start end prompt 1": "두 이미지 사이의 부드러운 전환. 카메라가 움직이며 희생자에게 다가간다.",
      "start end title 2": "부드러운 변신",
      "start end desc 2": "캐릭터나 배경을 상태 A에서 상태 B로 시각적 단절 없이 변화시키세요.",
      "start end prompt 2": "두 이미지 사이의 전환: 그녀가 완전히 취한 상태로 이야기하다가 얼굴을 찡그리고 구토한다.",
      "start end title 3": "부드러운 변신",
      "start end desc 3": "캐릭터나 배경을 상태 A에서 상태 B로 시각적 단절 없이 변화시키세요.",
      "start end prompt 3": "두 이미지 사이의 전환: 그녀가 전투 자세를 취한다.",
      "start image": "시작 이미지",
      "end image": "종료 이미지",
      "transition result": "전환 결과",
      "example": "예시",
      "capture title": "정밀한 카메라 움직임 제어",
      "capture desc": "부드러운 카메라 궤적(줌, 패닝, 트래킹)을 지정하여 장면에 전문적인 느낌을 더하세요.",
      "capture prompt": "두 이미지 사이를 애니메이션으로 만드세요.",
      "motion model": "모션 모델",
      "camera control result": "카메라 컨트롤 결과",
      "replace title 1": "무한한 창작의 자유",
      "replace desc 1": "어떤 물체든 쉽게 교체할 수 있습니다. 사진을 가져오고 원하는 모습을 설명하면 AI가 몇 초 만에 사실적인 결과를 생성합니다. 복잡한 도구는 필요 없습니다. 상상력이 유일한 한계입니다.",
      "replace prompt 1": "배경의 고양이를 제거해 주세요",
      "replace title 2": "인테리어 디자인: AI 가구",
      "replace desc 2": "손쉽게 공간을 새롭게 만들어 보세요. 자연스러운 조명을 유지하면서 오래된 가구를 현대적인 가구로 교체하세요.",
      "replace prompt 2": "빨대와 레몬을 제거해 주세요.",
      "replace title 3": "자동차: 커스터마이징",
      "replace desc 3": "차량의 모든 변경 사항을 미리 확인하세요. 색상이나 휠을 정밀하게 변경할 수 있습니다.",
      "replace prompt 3": "삽을 제거해 주세요",
      "replace photos title": "사진을 새롭게 만들어 보세요: 어떤 물체든 교체",
      "instant": "즉시",
      "replace subtitle": "AI 도구를 사용하여 원하지 않는 물체를 지우고 원하는 요소로 교체해 보세요.",
      "model example": "모델",
      "social media title": "소셜 미디어에서",
      "social media": "관심을 사로잡으세요",
      "social media subtitle": "아이디어를 TikTok과 Instagram에 최적화된 바이럴 콘텐츠로 만들어 보세요.",
      "cutting edge technology": "최첨단 기술",
      "advanced engines": "세계에서 가장",
      "most advanced in world": "발전된 생성 엔진으로 구동",
      "video": "영상",
      "hybride": "하이브리드",
      "image": "이미지",
      "texte": "텍스트",
      "faq title": "자주 묻는",
      "faq highlight": "질문",
      "faq question 1": "Eclipse란 무엇이며 어떻게 작동하나요?",
      "faq answer 1": "Eclipse는 AI 기반의 크리에이티브 스튜디오로 아이디어를 시네마틱 작품으로 변환합니다. 현재 최고의 생성 엔진과 자체 최적화 기술을 결합한 하이브리드 아키텍처를 사용하여 전문적인 영상 품질과 미학을 제공합니다.",
      "faq question 2": "Eclipse를 사용하려면 기술적인 지식이 필요한가요?",
      "faq answer 2": "전혀 필요하지 않습니다. Eclipse는 창작 과정을 단순화하도록 설계되었습니다. 장면을 설명하거나 이미지를 가져오기만 하면 인터페이스가 엔진의 복잡한 설정을 자동으로 구성하여 고품질 결과물을 생성합니다.",
      "faq question 3": "어떤 생성 엔진을 사용하나요?",
      "faq answer 3": "하나의 모델에만 의존하지 않고 Eclipse는 요청에 따라 가장 적합한 엔진을 동적으로 선택합니다. 시네마틱 렌더링, 스타일화된 애니메이션 또는 복잡한 카메라 움직임 등 다양한 작업에 시장을 선도하는 생성 엔진의 성능을 활용합니다.",
      "faq question 4": "생성된 영상은 제 소유인가요?",
      "faq answer 4": "네. Eclipse로 만든 콘텐츠에 대한 모든 권리를 보유합니다. 소셜 네트워크, 광고 또는 개인 프로젝트에 제한 없이 사용할 수 있습니다.",
      "faq question 5": "영상의 최대 길이는 얼마인가요?",
      "faq answer 5": "현재 4초에서 15초 길이의 클립을 생성할 수 있습니다. 확장 기능을 사용하면 시각적 일관성을 유지하면서 영상을 더 길게 확장할 수 있습니다.",
      "cinematic excellence accessible": "누구나 이용할 수 있는 시네마틱의 완성도.",
      "tools": "도구",
      "company": "회사",
      "footer terms": "이용약관",
      "footer privacy": "개인정보 보호정책",
      "footer cgv": "판매 약관",
      "legal notice": "법적 고지",
      "back to top": "맨 위로",
      "pricing footer": "요금제",
      "community": "커뮤니티",
      "all rights reserved": "모든 권리 보유.",
      "powered by leading engines": "시장을 선도하는 생성 엔진으로 구동됩니다.",
      "welcome": "Ovortex",
      "continue google": "Google로 계속하기",
      "continue email": "이메일로 계속하기",
      "password": "비밀번호",
      "login": "로그인",
      "register": "회원가입",
      "forgot password": "비밀번호를 잊으셨나요?",
      "otp title": "2단계 인증",
      "otp subtitle": "이메일로 받은 6자리 코드를 입력하세요.",
      "validate code": "코드 확인",
      "remember device": "30일 동안 이 기기 기억하기",
      "text to image": "텍스트에서 이미지로",
      "image to video": "이미지에서 비디오로",
      "production soon": "프로덕션 (출시 예정)",
      "other tools soon": "기타 도구 (출시 예정)",
      "history": "내 기록",
      "pricing": "요금제",
      "my account": "내 계정",
      "logout": "로그아웃",
      "reset lightning": "라이트닝 리셋",
      "validity diamonds": "다이아몬드 유효기간",
      "under 30 days": "30일 이내",
      "valid 1 year": "1년 유효",
      "legend": "레전드",
      "elite": "엘리트",
      "master": "마스터",
      "terms of sale": "판매 이용약관",
      "standard": "스탠다드",
      "essential": "에센셜",
      "api developer": "API 및 개발자 모듈",
      "beginner": "초보자",
      "continue apple": "Apple로 계속하기",
      "or": "또는",
      "your email": "이메일",
      "create my account": "내 계정 만들기",
      "already have account": "이미 계정이 있으신가요?",
      "new here": "처음이신가요?",
      "create account": "계정 만들기",
      "reset password": "비밀번호 재설정",
      "reset password description": "복구 링크를 받을 이메일을 입력하세요.",
      "send link": "링크 보내기",
      "back to login": "로그인으로 돌아가기",
      "by continuing you accept": "계속하면 다음에 동의하는 것입니다:",
      "terms of use": "이용약관",
      "and": "및",
      "privacy policy": "개인정보처리방침",
      "allow popups login": "로그인하려면 팝업을 허용해 주세요.",
      "google login error": "Google 로그인 중 오류가 발생했습니다.",
      "apple login error": "Apple 로그인 중 오류가 발생했습니다.",
      "enter email": "이메일을 입력하세요",
      "link sent to": "링크가 전송되었습니다:",
      "account not found": "계정을 찾을 수 없습니다.",
      "check email": "이메일을 확인해 주세요.",
      "otp sending error": "OTP 코드 전송 중 오류가 발생했습니다.",
      "verification code sent": "인증 코드가 이메일로 전송되었습니다.",
      "email already in use": "이 이메일은 이미 계정에 연결되어 있습니다.",
      "invalid email password": "이메일 주소 또는 비밀번호가 올바르지 않습니다.",
      "invalid email format": "이메일 주소 형식이 올바르지 않습니다.",
      "weak password": "비밀번호는 최소 6자 이상이어야 합니다.",
      "unexpected error": "오류가 발생했습니다. 다시 시도해 주세요.",
      "invalid code": "잘못된 코드입니다.",
      "code validation error": "코드 확인 중 오류가 발생했습니다.",
      "custom volume title": "맞춤형 수량",
      "loyalty benefit": "회원 혜택",
      "applied to order": "주문에 적용됩니다",
      "adjust slider exact amount": "슬라이더를 조절하여 정확한 수량을 선택하세요",
      "diamonds": "다이아몬드",
      "buy volume": "이 수량 구매",
      "unit price": "단가",
      "diamond": "다이아몬드",
      "quick boost title": "빠른 충전이 필요하신가요?",
      "subscriber rate active": "구독자 요금이 적용되었습니다!",
      "exclusive discounts": "독점 할인 혜택을 이용하세요",
      "diamonds valid one year": "다이아몬드는 1년 동안 유효합니다",
      "popular": "인기",
      "best value": "최고 혜택",
      "diamond pack spark": "불꽃",
      "diamond pack supernova": "초신성",
      "diamond pack galaxy": "은하",
      "diamond pack pulsar": "펄서",
      "diamond pack quasar": "퀘이사",
      "diamond pack universe": "우주",
      "buy": "구매",
      "custom serenity pack": "맞춤형 세레니티 패키지",
      "support type": "지원 유형",
      "one time project": "일회성 프로젝트",
      "monthly support": "월간 지원 (세레니티)",
      "professional photos": "전문 사진 수",
      "ai professional videos": "전문 AI 영상 수",
      "social media management": "소셜 미디어 관리",
      "one time estimate": "일회성 프로젝트 예상 비용",
      "monthly estimate": "월간 예상 투자 비용",
      "per month": "/월",
      "one time": "일회성",
      "monthly serenity": "월간 (세레니티 패키지)",
      "hello": "안녕하세요,",
      "quote request intro": "맞춤형 세레니티 패키지 견적을 요청하고 싶습니다:",
      "type label": "유형",
      "photos label": "사진",
      "professional visuals": "전문 비주얼",
      "videos label": "영상",
      "ai sequences": "AI 시퀀스",
      "social media label": "소셜 미디어",
      "yes included": "예 (포함)",
      "no": "아니요",
      "estimate label": "예상 비용",
      "thank you": "감사합니다.",
      "request serenity quote": "세레니티 견적 요청",
      "free analysis 24h": "24시간 이내 무료 프로젝트 분석",
      "back": "뒤로",
      "choose your power": "나에게 맞는 파워를 선택하세요",
      "power your creativity": "세계 최고의 AI 엔진으로 창의력을 강화하세요",
      "monthly": "월간",
      "yearly": "연간",
      "no commitment": "약정 없음",
      "ideal to test engines": "AI 엔진을 테스트하기에 적합",
      "lightnings": "라이트닝",
      "month": "월",
      "reset each month": "매월 초기화",
      "access all engines": "모든 엔진 이용 가능 (패키지에 따라)",
      "optimized prompt": "프롬프트 최적화 기능",
      "prompt models access": "프롬프트 모델 이용",
      "packs purchase access": "패키지 구매 이용",
      "explore studio": "스튜디오 둘러보기",
      "best value quality price": "최고의 가성비",
      "hd image flux": "고화질 이미지: Flux Dev / Schnell",
      "hd video engines": "고화질 영상: HD & FULL HD",
      "up to 33 videos or 300 images": "최대 HD 영상 33개 또는 이미지 300장",
      "subscribe now": "지금 구독",
      "most popular": "가장 인기",
      "all image video engines hd": "모든 이미지 및 영상 엔진 HD & FULL HD",
      "up to 77 videos or 700 images": "최대 HD 영상 77개 또는 이미지 700장",
      "become standard": "Standard로 업그레이드",
      "plus 60 creative power": "+60% 창작 파워",
      "up to 134 videos or 1200 images": "최대 HD 영상 134개 또는 이미지 1,200장",
      "upgrade master": "Master로 업그레이드",
      "ultimate offer": "최고급 혜택",
      "for intensive creators": "집중적으로 제작하는 크리에이터용",
      "up to 277 videos or 2500 images": "최대 HD 영상 277개 또는 이미지 2,500장",
      "max server priority": "최고 서버 우선순위 (대기열 없음)",
      "join elite": "Elite 가입",
      "premium agency": "프리미엄 에이전시",
      "ultimate tool pro studios": "프로 스튜디오를 위한 최고의 도구",
      "up to 888 videos or 8000 images": "최대 HD 영상 888개 또는 이미지 8,000장",
      "become legend": "Legend 되기",
      "concierge": "컨시어지",
      "zero effort pro result": "최소한의 노력, 전문가 수준의 결과",
      "quote": "견적",
      "project": "프로젝트",
      "we prompt for you": "프롬프트를 대신 제작해 드립니다",
      "high quality image video": "고품질 이미지 및 영상 생성",
      "upscale pro retouching": "전문 업스케일링 및 리터칭 포함",
      "contact us": "문의하기",
      "recharge on demand": "또는 필요할 때 충전",
      "subscription diamonds note": "구독 라이트닝은 매월 초기화됩니다. 구매한 다이아몬드는 1년 동안 유효합니다.",
      "request sent": "요청이 전송되었습니다!",
      "request received": "정보를 정상적으로 접수했습니다. 빠르게 연락드리겠습니다.",
      "quote request": "견적 요청",
      "information": "문의",
      "report problem": "문제 신고",
      "request details placeholder": "요청 내용을 입력하세요...",
      "cancel": "취소",
      "sending": "전송 중...",
      "send": "보내기",
      "login required diamonds": "다이아몬드를 구매하려면 로그인해야 합니다.",
      "login required subscription": "구독하려면 로그인해 주세요.",
      "tutorialUi": {
        "academyImage": "OVORTEX 아카데미 · 이미지",
        "academyVideo": "OVORTEX 아카데미 · 동영상",
        "stepGuide": "📘 단계별 가이드",
        "promptExample": "✨ 프롬프트 예시",
        "featuresTitle": "이 모델의 주요 기능",
        "stepByStep": "단계별 가이드",
        "tip": "팁: 결과 개선에 영향을 주는 요소를 파악하려면 한 번에 하나씩 변경하세요.",
        "resources": "문서 및 자료",
        "resourcesPending": "이 모델의 확인된 동영상 자료가 준비되면 이 섹션이 업데이트됩니다. 공식 링크가 있으면 모델 문서를 참고하세요.",
        "engineDocs": "모델 문서",
        "promptHint": "대괄호 안의 내용을 원하는 아이디어로 바꾸세요. 이 템플릿은 시작점이므로 추가한 이미지와 옵션에 맞게 조정하세요.",
        "imagePromptHint": "대괄호 안의 안내를 원하는 아이디어로 바꾸세요. 이미지 번호는 패널에 추가한 참조 이미지와 일치해야 합니다.",
        "copied": "복사됨!",
        "copyUnavailable": "이 브라우저에서는 복사할 수 없습니다. 위 텍스트를 선택하세요.",
        "copyUnavailableImage": "복사할 수 없습니다. 텍스트를 선택해 복사하세요.",
        "copyPrompt": "📋 프롬프트 복사",
        "usePrompt": "생성 입력란에 사용",
        "promptCopied": "프롬프트 복사 완료!",
        "aboutEngine": "이 모델에 대한 정보",
        "recommendedSteps": "권장 단계",
        "seeExample": "프롬프트 예시 보기 →",
        "closeTutorial": "튜토리얼 닫기",
        "videoPromptHint": "대괄호 안의 항목을 동영상 세부 정보로 바꾸세요.",
        "modelOptionsMayVary": "모델에 따라 사용 가능한 설정이 다를 수 있습니다. 외부 영상보다 Ovortex에 실제로 표시되는 옵션을 기준으로 삼으세요."
      },
      "suggestions": {
        "image": {
          "1": {
            "title": "사이버펑크 도시",
            "prompt": "네온 조명과 영화 같은 조명, 8K, 초정밀 디테일로 표현한 미래형 사이버펑크 센트럴 파크 풍경."
          },
          "2": {
            "title": "저격수",
            "prompt": "눈 위장복을 입은 저격수가 높은 산의 깊은 눈 속에 엎드려 있다. 극도의 사실감, 지면 높이의 시점, 소총에 선명하게 맞춘 초점, 적대적이고 혹독한 겨울 분위기와 고산지대의 거친 빛."
          },
          "3": {
            "title": "일몰",
            "prompt": "바위 위의 게 한 마리가 해변 너머로 지는 석양을 바라본다. 해변은 약간 흐리게 초점을 맞춘다."
          },
          "4": {
            "title": "도시 폐허 전투",
            "prompt": "초현실적인 장면: 푸른 머리의 전술 요원이 폐허가 된 건물 안에 착지한다. 날카롭고 집중된 눈빛을 하고 있으며, 관객을 겨누는 동안 재킷이 공중에 휘날린다."
          },
          "5": {
            "title": "밤의 펜트하우스 여성",
            "prompt": "영화 같은 애니메이션 일러스트. 밤의 고급스러운 현대식 펜트하우스 사무실에 전신으로 서 있는 여성 악역이 권총을 카메라 정면으로 겨눈다. 지배적이고 위협적인 자세, 뚜렷한 로우 앵글, 세련된 검은 정장 재킷, 칼라가 살짝 열린 몸에 맞는 검은 셔츠, 테일러드 검은 바지, 벨트의 은은한 금속 체인, 주머니에 넣은 한 손, 짧은 검은 레이어드 헤어, 빛나는 붉은 눈, 창백한 피부, 차갑고 단호한 표정. 극적인 조명과 얼굴·머리카락의 초현실적 디테일, 광택 나는 검은 대리석 바닥, 뒤편의 임원용 책상과 가죽 의자, 밤의 빛나는 도시를 내려다보는 거대한 유리창, 현실적인 표면 반사. 어둡고 세련된 네오 누아르 분위기, 영화 같은 그림자, 사실적인 애니메이션 스타일, 걸작 수준, 극도의 선명도, 볼류메트릭 조명, 심도, 높은 대비, 전문 콘셉트 아트, 8K, 액션 스릴러 분위기."
          },
          "6": {
            "title": "애니메이션",
            "prompt": "애니메이션 스타일. 긴 웨이브 금발과 황금빛 눈을 가진 젊은 여성이 녹색 나무 공원 벤치 한가운데 앉아 있다. 붕대를 하고 있으며, 금색 단추와 빨강·검정 스카프가 있는 어두운 제복 위에 녹색 재킷을 열어 입었다. 소매에는 빨간 배지가 보인다. 흰색 플리츠 스커트 위 무릎에 손을 올려놓았다. 공원에 앉아 관찰자를 똑바로 바라보며 진지한 표정을 짓는다."
          },
          "7": {
            "title": "보름달 아래 섬",
            "prompt": "여러 개의 조명이 켜진 탑으로 이루어진 아름다운 전통 아시아 사원이 완벽하게 고요한 호숫가에 있으며, 호수는 장면 전체를 비춘다. 거대한 황금빛 보름달이 하늘을 지배하고 물속에 온전히 반사된다. 웅장한 수직 절벽이 있는 장대한 산골짜기는 안개에 둘러싸여 있다. 주황·빨강·금색의 따뜻한 가을 숲이 사원을 감싸고, 빛나는 등불은 신비롭고 아늑한 분위기를 만든다. 산 사이로 영화 같은 안개가 흐른다. 곡선 지붕, 조각 목재, 전통 조명이 있는 세밀한 아시아 건축. 평화롭고 환상적이며 영적인 분위기. 볼류메트릭 조명, 은은한 광선, 초현실적인 수면 반사, 완벽한 대칭 구도, 자연스러운 심도, 풍부하고 대비 높은 색상, 극사실주의, 초정밀 걸작, 시네마틱 판타지 풍경, HDR, 글로벌 일루미네이션, 레이 트레이싱, 언리얼 엔진 품질, 8K, 매우 선명한 초점, 고도로 세밀한 질감, 전문 풍경 사진, 숨 막히는 파노라마, 황금빛 달빛, 사실적인 안개, 수상 경력급 사진."
          },
          "8": {
            "title": "3D",
            "prompt": "붉은 벨벳과 정교하게 조각된 금 장식으로 덮이고 문장 무늬와 사자 조각상으로 꾸며진 거대한 왕좌. 보석처럼 푸르고 금빛인 보석이 박힌 왕관을 쓴 위엄 있는 쥐가 왕처럼 왕좌에서 평화롭게 잠들어 있으며, 앞발 사이에 왕홀을 섬세하게 쥐고 있다. 배경은 거대한 석조 아치와 기념비적인 기둥, 바닥의 잔해가 있는 고대 고딕 성당의 폐허다. 강력한 빛줄기가 높은 창문을 통과해 신성하고 극적인 분위기 속에서 쥐와 왕좌를 비춘다. 빛 속에는 먼지 입자가 떠다닌다. 벨벳, 조각 목재, 오래된 돌, 쥐의 털을 초정밀 질감으로 표현한다. 영화 같은 분위기, 사실적인 중세 판타지, 극사실주의, 자연스러운 심도, 볼류메트릭 조명, 레이 트레이싱, HDR, 글로벌 일루미네이션, 언리얼 엔진 5 품질, 초현실적 걸작, 고도로 세밀한 8K, 시네마틱 판타지, 극적인 조명, 수상 경력급 사진."
          },
          "9": {
            "title": "수중 잠수",
            "prompt": "일본 사무라이 전사가 이미지 오른쪽에서 옆모습으로 서서 결연한 눈빛으로 지평선을 바라본다. 검은 머리는 전통적인 상투로 묶였고 가벼운 수염, 질감이 풍부한 어두운 기모노, 허리의 카타나가 보인다. 뒤에는 수정 같은 물과 반투명한 유체만으로 이루어진 영적인 분신이 나타난다. 물의 형상은 반전되어 반대 방향을 바라보며 강한 시각적 대비를 만든다. 파도, 물보라, 액체 실선과 공중에 멈춘 물방울로 이루어진 실루엣. 파랑, 짙은 남색, 회색, 흰색 잉크와 수채화 효과, 물감 튀김이 있는 추상적 배경. 신비롭고 영적이며 사색적인 분위기. 얼굴, 머리카락, 천, 물의 극도로 세밀한 디테일과 극적인 영화 조명. 사실적인 반사, 완벽한 투명도, 초정밀 질감, 고급 예술 구도, 포토리얼 콘셉트 아트, 걸작, 초현실적 표현, 영화·볼류메트릭 조명, 판타지 리얼리즘, 8K, HDR, 선명한 초점, 수상 경력급 디지털 아트."
          },
          "10": {
            "title": "음산한 숲",
            "prompt": "어둡고 울창한 숲에서 공포에 질린 여성이 달린다. 짙은 안개가 죽은 나무와 부러진 가지를 감싸 공포 스릴러 분위기를 만든다. 손전등의 빛줄기가 안개를 뚫고 패닉에 빠진 얼굴과 진흙, 몸싸움 흔적으로 뒤덮인 몸을 비춘다. 달리고 자연 장애물을 헤치며 옷이 찢어지고 더러워졌다. 극적인 빛, 숨 막히는 분위기, 습기와 사실적인 숲 바닥 질감, 세밀한 나뭇잎과 가지. 키가 크고 가느다란 나무, 자연스러운 심도, 얼굴·옷·지면의 초정밀 질감. 영화 같은 호러 스릴러 사진, 초현실적, HDR, 8K, 높은 대비, 극도의 사실감, 빛과 그림자의 능숙한 표현."
          },
          "11": {
            "title": "매거진",
            "prompt": "1960년대 크림색 빈티지 자동차 보닛에 자신 있게 앉은 금발 여성. 극적인 로우 앵글. 우아한 녹색 점프수트와 베이지색 끈 달린 군화 스타일 부츠를 착용한다. 한쪽 다리를 렌즈 쪽으로 뻗어 신발 밑창이 전경에서 두드러진다. 진지한 표정으로 카메라를 직접 바라본다. 드문드문 야자수가 늘어선 도로, 황금빛 석양과 캘리포니아 분위기. 빈티지 자동차의 크롬 차체에 사실적인 반사. 영화 같은 심도, 얼굴·옷·차량의 초선명 디테일. 자연스러운 골든아워 조명, 부드러운 그림자, 현실적인 색상, 고급 패션 사진, 전문적인 구도, 초현실적, 8K, HDR, 극사실주의, 세밀한 피부 질감, 24mm 광각 렌즈, 럭셔리 잡지 품질."
          },
          "12": {
            "title": "배경 합성",
            "prompt": "사진을 수정해 짙은 회색 코트와 긴 숲빛 녹색 플리츠 스커트를 추가한다. 포즈: 포장된 길에 서서 한 손을 코트 주머니에 넣고 카메라 쪽으로 살짝 몸을 돌린 우아한 자세. 배경: 가을의 센트럴 파크, 주황색과 황금색 나뭇잎이 시야를 둘러싸고 뒤편에는 뉴욕 고층 건물의 실루엣이 보인다. 분위기 요소: 바닥에 낙엽과 책 몇 페이지가 흩어져 시적이고 우울한 분위기를 만든다. 추가 요소: 왼쪽 위의 작은 액자형 삽입 이미지에는 다른 각도에서 촬영한 같은 여성의 얼굴 클로즈업이 보인다."
          },
          "13": {
            "title": "마케팅",
            "prompt": "초현실적인 뷰티 포트레이트. 초록 눈의 금발 여성이 카메라를 강렬하게 바라보고, 자연스러운 주근깨와 윤기 나는 버건디 립을 갖고 있다. 고급 전문 메이크업, 얼굴 가까이 든 분홍색 립스틱, 우아한 빨간 손톱과 금색 귀걸이. 극적인 붉은 조명, 럭셔리하고 글래머러스한 분위기, 사실적인 질감의 빛나는 피부, 프리미엄 화장품 사진, 메이크업 브랜드 광고, 영화 같은 심도, 극도의 디테일, 포토리얼리즘, 패션 잡지 품질, 전문 스튜디오, 8K, 초정밀."
          },
          "14": {
            "title": "수채화 초상화",
            "prompt": "고품질 수채화 스타일 로고. 정면을 향한 강렬하고 다채로운 여우 머리, 단색 배경. Yukisakura 작품, 아름답고 생생하며 풍부한 색상, 정사각형 형식."
          },
          "15": {
            "title": "사이버펑크 여성",
            "prompt": "디스토피아 사이버펑크 미래. 작고 연약하고 취약해 보이는 젊은 한국 여성이 작은 사이버펑크 도시의 거리를 걷는다. 짧고 헝클어진 보라색 머리에 빛나는 네온 포인트가 있다. 카고 팬츠, 찢어진 크롭톱, 긴 코트 등 매우 낡은 옷을 입었다. 왼쪽 허벅지 위쪽에는 스트랩으로 사이버덱이 고정되어 있다. 얼굴에는 피로와 탈진, 깊은 무력감이 드러난다."
          }
        },
        "video": {
          "1": {
            "title": "황혼",
            "typeStyle": "만화",
            "prompt": "세밀한 갑옷을 입은 고독한 사무라이가 키 큰 풀이 자라는 언덕에 서서 멀리 일본 도시 위로 타오르는 붉은 석양을 바라본다. 강한 바람에 옷과 풀이 흔들린다. 서사적이고 쓸쓸한 분위기, 빛나는 구름이 있는 극적인 하늘. 카메라는 사무라이 뒤의 미디엄 샷으로 시작해 빠르고 부드럽게 뒤로 이동하며 계곡과 도시를 드러낸 뒤, 인물 주위를 180도 살짝 회전해 영화적인 마무리를 만든다. 대비가 강한 골든아워 조명, 사실적인 렌즈 플레어, 영화 같은 심도, 일본 블록버스터 영화 수준의 초현실적 영상."
          },
          "2": {
            "title": "미래형",
            "typeStyle": "사이버펑크",
            "prompt": "보라색 머리의 젊은 사이버펑크 여성이 비에 젖고 활기찬 한국 골목을 걷는다. 젖은 아스팔트를 천천히 밟는 부츠를 극단적인 클로즈업으로 시작하고, 웅덩이에 화려한 네온이 반사된다. 발걸음을 따라 카메라가 부드럽게 뒤로 이동한다. 1초 후 다리, 전술 장비, 낡은 코트를 따라 카메라가 서서히 위로 올라간다. 그녀는 손을 주머니에 넣고 자신감 있게 걷는다. 얼굴까지 올라가면서 빛나는 한글 간판, 배수구에서 피어오르는 증기, 배경의 행인 등 골목 전체가 드러난다. 사실적인 사이버펑크 분위기와 자연스러운 움직임, 영화적 조명, 현실적인 심도와 젖은 바닥 반사, 초현실적 디테일, 8K 영화 품질."
          },
          "3": {
            "title": "음산한 숲",
            "typeStyle": "실사풍",
            "prompt": "깊은 밤 어둡고 안개 낀 숲에서 겁에 질린 여성이 죽은 나무와 얽힌 가지 사이의 좁고 진흙투성이 길을 전속력으로 달린다. 옷은 더럽고 찢어졌으며 얼굴에는 땀과 진흙, 공포가 묻어 있다. 손전등을 꽉 쥐고 두꺼운 안개를 가르는 빛을 비춘다. 실제와 같은 달리기 동작, 정확한 발 디딤과 체중 이동, 미묘한 호흡, 움직임에 자연스럽게 반응하는 머리카락과 옷. 슬로 모션 금지. 지면 가까운 극적인 로우 앵글 추적 촬영으로 시작하며 젖은 뿌리, 진흙 튐, 부러진 가지가 전경을 빠르게 스쳐 간다. 손전등 빛이 나무 사이를 훑으며 움직이는 그림자와 안개 속 볼류메트릭 조명을 만든다. 도망이 계속되면 카메라가 부드럽게 상승하고 뒤로 물러나 로우 앵글 추적에서 점점 높은 항공 시점으로 전환한다. 광활하고 고립된 숲이 드러나고 여성은 어둠 속 작은 실루엣이 된다. 두꺼운 안개, 수관 사이로 스며드는 달빛, 사실적인 대기 원근, 공포 스릴러의 영화적 조명과 자연스러운 카메라 움직임, 젖은 땅의 반사, 포토리얼한 질감, HDR, 긴장감, 할리우드 대작 수준의 8K 몰입형 장면."
          },
          "4": {
            "title": "경주",
            "typeStyle": "3D",
            "prompt": "울창한 숲을 경기 코스로 바꾼 역동적인 영화 장면. 매우 세밀한 의인화 토끼 두 마리가 좁은 흙길에서 전력 질주한다. 파란 티셔츠와 배낭을 멘 흰 토끼가 앞서고 빨간 티셔츠를 입은 회색 토끼가 바짝 뒤쫓으며 둘 다 강한 결의를 보인다. 지면 가까이에서 매우 빠르게 전진하는 카메라와 전문 레이스 촬영 같은 약간의 흔들림. 속도감을 강조하고 팔다리에 모션 블러를 적용하며 발걸음마다 먼지와 흙 입자가 튄다. 양옆에는 무성한 식물, 얕은 심도로 흐릿하게 보이는 동물 관중. 익스트림 스포츠 스타일, 결승전 분위기, 나무 사이로 들어오는 극적인 황금빛, 고예산 애니메이션 영화 수준의 초현실적 3D, 최대의 긴장감과 에너지."
          },
          "5": {
            "title": "우주비행사",
            "typeStyle": "우주",
            "prompt": "고독한 우주비행사가 지구 위 깊은 우주에 떠 있다. 광대한 우주와 지구의 곡선, 화면 중앙의 작은 우주비행사를 보여주는 매우 넓은 샷으로 시작한다. 카메라는 빠르고 부드럽게 앞으로 다가간다. 가까워질수록 우주복의 세부가 드러나고 헬멧 바이저에 태양빛이 반사된다. 중간 거리에서 카메라가 우주비행사 주위를 180도 회전하며 뒤편의 지구와 별이 가득한 우주 공간을 차례로 보여준다. 완벽하게 안정된 움직임, 설득력 있는 무중력, 사실적인 우주 조명과 물리적 반사, IMAX 품질, 극사실주의, 영화적 심도, 8K, 대작 우주 다큐멘터리 스타일, 자연스러운 모션 블러, 압도적이고 사색적인 분위기."
          },
          "6": {
            "title": "공원",
            "typeStyle": "애니메이션",
            "prompt": "애니메이션 스타일: 공원 벤치에 앉아 있는 여성의 무릎 위로 고양이가 올라오고, 여성이 고양이를 부드럽게 쓰다듬는다."
          },
          "7": {
            "title": "실사풍",
            "typeStyle": "실사풍",
            "prompt": "초현실적인 장면. 약간 어질러진 고급 호텔 객실에서 금발 여성이 침대에 앉아 있다. 눈 주변 대부분을 검은 화장으로 덮고 있다. 카메라가 천천히 앞으로 이동해 지쳐 보이는 얼굴을 클로즈업한다."
          },
          "8": {
            "title": "산악 풍경",
            "typeStyle": "영화",
            "prompt": "움직이는 황금빛 유체, 자기파, 고급스러운 분위기, 추상적인 3D 아트."
          },
          "9": {
            "title": "네오누아르 애니메이션",
            "typeStyle": "애니메이션",
            "prompt": "시네마틱 애니메이션 일러스트: 밤의 고급스러운 현대식 펜트하우스 사무실에 여성 악역이 전신으로 서서 권총을 카메라 정면으로 겨눈다. 위협적이고 지배적인 자세, 강한 로우 앵글. 그녀가 앞으로 걸어오면 카메라는 걸음에 맞춰 뒤로 이동한다. 세련된 검은 정장 재킷, 목 부분이 살짝 열린 검은 셔츠, 몸에 맞는 검은 바지, 허리의 은은한 금속 체인, 주머니에 넣은 한 손, 짧은 그라데이션 검은 머리, 빛나는 붉은 눈, 창백한 피부와 차갑고 단호한 표정. 극적인 조명, 얼굴과 머리카락의 섬세한 디테일, 윤이 나는 검은 대리석 바닥, 임원용 책상과 가죽 의자, 밤의 불빛으로 빛나는 도시를 향한 거대한 창문. 표면의 사실적인 반사 뒤 카메라가 얼굴을 줌인한다. 어둡고 세련된 네오 누아르 분위기, 영화 같은 그림자, 사실적인 애니메이션 스타일, 걸작 수준, 매우 선명한 초점, 볼류메트릭 조명, 심도, 강한 대비, 전문 콘셉트 아트, 8K, 액션 스릴러 분위기."
          },
          "10": {
            "title": "섬뜩한 인형",
            "typeStyle": "공포",
            "prompt": "버려진 빅토리아풍 저택의 어둡고 낡은 방. 찢어진 벽지, 공중에 떠다니는 먼지, 거미줄, 영화 같은 조명이 있다. 금이 간 도자기 인형이 방 중앙의 오래된 벨벳 안락의자에 움직임 없이 앉아 있다. 카메라는 와이드 샷에서 클로즈 샷으로 천천히 전진한다. 창문으로 희미한 달빛이 들어오고 깜박이는 촛불이 벽에 움직이는 그림자를 드리운다. 인형의 헝클어진 머리카락이 미풍에 살짝 움직인다. 마지막 2초 동안 인형의 머리가 비정상적이고 섬뜩한 움직임으로 천천히 카메라를 향해 돌아가며 눈이 렌즈를 따라오는 듯 보인다. 숨 막히는 분위기, 심리적 공포, 초현실적 사실감, 할리우드 영화 품질, 볼류메트릭 조명, 영화 같은 심도, 극도로 세밀한 묘사, 4K, 16:9."
          },
          "11": {
            "title": "움직이는 카메라",
            "typeStyle": "실사풍",
            "prompt": "신선한 눈으로 완전히 덮인 정원을 밤에 촬영한 초현실적인 감시 카메라 영상. 고정된 흑백 적외선 보안 카메라 화면에 약간의 디지털 노이즈, 압축 아티팩트, 화면 모서리의 타임스탬프가 보인다. 정원 중앙에는 커다란 눈사람이 움직이지 않고 서 있다. 한 남자가 눈 위에 발자국을 남기며 눈사람 쪽으로 걸어간다. 1미터 이내로 다가서는 순간 고양이가 눈사람 안에서 엄청난 속도로 갑자기 튀어나와 남자의 얼굴로 뛰어들고, 남자는 놀라 비명을 지르며 급히 뒤로 물러난다. 카메라는 끊기는 움직임과 진짜 감시 영상 같은 화질, 불길한 분위기로 사건을 기록한다. 사실적인 야간 조명과 자연스러운 그림자, 사진처럼 사실적인 디테일, 시네마틱 4K, 실제 보안 카메라에 포착된 미스터리 현상의 바이럴 영상 스타일."
          },
          "12": {
            "title": "바다",
            "typeStyle": "3D",
            "prompt": "바위 위의 게가 해변의 일몰을 바라본다. 해변은 약간 초점이 흐려져 있다."
          },
          "13": {
            "title": "공격",
            "typeStyle": "실사풍",
            "prompt": "초현실적이고 영화적인 장면: 거대한 좀비 무리가 한밤중 타임스스퀘어를 덮친다. 수백 명의 공포에 질린 시민이 사방으로 도망치고 좀비들이 불이 켜진 거리에서 뒤쫓는다. 버려진 차량, 충돌, 폭발, 비명과 혼란이 도시를 종말의 현장으로 만든다. 역동적인 카메라와 다급한 움직임, 대형 재난 영화 분위기, 사실적인 도시 조명, 사진처럼 세밀한 묘사, 4K. 마지막의 장대한 뉴욕 항공 장면: 도시 전체가 불타고 거대한 검은 연기 기둥이 지평선을 뒤덮으며 여러 지역이 화재로 파괴되어 있다. 종말론적 분위기, 불꽃의 붉은 빛, 대규모 파괴, 초현실적 렌더링. 마지막 장면은 연기와 불길에 휩싸인 황폐한 뉴욕 강변에서 시작한다. 헬리콥터가 위태로운 도시 위를 날고 폭발이 지평선을 밝힌다. 세상의 종말 같은 분위기, 장대한 영화 촬영, 극도로 세밀한 디테일, 4K, 할리우드 블록버스터 스타일."
          },
          "14": {
            "title": "화산",
            "typeStyle": "애니메이션",
            "prompt": "대규모 화산 폭발이 일어나는 울창한 선사시대를 초현실적으로 묘사한 시네마틱 장면. 카메라는 매우 빽빽하고 세밀한 정글 위의 넓은 항공 샷으로 시작한다. 지상의 공룡들(티라노사우루스, 트리케라톱스, 용각류)이 모두 고개를 들어 멀리 분출하는 화산을 바라본다. 용암이 튀고 거대한 화산재 구름이 치솟는 장관. 극적인 하늘에는 익룡들이 날아다닌다. 풍부한 식생, 습한 정글, 볼류메트릭 안개, 늦은 오후의 황금빛. 카메라는 부드럽게 전진하며 화산 쪽으로 살짝 회전한다. 블록버스터 스타일, 초현실적 사실감, 영화 같은 심도, 4K."
          },
          "15": {
            "title": "시네마틱",
            "typeStyle": "시네마틱",
            "prompt": "낡고 버려진 오래된 집의 어두운 복도에 고정된 카메라. 복도 끝 창문에서 희미한 자연광이 들어오고 커튼이 조금씩 흔들린다. 더럽고 찢어진 잠옷을 입은 약 40세 여성이 축축한 나무 바닥을 따라 카메라 쪽으로 천천히 기어온다. 극도의 공포에 빠져 거칠게 숨 쉬며 몸을 떤다. 갑자기 멈춘 뒤 화면 밖의 무언가가 쫓아오는 듯 공포에 질린 눈으로 천천히 뒤를 돌아본다. 숨 막히는 분위기, 정적과 점점 커지는 긴장감. 카메라는 고정되어 있지만 손으로 든 카메라 같은 미세한 흔들림이 있다. 초현실적인 공포 영화 스타일, 차가운 빛, 시네마 필름 그레인, 4K, 얕은 심도, 무겁고 음산한 분위기. 길이 10초, 느리고 연속적인 움직임, 마지막 뒤돌아보는 시선까지 긴장감이 고조된다."
          }
        }
      },
      "tutorialResourceLabels": {
        "seedance20": "모델 개요 및 정보",
        "hailuo": "Hailuo 2.3 공식 소개",
        "kling2_6": "Kling 공식 가이드(2.6 가이드 포함)",
        "kling26_motion": "Kling 및 모션 컨트롤 공식 가이드",
        "kling30": "Kling 3.0 공식 가이드",
        "veo3_1": "Veo 3.1 공식 가이드",
        "veo3_1_fast": "Veo 3.1 공식 가이드",
        "minimax_h3": "MiniMax 동영상 가이드",
        "seedance25": "Seedance 실용 가이드",
        "seedance": "Seedance 제품군 문서",
        "hailuoTitle": "Hailuo 2.3 — 동영상 튜토리얼",
        "seedance20Title": "Seedance 2.0 초보자를 위한 전체 튜토리얼"
      },
      "app": {
        "prompt": {
          "aiDiscussion": "AI 대화",
          "creative": "창의적인 프롬프트",
          "askQuestion": "질문을 입력하세요...",
          "describeIdea": "아이디어를 자세히 설명하세요..."
        },
        "optimize": {
          "analyzing": "⏳ 분석 중...",
          "button": "✨ 최적화"
        },
        "upload": {
          "load": "📁 업로드",
          "fileLimits": "파일당 제한: 이미지 20MB · 동영상 64MB · 오디오 20MB."
        },
        "style": {
          "realistic": "사실적",
          "cyberpunk": "사이버펑크",
          "anime": "애니메이션",
          "watercolor": "수채화",
          "animation3d": "3D 애니메이션"
        },
        "status": {
          "generationFinalizing": "생성 작업을 마무리하는 중...",
          "fileLoading": "파일을 불러오는 중...",
          "fileImported": "가져온 파일",
          "generatingOnModel": "⏳ {{model}}에서 생성 중...",
          "priorityMax": "⚡ 최대 우선순위: {{model}}이(가) 즉시 응답합니다...",
          "videoLoaded": "🎬 스튜디오에 동영상이 로드되었습니다!",
          "imageLoaded": "🖼️ 스튜디오에 이미지가 로드되었습니다!",
          "newProject": "새 프로젝트가 시작되었습니다!"
        },
        "error": {
          "selectCharacterImage": "캐릭터 이미지를 선택하세요.",
          "importMotionVideo": "동작을 위한 참조 동영상을 업로드하세요.",
          "generation": "생성 중 오류가 발생했습니다.",
          "falTimeout": "Fal.ai 요청 시간이 초과되었습니다.",
          "securityUnavailable": "보안 확인을 사용할 수 없습니다. 페이지를 새로고침한 후 다시 시도하세요.",
          "videoUnavailable": "처리가 완료되었지만 동영상을 사용할 수 없습니다. 다시 시도하세요.",
          "sessionExpired": "세션이 만료되었습니다. 다시 로그인한 후 시도해 주세요.",
          "notLoggedIn": "오류: 로그인되어 있지 않거나 세션이 만료되었습니다.",
          "hailuo512Image": "Hailuo 512에는 시작 이미지가 필요합니다. 이미지를 추가하세요.",
          "hailuo512Title": "시작 이미지 필요",
          "insufficientCredits": "크레딧이 부족합니다. 이 생성에는 {{price}} 💎이(가) 필요합니다.",
          "motionImages": "이 모델에 필요한 동작 참조 이미지를 추가하세요.",
          "technicalGeneration": "생성 중 기술 오류가 발생했습니다. 다시 시도하세요.",
          "deleteFailed": "항목을 삭제할 수 없습니다.",
          "deleteServerFailed": "서버에서 항목을 삭제하는 중 오류가 발생했습니다.",
          "fileTooLarge": "파일 “{{fileName}}”의 크기가 {{label}} 허용 한도 {{maxSize}}를 초과했습니다(현재 크기: {{actualSize}}).",
          "fileTooLargeSimple": "파일 “{{fileName}}”의 크기가 {{label}} 허용 한도 {{maxSize}}를 초과했습니다.",
          "fileUploadFailed": "파일 “{{fileName}}”을(를) 업로드할 수 없습니다.",
          "serverRequestFailed": "요청에 실패했습니다(서버 오류 {{status}}). 잠시 후 다시 시도해 주세요.",
          "rateLimited": "짧은 시간에 요청이 너무 많습니다. 잠시 기다린 후 다시 시도해 주세요.",
          "requestTimeout": "요청 시간이 초과되었습니다. 다시 시도해 주세요."
        },
        "history": {
          "noDescription": "설명 없음",
          "remix": "리믹스",
          "title": "생성 기록",
          "remixButton": "리믹스",
          "editButton": "편집",
          "editVideoTitle": "이 동영상 편집"
        },
        "insufficient": {
          "diamondsMessage": "이 작업을 수행하기 위한 다이아몬드 잔액이 부족합니다.",
          "buyDiamonds": "🛒 다이아몬드 구매",
          "subscribeOrBuy": "🚀 구독 또는 다이아몬드 구매",
          "stayStudio": "스튜디오에 머무르기",
          "cost": "이번 생성 비용: {{cost}}",
          "diamonds": "사용 가능한 다이아몬드: {{count}}",
          "tokens": "사용 가능한 번개: {{count}}",
          "tokensHelp": "번개는 구독에 포함되며 다이아몬드는 별도로 구매합니다."
        },
        "edit": "수정",
        "settings": {
          "pixverseAdvanced": "고급 옵션",
          "pixverseDescription": "생성 스타일, 속도, 일관성을 사용자 지정하세요.",
          "multiShot": "멀티 샷 / 앵글 변경",
          "multiShotHelp": "하나의 동영상에 여러 샷을 허용합니다.",
          "visualStyle": "시각 스타일",
          "automatic": "자동",
          "clay": "클레이",
          "comic": "만화",
          "thinkingLevel": "추론 수준",
          "enhanced": "강화",
          "fast": "빠르게",
          "random": "무작위",
          "negativePrompt": "네거티브 프롬프트",
          "negativePromptExample": "예: 흐림, 아티팩트, 끊기는 움직임, 왜곡된 텍스트…",
          "addImages": "이미지 추가",
          "addVideos": "동영상 추가",
          "addAudios": "오디오 추가",
          "referenceImage": "참조 이미지 {{number}}",
          "referenceVideo": "참조 동영상 {{number}}",
          "referenceAudio": "참조 오디오 {{number}}",
          "imageEditPrecise": "정밀 편집",
          "guidedComposition": "구도 안내",
          "multipleReferences": "다중 참조",
          "addReferenceImages": "참조 이미지 추가",
          "imageLimitReached": "이미지 한도에 도달했습니다",
          "chooseFiles": "컴퓨터에서 파일을 선택하려면 클릭하세요",
          "referencesAdded": "추가된 참조",
          "removeImageHint": "×를 클릭해 이미지를 제거하세요",
          "noImageReferences": "추가된 이미지가 없습니다. 참조 이미지는 선택 사항이며 프롬프트만으로도 생성할 수 있습니다.",
          "engineSettings": "모델 설정",
          "outputFormat": "출력 형식",
          "optionalSeed": "선택적 시드",
          "imageQuality": "GPT Image 2 품질",
          "moderation": "조정",
          "standard": "표준",
          "lessRestrictive": "덜 엄격함",
          "safetyTolerance": "안전 허용치 (0–5)",
          "thinking": "추론",
          "minimalFaster": "최소 · 더 빠름",
          "temperature": "온도 (0–2)",
          "topP": "Top P (0–1)",
          "systemInstruction": "시스템 지침",
          "optional": "선택 사항",
          "generalInstructions": "따라야 할 일반 지침…",
          "referenceVideoNote": "생성된 정지 이미지를 안내하며 결과를 동영상으로 바꾸지는 않습니다.",
          "chooseVideo": "동영상 선택",
          "videoAdded": "동영상 추가됨",
          "usedAsVisualReference": "이미지의 시각적 참조로 사용됩니다.",
          "referenceTip": "팁: 프롬프트에서 각 이미지의 역할과 유지하거나 변경할 요소를 지정하세요.",
          "tutorialEngine": "모델 튜토리얼",
          "seedOptional": "Seed — 선택 사항",
          "negativePromptLabel": "네거티브 프롬프트",
          "avoidElements": "— 피해야 할 요소"
        },
        "video": {
          "existingOperations": "기존 동영상 작업",
          "extend": "동영상 연장",
          "edit": "동영상 편집",
          "extendDescription": "마지막 프레임 이후의 내용을 설명하세요. 길이와 결과는 선택한 모델에 따라 다릅니다.",
          "editDescription": "원하는 변경 사항과 그대로 유지할 요소를 설명하세요.",
          "importSourceFirst": "이 작업을 사용하려면 먼저 미디어 패널에서 원본 동영상을 가져오세요.",
          "changeAppearance": "외관 변경 · AI 필터 및 조명",
          "addSourceForVeo": "Veo의 “{{operation}}” 모드를 사용하려면 원본 동영상을 추가하세요.",
          "describeIdea": "아이디어를 자세히 설명하세요...",
          "characters": "{{count}}자",
          "changeAppearanceLabel": "AI 필터 및 조명",
          "extendGuideTitle": "동영상 연장 방법",
          "editGuideTitle": "동영상 편집 방법",
          "extendOrEditGuideTitle": "동영상 연장 또는 편집",
          "addSourceSeedance": "먼저 Seedance 2.5 패널에서 원본 동영상을 추가한 다음 “동영상 연장” 또는 “동영상 편집”을 선택하세요.",
          "extendSeedanceHelp": "마지막 프레임 이후 이어질 동작, 새로 나타날 요소, 추가할 시간을 설명하세요. 인물, 배경, 카메라 움직임의 일관성을 유지하세요.",
          "editSeedanceHelp": "변경할 부분과 그대로 유지할 부분을 명확히 지정하세요. 원치 않는 변경을 막으려면 인물, 움직임, 구도와 원래 길이를 유지하도록 하세요.",
          "useExtendExample": "연장 예시 사용",
          "useEditExample": "편집 예시 사용",
          "characterCount": "{{count}}자"
        },
        "audio": {
          "ai": "AI 오디오",
          "included": "오디오 포함",
          "native": "기본 오디오",
          "soundDesign": "사운드 디자인",
          "unavailable": "오디오를 사용할 수 없음",
          "referenceDialogue": "참조 오디오 및 대사",
          "referenceHelp": "최대 3개의 오디오로 음성을 안내할 수 있습니다. 참조 패널에 이미지나 동영상도 추가해야 합니다. 시작/끝 프레임 슬롯만으로는 참조 오디오를 사용할 수 없습니다.",
          "remove": "제거",
          "exactDialogue": "말할 정확한 대사 (선택 사항)",
          "dialogueExample": "예: 인물이 “우리는 지금 떠나야 해요.”라고 말합니다.",
          "referenceLimit": "오디오는 음성과 발화를 안내하지만 녹음을 정확히 복제한다고 보장하지 않습니다. 참조 파일은 총 12개까지이며 오디오와 동영상의 합산 길이는 15초를 넘을 수 없습니다.",
          "promptExpansion": "프롬프트 확장",
          "disabledMoreFaithful": "사용 안 함 (더 충실)",
          "balanced": "균형",
          "qualityPriority": "품질 우선",
          "seedOptional": "선택적 Seed"
        },
        "badge": {
          "new": "신규",
          "startEnd": "시작 + 끝",
          "topArena": "Top Arena"
        },
        "cancel": "취소",
        "cost": {
          "diamonds": "다이아몬드",
          "diamondsLower": "다이아몬드",
          "tokens": "번개",
          "tokensLower": "번개",
          "total": "총 비용"
        },
        "defaultImageAlt": "생성된 이미지",
        "delete": {
          "button": "삭제",
          "title": "삭제 확인"
        },
        "download": "다운로드",
        "duration": "길이",
        "explorer": {
          "title": "작품 탐색"
        },
        "formatStyle": "형식 및 스타일",
        "generate": {
          "button": "생성",
          "imageRequired512": "이 모델에는 512 형식의 시작 이미지가 필요합니다.",
          "imageVideoRequired": "계속하려면 참조 이미지 또는 동영상을 추가하세요.",
          "inProgress": "생성 중…",
          "send": "생성 요청 보내기"
        },
        "loading": {
          "generation": "생성 준비 중…"
        },
        "mode": {
          "remastered": "리마스터"
        },
        "newDiscussion": "새 대화",
        "noSelection": "선택된 항목 없음",
        "remix": {
          "creative": "창의적",
          "fidelity": "충실도",
          "strict": "엄격"
        },
        "resolution": "해상도",
        "security": {
          "sync": "보안 동기화 중…"
        },
        "slot": {
          "endBlocked": "이 모델은 종료 이미지를 지원하지 않습니다.",
          "endImage": "종료 이미지",
          "endUnavailable": "종료 이미지를 사용할 수 없음",
          "startBlocked": "이 모델은 시작 이미지를 지원하지 않습니다.",
          "startImage": "시작 이미지",
          "v2vUnavailable": "이 모델에서는 동영상-동영상 기능을 사용할 수 없습니다.",
          "videoBlocked": "이 모델은 원본 동영상을 지원하지 않습니다.",
          "videoSource": "원본 동영상"
        },
        "tip": {
          "kling": {
            "text": "움직임과 카메라 동작을 명확하게 설명하세요.",
            "title": "Kling 팁"
          },
          "luma": {
            "text": "프롬프트를 지나치게 길게 하지 말고 원하는 움직임을 설명하세요.",
            "title": "Luma 팁"
          },
          "pixverse": {
            "text": "시각 스타일, 속도, 원하는 장면 전환을 지정하세요.",
            "title": "PixVerse 팁"
          },
          "seedance": {
            "text": "주요 움직임을 설명하고 연속 동작의 일관성을 유지하세요.",
            "title": "Seedance 팁"
          },
          "seedance25": {
            "text": "여러 장면에서는 각 장면과 전환을 명확히 설명하세요.",
            "title": "Seedance 2.5 팁"
          }
        },
        "waitingCreation": "생성 대기 중…",
        "references": {
          "imagesTitle": "참조 이미지",
          "guideText": "작품의 주제, 외형, 배경 또는 스타일을 안내하세요.",
          "imageCount": "이미지 {{count}}개",
          "tutorialButton": "모델 튜토리얼",
          "addImages": "참조 이미지 추가",
          "imageLimit": "이미지 한도 도달",
          "chooseFiles": "클릭하여 컴퓨터에서 파일 선택",
          "removeToAdd": "이미지를 제거한 후 새 이미지를 추가하세요",
          "preciseEditing": "정밀 편집",
          "guidedComposition": "구도 안내",
          "multipleReferences": "다중 참조",
          "tutorialEngine": "모델 튜토리얼",
          "images": "이미지"
        }
      },
      "line3_app_ui_referenceImages": "참조 이미지",
      "line3_app_ui_referenceImagesUpTo3": "참조 이미지 최대 3개",
      "line3_app_ui_startEndFrames": "시작 / 끝",
      "line3_app_ui_editVideo": "동영상 편집",
      "line3_app_ui_extendVideo": "동영상 연장",
      "line3_app_ui_imageToVideo": "이미지 → 동영상",
      "line3_app_ui_videoReference": "참조 동영상",
      "line3_app_ui_remix": "리믹스",
      "line3_app_ui_characterImage": "캐릭터 이미지",
      "line3_app_ui_motionControl": "동작 제어",
      "line3_app_ui_textToVideo": "텍스트 → 동영상",
      "line3_app_ui_referenceImageCount": "참조 이미지 1~9개",
      "line3_app_ui_referenceVideoCount": "참조 동영상 1~3개",
      "line3_app_ui_referenceAudioCount": "참조 오디오 1~3개",
      "line3_app_ui_generativeAudio": "생성 오디오",
      "line3_app_ui_thinkingLevel": "추론 수준",
      "line3_app_ui_multimodalReferences": "멀티모달 참조 — Seedance",
      "line3_app_ui_seedance25Limit": "선택한 모드에 따라 이미지 최대 30개, 동영상 10개, 오디오 10개",
      "line3_app_ui_seedance20Limit": "참조 파일 최대 12개 · {{count}}/12 사용",
      "line3_app_ui_seedance25Notice": "멀티모달 참조는 시작/끝 프레임 슬롯과 함께 사용할 수 없습니다. 동영상을 편집하거나 연장하려면 위의 원본 동영상 슬롯을 사용하세요. 해당 슬롯이 참조보다 우선합니다.",
      "line3_app_ui_seedance20Notice": "멀티모달 참조는 시작/끝 프레임 슬롯과 함께 사용할 수 없습니다. 원본 동영상은 동영상 한도와 총 12개 파일 한도에 모두 포함됩니다. 파일은 서버의 크기 제한을 준수해야 합니다.",
      "line3_app_ui_seedanceCharacterObjects": "인물, 사물 또는 배경 이미지",
      "line3_app_ui_seedanceNineImages": "결과를 안내하는 이미지 최대 9개",
      "line3_app_ui_seedanceReferenceClips": "원본 동영상 모드를 제외한 참조 클립",
      "line3_app_ui_seedanceThreeVideos": "동영상 최대 3개, 원본 동영상 선택 시 2개",
      "line3_app_ui_audioAmbience": "배경음, 음성 또는 사운드 참조",
      "line3_app_ui_referenceVideoGuidance": "이 동영상은 움직임, 동작 및 카메라 움직임을 안내합니다.",
      "line3_app_ui_buyDiamonds": "🛒 다이아몬드 구매",
      "line3_app_ui_subscribeOrBuyDiamonds": "🚀 구독 또는 다이아몬드 구매",
      "line3_app_ui_stayInStudio": "스튜디오에 머무르기",
      "line3_app_error_waitSourceDuration": "비용을 정확히 계산하려면 편집 모드를 시작하기 전에 원본 동영상 길이가 감지될 때까지 기다리세요.",
      "line3_app_error_selectCharacterImage": "캐릭터 이미지를 선택하세요.",
      "line3_app_error_importMotionVideo": "동작 참조 동영상을 가져오세요.",
      "line3_app_error_securityUnavailable": "보안 확인을 사용할 수 없습니다. 페이지를 새로고침한 후 다시 시도하세요.",
      "line3_app_error_generation": "생성 중 오류가 발생했습니다",
      "line3_app_error_generationFailed": "생성에 실패했습니다.",
      "line3_app_error_technicalGeneration": "생성 중 기술적인 문제가 발생했습니다.",
      "line3_app_error_noResultUrl": "서버가 결과 URL을 반환하지 않고 완료되었습니다. 서버 로그를 확인하세요.",
      "line3_app_error_insufficientCreditsVideo": "이 동영상을 생성할 크레딧이 부족합니다.",
      "line3_app_error_refundTechnical": "기술적인 문제가 발생했습니다. 나중에 다시 시도하세요. 크레딧이 환불되었습니다.",
      "line3_app_error_startAndSourceRequired": "시작 이미지와 원본 동영상이 필요합니다",
      "line3_app_error_startImageFor512": "512p 해상도를 사용하려면 시작 이미지를 추가하세요",
      "line3_app_error_deleteCreation": "이 작품을 삭제할까요?",
      "line3_app_error_diamondsInsufficient": "이 작업을 수행하기에는 다이아몬드 잔액이 부족합니다.",
      "line3_app_status_generationFinalizing": "생성 마무리 중...",
      "line3_app_status_fileImported": "파일 가져옴",
      "app.status.newProject": "새 프로젝트를 시작했습니다!",
      "line3_app_status_videoLoaded": "🎬 스튜디오에 동영상이 로드되었습니다!",
      "line3_app_status_imageLoaded": "🖼️ 스튜디오에 이미지가 로드되었습니다!",
      "line3_app_ui_seedanceOperation": "원본 동영상 작업:",
      "line3_app_ui_extend": "연장",
      "line3_app_ui_modify": "수정",
      "line3_app_ui_seedanceExtendHelp": "연장: 원본 동영상을 추가한 다음 마지막 프레임 이후에 일어날 일을 프롬프트에 설명하세요. 선택한 길이는 추가되는 시간입니다.",
      "line1_app_file_kind_image": "이미지",
      "line1_app_file_kind_video": "동영상",
      "line1_app_file_kind_audio": "오디오 파일",
      "line1_app_file_kind_other": "이 파일",
      "line1_app_status_prepareImage": "이미지 준비 중",
      "line1_app_status_stageVideo": "동영상 장면 구성 중",
      "line1_app_prompt_seedanceExtendSource": "동영상이 끝난 뒤 이어질 내용을 설명하세요… (예: 장면을 5초 더 이어가기…)",
      "line1_app_prompt_seedanceEditSource": "동영상에서 변경할 부분과 그대로 유지할 부분을 정확히 설명하세요…",
      "line1_app_prompt_veoExtendSource": "동영상의 마지막 프레임 이후에 일어날 일을 설명하세요…",
      "line1_app_prompt_veoEditSource": "동영상에서 변경할 부분과 그대로 유지할 부분을 설명하세요…",
      "line1_app_prompt_minimaxExtendSource": "마지막 프레임 이후 동영상을 어떻게 이어갈지 설명하세요…",
      "line1_app_prompt_minimaxEditSource": "나머지는 유지하면서 동영상에서 변경할 내용을 설명하세요…",
      "line1_app_prompt_pixverseSourceChanges": "원본 동영상에 적용할 변경 사항과 유지할 요소를 설명하세요…",
      "line1_app_video_hailuoProLimit": "⚠️ PRO 모드: 최대 6초",
      "line1_app_video_hailuoStandardLimit": "✅ 표준 모드: 최대 10초",
      "line1_app_audio_nativeEnabled": "기본 오디오 사용",
      "line1_app_audio_nativeDisabled": "기본 오디오 사용 안 함",
      "line1_app_settings_high": "높음",
      "line1_app_settings_systemInstruction": "시스템 지침",
      "line1_app_settings_optional": "선택 사항",
      "line1_app_settings_referenceVideoTitle": "참조 동영상",
      "line1_app_settings_referenceVideo": "참조 동영상 {{number}}",
      "line1_app_settings_oneVideoMaximum": "선택 사항 · 최대 1개",
      "line1_app_settings_chooseVideo": "동영상 선택",
      "line1_app_settings_visualStyle": "시각 스타일",
      "line1_app_settings_imageQualityFastLow": "빠름 / 낮음",
      "line1_app_settings_imageQualityHigh": "높음",
      "line1_app_settings_moderationStandard": "표준",
      "line1_app_settings_moderationLessRestrictive": "덜 엄격함",
      "line3_app_settings_referenceImages": "참조 이미지",
      "line1_app_references_maxImagesH3": "참조 이미지 최대 9개",
      "line1_app_references_referenceAppearanceHelp": "인물, 사물 또는 배경의 외형을 안내합니다.",
      "line1_app_references_selectedImagesCount": "선택한 이미지 {{count}}개",
      "line1_app_references_referenceVideos": "참조 동영상",
      "line1_app_references_videoFormatsLimit": "MP4 또는 MOV — 원본 동영상 포함 최대 3개",
      "line1_app_references_referenceImageSlot": "이미지 {{number}}",
      "line1_app_references_referenceVideoSlot": "동영상 {{number}}",
      "line1_app_references_addMedia": "추가",
      "line1_app_references_imageFormatsMaximum": "이미지 형식 · 최대 {{max}}개 파일",
      "line1_app_references_removeReferenceImage": "참조 이미지 {{number}} 제거",
      "line1_tutorial_tab_guide": "📘 작성 가이드",
      "line1_tutorial_tab_resources": "📚 자료",
      "line1_tutorial_tab_prompts": "✨ 바로 복사할 프롬프트",
      "line1_cost_full_hd_diamonds": "Full HD 모드: 다이아몬드",
      "line1_cost_end_image": "마지막 이미지",
      "line1_cost_ai_audio": "AI 오디오",
      "line3_app_ui_seedanceEditHelp": "편집: 원본 동영상을 추가하고 변경할 내용과 유지할 요소를 설명하세요. 편집된 동영상은 원본 길이를 유지합니다.",
      "line4_badge_text_to_image": "텍스트 → 이미지",
      "line4_badge_image_to_image": "이미지 → 이미지",
      "line4_badge_up_to_16_refs": "참조 최대 16개",
      "line4_badge_up_to_9_refs": "참조 최대 9개",
      "line4_badge_up_to_14_images": "이미지 최대 14개",
      "line4_badge_one_reference_video": "참조 동영상 1개",
      "line4_badge_adjustable_reasoning": "추론 설정 가능",
      "line4_badge_adjustable_quality": "품질 조절 가능",
      "line4_badge_adjustable_moderation": "모더레이션 조절 가능",
      "line4_badge_safety_tolerance": "안전 허용치 0–5",
      "line4_badge_text_to_video": "텍스트 → 동영상",
      "line4_badge_image_to_video": "이미지 → 동영상",
      "line4_badge_reference_images": "참조 이미지",
      "line4_badge_reference_video": "참조 동영상",
      "line4_badge_reference_audio": "참조 오디오",
      "line4_badge_edit_video": "동영상 편집",
      "line4_badge_extend_video": "동영상 연장",
      "line4_badge_up_to_3_videos": "동영상 최대 3개",
      "line4_badge_up_to_3_audio": "오디오 최대 3개",
      "line4_badge_up_to_9_images": "이미지 최대 9개",
      "line4_badge_start_end_images": "시작 / 종료 이미지",
      "line4_badge_native_audio_lipsync": "네이티브 오디오 및 립싱크",
      "line4_badge_audio": "오디오",
      "line4_badge_multishot": "멀티 샷",
      "line4_badge_4_30_seconds": "4–30초",
      "line4_badge_4_15_seconds": "4–15초",
      "line4_badge_4_12_seconds": "4–12초",
      "line4_badge_1_15_seconds": "1–15초",
      "line4_tutorial_model_title": "{{model}} 튜토리얼 — 가이드, 동영상 및 프롬프트",
      "line4_prompt_characters": "자",
      "line4_remove_media": "{{media}} {{number}} 제거",
      "line5_prompt_veo_extend": "원본 영상의 마지막 프레임에서 자연스럽게 이어 7초를 추가하세요. 인물은 숲길을 계속 걷다가 햇살이 비치는 공터로 들어갑니다. 동일한 인물, 의상, 환경, 조명, 카메라 움직임과 영화적 스타일을 유지하세요. 갑작스러운 컷 없이 매끄럽게 연결하세요.",
      "line5_prompt_veo_edit": "원본 영상에서 조명만 변경하여 낮 장면을 부드러운 푸른 달빛이 비치는 영화적인 밤 장면으로 바꾸세요. 인물, 행동, 환경, 구도, 카메라 움직임과 시각적 연속성을 그대로 유지하세요. 다른 것은 변경하지 마세요.",
      "line5_prompt_seedance_extend": "@Video1의 마지막 프레임 직후부터 5초 동안 자연스럽게 이어가세요. 인물은 계속 걸어 공터로 들어갑니다. 동일한 인물, 의상, 배경, 조명, 카메라 움직임과 시각적 스타일을 유지하세요. 갑작스러운 컷이나 인물 정체성의 변화 없이 매끄럽게 연결하세요.",
      "line5_prompt_seedance_edit": "@Video1에서 조명만 변경하여 낮 장면을 부드러운 달빛이 비치는 영화적인 밤 장면으로 바꾸세요. 인물과 움직임, 배경, 구도, 카메라 움직임 및 원래 길이를 유지하세요. 다른 것은 변경하지 마세요.",
      "line6_suggestions_video_1_prompt": "세밀한 갑옷을 입은 외로운 사무라이가 키 큰 풀이 덮인 언덕에 서서 멀리 일본 도시 위로 펼쳐진 강렬한 붉은 석양을 바라본다. 강한 바람에 옷과 풀이 흔들린다. 서사적이고 쓸쓸한 분위기, 빛나는 구름이 있는 극적인 하늘. 카메라는 사무라이 뒤의 미디엄 샷에서 시작해 빠르고 부드럽게 뒤로 이동하며 계곡과 도시를 드러낸 뒤, 인물을 중심으로 약 180도 궤도 회전하며 영화적인 장면을 마무리한다. 대비가 강한 골든아워 조명, 사실적인 렌즈 플레어, 영화적 심도, 초현실적 렌더링, 일본 블록버스터 영화 스타일.",
      "line6_suggestions_video_2_prompt": "보라색 머리의 젊은 사이버펑크 여성이 비에 젖은 활기찬 한국 골목을 걷는다. 젖은 아스팔트 위를 천천히 걷는 부츠의 익스트림 클로즈업으로 시작하고, 웅덩이에 다채로운 네온이 반사된다. 카메라는 발걸음을 따라 부드럽게 뒤로 이동한다. 1초 뒤 다리, 전술 장비, 낡은 코트를 따라 점차 위로 올라간다. 그녀는 손을 주머니에 넣은 채 자신 있게 걷는다. 카메라가 얼굴까지 올라가며 빛나는 한글 간판, 맨홀에서 피어오르는 수증기, 배경의 행인들이 보이는 골목 전체를 드러낸다. 사실적인 사이버펑크 분위기, 자연스러운 움직임, 영화적 조명과 심도, 젖은 바닥의 반사, 초현실적인 8K 영화 품질과 극도로 세밀한 묘사.",
      "line6_suggestions_video_3_prompt": "깊고 어두운 안개 낀 숲의 밤, 공포에 질린 여성이 죽은 나무와 뒤엉킨 가지 사이로 구불구불 이어지는 좁고 진흙투성이인 길을 전속력으로 달린다. 옷은 더럽고 찢어졌으며 얼굴에는 땀과 진흙, 두려움이 묻어 있다. 그녀는 짙은 안개를 가르는 손전등을 꽉 쥔다. 현실적인 달리기 동작과 정확한 발 디딤, 체중 이동, 미세한 호흡, 자연스럽게 반응하는 머리카락과 옷을 보여준다. 슬로모션은 사용하지 않는다. 지면 가까운 극적인 로우 앵글 트래킹 샷으로 시작해 그녀가 렌즈를 향해 달려오게 하고, 젖은 뿌리와 진흙 튀김, 부러진 가지가 전경을 빠르게 스쳐 지나간다. 손전등 빛이 나무 사이를 훑으며 움직이는 그림자와 입체적인 안개 조명을 만든다. 도주가 이어지면 카메라는 부드럽게 상승하고 뒤로 물러나 점점 높은 항공 시점으로 전환되어 광활하고 고립된 숲을 드러낸다. 여자는 어둠 속 작은 실루엣이 된다. 장대한 항공 촬영, 흘러가는 짙은 안개, 사실적인 대기 원근감, 나뭇잎 사이로 스며드는 달빛. 초현실적인 공포 스릴러 분위기, 영화적 조명, 사실적인 손전등 빛과 카메라 움직임, 풍부하게 묘사된 숲과 젖은 지면 반사, HDR, 지속적인 긴장감, 할리우드 장편 영화 수준의 8K 디테일.",
      "line6_suggestions_video_4_prompt": "울창한 숲이 경기용 레이스 코스로 변한 공간에서 펼쳐지는 역동적인 영화 장면. 세밀하게 표현된 의인화된 토끼 두 마리가 좁은 흙길에서 전력 질주한다. 파란 티셔츠와 배낭을 착용한 흰 토끼가 앞서고, 빨간 티셔츠를 입은 회색 토끼가 강한 승부욕을 드러내며 바짝 뒤쫓는다. 전문 레이싱 카메라처럼 약간 흔들리는 초고속 지면 로우 앵글 전진 트래킹 샷. 속도감을 강조하고 팔다리에는 모션 블러를 넣으며 발걸음마다 먼지와 흙 입자가 튄다. 길 양옆에는 무성한 식물이 있고, 얕은 심도로 배경의 동물 관중은 흐릿하게 보인다. 익스트림 스포츠 스타일, 결승전의 열기, 나무 사이로 들어오는 극적인 황금빛, 고예산 3D 애니메이션 수준의 사실감, 극도의 긴장감과 에너지.",
      "line6_suggestions_video_5_prompt": "외로운 우주비행사가 지구 위 깊은 우주에서 떠다닌다. 광활한 우주와 지구의 곡선, 화면 중앙의 작은 우주비행사를 보여주는 초광각 샷으로 시작한다. 카메라는 부드럽고 빠르게 우주비행사에게 다가간다. 가까워질수록 우주복의 세부가 드러나고 태양빛이 헬멧 바이저에 반사된다. 중간 거리에서 카메라는 우주비행사를 중심으로 180도 궤도 이동하며 뒤편의 지구와 별이 가득한 우주를 차례로 보여준다. 완벽하게 안정된 움직임, 설득력 있는 무중력, 사실적인 우주 조명과 물리적 반사, IMAX 품질, 극도의 사실감, 영화적 심도, 8K, 대형 우주 다큐멘터리 스타일, 자연스러운 모션 블러, 초정밀 디테일, 장엄하고 사색적인 분위기.",
      "line7_suggestions_video_6_prompt": "애니메이션 스타일: 한 여성이 공원 벤치에 앉아 있다. 고양이가 그녀의 무릎 위로 올라오고, 여성이 고양이를 부드럽게 쓰다듬는다.",
      "line7_suggestions_video_7_prompt": "초현실적인 장면: 약간 어질러진 고급 호텔 객실. 금발 여성이 침대에 앉아 있으며, 검은 화장이 눈 주변을 넓게 덮고 있다. 카메라는 천천히 앞으로 이동해 지쳐 보이는 그녀의 얼굴을 클로즈업한다.",
      "line7_suggestions_video_8_prompt": "움직이며 흐르는 황금빛 액체, 자기장 같은 파동, 고급스러움, 추상적인 3D 아트.",
      "tutorials": {
        "image": {
          "gpt_image2": {
            "objective": "중요한 요소를 유지하면서 정밀한 이미지를 만들거나 기존 이미지를 편집합니다.",
            "features": [
              "최대 16개의 참조 이미지.",
              "인물, 의상, 배경, 색상, 스타일 등 각 참조 이미지의 역할을 지정합니다.",
              "변경할 부분과 유지할 부분을 명확히 설명합니다."
            ],
            "steps": [
              "참조 영역에 필요한 이미지를 추가합니다. 얼굴, 의상, 배경, 스타일 등 각 이미지의 역할을 지정합니다.",
              "참조 이미지를 어떻게 조합할지 설명합니다.",
              "구도, 조명, 재질, 유지할 세부 요소를 지정합니다.",
              "편집할 때는 변경하지 말아야 할 요소를 명시합니다.",
              "결과를 확인하고 수정이 필요한 부분만 다듬습니다."
            ],
            "prompt": "이미지 1은 [주제/정체성]의 주요 참조로 사용합니다. 이미지 2는 [의상/색상/스타일], 이미지 3은 [배경/구도] 참조로 사용합니다(가능한 경우). [원하는 결과]를 만드세요. [유지할 요소]는 보존하고 [변경할 요소]만 수정하세요. 구도: [프레이밍]. 조명: [조명]. 재질과 세부 사항: [세부 사항]. 요청하지 않은 요소를 추가하지 말고 전체 일관성을 유지하세요."
          },
          "flux2pro": {
            "objective": "구도를 제어하고 세부 묘사를 정교하게 표현하며 참조 이미지의 일관성을 유지합니다.",
            "features": [
              "최대 9개의 참조 이미지.",
              "구도, 재질, 시각적 일관성을 제어하는 데 적합합니다.",
              "주제, 색상 팔레트, 질감, 배경 참조를 구분합니다."
            ],
            "steps": [
              "선명하고 서로 보완하는 참조 이미지를 최대 9개 추가합니다.",
              "주제, 색상, 재질, 환경 등 각 참조의 역할을 지정합니다.",
              "구도와 요소들의 배치를 설명합니다.",
              "질감, 조명, 유지할 세부 사항을 지정합니다.",
              "구도나 재질을 조정해야 하면 프롬프트를 수정합니다."
            ],
            "prompt": "이미지 1은 주요 주제와 실루엣 참조로 사용합니다. 이미지 2는 색상 팔레트와 재질, 이미지 3은 배경과 구도 참조로 사용합니다(가능한 경우). [장면]을 만드세요. 구도: [배치와 카메라 각도]. 재질: [질감]. 조명: [조명]. [중요한 세부 사항]을 유지하세요. 불필요한 물체, 해부학적 불일치, 주체 정체성의 변화를 피하세요.",
            "resourceUrl": "https://runware.ai/models/bfl-flux-2-pro",
            "resourceLabel": "Fiche du modèle sur Runware"
          },
          "nano_banana2_lite": {
            "objective": "여러 시각 참조를 조합하고 필요하면 참조 동영상도 활용해 이미지를 빠르게 만들거나 변환합니다.",
            "features": [
              "최대 14개 이미지와 참조 동영상 1개.",
              "각 참조에 명확한 역할을 지정합니다.",
              "지원되는 모드에서는 동영상 참조로 움직임이나 전체 분위기를 유도할 수 있습니다.",
              "변경할 요소와 유지할 요소를 구분합니다."
            ],
            "steps": [
              "그리드에 최대 14개의 참조 이미지를 추가하고 인물, 사물, 배경, 스타일 등의 역할을 지정합니다.",
              "선택한 모드가 지원하면 참조 동영상을 추가합니다.",
              "참조를 어떻게 결합할지 설명합니다.",
              "변경할 부분과 그대로 둘 부분을 구체적으로 지정합니다.",
              "구도, 조명, 색상, 출력 스타일을 지정합니다.",
              "결과를 확인하고 잘못된 부분만 수정합니다.",
              "모델 정보에서 지원되는 입력 형식을 확인합니다."
              
            ],
            "prompt": "이미지 1은 [주제/정체성], 이미지 2는 [배경/스타일], 이미지 3은 [색상/사물] 참조로 사용합니다(가능한 경우). 지원되면 참조 동영상에서 [움직임/분위기]를 참고하세요. [목표 결과]를 만드세요. [유지할 특징]을 보존하고 [요청한 변경]만 적용하세요. 구도: [구도]. 조명: [조명]. 스타일: [스타일].",
            "resourceUrl": "https://runware.ai/models/google-nano-banana-2-lite",
            "resourceLabel": "Fiche du modèle sur Runware"
          }
        },
        "video": {
          "default": {
            "objective": "선택한 동영상 엔진의 시작 안내입니다.",
            "features": [
              "Ovortex에 표시된 옵션을 해당 엔진의 기준으로 삼으세요."
            ],
            "steps": [
              "사용 가능한 옵션에 따라 텍스트→동영상 또는 이미지→동영상을 선택합니다.",
              "명확한 동작 하나와 장소를 설명합니다.",
              "샷 크기, 카메라 움직임, 조명, 분위기를 지정합니다.",
              "이미지를 사용한다면 유지해야 할 시각적 특징을 명시합니다.",
              "첫 결과를 생성한 뒤 결과에 맞춰 프롬프트를 다듬습니다."
            ],
            "prompt": "동영상 계획: [주제]가 [장소]에서 [구체적인 동작]을 수행합니다. 구도: [샷 유형]. 카메라: [움직임]. 조명: [조명]. 분위기: [톤]. 길이: [시간]. [연속성 유지 요소]를 보존합니다. 자연스러운 움직임과 일관된 물리 표현, 불필요한 컷이나 추가 인물 없음."
          },
          "veo3.1": {
            "objective": "Veo 3.1: 참조 이미지, 기본 오디오 및 지원되는 소스 동영상 작업으로 장면을 제어합니다.",
            "features": [
              "Veo 패널에서 최대 3개의 참조 이미지로 인물, 사물, 배경의 외형을 유도할 수 있습니다.",
              "기본 오디오는 선택한 모드에 따라 제공됩니다.",
              "소스 동영상 작업은 Ovortex에서 활성화된 옵션에 따라 달라집니다.",
              "시각적 연속성을 위해 구체적으로 설명하세요."
            ],
            "steps": [
              "최대 3개의 참조 이미지를 추가하고 인물, 배경, 사물 등의 역할을 정합니다.",
              "촬영 가능한 연속 동작으로 장면을 설명합니다.",
              "필요하면 카메라, 샷 크기, 조명, 소리 또는 대사를 지정합니다.",
              "소스 동영상을 작업할 때는 바꾸려는 부분만 설명합니다.",
              "인물 정체성, 의상, 환경의 연속성을 확인합니다."
            ],
            "prompt": "[시간] 길이의 영화적 장면을 만드세요: [인물/주제]가 [배경]에서 [동작]을 수행합니다. 참조 1: [인물 외형] 유지. 참조 2: [배경] 안내. 참조 3: [사물/스타일] 안내. 카메라: [움직임]. 조명: [조명]. 오디오: [필요한 소리/대사]. 연속성과 자연스러운 움직임을 유지하세요."
          },
          "veo3.1_fast": {
            "objective": "Veo 3.1 Fast: 프롬프트와 최대 3개의 참조 이미지로 동영상을 빠르게 만듭니다.",
            "features": [
              "Veo 패널에서 최대 3개의 참조 이미지를 사용할 수 있습니다.",
              "아이디어를 빠르게 반복 테스트하기 위한 모델입니다.",
              "동작을 단순하고 명확하게 설명하세요.",
              "참조 이미지로 외형을 일관되게 유지하세요."
            ],
            "steps": [
              "빠르게 시안을 만들려면 이 모델을 선택합니다.",
              "주요 동작 하나와 장소 하나를 설명합니다.",
              "필요하면 참조 이미지 최대 3개를 추가합니다.",
              "구도, 카메라 움직임, 조명을 지정합니다.",
              "결과를 확인하고 프롬프트를 조정합니다."
            ],
            "prompt": "영화적 클립: [주제]가 [장소]에서 [단일 동작]을 수행합니다. 참조를 사용해 [외형/사물/스타일]을 유지하세요. 샷: [구도]. 카메라: [움직임]. 조명: [조명]. 분위기: [분위기]. 자연스러운 움직임과 일관된 세부 묘사."
          },
          "seedance25": {
            "objective": "Seedance 2.5: 다양한 멀티모달 참조로 동영상을 구성하거나 소스 동영상을 편집·연장합니다.",
            "features": [
              "모드에 따라 참조 이미지 최대 30개, 동영상 10개, 오디오 파일 10개를 사용할 수 있습니다.",
              "각 참조에 명확한 목적을 지정합니다.",
              "지원되는 모드에서는 소스 동영상 편집 또는 연장이 가능합니다.",
              "Ovortex에서 선택한 모드와 입력 유형을 확인하세요."
            ],
            "steps": [
              "참조 기반 프로젝트에는 인물, 의상, 소품, 장소 이미지를 추가합니다.",
              "지원되면 움직임이나 카메라 표현을 위한 동영상 참조를 추가합니다.",
              "선택한 모드가 지원하는 경우에만 오디오 참조를 추가합니다.",
              "시간 순서와 각 참조의 역할을 설명합니다.",
              "편집 또는 연장 시 유지할 부분과 바꿀 부분을 명시합니다."
            ],
            "prompt": "제공된 미디어를 사용해 [길이]의 시퀀스를 만드세요. 인물 참조: [정체성과 의상 이미지]. 배경 참조: [장소 이미지]. 움직임 참조: [동영상과 동작]. 오디오 참조: [사용 가능한 소리]. 순서: [동작 단계]. 카메라: [움직임]. 인물, 의상, 조명, 연속성을 유지하고 [요청한 편집]만 적용하세요."
          },
          "seedance20": {
            "objective": "Seedance 2.0: 이미지, 동영상, 오디오 참조를 함께 사용해 생성을 제어합니다.",
            "features": [
              "이미지 최대 9개, 동영상 3개, 오디오 3개, 전체 최대 12개 파일.",
              "이미지는 인물, 소품, 장소를 안내할 수 있습니다.",
              "지원되는 모드에서는 동영상으로 움직임, 오디오로 소리를 안내할 수 있습니다.",
              "프롬프트에서 각 참조의 역할을 명확히 지정하세요."
            ],
            "steps": [
              "인물, 소품, 배경 이미지를 추가하고 지원되면 움직임 동영상과 오디오를 추가합니다.",
              "선택 모드의 파일 제한을 지킵니다.",
              "프롬프트에 각 참조의 역할을 적습니다.",
              "동작을 시간 순서대로 명확하게 설명합니다.",
              "인물 정체성, 움직임, 오디오의 일관성을 확인합니다."
            ],
            "prompt": "참조 미디어의 역할에 따라 일관된 동영상을 만드세요: 이미지 1=[인물], 이미지 2=[배경], 이미지 3=[사물/스타일], 동영상 1=[움직임], 오디오 1=[지원되는 경우 소리]. 동작: [시퀀스]. 카메라: [움직임]. 인물과 시각 스타일의 일관성을 유지하세요."
          },
          "seedance": {
            "objective": "Seedance 1.5 Pro: 기본 오디오와 립싱크가 포함된 클립 또는 시작·끝 이미지 기반 전환을 만듭니다.",
            "features": [
              "기본 오디오와 립싱크는 Ovortex에 표시된 엔진 설정에 따라 달라집니다.",
              "지원되는 모드에서는 시작 이미지와 끝 이미지로 전환을 유도할 수 있습니다.",
              "대사, 감정, 말하는 타이밍을 구체적으로 지정하세요."
            ],
            "steps": [
              "인물, 필요한 대사나 소리, 동작을 명확한 순서로 설명합니다.",
              "정확한 대사는 따옴표 안에 씁니다.",
              "감정, 말하기 리듬, 카메라 움직임을 지정합니다.",
              "시작·끝 이미지를 사용한다면 원하는 전환을 설명합니다.",
              "말과 동작이 동기화되는지 확인합니다."
            ],
            "prompt": "오디오 동기화 장면: [인물]이 [배경]에 있습니다. [동작]을 하며 “[정확한 대사]”를 [감정]과 [말하기 리듬]으로 말합니다. 카메라: [움직임]. 소리: [환경음/효과음]. 자연스러운 립싱크, 외형의 일관성, 응집력 있는 장면을 유지하세요."
          },
          "kling2.6": {
            "objective": "Kling 2.6 Pro: 엔진 설정에 따라 움직임을 제어한 Full HD 클립과 오디오를 생성합니다.",
            "features": [
              "Ovortex 설정 길이: 1080p에서 5초 또는 10초.",
              "이미지→동영상에서는 주제가 선명하게 보이는 이미지가 도움이 됩니다.",
              "읽기 쉬운 하나의 연속 동작을 설명하세요."
            ],
            "steps": [
              "이미지→동영상에는 윤곽이 뚜렷한 선명한 이미지를 선택합니다.",
              "시작부터 끝까지의 동작을 설명합니다.",
              "카메라 움직임과 주변 환경의 반응을 지정합니다.",
              "인물, 얼굴, 의상, 배경의 일관성을 유지합니다.",
              "서로 관련 없는 여러 동작을 한 번에 요구하지 마세요."
            ],
            "prompt": "입력 이미지를 기준으로 인물 정체성, 얼굴, 의상, 배경을 유지하세요. [주제]가 [하나의 연속 동작]을 수행합니다. 카메라: [움직임]. 환경: [반응]. 조명: [조명]. 자연스러운 물리 표현, 안정된 외형, 부드러운 움직임."
          },
          "kling26_motion": {
            "objective": "Kling 2.6 Motion Control: 참조 동영상의 움직임을 이미지 속 인물에 적용합니다.",
            "features": [
              "주요 입력은 움직임 소스 동영상과 애니메이션화할 인물 이미지입니다.",
              "인물의 몸이 잘 보이는 이미지가 움직임 전이에 유리합니다.",
              "인물의 정체성과 신체 비율을 유지하세요."
            ],
            "steps": [
              "중요한 팔다리가 잘리지 않도록 가능한 한 전신이 보이는 인물 이미지를 불러옵니다.",
              "옮길 움직임이 담긴 소스 동영상을 추가합니다.",
              "이미지와 동영상의 자세 및 구도가 호환되는지 확인합니다.",
              "유지해야 할 외형 특징을 설명합니다.",
              "신체 비율과 움직임의 연속성을 확인합니다."
            ],
            "prompt": "소스 동영상의 움직임을 참조 이미지의 인물에 적용하세요. 정체성, 얼굴, 의상, 신체 비율을 유지하세요. 소스 움직임을 최대한 충실하게 따르세요. 배경과 시각 스타일을 유지하고 부자연스러운 변형 없이 자연스럽게 움직이세요."
          },
          "kling30": {
            "objective": "Kling 3.0: 시작 이미지와 끝 이미지를 함께 사용하면 양 끝을 제어하는 장면이나 시퀀스를 만들 수 있습니다.",
            "features": [
              "카탈로그에서 제공하는 길이: 3~15초.",
              "지원되는 경우 시작 이미지와 끝 이미지로 전환을 안내할 수 있습니다.",
              "두 상태를 연결하는 중간 동작을 설명하세요."
            ],
            "steps": [
              "시작점에 따라 텍스트 또는 이미지 모드를 선택합니다.",
              "클립의 시작과 끝을 제어하려면 두 이미지를 추가합니다.",
              "주제가 초기 상태에서 최종 상태로 이동하는 과정을 설명합니다.",
              "카메라 움직임, 조명, 속도를 지정합니다.",
              "전환이 연속적이고 인물 정체성이 유지되는지 확인합니다."
            ],
            "prompt": "시작 이미지에서 끝 이미지로 자연스럽게 이어지는 전환을 만드세요. [주제]가 [동작]을 수행해 [초기 상태]에서 [최종 상태]로 이동합니다. 카메라: [움직임]. 속도: [템포]. 조명: [조명]. 인물 정체성을 유지하고 물리적으로 자연스러운 부드러운 전환을 만드세요."
          },
          "hailuo": {
            "objective": "Hailuo 2.3: 사실적인 움직임, 표정, 주제의 연속성에 중점을 둡니다.",
            "features": [
              "Ovortex 카탈로그에서는 768p 또는 1080p의 6초, 768p의 10초를 제공합니다.",
              "기존 이미지를 움직일 때는 윤곽이 뚜렷한 이미지가 좋습니다.",
              "동작과 표정을 구체적으로 지정하세요."
            ],
            "steps": [
              "기존 이미지를 애니메이션화한다면 윤곽이 명확한 이미지를 선택합니다.",
              "신체 동작과 의도한 감정을 설명합니다.",
              "머리카락, 옷, 주변 환경이 움직임에 어떻게 반응하는지 지정합니다.",
              "카메라 움직임은 단순하고 목적에 맞게 설정합니다.",
              "표정과 신체 움직임이 자연스러운지 확인합니다."
            ],
            "prompt": "[인물]이 [감정] 표정으로 [신체 동작]을 수행합니다. 머리카락, 의상, 주변 요소가 자연스럽게 반응합니다. 카메라: [움직임]. 조명: [조명]. 사실적인 표정, 자연스러운 신체 움직임, 일관된 외형."
          },
          "minimax_h3": {
            "objective": "MiniMax H3: 해당 옵션이 제공되는 경우 멀티모달 참조와 세밀한 장면 제어를 활용합니다.",
            "features": [
              "카탈로그에서 선택 가능한 길이는 4~15초입니다.",
              "이미지 참조로 인물 정체성이나 배경을 안내합니다.",
              "동영상과 오디오 입력은 선택한 모드에 따라 달라집니다.",
              "참조의 역할과 동작 타이밍을 명확히 하세요."
            ],
            "steps": [
              "선택 모드가 지원하는 범위에서 이미지로 정체성이나 배경을, 동영상·오디오로 관련 요소를 안내합니다.",
              "시퀀스를 시간 순서대로 설명합니다.",
              "카메라, 조명, 속도를 지정합니다.",
              "유지할 세부 사항을 명시합니다.",
              "장면 전체의 연속성을 확인합니다."
            ],
            "prompt": "[길이]의 시퀀스를 만드세요. 주제: [인물/사물]. 이미지 참조는 [정체성/배경], 동영상 참조는 [움직임], 지원되는 경우 오디오 참조는 [소리]에 사용합니다. 동작: [시간 순서]. 카메라: [움직임]. 연속성, 시각적 정체성, 자연스러운 움직임을 유지하세요."
          },
          "pixverse6": {
            "objective": "PixVerse V6: 스튜디오에서 제공되는 길이, 품질, 멀티샷 구성 및 창작 설정을 조정합니다.",
            "features": [
              "제공 길이: 1~15초.",
              "멀티샷 구성으로 동작의 각 단계를 별도 샷으로 나눌 수 있습니다.",
              "스튜디오에서 사용 가능한 품질 및 창작 설정을 선택합니다.",
              "샷 사이의 연속성을 유지하세요."

            ],
            "steps": [
              "샷 수와 동작 수에 맞춰 길이를 선택합니다.",
              "각 샷의 목적이 분명하도록 장면을 나눕니다.",
              "각 샷의 구도와 카메라 움직임을 지정합니다.",
              "샷 사이의 동작과 시각적 연속성을 설명합니다.",
              "최종 타이밍과 전환을 확인합니다."
            ],
            "prompt": "멀티샷 시퀀스: 샷 1 — [주제와 동작], 구도 [구도]. 샷 2 — [동작의 전개], 카메라 [움직임]. 샷 3 — [최종 결과], 구도 [구도]. 인물, 의상, 배경, 조명의 연속성을 유지하세요. 길이: [시간]. 스타일: [스타일]."
          }
        }
      }
    ,
      "engineAnnotations": {
              "kling26_motion": "참조 동영상의 움직임을 이미지 속 인물에 전송",
              "kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
              "hailuo": "초현실적인 움직임",
              "pixverse6": "PixVerse V6 — 360p~1080p, 1~15초, 오디오 및 멀티샷",
              "seedance25": "Seedance 2.5 — 이미지·동영상·오디오 참조, 편집 및 확장, 4~30초",
              "seedance20": "Seedance 2.0 — 참조 이미지 최대 9장, 동영상 3개, 오디오 3개",
              "seedance": "네이티브 오디오 및 립싱크 동기화",
              "gpt_image2": "이미지 생성 및 편집, 참조 이미지 최대 16장",
              "flux2pro": "FLUX.2 Pro — 참조 이미지 최대 9장을 활용한 편집",
              "nano_banana2_lite": "빠른 이미지 생성 및 편집, 참조 이미지 최대 14장"
      }}
  },
  "ja": {
    "translation": {
      "line3_app_ui_audio": "音声",
"line3_app_ui_remix": "リミックス",
"line3_app_ui_nativeAudio": "ネイティブ音声",
"line3_app_ui_characterImage": "キャラクター画像",
"line3_app_ui_firstLastFrame": "最初のフレーム＋最後のフレーム",
"line3_app_ui_10s768pOnly": "10秒 — 768pのみ",
      "control_mode_image": "画像",
"control_mode_video": "動画",
"control_mode_remasterise": "リマスター",
      "line3_app_annotation_veo3_1_fast": "Veo 3.1 Fast — 高速動画生成",
"line3_app_annotation_veo3_1": "Veo 3.1 — 高品質な動画生成",
"line3_app_annotation_kling26_motion": "動画の動きを画像に転送",
"line3_app_annotation_kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
"line3_app_annotation_kling26": "Kling 2.6 Pro — 動画生成",
"line3_app_annotation_hailuo": "超リアルな動き",
"line3_app_annotation_minimax_h3": "MiniMax H3 — 動画生成",
"line3_app_annotation_pixverse6": "PixVerse V6 — 360p～1080p、1～15秒、音声とマルチショット",
"line3_app_annotation_seedance25": "Seedance 2.5 — 画像・動画・音声参照、編集と延長",
"line3_app_annotation_seedance20": "Seedance 2.0 — 最大9枚の画像、3本の動画、3つの音声参照",
"line3_app_annotation_seedance": "ネイティブ音声とリップシンク",
"line3_app_annotation_gpt_image2": "画像の生成と編集、最大16個の参照画像",
"line3_app_annotation_flux2pro": "FLUX.2 Pro — 最大9枚の画像を使った編集",
"line3_app_annotation_nano_banana2_lite": "高速な生成と編集、最大14枚の参照画像",
      "seedance available": "Seedance 2.5 利用可能",
      "create instantly": "瞬時に作成。",
      "hero subtitle": "生成AIの力で、あなたのアイデアを高品質なシネマティックビジュアルへ変換します。",
      "generate": "生成",
      "text to image title": "テキストから",
      "cinematic image": "シネマティック画像へ",
      "ai interprets imagination": "AIがあなたの想像力の細部まで解釈します。",
      "generate button": "Generate",
      "model": "モデル",
      "render": "レンダリング",
      "contact": {
        "successTitle": "メッセージを送信しました！",
        "successMessage": "{{name}}様、お問い合わせを受け付けました。",
        "replySoon": "近日中にご返信いたします。",
        "title": "お問い合わせ",
        "subjectLabel": "お問い合わせの種類",
        "subjectInfo": "一般的なお問い合わせ",
        "subjectProblem": "問題を報告する",
        "subjectQuote": "見積もりを依頼する",
        "messageLabel": "メッセージ",
        "messagePlaceholder": "どのようなご用件でしょうか？",
        "back": "戻る",
        "sending": "送信中...",
        "send": "送信",
        "sendError": "送信に失敗しました。もう一度お試しください。"
      },
      "profile": {
        "within30Days": "30日以内",
"validYear": "有効期間1年",
  "back": "戻る",
  "avatarAlt": "プロフィール",
  "accountStatus": "アカウントの状態",
  "lightning": "ライトニングクレジット",
  "nextReset": "次回リセット：",
  "diamonds": "ダイヤモンド",
  "expiration": "有効期限：",
  "validYear": "有効期間1年",
  "changeSubscription": "サブスクリプションを変更",
  "subscriptionCancelled": "サブスクリプションを解約しました",
  "cancelling": "解約処理中...",
  "cancelSubscription": "サブスクリプションを解約",
  "contactUs": "お問い合わせ",
  "deleteAccount": "アカウントを削除",
  "irreversible": "取り消せない操作",
  "activeSubscriptionTitle": "有効なサブスクリプションが検出されました：",
  "activeSubscriptionMessage": "アカウントを削除する前に、サブスクリプションを解約する必要があります。",
  "understood": "了解",
  "deleteWarning": "アカウントを削除すると、💎 ダイヤモンド {{diamonds}} 個と ⚡ ライトニングクレジット {{lightning}} 個が完全に失われます。",
  "typeDelete": "確認のため SUPPRIMER と入力してください：",
  "writeHere": "ここに入力...",
  "reconnect": "再ログイン",
  "delete": "削除",
  "cancelTitle": "サブスクリプションの解約",
  "cancelConfirmMessage": "本当にサブスクリプションを解約しますか？支払い済み期間の終了までは特典を引き続き利用できます。",
  "cancel": "キャンセル",
  "confirm": "確認",
  "cancelServerError": "解約サーバーに接続できません。"
},
      "hero prompt 1": "超リアルなシーン：男性が雪だるまに近づくと、突然猫が飛び出して顔を攻撃する...",
      "hero prompt 2": "ニューヨークの街を歩くゾンビたちの超リアルなシーン...",
      "hero prompt 3": "アニメスタイル、短いピンク色の髪の少女がテーブルに座り、オレンジジュースのグラスとイチゴケーキを前にしている。",
      "showcase subtitle": "あなたのテキストが現実になります。AIの力で魅力的な動画を瞬時に作成できます。",
      "showcase prompt 1": "サイバーパンクのストリートマーケット...",
      "showcase prompt 2": "アニメ風の風景...",
      "showcase prompt 3": "自然のマクロショット...",
      "showcase prompt 4": "星雲の中を漂う宇宙飛行士...",
      "showcase prompt 5": "深海で光るクラゲ...",
      "image to video title": "画像から",
      "cinematic video": "シネマティック動画へ",
      "image to video subtitle": "ビジュアルを読み込み、AIにあなたのアイデアへ命を吹き込ませましょう。",
      "source image": "ソース画像",
      "ai result": "AI結果",
      "prompt": "プロンプト",
      "image video prompt 1": "踊るカニ。",
      "image video prompt 2": "困惑したような視線で、迷子になったように見える女性。",
      "image video prompt 3": "疲れ切ったように見える女性の顔へ向かってカメラが前進し、クローズアップする。",
      "image video prompt 4": "この画像をアニメーション化：彼女がタバコを吸いながらカメラを見る。",
      "start end title 1": "最初から最後まで完全な一貫性",
      "start end desc 1": "開始画像と終了画像を設定します。AIが2つのフレーム間の滑らかな遷移全体を生成し、完全な芸術的コントロールを実現します。",
      "start end prompt 1": "2枚の画像間を滑らかに遷移。カメラが動き、犠牲者へ近づいていく。",
      "start end title 2": "滑らかな変身",
      "start end desc 2": "キャラクターや背景を状態Aから状態Bへ、映像の途切れなく変化させます。",
      "start end prompt 2": "2枚の画像間を遷移：彼女は完全に酔った状態で話し、その後顔をしかめて吐く。",
      "start end title 3": "滑らかな変身",
      "start end desc 3": "キャラクターや背景を状態Aから状態Bへ、映像の途切れなく変化させます。",
      "start end prompt 3": "2枚の画像間を遷移：彼女が戦闘態勢に入る。",
      "start image": "開始画像",
      "end image": "終了画像",
      "transition result": "遷移結果",
      "example": "例",
      "capture title": "カメラ動作を精密にコントロール",
      "capture desc": "滑らかなカメラ軌道（ズーム、パン、トラッキング）を設定し、シーンにプロフェッショナルな表現を加えます。",
      "capture prompt": "2枚の画像間をアニメーション化。",
      "motion model": "モーションモデル",
      "camera control result": "カメラコントロール結果",
      "replace title 1": "無限のクリエイティブ自由",
      "replace desc 1": "どんなオブジェクトでも簡単に置き換えられます。写真をアップロードし、イメージを説明するだけで、AIが数秒でリアルな結果を生成します。複雑なツールはもう必要ありません。想像力だけが限界です。",
      "replace prompt 1": "背景の猫を削除",
      "replace title 2": "インテリアデザイン：AI家具",
      "replace desc 2": "空間を簡単に再構築できます。自然な照明を維持しながら、古い家具をモダンな家具に置き換えます。",
      "replace prompt 2": "ストローとレモンを削除。",
      "replace title 3": "自動車：カスタマイズ",
      "replace desc 3": "車両へのあらゆる変更を視覚化できます。色やホイールを非常に高い精度で変更できます。",
      "replace prompt 3": "シャベルを削除",
      "replace photos title": "写真を再構築：あらゆるオブジェクトを置き換え",
      "instant": "瞬時に",
      "replace subtitle": "AIツールを使って不要なオブジェクトを消去し、お好みの要素に置き換えてみましょう。",
      "model example": "モデル",
      "social media title": "ソーシャルメディアで",
      "social media": "注目を集める",
      "social media subtitle": "アイデアをTikTokとInstagram向けのバイラルコンテンツへ変換します。",
      "cutting edge technology": "最先端テクノロジー",
      "advanced engines": "世界で最も",
      "most advanced in world": "高度な生成エンジンを搭載",
      "video": "動画",
      "hybride": "ハイブリッド",
      "image": "画像",
      "texte": "テキスト",
      "faq title": "よくある",
      "faq highlight": "質問",
      "faq question 1": "Eclipseとは何ですか？どのように機能しますか？",
      "faq answer 1": "EclipseはAIを搭載したクリエイティブスタジオで、アイデアをシネマティック作品へ変換します。現在最高クラスの生成エンジンと独自の最適化技術を組み合わせたハイブリッドアーキテクチャを使用しています。",
      "faq question 2": "Eclipseを使用するために技術的な知識は必要ですか？",
      "faq answer 2": "まったく必要ありません。Eclipseは制作を簡単にするために設計されています。シーンを説明するか画像をアップロードするだけで、インターフェースが複雑なエンジン設定を処理し、高品質な結果を生成します。",
      "faq question 3": "どの生成エンジンを使用していますか？",
      "faq answer 3": "1つのモデルに限定せず、Eclipseはリクエストに応じて最適なエンジンを動的に選択します。シネマティックレンダリング、スタイル化されたアニメーション、複雑なカメラ動作など、主要な生成エンジンの性能を活用します。",
      "faq question 4": "生成した動画は自分のものですか？",
      "faq answer 4": "はい。Eclipseで作成したコンテンツのすべての権利を保持できます。ソーシャルメディア、広告、個人プロジェクトなどに制限なく使用できます。",
      "faq question 5": "動画の最大長さはどのくらいですか？",
      "faq answer 5": "現在、4秒から15秒までのクリップを生成できます。拡張機能を使用すると、映像の一貫性を保ちながらシーケンスをさらに延長できます。",
      "cinematic excellence accessible": "誰もが利用できるシネマティックな卓越性。",
      "tools": "ツール",
      "company": "会社",
      "footer terms": "利用規約",
      "footer privacy": "プライバシーポリシー",
      "terms of sale": "販売規約",
      "footer cgv": "販売条件",
      "legal notice": "法的情報",
      "back to top": "トップへ戻る",
      "pricing footer": "料金",
      "community": "コミュニティ",
      "all rights reserved": "All rights reserved.",
      "powered by leading engines": "市場をリードする生成エンジンを搭載しています。",
      "welcome": "Ovortex",
      "continue google": "Googleで続行",
      "continue email": "メールで続行",
      "password": "パスワード",
      "login": "ログイン",
      "register": "アカウント作成",
      "forgot password": "パスワードをお忘れですか？",
      "otp title": "二要素認証",
      "otp subtitle": "メールで受け取った6桁のコードを入力してください。",
      "validate code": "コードを確認",
      "remember device": "このデバイスを30日間記憶する",
      "text to image": "テキストから画像へ",
      "image to video": "画像から動画へ",
      "production soon": "プロダクション (近日公開)",
      "other tools soon": "その他のツール (近日公開)",
      "history": "履歴",
      "pricing": "料金プラン",
      "my account": "マイアカウント",
      "logout": "ログアウト",
      "reset lightning": "ライトニングリセット",
      "validity diamonds": "ダイヤモンド有効期限",
      "under 30 days": "30日以内",
      "valid 1 year": "1年間有効",
      "legend": "レジェンド",
      "elite": "エリート",
      "master": "マスター",
      "standard": "スタンダード",
      "essential": "エッセンシャル",
      "api developer": "API & 開発者モジュール",
      "beginner": "初心者",
      "custom volume title": "カスタム数量",
      "loyalty benefit": "会員特典",
      "applied to order": "注文に適用されます",
      "adjust slider exact amount": "スライダーで正確な数量を選択してください",
      "diamonds": "ダイヤモンド",
      "buy volume": "この数量を購入",
      "unit price": "単価",
      "diamond": "ダイヤモンド",
      "continue apple": "Appleで続行",
      "or": "または",
      "your email": "メールアドレス",
      "create my account": "アカウントを作成",
      "already have account": "すでにアカウントをお持ちですか？",
      "new here": "初めてですか？",
      "create account": "アカウントを作成",
      "reset password": "パスワードをリセット",
      "reset password description": "復旧リンクを受け取るメールアドレスを入力してください。",
      "send link": "リンクを送信",
      "back to login": "ログインに戻る",
      "by continuing you accept": "続行すると、以下に同意したものとみなされます：",
      "terms of use": "利用規約",
      "and": "および",
      "privacy policy": "プライバシーポリシー",
      "allow popups login": "ログインするにはポップアップを許可してください。",
      "google login error": "Googleログイン中にエラーが発生しました。",
      "apple login error": "Appleログイン中にエラーが発生しました。",
      "enter email": "メールアドレスを入力してください",
      "link sent to": "リンクを送信しました：",
      "account not found": "アカウントが見つかりません。",
      "check email": "メールを確認してください。",
      "otp sending error": "OTPコードの送信中にエラーが発生しました。",
      "verification code sent": "確認コードをメールで送信しました。",
      "email already in use": "このメールアドレスはすでにアカウントに登録されています。",
      "invalid email password": "メールアドレスまたはパスワードが正しくありません。",
      "invalid email format": "メールアドレスの形式が正しくありません。",
      "weak password": "パスワードは6文字以上である必要があります。",
      "unexpected error": "エラーが発生しました。もう一度お試しください。",
      "invalid code": "コードが無効です。",
      "code validation error": "コードの確認中にエラーが発生しました。",
      "quick boost title": "すぐにチャージしますか？",
      "subscriber rate active": "購読者料金が適用されています！",
      "exclusive discounts": "限定割引をご利用いただけます",
      "diamonds valid one year": "ダイヤモンドは1年間有効です",
      "popular": "人気",
      "best value": "ベストバリュー",
      "diamond pack spark": "火花",
      "diamond pack supernova": "超新星",
      "diamond pack galaxy": "銀河",
      "diamond pack pulsar": "パルサー",
      "diamond pack quasar": "クエーサー",
      "diamond pack universe": "宇宙",
      "buy": "購入",
      "custom serenity pack": "セレニティパックをカスタマイズ",
      "support type": "サポートタイプ",
      "one time project": "単発プロジェクト",
      "monthly support": "月額サポート（セレニティ）",
      "professional photos": "プロ写真の枚数",
      "ai professional videos": "プロAI動画の本数",
      "social media management": "SNS管理",
      "one time estimate": "単発プロジェクトのお見積り",
      "monthly estimate": "月額のお見積り",
      "per month": "/月",
      "one time": "単発",
      "monthly serenity": "月額（セレニティパック）",
      "hello": "こんにちは、",
      "quote request intro": "カスタムセレニティパックのお見積りを希望します：",
      "type label": "タイプ",
      "photos label": "写真",
      "professional visuals": "プロビジュアル",
      "videos label": "動画",
      "ai sequences": "AIシーケンス",
      "social media label": "SNS",
      "yes included": "はい（含む）",
      "no": "いいえ",
      "estimate label": "お見積り",
      "thank you": "ありがとうございます。",
      "request serenity quote": "セレニティのお見積りを依頼",
      "free analysis 24h": "24時間以内の無料プロジェクト分析",
      "back": "戻る",
      "choose your power": "あなたに合ったパワーを選択",
      "power your creativity": "世界最高峰のAIエンジンでクリエイティビティを加速",
      "monthly": "月額",
      "yearly": "年額",
      "no commitment": "契約期間なし",
      "ideal to test engines": "AIエンジンのお試しに最適",
      "lightnings": "ライトニング",
      "month": "月",
      "reset each month": "毎月リセット",
      "access all engines": "すべてのエンジンにアクセス（パックによる）",
      "optimized prompt": "プロンプト最適化機能",
      "prompt models access": "プロンプトモデルへのアクセス",
      "packs purchase access": "パック購入へのアクセス",
      "explore studio": "スタジオを見る",
      "best value quality price": "最高のコストパフォーマンス",
      "hd image flux": "高解像度画像：Flux Dev / Schnell",
      "hd video engines": "高解像度動画：HD & FULL HD",
      "up to 33 videos or 300 images": "最大HD動画33本または画像300枚",
      "subscribe now": "今すぐ登録",
      "most popular": "最も人気",
      "all image video engines hd": "すべての画像・動画エンジン HD & FULL HD",
      "up to 77 videos or 700 images": "最大HD動画77本または画像700枚",
      "become standard": "Standardにする",
      "plus 60 creative power": "+60% クリエイティブパワー",
      "up to 134 videos or 1200 images": "最大HD動画134本または画像1,200枚",
      "upgrade master": "Masterにアップグレード",
      "ultimate offer": "究極のプラン",
      "for intensive creators": "本格的なクリエイター向け",
      "up to 277 videos or 2500 images": "最大HD動画277本または画像2,500枚",
      "max server priority": "サーバー最優先（待ち時間なし）",
      "join elite": "Eliteに参加",
      "premium agency": "プレミアムエージェンシー",
      "ultimate tool pro studios": "プロスタジオのための究極のツール",
      "up to 888 videos or 8000 images": "最大HD動画888本または画像8,000枚",
      "become legend": "Legendになる",
      "concierge": "コンシェルジュ",
      "zero effort pro result": "手間ゼロ、プロ品質の結果",
      "quote": "お見積り",
      "project": "プロジェクト",
      "we prompt for you": "プロンプトを代わりに作成します",
      "high quality image video": "高品質な画像・動画生成",
      "upscale pro retouching": "プロ向けアップスケール・レタッチ込み",
      "contact us": "お問い合わせ",
      "recharge on demand": "または必要なときにチャージ",
      "subscription diamonds note": "サブスクリプションのライトニングは毎月リセットされます。購入したダイヤモンドは1年間有効です。",
      "request sent": "リクエストを送信しました！",
      "request received": "情報を受け取りました。できるだけ早くご連絡します。",
      "quote request": "見積り依頼",
      "information": "お問い合わせ",
      "report problem": "問題を報告",
      "request details placeholder": "ご依頼内容を入力してください...",
      "cancel": "キャンセル",
      "sending": "送信中...",
      "send": "送信",
      "login required diamonds": "ダイヤモンドを購入するにはログインしてください。",
      "login required subscription": "購読するにはログインしてください。",
      "tutorialUi": {
        "academyImage": "OVORTEX ACADEMY · 画像",
        "academyVideo": "OVORTEX ACADEMY · 動画",
        "stepGuide": "📘 ステップガイド",
        "promptExample": "✨ プロンプト例",
        "featuresTitle": "このモデルの機能",
        "stepByStep": "ステップガイド",
        "tip": "ヒント：結果を改善する要素を把握するため、一度に一つだけ変更してください。",
        "resources": "ドキュメントとリソース",
        "resourcesPending": "このモデルの確認済み動画リソースを準備中です。公式リンクがある場合は、モデルのドキュメントを参照してください。",
        "engineDocs": "モデルのドキュメント",
        "promptHint": "角括弧内をアイデアに置き換えてください。このテンプレートを出発点として、追加した画像やオプションに合わせて調整してください。",
        "imagePromptHint": "角括弧内の指示をアイデアに置き換えてください。画像番号はパネルに追加した参照画像と一致させてください。",
        "copied": "コピーしました！",
        "copyUnavailable": "このブラウザーではコピーできません。上のテキストを選択してください。",
        "copyUnavailableImage": "コピーできません。テキストを選択してコピーしてください。",
        "copyPrompt": "📋 プロンプトをコピー",
        "usePrompt": "生成欄で使用",
        "promptCopied": "プロンプトをコピーしました！",
        "aboutEngine": "このモデルについて",
        "recommendedSteps": "おすすめの手順",
        "seeExample": "プロンプト例を見る →",
        "closeTutorial": "チュートリアルを閉じる",
        "videoPromptHint": "角括弧内を動画の詳細に置き換えてください。",
        "modelOptionsMayVary": "利用できる設定はモデルによって異なる場合があります。外部動画ではなく、Ovortexに実際に表示されるオプションを確認してください。"
      },
      "suggestions": {
        "image": {
          "1": {
            "title": "サイバーパンク都市",
            "prompt": "ネオンと映画的な照明に彩られた、未来のサイバーパンク版セントラルパーク。8K、超精細。"
          },
          "2": {
            "title": "スナイパー",
            "prompt": "雪迷彩服を着た狙撃手が、高山の深い雪の中に伏せている。極めてリアル、地面すれすれの視点、ライフルに鋭く合った焦点、過酷で敵対的な冬の雰囲気、高地の厳しい光。"
          },
          "3": {
            "title": "夕日",
            "prompt": "岩の上のカニが、浜辺に沈む夕日を眺めている。浜辺にはわずかにぼかした焦点を合わせる。"
          },
          "4": {
            "title": "都市廃墟での戦闘",
            "prompt": "超リアルなシーン。青い髪の戦術的な女性が廃墟となった建物の中に着地する。鋭く集中した眼差しを向け、観客に銃を構えるあいだ、ジャケットが空中になびいている。"
          },
          "5": {
            "title": "夜のペントハウスの女性",
            "prompt": "映画的なアニメイラスト。夜の豪華なモダン・ペントハウスのオフィスに全身で立つ女性の敵役が、ピストルをカメラへまっすぐ向ける。支配的で威圧的なポーズ、強いローアングル、洗練された黒いスーツジャケット、襟元を少し開けた体にフィットする黒いシャツ、仕立ての良い黒いパンツ、ベルトの控えめな金属チェーン、ポケットに入れた片手、短い黒のレイヤーカット、光る赤い目、青白い肌、冷静で断固とした表情。ドラマチックな照明、顔と髪の超リアルな細部、光沢のある黒い大理石の床、背景に重役用デスクと革張りの椅子、夜景に輝く街を見渡す巨大な窓、表面のリアルな反射。暗く洗練されたネオノワールの雰囲気、映画的な影、リアルなアニメ調、傑作級の品質、極めてシャープ、ボリュームライト、被写界深度、高コントラスト、プロのコンセプトアート、8K、アクションスリラーの空気感。"
          },
          "6": {
            "title": "アニメ",
            "prompt": "アニメ調。長く波打つ金髪と黄金色の瞳を持つ若い女性が、緑色の木製公園ベンチの中央に座っている。包帯を巻き、金色のボタンと赤黒のスカーフが付いた暗い制服の上に緑のジャケットを開いて着ている。袖には赤いバッジが見える。白いプリーツスカートの上、膝に手を置いている。公園に座り、真剣な表情で見る人をまっすぐ見つめる。"
          },
          "7": {
            "title": "満月の下の島",
            "prompt": "複数のライトアップされた塔を持つ美しい伝統的なアジアの寺院が、景色全体を映す完全に静かな湖のほとりに建っている。巨大な黄金の満月が空を支配し、水面に丸ごと反射する。壮大な山の谷と垂直にそびえる崖は霧に包まれる。オレンジ、赤、金色の暖かな秋の森が寺院を囲む。光る提灯が神秘的で温かな雰囲気を作り、映画的な霧が山々の間を漂う。曲線を描く屋根、彫刻された木材、伝統的な照明を備えた精緻なアジア建築。平穏で幻想的、精神性のある雰囲気。ボリュームライト、繊細な光線、水面の超リアルな反射、完璧な左右対称構図、自然な被写界深度、豊かでコントラストのある色彩、極限のフォトリアリズム、超精細な傑作、シネマティックなファンタジー風景、HDR、グローバルイルミネーション、レイトレーシング、Unreal Engine品質、8K、極めてシャープ、精緻な質感、プロの風景写真、息をのむパノラマ、黄金の月光、リアルな霧、受賞級の写真。"
          },
          "8": {
            "title": "3D",
            "prompt": "赤いベルベットと精巧な金の装飾で覆われ、紋章模様やライオン像で飾られた巨大な王座。青と金の宝石をはめ込んだ王冠をかぶった威厳あるネズミが、王のように王座で安らかに眠り、前足の間に王笏をそっと持っている。舞台は巨大な石のアーチ、記念碑的な柱、床に散らばる瓦礫がある古代ゴシック大聖堂の廃墟。強い光の筋が高い窓を通り、神聖でドラマチックな雰囲気の中でネズミと王座を照らす。光の中にほこりが舞う。ベルベット、彫刻木材、古い石、ネズミの毛並みを超精細な質感で描く。映画的な雰囲気、リアルな中世ファンタジー、極端な写実性、自然な被写界深度、ボリュームライト、レイトレーシング、HDR、グローバルイルミネーション、Unreal Engine 5品質、超リアルな傑作、精緻な8K、シネマティックファンタジー、ドラマチックな照明、受賞級の写真。"
          },
          "9": {
            "title": "水中への没入",
            "prompt": "画面右側に横向きで立つ日本の侍が、決意に満ちた目で地平線を見つめる。黒髪は伝統的な髷に結い、薄いひげ、豊かな質感の暗い着物、腰には刀が見える。背後には結晶のような水と半透明の流体だけでできた精神的な分身が現れる。水の人物は反転して反対方向を向き、強い視覚的対比を生む。波、しぶき、液体の糸、空中に浮かぶ水滴で形作られたシルエット。青、濃紺、灰色、白のインク、水彩効果、絵の具の飛沫からなる抽象的な背景。神秘的で精神的、瞑想的な雰囲気。顔、髪、布、水の極細部を強調したドラマチックな映画照明。リアルな反射、完璧な透明感、超精細な質感、高級感のある芸術的構図、写実的なコンセプトアート、傑作、超リアル、映画的・ボリューム照明、ファンタジーリアリズム、8K、HDR、シャープな焦点、受賞級のデジタルアート。"
          },
          "10": {
            "title": "不気味な森",
            "prompt": "暗く深い森を恐怖に駆られた女性が走っている。濃い霧が枯れ木や折れた枝を包み、ホラー・スリラーの雰囲気を作る。懐中電灯の光が霧を切り裂き、パニックに陥った顔と泥、格闘の跡に覆われた体を照らす。走り、自然の障害物を抜けたことで衣服は破れ汚れている。ドラマチックな光、息苦しい雰囲気、湿気とリアルな森の地面、細かな葉や枝。背が高く細い木々、自然な被写界深度、顔・衣服・地面の超精細な質感。映画的なホラー・スリラー写真、超リアル、HDR、8K、高コントラスト、極端な写実性、光と影を巧みに表現。"
          },
          "11": {
            "title": "マガジン",
            "prompt": "1960年代のクリーム色のクラシックカーのボンネットに自信たっぷりに座る金髪女性。ドラマチックなローアングル。上品な緑のジャンプスーツとベージュの編み上げミリタリーブーツを着用。片脚をレンズに向かって伸ばし、靴底を前景で目立たせる。真剣な表情でカメラをまっすぐ見る。まばらなヤシの木が並ぶ道路、黄金色の夕日、カリフォルニアの雰囲気。ビンテージカーのクローム車体にリアルな反射。映画的な被写界深度、顔・服・車の極めてシャープな細部。自然なゴールデンアワー照明、柔らかな影、リアルな色、高級ファッション写真、プロの構図、超リアル、8K、HDR、極端なフォトリアリズム、精細な肌の質感、24mm広角レンズ、高級雑誌品質。"
          },
          "12": {
            "title": "背景の統合",
            "prompt": "写真を編集し、濃いグレーのコートと長いフォレストグリーンのプリーツスカートを追加する。ポーズ：舗装された小道に立ち、片手をコートのポケットに入れ、カメラに少し体を向けた優雅な姿勢。背景：秋のセントラルパーク。オレンジと金色の葉をつけた木々が景色を囲み、奥にはニューヨークの高層ビル群が見える。雰囲気：地面に落ち葉と数枚の本のページが散らばり、詩的で物憂げな空気を作る。追加要素：左上の小さな額縁風インセットに、別角度から撮影した同じ女性の顔のクローズアップを配置する。"
          },
          "13": {
            "title": "マーケティング",
            "prompt": "緑の瞳を持つ金髪女性の超リアルなビューティーポートレート。カメラを見つめる強い眼差し、自然なそばかす、艶のあるバーガンディ色の唇。高級プロメイク、顔の近くにピンクの口紅を持ち、上品な赤い爪と金のイヤリングを身につける。ドラマチックな赤い照明、贅沢でグラマラスな雰囲気、リアルな質感の輝く肌、プレミアム化粧品写真、メイクブランド広告、映画的な被写界深度、極細部、写実性、ファッション誌品質、プロスタジオ、8K、超精細。"
          },
          "14": {
            "title": "水彩画の肖像",
            "prompt": "高品質の水彩風ロゴ。正面を向いた力強くカラフルなキツネの頭、単色の背景。Yukisakura作、鮮やかで豊かな美しい色彩、正方形フォーマット。"
          },
          "15": {
            "title": "サイバーパンクの女性",
            "prompt": "ディストピア的なサイバーパンクの未来。小柄でか弱く、傷つきやすそうな若い韓国人女性が、小さなサイバーパンク都市の通りを歩く。短く乱れた紫色の髪には光るネオンのアクセントがある。カーゴパンツ、破れたクロップトップ、ロングコートなど、ひどく使い古された服を着ている。左太ももの上部にはストラップでサイバーデッキが固定されている。顔には疲労、消耗、深い無力感が表れている。"
          }
        },
        "video": {
          "1": {
            "title": "黄昏",
            "typeStyle": "マンガ",
            "prompt": "精密な鎧をまとった孤独な侍が、背の高い草の丘に立ち、遠くの日本の街を照らす鮮烈な赤い夕日を見つめる。強風で衣服と草が揺れる。叙事詩的で物悲しい雰囲気、明るく輝く雲のあるドラマチックな空。侍の背後からのミディアムショットで始まり、カメラが素早く滑らかに後退して谷と街を見せ、その後、侍の周囲を約180度ゆるやかに回り込んで映画的に締めくくる。コントラストの強いゴールデンアワーの光、リアルなレンズフレア、映画的な被写界深度、日本の大作映画のような超リアルな映像。"
          },
          "2": {
            "title": "未来的",
            "typeStyle": "サイバーパンク",
            "prompt": "紫色の髪の若いサイバーパンク女性が、雨に濡れた活気ある韓国の路地を歩く。濡れたアスファルトをゆっくり踏むブーツの極端なクローズアップから始め、水たまりにカラフルなネオンが反射する。足取りに合わせてカメラが滑らかに後退する。1秒後、脚、タクティカル装備、使い込まれたコートに沿ってカメラが徐々に上昇する。彼女は手をポケットに入れて自信ありげに歩き続ける。顔まで上昇しながら、光る韓国語の看板、排水口から立ち上る蒸気、背景の通行人を含む路地全体を映す。リアルなサイバーパンクの雰囲気、自然な動き、映画的な照明、現実的な被写界深度と濡れた地面の反射、超リアル、8K、映画品質、極めて精細。"
          },
          "3": {
            "title": "不気味な森",
            "typeStyle": "リアル",
            "prompt": "真夜中の暗く霧深い森の中、恐怖におびえた女性が、枯れ木や絡み合う枝の間を曲がりくねる狭い泥道を全速力で走る。服は汚れて破れ、顔には汗と泥、恐怖が浮かぶ。懐中電灯を強く握り、光の筋で濃い霧を切り裂く。自然でリアルな走り、正確な足運びと重心移動、かすかな呼吸、動きに自然に反応する髪と衣服。スローモーションなし。地面すれすれのドラマチックなローアングル追跡ショットから始まり、濡れた木の根、泥しぶき、折れた枝が前景を素早く流れる。懐中電灯の光が木々を横切り、動く影と霧の中のボリュメトリックな光を作る。逃走が続くとカメラは徐々に上昇しながら滑らかに後退し、ローアングルの追跡から次第に高い空撮へ移行する。広大で孤立した森が現れ、女性は闇の中の小さなシルエットとなる。漂う濃霧、樹冠を通る月光、リアルな空気遠近、ホラー・スリラーの映画照明、自然なカメラ移動、濡れた地面の反射、フォトリアルな質感、HDR、持続する緊張感、ハリウッド大作級の8K、没入感のある恐怖演出。"
          },
          "4": {
            "title": "レース",
            "typeStyle": "3D",
            "prompt": "密林を競技コースに変えた、非常にダイナミックな映画的ショット。精密に描かれた擬人化ウサギ2匹が、狭い土の小道で全力疾走する。青いTシャツとリュックの白いウサギが先頭を走り、赤いTシャツの灰色のウサギが僅差で追う。両者の表情には強い決意がある。地面近くの低い位置から、非常に速い前進トラッキング撮影。プロのレースカメラのようなわずかな揺れ。スピードを強調し、手足にモーションブラーを加え、走るたびに砂ぼこりや土の粒子が舞う。両側には豊かな植物、背景には被写界深度でぼけた動物の観客。エクストリームスポーツ風、決勝戦の雰囲気、木々の間から差すドラマチックな金色の光、大作アニメ映画のような超リアルな3D、最大限の緊張感とエネルギー。"
          },
          "5": {
            "title": "宇宙飛行士",
            "typeStyle": "宇宙",
            "prompt": "孤独な宇宙飛行士が地球の上の深宇宙に浮かんでいる。宇宙の広大さ、地球の曲線、画面中央の小さな宇宙飛行士を見せる極端なワイドショットから始まる。カメラは滑らかかつ素早く前進する。近づくにつれて宇宙服の細部が見え、バイザーに太陽光が反射する。ミディアム距離でカメラが宇宙飛行士の周囲を180度回り、背景の地球から星が広がる宇宙空間へと順に見せる。完全に安定した動き、説得力のある無重力、リアルな宇宙照明と物理的な反射、IMAX品質、極めて写実的、映画的な被写界深度、8K、大作宇宙ドキュメンタリー風、自然なモーションブラー、超精細な描写、壮大で瞑想的な雰囲気。"
          },
          "6": {
            "title": "公園",
            "typeStyle": "アニメ",
            "prompt": "アニメ調。公園のベンチに座る女性の膝に猫が乗り、女性が優しく撫でる。"
          },
          "7": {
            "title": "リアル",
            "typeStyle": "リアル",
            "prompt": "超リアルなシーン。少し散らかった豪華なホテルの部屋で、金髪の女性がベッドに座っている。目の周りの大部分を黒いメイクで覆っている。カメラがゆっくり前進し、疲れ切った表情の顔をクローズアップする。"
          },
          "8": {
            "title": "山岳風景",
            "typeStyle": "映画",
            "prompt": "動く黄金色の流体、磁気の波、ラグジュアリー、抽象的な3Dアート。"
          },
          "9": {
            "title": "ネオノワール・アニメ",
            "typeStyle": "アニメ",
            "prompt": "シネマティックなアニメイラスト。夜の豪華なモダン・ペントハウスのオフィスに、女性の敵役が全身で立ち、拳銃をカメラにまっすぐ向けている。支配的で威圧的な姿勢、強いローアングル。彼女が前進するにつれて、カメラは歩調に合わせて後退する。上品な黒いスーツジャケット、襟元が少し開いた黒いシャツ、細身の黒いパンツ、ベルトの控えめな金属チェーン、ポケットに入れた片手、短い黒髪のグラデーションカット、光る赤い目、青白い肌、冷静で決然とした表情。ドラマチックな照明、顔と髪の精細な描写、光沢のある黒い大理石の床、役員用デスク、革張りの椅子、夜景に輝く都市を望む巨大な窓。表面にリアルな反射が映り、その後カメラが顔へズームする。暗く洗練されたネオノワール、映画的な影、リアルなアニメ調、傑作級の品質、極めてシャープ、ボリューメトリック照明、被写界深度、高コントラスト、プロ仕様のコンセプトアート、8K、アクションスリラーの雰囲気。"
          },
          "10": {
            "title": "不気味な人形",
            "typeStyle": "ホラー",
            "prompt": "廃墟となったヴィクトリア朝の古い屋敷。破れた壁紙、宙に舞うほこり、クモの巣、映画的な照明がある暗く荒れた部屋。ひびの入った恐ろしい磁器人形が、部屋の中央にある古いベルベットの肘掛け椅子にじっと座っている。カメラは広角から徐々に近づく。窓から弱い月明かりが差し込み、揺れるろうそくが壁に動く影を落とす。人形のもつれた髪が風でわずかに揺れる。最後の2秒で、人形の頭が異様で不気味な動きでゆっくりカメラを向き、目がレンズを追っているように見える。息苦しい雰囲気、心理ホラー、超リアル、ハリウッド映画品質、ボリューメトリック照明、映画的な被写界深度、極細部、4K、16:9。"
          },
          "11": {
            "title": "移動カメラ",
            "typeStyle": "リアル",
            "prompt": "新雪で完全に覆われた庭を夜間に撮影した、超リアルな監視カメラ映像。固定された白黒赤外線カメラの画面に、わずかなデジタルノイズ、圧縮アーティファクト、画面隅のタイムスタンプが映る。庭の中央には大きな雪だるまが動かず立っている。男が雪の中を雪だるまへ向かって歩き、足跡を残す。1メートル以内に近づいた瞬間、猫が雪だるまの中から猛烈な速さで飛び出し、男の顔へ飛びかかる。男は驚いて叫びながら激しく後ずさる。カメラはぎこちない動き、本物の監視映像らしい画質、不穏な雰囲気で出来事を記録する。リアルな夜間照明、自然な影、写真のように精密な描写、シネマティック4K、実際の防犯カメラが捉えた不可解な現象のバイラル動画風。"
          },
          "12": {
            "title": "海",
            "typeStyle": "3D",
            "prompt": "岩の上のカニが浜辺の夕日を眺めている。浜辺にはわずかにぼかしがかかっている。"
          },
          "13": {
            "title": "攻撃",
            "typeStyle": "リアル",
            "prompt": "超リアルで映画的な場面。巨大なゾンビの群れが深夜のタイムズスクエアを襲う。何百人ものパニック状態の市民が四方へ逃げ、ゾンビが明るい通りを追いかける。放置車両、衝突、爆発、叫び声、混乱が街を終末の世界へ変える。ダイナミックなカメラ、慌ただしい動き、大作ディザスター映画の雰囲気、リアルな都市照明、写真のような細部、4K。壮大な最後のニューヨーク空撮では、街全体が燃え、巨大な黒煙が地平線を覆い、複数の地区が火災で破壊されている。終末的な雰囲気、炎の赤い光、大規模な破壊、超リアルな描写。最後は煙と炎に包まれた荒廃したニューヨークの川岸からの映像。ヘリコプターが危機に陥った街の上空を飛び、爆発が地平線を照らす。世界の終わりのような雰囲気、壮大な映画撮影、極めて精細な描写、4K、ハリウッド大作映画風。"
          },
          "14": {
            "title": "火山",
            "typeStyle": "アニメーション",
            "prompt": "大規模な火山噴火が起きる緑豊かな先史時代の世界を描く、超リアルな映画的ショット。カメラは非常に密度が高く精細なジャングルを上空から広く映して始まる。地上の恐竜（Tレックス、トリケラトプス、竜脚類）が一斉に顔を上げ、遠くで噴火する火山を見つめる。溶岩が噴き上がり、巨大な火山灰の雲が広がる壮大な爆発。ドラマチックな空を翼竜が飛ぶ。豊かな植生、湿ったジャングル、ボリューメトリックな霧、夕方の黄金色の光。カメラは滑らかに前進し、火山へわずかに旋回する。大作映画風、超リアル、映画的な被写界深度、4K。"
          },
          "15": {
            "title": "シネマティック",
            "typeStyle": "シネマティック",
            "prompt": "荒廃した古い家の暗く放置された廊下に固定されたカメラ。奥の窓から弱い自然光が差し、カーテンがわずかに揺れる。汚れて破れたパジャマ姿の40歳前後の女性が、湿った木の床をカメラに向かってゆっくり這ってくる。極度に怯え、荒い息をしながら震えている。突然止まり、画面外の何かに追われているかのように、恐怖に満ちた目でゆっくり後ろを振り返る。息苦しい雰囲気、静けさ、徐々に高まる緊張。カメラは固定され、手持ち撮影のような微かな揺れだけがある。超リアルなホラー映画風、冷たい光、映画フィルムの粒子、4K、浅い被写界深度、重苦しく不気味な雰囲気。10秒間、ゆっくり途切れない動きで、最後に後ろを振り返る瞬間まで緊張が高まる。"
          }
        }
      },
      "tutorialResourceLabels": {
        "seedance20": "モデルの概要と情報",
        "hailuo": "Hailuo 2.3 公式紹介",
        "kling2_6": "Kling公式ガイド（2.6ガイドを含む）",
        "kling26_motion": "Klingとモーションコントロールの公式ガイド",
        "kling30": "Kling 3.0公式ガイド",
        "veo3_1": "Veo 3.1公式ガイド",
        "veo3_1_fast": "Veo 3.1公式ガイド",
        "minimax_h3": "MiniMax動画ガイド",
        "seedance25": "Seedance実践ガイド",
        "seedance": "Seedanceシリーズのドキュメント",
        "hailuoTitle": "Hailuo 2.3 — 動画チュートリアル",
        "seedance20Title": "Seedance 2.0 初心者向け完全チュートリアル"
      },
      "app": {
        "style": {
          "realistic": "リアル",
          "cyberpunk": "サイバーパンク",
          "anime": "アニメ",
          "watercolor": "水彩画",
          "animation3d": "3Dアニメーション"
        },
        "prompt": {
          "aiDiscussion": "AIディスカッション",
          "creative": "クリエイティブプロンプト",
          "askQuestion": "質問してください...",
          "describeIdea": "アイデアを詳しく説明してください..."
        },
        "optimize": {
          "analyzing": "⏳ 分析中...",
          "button": "✨ 最適化"
        },
        "upload": {
          "load": "📁 アップロード",
          "fileLimits": "ファイルごとの上限：画像20MB・動画64MB・音声20MB。"
        },
        "status": {
          "generationFinalizing": "生成を完了しています...",
          "fileLoading": "ファイルを読み込んでいます...",
          "fileImported": "インポートしたファイル",
          "generatingOnModel": "⏳ {{model}}で生成中...",
          "priorityMax": "⚡ 優先度最大：{{model}}がすぐに応答します...",
          "videoLoaded": "🎬 動画をスタジオに読み込みました！",
          "imageLoaded": "🖼️ 画像をスタジオに読み込みました！",
          "newProject": "新しいプロジェクトを開始しました！"
        },
        "error": {
          "selectCharacterImage": "キャラクターの画像を選択してください。",
          "importMotionVideo": "動きの参照動画をアップロードしてください。",
          "generation": "生成中にエラーが発生しました。",
          "falTimeout": "Fal.aiのリクエストがタイムアウトしました。",
          "securityUnavailable": "セキュリティ確認を利用できません。ページを更新して、もう一度お試しください。",
          "videoUnavailable": "処理は完了しましたが、動画を利用できません。もう一度お試しください。",
          "sessionExpired": "セッションの有効期限が切れました。再ログインしてからお試しください。",
          "notLoggedIn": "エラー：ログインしていないか、セッションの有効期限が切れています。",
          "hailuo512Image": "Hailuo 512 には開始画像が必要です。画像を追加してください。",
          "hailuo512Title": "開始画像が必要です",
          "insufficientCredits": "クレジットが不足しています。この生成には{{price}} 💎が必要です。",
          "motionImages": "このモデルで必要なモーション参照画像を追加してください。",
          "technicalGeneration": "生成中に技術的なエラーが発生しました。もう一度お試しください。",
          "deleteFailed": "項目を削除できませんでした。",
          "deleteServerFailed": "サーバー上で項目を削除する際にエラーが発生しました。",
          "fileTooLarge": "ファイル「{{fileName}}」は{{label}}の上限{{maxSize}}を超えています（ファイルサイズ：{{actualSize}}）。",
          "fileTooLargeSimple": "ファイル「{{fileName}}」は{{label}}の上限{{maxSize}}を超えています。",
          "fileUploadFailed": "ファイル「{{fileName}}」をアップロードできませんでした。",
          "serverRequestFailed": "リクエストに失敗しました（サーバーエラー {{status}}）。少し待ってから再試行してください。",
          "rateLimited": "短時間にリクエストが多すぎます。少し待ってから再試行してください。",
          "requestTimeout": "リクエストがタイムアウトしました。もう一度お試しください。"
        },
        "history": {
          "noDescription": "説明なし",
          "remix": "リミックス",
          "title": "生成履歴",
          "remixButton": "リミックス",
          "editButton": "編集",
          "editVideoTitle": "この動画を編集"
        },
        "insufficient": {
          "diamondsMessage": "この操作を行うためのダイヤモンド残高が不足しています。",
          "buyDiamonds": "🛒 ダイヤモンドを購入",
          "subscribeOrBuy": "🚀 購読またはダイヤモンドを購入",
          "stayStudio": "スタジオに戻る",
          "cost": "今回の生成コスト：{{cost}}",
          "diamonds": "利用可能なダイヤモンド：{{count}}",
          "tokens": "利用可能なボルト：{{count}}",
          "tokensHelp": "ボルトはサブスクリプションに含まれ、ダイヤモンドは別途購入します。"
        },
        "edit": "編集",
        "settings": {
          "pixverseAdvanced": "詳細オプション",
          "pixverseDescription": "生成のスタイル、テンポ、一貫性をカスタマイズします。",
          "multiShot": "マルチショット／アングル変更",
          "multiShotHelp": "1本の動画に複数のショットを使用できます。",
          "visualStyle": "ビジュアルスタイル",
          "automatic": "自動",
          "clay": "粘土",
          "comic": "コミック",
          "thinkingLevel": "思考レベル",
          "enhanced": "強化",
          "fast": "高速",
          "random": "ランダム",
          "negativePrompt": "ネガティブプロンプト",
          "negativePromptExample": "例：ぼやけ、アーティファクト、不自然な動き、歪んだ文字…",
          "addImages": "画像を追加",
          "addVideos": "動画を追加",
          "addAudios": "音声を追加",
          "referenceImage": "参照画像 {{number}}",
          "referenceVideo": "参照動画 {{number}}",
          "referenceAudio": "参照音声 {{number}}",
          "imageEditPrecise": "精密編集",
          "guidedComposition": "構図ガイド",
          "multipleReferences": "複数の参照",
          "addReferenceImages": "参照画像を追加",
          "imageLimitReached": "画像の上限に達しました",
          "chooseFiles": "クリックしてパソコンからファイルを選択",
          "referencesAdded": "追加済みの参照",
          "removeImageHint": "×をクリックして画像を削除",
          "noImageReferences": "画像は追加されていません。参照画像は任意で、プロンプトのみでも生成できます。",
          "engineSettings": "モデル設定",
          "outputFormat": "出力形式",
          "optionalSeed": "任意のシード",
          "imageQuality": "GPT Image 2 の品質",
          "moderation": "モデレーション",
          "standard": "標準",
          "lessRestrictive": "制限を緩和",
          "safetyTolerance": "安全許容度 (0～5)",
          "thinking": "思考",
          "minimalFaster": "最小・高速",
          "temperature": "温度 (0～2)",
          "topP": "Top P (0～1)",
          "systemInstruction": "システム指示",
          "optional": "任意",
          "generalInstructions": "従うべき一般的な指示…",
          "referenceVideoNote": "生成される静止画の参考になりますが、結果を動画にはしません。",
          "chooseVideo": "動画を選択",
          "videoAdded": "動画を追加しました",
          "usedAsVisualReference": "画像の視覚的な参照として使用されます。",
          "referenceTip": "ヒント：プロンプトで各画像の役割と、維持・変更する要素を指定してください。",
          "tutorialEngine": "モデルのチュートリアル",
          "seedOptional": "Seed — 任意",
          "negativePromptLabel": "ネガティブプロンプト",
          "avoidElements": "— 避ける要素"
        },
        "video": {
          "existingOperations": "既存動画の操作",
          "extend": "動画を延長",
          "edit": "動画を編集",
          "extendDescription": "最後のフレーム以降の展開を記述してください。長さと結果は選択したモデルによって異なります。",
          "editDescription": "変更したい内容と、維持する要素を指定してください。",
          "importSourceFirst": "これらの操作を使うには、まずメディアパネルに元動画を読み込んでください。",
          "changeAppearance": "外観を変更 · AIフィルターと照明",
          "addSourceForVeo": "Veo の「{{operation}}」モードを有効にするには、元動画を追加してください。",
          "describeIdea": "アイデアを詳しく説明してください…",
          "characters": "{{count}}文字",
          "changeAppearanceLabel": "AIフィルターと照明",
          "extendGuideTitle": "動画を延長する方法",
          "editGuideTitle": "動画を編集する方法",
          "extendOrEditGuideTitle": "動画の延長・編集",
          "addSourceSeedance": "まず Seedance 2.5 パネルで元動画を追加し、「動画を延長」または「動画を編集」を選択してください。",
          "extendSeedanceHelp": "最後のフレーム以降に続く動作、登場する要素、追加する秒数を記述してください。人物、背景、カメラワークの一貫性を保ってください。",
          "editSeedanceHelp": "変更する点と維持する点を明確に指定してください。意図しない変更を避けるため、人物、動き、構図、元の長さを維持するよう記述してください。",
          "useExtendExample": "延長の例を使用",
          "useEditExample": "編集の例を使用",
          "characterCount": "{{count}}文字"
        },
        "audio": {
          "ai": "AIオーディオ",
          "included": "音声を含む",
          "native": "ネイティブ音声",
          "soundDesign": "サウンドデザイン",
          "unavailable": "音声は利用できません",
          "referenceDialogue": "参照音声と台詞",
          "referenceHelp": "音声のガイドには最大3つの音声ファイルを使用できます。参照パネルに画像または動画も追加してください。開始／終了フレームのスロットだけでは参照音声を使用できません。",
          "remove": "削除",
          "exactDialogue": "読み上げる正確な台詞（任意）",
          "dialogueExample": "例：「私たちは今すぐ出発しなければならない」と人物が話す。",
          "referenceLimit": "音声は声や話し方の参考になりますが、録音を完全に再現するものではありません。参照ファイルは合計12個まで、参照音声と動画の合計は15秒以内です。",
          "promptExpansion": "プロンプト拡張",
          "disabledMoreFaithful": "無効（忠実さを優先）",
          "balanced": "バランス",
          "qualityPriority": "品質優先",
          "seedOptional": "任意の Seed"
        },
        "badge": {
          "new": "新規",
          "startEnd": "開始＋終了",
          "topArena": "Top Arena"
        },
        "cancel": "キャンセル",
        "cost": {
          "diamonds": "ダイヤモンド",
          "diamondsLower": "ダイヤモンド",
          "tokens": "ボルト",
          "tokensLower": "ボルト",
          "total": "合計コスト"
        },
        "defaultImageAlt": "生成された画像",
        "delete": {
          "button": "削除",
          "title": "削除の確認"
        },
        "download": "ダウンロード",
        "duration": "長さ",
        "explorer": {
          "title": "作品を探す"
        },
        "formatStyle": "形式とスタイル",
        "generate": {
          "button": "生成",
          "imageRequired512": "このモデルには512形式の開始画像が必要です。",
          "imageVideoRequired": "続行するには参照画像または動画を追加してください。",
          "inProgress": "生成中…",
          "send": "生成を送信"
        },
        "loading": {
          "generation": "生成を準備中…"
        },
        "mode": {
          "remastered": "リマスター"
        },
        "newDiscussion": "新しい会話",
        "noSelection": "項目が選択されていません",
        "remix": {
          "creative": "クリエイティブ",
          "fidelity": "忠実度",
          "strict": "厳密"
        },
        "resolution": "解像度",
        "security": {
          "sync": "安全な同期中…"
        },
        "slot": {
          "endBlocked": "このモデルは終了画像に対応していません。",
          "endImage": "終了画像",
          "endUnavailable": "終了画像は利用できません",
          "startBlocked": "このモデルは開始画像に対応していません。",
          "startImage": "開始画像",
          "v2vUnavailable": "このモデルでは動画から動画への変換は利用できません。",
          "videoBlocked": "このモデルは元動画に対応していません。",
          "videoSource": "元動画"
        },
        "tip": {
          "kling": {
            "text": "動きとカメラワークを明確に記述してください。",
            "title": "Kling のヒント"
          },
          "luma": {
            "text": "プロンプトを詰め込みすぎず、希望する動きを記述してください。",
            "title": "Luma のヒント"
          },
          "pixverse": {
            "text": "ビジュアルスタイル、テンポ、希望するショット変更を指定してください。",
            "title": "PixVerse のヒント"
          },
          "seedance": {
            "text": "主な動きを記述し、連続する動作に一貫性を持たせてください。",
            "title": "Seedance のヒント"
          },
          "seedance25": {
            "text": "複数のショットでは、各ショットと切り替えを明確に記述してください。",
            "title": "Seedance 2.5 のヒント"
          }
        },
        "waitingCreation": "生成待ち…",
        "references": {
          "imagesTitle": "参照画像",
          "guideText": "作品の被写体、外観、背景、スタイルを指定します。",
          "imageCount": "画像 {{count}} 枚",
          "tutorialButton": "モデルのチュートリアル",
          "addImages": "参照画像を追加",
          "imageLimit": "画像の上限に達しました",
          "chooseFiles": "クリックしてパソコンからファイルを選択",
          "removeToAdd": "画像を削除してから別の画像を追加してください",
          "preciseEditing": "精密編集",
          "guidedComposition": "構図ガイド",
          "multipleReferences": "複数の参照",
          "tutorialEngine": "モデルのチュートリアル",
          "images": "画像"
        }
      },
      "line3_app_ui_referenceImages": "参照画像",
      "line3_app_ui_referenceImagesUpTo3": "参照画像は最大3枚",
      "line3_app_ui_startEndFrames": "開始 / 終了",
      "line3_app_ui_editVideo": "動画を編集",
      "line3_app_ui_extendVideo": "動画を延長",
      "line3_app_ui_imageToVideo": "画像 → 動画",
      "line3_app_ui_videoReference": "参照動画",
      "line3_app_ui_remix": "リミックス",
      "line3_app_ui_characterImage": "キャラクター画像",
      "line3_app_ui_motionControl": "モーション制御",
      "line3_app_ui_textToVideo": "テキスト → 動画",
      "line3_app_ui_referenceImageCount": "参照画像 1～9枚",
      "line3_app_ui_referenceVideoCount": "参照動画 1～3本",
      "line3_app_ui_referenceAudioCount": "参照音声 1～3件",
      "line3_app_ui_generativeAudio": "生成音声",
      "line3_app_ui_thinkingLevel": "推論レベル",
      "line3_app_ui_multimodalReferences": "マルチモーダル参照 — Seedance",
      "line3_app_ui_seedance25Limit": "モードに応じて画像最大30枚、動画10本、音声10件",
      "line3_app_ui_seedance20Limit": "参照ファイル合計最大12件 · {{count}}/12使用中",
      "line3_app_ui_seedance25Notice": "マルチモーダル参照は開始/終了フレームのスロットと併用できません。動画を編集・延長するには、上のソース動画スロットを使用してください。こちらが参照より優先されます。",
      "line3_app_ui_seedance20Notice": "マルチモーダル参照は開始/終了フレームのスロットと併用できません。ソース動画は動画上限と合計12ファイルの両方に含まれます。ファイルはサーバーのサイズ制限内である必要があります。",
      "line3_app_ui_seedanceCharacterObjects": "人物・物体・背景の画像",
      "line3_app_ui_seedanceNineImages": "出力をガイドする画像は最大9枚",
      "line3_app_ui_seedanceReferenceClips": "ソース動画モードを除く参照クリップ",
      "line3_app_ui_seedanceThreeVideos": "動画は最大3本。ソース動画選択時は2本",
      "line3_app_ui_audioAmbience": "環境音、音声、またはサウンド参照",
      "line3_app_ui_referenceVideoGuidance": "これらの動画は動き、アクション、カメラワークの参考になります。",
      "line3_app_ui_buyDiamonds": "🛒 ダイヤモンドを購入",
      "line3_app_ui_subscribeOrBuyDiamonds": "🚀 購読またはダイヤモンドを購入",
      "line3_app_ui_stayInStudio": "スタジオに戻る",
      "line3_app_error_waitSourceDuration": "コストを正しく計算するため、編集モードを開始する前にソース動画の長さが検出されるまでお待ちください。",
      "line3_app_error_selectCharacterImage": "キャラクター画像を選択してください。",
      "line3_app_error_importMotionVideo": "動きの参照動画を読み込んでください。",
      "line3_app_error_securityUnavailable": "セキュリティ確認を利用できません。ページを更新して再試行してください。",
      "line3_app_error_generation": "生成中にエラーが発生しました",
      "line3_app_error_generationFailed": "生成に失敗しました。",
      "line3_app_error_technicalGeneration": "生成中に技術的な問題が発生しました。",
      "line3_app_error_noResultUrl": "サーバーが結果URLを返さずに終了しました。サーバーログを確認してください。",
      "line3_app_error_insufficientCreditsVideo": "この動画を生成するためのクレジットが不足しています。",
      "line3_app_error_refundTechnical": "技術的な問題が発生しました。後でもう一度お試しください。クレジットは返還されました。",
      "line3_app_error_startAndSourceRequired": "開始画像とソース動画が必要です",
      "line3_app_error_startImageFor512": "512p解像度を使用するには開始画像を追加してください",
      "line3_app_error_deleteCreation": "この作品を削除しますか？",
      "line3_app_error_diamondsInsufficient": "この操作にはダイヤモンド残高が不足しています。",
      "line3_app_status_generationFinalizing": "生成を仕上げています…",
      "line3_app_status_fileImported": "ファイルを読み込みました",
      "app.status.newProject": "新しいプロジェクトを開始しました！",
      "line3_app_status_videoLoaded": "🎬 動画をスタジオに読み込みました！",
      "line3_app_status_imageLoaded": "🖼️ 画像をスタジオに読み込みました！",
      "line3_app_ui_seedanceOperation": "ソース動画の操作：",
      "line3_app_ui_extend": "延長",
      "line3_app_ui_modify": "編集",
      "line3_app_ui_seedanceExtendHelp": "延長：ソース動画を追加し、最後のフレームの後に起こる内容をプロンプトに記述します。選択した長さが追加時間になります。",
      "line1_app_file_kind_image": "画像",
      "line1_app_file_kind_video": "動画",
      "line1_app_file_kind_audio": "音声ファイル",
      "line1_app_file_kind_other": "このファイル",
      "line1_app_status_prepareImage": "画像を準備しています",
      "line1_app_status_stageVideo": "動画シーンを構成しています",
      "line1_app_prompt_seedanceExtendSource": "動画の終了後に何が起こるかを説明してください…（例：シーンを5秒間続ける…）",
      "line1_app_prompt_seedanceEditSource": "動画で変更する部分と、そのまま維持する部分を具体的に説明してください…",
      "line1_app_prompt_veoExtendSource": "動画の最後のフレームの後に何が起こるかを説明してください…",
      "line1_app_prompt_veoEditSource": "動画に加える変更と、維持する内容を説明してください…",
      "line1_app_prompt_minimaxExtendSource": "最後のフレームの後に動画をどう続けるか説明してください…",
      "line1_app_prompt_minimaxEditSource": "ほかの部分を維持しながら、動画で変更する内容を説明してください…",
      "line1_app_prompt_pixverseSourceChanges": "元動画に加える変更と維持する要素を説明してください…",
      "line1_app_video_hailuoProLimit": "⚠️ PROモード：最大6秒",
      "line1_app_video_hailuoStandardLimit": "✅ 標準モード：最大10秒",
      "line1_app_audio_nativeEnabled": "ネイティブ音声オン",
      "line1_app_audio_nativeDisabled": "ネイティブ音声オフ",
      "line1_app_settings_high": "高",
      "line1_app_settings_systemInstruction": "システム指示",
      "line1_app_settings_optional": "任意",
      "line1_app_settings_referenceVideoTitle": "参照動画",
      "line1_app_settings_referenceVideo": "参照動画 {{number}}",
      "line1_app_settings_oneVideoMaximum": "任意・最大1本",
      "line1_app_settings_chooseVideo": "動画を選択",
      "line1_app_settings_visualStyle": "ビジュアルスタイル",
      "line1_app_settings_imageQualityFastLow": "高速／低",
      "line1_app_settings_imageQualityHigh": "高",
      "line1_app_settings_moderationStandard": "標準",
      "line1_app_settings_moderationLessRestrictive": "制限を弱める",
      "line3_app_settings_referenceImages": "参照画像",
      "line1_app_references_maxImagesH3": "参照画像は最大9枚",
      "line1_app_references_referenceAppearanceHelp": "人物、物体、背景の見た目を指定します。",
      "line1_app_references_selectedImagesCount": "選択済み画像 {{count}} 枚",
      "line1_app_references_referenceVideos": "参照動画",
      "line1_app_references_videoFormatsLimit": "MP4またはMOV — 元動画を含め最大3本",
      "line1_app_references_referenceImageSlot": "画像 {{number}}",
      "line1_app_references_referenceVideoSlot": "動画 {{number}}",
      "line1_app_references_addMedia": "追加",
      "line1_app_references_imageFormatsMaximum": "画像形式 · 最大 {{max}} ファイル",
      "line1_app_references_removeReferenceImage": "参照画像 {{number}} を削除",
      "line1_tutorial_tab_guide": "📘 テキストガイド",
      "line1_tutorial_tab_resources": "📚 リソース",
      "line1_tutorial_tab_prompts": "✨ コピーして使えるプロンプト",
      "line1_cost_full_hd_diamonds": "Full HDモード：ダイヤモンド",
      "line1_cost_end_image": "終了画像",
      "line1_cost_ai_audio": "AI音声",
      "line3_app_ui_seedanceEditHelp": "編集：ソース動画を追加し、変更点と維持する要素を記述します。編集後の動画は元の長さを保ちます。",
      "line4_badge_text_to_image": "テキスト → 画像",
      "line4_badge_image_to_image": "画像 → 画像",
      "line4_badge_up_to_16_refs": "参照最大16件",
      "line4_badge_up_to_9_refs": "参照最大9件",
      "line4_badge_up_to_14_images": "画像最大14枚",
      "line4_badge_one_reference_video": "参照動画1本",
      "line4_badge_adjustable_reasoning": "推論設定可能",
      "line4_badge_adjustable_quality": "品質調整可能",
      "line4_badge_adjustable_moderation": "モデレーション調整可能",
      "line4_badge_safety_tolerance": "安全許容度 0–5",
      "line4_badge_text_to_video": "テキスト → 動画",
      "line4_badge_image_to_video": "画像 → 動画",
      "line4_badge_reference_images": "参照画像",
      "line4_badge_reference_video": "参照動画",
      "line4_badge_reference_audio": "参照音声",
      "line4_badge_edit_video": "動画を編集",
      "line4_badge_extend_video": "動画を延長",
      "line4_badge_up_to_3_videos": "動画最大3本",
      "line4_badge_up_to_3_audio": "音声最大3件",
      "line4_badge_up_to_9_images": "画像最大9枚",
      "line4_badge_start_end_images": "開始 / 終了画像",
      "line4_badge_native_audio_lipsync": "ネイティブ音声・リップシンク",
      "line4_badge_audio": "音声",
      "line4_badge_multishot": "マルチショット",
      "line4_badge_4_30_seconds": "4–30秒",
      "line4_badge_4_15_seconds": "4–15秒",
      "line4_badge_4_12_seconds": "4–12秒",
      "line4_badge_1_15_seconds": "1–15秒",
      "line4_tutorial_model_title": "{{model}} チュートリアル — ガイド、動画、プロンプト",
      "line4_prompt_characters": "文字",
      "line4_remove_media": "{{media}} {{number}}を削除",
      "line5_prompt_veo_extend": "元の動画の最後のフレームから自然につなげて、さらに7秒間続けてください。人物は森の小道を歩き続け、日差しの差し込む開けた場所へ入ります。同じ人物、服装、環境、照明、カメラワーク、映画的なスタイルを維持してください。急なカットのない滑らかなつながりにしてください。",
      "line5_prompt_veo_edit": "元の動画の照明だけを変更し、昼の場面を柔らかな青い月明かりに照らされた映画的な夜の場面にしてください。同じ人物、動作、環境、フレーミング、カメラワーク、映像の連続性を維持してください。それ以外は変更しないでください。",
      "line5_prompt_seedance_extend": "@Video1の最後のフレーム直後から、さらに5秒間自然に続けてください。人物は歩き続け、開けた場所へ入ります。同じ人物、服装、背景、照明、カメラワーク、映像スタイルを維持してください。急なカットや人物の同一性の変化がない滑らかなつながりにしてください。",
      "line5_prompt_seedance_edit": "@Video1の照明だけを変更し、昼の場面を柔らかな月明かりの映画的な夜の場面にしてください。人物とその動き、背景、フレーミング、カメラワーク、元の長さを維持してください。それ以外は変更しないでください。",
      "line6_suggestions_video_1_prompt": "精巧な鎧をまとった孤独な侍が、背の高い草に覆われた丘に立ち、遠くの日本の街を染める鮮烈な赤い夕日を見つめる。強い風で衣服と草が揺れる。叙事詩的で哀愁のある雰囲気、明るく輝く雲のあるドラマチックな空。侍の背後からのミディアムショットで始まり、カメラが速く滑らかに後退して谷と街を見せ、その後、人物の周囲を約180度ゆるやかに回り込んで映画的に締めくくる。コントラストの強いゴールデンアワーの光、リアルなレンズフレア、映画的な被写界深度、超リアルな描写、日本の大作映画のスタイル。",
      "line6_suggestions_video_2_prompt": "紫色の髪の若いサイバーパンク女性が、雨に濡れた活気ある韓国の路地を歩く。濡れたアスファルトをゆっくり進むブーツの極端なクローズアップから始め、水たまりに色鮮やかなネオンが映り込む。カメラは足取りに合わせて滑らかに後退する。1秒後、脚、タクティカル装備、使い込まれたコートに沿って徐々に上昇する。彼女は手をポケットに入れ、自信を持って歩き続ける。カメラが顔まで上がり、光る韓国語の看板、マンホールから立ち上る蒸気、背景の通行人を含む路地全体を見せる。リアルなサイバーパンクの雰囲気、自然な動き、映画的な照明と被写界深度、濡れた地面の反射、超リアルな8K映画品質、極めて細かな描写。",
      "line6_suggestions_video_3_prompt": "深い霧に包まれた暗い森の夜、恐怖におびえた女性が、枯れ木や絡み合う枝の間を曲がりくねる狭い泥道を全速力で走る。服は汚れて破れ、顔には汗と泥、恐怖が浮かぶ。濃い霧を切り裂く懐中電灯を強く握る。自然で現実的な走り、正確な足運びと体重移動、かすかな呼吸、動きに自然に反応する髪と服を描く。スローモーションは禁止。地面すれすれのドラマチックなローアングル追跡ショットから始まり、彼女がレンズに向かって走る。濡れた木の根、泥しぶき、折れた枝が前景を素早く横切る。懐中電灯の光が木々をなぞり、動く影と立体的な霧の光を生む。逃走が続くにつれ、カメラは滑らかに上昇しながら後退し、次第に高い空撮へ移行して広大で孤立した森を見せる。女性は闇に消えそうな小さなシルエットになる。壮大な空撮、漂う濃霧、リアルな空気遠近法、樹冠から差し込む月光。超リアルなホラー・スリラーの雰囲気、映画的照明、懐中電灯の現実的な光、自然なカメラワーク、細部まで描かれた森と濡れた地面の反射、HDR、途切れない緊張感、ハリウッド映画級の8Kディテール。",
      "line6_suggestions_video_4_prompt": "密林が競技用コースに変わった場所で繰り広げられる、非常にダイナミックな映画的ショット。精巧に描かれた擬人化したウサギ2匹が、狭い土の道で全力疾走する。青いTシャツとバックパックの白いウサギが先頭を走り、赤いTシャツの灰色のウサギが強い闘志を見せながらすぐ後ろを追う。プロのレース映像のようにわずかに揺れる、地面すれすれの超高速前進トラッキングカメラ。スピード感を強調し、手足にモーションブラーを加え、踏み込むたびに土ぼこりが舞う。道の両側には豊かな植物、背景には被写界深度でぼかされた動物の観客。エクストリームスポーツ風、決勝戦の熱気、木々の間から差し込むドラマチックな黄金色の光、高予算3Dアニメ映画のような超リアルな表現、最大限の緊張感とエネルギー。",
      "line6_suggestions_video_5_prompt": "孤独な宇宙飛行士が地球の上の深宇宙を漂う。宇宙の広大さ、地球の曲線、画面中央に小さく浮かぶ宇宙飛行士を見せる極めて広いショットから始める。カメラは滑らかかつ素早く宇宙飛行士へ近づく。近づくにつれて宇宙服の細部が見え、太陽光がバイザーに反射する。中距離まで来たら、カメラが宇宙飛行士の周囲を180度回り込み、背景の地球から星が広がる宇宙空間へと順に見せる。完全に安定した動き、説得力のある無重力、リアルな宇宙照明と物理的な反射、IMAX品質、極めて高い写実性、映画的な被写界深度、8K、大作宇宙ドキュメンタリーのスタイル、自然なモーションブラー、超精細なディテール、壮大で思索的な雰囲気。",
      "line7_suggestions_video_6_prompt": "アニメーション風。公園のベンチに座る女性の膝に猫がよじ登り、女性が優しく撫でる。",
      "line7_suggestions_video_7_prompt": "超リアルなシーン。少し散らかった高級ホテルの部屋で、金髪の女性がベッドに座っている。目の周りの大部分を黒いメイクが覆っている。カメラはゆっくり前進し、疲れ切った様子の彼女の顔をクローズアップする。",
      "line7_suggestions_video_8_prompt": "動きながら流れる黄金色の液体、磁力の波、高級感、抽象的な3Dアート。",
      "tutorials": {
        "image": {
          "gpt_image2": {
            "objective": "重要な要素を保ちながら、正確な画像の生成や既存画像の編集を行います。",
            "features": [
              "最大16枚の参照画像。",
              "人物、服装、背景、色、スタイルなど、各参照画像の役割を明確にします。",
              "変更する部分と維持する部分を具体的に指定します。"
            ],
            "steps": [
              "参照エリアに必要な画像を追加します。顔、服装、背景、スタイルなど、各画像の役割を決めます。",
              "参照画像をどのように組み合わせるか説明します。",
              "構図、照明、素材、維持したい細部を指定します。",
              "編集の場合、変更してはいけない要素を明記します。",
              "生成結果を確認し、修正が必要な部分だけを調整します。"
            ],
            "prompt": "画像1を[被写体／人物の同一性]の主な参照として使用します。画像2は[服装／色／スタイル]、画像3は[背景／構図]の参照として使用します（利用可能な場合）。[希望する結果]を作成してください。[維持する要素]を保ち、[変更する要素]だけを変更します。構図：[フレーミング]。照明：[照明]。素材と細部：[詳細]。不要な要素を追加せず、全体の一貫性を保ってください。"
          },
          "flux2pro": {
            "objective": "構図を制御し、細部を精密に表現し、参照画像の一貫性を保った画像を作成します。",
            "features": [
              "最大9枚の参照画像。",
              "構図、素材、視覚的一貫性の制御に適しています。",
              "被写体、色、質感、背景の参照を分けて指定します。"
            ],
            "steps": [
              "最大9枚の鮮明で相互に補完する参照画像を追加します。",
              "被写体、色調、素材、環境など、参照ごとに役割を設定します。",
              "構図と各要素の配置を説明します。",
              "質感、照明、維持すべき細部を指定します。",
              "構図や素材を調整したい場合はプロンプトを修正します。"
            ],
            "prompt": "画像1を主な被写体とシルエットの参照として使用します。画像2は色調と素材、画像3は背景と構図の参照として使用します（利用可能な場合）。[シーン]を作成してください。構図：[配置とカメラ角度]。素材：[質感]。照明：[照明]。[重要な細部]を維持してください。不要な物体、解剖学的な不整合、被写体の同一性の変化を避けてください。",
            "resourceUrl": "https://runware.ai/models/bfl-flux-2-pro",
            "resourceLabel": "Fiche du modèle sur Runware"
          },
          "nano_banana2_lite": {
            "objective": "複数の視覚参照を組み合わせ、必要に応じて参照動画も使い、画像をすばやく作成・変換します。",
            "features": [
              "最大14枚の画像と1本の参照動画。",
              "各参照に明確な役割を与えます。",
              "対応モードでは、参照動画を動きや全体の雰囲気の参考にできます。",
              "変更する要素と維持する要素を区別して説明します。"
            ],
            "steps": [
              "グリッドに最大14枚の画像を追加し、人物、物体、背景、スタイルなどの役割を設定します。",
              "選択モードが対応している場合は参照動画を追加します。",
              "参照画像をどのように組み合わせるか説明します。",
              "変更する部分と変更しない部分を具体的に指定します。",
              "構図、照明、色、出力スタイルを指定します。",
              "結果を確認し、誤っている部分だけを修正します。",
              "モデル情報で利用可能な入力形式を確認します。"
            ],
            "prompt": "画像1は[被写体／人物の同一性]、画像2は[背景／スタイル]、画像3は[色／物体]の参照として使用します（利用可能な場合）。対応していれば、参照動画から[動き／雰囲気]を取り入れます。[目標の結果]を作成してください。[維持する特徴]を保ち、[指定した変更]だけを行います。構図：[構図]。照明：[照明]。スタイル：[スタイル]。",
            "resourceUrl": "https://runware.ai/models/google-nano-banana-2-lite",
            "resourceLabel": "Fiche du modèle sur Runware"
          }
        },
        "video": {
          "default": {
            "objective": "選択した動画エンジンの基本ガイドです。",
            "features": [
              "Ovortexに表示される設定を、このエンジンの利用可能な機能の基準にしてください。"
            ],
            "steps": [
              "表示される選択肢に応じて「テキストから動画」または「画像から動画」を選びます。",
              "明確な動作と場所を説明します。",
              "ショットサイズ、カメラの動き、照明、雰囲気を指定します。",
              "画像を使う場合、維持したい視覚的特徴を明記します。",
              "最初の動画を生成し、結果に合わせてプロンプトを調整します。"
            ],
            "prompt": "動画プラン：[被写体]が[場所]で[具体的な動作]を行う。画角：[ショットタイプ]。カメラ：[動き]。照明：[照明]。雰囲気：[トーン]。長さ：[秒数]。[連続性を保つ要素]を維持する。自然な動きと物理表現、不要なカットや人物の追加なし。"
          },
          "veo3.1": {
            "objective": "Veo 3.1：参照画像、ネイティブ音声、対応するソース動画操作を使ってシーンを制御します。",
            "features": [
              "Veoパネルで最大3枚の参照画像を使い、人物、物体、背景の外観を誘導できます。",
              "ネイティブ音声の利用可否は選択モードによります。",
              "ソース動画の操作はOvortexで有効なオプションに依存します。",
              "視覚的な連続性を保つため、具体的に記述します。"
            ],
            "steps": [
              "最大3枚の参照画像を追加し、人物、背景、物体などの役割を決めます。",
              "撮影可能な連続した動作としてシーンを説明します。",
              "必要に応じてカメラ、画角、照明、音や台詞を指定します。",
              "ソース動画を操作する場合は、変更したい点だけを説明します。",
              "人物の同一性、衣装、環境の連続性を確認します。"
            ],
            "prompt": "[秒数]の映画的なショットを作成：[人物／被写体]が[背景]で[動作]を行う。参照1：[人物の外観]を維持。参照2：[背景]を誘導。参照3：[物体／スタイル]を誘導。カメラ：[動き]。照明：[照明]。音声：[必要な音／台詞]。連続性と自然な動きを維持する。"
          },
          "veo3.1_fast": {
            "objective": "Veo 3.1 Fast：プロンプトと最大3枚の参照画像を使い、動画をすばやく作成します。",
            "features": [
              "Veoパネルから最大3枚の参照画像を使用できます。",
              "アイデアをすばやく試すためのモデルです。",
              "動作はシンプルかつ明確にします。",
              "参照画像で外観を維持します。"
            ],
            "steps": [
              "短時間で試作したい場合にこのモデルを選びます。",
              "主な動作を1つ、場所を1つ説明します。",
              "必要に応じて最大3枚の参照画像を追加します。",
              "画角、カメラの動き、照明を指定します。",
              "結果を確認してプロンプトを調整します。"
            ],
            "prompt": "映画的な動画：[被写体]が[場所]で[単一の動作]を行う。参照画像を使って[外観／物体／スタイル]を維持する。ショット：[画角]。カメラ：[動き]。照明：[照明]。雰囲気：[雰囲気]。自然な動きと一貫した細部。"
          },
          "seedance25": {
            "objective": "Seedance 2.5：多数のマルチモーダル参照を使った動画の作成、またはソース動画の編集・延長に対応します。",
            "features": [
              "モードに応じて最大30枚の画像、10本の動画、10個の音声ファイルを参照できます。",
              "各参照に明確な目的を設定します。",
              "対応モードではソース動画の編集や延長が可能です。",
              "Ovortexで選択したモードと入力形式を確認してください。"
            ],
            "steps": [
              "参照を使う場合、人物、衣装、小道具、場所の画像を追加します。",
              "対応していれば動きやカメラ表現の参照動画を追加します。",
              "選択モードが対応する場合のみ音声参照を追加します。",
              "時間の流れと各参照の役割を説明します。",
              "編集・延長では維持する要素と変更する要素を明記します。"
            ],
            "prompt": "提供されたメディアを使って[秒数]のシーケンスを作成する。人物参照：[同一性と衣装の画像]。背景参照：[場所の画像]。動きの参照：[動画と動作]。音声参照：[利用可能な音声]。流れ：[動作の段階]。カメラ：[動き]。人物、衣装、照明、連続性を維持し、[指定した編集]だけを行う。"
          },
          "seedance20": {
            "objective": "Seedance 2.0：画像、動画、音声の参照を組み合わせて生成を指示します。",
            "features": [
              "画像最大9枚、動画3本、音声3個、合計最大12ファイル。",
              "画像は人物、小道具、場所の参考にできます。",
              "対応モードでは動画で動き、音声で音を誘導できます。",
              "プロンプトで各参照の役割を明確にします。"
            ],
            "steps": [
              "人物、小道具、背景の画像を追加し、対応していれば動き用の動画や音声を追加します。",
              "選択モードのファイル上限を守ります。",
              "各参照の役割をプロンプトに記載します。",
              "動作を時系列で明確に説明します。",
              "人物の同一性、動き、音声の一貫性を確認します。"
            ],
            "prompt": "参照メディアの役割に沿って一貫した動画を作成する：画像1＝[人物]、画像2＝[背景]、画像3＝[物体／スタイル]、動画1＝[動き]、音声1＝[対応している場合の音]。動作：[シーケンス]。カメラ：[動き]。人物と視覚スタイルの一貫性を保つ。"
          },
          "seedance": {
            "objective": "Seedance 1.5 Pro：ネイティブ音声とリップシンク付き動画、または開始画像と終了画像を使った遷移を作成します。",
            "features": [
              "ネイティブ音声とリップシンクはOvortexに表示されるエンジン設定によります。",
              "対応モードでは開始画像と終了画像で遷移を誘導できます。",
              "台詞、感情、話すタイミングを具体的に指定します。"
            ],
            "steps": [
              "人物、台詞や音、動作を明確な流れとして説明します。",
              "正確な台詞は引用符で囲みます。",
              "感情、話すリズム、カメラの動きを指定します。",
              "開始画像と終了画像を使う場合、意図する遷移を説明します。",
              "台詞と動作が同期しているか確認します。"
            ],
            "prompt": "音声同期ショット：[人物]が[背景]にいる。[動作]を行い、「[正確な台詞]」と[感情]、[話すリズム]で話す。カメラ：[動き]。音：[環境音／効果音]。自然なリップシンク、外観の一貫性、まとまりのあるシーンを維持する。"
          },
          "kling2.6": {
            "objective": "Kling 2.6 Pro：エンジン設定に応じて、動きを制御したFull HD動画と音声を生成します。",
            "features": [
              "Ovortexで設定された長さ：1080pで5秒または10秒。",
              "画像から動画では、被写体が明瞭な画像が役立ちます。",
              "ひと続きの読み取りやすい動作を指定します。"
            ],
            "steps": [
              "画像から動画では、輪郭がはっきり見える鮮明な画像を選びます。",
              "最初から最後までの動作を説明します。",
              "カメラの動きと環境の反応を指定します。",
              "人物、顔、衣装、背景の一貫性を保ちます。",
              "関係のない複数の動作を一度に指定しないでください。"
            ],
            "prompt": "入力画像を基に、人物の同一性、顔、衣装、背景を維持する。[被写体]が[ひと続きの動作]を行う。カメラ：[動き]。環境：[反応]。照明：[照明]。自然な物理表現、安定した外観、滑らかな動き。"
          },
          "kling26_motion": {
            "objective": "Kling 2.6 Motion Control：参照動画の動きを、画像で指定した人物に転写します。",
            "features": [
              "主な入力は、動きのソース動画とアニメーション化する人物画像です。",
              "人物の全身が明瞭に見える画像が適しています。",
              "人物の同一性と体の比率を維持します。"
            ],
            "steps": [
              "重要な手足が切れないよう、できるだけ全身が見える人物画像を読み込みます。",
              "転写したい動きが含まれるソース動画を追加します。",
              "画像と動画のポーズや画角に互換性があるか確認します。",
              "維持すべき外観の特徴を説明します。",
              "体の比率と動きの連続性を確認します。"
            ],
            "prompt": "ソース動画の動きを参照画像の人物に転写する。人物の同一性、顔、衣装、体の比率を維持する。ソースの動きにできるだけ忠実に従う。背景と視覚スタイルを保ち、不自然な変形のない自然な動きにする。"
          },
          "kling30": {
            "objective": "Kling 3.0：開始画像と終了画像を使う場合、その両端を制御したショットやシーケンスを作成します。",
            "features": [
              "カタログで選択できる長さ：3～15秒。",
              "対応していれば開始画像と終了画像で遷移を誘導できます。",
              "両方の状態をつなぐ中間動作を説明します。"
            ],
            "steps": [
              "開始点に応じてテキストまたは画像モードを選びます。",
              "動画の両端を制御したい場合は開始画像と終了画像を追加します。",
              "被写体が初期状態から最終状態へ移る過程を説明します。",
              "カメラの動き、照明、速度を指定します。",
              "遷移が連続し、人物の同一性が維持されているか確認します。"
            ],
            "prompt": "開始画像から終了画像へ連続した遷移を作成する。[被写体]が[動作]を行い、[初期状態]から[最終状態]へ移る。カメラ：[動き]。速度：[テンポ]。照明：[照明]。人物の同一性を維持し、滑らかで物理的に自然な遷移にする。"
          },
          "hailuo": {
            "objective": "Hailuo 2.3：自然な動き、表情、被写体の連続性を重視します。",
            "features": [
              "Ovortexのカタログでは、768pまたは1080pで6秒、768pで10秒を選べます。",
              "既存画像を動かす場合は、輪郭が明確な画像が適しています。",
              "動作と表情を具体的に指定します。"
            ],
            "steps": [
              "既存画像を動かす場合、輪郭がはっきりした画像を選びます。",
              "身体の動作と意図する感情を説明します。",
              "髪、衣服、周囲の環境が動きにどう反応するか指定します。",
              "カメラの動きはシンプルで目的のあるものにします。",
              "表情と身体の動きが自然か確認します。"
            ],
            "prompt": "[人物]が[感情]の表情で[身体動作]を行う。髪、衣服、環境の要素が自然に反応する。カメラ：[動き]。照明：[照明]。リアルな表情、自然な身体表現、動きの一貫性、安定した外観。"
          },
          "minimax_h3": {
            "objective": "MiniMax H3：対応オプションが利用できる場合、マルチモーダル参照と詳細なシーン制御を活用します。",
            "features": [
              "カタログで選べる長さは4～15秒です。",
              "画像参照で人物の同一性や背景を誘導します。",
              "動画と音声の入力は選択モードによります。",
              "参照の役割と動作のタイミングを明確にします。"
            ],
            "steps": [
              "対応モードに応じて、画像で人物や背景を、動画や音声で対応する要素を誘導します。",
              "シーケンスを時系列で説明します。",
              "カメラ、照明、テンポを指定します。",
              "維持すべき特徴を明記します。",
              "シーン全体の連続性を確認します。"
            ],
            "prompt": "[秒数]のシーケンスを作成する。被写体：[人物／物体]。画像参照は[同一性／背景]、動画参照は[動き]、対応していれば音声参照は[音]に使用する。動作：[時系列の流れ]。カメラ：[動き]。連続性、視覚的な同一性、自然な動きを維持する。"
          },
          "pixverse6": {
            "objective": "PixVerse V6：スタジオで利用できる長さ、品質、マルチショット構成、クリエイティブ設定を調整します。",
            "features": [
              "選択できる長さ：1～15秒。",
              "マルチショットでは動作の段階を別々のショットに分けられます。",
              "スタジオの操作で利用可能な品質とクリエイティブ設定を選びます。",
              "ショット間の連続性を保ちます。"
            ],
            "steps": [
              "ショット数や動作の数に合わせて長さを選びます。",
              "各ショットの目的が明確になるようシーンを分割します。",
              "各ショットの画角とカメラの動きを指定します。",
              "ショット間の動作と視覚的な連続性を説明します。",
              "最終的なタイミングと遷移を確認します。"
            ],
            "prompt": "マルチショット構成：ショット1 — [被写体と動作]、画角[画角]。ショット2 — [動作の展開]、カメラ[動き]。ショット3 — [最終結果]、画角[画角]。人物、衣装、背景、照明の連続性を維持する。長さ：[秒数]。スタイル：[スタイル]。"
          }
        }
      }
    ,
      "engineAnnotations": {
              "kling26_motion": "参照動画の動きを画像内の人物に転写",
              "kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
              "hailuo": "超リアルな動き",
              "pixverse6": "PixVerse V6 — 360p～1080p、1～15秒、音声・マルチショット対応",
              "seedance25": "Seedance 2.5 — 画像・動画・音声参照、編集・延長、4～30秒",
              "seedance20": "Seedance 2.0 — 参照画像最大9枚、動画3本、音声3件",
              "seedance": "ネイティブ音声とリップシンクの同期",
              "gpt_image2": "画像の生成と編集、参照画像最大16枚",
              "flux2pro": "FLUX.2 Pro — 最大9枚の参照画像を使った編集",
              "nano_banana2_lite": "高速な画像生成と編集、参照画像最大14枚"
      }}
  },
  "zh": {
    "translation": {
      "line3_app_ui_audio": "音频",
"line3_app_ui_remix": "混剪",
"line3_app_ui_nativeAudio": "原生音频",
"line3_app_ui_characterImage": "角色图像",
"line3_app_ui_firstLastFrame": "首帧 + 尾帧",
"line3_app_ui_10s768pOnly": "10秒 — 仅限768p",
"control_mode_image": "图像",
"control_mode_video": "视频",
"control_mode_remasterise": "重制",
      "line3_app_annotation_veo3_1_fast": "Veo 3.1 Fast — 快速视频生成",
"line3_app_annotation_veo3_1": "Veo 3.1 — 高质量视频生成",
"line3_app_annotation_kling26_motion": "将视频中的动作迁移到图像",
"line3_app_annotation_kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
"line3_app_annotation_kling26": "Kling 2.6 Pro — 视频生成",
"line3_app_annotation_hailuo": "超逼真的动态效果",
"line3_app_annotation_minimax_h3": "MiniMax H3 — 视频生成",
"line3_app_annotation_pixverse6": "PixVerse V6 — 360p 至 1080p，1 至 15 秒，支持音频和多镜头",
"line3_app_annotation_seedance25": "Seedance 2.5 — 支持图像、视频和音频参考，以及编辑和延长",
"line3_app_annotation_seedance20": "Seedance 2.0 — 最多支持 9 张图片、3 个视频和 3 个音频参考",
"line3_app_annotation_seedance": "原生音频与口型同步",
"line3_app_annotation_gpt_image2": "图像生成与编辑，最多支持 16 张参考图",
"line3_app_annotation_flux2pro": "FLUX.2 Pro — 最多使用 9 张图片辅助编辑",
"line3_app_annotation_nano_banana2_lite": "快速生成与编辑，最多支持 14 张参考图",
      "seedance available": "Seedance 2.5 已上线",
      "create instantly": "即时创作。",
      "hero subtitle": "借助生成式人工智能的强大能力，将您的创意转化为高品质电影级视觉效果。",
      "generate": "生成",
      "text to image title": "从文本到",
      "cinematic image": "电影级图像",
      "ai interprets imagination": "AI 解读您想象中的每一个细节。",
      "generate button": "Generate",
      "model": "模型",
      "render": "渲染",
      "contact": {
        "successTitle": "消息已发送！",
        "successMessage": "感谢您，{{name}}，我们已收到您的请求。",
        "replySoon": "我们会尽快回复您。",
        "title": "联系我们",
        "subjectLabel": "咨询主题",
        "subjectInfo": "一般咨询",
        "subjectProblem": "报告问题",
        "subjectQuote": "申请报价",
        "messageLabel": "您的消息",
        "messagePlaceholder": "我们能为您提供什么帮助？",
        "back": "返回",
        "sending": "发送中...",
        "send": "发送",
        "sendError": "发送失败，请重试。"
      },
      "profile": {
        "within30Days": "30天内",
"validYear": "有效期一年",
  "back": "返回",
  "avatarAlt": "个人资料",
  "accountStatus": "账户状态",
  "lightning": "闪电积分",
  "nextReset": "下次重置：",
  "diamonds": "钻石",
  "expiration": "到期时间：",
  "validYear": "有效期一年",
  "changeSubscription": "更改订阅",
  "subscriptionCancelled": "订阅已取消",
  "cancelling": "正在取消...",
  "cancelSubscription": "取消我的订阅",
  "contactUs": "联系我们",
  "deleteAccount": "删除我的账户",
  "irreversible": "此操作无法撤销",
  "activeSubscriptionTitle": "检测到有效订阅：",
  "activeSubscriptionMessage": "删除账户前，必须先取消订阅。",
  "understood": "知道了",
  "deleteWarning": "删除账户后，您的 💎 {{diamonds}} 颗钻石和 ⚡ {{lightning}} 个闪电积分将被永久清除。",
  "typeDelete": "请输入 SUPPRIMER 以确认：",
  "writeHere": "在此输入...",
  "reconnect": "重新登录",
  "delete": "删除",
  "cancelTitle": "取消订阅",
  "cancelConfirmMessage": "确定要取消订阅吗？在已付费周期结束前，您仍可享受订阅权益。",
  "cancel": "取消",
  "confirm": "确认",
  "cancelServerError": "无法连接到订阅取消服务器。"
},
      "hero prompt 1": "超写实场景：一名男子走近一个雪人，突然一只猫冲出来攻击他的脸...",
      "hero prompt 2": "纽约街头僵尸的超写实场景...",
      "hero prompt 3": "动漫风格，一名留着短粉色头发的女孩坐在桌边，面前放着一杯橙汁和一块草莓蛋糕。",
      "showcase subtitle": "让文字变成现实。借助 AI 的强大能力，瞬间创作引人入胜的视频。",
      "showcase prompt 1": "赛博朋克街头市场...",
      "showcase prompt 2": "动漫风景...",
      "showcase prompt 3": "自然微距镜头...",
      "showcase prompt 4": "漂浮在星云中的宇航员...",
      "showcase prompt 5": "深海中发光的水母...",
      "image to video title": "从图像到",
      "cinematic video": "电影级视频",
      "image to video subtitle": "导入您的视觉素材，让 AI 为您的创意注入生命。",
      "source image": "源图像",
      "ai result": "AI 结果",
      "prompt": "提示词",
      "image video prompt 1": "跳舞的螃蟹。",
      "image video prompt 2": "一名神情迷茫、目光游离、仿佛迷路的女人。",
      "image video prompt 3": "镜头向前推进，直到女人疲惫不堪的脸部特写。",
      "image video prompt 4": "让这张图片动起来：她抽着烟看向镜头。",
      "start end title 1": "从开始到结束保持完美一致",
      "start end desc 1": "设置起始图像和结束图像。AI 会生成两个画面之间完整而流畅的过渡，实现绝对的艺术控制。",
      "start end prompt 1": "两张图片之间平滑过渡。镜头移动并向受害者靠近。",
      "start end title 2": "流畅变形",
      "start end desc 2": "让角色或场景从状态 A 自然演变到状态 B，不产生视觉断层。",
      "start end prompt 2": "两张图片之间过渡：她完全喝醉地聊天，然后做出鬼脸并呕吐。",
      "start end title 3": "流畅变形",
      "start end desc 3": "让角色或场景从状态 A 自然演变到状态 B，不产生视觉断层。",
      "start end prompt 3": "两张图片之间过渡：她摆出战斗姿势。",
      "start image": "开始图像",
      "end image": "结束图像",
      "transition result": "过渡结果",
      "example": "示例",
      "capture title": "精准控制摄像机运动",
      "capture desc": "定义流畅的摄像机运动轨迹（缩放、平移、跟拍），让您的场景拥有专业级表现。",
      "capture prompt": "在两张图片之间生成动画。",
      "motion model": "运动模型",
      "camera control result": "摄像机控制结果",
      "replace title 1": "绝对的创作自由",
      "replace desc 1": "替换任何物体都变得非常简单。导入照片，描述您的想法，AI 几秒钟内即可生成逼真的结果。不再需要复杂工具：您的想象力就是唯一的限制。",
      "replace prompt 1": "移除背景中的猫",
      "replace title 2": "室内设计：AI 家具",
      "replace desc 2": "轻松重新设计您的空间。在保持自然光线的同时，将旧家具替换成现代家具。",
      "replace prompt 2": "移除吸管和柠檬。",
      "replace title 3": "汽车：个性化定制",
      "replace desc 3": "预览车辆上的任何修改。精准更换颜色或轮毂。",
      "replace prompt 3": "移除铲子",
      "replace photos title": "重新定义您的照片：即时替换任何物体",
      "instant": "即时",
      "replace subtitle": "使用 AI 工具擦除不需要的物体，并替换成您选择的任何元素。",
      "model example": "模型",
      "social media title": "在社交媒体上",
      "social media": "占据注意力",
      "social media subtitle": "将您的创意转化为针对 TikTok 和 Instagram 优化的病毒式内容。",
      "cutting edge technology": "尖端技术",
      "advanced engines": "由全球最",
      "most advanced in world": "先进的生成引擎驱动",
      "video": "视频",
      "hybride": "混合",
      "image": "图像",
      "texte": "文本",
      "faq title": "常见",
      "faq highlight": "问题",
      "faq question 1": "Eclipse 是什么？它是如何工作的？",
      "faq answer 1": "Eclipse 是一个由 AI 驱动的创作工作室，可以将您的创意转化为电影级作品。我们采用混合架构，将目前最优秀的生成引擎与自主优化技术相结合，以提供流畅且专业的视觉效果。",
      "faq question 2": "使用 Eclipse 需要技术技能吗？",
      "faq answer 2": "完全不需要。Eclipse 专为简化创作而设计。只需描述您的场景或导入一张图片，我们的界面就会自动处理复杂的引擎设置并生成高质量结果。",
      "faq question 3": "使用了哪些生成引擎？",
      "faq answer 3": "我们不会局限于单一模型，Eclipse 会根据您的需求动态选择最合适的生成引擎。无论是电影级渲染、风格化动画还是复杂的摄像机运动，我们都利用领先生成引擎的能力，为您提供高质量的结果。",
      "faq question 4": "生成的视频属于我吗？",
      "faq answer 4": "是的，您拥有使用 Eclipse 创建内容的全部权利。您可以将其用于社交媒体、广告或个人项目，不受限制。",
      "faq question 5": "视频最长可以多长？",
      "faq answer 5": "目前可以生成 4 到 15 秒的视频片段。通过延长功能，您可以继续延长这些片段，同时保持完美的视觉一致性。",
      "cinematic excellence accessible": "人人都能享受的电影级卓越体验。",
      "tools": "工具",
      "company": "公司",
      "footer terms": "使用条款",
      "footer privacy": "隐私政策",
      "footer cgv": "销售条款",
      "legal notice": "法律声明",
      "back to top": "返回顶部",
      "pricing footer": "价格",
      "community": "社区",
      "all rights reserved": "版权所有。",
      "powered by leading engines": "由市场领先的生成引擎提供支持。",
      "welcome": "Ovortex",
      "continue google": "使用 Google 继续",
      "continue email": "使用电子邮件继续",
      "password": "密码",
      "login": "登录",
      "register": "注册",
      "forgot password": "忘记密码？",
      "otp title": "双重认证",
      "otp subtitle": "请输入通过电子邮件收到的 6 位验证码。",
      "validate code": "验证代码",
      "remember device": "在此设备上记住 30 天",
      "text to image": "文生图",
      "image to video": "图生视频",
      "production soon": "生产功能（即将推出）",
      "other tools soon": "其他工具（即将推出）",
      "history": "我的历史",
      "pricing": "定价",
      "my account": "我的账户",
      "logout": "登出",
      "reset lightning": "闪电重置",
      "validity diamonds": "钻石有效期",
      "under 30 days": "30 天内",
      "valid 1 year": "有效期限 1 年",
      "legend": "传奇",
      "elite": "精英",
      "master": "大师",
      "standard": "标准",
      "essential": "基础",
      "api developer": "API 与开发者模块",
      "beginner": "初学者",
      "custom volume title": "自定义数量",
      "loyalty benefit": "会员优惠",
      "applied to order": "已应用于您的订单",
      "adjust slider exact amount": "调整滑块以选择准确数量",
      "diamonds": "钻石",
      "buy volume": "购买此数量",
      "unit price": "单价",
      "diamond": "钻石",
      "quick boost title": "需要快速充值吗？",
      "subscriber rate active": "订阅用户价格已启用！",
      "exclusive discounts": "享受专属折扣",
      "diamonds valid one year": "钻石有效期为 1 年",
      "popular": "热门",
      "best value": "超值优惠",
      "diamond pack spark": "火花",
      "diamond pack supernova": "超新星",
      "diamond pack galaxy": "星系",
      "diamond pack pulsar": "脉冲星",
      "diamond pack quasar": "类星体",
      "diamond pack universe": "宇宙",
      "buy": "购买",
      "custom serenity pack": "自定义安心套餐",
      "support type": "服务类型",
      "one time project": "一次性项目",
      "monthly support": "月度服务（安心套餐）",
      "professional photos": "专业照片数量",
      "ai professional videos": "专业 AI 视频数量",
      "social media management": "社交媒体管理",
      "one time estimate": "一次性项目预估费用",
      "monthly estimate": "月度预估费用",
      "per month": "/月",
      "one time": "一次性",
      "monthly serenity": "月度（安心套餐）",
      "hello": "您好，",
      "quote request intro": "我希望获取一份定制安心套餐的报价：",
      "type label": "类型",
      "photos label": "照片",
      "professional visuals": "专业视觉素材",
      "videos label": "视频",
      "ai sequences": "AI 视频片段",
      "social media label": "社交媒体",
      "yes included": "是（包含）",
      "no": "否",
      "estimate label": "预估费用",
      "thank you": "谢谢。",
      "request serenity quote": "申请安心套餐报价",
      "free analysis 24h": "24 小时内免费分析您的项目",
      "back": "返回",
      "choose your power": "选择您的创作方案",
      "power your creativity": "使用全球顶尖 AI 引擎释放您的创造力",
      "monthly": "月付",
      "yearly": "年付",
      "no commitment": "无合约承诺",
      "ideal to test engines": "适合测试我们的 AI 引擎",
      "lightnings": "闪电",
      "month": "月",
      "reset each month": "每月重置",
      "access all engines": "访问所有引擎（根据套餐）",
      "optimized prompt": "提示词优化功能",
      "prompt models access": "访问提示词模型",
      "packs purchase access": "可购买充值包",
      "explore studio": "探索工作室",
      "best value quality price": "最佳性价比",
      "hd image flux": "高清图像：Flux Dev / Schnell",
      "hd video engines": "高清视频：HD & FULL HD",
      "up to 33 videos or 300 images": "最多 33 个高清视频或 300 张图片",
      "subscribe now": "立即订阅",
      "most popular": "最受欢迎",
      "all image video engines hd": "所有图像和视频引擎 HD & FULL HD",
      "up to 77 videos or 700 images": "最多 77 个高清视频或 700 张图片",
      "become standard": "升级到 Standard",
      "plus 60 creative power": "+60% 创作能力",
      "up to 134 videos or 1200 images": "最多 134 个高清视频或 1,200 张图片",
      "upgrade master": "升级到 Master",
      "ultimate offer": "终极套餐",
      "for intensive creators": "适合高强度创作者",
      "up to 277 videos or 2500 images": "最多 277 个高清视频或 2,500 张图片",
      "max server priority": "最高服务器优先级（无需排队）",
      "join elite": "加入 Elite",
      "premium agency": "高级机构",
      "ultimate tool pro studios": "专业工作室的终极工具",
      "up to 888 videos or 8000 images": "最多 888 个高清视频或 8,000 张图片",
      "become legend": "成为传奇",
      "concierge": "私人管家",
      "zero effort pro result": "零负担，专业成果",
      "quote": "按报价",
      "project": "项目",
      "we prompt for you": "我们为您制作提示词",
      "high quality image video": "高质量图像和视频生成",
      "upscale pro retouching": "专业放大与修图服务",
      "contact us": "联系我们",
      "recharge on demand": "或按需充值",
      "subscription diamonds note": "订阅闪电每月重置。购买的钻石有效期为一年。",
      "request sent": "请求已发送！",
      "request received": "我们已收到您的信息，会尽快与您联系。",
      "quote request": "报价请求",
      "information": "咨询",
      "report problem": "报告问题",
      "request details placeholder": "请描述您的需求...",
      "cancel": "取消",
      "sending": "发送中...",
      "send": "发送",
      "login required diamonds": "购买钻石前请先登录。",
      "login required subscription": "订阅前请先登录。",
      "continue apple": "使用 Apple 继续",
      "or": "或",
      "your email": "您的电子邮件",
      "create my account": "创建我的账户",
      "already have account": "已有账户？",
      "new here": "第一次使用？",
      "create account": "创建账户",
      "reset password": "重置密码",
      "reset password description": "请输入您的电子邮件以接收恢复链接。",
      "send link": "发送链接",
      "back to login": "返回登录",
      "by continuing you accept": "继续操作即表示您同意",
      "terms of use": "使用条款",
      "and": "和",
      "privacy policy": "隐私政策",
      "allow popups login": "请允许弹出窗口以登录",
      "google login error": "使用 Google 登录时出错",
      "apple login error": "使用 Apple 登录时出错",
      "enter email": "请输入您的电子邮件",
      "link sent to": "链接已发送至",
      "account not found": "未找到该账户",
      "check email": "请检查您的电子邮件",
      "otp sending error": "发送 OTP 验证码时出错",
      "verification code sent": "验证码已发送至您的电子邮件。",
      "email already in use": "该电子邮件已关联一个账户。",
      "invalid email password": "电子邮件地址或密码不正确。",
      "invalid email format": "电子邮件地址格式无效。",
      "weak password": "密码至少需要 6 个字符。",
      "unexpected error": "发生错误，请重试。",
      "invalid code": "验证码无效",
      "code validation error": "验证验证码时出错",
      "tutorialUi": {
        "academyImage": "OVORTEX 学院 · 图像",
        "academyVideo": "OVORTEX 学院 · 视频",
        "stepGuide": "📘 分步指南",
        "promptExample": "✨ 提示词示例",
        "featuresTitle": "此模型的功能",
        "stepByStep": "分步指南",
        "tip": "提示：每次只更改一个元素，以了解哪些调整能改善结果。",
        "resources": "文档与资源",
        "resourcesPending": "此部分将补充经过验证的模型视频资源。在此之前，如有官方链接，请参阅模型文档。",
        "engineDocs": "模型文档",
        "promptHint": "将方括号中的内容替换为你的想法。此模板仅供起步，请根据添加的图像和选项进行调整。",
        "imagePromptHint": "将方括号中的说明替换为你的想法。图像编号必须与面板中添加的参考图对应。",
        "copied": "已复制！",
        "copyUnavailable": "此浏览器无法复制，请选择上方文本。",
        "copyUnavailableImage": "无法复制，请选择文本后手动复制。",
        "copyPrompt": "📋 复制提示词",
        "usePrompt": "用于生成输入框",
        "promptCopied": "提示词已复制！",
        "aboutEngine": "关于此模型",
        "recommendedSteps": "推荐步骤",
        "seeExample": "查看提示词示例 →",
        "closeTutorial": "关闭教程",
        "videoPromptHint": "将方括号中的内容替换为视频细节。",
        "modelOptionsMayVary": "可用设置可能因模型而异。请以 Ovortex 中实际显示的选项为准，而非外部视频中的选项。"
      },
      "suggestions": {
        "image": {
          "1": {
            "title": "赛博朋克城市",
            "prompt": "未来赛博朋克风格的中央公园景观，充满霓虹灯与电影感照明，8K，极致细节。"
          },
          "2": {
            "title": "狙击手",
            "prompt": "一名穿着雪地迷彩服的狙击手俯卧在高山的深雪中。极致写实，贴近地面的视角，焦点清晰落在步枪上，呈现严酷敌对的冬季氛围与高海拔刺眼光线。"
          },
          "3": {
            "title": "日落",
            "prompt": "一只螃蟹站在岩石上，眺望海滩上的日落。海滩保持轻微虚焦。"
          },
          "4": {
            "title": "城市废墟中的战斗",
            "prompt": "超写实场景：一名蓝发战术女性在一栋废弃建筑内落地。她目光锐利而专注，瞄准观众时外套在空中飘动。"
          },
          "5": {
            "title": "夜间顶层公寓中的女性",
            "prompt": "电影感动漫插画：一名女性反派全身站在夜晚奢华现代顶层公寓办公室中，将手枪直接指向镜头。姿态强势而具有威胁感，明显的低角度仰拍；优雅的黑色西装外套、领口微敞的合身黑衬衫、剪裁利落的黑裤子、腰带上的低调金属链、一只手插在口袋里、短款黑色层次发型、发光的红眼睛、苍白皮肤、冷酷坚定的表情。戏剧性灯光，面部与头发超写实细节，光亮的黑色大理石地面，背景有高管办公桌和皮椅，巨大的落地窗俯瞰夜晚灯火璀璨的城市，表面反射真实。黑暗而精致的新黑色电影氛围、电影级阴影、写实动漫风格、杰作级品质、极致锐利、体积光、景深、高对比度、专业概念艺术、8K、动作惊悚片气氛。"
          },
          "6": {
            "title": "动漫",
            "prompt": "动漫风格：一名有着长而卷曲金发、金黄色眼睛的年轻女性坐在绿色木制公园长椅中央。她身上有绷带，穿着敞开的绿色外套，里面是饰有金色纽扣和红黑围巾的深色制服。袖子上能看到红色徽章。双手放在白色百褶裙上的膝盖处。她坐在公园里，以严肃的表情直视观看者。"
          },
          "7": {
            "title": "满月下的岛屿",
            "prompt": "一座由多座灯火通明的宝塔组成的华丽传统亚洲寺庙坐落在平静如镜的湖边，湖面倒映整个场景。巨大的金色满月高悬天空，并完整映在水中。壮丽的山谷与雄伟陡峭的悬崖笼罩在薄雾中。橙、红、金色的温暖秋林环绕寺庙，明亮灯笼营造神秘温馨的氛围，电影感雾气在群山之间漂浮。亚洲建筑细节丰富，包括弯曲屋顶、雕刻木材和传统灯光。宁静、梦幻、富有灵性。体积光、微妙光束、超真实水面倒影、完美对称构图、自然景深、浓郁且对比鲜明的色彩、极致照片级写实、超精细杰作、电影级奇幻景观、HDR、全局光照、光线追踪、虚幻引擎品质、8K、极锐焦点、丰富纹理、专业风景摄影、震撼全景、金色月光、真实雾气、获奖级摄影。"
          },
          "8": {
            "title": "3D",
            "prompt": "一座巨大的王座覆盖着红色天鹅绒和精雕细琢的金色装饰，并饰有纹章图案与狮子雕像。一只威严的老鼠像国王一样安然睡在王座上，戴着镶嵌蓝色和金色宝石的王冠，并用前爪优雅地握着权杖。场景位于一座古老的哥特式大教堂废墟中，拥有巨大的石拱门、纪念碑般的柱子和散落地面的碎石。强烈光束穿过高窗，在神圣而戏剧性的氛围中照亮老鼠和王座。光束中漂浮着灰尘颗粒。天鹅绒、雕刻木材、古老石材和老鼠毛发的纹理极其细腻。电影感氛围、写实中世纪奇幻、极致照片级写实、自然景深、体积光、光线追踪、HDR、全局光照、虚幻引擎5品质、超写实杰作、8K精细细节、电影级奇幻、戏剧性灯光、获奖级摄影。"
          },
          "9": {
            "title": "水下沉浸",
            "prompt": "一名日本武士以侧面姿态站在画面右侧，坚定地望向地平线。黑发扎成传统发髻，略有胡须，穿着纹理丰富的深色和服，腰间可见武士刀。他身后出现一个完全由晶莹的水和半透明流体构成的精神分身。水之人物呈反向姿态，面向相反方向，形成强烈视觉对比。轮廓由波浪、水花、液态丝线和悬浮水滴构成。背景是蓝色、深蓝、灰色和白色墨迹，带有水彩效果与泼墨。神秘、灵性、沉思的氛围。电影级戏剧灯光，面部、头发、布料和水的细节极其丰富。真实反射、完美透明感、超细纹理、高端艺术构图、照片级写实概念艺术、杰作、超写实、电影光与体积光、奇幻写实风格、8K、HDR、清晰焦点、获奖级数字艺术。"
          },
          "10": {
            "title": "阴森森林",
            "prompt": "一名惊恐的女子在黑暗茂密的森林中奔跑。浓雾笼罩枯树与断枝，营造恐怖惊悚片氛围。她手持手电筒，光束穿透雾气，照亮惊慌的脸和沾满泥土、带有挣扎痕迹的身体。衣服因奔跑和穿越自然障碍而破损肮脏。戏剧性光线、压迫感、潮湿气氛与真实的森林地面纹理，树叶和树枝细节丰富。高而纤细的树木，自然景深，面部、衣物与地面的超精细纹理。电影级恐怖惊悚摄影，超写实、HDR、8K、高对比度、极致真实，精妙掌控光影。"
          },
          "11": {
            "title": "杂志",
            "prompt": "一名金发女性自信地坐在一辆20世纪60年代奶油色复古汽车的引擎盖上，以戏剧性的低角度拍摄。她穿着优雅的绿色连身裤和米色系带军靴。一条腿朝镜头伸出，使鞋底在前景格外突出。她表情严肃，直视镜头。道路旁稀疏分布着几棵棕榈树，金色日落光线营造加州氛围。复古车镀铬车身上有真实反射。电影景深，脸部、服装和车辆细节极其清晰。自然黄金时刻照明、柔和阴影、真实色彩、高端时尚摄影、专业构图、超写实、8K、HDR、极致照片级真实、细致皮肤纹理、24毫米广角镜头、奢侈杂志品质。"
          },
          "12": {
            "title": "场景融合",
            "prompt": "编辑照片，为人物添加深灰色外套和一条森林绿色长百褶裙。姿势：她站在铺石小路上，一只手插在外套口袋里，姿态优雅，身体略微转向镜头。场景：秋天的中央公园，橙色与金色树叶环绕画面，背景可见纽约摩天大楼的轮廓。氛围细节：地面散落着落叶和几页书纸，营造诗意而忧郁的氛围。附加元素：左上角有一个小型带框插图，展示同一位女性从不同角度拍摄的面部特写。"
          },
          "13": {
            "title": "营销",
            "prompt": "超写实美妆肖像：一名绿眼睛的金发女性直视镜头，眼神强烈，有自然雀斑和亮泽的酒红色嘴唇。高端专业妆容；她在脸旁拿着一支粉色口红，指甲优雅鲜红，佩戴金色耳环。戏剧性红色灯光，奢华迷人的氛围，带真实纹理的明亮肌肤，高端化妆品摄影，彩妆品牌广告，电影景深、极致细节、照片级写实、时尚杂志品质、专业影棚、8K、超精细。"
          },
          "14": {
            "title": "水彩肖像",
            "prompt": "高品质水彩风格标志：正面视角的强大多彩狐狸头，单色背景。Yukisakura创作，色彩鲜艳饱满而美丽，正方形构图。"
          },
          "15": {
            "title": "赛博朋克女性",
            "prompt": "反乌托邦赛博朋克未来中，一名身材娇小、显得脆弱而无助的年轻韩国女性走在一座小型赛博朋克城市的街道上。她留着凌乱的短紫发，点缀发光霓虹色彩。她穿着极其破旧的衣物：工装裤、破损短款上衣和长外套。一个赛博甲板用绑带固定在左大腿上部。她的脸上流露出疲惫、精疲力竭和深深的无力感。"
          }
        },
        "video": {
          "1": {
            "title": "暮色",
            "typeStyle": "漫画",
            "prompt": "一名身穿精细铠甲的孤独武士站在长草山坡上，面对远处日本城市上空强烈的红色夕阳。狂风吹动他的衣服和草丛。史诗般而忧郁的氛围，天空布满明亮的戏剧性云层。镜头从武士背后的中景开始，快速而平稳地向后拉，展现山谷与城市，随后围绕人物轻微旋转约180度，形成电影感结尾。高对比度黄金时刻光线、真实镜头光晕、电影景深、日本大片质感的超写实画面。"
          },
          "2": {
            "title": "未来风格",
            "typeStyle": "赛博朋克",
            "prompt": "一名紫发年轻赛博朋克女性走在潮湿而热闹的韩国小巷中。先以极近特写拍摄她的靴子缓慢踩过湿润沥青，水坑里映出彩色霓虹。镜头平稳后退，跟随她的脚步。一秒后，镜头沿着双腿、战术装备和破旧外套逐渐上移。她双手插兜，自信地继续行走。镜头上升至面部，同时展现整条巷子、发光的韩文招牌、排水口冒出的蒸汽以及背景行人。真实的赛博朋克氛围、自然动作、电影灯光、真实景深与湿地反射，超写实、8K、电影品质、极致细节。"
          },
          "3": {
            "title": "阴森森林",
            "typeStyle": "写实",
            "prompt": "深夜，在黑暗且雾气弥漫的森林深处，一名惊恐的女子沿着蜿蜒于枯树和纠缠树枝之间的狭窄泥路全速奔跑。她的衣服肮脏破损，脸上满是汗水、泥土与恐惧。她紧握手电筒，光束穿透浓雾。奔跑动作自然真实，脚步落点和重心转移准确，呼吸细微，头发与衣物随动作自然摆动。不要慢动作。镜头从贴近地面的戏剧性低角度跟拍开始，湿树根、泥浆飞溅和断枝快速掠过前景。手电光扫过树木，在雾中形成移动阴影与体积光。她继续逃跑时，镜头逐渐升高并平稳后退，从低角度追拍过渡到越来越高的航拍视角。展现广阔而孤立的森林，女子变成黑暗中渺小的身影。电影级航拍远景、漂浮浓雾、穿过树冠的真实月光、恐怖惊悚片氛围、电影灯光、体积雾、真实手电照明、自然镜头运动、细节丰富的森林、湿地反射、照片级纹理、HDR、持续紧张感、好莱坞大片级8K沉浸式恐怖场景。"
          },
          "4": {
            "title": "竞速",
            "typeStyle": "3D",
            "prompt": "密集森林被改造成竞赛赛道，呈现极具动感的电影镜头。两只细节丰富的拟人化兔子在狭窄土路上全力冲刺。穿蓝色T恤、背背包的白兔领先，穿红色T恤的灰兔紧追其后，两者都神情坚定。镜头贴近地面高速向前跟拍，并带有专业竞速摄影般的轻微抖动。突出速度感，四肢带有动态模糊，每次迈步都会扬起尘土和泥粒。道路两侧植被茂盛，背景中的动物观众虚化，呈现浅景深。极限运动风格、决赛氛围、阳光穿过树木形成戏剧性的金色光线，高预算动画电影级超写实3D效果，紧张感与能量达到极致。"
          },
          "5": {
            "title": "宇航员",
            "typeStyle": "太空",
            "prompt": "一名孤独的宇航员漂浮在地球上方的深空中。镜头从极广角开始，展现宇宙的浩瀚、地球的弧线以及画面中央渺小的宇航员。镜头快速而平滑地逐渐推进。随着距离拉近，宇航服细节逐渐显现，太阳光映在头盔面罩上。到达中景距离后，镜头围绕宇航员旋转180度，依次展现身后的地球和布满星星的太空。运动稳定、失重感真实，宇宙光照与物理反射自然，IMAX品质、极致照片级写实、电影景深、8K、大制作太空纪录片风格、自然动态模糊、超精细细节，氛围宏大而沉思。"
          },
          "6": {
            "title": "公园",
            "typeStyle": "动漫",
            "prompt": "动画风格：一名女性坐在公园长椅上，一只猫爬到她的膝盖上，她温柔地抚摸猫。"
          },
          "7": {
            "title": "写实风格",
            "typeStyle": "写实",
            "prompt": "超写实场景：一间豪华但略显凌乱的酒店房间里，一名金发女子坐在床上，眼睛周围大部分被黑色妆容覆盖。镜头缓慢向前推进，最终特写她显得疲惫的面容。"
          },
          "8": {
            "title": "山地景观",
            "typeStyle": "电影",
            "prompt": "流动的金色液体、磁力波纹、奢华感、抽象3D艺术。"
          },
          "9": {
            "title": "新黑色动漫",
            "typeStyle": "动漫",
            "prompt": "电影感动漫插画：一名女性反派全身站在夜晚豪华现代顶层公寓办公室内，将手枪直接指向镜头。姿态强势而具有威胁感，采用明显的低角度仰拍；她向前走时，镜头按她的步伐向后移动。优雅的黑色西装外套、领口微开的合身黑衬衫、修身黑裤、腰带上的低调金属链，一只手插在口袋里，短款渐层黑发、发光的红眼睛、苍白皮肤和冷峻坚定的表情。戏剧化照明，脸部和头发细节丰富，亮面的黑色大理石地板、行政办公桌、皮椅，以及俯瞰夜间璀璨城市的巨大落地窗。表面反射真实，随后镜头推近并变焦至她的脸。黑暗精致的新黑色电影氛围、电影阴影、写实动漫风格、杰作级质量、极致锐利、体积光、景深、高对比度、专业概念艺术、8K、动作惊悚片氛围。"
          },
          "10": {
            "title": "诡异玩偶",
            "typeStyle": "恐怖",
            "prompt": "一座废弃的维多利亚式老宅，房间阴暗破败，墙纸撕裂、灰尘漂浮、布满蜘蛛网，采用电影感照明。一只令人恐惧、表面开裂的瓷娃娃静静坐在房间中央的旧天鹅绒扶手椅上。镜头从全景缓慢向前推进至近景。微弱月光透过窗户，摇曳的蜡烛在墙上投下不断移动的影子。娃娃凌乱的头发在气流中轻轻晃动。最后两秒，娃娃的头以不自然、令人不安的动作缓慢转向镜头，眼睛仿佛一直跟随镜头。压迫感十足的氛围、心理恐怖、超写实、好莱坞电影品质、体积光、电影景深、极致细节、4K、16:9。"
          },
          "11": {
            "title": "移动镜头",
            "typeStyle": "写实",
            "prompt": "超写实夜间监控录像：一座花园完全被新雪覆盖。固定的黑白红外安防摄像头拍摄画面，带有轻微数字噪点、压缩伪影，屏幕角落显示时间戳。花园中央立着一个一动不动的大雪人。一名男子在雪地里朝雪人走去，身后留下脚印。当他靠近到一米以内时，一只猫突然以极快速度从雪人内部冲出，直接扑向男子的脸；男子惊叫着猛然后退。摄像头以断续的运动记录事件，呈现真实监控画质和令人不安的气氛。真实夜间照明、自然阴影、照片级细节、电影感4K，仿佛真实安防摄像头拍到的未解之谜病毒视频。"
          },
          "12": {
            "title": "海洋",
            "typeStyle": "3D",
            "prompt": "一只螃蟹站在岩石上眺望海滩日落。海滩略微失焦。"
          },
          "13": {
            "title": "袭击",
            "typeStyle": "写实",
            "prompt": "超写实电影场景：深夜，一大群僵尸席卷时代广场。数百名惊慌的市民向各个方向逃跑，僵尸在灯火通明的街道上追赶他们。废弃车辆、碰撞、爆炸、尖叫和彻底的混乱将城市变成末日现场。动态镜头、紧张急促的运动、大制作灾难片氛围、真实城市灯光、照片级细节、4K。壮观的最后航拍镜头展现纽约：整座城市陷入火海，巨大的黑烟柱遮蔽地平线，多个街区被大火摧毁。末日氛围、火焰的红光、大规模破坏、超写实渲染。最后一幕从满目疮痍的纽约河岸拍摄，城市笼罩在烟雾和火焰中。直升机飞越陷入危机的城市，爆炸照亮地平线。世界末日般的气氛、史诗级电影摄影、极致细节、4K、好莱坞大片风格。"
          },
          "14": {
            "title": "火山",
            "typeStyle": "动画",
            "prompt": "超写实电影镜头：一片繁茂的史前世界发生大规模火山喷发。镜头从极其茂密、细节丰富的丛林上空的宽阔航拍开始。地面的恐龙（霸王龙、三角龙和蜥脚类恐龙）同时抬头，望向远处正在喷发的火山。壮观的火山爆发喷出熔岩，形成巨大的火山灰云。翼龙在戏剧化的天空中飞翔。植被繁茂、丛林潮湿、体积雾浓厚，傍晚金色阳光照耀。镜头平滑向前推进，并轻微转向火山。大片风格、超写实、电影景深、4K。"
          },
          "15": {
            "title": "电影感",
            "typeStyle": "电影感",
            "prompt": "固定镜头拍摄一座破败老宅中阴暗、废弃的走廊。走廊尽头的窗户透入微弱自然光，窗帘轻轻摆动。一名约40岁的女性穿着肮脏破损的睡衣，在潮湿的木地板上缓慢朝镜头爬来。她极度惊恐、呼吸沉重、身体颤抖。她突然停下，带着恐惧的眼神缓慢回头，仿佛有某种东西正在画面外追赶她。压抑的氛围、寂静与逐渐增强的紧张感。镜头保持固定，仅有轻微真实的手持摄影震动。超写实恐怖电影风格、冷色灯光、电影颗粒、4K、浅景深、沉重阴森的气氛。时长10秒，动作缓慢且连续，紧张感不断升高，直到最后回头凝视的一刻。"
          }
        }
      },
      "tutorialResourceLabels": {
        "seedance20": "模型介绍与信息",
        "hailuo": "Hailuo 2.3 官方介绍",
        "kling2_6": "Kling 官方指南（含 2.6 指南）",
        "kling26_motion": "Kling 与动作控制官方指南",
        "kling30": "Kling 3.0 官方指南",
        "veo3_1": "Veo 3.1 官方指南",
        "veo3_1_fast": "Veo 3.1 官方指南",
        "minimax_h3": "MiniMax 视频指南",
        "seedance25": "Seedance 实用指南",
        "seedance": "Seedance 系列文档",
        "hailuoTitle": "Hailuo 2.3 — 视频教程",
        "seedance20Title": "Seedance 2.0 初学者完整教程"
      },
      "app": {
        "style": {
          "cyberpunk": "赛博朋克",
          "anime": "动漫",
          "watercolor": "水彩",
          "animation3d": "3D动画",
          "realistic": "写实"
        },
        "prompt": {
          "aiDiscussion": "AI 对话",
          "creative": "创意提示词",
          "askQuestion": "请输入您的问题...",
          "describeIdea": "详细描述您的想法..."
        },
        "optimize": {
          "analyzing": "⏳ 分析中...",
          "button": "✨ 优化"
        },
        "upload": {
          "load": "📁 上传",
          "fileLimits": "单个文件限制：图片 20 MB · 视频 64 MB · 音频 20 MB。"
        },
        "status": {
          "generationFinalizing": "正在完成生成...",
          "fileLoading": "正在加载文件...",
          "fileImported": "导入的文件",
          "generatingOnModel": "⏳ 正在使用 {{model}} 生成...",
          "priorityMax": "⚡ 最高优先级：{{model}} 将立即响应...",
          "videoLoaded": "🎬 视频已加载到工作室！",
          "imageLoaded": "🖼️ 图像已加载到工作室！",
          "newProject": "已启动新项目！"
        },
        "error": {
          "selectCharacterImage": "请选择角色图像。",
          "importMotionVideo": "请上传用于动作参考的视频。",
          "generation": "生成时发生错误",
          "falTimeout": "Fal.ai 请求超时。",
          "securityUnavailable": "安全验证不可用。请刷新页面后重试。",
          "videoUnavailable": "处理已完成，但视频不可用。请重试。",
          "sessionExpired": "登录会话已过期。请重新登录后再试。",
          "notLoggedIn": "错误：用户未登录或会话已过期。",
          "hailuo512Image": "Hailuo 512 需要起始图片。请添加图片后继续。",
          "hailuo512Title": "需要起始图片",
          "insufficientCredits": "积分不足！本次生成需要 {{price}} 💎。",
          "motionImages": "请添加此模型所需的动作参考图片。",
          "technicalGeneration": "生成过程中发生技术错误，请重试。",
          "deleteFailed": "无法删除此项目。",
          "deleteServerFailed": "在服务器上删除项目时发生错误。",
          "fileTooLarge": "文件“{{fileName}}”超过了{{label}}的大小限制 {{maxSize}}（当前大小：{{actualSize}}）。",
          "fileTooLargeSimple": "文件“{{fileName}}”超过了{{label}}的大小限制 {{maxSize}}。",
          "fileUploadFailed": "无法上传文件“{{fileName}}”。",
          "serverRequestFailed": "请求失败（服务器错误 {{status}}）。请稍后重试。",
          "rateLimited": "短时间内请求过多。请稍等片刻再试。",
          "requestTimeout": "请求超时，请重试。"
        },
        "history": {
          "noDescription": "无描述",
          "remix": "混编",
          "title": "创作历史",
          "remixButton": "混剪",
          "editButton": "编辑",
          "editVideoTitle": "编辑此视频"
        },
        "insufficient": {
          "diamondsMessage": "您的钻石余额不足，无法执行此操作。",
          "buyDiamonds": "🛒 购买钻石",
          "subscribeOrBuy": "🚀 订阅或购买钻石",
          "stayStudio": "留在工作室",
          "cost": "本次生成费用：{{cost}}",
          "diamonds": "可用钻石：{{count}}",
          "tokens": "可用闪电：{{count}}",
          "tokensHelp": "闪电来自订阅，钻石需单独购买。"
        },
        "edit": "编辑",
        "settings": {
          "pixverseAdvanced": "高级选项",
          "pixverseDescription": "自定义生成风格、节奏和一致性。",
          "multiShot": "多镜头／切换角度",
          "multiShotHelp": "允许在同一视频中包含多个镜头。",
          "visualStyle": "视觉风格",
          "automatic": "自动",
          "clay": "黏土",
          "comic": "漫画",
          "thinkingLevel": "思考级别",
          "enhanced": "增强",
          "fast": "快速",
          "random": "随机",
          "negativePrompt": "负面提示词",
          "negativePromptExample": "例如：模糊、伪影、卡顿动作、变形文字……",
          "addImages": "添加图片",
          "addVideos": "添加视频",
          "addAudios": "添加音频",
          "referenceImage": "参考图片 {{number}}",
          "referenceVideo": "参考视频 {{number}}",
          "referenceAudio": "参考音频 {{number}}",
          "imageEditPrecise": "精确编辑",
          "guidedComposition": "引导构图",
          "multipleReferences": "多重参考",
          "addReferenceImages": "添加参考图片",
          "imageLimitReached": "已达到图片数量上限",
          "chooseFiles": "点击以从电脑选择文件",
          "referencesAdded": "已添加的参考",
          "removeImageHint": "点击 × 移除图片",
          "noImageReferences": "尚未添加图片。参考图片为可选项，也可以仅根据提示词生成。",
          "engineSettings": "模型设置",
          "outputFormat": "输出格式",
          "optionalSeed": "可选种子",
          "imageQuality": "GPT Image 2 质量",
          "moderation": "审核",
          "standard": "标准",
          "lessRestrictive": "限制较少",
          "safetyTolerance": "安全容忍度 (0–5)",
          "thinking": "思考",
          "minimalFaster": "最低 · 更快",
          "temperature": "温度 (0–2)",
          "topP": "Top P (0–1)",
          "systemInstruction": "系统指令",
          "optional": "可选",
          "generalInstructions": "需要遵守的一般指令……",
          "referenceVideoNote": "它用于引导生成静态图片，不会将结果转换为视频。",
          "chooseVideo": "选择视频",
          "videoAdded": "已添加视频",
          "usedAsVisualReference": "它将用作图片的视觉参考。",
          "referenceTip": "提示：在提示词中说明每张图片的用途，并明确需要保留或修改的元素。",
          "tutorialEngine": "模型教程",
          "seedOptional": "Seed — 可选",
          "negativePromptLabel": "负面提示词",
          "avoidElements": "— 需要避免的元素"
        },
        "video": {
          "existingOperations": "现有视频操作",
          "extend": "延长视频",
          "edit": "编辑视频",
          "extendDescription": "描述最后一帧之后的内容。时长和结果取决于所选模型。",
          "editDescription": "描述所需更改，并说明哪些内容必须保持不变。",
          "importSourceFirst": "请先在媒体面板中导入源视频，才能使用这些操作。",
          "changeAppearance": "更改外观 · AI 滤镜与灯光",
          "addSourceForVeo": "添加源视频以启用 Veo 的“{{operation}}”模式。",
          "describeIdea": "详细描述你的想法……",
          "characters": "{{count}} 个字符",
          "changeAppearanceLabel": "AI 滤镜与灯光",
          "extendGuideTitle": "如何延长视频",
          "editGuideTitle": "如何编辑视频",
          "extendOrEditGuideTitle": "延长或编辑视频",
          "addSourceSeedance": "请先在 Seedance 2.5 面板中添加源视频，然后选择“延长视频”或“编辑视频”。",
          "extendSeedanceHelp": "描述最后一帧之后的延续动作、新出现的内容和要增加的秒数，并保持角色、场景和镜头运动一致。",
          "editSeedanceHelp": "明确说明要更改和保持不变的内容。为避免意外变化，请指定保留角色、动作、构图和原始时长。",
          "useExtendExample": "使用延长示例",
          "useEditExample": "使用编辑示例",
          "characterCount": "{{count}} 个字符"
        },
        "audio": {
          "ai": "AI 音频",
          "included": "包含音频",
          "native": "原生音频",
          "soundDesign": "声音设计",
          "unavailable": "音频不可用",
          "referenceDialogue": "参考音频与对白",
          "referenceHelp": "最多可使用 3 个音频文件引导声音。还必须在参考面板中添加图片或视频；仅使用首帧/尾帧槽位不足以使用参考音频。",
          "remove": "移除",
          "exactDialogue": "要说出的准确对白（可选）",
          "dialogueExample": "例如：角色说：“我们现在必须离开。”",
          "referenceLimit": "音频可引导声音和语气，但不保证精确复制录音。参考文件总数最多 12 个；参考音频和视频合计不得超过 15 秒。",
          "promptExpansion": "提示词扩展",
          "disabledMoreFaithful": "关闭（更忠实）",
          "balanced": "均衡",
          "qualityPriority": "优先质量",
          "seedOptional": "可选 Seed"
        },
        "badge": {
          "new": "新",
          "startEnd": "起始 + 结束",
          "topArena": "Top Arena"
        },
        "cancel": "取消",
        "cost": {
          "diamonds": "钻石",
          "diamondsLower": "钻石",
          "tokens": "闪电",
          "tokensLower": "闪电",
          "total": "总费用"
        },
        "defaultImageAlt": "生成的图片",
        "delete": {
          "button": "删除",
          "title": "确认删除"
        },
        "download": "下载",
        "duration": "时长",
        "explorer": {
          "title": "探索创作"
        },
        "formatStyle": "格式与风格",
        "generate": {
          "button": "生成",
          "imageRequired512": "此模型需要 512 格式的起始图片。",
          "imageVideoRequired": "请添加参考图片或视频以继续。",
          "inProgress": "正在生成……",
          "send": "提交生成"
        },
        "loading": {
          "generation": "正在准备生成……"
        },
        "mode": {
          "remastered": "重制"
        },
        "newDiscussion": "新建对话",
        "noSelection": "未选择项目",
        "remix": {
          "creative": "创意",
          "fidelity": "保真度",
          "strict": "严格"
        },
        "resolution": "分辨率",
        "security": {
          "sync": "正在安全同步……"
        },
        "slot": {
          "endBlocked": "此模型不支持结束图片。",
          "endImage": "结束图片",
          "endUnavailable": "结束图片不可用",
          "startBlocked": "此模型不支持起始图片。",
          "startImage": "起始图片",
          "v2vUnavailable": "此模型不支持视频转视频。",
          "videoBlocked": "此模型不支持源视频。",
          "videoSource": "源视频"
        },
        "tip": {
          "kling": {
            "text": "清楚描述动作和镜头运动。",
            "title": "Kling 提示"
          },
          "luma": {
            "text": "描述所需动作，避免提示词过于复杂。",
            "title": "Luma 提示"
          },
          "pixverse": {
            "text": "指定视觉风格、节奏和所需的镜头切换。",
            "title": "PixVerse 提示"
          },
          "seedance": {
            "text": "描述主要动作，并保持连续动作一致。",
            "title": "Seedance 提示"
          },
          "seedance25": {
            "text": "多镜头时，请明确描述每个镜头及其转场。",
            "title": "Seedance 2.5 提示"
          }
        },
        "waitingCreation": "等待生成……",
        "references": {
          "imagesTitle": "参考图片",
          "guideText": "引导作品的主体、外观、场景或风格。",
          "imageCount": "{{count}} 张图片",
          "tutorialButton": "模型教程",
          "addImages": "添加参考图片",
          "imageLimit": "已达到图片上限",
          "chooseFiles": "点击以从电脑选择文件",
          "removeToAdd": "移除一张图片以添加另一张",
          "preciseEditing": "精确编辑",
          "guidedComposition": "引导构图",
          "multipleReferences": "多重参考",
          "tutorialEngine": "模型教程",
          "images": "图片"
        }
      },
      "line3_app_ui_referenceImages": "参考图片",
      "line3_app_ui_referenceImagesUpTo3": "最多 3 张参考图片",
      "line3_app_ui_startEndFrames": "开始 / 结束",
      "line3_app_ui_editVideo": "编辑视频",
      "line3_app_ui_extendVideo": "延长视频",
      "line3_app_ui_imageToVideo": "图像 → 视频",
      "line3_app_ui_videoReference": "参考视频",
      "line3_app_ui_remix": "混剪",
      "line3_app_ui_characterImage": "角色图片",
      "line3_app_ui_motionControl": "动作控制",
      "line3_app_ui_textToVideo": "文本 → 视频",
      "line3_app_ui_referenceImageCount": "1–9 张参考图片",
      "line3_app_ui_referenceVideoCount": "1–3 个参考视频",
      "line3_app_ui_referenceAudioCount": "1–3 个参考音频",
      "line3_app_ui_generativeAudio": "生成音频",
      "line3_app_ui_thinkingLevel": "思考级别",
      "line3_app_ui_multimodalReferences": "多模态参考 — Seedance",
      "line3_app_ui_seedance25Limit": "根据所选模式，最多支持 30 张图片、10 个视频和 10 个音频",
      "line3_app_ui_seedance20Limit": "参考文件最多 12 个 · 已使用 {{count}}/12",
      "line3_app_ui_seedance25Notice": "多模态参考不能与首帧/尾帧槽位同时使用。要编辑或延长视频，请使用上方的源视频槽位；源视频槽位优先于这些参考。",
      "line3_app_ui_seedance20Notice": "多模态参考不能与首帧/尾帧槽位同时使用。源视频同时计入视频数量限制和总计 12 个文件的限制。文件必须符合服务器的大小限制。",
      "line3_app_ui_seedanceCharacterObjects": "角色、物体或场景图片",
      "line3_app_ui_seedanceNineImages": "最多 9 张图片用于引导生成结果",
      "line3_app_ui_seedanceReferenceClips": "参考片段，不包括源视频模式",
      "line3_app_ui_seedanceThreeVideos": "最多 3 个视频；已选择源视频时最多 2 个",
      "line3_app_ui_audioAmbience": "环境音、语音或声音参考",
      "line3_app_ui_referenceVideoGuidance": "这些视频用于引导动作、行为和镜头运动。",
      "line3_app_ui_buyDiamonds": "🛒 购买钻石",
      "line3_app_ui_subscribeOrBuyDiamonds": "🚀 订阅或购买钻石",
      "line3_app_ui_stayInStudio": "留在工作室",
      "terms of sale": "销售条款",
      "line3_app_error_waitSourceDuration": "为了正确计算费用，请等待检测到源视频时长后再启动编辑模式。",
      "line3_app_error_selectCharacterImage": "请选择角色图片。",
      "line3_app_error_importMotionVideo": "请导入动作参考视频。",
      "line3_app_error_securityUnavailable": "安全验证暂不可用。请刷新页面后重试。",
      "line3_app_error_generation": "生成时出错",
      "line3_app_error_generationFailed": "生成失败。",
      "line3_app_error_technicalGeneration": "生成过程中出现技术问题。",
      "line3_app_error_noResultUrl": "服务器已完成，但未返回结果 URL。请检查服务器日志。",
      "line3_app_error_insufficientCreditsVideo": "生成此视频的积分不足。",
      "line3_app_error_refundTechnical": "发生技术问题，请稍后重试。积分已退还。",
      "line3_app_error_startAndSourceRequired": "需要起始图片和源视频",
      "line3_app_error_startImageFor512": "使用 512p 分辨率需要添加起始图片",
      "line3_app_error_deleteCreation": "删除此作品？",
      "line3_app_error_diamondsInsufficient": "钻石余额不足，无法执行此操作。",
      "line3_app_status_generationFinalizing": "正在完成生成……",
      "line3_app_status_fileImported": "文件已导入",
      "app.status.newProject": "已启动新项目！",
      "line3_app_status_videoLoaded": "🎬 视频已加载到工作室！",
      "line3_app_status_imageLoaded": "🖼️ 图片已加载到工作室！",
      "line3_app_ui_seedanceOperation": "源视频操作：",
      "line3_app_ui_extend": "延长",
      "line3_app_ui_modify": "修改",
      "line3_app_ui_seedanceExtendHelp": "延长：添加源视频，然后在提示词中描述最后一帧之后发生的内容。所选时长为额外增加的时长。",
      "line1_app_file_kind_image": "一张图片",
      "line1_app_file_kind_video": "一个视频",
      "line1_app_file_kind_audio": "一个音频文件",
      "line1_app_file_kind_other": "此文件",
      "line1_app_status_prepareImage": "正在准备图片",
      "line1_app_status_stageVideo": "正在构建视频场景",
      "line1_app_prompt_seedanceExtendSource": "描述视频结束后应该发生什么……（例如：将场景延续 5 秒……）",
      "line1_app_prompt_seedanceEditSource": "准确描述要修改的视频内容以及必须保持不变的部分……",
      "line1_app_prompt_veoExtendSource": "描述视频最后一帧之后应该发生什么……",
      "line1_app_prompt_veoEditSource": "描述要对视频进行的更改以及必须保持不变的内容……",
      "line1_app_prompt_minimaxExtendSource": "描述如何从最后一帧之后继续视频……",
      "line1_app_prompt_minimaxEditSource": "描述要修改的视频内容，同时保留其他部分……",
      "line1_app_prompt_pixverseSourceChanges": "描述要应用于源视频的更改以及需要保留的元素……",
      "line1_app_video_hailuoProLimit": "⚠️ 专业模式：限制为 6 秒",
      "line1_app_video_hailuoStandardLimit": "✅ 标准模式：最长 10 秒",
      "line1_app_audio_nativeEnabled": "已启用原生音频",
      "line1_app_audio_nativeDisabled": "已关闭原生音频",
      "line1_app_settings_high": "高",
      "line1_app_settings_systemInstruction": "系统指令",
      "line1_app_settings_optional": "可选",
      "line1_app_settings_referenceVideoTitle": "参考视频",
      "line1_app_settings_referenceVideo": "参考视频 {{number}}",
      "line1_app_settings_oneVideoMaximum": "可选 · 最多 1 个",
      "line1_app_settings_chooseVideo": "选择视频",
      "line1_app_settings_visualStyle": "视觉风格",
      "line1_app_settings_imageQualityFastLow": "快速 / 低",
      "line1_app_settings_imageQualityHigh": "高",
      "line1_app_settings_moderationStandard": "标准",
      "line1_app_settings_moderationLessRestrictive": "限制较少",
      "line3_app_settings_referenceImages": "参考图片",
      "line1_app_references_maxImagesH3": "最多 9 张参考图片",
      "line1_app_references_referenceAppearanceHelp": "用于引导人物、物体或场景的外观。",
      "line1_app_references_selectedImagesCount": "已选择 {{count}} 张图片",
      "line1_app_references_referenceVideos": "参考视频",
      "line1_app_references_videoFormatsLimit": "MP4 或 MOV — 包含源视频最多 3 个",
      "line1_app_references_referenceImageSlot": "图片 {{number}}",
      "line1_app_references_referenceVideoSlot": "视频 {{number}}",
      "line1_app_references_addMedia": "添加",
      "line1_app_references_imageFormatsMaximum": "图片格式 · 最多 {{max}} 个文件",
      "line1_app_references_removeReferenceImage": "移除参考图片 {{number}}",
      "line1_tutorial_tab_guide": "📘 文字指南",
      "line1_tutorial_tab_resources": "📚 资源",
      "line1_tutorial_tab_prompts": "✨ 可直接复制的提示词",
      "line1_cost_full_hd_diamonds": "Full HD 模式：钻石",
      "line1_cost_end_image": "结束图片",
      "line1_cost_ai_audio": "AI 音频",
      "line3_app_ui_seedanceEditHelp": "编辑：添加源视频，然后描述要更改的内容和需要保留的元素。编辑后的视频保持源视频时长。",
      "line4_badge_text_to_image": "文本 → 图像",
      "line4_badge_image_to_image": "图像 → 图像",
      "line4_badge_up_to_16_refs": "最多16个参考项",
      "line4_badge_up_to_9_refs": "最多9个参考项",
      "line4_badge_up_to_14_images": "最多14张图片",
      "line4_badge_one_reference_video": "1个参考视频",
      "line4_badge_adjustable_reasoning": "可调节推理",
      "line4_badge_adjustable_quality": "可调节画质",
      "line4_badge_adjustable_moderation": "可调节内容审核",
      "line4_badge_safety_tolerance": "安全容差 0–5",
      "line4_badge_text_to_video": "文本 → 视频",
      "line4_badge_image_to_video": "图像 → 视频",
      "line4_badge_reference_images": "参考图片",
      "line4_badge_reference_video": "参考视频",
      "line4_badge_reference_audio": "参考音频",
      "line4_badge_edit_video": "编辑视频",
      "line4_badge_extend_video": "延长视频",
      "line4_badge_up_to_3_videos": "最多3个视频",
      "line4_badge_up_to_3_audio": "最多3个音频",
      "line4_badge_up_to_9_images": "最多9张图片",
      "line4_badge_start_end_images": "起始 / 结束图片",
      "line4_badge_native_audio_lipsync": "原生音频与口型同步",
      "line4_badge_audio": "音频",
      "line4_badge_multishot": "多镜头",
      "line4_badge_4_30_seconds": "4–30秒",
      "line4_badge_4_15_seconds": "4–15秒",
      "line4_badge_4_12_seconds": "4–12秒",
      "line4_badge_1_15_seconds": "1–15秒",
      "line4_tutorial_model_title": "{{model}} 教程 — 指南、视频和提示词",
      "line4_prompt_characters": "字符",
      "line4_remove_media": "移除{{media}} {{number}}",
      "line5_prompt_veo_extend": "从源视频的最后一帧自然延续，再增加7秒。人物继续沿着森林小路行走，随后进入阳光照射的林间空地。保持人物、服装、环境、光线、镜头运动和电影风格一致。确保衔接流畅，不要突然切镜。",
      "line5_prompt_veo_edit": "只修改源视频的光线，将白天场景变为带有柔和蓝色月光的电影感夜景。保持人物、动作、环境、构图、镜头运动和视觉连续性不变。不要更改其他内容。",
      "line5_prompt_seedance_extend": "从@Video1的最后一帧之后立即继续生成5秒。人物继续行走并进入林间空地。保持人物、服装、场景、光线、镜头运动和视觉风格一致。衔接应自然流畅，不要突然切镜或改变人物身份。",
      "line5_prompt_seedance_edit": "编辑@Video1：只改变光线，将白天场景转换为带有柔和月光的电影感夜景。保持人物及其动作、场景、构图、镜头运动和原始时长不变。不要更改其他内容。",
      "line6_suggestions_video_1_prompt": "身穿精细铠甲的孤独武士站在长草覆盖的山丘上，眺望远处日本城市上空炽烈的红色夕阳。强风吹动他的衣服和草丛。氛围史诗而忧郁，天空布满明亮的戏剧性云层。镜头从武士背后的中景开始，快速、平稳地向后移动，展现山谷和城市，随后围绕人物进行轻微的180度环绕，形成电影感结尾。高反差黄金时刻光线、真实镜头眩光、电影景深、极致写实，日本大片风格。",
      "line6_suggestions_video_2_prompt": "一名紫发的年轻赛博朋克女性走在雨水打湿、充满活力的韩国小巷中。先以靴子缓慢踩过湿润柏油路的极近特写开场，水坑映出缤纷霓虹。镜头跟随她的脚步平稳后退。一秒后，镜头沿着她的双腿、战术装备和旧外套逐渐上移。她双手插袋，自信地继续前行。镜头升至面部，并展现整条小巷：发光的韩文招牌、从井盖升起的蒸汽，以及背景中的行人。真实的赛博朋克氛围、自然动作、电影灯光和景深、湿地反射、超写实8K电影质感、极致细节。",
      "line6_suggestions_video_3_prompt": "深夜，浓雾笼罩着阴暗森林。一名惊恐的女性沿着狭窄泥泞的小路全速奔跑，小路蜿蜒穿过枯树和纠缠的树枝。她的衣服肮脏破损，脸上沾着汗水和泥土，满是恐惧。她紧握手电筒，光束穿透浓雾。呈现自然可信的跑步动作、准确的落脚和重心转移、轻微呼吸，以及随动作自然摆动的头发和衣物。禁止慢动作。以贴近地面的戏剧性低机位跟拍开始，她朝镜头奔来；湿树根、飞溅的泥土和断枝快速掠过前景。手电光扫过树木，在雾中形成移动阴影和立体光效。她继续逃跑时，镜头平稳升高并后退，逐渐切换到高空俯拍，揭示广阔而孤立的森林。她变成黑暗中微小的身影。宏大的航拍镜头、流动的浓雾、真实的空气透视、月光穿过树冠。超写实恐怖惊悚氛围、电影灯光、真实手电照明、自然镜头运动、细节丰富的森林和湿地反射、HDR、持续紧张感、好莱坞长片级8K细节。",
      "line6_suggestions_video_4_prompt": "在茂密森林改造成的竞赛赛道上展开一段极具动感的电影镜头。两只细节丰富的拟人化兔子在狭窄土路上全力冲刺。穿蓝色T恤和背包的白兔领先，穿红色T恤的灰兔紧随其后，神情坚定。镜头贴近地面高速向前跟拍，略微晃动，呈现专业竞速摄影的感觉。突出速度，四肢带有动态模糊，每次跨步都会扬起尘土颗粒。道路两侧植被茂盛，背景中的动物观众因浅景深而模糊。极限运动风格、决赛般的紧张气氛、阳光穿过树木形成戏剧性金色光线、高预算3D动画电影般的超写实效果，紧张感和能量达到顶峰。",
      "line6_suggestions_video_5_prompt": "一名孤独的宇航员漂浮在地球上方的深空中。以极广角镜头开场，展现浩瀚宇宙、地球弧线，以及画面中央渺小的宇航员。镜头平稳而快速地向宇航员推进。随着距离拉近，宇航服细节逐渐清晰，阳光在头盔面罩上反射。到达中景距离后，镜头围绕宇航员进行180度环绕，先展示身后的地球，再转向布满星星的深空。运动绝对稳定，失重感可信，宇宙照明和物理反射真实，IMAX品质、极致写实、电影景深、8K、大制作太空纪录片风格、自然动态模糊、超精细细节，营造宏大而沉思的氛围。",
      "line7_suggestions_video_6_prompt": "动画风格：一名女子坐在公园长椅上，一只猫爬到她的膝盖上，她轻轻抚摸着猫。",
      "line7_suggestions_video_7_prompt": "超写实场景：一间略显凌乱的豪华酒店客房。一名金发女子坐在床上，黑色妆容覆盖了她眼睛周围的大部分区域。镜头缓慢向前推进，最终特写她显得筋疲力尽的脸。",
      "line7_suggestions_video_8_prompt": "流动的金色液体、磁力波纹、奢华感、抽象3D艺术。",
      "tutorials": {
        "image": {
          "gpt_image2": {
            "objective": "精准生成图像或编辑现有图像，同时保留重要元素。",
            "features": [
              "最多支持16张参考图。",
              "为人物、服装、场景、颜色和风格等参考内容指定明确用途。",
              "清楚说明需要修改和必须保留的部分。"
            ],
            "steps": [
              "将需要的图片添加到参考区，并为每张图片指定用途。",
              "说明如何组合不同参考图。",
              "指定构图、光线、材质以及需要保留的细节。",
              "编辑现有图片时，明确列出不得改变的内容。",
              "检查生成结果，只针对需要修正的部分继续调整。"
            ],
            "prompt": "使用图像1作为[主体/身份]的主要参考；图像2参考[服装/颜色/风格]，图像3参考[场景/构图]（如有）。生成[目标结果]。保留[需要保留的元素]，只修改[需要修改的元素]。构图：[景别与布局]。光线：[光线]。材质与细节：[细节]。不要添加未要求的元素，并保持整体一致。"
          },
          "flux2pro": {
            "objective": "生成构图可控、细节精确且参考视觉保持一致的图像。",
            "features": [
              "最多支持9张参考图。",
              "适合控制构图、材质和视觉一致性。",
              "分别指定主体、配色、纹理和环境参考。"
            ],
            "steps": [
              "添加最多9张清晰且互补的参考图。",
              "为主体、配色、材质和环境等内容分别指定参考图。",
              "说明构图以及各元素的相对位置。",
              "指定纹理、光线和必须保持一致的细节。",
              "如果构图或材质不理想，请调整提示词后重新生成。"
            ],
            "prompt": "使用图像1参考主体和轮廓，图像2参考配色与材质，图像3参考环境与构图（如有）。生成[场景]。构图：[布局与机位]。材质：[纹理]。光线：[光线]。保留[关键细节]。避免无关物体、人体结构错误以及主体身份发生变化。",
            "resourceUrl": "https://runware.ai/models/bfl-flux-2-pro",
            "resourceLabel": "Fiche du modèle sur Runware"
          },
          "nano_banana2_lite": {
            "objective": "结合多张视觉参考快速创建或转换图像，必要时也可使用参考视频。",
            "features": [
              "最多支持14张图片和1段参考视频。",
              "为每个参考指定清晰用途。",
              "在支持的视频模式中，可用视频参考动作或整体氛围。",
              "明确区分需要修改与必须保留的元素。"
            ],
            "steps": [
              "在网格中添加最多14张参考图，并分别标注人物、物体、场景或风格等用途。",
              "所选模式支持时，再添加参考视频。",
              "说明各参考内容应如何组合。",
              "具体说明哪些内容要修改、哪些内容必须保持不变。",
              "指定构图、光线、颜色和输出风格。",
              "检查结果，只修正不符合要求的部分。",
              "查看模型信息，确认当前模式支持的输入类型。"
            ],
            "prompt": "图像1参考[主体/身份]，图像2参考[场景/风格]，图像3参考[颜色/物体]（如有）。如果模式支持，可从参考视频中借鉴[动作/氛围]。生成[目标结果]。保留[需要保留的特征]，只应用[指定修改]。构图：[构图]。光线：[光线]。风格：[风格]。",
            "resourceUrl": "https://runware.ai/models/google-nano-banana-2-lite",
            "resourceLabel": "Fiche du modèle sur Runware"
          }
        },
        "video": {
          "default": {
            "objective": "所选视频引擎的入门指南。",
            "features": [
              "请以 Ovortex 界面中显示的选项为准。"
            ],
            "steps": [
              "根据可用选项选择“文本生成视频”或“图像生成视频”。",
              "清楚描述一个主要动作和发生地点。",
              "指定景别、镜头运动、光线和氛围。",
              "使用图片时，说明哪些视觉特征必须保持一致。",
              "生成初稿后，根据结果调整提示词。"
            ],
            "prompt": "视频方案：[主体]在[地点]执行[具体动作]。景别：[镜头类型]。镜头：[运动方式]。光线：[光线]。氛围：[基调]。时长：[时长]。保持[连续性细节]。动作自然、物理效果合理，不出现无关剪辑或额外人物。"
          },
          "veo3.1": {
            "objective": "Veo 3.1：使用参考图、原生音频以及支持的源视频操作来控制场景。",
            "features": [
              "Veo 面板最多可添加3张参考图，用于引导人物、物体和场景外观。",
              "原生音频是否可用取决于所选模式。",
              "源视频操作取决于 Ovortex 中启用的选项。",
              "请明确描述要求，以保持画面连续性。"
            ],
            "steps": [
              "添加最多3张参考图，并分别指定人物、场景或物体等用途。",
              "将动作描述为连续且可拍摄的镜头。",
              "按需指定镜头运动、景别、光线、声音或对白。",
              "处理源视频时，只说明希望修改的部分。",
              "检查人物身份、服装和环境是否保持一致。"
            ],
            "prompt": "创建一段[时长]的电影感镜头：[人物/主体]在[场景]中执行[动作]。参考图1：保持[人物外观]。参考图2：参考[场景]。参考图3：参考[物体/风格]。镜头：[运动]。光线：[光线]。音频：[需要的声音/对白]。保持连续性和自然动作。"
          },
          "veo3.1_fast": {
            "objective": "Veo 3.1 Fast：使用提示词和最多3张参考图快速生成视频。",
            "features": [
              "通过 Veo 面板最多添加3张参考图。",
              "适合快速尝试和迭代创意。",
              "动作描述应简单清晰。",
              "使用参考图保持预期外观。"
            ],
            "steps": [
              "需要快速试做时选择此模型。",
              "描述一个主要动作和一个地点。",
              "需要时添加最多3张参考图。",
              "指定构图、镜头运动和光线。",
              "检查视频并调整提示词。"
            ],
            "prompt": "电影感短片：[主体]在[地点]执行[单一动作]。使用参考图保持[外观/物体/风格]。景别：[构图]。镜头：[运动]。光线：[光线]。氛围：[氛围]。动作自然，细节保持一致。"
          },
          "seedance25": {
            "objective": "Seedance 2.5：利用多模态参考创作视频，或编辑、延长源视频。",
            "features": [
              "根据模式，最多可使用30张参考图、10段视频和10个音频文件。",
              "为每个参考素材指定明确用途。",
              "支持的模式可编辑或延长源视频。",
              "请确认 Ovortex 当前选择的模式和输入类型。"
            ],
            "steps": [
              "添加人物、服装、道具和地点等参考图。",
              "支持时添加用于动作或镜头语言的参考视频。",
              "只有所选模式支持时才添加音频参考。",
              "说明时间顺序以及每项参考对结果的作用。",
              "编辑或延长视频时，明确要保留和修改的内容。"
            ],
            "prompt": "使用提供的媒体创建一段[时长]的视频。人物参考：[身份与服装图片]。场景参考：[地点图片]。动作参考：[视频与动作]。音频参考：[可用声音]。动作顺序：[动作阶段]。镜头：[运动]。保持人物、服装、光线和连续性，只修改[指定内容]。"
          },
          "seedance20": {
            "objective": "Seedance 2.0：组合图像、视频和音频参考来控制生成过程。",
            "features": [
              "最多9张图片、3段视频、3个音频，总计最多12个文件。",
              "图片可用于参考人物、道具或场景。",
              "支持的模式可用视频参考动作、用音频参考声音。",
              "在提示词中明确说明每项参考的用途。"
            ],
            "steps": [
              "添加人物、道具或场景图片；模式支持时可添加动作视频和音频。",
              "确保文件总数不超过当前模式的限制。",
              "在提示词中说明每项参考的用途。",
              "按时间顺序清晰描述动作。",
              "检查人物身份、动作和音频的一致性。"
            ],
            "prompt": "按参考素材的用途生成连贯视频：图像1=[人物]，图像2=[场景]，图像3=[物体/风格]，视频1=[动作]，音频1=[支持时使用的声音]。动作：[序列]。镜头：[运动]。保持人物身份和视觉风格一致。"
          },
          "seedance": {
            "objective": "Seedance 1.5 Pro：生成带原生音频和口型同步的视频，或利用起始帧与结束帧控制转场。",
            "features": [
              "原生音频和口型同步取决于 Ovortex 显示的引擎设置。",
              "支持的模式可用起始图和结束图引导转场。",
              "请明确描述对白、情绪和说话节奏。"
            ],
            "steps": [
              "用清晰连贯的顺序描述人物、对白或声音以及动作。",
              "将准确对白放在引号中。",
              "指定情绪、说话节奏和镜头运动。",
              "使用起止图时，说明希望实现的转场。",
              "检查对白与动作是否同步。"
            ],
            "prompt": "音画同步镜头：[人物]位于[场景]中，执行[动作]并以[情绪]和[语速节奏]说出“[准确对白]”。镜头：[运动]。声音：[环境声/音效]。保持自然口型同步、外观一致和场景连贯。"
          },
          "kling2.6": {
            "objective": "Kling 2.6 Pro：根据引擎配置生成动作受控的 Full HD 视频，并可按配置生成音频。",
            "features": [
              "Ovortex 配置的时长为1080p下5秒或10秒。",
              "图像生成视频时，清晰的源图有助于保持主体外观。",
              "请描述一段连贯、容易理解的动作。"
            ],
            "steps": [
              "图像生成视频时，选择主体轮廓清晰的图像。",
              "描述从开始到结束的动作。",
              "指定镜头运动和环境反应。",
              "保持人物身份、面部、服装和场景一致。",
              "避免在同一段视频中要求多个无关动作。"
            ],
            "prompt": "基于输入图像，保持人物身份、面部、服装和场景不变。[主体]执行[一段连贯动作]。镜头：[运动]。环境：[反应]。光线：[光线]。物理效果自然、外观稳定、动作流畅。"
          },
          "kling26_motion": {
            "objective": "Kling 2.6 Motion Control：将参考视频中的动作迁移到提供的人物图像上。",
            "features": [
              "主要输入为动作源视频和需要动画化的人物图片。",
              "人物身体越清晰可见，动作迁移越容易。",
              "保持人物身份和身体比例一致。"
            ],
            "steps": [
              "导入尽可能显示完整身体的人物图，避免重要肢体被裁切。",
              "添加包含目标动作的源视频。",
              "确认图片与视频中的姿势和构图相匹配。",
              "说明必须保留的外观特征。",
              "检查身体比例和动作连续性。"
            ],
            "prompt": "将源视频中的动作迁移到参考图中的人物。保持人物身份、面部、服装和身体比例。尽可能忠实地跟随源视频动作。保持背景和视觉风格一致，动作自然，不出现不必要的变形。"
          },
          "kling30": {
            "objective": "Kling 3.0：使用起始图和结束图时，可控制视频两端并生成连续镜头。",
            "features": [
              "目录中提供的时长为3至15秒。",
              "支持时可用起始图和结束图引导转场。",
              "描述连接两种状态的中间动作。"
            ],
            "steps": [
              "根据起点选择文本或图像模式。",
              "需要控制视频首尾时，添加起始图和结束图。",
              "说明主体如何从初始状态转变为最终状态。",
              "指定镜头运动、光线和节奏。",
              "检查转场是否连续、主体身份是否一致。"
            ],
            "prompt": "在起始图和结束图之间创建连续转场。[主体]通过[动作]从[初始状态]转变为[最终状态]。镜头：[运动]。节奏：[速度]。光线：[光线]。保持主体身份，转场流畅且符合物理规律。"
          },
          "hailuo": {
            "objective": "Hailuo 2.3：重点呈现真实动作、面部表情和主体连续性。",
            "features": [
              "Ovortex 目录提供768p或1080p的6秒视频，以及768p的10秒视频。",
              "动画化现有图片时，清晰的主体轮廓很有帮助。",
              "具体描述动作和面部表情。"
            ],
            "steps": [
              "动画化现有图片时，选择轮廓清晰的图像。",
              "描述身体动作和目标情绪。",
              "说明头发、服装和环境如何随动作自然变化。",
              "让镜头运动简洁且有明确目的。",
              "检查表情和身体动作是否自然。"
            ],
            "prompt": "[人物]带着[情绪]表情执行[身体动作]。头发、服装和环境元素自然地随动作变化。镜头：[运动]。光线：[光线]。表情真实、身体结构合理、动作自然、外观一致。"
          },
          "minimax_h3": {
            "objective": "MiniMax H3：在相应选项可用时，结合多模态参考和精细的场景控制。",
            "features": [
              "目录提供4至15秒的时长。",
              "使用图片参考人物身份或场景。",
              "视频和音频输入取决于所选模式。",
              "明确每项参考的用途和动作时序。"
            ],
            "steps": [
              "根据所选模式，用图片引导人物或场景，并用支持的视频/音频素材引导相应元素。",
              "按时间顺序描述整个动作序列。",
              "指定镜头、光线和节奏。",
              "说明必须保持一致的细节。",
              "检查整个场景的连续性。"
            ],
            "prompt": "创建一段[时长]的视频。主体：[人物/物体]。图片参考用于[身份/场景]，视频参考用于[动作]，支持时音频参考用于[声音]。动作：[时间顺序]。镜头：[运动]。保持连续性、视觉身份和自然动作。"
          },
          "pixverse6": {
            "objective": "PixVerse V6：调整工作室中可用的时长、画质、多镜头结构和创意设置。",
            "features": [
              "可选时长为1至15秒。",
              "多镜头结构可将不同动作阶段分成独立镜头。",
              "通过工作室控件选择可用的画质和创意设置。",
              "保持镜头之间的连续性。"
            ],
            "steps": [
              "根据镜头数和动作数量选择时长。",
              "将场景拆分成目的明确的镜头。",
              "分别描述每个镜头的构图和镜头运动。",
              "说明镜头之间的动作衔接和视觉连续性。",
              "检查最终节奏和转场。"
            ],
            "prompt": "多镜头序列：镜头1 — [主体与动作]，构图[构图]。镜头2 — [动作发展]，镜头[运动]。镜头3 — [最终结果]，构图[构图]。保持人物、服装、场景和光线连续。时长：[时长]。风格：[风格]。"
          }
        }
      }
    ,
      "engineAnnotations": {
              "kling26_motion": "将参考视频中的动作迁移到图片人物上",
              "kling30": "Kling 3.0 — Standard 720p / Pro 1080p",
              "hailuo": "超逼真的动作效果",
              "pixverse6": "PixVerse V6 — 360p 至 1080p，1–15 秒，支持音频和多镜头",
              "seedance25": "Seedance 2.5 — 图像/视频/音频参考、编辑与延长，4–30 秒",
              "seedance20": "Seedance 2.0 — 最多 9 张参考图、3 段视频和 3 段音频",
              "seedance": "原生音频与口型同步",
              "gpt_image2": "图像生成与编辑，最多支持 16 张参考图",
              "flux2pro": "FLUX.2 Pro — 使用最多 9 张参考图进行引导式编辑",
              "nano_banana2_lite": "快速生成和编辑图像，最多支持 14 张参考图"
      }}
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  });

export default i18n;
