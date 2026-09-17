import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "welcome": "Ovortex",
      "continue_google": "Continuer avec Google",
      "continue_email": "Continuer avec l'e-mail",
      "password": "Mot de passe",
      "login": "Se connecter",
      "register": "Créer un compte",
      "forgot_password": "Mot de passe oublié ?",
      "otp_title": "Double Authentification",
      "otp_subtitle": "Entrez le code à 6 chiffres reçu par e-mail.",
      "validate_code": "Valider le code",
      "remember_device": "Se souvenir de ce navigateur pendant 30 jours"
    }
  },
  en: {
    translation: {
      "welcome": "Ovortex",
      "continue_google": "Continue with Google",
      "continue_email": "Continue with Email",
      "password": "Password",
      "login": "Log in",
      "register": "Sign up",
      "forgot_password": "Forgot password?",
      "otp_title": "Two-Factor Authentication",
      "otp_subtitle": "Enter the 6-digit code received by email.",
      "validate_code": "Verify code",
      "remember_device": "Remember this device for 30 days"
    }
  }
};

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du pays/navigateur
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  });

export default i18n;