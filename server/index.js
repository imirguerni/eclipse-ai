require('dotenv').config();
console.log(
    "ðŸ”‘ RUNWARE_API_KEY :",
    process.env.RUNWARE_API_KEY ? "PRÃ‰SENTE" : "ABSENTE"
);
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { fal } = require("@fal-ai/client");

// ============================================================
// RUNWARE
// ============================================================

let runwareClient = null;

async function loadRunwareSDK() {
    try {
        // Chargement dynamique du SDK Runware
        const sdk = await import("@runware/sdk");

        if (typeof sdk.createClient === "function") {
            return sdk.createClient;
        }

        if (typeof sdk.default?.createClient === "function") {
            return sdk.default.createClient;
        }

        throw new Error("createClient introuvable dans @runware/sdk");

    } catch (error) {
        console.error("âŒ Impossible de charger @runware/sdk :", error);
        throw error;
    }
}

async function getRunwareClient() {
    if (!runwareClient) {
        const createClient = await loadRunwareSDK();

        runwareClient = await createClient({
            apiKey: process.env.RUNWARE_API_KEY,
            transport: "websocket"
        });

        await runwareClient.connect();

        console.log("âœ… Runware connectÃ©");
    }

    return runwareClient;
}


const rateLimit = require("express-rate-limit");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const helmet = require('helmet');
const hpp = require('hpp');
const { db, auth } = require('./firebaseAdmin');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const { spawn } = require('child_process');

console.log("âœ… Firebase Admin initialisÃ© avec succÃ¨s");
// En haut de votre fichier principal (ex: server/index.js)
const { isIpBlacklisted, blacklistIp } = require('./security/ipBlacklist');
const { detectSuspicious } = require('./security/detector');
const Groq = require("groq-sdk");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

if (!ffmpegPath) {
    throw new Error("FFmpeg introuvable via ffmpeg-static.");
}

ffmpeg.setFfmpegPath(ffmpegPath);

console.log("ðŸ› ï¸ FFMPEG configurÃ© :", ffmpegPath);
/*
============================================================
ANCIEN SYSTÃˆME GOOGLE VEO / VERTEX AI
CONSERVÃ‰ POUR RETOUR EN ARRIÃˆRE
============================================================

const isGoogleVideo = engineId.startsWith("veo3"); 
*/

const cron = require('node-cron');
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const nodemailer = require('nodemailer');
const multer = require('multer');


const { PRICING_DATA, PLAN_TO_PRICE, packs, ALLOWED_ENGINES } = require('./pricingConfig');
// --- INITIALISATION RECAPTCHA ---
const recaptchaClient = new RecaptchaEnterpriseServiceClient();
const admin = require('firebase-admin');

async function verifyRecaptcha(token) {
    if (!token || typeof token !== "string") {
        console.warn("âš ï¸ Aucun token reCAPTCHA reÃ§u.");
        return false;
    }

    try {
        const projectPath = recaptchaClient.projectPath('eclipse-ai-96f30');

        const request = {
            parent: projectPath,
            assessment: {
                event: {
                    token: token,
                    siteKey: '6LdYEaItAAAAALoBXNIY3bjruS-UiAla3Ns2M1sq',
                },
            },
        };

        const [response] = await recaptchaClient.createAssessment(request);
        console.log('Diagnostic reCAPTCHA :', { valid: response.tokenProperties?.valid, invalidReason: response.tokenProperties?.invalidReason, hostname: response.tokenProperties?.hostname, action: response.tokenProperties?.action, score: response.riskAnalysis?.score });

        const tokenProperties = response.tokenProperties;

        if (!tokenProperties?.valid) {
            const invalidReason = tokenProperties?.invalidReason;

            console.warn(
                `âš ï¸ Jeton reCAPTCHA invalide : ${invalidReason || "RAISON_INCONNUE"}`
            );

            // BROWSER_ERROR = problÃ¨me temporaire cÃ´tÃ© navigateur/rÃ©seau.
            // Ce n'est PAS une preuve que l'utilisateur est un bot.
            if (invalidReason === "BROWSER_ERROR") {
                console.warn(
                    "ðŸ”„ BROWSER_ERROR reCAPTCHA : nouveau token nÃ©cessaire cÃ´tÃ© navigateur."
                );

                return "retry";
            }

            // Les autres tokens rÃ©ellement invalides restent bloquÃ©s.
            return false;
        }

        const score = Number(response.riskAnalysis?.score ?? 0);

        console.log(`ðŸ›¡ï¸ Score reCAPTCHA reÃ§u : ${score}`);

        return score >= 0.5;

    } catch (error) {
        console.error(
            "âŒ Erreur technique reCAPTCHA :",
            error.message
        );

        // On conserve ton comportement actuel en cas de panne
        // technique de l'API Google.
        return true;
    }
}

// ðŸ›¡ï¸ MIDDLEWARE D'AUTHENTIFICATION :
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(
    "ðŸ” Header Authorization reÃ§u :",
    authHeader ? "Bearer prÃ©sent âœ…" : "Absent âŒ"
);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "AccÃ¨s refusÃ© : Token manquant." });
    }

const token = authHeader.substring(7).trim();
    try {
        // On utilise getAuth() ici au lieu de admin.auth()
const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken; // Contient .uid et les infos du user
        next();
   } catch (error) {
        console.error("=================================");
        console.error("âŒ FIREBASE AUTH ERROR");
        console.error("CODE :", error.code);
        console.error("MESSAGE :", error.message);
        console.error("=================================");

        return res.status(401).json({
            error: "AccÃ¨s refusÃ© : Token invalide ou expirÃ©."

        });
    }
};

// ðŸ”„ VÃ‰RIFICATION DES GÃ‰NÃ‰RATIONS EN COURS
async function recoverInterruptedGenerations() {

    console.log("ðŸ”Ž VÃ©rification des gÃ©nÃ©rations en cours...");

    const locks = await db.collection('imageLocks')
        .where("status", "==", "processing")
        .get();

    console.log("ðŸ”’ Nombre de locks trouvÃ©s :", locks.size);

    for (const doc of locks.docs) {

        const data = doc.data();

        console.log("LOCK TROUVE :", data);

        if (data.provider === "fal") {

            console.log(
                "â³ GÃ©nÃ©ration Fal toujours considÃ©rÃ©e active :",
                data.userId
            );
            // Pas de remboursement ici.
            // Fal peut encore Ãªtre en train de gÃ©nÃ©rer.
            continue;
        }
        // Pour les autres fournisseurs Ã©ventuellement
        // on ne rembourse pas automatiquement non plus.
        console.log(
            "âš ï¸ Lock inconnu conservÃ© :",
            data.userId
        );
    }
}



// --- CONFIGURATION EXPRESS & MIDDLEWARES ---
const SECURITY_TEST_MODE = process.env.SECURITY_TEST_MODE === 'true';
const app = express();
app.set('trust proxy', 1);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. HELMET ET CORS (S'appliquent Ã  tout)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false
}));

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://www.ovortex.com',
    'https://ovortex.com'
];

app.use(cors({
    origin: function (origin, callback) {

        // Autorise les requÃªtes sans Origin
        // (certains outils, tests serveur, etc.)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('ðŸš« CORS bloquÃ© pour :', origin);
        return callback(new Error('Origin non autorisÃ©e par CORS'));
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));



// 2. RATE LIMITER (Protection contre le spam et les attaques par force brute)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP Ã  100 requÃªtes par fenÃªtre sur l'API
    message: "Trop de requÃªtes depuis cette IP, rÃ©essayez plus tard."
});

app.use('/api/', limiter);

// 2. ROUTE WEBHOOK STRIPE (OBLIGATOIREMENT AVANT express.json global !)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log("ðŸ”¥ REQUÃŠTE WEBHOOK REÃ‡UE !"); 
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Assure-toi d'avoir cette clÃ© dans ton .env !
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("âŒ Erreur Webhook dÃ©taillÃ©e :", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (!session.metadata || !session.metadata.userId) {
            console.error("âš ï¸ Webhook ignorÃ© : userId absent");
            return res.status(400).send("Metadata manquantes");
        }
        
        const { userId, type, amount_to_add, planId } = session.metadata;

        try {
            const userRef = db.collection('users').doc(userId);
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.exists ? userDoc.data() : {};

                if (userData.processedSessions?.includes(session.id)) return;

                const now = new Date();
                let updateData = {
                    email: session.customer_details?.email || "",
                    lastPurchaseAt: FieldValue.serverTimestamp(),
                    processedSessions: FieldValue.arrayUnion(session.id),
                };

                if (type === 'diamonds') {
                    let currentTokens = userData.packTokens || 0;
                    if (userData.packExpiryDate && now > userData.packExpiryDate.toDate()) currentTokens = 0;

                    const amountToAdd = parseInt(amount_to_add);
                    updateData.packTokens = currentTokens + amountToAdd;
                    updateData.packExpiryDate = Timestamp.fromDate(new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)));
                    
                    updateData.purchaseHistory = FieldValue.arrayUnion({
                        id: session.id,
                        amount: amountToAdd,
                        price: session.amount_total / 100,
                        date: Timestamp.now()
                    });
                }
if (type === 'subscription') {
    const creditsByPlan = { essentiel: 3000, standard: 7000, master: 12000, elite: 25000, legende: 80000 };
    const baseCredits = creditsByPlan[planId.toLowerCase()] || 0;
    
    // On rÃ©cupÃ¨re l'intervalle envoyÃ© depuis le front (ex: 'year' ou 'month')
const intervalRaw = session.metadata.interval || 'monthly';

const interval = intervalRaw.toLowerCase();

const isYearly = [
    "year",
    "yearly",
    "annual",
    "annuel",
    "annually"
].includes(interval);

const tokensToAdd = isYearly 
    ? baseCredits * 12 
    : baseCredits;

const daysToReset = isYearly ? 365 : 30;
    const resetDate = new Date(now.getTime() + (daysToReset * 24 * 60 * 60 * 1000));
    
    updateData.tokens = tokensToAdd;
    updateData.tokensResetDate = Timestamp.fromDate(resetDate); 
    updateData.userPlan = planId.toLowerCase();
    updateData.subscriptionStatus = 'active';
    updateData.stripeSubscriptionId = session.subscription;
    updateData.lastSubscriptionAt = FieldValue.serverTimestamp();
    updateData.subscriptionInterval = interval; // Optionnel : pour garder l'info en base
}

                transaction.set(userRef, updateData, { merge: true });
                const transactionRef = userRef.collection('transactions').doc();
                transaction.set(transactionRef, {
                    session_id: session.id,
                    amount_total: session.amount_total / 100,
                    currency: session.currency,
                    type: type,
                    planId: planId || null,
                    amount_added: amount_to_add || 0,
                    date: Timestamp.now()
                });
            });

            console.log(`âœ… Livraison sÃ©curisÃ©e pour ${userId}`);

        } catch (error) {
            console.error(`âŒ Erreur Webhook Firestore:`, error);
            return res.status(500).json({ error: "Erreur base de donnÃ©es" });
        }
    }    

// ==============================================================================
    // GESTION EXPLICITE DES MISES Ã€ JOUR ET RÃ‰SILIATIONS D'ABONNEMENT (CORRIGÃ‰)
    // ==============================================================================

// GÃ¨re le changement d'Ã©tat (ex: annulation planifiÃ©e, Ã©chec de paiement, rÃ©activation)
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object; 
        const userId = subscription.metadata.userId; 

        if (!userId) {
            console.error("âš ï¸ Webhook abonnement ignorÃ© : userId absent des mÃ©tadonnÃ©es");
            // On ne renvoie pas 400 pour deleted car l'user a pu Ãªtre supprimÃ© entre temps
            if (event.type !== 'customer.subscription.deleted') {
                return res.status(400).send("Metadata manquantes dans l'abonnement");
            }
        } else {
            try {
                console.log(`ðŸ”„ Traitement de l'abonnement pour ${userId} - Statut : ${subscription.status}, Annulation fin pÃ©riode : ${subscription.cancel_at_period_end}`);
                
                const userRef = db.collection('users').doc(userId);

                await db.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    
                    if (!userDoc.exists) {
                        throw new Error(`Utilisateur ${userId} introuvable pour la mise Ã  jour de l'abonnement.`);
                    }

                    // 1. DÃ‰TERMINATION DU STATUT DE PAIEMENT
                    let newStatus = subscription.status;

                    // Cas : L'utilisateur a demandÃ© une rÃ©siliation, mais la pÃ©riode payÃ©e n'est pas finie
                    // C'est 'canceling'. On arrÃªte les recharges automatiques, mais on garde l'accÃ¨s.
                    if (subscription.cancel_at_period_end === true && subscription.status === 'active') {
                        newStatus = 'canceling'; 
                    }

                    // 2. GESTION CRITIQUE DE L'ACCÃˆS (userPlan)
                    // On ne downgrade l'utilisateur QUE si l'abonnement est COMPLÃ‰TEMENT TERMINÃ‰ (expired ou canceled)
                    
                    let userDocData = userDoc.data();
                    let finalUserPlan = userDocData.userPlan; // Par dÃ©faut, on garde le plan actuel

                    // Objet pour stocker les champs Ã  mettre Ã  jour dans Firestore
                    let updateFields = {
                        subscriptionStatus: newStatus, // Sera 'active', 'canceling' ou 'canceled'
                        userPlan: finalUserPlan // CONSERVÃ‰ JUSQU'Ã€ LA FIN DE LA PÃ‰RIODE PAYÃ‰E, PUIS DOWNGRADÃ‰
                    };

                    // Si l'abonnement est complÃ©tement terminÃ©
                    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                        console.log(`ðŸ”» L'abonnement de ${userId} est TERMINÃ‰. Downgrade vers 'dÃ©butant'.`);
                        updateFields.userPlan = 'dÃ©butant';
                        updateFields.tokens = 0;
                        updateFields.tokensResetDate = null;
                    } 
                    // Si l'annulation est planifiÃ©e Ã  la fin de la pÃ©riode, on conserve/met Ã  jour la vraie date de fin Stripe
                    else if (subscription.cancel_at_period_end === true) {
                        const periodEndTimestamp = subscription.current_period_end * 1000;
                        updateFields.tokensResetDate = Timestamp.fromDate(new Date(periodEndTimestamp));
                        console.log(`ðŸ“… Annulation planifiÃ©e : tokensResetDate fixÃ© au ${new Date(periodEndTimestamp).toISOString()}`);
                    }

                    // 3. MISE Ã€ JOUR FIRESTORE
                    console.log(`ðŸ’¾ Mise Ã  jour Firestore ${userId} : Plan=${updateFields.userPlan}, StatutPaiement=${newStatus}`);
                    
                    transaction.update(userRef, updateFields);
                });
                console.log(`âœ… Mise Ã  jour de l'abonnement traitÃ©e avec succÃ¨s pour ${userId}.`);

            } catch (error) {
                console.error(`âŒ Erreur lors du traitement de l'abonnement Webhook:`, error);
                return res.status(500).json({ error: "Erreur base de donnÃ©es lors de la mise Ã  jour de l'abonnement" });
            }
        }
    }

});

// 2. MIDDLEWARES GLOBAUX POUR TOUTES LES AUTRES ROUTES
app.use(express.json({ limit: '50mb' }));
app.use(hpp());
// ==========================================
// ðŸ“ CONFIGURATION DE MULTER ET ROUTE D'UPLOAD
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Rendre le dossier "uploads" accessible publiquement
app.use('/uploads', express.static(uploadDir));

// Route d'upload pour recevoir les vidÃ©os/images du front-end
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier reÃ§u." });
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        console.log(`ðŸ“ Fichier uploadÃ© avec succÃ¨s : ${fileUrl}`);
        return res.json({ url: fileUrl });

    } catch (error) {
        console.error("âŒ Erreur lors de l'upload :", error);
        return res.status(500).json({ error: "Erreur serveur lors de l'upload." });
    }
});
// ==========================================
// CONVERSION VIDÃ‰O WEBM â†’ MP4 H.264
// ==========================================

app.post('/api/convert-video', async (req, res) => {
    console.log('ðŸš¨ ROUTE CONVERT-VIDEO APPELÃ‰E');
console.log('ðŸ“¦ BODY REÃ‡U :', req.body);
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "Aucune URL vidÃ©o reÃ§ue."
            });
        }

        console.log("ðŸŽ¬ Demande de conversion vidÃ©o :", url);

        const fileName = path.basename(new URL(url).pathname);
        const inputPath = path.join(uploadDir, fileName);

        if (!fs.existsSync(inputPath)) {
            console.error("âŒ Fichier source introuvable :", inputPath);

            return res.status(404).json({
                error: "Fichier vidÃ©o source introuvable."
            });
        }

        const baseName = path.parse(fileName).name;
        const outputFileName = `${baseName}-mp4-${Date.now()}.mp4`;
        const outputPath = path.join(uploadDir, outputFileName);

        console.log("ðŸ“¥ Source :", inputPath);
        console.log("ðŸ“¤ Destination :", outputPath);

        const ffmpeg = spawn(ffmpegPath, [
            '-y',
            '-i', inputPath,

            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '20',
            '-pix_fmt', 'yuv420p',

            '-c:a', 'aac',
            '-b:a', '128k',

            '-movflags', '+faststart',

            outputPath
        ]);

        let stderr = '';

        ffmpeg.stderr.on('data', (data) => {
            const message = data.toString();
            stderr += message;

            if (
                message.includes('frame=') ||
                message.includes('time=') ||
                message.includes('speed=')
            ) {
                process.stdout.write(`ðŸŽžï¸ ${message}`);
            }
        });

        ffmpeg.on('error', (error) => {
            console.error("âŒ Impossible de lancer FFmpeg :", error);

            return res.status(500).json({
                error: "Impossible de lancer FFmpeg."
            });
        });

        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                console.error("âŒ FFmpeg a Ã©chouÃ©. Code :", code);
                console.error(stderr);

                return res.status(500).json({
                    error: "La conversion MP4 a Ã©chouÃ©."
                });
            }

            if (!fs.existsSync(outputPath)) {
                console.error("âŒ Le fichier MP4 n'a pas Ã©tÃ© crÃ©Ã©.");

                return res.status(500).json({
                    error: "Le fichier MP4 n'a pas Ã©tÃ© crÃ©Ã©."
                });
            }

            const protocol = req.protocol;
            const host = req.get('host');

            const fileUrl =
                `${protocol}://${host}/uploads/${outputFileName}`;

            console.log("âœ… Conversion MP4 terminÃ©e :", fileUrl);

            return res.json({
                url: fileUrl,
                fileName: outputFileName,
                type: 'VIDEO',
                mimeType: 'video/mp4'
            });
        });

    } catch (error) {
        console.error("âŒ Erreur conversion vidÃ©o :", error);

        return res.status(500).json({
            error: "Erreur serveur lors de la conversion vidÃ©o."
        });
    }
});
/*
// ==========================================

// --- SDK IA ---
const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID || 'eclipse-ai-96f30',
    location: 'us-central1'
});
*/

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
fal.config({ apiKey: process.env.FAL_KEY });
console.log("--- CONFIGURATION SDK VALIDÃ‰E ---");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// --- ROUTES ---
app.post('/test-simulate-video', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // ðŸ’¡ Ajout recommandÃ© pour forcer l'envoi immÃ©diat des en-tÃªtes

    let percent = 0;
    const interval = setInterval(() => {
        percent += 20;
        
        // SÃ©curitÃ© : on vÃ©rifie que la connexion est toujours ouverte avant d'Ã©crire
        if (res.writableEnded) {
            clearInterval(interval);
            return;
        }

        if (percent <= 100) {
            res.write(`data: ${JSON.stringify({ 
                percent: percent, 
                message: percent < 100 ? "GÃ©nÃ©ration en cours..." : "GÃ©nÃ©ration terminÃ©e !" 
            })}\n\n`);
        } else {
            clearInterval(interval);
            res.write(`data: ${JSON.stringify({ 
                videoUrl: "http://localhost:5000/videos/ton-fichier-existant.mp4", 
                percent: 100 
            })}\n\n`);
            res.end();
        }
    }, 1000);

    // ðŸ›‘ SÃ‰CURITÃ‰ ABSOLUE : Si le client coupe la connexion en plein milieu
    req.on('close', () => {
        console.log("âš ï¸ Simulation : Le client s'est dÃ©connectÃ©. ArrÃªt de la boucle.");
        clearInterval(interval);
    });
});
// --- ROUTE WEBHOOK (IMPÃ‰RATIF : AVANT express.json) ---
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_xxxxxxxxxxxx"; 

