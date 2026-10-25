require('dotenv').config();
console.log(
    "🔑 RUNWARE_API_KEY :",
    process.env.RUNWARE_API_KEY ? "PRÉSENTE" : "ABSENTE"
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
        console.error("❌ Impossible de charger @runware/sdk :", error);
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

        console.log("✅ Runware connecté");
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

console.log("✅ Firebase Admin initialisé avec succès");
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

console.log("🛠️ FFMPEG configuré :", ffmpegPath);
/*
============================================================
ANCIEN SYSTÈME GOOGLE VEO / VERTEX AI
CONSERVÉ POUR RETOUR EN ARRIÈRE
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
        console.warn("⚠️ Aucun token reCAPTCHA reçu.");
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

        const tokenProperties = response.tokenProperties;

        if (!tokenProperties?.valid) {
            const invalidReason = tokenProperties?.invalidReason;

            console.warn(
                `⚠️ Jeton reCAPTCHA invalide : ${invalidReason || "RAISON_INCONNUE"}`
            );

            // BROWSER_ERROR = problème temporaire côté navigateur/réseau.
            // Ce n'est PAS une preuve que l'utilisateur est un bot.
            if (invalidReason === "BROWSER_ERROR") {
                console.warn(
                    "🔄 BROWSER_ERROR reCAPTCHA : nouveau token nécessaire côté navigateur."
                );

                return "retry";
            }

            // Les autres tokens réellement invalides restent bloqués.
            return false;
        }

        const score = Number(response.riskAnalysis?.score ?? 0);

        console.log(`🛡️ Score reCAPTCHA reçu : ${score}`);

        return score >= 0.5;

    } catch (error) {
        console.error(
            "❌ Erreur technique reCAPTCHA :",
            error.message
        );

        // On conserve ton comportement actuel en cas de panne
        // technique de l'API Google.
        return true;
    }
}

// 🛡️ MIDDLEWARE D'AUTHENTIFICATION :
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(
    "🔍 Header Authorization reçu :",
    authHeader ? "Bearer présent ✅" : "Absent ❌"
);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Accès refusé : Token manquant." });
    }

const token = authHeader.substring(7).trim();
    try {
        // On utilise getAuth() ici au lieu de admin.auth()
const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken; // Contient .uid et les infos du user
        next();
   } catch (error) {
        console.error("=================================");
        console.error("❌ FIREBASE AUTH ERROR");
        console.error("CODE :", error.code);
        console.error("MESSAGE :", error.message);
        console.error("=================================");

        return res.status(401).json({
            error: "Accès refusé : Token invalide ou expiré."

        });
    }
};

// 🔄 VÉRIFICATION DES GÉNÉRATIONS EN COURS
async function recoverInterruptedGenerations() {

    console.log("🔎 Vérification des générations en cours...");

    const locks = await db.collection('imageLocks')
        .where("status", "==", "processing")
        .get();

    console.log("🔒 Nombre de locks trouvés :", locks.size);

    for (const doc of locks.docs) {

        const data = doc.data();

        console.log("LOCK TROUVE :", data);

        if (data.provider === "fal") {

            console.log(
                "⏳ Génération Fal toujours considérée active :",
                data.userId
            );
            // Pas de remboursement ici.
            // Fal peut encore être en train de générer.
            continue;
        }
        // Pour les autres fournisseurs éventuellement
        // on ne rembourse pas automatiquement non plus.
        console.log(
            "⚠️ Lock inconnu conservé :",
            data.userId
        );
    }
}



// --- CONFIGURATION EXPRESS & MIDDLEWARES ---
const SECURITY_TEST_MODE = process.env.SECURITY_TEST_MODE === 'true';
const app = express();
app.set('trust proxy', 1);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. HELMET ET CORS (S'appliquent à tout)
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

        // Autorise les requêtes sans Origin
        // (certains outils, tests serveur, etc.)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('🚫 CORS bloqué pour :', origin);
        return callback(new Error('Origin non autorisée par CORS'));
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));



// 2. RATE LIMITER (Protection contre le spam et les attaques par force brute)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre sur l'API
    message: "Trop de requêtes depuis cette IP, réessayez plus tard."
});

app.use('/api/', limiter);

// 2. ROUTE WEBHOOK STRIPE (OBLIGATOIREMENT AVANT express.json global !)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log("🔥 REQUÊTE WEBHOOK REÇUE !"); 
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Assure-toi d'avoir cette clé dans ton .env !
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("❌ Erreur Webhook détaillée :", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (!session.metadata || !session.metadata.userId) {
            console.error("⚠️ Webhook ignoré : userId absent");
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
    
    // On récupère l'intervalle envoyé depuis le front (ex: 'year' ou 'month')
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

            console.log(`✅ Livraison sécurisée pour ${userId}`);

        } catch (error) {
            console.error(`❌ Erreur Webhook Firestore:`, error);
            return res.status(500).json({ error: "Erreur base de données" });
        }
    }    

// ==============================================================================
    // GESTION EXPLICITE DES MISES À JOUR ET RÉSILIATIONS D'ABONNEMENT (CORRIGÉ)
    // ==============================================================================

// Gère le changement d'état (ex: annulation planifiée, échec de paiement, réactivation)
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object; 
        const userId = subscription.metadata.userId; 

        if (!userId) {
            console.error("⚠️ Webhook abonnement ignoré : userId absent des métadonnées");
            // On ne renvoie pas 400 pour deleted car l'user a pu être supprimé entre temps
            if (event.type !== 'customer.subscription.deleted') {
                return res.status(400).send("Metadata manquantes dans l'abonnement");
            }
        } else {
            try {
                console.log(`🔄 Traitement de l'abonnement pour ${userId} - Statut : ${subscription.status}, Annulation fin période : ${subscription.cancel_at_period_end}`);
                
                const userRef = db.collection('users').doc(userId);

                await db.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    
                    if (!userDoc.exists) {
                        throw new Error(`Utilisateur ${userId} introuvable pour la mise à jour de l'abonnement.`);
                    }

                    // 1. DÉTERMINATION DU STATUT DE PAIEMENT
                    let newStatus = subscription.status;

                    // Cas : L'utilisateur a demandé une résiliation, mais la période payée n'est pas finie
                    // C'est 'canceling'. On arrête les recharges automatiques, mais on garde l'accès.
                    if (subscription.cancel_at_period_end === true && subscription.status === 'active') {
                        newStatus = 'canceling'; 
                    }

                    // 2. GESTION CRITIQUE DE L'ACCÈS (userPlan)
                    // On ne downgrade l'utilisateur QUE si l'abonnement est COMPLÉTEMENT TERMINÉ (expired ou canceled)
                    
                    let userDocData = userDoc.data();
                    let finalUserPlan = userDocData.userPlan; // Par défaut, on garde le plan actuel

                    // Objet pour stocker les champs à mettre à jour dans Firestore
                    let updateFields = {
                        subscriptionStatus: newStatus, // Sera 'active', 'canceling' ou 'canceled'
                        userPlan: finalUserPlan // CONSERVÉ JUSQU'À LA FIN DE LA PÉRIODE PAYÉE, PUIS DOWNGRADÉ
                    };

                    // Si l'abonnement est complétement terminé
                    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                        console.log(`🔻 L'abonnement de ${userId} est TERMINÉ. Downgrade vers 'débutant'.`);
                        updateFields.userPlan = 'débutant';
                        updateFields.tokens = 0;
                        updateFields.tokensResetDate = null;
                    } 
                    // Si l'annulation est planifiée à la fin de la période, on conserve/met à jour la vraie date de fin Stripe
                    else if (subscription.cancel_at_period_end === true) {
                        const periodEndTimestamp = subscription.current_period_end * 1000;
                        updateFields.tokensResetDate = Timestamp.fromDate(new Date(periodEndTimestamp));
                        console.log(`📅 Annulation planifiée : tokensResetDate fixé au ${new Date(periodEndTimestamp).toISOString()}`);
                    }

                    // 3. MISE À JOUR FIRESTORE
                    console.log(`💾 Mise à jour Firestore ${userId} : Plan=${updateFields.userPlan}, StatutPaiement=${newStatus}`);
                    
                    transaction.update(userRef, updateFields);
                });
                console.log(`✅ Mise à jour de l'abonnement traitée avec succès pour ${userId}.`);

            } catch (error) {
                console.error(`❌ Erreur lors du traitement de l'abonnement Webhook:`, error);
                return res.status(500).json({ error: "Erreur base de données lors de la mise à jour de l'abonnement" });
            }
        }
    }

});

// 2. MIDDLEWARES GLOBAUX POUR TOUTES LES AUTRES ROUTES
app.use(express.json({ limit: '50mb' }));
app.use(hpp());
// ==========================================
// 📁 CONFIGURATION DE MULTER ET ROUTE D'UPLOAD
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

// Route d'upload pour recevoir les vidéos/images du front-end
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier reçu." });
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        console.log(`📁 Fichier uploadé avec succès : ${fileUrl}`);
        return res.json({ url: fileUrl });

    } catch (error) {
        console.error("❌ Erreur lors de l'upload :", error);
        return res.status(500).json({ error: "Erreur serveur lors de l'upload." });
    }
});
// ==========================================
// CONVERSION VIDÉO WEBM → MP4 H.264
// ==========================================

app.post('/api/convert-video', async (req, res) => {
    console.log('🚨 ROUTE CONVERT-VIDEO APPELÉE');
console.log('📦 BODY REÇU :', req.body);
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "Aucune URL vidéo reçue."
            });
        }

        console.log("🎬 Demande de conversion vidéo :", url);

        const fileName = path.basename(new URL(url).pathname);
        const inputPath = path.join(uploadDir, fileName);

        if (!fs.existsSync(inputPath)) {
            console.error("❌ Fichier source introuvable :", inputPath);

            return res.status(404).json({
                error: "Fichier vidéo source introuvable."
            });
        }

        const baseName = path.parse(fileName).name;
        const outputFileName = `${baseName}-mp4-${Date.now()}.mp4`;
        const outputPath = path.join(uploadDir, outputFileName);

        console.log("📥 Source :", inputPath);
        console.log("📤 Destination :", outputPath);

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
                process.stdout.write(`🎞️ ${message}`);
            }
        });

        ffmpeg.on('error', (error) => {
            console.error("❌ Impossible de lancer FFmpeg :", error);

            return res.status(500).json({
                error: "Impossible de lancer FFmpeg."
            });
        });

        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                console.error("❌ FFmpeg a échoué. Code :", code);
                console.error(stderr);

                return res.status(500).json({
                    error: "La conversion MP4 a échoué."
                });
            }

            if (!fs.existsSync(outputPath)) {
                console.error("❌ Le fichier MP4 n'a pas été créé.");

                return res.status(500).json({
                    error: "Le fichier MP4 n'a pas été créé."
                });
            }

            const protocol = req.protocol;
            const host = req.get('host');

            const fileUrl =
                `${protocol}://${host}/uploads/${outputFileName}`;

            console.log("✅ Conversion MP4 terminée :", fileUrl);

            return res.json({
                url: fileUrl,
                fileName: outputFileName,
                type: 'VIDEO',
                mimeType: 'video/mp4'
            });
        });

    } catch (error) {
        console.error("❌ Erreur conversion vidéo :", error);

        return res.status(500).json({
            error: "Erreur serveur lors de la conversion vidéo."
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
console.log("--- CONFIGURATION SDK VALIDÉE ---");

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
    res.flushHeaders(); // 💡 Ajout recommandé pour forcer l'envoi immédiat des en-têtes

    let percent = 0;
    const interval = setInterval(() => {
        percent += 20;
        
        // Sécurité : on vérifie que la connexion est toujours ouverte avant d'écrire
        if (res.writableEnded) {
            clearInterval(interval);
            return;
        }

        if (percent <= 100) {
            res.write(`data: ${JSON.stringify({ 
                percent: percent, 
                message: percent < 100 ? "Génération en cours..." : "Génération terminée !" 
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

    // 🛑 SÉCURITÉ ABSOLUE : Si le client coupe la connexion en plein milieu
    req.on('close', () => {
        console.log("⚠️ Simulation : Le client s'est déconnecté. Arrêt de la boucle.");
        clearInterval(interval);
    });
});
// --- ROUTE WEBHOOK (IMPÉRATIF : AVANT express.json) ---
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
    // Mensuel : 12,99€ / mois
    // Annuel : 124,99€ / an
    essentiel: {
        monthly: 'price_1UDmA0RupJs1FxZmYmxjcSQJ', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZm6hmEmeKM' // ex: price_1TPm... (à copier dans Stripe)
    },

   // --- PLAN STANDARD ---
    // Mensuel : 24,99€ / mois
    // Annuel : 239,99€ / an
    standard: {
        monthly: 'price_1UDmA1RupJs1FxZmX0FFHIWU', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZm6xVFUg4C'
    },

   // --- PLAN MASTER ---
    // Mensuel : 34,99€ / mois
    // Annuel : 335,99€ / an
    master: {
        monthly: 'price_1UDmA0RupJs1FxZmvpmAORIc', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZmvpmAORIc'
    },

  // --- PLAN ELITE ---
    // Mensuel : 59,99€ / mois
    // Annuel : 575,99€ / an
    elite: {
        monthly: 'price_1UDmA2RupJs1FxZmu8pbvOpZ', // Ton ID mensuel existant
        yearly: 'price_1UDmA1RupJs1FxZm5kGQt37H'
    },

   // --- PLAN LÉGENDE ---
    // Mensuel : 159,99€ / mois
    // Annuel : 1535,99€ / an
    legende: {
        monthly: 'price_1UDmA0RupJs1FxZmVAKQBgwL', // Ton ID mensuel existant
        yearly: 'price_1UDmA0RupJs1FxZm0XFxv2qa'
    }
};

// --- ROUTES STRIPE & DIAGNOSTIC ---
/*
============================================================
ANCIEN TEST GOOGLE VEO
CONSERVÉ POUR RETOUR EN ARRIÈRE
============================================================

app.get('/ping-veo', async (req, res) => {
    try {
        const modelName = 'veo-3.1-generate-preview';
        const operation = await ai.models.generateVideos({
            model: modelName,
            prompt: "A beautiful cinematic landscape, high quality, 8k", 
        });
        res.json({ status: "Connecté", operationName: operation.name });
    } catch (error) {
        res.status(500).json({ 
            error: "Échec de connexion au modèle", 
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
        
        // 🔒 SOURCE DE VÉRITÉ ABSOLUE : On récupère l'ID du token Firebase, plus du req.body !
        const userId = req.user.uid;

        if (amount === undefined || typeof amount !== 'number') {
            return res.status(400).json({ error: "Données invalides" });
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
        console.error("❌ Erreur /create-checkout-session :", e.message);
        res.status(500).json({ error: "Erreur lors de la création de session" });
    }
});

app.post('/create-subscription-session', limiter, authenticateUser, async (req, res) => {
        try {
        // Récupération des données envoyées par le Front-end
      // Récupération des données envoyées par le Front-end (le userId vient de l'authentification serveur)
      const { planId, interval = 'monthly', userId: bodyUserId } = req.body;
        const userId = req.user?.uid || bodyUserId;

        // Vérification de sécurité : les données obligatoires sont-elles là ?
        if (!planId) return res.status(400).json({ error: "Données manquantes (planId)" });
        // 1. Normalisation du nom du plan (retrait des accents et minuscules)
        // Ex: "Légende" -> "legende"
        const cleanPlanId = planId.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 2. Récupération de la configuration dans VOTRE NOUVEL OBJET "STRIPE_PRICE_IDS"
        // On cherche d'abord avec le nom normalisé (ex: 'legende'), sinon avec l'original (ex: 'legende' au cas où)
        const planPrices = STRIPE_PRICE_IDS[cleanPlanId] || STRIPE_PRICE_IDS[planId.toLowerCase()];

        let stripePriceId;

        // 3. Détermination de l'ID de prix Stripe (mensuel ou annuel)
        if (planPrices) {
            // Si le plan existe, on choisit 'yearly' ou 'monthly' (par défaut)
            stripePriceId = planPrices[interval] || planPrices['monthly'];
        }
        // Si planPrices est undefined, stripePriceId restera undefined

        // Vérification de sécurité : avons-nous trouvé un prix valide ?
        if (!stripePriceId) {
            console.error(`❌ [ROUTER] Prix Stripe introuvable pour : planId="${planId}" (nettoyé: "${cleanPlanId}"), interval="${interval}"`);
            return res.status(400).json({ error: "Ce plan d'abonnement ou cet intervalle n'est pas configuré." });
        }

        // 4. Création de la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: stripePriceId, quantity: 1 }],
            mode: 'subscription', // Mode OBLIGATOIRE pour les abonnements
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/pricing`, // Redirection si l'utilisateur annule
            
            // IMPORTANT : Ces métadonnées sont envoyées à votre Webhook pour livrer les tokens
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
        console.error("❌ [ROUTER] Erreur critique lors de la création de la session d'abonnement :", e);
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
        
        // 🔒 SÉCURITÉ : Vérifier que la session Stripe appartient bien à l'utilisateur connecté
        if (session.metadata?.userId && session.metadata.userId !== req.user.uid) {
            console.warn(`🛑 Tentative d'usurpation de paiement ! L'utilisateur ${req.user.uid} tente d'utiliser la session de ${session.metadata.userId}`);
            return res.status(403).json({ error: "Cette transaction ne vous appartient pas." });
        }

        if (session.payment_status === 'paid') {
            res.json({ 
                success: true, 
                mode: session.mode 
            });
        } else {
            res.status(403).json({ success: false, error: "Non payé" });
        }
    } catch (e) {
        console.error("❌ Erreur /verify-payment :", e.message);
        res.status(500).json({ error: "Erreur synchronisation" });
    }
});

// --- ROUTE DE REMBOURSEMENT INTERNE ---

app.post('/refund', limiter, async (req, res) => {
    // 🔒 1. Vérification de la clé secrète interne (le front-end ne l'a pas, seul le serveur la connaît)
    const internalKey = req.headers['x-internal-key'];
    if (!internalKey || internalKey !== process.env.INTERNAL_REFUND_KEY) {
        console.warn("⚠️ Tentative d'accès non autorisé à la route /refund bloquée.");
        return res.status(403).json({ error: "Accès strictement interdit." });
    }

    const { userId, cost, costType } = req.body;

    if (!userId || !cost || !costType) {
        return res.status(400).json({ error: "Paramètres de remboursement manquants." });
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const fieldToIncrement = costType === "diamonds" ? "packTokens" : "tokens";

        await userRef.update({
            [fieldToIncrement]: FieldValue.increment(parseInt(cost))
        });

        console.log(`💰 [Remboursement] ${cost} ${costType} recrédités à l'utilisateur ${userId}`);
        return res.json({ success: true, message: "Remboursement effectué avec succès." });
    } catch (error) {
        console.error("❌ Échec lors du remboursement sur le serveur :", error.message);
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
    { role: "system", content: "Tu es un expert en prompt engineering. Améliore le prompt de l'utilisateur pour qu'il soit plus détaillé et artistique. Donne UNIQUEMENT le prompt amélioré, sans introduction ni guillemets." },
    { role: "user", content: prompt }

            ],
            model: "openai/gpt-oss-120b", // 👈 Testez celui-ci ou le GPT-OSS 120B de votre console
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

// 🖼️ On accepte les différents noms utilisés par le frontend
const referenceImage =
    startImage ||
    start_image_url ||
    image_url ||
    uploadedImage ||
    null;

console.log(
    referenceImage
        ? "🖼️ Image de référence reçue par le serveur"
        : "ℹ️ Aucune image de référence"
);
// 🔒 Source de vérité absolue (impossible à falsifier depuis le front)


   const userId = req.user.uid;

    // 🛡️ 2. VÉRIFICATION RECAPTCHA (Bloque les robots avant toute utilisation de crédits)
 // 🛡️ 2. VÉRIFICATION RECAPTCHA
const isHuman = await verifyRecaptcha(recaptchaToken);

// BROWSER_ERROR = problème temporaire côté navigateur/réseau.
// On ne considère pas cela comme un bot.
if (isHuman === "retry") {
    return res.status(403).json({
        error: "La vérification de sécurité a échoué temporairement. Veuillez actualiser la page puis réessayer."
    });
}

// Token réellement invalide ou score insuffisant
if (isHuman === false) {
    return res.status(403).json({
        error: "Échec de la vérification de sécurité (bot détecté)."
    });
}
if (!prompt || !engineId) {
        return res.status(400).json({ 
            error: "Paramètres manquants." 
        });
    }


    // Refuser immédiatement les identifiants qui ne correspondent pas aux moteurs image exposés par le frontend.
    // Cette validation précède le débit de crédits : un moteur invalide ne peut pas provoquer de débit.
    const supportedImageEngineIds = new Set(["gpt_image2", "flux2pro", "nano_banana2_lite"]);
    if (!supportedImageEngineIds.has(engineId)) {
        return res.status(400).json({ error: `Moteur image non pris en charge : ${String(engineId).slice(0, 100)}` });
    }

    // 🔒 SÉCURITÉ : Calcul ou validation du coût côté serveur (on ne fait pas confiance au req.body.cost)
    // Adapte cette ligne selon la structure exacte de ton dictionnaire de prix d'images
// 1. Récupérer le plan de l'utilisateur (par exemple depuis sa base de données ou req.user, ici on met "0.00" par défaut ou on récupère son pack)
// Adapte "userDoc.data().plan" selon le nom du champ de ton plan utilisateur dans Firestore
// 🔒 SÉCURITÉ : Récupération du plan utilisateur en BDD pour appliquer le bon tarif
    const userRef = db.collection('users').doc(userId);
    const initialUserDoc = await userRef.get();
    const userData = initialUserDoc.exists ? initialUserDoc.data() : {};

    const rawUserPlan = String(userData.userPlan || userData.plan || "debutant").toLowerCase();
    const imagePlanToPrice = { debutant: "0.00", essentiel: "12.99", standard: "24.99", master: "34.99", elite: "59.99", legende: "159.99" };
    const userPlanKey = imagePlanToPrice[rawUserPlan] || (PRICING_DATA[rawUserPlan] ? rawUserPlan : "0.00");
    const userPricingTable = PRICING_DATA[userPlanKey] || PRICING_DATA["0.00"];

    // Tarification serveur dédiée aux trois moteurs image récents.
    // Les clés doivent correspondre à celles de pricingConfig.js : ne pas rabattre ces modèles sur l'ancien tarif FLUX.
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

    if (officialCost === undefined || officialCost === null || !Number.isFinite(Number(officialCost)) || Number(officialCost) <= 0) {
        console.error(`❌ Tarif serveur introuvable ou invalide pour le plan ${userPlanKey} et le moteur : ${engineId}`, {
            expectedPricingKey: engineId === "gpt_image2" ? "gptImage2" : engineId === "flux2pro" ? "flux2pro" : "nanoBanana2Lite",
            hasReferenceImage,
            hasReferenceVideo
        });
        return res.status(400).json({
            error: "Tarification serveur introuvable pour ce moteur. Vérifiez les tarifs dans pricingConfig.js."
        });
    }

    const finalCost = Number(officialCost);

    // 🔒 VALIDATION DU X-REQUEST-ID
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

    // 🔒 ID unique généré côté serveur si absent
    const requestId =
        suppliedRequestId ||
        `${userId}_${Date.now()}_${crypto.randomUUID()}`;

    const lockRef =
        db.collection('imageLocks').doc(requestId);

 // Détermination dynamique du champ à débiter avec bascule automatique sur les diamants
    let fieldToDecrement = costType === "diamonds" ? "packTokens" : "tokens";

// Le débit est validé à 100%// Variables de sécurité (à placer au début de la route)
let creditsDebited = false;
let generationFinished = false;
let lockCreated = false;

try {
    // 🔒 TRANSACTION : UNE SEULE DÉDUCTION PAR REQUEST ID
    await db.runTransaction(async (transaction) => {

        const lockDoc = await transaction.get(lockRef);

        if (lockDoc.exists) {
            throw new Error("Génération déjà en cours");
        }

 const userDocTx = await transaction.get(userRef);

        if (!userDocTx.exists) {
            throw new Error("Utilisateur non trouvé");
        }
        
        const userData = userDocTx.data();
        let balance = userData[fieldToDecrement] || 0;

        // 🧠 Si l'utilisateur n'a pas assez de tokens classiques, on vérifie s'il a assez de diamants (packTokens)
        if (balance < finalCost && fieldToDecrement === "tokens") {
            if ((userData["packTokens"] || 0) >= finalCost) {
                fieldToDecrement = "packTokens";
                balance = userData["packTokens"];
            }
        }

        if (balance < finalCost) { 
            throw new Error("Crédits insuffisants");
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

    // ⚡ Le débit est réellement validé en BDD à partir d'ICI
    creditsDebited = true;


// ⚡ Le débit est réellement validé en BDD à partir d'ICI
creditsDebited = true;

// ============================================================
// ANCIEN SYSTÈME GOOGLE IMAGEN
// CONSERVÉ POUR RETOUR EN ARRIÈRE
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
        throw new Error("Réponse Google vide.");
    }

    finalImageUrl =
        `data:image/png;base64,${generatedImage.image.imageBytes}`;
}
*/

// ============================================================
// RUNWARE — GPT IMAGE 2 / FLUX.2 PRO / NANO BANANA 2 LITE
// Fal est réservé à Seedance 1.5 Pro dans la route vidéo.
// ============================================================
const imageModelMap = {
    gpt_image2: "openai:gpt-image@2",
    flux2pro: "bfl:5@1",
    nano_banana2_lite: "google:nano-banana@2-lite"
};
const runwareImageModel = imageModelMap[engineId];
if (!runwareImageModel) {
    throw new Error(`Modèle image non pris en charge par Runware : ${engineId}`);
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
// Nano Banana 2 Lite accepte au maximum une vidéo de référence.
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
        // 0 est une valeur valide : ne pas la remplacer par 2 avec un opérateur ||.
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
    // La vidéo doit être une URL publique accessible par Runware.
    // Elle est transmise dans inputs.referenceVideos, séparément des images de référence.
    runwareImageRequest.inputs = {
        ...(runwareImageRequest.inputs || {}),
        referenceVideos: referenceVideoList
    };
}

console.log("🎨 [RUNWARE IMAGE] Modèle :", runwareImageModel);
console.log("🖼️ [RUNWARE IMAGE] Références image :", referenceImageList.length);
console.log("🎞️ [RUNWARE IMAGE] Références vidéo :", referenceVideoList.length);
console.log("📦 [RUNWARE IMAGE] Requête :", JSON.stringify(runwareImageRequest, null, 2));

const runware = await getRunwareClient();
const [imageResult] = await runware.run(runwareImageRequest);
finalImageUrl = imageResult.imageURL || imageResult.imageDataURI || null;
if (!finalImageUrl && imageResult.imageBase64Data) {
    finalImageUrl = `data:image/png;base64,${imageResult.imageBase64Data}`;
}

if (!finalImageUrl) {
    throw new Error("Runware n'a retourné aucune URL d'image.");
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
console.log("📤 REPONSE IMAGE RUNWARE ENVOYEE AU FRONT :", finalImageUrl);
return res.json({ success: true, imageUrl: finalImageUrl, url: finalImageUrl, imageUUID: imageResult.imageUUID, taskUUID: imageResult.taskUUID, cost: imageResult.cost });
    } 
    
    catch (error) {
        console.error("❌ Erreur dans le flux de génération :", error.message);

        // 🔄 Remboursement automatique uniquement si débité ET pas terminé
        if (creditsDebited && !generationFinished) {
            await userRef.update({
              [fieldToDecrement]: FieldValue.increment(finalCost)
            }).catch(err => console.error("Échec du remboursement:", err));
            console.log("🪙 Crédits remboursés suite à l'erreur.");
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
// ⚠️ Ajout de authenticateUser pour s'assurer que l'utilisateur est connecté et authentifié par Firebase
app.post('/generate-video', limiter, authenticateUser, async (req, res) => {
    // 🛡️ 1. Récupération de l'IP et vérification de la blacklist Firestore en premier
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const isBlocked = await isIpBlacklisted(clientIp);
    if (isBlocked) {
        console.warn(`🛑 Tentative de requête bloquée provenant d'une IP blacklistée : ${clientIp}`);
        return res.status(403).json({ error: "Accès refusé. Votre adresse IP a été restreinte." });
    }
    // =============================================================
    // 🛡️ SECURITY TEST MODE
    // =============================================================
    // IMPORTANT :
    // Ce bloc doit être AVANT :
    // - la transaction Firestore
    // - le débit des crédits
    // - Fal.ai
    // - Google Veo
console.log(
    "🖼️ [DEBUG] REFERENCE IMAGES REÇUES PAR LE SERVEUR :",
    JSON.stringify(req.body.referenceImages || [], null, 2)
);
    if (SECURITY_TEST_MODE) {
        console.log("");
        console.log("🛡️ ========================================");
        console.log("🛡️ SECURITY_TEST_MODE ACTIVÉ");
        console.log("🛡️ /generate-video");
        console.log("🛡️ Google Veo : BLOQUÉ");
        console.log("🛡️ Fal.ai     : BLOQUÉ");
        console.log("🛡️ Débit      : BLOQUÉ");
        console.log("🛡️ Génération : SIMULÉE");
        console.log("🛡️ ========================================");
        console.log("");

        return res.status(200).json({
            success: true,
            securityTest: true,
            simulated: true,
            videoUrl: "https://security-test.local/simulated-video.mp4",
            message: "Génération vidéo simulée — aucun fournisseur IA appelé"
        });
    }

    // 🔒 SOURCE DE VÉRITÉ ABSOLUE : On récupère le userId depuis le token Firebase décodé, JAMAIS du req.body !
    const userId = req.user.uid;

    // 2. Déstructuration du body (SANS userId, puisqu'on le récupère de manière sécurisée au-dessus)
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


    // On vérifie maintenant engineId et cost (userId est garanti puisqu'il vient de req.user.uid)
    if (!engineId || cost === undefined) {
        return res.status(400).json({ error: "Données manquantes" });
    }
// Récupération sécurisée du plan utilisateur dans Firestore
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

// Conversion du nom du plan vers la clé tarifaire serveur
const userPlanPrice = PLAN_TO_PRICE[userPlanFromDb] || "0.00";

// =============================================================
// 🛡️ RECALCUL DES PRIX CÔTÉ SERVEUR (Anti-triche)
// =============================================================
const enginePricing = PRICING_DATA[userPlanPrice]?.[engineId];

if (enginePricing) {
    // 🟢 CORRECTION 2 : On s'assure d'aller chercher la bonne clé (qualité, durée, ou valeur par défaut)
    const officialCost = enginePricing[qualityKey] !== undefined 
        ? enginePricing[qualityKey] 
        : (enginePricing[duration] !== undefined ? enginePricing[duration] : enginePricing.default);

    if (officialCost !== undefined && parseInt(cost, 10) !== parseInt(officialCost, 10)) {
        console.warn(`🛑 Tentative de fraude sur les prix détectée ! Reçu: ${cost}, Attendu: ${officialCost}`);
        
        const userEmail = userData.email || req.body.email || "Non fourni";
        const userIdVal = userId || "Non fourni";

        await sendSecurityAlert(
            clientIp, 
            "Modification frauduleuse du coût de génération", 
            "Requête bloquée (403)", 
            userEmail, 
            userIdVal
        );

        await detectSuspicious(req, "Modification frauduleuse du coût de génération");
        return res.status(403).json({ error: "Erreur de validation du coût de la génération." });
    }
}
// =============================================================
// 🛡️ VÉRIFICATION RECAPTCHA (Unique et complète)
// =============================================================
const isHuman = await verifyRecaptcha(recaptchaToken);

// Détection de l'environnement local pour éviter les faux positifs de ban IP
const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === '::ffff:127.0.0.1';

// Si reCAPTCHA retourne explicitement false et qu'on n'est pas en local
if (isHuman === false && !isLocalhost) {
    // Bannit l'IP pour 24h en cas de bot avéré
    await blacklistIp(clientIp, "Échec reCAPTCHA / Bot détecté", 24);

    // Remplacement sécurisé sans appel à sendSecurityAlert
    console.warn(`🚨 [ALERTE SÉCURITÉ] Échec reCAPTCHA / Bot détecté pour l'IP ${clientIp}`);

    return res.status(403).json({ error: "Échec de la vérification de sécurité (bot détecté)." });
}

if (isHuman === false && isLocalhost) {
    console.warn("⚠️ [DEV LOCAL] Échec reCAPTCHA ignoré pour localhost.");
}
// Si isHuman vaut 'bypass' ou 'true' suite à une erreur technique de l'API Google, 
// la requête continue normalement sans bannir l'utilisateur.
    // -------------------------------------------------------------
    // 1. 🛡️ VÉRIFICATION PREALABLE DES CRÉDITS (SANS DÉCLENCHER LE LOADER)
    // -------------------------------------------------------------
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
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

        // 🛑 S'il n'a pas assez de crédits -> On stoppe TOUT de suite (erreur 400 JSON)
        if (!hasEnough) {
            return res.status(400).json({ error: "Crédits insuffisants pour générer cette vidéo." });
        }

console.log("👉 2. Crédits validés avec succès");
    } catch (checkErr) {
        console.error("Erreur vérification solde :", checkErr);
        return res.status(500).json({ error: "Impossible de vérifier le solde utilisateur." });
    }

    // -------------------------------------------------------------
    // 2. 🟢 SEULEMENT S'IL A ASSEZ DE CRÉDITS : On ouvre le flux SSE !
    // -------------------------------------------------------------
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ status: "processing", message: "Vérification des crédits..." })}\n\n`);
const requestId = `${userId}_${Date.now()}`;

const userRef = db.collection('users').doc(userId);
const lockRef = db.collection('imageLocks').doc(requestId);
let creditsDebited = false;
let isAlreadyLocked = false;
let generationFinished = false; 
let refundDone = false;

// ⚡ AJOUT : Variables indispensables pour savoir combien rembourser en cas d'erreur
let deductedTokens = 0;
let deductedDiamonds = 0;
let usedWallet = "tokens";

    // 🚨 SÉCURITÉ RÉSEAU INTERCEPTÉE (Si le navigateur coupe le flux ou crash sur le Content-Length)
req.on('close', () => {
    console.log("⚠️ Client déconnecté pendant la génération");

    // On NE rembourse PAS ici.
    // Fal.ai peut continuer et la génération reste facturée.
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
                throw new Error("Utilisateur non trouvé.");
            }

            const userData = userDoc.data();
            const tokensAvailable = userData.tokens || 0;       // ⚡ Éclairs
            const diamondsAvailable = userData.packTokens || 0; // 💎 Diamants
            const requiredCost = parseInt(cost, 10);

            // 🔄 DÉBIT INTELLIGENT (ÉCLAIRS D'ABORD, PUIS DIAMANTS)
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
                    // Cas 1 : Assez d'éclairs
                    newTokens -= requiredCost;
                    deductedTokens = requiredCost;
                    usedWallet = "tokens";
                } else if ((tokensAvailable + diamondsAvailable) >= requiredCost) {
                    // Cas 2 : Hybride (Vider les éclairs + compléter en diamants)
                    const missingCost = requiredCost - tokensAvailable;
                    deductedTokens = tokensAvailable; 
        deductedDiamonds = missingCost;
                    newTokens = 0;
                    newDiamonds -= missingCost;
                    usedWallet = "hybrid";
                } else {
                    throw new Error("Crédits insuffisants.");
                }
            }

            // 1. Application des nouveaux soldes dans le document User
            transaction.update(userRef, {
                tokens: newTokens,
                packTokens: newDiamonds
            });

            // 2. Création du verrou de sécurité
            transaction.set(lockRef, {
                userId,
                requestId,
                cost: requiredCost,
                field: usedWallet, // "tokens", "packTokens" ou "hybrid"
                status: "processing",
                type: "VIDEO",
                provider: engineId === "seedance" ? "fal" : "runware",
                engine: engineId,
                createdAt: Timestamp.now(),
                lastCheck: Timestamp.now()
            });
        });

 // 3. 🛑 SI DÉJÀ EN COURS
        if (isAlreadyLocked) {
            console.log("⚠️ Requête bloquée : Un verrou existe déjà.");
            res.write(`data: ${JSON.stringify({ error: "Génération déjà en cours. Veuillez patienter.", status: "failed" })}\n\n`);
            // On laisse 100ms au réseau pour transmettre le message SSE au front avant de fermer
            setTimeout(() => {
                if (!res.writableEnded) res.end();
            }, 100);
            return;
        }

        // Le débit est validé à 100%
        creditsDebited = true;

        // Finalisation commune des moteurs Runware : ferme le verrou et enregistre l'historique.
        const completeRunwareVideo = async (result, modelName = engineId) => {
            const generatedVideoUrl = result?.videoURL || result?.videoUrl || result?.videoDataURI || result?.videoBase64Data;
            if (typeof generatedVideoUrl !== "string" || !generatedVideoUrl.trim()) {
                throw new Error(`Runware n'a retourné aucune URL vidéo pour ${modelName}.`);
            }
            const isPersistableUrl = /^https?:\/\//i.test(generatedVideoUrl);
            if (!isPersistableUrl) {
                throw new Error(`Runware a retourné une vidéo sans URL HTTP persistante pour ${modelName}.`);
            }

            const finalPrompt = String(prompt || req.body.prompt || "");
            // Le document imageLocks est aussi utilisé par l'historique : conserver le verrou terminé.
            await lockRef.update({
                status: "completed",
                type: "VIDEO",
                provider: "runware",
                engine: modelName,
                prompt: finalPrompt,
                description: finalPrompt,
                videoUrl: generatedVideoUrl,
                url: generatedVideoUrl,
                completedAt: FieldValue.serverTimestamp()
            });
            // Dès que le verrou porte la vidéo terminée, ne jamais rembourser ni supprimer ce résultat.
            generationFinished = true;

            if (userId) {
                try {
                    await db.collection("users").doc(userId).collection("generations").add({
                        videoUrl: generatedVideoUrl,
                        url: generatedVideoUrl,
                        prompt: finalPrompt,
                        description: finalPrompt,
                        engine: modelName,
                        provider: "runware",
                        type: "VIDEO",
                        createdAt: FieldValue.serverTimestamp()
                    });
                } catch (historyError) {
                    // Le résultat reste accessible via imageLocks même si la copie d'historique échoue.
                    console.error("⚠️ Vidéo terminée, mais copie dans users/{uid}/generations échouée :", historyError.message);
                }
            }

            const payload = {
                success: true,
                status: "completed",
                percent: 100,
                message: "Génération terminée !",
                videoURL: generatedVideoUrl,
                videoUrl: generatedVideoUrl,
                url: generatedVideoUrl,
                type: "VIDEO",
                videoUUID: result?.videoUUID,
                taskUUID: result?.taskUUID,
                cost: result?.cost
            };
            // /generate-video utilise Server-Sent Events : ne pas répondre avec res.json().
            if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
                res.end();
            }
            return payload;
        };

    // ============================================================
    // ============================================================
