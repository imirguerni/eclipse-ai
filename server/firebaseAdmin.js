const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

let credentials;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Si la variable d'environnement existe (sur Render)
    credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Sinon, on utilise le fichier local (sur ton PC)
    credentials = require('./serviceAccountKey.json');
}

if (!getApps().length) {
    initializeApp({
        credential: cert(credentials)
    });
}

console.log("🔥 Firebase projectId :", credentials.project_id);

const db = getFirestore();
const auth = getAuth();

module.exports = {
    db,
    auth
};