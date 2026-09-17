import Navbar from './Navbar'; 
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './App.css';
import logoEclipse from './assets/logo-eclipse.webp';
import LandingPage from './LandingPage';
import TermsPage from './TermsPage'; 
import PrivacyPage from './PrivacyPage'; 
import AuthModal from './AuthModal'; 
import TokenManager from './TokenManager';
import logoEclair from './assets/logo-token.webp';
import Pricing from './Pricing'; 
import { PRICING_DATA, PLAN_TO_PRICE, packs, ALLOWED_ENGINES } from "./pricingConfig";
import { auth, db, createUserProfile, syncCreditsToDB } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import MyHistoryPage from './MyHistoryPage'; 
import Success from "./Success";
import ProfilePage from './ProfilePage';
import PrivacyPolicyPage from './PrivacyPolicyPage'; 

import CgvPage from './CgvPage';
import LegalNoticePage from './LegalNoticePage';

import VideoPreview from "./VideoPreview";
import DevelopersPage from './DevelopersPage';
import ContactModal from './ContactModal';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc } from "firebase/firestore";
import './i18n';

const SUGGESTIONS = [
  { 
    id: 1, 
    title: "Ville Cyberpunk", 
    prompt: "Une vue de central park cyberpunk futuriste avec des néons, un éclairage cinématographique, 8k, ultra détaillé", 
  img: "/videos/Ville-Cyberpunk.webp", 
  url: "/videos/Ville-Cyberpunk.webp"},   
  
  { 
    id: 2, 
    title: "Sniper", 
    prompt: "Un sniper en tenue de camouflage neige, allongé dans la neige profonde, haute montagne, réalisme extrême, angle de vue au ras du sol, focus net sur le fusil, ambiance hivernale hostile, lumière crue de haute altitude", 
  img: "/videos/Sniper.webp", 
  url: "/videos/Sniper.webp"}, 
  { 
    id: 3, 
    title: "Coucher de soleil", 
    prompt: "Un crabe sur un rocher observe le coucher de soleil sur une plage. La mise au point de la plage est légèrement floutée.",
    img: "/videos/Coucher-de-soleil.webp", 
    url: "/videos/Coucher-de-soleil.webp"},
  { 
    id: 4, 
    title: "Combat dans les ruines urbaines", 
    prompt: "Scène ultra réaliste, Une femme tactique aux cheveux bleus atterrit sur le sol dans un environnement d'immeuble en ruine, le regard perçant et concentré. Sa veste flotte dans les airs alors qu'elle vise le spectateur.", 
     img: "/videos/Combat.webp", 
     url: "/videos/Combat.webp"},
  { 
    id: 5, 
    title: "Femme dans un penthouse nocturne", 
    prompt: "Illustration anime cinématographique, personnage féminin antagoniste en pied, debout dans un luxueux bureau de penthouse moderne de nuit, braquant un pistolet directement vers la caméra, posture dominante et menaçante, contre-plongée marquée, veste de costume noire élégante, chemise noire ajustée légèrement ouverte au col, pantalon noir cintré, chaîne métallique discrète à la ceinture, une main dans la poche, coupe de cheveux courte dégradée noire, yeux rouges lumineux, peau pâle, expression froide et déterminée, éclairage dramatique, détails ultra-réalistes du visage et des cheveux, sol en marbre noir brillant, grand bureau de direction à l’arrière-plan, fauteuil en cuir, immenses baies vitrées donnant sur une ville illuminée la nuit, reflets réalistes sur les surfaces, ambiance sombre et sophistiquée, style néo-noir, ombres cinématographiques, style anime réaliste, qualité chef-d’œuvre, netteté extrême, éclairage volumétrique, profondeur de champ, contraste élevé, illustration conceptuelle professionnelle, qualité 8K, atmosphère de thriller d’action.", 
     img: "/videos/penthouse-nocturne.webp", 
     url: "/videos/penthouse-nocturne.webp"},
  { 
    id: 6, 
    title: "Anime", 
    prompt: "Style anime, une jeune femme aux longs cheveux blonds ondulés et aux yeux jaune d'or, assise au centre d'un banc de parc en bois vert. Elle a un bandage elle porte une veste verte ouverte sur un uniforme sombre orné de boutons dorés et d'une écharpe rouge et noire. Un badge rouge est visible sur sa manche. Ses mains sont posées sur ses genoux sur une jupe plissée blanche. Elle se trouve dans un parc. Elle regarde directement l'observateur avec une expression sérieuse.", 
     img: "/videos/Anime1.webp", 
     url: "/videos/Anime1.webp"},
  { 
    id: 7, 
    title: "L'Île sous la Pleine Lune", 
    prompt: "Magnifique temple asiatique traditionnel composé de plusieurs pagodes illuminées, situé au bord d'un lac parfaitement calme reflétant l'ensemble de la scène. Immense pleine lune dorée dominant le ciel, reflet complet de la lune dans l'eau. Vallée montagneuse spectaculaire avec falaises verticales majestueuses enveloppées de brume. Forêt d'automne aux couleurs chaudes orange, rouge et or entourant le temple. Lanternes lumineuses créant une ambiance mystique et chaleureuse. Brouillard cinématographique flottant entre les montagnes. Architecture asiatique richement détaillée avec toitures courbées, bois sculpté et éclairages traditionnels. Atmosphère paisible, féerique et spirituelle. Éclairage volumétrique, rayons lumineux subtils, reflets ultra réalistes sur l'eau, composition symétrique parfaite, profondeur de champ naturelle, couleurs riches et contrastées, photoréalisme extrême, ultra detailed, masterpiece, cinematic fantasy landscape, HDR, global illumination, ray tracing, Unreal Engine quality, 8K, ultra sharp focus, highly detailed textures, professional landscape photography, breathtaking scenery, panoramic composition, golden moonlight, realistic mist, award-winning photography.", 
    img: "/videos/Lune.webp",
     url: "/videos/Lune.webp"},
  { 
    id: 8, 
    title: "3D", 
    prompt: "Un immense trône royal recouvert de velours rouge et d'ornements dorés richement sculptés, décoré de motifs héraldiques et de statues de lions. Un rat majestueux dort paisiblement sur le trône comme un roi, portant une couronne incrustée de pierres précieuses bleues et dorées. Il tient un sceptre royal délicatement entre ses pattes. L'environnement est une ancienne cathédrale gothique en ruine, avec de gigantesques arches en pierre, des colonnes monumentales et des débris dispersés au sol. De puissants rayons de lumière traversent les hautes fenêtres, illuminant le rat et le trône dans une ambiance sacrée et dramatique. Particules de poussière flottant dans les faisceaux lumineux. Textures ultra détaillées du velours, du bois sculpté, de la pierre ancienne et de la fourrure du rat. Atmosphère cinématographique, fantasy médiévale réaliste, photoréalisme extrême, profondeur de champ naturelle, éclairage volumétrique, ray tracing, HDR, global illumination, Unreal Engine 5 quality, ultra realistic, masterpiece, highly detailed, 8K, cinematic fantasy, dramatic lighting, award-winning photography.", 
    img: "/videos/3D.webp",
     url: "/videos/3D.webp"},
  { 
    id: 9, 
    title: "Submersion aquatique", 
    prompt: "Guerrier samouraï japonais vu de profil sur le côté droit de l'image, regard déterminé dirigé vers l'horizon. Cheveux noirs attachés en chignon traditionnel, barbe légère, kimono sombre richement texturé, katana visible à la ceinture. Derrière lui apparaît son double spirituel entièrement composé d'eau cristalline et de fluides translucides. Le personnage aquatique est inversé et regarde dans la direction opposée, créant un contraste visuel fort. Silhouette d'eau formée de vagues, éclaboussures, filaments liquides et gouttelettes suspendues. Fond abstrait composé d'encres bleues, bleu nuit, gris et blanc, avec effets aquarelle et projections de peinture. Atmosphère mystique, spirituelle et contemplative. Éclairage cinématographique dramatique, détails extrêmes sur le visage, les cheveux, le tissu et l'eau. Reflets réalistes, transparence parfaite, textures ultra détaillées, composition artistique haut de gamme, concept art photoréaliste, masterpiece, ultra realistic, cinematic lighting, volumetric lighting, fantasy realism, hyper detailed, 8K, HDR, sharp focus, award-winning digital art.", 
     img: "/videos/Submersion.webp",
     url: "/videos/Submersion.webp"},
  { 
    id: 10, 
    title: "forêt sombre", 
    prompt: "Femme terrifiée courant dans une forêt sombre et dense, brouillard épais enveloppant les arbres morts et les branches cassées, ambiance de thriller ou d’horreur. Elle tient une lampe torche qui projette un faisceau de lumière perçant la brume, mettant en valeur son visage paniqué et son corps couvert de boue et de traces de lutte. Vêtements déchirés et salis par la course et les obstacles naturels. Lumière dramatique, atmosphère oppressante, humidité et texture réaliste du sol forestier, feuilles et branches détaillées. Arbres hauts et fins, profondeur de champ naturelle, textures ultra détaillées sur le visage, les vêtements et le sol. Photographie cinématographique en style thriller d’horreur, ultra réaliste, HDR, 8K, contraste élevé, réalisme extrême, maîtrise de la lumière et des ombres.", 
     img: "/videos/Foret-sombre.webp",
     url: "/videos/Foret-sombre.webp"},
  { 
    id: 11, 
    title: "Magazine", 
    prompt: "Femme blonde assise avec assurance sur le capot d'une voiture ancienne couleur crème des années 1960, vue en contre-plongée dramatique. Elle porte une combinaison verte élégante et des bottes militaires beiges à lacets. Une jambe est tendue vers l'objectif, mettant en valeur la semelle de la chaussure au premier plan. Expression sérieuse et regard direct vers la caméra. Route bordée de quelques palmiers espacés, lumière dorée du coucher de soleil, ambiance californienne. Reflets réalistes sur la carrosserie chromée de la voiture vintage. Profondeur de champ cinématographique, détails ultra nets sur le visage, les vêtements et le véhicule. Éclairage naturel golden hour, ombres douces, couleurs réalistes, photographie de mode haut de gamme, composition professionnelle, ultra-réaliste, 8K, HDR, photoréalisme extrême, texture de peau détaillée, objectif grand-angle 24 mm, qualité magazine de luxe.", 
     img: "/videos/Magazine.webp", 
    url: "/videos/Magazine.webp"},
  { 
    id: 12, 
    title: "Intégration décors", 
    prompt: "Modifie la photo en rajoutant, un manteau gris foncé et d'une longue jupe plissée vert forêt. Pose : Elle se tient debout sur un chemin pavé, une main dans la poche de son manteau, adoptant une pose élégante et légèrement tournée vers l'objectif. Décor : La scène se déroule à Central Park en automne, avec des arbres aux feuillages orangés et dorés encadrant la vue, et la silhouette des gratte-ciel new-yorkais visible en arrière-plan. Détails d'ambiance : Le sol est parsemé de feuilles mortes et de quelques pages de livres, créant une atmosphère poétique et mélancolique. Élément supplémentaire : Dans le coin supérieur gauche, une petite vignette encadrée montre un gros plan portrait de la même femme sous un angle différent.", 
     img: "/videos/Intégration-décor.webp", 
    url: "/videos/Intégration-décor.webp"},
  { 
    id: 13, 
    title: "Marketing", 
    prompt: "Portrait beauté ultra-réaliste d'une femme blonde aux yeux verts, regard intense face caméra, taches de rousseur naturelles, lèvres brillantes bordeaux, maquillage professionnel haut de gamme, tenant un rouge à lèvres rose près de son visage, ongles rouges élégants, boucles d'oreilles dorées, éclairage rouge dramatique, ambiance luxe et glamour, peau lumineuse avec texture réaliste, photographie cosmétique premium, publicité de marque de maquillage, profondeur de champ cinématographique, détails extrêmes, photoréalisme, qualité magazine de mode, studio professionnel, 8K, ultra détaillé.", 
   img: "/videos/Marketing.webp", 
    url: "/videos/Marketing.webp"},
  { 
    id: 14, 
    title: "Portrait Aquarelle", 
    prompt: "Logo de haute qualité, style logo, aquarelle, puissant logo représentant une tête de renard colorée vue de face, arrière-plan monochrome, par Yukisakura, magnifiques couleurs vives et complètes, format carré.", 
   img: "/videos/Aquarelle.webp", 
    url: "/videos/Aquarelle.webp"}, 
  { 
    id: 15, 
    title: "Femme Cyberpunk", 
    prompt: "Dans un futur cyberpunk dystopique, une jeune Coréenne de petite taille, à l’apparence fragile et vulnérable, marche dans une rue d’une petite ville cyberpunk. Elle a des cheveux courts violets ébouriffés, agrémentés de touches néon lumineuses. Elle porte des vêtements très usés : un pantalon cargo, un crop top court déchiré et un long manteau. Un cyberdeck est fixé sur le haut de sa cuisse gauche à l’aide de sangles. Son visage exprime la fatigue, l’épuisement et un profond sentiment d’impuissance.", 
   img: "/videos/Cyberpunk.webp", 
    url: "/videos/Cyberpunk.webp"}
];

