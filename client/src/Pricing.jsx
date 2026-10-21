import React, { useState } from 'react';
import './Pricing.css';
import { auth, db } from './firebase';
import { addDoc, collection } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';

// --- 1. SÉLECTEUR DE DIAMANTS SUR MESURE ---

const CustomDiamondSelector = ({ isSubscriber, onPurchase }) => {
  const [qty, setQty] = useState(1000);
  const { t, i18n } = useTranslation();

  const getPrices = (amount) => {
    let unitPriceFull, unitPriceSub;

    if (amount >= 60000) {
      unitPriceFull = 149.99 / 60000;
      unitPriceSub = 99.99 / 60000;
    } else if (amount >= 30000) {
      unitPriceFull = 89.99 / 30000;
      unitPriceSub = 54.99 / 30000;
    } else if (amount >= 15000) {
      unitPriceFull = 49.99 / 15000;
      unitPriceSub = 29.99 / 15000;
    } else if (amount >= 6000) {
      unitPriceFull = 24.99 / 6000;
      unitPriceSub = 12.99 / 6000;
    } else if (amount >= 3000) {
      unitPriceFull = 14.99 / 3000;
      unitPriceSub = 7.99 / 3000;
    } else {
      unitPriceFull = 5.99 / 1000;
      unitPriceSub = 2.99 / 1000;
    }

    return {
      full: (amount * unitPriceFull).toFixed(2),
      sub: (amount * unitPriceSub).toFixed(2),
      currentUnit: (isSubscriber ? unitPriceSub : unitPriceFull).toFixed(3)
    };
  };

  const prices = getPrices(qty);

  return (
    <div
      className="custom-diamond-container"
      style={{
        marginTop: '50px',
        padding: '40px',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}
    >
      <h2
        className="packs-title"
        style={{
          background: 'linear-gradient(to right, #fff, #a855f7, #fff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem',
          marginBottom: '15px',
          fontWeight: '800'
        }}
      >
        💎 {t('custom volume title')}
      </h2>

      <div style={{ marginBottom: '25px' }}>
        {isSubscriber ? (
          <p
            className="packs-subtitle"
            style={{
              display: 'inline-block',
              padding: '8px 25px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '50px',
              color: '#d8b4fe',
              fontWeight: '600',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)'
            }}
          >
            ✨ {t('loyalty benefit')}: <span style={{ color: '#fff', textShadow: '0 0 10px #a855f7' }}>-50%</span> {t('applied to order')} !
          </p>
        ) : (
          <p
            className="packs-subtitle"
            style={{ opacity: 0.7, fontSize: '1.1rem' }}
          >
            {t('adjust slider exact amount')}
          </p>
        )}
      </div>

      <div
        className="slider-value-display"
        style={{
          margin: '30px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            color: '#fff',
            textShadow: '0 0 25px rgba(168, 85, 247, 0.5)',
            lineHeight: '1.1'
          }}
        >
          {qty.toLocaleString(i18n.resolvedLanguage || i18n.language || 'fr')}
        </div>

        <div
          style={{
            fontSize: '1.1rem',
            color: '#a855f7',
            letterSpacing: '2px',
            marginTop: '5px',
            fontWeight: '700'
          }}
        >
          {t('diamonds').toUpperCase()}
        </div>
      </div>

      <input
        type="range"
        min="1000"
        max="10000"
        step="100"
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value))}
        className="custom-slider"
        style={{
          width: '100%',
          maxWidth: '600px',
          cursor: 'pointer',
          touchAction: 'pan-y'
        }}
      />

      <div
        className="price-checkout-zone"
        style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}
      >
        <div className="final-price-area">
          {isSubscriber && (
            <span
              className="old-price"
              style={{
                textDecoration: 'line-through',
                opacity: 0.5,
                fontSize: '1.2rem',
                display: 'block'
              }}
            >
              {prices.full}€
            </span>
          )}

          <span className="pack-price" style={{ fontSize: '3.5rem' }}>
            {isSubscriber ? prices.sub : prices.full}€
          </span>
        </div>

        <button
          className="buy-pack-btn"
          style={{
            padding: '18px 60px',
            fontSize: '1.2rem',
            borderRadius: '50px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}
          onClick={() => onPurchase(qty)}
        >
          {t('buy volume')}
        </button>

        <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>
          {t('unit price')} : {prices.currentUnit}€ / {t('diamond')}
        </p>
      </div>
    </div>
  );
};