// --- CONFIGURATION DES ABONNEMENTS ---
const CREDITS_PER_MONTH = {
    essentiel: 3000,
    standard: 7000,
    master: 12000,
    elite: 25000,
    legende: 80000
};
const STRIPE_PRICE_IDS = {
 // --- PLAN ESSENTIEL ---
    // Mensuel : 12,99â‚¬ / mois
    // Annuel : 124,99â‚¬ / an
    essentiel: {
        monthly: 'price_1UDmA0RupJs1FxZmYmxjcSQJ', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZm6hmEmeKM' // ex: price_1TPm... (Ã  copier dans Stripe)
    },

   // --- PLAN STANDARD ---
    // Mensuel : 24,99â‚¬ / mois
    // Annuel : 239,99â‚¬ / an
    standard: {
        monthly: 'price_1UDmA1RupJs1FxZmX0FFHIWU', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZm6xVFUg4C'
    },

   // --- PLAN MASTER ---
    // Mensuel : 34,99â‚¬ / mois
    // Annuel : 335,99â‚¬ / an
    master: {
        monthly: 'price_1UDmA0RupJs1FxZmvpmAORIc', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZmvpmAORIc'
    },

  // --- PLAN ELITE ---
    // Mensuel : 59,99â‚¬ / mois
    // Annuel : 575,99â‚¬ / an
    elite: {
        monthly: 'price_1UDmA2RupJs1FxZmu8pbvOpZ', // Ton ID mensuel existant
        yearly: 'price_1UDmA1RupJs1FxZm5kGQt37H'
    },

   // --- PLAN LÃ‰GENDE ---
    // Mensuel : 159,99â‚¬ / mois
    // Annuel : 1535,99â‚¬ / an
    legende: {
        monthly: 'price_1UDmA0RupJs1FxZmVAKQBgwL', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZm0XFxv2qa'
    }
};

// --- ROUTES STRIPE & DIAGNOSTIC ---
/*
============================================================
ANCIEN TEST GOOGLE VEO
CONSERVÃ‰ POUR RETOUR EN ARRIÃˆRE
============================================================

app.get('/ping-veo', async (req, res) => {
    try {
        const modelName = 'veo-3.1-generate-preview';
        const operation = await ai.models.generateVideos({
            model: modelName,
            prompt: "A beautiful cinematic landscape, high quality, 8k", 
        });
        res.json({ status: "ConnectÃ©", operationName: operation.name });
    } catch (error) {
        res.status(500).json({ 
            error: "Ã‰chec de connexion au modÃ¨le", 
            message: error.message 
        });
    }
});

============================================================
FIN ANCIEN TEST GOOGLE VEO
============================================================
*/

app.post('/create-checkout-session', limiter, authenticateUser, async (req, res) => {
    try {
        const { amount, plan } = req.body;
        
        // ðŸ”’ SOURCE DE VÃ‰RITÃ‰ ABSOLUE : On rÃ©cupÃ¨re l'ID du token Firebase, plus du req.body !
        const userId = req.user.uid;

        if (amount === undefined || typeof amount !== 'number') {
            return res.status(400).json({ error: "DonnÃ©es invalides" });
        }

        const isSubscriber = plan && !['debutant', 'discovery', '0.00'].includes(plan.toLowerCase());
        let totalPrice;
        if (amount >= 6000) totalPrice = isSubscriber ? 99.99 : 149.99;
        else if (amount >= 3000) totalPrice = isSubscriber ? 54.99 : 89.99;
        else if (amount >= 1500) totalPrice = isSubscriber ? 29.99 : 49.99;
        else if (amount >= 6000)  totalPrice = isSubscriber ? 12.99 : 24.99;
        else if (amount >= 3000)  totalPrice = isSubscriber ? 7.99 : 14.99;
        else                     totalPrice = isSubscriber ? 2.99 : 5.99;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: { name: `Pack de ${amount} Diamants` },
                    unit_amount: Math.round(totalPrice * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/pricing`,
            metadata: { type: 'diamonds', amount_to_add: amount.toString(), userId: userId }
        });
        res.json({ url: session.url });
    } catch (e) {
        console.error("âŒ Erreur /create-checkout-session :", e.message);
        res.status(500).json({ error: "Erreur lors de la crÃ©ation de session" });
    }
});

app.post('/create-subscription-session', limiter, authenticateUser, async (req, res) => {
        try {
        // RÃ©cupÃ©ration des donnÃ©es envoyÃ©es par le Front-end
      // RÃ©cupÃ©ration des donnÃ©es envoyÃ©es par le Front-end (le userId vient de l'authentification serveur)
      const { planId, interval = 'monthly', userId: bodyUserId } = req.body;
        const userId = req.user?.uid || bodyUserId;

        // VÃ©rification de sÃ©curitÃ© : les donnÃ©es obligatoires sont-elles lÃ  ?
        if (!planId) return res.status(400).json({ error: "DonnÃ©es manquantes (planId)" });
        // 1. Normalisation du nom du plan (retrait des accents et minuscules)
        // Ex: "LÃ©gende" -> "legende"
        const cleanPlanId = planId.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 2. RÃ©cupÃ©ration de la configuration dans VOTRE NOUVEL OBJET "STRIPE_PRICE_IDS"
        // On cherche d'abord avec le nom normalisÃ© (ex: 'legende'), sinon avec l'original (ex: 'legende' au cas oÃ¹)
        const planPrices = STRIPE_PRICE_IDS[cleanPlanId] || STRIPE_PRICE_IDS[planId.toLowerCase()];

        let stripePriceId;

        // 3. DÃ©termination de l'ID de prix Stripe (mensuel ou annuel)
        if (planPrices) {
            // Si le plan existe, on choisit 'yearly' ou 'monthly' (par dÃ©faut)
            stripePriceId = planPrices[interval] || planPrices['monthly'];
        }
        // Si planPrices est undefined, stripePriceId restera undefined

        // VÃ©rification de sÃ©curitÃ© : avons-nous trouvÃ© un prix valide ?
        if (!stripePriceId) {
            console.error(`âŒ [ROUTER] Prix Stripe introuvable pour : planId="${planId}" (nettoyÃ©: "${cleanPlanId}"), interval="${interval}"`);
            return res.status(400).json({ error: "Ce plan d'abonnement ou cet intervalle n'est pas configurÃ©." });
        }

        // 4. CrÃ©ation de la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: stripePriceId, quantity: 1 }],
            mode: 'subscription', // Mode OBLIGATOIRE pour les abonnements
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/pricing`, // Redirection si l'utilisateur annule
            
            // IMPORTANT : Ces mÃ©tadonnÃ©es sont envoyÃ©es Ã  votre Webhook pour livrer les tokens
            metadata: { 
                type: 'subscription', 
                planId: cleanPlanId, // On envoie le nom propre du plan (ex: 'essentiel')
                userId: userId,
                interval: interval // Info utile pour le suivi
            },
            
            // Configuration de l'abonnement dans Stripe
            subscription_data: {
                metadata: { 
                    type: 'subscription', 
                    planId: cleanPlanId, 
                    userId: userId,
                    interval: interval
                },
                // Permet le prorata lors d'un changement de plan via le portail client
            }
        });

        // 5. Renvoi de l'URL de paiement au Front-end
        res.json({ url: session.url });

    } catch (e) {
        // Gestion des erreurs critiques
        console.error("âŒ [ROUTER] Erreur critique lors de la crÃ©ation de la session d'abonnement :", e);
        res.status(500).json({ error: "Une erreur est survenue lors de la communication avec le service de paiement." });
    }
})

;app.get('/verify-payment', limiter, authenticateUser, async (req, res) => {
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: "ID invalide" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        // ðŸ”’ SÃ‰CURITÃ‰ : VÃ©rifier que la session Stripe appartient bien Ã  l'utilisateur connectÃ©
        if (session.metadata?.userId && session.metadata.userId !== req.user.uid) {
            console.warn(`ðŸ›‘ Tentative d'usurpation de paiement ! L'utilisateur ${req.user.uid} tente d'utiliser la session de ${session.metadata.userId}`);
            return res.status(403).json({ error: "Cette transaction ne vous appartient pas." });
        }

        if (session.payment_status === 'paid') {
            res.json({ 
                success: true, 
                mode: session.mode 
            });
        } else {
            res.status(403).json({ success: false, error: "Non payÃ©" });
        }
    } catch (e) {
        console.error("âŒ Erreur /verify-payment :", e.message);
        res.status(500).json({ error: "Erreur synchronisation" });
    }
});

// --- ROUTE DE REMBOURSEMENT INTERNE ---

app.post('/refund', limiter, async (req, res) => {
    // ðŸ”’ 1. VÃ©rification de la clÃ© secrÃ¨te interne (le front-end ne l'a pas, seul le serveur la connaÃ®t)
    const internalKey = req.headers['x-internal-key'];
    if (!internalKey || internalKey !== process.env.INTERNAL_REFUND_KEY) {
        console.warn("âš ï¸ Tentative d'accÃ¨s non autorisÃ© Ã  la route /refund bloquÃ©e.");
        return res.status(403).json({ error: "AccÃ¨s strictement interdit." });
    }

    const { userId, cost, costType } = req.body;

    if (!userId || !cost || !costType) {
        return res.status(400).json({ error: "ParamÃ¨tres de remboursement manquants." });
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const fieldToIncrement = costType === "diamonds" ? "packTokens" : "tokens";

        await userRef.update({
            [fieldToIncrement]: FieldValue.increment(parseInt(cost))
        });

        console.log(`ðŸ’° [Remboursement] ${cost} ${costType} recrÃ©ditÃ©s Ã  l'utilisateur ${userId}`);
        return res.json({ success: true, message: "Remboursement effectuÃ© avec succÃ¨s." });
    } catch (error) {
        console.error("âŒ Ã‰chec lors du remboursement sur le serveur :", error.message);
        return res.status(500).json({ error: "Erreur interne lors du remboursement." });
    }
});

// --- GENERATION INTELLIGENCE (GROQ) ---// --- GENERATION INTELLIGENCE (GROQ) ---
app.post('/intelligence', limiter, authenticateUser, async (req, res) => {
    let prompt = "";
    try {
        prompt = req.body.prompt;
        if (!prompt) return res.status(400).json({ error: "Le prompt est vide" });

        const chatCompletion = await groq.chat.completions.create({
        messages: [
    { role: "system", content: "Tu es un expert en prompt engineering. AmÃ©liore le prompt de l'utilisateur pour qu'il soit plus dÃ©taillÃ© et artistique. Donne UNIQUEMENT le prompt amÃ©liorÃ©, sans introduction ni guillemets." },
    { role: "user", content: prompt }

            ],
            model: "openai/gpt-oss-120b", // ðŸ‘ˆ Testez celui-ci ou le GPT-OSS 120B de votre console
            max_tokens: 150,
        });

        const result = chatCompletion.choices[0]?.message?.content || prompt;
        res.json({ result: result.trim() });
    } catch (error) {
        console.error("Erreur Groq:", error);
        const fallbackPrompt = prompt ? prompt + ", masterpiece, highly detailed, 8k, cinematic lighting" : "masterpiece, highly detailed";
        res.json({ result: fallbackPrompt });
    }
});
// --- GENERATION IMAGE ---
app.post('/generate-image', limiter, authenticateUser, async (req, res) => {
    
const { 
    prompt, 
    width,
    height,
    engineId,
    cost,
    costType,
    aspect_ratio,
    resolution,
    seed,
    referenceImages,
    referenceVideos,
    outputFormat,
    outputQuality,
    providerSettings,
    settings,
    recaptchaToken,
    startImage,
    start_image_url,
    image_url,
    uploadedImage
} = req.body;

// ðŸ–¼ï¸ On accepte les diffÃ©rents noms utilisÃ©s par le frontend
const referenceImage =
    startImage ||
    start_image_url ||
    image_url ||
    uploadedImage ||
    null;

console.log(
    referenceImage
        ? "ðŸ–¼ï¸ Image de rÃ©fÃ©rence reÃ§ue par le serveur"
        : "â„¹ï¸ Aucune image de rÃ©fÃ©rence"
);
// ðŸ”’ Source de vÃ©ritÃ© absolue (impossible Ã  falsifier depuis le front)


   const userId = req.user.uid;

    // ðŸ›¡ï¸ 2. VÃ‰RIFICATION RECAPTCHA (Bloque les robots avant toute utilisation de crÃ©dits)
 // ðŸ›¡ï¸ 2. VÃ‰RIFICATION RECAPTCHA
const isHuman = await verifyRecaptcha(recaptchaToken);

// BROWSER_ERROR = problÃ¨me temporaire cÃ´tÃ© navigateur/rÃ©seau.
// On ne considÃ¨re pas cela comme un bot.
if (isHuman === "retry") {
    return res.status(403).json({
        error: "La vÃ©rification de sÃ©curitÃ© a Ã©chouÃ© temporairement. Veuillez actualiser la page puis rÃ©essayer."
    });
}

// Token rÃ©ellement invalide ou score insuffisant
if (isHuman === false) {
    return res.status(403).json({
        error: "Ã‰chec de la vÃ©rification de sÃ©curitÃ© (bot dÃ©tectÃ©)."
    });
}
if (!prompt || !engineId) {
        return res.status(400).json({ 
            error: "ParamÃ¨tres manquants." 
        });
    }


    // Refuser immÃ©diatement les identifiants qui ne correspondent pas aux moteurs image exposÃ©s par le frontend.
    // Cette validation prÃ©cÃ¨de le dÃ©bit de crÃ©dits : un moteur invalide ne peut pas provoquer de dÃ©bit.
    const supportedImageEngineIds = new Set(["gpt_image2", "flux2pro", "nano_banana2_lite"]);
    if (!supportedImageEngineIds.has(engineId)) {
        return res.status(400).json({ error: `Moteur image non pris en charge : ${String(engineId).slice(0, 100)}` });
    }

    // ðŸ”’ SÃ‰CURITÃ‰ : Calcul ou validation du coÃ»t cÃ´tÃ© serveur (on ne fait pas confiance au req.body.cost)
    // Adapte cette ligne selon la structure exacte de ton dictionnaire de prix d'images
// 1. RÃ©cupÃ©rer le plan de l'utilisateur (par exemple depuis sa base de donnÃ©es ou req.user, ici on met "0.00" par dÃ©faut ou on rÃ©cupÃ¨re son pack)
// Adapte "userDoc.data().plan" selon le nom du champ de ton plan utilisateur dans Firestore
// ðŸ”’ SÃ‰CURITÃ‰ : RÃ©cupÃ©ration du plan utilisateur en BDD pour appliquer le bon tarif
    const userRef = db.collection('users').doc(userId);
    const initialUserDoc = await userRef.get();
    const userData = initialUserDoc.exists ? initialUserDoc.data() : {};


const rawUserPlan = String(
    userData.userPlan || userData.plan || "debutant"
).toLowerCase();

const imagePlanToPrice = {
    debutant: "0.00",
    essentiel: "12.99",
    standard: "24.99",
    master: "34.99",
    elite: "59.99",
    legende: "159.99"
};

const userPlanKey =
    imagePlanToPrice[rawUserPlan] ||
    (PRICING_DATA[rawUserPlan] ? rawUserPlan : "0.00");

console.log("ðŸ”Ž DEBUG PRICING_DATA", {
    pricingDataExists: Boolean(PRICING_DATA),
    planKeys: Object.keys(PRICING_DATA || {}),
    zeroPlanKeys: Object.keys(PRICING_DATA?.["0.00"] || {}),
    flux2proZero: PRICING_DATA?.["0.00"]?.flux2pro,
    flux2proEssentiel: PRICING_DATA?.["12.99"]?.flux2pro
});
console.log("ðŸ”§ DIAGNOSTIC TARIFS RENDER", {
    pricingDataType: typeof PRICING_DATA,
    pricingDataIsObject:
        PRICING_DATA !== null &&
        typeof PRICING_DATA === "object",
    planKeys: Object.keys(PRICING_DATA || {}),
    freePlanExists: Boolean(PRICING_DATA?.["0.00"]),
    freePlanType: typeof PRICING_DATA?.["0.00"],
    freePlanFlux2Pro: PRICING_DATA?.["0.00"]?.flux2pro,
    freePlanFlux2ProMp1:
        PRICING_DATA?.["0.00"]?.flux2pro?.mp1,
    userPlanKey
});
const userPricingTable =
    PRICING_DATA?.[userPlanKey] ||
    PRICING_DATA?.["0.00"];

console.log("ðŸ”Ž DEBUG TARIF SÃ‰LECTIONNÃ‰", {
    rawUserPlan,
    userPlanKey,
    flux2pro: userPricingTable?.flux2pro,
    mp1: userPricingTable?.flux2pro?.mp1
});

    // Tarification serveur dÃ©diÃ©e aux trois moteurs image rÃ©cents.
    // Les clÃ©s doivent correspondre Ã  celles de pricingConfig.js : ne pas rabattre ces modÃ¨les sur l'ancien tarif FLUX.
    const rawReferenceImage =
        startImage || start_image_url || image_url || uploadedImage || null;
    const requestedReferenceImages = Array.isArray(referenceImages) ? referenceImages : [];
    const requestedReferenceVideos = Array.isArray(referenceVideos) ? referenceVideos : [];
    const hasReferenceImage = requestedReferenceImages.some(v => typeof v === "string" && v.trim()) ||
        (typeof rawReferenceImage === "string" && rawReferenceImage.trim().length > 0);
    const hasReferenceVideo = engineId === "nano_banana2_lite" &&
        requestedReferenceVideos.some(v => typeof v === "string" && v.trim());

    const safeAspectForPricing = ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9"].includes(aspect_ratio)
        ? aspect_ratio
        : "1:1";
    const requestedWidth = Number.parseInt(width, 10);
    const requestedHeight = Number.parseInt(height, 10);
    const pricingDimensions = {
        "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [1024, 1024],
        "4:3": [1152, 864], "3:4": [864, 1152], "3:2": [1264, 848],
        "2:3": [848, 1264], "4:5": [928, 1152], "5:4": [1152, 928], "21:9": [1584, 672]
    };
    let [pricingWidth, pricingHeight] = pricingDimensions[safeAspectForPricing];
    if (Number.isFinite(requestedWidth) && requestedWidth > 0 && Number.isFinite(requestedHeight) && requestedHeight > 0) {
        pricingWidth = requestedWidth;
        pricingHeight = requestedHeight;
    }

    let officialCost;
    if (engineId === "gpt_image2") {
        const modelPricing = userPricingTable?.gptImage2;
        officialCost = modelPricing?.[hasReferenceImage ? "referenceToImage" : "textToImage"];
    } else if (engineId === "flux2pro") {
        const megapixels = (pricingWidth * pricingHeight) / 1_000_000;
        const sizeKey = megapixels <= 1.5 ? "mp1" : megapixels <= 3 ? "mp2" : "mp4";
        officialCost = userPricingTable?.flux2pro?.[sizeKey];
    } else if (engineId === "nano_banana2_lite") {
        officialCost = userPricingTable?.nanoBanana2Lite?.[(hasReferenceImage || hasReferenceVideo) ? "reference1k" : "k1"];
    }
console.log("ðŸ”Ž DEBUG TARIFICATION IMAGE", {
    engineId,
    rawUserPlan,
    userPlanKey,
    pricingTableExists: Boolean(userPricingTable),
    flux2pro: userPricingTable?.flux2pro,
    gptImage2: userPricingTable?.gptImage2,
    nanoBanana2Lite: userPricingTable?.nanoBanana2Lite,
    pricingWidth,
    pricingHeight,
    officialCost
});
    if (officialCost === undefined || officialCost === null || !Number.isFinite(Number(officialCost)) || Number(officialCost) <= 0) {
        console.error(`âŒ Tarif serveur introuvable ou invalide pour le plan ${userPlanKey} et le moteur : ${engineId}`, {
            expectedPricingKey: engineId === "gpt_image2" ? "gptImage2" : engineId === "flux2pro" ? "flux2pro" : "nanoBanana2Lite",
            hasReferenceImage,
            hasReferenceVideo
        });
        return res.status(400).json({
            error: "Tarification serveur introuvable pour ce moteur. VÃ©rifiez les tarifs dans pricingConfig.js."
        });
    }

    const finalCost = Number(officialCost);

    // ðŸ”’ VALIDATION DU X-REQUEST-ID
    const suppliedRequestId = req.headers['x-request-id'];

    if (
        suppliedRequestId &&
        (
            typeof suppliedRequestId !== 'string' ||
            suppliedRequestId.length > 128
        )
    ) {
        return res.status(400).json({
            error: "X-Request-Id invalide"
        });
    }

    // ðŸ”’ ID unique gÃ©nÃ©rÃ© cÃ´tÃ© serveur si absent
    const requestId =
        suppliedRequestId ||
        `${userId}_${Date.now()}_${crypto.randomUUID()}`;

    const lockRef =
        db.collection('imageLocks').doc(requestId);

 // DÃ©termination dynamique du champ Ã  dÃ©biter avec bascule automatique sur les diamants
    let fieldToDecrement = costType === "diamonds" ? "packTokens" : "tokens";

// Le dÃ©bit est validÃ© Ã  100%// Variables de sÃ©curitÃ© (Ã  placer au dÃ©but de la route)
let creditsDebited = false;
let generationFinished = false;
let lockCreated = false;

try {
    // ðŸ”’ TRANSACTION : UNE SEULE DÃ‰DUCTION PAR REQUEST ID
    await db.runTransaction(async (transaction) => {

        const lockDoc = await transaction.get(lockRef);

        if (lockDoc.exists) {
            throw new Error("GÃ©nÃ©ration dÃ©jÃ  en cours");
        }

 const userDocTx = await transaction.get(userRef);

        if (!userDocTx.exists) {
            throw new Error("Utilisateur non trouvÃ©");
        }
        
        const userData = userDocTx.data();
        let balance = userData[fieldToDecrement] || 0;

        // ðŸ§  Si l'utilisateur n'a pas assez de tokens classiques, on vÃ©rifie s'il a assez de diamants (packTokens)
        if (balance < finalCost && fieldToDecrement === "tokens") {
            if ((userData["packTokens"] || 0) >= finalCost) {
                fieldToDecrement = "packTokens";
                balance = userData["packTokens"];
            }
        }

        if (balance < finalCost) { 
            throw new Error("CrÃ©dits insuffisants");
        }

            transaction.set(lockRef, {
                userId,
                requestId,
                prompt: prompt,
                cost: finalCost, 
                field: fieldToDecrement,
                status: "processing",
                provider: "runware",
                engine: engineId,
                createdAt: FieldValue.serverTimestamp()
            });

            transaction.update(userRef, {
                [fieldToDecrement]: FieldValue.increment(-finalCost)
            });

    });

    // âš¡ Le dÃ©bit est rÃ©ellement validÃ© en BDD Ã  partir d'ICI
    creditsDebited = true;


// âš¡ Le dÃ©bit est rÃ©ellement validÃ© en BDD Ã  partir d'ICI
creditsDebited = true;

// ============================================================
// ANCIEN SYSTÃˆME GOOGLE IMAGEN
// CONSERVÃ‰ POUR RETOUR EN ARRIÃˆRE
// ============================================================

/*
const isGoogleImg =
    engineId.includes("google") ||
    engineId.includes("imagen");

if (isGoogleImg) {
    const response = await ai.models.generateImages({
        model: "imagen-3.0-fast-generate-001",
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspect_ratio || "1:1"
        }
    });

    const generatedImage =
        response.generatedImages?.[0];

    if (!generatedImage?.image?.imageBytes) {
        throw new Error("RÃ©ponse Google vide.");
    }

    finalImageUrl =
        `data:image/png;base64,${generatedImage.image.imageBytes}`;
}
*/

// ============================================================
// RUNWARE â€” GPT IMAGE 2 / FLUX.2 PRO / NANO BANANA 2 LITE
// Fal est rÃ©servÃ© Ã  Seedance 1.5 Pro dans la route vidÃ©o.
// ============================================================
const imageModelMap = {
    gpt_image2: "openai:gpt-image@2",
    flux2pro: "bfl:5@1",
    nano_banana2_lite: "google:nano-banana@2-lite"
};
const runwareImageModel = imageModelMap[engineId];
if (!runwareImageModel) {
    throw new Error(`ModÃ¨le image non pris en charge par Runware : ${engineId}`);
}

const toPublicMediaUrl = (url) => {
    if (typeof url !== "string" || !url.trim()) return null;
    if (url.includes("localhost:5000") || url.includes("127.0.0.1:5000")) {
        return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, process.env.PUBLIC_API_URL || "https://eclipse-ai.onrender.com");
    }
    return url;
};

const referenceImageList = [...new Set([
    ...(Array.isArray(referenceImages) ? referenceImages : []),
    referenceImage
].filter(url => typeof url === "string" && url.trim()).map(toPublicMediaUrl).filter(Boolean))];
// Nano Banana 2 Lite accepte au maximum une vidÃ©o de rÃ©fÃ©rence.
const referenceVideoList = engineId === "nano_banana2_lite"
    ? [...new Set(
        (Array.isArray(referenceVideos) ? referenceVideos : [])
            .filter(url => typeof url === "string" && url.trim())
            .map(toPublicMediaUrl).filter(Boolean)
      )].slice(0, 1)
    : [];

const safeAspect = ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9"].includes(aspect_ratio) ? aspect_ratio : "1:1";
const dimensionsByAspect = {
    "16:9": [1536, 864], "9:16": [864, 1536], "1:1": [1024, 1024],
    "4:3": [1152, 864], "3:4": [864, 1152], "21:9": [1536, 656]
};
let [safeWidth, safeHeight] = dimensionsByAspect[safeAspect];
const parsedWidth = parseInt(width, 10);
const parsedHeight = parseInt(height, 10);
if (Number.isFinite(parsedWidth) && Number.isFinite(parsedHeight)) {
    safeWidth = parsedWidth;
    safeHeight = parsedHeight;
}
if (engineId === "nano_banana2_lite") {
    const nanoDimensions = { "16:9": [1376,768], "9:16": [768,1376], "1:1": [1024,1024], "4:3": [1200,896], "3:4": [896,1200], "3:2": [1264,848], "2:3": [848,1264], "4:5": [928,1152], "5:4": [1152,928], "21:9": [1584,672] };
    [safeWidth, safeHeight] = nanoDimensions[safeAspect] || nanoDimensions["1:1"];
}
const clampDimension = (value, min, max) => Math.max(min, Math.min(max, Math.round(value / 16) * 16));
if (engineId === "flux2pro") {
    safeWidth = clampDimension(safeWidth, 256, 2048);
    safeHeight = clampDimension(safeHeight, 256, 2048);
} else {
    safeWidth = clampDimension(safeWidth, 16, 3840);
    safeHeight = clampDimension(safeHeight, 16, 3840);
}

const runwareImageRequest = {
    taskType: "imageInference",
    model: runwareImageModel,
    positivePrompt: String(prompt || "").trim(),
    width: safeWidth,
    height: safeHeight,
    outputType: "URL",
    outputFormat: ["JPG", "PNG", "WEBP"].includes(String(outputFormat || "").toUpperCase()) ? String(outputFormat).toUpperCase() : "JPG",
    outputQuality: Math.max(20, Math.min(99, parseInt(outputQuality, 10) || 95)),
    includeCost: true,
    ...(Number.isInteger(Number(seed)) && Number(seed) >= 0 && String(seed).trim() !== "" && (engineId !== "nano_banana2_lite" || Number(seed) <= 2147483647) ? { seed: Number(seed) } : {})
};
// Nano Banana 2 Lite exige soit width/height, soit referenceImages + resolution=1K (pas les deux).
if (engineId === "nano_banana2_lite" && referenceImageList.length > 0) {
    delete runwareImageRequest.width;
    delete runwareImageRequest.height;
    runwareImageRequest.resolution = "1K";
}
if (engineId === "gpt_image2") {
    runwareImageRequest.providerSettings = { openai: {
        quality: ["auto", "high", "medium", "low"].includes(providerSettings?.openai?.quality) ? providerSettings.openai.quality : "auto",
        moderation: ["auto", "low"].includes(providerSettings?.openai?.moderation) ? providerSettings.openai.moderation : "auto"
    }};
}
if (engineId === "flux2pro") {
    const rawSafetyTolerance = providerSettings?.bfl?.safetyTolerance;
    const parsedSafetyTolerance = rawSafetyTolerance !== "" && rawSafetyTolerance != null
        ? Number(rawSafetyTolerance)
        : 2;
    runwareImageRequest.providerSettings = { bfl: {
        // 0 est une valeur valide : ne pas la remplacer par 2 avec un opÃ©rateur ||.
        safetyTolerance: Number.isFinite(parsedSafetyTolerance)
            ? Math.max(0, Math.min(5, Math.round(parsedSafetyTolerance)))
            : 2
    }};
}
if (engineId === "nano_banana2_lite") {
    const temperature = Number(settings?.temperature);
    const topP = Number(settings?.topP);
    runwareImageRequest.settings = {
        thinking: ["MINIMAL", "HIGH"].includes(settings?.thinking) ? settings.thinking : "MINIMAL",
        temperature: Number.isFinite(temperature) ? Math.max(0, Math.min(2, temperature)) : 1,
        topP: Number.isFinite(topP) ? Math.max(0, Math.min(1, topP)) : 0.95,
        ...(typeof settings?.systemPrompt === "string" && settings.systemPrompt.trim() ? { systemPrompt: settings.systemPrompt.trim().slice(0, 50000) } : {})
    };
}
if (referenceImageList.length) {
    const maxImages = engineId === "gpt_image2" ? 16 : engineId === "nano_banana2_lite" ? 14 : 9;
    runwareImageRequest.inputs = { referenceImages: referenceImageList.slice(0, maxImages) };
}
if (engineId === "nano_banana2_lite" && referenceVideoList.length) {
    // La vidÃ©o doit Ãªtre une URL publique accessible par Runware.
    // Elle est transmise dans inputs.referenceVideos, sÃ©parÃ©ment des images de rÃ©fÃ©rence.
    runwareImageRequest.inputs = {
        ...(runwareImageRequest.inputs || {}),
        referenceVideos: referenceVideoList
    };
}

console.log("ðŸŽ¨ [RUNWARE IMAGE] ModÃ¨le :", runwareImageModel);
console.log("ðŸ–¼ï¸ [RUNWARE IMAGE] RÃ©fÃ©rences image :", referenceImageList.length);
console.log("ðŸŽžï¸ [RUNWARE IMAGE] RÃ©fÃ©rences vidÃ©o :", referenceVideoList.length);
console.log("ðŸ“¦ [RUNWARE IMAGE] RequÃªte :", JSON.stringify(runwareImageRequest, null, 2));

const runware = await getRunwareClient();
const [imageResult] = await runware.run(runwareImageRequest);
finalImageUrl = imageResult.imageURL || imageResult.imageDataURI || null;
if (!finalImageUrl && imageResult.imageBase64Data) {
    finalImageUrl = `data:image/png;base64,${imageResult.imageBase64Data}`;
}

if (!finalImageUrl) {
    throw new Error("Runware n'a retournÃ© aucune URL d'image.");
}

await lockRef.update({
    status: "completed",
    provider: "runware",
    engine: engineId,
    completedAt: FieldValue.serverTimestamp(),
    imageUrl: finalImageUrl,
    url: finalImageUrl,
    prompt: prompt
});

if (userId && typeof finalImageUrl === "string" && /^https?:\/\//i.test(finalImageUrl)) {
    await db.collection("users").doc(userId).collection("generations").add({
        imageUrl: finalImageUrl,
        url: finalImageUrl,
        prompt: prompt || "",
        description: prompt || "",
        engine: engineId,
        provider: "runware",
        type: "IMAGE",
        createdAt: FieldValue.serverTimestamp()
    });
}

generationFinished = true;
console.log("ðŸ“¤ REPONSE IMAGE RUNWARE ENVOYEE AU FRONT :", finalImageUrl);
return res.json({ success: true, imageUrl: finalImageUrl, url: finalImageUrl, imageUUID: imageResult.imageUUID, taskUUID: imageResult.taskUUID, cost: imageResult.cost });
    } 
    
    catch (error) {
        console.error("âŒ Erreur dans le flux de gÃ©nÃ©ration :", error.message);

        // ðŸ”„ Remboursement automatique uniquement si dÃ©bitÃ© ET pas terminÃ©
        if (creditsDebited && !generationFinished) {
            await userRef.update({
              [fieldToDecrement]: FieldValue.increment(finalCost)
            }).catch(err => console.error("Ã‰chec du remboursement:", err));
            console.log("ðŸª™ CrÃ©dits remboursÃ©s suite Ã  l'erreur.");
        }

        // Suppression du verrou
if (creditsDebited && !generationFinished) {
    await lockRef.delete().catch(() => {});
}
        if (!res.headersSent) {
            return res.status(400).json({ error: error.message });
        }
    }
});

