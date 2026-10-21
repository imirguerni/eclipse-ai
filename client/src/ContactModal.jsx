import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from './firebase';
import { addDoc, collection } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const ContactModal = ({ user, onClose }) => {
  const { t } = useTranslation();
  const [contactData, setContactData] = useState({ subject: 'renseignement', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sendError, setSendError] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!contactData.message.trim()) return;

    setIsSending(true);
    setSendError(false);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        uid: user?.uid || 'anonyme',
        email: user?.email || 'non-connecté',
        nom: user?.displayName || 'Inconnu',
        objet: contactData.subject,
        message: contactData.message,
        createdAt: new Date().toISOString(),
      });

      await emailjs.send(
        'service_qh3e56a',
        'template_nil0lc5',
        {
          title: contactData.subject,
          name: user?.displayName || 'Utilisateur',
          email: user?.email || 'Non fourni',
          message: contactData.message,
          time: new Date().toLocaleString()
        },
        'HLKSnEAZsjY0shKFy'
      );

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setContactData({ subject: 'renseignement', message: '' });
      }, 3000);
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      setSendError(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000, padding: '20px'
    }}>
      <div style={{
        background: '#1e293b', padding: '30px', borderRadius: '24px',
        maxWidth: '450px', width: '100%', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: isSuccess ? 'center' : 'left',
        color: 'white'
      }}>
        {isSuccess ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#60a5fa', marginBottom: '10px' }}>{t('contact.successTitle')}</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
              {t('contact.successMessage', { name: user?.displayName || '' })}
              <br />
              {t('contact.replySoon')}
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📬 {t('contact.title')}
            </h3>
            <form onSubmit={handleSendMessage}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                {t('contact.subjectLabel')}
              </label>
              <select
                value={contactData.subject}
                onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a',
                  color: 'white', border: '1px solid #334155', marginBottom: '20px', outline: 'none'
                }}
              >
                <option value="renseignement">{t('contact.subjectInfo')}</option>
                <option value="probleme">{t('contact.subjectProblem')}</option>
                <option value="devis">{t('contact.subjectQuote')}</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                {t('contact.messageLabel')}
              </label>
              <textarea
                required
                value={contactData.message}
                onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                placeholder={t('contact.messagePlaceholder')}
                style={{
                  width: '100%', height: '120px', padding: '12px', borderRadius: '12px',
                  background: '#0f172a', color: 'white', border: '1px solid #334155',
                  marginBottom: '25px', outline: 'none', resize: 'none', fontFamily: 'inherit'
                }}
              />

              {sendError && (
                <p role="alert" style={{ color: '#fca5a5', fontSize: '13px', marginTop: '-12px', marginBottom: '16px' }}>
                  {t('contact.sendError')}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={onClose} style={{
                  flex: 1, padding: '14px', borderRadius: '12px', background: '#334155',
                  border: 'none', color: 'white', cursor: 'pointer', fontWeight: '600'
                }}>
                  ← {t('contact.back')}
                </button>
                <button type="submit" disabled={isSending} style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: 'white', border: 'none', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                }}>
                  {isSending ? t('contact.sending') : t('contact.send')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
