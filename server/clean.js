// clean.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json'); // Assure-toi que ce fichier existe

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function purgeLocks() {
    try {
        console.log("🧹 Recherche des verrous dans imageLocks...");
        const snapshot = await db.collection('imageLocks').get();
        
        if (snapshot.empty) {
            console.log("✅ Aucun verrou trouvé.");
            process.exit(0);
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            console.log("❌ Suppression du lock :", doc.id);
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("✅ Nettoyage Firestore terminé !");
    } catch (err) {
        console.error("💥 Erreur lors de la purge :", err.message);
    } finally {
        process.exit(0);
    }
}

purgeLocks();