// 🎬 RUNWARE — GOOGLE VEO 3.1
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

    console.log("🎬 [RUNWARE] Veo 3.1 détecté");

    try {

        const runware = await getRunwareClient();

        // --------------------------------------------------------
        // DONNÉES ENTRANTES
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
    "🖼️ [DEBUG] REFERENCE IMAGES REÇUES PAR LE SERVEUR :",
    JSON.stringify(veoReferenceImages, null, 2)
);
        const requestedOperation =
            String(
                req.body.videoOperation ||
                req.body.operation ||
                ""
            ).toLowerCase();

        // --------------------------------------------------------
        // DÉTECTION DU MODE
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
            `🎬 [RUNWARE] Mode Veo 3.1 : ${veoOperation}`
        );

        // --------------------------------------------------------
        // AUDIO
        // --------------------------------------------------------

        const generateAudio =
            enable_audio !== false;

        // --------------------------------------------------------
        // DURÉE
        // --------------------------------------------------------

        let safeDuration =
            parseInt(duration, 10);

        if (veoVideoSource) {

            // Runware impose 7 secondes
            // lorsqu'une vidéo source est utilisée.
            safeDuration = 7;

        } else if (veoReferenceImages.length > 0) {

            // Runware impose 8 secondes
            // avec des images de référence.
            safeDuration = 8;

        } else {

            if (![4, 6, 7, 8].includes(safeDuration)) {
                safeDuration = 4;
            }
        }

        // --------------------------------------------------------
        // REQUÊTE RUNWARE DE BASE
        // --------------------------------------------------------

   const isVeoFast =
    engineId.toLowerCase().includes("veo3.1_fast") ||
    engineId.toLowerCase().includes("veo3.1-fast");

