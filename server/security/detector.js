// server/security/detector.js
const { blacklistIp } = require('./ipBlacklist');
const { sendSecurityAlert } = require('./alerts');

// Compteur en mémoire pour suivre les alertes répétées (réinitialisé si le serveur redémarre, mais couplé à Firestore pour le ban)
const suspiciousAttempts = new Map();

async function detectSuspicious(req, reason) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log(`🚨 Tentative suspecte [${ip}] : ${reason}`);

    let count = suspiciousAttempts.get(ip) || 0;
    count++;
    suspiciousAttempts.set(ip, count);

    // Si l'utilisateur accumule 3 comportements suspects
    if (count >= 3) {
        await blacklistIp(ip, reason, 24); // Ban 24h dans Firestore
        await sendSecurityAlert(ip, reason, "IP bloquée pour 24h (Récidive)");
        suspiciousAttempts.delete(ip); // Nettoyage
    } else {
        // Simple alerte mail pour la première infraction si c'est critique
        await sendSecurityAlert(ip, reason, `Avertissement (${count}/3 avant ban)`);
    }
}

module.exports = { detectSuspicious };