const VIDEO_SUGGESTIONS = [
  { 
    id: 1, title: "crépuscule", typeStyle: "MANGA", 
    prompt: "Samouraï solitaire en armure détaillée debout sur une colline d’herbes hautes, face à un coucher de soleil rouge intense sur une ville japonaise lointaine. Le vent souffle fort, faisant bouger ses vêtements et les herbes. Atmosphère épique et mélancolique, ciel dramatique avec nuages très lumineux. Caméra : départ en plan moyen derrière le samouraï, puis travelling arrière rapide et fluide révélant la vallée et la ville, suivi d’une légère rotation orbitale de 180° autour du personnage pour un effet cinématique final. Lumière golden hour très contrastée, lens flare réaliste, profondeur de champ cinématographique, rendu ultra réaliste, style film japonais blockbuster.", 
   img: "/videos/crépuscule.webp", 
    url: "/videos/crépuscule.webm" 
  },
  { 
    id: 2, title: "Futuriste", typeStyle: "Cyberpunk", 
    prompt: "Jeune femme cyberpunk aux cheveux violets marchant dans une ruelle coréenne humide et animée. Début en très gros plan sur ses bottes qui avancent lentement sur l'asphalte mouillé, reflets des néons colorés visibles dans les flaques d'eau. Caméra en travelling arrière fluide suivant ses pas. Après une seconde, la caméra remonte progressivement le long de ses jambes, de son équipement tactique et de son manteau usé. Elle continue de marcher avec assurance, mains dans les poches. La caméra poursuit son mouvement vertical jusqu'à son visage, révélant en arrière plan toute la ruelle, les enseignes coréennes lumineuses, la vapeur sortant des bouches d'égout et les passants en arrière-plan. Ambiance cyberpunk réaliste, mouvements naturels, lumière cinématographique, profondeur de champ réaliste, reflets sur le sol mouillé, ultra réaliste, 8K, qualité film, détails extrêmes.", 
    img: "/videos/Cyberpunk.webp", 
    url: "/videos/Cyberpunk.webm" 
  },
  { 
    id: 3, title: "Forêt sinistre", typeStyle: "Réaliste", 
    prompt: "Au cœur d'une forêt sombre et brumeuse en pleine nuit, une femme terrifiée court à pleine vitesse sur un étroit sentier boueux serpentant entre des arbres morts et des branches enchevêtrées. Ses vêtements sont sales et déchirés, son visage couvert de sueur, de boue et marqué par la peur. Elle serre fermement une lampe torche dont le faisceau perce l'épais brouillard. Mouvement de course naturel et réaliste, placement précis des pieds, transfert du poids du corps fidèle à la réalité, respiration subtile, cheveux et vêtements réagissant naturellement à chacun de ses mouvements. Aucun ralenti. La caméra débute par un travelling en contre-plongée dramatique, au ras du sol, suivant la femme alors qu'elle court vers l'objectif. Racines humides, éclaboussures de boue et branches cassées défilent rapidement au premier plan. Le faisceau de la lampe torche balaie les arbres, créant des ombres mouvantes et un éclairage volumétrique spectaculaire à travers la brume. Alors qu'elle poursuit sa fuite, la caméra s'élève progressivement et recule en douceur, passant d'une poursuite en contre-plongée à une vue aérienne de plus en plus haute. La forêt se dévoile sous elle, révélant l'immensité sauvage et isolée qui l'entoure. La femme devient une petite silhouette perdue dans l'obscurité, fuyant désespérément à travers ce paysage inquiétant. Grand plan aérien cinématographique, échelle épique, épais brouillard dérivant entre les arbres, profondeur atmosphérique réaliste, lumière lunaire filtrant naturellement à travers la canopée. Ambiance de thriller horrifique ultra réaliste, éclairage cinématographique, brouillard volumétrique, éclairage réaliste de la lampe torche, mouvements de caméra naturels, environnement forestier richement détaillé, reflets sur le sol humide, textures photoréalistes, large plage dynamique (HDR), tension dramatique permanente, qualité visuelle digne d'une superproduction hollywoodienne, rendu 8K, niveau de détail extrême, mise en scène immersive d'horreur cinématographique.", 
      img: "/videos/Foret-sombre.webp", 
    url: "/videos/Foret-sombre.webm" 
  },
  { 
    id: 4, title: "Cours", typeStyle: "3D", 
    prompt: "Plan cinématographique ultra dynamique dans une forêt dense transformée en parcours de compétition. Deux lapins anthropomorphes très détaillés s’affrontent en course sprint sur un sentier de terre étroit. Le lapin blanc en t-shirt bleu et sac à dos est en tête, poursuivi de près par le lapin gris en t-shirt rouge, expression de détermination intense. Caméra basse au sol en travelling avant très rapide, légèrement tremblée comme une caméra de course professionnelle. Accent fort sur la vitesse, motion blur sur les jambes et les bras, poussière et particules de terre qui explosent à chaque foulée. Végétation luxuriante sur les côtés, spectateurs animaux flous en arrière-plan (effet profondeur de champ). Style sport extrême, ambiance de finale de course, lumière dorée dramatique filtrant à travers les arbres, rendu 3D ultra réaliste type film d’animation haut budget, tension et énergie maximale.", 
    img: "/videos/Cours.webp", 
    url: "/videos/Cours.webm" 
  },
  { 
    id: 5, title: "Astronaute", typeStyle: "ESPACE", 
    prompt: "Un astronaute solitaire flotte dans l'espace profond au-dessus de la Terre. La caméra démarre en plan extrêmement large, montrant l'immensité du cosmos, la courbure de la Terre et l'astronaute minuscule au centre du cadre. La caméra avance progressivement vers l'astronaute avec un travelling avant fluide et rapide. À mesure qu'elle se rapproche, les détails de la combinaison deviennent visibles, les reflets du Soleil apparaissent sur la visière. Arrivée à distance moyenne, la caméra effectue une rotation orbitale de 180 degrés autour de l'astronaute, révélant successivement la Terre en arrière-plan puis le vide spatial étoilé. Mouvement parfaitement stable, sensation de gravité zéro, éclairage réaliste de l'espace, reflets physiques, qualité IMAX, photoréalisme extrême, profondeur de champ cinématographique, rendu 8K, style documentaire spatial à gros budget, motion blur naturel, détails ultra-réalistes, atmosphère épique et contemplative.", 
 img: "/videos/Astronaute.webp", 
    url: "/videos/Astronaute.webm"
  },
  { 
    id: 6, title: "Parc", typeStyle: "ANIME", 
    prompt: "Style animé : une femme assise sur un banc dans un parc, un chat monte sur ses genoux et elle le caresse.", 
    img: "/videos/Anime1.webp",
    url: "/videos/Anime1.webm"
  },
  { 
    id: 7, title: "Traveling", typeStyle: "Réaliste", 
    prompt: "Scene ultra réaliste : Dans une chambre d’hôtel luxueuse, légèrement désordonnée. Une femme blonde est assise sur le lit, le maquillage noir recouvrant une grande partie de ses yeux. Travelling avant jusqu’au gros plan de son visage, qui semble exténué.", 
     img: "/videos/encore-une.webp",
    url: "/videos/encore-une.webm"
  },
  { 
    id: 8, title: "Lac montagneuse", typeStyle: "Film", 
    prompt: "Fluide doré en mouvement, ondes magnétiques, luxe, abstrait 3D", 
     img: "/videos/lac-montagneuse.webp",
    url: "/videos/lac-montagneuse.webm"
  },
  { 
    id: 9, title: "Femme dans un penthouse nocturne", typeStyle: "Anime", 
    prompt: "Illustration anime cinématographique, personnage féminin antagoniste en pied, debout dans un luxueux bureau de penthouse moderne de nuit, braquant un pistolet directement vers la caméra, posture dominante et menaçante, contre-plongée au fera mesure qu'elle avance la camera recule au rythme que la personne avance, veste de costume noire élégante, chemise noire ajustée légèrement ouverte au col, pantalon noir cintré, chaîne métallique discrète à la ceinture, une main dans la poche, coupe de cheveux courte dégradée noire, yeux rouges lumineux, peau pâle, expression froide et déterminée, éclairage dramatique, détails ultra-réalistes du visage et des cheveux, sol en marbre noir brillant, grand bureau de direction à l’arrière-plan, fauteuil en cuir, immenses baies vitrées donnant sur une ville illuminée la nuit, reflets réalistes sur les surfaces puis la camera fait un zoom sur le visage, ambiance sombre et sophistiquée, style néo-noir, ombres cinématographiques, style anime réaliste, qualité chef-d’œuvre, netteté extrême, éclairage volumétrique, profondeur de champ, contraste élevé, illustration conceptuelle professionnelle, qualité 8K, atmosphère de thriller d’action.", 
    img: "/videos/penthouse-nocturne.webp",
    url: "/videos/tiktok-5.webm"
  },
  { 
    id: 10, title: "La poupée maudite", typeStyle: "Horreur", 
    prompt: "Vieille maison abandonnée victorienne, pièce sombre et délabrée, papier peint déchiré, poussière flottant dans l'air, toiles d'araignée, éclairage cinématographique. Une poupée terrifiante en porcelaine fissurée est assise immobile dans un vieux fauteuil en velours au centre de la pièce. La caméra effectue un lent travelling avant depuis un plan large vers un plan rapproché. Une faible lumière lunaire traverse la fenêtre tandis qu'une bougie vacillante projette des ombres mouvantes sur les murs. Les cheveux emmêlés de la poupée bougent légèrement sous un courant d'air. Dans les deux dernières secondes, sa tête pivote lentement vers la caméra avec un mouvement anormal et inquiétant, ses yeux semblant suivre l'objectif. Ambiance oppressante, horreur psychologique, ultra réaliste, qualité cinéma hollywoodien, éclairage volumétrique, profondeur de champ cinématographique, détails extrêmes, 4K, format 16:9.", 
     img: "/videos/poupee.webp",
    url: "/videos/poupee.webm"
  },
  { 
    id: 11, title: "Caméra de surveillance", typeStyle: "Réaliste", 
    prompt: "Vidéo de télésurveillance ultra réaliste filmée de nuit dans un jardin entièrement recouvert de neige fraîche. La scène est capturée par une caméra de sécurité fixe en vision infrarouge noir et blanc, avec un léger bruit numérique, des artefacts de compression et un horodatage visible dans le coin de l'écran. Au centre du jardin se trouve un grand bonhomme de neige immobile. Un homme avance dans la neige en direction du bonhomme de neige, laissant des traces de pas derrière lui. Alors qu'il s'approche à moins d'un mètre, un chat surgit soudainement de l'intérieur du bonhomme de neige à une vitesse fulgurante. Le chat bondit directement vers le visage de l'homme, qui recule brutalement en criant de surprise. La caméra enregistre la scène avec des mouvements saccadés, une qualité de surveillance authentique et une ambiance inquiétante. Éclairage nocturne réaliste, ombres naturelles, détails photoréalistes, rendu cinématographique 4K, style vidéo virale de phénomène inexpliqué capturée par caméra de sécurité réelle.", 
    img: "/videos/caméra.webp",
    url: "/videos/caméra.webm"
  },
  { 
    id: 12, title: "coucher de soleil", typeStyle: "3D", 
    prompt: "Un crabe sur un rocher observe le coucher de soleil sur une plage. La mise au point de la plage est légèrement floutée.",
   img: "/videos/Coucher-de-soleil.webp",
    url: "/videos/ocean.webm"
  },
  { 
    id: 13, title: "Attaque de zombies", typeStyle: "Réaliste", 
    prompt: "Scène ultra-réaliste et cinématographique. Une immense horde de zombies envahit Times Square en pleine nuit. Des centaines de civils paniqués tentent de fuir dans toutes les directions tandis que les zombies les poursuivent à travers les rues illuminées. Véhicules abandonnés, collisions, explosions, cris et chaos total plongent la ville dans l'apocalypse. Caméra dynamique, mouvements nerveux, ambiance de film catastrophe à gros budget, éclairages urbains réalistes, détails photoréalistes, qualité 4K. Plan final spectaculaire : vue aérienne de New York. La ville entière est en flammes, d'immenses colonnes de fumée noire s'élèvent dans le ciel et recouvrent l'horizon. Plusieurs quartiers sont ravagés par les incendies. Atmosphère apocalyptique, lumière rougeoyante des flammes, destruction massive, rendu ultra-réaliste. Dernière séquence : vue depuis les berges de New York. est dévastée, enveloppée par la fumée et les incendies. Des hélicoptères survolent la ville en détresse tandis que des explosions illuminent l'horizon. Ambiance de fin du monde, cinématographie épique, détails extrêmes, qualité 4K, style blockbuster hollywoodien.", 
    img: "/videos/attaque.webp",
    url: "/videos/attaque.webm"
  },
  { 
    id: 14, title: "Volcan", typeStyle: "Animation", 
    prompt: "Plan cinématique ultra réaliste d’un monde préhistorique luxuriant au moment d’une éruption volcanique massive. La caméra débute en plan large aérien au-dessus d’une jungle extrêmement dense et détaillée. Les dinosaures au sol (T-Rex, tricératops, sauropodes) lèvent tous la tête et regardent vers le volcan en éruption au loin. Explosion volcanique spectaculaire avec projection de lave et nuage de cendres gigantesque. Pterodactyles en vol dans un ciel dramatique. Végétation très abondante, jungle humide, brouillard volumétrique et lumière dorée de fin de journée. Mouvement caméra fluide avec léger travelling avant + légère rotation vers le volcan. Style film blockbuster, hyperréaliste, profondeur de champ cinématographique, 4K.", 
    img: "/videos/volcan.webp",
    url: "/videos/volcan.webm"
  },
  { 
    id: 15, title: "Couloir sombre", typeStyle: "Réaliste", 
    prompt: "Caméra fixe dans un couloir sombre et abandonné d’une vieille maison délabrée, éclairage naturel faible venant d’une fenêtre au fond avec rideaux qui bougent légèrement. Une femme d’environ 40 ans, en pyjama sale et déchiré, rampe lentement sur un sol en bois humide vers la caméra. Elle est en état de panique extrême, respiration lourde, tremblante. Elle s’arrête soudainement, tourne lentement la tête vers l’arrière avec un regard terrifié, comme si quelque chose la poursuivait hors champ. L’ambiance est oppressante, silencieuse, tension progressive. La caméra reste stable, légère vibration réaliste type caméra tenue à la main. Style film d’horreur ultra réaliste, lumière froide, grain cinéma, 4K, profondeur de champ faible, atmosphère lourde et glauque. Durée 10 secondes, mouvement lent et continu, tension qui monte jusqu’au regard final vers l’arrière.", 
  img: "/videos/Couloir-sombre.webp",
    url: "/videos/Couloir-sombre.webm"
  }
];

function App() {
  // --- 1. ÉTATS DES JETONS (Lecture initiale du LocalStorage) ---
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem("eclipse_tokens");
    return saved ? parseInt(saved) : 0;
  });

  const [packTokens, setPackTokens] = useState(() => {
    const savedPack = localStorage.getItem("eclipse_pack_tokens");
    return savedPack ? parseInt(savedPack) : 0; 
  });

  // Ajout de diamants lors d'un achat
  const handlePurchase = (amount) => {
    setPackTokens(prev => prev + amount);
  };
  
// Logique universelle de consommation (Préparée pour le Cloud)
const consumeToken = async () => {
  // 1. On récupère le prix dynamique (ex: 350 ou 450)
  const currentPrice = calculateCurrentPrice();

  // 2. Priorité aux éclairs (tokens gratuits)
  if (tokens >= currentPrice) {
    const newTokens = tokens - currentPrice;
    setTokens(newTokens);
    // Optionnel : syncCreditsToDB(user.uid, newTokens, packTokens);
    return true; 
  } 
  
  // 3. Sinon, on utilise les diamants (packTokens payants)
  else if (packTokens >= currentPrice) {
    const newPack = packTokens - currentPrice;
    setPackTokens(newPack);
    // Optionnel : syncCreditsToDB(user.uid, tokens, newPack);
    return true; 
  } 
  
  // 4. Si aucun des deux n'est suffisant
  else {
    alert(`⚠️ Crédits insuffisants ! Cette génération coûte ${currentPrice} 💎.`);
    setShowPricing(true); 
    return false; 
  }
};
// --- ÉTATS DE L'INTERFACE ---
const [showLogin, setShowLogin] = useState(false);
const [showStudio, setShowStudio] = useState(false);
const [mode, setMode] = useState("VIDEO"); // ✅ On commence en mode VIDEO
const [prompt, setPrompt] = useState("");
const [selectedStyle, setSelectedStyle] = useState("Réaliste");
const [aspectRatio, setAspectRatio] = useState("16:9");
const [selectedModel, setSelectedModel] = useState("Hailuo AI"); // ✅ On met direct Hailuo
const [isLoading, setIsLoading] = useState(false);
const [isThinking, setIsThinking] = useState(false);
const [chatMessages, setChatMessages] = useState([]);
const [progress, setProgress] = useState(0);
const [statusMsg, setStatusMsg] = useState("");
const [user, setUser] = useState(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [errorMsg, setErrorMsg] = useState(null);
const API_BASE_URL = "${import.meta.env.VITE_API_URL}";
const [itemToDelete, setItemToDelete] = useState(null);
const [remixStrength, setRemixStrength] = useState(0.5); // 0.5 = équilibre parfait
const [uploadedImage, setUploadedImage] = useState(null);
const promptRef = useRef(null);

const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
const [neededAmount, setNeededAmount] = useState(0);

const [showCgv, setShowCgv] = useState(false);
const [showLegal, setShowLegal] = useState(false);

const [showProfile, setShowProfile] = useState(false);
const [userPlan, setUserPlan] = useState("debutant");
const [isInitializing, setIsInitializing] = useState(true);

const [videoSource, setVideoSource] = useState(null);
const [isAuthLoading, setIsAuthLoading] = useState(true);
const [showDropdown, setShowDropdown] = useState(false);
const [cost, setCost] = useState(0);
const [forceDiamonds, setForceDiamonds] = useState(false);
const [duration, setDuration] = useState("5"); 
const [showTerms, setShowTerms] = useState(false);
const [showContactModal, setShowContactModal] = useState(false);
const [showPrivacy, setShowPrivacy] = useState(false);
const [showPricing, setShowPricing] = useState(false);
const [wantsAudio, setWantsAudio] = useState(false);
const [resolution, setResolution] = useState("1080p");
const [startImage, setStartImage] = useState(null);
const [startImagePreview, setStartImagePreview] = useState(null);
const [endImage, setEndImage] = useState(null);

const scrollContainerRef = useRef(null); 
const [hoverItem, setHoverItem] = useState(null); // Pour stocker la miniature survolée

// Historique
// ✅ Nouveau code : 100% Firebase, 0% localStorage
const [history, setHistory] = useState([]);

  const [activeItem, setActiveItem] = useState(history[0] || null);
  const [randomInspirations, setRandomInspirations] = useState([]);


  // --- RÉFÉRENCES ---
  const chatEndRef = useRef(null);
  const successAudio = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3"));
  const scrollInspiRef = useRef(null);
const [view, setView] = useState('studio');
  // --- EFFETS ---

  // RECHARGE QUOTIDIENNE (Abonnement 0€)

useEffect(() => {
  // On ne force plus setTokens(0) ici. 
  // C'est la fonction onAuthStateChanged qui s'en occupe proprement.
  
// On considère comme débutant uniquement si on a reçu les infos ET que c'est le plan gratuit
const isDebutant = userPlan === "debutant" ;

// On crée un état de chargement pour les crédits
const isProfileLoading = user && !userPlan;

  if (isDebutant) {
    console.log("🛡️ Profil Débutant détecté.");
  } else {
    console.log(`💎 Profil Abonné détecté : ${userPlan}`);
  }
}, [userPlan]);
const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      // Vérifie si le contenu dépasse la hauteur du cadre
      const isScrollable = el.scrollHeight > el.clientHeight;
      setCanScroll(isScrollable);
    }
  };
  useEffect(() => {
  console.log("🚀 Lancement écoute Auth");

  // On écoute l'authentification
  const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
    setIsAuthLoading(true);

    if (authUser) {
      setUser(authUser);
      
      // 1. On lance l'écouteur temps réel sur Firestore
      const userRef = doc(db, "users", authUser.uid);
      
      const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("🔄 Mise à jour temps réel Firestore reçue :", data);
          
          setUserPlan(data.userPlan || "discovery");
          setTokens(data.tokens || 0);
          setPackTokens(data.packTokens || 0);
        } else {
          // Si le document n'existe pas, on le crée
          createUserProfile(authUser);
        }
      }, (error) => {
        console.error("❌ Erreur écoute Firestore :", error);
      });

      // 2. On stocke l'unsubscribe pour le clean-up
      // Note : Comme on ne peut pas mettre de clean-up direct dans l'async, 
      // on gère la déconnexion proprement ci-dessous.
      window.unsubUser = unsubscribeSnapshot; 

    } else {
      console.log("👤 Aucun utilisateur");
      setUser(null);
      setUserPlan("discovery");
      setTokens(0);
      setPackTokens(0);
      setShowStudio(false);
      
      // On arrête l'écouteur si l'utilisateur se déconnecte
      if (window.unsubUser) window.unsubUser();
    }
    
    setIsAuthLoading(false);
    setIsInitializing(false);
  });

  return () => {
    unsubscribeAuth();
    if (window.unsubUser) window.unsubUser();
  };
}, []);


  useEffect(() => {
    if (mode === "IMAGE") {
      setSelectedModel("Flux Pro");
    } else if (mode === "VIDEO") {
      setSelectedModel("Hailuo AI");
      setResolution("768p");
    }
  }, [mode]);
     
// À mettre tout en haut de ton fichier App.js (après les imports)
const PLAN_TO_PRICE = { 
  "debutant": "0.00", 
  "essentiel": "12.99", 
  "standard": "24.99", 
  "master": "34.99", 
  "elite": "59.99", 
  "legende": "159.99" 
};

const packs = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];

const PRICING_DATA = {
"0.00": { 
    // --- MODE DIAMANTS (Marge ~50% pour absorber les frais Stripe) ---
    veo3:  { hd4: 55, hd6: 81, hd8: 107, fhd4: 99, fhd6: 147, fhd8: 195},
     veo3_lite: { hd4: 12,   hd6: 16,  hd8: 21,    fhd4: 18,  fhd6: 26,  fhd8: 33 },
       kling26:  {  fhd5: 28, fhd10: 53 },
    kling26_motion:{ fhd5: 28, fhd10: 53, hd5: 18, hd10: 33 },
    kling30: { hd5: 38, fhd5: 48, hd10: 68, fhd10: 88, hd15: 98, fhd15: 128},
 hailuo:  { p512_6: 14, hd6: 18,  fhd6: 29,  hd10: 29, p512_10: 25, },
     "luma-ray2":  { hd5: 31,  p540_5: 18,   p540_9: 30, fhd5: 58,  hd9: 54,  fhd9: 103 },
   "pixverse6": { hd5: 28,  fhd5: 42,  hd10: 44,  fhd10: 73, p540_5: 18, p540_10: 28 },
    seedance: { hd4: 38, sd4: 20, sd12: 49,  fhd4: 78,  hd12: 103,  fhd12: 203 },
    seedance20: { hd5: 173, sd5: 123, sd10: 243, sd15: 363, fhd5: 383, hd10: 343, fhd10: 763, hd15: 513, fhd15: 1143},
    flux:     { pro: 4,   dev: 3,    schnell: 1 }
  },

  "12.99": { 
    // --- MODE ÉCLAIRS (Abonnés - Prix coûtant + petite marge) ---
veo3: { hd4: 52, hd6: 78, hd8: 104, fhd4: 96, fhd6: 144, fhd8: 192},
  veo3_lite: { hd4: 9,   hd6: 12, hd8: 18,  fhd4: 15,  fhd6: 23, fhd8: 30 }, 
    kling26:  {  fhd5: 25, fhd10: 50 },
    kling26_motion:{ fhd5: 25, fhd10: 50, hd5: 15, hd10: 30  },
kling30: { hd5: 35, fhd5: 45, hd10: 65, fhd10: 85, hd15: 95, fhd15: 125},
    hailuo:  { p512_6: 11, hd6: 15,  fhd6: 26,  hd10: 26, p512_10: 22, },
   "luma-ray2": { 
  p540_5: 15,   // 540p - 5 secondes
  hd5: 20,   // 720p - 5 secondes
  fhd5: 40,  // 1080p - 5 secondes
  p540_9: 27,   // 540p - 9/10 secondes
  hd9: 36,   // 720p - 9/10 secondes
  fhd9: 75   // 1080p - 9/10 secondes
},
   "pixverse6": { hd5: 25,  fhd5: 39,  hd10: 41,  fhd10: 70, p540_5: 15, p540_10: 25 },
    seedance: { hd4: 35, sd4: 17, sd12: 46, fhd4: 75,  hd12: 100,  fhd12: 200 },
    seedance20: { hd5: 170, sd5: 120, sd10: 240, sd15: 360, fhd5: 380, hd10: 340, fhd10: 760, hd15: 510, fhd15: 1140},
    flux:     { pro: 3,   dev: 2,    schnell: 1 }
  }
};