const runwareModel =
    isVeoFast
        ? "google:3@3"
        : "google:3@2";

console.log(
    `🤖 [RUNWARE] Modèle Veo sélectionné : ${runwareModel}`
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
        // 1️⃣ VIDEO → VIDEO
        // ========================================================
        // Extension ou modification d'une vidéo existante.
        //
        // IMPORTANT :
        // Avec inputs.video :
        // - durée = 7 secondes
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
                `🎬 [RUNWARE] Vidéo source détectée — mode : ${veoOperation}`
            );

        }

        // ========================================================
        // 2️⃣ REFERENCE IMAGES → VIDEO
        // ========================================================
        // Jusqu'à 3 images de référence.
        //
        // IMPORTANT :
        // Runware impose 8 secondes avec referenceImages.
        // ========================================================

        else if (veoReferenceImages.length > 0) {

            runwareRequest.duration = 8;

            // Dimensions selon résolution + format
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
                `🖼️ [RUNWARE] ${veoReferenceImages.length} image(s) de référence`
            );
        }

        // ========================================================
        // 3️⃣ IMAGE → VIDEO
        // ========================================================
        // Première image seule
        // OU première + dernière image.
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
                `🖼️ [RUNWARE] ${frameImages.length} frame(s) configurée(s)`
            );
        }

        // ========================================================
        // 4️⃣ TEXT → VIDEO
        // ========================================================
        // Aucun input image/vidéo.
        // width + height définissent le format.
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
                "📝 [RUNWARE] Mode Text to Video"
            );
        }

        // --------------------------------------------------------
        // LOG FINAL
        // --------------------------------------------------------

        console.log(
            "🚀 [RUNWARE] Requête Veo 3.1 :",
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
        // SSE — DÉMARRAGE
        // --------------------------------------------------------

        res.write(
            `data: ${JSON.stringify({
                percent: 10,

                message:
                    veoOperation === "edit"
                        ? "Veo 3.1 : modification de la vidéo..."
                        : veoOperation === "extend"
                            ? "Veo 3.1 : extension de la vidéo..."
                            : "Veo 3.1 : génération en cours..."
            })}\n\n`
        );

        // --------------------------------------------------------
        // APPEL RUNWARE
        // --------------------------------------------------------

        const [result] =
            await runware.run(runwareRequest);

        console.log(
            "✅ [RUNWARE] Réponse Veo 3.1 :",
            JSON.stringify(result, null, 2)
        );

        // --------------------------------------------------------
        // URL VIDÉO
        // --------------------------------------------------------

        const generatedVideoUrl =
            result?.videoURL;

        if (!generatedVideoUrl) {

            throw new Error(
                "Runware n'a pas retourné de videoURL."
            );
        }

        // --------------------------------------------------------
        // GÉNÉRATION TERMINÉE
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
                "💾 Vidéo Runware ajoutée à l'historique."
            );

        } catch (historyError) {

            console.error(
                "⚠️ Erreur historique Runware :",
                historyError.message
            );
        }

        // --------------------------------------------------------
        // LIBÉRATION DU LOCK
        // --------------------------------------------------------

        await lockRef
            .delete()
            .catch(() => {});

        // --------------------------------------------------------
        // RÉPONSE FRONTEND
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
                        ? "Veo 3.1 : vidéo modifiée !"
                        : veoOperation === "extend"
                            ? "Veo 3.1 : vidéo étendue !"
                            : "Veo 3.1 : vidéo prête !"

            })}\n\n`
        );

        res.end();

        return;

    } catch (runwareError) {

        console.error(
            "❌ [RUNWARE] Erreur Veo 3.1 :",
            runwareError
        );

        throw runwareError;
    }
}
// ============================================================
// KLING 2.6 MOTION CONTROL — RUNWARE
// ============================================================
if (
    engineId.toLowerCase() === "kling26_motion" ||
    engineId.toLowerCase() === "kling2.6_motion" ||
    engineId.toLowerCase() === "kling-2.6-motion"
) {

    console.log(
        "🎬 [RUNWARE] Kling 2.6 Motion Control détecté"
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
    // VIDÉO DE MOUVEMENT
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
            "Kling 2.6 Motion Control requiert une vidéo de mouvement."
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
    // REQUÊTE RUNWARE
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
        "🎬 KLING 2.6 MOTION CONTROL — RUNWARE"
    );

    console.log(
        "=============================================="
    );

    console.log(
        "🖼️ Image personnage :",
        motionImage
    );

    console.log(
        "🎥 Vidéo mouvement :",
        motionVideo
    );

    console.log(
        "🧭 Orientation :",
        orientation
    );

    console.log(
        "🔊 Son original :",
        keepOriginalSound
    );

    console.log(
        "🤖 Modèle :",
        runwareModel
    );

    console.log(
        "📦 Requête Runware :",
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
        "✅ [KLING 2.6 MOTION] Génération terminée"
    );

    return await completeRunwareVideo(result, engineId);
}
// ============================================================
// KLING 2.6 PRO — RUNWARE
// ============================================================
if (
    engineId.toLowerCase() === "kling2.6" ||
    engineId.toLowerCase() === "kling2.6_pro" ||
    engineId.toLowerCase() === "kling2.6-pro"
) {

    console.log("🎬 [RUNWARE] Kling 2.6 Pro détecté");

    const runwareModel =
        "klingai:kling-video@2.6-pro";

    console.log(
        `🤖 [RUNWARE] Modèle Kling sélectionné : ${runwareModel}`
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
    // DURÉE KLING 2.6
    // ========================================================

    const safeKlingDuration =
        parseInt(duration, 10) === 10
            ? 10
            : 5;

    // ========================================================
    // VIDEO → VIDEO
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
            "🎥 [KLING 2.6] Mode VIDEO → VIDEO"
        );

        console.log(
            "🎬 [KLING 2.6] Requête Runware :",
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
            "✅ [KLING 2.6] Video → Video terminée"
        );

        return await completeRunwareVideo(result, engineId);
    }

    // ========================================================
    // IMAGE → VIDEO
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
            "🖼️ [KLING 2.6] Mode IMAGE → VIDEO"
        );

        console.log(
            "🔊 [KLING 2.6] Audio natif :",
            enable_audio !== false
                ? "OUI"
                : "NON"
        );

        console.log(
            "🎬 [KLING 2.6] Requête Runware :",
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
            "✅ [KLING 2.6] Image → Video terminée"
        );

        return await completeRunwareVideo(result, engineId);
    }

    // ========================================================
    // TEXT → VIDEO
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
        "📝 [KLING 2.6] Mode TEXT → VIDEO"
    );

    console.log(
        "🔊 [KLING 2.6] Audio natif :",
        enable_audio !== false
            ? "OUI"
            : "NON"
    );

    console.log(
        "🎬 [KLING 2.6] Requête Runware :",
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
        "✅ [KLING 2.6] Text → Video terminée"
    );

    return await completeRunwareVideo(result, engineId);
}
/*
============================================================
ANCIEN CODE GOOGLE VEO / VERTEX AI
CONSERVÉ POUR RETOUR EN ARRIÈRE
============================================================



const isGoogleVideo = Boolean(engineId && (engineId.startsWith("veo") || engineId.includes("google")));

if (isGoogleVideo) {
    // 🔐 SÉCURITÉ : Validation du modèle
    let officialGoogleModel;
  if (engineId === "veo3_lite") {
        officialGoogleModel = "veo-3.1 lite-generate-001";
    } else {
        officialGoogleModel = "veo-3.1-generate-001";
    }

    console.log(`🔒 [Sécurisé] Appel Google SDK | Modèle : ${officialGoogleModel}`);

    // 🕒 SÉCURISATION DURÉE (Validations strictes)
    const allowedDurations = (engineId === "veo3_lite") ? [4, 8] : [4, 6, 8];
    let safeDuration = parseInt(duration);

    console.log(`[DEBUG] Durée brute reçue: ${duration}, Durée parsée: ${safeDuration}, Moteur: ${engineId}`);

    if (isNaN(safeDuration) || !allowedDurations.includes(safeDuration)) {
        safeDuration = allowedDurations[0]; 
        console.warn(`⚠️ Durée invalide, réinitialisée à ${safeDuration}s`);
    }

    // 📐 SÉCURISATION ASPECT RATIO (Calculé avant utilisation)
    const safeAspect = ["16:9", "9:16", "1:1"].includes(aspect_ratio) ? aspect_ratio : "16:9";

    // ⚙️ CONSTRUCTION DE L'OBJET CONFIG (Déclaré une seule fois)
    const videoConfig = { 
        aspectRatio: safeAspect, 
        durationSeconds: safeDuration 
    };

    console.log(`[DEBUG] Valeur finale injectée dans videoConfig : ${safeDuration}s`);

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
// 📸 IMAGE DE RÉFÉRENCE VEO
// =============================================================

// Priorité : startImage → start_image_url → image_url → image_urls[0]
const veoImageUrl =
    (typeof startImage === "string" && startImage.trim()) ? startImage.trim() :
    (typeof start_image_url === "string" && start_image_url.trim()) ? start_image_url.trim() :
    (typeof image_url === "string" && image_url.trim()) ? image_url.trim() :
    (Array.isArray(image_urls) && typeof image_urls[0] === "string" && image_urls[0].trim())
        ? image_urls[0].trim()
        : null;

if (veoImageUrl) {
    console.log("📸 Image de référence détectée pour Veo :", veoImageUrl);

    try {
        // ---------------------------------------------------------
        // CAS 1 : image déjà au format Data URI
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
                "✅ Image Data URI convertie pour Veo | MIME :",
                mimeType
            );
        }

        // ---------------------------------------------------------
        // CAS 2 : image hébergée sur Render / URL HTTPS
        // ---------------------------------------------------------
        else if (
            veoImageUrl.startsWith("http://") ||
            veoImageUrl.startsWith("https://")
        ) {
            console.log("🌐 Téléchargement de l'image de référence...");

            const imageResponse = await fetch(veoImageUrl);

            if (!imageResponse.ok) {
                throw new Error(
                    `Impossible de récupérer l'image (${imageResponse.status} ${imageResponse.statusText})`
                );
            }

            const contentType =
                imageResponse.headers.get("content-type") || "image/png";

            if (!contentType.startsWith("image/")) {
                throw new Error(
                    `Le fichier récupéré n'est pas une image : ${contentType}`
                );
            }

            const imageBuffer = Buffer.from(
                await imageResponse.arrayBuffer()
            );

            if (!imageBuffer.length) {
                throw new Error("L'image récupérée est vide.");
            }

            const base64Data = imageBuffer.toString("base64");

            generateOptions.image = {
                imageBytes: base64Data,
                mimeType: contentType.split(";")[0]
            };

            console.log(
                "✅ Image téléchargée et convertie pour Veo |",
                `${imageBuffer.length} octets | MIME : ${contentType.split(";")[0]}`
            );
        }

        else {
            throw new Error(
                "Format d'image non pris en charge pour Veo."
            );
        }

        console.log("🎯 Image de référence réellement injectée dans la requête Veo.");

    } catch (imgError) {
        console.error(
            "❌ Erreur lors de la préparation de l'image Veo :",
            imgError.message
        );

        // IMPORTANT :
        // On arrête la génération plutôt que de lancer une vidéo
        // sans l'image demandée.
        throw new Error(
            "Impossible de préparer l'image de référence pour Veo."
        );
    }
} else {
    console.log("ℹ️ Aucune image de référence fournie pour Veo.");
}
// 1. Flush immédiat des headers pour activer le flux SSE
res.flushHeaders();

