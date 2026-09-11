import React, { useState } from 'react';
import './AuthModal.css'; 
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './firebase'; 
import { updateProfile } from 'firebase/auth'; 
import { 

  signInWithPopup,
  browserPopupRedirectResolver,
  signInWithRedirect,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

const AuthModal = ({ isOpen, onClose, onSuccess, onShowTerms, onShowPrivacy }) => {  const [successMessage, setSuccessMessage] = useState('');
  const [view, setView] = useState('methods');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Pour stocker le message court
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // NOUVEAU : État pour l'œil
  const isAppleEnabled = false;
const [otpCode, setOtpCode] = useState('');
const [userId, setUserId] = useState('');



  if (!isOpen) return null;

  // --- LOGIQUE GOOGLE ---// --- LOGIQUE GOOGLE CORRIGÉE ---
const handleGoogleLogin = async () => {
  setError("");

  try {
    // Utilisation de Popup au lieu de Redirect
    const result = await signInWithPopup(auth, googleProvider);
    
    // Le résultat contient maintenant l'utilisateur
    const user = result.user;
    console.log("✅ Utilisateur Google connecté :", user.email);

    // Si tu as une fonction pour créer le profil en base (comme tu l'as codé avant)
    // await createUserProfile(user); 

    onClose(); // Ferme la modale

    if (onSuccess) {
      onSuccess(user);
    }

  } catch (error) {
    console.error("❌ Erreur Google :", error.code);
    // Erreur fréquente : popup bloqué par le navigateur
    if (error.code === 'auth/popup-blocked') {
      setError("Autorisez les popups pour vous connecter");
    } else {
      setError("Erreur lors de la connexion avec Google");
    }
  }
};

  // --- LOGIQUE APPLE ---
  const handleAppleLogin = async () => {
    setError("");
    const appleProvider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, appleProvider);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur Apple:", error.code);
      setError("Erreur connexion Apple");
    }
  };

 // --- LOGIQUE RÉCUPÉRATION ---
  const handleForgotPassword = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError("");
    setSuccessMessage(""); // On réinitialise

    if (!email || email.trim() === "") {
      setError("Saisissez votre e-mail");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      // On affiche le message de succès (il restera là tant qu'on ne change pas de vue)
      setSuccessMessage("Lien envoyé à " + email);

      setTimeout(() => {
        setSuccessMessage(""); // On vide le message
        setView('auth-form');  // On bascule sur la connexion
      }, 2000);
      
    } catch (err) {
      console.error("Erreur Firebase:", err.code);
      if (err.code === 'auth/user-not-found') {
        setError("Compte inexistant");
      } else {
        setError("Vérifiez votre mail");
      }
    }
  };

  // --- LOGIQUE EMAIL (CONNEXION/INSCRIPTION) ---
const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // 💎 Ajout d'une photo de profil et d'un nom par défaut
        await updateProfile(userCredential.user, {
          displayName: email.split('@')[0],
          photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=" + email.trim()
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      // On récupère directement le UID de Firebase
      const firebaseUser = userCredential.user;

      // 🚀 ON ENVOIE LE EMAIL ET LE USERID AU BACKEND
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          userId: firebaseUser.uid 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du code OTP");
      }

      // On stocke le userId renvoyé par le backend et on bascule sur la vue OTP
      setUserId(data.userId);
      setView('otp-verify');
      setSuccessMessage("Un code de vérification vous a été envoyé par e-mail.");

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Cet e-mail est déjà associé à un compte.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Adresse e-mail ou mot de passe incorrect.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Le format de l'adresse e-mail est invalide.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: otpCode.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Code invalide");
      }

      onClose();
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la validation du code");
    }
  };