// --- UNIFICATION DE LA ROUTE GENERATE VIDEO ---
// âš ï¸ Ajout de authenticateUser pour s'assurer que l'utilisateur est connectÃ© et authentifiÃ© par Firebase
app.post('/generate-video', limiter, authenticateUser, async (req, res) => {
    // ðŸ›¡ï¸ 1. RÃ©cupÃ©ration de l'IP et vÃ©rification de la blacklist Firestore en premier
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const isBlocked = await isIpBlacklisted(clientIp);
    if (isBlocked) {
        console.warn(`ðŸ›‘ Tentative de requÃªte bloquÃ©e provenant d'une IP blacklistÃ©e : ${clientIp}`);
        return res.status(403).json({ error: "AccÃ¨s refusÃ©. Votre adresse IP a Ã©tÃ© restreinte." });
    }
    // =============================================================
    // ðŸ›¡ï¸ SECURITY TEST MODE
    // =============================================================
    // IMPORTANT :
    // Ce bloc doit Ãªtre AVANT :
    // - la transaction Firestore
    // - le dÃ©bit des crÃ©dits
    // - Fal.ai
    // - Google Veo
console.log(
    "ðŸ–¼ï¸ [DEBUG] REFERENCE IMAGES REÃ‡UES PAR LE SERVEUR :",
    JSON.stringify(req.body.referenceImages || [], null, 2)
);
    if (SECURITY_TEST_MODE) {
        console.log("");
        console.log("ðŸ›¡ï¸ ========================================");
        console.log("ðŸ›¡ï¸ SECURITY_TEST_MODE ACTIVÃ‰");
        console.log("ðŸ›¡ï¸ /generate-video");
        console.log("ðŸ›¡ï¸ Google Veo : BLOQUÃ‰");
        console.log("ðŸ›¡ï¸ Fal.ai     : BLOQUÃ‰");
        console.log("ðŸ›¡ï¸ DÃ©bit      : BLOQUÃ‰");
        console.log("ðŸ›¡ï¸ GÃ©nÃ©ration : SIMULÃ‰E");
        console.log("ðŸ›¡ï¸ ========================================");
        console.log("");

        return res.status(200).json({
            success: true,
            securityTest: true,
            simulated: true,
            videoUrl: "https://security-test.local/simulated-video.mp4",
            message: "GÃ©nÃ©ration vidÃ©o simulÃ©e â€” aucun fournisseur IA appelÃ©"
        });
    }

    // ðŸ”’ SOURCE DE VÃ‰RITÃ‰ ABSOLUE : On rÃ©cupÃ¨re le userId depuis le token Firebase dÃ©codÃ©, JAMAIS du req.body !
    const userId = req.user.uid;

    // 2. DÃ©structuration du body (SANS userId, puisqu'on le rÃ©cupÃ¨re de maniÃ¨re sÃ©curisÃ©e au-dessus)
    console.log(
    "DEBUG BODY:",
    JSON.stringify(
        {
            ...req.body,
            recaptchaToken: req.body.recaptchaToken
                ? "[TOKEN REDACTED]"
                : null
        },
        null,
        2
    )
);

    const { 
        engineId, cost, costType, 
        prompt, duration, aspect_ratio, 
        image_urls, video_urls, loop, enable_audio, videoSource,
        startImage, start_image_url, image_url,
        character_orientation,
        recaptchaToken, 
        qualityKey
    } = req.body;


    // On vÃ©rifie maintenant engineId et cost (userId est garanti puisqu'il vient de req.user.uid)
    if (!engineId || cost === undefined) {
        return res.status(400).json({ error: "DonnÃ©es manquantes" });
    }
// RÃ©cupÃ©ration sÃ©curisÃ©e du plan utilisateur dans Firestore
const userDoc = await db.collection('users').doc(userId).get();
if (!userDoc.exists) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
}

const userData = userDoc.data();

const userPlanFromDb = (
    userData.userPlan ||
    userData.plan ||
    "debutant"
).toLowerCase();

// Conversion du nom du plan vers la clÃ© tarifaire serveur
const userPlanPrice = PLAN_TO_PRICE[userPlanFromDb] || "0.00";

// =============================================================
// ðŸ›¡ï¸ RECALCUL DES PRIX CÃ”TÃ‰ SERVEUR (Anti-triche)
// =============================================================
const enginePricing = PRICING_DATA[userPlanPrice]?.[engineId];

if (enginePricing) {
    // ðŸŸ¢ CORRECTION 2 : On s'assure d'aller chercher la bonne clÃ© (qualitÃ©, durÃ©e, ou valeur par dÃ©faut)
    const officialCost = enginePricing[qualityKey] !== undefined 
        ? enginePricing[qualityKey] 
        : (enginePricing[duration] !== undefined ? enginePricing[duration] : enginePricing.default);

    if (officialCost !== undefined && parseInt(cost, 10) !== parseInt(officialCost, 10)) {
        console.warn(`ðŸ›‘ Tentative de fraude sur les prix dÃ©tectÃ©e ! ReÃ§u: ${cost}, Attendu: ${officialCost}`);
        
        const userEmail = userData.email || req.body.email || "Non fourni";
        const userIdVal = userId || "Non fourni";

        await sendSecurityAlert(
            clientIp, 
            "Modification frauduleuse du coÃ»t de gÃ©nÃ©ration", 
            "RequÃªte bloquÃ©e (403)", 
            userEmail, 
            userIdVal
        );

        await detectSuspicious(req, "Modification frauduleuse du coÃ»t de gÃ©nÃ©ration");
        return res.status(403).json({ error: "Erreur de validation du coÃ»t de la gÃ©nÃ©ration." });
    }
}
// =============================================================
// ðŸ›¡ï¸ VÃ‰RIFICATION RECAPTCHA (Unique et complÃ¨te)
// =============================================================
const isHuman = await verifyRecaptcha(recaptchaToken);

// DÃ©tection de l'environnement local pour Ã©viter les faux positifs de ban IP
const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === '::ffff:127.0.0.1';

// Si reCAPTCHA retourne explicitement false et qu'on n'est pas en local
if (isHuman === false && !isLocalhost) {
    // Bannit l'IP pour 24h en cas de bot avÃ©rÃ©
    await blacklistIp(clientIp, "Ã‰chec reCAPTCHA / Bot dÃ©tectÃ©", 24);

    // Remplacement sÃ©curisÃ© sans appel Ã  sendSecurityAlert
    console.warn(`ðŸš¨ [ALERTE SÃ‰CURITÃ‰] Ã‰chec reCAPTCHA / Bot dÃ©tectÃ© pour l'IP ${clientIp}`);

    return res.status(403).json({ error: "Ã‰chec de la vÃ©rification de sÃ©curitÃ© (bot dÃ©tectÃ©)." });
}

if (isHuman === false && isLocalhost) {
    console.warn("âš ï¸ [DEV LOCAL] Ã‰chec reCAPTCHA ignorÃ© pour localhost.");
}
// Si isHuman vaut 'bypass' ou 'true' suite Ã  une erreur technique de l'API Google, 
// la requÃªte continue normalement sans bannir l'utilisateur.
    // -------------------------------------------------------------
    // 1. ðŸ›¡ï¸ VÃ‰RIFICATION PREALABLE DES CRÃ‰DITS (SANS DÃ‰CLENCHER LE LOADER)
    // -------------------------------------------------------------
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvÃ©." });
        }

        const userData = userDoc.data();
        const tokensAvailable = userData.tokens || 0;
        const diamondsAvailable = userData.packTokens || 0;
        const requiredCost = parseInt(cost, 10);

        let hasEnough = false;

        if (costType === "diamonds") {
            hasEnough = diamondsAvailable >= requiredCost;
        } else {
            hasEnough = (tokensAvailable + diamondsAvailable) >= requiredCost;
        }

        // ðŸ›‘ S'il n'a pas assez de crÃ©dits -> On stoppe TOUT de suite (erreur 400 JSON)
        if (!hasEnough) {
            return res.status(400).json({ error: "CrÃ©dits insuffisants pour gÃ©nÃ©rer cette vidÃ©o." });
        }