// 2. Heartbeat pour maintenir la connexion SSE active toutes les 15s
const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(':\n\n');
}, 15000);

let operation = await ai.models.generateVideos(generateOptions);

console.log("⏳ Requête acceptée par Google. ID Opération :", operation.name);
console.log("🍿 Génération de la vidéo en cours sur les serveurs de Google (Attente active 1 à 3 minutes)...");

// 🔄 Boucle d'attente (Polling) optimisée pour le SDK @google/genai 2.x
let attempts = 0;
console.log("⏳ Début de la surveillance de l'opération Google...");

while (!operation.done) {
    attempts++;
    console.log(`🔄 [Tentative ${attempts}] Vérification du statut auprès de Google...`);

    // 1. Attendre 15 secondes
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // 2. Mise à jour de l'opération (Appel unique et propre)
    try {
        // 🔥 FIX : Rafraîchissement réel de l'état de l'opération (indispensable pour sortir du while)
        operation = await ai.operations.get({ operation: operation });
        
        // 3. Mise à jour de la progression vers le frontend
        const progressMessage = `Génération IA en cours (Tentative ${attempts})...`;
res.write(`data: ${JSON.stringify({ percent: 50, message: progressMessage })}\n\n`);
        console.log(`✅ [Tentative ${attempts}] Réponse reçue. Opération terminée : ${operation.done}`);
        
    } catch (err) {
        console.error("❌ Erreur lors du polling de l'opération :", err.message);
        clearInterval(heartbeat); // Nettoyage en cas d'erreur
        throw err; // On stoppe tout si l'API Google renvoie une erreur critique
    }

    // Sécurité : Timeout global après 20 tentatives (soit 5 minutes)
    if (attempts >= 20) {
        clearInterval(heartbeat);
        throw new Error("Le délai de génération a été dépassé (Timeout).");
    }
}