// --- LIAISON DES PLANS (Éviter les erreurs de saisie) ---
PRICING_DATA["24.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["34.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["59.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["159.99"] = PRICING_DATA["12.99"];

const currentUserPrice = PLAN_TO_PRICE[userPlan] || "0.00";
const p = PRICING_DATA[currentUserPrice] || PRICING_DATA["0.00"];

const engines = [

  { 
  id: "veo3_lite", 
  name: "Veo 3.1 Lite", 
  type: "VIDEO",
  minPriceForLightning: "12.99",
  prices: {
    "4": { 
      "720p": p.veo3_lite?.hd4 || 12, 
      "1080p": p.veo3_lite?.fhd4 || 18 
    },
      "6": { 
        "720p": p.veo3_lite?.hd6 || 16, 
        "1080p": p.veo3_lite?.fhd6|| 26
         },
    "8": { 
      "720p": p.veo3_lite?.hd8 || 21, 
      "1080p": p.veo3_lite?.fhd8 || 33 
    } 
  },
endpoint: "veo-3.1-lite-generate-001",
  annotation: "Google Lite - Rapide & Audio inclus"
  },
    // --- VIDÉO HAUT DE GAMME ---
  { 
id: "veo3", 
    name: "Veo 3",  
    type: "VIDEO",
    canDualImage: false, 
    minPriceForLightning: "12.99",
    prices: {
      "4": { 
        "720p": p.veo3?.hd4 || 55, 
        "1080p": p.veo3?.fhd4 || 96 
      },
      "6": { 
        "720p": p.veo3?.hd6 || 78, 
        "1080p": p.veo3?.fhd6 || 144 
         },
      "8": { 
        "720p": p.veo3?.hd8 || 104, 
        "1080p": p.veo3?.fhd8 || 192 
      }
    },
endpoint: "veo-3.1-generate-preview",
extendEndpoint: "fal-ai/veo3.1/extend-video", 
annotation: "Moteur Google - Fidélité Extrême"
  },
  {     

    id: "kling26_motion", 
    name: "Kling 2.6 Motion Control", 
    type: "VIDEO",
    canDualImage: false, 
    minPriceForLightning: "12.99",
    prices: {
      "5": { 
        "720p": p.kling26_motion?.hd5 || 18,
        "1080p": p.kling26_motion?.fhd5 || 28
      },
      "10": { 
        "720p": p.kling26_motion?.hd10 || 33,
        "1080p": p.kling26_motion?.fhd10 || 53
      }
    },
    endpoint: "fal-ai/kling-video/v2.6/standard/motion-control",
    annotation: "Transfert de mouvement d'une vidéo vers une image"
    },
  { 
    
  id: "kling30", 
  name: "Kling 3.0 Pro", 
   type: "VIDEO",
  canDualImage: true, 
  minPriceForLightning: "12.99",
  prices: {
    "5": { 
      "720p": p.kling30?.hd5 || 38, 
      "1080p": p.kling30?.fhd5 || 48
    },
    "10": { 
      "720p": p.kling30?.hd10 || 68, 
      "1080p": p.kling30?.fhd10 || 88
        },
    "15": { 
      "720p": p.kling30?.hd15 || 98, 
      "1080p": p.kling30?.fhd15 || 128
    }
  },
textEndpoint: "fal-ai/kling-video/v3/pro/text-to-video",

// 2. L'endpoint pour l'IMAGE (c'est celui-ci qui gère l'extrapolation)
endpoint: "fal-ai/kling-video/v3/pro/image-to-video",

// 3. L'endpoint pour le Motion Control (Video-to-Video)
motionEndpoint: "fal-ai/kling-video/v3/pro/motion-control",
  annotation: "Moteur Premium - Qualité Cinéma"
},
  { 

  id: "kling26", 
  name: "Kling 2.6 Pro", 
  type: "VIDEO",
  canDualImage: true, 
  minPriceForLightning: "12.99",
  prices: {
    "5": { 
      
      "1080p": p.kling26?.fhd5 || 28
    },
    "10": { 
      "1080p": p.kling26?.fhd10 || 53
    }
  },
  textEndpoint: "fal-ai/kling-video/v2.6/pro/text-to-video",
// On pointe vers le endpoint de base pour le dual image
  endpoint: "fal-ai/kling-video/v2.6/pro/image-to-video",
  // On définit le endpoint spécifique pour le Motion Control (Video-to-Video)
  annotation: "Excellent rapport Qualité/Prix"
},
{ 
  id: "hailuo", 
  name: "Hailuo AI", 
  type: "VIDEO",
  canDualImage: true, 
  minPriceForLightning: "12.99",
  prices: {
    "6": { 
      "512p": p.hailuo?.p512_6 || 14,
      "768p": p.hailuo?.hd6 || 18, 
      "1080p": p.hailuo?.fhd6 || 29
    },
    "10": { 
      "512p": p.hailuo?.p512_10 || 25,
      "768p": p.hailuo?.hd10 || 29, 
    } 
  },
  endpoint: "fal-ai/minimax/hailuo-02/standard/text-to-video",
  annotation: "Mouvements ultra-réalistes"
},
  {
 id: "luma-ray2", 
  name: "Luma Ray 2 flash", 
  type: "VIDEO",
  canDualImage: true, 
  minPriceForLightning: "12.99",
  prices: { 
    // Correction : on utilise p["luma-ray2"] au lieu de p.luma
    "5":  { "720p": p["luma-ray2"]?.hd5 || 31, "540p": p["luma-ray2"]?.p540_5 || 18, "1080p": p["luma-ray2"]?.fhd5 || 58 }, 
    "10": { "720p": p["luma-ray2"]?.hd9 || 54, "540p": p["luma-ray2"]?.p540_9 || 30,"1080p": p["luma-ray2"]?.fhd9 || 103 } 
  },
  endpoint: "fal-ai/luma-dream-machine/ray-2-flash"
},

  // --- VIDÉO ACCESSIBLE ---
{
  id: "pixverse6", name: "Pixverse V6",  type: "VIDEO",
canDualImage: true, 
  minPriceForLightning: "12.99",
  prices: { 
    "5":  { "720p": p.pixverse6?.hd5 || 28, "1080p": p.pixverse6?.fhd5 || 42, "540p": p.pixverse6?.p512_5 || 18 }, 
    "10": { "720p": p.pixverse6?.hd10 || 44, "1080p": p.pixverse6?.fhd10 || 73, "540p": p.pixverse6?.p512_10|| 28 } 
  }, 
endpoint: "fal-ai/pixverse/v6/text-to-video"},
{ 
   id: "seedance20", 
  name: "seedance 2.0", 
  type: "VIDEO",
  canDualImage: true, 
  minPriceForLightning: "24.99",
  prices: {
   "5": { 
       "480p": p.seedance20.sd5 || 123, 
      "720p": p.seedance20.hd5 || 173, 
      "1080p": p.seedance20.fhd5 || 383
    },
    "10": { 
      "480p": p.seedance20.sd10 || 243, 
      "720p": p.seedance20.hd10 || 343, 
      "1080p": p.seedance20.fhd10 || 763
        },
    "15": { 
      "480p": p.seedance20.sd15 || 363, 
      "720p": p.seedance20.hd15 || 513, 
      "1080p": p.seedance20.fhd15 || 1143
    } 
  },
endpoint: "bytedance/seedance-2.0/text-to-video", 
  annotation: "Mouvements ultra-réalistes, audio inclus"
},
{ 
  id: "seedance", 
  name: "Seedance 1.5 Pro", 
  type: "VIDEO",
  canDualImage: false, // Supporte Start/End frame mais pas Dual Image classique
  minPriceForLightning: "12.99",
  prices: { 
    "4": { // On garde "5" pour l'interface utilisateur (valeur par défaut)
 "480p": p.seedance?.sd4 || 20,  
      "720p": p.seedance?.hd4 || 38,           
      "1080p": p.seedance?.fhd4 || 78 
    },
    "12": { // On mappe le choix "Long" sur le tarif 12s
       "480p": p.seedance?.sd12 || 49,
      "720p": p.seedance?.hd12 || 103, 
      "1080p": p.seedance?.fhd12 || 203 
    } 
  },
endpoint: "fal-ai/bytedance/seedance/v1.5/pro/text-to-video",
  annotation: "Audio natif & Lip-sync synchronisés"
  },
  // --- IMAGES ---
{ 

  id: "fal-ai/flux-pro/v1.1",
  name: "Flux Pro", 
  type: "IMAGE", 
  minPriceForLightning: "12.99",
  prices: { "0": { "1080p": p.flux?.pro || 4 } }, // Le "0" peut être piégeux, assure-toi que ton calcul le lit bien
  annotation: "Ultra-Haute Qualité - v1.1"
},
{ 
  id: "fal-ai/flux/dev", 
  name: "Flux Dev", 
  type: "IMAGE", 
  minPriceForLightning: "12.99",
  prices: { "0": { "1080p": p.flux?.dev || 3 } }
},
{ 
  id: "fal-ai/flux/schnell", 
  name: "Flux Schnell", 
  type: "IMAGE", 
  minPriceForLightning: "12.99",
  prices: { "0": { "1080p": p.flux?.schnell || 1 } }
} 
]; // Fermeture correcte de l'array engines


function getPriceDisplay(engine, duration, resolution, userPlan) {
    const PLAN_TO_PRICE = { 
        "debutant": "0.00", "essentiel": "12.99", 
        "standard": "24.99", "master": "34.99", "elite": "59.99", "legende": "159.99" 
    };
    const currentPriceKey = PLAN_TO_PRICE[userPlan] || "0.00";

    // 🛡️ CORRECTION : Si c'est le Kling Motion Control, on force TOUJOURS le Full HD (fhd)
    const isKlingMotion = engine?.id === "kling26_motion" || engine?.id?.includes("motion");
    const isFullHD = isKlingMotion || engine?.id?.includes("kling26") || resolution === "1080p" || resolution === "Full HD";
    
    const resKey = isFullHD ? "fhd" : "hd";
    const lookupKey = duration === "0" ? resKey : `${resKey}${duration}`;

    // 1. PRIX ÉCLAIR
    const lightningPrice = PRICING_DATA[currentPriceKey]?.[engine.id]?.[lookupKey];

    // 2. PRIX DIAMANT
    const diamondPrice = PRICING_DATA["0.00"]?.[engine.id]?.[lookupKey] || engine.rubyPrice;

    // 3. LOGIQUE D'AUTORISATION
    const packs = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];
    const userTierIndex = packs.indexOf(currentPriceKey);
    const requiredTierIndex = packs.indexOf(String(engine.minPriceForLightning));

    if (userTierIndex >= requiredTierIndex && lightningPrice !== undefined) {
        return `${lightningPrice} ⚡`;
    } else {
        return `${diamondPrice} 💎`;
    }
}
const styles = ["Réaliste", "Cyberpunk", "Anime", "Aquarelle",  "Animation 3D"]; 
// 🔄 Détection de génération en cours si la page a été rafraîchie/réouverte
useEffect(() => {
    if (!user) return;
const checkPendingGeneration = async () => {
        try {
            // 🔍 Ajoute cette ligne pour voir l'URL exacte :
            console.log("URL de l'API ciblée :", import.meta.env.VITE_API_URL);

            // 🔑 Récupération du token Firebase de l'utilisateur
            const token = await user.getIdToken();

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/check-active-generation?userId=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await res.json();

            if (data.hasActive) {
                console.log("⏳ Génération interrompue/en cours détectée :", data.lock);
                
                // Réactivation visuelle du grand carré et du loader
                setIsLoading(true);
                setProgress(50); // Valeur indicative pendant le chargement
                setStatusMsg("Génération en cours de finalisation...");
            }
        } catch (err) {
            console.error("Impossible de vérifier l'état des générations :", err);
        }
    };

    checkPendingGeneration();
}, [user]);


useEffect(() => {
  if (window.location.pathname === '/success') {
    setView('success');
  }
}, 

[]);
const refreshInspirations = () => {
  // On choisit la source selon le mode
  const source = mode === "VIDEO" ? VIDEO_SUGGESTIONS : SUGGESTIONS;
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  setRandomInspirations(shuffled);
};

useEffect(() => {
  // 🚫 SÉCURITÉ : Si par hasard le mode passe sur "TEXTE", on le redirige immédiatement vers VIDEO
  if (mode === "TEXTE") {
    setMode("VIDEO");
    return;
  }

  // 1. Rafraîchir les exemples en bas de page
  refreshInspirations();

  // 2. Paramétrage spécifique selon le mode
  if (mode === "IMAGE") {
    setResolution("1080p");
    
    // SÉCURITÉ : Sélectionne automatiquement le premier moteur Image (ex: Flux Pro)
    const firstImageEngine = engines.find(e => e.type === "IMAGE");
    if (firstImageEngine) setSelectedModel(firstImageEngine.name);

  } else if (mode === "VIDEO") {
    
    // SÉCURITÉ : Sélectionne automatiquement le premier moteur Vidéo (ex: Hailuo AI)
    const firstVideoEngine = engines.find(e => e.type === "VIDEO");
    if (firstVideoEngine) setSelectedModel(firstVideoEngine.name);
    
  } else if (mode === "TEXTE") {
    setSelectedModel("Gemini 1.5 Flash"); // Ton modèle de chat par défaut
  }
}, 

[mode]); // Ajoute 'engines' ici au cas où ils chargent de façon asynchrone // Ajoute 'engines' ici au cas où ils chargent de façon asynchrone
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
  localStorage.setItem("pixpro_history", JSON.stringify(history));
}, [history]);

  useEffect(() => {
    if (activeItem && activeItem.type === "TEXTE") {
      setChatMessages(activeItem.messages || []);
    }
  }, [activeItem]);

  // Logique de scroll
  const handleScrollInspi = (direction) => {
  if (scrollInspiRef.current) {
    const container = scrollInspiRef.current;
    // On calcule la largeur visible du carré
    const scrollAmount = container.offsetWidth; 

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
};
const handleFileToUrl = async (e, previewOrImageSetter, maybeImageSetter) => {
  const file = e.target.files?.[0];
  if (!file) return;

  console.log("📁 FICHIER SÉLECTIONNÉ :", file);
  console.log("📦 Taille :", file.size, "octets");
  console.log("🖼️ Type :", file.type);

  // ============================================================
  // APERÇU LOCAL
  // ============================================================
  const previewUrl = URL.createObjectURL(file);

  if (typeof previewOrImageSetter === 'function') {
    previewOrImageSetter(previewUrl);
  }

  console.log("👁️ APERÇU LOCAL :", previewUrl);

  // ============================================================
  // CAS 1 : UN SEUL SETTER
  // ============================================================
  if (typeof maybeImageSetter !== 'function') {

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log("☁️ Upload de l'image vers le serveur...");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      console.log("📡 Réponse /api/upload :", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur upload :", errorText);
        return;
      }

      const data = await response.json();

      console.log("☁️ RÉPONSE COMPLÈTE UPLOAD :", data);

      const publicUrl = data.url || data.filePath;

      console.log("🌐 URL IMAGE PUBLIQUE :", publicUrl);

      if (!publicUrl) {
        console.error("❌ /api/upload n'a retourné aucune URL.");
        return;
      }

      // Remplace le blob local par l'URL serveur
      if (typeof previewOrImageSetter === 'function') {
        previewOrImageSetter(publicUrl);
      }

      console.log("✅ IMAGE PRÊTE POUR LE SERVEUR :", publicUrl);

    } catch (err) {
      console.error("❌ ERREUR UPLOAD SERVEUR :", err);
    }

    return;
  }

  // ============================================================
  // CAS 2 : PREVIEW + IMAGE
  // ============================================================

  const reader = new FileReader();

  reader.onloadend = () => {
    if (typeof maybeImageSetter === 'function') {
      maybeImageSetter(reader.result);
    }

    console.log("✅ IMAGE CONVERTIE EN BASE64");
  };

  reader.readAsDataURL(file);
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    setIsLoading(true);
    setStatusMsg("Chargement du fichier...");

const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: formData });      const data = await res.json();
      if (data.url) {
        const newItem = { id: Date.now(), url: data.url, prompt: "Fichier importé", type: "IMAGE" };
        setActiveItem(newItem);
        confetti();
      }
    } catch (err) { console.error("Erreur upload:", err); } 
    finally { setIsLoading(false); setStatusMsg(""); }
  };

// --- ICI ON EST JUSTE AVANT HANDLE GENERATE ---
const handleLogout = async () => {
  try {
    await auth.signOut();
    setUser(null);
    setShowDropdown(false);
    setShowStudio(false);
    console.log("Déconnexion réussie");
  } catch (error) {
    console.error("❌ Erreur déconnexion :", error);
  }
};useEffect(() => {
  if (!user?.uid) {
    setHistory([]);
    return;
  }

  // Écoute directement la collection imageLocks pour cet utilisateur
  const q = query(
    collection(db, "imageLocks"),
    where("userId", "==", user.uid),
    where("status", "==", "completed"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const firestoreItems = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // ⚠️ NORMALISATION DE L'URL : On s'assure qu'un champ 'url' existe TOUJOURS
      const mediaUrl = data.url || data.videoUrl || data.imageUrl || data.resultUrl || (data.video && data.video.url);

      return {
        id: doc.id,
        ...data,
        url: mediaUrl, // Force la présence de .url
        type: data.type || (mediaUrl?.includes('.mp4') ? 'VIDEO' : 'IMAGE') // Force le type si manquant
      };
    });

    setHistory(firestoreItems);
    console.log("🔥 Historique synchronisé :", firestoreItems.length, "élément(s)");
  }, (error) => {
    console.error("❌ Erreur récupération historique :", error);
  });

  return () => unsubscribe();
}, [user?.uid]);


useEffect(() => {
  if (mode === "TEXTE") {
    setCost(0);
    setForceDiamonds(false);
    return;
  }

  const currentEngineId = selectedModel?.toLowerCase() || "";
  const currentEngineData = engines.find(e => e.name === selectedModel || e.id === currentEngineId);
  
  if (currentEngineData) {
    const currentEngineId = currentEngineData.id; 
    const packsList = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];
    
    const isHighResMode = mode === "IMAGE" || 
                        resolution === "Full HD" || 
                        resolution === "1080p" || 
                        resolution?.toLowerCase().includes("fhd");

    // 1. DÉTERMINATION DU PLAN (Éclairs ou Diamants)
    const currentPlanPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
    const userTierIdx = packsList.indexOf(currentPlanPrice);
    const reqTierIdx = packsList.indexOf(String(currentEngineData.minPriceForLightning));
    const masterIdx = packsList.indexOf("34.99");

    // FIX CHIRURGICAL : Si l'utilisateur possède des Éclairs (tokens > 0), on ne le force JAMAIS sur les diamants
    const hasTokensToSpend = tokens > 0;
    
    const mustForce = !hasTokensToSpend && (
                      (currentPlanPrice === "0.00") || 
                      (userTierIdx < reqTierIdx) || 
                      (mode === "VIDEO" && isHighResMode && userTierIdx < masterIdx)
    );
    
    setForceDiamonds(mustForce);

// 2. HARMONISATION DE LA DURÉE
let calcDuration = "5"; 
if (mode === "IMAGE") {
    calcDuration = "0"; 
} else {
    // Sécurité : on extrait le chiffre
    const cleanDurationStr = duration.toString().replace(/\D/g, "");
    const isLongChosen = (duration === "long" || ["10", "12", "8", "9", "15"].includes(cleanDurationStr));
    
    if (currentEngineId === "veo3_lite") {
        calcDuration = cleanDurationStr === "6" ? "6" : (cleanDurationStr === "8" ? "8" : "4");
    } else if (currentEngineId === "veo3") {
        calcDuration = cleanDurationStr === "6" ? "6" : (cleanDurationStr === "8" ? "8" : "4");
    } else if (currentEngineId === "seedance20") {
        // ✅ GESTION SPÉCIFIQUE SEEDANCE 2.0 (Paliers 5, 10, 15)
        calcDuration = (cleanDurationStr === "15") ? "15" : (cleanDurationStr === "10" ? "10" : "5");
    } else if (currentEngineId.includes("seedance")) {
        // Ancienne version v1.5
        calcDuration = isLongChosen ? "12" : "4";
    } else if (currentEngineId.includes("hailuo")) {
        calcDuration = isHighResMode ? "6" : (isLongChosen ? "10" : "6");
    } else if (currentEngineId.includes("luma")) {
        calcDuration = isLongChosen ? "9" : "5";
 } else if (cleanDurationStr === "15" && currentEngineId !== "kling26" && currentEngineId !== "kling26_motion") {
        calcDuration = "15";
    } else {
        calcDuration = isLongChosen ? "10" : "5";
    }
}
    // 3. RÉCUPÉRATION DU PRIX SUR LE BON ID
const pricingId = currentEngineId.includes("luma") ? "luma-ray2" : 
                        currentEngineId.includes("pixverse") ? "pixverse6" : 
                        currentEngineId;

const isLuma = currentEngineId.includes("luma");
const isPixverse = currentEngineId.includes("pixverse");           
const isHailuo = currentEngineId.includes("hailuo");
const normalizedResolution = resolution?.toLowerCase().replace(/\s/g, "");

const is540p = normalizedResolution === "540p";
const is512p = normalizedResolution === "512p"; // Gardé pour Hailuo si nécessaire
const isSD = normalizedResolution === "480p" || normalizedResolution === "sd";
let priceKey;

if (isHailuo && is512p) {
    // ⚙️ Logique spécifique pour Hailuo (512p)
    priceKey = calcDuration === "10" ? "p512_10" : "p512_6";
} 
else if (isPixverse && is540p) {
    // ⚙️ Logique spécifique pour Pixverse (540p)
    priceKey = calcDuration === "10" ? "p540_10" : "p540_5";
} 
else if (isLuma && is540p) {
    // ⚙️ Logique spécifique pour Luma (540p strictement en 5s ou 9s)
    priceKey = (calcDuration === "9") ? "p540_9" : "p540_5";
}
else {
    // ✅ Détermination propre du préfixe standard (sd, hd ou fhd)
    const resPrefix = isSD ? "sd" : (isHighResMode ? "fhd" : "hd");
    priceKey = `${resPrefix}${calcDuration}`;
}

    console.log("DEBUG PRIX 512P", {
        resolution,
        normalizedResolution,
        is512p,
        calcDuration,
        priceKey
    });
    // Si l'utilisateur utilise ses éclairs bonus, on regarde la table tarifaire de son plan réel, sinon plan "0.00"
    const targetPlan = mustForce ? "0.00" : currentPlanPrice;
    console.log("DEBUG IDENTIFICATION PRIX", {
    currentEngineId,
    pricingId,
    targetPlan,
    tableTrouvee: PRICING_DATA[targetPlan]?.[pricingId]
});
    let baseCost = PRICING_DATA[targetPlan]?.[pricingId]?.[priceKey] || 0;

    // Fallback de sécurité corrigé pour Hailuo
    if (baseCost === 0) {
        const fallbackData = currentEngineData.prices?.[calcDuration] || Object.values(currentEngineData.prices || {})[0];
        
        let defaultResKey = isHighResMode ? "1080p" : "720p";
  if (isHailuo) {
    defaultResKey = is512p
        ? (calcDuration === "10" ? "p512_10" : "p512_6")
        : "hd" + calcDuration;
        } else if (isPixverse) {
    defaultResKey = is512p
        ? (calcDuration === "10" ? "p512_10" : "p512_5")
        : "hd" + calcDuration;
}

        baseCost = fallbackData?.[defaultResKey] || currentEngineData.rubyPrice || 20;
    }

// 4. MULTIPLICATEURS ET ARRONDIS

if (mode === "VIDEO") {
        const techId = currentEngineId.toLowerCase();

        // 💡 UTILISE TA VARIABLE EXISTANTE
        const hasVideo = Boolean(videoSource);

        // Si Luma + vidéo source : on additionne le prix de base (ex: 20 + 20 = 40)
        if (techId.includes("luma") && hasVideo) {
            baseCost += baseCost; 
        }

        if (wantsAudio) {
            const multi = (techId.includes("kling") || techId.includes("hailuo") || techId.includes("veo") || techId.includes("luma")) ? 2.0 : 
                          (techId.includes("seedance") ? 1.5 : 1.25);
            baseCost *= multi;
        }

        if (endImage && userTierIdx < masterIdx) {
            baseCost += 1;
        }

        const isExactPriceModel = techId.includes("luma") || 
                                 techId.includes("lite") || 
                                 techId.includes("kling") || 
                                 techId.includes("hailuo") || 
                                 techId.includes("pixverse") || 
                                 techId.includes("seedance") ||
                                 techId.includes("veo");

        if (isExactPriceModel) {
            baseCost = Math.ceil(baseCost);
        } else {
            baseCost = baseCost > 20 ? Math.ceil(baseCost / 5) * 5 : Math.ceil(baseCost);
        }
    } else {
        baseCost = Math.ceil(baseCost);
    }

    setCost(baseCost);
  }
},

