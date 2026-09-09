// server/security/ipBlacklist.js

const { db } = require('../firebaseAdmin');

const BLACKLIST_COLLECTION = 'ipBlacklist';

/**
 * Vérifie si une IP est blacklistée dans Firestore
 */
async function isIpBlacklisted(ip) {
    if (!ip) return false;

    try {
        const docId = ip.replace(/[:.]/g, '_');

        const docRef = db
            .collection(BLACKLIST_COLLECTION)
            .doc(docId);

        const doc = await docRef.get();

        if (!doc.exists) {
            return false;
        }

        const data = doc.data();

        // Ban temporaire expiré
        if (data.expiresAt) {
            let expirationDate;

            if (typeof data.expiresAt.toDate === 'function') {
                expirationDate = data.expiresAt.toDate();
            } else {
                expirationDate = new Date(data.expiresAt);
            }

            if (expirationDate < new Date()) {
                await docRef.delete();
                return false;
            }
        }

        return true;

    } catch (error) {
        console.error(
            "❌ Erreur lors de la vérification de la blacklist IP :",
            error
        );

        // On ne bloque pas tout le serveur si Firestore est temporairement indisponible
        return false;
    }
}

/**
 * Ajoute une IP à la blacklist Firestore
 */
async function blacklistIp(
    ip,
    reason = "Activité suspecte",
    durationInHours = null
) {
    if (!ip) return;

    try {
        const docId = ip.replace(/[:.]/g, '_');

        const docRef = db
            .collection(BLACKLIST_COLLECTION)
            .doc(docId);

        let expiresAt = null;

        if (
            typeof durationInHours === 'number' &&
            Number.isFinite(durationInHours) &&
            durationInHours > 0
        ) {
            expiresAt = new Date(
                Date.now() +
                durationInHours * 60 * 60 * 1000
            );
        }

        await docRef.set({
            ip,
            reason,
            blacklistedAt: new Date(),
            expiresAt
        });

        console.log(
            `🚨 IP ${ip} ajoutée à la blacklist Firestore. Raison : ${reason}`
        );

    } catch (error) {
        console.error(
            "❌ Erreur lors de l'ajout à la blacklist IP :",
            error
        );
    }
}

module.exports = {
    isIpBlacklisted,
    blacklistIp
};