// Nettoyage final
clearInterval(heartbeat);
console.log("✅ GOOGLE A TERMINÉ LA GÉNÉRATION !");
// Si Google a renvoyé une erreur dans l'opération terminée
if (operation.error) {
    throw new Error(`Google Cloud Error [${operation.error.code}]: ${operation.error.message}`);
}
// Extraction de la réponse finale
const response = operation.response;
console.log("STRUCTURE FINALE ACCESSIBLE :", JSON.stringify(response, null, 2));
let generatedVideoUrl = null;
// ============================================================
// 🛡️ VIDÉO FILTRÉE PAR LES RÈGLES DE SÉCURITÉ GOOGLE
// ============================================================
if (
    response?.raiMediaFilteredCount > 0 ||
    response?.raiMediaFilteredReasons?.length > 0
) {
    const reasons = response.raiMediaFilteredReasons || [];

    console.warn(
        "🛡️ Google a filtré la vidéo pour des raisons de sécurité."
    );

    console.warn(
        "🛡️ Raisons du filtrage :",
        reasons
    );

    const errorMsg =
        "Google a bloqué cette génération pour des raisons de sécurité. Veuillez modifier le prompt puis réessayer.";

    res.write(
        `data: ${JSON.stringify({
            error: errorMsg,
            status: "filtered",
            reason: reasons[0] || "Contenu filtré par Google"
        })}\n\n`
    );

    res.end();

    throw new Error(errorMsg);
}
// Extraction et conversion immédiate en fichier local
if (response?.generatedVideos?.[0]?.video?.videoBytes) {
    const videoBytes = response.generatedVideos[0].video.videoBytes;
    const buffer = Buffer.from(videoBytes, "base64");

    const fileName = `video-${Date.now()}.mp4`;
    // On définit le dossier proprement
    const dir = path.join(__dirname, 'public', 'videos');
    
    // Crée le dossier s'il n'existe pas
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);
// --- DÉCOUPAGE ET REDIMENSIONNEMENT FFMPEG ---
const finalFileName = `final-${Date.now()}.mp4`;
const outputPath = path.join(dir, finalFileName);

