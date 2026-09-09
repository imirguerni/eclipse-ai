// server/security/alerts.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Ajout de 'userEmail' et 'userId' dans les paramètres
async function sendSecurityAlert(ip, reason, actionTaken, userEmail = "Inconnu", userId = "Inconnu") {
    if (!process.env.EMAIL_USER || !process.env.ALERT_ADMIN_EMAIL) {
        console.warn("⚠️ Configuration email manquante, alerte non envoyée.");
        return;
    }

    const mailOptions = {
        from: `"Eclipse IA Sécurité" <${process.env.EMAIL_USER}>`,
        to: process.env.ALERT_ADMIN_EMAIL,
        subject: `🚨 Eclipse IA - Alerte Sécurité : ${reason}`,
        text: `Tentative suspecte détectée sur Eclipse IA.
        
- E-mail utilisateur : ${userEmail}
- ID utilisateur : ${userId}
- IP suspecte : ${ip}
- Motif : ${reason}
- Action entreprise : ${actionTaken}
- Date : ${new Date().toLocaleString()}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Alerte email envoyée pour l'IP : ${ip} (Utilisateur: ${userEmail})`);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'alerte email :", error);
    }
}

module.exports = { sendSecurityAlert };