// Et dans ton tableau de dépendances, mets bien ta vraie variable au lieu de hasVideoSource :
[selectedModel, resolution, mode, duration, wantsAudio, endImage, userPlan, videoSource]);

const getEndpoint = (engineData, hasStartImage, hasVideoSource) => {
  if (!engineData || !engineData.id) return "";
  
  const engineId = engineData.id.toLowerCase();
  
  // Prise en compte de "Full HD", "1080p" et "pro"
  const isPro = resolution === "1080p" || resolution === "Full HD" || resolution === "pro";
  const range = isPro ? "pro" : "standard";

  // 0. GESTION SPÉCIFIQUE KLING MOTION CONTROL
  if (engineId === "kling26_motion" || engineId.includes("motion")) {
      return `fal-ai/kling-video/v2.6/${range}/motion-control`;
  }
// GESTION SPÉCIFIQUE LUMA RAY 2 FLASH (Endpoints dynamiques)
if (engineId.includes("luma")) {
      if (hasVideoSource) {
          return "fal-ai/luma-dream-machine/ray-2-flash/modify"; 
      
      }
      return hasStartImage 
          ? "fal-ai/luma-dream-machine/ray-2-flash/image-to-video" // Mode Image-to-Video
          : "fal-ai/luma-dream-machine/ray-2-flash";           // Mode Text-to-Video
  }
// PRIORITÉ PIXVERSE V6
if (engineId.includes("pixverse")) {
    // Si une vidéo source est présente, on utilise l'endpoint d'extension
    if (hasVideoSource) {
        return "fal-ai/pixverse/v6/extend";
    }
    const hasAnyImage = Boolean(startImage || uploadedImage || endImage);
    
    return hasAnyImage 
        ? "fal-ai/pixverse/v6/image-to-video" 
        : "fal-ai/pixverse/v6/text-to-video";
}
  // 1. PRIORITÉ HAILUO
  if (engineId.includes("hailuo")) {
      const mode = hasStartImage ? "image-to-video" : "text-to-video";
      return `fal-ai/minimax/hailuo-02/${range}/${mode}`;
  }

  // 2. PRIORITÉ KLING 3.0 (Parentheses corrigées)
  if (engineId === "kling30" || (engineId.includes("kling") && engineId.includes("3"))) {
      const mode = hasStartImage ? "image-to-video" : "text-to-video";
      return `fal-ai/kling-video/v3/${range}/${mode}`;
  }
// 3.A. PRIORITÉ SEEDANCE 1.5 PRO (Mis à jour pour l'image de début ou de fin)
  if (engineId.includes("seedance") && engineId.includes("1.5")) {
      const modePath = (hasStartImage || (typeof endImage !== 'undefined' && endImage)) ? "image-to-video" : "text-to-video";
      return `fal-ai/bytedance/seedance/v1.5/${range}/${modePath}`;
  }

  // 3. PRIORITÉ SEEDANCE 2.0
// Ajout de "|| endImage" pour déclencher le mode reference dès qu'une image de fin est présente
// PRIORITÉ PIXVERSE V6 CORRIGÉE
if (engineId.includes("pixverse")) {
    if (hasVideoSource) {
        return "fal-ai/pixverse/v6/extend";
    }
    
    const hasStart = Boolean(startImage || uploadedImage);
    const hasEnd = Boolean(endImage);

    // Si tu as les deux, on cible l'endpoint "transition"
    if (hasStart && hasEnd) {
        return "fal-ai/pixverse/v6/transition";
    }
    
    return (hasStart || hasEnd) 
        ? "fal-ai/pixverse/v6/image-to-video" 
        : "fal-ai/pixverse/v6/text-to-video";
  }
  
  // 5. FALLBACK par défaut
  return engineData.textEndpoint || engineData.endpoint;
};
// --- FONCTION handleGenerate ---
const handleGenerate = async () => {
  // 🛑 BLOQUE EN 0ms SI CRÉDITS INSUFFISANTS (Pas de spinner, pas d'API)
  const requiredCost = parseInt(cost || 0, 10);
  const availableEclairs = tokens || 0;
  const availableDiamonds = packTokens || 0;

  const hasEnough = forceDiamonds 
    ? (availableDiamonds >= requiredCost)
    : ((availableEclairs + availableDiamonds) >= requiredCost);

  if (!hasEnough) {
    if (typeof setNeededAmount === 'function') setNeededAmount(requiredCost);
    if (typeof setShowInsufficientFunds === 'function') setShowInsufficientFunds(true);
    return; // STOP TOTAL INSTANTANÉ !
  }
  setIsLoading(true);
// 🧪 MODE TEST (Placé au bon endroit)
  const TEST_MODE = false;
  console.log("🧪 TEST_MODE =", TEST_MODE);

  if (TEST_MODE) {
    // Fausse URL pour éviter l'erreur "finalUrl is not defined"
    const fakeUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    console.log("🎯 --- VÉRIFICATION TEST KLING 3.0 ---");
    console.log("📐 Résolution choisie :", resolution);
    console.log("🔗 Endpoint généré :", targetModelEndpoint);
    console.log("-------------------------------------");

    const item = {
      id: Date.now(),
      url: fakeUrl,
      type: mode,
      prompt,
      model: selectedModel,
      style: selectedStyle,
      aspectRatio,
      duration,        
      resolution,        
      startImage: startImage || null, 
      endImage: endImage || null,    
      wantsAudio: wantsAudio || false, 
      createdAt: new Date().toISOString()
    };

setActiveItem(item);

    setIsLoading(false);
    return;
  }

  console.log("🚀 Début de handleGenerate");
  if (!prompt) return;


  const styleKey = (selectedStyle || "").trim().toLowerCase();
  let cleanPrompt = prompt ? prompt.trim() : "";
  let styleSuffix = "";

  // Définition des suffixes selon le style
switch (styleKey) {
    case "cyberpunk":
      styleSuffix = "Cyberpunk style, futuristic, neon lighting, night city, 8k details, cinematic";
      break;
    case "anime":
    case "manga":
      styleSuffix = "Japanese anime style, modern manga illustration, clean lines, vibrant colors, masterpiece quality";
      break;
    case "réaliste":
    case "real":
    case "film":
      styleSuffix = "photorealistic, extreme realism, Hollywood cinema quality, 8k, detailed skin textures, volumetric lighting, HDR";
      break;
    case "animation 3d":
      styleSuffix = "3D animation style, Pixar aesthetic, a cute little robot holding a glowing neon crystal in a magical enchanted forest at night, volumetric lighting, bioluminescent glowing plants, highly detailed textures, expressive character design, cinematic depth of field, 8k resolution, smooth motion.";
      break;
    case "art":
      styleSuffix = "oil painting style, textured brushstrokes, classical fine art aesthetic, rich color palette, masterpiece canvas texture";
      break;
    case "espace":
      styleSuffix = "espace profond, ambiance cosmique, étoiles précises, qualité IMAX, éclairage spatial réaliste";
      break;
    case "animation":
      styleSuffix = "style film d'animation 3D, couleurs riches, décors magistraux, féerique, style Pixar ou Disney moderne";
      break;
    case "marketing":
      styleSuffix = "photographie publicitaire premium, style magazine de luxe, éclairage de studio professionnel, esthétique glamour, netteté extrême";
      break;
    case "aquarelle":
      styleSuffix = "style peinture aquarelle, touches artistiques fluides, éclaboussures de peinture fine, couleurs vives";
      break;
    case "stop motion":
      styleSuffix = "style stop-motion en pâte à modeler, textures tactiles et artisanales visibles, animation image par image";
      break;
    default:
      styleSuffix = "qualité supérieure, ultra détaillé";
  }
  // 🛡️ Anti-doublon : On vérifie si la première expression du style est déjà dans le prompt
  const firstKeyword = styleSuffix.split(',')[0].trim().toLowerCase();
  
  let finalPrompt = cleanPrompt;
  if (!cleanPrompt.toLowerCase().includes(firstKeyword)) {
      finalPrompt = `${cleanPrompt}, ${styleSuffix}`;
  }

  // Nettoyage final des doubles virgules et espaces multiples
  finalPrompt = finalPrompt.replace(/,\s*,/g, ',').replace(/\s+/g, ' ');
// --- 🔍 LOG DE VÉRIFICATION ---
  console.log("--- PROMPT FINAL ENVOYÉ À L'API ---");
  console.log("Moteur:", selectedModel);
  console.log("Prompt:", finalPrompt);
  console.log("Style appliqué:", selectedStyle);

  const activeEngineId = selectedModel?.toLowerCase() || "";
const engineData = engines.find(e => 
  e.id === selectedModel || 
  e.name === selectedModel ||
  e.id === selectedModel?.toLowerCase() ||
  e.name?.toLowerCase() === selectedModel?.toLowerCase()
);

if (!engineData) {
  console.error(`❌ Impossible de trouver l'engin correspondant à : ${selectedModel}`);
  return;
}
// Déclaration unique au début
let finalModelId = engineData.id;
const isKlingMotion = finalModelId === "kling26_motion";

if (isKlingMotion && !startImage && !uploadedImage) {
  if (typeof setErrorMsg === 'function') setErrorMsg("Veuillez sélectionner une image pour le personnage.");
  return;
}

if (isKlingMotion && !videoSource) {
  if (typeof setErrorMsg === 'function') setErrorMsg("Veuillez importer une vidéo de référence pour le mouvement.");
  return;
}

  // --- 1. CONFIGURATION DES PALIERS ---
  const packs = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];
  const userPlanPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
  const userTierIndex = packs.indexOf(userPlanPrice);
  const masterTierIndex = packs.indexOf("34.99"); 
  const isPriorityUser = userPlanPrice === "59.99" || userPlanPrice === "159.99";

  // --- 2. DÉTERMINATION DE L'ID MODÈLE ET DURÉE ---
finalModelId = engineData.id;  let effectiveDuration = mode === "IMAGE" ? "0" : duration.toString().replace(/\D/g, "");
const isHighRes = (resolution === "Full HD" || resolution === "1080p");

  // 🛡️ SÉCURITÉ VEO : On nettoie les entrées avant de préparer l'objet final
  if (finalModelId.toLowerCase().includes("veo")) {
      console.warn("⚠️ Nettoyage des paramètres : Veo ne supporte pas V2V ou Image de fin.");
      // Tu peux même annuler les variables d'état si nécessaire pour l'UI
      setVideoSource(null);
      setEndImage(null);
  }

  // --- 3. RÉCUPÉRATION DU COÛT ET DU TYPE (DEPUIS LE STUDIO) ---
  // On utilise finalCost et costType pour être raccord avec l'affichage à l'écran
  const finalCost = cost; 
  const finalType = forceDiamonds ? "diamonds" : "tokens";

// --- LOGIQUE DE DÉBIT UNIQUE (Ne pas déclarer deux fois !) ---

  let finalEclairs = tokens;
  let finalDiamonds = packTokens;
  let paymentDetail = { eclairs: 0, diamonds: 0 };

  if (finalType === "diamonds") {
      paymentDetail.diamonds = finalCost;
      finalDiamonds = packTokens - finalCost;
  } else {
      let remainingToPay = finalCost;
      if (tokens > 0) {
          const deduction = Math.min(tokens, remainingToPay);
          paymentDetail.eclairs = deduction;
          finalEclairs = tokens - deduction;
          remainingToPay -= deduction;
      }
      if (remainingToPay > 0) {
          paymentDetail.diamonds = remainingToPay;
          finalDiamonds = packTokens - remainingToPay;
      }
  }
  // --- 6. LANCEMENT DE LA GÉNÉRATION ---

  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (mode !== "TEXTE") setProgress(15);

  try {
    // ... ton fetch vers l'API commence ici
      if (mode === "TEXTE") {
        // ... (Ton code texte existant)
      } else {
        // --- LOGIQUE IMAGE / VIDEO ---

       // ✅ 1. Gestion des messages de statut
if (isPriorityUser) {
    setStatusMsg(`⚡ Priorité Max : ${selectedModel} vous répond immédiatement...`);
} else {
    // On utilise selectedModel pour que le message change selon ton choix
    const actionVerb = mode === "IMAGE" ? "Prépare votre image" : "Met en scène votre vidéo";
    setStatusMsg(`⏳ ${selectedModel} : ${actionVerb}...`);
}

        let width = 1024, height = 1024;
        if (aspectRatio === "16:9") { width = 1280; height = 720; }
        if (aspectRatio === "9:16") { width = 720; height = 1280; }

// --- 4. PRÉPARATION DES PARAMÈTRES POUR LUMA ---
const lumaParams = {
    prompt: finalPrompt, // ✅ CORRIGÉ : On utilise finalPrompt (qui contient le style appliqué) au lieu de userPrompt
    resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p",
    duration: (effectiveDuration === "10" || effectiveDuration === "9") ? "9s" : "5s",
    aspect_ratio: aspectRatio || "16:9", // ✅ CORRIGÉ : On utilise la variable globale aspectRatio
    image_url: startImage || uploadedImage || null,
    
    // Ajoute cette ligne pour activer l'interpolation (A -> B)
    end_image_url: endImage || null, 
    
    loop: false 
};

// --- 1. Calcul du modèle final (Mutation vers Image-to-Image)
// On vérifie startImage OU uploadedImage pour être sûr de couvrir tous les cas de Remix
// ✅ CORRIGÉ : Pas de "let" (on réassigne la variable déjà créée plus haut) et on utilise engineData
finalModelId = engineData.id.toLowerCase(); 
const hasImageSource = startImage || uploadedImage;

if (mode === "IMAGE" && hasImageSource) {
    // Cas pour Flux Dev (souvent encore en /image-to-image)
    if (finalModelId.includes("flux/dev")) {
        finalModelId = "fal-ai/flux/dev/image-to-image";
    } 
    // Cas pour Flux 1.1 Pro
    else if (finalModelId.includes("flux-pro/v1.1")) {
        finalModelId = "fal-ai/flux-pro/v1.1/redux";
    } 
    // Cas pour Flux Schnell
    else if (finalModelId.includes("flux/schnell")) {
        finalModelId = "fal-ai/flux/schnell";
    }
}

// 2. Choix de l'endpoint
const endpoint = mode === "IMAGE" ? 'generate-image' : 'generate-video';    
const isKling = finalModelId.includes("kling");
const isV26 = finalModelId.includes("v2.6");

const imageKey = isKling ? (isV26 ? "start_image_url" : "image_url") : "start_image_url";
const tailKey = isKling ? (isV26 ? "end_image_url" : "tail_image_url") : "end_image_url";

// ... juste avant le "const endpoint = ..."

// 2. Choix dynamique de l'endpoint via la nouvelle fonction
const hasStartImage = !!(startImage || uploadedImage || endImage);
const hasVideoSource = typeof videoSource !== 'undefined' ? !!videoSource : false; 
const targetModelEndpoint = getEndpoint(engineData, hasStartImage, hasVideoSource);

// --- 📊 RÉSUMÉ DES PARAMÈTRES DE GÉNÉRATION ---
console.log("--- 📊 PARAMÈTRES DE GÉNÉRATION ---");
console.log("🤖 Moteur :", selectedModel);
console.log("🔗 Endpoint choisi :", targetModelEndpoint);
console.log("📐 Résolution :", resolution);
console.log("📏 Format (Aspect Ratio) :", aspectRatio);
console.log("⏱️ Durée :", effectiveDuration);
console.log("🎨 Style :", selectedStyle);
console.log("🖼️ Image de début :", !!(startImage || uploadedImage));
console.log("🏁 Image de fin :", !!endImage);
console.log("🔊 Audio activé :", wantsAudio);
console.log("----------------------------------");
// 3. Appel API (Détermination dynamique de la route)
const targetRoute = mode === "VIDEO" ? "generate-video" : "generate-image";

// Préparation dynamique de la configuration par moteur
const engineSpecificParams = (function() {
    // Fonction utilitaire pour valider la durée selon le modèle
    const getValidDuration = (modelId, dur) => {
        const d = parseInt(dur);
        if (modelId.includes("veo")) {
            return (d >= 8) ? 8 : 4; // Si c'est Veo, on force 4 ou 8 max
        }
        return d; // Pour les autres, on laisse la valeur choisie
    };
if (isKlingMotion) {
    return {
      image_url: startImage || uploadedImage || null,
      video_url: videoSource,
      prompt: finalPrompt,
      character_orientation: (typeof characterOrientation !== 'undefined' && characterOrientation) ? characterOrientation : "video",
      keep_original_sound: (typeof wantsAudio !== 'undefined') ? wantsAudio : true
    };
  }
if (finalModelId.includes("luma") && finalModelId.includes("flash")) {
        const hasVid = Boolean(videoSource);
        const hasImg = Boolean(startImage || uploadedImage || endImage);

        return {
            prompt: finalPrompt,
            resolution: resolution?.toLowerCase().includes("540") ? "540p" : ((resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p"),            
            duration: (effectiveDuration === "10" || effectiveDuration === "9") ? "9s" : "5s",
            aspect_ratio: aspectRatio || "16:9",
            ...(hasVid ? { video_url: videoSource } : {}),
            ...(hasImg ? { 
                image_url: startImage || uploadedImage || null,
                end_image_url: endImage || null 
            } : {}),
            loop: false
        };
    }
    // 1. ISOLATION DE VEO LITE
if (finalModelId.includes("veo3_lite")) {
    return { 
        prompt: finalPrompt, 
        duration: getValidDuration(finalModelId, effectiveDuration),
        enable_audio: wantsAudio, 
        resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p", 
        aspect_ratio: aspectRatio,
        ...((typeof videoSource !== 'undefined' && videoSource) ? { video_url: videoSource } : { image_url: startImage || uploadedImage || null }) 
    };
}
    
    // 2. VEO STANDARD (Correction ici)
    if (finalModelId.includes("veo")) {
        return { 
            prompt: finalPrompt, 
            duration: getValidDuration(finalModelId, effectiveDuration), // <--- Utilise la fonction de sécurité
            enable_audio: wantsAudio, 
            resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p", 
            aspect_ratio: aspectRatio, 
            ...((typeof videoSource !== 'undefined' && videoSource) ? { video_url: videoSource } : { image_url: startImage || uploadedImage || null }) 
        };
    }

    // ... tes autres conditions (kling, pixverse, etc.) ...
    if (finalModelId.includes("kling")) return { prompt: finalPrompt, [imageKey]: startImage || uploadedImage || null, [tailKey]: endImage || null, generate_audio: wantsAudio, aspect_ratio: aspectRatio, duration: ["15", "10", "5"].includes(effectiveDuration) ? effectiveDuration : "5", negative_prompt: "blur, distort, and low quality" };
if (finalModelId.includes("pixverse")) {
  const is540p = resolution === "540p";
    return { 
        prompt: finalPrompt, 
        image_url: startImage || uploadedImage || null, 
        ...(endImage && { end_image_url: endImage }), 
        // Ajoute ceci si tu passes une vidéo source pour la modif :
        ...(videoSource && { video_url: videoSource }), 
        duration: parseInt(effectiveDuration), 
        generate_audio_switch: wantsAudio, 
        resolution: is540p ? "540p" : ((resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p")
    };
}

if (finalModelId.includes("seedance")) {
        return {
            prompt: finalPrompt,
            aspect_ratio: aspectRatio || "16:9",
            resolution: resolution || "720p",
            duration: parseInt(effectiveDuration) || 5,
            generate_audio: wantsAudio,
            image_url: startImage || uploadedImage || null,
            end_image_url: endImage || null
        };
    }

    if (finalModelId.includes("hailuo")) 
    return { 
        prompt: finalPrompt, 
        image_url: startImage || uploadedImage || null, 
        end_image_url: endImage || null, 
        prompt_optimizer: true, 
        aspect_ratio: aspectRatio,
        resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : ((resolution === "512p" || resolution === "512p") ? "512p" : "768p"), 
        duration: parseInt(effectiveDuration) 
    };    if (finalModelId.includes("lite")) return { prompt: finalPrompt, image_url: startImage || uploadedImage || null, end_image_url: endImage || null, duration: parseInt(effectiveDuration), resolution: (resolution === "Full HD" || resolution === "1080p") ? "1080p" : "720p", aspect_ratio: aspectRatio };
    
    return { prompt: finalPrompt, start_image_url: startImage || uploadedImage || null, end_image_url: endImage || null, aspect_ratio: aspectRatio };
})();

// Détection explicite de l'image disponible
const currentStartImg =
    (typeof startImage === "string" && startImage.trim())
        ? startImage
        : (typeof uploadedImage === "string" && uploadedImage.trim()
            ? uploadedImage
            : null);

console.log(
    "🖼️ IMAGE DE DÉPART ENVOYÉE :",
    currentStartImg
        ? (currentStartImg.startsWith("data:")
            ? "DATA URL / BASE64"
            : currentStartImg)
        : "AUCUNE IMAGE"
);

let recaptchaToken = "";
try {
    if (window.grecaptcha?.enterprise?.execute) {
        recaptchaToken = await window.grecaptcha.enterprise.execute("6LdYEaItAAAAALoBXNIY3bjruS-UiAla3Ns2M1sq", { action: "generate_video" });
    }
} catch (e) {
    console.warn("reCAPTCHA n'a pas pu s'exécuter :", e);
}
console.log("🔍 Valeur actuelle de videoSource :", videoSource);
const payload = { 
    userId: user.uid,
    engineId: finalModelId,
    modelEndpoint: targetModelEndpoint,
    cost: cost,
    costType: forceDiamonds ? "diamonds" : "tokens",
    enable_audio: wantsAudio,
    prompt: finalPrompt,
    
    recaptchaToken: recaptchaToken,

    aspect_ratio: aspectRatio, 
    
    duration: effectiveDuration,
resolution: (finalModelId.includes("hailuo") || finalModelId.includes("seedance20") || finalModelId.includes("seedance")) 
    ? resolution 
    : ((["540p", "Full HD", "1080p", "720p", "480p"].includes(resolution)) ? resolution : "720p"),

    // Transmission des images sous les différents formats attendus
    startImage: currentStartImg,
    start_image_url: currentStartImg,
    image_url: currentStartImg,
    end_image_url: endImage || null,


video: videoSource || null,   
    video_url: videoSource || null,  
    
    width: width,
    height: height,
    engine: selectedModel,
    priority: isPriorityUser ? "high" : "normal",
    style: selectedStyle,
    
    // Fusion des paramètres spécifiques à chaque moteur
    ...engineSpecificParams,
    
    // Condition pour le mode remix/image
    ...(mode === "IMAGE" && hasImageSource && { strength: 1 - (remixStrength || 0.5) })
};
// 1. Nettoyage du payload : on supprime les valeurs nulles/indéfinies pour ne pas polluer l'API
const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
);

// 🛡️ SÉCURITÉ : On s'assure que le token reCAPTCHA n'est jamais supprimé par le filtre ci-dessus
if (recaptchaToken) {
    cleanPayload.recaptchaToken = recaptchaToken;
}

console.log("🔍 [DEBUG] Payload nettoyé envoyé au serveur :", JSON.stringify(cleanPayload, null, 2));

const currentUser = auth.currentUser;
const token = currentUser ? await currentUser.getIdToken() : '';

const res = await fetch(`${import.meta.env.VITE_API_URL}/${targetRoute}`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(cleanPayload)
});

// --- 1. GESTION DE L'ERREUR SERVEUR (0 CRÉDIT, ETC.) ---// 🛑 1. GESTION DES ERREURS HTTP (400, 500, etc.)
if (!res.ok) {
    let errorMessage = "Erreur lors de la génération";
    try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
        errorMessage = await res.text().catch(() => errorMessage);
    }
    
    console.error("❌ Erreur serveur détaillée :", errorMessage);

    // Arrêt strict du loader et réinitialisation de l'UI
    setIsLoading(false);
    setProgress(0);
    setStatusMsg("");
    if (typeof setErrorMsg === 'function') {
        setErrorMsg(errorMessage);
    } else {
        alert(errorMessage);
    }

    // ⚡ RABAISSEMENT ET RAFRAÎCHISSEMENT DES CRÉDITS UTILISATEUR
    if (typeof fetchUserProfile === 'function') {
        fetchUserProfile(); 
    }
    return; // On stoppe l'exécution immédiatement !
}

// --- PARSAGE ET DÉTECTION D'ERREUR SSE ---
// 📡 2. LECTURE DU FLUX SSE EN TEMPS RÉEL
const reader = res.body.getReader();
const decoder = new TextDecoder();
let data = null;

while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('data:')) {
            try {
                const jsonStr = line.replace('data:', '').trim();
                if (jsonStr) {
                    const parsed = JSON.parse(jsonStr);
                    data = parsed;
                    
                    // Interception d'une erreur renvoyée par le serveur dans le flux
                    if (parsed.status === 'failed' || parsed.error) {
                        setIsLoading(false);
                        setProgress(0);
                        setStatusMsg("");
                        if (typeof setErrorMsg === 'function') {
                            setErrorMsg(parsed.error || "Problème technique lors de la génération. Vos crédits ont été restitués.");
                        }
                        return;
                    }
                }
            } catch (e) {
                // Ignore les lignes incomplètes pendant le stream
            }
        }
    }
}