res.write(`data: ${JSON.stringify({ percent: 80, message: "Traitement vidéo et application des filtres..." })}\n\n`);

// 🔐 VARIABLES DE SÉCURITÉ
let finished = false;
let fakePercent = 80;
let fakeProgressInterval;
let timeout;

// 🧹 CLEANUP CENTRALISÉ
const cleanup = () => {
    if (fakeProgressInterval) clearInterval(fakeProgressInterval);
    if (timeout) clearTimeout(timeout);
};

// 🧠 SAFE FINISH (ANTI DOUBLE EXECUTION)
const safeFinish = (cb) => {
    if (finished) return;
    finished = true;
    cleanup();
    cb();
};

// 📊 FAKE PROGRESS (UX FLUIDE)
fakeProgressInterval = setInterval(() => {
    if (fakePercent < 85) fakePercent += 1;
    else if (fakePercent < 92) fakePercent += 0.3;

    // Utilisation directe de res.write
    // Assure-toi que 'res' est bien accessible dans la portée de cette fonction
    if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ 
            percent: Math.min(92, Math.round(fakePercent)), 
            message: "Encodage vidéo en cours (FFMPEG)..." 
        })}\n\n`);
    }
}, 2000);
const targetSize =
    req.body.resolution === "1080p"
        ? "1920x1080"
        : "1280x720";

// 🧪 LOGS DEBUG// 📐 Récupération dynamique du format et de la résolution choisis sur l'interface
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
    // 9:16 par défaut
    targetWidth = isHD ? 1080 : 720;
    targetHeight = isHD ? 1920 : 1280;
}

// 🧪 LOGS DEBUG
console.log(`🔍 Diagnostic FFMPEG :`);
console.log(`   - Dossier cible : ${dir}`);
console.log(`   - Fichier écrit : ${filePath}`);
console.log(`   - Format demandé : ${aspectRatio} (${targetWidth}x${targetHeight})`);
console.log(
    `   - Vérification accès disque : ${
        fs.existsSync(filePath) ? "OUI ✅" : "NON ❌"
    }`
);

await new Promise((resolve, reject) => {

    // ⏱️ TIMEOUT SÉCURISÉ
    timeout = setTimeout(() => {
        console.error("❌ FFMPEG : TIMEOUT après 1200 secondes");

        safeFinish(() => {
            reject(new Error("Timeout FFMPEG : dépassement 1200s"));
        });
    }, 120000);

    console.log("🎬 Préparation du lancement FFMPEG...");
    console.log("📥 Fichier source :", filePath);
    console.log("📤 Fichier destination :", outputPath);
    console.log("⏱️ Durée demandée :", duration);
    console.log("📐 Résolution cible :", `${targetWidth}x${targetHeight}`);

    console.log("🔎 Chemin FFmpeg configuré :", ffmpegPath);
    console.log("🔎 FFmpeg existe :", fs.existsSync(ffmpegPath));

    if (!fs.existsSync(ffmpegPath)) {
        throw new Error(`FFmpeg introuvable sur Render : ${ffmpegPath}`);
    }

    ffmpeg.setFfmpegPath(ffmpegPath);

    console.log("✅ Chemin FFmpeg appliqué à fluent-ffmpeg.");

    const ffmpegProcess = ffmpeg(filePath)
        .videoFilters([
            // ✅ Filtre dynamique avec bandes noires (padding) sans déformation
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
            console.log("🚀 FFMPEG commande lancée :", cmd);
        })

        .on("progress", (progress) => {
            console.log(
                `🎞️ FFMPEG progression : ${progress.percent || 0}%`
            );
        })

        .on("end", () => {

            safeFinish(async () => {

                console.log(
                    `✂️ Vidéo traitée : ${duration}s, Résolution : ${targetWidth}x${targetHeight}`
                );

                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(
                            "⚠️ Impossible de supprimer le fichier temporaire :",
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
                            "🔒 Verrou imageLocks mis à jour et finalisé avec succès pour Veo."
                        );

                    } catch (lockErr) {

                        console.error(
                            "⚠️ Erreur lors de la mise à jour finale du verrou imageLocks :",
                            lockErr.message
                        );
                    }
                }

                res.write(
                    `data: ${JSON.stringify({
                        videoUrl: finalUrl,
                        percent: 100,
                        message: "Vidéo prête !"
                    })}\n\n`
                );

                res.end();

                resolve();
            });
        })

        .on("error", (err, stdout, stderr) => {

            console.error("❌ ERREUR FFMPEG :", err.message);
            console.error("❌ CODE FFMPEG :", err.code);
            console.error("❌ STDOUT FFMPEG :", stdout);
            console.error("❌ STDERR FFMPEG :", stderr);

            safeFinish(() => {

                if (!res.writableEnded) {
                    res.write(
                        `data: ${JSON.stringify({
                            error: "Erreur traitement vidéo final.",
                            details: err.message
                        })}\n\n`
                    );

                    res.end();
                }

                reject(err);
            });
        });

    console.log("▶️ Appel de .run() FFMPEG maintenant...");

    ffmpegProcess.run();
});

// Suite du code pour les autres cas...


} else if (response?.generatedVideos?.[0]?.video?.uri) {
    const videoUrl = response.generatedVideos[0].video.uri;
    console.log("🎉 URI Google détectée → vidéo prête :", videoUrl);

    generationFinished = true;

    // 1️⃣ Mise à jour du verrou
    await lockRef.update({
        status: "completed",
        videoUrl: videoUrl,
        url: videoUrl,
        completedAt: FieldValue.serverTimestamp()
    });

    // 2️⃣ 💾 SAUVEGARDE FIRESTORE : Ajout à l'historique utilisateur (Prompt + Vidéo)
    if (userId) {
        try {
            await db.collection("users").doc(userId).collection("generations").add({
                videoUrl: videoUrl,
                prompt: prompt || "",
                engine: engineId || "google-veo",
                createdAt: FieldValue.serverTimestamp()
            });
            console.log(`💾 Vidéo URI ajoutée à l'historique de l'utilisateur : ${userId}`);
        } catch (fsErr) {
            console.error("❌ Erreur lors de la sauvegarde Firestore de l'historique vidéo URI :", fsErr.message);
        }
    } else {
        console.warn("⚠️ Impossible d'enregistrer la vidéo : userId est introuvable.");
    }

    // 3️⃣ Suppression du verrou pour libérer l'utilisateur
    await lockRef.delete().catch(() => {});

    // ✅ RÉPONSE SSE PROPRE
    res.write(`data: ${JSON.stringify({ 
        videoUrl: videoUrl, 
        percent: 100, 
        message: "Vidéo prête !" 
    })}\n\n`);
    
    res.end(); 
    return;
    
}
else {
    // Si tu es dans une erreur, utilise aussi le flux SSE pour que le client reçoive l'info
    const errorMsg = "Impossible d'extraire la vidéo de la réponse finale de Google.";
    res.write(`data: ${JSON.stringify({ error: errorMsg, status: "failed" })}\n\n`);
    res.end();
   throw new Error(errorMsg);
}

} // <--- Ferme le grand "if (isGoogleVideo)" du début


*/


// --- ROUTAGE DES MOTEURS VIDÉO RESTANTS ---

console.log("ETAPE 1 : entrée traitement vidéo");
console.log(`🎬 Routage du moteur : ${engineId}`);

let targetEngineId = req.body.modelEndpoint || engineId;
let finalInput = { prompt, aspect_ratio: aspect_ratio || "16:9", resolution: req.body.resolution || "720p" };


// 🛠️ CONVERSION URL LOCALE → URL PUBLIQUE DU SERVEUR
const localVideoUrl = req.body.video_url || req.body.videoSource || req.body.videoUrl;
if (localVideoUrl && localVideoUrl.includes('localhost:5000')) {
const ngrokBaseUrl = process.env.PUBLIC_API_URL || 'https://eclipse-ai.onrender.com';
    finalInput.video_url = localVideoUrl.replace('http://localhost:5000', ngrokBaseUrl);
}

console.log("🚀 ETAPE 2 : finalInput initial créé");
console.log("👉 1. Entrée dans /generate-video");
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
// Image début + Image fin
// ============================================================
if (


    engineId === "kling30" ||
    engineId === "kling3" ||
    engineId.includes("kling-video/v3")
) {

    console.log("🚀 KLING 3.0 : configuration RUNWARE");

    // ========================================================
    // 0. SÉCURITÉ : MOTION CONTROL EST TRAITÉ PLUS BAS
    // ========================================================

    if (
        engineId.toLowerCase().includes("motion")
    ) {
        throw new Error(
            "Kling 3.0 Motion Control doit utiliser son bloc dédié."
        );
    }

    // ========================================================
    // 1. RÉCUPÉRATION DES IMAGES
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
    // 2. DÉTECTION RÉSOLUTION
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
    // 3. DURÉE
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

        // Deux images = première + dernière image
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
        // paramètres doivent respecter les dépendances
        // du mode image. On vérifie donc le mode image
        // séparément avant génération.

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
    console.log("🎬 KLING 3.0 — RUNWARE");
    console.log("==============================================");

    console.log(
        "➡️ Engine ID :",
        engineId
    );

    console.log(
        "➡️ Modèle :",
        klingModel
    );

    console.log(
        "➡️ Niveau :",
        klingTier
    );

    console.log(
        "➡️ Mode :",
        sourceStartImage
            ? (
                sourceEndImage
                    ? "IMAGE → VIDEO / FIRST + LAST"
                    : "IMAGE → VIDEO"
            )
            : "TEXT → VIDEO"
    );

    console.log(
        "➡️ Durée :",
        klingDuration,
        "secondes"
    );

    console.log(
        "➡️ Audio :",
        generateAudio
    );

    console.log(
        "➡️ Image début :",
        sourceStartImage || "❌ aucune"
    );

    console.log(
        "➡️ Image fin :",
        sourceEndImage || "❌ aucune"
    );

    console.log(
        "📦 Requête Runware :",
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
            "✅ [KLING 3.0] Génération terminée"
        );

        console.log(
            "📦 Résultat :",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return await completeRunwareVideo(result, engineId);

    } catch (error) {

        console.error(
            "❌ [KLING 3.0 / RUNWARE]",
            error
        );

        throw error;
    }
}

// ============================================================
// 2. KLING MOTION CONTROL — STANDARD / PRO
// ============================================================

else if (engineId.includes("kling") && engineId.includes("motion")) {
    // Ce cas doit être traité par le bloc Kling Motion Control Runware situé plus haut.
    throw new Error("Kling Motion Control non traité par son gestionnaire Runware.");
}

// ============================================================
// 3. KLING 2.6 PRO (Strictement isolé des versions 3)
// ============================================================
else if (engineId.includes("kling26") || (engineId.includes("kling") && !engineId.includes("v3") && !engineId.includes("30"))) {
    // Les versions Kling 2.6 doivent avoir été interceptées par les branches Runware plus haut.
    throw new Error("Kling 2.6 non traité par son gestionnaire Runware.");
}

// ============================================================
// HAILUO 2.3 — RUNWARE
// Text-to-Video + Image-to-Video
// ============================================================
else if (engineId.includes("hailuo")) {
    console.log("🚀 HAILUO 2.3 : configuration RUNWARE");

    // ========================================================
    // 1. IMAGE DE DÉPART
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
    // 2. RÉSOLUTION
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
    // 3. DURÉE
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
    // 6. IMAGE → VIDEO
    // ========================================================

    if (cleanHailuoImg) {

        hailuoRequest.inputs = {

            frameImages: [
                cleanHailuoImg
            ]

        };

        // Avec frameImages, on ne fournit PAS width/height.
        // Hailuo utilise l'image comme première frame.
    }

    // ========================================================
    // 7. TEXT → VIDEO
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
    console.log("🎬 HAILUO 2.3 — RUNWARE");
    console.log("==============================================");

    console.log(
        "➡️ Engine ID :",
        engineId
    );

    console.log(
        "➡️ Modèle :",
        "minimax:4@1"
    );

    console.log(
        "➡️ Mode :",
        cleanHailuoImg
            ? "IMAGE → VIDEO"
            : "TEXT → VIDEO"
    );

    console.log(
        "➡️ Résolution :",
        is1080p
            ? "1080p"
            : "768p"
    );

    console.log(
        "➡️ Durée :",
        hailuoDuration,
        "secondes"
    );

    console.log(
        "➡️ Image de départ :",
        cleanHailuoImg || "❌ aucune"
    );

    console.log(
        "📦 Requête Runware :",
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
            "✅ [HAILUO 2.3] Génération terminée"
        );

        console.log(
            "📦 Résultat :",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return await completeRunwareVideo(result, engineId);

    } catch (error) {

        console.error(
            "❌ [HAILUO 2.3 / RUNWARE]",
            error
        );

        throw error;
    }
}
// ============================================================
// MINIMAX H3 — RUNWARE
// Text-to-Video
// Image-to-Video
// First + Last Frame
// Reference Images / Video / Audio
// ============================================================
else if (engineId.includes("minimax_h3")) {

    console.log("🚀 MINIMAX H3 : configuration RUNWARE");

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
    // 2. DURÉE
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
    // 3. RÉSOLUTION
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
    // 4. RÉCUPÉRATION DES IMAGES
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

    // Suppression des doublons + exclusion des vidéos
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
    // 5. VIDÉOS DE RÉFÉRENCE
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
    // 6. AUDIOS DE RÉFÉRENCE
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
    // 7. IMAGES DE RÉFÉRENCE
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
    // 8. CONSTRUCTION DE LA REQUÊTE RUNWARE
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
// Références multimodales : 12 fichiers au total maximum
// --------------------------------------------------------
if (publicH3ReferenceImages.length + uniqueH3Videos.length + publicH3Audios.length > 12) {
    throw new Error("MiniMax H3 : 12 fichiers de référence maximum au total (images, vidéos et audios combinés).");
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
    throw new Error("MiniMax H3 : une référence audio nécessite aussi au moins une image ou une vidéo dans les références visuelles.");
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
// Première et dernière image
// Uniquement sans références multimodales
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
    // Mode avec image ou vidéo de référence
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
    console.log("🎬 MINIMAX H3 — RUNWARE");
    console.log("==============================================");

    console.log(
        "➡️ Engine ID :",
        engineId
    );

    console.log(
        "➡️ Modèle :",
        "minimax:h3@0"
    );

    console.log(
        "➡️ Mode :",
        uniqueH3Videos.length > 0
            ? "VIDEO → VIDEO"
            : uniqueH3Audios.length > 0
                ? "AUDIO → VIDEO"
                : uniqueH3Images.length >= 2
                    ? "FIRST + LAST FRAME"
                    : uniqueH3Images.length === 1
                        ? "IMAGE → VIDEO"
                        : "TEXT → VIDEO"
    );

    console.log(
        "➡️ Résolution :",
        h3Resolution
    );

    console.log(
        "➡️ Durée :",
        h3Duration,
        "secondes"
    );

    console.log(
        "➡️ Images frame :",
        uniqueH3Images.length
    );

    console.log(
        "➡️ Images référence :",
        uniqueH3ReferenceImages.length
    );

    console.log(
        "➡️ Vidéos référence :",
        uniqueH3Videos.length
    );

    console.log(
        "➡️ Audios référence :",
        effectiveH3ReferenceAudios.length
    );

    console.log(
        "📦 Requête Runware :",
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
            "✅ [MINIMAX H3] Génération terminée"
        );

        console.log(
            "📦 Résultat :",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return await completeRunwareVideo(result, engineId);

    } catch (error) {

        console.error(
            "❌ [MINIMAX H3 / RUNWARE]",
            error
        );

        throw error;
    }
}
// ============================================================
// PIXVERSE V6 — RUNWARE
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
    console.log("🎬 [RUNWARE PIXVERSE V6]", JSON.stringify(request, null, 2));
    const [result] = await runware.run(request);
    console.log("🔎 [PIXVERSE V6] Champs du résultat Runware :", Object.keys(result || {}));
    const videoURL =
        result?.videoURL ||
        result?.videoUrl ||
        result?.videoDataURI ||
        result?.videoBase64Data;
    if (typeof videoURL !== "string" || !videoURL.trim()) {
        throw new Error("Runware PixVerse V6 n'a retourné aucune URL vidéo exploitable.");
    }
    console.log("✅ [PIXVERSE V6] URL vidéo reçue :", videoURL.slice(0, 180));
    return await completeRunwareVideo({ ...result, videoURL }, engineId);
}

// ============================================================
// SEEDANCE 2.5 — RUNWARE
// Jusqu'à 30 images, 10 vidéos et 10 audios de référence.
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
        // Video-to-video : la résolution choisit la qualité, l'aspect reste celui de la vidéo source.
        request.inputs = { video: sourceVideo };
        request.resolution = safeResolution;
    } else if (start || end) {
        // frameImages exige toujours une première image. Une image de fin seule est traitée comme référence.
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

    if (!request.positivePrompt && !request.inputs) throw new Error("Seedance 2.5 : le prompt est obligatoire sans média de référence.");
    console.log("🎬 [RUNWARE SEEDANCE 2.5]", JSON.stringify(request, null, 2));
    const [result] = await runware.run(request);
    const videoURL = result.videoURL || result.videoDataURI || result.videoBase64Data;
    if (!videoURL) throw new Error("Runware Seedance 2.5 n'a retourné aucune vidéo.");
    return await completeRunwareVideo(result, engineId);
}
// ============================================================
// SEEDANCE 2.0 — RUNWARE
// Jusqu'à 9 images, 3 vidéos et 3 audios de référence.
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
        throw new Error("Seedance 2.0 : 12 fichiers de référence maximum au total (images, vidéos et audios combinés).");
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
        if (audios.length && !hasVisual) throw new Error("Seedance 2.0 : une référence audio nécessite au moins une image ou une vidéo de référence.");
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
    console.log("🎬 [RUNWARE SEEDANCE 2.0]", JSON.stringify(request, null, 2));
    const [result] = await runware.run(request);
    const videoURL = result.videoURL || result.videoDataURI || result.videoBase64Data;
    if (!videoURL) throw new Error("Runware Seedance 2.0 n'a retourné aucune vidéo.");
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



// Fal.ai est volontairement réservé au seul moteur Seedance 1.5 Pro.
        if (engineId !== "seedance") {
            throw new Error(`Moteur vidéo non raccordé à Runware : ${engineId}`);
        }

// --- APPEL FAL.AI : SEEDANCE 1.5 PRO UNIQUEMENT ---
        res.write(`data: ${JSON.stringify({ percent: 30, message: "Envoi à la file de rendu..." })}\n\n`);

        const falResult = await fal.subscribe(targetEngineId, {
            input: finalInput,
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    res.write(`data: ${JSON.stringify({ percent: 60, message: "Rendu vidéo en cours..." })}\n\n`);
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
    throw new Error("Fal.ai n'a renvoyé aucune URL de vidéo.");
}

     // 1️⃣ Mise à jour du verrou
        await lockRef.update({
            status: "completed",
            videoUrl: falVideoUrl,
            url: falVideoUrl,
            prompt: prompt || "",
            description: prompt || "",
            completedAt: FieldValue.serverTimestamp()
        });

        // 2️⃣ 💾 SAUVEGARDE FIRESTORE : Ajout à l'historique utilisateur
        if (userId) {
            await db.collection("users").doc(userId).collection("generations").add({
                videoUrl: falVideoUrl,
                prompt: prompt || "",
                description: prompt || "",
                engine: targetEngineId || engineId || "fal.ai",
                createdAt: FieldValue.serverTimestamp()
            });
            console.log(`💾 Vidéo ajoutée à l'historique de l'utilisateur : ${userId}`);
        } else {
            console.warn("⚠️ Impossible d'enregistrer la vidéo : userId est introuvable.");
        }

        // 3️⃣ Envoi du message SSE de fin au client
        res.write(`data: ${JSON.stringify({ 
            percent: 100, 
            videoUrl: falVideoUrl, 
            url: falVideoUrl, 
            status: "completed", 
            message: "Génération terminée !" 
        })}\n\n`);

        res.end();
        

} catch (error) {
        console.error("❌ Erreur dans le flux de génération :", error.message);

// 🛡️ SÉCURITÉ : Remboursement SEULEMENT si débité ET non terminé ET pas encore remboursé
        if (creditsDebited && !generationFinished && !refundDone) {
            refundDone = true;
            console.log("🔄 Échec après débit -> Remboursement des crédits...");
            try {
                await db.runTransaction(async (transaction) => {
                    const uDoc = await transaction.get(userRef);
                    if (uDoc.exists) {
                        // 🎯 CALCUL CHIRURGICAL DU MONTANT À REMBOURSER
                        const amountToRefund = Number(cost) || 15;

                        // Si deductedDiamonds a une valeur > 0 OU si usedWallet était packTokens, on crédite les diamants.
                        // Sinon, si on sait que les tokens étaient à 0, c'était forcément les packTokens !
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
                console.log("🪙 Remboursement effectué avec succès.");
            } catch (refundErr) {
                console.error("❌ Échec lors du remboursement :", refundErr.message);
            }
        } else if (!creditsDebited) {
            console.log("🛑 Aucun remboursement : Les crédits n'avaient pas été débités.");
        }

        // Ne jamais supprimer un résultat déjà enregistré comme terminé.
        // En cas d'échec avant finalisation, nettoyer le verrou de traitement.
        if (!generationFinished) {
            await lockRef.delete().catch(() => {});
        } else {
            console.warn("⚠️ Verrou conservé : la vidéo a déjà été enregistrée comme terminée.");
        }

        // Envoi de l'erreur sans tenter d'écrire sur une connexion détruite/terminée.
        if (res.destroyed || res.writableEnded) {
            console.warn("⚠️ Flux SSE fermé : impossible de transmettre l'erreur au client.");
            return;
        }
        try {
            if (res.headersSent) {
                res.write(`event: error\ndata: ${JSON.stringify({ error: error.message, status: "failed" })}\n\n`);
                res.end();
            } else {
                res.status(500).json({ error: error.message, status: "failed" });
            }
        } catch (writeErr) {
            console.error("⚠️ Erreur lors de l'envoi de l'erreur finale :", writeErr.message);
        }
    }
});

// ==========================================
// 📌 ROUTES OTP 
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
            // 🚀 Si le document n'existe pas encore dans Firestore, on le crée automatiquement
            const newUserRef = usersRef.doc(); // Crée un nouvel ID automatique
            await newUserRef.set({
                email: trimmedEmail,
                userPlan: 'débutant',
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


// 🚀 1. Envoi du code de vérification à l'utilisateur
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
        subject: 'Votre code de vérification Ovortex',
        htmlContent: `<p>Votre code de sécurité à usage unique est : <strong>${otpCode}</strong>. Il est valable 5 minutes.</p>`
    })
});

const brevoData = await brevoResponse.json();

if (!brevoResponse.ok) {
    throw new Error(brevoData.message || "Erreur lors de l'envoi de l'e-mail via Brevo");
}

// 🚀 2. Envoi d'une notification à l'administrateur
await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        sender: { name: "Ovortex Alerte", email: process.env.SENDER_EMAIL },
        to: [{ email: process.env.ADMIN_EMAIL }], // 👈 Récupéré via les variables sécurisées
        subject: 'Nouvelle tentative de connexion / inscription',
        htmlContent: `<p>Une personne vient de demander un code de vérification sur Ovortex avec l'e-mail : <strong>${trimmedEmail}</strong></p>`
    })
});

        res.json({ success: true, message: "Code envoyé par e-mail.", userId });
    } catch (error) {
        console.error("❌ Erreur envoi OTP :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du code." });
    }
});
app.post('/api/verify-otp', limiter, async (req, res) => {
    const { userId, code, rememberDevice } = req.body; // 👈 1. On récupère rememberDevice
    if (!userId || !code) return res.status(400).json({ error: "Données manquantes" });

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        const userData = userDoc.data();

        if (!userData.otpCode || userData.otpCode !== code || Date.now() > userData.otpExpires) {
            return res.status(400).json({ error: "Code invalide ou expiré." });
        }

        // Nettoyage de l'OTP
        const updateData = {
            otpCode: null,
            otpExpires: null
        };

        let trustedToken = null;

        // 🚀 2. Si l'utilisateur a coché "Se souvenir de moi"
        if (rememberDevice) {
            const crypto = require('crypto');
            trustedToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

            // On stocke le jeton de confiance dans le document de l'utilisateur (ou une collection dédiée)
            updateData.trustedDeviceToken = trustedToken;
            updateData.trustedDeviceExpires = expiresAt;
        }

        await userRef.update(updateData);

        // 3. On renvoie le token au client s'il existe
        res.json({ 
            success: true, 
            message: "Code validé avec succès.",
            trustedToken // 👈 Transmis au frontend
        });
    } catch (error) {
        console.error("❌ Erreur validation OTP :", error);
        res.status(500).json({ error: "Erreur serveur lors de la validation." });
    }
});

