import React, { useState } from 'react';
import './Pricing.css';
import { auth } from './firebase';
import { db } from './firebase'; 
import { addDoc, collection } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

// --- 1. SÉLECTEUR DE DIAMANTS SUR MESURE (SYNCHRONISÉ AVEC LES PACKS) ---
const CustomDiamondSelector = ({ isSubscriber, onPurchase }) => {
const [qty, setQty] = useState(1000);

  // LOGIQUE CORRIGÉE : Calcule le prix exact basé sur tes paliers de packs fixes
  const getPrices = (amount) => {
    let unitPriceFull, unitPriceSub;

    if (amount >= 6000) { 
      unitPriceFull = 149.99 / 6000; 
      unitPriceSub = 99.99 / 6000; 
    } else if (amount >= 3000) { 
      unitPriceFull = 89.99 / 3000; 
      unitPriceSub = 54.99 / 3000; 
    } else if (amount >= 1500) { 
      unitPriceFull = 49.99 / 1500; 
      unitPriceSub = 29.99 / 1500; 
    } else if (amount >= 600) { 
      unitPriceFull = 24.99 / 600; 
      unitPriceSub = 12.99 / 600; 
    } else if (amount >= 300) { 
      unitPriceFull = 14.99 / 300; 
      unitPriceSub = 7.99 / 300; 
    } else { 
      unitPriceFull = 5.99 / 100; 
      unitPriceSub = 2.99 / 100; 
    }

    return {
      full: (amount * unitPriceFull).toFixed(2),
      sub: (amount * unitPriceSub).toFixed(2),
      currentUnit: ((isSubscriber ? unitPriceSub : unitPriceFull)).toFixed(3)
    };
  };

 const prices = getPrices(qty);

  return (
    <div className="custom-diamond-container" style={{ marginTop: '50px', padding: '40px', background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
      
      {/* TITRE AMÉLIORÉ AVEC DÉGRADÉ */}
      <h2 className="packs-title" style={{ 
        background: 'linear-gradient(to right, #fff, #a855f7, #fff)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        fontSize: '2.5rem',
        marginBottom: '15px',
        fontWeight: '800'
      }}>
        💎 Volume sur mesure
      </h2>

      {/* BADGE FIDÉLITÉ STYLE PREMIUM */}
      <div style={{ marginBottom: '25px' }}>
        {isSubscriber ? (
          <p className="packs-subtitle" style={{ 
            display: 'inline-block',
            padding: '8px 25px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '50px',
            color: '#d8b4fe',
            fontWeight: '600',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)'
          }}>
            ✨ Avantage Fidélité : <span style={{ color: '#fff', textShadow: '0 0 10px #a855f7' }}>-50%</span> appliqué sur votre commande !
          </p>
        ) : (
          <p className="packs-subtitle" style={{ opacity: 0.7, fontSize: '1.1rem' }}>
            Ajustez le curseur pour choisir votre montant exact.
          </p>
        )}
      </div>
      
      <div className="slider-value-display" style={{ margin: '30px 0' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#fff', textShadow: '0 0 25px rgba(168, 85, 247, 0.5)' }}>
          {qty.toLocaleString()} <span style={{ fontSize: '1.1rem', color: '#a855f7', verticalAlign: 'middle', letterSpacing: '2px' }}>DIAMANTS</span>
        </div>
      </div>

<input type="range" min="100" max="10000" step="100" value={qty} onChange={(e) => setQty(parseInt(e.target.value))} className="custom-slider" style={{ width: '100%', maxWidth: '600px', cursor: 'pointer', touchAction: 'pan-y' }} />
    

      <div className="price-checkout-zone" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div className="final-price-area">
          {isSubscriber && (
            <span className="old-price" style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '1.2rem', display: 'block' }}>
              {prices.full}€
            </span>
          )}
          <span className="pack-price" style={{ fontSize: '3.5rem' }}>
            {isSubscriber ? prices.sub : prices.full}€
          </span>
        </div>
        
   <button 
  className="buy-pack-btn" 
  style={{ padding: '18px 60px', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
  onClick={() => onPurchase(qty)} // <--- Il doit être placé ICI, avant le signe ">"
>
  Acheter ce volume
</button>
        <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>
          Prix unitaire : {prices.currentUnit}€ / diamant
        </p>
      </div>
    </div>
  );
};

// --- 2. LE MOTEUR DES PACKS FIXES (DYNAMIQUE) ---
const TokenPacks = ({ isSubscriber, onPurchase }) => {
    const packs = [
    { name: "Étincelle", qty: 100, priceFull: 5.99, priceSub: 2.99 },
    { name: "Supernova", qty: 300, priceFull: 14.99, priceSub: 7.99 },
    { name: "Galaxie", qty: 600, priceFull: 24.99, priceSub: 12.99, featured: true },
    { name: "Pulsar", qty: 1500, priceFull: 49.99, priceSub: 29.99 },
    { name: "Quasar", qty: 3000, priceFull: 89.99, priceSub: 54.99 },
    { name: "Univers", qty: 6000, priceFull: 149.99, priceSub: 99.99, bestValue: true },
  ];

  return (
    <div className="token-packs-container" style={{ textAlign: 'center', marginTop: '60px' }}>
      
      {/* TITRE AMÉLIORÉ */}
      <h2 className="packs-title" style={{ 
        fontSize: '2.5rem', 
        fontWeight: '800', 
        background: 'linear-gradient(to right, #fff, #a855f7, #fff)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
      }}>
        Besoin d'un boost rapide ?
      </h2>

      {/* BADGE ÉTAT ABONNÉ / INFO */}
      <div style={{ marginBottom: '40px' }}>
        {isSubscriber ? (
          <span className="packs-subtitle" style={{ 
            display: 'inline-block',
            padding: '6px 20px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '50px',
            color: '#d8b4fe',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)'
          }}>
            ✨ <span style={{ color: '#fff', textShadow: '0 0 8px #a855f7' }}>Tarif abonné activé !</span> Profitez de vos réductions exclusives.
          </span>
        ) : (
          <p className="packs-subtitle" style={{ opacity: 0.6, fontSize: '1rem' }}>
            Les Diamants sont valables pendant 1 an.
          </p>
        )}
      </div>

      <div className="packs-grid">
        {packs.map((pack) => (
          <div key={pack.name} className={`mini-pack ${pack.featured ? 'featured-pack' : ''}`}>
            {pack.featured && <div className="pack-badge" style={{background: '#a855f7'}}>POPULAIRE</div>}
            {pack.bestValue && <div className="pack-badge" style={{background: '#f59e0b'}}>MEILLEUR TAUX</div>}
            <h4>{pack.name}</h4>
            <div className="pack-price-area">
              {isSubscriber && <span className="old-price" style={{textDecoration: 'line-through', opacity: 0.5, marginRight: '8px'}}>{pack.priceFull}€</span>}
              <span className="pack-price">{isSubscriber ? pack.priceSub : pack.priceFull}€</span>
            </div>
            <p>💎 {pack.qty.toLocaleString()} Diamants</p>
          <button 
        className="buy-pack-btn" 
        onClick={() => onPurchase(pack.qty)}
      >
        Acheter
      </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. CONFIGURATEUR DE DEVIS ---
const RATES = { PHOTO: 10, VIDEO: 50, SOCIAL_MEDIA: 300 };
const QuoteForm = ({ onOpenContact }) => {
  const [selections, setSelections] = useState({ 
    photos: 10, 
    videos: 2, 
    socialMedia: false, 
    projectType: 'unique' 
  });

  const estimate = (selections.photos * RATES.PHOTO) + (selections.videos * RATES.VIDEO) + (selections.socialMedia ? RATES.SOCIAL_MEDIA : 0);
  
  const handleSliderChange = (key, val) => {
    setSelections({...selections, [key]: parseInt(val)});
  };

  return (
    <div className="quote-configurator">
      <h3>Personnalisez votre Pack Sérénité</h3>
      
      <div className="form-group">
        <label className="input-label">Nature de l'accompagnement</label>
        <div className="select-wrapper">
          <select 
            value={selections.projectType} 
            onChange={(e) => setSelections({...selections, projectType: e.target.value})} 
            className="custom-select"
          >
            <option value="unique">Projet Ponctuel</option>
            <option value="monthly">Accompagnement Mensuel (Sérénité)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <div className="label-header">
          <label>Nombre de photos pro</label>
          <span className="count-badge">{selections.photos}</span>
        </div>
        <input type="range" min="5" max="100" step="5" value={selections.photos} className="custom-slider" onChange={(e) => handleSliderChange('photos', e.target.value)} />
      </div>

      <div className="form-group">
        <div className="label-header">
          <label>Nombre de vidéos (IA Pro)</label>
          <span className="count-badge">{selections.videos}</span>
        </div>
        <input type="range" min="0" max="20" value={selections.videos} className="custom-slider" onChange={(e) => handleSliderChange('videos', e.target.value)} />
      </div>

      <div className="form-group-checkbox custom-checkbox-wrapper">
        <input type="checkbox" id="sm-check" checked={selections.socialMedia} onChange={(e) => setSelections({...selections, socialMedia: e.target.checked})} />
        <label htmlFor="sm-check">Gestion des réseaux sociaux (+300€)</label>
      </div>

      <div className="quote-summary">
        <span className="summary-text">
          {selections.projectType === 'unique' ? "Estimation de votre projet unique :" : "Estimation de votre investissement mensuel :"}
        </span>
        <div className="estimate-price">
          {estimate.toLocaleString('fr-FR')}€
          <span className="per-month">{selections.projectType === 'unique' ? "" : "/mois"}</span>
        </div>

        {/* --- LE BOUTON AVEC LE MESSAGE DÉTAILLÉ --- */}
        <button 
          className="price-btn legende-btn"
          onClick={() => {
            const typeProjet = selections.projectType === 'unique' ? 'PONCTUEL' : 'MENSUEL (Pack Sérénité)';
            const messageDevis = 
              `Bonjour,\n\n` +
              `Je souhaite obtenir un devis pour un Pack Sérénité personnalisé :\n\n` +
              `TYPE : ${typeProjet}\n` +
              `PHOTOS : ${selections.photos} visuels pro\n` +
              `VIDÉOS : ${selections.videos} séquences IA\n` +
              `RÉSEAUX SOCIAUX : ${selections.socialMedia ? 'OUI (Inclus)' : 'NON'}\n\n` +
              `ESTIMATION : ${estimate}€${selections.projectType === 'unique' ? '' : '/mois'}\n\n` +
              `Merci.`;
            
            onOpenContact(messageDevis);
          }}
        >
          Demander mon Devis Sérénité
        </button>
        
        <p className="disclaimer"><i>* Analyse gratuite de votre projet sous 24h.</i></p>
      </div>
    </div>
  );
};

// --- 4. COMPOSANT PRICING (SOURCE ORIGINALE) ---

const Pricing = ({ onBack, userPlan }) => { 
  // États pour le formulaire de contact/devis
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactData, setContactData] = useState({ subject: 'devis', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fonction pour ouvrir le contact avec un message pré-rempli (pour le devis)
  const handleOpenContact = (prefilledMessage = "") => {
    setContactData({ subject: 'devis', message: prefilledMessage });
    setShowContactModal(true);
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!contactData.message.trim()) return;

    setIsSending(true);
    const user = auth.currentUser;

    try {
      // 1. Sauvegarde dans Firestore
      await addDoc(collection(db, "contact_messages"), {
        uid: user?.uid || "anonyme",
        email: user?.email || "non-connecté",
        nom: user?.displayName || "Utilisateur Pricing",
        objet: contactData.subject,
        message: contactData.message,
        createdAt: new Date().toISOString(),
      });

      // 2. Envoi réel via EmailJS
      await emailjs.send(
        'service_qh3e56a', 
        'template_nil0lc5', 
        {
          title: contactData.subject,
          name: user?.displayName || "Client",
          email: user?.email || "Non fourni",
          message: contactData.message,
          time: new Date().toLocaleString()
        },
        'HLKSnEAZsjY0shKFy'
      );

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowContactModal(false);
        setContactData({ subject: 'devis', message: '' });
      }, 3000);

    } catch (error) {
      console.error("Erreur d'envoi:", error);
    }
    setIsSending(false);
  };
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Si l'utilisateur a un plan (ex: "standard"), il est considéré comme abonné
  // On exclut "debutant", "discovery" ou le cas où il n'y a rien.
  const isSubscriber = userPlan && !['debutant', 'discovery', '0.00'].includes(userPlan.toLowerCase());
const handlePurchase = async (quantity) => {
    try {
        const user = auth.currentUser; 

        if (!user) {
            alert("Erreur : Tu dois être connecté pour acheter des diamants !");
            return;
        }

        // 🔑 1. Récupération du token Firebase de l'utilisateur
        const token = await user.getIdToken();

        const response = await fetch('${import.meta.env.VITE_API_URL}/create-checkout-session', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 👈 C'est ce header qui manquait !
            },
            body: JSON.stringify({ 
                amount: quantity,
                plan: userPlan,
                userId: user.uid 
            }),
        });

        const session = await response.json();
        
        if (session.url) {
            window.location.href = session.url;
        } else {
            console.error("Le serveur n'a pas renvoyé d'URL :", session);
        }

    } catch (err) {
        console.error("Erreur lors de l'initiation de l'achat:", err);
    }
};

const handleSubscribe = async (planName) => {
    try {
        const user = auth.currentUser; 

        if (!user) {
            alert("Veuillez vous connecter pour vous abonner.");
            return;
        }

        // 🔑 C'est cette ligne qu'il te manquait !
        const token = await user.getIdToken();

        const response = await fetch('${import.meta.env.VITE_API_URL}/create-subscription-session', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Maintenant 'token' existe bien
            },
            body: JSON.stringify({ 
                planId: planName.toLowerCase(),
                interval: billingCycle, 
                plan: userPlan
            }),
        });

        const session = await response.json();
        if (session.url) {
            window.location.href = session.url;
        } else {
            console.error("Erreur session Stripe:", session);
        }
    } catch (err) {
        console.error("Erreur abonnement:", err);
    }
};
const plans = {
    discovery: { monthly: '0€', yearly: '0€' },
    essentiel: { 
      monthly: '12,99€', 
      yearly: '10,39€', // (12,99 * 0,8)
      eclairs: '300' 
    },
    standard: { 
      monthly: '24,99€', 
      yearly: '19,99€', // (24,99 * 0,8)
      eclairs: '700' 
    },
    master: { 
      monthly: '34,99€', 
      yearly: '27,99€', // (34,99 * 0,8)
      eclairs: '1200' 
    },
    elite: { 
      monthly: '59,99€', 
      yearly: '47,99€', // (59,99 * 0,8)
      eclairs: '2500' 
    },
    legende: { 
      monthly: '159,99€', 
      yearly: '127,99€', // (159,99 * 0,8)
      eclairs: '8000' 
    }
  };


 return (
    <div className="pricing-page" style={{ paddingTop: '20px' }}>
      <div style={{ paddingLeft: '20px', marginBottom: '-10px' }}>
        <button className="back-button-pricing" onClick={onBack}>← Retour</button>
      </div>


      <div className="pricing-header" style={{ marginTop: '60px' }}>
        <h1>Choisissez votre puissance</h1>
        <p>Propulsez votre créativité avec les meilleurs moteurs d'IA mondiaux.</p>
        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Mensuel</span>
          <div className={`toggle-switch ${billingCycle === 'yearly' ? 'on' : ''}`} onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
            <div className="switch-dot"></div>
          </div>
          <span className={billingCycle === 'yearly' ? 'active' : ''}>Annuel <small className="promo">-20%</small></span>
        </div>
      </div>

      <div className="pricing-grid">
        <div className="price-card discovery">
          <div className="card-top">
            <h3 className="status-badge">DEBUTANT</h3>
            <p className="plan-name">Sans Engagement</p>
            <p className="plan-subtitle">Idéal pour tester nos moteurs</p>
            <div className="price-value">0€<span>/mois</span></div>
          </div>
          <ul className="features-list">
            <li className="highlight"><span className="check-red">❌</span> 0 Éclairs</li>
            <li><span className="check-green">✔</span> Accès à tous les moteurs (selon les packs)</li>
            <li><span className="check-green">✔</span> Fonction prompt optimisée</li>
            <li><span className="check-green">✔</span> Accès aux models de prompts</li>
            <li><span className="check-green">✔</span> Accès à l'achat de Packs</li>
          </ul>
<button className="price-btn secondary" onClick={onBack}>
    Explorer le Studio
  </button>
          </div>

        <div className="price-card essentiel">
          <div className="card-top">
            <h3 className="status-badge">ESSENTIEL</h3>
            <p className="promo-text">LE MEILLEUR RAPPORT QUALITÉ/PRIX</p>
            <div className="price-value">{billingCycle === 'monthly' ? plans.essentiel.monthly : plans.essentiel.yearly}<span>/mois</span></div>
          </div>
          <ul className="features-list">
            <li className="highlight"><span className="check-green">✔</span> {plans.essentiel.eclairs} Éclairs / mois (réinitialisés chaque mois)</li>
           <li><span className="check-green">✔</span> Flux Dev / Schnell</li>
          <li className="highlight"><span className="check-red">❌</span>Seedance 2.0</li>
            <li><span className="check-green">✔</span> Vidéo Haute Définition HD : Veo 3.1 Lite & Veo 3 / kling 2.6 pro &  kling 3.0 pro / Pixverse / Hailuo-02 / Luma-Ray 2 / pixverse v6 / Seedance 1.5 Pro</li>
            <li><span className="check-green">✔</span> Jusqu'à 33 vidéos HD ou 300 images</li>
            <li><span className="check-green">✔</span> Fonction prompt optimisée</li>
            <li><span className="check-green">✔</span> Accès aux models de prompts</li>
            <li><span className="check-green">✔</span> Accès à l'achat de Packs</li>
          </ul>
          <button className="price-btn" onClick={() => handleSubscribe('essentiel')}>S'abonner maintenant</button>
        </div>

        <div className="price-card featured">
          <div className="popular-tag">PLUS POPULAIRE</div>
          <div className="card-top">
            <h3 className="status-badge">STANDARD</h3>
            <div className="price-value">{billingCycle === 'monthly' ? plans.standard.monthly : plans.standard.yearly}<span>/mois</span></div>
          </div>
          <ul className="features-list">
            <li className="highlight"><span className="check-green">✔</span> {plans.standard.eclairs} Éclairs / mois (réinitialisés chaque mois)</li>
            <li><span className="check-green">✔</span> Flux Dev / Schnell</li>
         <li><span className="check-green">✔</span> Seedance 2.0</li>
              <li><span className="check-green">✔</span> Tous les moteurs Image & Vidéo Inclus HD</li>
             <li><span className="check-green">✔</span> Jusqu'à 77 vidéos HD ou 700 images</li>           

            <li><span className="check-green">✔</span> Accès aux models de prompts</li>
            <li><span className="check-green">✔</span> Accès à l'achat de Packs</li>
            <li><span className="check-green">✔</span> Fonction prompt optimisée</li>
          </ul>
<button className="price-btn pro-btn" onClick={() => handleSubscribe('standard')}>Devenir Standard</button>        </div>

        <div className="price-card master">
          <div className="card-top">
            <h3 className="status-badge">MASTER</h3>
            <p className="promo-text">+60% DE PUISSANCE CRÉATIVE</p>
            <div className="price-value">{billingCycle === 'monthly' ? plans.master.monthly : plans.master.yearly}<span>/mois</span></div>
          </div>
          <ul className="features-list">
            <li className="highlight"><span className="check-green">✔</span> {plans.master.eclairs} Éclairs / mois (réinitialisés chaque mois)</li>
            <li><span className="check-green">✔</span> Tous les moteurs Image & Vidéo Inclus HD et FULL HD</li>
            <li><span className="check-green">✔</span> Jusqu'à 134 vidéos HD ou 1200 images</li>
            <li><span className="check-green">✔</span> Flux Pro / Schnell</li>
            <li><span className="check-green">✔</span> Accès aux models de prompts</li>
            <li><span className="check-green">✔</span> Accès à l'achat de Packs</li>
            <li><span className="check-green">✔</span> Fonction prompt optimisée</li>
          </ul>
<button className="price-btn master-btn" onClick={() => handleSubscribe('master')}>Passer au Master</button>        </div>

        <div className="price-card elite">
          <div className="exclusive-tag">OFFRE ULTIME</div>
          <div className="card-top">
            <h3 className="status-badge">ELITE</h3>
            <p className="promo-text">POUR LES CRÉATEURS INTENSIFS</p>
            <div className="price-value">{billingCycle === 'monthly' ? plans.elite.monthly : plans.elite.yearly}<span>/mois</span></div>
          </div>
          <ul className="features-list">
            <li className="highlight"><span className="check-green">✔</span> {plans.elite.eclairs} Éclairs / mois (réinitialisés chaque mois)</li>
            <li><span className="check-green">✔</span> Tous les moteurs Image & Vidéo Inclus HD et FULL HD</li>
            <li><span className="check-green">✔</span> Jusqu'à 277 vidéos HD ou 2500 images</li>
            <li><span className="check-green">✔</span> <b>Priorité Max sur les serveurs (No queue)</b></li>
            <li><span className="check-green">✔</span> Accès aux modèles de prompts</li>
            <li><span className="check-green">✔</span> Accès à l'achat de Packs</li>
            <li><span className="check-green">✔</span> Fonction prompt optimisée</li>
          </ul>
<button className="price-btn elite-btn" onClick={() => handleSubscribe('elite')}>Rejoindre l'Elite</button>        </div>

        <div className="price-card legende">
          <div className="exclusive-tag">PREMIUM AGÈNCE</div>
          <div className="card-top">
            <h3 className="status-badge">LÉGENDE</h3>
            <p className="promo-text">L'OUTIL ULTIME DES STUDIOS PRO</p>
            <div className="price-value">{billingCycle === 'monthly' ? plans.legende.monthly : plans.legende.yearly}<span>/mois</span></div>
          </div>
          <ul className="features-list">

            <li className="highlight"><span className="check-green">✔</span> <b>{plans.legende.eclairs} Éclairs / mois (réinitialisés chaque mois)</b></li>
        <li><span className="check-green">✔</span> Tous les moteurs Image & Vidéo Inclus HD et FULL HD</li>
                    <li><span className="check-green">✔</span> Jusqu'à 888 vidéos HD ou 8000 images</li>
             <li><span className="check-green">✔</span> <b>Priorité Max sur les serveurs (No queue)</b></li>
              <li><span className="check-green">✔</span> Accès aux modèles de prompts</li>
            <li><span className="check-green">✔</span> Accès à l'achat de Packs</li>
            <li><span className="check-green">✔</span> Fonction prompt optimisée</li>
          </ul>
<button className="price-btn legende-btn" onClick={() => handleSubscribe('legende')}>Devenir une Légende</button>        </div>
      </div>

      <hr className="section-divider" style={{ margin: '60px 0', opacity: 0.1 }} />

      <div className="concierge-section-flex" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div className="price-card custom-service">
          <div className="card-top">
            <h3 className="status-badge">CONCIERGERIE</h3>
            <p className="promo-text">ZÉRO EFFORT, RÉSULTAT PRO</p>
            <div className="price-value">Sur Devis<span>/projet</span></div>
          </div>
          <ul className="features-list">
            <li className="highlight"><span className="check-gold">💎</span> <b>On prompte à votre place</b></li>
            <li><span className="check-green">✔</span> Génération d'images & vidéos haute qualité</li>
            <li><span className="check-green">✔</span> Upscale et retouches pro incluses</li>
            <li><span className="check-green">✔</span> Gestion de vos réseaux sociaux</li>
     </ul>
    {/* --- MISE À JOUR ICI : Ajout du onClick --- */}
  <button 
  className="price-btn contact-btn"
  onClick={() => handleOpenContact(
   
  )}
>
  Contactez-nous
</button>
  </div>

  <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
    {/* --- MISE À JOUR ICI : Passage de la fonction au QuoteForm --- */}
    <QuoteForm onOpenContact={handleOpenContact} />
  </div>
</div>

{/* LIGNE DE SÉPARATION DESIGN */}
<div className="section-divider-container" style={{ margin: '80px 0 -40px', textAlign: 'center', position: 'relative' }}>
  <div style={{ 
    height: '5px', 
    background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.7), transparent)', 
    width: '100%',
    maxWidth: '1500px',
    margin: '0 auto'
  }}></div>
  
  <span style={{ 
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)', 
    background: '#0a0a0a', // Remplace par la couleur exacte de ton fond
    padding: '0 20px',
    color: '#a855f7',
    fontSize: '0.9rem',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase'
  }}>
    Ou Rechargez à la carte
  </span>
