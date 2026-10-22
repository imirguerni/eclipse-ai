import React, { useState } from 'react';
import './AuthModal.css';
import { auth, googleProvider } from './firebase';
import { updateProfile } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithRedirect,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const AuthModal = ({ isOpen, onClose, onSuccess, onShowTerms, onShowPrivacy }) => {
  const { t } = useTranslation();

  const [successMessage, setSuccessMessage] = useState('');
  const [view, setView] = useState('methods');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isAppleEnabled = false;
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState('');

  if (!isOpen) return null;

  // --- LOGIQUE GOOGLE ---
const handleGoogleLogin = async () => {
  setError('');

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log('✅ Utilisateur Google connecté :', user.email);

    onClose();

    if (onSuccess) {
      onSuccess(user);
    }
  } catch (error) {
    console.error('❌ Erreur Google :', error.code, error.message);

    if (error.code === 'auth/popup-blocked') {
      setError(t('allow popups login'));
    } else {
      setError(t('google login error'));
    }
  }
};

  // --- LOGIQUE APPLE ---
  const handleAppleLogin = async () => {
    setError('');

    const appleProvider = new OAuthProvider('apple.com');

    try {
      await signInWithPopup(auth, appleProvider);

      onClose();

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Erreur Apple:', error.code);
      setError(t('apple login error'));
    }
  };

  // --- LOGIQUE RÉCUPÉRATION ---
  const handleForgotPassword = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setError('');
    setSuccessMessage('');

    if (!email || email.trim() === '') {
      setError(t('enter email'));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());

      setSuccessMessage(`${t('link sent to')} ${email}`);

      setTimeout(() => {
        setSuccessMessage('');
        setView('auth-form');
      }, 2000);

    } catch (err) {
      console.error('Erreur Firebase:', err.code);

      if (err.code === 'auth/user-not-found') {
        setError(t('account not found'));
      } else {
        setError(t('check email'));
      }
    }
  };

  // --- LOGIQUE EMAIL (CONNEXION/INSCRIPTION) ---
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let userCredential;

      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(userCredential.user, {
          displayName: email.split('@')[0],
          photoURL:
            'https://api.dicebear.com/7.x/bottts/svg?seed=' +
            email.trim()
        });

      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      const firebaseUser = userCredential.user;
      const tempUid = firebaseUser.uid;

      // Sécurité : déconnexion immédiate avant la vérification OTP
      await signOut(auth);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            userId: tempUid
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t('otp sending error')
        );
      }

      setUserId(data.userId);
      setView('otp-verify');
      setSuccessMessage(t('verification code sent'));

    } catch (err) {
      console.error(err);

      if (err.code === 'auth/email-already-in-use') {
        setError(t('email already in use'));

      } else if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found'
      ) {
        setError(t('invalid email password'));

      } else if (err.code === 'auth/invalid-email') {
        setError(t('invalid email format'));

      } else if (err.code === 'auth/weak-password') {
        setError(t('weak password'));

      } else if (err.message) {
        setError(err.message);

      } else {
        setError(t('unexpected error'));
      }
    }
  };

  // --- VÉRIFICATION OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const rememberDevice =
        document.getElementById('rememberDevice')?.checked || false;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            code: otpCode.trim(),
            rememberDevice
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('invalid code'));
      }

      if (data.trustedToken) {
        localStorage.setItem(
          'ovortex_trusted_device',
          data.trustedToken
        );
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      onClose();

      if (onSuccess) onSuccess(user);

    } catch (err) {
      console.error(err);
      setError(err.message || t('code validation error'));
    }
  };

  return (
    <div className="auth-overlay notranslate" translate="no">
      <div className="auth-card">

        {view !== 'otp-verify' && (
          <button
            className="auth-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        )}

        <h2 className="auth-title">Ovortex</h2>

        {/* --- VUE 1 : MÉTHODES --- */}
        {view === 'methods' && (
          <div className="auth-methods">

            <button
              className="method-btn google"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="G"
              />
              {t('continue google')}
            </button>

            {isAppleEnabled && (
              <button
                className="method-btn dark"
                onClick={handleAppleLogin}
              >
                <i className="fab fa-apple"></i>
                {t('continue apple')}
              </button>
            )}

            <div className="auth-divider">
              {t('or')}
            </div>

            {error && (
              <p
                style={{
                  color: '#ff4d4d',
                  fontSize: '13px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}
              >
                {error}
              </p>
            )}

            <button
              className="method-btn dark"
              onClick={() => {
                setView('auth-form');
                setError('');
              }}
            >
              <i className="far fa-envelope"></i>
              {t('continue email')}
            </button>
          </div>
        )}

        {/* --- VUE 2 : FORMULAIRE --- */}
        {view === 'auth-form' && (
          <form
            onSubmit={handleEmailAuth}
            className="email-form"
          >

            <input
              type="email"
              placeholder={t('your email')}
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div
              style={{
                position: 'relative',
                width: '100%'
              }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  paddingRight: '40px'
                }}
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
                onClick={() => {
                  setView('forgot-password');
                  setError('');
                }}
                style={{
                  fontSize: '12px',
                  color: '#888',
                  cursor: 'pointer',
                  textAlign: 'right',
                  marginTop: '-5px',
                  marginBottom: '10px'
                }}
              >
                {t('forgot password')}
              </p>
            )}

            {error && (
              <p
                style={{
                  color: '#ff4d4d',
                  fontSize: '13px',
                  marginBottom: '10px',
                  textAlign: 'center',
                  fontWeight: '500'
                }}
              >
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-btn"
            >
              {isRegistering
                ? t('create my account')
                : t('login')}
            </button>

            <p className="switch-auth-mode">
              {isRegistering
                ? t('already have account')
                : t('new here')}

              <span
                style={{
                  color: '#a855f7',
                  cursor: 'pointer',
                  marginLeft: '5px'
                }}
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
              >
                {isRegistering
                  ? t('login')
                  : t('create account')}
              </span>
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                marginTop: '1px',
                marginBottom: '20px'
              }}
            >
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setView('methods');
                  setError('');
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                ← {t('back')}
              </button>
            </div>
          </form>
        )}

        {/* --- VUE 3 : MOT DE PASSE OUBLIÉ --- */}
        {view === 'forgot-password' && (
          <form
            onSubmit={handleForgotPassword}
            className="email-form"
          >

            <h3
              style={{
                fontSize: '16px',
                color: '#fff',
                marginBottom: '10px',
                textAlign: 'center'
              }}
            >
              {t('reset password')}
            </h3>

            <p
              style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {t('reset password description')}
            </p>

            <input
              type="email"
              placeholder={t('your email')}
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p
                style={{
                  color: '#ff4d4d',
                  fontSize: '13px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}
              >
                ⚠️ {error}
              </p>
            )}

            {successMessage && (
              <p
                style={{
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  fontSize: '13px',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  border:
                    '1px solid rgba(16, 185, 129, 0.2)',
                  fontWeight: '500'
                }}
              >
                ✅ {successMessage}
              </p>
            )}

            <button
              type="submit"
              className="submit-btn"
              style={{ marginTop: '10px' }}
            >
              {t('send link')}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setView('auth-form');
                setError('');
                setSuccessMessage('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                width: '100%',
                marginTop: '10px'
              }}
            >
              ← {t('back to login')}
            </button>
          </form>
        )}

        {/* --- VUE 4 : OTP --- */}
        {view === 'otp-verify' && (
          <form
            onSubmit={handleVerifyOtp}
            className="email-form"
          >

            <h3
              style={{
                fontSize: '16px',
                color: '#fff',
                marginBottom: '10px',
                textAlign: 'center'
              }}
            >
              {t('otp title')}
            </h3>

            <p
              style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {t('otp subtitle')}
            </p>

            <input
              type="text"
              maxLength="6"
              placeholder="123456"
              className="auth-input"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              style={{
                textAlign: 'center',
                letterSpacing: '4px',
                fontSize: '18px'
              }}
            />

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#ccc',
                margin: '15px 0 5px 0',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <input
                type="checkbox"
                id="rememberDevice"
                style={{
                  accentColor: '#a855f7',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />

              {t('remember device')}
            </label>

            {error && (
              <p
                style={{
                  color: '#ff4d4d',
                  fontSize: '13px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}
              >
                ⚠️ {error}
              </p>
            )}

            {successMessage && (
              <p
                style={{
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  fontSize: '13px',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  border:
                    '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                ✅ {successMessage}
              </p>
            )}

            <button
              type="submit"
              className="submit-btn"
              style={{ marginTop: '10px' }}
            >
              {t('validate code')}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={async () => {
                try {
                  await signOut(auth);
                } catch (err) {
                  console.error(
                    'Erreur déconnexion :',
                    err
                  );
                }

                setView('auth-form');
                setError('');
                setSuccessMessage('');
                setOtpCode('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                width: '100%',
                marginTop: '10px'
              }}
            >
              ← {t('back')}
            </button>
          </form>
        )}

        <p className="auth-legal">
          {t('by continuing you accept')}

          <span
            className="terms-link"
            onClick={onShowTerms}
            style={{
              cursor: 'pointer',
              color: '#a855f7'
            }}
          >
            {' '}
            {t('terms of use')}
          </span>

          {` ${t('and')} `}

          <span
            className="privacy-link"
            onClick={onShowPrivacy}
            style={{
              cursor: 'pointer',
              color: '#a855f7'
            }}
          >
            {t('privacy policy')}
          </span>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;