return (
    <div className="auth-overlay">
      <div className="auth-card">
        <button className="auth-close-btn" onClick={onClose}>✕</button>

        <h2 className="auth-title">Eclipse IA</h2>

        {/* --- VUE 1 : MÉTHODES --- */}
        {view === 'methods' && (
          <div className="auth-methods">
            <button className="method-btn google" onClick={handleGoogleLogin}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
              Continuer avec Google
            </button>
            
            {isAppleEnabled && (
              <button className="method-btn dark" onClick={handleAppleLogin}>
                <i className="fab fa-apple"></i> Continuer avec Apple
              </button>
            )}

            <div className="auth-divider">OU</div>

            {/* AFFICHAGE ERREUR MÉTHODES SOCIALES */}
            {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}

            <button className="method-btn dark" onClick={() => { setView('auth-form'); setError(""); }}>
              <i className="far fa-envelope"></i> Continuer avec l'e-mail
            </button>
          </div>
        )}

        {/* --- VUE 2 : FORMULAIRE --- */}
        {view === 'auth-form' && (
          <form onSubmit={handleEmailAuth} className="email-form">
            <input 
              type="email" 
              placeholder="Votre e-mail" 
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            {/* CONTENEUR DU MOT DE PASSE AVEC L'OEIL */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Mot de passe" 
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                  fontSize: '16px',
                  zIndex: 2,
                  userSelect: 'none'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
            </div>
            
            {!isRegistering && (
              <p 
                className="forgot-password-link" 
                onClick={() => { setView('forgot-password'); setError(""); }}
                style={{ fontSize: '12px', color: '#888', cursor: 'pointer', textAlign: 'right', marginTop: '-5px', marginBottom: '10px' }}
              >
                Mot de passe oublié ?
              </p>
            )}

            {/* AFFICHAGE ERREUR COURTE ICI */}
            {error && (
              <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px', textAlign: 'center', fontWeight: '500' }}>
                ⚠️ {error}
              </p>
            )}

            <button type="submit" className="submit-btn">
              {isRegistering ? "Créer mon compte" : "Se connecter"}
            </button>

    <p className="switch-auth-mode">
              {isRegistering ? "Déjà un compte ?" : "Nouveau ici ?"}
              <span 
                style={{ color: '#a855f7', cursor: 'pointer', marginLeft: '5px' }} 
                onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
              >
                {isRegistering ? " Se connecter" : " Créer un compte"}
              </span>
            </p>
            
            {/* Conteneur avec espace en haut ET en bas */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '1px', marginBottom: '20px' }}>
              <button 
                type="button" 
                className="back-btn" 
                onClick={() => { setView('methods'); setError(""); }} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#94a3b8', 
                  cursor: 'pointer', 
                  width: '100%', 
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: '0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                ← Retour
              </button>
            </div>
          </form>
        )}
{/* --- VUE 3 : FORMULAIRE MOT DE PASSE OUBLIÉ --- */}
        {view === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="email-form">
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '10px', textAlign: 'center' }}>
              Réinitialiser le mot de passe
            </h3>
            
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '15px', textAlign: 'center' }}>
              Entrez votre e-mail pour recevoir un lien de récupération.
            </p>

            <input 
              type="email" 
              placeholder="Votre e-mail" 
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            {error && (
              <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}

            {successMessage && (
              <p style={{ 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.1)', 
                fontSize: '13px', 
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px', 
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontWeight: '500'
              }}>
                ✅ {successMessage}
              </p>
            )}

            <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
              Envoyer le lien
            </button>
            
            <button type="button" className="back-btn" onClick={() => { setView('auth-form'); setError(""); setSuccessMessage(""); }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', width: '100%', marginTop: '10px' }}>
              ← Retour à la connexion
            </button>
          </form>
        )}

        {/* --- VUE 4 : SAISIE DU CODE OTP --- */}
        {view === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="email-form">
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '10px', textAlign: 'center' }}>
              Double Authentification
            </h3>
            
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '15px', textAlign: 'center' }}>
              Entrez le code à 6 chiffres reçu par e-mail.
            </p>

            <input 
              type="text" 
              maxLength="6"
              placeholder="123456" 
              className="auth-input"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required 
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
            />

            {error && (
              <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}

            {successMessage && (
              <p style={{ 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.1)', 
                fontSize: '13px', 
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px', 
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                ✅ {successMessage}
              </p>
            )}

            <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
              Valider le code
            </button>
            
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => { setView('auth-form'); setError(""); setSuccessMessage(""); }} 
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', width: '100%', marginTop: '10px' }}
            >
              ← Retour
            </button>
          </form>
        )}

        <p className="auth-legal">
         En continuant, vous acceptez les 
          <span className="terms-link" onClick={onShowTerms} style={{ cursor: 'pointer', color: '#a855f7' }}> Conditions d'utilisation</span>
          {' et la '}
          <span className="privacy-link" onClick={onShowPrivacy} style={{ cursor: 'pointer', color: '#a855f7' }}> Politique de Confidentialité</span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;