</div>

   <TokenPacks 
        isSubscriber={isSubscriber} 
        onPurchase={handlePurchase} 
      />
      
      <CustomDiamondSelector 
        isSubscriber={isSubscriber} 
        onPurchase={handlePurchase} 
      />

      <p className="pricing-footer-note" style={{textAlign: 'center', marginTop: '50px', opacity: 0.6}}>
        Les <b>Éclairs</b> d'abonnement expirent chaque mois. Les <b>Diamants</b> (recharges) sont conservés pendant un an.
      </p>
      {/* MODALE DE CONTACT & DEVIS */}
      {showContactModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000, padding: '20px' }}>
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', maxWidth: '450px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', textAlign: isSuccess ? 'center' : 'left' }}>
            {isSuccess ? (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
                <h3 style={{ color: '#60a5fa' }}>Demande envoyée !</h3>
                <p style={{ color: '#94a3b8' }}>Nous avons bien reçu vos informations, nous reviendrons vers vous rapidement.</p>
              </div>
            ) : (
              <>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>📬 Nous contacter</h3>
                <form onSubmit={handleSendMessage}>
                  <select 
                    value={contactData.subject} 
                    onChange={(e) => setContactData({...contactData, subject: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '15px' }}
                  >
                    <option value="devis">Demande de devis</option>
                    <option value="renseignement">Renseignement</option>
                    <option value="probleme">Signaler un problème</option>
                  </select>
                  <textarea 
                    required 
                    value={contactData.message} 
                    onChange={(e) => setContactData({...contactData, message: e.target.value})}
                    placeholder="Détaillez votre demande ici..."
                    style={{ width: '100%', height: '150px', padding: '12px', borderRadius: '12px', background: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '20px', resize: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setShowContactModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>Annuler</button>
                    <button type="submit" disabled={isSending} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', border: 'none', fontWeight: 'bold', cursor: isSending ? 'not-allowed' : 'pointer' }}>
                      {isSending ? "Envoi..." : "Envoyer"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;