// --- ROUTE DE RÉSILIATION D'ABONNEMENT ---
app.post('/cancel-subscription', limiter, authenticateUser, async (req, res) => {
    const userId = req.user.uid;

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const userData = userDoc.data();
        const subscriptionId = userData.stripeSubscriptionId;

        if (!subscriptionId) {
            return res.status(400).json({ error: "Aucun abonnement Stripe actif trouvé pour cet utilisateur." });
        }

        // 1. CONFIGURER L'ANNULATION A LA FIN DE LA PÉRIODE
        // On ne supprime PAS l'abonnement immédiatement. On dit à Stripe d'arrêter le renouvellement.
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true // 👈 C'EST LA CLÉ
        });

        // 2. MISE À JOUR FIRESTORE - ON NE TOUCHE PAS AU PLAN
        // Le statut passe à 'canceling'. Ton webhook recevra bientôt un événement
        // customer.subscription.updated confirmant que l'annulation est planifiée.
        await userRef.update({
            subscriptionStatus: 'canceling', // Statut intermédiaire
            // userPlan: 'débutant', // 👈 COMMENTE OU SUPPRIME CETTE LIGNE
        });

        console.log(`✅ Annulation planifiée à la fin de la période pour ${subscriptionId} (Utilisateur ${userId})`);
        return res.json({ success: true, message: "Votre abonnement a été résilié. Vous continuerez d'en profiter jusqu'à la fin de votre période payée." });

    } catch (error) {
        console.error("❌ Erreur lors de la résiliation Stripe :", error.message);
        return res.status(500).json({ error: "Erreur interne lors de la résiliation de l'abonnement." });
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
        console.error("Erreur vérification verrou :", err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
});
// Route pour lister les vidéos
app.get('/api/list-videos', authenticateUser, (req, res) => {
        const videoDir = path.join(__dirname, 'public', 'videos');
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
    
    fs.readdir(videoDir, (err, files) => {
        if (err) return res.status(500).json({ error: "Erreur lecture" });
        res.json(files.filter(file => file.endsWith('.mp4')));
    });
});