console.log("ðŸ‘‰ 2. CrÃ©dits validÃ©s avec succÃ¨s");
    } catch (checkErr) {
        console.error("Erreur vÃ©rification solde :", checkErr);
        return res.status(500).json({ error: "Impossible de vÃ©rifier le solde utilisateur." });
    }

    // -------------------------------------------------------------
    // 2. ðŸŸ¢ SEULEMENT S'IL A ASSEZ DE CRÃ‰DITS : On ouvre le flux SSE !
    // -------------------------------------------------------------
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ status: "processing", message: "VÃ©rification des crÃ©dits..." })}\n\n`);
const requestId = `${userId}_${Date.now()}`;

const userRef = db.collection('users').doc(userId);
const lockRef = db.collection('imageLocks').doc(requestId);
let creditsDebited = false;
let isAlreadyLocked = false;
let generationFinished = false; 
let refundDone = false;

// âš¡ AJOUT : Variables indispensables pour savoir combien rembourser en cas d'erreur
let deductedTokens = 0;
let deductedDiamonds = 0;
let usedWallet = "tokens";

    // ðŸš¨ SÃ‰CURITÃ‰ RÃ‰SEAU INTERCEPTÃ‰E (Si le navigateur coupe le flux ou crash sur le Content-Length)
req.on('close', () => {
    console.log("âš ï¸ Client dÃ©connectÃ© pendant la gÃ©nÃ©ration");

    // On NE rembourse PAS ici.
    // Fal.ai peut continuer et la gÃ©nÃ©ration reste facturÃ©e.
});

   try {
    
        await db.runTransaction(async (transaction) => {
            const lockDoc = await transaction.get(lockRef);
            if (lockDoc.exists) {
                isAlreadyLocked = true;
                return; 
            }

            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("Utilisateur non trouvÃ©.");
            }

            const userData = userDoc.data();
            const tokensAvailable = userData.tokens || 0;       // âš¡ Ã‰clairs
            const diamondsAvailable = userData.packTokens || 0; // ðŸ’Ž Diamants
            const requiredCost = parseInt(cost, 10);

            // ðŸ”„ DÃ‰BIT INTELLIGENT (Ã‰CLAIRS D'ABORD, PUIS DIAMANTS)
            let newTokens = tokensAvailable;
            let newDiamonds = diamondsAvailable;
            let usedWallet = "tokens"; // Pour le suivi dans le verrou

            if (costType === "diamonds") {
                if (diamondsAvailable < requiredCost) throw new Error("Diamants insuffisants.");
                newDiamonds -= requiredCost;
                deductedDiamonds = requiredCost;
                usedWallet = "packTokens";
            } else {
                if (tokensAvailable >= requiredCost) {
                    // Cas 1 : Assez d'Ã©clairs
                    newTokens -= requiredCost;
                    deductedTokens = requiredCost;
                    usedWallet = "tokens";
                } else if ((tokensAvailable + diamondsAvailable) >= requiredCost) {
                    // Cas 2 : Hybride (Vider les Ã©clairs + complÃ©ter en diamants)
                    const missingCost = requiredCost - tokensAvailable;
                    deductedTokens = tokensAvailable; 
        deductedDiamonds = missingCost;
                    newTokens = 0;
                    newDiamonds -= missingCost;
                    usedWallet = "hybrid";
                } else {
                    throw new Error("CrÃ©dits insuffisants.");
                }
            }

            // 1. Application des nouveaux soldes dans le document User
            transaction.update(userRef, {
                tokens: newTokens,
                packTokens: newDiamonds
            });

            // 2. CrÃ©ation du verrou de sÃ©curitÃ©
            transaction.set(lockRef, {
                userId,
                requestId,
                cost: requiredCost,
                field: usedWallet, // "tokens", "packTokens" ou "hybrid"
                status: "processing",
                provider: engineId === "seedance" ? "fal" : "runware",
                engine: engineId,
                createdAt: Timestamp.now(),
                lastCheck: Timestamp.now()
            });
        });

 // 3. ðŸ›‘ SI DÃ‰JÃ€ EN COURS
        if (isAlreadyLocked) {
            console.log("âš ï¸ RequÃªte bloquÃ©e : Un verrou existe dÃ©jÃ .");
            res.write(`data: ${JSON.stringify({ error: "GÃ©nÃ©ration dÃ©jÃ  en cours. Veuillez patienter.", status: "failed" })}\n\n`);
            // On laisse 100ms au rÃ©seau pour transmettre le message SSE au front avant de fermer
            setTimeout(() => {
                if (!res.writableEnded) res.end();
            }, 100);
            return;
        }

        // Le dÃ©bit est validÃ© Ã  100%
        creditsDebited = true;

        // Finalisation commune des moteurs Runware : ferme le verrou et enregistre l'historique.
        const completeRunwareVideo = async (result, modelName = engineId) => {
            const generatedVideoUrl = result?.videoURL || result?.videoUrl || result?.videoDataURI || result?.videoBase64Data;
            if (!generatedVideoUrl) throw new Error(`Runware n'a retournÃ© aucune URL vidÃ©o pour ${modelName}.`);
            const isPersistableUrl = typeof generatedVideoUrl === "string" && /^https?:\/\//i.test(generatedVideoUrl);
            const lockUpdate = {
                status: "completed",
                provider: "runware",
                engine: modelName,
                prompt: prompt || req.body.prompt || "",
                description: prompt || req.body.prompt || "",
                completedAt: FieldValue.serverTimestamp()
            };
            if (isPersistableUrl) {
                lockUpdate.videoUrl = generatedVideoUrl;
                lockUpdate.url = generatedVideoUrl;
            }
            await lockRef.update(lockUpdate);
            if (userId && isPersistableUrl) {
                await db.collection("users").doc(userId).collection("generations").add({
                    videoUrl: generatedVideoUrl,
                    url: generatedVideoUrl,
                    prompt: prompt || req.body.prompt || "",
                    description: prompt || req.body.prompt || "",
                    engine: modelName,
                    provider: "runware",
                    type: "VIDEO",
                    createdAt: FieldValue.serverTimestamp()
                });
            }
            generationFinished = true;
            return res.json({
                success: true,
                status: "completed",
                videoURL: generatedVideoUrl,
                videoUrl: generatedVideoUrl,
                url: generatedVideoUrl,
                videoUUID: result?.videoUUID,
                taskUUID: result?.taskUUID,
                cost: result?.cost
            });
        };

    // ============================================================
    // ============================================================
// ðŸŽ¬ RUNWARE â€” GOOGLE VEO 3.1
// ============================================================
// Modes pris en charge :
// - Text to Video
// - Image to Video
// - First + Last Frame
// - Reference Images
// - Video Extend
// - Video Edit
// - Audio
// ============================================================