if (!data) {
    console.error("❌ Impossible de lire le flux de données");
    setIsLoading(false);
    return;

}
// 4. Extraction de l'URL directe
let finalUrl = data.videoUrl || data.imageUrl || data.url || data.video_url || data.resultUrl;
const falRequestId = data.requestId || data.request_id;

console.log("✅ DATA FINALE :", data);
console.log("URL IMMÉDIATE :", finalUrl || "Aucune (Attente Polling/Async)");
setStatusMsg(""); 
setIsLoading(false);
// ==========================================================
// 1. CAS SUCCÈS IMMÉDIAT (Simulation / Direct)
// ==========================================================
if (finalUrl) {
    console.log("🎉 Génération immédiate réussie ! URL :", finalUrl);

    const newItem = { 
        id: Date.now(), 
        url: finalUrl, 
        prompt: prompt, 
        type: mode,     
        model: selectedModel,
        style: selectedStyle,
        aspectRatio: aspectRatio, 
        ...(mode === "VIDEO" && {
            resolution: resolution,
            duration: duration,
            startImage: startImage, 
            endImage: endImage,   
            wantsAudio: wantsAudio
        })
    };

// Mise à jour de l'état (uniquement l'élément actif)
    setActiveItem(newItem);

    // 🛑 ARRÊT STRICT DU CHARGEMENT
    setIsLoading(false);
    setProgress(100);
    setStatusMsg("");

    // Nettoyage de l'UI
    setPrompt(""); 
    setStartImage(null); 
    setEndImage(null);
    setWantsAudio(false); 
    setDuration("5");           
    
    if (successAudio.current) successAudio.current.play().catch(() => {});          
    console.log(`✅ ${mode} affichée et enregistrée avec succès.`);
    return;
}

// ==========================================================
// 2. CAS POLLING FAL.AI (Si pas d'URL directe)
// ==========================================================
if (!finalUrl && falRequestId) {
    console.log("⏳ Suivi Fal.ai démarré pour Request ID :", falRequestId);
    setStatusMsg(`⏳ Génération en cours sur ${selectedModel}...`);

    let attempts = 0;
    const falInterval = setInterval(async () => {
        try {
            attempts++;
            if (attempts > 100) { 
                clearInterval(falInterval);
                setIsLoading(false);
                setErrorMsg("Temps d'attente dépassé pour Fal.ai.");
                return;
            }

            const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/api/status/${falRequestId}`);
            if (!statusRes.ok) return;

            const statusData = await statusRes.json();
            if (statusData.status === "COMPLETED" && (statusData.videoUrl || statusData.imageUrl)) {
                clearInterval(falInterval);

                const resultUrl = statusData.videoUrl || statusData.imageUrl;
                const finalItem = {
                    id: Date.now(),
                    url: resultUrl,
                    prompt: prompt,
                    type: mode,
                    model: selectedModel,
                    style: selectedStyle,
                    aspectRatio: aspectRatio,
                    ...(mode === "VIDEO" && {
                        resolution: resolution,
                        duration: duration,
                        startImage: startImage,
                        endImage: endImage,
                        wantsAudio: wantsAudio
                    })
                };
                setActiveItem(finalItem);
                setProgress(100);
                setIsLoading(false);
                setStatusMsg("");
                setPrompt("");
                if (successAudio.current) successAudio.current.play().catch(() => {});
            } else if (statusData.status === "FAILED") {
                clearInterval(falInterval);
                setIsLoading(false);
                setErrorMsg("La génération a échoué chez Fal.ai.");
            }
        } catch (err) {
            console.error("❌ Erreur polling Fal.ai :", err);
        }
    }, 4000);

    return; 
}

        if (data.async && data.operationName) {
            console.log("⏳ Mode asynchrone détecté. Début du suivi pour :", data.operationName);
            // --- NOUVEAU SYSTÈME DE SUIVI SÉCURISÉ ---
            let currentProgress = 15;
            const progressInterval = setInterval(() => {
                if (currentProgress < 90) {
                    currentProgress += 2; 
                    setProgress(currentProgress);
                }
            }, 2000);

            // ⏱️ Gestion du temps max (10 minutes)
            let attempts = 0; 
            const maxAttempts = 100; // 100 essais * 6 secondes = 600s = 10 minutes

         // ==========================================================
// 🌟 GESTION DE LA BOUCLE DE SUIVI (POLLING) - VERSION MISE À JOUR
// ==========================================================

const intervalId = setInterval(async () => {
    try {
        attempts++;

        // ⏱️ Sécurité : Timeout après 10 minutes
        if (attempts > maxAttempts) {
            clearInterval(intervalId);
            clearInterval(progressInterval);
            setIsLoading(false);
            setErrorMsg("Temps d'attente maximum dépassé (10 min).");
            throw new Error("Timeout : Google Veo n'a pas répondu dans le temps imparti.");
        }

        if (!data?.operationName) {
            clearInterval(intervalId);
            clearInterval(progressInterval);
            throw new Error("Le ticket d'opération renvoyé par le serveur est manquant.");
        }

const statusRes = await fetch("${import.meta.env.VITE_API_URL}/check-veo-status", {
              method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operationName: data.operationName,
                userId: user?.uid || "",
                cost: cost || 0,
                fieldToDecrement: data.fieldToDecrement || "tokens"
            })
        });

        if (!statusRes.ok) return; // On continue la boucle si le réseau est instable
        const statusData = await statusRes.json();

        // 🏁 Vérification de fin de traitement
        if (statusData.done) {
            clearInterval(intervalId); // 🛑 Arrêt strict
            clearInterval(progressInterval);

            if (statusData.error) {
                console.error("❌ Erreur retournée par Google Veo :", statusData.error);
                setErrorMsg(`Erreur Google Veo: ${statusData.error}`);
                setIsLoading(false);
            } 
            else if (statusData.videoUrl) {
                console.log("✅ Vidéo reçue, URL :", statusData.videoUrl);
                
                const finalItem = {
                    id: Date.now(),
                    url: statusData.videoUrl,
                    prompt: prompt,
                    type: mode,
                    model: selectedModel,
                    style: selectedStyle,
                    aspectRatio: aspectRatio,
                    ...(mode === "VIDEO" && {
                        resolution: resolution,
                        duration: duration,
                        startImage: startImage,
                        endImage: endImage,
                        wantsAudio: wantsAudio
                    })
                };
                
                // Mise à jour de l'état
                setActiveItem(finalItem);
                console.log("DEBUG: ActiveItem forcé sur :", finalItem); 
                setProgress(100);

                // Nettoyage UI
                setPrompt("");
                setStartImage(null);
                setEndImage(null);
                setWantsAudio(false);
                setDuration("5");
                setIsLoading(false);
                setStatusMsg("");
                if (successAudio.current) successAudio.current.play().catch(() => {});
            } 
            else {
                // 🛡️ CAS D'ERREUR SILENCIEUSE
                console.error("⚠️ Le serveur a fini le traitement mais aucune URL n'a été retournée.");
                setErrorMsg("Traitement terminé, mais la vidéo est indisponible. Veuillez réessayer.");
                setIsLoading(false);
            }
        }
    } catch (pollingError) {
        clearInterval(intervalId);
        clearInterval(progressInterval);
        setIsLoading(false);
        console.error("❌ Erreur dans la boucle de suivi :", pollingError.message);
    }
}, 6000);

        }        
        // ==========================================================

        // Fallback Pollinations pour les images
if (mode === "IMAGE" && finalUrl && finalUrl.includes("pollinations.ai")) {
          const cleanPrompt = encodeURIComponent(`${prompt}, ${selectedStyle} style`);
          finalUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;
        }

        // ✂️ MODIFICATION ICI : Sécurité pour éviter le doublon avec Google Veo
        if (finalUrl && !data.async) {
          // ✅ MISE À JOUR : Objet newItem ultra-complet pour Remix (Image & Vidéo)
          const newItem = { 
            id: Date.now(), 
            url: finalUrl, 
            prompt: prompt, 
            type: mode,     
            
            // --- PARAMÈTRES COMMUNS (Essentiels pour le Remix Image) ---
            model: selectedModel,
            style: selectedStyle,
            aspectRatio: aspectRatio, 
            
            // --- PARAMÈTRES SPÉCIFIQUES VIDÉO (Conditionnels) ---
            ...(mode === "VIDEO" && {
              resolution: resolution,
              duration: duration,
              startImage: startImage, 
              endImage: endImage,   
               wantsAudio: wantsAudio
            })
          };

      // Mise à jour de l'état (uniquement l'élément actif)
         setActiveItem(newItem);
          
          // ✅ NETTOYAGE COMPLET APRÈS SUCCÈS
          setPrompt(""); 
          setStartImage(null); 
          setEndImage(null);
          setWantsAudio(false); 
          setDuration("5");          
          setProgress(100);  
                   setStatusMsg("");
          if(successAudio.current) successAudio.current.play().catch(() => {});          
          console.log(`✅ ${mode} enregistrée dans l'historique avec succès.`);        
        }
      }
// ... fin de ton code de génération (newItem, etc.)
} catch (e) { 
    console.error("❌ Erreur génération:", e);
    
    // 🛑 ARRÊT IMMÉDIAT DU LOADER
    setIsLoading(false);
    setProgress(0);
    setStatusMsg("");

    // Message à l'utilisateur
    setErrorMsg(
        e.message && e.message.includes("400") 
            ? "Crédits insuffisants pour générer cette vidéo." 
            : "Problème technique, veuillez réessayez plus tard. Vos crédits ont été restitués."
    );

    setTimeout(() => {
        setErrorMsg(null);
    }, 5000);
}
};

const handleSimulation = () => {
  setIsLoading(true); 
  setStatusMsg("Simulation : Test de l'interface...");
  
  setTimeout(() => {
    setIsLoading(false);
    setStatusMsg("");
    console.log("Simulation terminée");
  }, 3000);
};
const handleOptimize = async () => {
    if (!prompt) return;
    setIsThinking(true);
    try {
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken() : '';

 const res = await fetch(`${API_BASE_URL}/intelligence`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ 
    prompt: prompt, // On envoie uniquement le texte saisi par l'utilisateur
    instruction: "Améliore ce prompt pour une IA génératrice de vidéo, sois très précis, donne uniquement le prompt amélioré sans aucun commentaire, sans signature et sans publicité."
  })
});
      
      // 🛡️ Si le serveur renvoie une erreur (ex: 500), on stoppe et on lit le texte brut
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur serveur backend :", errorText);
        throw new Error(`Erreur ${res.status} du serveur`);
      }

      const data = await res.json();
      
      if (!data || !data.result) {
        console.warn("Réponse vide de l'API intelligence", data);
        return;
      }

      let cleanedResult = data.result;
      const separators = ["---", "Pollinations", "Try out", "Généré par", "\n\n"];
      
      separators.forEach(sep => {
        if (cleanedResult && typeof cleanedResult === 'string' && cleanedResult.includes(sep)) {
          cleanedResult = cleanedResult.split(sep)[0];
        }
      });

      if (cleanedResult) {
        setPrompt(cleanedResult.trim());
      }
    } catch (e) { 
      console.error("Erreur lors de l'optimisation :", e); 
    } finally { 
      setIsThinking(false); 
    }
  };