// --- 2. PACKS FIXES ---

const TokenPacks = ({ isSubscriber, onPurchase }) => {
  const { t, i18n } = useTranslation();

  const packs = [
    { name: t('diamond pack spark'), qty: 1000, priceFull: 5.99, priceSub: 2.99 },
    { name: t('diamond pack supernova'), qty: 3000, priceFull: 14.99, priceSub: 7.99 },
    { name: t('diamond pack galaxy'), qty: 6000, priceFull: 24.99, priceSub: 12.99, featured: true },
    { name: t('diamond pack pulsar'), qty: 15000, priceFull: 49.99, priceSub: 29.99 },
    { name: t('diamond pack quasar'), qty: 30000, priceFull: 89.99, priceSub: 54.99 },
    { name: t('diamond pack universe'), qty: 60000, priceFull: 149.99, priceSub: 99.99, bestValue: true }
  ];

  return (
    <div
      className="token-packs-container"
      style={{ textAlign: 'center', marginTop: '60px' }}
    >
      <h2
        className="packs-title"
        style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, #fff, #a855f7, #fff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}
      >
        {t('quick boost title')}
      </h2>

      <div style={{ marginBottom: '40px' }}>
        {isSubscriber ? (
          <span
            className="packs-subtitle"
            style={{
              display: 'inline-block',
              padding: '6px 20px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '50px',
              color: '#d8b4fe',
              fontWeight: '600',
              fontSize: '0.95rem',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)'
            }}
          >
            ✨ <span style={{ color: '#fff', textShadow: '0 0 8px #a855f7' }}>
              {t('subscriber rate active')}
            </span>{' '}
            {t('exclusive discounts')}.
          </span>
        ) : (
          <p
            className="packs-subtitle"
            style={{ opacity: 0.6, fontSize: '1rem' }}
          >
            {t('diamonds valid one year')}.
          </p>
        )}
      </div>

      <div className="packs-grid">
        {packs.map((pack) => (
          <div
            key={pack.name}
            className={`mini-pack ${pack.featured ? 'featured-pack' : ''}`}
          >
            {pack.featured && (
              <div
                className="pack-badge"
                style={{ background: '#a855f7' }}
              >
                {t('popular')}
              </div>
            )}

            {pack.bestValue && (
              <div
                className="pack-badge"
                style={{ background: '#f59e0b' }}
              >
                {t('best value')}
              </div>
            )}

            <h4>{pack.name}</h4>

            <div className="pack-price-area">
              {isSubscriber && (
                <span
                  className="old-price"
                  style={{
                    textDecoration: 'line-through',
                    opacity: 0.5,
                    marginRight: '8px'
                  }}
                >
                  {pack.priceFull}€
                </span>
              )}

              <span className="pack-price">
                {isSubscriber ? pack.priceSub : pack.priceFull}€
              </span>
            </div>

            <p>
              💎 {pack.qty.toLocaleString(i18n.resolvedLanguage || i18n.language || 'fr')} {t('diamonds')}
            </p>

            <button
              className="buy-pack-btn"
              onClick={() => onPurchase(pack.qty)}
            >
              {t('buy')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. CONFIGURATEUR DE DEVIS ---

const RATES = {
  PHOTO: 10,
  VIDEO: 50,
  SOCIAL_MEDIA: 300
};

const QuoteForm = ({ onOpenContact }) => {
  const { t, i18n } = useTranslation();

  const [selections, setSelections] = useState({
    photos: 10,
    videos: 2,
    socialMedia: false,
    projectType: 'unique'
  });

  const estimate =
    selections.photos * RATES.PHOTO +
    selections.videos * RATES.VIDEO +
    (selections.socialMedia ? RATES.SOCIAL_MEDIA : 0);

  const handleSliderChange = (key, val) => {
    setSelections({
      ...selections,
      [key]: parseInt(val)
    });
  };

  return (
    <div className="quote-configurator">
      <h3>{t('custom serenity pack')}</h3>

      <div className="form-group">
        <label className="input-label">
          {t('support type')}
        </label>

        <div className="select-wrapper">
          <select
            value={selections.projectType}
            onChange={(e) =>
              setSelections({
                ...selections,
                projectType: e.target.value
              })
            }
            className="custom-select"
          >
            <option value="unique">{t('one time project')}</option>
            <option value="monthly">{t('monthly support')}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <div className="label-header">
          <label>{t('professional photos')}</label>
          <span className="count-badge">{selections.photos}</span>
        </div>

        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={selections.photos}
          className="custom-slider"
          onChange={(e) =>
            handleSliderChange('photos', e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <div className="label-header">
          <label>{t('ai professional videos')}</label>
          <span className="count-badge">{selections.videos}</span>
        </div>

        <input
          type="range"
          min="0"
          max="20"
          value={selections.videos}
          className="custom-slider"
          onChange={(e) =>
            handleSliderChange('videos', e.target.value)
          }
        />
      </div>

      <div className="form-group-checkbox custom-checkbox-wrapper">
        <input
          type="checkbox"
          id="sm-check"
          checked={selections.socialMedia}
          onChange={(e) =>
            setSelections({
              ...selections,
              socialMedia: e.target.checked
            })
          }
        />

        <label htmlFor="sm-check">
          {t('social media management')} (+300€)
        </label>
      </div>

      <div className="quote-summary">
        <span className="summary-text">
          {selections.projectType === 'unique'
            ? `${t('one time estimate')} :`
            : `${t('monthly estimate')} :`}
        </span>

        <div className="estimate-price">
          {estimate.toLocaleString(i18n.resolvedLanguage || i18n.language || 'fr')}€
          <span className="per-month">
            {selections.projectType === 'unique'
              ? ''
              : t('per month')}
          </span>
        </div>

        <button
          className="price-btn legende-btn"
          onClick={() => {
            const typeProjet =
              selections.projectType === 'unique'
                ? t('one time')
                : t('monthly serenity');

            const messageDevis =
              `${t('hello')}\n\n` +
              `${t('quote request intro')}\n\n` +
              `${t('type label')} : ${typeProjet}\n` +
              `${t('photos label')} : ${selections.photos} ${t('professional visuals')}\n` +
              `${t('videos label')} : ${selections.videos} ${t('ai sequences')}\n` +
              `${t('social media label')} : ${
                selections.socialMedia
                  ? t('yes included')
                  : t('no')
              }\n\n` +
              `${t('estimate label')} : ${estimate}€${
                selections.projectType === 'unique'
                  ? ''
                  : t('per month')
              }\n\n` +
              `${t('thank you')}`;

            onOpenContact(messageDevis);
          }}
        >
          {t('request serenity quote')}
        </button>

        <p className="disclaimer">
          <i>* {t('free analysis 24h')}.</i>
        </p>
      </div>
    </div>
  );
};

// --- 4. COMPOSANT PRICING ---

const Pricing = ({ onBack, userPlan }) => {
  const { t } = useTranslation();

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactData, setContactData] = useState({
    subject: 'devis',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleOpenContact = (prefilledMessage = '') => {
    setContactData({
      subject: 'devis',
      message: prefilledMessage
    });
    setShowContactModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!contactData.message.trim()) return;

    setIsSending(true);

    const user = auth.currentUser;

    try {
      await addDoc(collection(db, 'contact_messages'), {
        uid: user?.uid || 'anonyme',
        email: user?.email || 'non-connecté',
        nom: user?.displayName || 'Utilisateur Pricing',
        objet: contactData.subject,
        message: contactData.message,
        createdAt: new Date().toISOString()
      });

      await emailjs.send(
        'service_qh3e56a',
        'template_nil0lc5',
        {
          title: contactData.subject,
          name: user?.displayName || 'Client',
          email: user?.email || 'Non fourni',
          message: contactData.message,
          time: new Date().toLocaleString()
        },
        'HLKSnEAZsjY0shKFy'
      );

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setShowContactModal(false);
        setContactData({
          subject: 'devis',
          message: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Erreur d’envoi:', error);
    }

    setIsSending(false);
  };

  const [billingCycle, setBillingCycle] = useState('monthly');

  const isSubscriber =
    userPlan &&
    !['debutant', 'discovery', '0.00'].includes(
      userPlan.toLowerCase()
    );

  const handlePurchase = async (quantity) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert(t('login required diamonds'));
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: quantity,
            plan: userPlan,
            userId: user.uid
          })
        }
      );

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        console.error(
          'Le serveur n’a pas renvoyé d’URL :',
          session
        );
      }
    } catch (err) {
      console.error(
        'Erreur lors de l’initiation de l’achat:',
        err
      );
    }
  };

  const handleSubscribe = async (planName) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert(t('login required subscription'));
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/create-subscription-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            planId: planName.toLowerCase(),
            interval: billingCycle,
            plan: userPlan
          })
        }
      );

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        console.error('Erreur session Stripe:', session);
      }
    } catch (err) {
      console.error('Erreur abonnement:', err);
    }
  };

  const plans = {
    discovery: {
      monthly: '0€',
      yearly: '0€'
    },
    essentiel: {
      monthly: '12,99€',
      yearly: '10,39€',
      eclairs: '3000'
    },
    standard: {
      monthly: '24,99€',
      yearly: '19,99€',
      eclairs: '7000'
    },
    master: {
      monthly: '34,99€',
      yearly: '27,99€',
      eclairs: '12000'
    },
    elite: {
      monthly: '59,99€',
      yearly: '47,99€',
      eclairs: '25000'
    },
    legende: {
      monthly: '159,99€',
      yearly: '127,99€',
      eclairs: '80000'
    }
  };

  return (
    <div
      className="pricing-page"
      style={{ paddingTop: '20px' }}
    >
      <div
        style={{
          paddingLeft: '20px',
          marginBottom: '-10px'
        }}
      >
        <button
          className="back-button-pricing"
          onClick={onBack}
        >
          ← {t('back')}
        </button>
      </div>

      <div
        className="pricing-header"
        style={{ marginTop: '60px' }}
      >
        <h1>{t('choose your power')}</h1>

        <p>{t('power your creativity')}</p>

        <div className="billing-toggle">
          <span
            className={
              billingCycle === 'monthly'
                ? 'active'
                : ''
            }
          >
            {t('monthly')}
          </span>

          <div
            className={`toggle-switch ${
              billingCycle === 'yearly' ? 'on' : ''
            }`}
            onClick={() =>
              setBillingCycle(
                billingCycle === 'monthly'
                  ? 'yearly'
                  : 'monthly'
              )
            }
          >
            <div className="switch-dot"></div>
          </div>

          <span
            className={
              billingCycle === 'yearly'
                ? 'active'
                : ''
            }
          >
            {t('yearly')}{' '}
            <small className="promo">
              -20%
            </small>
          </span>
        </div>
      </div>

      <div className="pricing-grid">

        {/* DÉBUTANT */}
        <div className="price-card discovery">
          <div className="card-top">
            <h3 className="status-badge">
              {t('beginner')}
            </h3>

            <p className="plan-name">
              {t('no commitment')}
            </p>

            <p className="plan-subtitle">
              {t('ideal to test engines')}
            </p>

            <div className="price-value">
              0€<span>{t('per month')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-red">❌</span>{' '}
              0 {t('lightnings')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('access all engines')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('optimized prompt')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('prompt models access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('packs purchase access')}
            </li>
          </ul>

          <button
            className="price-btn secondary"
            onClick={onBack}
          >
            {t('explore studio')}
          </button>
        </div>

        {/* ESSENTIEL */}
        <div className="price-card essentiel">
          <div className="card-top">
            <h3 className="status-badge">
              {t('essential')}
            </h3>

            <p className="promo-text">
              {t('best value quality price')}
            </p>

            <div className="price-value">
              {billingCycle === 'monthly'
                ? plans.essentiel.monthly
                : plans.essentiel.yearly}
              <span>{t('per month')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-green">✔</span>{' '}
              {plans.essentiel.eclairs} {t('lightnings')} / {t('month')}{' '}
              ({t('reset each month')})
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('hd image flux')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('hd video engines')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('up to 33 videos or 300 images')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('optimized prompt')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('prompt models access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('packs purchase access')}
            </li>
          </ul>

          <button
            className="price-btn"
            onClick={() =>
              handleSubscribe('essentiel')
            }
          >
            {t('subscribe now')}
          </button>
        </div>

        {/* STANDARD */}
        <div className="price-card featured">
          <div className="popular-tag">
            {t('most popular')}
          </div>

          <div className="card-top">
            <h3 className="status-badge">
              {t('standard')}
            </h3>

            <div className="price-value">
              {billingCycle === 'monthly'
                ? plans.standard.monthly
                : plans.standard.yearly}
              <span>{t('per month')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-green">✔</span>{' '}
              {plans.standard.eclairs} {t('lightnings')} / {t('month')}{' '}
              ({t('reset each month')})
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('all image video engines hd')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('up to 77 videos or 700 images')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('prompt models access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('packs purchase access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('optimized prompt')}
            </li>
          </ul>

          <button
            className="price-btn pro-btn"
            onClick={() =>
              handleSubscribe('standard')
            }
          >
            {t('become standard')}
          </button>
        </div>

        {/* MASTER */}
        <div className="price-card master">
          <div className="card-top">
            <h3 className="status-badge">
              {t('master')}
            </h3>

            <p className="promo-text">
              {t('plus 60 creative power')}
            </p>

            <div className="price-value">
              {billingCycle === 'monthly'
                ? plans.master.monthly
                : plans.master.yearly}
              <span>{t('per month')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-green">✔</span>{' '}
              {plans.master.eclairs} {t('lightnings')} / {t('month')}{' '}
              ({t('reset each month')})
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('all image video engines hd')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('up to 134 videos or 1200 images')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('prompt models access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('packs purchase access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('optimized prompt')}
            </li>
          </ul>

          <button
            className="price-btn master-btn"
            onClick={() =>
              handleSubscribe('master')
            }
          >
            {t('upgrade master')}
          </button>
        </div>

        {/* ELITE */}
        <div className="price-card elite">
          <div className="exclusive-tag">
            {t('ultimate offer')}
          </div>

          <div className="card-top">
            <h3 className="status-badge">
              {t('elite')}
            </h3>

            <p className="promo-text">
              {t('for intensive creators')}
            </p>

            <div className="price-value">
              {billingCycle === 'monthly'
                ? plans.elite.monthly
                : plans.elite.yearly}
              <span>{t('per month')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-green">✔</span>{' '}
              {plans.elite.eclairs} {t('lightnings')} / {t('month')}{' '}
              ({t('reset each month')})
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('all image video engines hd')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('up to 277 videos or 2500 images')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              <b>{t('max server priority')}</b>
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('prompt models access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('packs purchase access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('optimized prompt')}
            </li>
          </ul>

          <button
            className="price-btn elite-btn"
            onClick={() =>
              handleSubscribe('elite')
            }
          >
            {t('join elite')}
          </button>
        </div>

        {/* LÉGENDE */}
        <div className="price-card legende">
          <div className="exclusive-tag">
            {t('premium agency')}
          </div>

          <div className="card-top">
            <h3 className="status-badge">
              {t('legend')}
            </h3>

            <p className="promo-text">
              {t('ultimate tool pro studios')}
            </p>

            <div className="price-value">
              {billingCycle === 'monthly'
                ? plans.legende.monthly
                : plans.legende.yearly}
              <span>{t('per month')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-green">✔</span>{' '}
              <b>
                {plans.legende.eclairs} {t('lightnings')} / {t('month')}{' '}
                ({t('reset each month')})
              </b>
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('all image video engines hd')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('up to 888 videos or 8000 images')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              <b>{t('max server priority')}</b>
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('prompt models access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('packs purchase access')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('optimized prompt')}
            </li>
          </ul>

          <button
            className="price-btn legende-btn"
            onClick={() =>
              handleSubscribe('legende')
            }
          >
            {t('become legend')}
          </button>
        </div>
      </div>

      <hr
        className="section-divider"
        style={{ margin: '60px 0', opacity: 0.1 }}
      />

      {/* CONCIERGERIE */}
      <div
        className="concierge-section-flex"
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <div className="price-card custom-service">
          <div className="card-top">
            <h3 className="status-badge">
              {t('concierge')}
            </h3>

            <p className="promo-text">
              {t('zero effort pro result')}
            </p>

            <div className="price-value">
              {t('quote')}
              <span>/{t('project')}</span>
            </div>
          </div>

          <ul className="features-list">
            <li className="highlight">
              <span className="check-gold">💎</span>{' '}
              <b>{t('we prompt for you')}</b>
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('high quality image video')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('upscale pro retouching')}
            </li>

            <li>
              <span className="check-green">✔</span>{' '}
              {t('social media management')}
            </li>
          </ul>

          <button
            className="price-btn contact-btn"
            onClick={() => handleOpenContact()}
          >
            {t('contact us')}
          </button>
        </div>

        <div
          style={{
            flex: '1',
            minWidth: '300px',
            maxWidth: '600px'
          }}
        >
          <QuoteForm
            onOpenContact={handleOpenContact}
          />
        </div>
      </div>

      {/* SÉPARATION */}
      <div
        className="section-divider-container"
        style={{
          margin: '80px 0 -40px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '5px',
            background:
              'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.7), transparent)',
            width: '100%',
            maxWidth: '1500px',
            margin: '0 auto'
          }}
        ></div>

        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#0a0a0a',
            padding: '0 20px',
            color: '#a855f7',
            fontSize: '0.9rem',
            fontWeight: '600',
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}
        >
          {t('recharge on demand')}
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

      <p
        className="pricing-footer-note"
        style={{
          textAlign: 'center',
          marginTop: '50px',
          opacity: 0.6
        }}
      >
        {t('subscription diamonds note')}
      </p>

      {/* MODALE DE CONTACT */}
      {showContactModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#1e293b',
              padding: '30px',
              borderRadius: '24px',
              maxWidth: '450px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: isSuccess ? 'center' : 'left'
            }}
          >
            {isSuccess ? (
              <div style={{ padding: '20px 0' }}>
                <div
                  style={{
                    fontSize: '50px',
                    marginBottom: '15px'
                  }}
                >
                  ✅
                </div>

                <h3 style={{ color: '#60a5fa' }}>
                  {t('request sent')}
                </h3>

                <p style={{ color: '#94a3b8' }}>
                  {t('request received')}
                </p>
              </div>
            ) : (
              <>
                <h3
                  style={{
                    color: 'white',
                    marginBottom: '20px'
                  }}
                >
                  📬 {t('contact us')}
                </h3>

                <form onSubmit={handleSendMessage}>
                  <select
                    value={contactData.subject}
                    onChange={(e) =>
                      setContactData({
                        ...contactData,
                        subject: e.target.value
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      color: 'white',
                      border: '1px solid #334155',
                      marginBottom: '15px'
                    }}
                  >
                    <option value="devis">
                      {t('quote request')}
                    </option>

                    <option value="renseignement">
                      {t('information')}
                    </option>

                    <option value="probleme">
                      {t('report problem')}
                    </option>
                  </select>

                  <textarea
                    required
                    value={contactData.message}
                    onChange={(e) =>
                      setContactData({
                        ...contactData,
                        message: e.target.value
                      })
                    }
                    placeholder={t(
                      'request details placeholder'
                    )}
                    style={{
                      width: '100%',
                      height: '150px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      color: 'white',
                      border: '1px solid #334155',
                      marginBottom: '20px',
                      resize: 'none'
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setShowContactModal(false)
                      }
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#334155',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {t('cancel')}
                    </button>

                    <button
                      type="submit"
                      disabled={isSending}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        background:
                          'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: isSending
                          ? 'not-allowed'
                          : 'pointer'
                      }}
                    >
                      {isSending
                        ? t('sending')
                        : t('send')}
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