if (engineId.toLowerCase().includes("veo3.1")) {

    console.log("ðŸŽ¬ [RUNWARE] Veo 3.1 dÃ©tectÃ©");

    try {

        const runware = await getRunwareClient();

        // --------------------------------------------------------
        // DONNÃ‰ES ENTRANTES
        // --------------------------------------------------------

        const requestedResolution =
            String(req.body.resolution || "").trim();

        const requestedAspectRatio =
            String(aspect_ratio || req.body.aspect_ratio || "16:9")
                .trim();

        const veoVideoSource =
            videoSource ||
            req.body.video_url ||
            req.body.videoSource ||
            null;

        const veoStartImage =
            startImage ||
            start_image_url ||
            image_url ||
            null;

        const veoEndImage =
            end_image_url ||
            null;

        const veoReferenceImages =
            Array.isArray(req.body.referenceImages)
                ? req.body.referenceImages
                    .filter(Boolean)
                    .slice(0, 3)
                : [];
console.log(
    "ðŸ–¼ï¸ [DEBUG] REFERENCE IMAGES REÃ‡UES PAR LE SERVEUR :",
    JSON.stringify(veoReferenceImages, null, 2)
);
        const requestedOperation =
            String(
                req.body.videoOperation ||
                req.body.operation ||
                ""
            ).toLowerCase();

        // --------------------------------------------------------
        // DÃ‰TECTION DU MODE
        // --------------------------------------------------------

        let veoOperation = "text-to-video";

        if (veoVideoSource) {

            if (
                requestedOperation === "edit" ||
                requestedOperation === "video-edit"
            ) {
                veoOperation = "edit";
            } else {
                veoOperation = "extend";
            }

        } else if (veoReferenceImages.length > 0) {

            veoOperation = "reference-to-video";

        } else if (veoStartImage || veoEndImage) {

            veoOperation = "image-to-video";
        }

        console.log(
            `ðŸŽ¬ [RUNWARE] Mode Veo 3.1 : ${veoOperation}`
        );

        // --------------------------------------------------------
        // AUDIO
        // --------------------------------------------------------

        const generateAudio =
            enable_audio !== false;

        // --------------------------------------------------------
        // DURÃ‰E
        // --------------------------------------------------------

        let safeDuration =
            parseInt(duration, 10);

        if (veoVideoSource) {

            // Runware impose 7 secondes
            // lorsqu'une vidÃ©o source est utilisÃ©e.
            safeDuration = 7;

        } else if (veoReferenceImages.length > 0) {

            // Runware impose 8 secondes
            // avec des images de rÃ©fÃ©rence.
            safeDuration = 8;

        } else {

            if (![4, 6, 7, 8].includes(safeDuration)) {
                safeDuration = 4;
            }
        }

        // --------------------------------------------------------
        // REQUÃŠTE RUNWARE DE BASE
        // --------------------------------------------------------

   const isVeoFast =
    engineId.toLowerCase().includes("veo3.1_fast") ||
    engineId.toLowerCase().includes("veo3.1-fast");

const runwareModel =
    isVeoFast
        ? "google:3@3"
        : "google:3@2";

console.log(
    `ðŸ¤– [RUNWARE] ModÃ¨le Veo sÃ©lectionnÃ© : ${runwareModel}`
);

const runwareRequest = {
    taskType: "videoInference",
    model: runwareModel,

            positivePrompt:
                String(prompt || "").trim(),

            duration: safeDuration,

            providerSettings: {
                google: {
                    enhancePrompt: true,
                    generateAudio
                }
            }
        };

        // ========================================================
        // 1ï¸âƒ£ VIDEO â†’ VIDEO
        // ========================================================
        // Extension ou modification d'une vidÃ©o existante.
        //
        // IMPORTANT :
        // Avec inputs.video :
        // - durÃ©e = 7 secondes
        // - pas de width
        // - pas de height
        // - pas de resolution
        // - pas de referenceImages
        // ========================================================

        if (veoVideoSource) {

            runwareRequest.duration = 7;

            runwareRequest.inputs = {
                video: veoVideoSource
            };

            console.log(
                `ðŸŽ¬ [RUNWARE] VidÃ©o source dÃ©tectÃ©e â€” mode : ${veoOperation}`
            );

        }

        // ========================================================
        // 2ï¸âƒ£ REFERENCE IMAGES â†’ VIDEO
        // ========================================================
        // Jusqu'Ã  3 images de rÃ©fÃ©rence.
        //
        // IMPORTANT :
        // Runware impose 8 secondes avec referenceImages.
        // ========================================================

        else if (veoReferenceImages.length > 0) {

            runwareRequest.duration = 8;

            // Dimensions selon rÃ©solution + format
            const safeResolution =
                requestedResolution === "1080p" ||
                requestedResolution === "Full HD"
                    ? "1080p"
                    : "720p";

            if (requestedAspectRatio === "9:16") {

                runwareRequest.width =
                    safeResolution === "1080p"
                        ? 1080
                        : 720;

                runwareRequest.height =
                    safeResolution === "1080p"
                        ? 1920
                        : 1280;

            } else {

                runwareRequest.width =
                    safeResolution === "1080p"
                        ? 1920
                        : 1280;

                runwareRequest.height =
                    safeResolution === "1080p"
                        ? 1080
                        : 720;
            }

            runwareRequest.inputs = {
                referenceImages:
                    veoReferenceImages
            };

            console.log(
                `ðŸ–¼ï¸ [RUNWARE] ${veoReferenceImages.length} image(s) de rÃ©fÃ©rence`
            );
        }

        // ========================================================
        // 3ï¸âƒ£ IMAGE â†’ VIDEO
        // ========================================================
        // PremiÃ¨re image seule
        // OU premiÃ¨re + derniÃ¨re image.
        // ========================================================

        else if (veoStartImage || veoEndImage) {

            const safeResolution =
                requestedResolution === "1080p" ||
                requestedResolution === "Full HD"
                    ? "1080p"
                    : "720p";

            // ----------------------------------------------------
            // DIMENSIONS
            // ----------------------------------------------------

            if (requestedAspectRatio === "9:16") {

                runwareRequest.width =
                    safeResolution === "1080p"
                        ? 1080
                        : 720;

                runwareRequest.height =
                    safeResolution === "1080p"
                        ? 1920
                        : 1280;

            } else {

                runwareRequest.width =
                    safeResolution === "1080p"
                        ? 1920
                        : 1280;

                runwareRequest.height =
                    safeResolution === "1080p"
                        ? 1080
                        : 720;
            }

            // ----------------------------------------------------
            // FIRST / LAST FRAME
            // ----------------------------------------------------

            const frameImages = [];

            if (veoStartImage) {

                frameImages.push({
                    image: veoStartImage,
                    frame: "first"
                });
            }

            if (veoEndImage) {

                frameImages.push({
                    image: veoEndImage,
                    frame: "last"
                });
            }

            runwareRequest.inputs = {
                frameImages
            };

            console.log(
                `ðŸ–¼ï¸ [RUNWARE] ${frameImages.length} frame(s) configurÃ©e(s)`
            );
        }

        // ========================================================
        // 4ï¸âƒ£ TEXT â†’ VIDEO
        // ========================================================
        // Aucun input image/vidÃ©o.
        // width + height dÃ©finissent le format.
        // ========================================================

        else {

            const safeResolution =
                requestedResolution === "1080p" ||
                requestedResolution === "Full HD"
                    ? "1080p"
                    : "720p";

            if (requestedAspectRatio === "9:16") {

                runwareRequest.width =
                    safeResolution === "1080p"
                        ? 1080
                        : 720;

                runwareRequest.height =
                    safeResolution === "1080p"
                        ? 1920
                        : 1280;

            } else {

                runwareRequest.width =
                    safeResolution === "1080p"
                        ? 1920
                        : 1280;

                runwareRequest.height =
                    safeResolution === "1080p"
                        ? 1080
                        : 720;
            }

            console.log(
                "ðŸ“ [RUNWARE] Mode Text to Video"
            );
        }

        // --------------------------------------------------------
        // LOG FINAL
        // --------------------------------------------------------

        console.log(
            "ðŸš€ [RUNWARE] RequÃªte Veo 3.1 :",
            JSON.stringify(
                {
                    taskType:
                        runwareRequest.taskType,

                    model:
                        runwareRequest.model,

                    operation:
                        veoOperation,

                    duration:
                        runwareRequest.duration,

                    width:
                        runwareRequest.width || null,

                    height:
                        runwareRequest.height || null,

                    generateAudio,

                    hasVideoSource:
                        Boolean(veoVideoSource),

                    hasStartImage:
                        Boolean(veoStartImage),

                    hasEndImage:
                        Boolean(veoEndImage),

                    referenceImages:
                        veoReferenceImages.length
                },
                null,
                2
            )
        );

        // --------------------------------------------------------
        // SSE â€” DÃ‰MARRAGE
        // --------------------------------------------------------

        res.write(
            `data: ${JSON.stringify({
                percent: 10,

                message:
                    veoOperation === "edit"
                        ? "Veo 3.1 : modification de la vidÃ©o..."
                        : veoOperation === "extend"
                            ? "Veo 3.1 : extension de la vidÃ©o..."
                            : "Veo 3.1 : gÃ©nÃ©ration en cours..."
            })}\n\n`
        );

        // --------------------------------------------------------
        // APPEL RUNWARE
        // --------------------------------------------------------

        const [result] =
            await runware.run(runwareRequest);

        console.log(
            "âœ… [RUNWARE] RÃ©ponse Veo 3.1 :",
            JSON.stringify(result, null, 2)
        );

        // --------------------------------------------------------
        // URL VIDÃ‰O
        // --------------------------------------------------------

        const generatedVideoUrl =
            result?.videoURL;

        if (!generatedVideoUrl) {

            throw new Error(
                "Runware n'a pas retournÃ© de videoURL."
            );
        }

        // --------------------------------------------------------
        // GÃ‰NÃ‰RATION TERMINÃ‰E
        // --------------------------------------------------------

        generationFinished = true;

        await lockRef.update({

            status: "completed",

            provider: "runware",

            operation: veoOperation,

            videoUrl:
                generatedVideoUrl,

            url:
                generatedVideoUrl,

            prompt:
                prompt || "",

            engine:
                engineId,

            completedAt:
                FieldValue.serverTimestamp()
        });

        // --------------------------------------------------------
        // HISTORIQUE UTILISATEUR
        // --------------------------------------------------------

        try {

            await db
                .collection("users")
                .doc(userId)
                .collection("generations")
                .add({

                    videoUrl:
                        generatedVideoUrl,

                    prompt:
                        prompt || "",

                    engine:
                        engineId,

                    provider:
                        "runware",

                    operation:
                        veoOperation,

                    createdAt:
                        FieldValue.serverTimestamp()
                });

            console.log(
                "ðŸ’¾ VidÃ©o Runware ajoutÃ©e Ã  l'historique."
            );

        } catch (historyError) {

            console.error(
                "âš ï¸ Erreur historique Runware :",
                historyError.message
            );
        }

        // --------------------------------------------------------
        // LIBÃ‰RATION DU LOCK
        // --------------------------------------------------------

        await lockRef
            .delete()
            .catch(() => {});

        // --------------------------------------------------------
        // RÃ‰PONSE FRONTEND
        // --------------------------------------------------------

        res.write(
            `data: ${JSON.stringify({

                videoUrl:
                    generatedVideoUrl,

                percent:
                    100,

                status:
                    "completed",

                operation:
                    veoOperation,

                message:
                    veoOperation === "edit"
                        ? "Veo 3.1 : vidÃ©o modifiÃ©e !"
                        : veoOperation === "extend"
                            ? "Veo 3.1 : vidÃ©o Ã©tendue !"
                            : "Veo 3.1 : vidÃ©o prÃªte !"

            })}\n\n`
        );

        res.end();

        return;

    } catch (runwareError) {

        console.error(
            "âŒ [RUNWARE] Erreur Veo 3.1 :",
            runwareError
        );

        throw runwareError;
    }
}
// ============================================================
// KLING 2.6 MOTION CONTROL â€” RUNWARE
// ============================================================
if (
    engineId.toLowerCase() === "kling26_motion" ||
    engineId.toLowerCase() === "kling2.6_motion" ||
    engineId.toLowerCase() === "kling-2.6-motion"
) {

    console.log(
        "ðŸŽ¬ [RUNWARE] Kling 2.6 Motion Control dÃ©tectÃ©"
    );

    const runwareModel =
        "klingai:kling-video@2.6-pro";

    // ========================================================
    // IMAGE PERSONNAGE
    // ========================================================

    const motionImage =
        startImage ||
        image_url ||
        req.body.start_image_url ||
        req.body.startImage ||
        null;

    // ========================================================
    // VIDÃ‰O DE MOUVEMENT
    // ========================================================

    const motionVideo =
        video ||
        video_url ||
        req.body.video_url ||
        req.body.videoSource ||
        null;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!motionImage) {

        throw new Error(
            "Kling 2.6 Motion Control requiert une image du personnage."
        );
    }

    if (!motionVideo) {

        throw new Error(
            "Kling 2.6 Motion Control requiert une vidÃ©o de mouvement."
        );
    }

    // ========================================================
    // ORIENTATION
    // ========================================================

    const requestedOrientation =
        String(
            req.body.character_orientation ||
            req.body.characterOrientation ||
            "video"
        ).toLowerCase();

    const orientation =
        requestedOrientation === "image"
            ? "image"
            : "video";

    // ========================================================
    // SON ORIGINAL
    // ========================================================

    const keepOriginalSound =
        req.body.keep_original_sound !== undefined
            ? Boolean(
                req.body.keep_original_sound
            )
            : req.body.enable_audio !== undefined
                ? Boolean(
                    req.body.enable_audio
                )
                : true;

    // ========================================================
    // REQUÃŠTE RUNWARE
    // ========================================================

  const klingMotionRequest = {

    taskType:
        "videoInference",

    model:
        "klingai:kling-video@2.6-pro",

    positivePrompt:
        String(
            prompt ||
            req.body.prompt ||
            ""
        ).trim(),

    inputs: {

        referenceImages: [
            motionImage
        ],

        referenceVideos: [
            motionVideo
        ]

    },

    providerSettings: {

        klingai: {

            characterOrientation:
                orientation,

            keepOriginalSound:
                keepOriginalSound

        }

    }

};

    console.log(
        "=============================================="
    );

    console.log(
        "ðŸŽ¬ KLING 2.6 MOTION CONTROL â€” RUNWARE"
    );

    console.log(
        "=============================================="
    );

    console.log(
        "ðŸ–¼ï¸ Image personnage :",
        motionImage
    );

    console.log(
        "ðŸŽ¥ VidÃ©o mouvement :",
        motionVideo
    );

    console.log(
        "ðŸ§­ Orientation :",
        orientation
    );

    console.log(
        "ðŸ”Š Son original :",
        keepOriginalSound
    );

    console.log(
        "ðŸ¤– ModÃ¨le :",
        runwareModel
    );

    console.log(
        "ðŸ“¦ RequÃªte Runware :",
        JSON.stringify(
            klingMotionRequest,
            null,
            2
        )
    );

    console.log(
        "=============================================="
    );

    // ========================================================
    // APPEL RUNWARE
    // ========================================================

    const [result] =
        await runware.run(
            klingMotionRequest
        );

    console.log(
        "âœ… [KLING 2.6 MOTION] GÃ©nÃ©ration terminÃ©e"
    );

    return await completeRunwareVideo(result, engineId);
}
// ============================================================
// KLING 2.6 PRO â€” RUNWARE
// ============================================================
if (
    engineId.toLowerCase() === "kling2.6" ||
    engineId.toLowerCase() === "kling2.6_pro" ||
    engineId.toLowerCase() === "kling2.6-pro"
) {

    console.log("ðŸŽ¬ [RUNWARE] Kling 2.6 Pro dÃ©tectÃ©");

    const runwareModel =
        "klingai:kling-video@2.6-pro";

    console.log(
        `ðŸ¤– [RUNWARE] ModÃ¨le Kling sÃ©lectionnÃ© : ${runwareModel}`
    );

    // ========================================================
    // IDENTIFICATION DES SOURCES
    // ========================================================

    const imageInput =
        startImage ||
        image_url ||
        null;

    const videoInput =
        video ||
        video_url ||
        null;

    const hasImage =
        Boolean(imageInput);

    const hasVideo =
        Boolean(videoInput);

    // ========================================================
    // DURÃ‰E KLING 2.6
    // ========================================================

    const safeKlingDuration =
        parseInt(duration, 10) === 10
            ? 10
            : 5;

    // ========================================================
    // VIDEO â†’ VIDEO
    // ========================================================
    // Runware interdit duration + sound avec referenceVideos.
    // On ne met donc PAS width/height non plus.
    // ========================================================

    if (hasVideo) {

        const klingRequest = {

            taskType:
                "videoInference",

            model:
                runwareModel,

            positivePrompt:
                String(prompt || "").trim(),

            inputs: {

                referenceVideos: [
                    videoInput
                ]

            },

            providerSettings: {

                klingai: {

                    characterOrientation:
                        "video"

                }

            }

        };

        console.log(
            "ðŸŽ¥ [KLING 2.6] Mode VIDEO â†’ VIDEO"
        );

        console.log(
            "ðŸŽ¬ [KLING 2.6] RequÃªte Runware :",
            JSON.stringify(
                klingRequest,
                null,
                2
            )
        );

        const [result] =
            await runware.run(
                klingRequest
            );

        console.log(
            "âœ… [KLING 2.6] Video â†’ Video terminÃ©e"
        );

        return await completeRunwareVideo(result, engineId);
    }

    // ========================================================
    // IMAGE â†’ VIDEO
    // ========================================================
    // Une image = premier frame.
    // frameImages est obligatoire pour ce workflow.
    // ========================================================

    if (hasImage) {

        const klingRequest = {

            taskType:
                "videoInference",

            model:
                runwareModel,

            positivePrompt:
                String(prompt || "").trim(),

            duration:
                safeKlingDuration,

            inputs: {

                frameImages: [
                    imageInput
                ]

            },

            providerSettings: {

                klingai: {

                    sound:
                        enable_audio !== false

                }

            }

        };

        console.log(
            "ðŸ–¼ï¸ [KLING 2.6] Mode IMAGE â†’ VIDEO"
        );

        console.log(
            "ðŸ”Š [KLING 2.6] Audio natif :",
            enable_audio !== false
                ? "OUI"
                : "NON"
        );

        console.log(
            "ðŸŽ¬ [KLING 2.6] RequÃªte Runware :",
            JSON.stringify(
                klingRequest,
                null,
                2
            )
        );

        const [result] =
            await runware.run(
                klingRequest
            );

        console.log(
            "âœ… [KLING 2.6] Image â†’ Video terminÃ©e"
        );

        return await completeRunwareVideo(result, engineId);
    }

    // ========================================================
    // TEXT â†’ VIDEO
    // ========================================================

    const klingRequest = {

        taskType:
            "videoInference",

        model:
            runwareModel,

        positivePrompt:
            String(prompt || "").trim(),

        duration:
            safeKlingDuration,

        width:
            1920,

        height:
            1080,

        providerSettings: {

            klingai: {

                sound:
                    enable_audio !== false

            }

        }

    };

    console.log(
        "ðŸ“ [KLING 2.6] Mode TEXT â†’ VIDEO"
    );

    console.log(
        "ðŸ”Š [KLING 2.6] Audio natif :",
        enable_audio !== false
            ? "OUI"
            : "NON"
    );

    console.log(
        "ðŸŽ¬ [KLING 2.6] RequÃªte Runware :",
        JSON.stringify(
            klingRequest,
            null,
            2
        )
    );

    const [result] =
        await runware.run(
            klingRequest
        );

    console.log(
        "âœ… [KLING 2.6] Text â†’ Video terminÃ©e"
    );

    return await completeRunwareVideo(result, engineId);
}
/*
============================================================
ANCIEN CODE GOOGLE VEO / VERTEX AI
CONSERVÃ‰ POUR RETOUR EN ARRIÃˆRE
============================================================



const isGoogleVideo = Boolean(engineId && (engineId.startsWith("veo") || engineId.includes("google")));

if (isGoogleVideo) {
    // ðŸ” SÃ‰CURITÃ‰ : Validation du modÃ¨le
    let officialGoogleModel;
  if (engineId === "veo3_lite") {
        officialGoogleModel = "veo-3.1 lite-generate-001";
    } else {
        officialGoogleModel = "veo-3.1-generate-001";
    }

    console.log(`ðŸ”’ [SÃ©curisÃ©] Appel Google SDK | ModÃ¨le : ${officialGoogleModel}`);

    // ðŸ•’ SÃ‰CURISATION DURÃ‰E (Validations strictes)
    const allowedDurations = (engineId === "veo3_lite") ? [4, 8] : [4, 6, 8];
    let safeDuration = parseInt(duration);

    console.log(`[DEBUG] DurÃ©e brute reÃ§ue: ${duration}, DurÃ©e parsÃ©e: ${safeDuration}, Moteur: ${engineId}`);

    if (isNaN(safeDuration) || !allowedDurations.includes(safeDuration)) {
        safeDuration = allowedDurations[0]; 
        console.warn(`âš ï¸ DurÃ©e invalide, rÃ©initialisÃ©e Ã  ${safeDuration}s`);
    }

    // ðŸ“ SÃ‰CURISATION ASPECT RATIO (CalculÃ© avant utilisation)
    const safeAspect = ["16:9", "9:16", "1:1"].includes(aspect_ratio) ? aspect_ratio : "16:9";

    // âš™ï¸ CONSTRUCTION DE L'OBJET CONFIG (DÃ©clarÃ© une seule fois)
    const videoConfig = { 
        aspectRatio: safeAspect, 
        durationSeconds: safeDuration 
    };

    console.log(`[DEBUG] Valeur finale injectÃ©e dans videoConfig : ${safeDuration}s`);

    // Enrichissement du prompt
    let enrichedPrompt = enable_audio === false 
        ? `${prompt}, silent, no background noise, no music, no sound effects, muted`
        : `${prompt}, high quality audio, immersive soundscape, cinematic sound design`;

 const generateOptions = {
    model: officialGoogleModel,
    prompt: enrichedPrompt,
    config: {
        aspectRatio: safeAspect,
        durationSeconds: safeDuration,
        outputMimeType: "video/mp4"
    }
};
// =============================================================
// ðŸ“¸ IMAGE DE RÃ‰FÃ‰RENCE VEO
// =============================================================

// PrioritÃ© : startImage â†’ start_image_url â†’ image_url â†’ image_urls[0]
const veoImageUrl =
    (typeof startImage === "string" && startImage.trim()) ? startImage.trim() :
    (typeof start_image_url === "string" && start_image_url.trim()) ? start_image_url.trim() :
    (typeof image_url === "string" && image_url.trim()) ? image_url.trim() :
    (Array.isArray(image_urls) && typeof image_urls[0] === "string" && image_urls[0].trim())
        ? image_urls[0].trim()
        : null;

if (veoImageUrl) {
    console.log("ðŸ“¸ Image de rÃ©fÃ©rence dÃ©tectÃ©e pour Veo :", veoImageUrl);

    try {
        // ---------------------------------------------------------
        // CAS 1 : image dÃ©jÃ  au format Data URI
        // ---------------------------------------------------------
        if (veoImageUrl.startsWith("data:image/")) {

            const match = veoImageUrl.match(
                /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
            );

            if (!match) {
                throw new Error("Format Data URI de l'image invalide.");
            }

            const mimeType = match[1];
            const base64Data = match[2];

            generateOptions.image = {
                imageBytes: base64Data,
                mimeType: mimeType
            };

            console.log(
                "âœ… Image Data URI convertie pour Veo | MIME :",
                mimeType
            );
        }

        // ---------------------------------------------------------
        // CAS 2 : image hÃ©bergÃ©e sur Render / URL HTTPS
        // ---------------------------------------------------------
        else if (
            veoImageUrl.startsWith("http://") ||
            veoImageUrl.startsWith("https://")
        ) {
            console.log("ðŸŒ TÃ©lÃ©chargement de l'image de rÃ©fÃ©rence...");

            const imageResponse = await fetch(veoImageUrl);

            if (!imageResponse.ok) {
                throw new Error(
                    `Impossible de rÃ©cupÃ©rer l'image (${imageResponse.status} ${imageResponse.statusText})`
                );
            }

            const contentType =
                imageResponse.headers.get("content-type") || "image/png";

            if (!contentType.startsWith("image/")) {
                throw new Error(
                    `Le fichier rÃ©cupÃ©rÃ© n'est pas une image : ${contentType}`
                );
            }

            const imageBuffer = Buffer.from(
                await imageResponse.arrayBuffer()
            );

            if (!imageBuffer.length) {
                throw new Error("L'image rÃ©cupÃ©rÃ©e est vide.");
            }

            const base64Data = imageBuffer.toString("base64");

            generateOptions.image = {
                imageBytes: base64Data,
                mimeType: contentType.split(";")[0]
            };

            console.log(
                "âœ… Image tÃ©lÃ©chargÃ©e et convertie pour Veo |",
                `${imageBuffer.length} octets | MIME : ${contentType.split(";")[0]}`
            );
        }

        else {
            throw new Error(
                "Format d'image non pris en charge pour Veo."
            );
        }

        console.log("ðŸŽ¯ Image de rÃ©fÃ©rence rÃ©ellement injectÃ©e dans la requÃªte Veo.");

    } catch (imgError) {
        console.error(
            "âŒ Erreur lors de la prÃ©paration de l'image Veo :",
            imgError.message
        );

        // IMPORTANT :
        // On arrÃªte la gÃ©nÃ©ration plutÃ´t que de lancer une vidÃ©o
        // sans l'image demandÃ©e.
        throw new Error(
            "Impossible de prÃ©parer l'image de rÃ©fÃ©rence pour Veo."
        );
    }
} else {
    console.log("â„¹ï¸ Aucune image de rÃ©fÃ©rence fournie pour Veo.");
}
// 1. Flush immÃ©diat des headers pour activer le flux SSE
res.flushHeaders();

// 2. Heartbeat pour maintenir la connexion SSE active toutes les 15s
const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(':\n\n');
}, 15000);

let operation = await ai.models.generateVideos(generateOptions);

console.log("â³ RequÃªte acceptÃ©e par Google. ID OpÃ©ration :", operation.name);
console.log("ðŸ¿ GÃ©nÃ©ration de la vidÃ©o en cours sur les serveurs de Google (Attente active 1 Ã  3 minutes)...");

// ðŸ”„ Boucle d'attente (Polling) optimisÃ©e pour le SDK @google/genai 2.x
let attempts = 0;
console.log("â³ DÃ©but de la surveillance de l'opÃ©ration Google...");

while (!operation.done) {
    attempts++;
    console.log(`ðŸ”„ [Tentative ${attempts}] VÃ©rification du statut auprÃ¨s de Google...`);

    // 1. Attendre 15 secondes
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // 2. Mise Ã  jour de l'opÃ©ration (Appel unique et propre)
    try {
        // ðŸ”¥ FIX : RafraÃ®chissement rÃ©el de l'Ã©tat de l'opÃ©ration (indispensable pour sortir du while)
        operation = await ai.operations.get({ operation: operation });
        
        // 3. Mise Ã  jour de la progression vers le frontend
        const progressMessage = `GÃ©nÃ©ration IA en cours (Tentative ${attempts})...`;
res.write(`data: ${JSON.stringify({ percent: 50, message: progressMessage })}\n\n`);
        console.log(`âœ… [Tentative ${attempts}] RÃ©ponse reÃ§ue. OpÃ©ration terminÃ©e : ${operation.done}`);
        
    } catch (err) {
        console.error("âŒ Erreur lors du polling de l'opÃ©ration :", err.message);
        clearInterval(heartbeat); // Nettoyage en cas d'erreur
        throw err; // On stoppe tout si l'API Google renvoie une erreur critique
    }

    // SÃ©curitÃ© : Timeout global aprÃ¨s 20 tentatives (soit 5 minutes)
    if (attempts >= 20) {
        clearInterval(heartbeat);
        throw new Error("Le dÃ©lai de gÃ©nÃ©ration a Ã©tÃ© dÃ©passÃ© (Timeout).");
    }
}

// Nettoyage final
clearInterval(heartbeat);
console.log("âœ… GOOGLE A TERMINÃ‰ LA GÃ‰NÃ‰RATION !");
// Si Google a renvoyÃ© une erreur dans l'opÃ©ration terminÃ©e
if (operation.error) {
    throw new Error(`Google Cloud Error [${operation.error.code}]: ${operation.error.message}`);
}
// Extraction de la rÃ©ponse finale
const response = operation.response;
console.log("STRUCTURE FINALE ACCESSIBLE :", JSON.stringify(response, null, 2));
let generatedVideoUrl = null;
// ============================================================
// ðŸ›¡ï¸ VIDÃ‰O FILTRÃ‰E PAR LES RÃˆGLES DE SÃ‰CURITÃ‰ GOOGLE
// ============================================================
if (
    response?.raiMediaFilteredCount > 0 ||
    response?.raiMediaFilteredReasons?.length > 0
) {
    const reasons = response.raiMediaFilteredReasons || [];

    console.warn(
        "ðŸ›¡ï¸ Google a filtrÃ© la vidÃ©o pour des raisons de sÃ©curitÃ©."
    );

    console.warn(
        "ðŸ›¡ï¸ Raisons du filtrage :",
        reasons
    );

    const errorMsg =
        "Google a bloquÃ© cette gÃ©nÃ©ration pour des raisons de sÃ©curitÃ©. Veuillez modifier le prompt puis rÃ©essayer.";

    res.write(
        `data: ${JSON.stringify({
            error: errorMsg,
            status: "filtered",
            reason: reasons[0] || "Contenu filtrÃ© par Google"
        })}\n\n`
    );

    res.end();

    throw new Error(errorMsg);
}
// Extraction et conversion immÃ©diate en fichier local
if (response?.generatedVideos?.[0]?.video?.videoBytes) {
    const videoBytes = response.generatedVideos[0].video.videoBytes;
    const buffer = Buffer.from(videoBytes, "base64");

    const fileName = `video-${Date.now()}.mp4`;
    // On dÃ©finit le dossier proprement
    const dir = path.join(__dirname, 'public', 'videos');
    
    // CrÃ©e le dossier s'il n'existe pas
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);
// --- DÃ‰COUPAGE ET REDIMENSIONNEMENT FFMPEG ---
const finalFileName = `final-${Date.now()}.mp4`;
const outputPath = path.join(dir, finalFileName);

res.write(`data: ${JSON.stringify({ percent: 80, message: "Traitement vidÃ©o et application des filtres..." })}\n\n`);

// ðŸ” VARIABLES DE SÃ‰CURITÃ‰
let finished = false;
let fakePercent = 80;
let fakeProgressInterval;
let timeout;

// ðŸ§¹ CLEANUP CENTRALISÃ‰
const cleanup = () => {
    if (fakeProgressInterval) clearInterval(fakeProgressInterval);
    if (timeout) clearTimeout(timeout);
};

// ðŸ§  SAFE FINISH (ANTI DOUBLE EXECUTION)
const safeFinish = (cb) => {
    if (finished) return;
    finished = true;
    cleanup();
    cb();
};

// ðŸ“Š FAKE PROGRESS (UX FLUIDE)
fakeProgressInterval = setInterval(() => {
    if (fakePercent < 85) fakePercent += 1;
    else if (fakePercent < 92) fakePercent += 0.3;

    // Utilisation directe de res.write
    // Assure-toi que 'res' est bien accessible dans la portÃ©e de cette fonction
    if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ 
            percent: Math.min(92, Math.round(fakePercent)), 
            message: "Encodage vidÃ©o en cours (FFMPEG)..." 
        })}\n\n`);
    }
}, 2000);
const targetSize =
    req.body.resolution === "1080p"
        ? "1920x1080"
        : "1280x720";

// ðŸ§ª LOGS DEBUG// ðŸ“ RÃ©cupÃ©ration dynamique du format et de la rÃ©solution choisis sur l'interface
const aspectRatio = req.body.aspect_ratio || "9:16";
const isHD = req.body.resolution === "1080p";

let targetWidth = 1080;
let targetHeight = 1920;

if (aspectRatio === "1:1") {
    targetWidth = isHD ? 1080 : 720;
    targetHeight = isHD ? 1080 : 720;
} else if (aspectRatio === "16:9") {
    targetWidth = isHD ? 1920 : 1280;
    targetHeight = isHD ? 1080 : 720;
} else {
    // 9:16 par dÃ©faut
    targetWidth = isHD ? 1080 : 720;
    targetHeight = isHD ? 1920 : 1280;
}

// ðŸ§ª LOGS DEBUG
console.log(`ðŸ” Diagnostic FFMPEG :`);
console.log(`   - Dossier cible : ${dir}`);
console.log(`   - Fichier Ã©crit : ${filePath}`);
console.log(`   - Format demandÃ© : ${aspectRatio} (${targetWidth}x${targetHeight})`);
console.log(
    `   - VÃ©rification accÃ¨s disque : ${
        fs.existsSync(filePath) ? "OUI âœ…" : "NON âŒ"
    }`
);

await new Promise((resolve, reject) => {

    // â±ï¸ TIMEOUT SÃ‰CURISÃ‰
    timeout = setTimeout(() => {
        console.error("âŒ FFMPEG : TIMEOUT aprÃ¨s 1200 secondes");

        safeFinish(() => {
            reject(new Error("Timeout FFMPEG : dÃ©passement 1200s"));
        });
    }, 120000);

    console.log("ðŸŽ¬ PrÃ©paration du lancement FFMPEG...");
    console.log("ðŸ“¥ Fichier source :", filePath);
    console.log("ðŸ“¤ Fichier destination :", outputPath);
    console.log("â±ï¸ DurÃ©e demandÃ©e :", duration);
    console.log("ðŸ“ RÃ©solution cible :", `${targetWidth}x${targetHeight}`);

    console.log("ðŸ”Ž Chemin FFmpeg configurÃ© :", ffmpegPath);
    console.log("ðŸ”Ž FFmpeg existe :", fs.existsSync(ffmpegPath));

    if (!fs.existsSync(ffmpegPath)) {
        throw new Error(`FFmpeg introuvable sur Render : ${ffmpegPath}`);
    }

    ffmpeg.setFfmpegPath(ffmpegPath);

    console.log("âœ… Chemin FFmpeg appliquÃ© Ã  fluent-ffmpeg.");

    const ffmpegProcess = ffmpeg(filePath)
        .videoFilters([
            // âœ… Filtre dynamique avec bandes noires (padding) sans dÃ©formation
            `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2,setsar=1`
        ])
        .outputOptions([
            '-t ' + duration,
            '-c:v libx264',
            '-preset fast',
            '-pix_fmt yuv420p',
            '-movflags +faststart'
        ])
        .output(outputPath)

        .on("start", (cmd) => {
            console.log("ðŸš€ FFMPEG commande lancÃ©e :", cmd);
        })

        .on("progress", (progress) => {
            console.log(
                `ðŸŽžï¸ FFMPEG progression : ${progress.percent || 0}%`
            );
        })

        .on("end", () => {

            safeFinish(async () => {

                console.log(
                    `âœ‚ï¸ VidÃ©o traitÃ©e : ${duration}s, RÃ©solution : ${targetWidth}x${targetHeight}`
                );

                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(
                            "âš ï¸ Impossible de supprimer le fichier temporaire :",
                            err.message
                        );
                    }
                });

                const finalUrl =
                    `${req.protocol}://${req.get("host")}/videos/${finalFileName}`;

                if (lockRef) {
                    try {

                        await lockRef.update({
                            status: "completed",
                            videoUrl: finalUrl,
                            url: finalUrl,
                            prompt: prompt || "",
                            description: prompt || "",
                            engine: engineId || "google-veo",
                            completedAt: FieldValue.serverTimestamp()
                        });

                        console.log(
                            "ðŸ”’ Verrou imageLocks mis Ã  jour et finalisÃ© avec succÃ¨s pour Veo."
                        );

                    } catch (lockErr) {

                        console.error(
                            "âš ï¸ Erreur lors de la mise Ã  jour finale du verrou imageLocks :",
                            lockErr.message
                        );
                    }
                }

                res.write(
                    `data: ${JSON.stringify({
                        videoUrl: finalUrl,
                        percent: 100,
                        message: "VidÃ©o prÃªte !"
                    })}\n\n`
                );

                res.end();

                resolve();
            });
        })

        .on("error", (err, stdout, stderr) => {

            console.error("âŒ ERREUR FFMPEG :", err.message);
            console.error("âŒ CODE FFMPEG :", err.code);
            console.error("âŒ STDOUT FFMPEG :", stdout);
            console.error("âŒ STDERR FFMPEG :", stderr);

            safeFinish(() => {

                if (!res.writableEnded) {
                    res.write(
                        `data: ${JSON.stringify({
                            error: "Erreur traitement vidÃ©o final.",
                            details: err.message
                        })}\n\n`
                    );

                    res.end();
                }

                reject(err);
            });
        });

    console.log("â–¶ï¸ Appel de .run() FFMPEG maintenant...");

    ffmpegProcess.run();
});

// Suite du code pour les autres cas...


} else if (response?.generatedVideos?.[0]?.video?.uri) {
    const videoUrl = response.generatedVideos[0].video.uri;
    console.log("ðŸŽ‰ URI Google dÃ©tectÃ©e â†’ vidÃ©o prÃªte :", videoUrl);

    generationFinished = true;

    // 1ï¸âƒ£ Mise Ã  jour du verrou
    await lockRef.update({
        status: "completed",
        videoUrl: videoUrl,
        url: videoUrl,
        completedAt: FieldValue.serverTimestamp()
    });

    // 2ï¸âƒ£ ðŸ’¾ SAUVEGARDE FIRESTORE : Ajout Ã  l'historique utilisateur (Prompt + VidÃ©o)
    if (userId) {
        try {
            await db.collection("users").doc(userId).collection("generations").add({
                videoUrl: videoUrl,
                prompt: prompt || "",
                engine: engineId || "google-veo",
                createdAt: FieldValue.serverTimestamp()
            });
            console.log(`ðŸ’¾ VidÃ©o URI ajoutÃ©e Ã  l'historique de l'utilisateur : ${userId}`);
        } catch (fsErr) {
            console.error("âŒ Erreur lors de la sauvegarde Firestore de l'historique vidÃ©o URI :", fsErr.message);
        }
    } else {
        console.warn("âš ï¸ Impossible d'enregistrer la vidÃ©o : userId est introuvable.");
    }

    // 3ï¸âƒ£ Suppression du verrou pour libÃ©rer l'utilisateur
    await lockRef.delete().catch(() => {});

    // âœ… RÃ‰PONSE SSE PROPRE
    res.write(`data: ${JSON.stringify({ 
        videoUrl: videoUrl, 
        percent: 100, 
        message: "VidÃ©o prÃªte !" 
    })}\n\n`);
    
    res.end(); 
    return;
    
}
else {
    // Si tu es dans une erreur, utilise aussi le flux SSE pour que le client reÃ§oive l'info
    const errorMsg = "Impossible d'extraire la vidÃ©o de la rÃ©ponse finale de Google.";
    res.write(`data: ${JSON.stringify({ error: errorMsg, status: "failed" })}\n\n`);
    res.end();
   throw new Error(errorMsg);
}

} // <--- Ferme le grand "if (isGoogleVideo)" du dÃ©but


*/


