import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence // 👈 Bien importé ici
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
// ===============================
// CONFIGURATION FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBgdary3h6llCwW1rd1Qc6P9AClKzz0DAU",
  authDomain: "eclipse-ai-96f30.firebaseapp.com",
  projectId: "eclipse-ai-96f30",
  storageBucket: "eclipse-ai-96f30.firebasestorage.app",
  messagingSenderId: "1064499561306",
  appId: "1:1064499561306:web:3f7e17a5423de6461c2963",
  measurementId: "G-03YYS4ME40"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// 💾 Applique la persistance locale pour éviter la déconnexion au F5
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Erreur de configuration de la persistance :", error);
});

window.auth = auth;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export const db = getFirestore(app);

// ===============================
// NOUVEAU : SOUSCRIPTION TEMPS RÉEL
// ===============================
/**
 * Permet de suivre les changements de crédits en temps réel.
 * @param {string} uid - ID de l'utilisateur
 * @param {function} callback - Fonction qui reçoit les nouvelles données
 * @returns {function} - Fonction de désabonnement (à appeler dans le return du useEffect)
 */
export const subscribeToUserCredits = (uid, callback) => {
  if (!uid) return () => {};
  const userRef = doc(db, "users", uid);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// ===============================
// CREATION / RECUPERATION PROFIL (INCHANGÉ)
// ===============================
export const createUserProfile = async (user) => {
  console.log("🔥 createUserProfile appelé :", user?.email);
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Utilisateur",
        photoURL: user.photoURL || "",
        userPlan: "discovery",
        tokens: 0,
        packTokens: 0,
        tokensResetDate: Timestamp.now(),
        createdAt: Timestamp.now()
      };
      await setDoc(userRef, userData);
      return userData;
    } 
    const data = userSnap.data();
    if (!data.tokensResetDate) {
      await updateDoc(userRef, { tokensResetDate: Timestamp.now() });
      data.tokensResetDate = Timestamp.now();
    }
    return data;
  } catch(e) {
    console.error("❌ Erreur profil Firebase :", e);
    return null;
  }
};

// ===============================
// SYNCHRONISATION CREDITS (INCHANGÉ)
// ===============================
export const syncCreditsToDB = async (uid, newEclairs, newDiamonds, resetDate = true) => {
  if (!uid) return;
  try {
    const userRef = doc(db, "users", uid);
    const updateData = { tokens: newEclairs, packTokens: newDiamonds };
    if(resetDate) updateData.tokensResetDate = Timestamp.now();
    await updateDoc(userRef, updateData);
    console.log("✅ Firestore crédits synchronisés");
  } catch(e) {
    console.error("❌ Erreur sync crédits :", e);
  }
};