const handleDownload = async () => {
    if (!activeItem?.url) return;
    try {
        const response = await fetch(activeItem.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const extension = activeItem.type === "VIDEO" ? 'mp4' : 'jpg';
        link.download = `eclipse-ia-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Erreur de téléchargement", error);
        window.open(activeItem.url, '_blank');
    }
};

const deleteHistoryItem = async (e, id, itemDocId = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    console.log("🗑️ Tentative de suppression de l'élément :", id);

    // 1. Si c'est un fichier vidéo local importé du PC
    if (typeof id === 'string' && (id.includes('.mp4') || id.includes('local'))) {
        console.log("⚡ Élément local détecté, suppression de l'état local uniquement.");
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory);

        if (activeItem?.id === id) {
            const nextItem = newHistory[0] || null;
            setActiveItem(nextItem);
            if (!nextItem || nextItem.type === "TEXTE") {
                setChatMessages(nextItem?.messages || []);
            }
            setPrompt("");
        }
        return; 
    }
  
    // 2. Si c'est un élément de Firestore (imageLocks)
const currentUser = auth.currentUser;
const realUserId = currentUser.uid;
if (!currentUser) {
    setErrorMsg("Votre session utilisateur n'est plus disponible. Veuillez vous reconnecter.");
    return;
}
const token = await currentUser.getIdToken();

console.log("🔐 Token Firebase récupéré :", !!token);

    if (!realUserId) {
        alert("Erreur : Utilisateur non connecté ou session expirée.");
        return;
    }

    // Utilise l'ID du document Firestore (requestId) transmis ou l'id par défaut
    const targetId = itemDocId || id;

    try {
      // 🔑 ÉTAPE CLÉ AJOUTÉE : Récupération du token d'authentification Firebase
      const token = await currentUser.getIdToken();

      const url = `${import.meta.env.VITE_API_URL}/api/generations/${realUserId}/${targetId}`;
      
      // 🔑 ÉTAPE CLÉ AJOUTÉE : Ajout des headers avec 'Authorization'
      const response = await fetch(url, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la suppression sur le serveur");
      }

      console.log("✅ Élément supprimé de imageLocks et de l'historique !");

      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);

      if (activeItem?.id === id) {
        const nextItem = newHistory[0] || null;
        setActiveItem(nextItem);

        if (!nextItem || nextItem.type === "TEXTE") {
          setChatMessages(nextItem?.messages || []);
        }

        setPrompt("");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
      alert("Impossible de supprimer l'élément.");
    }
};

  // Fonction de rendu visuel pour chaque élément de la barre d'historique
  const renderHistoryItem = (item) => {
    console.log("Rendu de l'historique pour :", item.url);
    return (
      <div key={item.id} className="history-card" onClick={() => handleRemix(item)}>
        {/* Miniature Visuelle Média */}
        <div className="history-thumbnail-wrapper">
          {item.type === "IMAGE" ? (
            <img src={item.url} alt={item.prompt} className="history-thumbnail" />
          ) : (
            <video src={item.url} className="history-thumbnail" muted playsInline preload="metadata" />
          )}
          <span className="history-type-badge">
            {item.type === "IMAGE" ? "📸" : "🎬"}
          </span>
        </div>

        {/* Infos de la carte (Prompt & Actions) */}
        <div className="history-info">
          <p className="history-prompt-text">{item.prompt || item.description || item.text || "Sans description"}</p>
          <div className="history-actions">
            <button className="btn-remix-small">Remixer</button>
<button
    className="btn-delete-small"
    onClick={(e) => deleteHistoryItem(e, item.id)}
>
    ✕
</button>
         </div>
        </div>
      </div>
    );
  };
// Remplace ton ancienne ligne par celle-ci (un tableau vide)
// 1. On ne met plus un tableau vide, mais on définit une fonction d'import automatique
const importLocalVideos = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return; 
        const token = user ? await user.getIdToken() : '';

        // On ajoute l'en-tête d'authentification pour éviter le 401
        const response = await fetch('${import.meta.env.VITE_API_URL}/api/list-videos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json(); 

        // 🛡️ Sécurité : on s'assure que 'data' est bien un tableau avant de faire .map
        const fileNames = Array.isArray(data) ? data : [];

        const localItems = fileNames.map(fileName => ({
            id: `local-${fileName}`, 
            url: `${import.meta.env.VITE_API_URL}/videos/${fileName}`,
            prompt: `Fichier local : ${fileName}`,
            type: "VIDEO",
            model: "Local",
            resolution: "1080p",
            duration: "5"
        }));

        setHistory(prev => {
            const newItems = localItems.filter(item => !prev.some(p => p.id === item.id));
            return [...newItems, ...prev];
        });
        
        console.log("✅ Vidéos locales importées avec succès :", localItems.length);
    } catch (error) {
        console.error("❌ Erreur lors de l'import des vidéos locales :", error);
    }
};

// 2. IMPORTANT : Appelle cette fonction dès que le composant se charge
// ✅ Le gardien qui s'aligne STRICTEMENT sur ton code d'origine
useEffect(() => {
    if (mode !== "VIDEO" || !selectedModel) return;

    const model = selectedModel.toLowerCase();
    const cleanModel = model.replace(/\s+/g, '');
    const d = duration.toString();

    let allowed = [];

    if (cleanModel.includes("veo3") && !model.includes("lite")) {
        allowed = ["4", "6", "8"];
    } else if (model.includes("lite")) {
        allowed = ["4", "8"];
    } else if (model.includes("seedance 2.0")) {
        allowed = ["5", "10", "15"];
    } else {
        // Logique miroir exacte de ton "CAS GÉNÉRAL"
        const firstOption = model.includes("seedance") ? "4" : model.includes("hailuo") ? "6" : "5";
        allowed.push(firstOption);

        const isHailuoPro = model.includes("hailuo") && (resolution === "Full HD" || resolution === "1080p");
        if (!isHailuoPro) {
            const secondOption = model.includes("seedance") ? "12" : model.includes("luma") ? "9" : "10";
            allowed.push(secondOption);
        }

        if (model.includes("kling")) {
            allowed.push("15");
        }
    }

    // Si la durée active n'est pas prévue par ton select, on applique la première option valide
    if (!allowed.includes(d)) {
        setDuration(allowed[0]);
    }
}, [selectedModel, mode, resolution]); // Ajout de resolution ici car elle impacte Hailuo dans ton code
// 🔄 Réinitialise la résolution à 480p si on passe sur Seedance 2 et qu'elle n'est pas adaptée
useEffect(() => {
  if (!selectedModel) return;
  const modelLower = selectedModel.toLowerCase();

  if (modelLower.includes("seedance")) {
    if (resolution !== "480p" && resolution !== "sd") {
      setResolution("480p");
    }
  } else if (modelLower.includes("hailuo")) {
    // Si Hailuo n'a pas une résolution valide (ex: 480p ou 1080p non supporté par défaut), on met 768p ou 512p
    if (resolution !== "768p" && resolution !== "512p" && resolution !== "1080p") {
      setResolution("768p");
    }
  } else if (modelLower.includes("pixverse")) {
    // ✅ Ajout pour Pixverse : autorise 720p, 1080p ou 512p, sinon met 720p par défaut
    if (resolution !== "720p" && resolution !== "1080p" && resolution !== "512p") {
      setResolution("720p");
    }
} else if (modelLower.includes("luma")) {
    // ✅ Autorise le 540p, 720p (HD) ou 1080p / Full HD
    if (resolution !== "540p" && resolution !== "720p" && resolution !== "1080p" && resolution !== "Full HD") {
      setResolution("720p");
    }
  }
}, [selectedModel]);


const handleRemix = (item) => {
  if (!item) return;

  setMode(item.type);

  // 1. Prompt et Uploads
  setPrompt(item.prompt && item.prompt.startsWith("Fichier local :") ? "" : (item.prompt || ""));
  setActiveItem(item);
  setUploadedImage(item.url || item.videoUrl || null);
    
  // 2. Synchronisation des paramètres (Modèle, Style, AspectRatio)
  if (item.model) setSelectedModel(item.model);
  if (item.aspectRatio) setAspectRatio(item.aspectRatio);
  if (item.style) setSelectedStyle(item.style);
  
  // 3. Gestion spécifique au type
  if (item.type === "VIDEO") {
    setResolution(item.resolution || "720p");
      
    setStartImage(item.startImage || null);
    setEndImage(item.endImage || null);
    setWantsAudio(item.wantsAudio || false);
  } else {
    // SI C'EST UNE IMAGE
    setStartImage(null); 
    setEndImage(null);
    setResolution("1080p"); 
    setWantsAudio(false);
    setDuration("4"); // Correction ici aussi pour l'image par défaut
  }

  // 4. Feedback et UI
  setStatusMsg(item.type === "VIDEO" ? "🎬 Vidéo chargée dans le Studio !" : "🖼️ Image chargée dans le Studio !");
  
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setTimeout(() => setStatusMsg(""), 3000);
};

const handleNewGeneration = () => {
  setActiveItem(null); 
  setUploadedImage(null);
  setStartImage(null);
  setEndImage(null);
  setPrompt("");
  setChatMessages([]); // Permet de vider l'historique de chat en même temps
  setMode("TEXTE"); 
  
  if (typeof setStatusMsg === "function") {
    setStatusMsg("Nouveau projet lancé !");
    setTimeout(() => setStatusMsg(""), 2000);
  }
};

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };
const getDaysRemaining = (targetDate) => {
  if (!targetDate) return null;

  try {
    let end;

    // 1. VERIFICATION : Est-ce un Timestamp Firebase ? (possède une propriété .seconds)
    if (targetDate && typeof targetDate === 'object' && targetDate.seconds) {
      end = new Date(targetDate.seconds * 1000); // Conversion en Date JS
    } else {
      // 2. Sinon, on traite comme une String ISO (ton ancien format)
      end = new Date(targetDate);
    }

    const now = new Date();
    
    // Sécurité si la date est invalide
    if (isNaN(end.getTime())) return null;

    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Aujourd'hui";
    return `${days} jour${days > 1 ? 's' : ''}`;
  } catch (e) {
    console.error("Erreur calcul jours:", e);
    return null;
  }
};
  if (view === 'success') {
  return <Success onBack={() => { 
    setView('studio'); 
    setShowStudio(true); 
    window.history.pushState({}, '', '/'); // Nettoie l'URL
  }} />;
}

if (showPricing) {
    // On passe le userPlan pour que Pricing sache s'il doit diviser les prix par 2
    return <Pricing onBack={() => setShowPricing(false)} userPlan={userPlan} />;

  }
// 1. Conditions d'Utilisation
if (showTerms) {
  return (
    <>
      <TermsPage 
        onBack={() => setShowTerms(false)} 
        onContactClick={() => {
          console.log("Bouton cliqué (Terms) !");
          setShowContactModal(true);
        }} 
      />

      {showContactModal && (
        <ContactModal 
          user={user} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </>
  );
}

// 2. Politique de Confidentialité
if (showPrivacy) {
  return (
    <>
      <PrivacyPolicyPage 
        onBack={() => setShowPrivacy(false)} 
        onContactClick={() => {
          console.log("Bouton cliqué (Privacy) !");
          setShowContactModal(true);
        }} 
      />

      {showContactModal && (
        <ContactModal 
          user={user} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </>
  );
}

// 3. Conditions Générales de Vente (CGV)
if (showCgv) {
  return (
    <>
      <CgvPage 
        onBack={() => setShowCgv(false)} 
        onContactClick={() => {
          console.log("Bouton cliqué (CGV) !");
          setShowContactModal(true);
        }} 
      />

      {showContactModal && (
        <ContactModal 
          user={user} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </>
  );
}

// 4. Mentions Légales
if (showLegal) {
  return (
    <>
      <LegalNoticePage 
        onBack={() => setShowLegal(false)} 
        onShowPrivacy={() => {
          setShowLegal(false);    // Ferme les mentions légales
          setShowPrivacy(true);   // Ouvre la politique de confidentialité
        }}
        onContactClick={() => {
          setShowContactModal(true);
        }} 
      />

      {showContactModal && (
        <ContactModal 
          user={user} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </>
  );
}

  // 3. On vérifie la Confidentialité
  if (showPrivacy) {
    return <PrivacyPage onBack={() => setShowPrivacy(false)} />;
  }
if (isAuthLoading || isInitializing) {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#000',
      color: '#fff',
      zIndex: 9999 
    }}>
      {/* Ton logo ou un petit spinner ici */}
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #9333ea', // Violet
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p style={{ letterSpacing: '1px', fontSize: '14px', opacity: 0.8 }}>
        SYNCHRONISATION SÉCURISÉE...
      </p>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
 // --- 4. LE RENDU FINAL (UN SEUL ET UNIQUE) ---
 
 return (
  <div className="app-container" style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden' // INTERDIT le scroll global qui fait tout sauter
  }}> 

          {/* NAVBAR (Toujours en haut) */}
<Navbar 
  logoEclipse={logoEclipse}
  user={user}
  tokens={tokens}
  onOpenProfile={() => setShowProfile(true)} // Garde cette ligne, supprime l'autre
  packTokens={
    user?.packExpiryDate && new Date() > (user.packExpiryDate.seconds ? new Date(user.packExpiryDate.seconds * 1000) : new Date(user.packExpiryDate))
    ? 0 
    : packTokens
  }
  userPlan={userPlan || "debutant"} 
  userPrice={userPlan ? (PLAN_TO_PRICE[userPlan.toLowerCase()] || "0.00") : "0.00"} 
  resetDate={getDaysRemaining(user?.tokensResetDate) || "Sous 30 jours"} 
  expiryDate={
    user?.packExpiryDate 
      ? (user.packExpiryDate.seconds 
          ? new Date(user.packExpiryDate.seconds * 1000) 
          : new Date(user.packExpiryDate) 
        ).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(':', 'h')
      : "12 mois"
  }

  logoEclair={logoEclair}
  onBackToHome={() => {
    setShowStudio(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  onShowHistory={() => {
    setView('history');
    setShowStudio(true); 
  }}
  onStart={(m) => { 
    if (m) setMode(m); 
    setView('studio'); 
    user ? setShowStudio(true) : setShowLogin(true); 
  }}
  onLogout={handleLogout}
  onShowPricing={() => setShowPricing(true)}
  showDropdown={showDropdown} 
  setShowDropdown={setShowDropdown}
/>
{statusMsg && (
      <div className="notification-toast" style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#a855f7',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '30px',
        zIndex: 10000,
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        fontWeight: '600',
        pointerEvents: 'none'
      }}>
        {statusMsg}
      </div>
    )}

<div className="main-viewport" 
  style={{ 
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    // ✅ CHANGEMENT ICI : On utilise 'auto' pour que le scroll apparaisse dès que le contenu dépasse
    // On enlève la condition !showStudio qui verrouillait le scroll
    overflowY: 'auto', 
    position: 'relative',
    height: '100%', 
    scrollbarWidth: 'none', 
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
  }}
>
        <style>{`.main-viewport::-webkit-scrollbar { display: none !important; }`}</style>

        {!showStudio ? (
          <div className="app-landing-wrapper" style={{ width: '100%' }}>
            <LandingPage
              user={user} 
              tokens={tokens}   
              packTokens={packTokens}
              onPurchase={handlePurchase}
              logoEclair={logoEclair} 
              onShowTerms={() => setShowTerms(true)}
              onShowCgv={() => setShowCgv(true)}
              onShowLegal={() => setShowLegal(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
              onShowPricing={() => setShowPricing(true)}
              onLogout={handleLogout} 
              onStart={(modeOption) => {
                if (modeOption && typeof modeOption === 'string') setMode(modeOption);
                user ? setShowStudio(true) : setShowLogin(true);
              }} 
            />
          </div>) : (
          /* --- B. TON MOTEUR COMPLET (STUDIO) --- */
          <>
          {/* CONDITION 1 : Si le mode est REMASTERISE, on affiche UNIQUEMENT l'espace développeur */}
          {mode === "REMASTERISE" ? (
            <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
              <DevelopersPage />
            </div>
          ) : view === 'history' ? (
            /* CONDITION 2 : Si on est dans l'historique */
            <MyHistoryPage 
              history={history} 
              onBack={() => setView('studio')} 
              onRemix={(item) => {
                handleRemix(item);
                setView('studio'); 
              }}
              onDownload={(item) => handleDownload(item)}
              onDelete={(id) => setItemToDelete(id)} 
            />
          ) : (
              /* SINON, ON AFFICHE TON CODE SANS RIEN CHANGER DEDANS */
              <div className="app-layout" style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
                <aside className="sidebar" style={{ 
                  height: '100%', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '15px' 
                }}>                  
                  {/* ... Ton code de sidebar continue ici ... */}
    
<button className="new-chat-btn" onClick={handleNewGeneration}>
  Nouvelle discussion      
</button>

    {uploadedImage && (
      <div className="control-group" style={{ 
        marginTop: '20px', 
        padding: '12px', 
        background: 'rgba(168, 85, 247, 0.08)', 
        borderRadius: '15px',
        border: '1px solid rgba(168, 85, 247, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label className="field-label-tiny" style={{ color: '#a855f7', fontWeight: 'bold' }}>FIDÉLITÉ AU REMIX</label>
          <span style={{ color: '#fff', fontSize: '12px' }}>{Math.round(remixStrength * 100)}%</span>
        </div>
        
        <input 
          type="range" 
          min="0.1" 
          max="0.9" 
          step="0.05" 
          value={remixStrength} 
          onChange={(e) => setRemixStrength(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
          <span>Créatif</span>
          <span>Strict</span>
        </div>
      </div>
    )}

    <div className="history-section" style={{ marginTop: '20px' }}>
      <p className="field-label-tiny">HISTORIQUE ({history.length})</p>
      <div className="history-list">

{/* --- HISTORIQUE OPTIMISÉ : CAPTURE VISUELLE À 4 SECONDES --- */}
{history.map(item => {
  // 1. Récupération de l'URL brute du média
  let mediaUrl = item.url || item.videoUrl || item.imageUrl || (item.video && item.video.url);          
  const isVideo = item.type === "VIDEO" || (mediaUrl && (mediaUrl.includes(".mp4") || mediaUrl.includes(".mp4")));

  return (
    <div 
      key={item.id} 
      className={`history-card ${activeItem?.id === item.id ? 'active' : ''}`} 
      onClick={() => {
        setActiveItem(item);
        if (isVideo && mediaUrl) {
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: activeItem?.id === item.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        border: activeItem?.id === item.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0px',
        marginBottom: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Zone d'affichage du Média (Format Paysage Large) */}
      <div style={{ position: 'relative', width: '100%', height: '110px', background: '#0a0a0c', overflow: 'hidden' }}>
        
        {!isVideo ? (
          /* 📸 RENDU IMAGE */
          <img 
            src={mediaUrl} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          /* 🎬 RENDU VIDÉO : Forçage à la 4ème seconde pour éviter le noir */
 <video 
  src={mediaUrl} 
  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
  muted 
  playsInline 
  preload="auto"
  crossOrigin="anonymous"
  autoPlay
  controls={false}

  onLoadedMetadata={(e) => {
    const video = e.target;
    video.currentTime = 4.0;
  }}

  onCanPlay={(e) => {
    const video = e.target;
    if (video.currentTime < 3.9) {
      video.currentTime = 4.0;
    }
  }}

  onTimeUpdate={(e) => {
    const video = e.target;
    if (video.currentTime >= 4.1) {
      video.pause();
    }
  }}

  onError={(e) => {
    e.target.style.opacity = '0';
    const parent = e.target.parentElement;
    if (parent) {
      parent.style.background = 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)';
    }
  }}
/>
        )}

        {/* Badge Icône type de média */}
        <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', color: '#fff', zIndex: 2 }}>
          {isVideo ? "🎬" : "📸"}
        </span>

        {/* Bouton de suppression */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            setItemToDelete(item.id);
          }}
          style={{ 
            position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', border: 'none', 
            color: '#ef4444', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', zIndex: 3 
          }}
        >
          ✕
        </button>
      </div>

      {/* Infos Bas de Carte */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
         {item.prompt || item.description || item.text || "Sans description"}
        </p>

        {activeItem?.id === item.id && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleRemix(item);
            }}
            style={{ 
              background: '#a855f7', color: '#fff', border: 'none', borderRadius: '6px', 
              padding: '5px 0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            🪄 Remixer
          </button>
        )}
      </div>
    </div>
  );
})}
        {/* --- FIN DE LA BOUCLE --- */}
      </div>
    </div>
  </aside>

<main className="main-content" style={{ 
  flex: 1, 
  height: '100%', 
  overflowY: 'auto', // Permet le scroll UNIQUEMENT ici si le formulaire est trop long
  padding: '20px',
  scrollbarWidth: 'none', // Pour Firefox
  msOverflowStyle: 'none' // Pour IE/Edge
    
}}>
<div className="generator-grid">
                 
{/* PANNEAU DE CONTROLE */}
<div className="control-panel glass-card">
<div className="mode-toggle">
{["IMAGE", "VIDEO", "REMASTERISE"].map(m => {
  if (m === "REMASTERISE") {
    return (
    <button
        key={m}
        disabled // 🚫 Bloque le bouton au niveau HTML
        className="tab-btn" // On retire la classe "active" dynamique le temps du dev
        onClick={(e) => {
          e.preventDefault(); // 🔥 Bloque complètement le clic
        }}
        style={{ 
          cursor: 'not-allowed', // 🚫 Curseur de blocageS
          color: mode === "REMASTERISE" ? '#fff' : '#94a3b8',
          border: mode === "REMASTERISE" ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
         <span style={{ fontSize: '12px' }}></span> Remasterisé
      </button>
    );
  }

  // SINON : On laisse les boutons normaux pour IMAGE et VIDEO
  return (
    <button 
      key={m} 
      className={mode === m ? "active" : ""} 
      onClick={() => {
        setMode(m); // Le useEffect s'occupe de mettre "Flux Pro" ou "Hailuo AI"
        setChatMessages([]);
        setActiveItem(null);
        setStartImage(null);
        setEndImage(null);
      }}
    >
      {m}
    </button>
  );
})}
</div>
  <label className="field-label">{mode === "TEXTE" ? "Discussion IA" : "PROMPT CRÉATIF"}</label>
<textarea 
  value={prompt} 
  onChange={(e) => setPrompt(e.target.value)} 
  placeholder={mode === "TEXTE" ? "Posez votre question..." : "Décrivez votre idée en détail..."} 
  style={{ height: mode === "TEXTE" ? "150px" : "200px", transition: "height 0.3s ease" }}
/>

                <div className="action-bar" style={{ display: 'flex', gap: '10px', marginBottom: '-5px' }}>
  
  
  {/* Le bouton Optimiser reste visible en IMAGE et VIDEO */}
  {mode !== "TEXTE" && (
    <button 
      className="ai-treat-btn" 
      onClick={handleOptimize} 
      disabled={isThinking || !prompt} 
      style={{ flex: 1 }}
    >
      {isThinking ? "⏳ Analyse..." : "✨ Optimiser"}
    </button>
  )}

  {/* ✅ On affiche "Charger" seulement si on est en mode IMAGE */}
  {mode === "IMAGE" && (
    <>
      <input 
        type="file" 
        id="file-upload" 
        style={{ display: 'none' }} 
        onChange={(e) => handleFileToUrl(e, setStartImage)} // Utilisation de ta fonction existante
        accept="image/*" 
      />
      
      {!startImage ? (
        <button 
          className="ai-treat-btn" 
          onClick={() => document.getElementById('file-upload').click()} 
          style={{ flex: 1, background: '#444' }}
        >
          📁 Charger
        </button>
      ) : (
        <div style={{
          flex: 1,
          height: '42px',
          borderRadius: '8px',
          border: '1px solid #a855f7',
          background: `url(${startImage}) center/cover no-repeat`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '5px'
        }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setStartImage(null); }}
            style={{
              background: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      )}
</>
  )}
</div> {/* <--- Cette div ferme "action-bar" */}
{selectedModel?.toLowerCase().includes("seedance") && (
  <div style={{
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>🚀</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
      <strong>Astuce Seedance 2.0 :</strong> Utilisez vos slots pour combiner images et vidéos de référence afin de guider précisément la mise en scène et le style.
    </span>
  </div>
)}
{/* --- MESSAGE D'ASTUCE kling 2.6 capture ENTRE LES MOTEURS ET LES SLOTS --- */}

{selectedModel?.toLowerCase().includes("kling") && (
  <div style={{
    background: "rgba(236, 72, 153, 0.1)",
    border: "1px solid rgba(236, 72, 153, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>💃</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
      <strong>Astuce Kling Motion Control :</strong> Combinez une <strong>Image de personnage</strong> et une <strong>Vidéo source</strong> pour transférer les mouvements et la chorégraphie de la vidéo sur votre personnage.
    </span>
  </div>
)}
{/* --- MESSAGE D'ASTUCE luma ENTRE LES MOTEURS ET LES SLOTS --- */}

{selectedModel?.toLowerCase().includes("luma") && (
  <div style={{
    background: "rgba(234, 179, 8, 0.1)",
    border: "1px solid rgba(234, 179, 8, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>🎬</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
      <strong>Astuce Luma Ray 2 :</strong> Ajoutez une <strong>Vidéo source</strong> pour transformer ou modifier le style et l'ambiance de votre vidéo existante via le prompt.
    </span>
  </div>
)}


{/* --- MESSAGE D'ASTUCE PIXVERSE ENTRE LES MOTEURS ET LES SLOTS --- */}
{selectedModel?.toLowerCase().includes("pixverse") && (
  <div style={{
    background: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box"
  }}>
    <span style={{ fontSize: '1.2rem' }}>✨</span>
    <span style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
<strong>Astuce PixVerse V6 :</strong> Ajoutez une <strong>Vidéo source</strong> uniquement pour <strong>étendre</strong> la durée de votre vidéo existante.    </span>
  </div>
)}

{/* --- ICI COMMENCENT TES SLOTS D'UPLOAD (Image début, Vidéo source, Image fin) --- */}


<div className="simple-controls">
  {/* LIGNE 1 : MOTEUR ET RÉSOLUTION */}
  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
    <div style={{ flex: 1.2 }}>
      <label className="field-label-tiny">MOTEUR</label>
  <select 
  className="artlist-select" 
  // On trouve l'ID correspondant au nom stocké
  value={engines.find(e => e.name === selectedModel)?.id || ""} 
  onChange={(e) => {
    const engineId = e.target.value;
    const engine = engines.find(eng => eng.id === engineId);
    if (engine) {
      setSelectedModel(engine.name); // On stocke "Hailuo AI"
    }
  }}
>
{engines
  .filter(e => e.type === mode)
  .map(e => {
    // 1. On récupère le prix du plan actuel de l'utilisateur (ex: "24.99")
    const currentUserPrice = PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00";
    
    // 2. On compare avec le palier "minPriceForLightning" du moteur
    const userHasAccessToLightning = parseFloat(currentUserPrice) >= parseFloat(e.minPriceForLightning);

    // 3. L'icône est un Éclair seulement si le palier est atteint, sinon c'est un Diamant
    const costIcon = userHasAccessToLightning ? "⚡" : "💎";

    return (
      <option key={e.id} value={e.id}>
        {e.icon} {e.name} {costIcon}
      </option>
    );
})}</select>
    </div>
    
{mode !== "TEXTE" && (

  <div style={{ flex: 1 }}>
    <label className="field-label-tiny">RÉSOLUTION</label>
    {(() => {

      // 🛡️ Définition de isKling26 ici
const currentModelLower = (selectedModel || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const isKling26 = (currentModelLower.includes("kling26") || currentModelLower.includes("26pro")) 
                  && !currentModelLower.includes("motion");    
    const isLuma = selectedModel?.toLowerCase().includes("luma");
      const isHailuo = selectedModel?.toLowerCase().includes("hailuo");
      const isPixverse = selectedModel?.toLowerCase().includes("pixverse");
      const isSeedance2 = selectedModel?.toLowerCase().includes("seedance 2");

      const isHailuo512Invalid = isHailuo && resolution === "512p" && !startImage;

      return (
        <div>
          <select 
            className="artlist-select" 
            value={resolution} 
            onChange={(e) => {
              const selectedRes = e.target.value;
              setResolution(selectedRes);
              if (isHailuo && selectedRes === "512p" && !startImage) {
                setErrorMsg("La résolution 512p pour Hailuo nécessite une IMAGE DÉBUT.");
              }
            }}
          >
            {(() => {
              const currentUserPrice = parseFloat(PLAN_TO_PRICE[userPlan?.toLowerCase()] || "0.00");
              const currentEngine = engines.find(e => e.name === selectedModel);
              const engineReq = parseFloat(currentEngine?.minPriceForLightning || "0.00");

              const hasLightningPlan = currentUserPrice > 0 && currentUserPrice >= engineReq;
              const p480Icon = hasLightningPlan ? "⚡" : "💎";
              const p512Icon = hasLightningPlan ? "⚡" : "💎";
              const p540Icon = hasLightningPlan ? "⚡" : "💎";
              const p768Icon = hasLightningPlan ? "⚡" : "💎";
              const hdIcon = hasLightningPlan ? "⚡" : "💎";
              const fhdIcon = (hasLightningPlan && currentUserPrice >= 34.99) ? "⚡" : "💎";
              const currentModelId = selectedModel?.toLowerCase() || "";
              const isAnySeedance = isSeedance2 || currentModelId.includes("seedance");
              return (
                <>
                  {mode === "VIDEO" && (
                <>
                  {/* Options 512p et 768p pour Hailuo */}
{isHailuo && (
    <>
        <option value="512p"> 512P {p512Icon} </option>
        <option value="768p"> 768P </option>
    </>
)}

{/* Option 540p pour Pixverse et Luma */}
{(isPixverse || isLuma) && (
    <option value="540p"> 540P {p540Icon} </option>
)}                  
                      {/* ✅ S'affiche pour Seedance 2.0 et Seedance 1.5 Pro */}
                      {isAnySeedance && (
                        <option value="480p"> 480P {p480Icon} </option>
                      )}

                     {!isHailuo && !isKling26 &&(
                        <option value="720p"> HD {hdIcon} </option>
                      )}
                    </>
                  )}
                  <option value="1080p"> FULL HD {fhdIcon} </option>
                </>
              );
            })()}
          </select>

          {/* ⚠️ MESSAGE D'AVERTISSEMENT ROUGE */}
          {isHailuo512Invalid && (
            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px', fontWeight: 'bold' }}>
              ⚠️ 512p nécessite une image de début.
            </div>
          )}
        </div>
      );
    })()}
  </div>
)}
  </div>
  
{/* LIGNE 2 : INPUTS MÉDIAS - IMAGE & VIDÉO TO VIDEO (Conditionnel) */}
{mode === "VIDEO" && (() => {
  // Recalcul local pour éviter les erreurs de référence "undefined"
  const currentEngine = engines.find(e => e.name === selectedModel || e.id === selectedModel?.toLowerCase());
  const engineId = currentEngine?.id?.toLowerCase() || "";
  const userPlanPrice = PLAN_TO_PRICE[userPlan] || "0.00";
  const packs = ["0.00", "12.99", "24.99", "34.99", "39.99", "59.99", "159.99"];

  // Détection des compatibilités du moteur sélectionné
const isVeo = engineId.includes("veo");

// 1. Nettoyage de l'identifiant pour la recherche (minuscules sans espaces ni tirets)
const cleanId = (engineId + " " + (selectedModel || "")).toLowerCase().replace(/[-_ ]/g, "");

// 2. Détection ciblée et élargie (capture klingv3, kling3, v3pro, v3standard, etc.)
const isKling26 = cleanId.includes("kling26") || cleanId.includes("26pro");
const isKlingV3I2V = cleanId.includes("klingv3") || cleanId.includes("kling3") || cleanId.includes("v3pro") || cleanId.includes("v3standard");

// Distinction précise entre Seedance 1.5 (qui prend les 2 images et bloque le V2V) et Seedance 2.0
const isSeedance15 = cleanId.includes("seedance") && (cleanId.includes("15") || cleanId.includes("v15") || cleanId.includes("pro"));
const isSeedance2 = cleanId.includes("seedance") && cleanId.includes("2");

const isDualAllowed = (currentEngine?.canDualImage || engineId.includes("lite") || isSeedance15) && !isVeo;

const isMotion = cleanId.includes("motion") || cleanId.includes("motioncontrol");
// L'image de début est bloquée si sur Luma/Pixverse ou si Seedance 2 (selon tes règles d'origine)
const isStartBlocked = Boolean(videoSource) && (cleanId.includes("luma") || cleanId.includes("pixverse"));

// 3. Condition d'autorisation V2V (Bloqué net pour Kling 2.6, Kling 3 et Seedance 1.5, mais LAISSÉ LIBRE pour Seedance 2.0)
const isVideoToVideoAllowed = 
  isMotion || 
  isSeedance2 || // Seedance 2 retrouve son comportement vidéo
  ((engineId.includes("kling") || 
    engineId.includes("pixverse") || 
    engineId.includes("luma")) 
   && !isKling26 
   && !isKlingV3I2V 
   && !engineId.includes("lite")
   && !isSeedance15);
      
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>

{/* 1. SLOT IMAGE DÉBUT */}
<div 
  className="img-upload-slot"   
  onClick={() => !isStartBlocked && document.getElementById('start-img-input').click()}
  style={{
    flex: 1, 
    height: '80px', 
    borderRadius: '10px', 
    border: isStartBlocked ? '1px dashed rgba(255,255,255,0.05)' : '1px dashed rgba(255,255,255,0.2)',
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    cursor: isStartBlocked ? 'not-allowed' : 'pointer', 
    background: 'rgba(255,255,255,0.03)',
    position: 'relative',
    overflow: 'hidden', 
    transition: 'all 0.2s',
    opacity: isStartBlocked ? 0.35 : 1,
    filter: isStartBlocked ? 'grayscale(1)' : 'none'
  }}
>
  <input 
    type="file" 
    id="start-img-input" 
    hidden 
    onChange={(e) => handleFileToUrl(e, setStartImage)} 
    accept="image/*" 
    disabled={isStartBlocked}
  />

  {!startImage ? (
    <>
      <span style={{fontSize: '1rem'}}>{isStartBlocked ? "🔒" : "🖼️"}</span>
      <span style={{fontSize: '0.62rem', fontWeight: 'bold', color: isStartBlocked ? '#888' : '#fff', marginTop: '2px'}}>
        {isStartBlocked ? "DÉBUT BLOQUÉ" : "IMAGE DÉBUT"}
      </span>
    </>
  ) : (
    <>
      {/* Aperçu propre de l'image de début */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `url("${startImagePreview || startImage}") center/cover no-repeat`,
        zIndex: 1
      }} />

      {/* Croix rouge pour supprimer l'image de début */}
      <div 
        onClick={(e) => { 
          e.stopPropagation(); 
          setStartImage(null); 
          setStartImagePreview(null); 
        }} 
        style={{
          position: 'absolute', 
          top: '6px', 
          right: '6px', 
          background: 'rgba(255,0,0,0.8)', 
          width: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '10px', 
          color: 'white', 
          zIndex: 2,
          cursor: 'pointer'
        }}
      >
        ✕
      </div>
    </>
  )}


</div>{/* 2. SLOT VIDÉO SOURCE (VIDEO TO VIDEO - Verrouillé si image active sur PixVerse ou Luma) */}
   {/* 2. SLOT VIDÉO SOURCE (VIDEO TO VIDEO - Verrouillé si image active sur PixVerse ou Luma) */}
      {(() => {
        const modelLower = selectedModel?.toLowerCase() || "";
        const isPixverseOrLuma = modelLower.includes("pixverse") || modelLower.includes("luma");
        const isVideoLockedByImage = isPixverseOrLuma && Boolean(startImage || endImage);
        const canUseVideo = isVideoToVideoAllowed && !isVideoLockedByImage;

        // Fonction pour récupérer le coût Luma
        const getLumaCost = () => {
          const res = resolution === "1080p" ? "fhd" : "hd"; 
          const dur = duration === 9 || duration === 10 ? "9" : "5";
          const lumaPrices = { hd5: 20, fhd5: 40, hd9: 36, fhd9: 75 };
          return lumaPrices[`${res}${dur}`] || 40; 
        };

        const currentLumaCost = getLumaCost();

        return (
          <div 
            className="img-upload-slot" 
            onClick={() => canUseVideo && document.getElementById('video-source-input').click()}
            style={{
              flex: 1, height: '80px', borderRadius: '10px', 
              border: videoSource ? '1px solid #a855f7' : '1px dashed rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: canUseVideo ? 'pointer' : 'not-allowed', 
              backgroundColor: 'rgba(255,255,255,0.02)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
              opacity: canUseVideo ? 1 : 0.35,
              filter: canUseVideo ? 'none' : 'grayscale(1)'
            }}
          >
            <input 
              type="file" 
              id="video-source-input" 
              hidden 
              onChange={(e) => handleFileToUrl(e, setVideoSource)} 
              accept="video/*" 
              disabled={!canUseVideo}
            />
       {!videoSource ? (
  <>
    <span style={{ fontSize: '1rem' }}>{canUseVideo ? "🎬" : "🔒"}</span>
    <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: '#888', textAlign: 'center', marginTop: '2px' }}>
      {isVideoLockedByImage 
        ? "VIDÉO BLOQUÉE" 
        : (isVideoToVideoAllowed ? "VIDÉO SOURCE" : "V2V INDISPO.")}
      {/* AFFICHAGE DU COÛT UNIQUEMENT POUR LUMA (État vide) */}
      {canUseVideo && !isVideoLockedByImage && isVideoToVideoAllowed && modelLower.includes("luma") && (
        <div style={{ color: '#ffd700', fontSize: '0.55rem', marginTop: '1px', fontWeight: 'bold' }}>
          +{currentLumaCost} ⚡
        </div>
      )}
    </span>              
  </>
) : (
  <>
    {/* Miniature vidéo locale */}
    <video 
      key={videoSource} 
      src={videoSource || ""}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      controls 
      autoPlay 
      muted 
      playsInline 
    />

    {/* Bouton de suppression */}
    <div 
      onClick={(e) => { e.stopPropagation(); setVideoSource(null); }} 
      style={{
        position:'absolute', top:'5px', right:'5px', background:'rgba(255,0,0,0.6)', 
        width:'18px', height:'18px', borderRadius:'50%', display:'flex', 
        alignItems:'center', justifyContent:'center', fontSize:'9px', color:'white', zIndex: 2, cursor: 'pointer'
      }}
    >✕</div>

    {/* BADGE DE COÛT INTÉGRÉ (Vidéo chargée) */}
    {modelLower.includes("luma") && (
      <div style={{
        position: 'absolute', bottom: '5px', left: '5px', background: '#ffd700', 
        color: '#000', padding: '2px 5px', borderRadius: '4px', fontSize: '0.5rem', fontWeight: 'bold', zIndex: 2
      }}>
        +{currentLumaCost} {typeof mustForce !== 'undefined' && mustForce ? "💎" : "⚡"}
      </div>
    )}
  </>
)}
        </div>
    );
  })()}

  {/* 3. SLOT IMAGE DE FIN (Propre, sans erreur de syntaxe) */}
  {(() => {
    const isModelSeedance2 = selectedModel?.toLowerCase().includes("seedance 2.0");
    const isKling26Model = cleanId.includes("kling26") || cleanId.includes("26pro");
    const isEndBlocked = !isDualAllowed || isKling26Model || (!isModelSeedance2 && !!videoSource);

    return (
      <div 
        className="img-upload-slot" 
        onClick={() => !isEndBlocked && document.getElementById('end-img-input').click()}
        style={{
          flex: 1, height: '80px', borderRadius: '10px', 
          border: endImage ? '1px solid #ffd700' : '1px dashed rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: !isEndBlocked ? 'pointer' : 'not-allowed', 
          backgroundImage: endImage ? `url("${endImage}")` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: 'rgba(255,255,255,0.02)',
          position: 'relative', transition: 'all 0.2s',
          opacity: !isEndBlocked ? 1 : 0.35,
          filter: !isEndBlocked ? 'none' : 'grayscale(1)'
        }}
      >
        <input 
          type="file" 
          id="end-img-input" 
          hidden 
          onChange={(e) => handleFileToUrl(e, setEndImage)} 
          accept="image/*" 
          disabled={isEndBlocked}
        />
        
        {!endImage ? (
          <>
            <span style={{fontSize: '1rem'}}>{!isEndBlocked ? "🏁" : "🔒"}</span>
            <span style={{fontSize: '0.62rem', fontWeight: 'bold', color: '#888', textAlign: 'center', marginTop: '2px'}}>
              {isKling26Model ? "FIN BLOQUÉE" : (!isDualAllowed ? "FIN INDISPO." : "IMAGE FIN")}
            </span>
          </>
        ) : (
          <div 
            onClick={(e) => { e.stopPropagation(); setEndImage(null); }} 
            style={{
              position:'absolute', top:'5px', right:'5px', background:'rgba(255,0,0,0.6)', 
              width:'18px', height:'18px', borderRadius:'50%', display:'flex', 
              alignItems:'center', justifyContent:'center', fontSize:'9px', color: 'white', zIndex: 2
            }}
          >✕</div>
        )}
      </div>
    );
  })()}
</div>
  );
})()}

{mode !== "TEXTE" && (
  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
    {mode === "VIDEO" && (
      <div style={{ flex: 1 }}>
        <label className="field-label-tiny">DURÉE</label>
        
    <select
  className="artlist-select" 
  value={duration} 
  onChange={(e) => setDuration(e.target.value)}
  disabled={
    Boolean(selectedModel?.toLowerCase().includes("hailuo") && (resolution === "Full HD" || resolution === "1080p"))
  }
>
  {/* 1. CAS GOOGLE VEO (3 Standard & Lite regroupés) */}
  {selectedModel?.toLowerCase().includes("veo") ? (
    <>
      <option value="4">4 Secondes</option>
      <option value="6">6 Secondes</option>
      <option value="8">8 Secondes</option>
    </>
  ) : selectedModel?.toLowerCase().includes("seedance 2.0") ? (
    /* 2. CAS SEEDANCE 2.0 */
    <>
      <option value="5">5 Secondes</option>
      <option value="10">10 Secondes</option>
      <option value="15">15 Secondes</option>
    </>
  ) : (
    /* 3. CAS GÉNÉRAL (Seedance standard, Hailuo, Luma, Kling, etc.) */
    <>
      {/* Option 1 : Durée courte */}
      <option value={selectedModel?.toLowerCase().includes("seedance") ? "4" : selectedModel?.toLowerCase().includes("hailuo") ? "6" : "5"}>
        {selectedModel?.toLowerCase().includes("seedance") ? "4 Secondes" : 
         selectedModel?.toLowerCase().includes("hailuo") ? "6 Secondes" : "5 Secondes"}
      </option>
      
      {/* Option 2 : Durée moyenne (masquée si Hailuo + 1080p) */}
      {!(selectedModel?.toLowerCase().includes("hailuo") && (resolution === "Full HD" || resolution === "1080p")) && (
        <option value={selectedModel?.toLowerCase().includes("seedance") ? "12" : selectedModel?.toLowerCase().includes("luma") ? "9" : "10"}>
          {selectedModel?.toLowerCase().includes("seedance") ? "12 Secondes" : 
           selectedModel?.toLowerCase().includes("luma") ? "9 Secondes" : "10 Secondes"}
        </option>
      )}

      {/* Option 3 : Longue durée spécifique pour Kling (sauf 2.6) */}
      {selectedModel?.toLowerCase().includes("kling") && !selectedModel?.toLowerCase().includes("2.6") && (
        <option value="15">15 Secondes</option>
      )}
    </>
  )}
</select>
        
        {/* Rappel visuel dynamique pour Hailuo */}
        {selectedModel === "Hailuo AI" && (
          <div style={{ fontSize: '9px', color: '#a855f7', marginTop: '4px', fontWeight: 'bold' }}>
            {resolution === "Full HD" || resolution === "1080p" 
              ? "⚠️ MODE PRO : LIMITÉ À 6S" 
              : "✅ MODE STANDARD : 10S DISPONIBLES"}
          </div>
        )}
      </div>
    )}

    {/* BLOC FORMAT & STYLE (Reste identique) */}
    <div style={{ flex: 1 }}>
      <label className="field-label-tiny">FORMAT & STYLE</label>
      <div style={{ display: 'flex', gap: '5px' }}>
        <select className="artlist-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
          <option value="16:9">16:9</option>
          <option value="1:1">1:1</option>
          <option value="9:16">9:16</option>
        </select>
        <select className="artlist-select" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </div>
)}
{/* ✅ SELECTEUR AUDIO IA AVEC MESSAGE EXTÉRIEUR */}
{mode === "VIDEO" && (() => {
  const currentEngine = engines.find(e => e.name === selectedModel || e.id === selectedModel?.toLowerCase());
  const engineId = currentEngine?.id?.toLowerCase() || "";
  
  // ✂️ MODIFICATION ICI : On ajoute la détection de "veo" pour l'audio natif
  const hasNativeAudio = 
                         engineId.includes("seedance") ||
                         engineId.includes("veo"); 
                      

  const isAudioActive = hasNativeAudio ? true : wantsAudio;

  return (
    <div style={{ marginBottom: '15px' }}>
      <div 
        className="audio-toggle-container" 
        style={{
          padding: '12px 16px',
          background: hasNativeAudio 
            ? 'rgba(255, 255, 255, 0.02)' 
            : (isAudioActive ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)'),
          borderRadius: '12px',
          border: '1px solid',
          borderColor: hasNativeAudio 
            ? 'rgba(255, 255, 255, 0.05)' 
            : (isAudioActive ? '#a855f7' : 'rgba(255,255,255,0.1)'),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: hasNativeAudio ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          userSelect: 'none',
          opacity: hasNativeAudio ? 0.4 : 1 
        }} 
        onClick={() => !hasNativeAudio && setWantsAudio(!wantsAudio)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            fontSize: '1.2rem', 
            filter: hasNativeAudio ? 'grayscale(100%)' : 'none' 
          }}>
            {isAudioActive ? '🔊' : '🔇'}
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              color: hasNativeAudio ? '#666' : '#fff', 
              fontWeight: '600', 
              fontSize: '0.85rem' 
            }}>
              Audio par IA
            </div>
            <div style={{ color: '#666', fontSize: '0.7rem' }}>
              Sound design
            </div>
          </div>
        </div>
        
        {/* Switch Visuel */}
        <div style={{
          width: '36px',
          height: '18px',
          background: hasNativeAudio ? '#222' : (isAudioActive ? '#a855f7' : '#444'),
          borderRadius: '20px',
          position: 'relative'
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            background: hasNativeAudio ? '#444' : '#fff',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: isAudioActive ? '20px' : '2px',
            transition: '0.3s'
          }} />
        </div>
      </div>

      {/* ✅ MESSAGE EXTÉRIEUR (Affiché uniquement si natif) */}
      {hasNativeAudio && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          marginTop: '6px', 
          marginLeft: '4px' 
        }}>
          <span style={{ fontSize: '10px' }}>✨</span>
          <span style={{ 
            color: '#a855f7', 
            fontSize: '10px', 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            AUDIO INCLUS AVEC CE MOTEUR
          </span>
        </div>
      )}
    </div>
  );
})()}

{/* --- AFFICHAGE DU COÛT DYNAMIQUE --- */}
{(() => {
    const current = engines.find(e => e.name === selectedModel || e.id === selectedModel?.toLowerCase());
    if (!current || mode === "TEXTE") return null;
    
    const userPlanPrice = PLAN_TO_PRICE[userPlan] || "0.00";
    const packs = ["0.00", "12.99", "24.99", "34.99",  "59.99", "159.99"];
    const userTierIndex = packs.indexOf(userPlanPrice);
    const masterTierIndex = packs.indexOf("34.99");

    // On utilise DIRECTEMENT "forceDiamonds" calculé par ton useEffect
    // pour savoir s'il faut afficher l'icône 💎 ou ⚡
    const showAsDiamonds = forceDiamonds;

    // Indicateur visuel pour le +1 diamant (uniquement si plan < Master)
    const needsExtraDiamond = mode === "VIDEO" && endImage && current.canDualImage && userTierIndex < masterTierIndex;

    const accentColor = showAsDiamonds ? '#3498db' : '#ff9f43';

    return (
        <div style={{ 
            padding: '12px', borderRadius: '12px', background: `${accentColor}1A`, 
            border: `1px solid ${accentColor}66`, textAlign: 'center', marginBottom: '15px',
            color: accentColor, fontSize: '14px', fontWeight: 'bold', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{showAsDiamonds ? "💎" : "⚡"}</span> 
                {/* On affiche la variable 'cost' du useEffect : elle contient déjà le 200 ou le prix Éclair */}
                COÛT TOTAL : {cost} {showAsDiamonds ? "DIAMANTS" : "ÉCLAIRS"}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {showAsDiamonds && (resolution === "Full HD" || resolution === "1080p") && (
                    <span style={{fontSize: '10px', opacity: 0.8, fontWeight: 'normal'}}>
                        (Mode Full HD : Diamants)
                    </span>
                )}
                {needsExtraDiamond && (
                    <span style={{fontSize: '10px', opacity: 0.8, fontWeight: 'normal'}}>
                        (+1 💎 Image de fin)
                    </span>
                )}
                {mode === "VIDEO" && wantsAudio && (
                    <span style={{fontSize: '10px', opacity: 0.8, fontWeight: 'normal'}}>
                        (Audio IA)
                    </span>
                )}
            </div>
        </div>
    );
})()}
{errorMsg && (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#e74c3c',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideIn 0.3s ease-out'
  }}>
    <span style={{ fontSize: '20px' }}>⚠️</span>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{errorMsg}</span>
    <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px' }}>✕</button>
  </div>
)}
{/* BOUTON GÉNÉRER */}
{(() => {

  const isHailuo = selectedModel?.toLowerCase().includes("hailuo");
  const isHailuo512Invalid = isHailuo && resolution === "512p" && !startImage;

  const isSeedance = selectedModel?.toLowerCase().includes("seedance");
  const isSeedance480Invalid = isSeedance && resolution === "480p" && !startImage;
  // Détection du modèle Motion Control
  const isMotionControl = selectedModel?.toLowerCase().includes("motion");



  // On vérifie directement ton vrai useState : videoSource
  const hasVideo = !!videoSource;

  // Le bouton se bloque SI c'est du Motion Control ET qu'il manque l'image OU la vidéo
  const isMotionControlInvalid = isMotionControl && (!startImage || !hasVideo);

  const isButtonDisabled = isLoading || !prompt || isHailuo512Invalid || isMotionControlInvalid;

  return (
    <div style={{ marginTop: 'auto', paddingTop: '5px' }}>
      <button 
        className="magic-btn" 
        onClick={handleGenerate} 
        disabled={isButtonDisabled} 
        style={{ 
          width: '100%', 
          height: '46px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          paddingLeft: '0px',
          paddingRight: '0px',
          gap: '8px',
          opacity: isButtonDisabled ? 0.5 : 1,
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          filter: (isHailuo512Invalid || isMotionControlInvalid) ? 'grayscale(1)' : 'none'
        }}
        title={
          isMotionControlInvalid 
            ? "Une image de début et une vidéo source sont requises" 
            : isHailuo512Invalid 
            ? "Ajoutez une image de début pour utiliser la résolution 512p" 
            : ""
        }
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
          {isLoading ? (
            <>⚡ Génération en cours...</>
          ) : isMotionControlInvalid ? (
            <>⚠️ IMAGE + VIDÉO REQUISES</>
          ) : isHailuo512Invalid ? (
            <>🖼️ IMAGE REQUISE POUR 512P</>
          ) : mode === "TEXTE" ? (
            "🚀 Envoyer"
          ) : (
            <>
              {cost > 0 && (forceDiamonds ? "💎" : "⚡")}
              GÉNÉRER {cost > 0 ? `(${cost})` : ""}
            </>
          )}
        </span>
      </button>
    </div>
  );
})()}
</div> {/* Fermeture finale de simple-controls */}
</div>
          
  {/* --- COLONNE DE DROITE (CONTENEUR PARENT) --- */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minWidth: 0 }}>
  
  {/* GRANDE CASE (RENDER ZONE) */}

<div 
  className={`render-zone glass-card ${mode !== "TEXTE" ? "compact-render" : ""}`} 
  style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden', 
    padding: '0', 
    height: '450px',   /* 👈 HAUTEUR FIXE pour verrouiller la carte (ajuste les pixels selon tes besoins) */
    minHeight: '450px' /* 👈 Empêche tout changement de taille */
  }}
>
  {/* ZONE 1 : AFFICHAGE DU RÉSULTAT */}
  
{/* ZONE 1 : AFFICHAGE DU RÉSULTAT */}
  
  <div style={{ 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    justify: 'center', 
    position: 'relative', 
    padding: '15px 20px 5px 20px',
    overflow: 'hidden',
    minHeight: 0 
  }}>
{(() => {

  // 1. SI CHARGEMENT EN COURS : ON AFFICHE LE SPINNER EN PRIORITÉ ABSOLUE
  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <div className="spinner"></div>
        <div className="loading-text" style={{ marginTop: '12px', color: '#fff' }}>Génération en cours...</div>
      </div>
    );
  }

  const displayItem = activeItem || hoverItem;

  // 2. SI RIEN N'EST SÉLECTIONNÉ (ET PAS EN CHARGEMENT) : AFFICHAGE PAR DÉFAUT
  if (!displayItem) {
    const isVideoMode = mode === "VIDEO";
    const defaultSuggestion = isVideoMode ? VIDEO_SUGGESTIONS[0] : SUGGESTIONS[0];
    const defaultMediaSrc = isVideoMode ? defaultSuggestion?.url : defaultSuggestion?.img;

    return (
      <div className="empty-state" style={{
        position: 'relative', width: '100%', height: '100%', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px'
      }}>
        {isVideoMode ? (
          <video 
            key={defaultMediaSrc} 
            src={defaultMediaSrc} 
            autoPlay loop muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', pointerEvents: 'none' }} 
          />
        ) : (
          <img 
            key={defaultMediaSrc}
            src={defaultMediaSrc} 
            alt="Illustration par défaut" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', pointerEvents: 'none' }} 
          />
        )}
        
        <div style={{
          position: 'absolute', bottom: '20px', background: 'rgba(5, 5, 8, 0.75)', 
          padding: '8px 16px', borderRadius: '20px', backdropFilter: 'blur(4px)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <span style={{ color: 'var(--text-gray)', fontSize: '13px', fontWeight: '500' }}>
            En attente de création...
          </span>
        </div>
      </div>
    );
  }

  // 3. SI UN MÉDIA EST SÉLECTIONNÉ ET PAS DE CHARGEMENT : ON L'AFFICHE
  return (
    <div className="result-display" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {displayItem?.url ? (
          displayItem.type === "VIDEO" ? (
            <video
              key={displayItem.id}
              src={displayItem.url}
              autoPlay
              controls
              playsInline
              style={{ width: '100%', maxHeight: '320px', borderRadius: '12px', objectFit: 'contain', background: '#000' }}
            />
          ) : (
            <img
              src={displayItem.url}
              className="render-media"
              alt="IA"
              style={{ width: '100%', height: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'contain' }}
            />
          )
        ) : (
          <div style={{ color: '#666' }}>Aucune sélection</div>
        )}
      </div>
    </div>
  );
})()}
</div>

{activeItem && !isLoading && (
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    padding: '10px 20px', 
    margin: '0', 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    boxSizing: 'border-box' 
  }}>
{!String(activeItem.id || '').startsWith('inspi-') && (
      <button className="btn-modern btn-remix" onClick={() => handleRemix(activeItem)}>
        <span>Remixer</span>
      </button>
    )}

    {activeItem.type !== "TEXTE" && !String(activeItem.id || '').startsWith('inspi-') && (
      <button className="btn-modern btn-download" onClick={() => handleDownload(activeItem)}>
        <span>Télécharger</span>
      </button>
    )}
  </div>
)}

    {/* ZONE 2 : EXPLORER (BAS - INSPIRATIONS DÉPLACÉES ICI) */}
   {(mode === "IMAGE" || mode === "VIDEO") && randomInspirations.length > 0 && (
  <div className="explorer-section" style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '15px 15px 18px 15px', borderRadius: '0 0 16px 16px', marginTop: 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00bcd4', letterSpacing: '1px' }}>🔍 EXPLORER LES EXEMPLES</span>
      <div style={{ display: 'flex', gap: '5px' }}>
         <button className="nav-arrow-mini" onClick={() => handleScrollInspi('left')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>‹</button>
         <button className="nav-arrow-mini" onClick={() => handleScrollInspi('right')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>›</button>
      </div>
    </div>

        <div className="thumbnails-wrapper" style={{ overflow: 'hidden' }}>
          <div className="inspi-scroll-row" ref={scrollInspiRef} style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '5px' }}>
{randomInspirations.map((item) => (
  <div 
    key={item.id} 
    className="inspi-horizontal-card"
    style={{ 
      minWidth: '130px', 
      height: '75px', 
      position: 'relative', 
      cursor: 'pointer', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s ease'
    }}
    

    // Dès que la souris sort, l'aperçu dynamique disparaît
    onMouseLeave={() => setHoverItem(null)}

    // ✅ LE CORRIGÉ : Le clic enregistre le prompt ET fixe le média à l'écran
    onClick={() => {
      setPrompt(item.prompt);
      setActiveItem({
        id: `inspi-${item.id}`,
        url: item.video || item.url,
        type: mode, 
        prompt: item.prompt,
        title: item.title
      });
    }}
  >
    {mode === "VIDEO" && (item.video || item.url) ? (
      <video 
        src={item.video || item.url} 
        muted 
        poster={item.img} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 100 }} 
      />
    ) : (
      <img 
        src={item.img} 
        alt={item.title} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 100 }} 
      />
    )}
    
    <div className="inspi-overlay-text" style={{ 
      position: 'absolute', 
      bottom: '5px', 
      left: '8px', 
      fontSize: '10px', 
      color: 'white', 
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.8)' 
    }}>
      {item.title}
    </div>
  </div>
))}
          </div>
        </div>
      </div>
    )}
  </div> 
</div> {/* FIN COLONNE DE DROITE */}
        </div> {/* FIN generator-grid */}
      </main>
    </div> /* FIN de app-layout */
  )} 
</>
)}
</div> /* FIN de main-viewport */
{/* MODAL DE CONFIRMATION DESIGN */}
{itemToDelete && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
  }}>
    <div className="glass-card" style={{
      width: '90%', maxWidth: '400px', padding: '30px', textAlign: 'center',
      border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>Supprimer la création ?</h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '25px' }}>
        Cette action est irréversible.
      </p>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setItemToDelete(null)}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Annuler
        </button>
<button 
          onClick={() => {
            // On simule un événement pour éviter que e.stopPropagation() dans deleteHistoryItem ne plante
            const simulatedEvent = { stopPropagation: () => {} };
            
            // On appelle ta vraie fonction qui gère TOUTE la logique (filtre + reset UI)
            deleteHistoryItem(simulatedEvent, itemToDelete);
            
            // On ferme la modale
            setItemToDelete(null);
          }}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}

<AuthModal 
  isOpen={showLogin} 
  onClose={() => setShowLogin(false)} 
  onSuccess={() => { setShowLogin(false); setShowStudio(true); }}
  onShowTerms={() => { setShowLogin(false); setShowTerms(true); }}
  onShowPrivacy={() => { setShowLogin(false); setShowPrivacy(true); }}
/>

{showProfile && (
  <ProfilePage 
    user={user}
    userPlan={userPlan || "Débutant"}
    tokens={tokens}
    packTokens={packTokens}
    /* --- ON GARDE TA LOGIQUE EN AJOUTANT LA CONVERSION POUR ÉVITER LE CRASH --- */
    resetDate={
      user?.tokensResetDate?.seconds 
        ? new Date(user.tokensResetDate.seconds * 1000).toLocaleDateString('fr-FR')
        : (user?.tokensResetDate || "Sous 30 jours")
    }
    /* --- AJOUT DE LA FONCTION EXPIRY SANS RIEN SUPPRIMER --- */
expiryDate={
  user?.packExpiryDate?.seconds
    ? new Date(user.packExpiryDate.seconds * 1000).toLocaleDateString('fr-FR')
    : "Valable 1 an"
}
    onBack={() => setShowProfile(false)}
    onShowPricing={() => {
      setShowProfile(false); 
      setShowPricing(true);
    }}
  />
)}
{showInsufficientFunds && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)'
  }}>
    <div style={{
      background: '#111', padding: '30px', borderRadius: '24px',
      border: '1px solid #a855f7', width: '95%', maxWidth: '420px', textAlign: 'center',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      <div style={{ fontSize: '50px', marginBottom: '10px' }}>
        {forceDiamonds ? '💎' : '⚡'}
      </div>
      
      <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px' }}>
        {forceDiamonds ? 'Diamants insuffisants' : 'Éclairs insuffisants'}
      </h2>
      
      <p style={{ color: '#ccc', lineHeight: '1.5', fontSize: '15px' }}>
        Cette action coûte <strong>{neededAmount} {forceDiamonds ? 'diamants' : 'éclairs'}</strong>.
      </p>

 {/* MESSAGE PÉDAGOGIQUE ADAPTATIF */}
      {!forceDiamonds ? (
        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px' }}>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            ⚡ Pour obtenir plus d'éclairs, vous pouvez <strong>changer d'abonnement</strong>.<br/><br/>
            📅 En attendant la recharge du début de mois prochain, vous pouvez aussi acheter des <strong>diamants</strong> pour continuer à créer immédiatement.
          </p>
        </div>
      ) : (
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '15px' }}>
          Votre solde de diamants est trop faible pour cette opération.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '25px' }}>
        {/* BOUTON PRINCIPAL */}
        <button 
          onClick={() => { setShowInsufficientFunds(false); setShowPricing(true); }}
          style={{
            padding: '14px', borderRadius: '12px', border: 'none',
            background: '#a855f7', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
            fontSize: '16px', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
          }}
        >
          {forceDiamonds ? '🛒 Acheter des diamants' : '🚀 S\'abonner ou Acheter des Diamants'}
        </button>

        {/* BOUTON RETOUR */}
        <button 
          onClick={() => setShowInsufficientFunds(false)}
          style={{
            padding: '12px', borderRadius: '12px', border: '1px solid #333',
          background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '14px'
          }}
        >
          Rester sur le studio
        </button>
      </div>
    </div>
  </div>
)}

{showContactModal && (
  <ContactModal 
    user={user} 
    onClose={() => setShowContactModal(false)} 
  />
)}

</div> // FIN de app-container
);
}

export default App;