// --- ROUTAGE DES MOTEURS VIDÃ‰O RESTANTS ---

console.log("ETAPE 1 : entrÃ©e traitement vidÃ©o");
console.log(`ðŸŽ¬ Routage du moteur : ${engineId}`);

let targetEngineId = req.body.modelEndpoint || engineId;
let finalInput = { prompt, aspect_ratio: aspect_ratio || "16:9", resolution: req.body.resolution || "720p" };


// ðŸ› ï¸ CONVERSION URL LOCALE â†’ URL PUBLIQUE DU SERVEUR
const localVideoUrl = req.body.video_url || req.body.videoSource || req.body.videoUrl;
if (localVideoUrl && localVideoUrl.includes('localhost:5000')) {
const ngrokBaseUrl = process.env.PUBLIC_API_URL || 'https://eclipse-ai.onrender.com';
    finalInput.video_url = localVideoUrl.replace('http://localhost:5000', ngrokBaseUrl);
}

console.log("ðŸš€ ETAPE 2 : finalInput initial crÃ©Ã©");
console.log("ðŸ‘‰ 1. EntrÃ©e dans /generate-video");
console.log(JSON.stringify(finalInput, null, 2));
// Nettoyage : si l'URL pointe vers un .mp4, on l'annule pour forcer le mode text-to-video
const rawImg = image_urls?.[0] || req.body.image_url || req.body.start_image_url;
const validImg = (rawImg && typeof rawImg === 'string' && !rawImg.endsWith('.mp4')) ? rawImg : null;

if (validImg) {
    finalInput.start_image_url = validImg;
}// Logic Hailuo