// Route pour servir les fichiers vidéo en statique
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// --- ROUTE POUR SUPPRIMER UNE GÉNÉRATION DE IMAGE-LOCKS ---
app.delete('/api/generations/:userId/:generationId', authenticateUser, async (req, res) => {
    const { userId, generationId } = req.params;

    // 🛡️ Sécurité : On s'assure que l'utilisateur connecté est bien celui qu'il prétend être
    if (req.user.uid !== userId) {
        return res.status(403).json({ error: "Accès refusé : Action non autorisée." });
    }

    try {
        // Optionnel mais conseillé : vérifier dans Firestore si le document appartient bien à cet utilisateur avant de le supprimer
        const lockRef = db.collection("imageLocks").doc(generationId);
        const lockDoc = await lockRef.get();

        if (lockDoc.exists && lockDoc.data().userId !== userId) {
            return res.status(403).json({ error: "Action interdite sur cette ressource." });
        }

        await lockRef.delete();
        console.log(`🗑️ Document ${generationId} supprimé avec succès de la collection imageLocks`);
        
        return res.json({ success: true });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression dans imageLocks :", error);
        return res.status(500).json({ error: "Erreur serveur lors de la suppression" });
    }
});

// --- DÉMARRAGE DU SERVEUR ---
recoverInterruptedGenerations()
    .then(() => console.log("✅ Vérification des générations interrompues terminée"))
    .catch(err => console.error("❌ Erreur récupération générations :", err));

const PORT = process.env.PORT || 5000;
// --- TÂCHE PLANIFIÉE : RECHARGEMENT DES CRÉDITS ET EXPIRATION DES PACKS ---
// S'exécute automatiquement au début de chaque heure (ex: 14h00, 15h00...)

cron.schedule('0 * * * *', async () => {

    console.log("⏰ [CRON] Vérification des réinitialisations de crédits...");

    const now = Timestamp.now();

    try {

        // 1. Réinitialisation des abonnements actifs
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


            // Récupération du type d'abonnement
            const interval = data.subscriptionInterval || "month";


            // Annuel = pack complet pour l'année
            // Mensuel = crédits du mois
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
                `⚡ [CRON] Renouvellement ${interval} pour ${data.email} : ${tokensToAdd} éclairs`
            );
        }



        // 2. Expiration des Diamants après 1 an
        const expiredPacks = await db.collection('users')
            .where('packExpiryDate', '<=', now)
            .where('packTokens', '>', 0)
            .get();


        for (const doc of expiredPacks.docs) {

            await doc.ref.update({
                packTokens: 0
            });

            console.log(`💎 [CRON] Diamants expirés pour ${doc.id}`);
        }



        // 3. Downgrade des abonnements réellement terminés
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
                `⏰ [CRON] Fin abonnement, downgrade ${doc.id}`
            );


            await doc.ref.update({

                userPlan: 'débutant',

                tokens: 0,

                tokensResetDate: null

            });

        }


    } catch(err){

        console.error(
            "❌ [CRON] Erreur lors de la vérification :",
            err.message
        );

    }

});
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne et à l'écoute sur http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Rejet de promesse non géré :', reason);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Exception non capturée :', error);
});

server.timeout = 600000;
server.keepAliveTimeout = 600000;

setInterval(() => {}, 1000 * 60 * 60);