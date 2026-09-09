const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require('./serviceAccountKey.json');

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

// 🔎 Ligne à ajouter pour vérifier l'ID du projet chargé par le SDK Admin
console.log("🔥 Firebase projectId :", serviceAccount.project_id);

const db = getFirestore();
const auth = getAuth();

module.exports = {
    db,
    auth
};