// ============================================================
// 1. KLING 3.0
// Standard & Pro
// Text-to-Video & Image-to-Video
// Image dÃ©but + Image fin
// ============================================================
if (


    engineId === "kling30" ||
    engineId === "kling3" ||
    engineId.includes("kling-video/v3")
) {

    console.log("ðŸš€ KLING 3.0 : configuration RUNWARE");

    // ========================================================
    // 0. SÃ‰CURITÃ‰ : MOTION CONTROL EST TRAITÃ‰ PLUS BAS
    // ========================================================

    if (
        engineId.toLowerCase().includes("motion")
    ) {
        throw new Error(
            "Kling 3.0 Motion Control doit utiliser son bloc dÃ©diÃ©."
        );
    }

    // ========================================================
    // 1. RÃ‰CUPÃ‰RATION DES IMAGES
    // ========================================================

    const sourceStartImage =
        req.body.start_image_url ||
        req.body.image_url ||
        req.body.startImage ||
        (Array.isArray(image_urls) ? image_urls[0] : null) ||
        null;

    const sourceEndImage =
        req.body.end_image_url ||
        req.body.tail_image_url ||
        req.body.endImage ||
        null;

    // ========================================================
    // 2. DÃ‰TECTION RÃ‰SOLUTION
    // ========================================================

    const requestedResolution =
        String(
            req.body.resolution ||
            resolution ||
            "720p"
        ).toLowerCase().replace(/\s/g, "");

    const is1080p =
        requestedResolution === "1080p" ||
        requestedResolution === "fhd" ||
        requestedResolution === "fullhd";

    const klingModel =
        is1080p
            ? "klingai:kling-video@3-pro"
            : "klingai:kling-video@3-standard";

    const klingTier =
        is1080p
            ? "PRO / 1080p"
            : "STANDARD / 720p";

    // ========================================================
    // 3. DURÃ‰E
    // ========================================================

    const requestedDuration =
        parseInt(
            req.body.duration ||
            duration ||
            5,
            10
        );

    const klingDuration =
        Number.isInteger(requestedDuration) &&
        requestedDuration >= 3 &&
        requestedDuration <= 15
            ? requestedDuration
            : 5;

    // ========================================================
    // 4. PROMPT
    // ========================================================

    const klingPrompt =
        String(
            prompt ||
            req.body.prompt ||
            ""
        ).trim();

    if (!klingPrompt) {
        throw new Error(
            "Kling 3.0 : le prompt est vide."
        );
    }

    // ========================================================
    // 5. AUDIO
    // ========================================================

    const generateAudio =
        req.body.generate_audio !== undefined
            ? Boolean(req.body.generate_audio)
            : req.body.enable_audio !== undefined
                ? Boolean(req.body.enable_audio)
                : false;

    // ========================================================
    // 6. PAYLOAD RUNWARE
    // ========================================================

    const klingRequest = {

        taskType:
            "videoInference",

        model:
            klingModel,

        positivePrompt:
            klingPrompt,

        duration:
            klingDuration,

        includeCost:
            true,

        providerSettings: {

            klingai: {

                sound:
                    generateAudio

            }

        }

    };

    // ========================================================
    // 7. IMAGE-TO-VIDEO
    // ========================================================

    if (sourceStartImage) {

        const frameImages = [
            sourceStartImage
        ];

        // Deux images = premiÃ¨re + derniÃ¨re image
        if (sourceEndImage) {

            frameImages.push(
                sourceEndImage
            );
        }

        klingRequest.inputs = {

            frameImages:
                frameImages

        };

 

        // IMPORTANT :
        // La documentation Runware indique que duration
        // est disponible pour Kling 3.0 mais que les
        // paramÃ¨tres doivent respecter les dÃ©pendances
        // du mode image. On vÃ©rifie donc le mode image
        // sÃ©parÃ©ment avant gÃ©nÃ©ration.

        klingRequest.duration =
            klingDuration;

    }

    // ========================================================
    // 8. TEXT-TO-VIDEO
    // ========================================================

    else {

        const requestedAspect =
            String(
                req.body.aspect_ratio ||
                aspect_ratio ||
                "16:9"
            );

        let width;
        let height;

        if (requestedAspect === "9:16") {

            width =
                is1080p
                    ? 1080
                    : 720;

            height =
                is1080p
                    ? 1920
                    : 1280;

        } else if (requestedAspect === "1:1") {

            width =
                is1080p
                    ? 1440
                    : 960;

            height =
                is1080p
                    ? 1440
                    : 960;

        } else {

            width =
                is1080p
                    ? 1920
                    : 1280;

            height =
                is1080p
                    ? 1080
                    : 720;
        }

        klingRequest.width =
            width;

        klingRequest.height =
            height;

        klingRequest.duration =
            klingDuration;
    }

    // ========================================================
    // 9. NEGATIVE PROMPT
    // ========================================================

    const negativePrompt =
        typeof req.body.negative_prompt === "string" &&
        req.body.negative_prompt.trim()
            ? req.body.negative_prompt.trim()
            : null;

    if (negativePrompt) {

        klingRequest.negativePrompt =
            negativePrompt;
    }

    // ========================================================
    // 10. LOG
    // ========================================================

    console.log("");
    console.log("==============================================");
    console.log("ðŸŽ¬ KLING 3.0 â€” RUNWARE");
    console.log("==============================================");

    console.log(
        "âž¡ï¸ Engine ID :",
        engineId
    );

    console.log(
        "âž¡ï¸ ModÃ¨le :",
        klingModel
    );

    console.log(
        "âž¡ï¸ Niveau :",
        klingTier
    );

    console.log(
        "âž¡ï¸ Mode :",
        sourceStartImage
            ? (
                sourceEndImage
                    ? "IMAGE â†’ VIDEO / FIRST + LAST"
                    : "IMAGE â†’ VIDEO"
            )
            : "TEXT â†’ VIDEO"
    );

    console.log(
        "âž¡ï¸ DurÃ©e :",
        klingDuration,
        "secondes"
    );

    console.log(
        "âž¡ï¸ Audio :",
        generateAudio
    );

    console.log(
        "âž¡ï¸ Image dÃ©but :",
        sourceStartImage || "âŒ aucune"
    );

    console.log(
        "âž¡ï¸ Image fin :",
        sourceEndImage || "âŒ aucune"
    );

    console.log(
        "ðŸ“¦ RequÃªte Runware :",
        JSON.stringify(
            klingRequest,
            null,
            2
        )
    );

    console.log("==============================================");

    // ========================================================
    // 11. APPEL RUNWARE
    // ========================================================

    try {

        const [result] =
            await runware.run(
                klingRequest
            );

        console.log(
            "âœ… [KLING 3.0] GÃ©nÃ©ration terminÃ©e"
        );

        console.log(
            "ðŸ“¦ RÃ©sultat :",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return await completeRunwareVideo(result, engineId);

    } catch (error) {

        console.error(
            "âŒ [KLING 3.0 / RUNWARE]",
            error
        );

        throw error;
    }
}

// ============================================================
// 2. KLING MOTION CONTROL â€” STANDARD / PRO
// ============================================================

else if (engineId.includes("kling") && engineId.includes("motion")) {
    // Ce cas doit Ãªtre traitÃ© par le bloc Kling Motion Control Runware situÃ© plus haut.
    throw new Error("Kling Motion Control non traitÃ© par son gestionnaire Runware.");
}

// ============================================================
// 3. KLING 2.6 PRO (Strictement isolÃ© des versions 3)
// ============================================================
else if (engineId.includes("kling26") || (engineId.includes("kling") && !engineId.includes("v3") && !engineId.includes("30"))) {
    // Les versions Kling 2.6 doivent avoir Ã©tÃ© interceptÃ©es par les branches Runware plus haut.
    throw new Error("Kling 2.6 non traitÃ© par son gestionnaire Runware.");
}

// ============================================================
// HAILUO 2.3 â€” RUNWARE
// Text-to-Video + Image-to-Video
// ============================================================
else if (engineId.includes("hailuo")) {
    console.log("ðŸš€ HAILUO 2.3 : configuration RUNWARE");

    // ========================================================
    // 1. IMAGE DE DÃ‰PART
    // ========================================================

    const hailuoImg =
        validImg ||
        req.body.startImage ||
        req.body.start_image ||
        req.body.image_url ||
        req.body.start_image_url ||
        (Array.isArray(image_urls) ? image_urls[0] : null);

    const cleanHailuoImg =
        (
            hailuoImg &&
            typeof hailuoImg === "string" &&
            !hailuoImg.toLowerCase().endsWith(".mp4")
        )
            ? hailuoImg
            : null;

    // ========================================================
    // 2. RÃ‰SOLUTION
    // ========================================================

    const requestedResolution =
        String(
            req.body.resolution ||
            resolution ||
            "768p"
        )
        .toLowerCase()
        .replace(/\s/g, "");

    const is1080p =
        requestedResolution === "1080p" ||
        requestedResolution === "fhd" ||
        requestedResolution === "fullhd";

    // ========================================================
    // 3. DURÃ‰E
    // ========================================================

    const requestedDuration =
        parseInt(
            req.body.duration ||
            duration ||
            6,
            10
        );

    // 1080p = uniquement 6 secondes
    // 768p = 6 ou 10 secondes

    const hailuoDuration =
        is1080p
            ? 6
            : (
                requestedDuration === 10
                    ? 10
                    : 6
            );

    // ========================================================
    // 4. PROMPT
    // ========================================================

    const hailuoPrompt =
        String(
            prompt ||
            req.body.prompt ||
            ""
        ).trim();

    if (!hailuoPrompt) {

        throw new Error(
            "Hailuo 2.3 : le prompt est vide."
        );
    }

    // ========================================================
    // 5. PAYLOAD RUNWARE
    // ========================================================

    const hailuoRequest = {

        taskType:
            "videoInference",

        model:
            "minimax:4@1",

        positivePrompt:
            hailuoPrompt,

        duration:
            hailuoDuration,

        includeCost:
            true,

        providerSettings: {

            minimax: {

                promptOptimizer:
                    true

            }

        }
    };

    // ========================================================
    // 6. IMAGE â†’ VIDEO
    // ========================================================

    if (cleanHailuoImg) {

        hailuoRequest.inputs = {

            frameImages: [
                cleanHailuoImg
            ]

        };

        // Avec frameImages, on ne fournit PAS width/height.
        // Hailuo utilise l'image comme premiÃ¨re frame.
    }

    // ========================================================
    // 7. TEXT â†’ VIDEO
    // ========================================================

    else {

        if (is1080p) {

            hailuoRequest.width =
                1920;

            hailuoRequest.height =
                1080;

        } else {

            hailuoRequest.width =
                1366;

            hailuoRequest.height =
                768;
        }
    }

    // ========================================================
    // 8. LOG
    // ========================================================

    console.log("");
    console.log("==============================================");
    console.log("ðŸŽ¬ HAILUO 2.3 â€” RUNWARE");
    console.log("==============================================");

    console.log(
        "âž¡ï¸ Engine ID :",
        engineId
    );

    console.log(
        "âž¡ï¸ ModÃ¨le :",
        "minimax:4@1"
    );

    console.log(
        "âž¡ï¸ Mode :",
        cleanHailuoImg
            ? "IMAGE â†’ VIDEO"
            : "TEXT â†’ VIDEO"
    );

    console.log(
        "âž¡ï¸ RÃ©solution :",
        is1080p
            ? "1080p"
            : "768p"
    );

    console.log(
        "âž¡ï¸ DurÃ©e :",
        hailuoDuration,
        "secondes"
    );

    console.log(
        "âž¡ï¸ Image de dÃ©part :",
        cleanHailuoImg || "âŒ aucune"
    );

    console.log(
        "ðŸ“¦ RequÃªte Runware :",
        JSON.stringify(
            hailuoRequest,
            null,
            2
        )
    );

    console.log("==============================================");

    // ========================================================
    // 9. APPEL RUNWARE
    // ========================================================

    try {

        const [result] =
            await runware.run(
                hailuoRequest
            );

        console.log(
            "âœ… [HAILUO 2.3] GÃ©nÃ©ration terminÃ©e"
        );

        console.log(
            "ðŸ“¦ RÃ©sultat :",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return await completeRunwareVideo(result, engineId);

    } catch (error) {

        console.error(
            "âŒ [HAILUO 2.3 / RUNWARE]",
            error
        );

        throw error;
    }
}
// ============================================================
// MINIMAX H3 â€” RUNWARE
// Text-to-Video
// Image-to-Video
// First + Last Frame
// Reference Images / Video / Audio
// ============================================================
else if (engineId.includes("minimax_h3")) {

    console.log("ðŸš€ MINIMAX H3 : configuration RUNWARE");

    // ========================================================
    // 1. PROMPT
    // ========================================================

    const h3BasePrompt = String(prompt || req.body.prompt || "").trim();
    const h3Dialogue = String(req.body.dialogue || "").trim().slice(0, 2000);
    const h3HasAudioReference = Boolean(
        (Array.isArray(req.body.audio_urls) && req.body.audio_urls.some(Boolean)) || req.body.audio_url
    );
    const h3ToPublicUrl = (url) => {
        if (typeof url !== "string" || !url.trim()) return null;
        if (url.includes("localhost:5000") || url.includes("127.0.0.1:5000")) {
            return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, process.env.PUBLIC_API_URL || "https://eclipse-ai.onrender.com");
        }
        return url;
    };
    const h3Prompt = [
        h3BasePrompt,
        h3Dialogue
            ? `Sound: The character says exactly: "${h3Dialogue}". Use any provided reference audio to guide the voice, accent and delivery, and synchronize the character's lip movements with the dialogue.`
            : h3HasAudioReference
                ? "Sound: Use the provided reference audio to guide the character's voice, accent, tone and delivery. Generate natural speech synchronized with the scene."
                : ""
    ].filter(Boolean).join("\n").slice(0, 7000);

    if (!h3Prompt) {
        throw new Error(
            "MiniMax H3 : le prompt est vide."
        );
    }

    // ========================================================
    // 2. DURÃ‰E
    // ========================================================

    const h3Duration = Math.max(
        4,
        Math.min(
            15,
            parseInt(
                req.body.duration ||
                duration ||
                5,
                10
            )
        )
    );

    // ========================================================
    // 3. RÃ‰SOLUTION
    // ========================================================

    const requestedResolution =
        String(
            req.body.resolution ||
            resolution ||
            "768p"
        )
        .toLowerCase()
        .replace(/\s/g, "");

    const h3Resolution =
        (
            requestedResolution === "1440p" ||
            requestedResolution === "2k" ||
            requestedResolution === "2k1440"
        )
            ? "1440p"
            : "768p";

    // ========================================================
    // 4. RÃ‰CUPÃ‰RATION DES IMAGES
    // ========================================================

    const h3Images = [];

    if (Array.isArray(image_urls)) {
        h3Images.push(
            ...image_urls.filter(Boolean)
        );
    }

    if (req.body.image_url) {
        h3Images.push(
            req.body.image_url
        );
    }

    if (req.body.start_image_url) {
        h3Images.push(
            req.body.start_image_url
        );
    }

    if (req.body.startImage) {
        h3Images.push(
            req.body.startImage
        );
    }

    if (req.body.end_image_url) {
        h3Images.push(
            req.body.end_image_url
        );
    }

    if (req.body.endImage) {
        h3Images.push(
            req.body.endImage
        );
    }

    // Suppression des doublons + exclusion des vidÃ©os
    const uniqueH3Images = [
        ...new Set(
            h3Images.filter(
                url =>
                    typeof url === "string" &&
                    url.trim() &&
                    !url.toLowerCase().endsWith(".mp4")
            )
        )
    ];
    const publicH3Images = uniqueH3Images.map(h3ToPublicUrl).filter(Boolean);

    // ========================================================
    // 5. VIDÃ‰OS DE RÃ‰FÃ‰RENCE
    // ========================================================

const sourceH3Video =
    req.body.video_url ||
    req.body.videoSource ||
    req.body.videoUrl ||
    null;

const extraH3Videos = Array.isArray(video_urls)
    ? video_urls.filter(
        url =>
            typeof url === "string" &&
            url.trim() &&
            url !== sourceH3Video
      )
    : [];

const uniqueH3Videos = [
    ...new Set([
        ...(typeof sourceH3Video === "string" && sourceH3Video.trim()
            ? [sourceH3Video]
            : []),
        ...extraH3Videos
    ])
].slice(0, 3).map(h3ToPublicUrl).filter(Boolean);

    // ========================================================
    // 6. AUDIOS DE RÃ‰FÃ‰RENCE
    // ========================================================

    const h3Audios = [];

    if (Array.isArray(req.body.audio_urls)) {
        h3Audios.push(
            ...req.body.audio_urls.filter(Boolean)
        );
    }

    if (req.body.audio_url) {
        h3Audios.push(
            req.body.audio_url
        );
    }

    const uniqueH3Audios = [
        ...new Set(
            h3Audios.filter(
                url =>
                    typeof url === "string" &&
                    url.trim()
            )
        )
    ];
    const publicH3Audios = uniqueH3Audios.map(h3ToPublicUrl).filter(Boolean);

    // ========================================================
    // 7. IMAGES DE RÃ‰FÃ‰RENCE
    // ========================================================

    const h3ReferenceImages = [];

    if (Array.isArray(req.body.referenceImages)) {
        h3ReferenceImages.push(
            ...req.body.referenceImages.filter(Boolean)
        );
    }

    if (Array.isArray(req.body.reference_images)) {
        h3ReferenceImages.push(
            ...req.body.reference_images.filter(Boolean)
        );
    }

    const uniqueH3ReferenceImages = [
        ...new Set(
            h3ReferenceImages.filter(
                url =>
                    typeof url === "string" &&
                    url.trim()
            )
        )
    ];
    const publicH3ReferenceImages = uniqueH3ReferenceImages.map(h3ToPublicUrl).filter(Boolean);

    // ========================================================
    // 8. CONSTRUCTION DE LA REQUÃŠTE RUNWARE
    // ========================================================

  
const h3Request = {
    taskType: "videoInference",
    model: "minimax:h3@0",
    positivePrompt: h3Prompt,
    duration: h3Duration,
    includeCost: true,
    ...(Number.isInteger(Number(req.body.seed)) && String(req.body.seed ?? "").trim() !== "" && Number(req.body.seed) >= 0 && Number(req.body.seed) <= 4294967295 ? { seed: Number(req.body.seed) } : {}),
    settings: { promptExpansion: ["disabled", "balanced", "quality"].includes(req.body.settings?.promptExpansion) ? req.body.settings.promptExpansion : "balanced" }
};

    // ========================================================
    // 9. INPUTS
    // ========================================================

const h3Inputs = {};

// --------------------------------------------------------
// RÃ©fÃ©rences multimodales : 12 fichiers au total maximum
// --------------------------------------------------------
if (publicH3ReferenceImages.length + uniqueH3Videos.length + publicH3Audios.length > 12) {
    throw new Error("MiniMax H3 : 12 fichiers de rÃ©fÃ©rence maximum au total (images, vidÃ©os et audios combinÃ©s).");
}
const effectiveH3ReferenceImages = publicH3ReferenceImages.slice(0, 9);
let h3RemainingFiles = Math.max(0, 12 - effectiveH3ReferenceImages.length);
const effectiveH3ReferenceVideos = uniqueH3Videos.slice(0, Math.min(3, h3RemainingFiles));
h3RemainingFiles -= effectiveH3ReferenceVideos.length;
const effectiveH3ReferenceAudios = publicH3Audios.slice(0, Math.min(3, h3RemainingFiles));

const hasH3ReferenceImages = effectiveH3ReferenceImages.length > 0;
const hasH3ReferenceVideos = effectiveH3ReferenceVideos.length > 0;

const hasH3VisualReferences =
    hasH3ReferenceImages || hasH3ReferenceVideos;

if (uniqueH3Audios.length > 0 && !hasH3VisualReferences) {
    throw new Error("MiniMax H3 : une rÃ©fÃ©rence audio nÃ©cessite aussi au moins une image ou une vidÃ©o dans les rÃ©fÃ©rences visuelles.");
}

if (hasH3VisualReferences) {
    if (hasH3ReferenceImages) {
        h3Inputs.referenceImages =
            effectiveH3ReferenceImages;
    }

    if (hasH3ReferenceVideos) {
        h3Inputs.referenceVideos =
            effectiveH3ReferenceVideos;
    }

    if (effectiveH3ReferenceAudios.length > 0) {
        h3Inputs.referenceAudios =
            effectiveH3ReferenceAudios;
    }
}

// --------------------------------------------------------
// PremiÃ¨re et derniÃ¨re image
// Uniquement sans rÃ©fÃ©rences multimodales
// --------------------------------------------------------

else if (uniqueH3Images.length > 0) {
    h3Inputs.frameImages =
        publicH3Images.slice(0, 2);
}

if (Object.keys(h3Inputs).length > 0) {
    h3Request.inputs = h3Inputs;
}

const requestedAspectRatio =
    req.body.aspect_ratio || "16:9";

const h3Dimensions = {
    "16:9": h3Resolution === "1440p"
        ? [2560, 1440] : [1344, 768],
    "4:3": h3Resolution === "1440p"
        ? [1920, 1440] : [1024, 768],
    "1:1": h3Resolution === "1440p"
        ? [1440, 1440] : [768, 768],
    "3:4": h3Resolution === "1440p"
        ? [1440, 1920] : [768, 1024],
    "9:16": h3Resolution === "1440p"
        ? [1440, 2560] : [768, 1344],
    "21:9": h3Resolution === "1440p"
        ? [2944, 1248] : [1536, 672]
};

if (Object.keys(h3Inputs).length > 0) {
    // Mode avec image ou vidÃ©o de rÃ©fÃ©rence
    h3Request.resolution = h3Resolution;
} else {
    // Mode texte seul : largeur et hauteur obligatoires
    const dimensions =
        h3Dimensions[requestedAspectRatio] ||
        h3Dimensions["16:9"];

    h3Request.width = dimensions[0];
    h3Request.height = dimensions[1];
}

    // ========================================================
    // 10. LOG
    // ========================================================

    console.log("");
    console.log("==============================================");
    console.log("ðŸŽ¬ MINIMAX H3 â€” RUNWARE");
    console.log("==============================================");

    console.log(
        "âž¡ï¸ Engine ID :",
        engineId
    );

    console.log(
        "âž¡ï¸ ModÃ¨le :",
        "minimax:h3@0"
    );

    console.log(
        "âž¡ï¸ Mode :",
        uniqueH3Videos.length > 0
            ? "VIDEO â†’ VIDEO"
            : uniqueH3Audios.length > 0
                ? "AUDIO â†’ VIDEO"
                : uniqueH3Images.length >= 2
                    ? "FIRST + LAST FRAME"
                    : uniqueH3Images.length === 1
                        ? "IMAGE â†’ VIDEO"
                        : "TEXT â†’ VIDEO"
    );

    console.log(
        "âž¡ï¸ RÃ©solution :",
        h3Resolution
    );

    console.log(
        "âž¡ï¸ DurÃ©e :",
        h3Duration,
        "secondes"
    );

    console.log(
        "âž¡ï¸ Images frame :",
        uniqueH3Images.length
    );

    console.log(
        "âž¡ï¸ Images rÃ©fÃ©rence :",
        uniqueH3ReferenceImages.length
    );

    console.log(
        "âž¡ï¸ VidÃ©os rÃ©fÃ©rence :",
        uniqueH3Videos.length
    );

    console.log(
        "âž¡ï¸ Audios rÃ©fÃ©rence :",
        effectiveH3ReferenceAudios.length
    );

    console.log(
        "ðŸ“¦ RequÃªte Runware :",
        JSON.stringify(
            h3Request,
            null,
            2
        )
    );

    console.log(
        "=============================================="
    );

    // ========================================================
    // 11. APPEL RUNWARE
    // ========================================================

    try {

        const [result] =
            await runware.run(
                h3Request
            );

        console.log(
            "âœ… [MINIMAX H3] GÃ©nÃ©ration terminÃ©e"
        );

        console.log(
            "ðŸ“¦ RÃ©sultat :",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return await completeRunwareVideo(result, engineId);

    } catch (error) {

        console.error(
            "âŒ [MINIMAX H3 / RUNWARE]",
            error
        );

        throw error;
    }
}
// ============================================================
// PIXVERSE V6 â€” RUNWARE
// Text-to-video, first/last frames, video-to-video, native audio.
// ============================================================
else if (engineId === "pixverse6") {
    const runware = await getRunwareClient();
    const toPublicUrl = (url) => {
        if (typeof url !== "string" || !url.trim()) return null;
        if (url.includes("localhost:5000") || url.includes("127.0.0.1:5000")) {
            return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, process.env.PUBLIC_API_URL || "https://eclipse-ai.onrender.com");
        }
        return url;
    };
    const sourceVideo = toPublicUrl(req.body.video_url || req.body.videoSource || req.body.videoUrl || null);
    const sourceStart = toPublicUrl(req.body.start_image_url || req.body.startImage || req.body.image_url || null);
    const sourceEnd = toPublicUrl(req.body.end_image_url || req.body.endImage || null);
    const safeDuration = Math.max(1, Math.min(15, Number(req.body.duration) || 5));
    const safeResolution = ["360p", "540p", "720p", "1080p"].includes(String(req.body.resolution)) ? String(req.body.resolution) : "720p";
    const ratio = String(req.body.aspect_ratio || "16:9");
    const pixverseSizes = {
        "360p": { "16:9": [640,360], "4:3": [480,360], "1:1": [360,360], "3:4": [360,480], "9:16": [360,640] },
        "540p": { "16:9": [960,540], "4:3": [720,540], "1:1": [540,540], "3:4": [540,720], "9:16": [540,960] },
        "720p": { "16:9": [1280,720], "4:3": [960,720], "1:1": [720,720], "3:4": [720,960], "9:16": [720,1280] },
        "1080p": { "16:9": [1920,1080], "4:3": [1440,1080], "1:1": [1080,1080], "3:4": [1080,1440], "9:16": [1080,1920] }
    };
    const [baseW, baseH] = (pixverseSizes[safeResolution] || pixverseSizes["720p"])[ratio] || (pixverseSizes[safeResolution] || pixverseSizes["720p"])["16:9"];
    const request = {
        taskType: "videoInference",
        model: "pixverse:1@8",
        positivePrompt: String(prompt || req.body.prompt || "").trim().slice(0, 5000),
        duration: safeDuration,
        includeCost: true,
        ...(Number.isInteger(Number(req.body.seed)) && String(req.body.seed ?? "").trim() !== "" && Number(req.body.seed) >= 0 ? { seed: Number(req.body.seed) } : {}),
        settings: {
            audio: req.body.settings?.audio ?? req.body.enable_audio === true,
            ...(!sourceVideo ? {
                multiClip: req.body.settings?.multiClip === true,
                ...( ["anime", "3d_animation", "clay", "comic", "cyberpunk"].includes(req.body.settings?.style) ? { style: req.body.settings.style } : {}),
                thinking: ["enabled", "disabled", "auto"].includes(req.body.settings?.thinking) ? req.body.settings.thinking : "auto"
            } : {})
        },
        ...(typeof req.body.negativePrompt === "string" && req.body.negativePrompt.trim() ? { negativePrompt: req.body.negativePrompt.trim().slice(0, 2048) } : {})
    };
    if (sourceVideo) {
        request.inputs = { video: sourceVideo };
        request.resolution = safeResolution;
    } else if (sourceStart || sourceEnd) {
        request.inputs = { frameImages: sourceStart && sourceEnd
            ? [sourceStart, { image: sourceEnd, frame: "last" }]
            : sourceStart ? [sourceStart] : [{ image: sourceEnd, frame: "last" }] };
        request.resolution = safeResolution;
        if (request.inputs.frameImages.length > 1 && request.settings.thinking === "auto") request.settings.thinking = "enabled";
    } else {
        request.width = baseW;
        request.height = baseH;
    }
    if (!request.positivePrompt) throw new Error("PixVerse V6 : le prompt est vide.");
    console.log("ðŸŽ¬ [RUNWARE PIXVERSE V6]", JSON.stringify(request, null, 2));
    const [result] = await runware.run(request);
    const videoURL = result.videoURL || result.videoDataURI || result.videoBase64Data;
    if (!videoURL) throw new Error("Runware PixVerse V6 n'a retournÃ© aucune vidÃ©o.");
    return await completeRunwareVideo(result, engineId);
}

// ============================================================
// SEEDANCE 2.5 â€” RUNWARE
// Jusqu'Ã  30 images, 10 vidÃ©os et 10 audios de rÃ©fÃ©rence.
// ============================================================
else if (engineId === "seedance25") {
    const runware = await getRunwareClient();
    const toPublicUrl = (url) => {
        if (typeof url !== "string" || !url.trim()) return null;
        if (url.includes("localhost:5000") || url.includes("127.0.0.1:5000")) {
            return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, process.env.PUBLIC_API_URL || "https://eclipse-ai.onrender.com");
        }
        return url;
    };
    const cleanList = (arr, max) => [...new Set((Array.isArray(arr) ? arr : [])
        .filter(u => typeof u === "string" && u.trim())
        .map(toPublicUrl)
        .filter(Boolean))].slice(0, max);
    const images = cleanList(req.body.referenceImages, 30);
    const videos = cleanList(req.body.referenceVideos, 10);
    const audios = cleanList(req.body.referenceAudios, 10);
    const sourceVideo = toPublicUrl(req.body.video_url || req.body.videoSource || req.body.video || null);
    const start = toPublicUrl(req.body.start_image_url || req.body.startImage || req.body.image_url || null);
    const end = toPublicUrl(req.body.end_image_url || null);
    const operation = sourceVideo && req.body.settings?.operation === "edit" ? "edit" : sourceVideo ? "extend" : null;
    const rawSeedance25Prompt = String(prompt || req.body.prompt || "").trim();
    const seedance25Prompt = operation === "edit"
        ? ["Edit the provided source video according to the following instruction. Preserve everything not explicitly changed.", rawSeedance25Prompt].filter(Boolean).join("\n")
        : operation === "extend"
            ? ["Continue the provided source video with a seamless continuation, preserving character, scene, style and motion.", rawSeedance25Prompt].filter(Boolean).join("\n")
            : rawSeedance25Prompt;
    const resolutionAliases = {
        "sd": "480p",
        "480p": "480p",
        "hd": "720p",
        "720p": "720p",
        "full hd": "1080p",
        "fhd": "1080p",
        "1080p": "1080p"
    };
    const requestedResolution = String(req.body.resolution || "720p").trim().toLowerCase();
    const safeResolution = resolutionAliases[requestedResolution] || "720p";
    const durationValue = operation === "edit" ? "auto" : Math.max(4, Math.min(30, parseInt(req.body.duration, 10) || 5));
    const request = {
        taskType: "videoInference",
        model: "bytedance:seedance@2.5",
        ...(seedance25Prompt ? { positivePrompt: seedance25Prompt.slice(0, 10000) } : {}),
        duration: durationValue,
        includeCost: true,
        ...(Number.isInteger(Number(req.body.seed)) && String(req.body.seed ?? "").trim() !== "" && Number(req.body.seed) >= 0 && Number(req.body.seed) <= 4294967295 ? { seed: Number(req.body.seed) } : {}),
        settings: {
            audio: req.body.settings?.audio !== false,
            ...(operation ? { operation } : {})
        }
    };

    if (sourceVideo) {
        // Video-to-video : la rÃ©solution choisit la qualitÃ©, l'aspect reste celui de la vidÃ©o source.
        request.inputs = { video: sourceVideo };
        request.resolution = safeResolution;
    } else if (start || end) {
        // frameImages exige toujours une premiÃ¨re image. Une image de fin seule est traitÃ©e comme rÃ©fÃ©rence.
        if (start) {
            request.inputs = { frameImages: start && end
                ? [{ image: start, frame: "first" }, { image: end, frame: "last" }]
                : [{ image: start, frame: "first" }] };
            request.resolution = safeResolution;
        } else {
            request.inputs = {
                referenceImages: [...new Set([end, ...images].filter(Boolean))].slice(0, 30),
                ...(videos.length ? { referenceVideos: videos } : {}),
                ...(audios.length ? { referenceAudios: audios } : {})
            };
            const aspect = String(req.body.aspect_ratio || "16:9");
            const sizesByTier = {
                "480p": { "16:9": [854,480], "9:16": [480,854], "1:1": [640,640], "4:3": [752,560], "3:4": [560,752], "21:9": [992,432] },
                "720p": { "16:9": [1280,720], "9:16": [720,1280], "1:1": [960,960], "4:3": [1112,834], "3:4": [834,1112], "21:9": [1470,630] },
                "1080p": { "16:9": [1920,1080], "9:16": [1080,1920], "1:1": [1440,1440], "4:3": [1664,1248], "3:4": [1248,1664], "21:9": [2206,946] }
            };
            [request.width, request.height] = sizesByTier[safeResolution][aspect] || sizesByTier[safeResolution]["16:9"];
        }
    } else if (images.length || videos.length || audios.length) {
        request.inputs = {
            ...(images.length ? { referenceImages: images } : {}),
            ...(videos.length ? { referenceVideos: videos } : {}),
            ...(audios.length ? { referenceAudios: audios } : {})
        };
        const aspect = String(req.body.aspect_ratio || "16:9");
        const sizesByTier = {
            "480p": { "16:9": [854,480], "9:16": [480,854], "1:1": [640,640], "4:3": [752,560], "3:4": [560,752], "21:9": [992,432] },
            "720p": { "16:9": [1280,720], "9:16": [720,1280], "1:1": [960,960], "4:3": [1112,834], "3:4": [834,1112], "21:9": [1470,630] },
            "1080p": { "16:9": [1920,1080], "9:16": [1080,1920], "1:1": [1440,1440], "4:3": [1664,1248], "3:4": [1248,1664], "21:9": [2206,946] }
        };
        [request.width, request.height] = sizesByTier[safeResolution][aspect] || sizesByTier[safeResolution]["16:9"];
    } else {
        const aspect = String(req.body.aspect_ratio || "16:9");
        const sizesByTier = {
            "480p": { "16:9": [854,480], "9:16": [480,854], "1:1": [640,640], "4:3": [752,560], "3:4": [560,752], "21:9": [992,432] },
            "720p": { "16:9": [1280,720], "9:16": [720,1280], "1:1": [960,960], "4:3": [1112,834], "3:4": [834,1112], "21:9": [1470,630] },
            "1080p": { "16:9": [1920,1080], "9:16": [1080,1920], "1:1": [1440,1440], "4:3": [1664,1248], "3:4": [1248,1664], "21:9": [2206,946] }
        };
        [request.width, request.height] = sizesByTier[safeResolution][aspect] || sizesByTier[safeResolution]["16:9"];
    }

    if (!request.positivePrompt && !request.inputs) throw new Error("Seedance 2.5 : le prompt est obligatoire sans mÃ©dia de rÃ©fÃ©rence.");
    console.log("ðŸŽ¬ [RUNWARE SEEDANCE 2.5]", JSON.stringify(request, null, 2));
    const [result] = await runware.run(request);
    const videoURL = result.videoURL || result.videoDataURI || result.videoBase64Data;
    if (!videoURL) throw new Error("Runware Seedance 2.5 n'a retournÃ© aucune vidÃ©o.");
    return await completeRunwareVideo(result, engineId);
}
// ============================================================
// SEEDANCE 2.0 â€” RUNWARE
// Jusqu'Ã  9 images, 3 vidÃ©os et 3 audios de rÃ©fÃ©rence.
// ============================================================
else if (engineId === "seedance20") {
    const runware = await getRunwareClient();
    const toPublicUrl = (url) => {
        if (typeof url !== "string" || !url.trim()) return null;
        if (url.includes("localhost:5000") || url.includes("127.0.0.1:5000")) return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, process.env.PUBLIC_API_URL || "https://eclipse-ai.onrender.com");
        return url;
    };
    const cleanList = (arr, max) => [...new Set((Array.isArray(arr) ? arr : []).filter(u => typeof u === "string" && u.trim()).map(toPublicUrl).filter(Boolean))].slice(0, max);
    const images = cleanList(req.body.referenceImages, 9);
    const requestedVideos = cleanList(req.body.referenceVideos, 3);
    const requestedAudios = cleanList(req.body.referenceAudios, 3);
    const sourceVideo = toPublicUrl(req.body.video_url || req.body.videoSource || null);
    if (images.length + requestedVideos.length + requestedAudios.length + (sourceVideo ? 1 : 0) > 12) {
        throw new Error("Seedance 2.0 : 12 fichiers de rÃ©fÃ©rence maximum au total (images, vidÃ©os et audios combinÃ©s).");
    }
    let referenceBudget = Math.max(0, 12 - images.length - (sourceVideo ? 1 : 0));
    const videos = requestedVideos.slice(0, Math.min(sourceVideo ? 2 : 3, referenceBudget));
    referenceBudget -= videos.length;
    const audios = requestedAudios.slice(0, Math.min(3, referenceBudget));
    const start = toPublicUrl(req.body.start_image_url || req.body.startImage || req.body.image_url || null);
    const end = toPublicUrl(req.body.end_image_url || null);
    const request = {
        taskType: "videoInference",
        model: "bytedance:seedance@2.0",
        ...(String(prompt || req.body.prompt || "").trim() ? { positivePrompt: String(prompt || req.body.prompt || "").trim().slice(0, 10000) } : {}),
        duration: Math.max(4, Math.min(15, parseInt(req.body.duration, 10) || 5)),
        includeCost: true,
        ...(Number.isInteger(Number(req.body.seed)) && String(req.body.seed ?? "").trim() !== "" && Number(req.body.seed) >= 0 && Number(req.body.seed) <= 4294967295 ? { seed: Number(req.body.seed) } : {}),
        settings: { audio: req.body.settings?.audio !== false }
    };
    if (sourceVideo || images.length || videos.length || audios.length) {
        // Seedance 2.0 audio-reference mode requires at least one image or video reference.
        const referenceVideos = [...new Set([...(sourceVideo ? [sourceVideo] : []), ...videos])].slice(0, 3);
        const hasVisual = images.length > 0 || referenceVideos.length > 0;
        if (audios.length && !hasVisual) throw new Error("Seedance 2.0 : une rÃ©fÃ©rence audio nÃ©cessite au moins une image ou une vidÃ©o de rÃ©fÃ©rence.");
        request.inputs = {
            ...(images.length ? { referenceImages: images } : {}),
            ...(referenceVideos.length ? { referenceVideos } : {}),
            ...(audios.length ? { referenceAudios: audios } : {})
        };
        const aspect = String(req.body.aspect_ratio || "16:9");
        const tier = ["480p", "720p", "1080p", "4k"].includes(String(req.body.resolution).toLowerCase()) ? String(req.body.resolution).toLowerCase() : "720p";
        const sizesByTier = {
            "480p": { "16:9": [864,496], "9:16": [496,864], "1:1": [640,640], "4:3": [752,560], "3:4": [560,752], "21:9": [992,432] },
            "720p": { "16:9": [1280,720], "9:16": [720,1280], "1:1": [960,960], "4:3": [1112,834], "3:4": [834,1112], "21:9": [1470,630] },
            "1080p": { "16:9": [1920,1080], "9:16": [1080,1920], "1:1": [1440,1440], "4:3": [1664,1248], "3:4": [1248,1664], "21:9": [2206,946] },
            "4k": { "16:9": [3840,2160], "9:16": [2160,3840], "1:1": [2880,2880], "4:3": [3326,2494], "3:4": [2496,3328], "21:9": [4398,1886] }
        };
        [request.width, request.height] = (sizesByTier[tier][aspect] || sizesByTier[tier]["16:9"]);
    } else if (start || end) {
        request.inputs = { frameImages: start && end
            ? [start, { image: end, frame: "last" }]
            : start ? [start] : [{ image: end, frame: "last" }] };
        request.resolution = ["480p", "720p", "1080p", "4k"].includes(String(req.body.resolution).toLowerCase()) ? String(req.body.resolution).toLowerCase() : "720p";
    } else {
        const aspect = String(req.body.aspect_ratio || "16:9");
        const tier = ["480p", "720p", "1080p", "4k"].includes(String(req.body.resolution).toLowerCase()) ? String(req.body.resolution).toLowerCase() : "720p";
        const sizesByTier = {
            "480p": { "16:9": [864,496], "9:16": [496,864], "1:1": [640,640], "4:3": [752,560], "3:4": [560,752], "21:9": [992,432] },
            "720p": { "16:9": [1280,720], "9:16": [720,1280], "1:1": [960,960], "4:3": [1112,834], "3:4": [834,1112], "21:9": [1470,630] },
            "1080p": { "16:9": [1920,1080], "9:16": [1080,1920], "1:1": [1440,1440], "4:3": [1664,1248], "3:4": [1248,1664], "21:9": [2206,946] },
            "4k": { "16:9": [3840,2160], "9:16": [2160,3840], "1:1": [2880,2880], "4:3": [3326,2494], "3:4": [2496,3328], "21:9": [4398,1886] }
        };
        [request.width, request.height] = (sizesByTier[tier][aspect] || sizesByTier[tier]["16:9"]);
    }
    if (!request.positivePrompt) throw new Error("Seedance 2.0 : le prompt est obligatoire.");
    console.log("ðŸŽ¬ [RUNWARE SEEDANCE 2.0]", JSON.stringify(request, null, 2));
    const [result] = await runware.run(request);
    const videoURL = result.videoURL || result.videoDataURI || result.videoBase64Data;
    if (!videoURL) throw new Error("Runware Seedance 2.0 n'a retournÃ© aucune vidÃ©o.");
    return await completeRunwareVideo(result, engineId);
}

// --- Logic Seedance 1.5 ---
else if (engineId === "seedance") {
    const sourceImage = validImg || req.body.image_url || req.body.start_image_url || null;
    const sourceEndImage = req.body.end_image_url || null;

    const currentDuration = parseInt(req.body.duration) || 5;
    
    const hasImages = sourceImage || sourceEndImage;
    targetEngineId = hasImages 
        ? "fal-ai/bytedance/seedance/v1.5/pro/image-to-video" 
        : "fal-ai/bytedance/seedance/v1.5/pro/text-to-video";
    
    finalInput.prompt = prompt;
    finalInput.aspect_ratio = req.body.aspect_ratio || "16:9";
    finalInput.resolution = req.body.resolution || "720p";
    finalInput.duration = currentDuration;
    finalInput.generate_audio = true;

    if (sourceImage) {
        finalInput.image_url = sourceImage;
    }
    if (sourceEndImage) {
        finalInput.end_image_url = sourceEndImage;
    }
}



// Fal.ai est volontairement rÃ©servÃ© au seul moteur Seedance 1.5 Pro.
        if (engineId !== "seedance") {
            throw new Error(`Moteur vidÃ©o non raccordÃ© Ã  Runware : ${engineId}`);
        }

// --- APPEL FAL.AI : SEEDANCE 1.5 PRO UNIQUEMENT ---
        res.write(`data: ${JSON.stringify({ percent: 30, message: "Envoi Ã  la file de rendu..." })}\n\n`);

        const falResult = await fal.subscribe(targetEngineId, {
            input: finalInput,
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    res.write(`data: ${JSON.stringify({ percent: 60, message: "Rendu vidÃ©o en cours..." })}\n\n`);
                }
            }
        });

const falVideoUrl = 
    falResult.video?.url || 
    falResult.video_url || 
    falResult.data?.video?.url || 
    falResult.data?.url || 
    falResult.url;

if (!falVideoUrl) {
    throw new Error("Fal.ai n'a renvoyÃ© aucune URL de vidÃ©o.");
}

     // 1ï¸âƒ£ Mise Ã  jour du verrou
        await lockRef.update({
            status: "completed",
            videoUrl: falVideoUrl,
            url: falVideoUrl,
            prompt: prompt || "",
            description: prompt || "",
            completedAt: FieldValue.serverTimestamp()
        });

        // 2ï¸âƒ£ ðŸ’¾ SAUVEGARDE FIRESTORE : Ajout Ã  l'historique utilisateur
        if (userId) {
            await db.collection("users").doc(userId).collection("generations").add({
                videoUrl: falVideoUrl,
                prompt: prompt || "",
                description: prompt || "",
                engine: targetEngineId || engineId || "fal.ai",
                createdAt: FieldValue.serverTimestamp()
            });
            console.log(`ðŸ’¾ VidÃ©o ajoutÃ©e Ã  l'historique de l'utilisateur : ${userId}`);
        } else {
            console.warn("âš ï¸ Impossible d'enregistrer la vidÃ©o : userId est introuvable.");
        }

        // 3ï¸âƒ£ Envoi du message SSE de fin au client
        res.write(`data: ${JSON.stringify({ 
            percent: 100, 
            videoUrl: falVideoUrl, 
            url: falVideoUrl, 
            status: "completed", 
            message: "GÃ©nÃ©ration terminÃ©e !" 
        })}\n\n`);

        res.end();
        

} catch (error) {
        console.error("âŒ Erreur dans le flux de gÃ©nÃ©ration :", error.message);

// ðŸ›¡ï¸ SÃ‰CURITÃ‰ : Remboursement SEULEMENT si dÃ©bitÃ© ET non terminÃ© ET pas encore remboursÃ©
        if (creditsDebited && !generationFinished && !refundDone) {
            refundDone = true;
            console.log("ðŸ”„ Ã‰chec aprÃ¨s dÃ©bit -> Remboursement des crÃ©dits...");
            try {
                await db.runTransaction(async (transaction) => {
                    const uDoc = await transaction.get(userRef);
                    if (uDoc.exists) {
                        // ðŸŽ¯ CALCUL CHIRURGICAL DU MONTANT Ã€ REMBOURSER
                        const amountToRefund = Number(cost) || 15;

                        // Si deductedDiamonds a une valeur > 0 OU si usedWallet Ã©tait packTokens, on crÃ©dite les diamants.
                        // Sinon, si on sait que les tokens Ã©taient Ã  0, c'Ã©tait forcÃ©ment les packTokens !
                        const wasPackTokens = usedWallet === "packTokens" || (deductedDiamonds && deductedDiamonds > 0) || (uDoc.data()?.tokens === 0);

                        if (usedWallet === "hybrid") {
                            transaction.update(userRef, {
                                tokens: FieldValue.increment(deductedTokens || 0),
                                packTokens: FieldValue.increment(deductedDiamonds || amountToRefund)
                            });
                        } else if (wasPackTokens) {
                            transaction.update(userRef, {
                                packTokens: FieldValue.increment(deductedDiamonds || amountToRefund)
                            });
                        } else {
                            transaction.update(userRef, {
                                tokens: FieldValue.increment(deductedTokens || amountToRefund)
                            });
                        }
                    }
                });
                console.log("ðŸª™ Remboursement effectuÃ© avec succÃ¨s.");
            } catch (refundErr) {
                console.error("âŒ Ã‰chec lors du remboursement :", refundErr.message);
            }
        } else if (!creditsDebited) {
            console.log("ðŸ›‘ Aucun remboursement : Les crÃ©dits n'avaient pas Ã©tÃ© dÃ©bitÃ©s.");
        }

        // Nettoyage du verrou
        await lockRef.delete().catch(() => {});

        // Envoi de l'erreur au client
        if (!res.headersSent) {
            return res.status(400).json({ error: error.message });
        } else if (!res.writableEnded) {
            res.write(`event: error\ndata: ${JSON.stringify({ error: error.message, status: "failed" })}\n\n`);
            res.end();
        }
    }
});

// ==========================================
// ðŸ“Œ ROUTES OTP 
// ==========================================
app.post('/api/send-otp', limiter, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email manquant" });

    const trimmedEmail = email.trim();

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', trimmedEmail).get();

        let userDocRef;
        let userId;

        if (snapshot.empty) {
            // ðŸš€ Si le document n'existe pas encore dans Firestore, on le crÃ©e automatiquement
            const newUserRef = usersRef.doc(); // CrÃ©e un nouvel ID automatique
            await newUserRef.set({
                email: trimmedEmail,
                userPlan: 'dÃ©butant',
                tokens: 0,
                createdAt: new Date()
            });
            userDocRef = newUserRef;
            userId = newUserRef.id;
        } else {
            const userDoc = snapshot.docs[0];
            userDocRef = userDoc.ref;
            userId = userDoc.id;
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        await userDocRef.update({
            otpCode: otpCode,
            otpExpires: expiresAt
        });


// ðŸš€ 1. Envoi du code de vÃ©rification Ã  l'utilisateur
const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        sender: { name: "Ovortex", email: process.env.SENDER_EMAIL },
        to: [{ email: trimmedEmail }],
        subject: 'Votre code de vÃ©rification Ovortex',
        htmlContent: `<p>Votre code de sÃ©curitÃ© Ã  usage unique est : <strong>${otpCode}</strong>. Il est valable 5 minutes.</p>`
    })
});

const brevoData = await brevoResponse.json();

if (!brevoResponse.ok) {
    throw new Error(brevoData.message || "Erreur lors de l'envoi de l'e-mail via Brevo");
}

// ðŸš€ 2. Envoi d'une notification Ã  l'administrateur
await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        sender: { name: "Ovortex Alerte", email: process.env.SENDER_EMAIL },
        to: [{ email: process.env.ADMIN_EMAIL }], // ðŸ‘ˆ RÃ©cupÃ©rÃ© via les variables sÃ©curisÃ©es
        subject: 'Nouvelle tentative de connexion / inscription',
        htmlContent: `<p>Une personne vient de demander un code de vÃ©rification sur Ovortex avec l'e-mail : <strong>${trimmedEmail}</strong></p>`
    })
});

        res.json({ success: true, message: "Code envoyÃ© par e-mail.", userId });
    } catch (error) {
        console.error("âŒ Erreur envoi OTP :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du code." });
    }
});
app.post('/api/verify-otp', limiter, async (req, res) => {
    const { userId, code, rememberDevice } = req.body; // ðŸ‘ˆ 1. On rÃ©cupÃ¨re rememberDevice
    if (!userId || !code) return res.status(400).json({ error: "DonnÃ©es manquantes" });

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        const userData = userDoc.data();

        if (!userData.otpCode || userData.otpCode !== code || Date.now() > userData.otpExpires) {
            return res.status(400).json({ error: "Code invalide ou expirÃ©." });
        }

        // Nettoyage de l'OTP
        const updateData = {
            otpCode: null,
            otpExpires: null
        };

        let trustedToken = null;

        // ðŸš€ 2. Si l'utilisateur a cochÃ© "Se souvenir de moi"
        if (rememberDevice) {
            const crypto = require('crypto');
            trustedToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

            // On stocke le jeton de confiance dans le document de l'utilisateur (ou une collection dÃ©diÃ©e)
            updateData.trustedDeviceToken = trustedToken;
            updateData.trustedDeviceExpires = expiresAt;
        }

        await userRef.update(updateData);

        // 3. On renvoie le token au client s'il existe
        res.json({ 
            success: true, 
            message: "Code validÃ© avec succÃ¨s.",
            trustedToken // ðŸ‘ˆ Transmis au frontend
        });
    } catch (error) {
        console.error("âŒ Erreur validation OTP :", error);
        res.status(500).json({ error: "Erreur serveur lors de la validation." });
    }
});

// --- ROUTE DE RÃ‰SILIATION D'ABONNEMENT ---
app.post('/cancel-subscription', limiter, authenticateUser, async (req, res) => {
    const userId = req.user.uid;

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvÃ©." });
        }

        const userData = userDoc.data();
        const subscriptionId = userData.stripeSubscriptionId;

        if (!subscriptionId) {
            return res.status(400).json({ error: "Aucun abonnement Stripe actif trouvÃ© pour cet utilisateur." });
        }

        // 1. CONFIGURER L'ANNULATION A LA FIN DE LA PÃ‰RIODE
        // On ne supprime PAS l'abonnement immÃ©diatement. On dit Ã  Stripe d'arrÃªter le renouvellement.
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true // ðŸ‘ˆ C'EST LA CLÃ‰
        });

        // 2. MISE Ã€ JOUR FIRESTORE - ON NE TOUCHE PAS AU PLAN
        // Le statut passe Ã  'canceling'. Ton webhook recevra bientÃ´t un Ã©vÃ©nement
        // customer.subscription.updated confirmant que l'annulation est planifiÃ©e.
        await userRef.update({
            subscriptionStatus: 'canceling', // Statut intermÃ©diaire
            // userPlan: 'dÃ©butant', // ðŸ‘ˆ COMMENTE OU SUPPRIME CETTE LIGNE
        });

        console.log(`âœ… Annulation planifiÃ©e Ã  la fin de la pÃ©riode pour ${subscriptionId} (Utilisateur ${userId})`);
        return res.json({ success: true, message: "Votre abonnement a Ã©tÃ© rÃ©siliÃ©. Vous continuerez d'en profiter jusqu'Ã  la fin de votre pÃ©riode payÃ©e." });

    } catch (error) {
        console.error("âŒ Erreur lors de la rÃ©siliation Stripe :", error.message);
        return res.status(500).json({ error: "Erreur interne lors de la rÃ©siliation de l'abonnement." });
    }
});

app.get('/api/check-active-generation', authenticateUser, async (req, res) => {
    const userId = req.user.uid;

    try {
        const snapshot = await db.collection('imageLocks')
            .where("userId", "==", userId)
            .where("status", "==", "processing")
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.json({ hasActive: false });
        }

        const lockData = snapshot.docs[0].data();
        return res.json({
            hasActive: true,
            lock: lockData
        });
    } catch (err) {
        console.error("Erreur vÃ©rification verrou :", err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
});
// Route pour lister les vidÃ©os
app.get('/api/list-videos', authenticateUser, (req, res) => {
        const videoDir = path.join(__dirname, 'public', 'videos');
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
    
    fs.readdir(videoDir, (err, files) => {
        if (err) return res.status(500).json({ error: "Erreur lecture" });
        res.json(files.filter(file => file.endsWith('.mp4')));
    });
});

// Route pour servir les fichiers vidÃ©o en statique
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// --- ROUTE POUR SUPPRIMER UNE GÃ‰NÃ‰RATION DE IMAGE-LOCKS ---
app.delete('/api/generations/:userId/:generationId', authenticateUser, async (req, res) => {
    const { userId, generationId } = req.params;

    // ðŸ›¡ï¸ SÃ©curitÃ© : On s'assure que l'utilisateur connectÃ© est bien celui qu'il prÃ©tend Ãªtre
    if (req.user.uid !== userId) {
        return res.status(403).json({ error: "AccÃ¨s refusÃ© : Action non autorisÃ©e." });
    }

    try {
        // Optionnel mais conseillÃ© : vÃ©rifier dans Firestore si le document appartient bien Ã  cet utilisateur avant de le supprimer
        const lockRef = db.collection("imageLocks").doc(generationId);
        const lockDoc = await lockRef.get();

        if (lockDoc.exists && lockDoc.data().userId !== userId) {
            return res.status(403).json({ error: "Action interdite sur cette ressource." });
        }

        await lockRef.delete();
        console.log(`ðŸ—‘ï¸ Document ${generationId} supprimÃ© avec succÃ¨s de la collection imageLocks`);
        
        return res.json({ success: true });
    } catch (error) {
        console.error("âŒ Erreur lors de la suppression dans imageLocks :", error);
        return res.status(500).json({ error: "Erreur serveur lors de la suppression" });
    }
});

// --- DÃ‰MARRAGE DU SERVEUR ---
recoverInterruptedGenerations()
    .then(() => console.log("âœ… VÃ©rification des gÃ©nÃ©rations interrompues terminÃ©e"))
    .catch(err => console.error("âŒ Erreur rÃ©cupÃ©ration gÃ©nÃ©rations :", err));

const PORT = process.env.PORT || 5000;
// --- TÃ‚CHE PLANIFIÃ‰E : RECHARGEMENT DES CRÃ‰DITS ET EXPIRATION DES PACKS ---
// S'exÃ©cute automatiquement au dÃ©but de chaque heure (ex: 14h00, 15h00...)

cron.schedule('0 * * * *', async () => {

    console.log("â° [CRON] VÃ©rification des rÃ©initialisations de crÃ©dits...");

    const now = Timestamp.now();

    try {

        // 1. RÃ©initialisation des abonnements actifs
        const expiredSubs = await db.collection('users')
            .where('subscriptionStatus', '==', 'active')
            .where('tokensResetDate', '<=', now)
            .get();


        const creditsByPlan = { 
            essentiel: 3000, 
            standard: 7000, 
            master: 12000, 
            elite: 25000, 
            legende: 80000 
        };


        for (const doc of expiredSubs.docs) {

            const data = doc.data();

            const plan = (data.userPlan || '').toLowerCase();

            const baseCredits = creditsByPlan[plan] || 3000;


            // RÃ©cupÃ©ration du type d'abonnement
            const interval = data.subscriptionInterval || "month";


            // Annuel = pack complet pour l'annÃ©e
            // Mensuel = crÃ©dits du mois
            const tokensToAdd = interval === "yearly"
                ? baseCredits * 12
                : baseCredits;


            const resetDays = interval === "yearly"
                ? 365
                : 30;


            const nextReset = new Date(
                Date.now() + (resetDays * 24 * 60 * 60 * 1000)
            );


            await doc.ref.update({

                tokens: tokensToAdd,

                tokensResetDate: Timestamp.fromDate(nextReset)

            });


            console.log(
                `âš¡ [CRON] Renouvellement ${interval} pour ${data.email} : ${tokensToAdd} Ã©clairs`
            );
        }



        // 2. Expiration des Diamants aprÃ¨s 1 an
        const expiredPacks = await db.collection('users')
            .where('packExpiryDate', '<=', now)
            .where('packTokens', '>', 0)
            .get();


        for (const doc of expiredPacks.docs) {

            await doc.ref.update({
                packTokens: 0
            });

            console.log(`ðŸ’Ž [CRON] Diamants expirÃ©s pour ${doc.id}`);
        }



        // 3. Downgrade des abonnements rÃ©ellement terminÃ©s
const expiredCanceledSubs = await db.collection('users')
    .where('subscriptionStatus', 'in', [
        'canceled',
        'unpaid',
        'canceling' 
    ])
            .where('tokensResetDate', '<=', now)
            .get();



        for (const doc of expiredCanceledSubs.docs) {

            console.log(
                `â° [CRON] Fin abonnement, downgrade ${doc.id}`
            );


            await doc.ref.update({

                userPlan: 'dÃ©butant',

                tokens: 0,

                tokensResetDate: null

            });

        }


    } catch(err){

        console.error(
            "âŒ [CRON] Erreur lors de la vÃ©rification :",
            err.message
        );

    }

});
const server = app.listen(PORT, () => {
    console.log(`ðŸš€ Serveur en ligne et Ã  l'Ã©coute sur http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('âŒ Rejet de promesse non gÃ©rÃ© :', reason);
});

process.on('uncaughtException', (error) => {
    console.error('ðŸ’¥ Exception non capturÃ©e :', error);
});

server.timeout = 600000;
server.keepAliveTimeout = 600000;

setInterval(() => {}, 1000 * 60 * 60);
