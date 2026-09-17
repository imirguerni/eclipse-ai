require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { fal } = require("@fal-ai/client");
const rateLimit = require("express-rate-limit");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const helmet = require('helmet');
const hpp = require('hpp');
const { db, auth } = require('./firebaseAdmin');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');

console.log("✅ Firebase Admin initialisé avec succès");
// En haut de votre fichier principal (ex: server/index.js)
const { isIpBlacklisted, blacklistIp } = require('./security/ipBlacklist');
const { detectSuspicious } = require('./security/detector');
const Groq = require("groq-sdk");
const ffmpeg = require('fluent-ffmpeg');
const { GoogleGenAI } = require('@google/genai');
const cron = require('node-cron');
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const nodemailer = require('nodemailer');
const multer = require('multer');


const { PRICING_DATA, PLAN_TO_PRICE, packs, ALLOWED_ENGINES } = require('./pricingConfig');
// --- INITIALISATION RECAPTCHA ---
const recaptchaClient = new RecaptchaEnterpriseServiceClient();
const admin = require('firebase-admin');

async function verifyRecaptcha(token) {
    if (!token) return false;
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
        
        if (!response.tokenProperties.valid) {
            console.error("❌ Jeton reCAPTCHA invalide :", response.tokenProperties.invalidReason);
            return false;
        }

        const score = response.riskAnalysis.score;
        console.log(`🛡️ Score reCAPTCHA reçu : ${score}`);
        
        return score >= 0.5;
    } catch (error) {
        console.error("❌ Erreur technique reCAPTCHA (contournée pour éviter les faux positifs) :", error.message);
        // 💡 En cas de panne ou d'erreur technique de l'API Google, 
        // on retourne true pour ne pas bloquer les utilisateurs légitimes.
        return true; 
    }
}


// 🛡️ MIDDLEWARE D'AUTHENTIFICATION :
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("🔍 Header Authorization reçu :", authHeader);
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

// --- CONFIGURATION FFMPEG ---

const ffmpegPath = process.platform === "win32"
    ? "D:/internet/internet/ffmpeg/bin/ffmpeg.exe"
    : "/usr/bin/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath);

console.log("🛠️ Configuration FFMPEG terminée.");
console.log("🖥️ Système :", process.platform);
console.log("🎬 Chemin FFMPEG utilisé :", ffmpegPath);

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
    const creditsByPlan = { essentiel: 300, standard: 700, master: 1200, elite: 2500, legende: 8000 };
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

// --- SDK IA ---
const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID || 'eclipse-ai-96f30',
    location: 'us-central1'
});


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
    essentiel: 300,
    standard: 700,
    master: 1200,
    elite: 2500,
    legende: 8000
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
app.get('/ping-veo', async (req, res) => {
    try {
        const modelName = 'veo-3.1-generate-preview';
        const operation = await ai.models.generateVideos({
            model: modelName,
            prompt: "A beautiful cinematic landscape, high quality, 8k", 
        });
        res.json({ status: "Connecté", operationName: operation.name });
    } catch (error) {
        res.status(500).json({ error: "Échec de connexion au modèle", message: error.message });
    }
});

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
        else if (amount >= 600)  totalPrice = isSubscriber ? 12.99 : 24.99;
        else if (amount >= 300)  totalPrice = isSubscriber ? 7.99 : 14.99;
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
    height,
    engineId, 
    cost, 
    costType, 
    aspect_ratio,
    recaptchaToken,

    // 🖼️ Image de référence envoyée par le frontend
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
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
        return res.status(403).json({ error: "Échec de la vérification de sécurité (bot détecté)." });
    }
if (!prompt || !engineId) {
        return res.status(400).json({ 
            error: "Paramètres manquants." 
        });
    }

    // 🔒 SÉCURITÉ : Calcul ou validation du coût côté serveur (on ne fait pas confiance au req.body.cost)
    // Adapte cette ligne selon la structure exacte de ton dictionnaire de prix d'images
// 1. Récupérer le plan de l'utilisateur (par exemple depuis sa base de données ou req.user, ici on met "0.00" par défaut ou on récupère son pack)
// Adapte "userDoc.data().plan" selon le nom du champ de ton plan utilisateur dans Firestore
// 🔒 SÉCURITÉ : Récupération du plan utilisateur en BDD pour appliquer le bon tarif
    const userRef = db.collection('users').doc(userId);
    const initialUserDoc = await userRef.get();
    const userData = initialUserDoc.exists ? initialUserDoc.data() : {};

    const userPlanKey = userData.plan || "0.00"; 
    const userPricingTable = PRICING_DATA[userPlanKey] || PRICING_DATA["0.00"];

    // 🔧 CORRECTION : Conversion de l'ID Fal complet en clé de ton dictionnaire
    let engineShortKey = engineId;
    if (engineId.includes("flux") || engineId.includes("schnell") || engineId.includes("dev")) {
        engineShortKey = "flux";
    }

    // Récupération de l'objet de prix pour ce moteur (ex: { pro: 4, dev: 3, schnell: 1 })
    const enginePricing = userPricingTable?.[engineShortKey] || userPricingTable?.[engineId];

    // Extraction du coût spécifique selon la variante (schnell, dev, pro)
    let officialCost;
    if (typeof enginePricing === 'object' && enginePricing !== null) {
        if (engineId.includes("schnell")) officialCost = enginePricing.schnell;
        else if (engineId.includes("dev")) officialCost = enginePricing.dev;
        else if (engineId.includes("pro")) officialCost = enginePricing.pro;
        else officialCost = Object.values(enginePricing)[0]; // Valeur par défaut de secours
    } else {
        officialCost = enginePricing;
    }

    if (officialCost === undefined || !Number.isFinite(Number(officialCost))) {
        console.error(`❌ Tarif serveur introuvable pour le plan ${userPlanKey} et le moteur : ${engineId}`);
        return res.status(400).json({
            error: "Tarification serveur introuvable pour ce moteur."
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
                createdAt: FieldValue.serverTimestamp()
            });

            transaction.update(userRef, {
                [fieldToDecrement]: FieldValue.increment(-finalCost)
            });

    });

    // ⚡ Le débit est réellement validé en BDD à partir d'ICI
    creditsDebited = true;

    // 🧪 CRASH DE TEST : Placé APRÈS la transaction réussie

    let finalImageUrl;
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
        } else {
      let falImageSize = "landscape_4_3";

if (aspect_ratio === "16:9") {
    falImageSize = "landscape_16_9";
}
else if (aspect_ratio === "9:16") {
    falImageSize = "portrait_16_9";
}
else if (aspect_ratio === "1:1") {
    falImageSize = "square";
}

console.log("📐 Format image envoyé à Fal :", falImageSize);

// 1. Nettoyez le prompt des termes indésirables ou non supportés par les API externes
const cleanedPrompt = prompt
    .replace(/photoréaliste|réalisme extrême|qualité cinéma hollywoodien|8k|textures de peau détaillées|éclairage volumétrique|HDR/gi, '')
    .replace(/,\s*,/g, ',')
    .trim();

// 2. Utilisez "cleanedPrompt" dans l'objet envoyé à Fal
// ============================================================
// 🖼️ GESTION IMAGE DE RÉFÉRENCE / FLUX
// ============================================================


let falEngineId = engineId;
let falInput = {
    prompt: cleanedPrompt,
    image_size: falImageSize
};

// ------------------------------------------------------------
// FLUX DEV + IMAGE
// ------------------------------------------------------------
if (
    referenceImage &&
    engineId.includes("flux/dev")
) {
    falEngineId = "fal-ai/flux/dev/image-to-image";

    falInput = {
        prompt: cleanedPrompt,
        image_url: referenceImage,
        image_size: falImageSize,
        strength: 0.65
    };

    console.log("🖼️ Flux Dev → IMAGE-TO-IMAGE avec Prompt");
}

// ------------------------------------------------------------
// FLUX SCHNELL + IMAGE
// ------------------------------------------------------------
else if (
    referenceImage &&
    engineId.includes("flux/schnell")
) {
    falEngineId = "fal-ai/flux/schnell/image-to-image";

    falInput = {
        prompt: cleanedPrompt,
        image_url: referenceImage,
        image_size: falImageSize,
        strength: 0.65
    };

    console.log("🖼️ Flux Schnell → IMAGE-TO-IMAGE avec Prompt");
}

// ------------------------------------------------------------
// FLUX PRO + IMAGE
// ------------------------------------------------------------
else if (
    referenceImage &&
    engineId.includes("flux-pro")
) {
    // ✅ Pour Flux Pro v1.1, on utilise l'endpoint principal avec l'image et le prompt combinés
    falEngineId = "fal-ai/flux-pro/v1.1";

    falInput = {
        prompt: cleanedPrompt,
        image_url: referenceImage,
        image_size: falImageSize
    };

    console.log("🖼️ Flux Pro v1.1 → PROMPT + IMAGE");
}

// ------------------------------------------------------------
// GÉNÉRATION NORMALE SANS IMAGE
// ------------------------------------------------------------
else {
    console.log("📝 Flux → TEXT-TO-IMAGE");
}

console.log("🚀 Modèle Fal utilisé :", falEngineId);
console.log("📦 Input Fal :", JSON.stringify({
    ...falInput,
    image_url: referenceImage ? "[IMAGE]" : undefined
}, null, 2));

const result = await fal.subscribe(falEngineId, {
    input: falInput,
    logs: true
});

console.log("📦 REPONSE COMPLETE FAL :", JSON.stringify(result, null, 2));

finalImageUrl = result.data?.images?.[0]?.url 
             || result.images?.[0]?.url;

if (!finalImageUrl) {
    throw new Error("Fal.ai vide.");
}
        }
// ✅ Marque la génération comme terminée
        generationFinished = true; 

 await lockRef.update({
            status: "completed",
            completedAt: FieldValue.serverTimestamp(),
            imageUrl: finalImageUrl,
            prompt: prompt 
        });

        console.log("📤 REPONSE ENVOYEE AU FRONT :", finalImageUrl);
        res.json({
            imageUrl: finalImageUrl
        });
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
    console.log("DEBUG BODY:", JSON.stringify(req.body, null, 2));

    const { 
        engineId, cost, costType, 
        prompt, duration, aspect_ratio, 
        image_urls, video_urls, loop, enable_audio, videoSource,
        startImage, start_image_url, image_url,
        character_orientation,
        recaptchaToken, 
        qualityKey
    } = req.body;

    console.log("RECAPTCHA TOKEN:", recaptchaToken);

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
                provider: "fal",
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

          // --- BLOC SÉCURISÉ HAILUO / FAL (À COPIER-COLLER SCRUPULEUSEMENT) ---
// ✅ SEULE ET UNIQUE CONDITION POUR GOOGLE VEO (Gère veo3 et veo3_lite)
const isGoogleVideo = Boolean(engineId && (engineId.startsWith("veo") || engineId.includes("google")));
if (isGoogleVideo) {
    // 🔐 SÉCURITÉ : Validation du modèle
    let officialGoogleModel;
  if (engineId === "veo3_lite") {
        officialGoogleModel = "veo-3.1-lite-generate-001";
    } else {
        officialGoogleModel = "veo-3.1-generate-preview";
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
            videoConfig: videoConfig,
            outputMimeType: "video/mp4"
        }
    };
const image_url = (image_urls && image_urls.length > 0) ? image_urls[0] : null;

            // On utilise la variable image_url définie plus haut dans ton code (qui prend image_urls[0])
            if (image_url && typeof image_url === 'string') {
                console.log("📸 Image de début détectée pour Veo, conversion et intégration au SDK...");
                try {
                    // Si l'image arrive au format data:image/png;base64,xxxx
                    if (image_url.includes("base64,")) {
                        const parts = image_url.split("base64,");
                        const mimeType = parts[0].split(":")[1].split(";")[0] || "image/png";
                        const base64Data = parts[1];

                        generateOptions.image = {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        };
                    } else {
                        // Si c'est une URL publique directe (http/https), le SDK peut la traiter directement selon les versions,
                        // ou si tu préfères la passer brute. Ici configuré pour une URL standard :
                        generateOptions.image = image_url;
                    }
                } catch (imgError) {
                    console.error("⚠️ Impossible de formater l'image pour Veo, la génération continue en Text-to-Video :", imgError.message);
                }
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

// 🧪 LOGS DEBUG
console.log(`🔍 Diagnostic FFMPEG :`);
console.log(`   - Dossier cible : ${dir}`);
console.log(`   - Fichier écrit : ${filePath}`);
console.log(
    `   - Vérification accès disque : ${
        fs.existsSync(filePath) ? "OUI ✅" : "NON ❌"
    }`
);

await new Promise((resolve, reject) => {
    // ⏱️ TIMEOUT SÉCURISÉ
  timeout = setTimeout(() => {
    safeFinish(() => {
        reject(new Error("Timeout FFMPEG : dépassement 120s"));
    });
}, 120000);

    ffmpeg(filePath)
        .outputOptions([
            '-t ' + duration,
            '-vf scale=' + (targetSize === "1920x1080" ? "1920:1080" : "1280:720"),
            '-c:v libx264',
            '-preset fast',
            '-movflags +faststart'
        ])

        
        .output(outputPath)
        .on("start", (cmd) => {
            console.log("🚀 FFMPEG commande lancée:", cmd);
        })


.on("end", () => {    
    safeFinish(async () => {
        console.log(`✂️ Vidéo traitée : ${duration}s, Résolution : ${targetSize}`);
        fs.unlink(filePath, (err) => { if (err) console.error(err); });

        const finalUrl = `${req.protocol}://${req.get("host")}/videos/${finalFileName}`;

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
        console.log("🔒 Verrou imageLocks mis à jour et finalisé avec succès pour Veo.");
    } catch (lockErr) {
        console.error("⚠️ Erreur lors de la mise à jour finale du verrou imageLocks :", lockErr.message);
    }
}
        
        // 3️⃣ Envoi de la vidéo au client via le flux SSE
        res.write(`data: ${JSON.stringify({ 
            videoUrl: finalUrl, 
            percent: 100, 
            message: "Vidéo prête !" 
        })}\n\n`);
        res.end(); // Ferme le flux proprement
        
        resolve(); 
    });
})

.on("error", (err, stdout, stderr) => {
    console.error("❌❌❌ ERREUR FFMPEG ❌❌❌");
    console.error("Message :", err?.message);
    console.error("Code :", err?.code);
    console.error("STDOUT :", stdout);
    console.error("STDERR :", stderr);
    console.error("Fichier source :", filePath);
    console.error("Fichier sortie :", outputPath);

    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.error("Taille fichier source :", stats.size, "octets");
        }

        if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.error("Taille fichier sortie :", stats.size, "octets");
        }
    } catch (debugError) {
        console.error("Erreur diagnostic fichiers :", debugError.message);
    }

    safeFinish(() => {
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({
                error: "Erreur traitement vidéo final.",
                details: err?.message || "Erreur FFmpeg"
            })}\n\n`);
            res.end();
        }

        reject(err);
    });
})

        .run();
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

else {

// --- TOUS LES AUTRES MOTEURS PASSENT PAR FAL.AI ---

console.log("ETAPE 1 : entrée traitement vidéo");
console.log(`🎨 Lancement via Fal.ai pour le moteur : ${engineId}`);

let targetEngineId = req.body.modelEndpoint || engineId;
let finalInput = { prompt, aspect_ratio: aspect_ratio || "16:9", resolution: req.body.resolution || "720p" };


// 🛠️ CORRECTION NGROK : Remplacement de localhost par l'URL publique ngrok pour Fal.ai
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
    engineId.includes("kling-video/v3") ||
    engineId.includes("kling3")
) {
    console.log("🚀 KLING 3.0 : configuration du payload Fal.ai");

    // ========================================================
    // 1. RÉCUPÉRATION IMAGE DE DÉBUT
    // ========================================================
    const sourceStartImage =
        req.body.start_image_url ||
        req.body.image_url ||
        req.body.startImage ||
        image_urls?.[0] ||
        null;

    // ========================================================
    // 2. RÉCUPÉRATION IMAGE DE FIN
    // ========================================================
    const sourceEndImage =
        req.body.end_image_url ||
        req.body.tail_image_url ||
        null;

    // ========================================================
    // 3. CONVERSION localhost -> URL PUBLIQUE
    //    Utilisée uniquement pour récupérer le fichier
    //    AVANT son upload vers Fal Storage.
    // ========================================================
    const toPublicUrl = (url) => {
        if (!url || typeof url !== "string") {
            return null;
        }

        url = url.trim();

        if (url.includes("localhost:5000")) {
            return url.replace(
                "http://localhost:5000",
                "https://eclipse-ai.onrender.com"
            );
        }

        return url;
    };

    const publicStartImage =
        toPublicUrl(sourceStartImage);

    const publicEndImage =
        toPublicUrl(sourceEndImage);

    // ========================================================
    // 4. FONCTION UPLOAD VERS FAL STORAGE
    // ========================================================
    const uploadImageToFal = async (url, name) => {

        if (!url) {
            return null;
        }

        console.log("");
        console.log("==============================================");
        console.log(`☁️ FAL STORAGE — ${name}`);
        console.log("==============================================");
        console.log("➡️ Source :", url);

        try {

            // ------------------------------------------------
            // Télécharger l'image depuis ton serveur
            // ------------------------------------------------
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Impossible de récupérer l'image : HTTP ${response.status}`
                );
            }

            const contentType =
                response.headers.get("content-type") ||
                "image/png";

            const buffer =
                Buffer.from(
                    await response.arrayBuffer()
                );

            console.log(
                "➡️ Content-Type :",
                contentType
            );

            console.log(
                "➡️ Taille :",
                buffer.length,
                "octets"
            );

            if (!buffer.length) {
                throw new Error(
                    "Le fichier téléchargé est vide."
                );
            }

            if (
                !contentType
                    .toLowerCase()
                    .startsWith("image/")
            ) {
                throw new Error(
                    `Type de fichier invalide : ${contentType}`
                );
            }

            // ------------------------------------------------
            // Détermination de l'extension
            // ------------------------------------------------
            let extension = ".png";

            if (
                contentType.includes("jpeg") ||
                contentType.includes("jpg")
            ) {
                extension = ".jpg";
            } else if (
                contentType.includes("webp")
            ) {
                extension = ".webp";
            }

            const fileName =
                `${name.replace(/\s+/g, "_").toLowerCase()}${extension}`;

            // ------------------------------------------------
            // Création du File
            // ------------------------------------------------
            const file = new File(
                [buffer],
                fileName,
                {
                    type: contentType
                }
            );

            console.log(
                "➡️ Fichier créé :",
                fileName
            );

            // ------------------------------------------------
            // Upload vers Fal Storage
            // ------------------------------------------------
            const falUrl =
                await fal.storage.upload(file);

            if (
                !falUrl ||
                typeof falUrl !== "string"
            ) {
                throw new Error(
                    "Fal Storage n'a pas retourné une URL valide."
                );
            }

            console.log(
                "✅ Upload Fal Storage réussi"
            );

            console.log(
                "☁️ URL Fal :",
                falUrl
            );

            console.log("==============================================");

            return falUrl;

        } catch (error) {

            console.error("");
            console.error(
                `❌ ÉCHEC UPLOAD FAL STORAGE — ${name}`
            );

            console.error(
                "Message :",
                error?.message
            );

            console.error(
                "Name :",
                error?.name
            );

            console.error(
                "Stack :",
                error?.stack
            );

            console.error("==============================================");

            throw new Error(
                `Impossible d'uploader ${name} vers Fal Storage : ${error.message}`
            );
        }
    };

    // ========================================================
    // 5. UPLOAD IMAGE DÉBUT VERS FAL
    // ========================================================
    let falStartImage = null;

    if (publicStartImage) {

        falStartImage =
            await uploadImageToFal(
                publicStartImage,
                "KLING_START_IMAGE"
            );

    }

    // ========================================================
    // 6. UPLOAD IMAGE FIN VERS FAL
    // ========================================================
    let falEndImage = null;

    if (publicEndImage) {

        falEndImage =
            await uploadImageToFal(
                publicEndImage,
                "KLING_END_IMAGE"
            );

    }

    // ========================================================
    // 7. DÉTECTION STANDARD / PRO
    // ========================================================
    const requestedEndpoint =
        typeof req.body.modelEndpoint === "string"
            ? req.body.modelEndpoint.trim()
            : "";

    const isPro =
        engineId.includes("pro") ||
        requestedEndpoint.includes("/pro/") ||
        requestedEndpoint.includes(
            "kling-video/v3/pro"
        );

    const tierPath =
        isPro
            ? "pro"
            : "standard";

    // ========================================================
    // 8. CHOIX DE L'ENDPOINT
    // ========================================================
    if (falStartImage) {

        targetEngineId =
            requestedEndpoint ||
            `fal-ai/kling-video/v3/${tierPath}/image-to-video`;

    } else {

        targetEngineId =
            requestedEndpoint ||
            `fal-ai/kling-video/v3/${tierPath}/text-to-video`;
    }

    // ========================================================
    // 9. DURÉE
    // ========================================================
    const requestedDuration =
        parseInt(
            req.body.duration || duration,
            10
        );

    const klingDuration =
        Number.isInteger(requestedDuration) &&
        requestedDuration >= 3 &&
        requestedDuration <= 15
            ? requestedDuration
            : 5;

    // ========================================================
    // 10. PROMPT
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
    // 11. PAYLOAD KLING
    // ========================================================
    finalInput = {

        prompt: klingPrompt,

        duration: klingDuration,

        negative_prompt:
            typeof req.body.negative_prompt === "string" &&
            req.body.negative_prompt.trim()
                ? req.body.negative_prompt.trim()
                : "blur, distort, and low quality",

        generate_audio:
            req.body.generate_audio ??
            req.body.enable_audio ??
            false
    };

    // ========================================================
    // 12. IMAGE DÉBUT = URL FAL STORAGE
    // ========================================================
    if (falStartImage) {

        finalInput.start_image_url =
            falStartImage;

        console.log(
            "🖼️ KLING — IMAGE DÉBUT FAL :",
            falStartImage
        );
    }

    // ========================================================
    // 13. IMAGE FIN = URL FAL STORAGE
    // ========================================================
    if (falEndImage) {

        finalInput.end_image_url =
            falEndImage;

        console.log(
            "🖼️ KLING — IMAGE FIN FAL :",
            falEndImage
        );
    }

    // ========================================================
    // 14. VÉRIFICATION FINALE
    // ========================================================
    console.log("");
    console.log("==============================================");
    console.log("🎬 KLING 3.0 CONFIGURATION");
    console.log("==============================================");

    console.log(
        "➡️ Engine ID :",
        engineId
    );

    console.log(
        "➡️ Endpoint :",
        targetEngineId
    );

    console.log(
        "➡️ Niveau :",
        tierPath
    );

    console.log(
        "➡️ Durée :",
        klingDuration
    );

    console.log(
        "➡️ Image début :",
        falStartImage
            ? "✅ FAL STORAGE"
            : "❌ NON"
    );

    console.log(
        "➡️ Image fin :",
        falEndImage
            ? "✅ FAL STORAGE"
            : "❌ NON"
    );

    console.log("==============================================");

    console.log(
        "📦 PAYLOAD FINAL KLING"
    );

    console.log(
        JSON.stringify(
            finalInput,
            null,
            2
        )
    );

    console.log("==============================================");
    console.log(
        "🚀 ENVOI VERS FAL.AI / KLING"
    );
    console.log("==============================================");

    // ========================================================
    // 15. APPEL KLING
    // ========================================================
    let falResult;

    try {

        falResult =
            await fal.subscribe(
                targetEngineId,
                {
                    input: finalInput,

                    logs: true,

                    onQueueUpdate:
                        (update) => {

                            console.log(
                                "📡 KLING QUEUE UPDATE :",
                                JSON.stringify(
                                    update,
                                    null,
                                    2
                                )
                            );

                            if (
                                update.status ===
                                "IN_PROGRESS"
                            ) {

                                res.write(
                                    `event: progress\ndata: ${JSON.stringify(update)}\n\n`
                                );
                            }
                        }
                }
            );

        // ====================================================
        // SUCCÈS
        // ====================================================
        console.log("");
        console.log("==============================================");
        console.log(
            "✅ KLING 3.0 : GÉNÉRATION TERMINÉE"
        );
        console.log("==============================================");

        console.log(
            JSON.stringify(
                falResult,
                null,
                2
            )
        );

        console.log("==============================================");

    } catch (falError) {

        // ====================================================
        // ERREUR FAL / KLING
        // ====================================================
        console.error("");
        console.error("==============================================");
        console.error(
            "❌ ERREUR KLING 3.0 / FAL.AI"
        );
        console.error("==============================================");

        console.error(
            "➡️ Message :",
            falError?.message
        );

        console.error(
            "➡️ Name :",
            falError?.name
        );

        console.error(
            "➡️ Status :",
            falError?.status
        );

        console.error(
            "➡️ StatusCode :",
            falError?.statusCode
        );

        console.error(
            "➡️ Body :",
            falError?.body
        );

        console.error(
            "➡️ Request ID :",
            falError?.requestId
        );

        console.error(
            "➡️ Details :",
            falError?.details
        );

        try {

            console.error(
                "➡️ Erreur complète :",
                JSON.stringify(
                    falError,
                    Object.getOwnPropertyNames(
                        falError
                    ),
                    2
                )
            );

        } catch (jsonError) {

            console.error(
                "Impossible de sérialiser l'erreur :",
                jsonError.message
            );
        }

        console.error("");
        console.error(
            "📦 PAYLOAD KLING REFUSÉ :"
        );

        console.error(
            JSON.stringify(
                finalInput,
                null,
                2
            )
        );

        console.error("");
        console.error(
            "🎯 ENDPOINT :",
            targetEngineId
        );

        console.error("==============================================");

        // Laisse ton catch principal gérer
        // le remboursement des crédits.
        throw falError;
    }
}

// ============================================================
// 2. KLING MOTION CONTROL — STANDARD / PRO
// ============================================================

else if (
    engineId.includes("kling") &&
    engineId.includes("motion")
) {

    console.log("🚀 ETAPE KLING MOTION CONTROL : configuration");

    // --------------------------------------------------------
    // DÉPENDANCES
    // --------------------------------------------------------

    const fs = require("fs");
    const path = require("path");

    // --------------------------------------------------------
    // DÉTECTION PRO / STANDARD
    // --------------------------------------------------------

    const requestedEndpoint = String(
        req.body.modelEndpoint || ""
    ).toLowerCase();

    const isPro =
        engineId.toLowerCase().includes("pro") ||
        requestedEndpoint.includes("/pro/");

    // --------------------------------------------------------
    // ENDPOINT FAL.AI KLING 2.6 MOTION CONTROL
    // --------------------------------------------------------

    targetEngineId = isPro
        ? "fal-ai/kling-video/v2.6/pro/motion-control"
        : "fal-ai/kling-video/v2.6/standard/motion-control";

    console.log("🎬 Kling Motion Control sélectionné :", {
        version: "2.6",
        mode: isPro ? "PRO" : "STANDARD",
        endpoint: targetEngineId
    });

    // ========================================================
    // IMAGE DU PERSONNAGE
    // ========================================================

    const sourceCharacterImage =
        req.body.start_image_url ||
        req.body.image_url ||
        req.body.startImage ||
        (Array.isArray(image_urls) ? image_urls[0] : null) ||
        null;

    // ========================================================
    // VIDÉO DE RÉFÉRENCE
    // ========================================================

    const sourceReferenceVideo =
        req.body.video_url ||
        req.body.videoSource ||
        req.body.videoUrl ||
        (Array.isArray(video_urls) ? video_urls[0] : null) ||
        null;

    // ========================================================
    // VÉRIFICATIONS DE BASE
    // ========================================================

    if (!sourceCharacterImage) {
        throw new Error(
            "Kling Motion Control requiert une image du personnage."
        );
    }

    if (!sourceReferenceVideo) {
        throw new Error(
            "Kling Motion Control requiert une vidéo de référence."
        );
    }

    console.log("📸 Source image reçue :", sourceCharacterImage);
    console.log("🎥 Source vidéo reçue :", sourceReferenceVideo);

    // ========================================================
    // FONCTION : RETROUVER UN FICHIER LOCAL
    // ========================================================

    const resolveLocalUploadPath = (
        fileUrlOrPath,
        fileTypeName
    ) => {

        if (!fileUrlOrPath) {
            throw new Error(
                `${fileTypeName} : source absente.`
            );
        }

        let fileName = null;

        // ----------------------------------------------------
        // CAS 1 : URL HTTP / HTTPS
        // ----------------------------------------------------

        if (
            typeof fileUrlOrPath === "string" &&
            (
                fileUrlOrPath.startsWith("http://") ||
                fileUrlOrPath.startsWith("https://")
            )
        ) {

            try {

                const parsedUrl = new URL(fileUrlOrPath);

                fileName = path.basename(
                    parsedUrl.pathname
                );

            } catch (error) {

                throw new Error(
                    `${fileTypeName} : URL invalide : ${fileUrlOrPath}`
                );
            }
        }

        // ----------------------------------------------------
        // CAS 2 : CHEMIN LOCAL
        // ----------------------------------------------------

        else {

            fileName = path.basename(
                String(fileUrlOrPath)
            );
        }

        // ----------------------------------------------------
        // VÉRIFICATION NOM
        // ----------------------------------------------------

        if (!fileName) {

            throw new Error(
                `${fileTypeName} : impossible de déterminer le nom du fichier.`
            );
        }

        console.log(
            `🔎 ${fileTypeName} : fichier recherché = ${fileName}`
        );

        // ====================================================
        // DOSSIERS POSSIBLES
        // ====================================================

        const possiblePaths = [

            // Structure actuelle du serveur
            path.join(
                __dirname,
                "public",
                "uploads",
                fileName
            ),

            // Sécurité si process.cwd() diffère de __dirname
            path.join(
                process.cwd(),
                "public",
                "uploads",
                fileName
            ),

            // Structure alternative
            path.join(
                __dirname,
                "uploads",
                fileName
            ),

            // Structure alternative depuis cwd
            path.join(
                process.cwd(),
                "uploads",
                fileName
            )
        ];

        // ====================================================
        // RECHERCHE
        // ====================================================

        let localDiskPath = null;

        for (const candidate of possiblePaths) {

            if (fs.existsSync(candidate)) {

                localDiskPath = candidate;

                console.log(
                    `✅ ${fileTypeName} trouvé : ${candidate}`
                );

                break;
            }

            console.log(
                `❌ ${fileTypeName} absent : ${candidate}`
            );
        }

        // ====================================================
        // FICHIER INTROUVABLE
        // ====================================================

        if (!localDiskPath) {

            throw new Error(
                `${fileTypeName} introuvable sur le disque.\n\n` +
                `Nom recherché : ${fileName}\n\n` +
                `Dossiers vérifiés :\n` +
                possiblePaths.join("\n")
            );
        }

        // ====================================================
        // VÉRIFICATION FICHIER
        // ====================================================

        const stats = fs.statSync(localDiskPath);

        if (!stats.isFile()) {

            throw new Error(
                `${fileTypeName} n'est pas un fichier valide : ${localDiskPath}`
            );
        }

        if (stats.size <= 0) {

            throw new Error(
                `${fileTypeName} est vide : ${localDiskPath}`
            );
        }

        console.log(
            `📦 Taille ${fileTypeName} : ${stats.size} octets`
        );

        return localDiskPath;
    };

    // ========================================================
    // FONCTION : UPLOAD LOCAL → FAL STORAGE
    // ========================================================

    const uploadLocalFileToFal = async (
        fileUrlOrPath,
        fileTypeName
    ) => {

        // ----------------------------------------------------
        // TROUVER LE FICHIER
        // ----------------------------------------------------

        const localDiskPath =
            resolveLocalUploadPath(
                fileUrlOrPath,
                fileTypeName
            );

        console.log(
            `📂 Lecture locale pour Fal Storage : ${localDiskPath}`
        );

        // ----------------------------------------------------
        // LECTURE
        // ----------------------------------------------------

        const buffer = fs.readFileSync(
            localDiskPath
        );

        if (!buffer || buffer.length === 0) {

            throw new Error(
                `${fileTypeName} : fichier vide.`
            );
        }

        // ----------------------------------------------------
        // EXTENSION
        // ----------------------------------------------------

        const extension =
            path.extname(localDiskPath).toLowerCase() ||
            ".bin";

        // ----------------------------------------------------
        // MIME TYPE
        // ----------------------------------------------------

        let contentType =
            "application/octet-stream";

        switch (extension) {

            case ".jpg":
            case ".jpeg":

                contentType = "image/jpeg";

                break;

            case ".png":

                contentType = "image/png";

                break;

            case ".webp":

                contentType = "image/webp";

                break;

            case ".mp4":

                contentType = "video/mp4";

                break;

            case ".mov":

                contentType = "video/quicktime";

                break;

            case ".webm":

                contentType = "video/webm";

                break;
        }

        // ----------------------------------------------------
        // NOM FICHIER FAL
        // ----------------------------------------------------

        const fileName =
            `${fileTypeName.toLowerCase()}_${Date.now()}${extension}`;

        // ----------------------------------------------------
        // CRÉATION FILE
        // ----------------------------------------------------

        const file = new File(
            [buffer],
            fileName,
            {
                type: contentType
            }
        );

        console.log(
            `☁️ Upload vers Fal Storage : ${fileName}`
        );

        // ----------------------------------------------------
        // UPLOAD
        // ----------------------------------------------------

        const falUrl =
            await fal.storage.upload(file);

        // ----------------------------------------------------
        // VALIDATION URL
        // ----------------------------------------------------

        if (!falUrl) {

            throw new Error(
                `${fileTypeName} : Fal Storage n'a retourné aucune URL.`
            );
        }

        console.log(
            `✅ Upload réussi vers Fal Storage (${fileTypeName}) :`,
            falUrl
        );

        return falUrl;
    };

    // ========================================================
    // VALIDATION DES DEUX FICHIERS AVANT UPLOAD
    // ========================================================

    console.log("==============================================");
    console.log("🔍 VALIDATION DES FICHIERS KLING");
    console.log("==============================================");

    const characterLocalPath =
        resolveLocalUploadPath(
            sourceCharacterImage,
            "KLING_CHARACTER_IMAGE"
        );

    const referenceVideoLocalPath =
        resolveLocalUploadPath(
            sourceReferenceVideo,
            "KLING_REF_VIDEO"
        );

    console.log(
        "✅ Image locale validée :",
        characterLocalPath
    );

    console.log(
        "✅ Vidéo locale validée :",
        referenceVideoLocalPath
    );

    // ========================================================
    // UPLOAD IMAGE VERS FAL STORAGE
    // ========================================================

    const publicCharacterImage =
        await uploadLocalFileToFal(
            characterLocalPath,
            "KLING_CHARACTER_IMAGE"
        );

    // ========================================================
    // UPLOAD VIDÉO VERS FAL STORAGE
    // ========================================================

    const publicReferenceVideo =
        await uploadLocalFileToFal(
            referenceVideoLocalPath,
            "KLING_REF_VIDEO"
        );

    // ========================================================
    // VALIDATION URLS FAL
    // ========================================================

    if (!publicCharacterImage) {

        throw new Error(
            "Fal Storage : URL image personnage absente."
        );
    }

    if (!publicReferenceVideo) {

        throw new Error(
            "Fal Storage : URL vidéo référence absente."
        );
    }

    console.log("✅ Les deux fichiers sont maintenant sur Fal Storage.");

    // ========================================================
    // ORIENTATION DU PERSONNAGE
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
            ? Boolean(req.body.keep_original_sound)

            : req.body.enable_audio !== undefined
                ? Boolean(req.body.enable_audio)

                : true;

    // ========================================================
    // PAYLOAD FINAL KLING
    // ========================================================

    finalInput = {

        image_url:
            publicCharacterImage,

        video_url:
            publicReferenceVideo,

        character_orientation:
            orientation,

        keep_original_sound:
            keepOriginalSound
    };

    // ========================================================
    // PROMPT FACULTATIF
    // ========================================================

    const finalPrompt =
        req.body.prompt ||
        prompt ||
        "";

    if (
        typeof finalPrompt === "string" &&
        finalPrompt.trim()
    ) {

        finalInput.prompt =
            finalPrompt.trim();
    }

    // ========================================================
    // LOG COMPLET
    // ========================================================

    console.log("==============================================");
    console.log("🎬 KLING 2.6 MOTION CONTROL");
    console.log("==============================================");

    console.log(
        "➡️ Engine ID :",
        engineId
    );

    console.log(
        "➡️ Endpoint :",
        targetEngineId
    );

    console.log(
        "➡️ Mode :",
        isPro ? "PRO" : "STANDARD"
    );

    console.log(
        "➡️ Image locale :",
        characterLocalPath
    );

    console.log(
        "➡️ Image Fal :",
        publicCharacterImage
    );

    console.log(
        "➡️ Vidéo locale :",
        referenceVideoLocalPath
    );

    console.log(
        "➡️ Vidéo Fal :",
        publicReferenceVideo
    );

    console.log(
        "➡️ Orientation :",
        orientation
    );

    console.log(
        "➡️ Son original :",
        keepOriginalSound
    );

    console.log(
        "➡️ Prompt :",
        finalInput.prompt || "(aucun)"
    );

    console.log("==============================================");

    console.log(
        "📦 PAYLOAD FINAL KLING MOTION"
    );

    console.log("==============================================");

    console.log(
        JSON.stringify(
            finalInput,
            null,
            2
        )
    );

    console.log("==============================================");

}
// ============================================================
// 3. KLING 2.6 PRO (Strictement isolé des versions 3)
// ============================================================
else if (
    engineId.includes("kling26") ||
    (engineId.includes("kling") && !engineId.includes("v3") && !engineId.includes("30"))
) {
    console.log("🚀 KLING 2.6 PRO : configuration START + END IMAGE");

    const sourceStartImage =
        req.body.start_image_url ||
        req.body.image_url ||
        req.body.startImage ||
        (typeof image_url !== "undefined" ? image_url : null);

    const sourceEndImage =
        req.body.end_image_url ||
        req.body.tail_image_url ||
        (typeof end_image_url !== "undefined" ? end_image_url : null);

    const toPublicUrl = (url) => {
        if (!url || typeof url !== "string") return null;
        if (url.includes("localhost:5000")) {
            return url.replace(
                "http://localhost:5000",
                "https://eclipse-ai.onrender.com"
            );
        }
        return url;
    };

    const publicStartImage = toPublicUrl(sourceStartImage);
    const publicEndImage = toPublicUrl(sourceEndImage);

    if (publicStartImage) {
        targetEngineId = "fal-ai/kling-video/v2.6/pro/image-to-video";
    } else {
        targetEngineId = "fal-ai/kling-video/v2.6/pro/text-to-video";
    }

    finalInput = {
        prompt: prompt || req.body.prompt || "",
        duration: String(parseInt(duration) || 5),
        negative_prompt: req.body.negative_prompt || "blur, distort, and low quality",
        generate_audio: req.body.generate_audio ?? false,

        ...(publicStartImage && {
            start_image_url: publicStartImage
        })
    };

    console.log(`📦 PAYLOAD KLING 2.6 (${targetEngineId}) :`);
    console.log(JSON.stringify(finalInput, null, 2));
}

else if (engineId.includes("hailuo")) {
    console.log("🚀 ETAPE HAILUO : configuration");

    // 1. Détection propre de l'image
    const hailuoImg = validImg || req.body.startImage || req.body.start_image || req.body.image_url || req.body.start_image_url || (image_urls && image_urls[0]);
    const cleanHailuoImg = (hailuoImg && typeof hailuoImg === 'string' && !hailuoImg.endsWith('.mp4')) ? hailuoImg : null;

    const hasImage = Boolean(cleanHailuoImg || req.body.end_image_url);
    const mode = hasImage ? "image-to-video" : "text-to-video";

    // 2. Détermination de la gamme (standard vs pro)
    const isPro = req.body.resolution === "768p" || req.body.resolution === "1080p" || req.body.resolution === "pro";
    const range = isPro ? "pro" : "standard";

    // Forcer le bon endpoint
    targetEngineId = `fal-ai/minimax/hailuo-02/${range}/${mode}`;

    // 3. Nettoyage du prompt
    let cleanedPrompt = (prompt || req.body.prompt || "")
        .replace(/photoréaliste|réalisme extrême|qualité cinéma hollywoodien|8k|textures de peau détaillées|éclairage volumétrique|HDR/gi, '')
        .replace(/,\s*,/g, ',')
        .trim();

    // 4. Construction du payload STRICT pour Fal.ai
    finalInput = {
        prompt: cleanedPrompt,
        prompt_optimizer: true,
        duration: (duration === "10" || duration === "10s" || req.body.duration == 10) ? 10 : 6 // Entier requis (6 ou 10)
    };

    if (hasImage) {
        // --- MODE IMAGE-TO-VIDEO ---
        if (cleanHailuoImg) {
            finalInput.image_url = cleanHailuoImg; // UNIQUEMENT image_url
        }
        if (req.body.end_image_url) {
            finalInput.end_image_url = req.body.end_image_url;
        }
        
        // Optionnel : résolution pour le mode image ("512P" ou "768P" selon schéma Fal.ai)
        if (req.body.resolution && req.body.resolution.toLowerCase().includes("512")) {
            finalInput.resolution = "512P";
        } else if (isPro) {
            finalInput.resolution = "768P";
        }
    } else {
        // --- MODE TEXT-TO-VIDEO ---
        // Seul aspect_ratio est autorisé en mode texte (pas de résolution)
        finalInput.aspect_ratio = aspect_ratio || req.body.aspect_ratio || "16:9";
    }
}// ============================================================
// LUMA RAY 2
// Text-to-Video
// Image-to-Video
// Video-to-Video / Modify
// ============================================================
else if (engineId.includes("luma-ray2")) {

    console.log("🚀 LUMA RAY 2 : configuration");

    // ========================================================
    // 1. RÉCUPÉRATION DES ENTRÉES
    // ========================================================

    const sourceVideo =
        typeof req.body.video_url !== "undefined"
            ? req.body.video_url
            : null;

    const sourceImage =
        typeof image_url !== "undefined"
            ? image_url
            : null;

    const sourceEndImage =
        typeof end_image_url !== "undefined"
            ? end_image_url
            : null;

    const lumaPrompt =
        String(
            prompt ||
            req.body.prompt ||
            ""
        ).trim();

    // ========================================================
    // 2. PROMPT OBLIGATOIRE
    // ========================================================

    if (!lumaPrompt) {
        throw new Error(
            "Luma Ray 2 : le prompt est vide."
        );
    }

    // ========================================================
    // 3. VIDÉO → VIDÉO / MODIFY
    // ========================================================

    if (sourceVideo) {

        targetEngineId =
            "fal-ai/luma-dream-machine/ray-2/modify";

        finalInput = {
            video_url: sourceVideo,
            prompt: lumaPrompt
        };

        // Image de référence / première image
        if (sourceImage) {
            finalInput.image_url =
                sourceImage;
        }

        // Mode de modification
        finalInput.mode =
            req.body.mode ||
            "flex_1";

        console.log(
            "🎬 LUMA RAY 2 MODIFY"
        );
    }

    // ========================================================
    // 4. IMAGE → VIDÉO
    // ========================================================

    else if (
        sourceImage ||
        sourceEndImage
    ) {

        targetEngineId =
            "fal-ai/luma-dream-machine/ray-2/image-to-video";

        finalInput = {
            prompt: lumaPrompt
        };

        if (sourceImage) {
            finalInput.image_url =
                sourceImage;
        }

        if (sourceEndImage) {
            finalInput.end_image_url =
                sourceEndImage;
        }

        console.log(
            "🎬 LUMA RAY 2 IMAGE-TO-VIDEO"
        );
    }

    // ========================================================
    // 5. TEXT → VIDÉO
    // ========================================================

    else {

        targetEngineId =
            "fal-ai/luma-dream-machine/ray-2";

        finalInput = {
            prompt: lumaPrompt
        };

        console.log(
            "🎬 LUMA RAY 2 TEXT-TO-VIDEO"
        );
    }

    // ========================================================
    // 6. DURÉE
    // ========================================================

    finalInput.duration =
        (
            duration === "9" ||
            duration === "9s"
        )
            ? "9s"
            : "5s";

    // ========================================================
    // 7. ASPECT RATIO
    // ========================================================

    const allowedAspectRatios = [
        "16:9",
        "9:16",
        "4:3",
        "3:4",
        "21:9",
        "9:21"
    ];

    const requestedAspect =
        req.body.aspect_ratio ||
        aspect_ratio ||
        "16:9";

    finalInput.aspect_ratio =
        allowedAspectRatios.includes(
            requestedAspect
        )
            ? requestedAspect
            : "16:9";

    // ========================================================
    // 8. RÉSOLUTION
    // ========================================================

    const allowedResolutions = [
        "540p",
        "720p",
        "1080p"
    ];

    const requestedResolution =
        req.body.resolution ||
        "540p";

    finalInput.resolution =
        allowedResolutions.includes(
            requestedResolution
        )
            ? requestedResolution
            : "540p";

    // ========================================================
    // 9. LOOP
    // ========================================================

    finalInput.loop =
        typeof loop !== "undefined"
            ? Boolean(loop)
            : false;

    // ========================================================
    // 10. LOG FINAL
    // ========================================================

    console.log("");
    console.log("==============================================");
    console.log("🎬 LUMA RAY 2");
    console.log("==============================================");

    console.log(
        "➡️ Endpoint :",
        targetEngineId
    );

    console.log(
        "➡️ Mode :",
        sourceVideo
            ? "VIDEO-TO-VIDEO"
            : (
                sourceImage ||
                sourceEndImage
                    ? "IMAGE-TO-VIDEO"
                    : "TEXT-TO-VIDEO"
            )
    );

    console.log(
        "➡️ Durée :",
        finalInput.duration
    );

    console.log(
        "➡️ Résolution :",
        finalInput.resolution
    );

    console.log(
        "➡️ Aspect ratio :",
        finalInput.aspect_ratio
    );

    console.log(
        "➡️ Loop :",
        finalInput.loop
    );

    console.log("==============================================");

    console.log(
        "📦 PAYLOAD LUMA RAY 2 :"
    );

    console.log(
        JSON.stringify(
            finalInput,
            null,
            2
        )
    );
}

    // Logic Pixverse// Logic Pixverse V6// Logic Pixverse V6
else if (engineId.includes("pixverse6")) {
    const sourceImage = req.body.image_url || (typeof image_url !== 'undefined' ? image_url : null);
    const sourceEndImage = req.body.end_image_url || (typeof end_image_url !== 'undefined' ? end_image_url : null);
    
    // 1. On récupère la source vidéo
    let sourceVideo = req.body.video_url || req.body.videoSource || req.body.videoUrl || (typeof video_url !== 'undefined' ? video_url : null);

    // 🛠️ 2. CONVERSION NGROK AUTOMATIQUE : On transforme localhost en URL publique sécurisée
    if (sourceVideo && sourceVideo.includes('localhost:5000')) {
        sourceVideo = sourceVideo.replace('http://localhost:5000', 'https://eclipse-ai.onrender.com');
    }

    // 3. On affiche les logs mis à jour
    console.log("🔍 DEBUG PIXVERSE EXTEND :");
    console.log(" - sourceVideo final converti :", sourceVideo);

    // Si on a vraiment une vidéo, on étend. Sinon, on bascule sur image ou texte pour éviter le 422 !
    if (sourceVideo) {
        targetEngineId = "fal-ai/pixverse/v6/extend";
        finalInput = {
            prompt: prompt || req.body.prompt || "",
            video_url: sourceVideo, // 👈 Utilise l'URL ngrok prête pour Fal.ai
            duration: parseInt(duration) || 5,
            resolution: req.body.resolution || "720p"
        };
        if (sourceImage) finalInput.image_url = sourceImage;
    } else if (sourceImage && sourceEndImage) {
        targetEngineId = "fal-ai/pixverse/v6/transition";
        finalInput = {
            prompt: prompt || req.body.prompt || "",
            first_image_url: sourceImage,
            last_image_url: sourceEndImage,
            duration: parseInt(duration) || 5,
            resolution: req.body.resolution || "720p"
        };
    } else if (sourceImage) {
        targetEngineId = "fal-ai/pixverse/v6/image-to-video";
        finalInput = {
            prompt: prompt || req.body.prompt || "",
            image_url: sourceImage,
            duration: parseInt(duration) || 5,
            resolution: req.body.resolution || "720p"
        };
    } else {
        targetEngineId = "fal-ai/pixverse/v6/text-to-video";
        finalInput = {
            prompt: prompt || req.body.prompt || "",
            aspect_ratio: req.body.aspect_ratio || "16:9",
            resolution: req.body.resolution || "720p",
            duration: parseInt(duration) || 5
        };
    }
}
// ============================================================
// SEEDANCE 2.0
// Standard / Fast
// Text-to-Video / Image-to-Video / Reference-to-Video
// ============================================================
else if (
    engineId === "seedance20" ||
    engineId.includes("seedance2") ||
    engineId.includes("seedance-2.0") ||
    engineId.includes("seedance")
) {

    console.log("🚀 SEEDANCE 2.0 : configuration");

    // ========================================================
    // 1. DÉTECTION STANDARD / FAST
    // ========================================================

    const requestedEndpoint =
        typeof req.body.modelEndpoint === "string"
            ? req.body.modelEndpoint.trim()
            : "";

    const isFast =
        engineId.toLowerCase().includes("fast") ||
        requestedEndpoint.toLowerCase().includes("/fast/");

    // ========================================================
    // 2. PROMPT
    // ========================================================

    const seedancePrompt =
        String(
            prompt ||
            req.body.prompt ||
            ""
        ).trim();

    if (!seedancePrompt) {
        throw new Error(
            "Seedance 2.0 : le prompt est vide."
        );
    }

    // ========================================================
    // 3. IMAGES
    // ========================================================

    const seedanceImages = [];

    // image_urls global
    if (Array.isArray(image_urls)) {
        seedanceImages.push(
            ...image_urls.filter(Boolean)
        );
    }

    // image_url
    if (req.body.image_url) {
        seedanceImages.push(
            req.body.image_url
        );
    }

    // start_image_url
    if (req.body.start_image_url) {
        seedanceImages.push(
            req.body.start_image_url
        );
    }

    // startImage
    if (req.body.startImage) {
        seedanceImages.push(
            req.body.startImage
        );
    }

    // end_image_url
    if (req.body.end_image_url) {
        seedanceImages.push(
            req.body.end_image_url
        );
    }

    // Suppression des doublons + exclusion vidéos
    const uniqueImages = [
        ...new Set(
            seedanceImages.filter(
                url =>
                    typeof url === "string" &&
                    url.trim() &&
                    !url.toLowerCase().endsWith(".mp4")
            )
        )
    ];

    // ========================================================
    // 4. VIDÉOS DE RÉFÉRENCE
    // ========================================================

    const seedanceVideos = [];

    // video_urls global
    if (Array.isArray(video_urls)) {
        seedanceVideos.push(
            ...video_urls.filter(Boolean)
        );
    }

    // video_url
    if (req.body.video_url) {
        seedanceVideos.push(
            req.body.video_url
        );
    }

    // videoSource
    if (req.body.videoSource) {
        seedanceVideos.push(
            req.body.videoSource
        );
    }

    // videoUrl
    if (req.body.videoUrl) {
        seedanceVideos.push(
            req.body.videoUrl
        );
    }

    // Suppression des doublons
    const uniqueVideos = [
        ...new Set(
            seedanceVideos.filter(
                url =>
                    typeof url === "string" &&
                    url.trim()
            )
        )
    ];

    // ========================================================
    // 5. AUDIO DE RÉFÉRENCE
    // ========================================================

    // Pour l'instant, Seedance utilise generate_audio
    // pour la génération audio.
    //
    // On initialise toujours uniqueAudios afin d'éviter
    // "uniqueAudios is not defined".

    const uniqueAudios = [];

    // Si le frontend fournit plus tard des audios de référence,
    // ils pourront être ajoutés ici sans casser le serveur.

    if (Array.isArray(req.body.audio_urls)) {
        uniqueAudios.push(
            ...req.body.audio_urls.filter(Boolean)
        );
    }

    if (req.body.audio_url) {
        uniqueAudios.push(
            req.body.audio_url
        );
    }

    // Suppression des doublons
    const finalUniqueAudios = [
        ...new Set(
            uniqueAudios.filter(
                url =>
                    typeof url === "string" &&
                    url.trim()
            )
        )
    ];

    // ========================================================
    // 6. CHOIX AUTOMATIQUE DU MODE
    // ========================================================

    let seedanceMode;

    // Une vidéo de référence = Reference-to-Video
    if (uniqueVideos.length > 0) {

        seedanceMode = "reference-to-video";

    }

    // Une ou deux images = Image-to-Video
    //
    // 1 image :
    // image de départ
    //
    // 2 images :
    // image de départ + image finale
    else if (uniqueImages.length >= 1) {

        seedanceMode = "image-to-video";

    }

    // Aucun média = Text-to-Video
    else {

        seedanceMode = "text-to-video";
    }

    // ========================================================
    // 7. ENDPOINT SEEDANCE 2.0
    // ========================================================

    if (seedanceMode === "reference-to-video") {

        targetEngineId = isFast
            ? "bytedance/seedance-2.0/fast/reference-to-video"
            : "bytedance/seedance-2.0/reference-to-video";

    }

    else if (seedanceMode === "image-to-video") {

        targetEngineId = isFast
            ? "bytedance/seedance-2.0/fast/image-to-video"
            : "bytedance/seedance-2.0/image-to-video";

    }

    else {

        targetEngineId = isFast
            ? "bytedance/seedance-2.0/fast/text-to-video"
            : "bytedance/seedance-2.0/text-to-video";
    }

    // ========================================================
    // IMPORTANT
    // ========================================================
    //
    // Le frontend possède actuellement :
    //
    // bytedance/seedance-2.0/text-to-video
    //
    // Mais si une image est présente, on NE doit PAS
    // écraser l'endpoint Image-to-Video avec celui du frontend.
    //
    // On respecte donc modelEndpoint uniquement lorsqu'on
    // est réellement en Text-to-Video.

    if (
        requestedEndpoint &&
        seedanceMode === "text-to-video"
    ) {

        targetEngineId = requestedEndpoint;
    }

    // ========================================================
    // 8. DURÉE
    // ========================================================

    const requestedDuration =
        req.body.duration ||
        duration ||
        "auto";

    const parsedDuration =
        parseInt(
            requestedDuration,
            10
        );

    const seedanceDuration =
        requestedDuration === "auto"

            ? "auto"

            : (
                Number.isInteger(parsedDuration) &&
                parsedDuration >= 4 &&
                parsedDuration <= 15
            )

                ? String(parsedDuration)

                : "5";

    // ========================================================
    // 9. RÉSOLUTION
    // ========================================================

    const resolution =
        ["480p", "720p"].includes(
            req.body.resolution
        )

            ? req.body.resolution

            : "720p";

    // ========================================================
    // 10. ASPECT RATIO
    // ========================================================

    const allowedAspectRatios = [
        "auto",
        "21:9",
        "16:9",
        "4:3",
        "1:1",
        "3:4",
        "9:16"
    ];

    const requestedAspectRatio =
        req.body.aspect_ratio ||
        aspect_ratio ||
        "auto";

    const aspectRatio =
        allowedAspectRatios.includes(
            requestedAspectRatio
        )

            ? requestedAspectRatio

            : "auto";

    // ========================================================
    // 11. AUDIO
    // ========================================================

    const generateAudio =
        req.body.generate_audio ??
        req.body.enable_audio ??
        true;

    // ========================================================
    // 12. PAYLOAD DE BASE
    // ========================================================

    finalInput = {
        prompt: seedancePrompt,

        resolution: resolution,

        duration: seedanceDuration,

        aspect_ratio: aspectRatio,

        generate_audio: Boolean(generateAudio),

        image_urls: [],

        video_urls: [],

        audio_urls: []
    };

    // ========================================================
    // 13. SEED OPTIONNEL
    // ========================================================

    if (
        req.body.seed !== undefined &&
        req.body.seed !== null &&
        req.body.seed !== ""
    ) {

        const seed =
            parseInt(
                req.body.seed,
                10
            );

        if (Number.isInteger(seed)) {

            finalInput.seed = seed;
        }
    }

    // ========================================================
    // 14. IMAGE-TO-VIDEO
    // ========================================================

    if (
        seedanceMode === "image-to-video"
    ) {

        // ----------------------------------------------------
        // IMAGE DE DÉPART
        // ----------------------------------------------------

        if (uniqueImages[0]) {

            finalInput.image_url =
                uniqueImages[0];
        }

        // ----------------------------------------------------
        // IMAGE FINALE
        // ----------------------------------------------------

        if (
            uniqueImages.length >= 2 &&
            uniqueImages[1]
        ) {

            finalInput.end_image_url =
                uniqueImages[1];
        }

        // ----------------------------------------------------
        // Nettoyage
        // ----------------------------------------------------

        delete finalInput.image_urls;
        delete finalInput.video_urls;
        delete finalInput.audio_urls;
    }

    // ========================================================
    // 15. REFERENCE-TO-VIDEO
    // ========================================================

    if (
        seedanceMode === "reference-to-video"
    ) {

        if (
            uniqueImages.length > 0
        ) {

            finalInput.image_urls =
                uniqueImages.slice(0, 9);
        }

        if (
            uniqueVideos.length > 0
        ) {

            finalInput.video_urls =
                uniqueVideos.slice(0, 3);
        }

        if (
            finalUniqueAudios.length > 0
        ) {

            finalInput.audio_urls =
                finalUniqueAudios.slice(0, 3);
        }
    }

    // ========================================================
    // 16. TEXT-TO-VIDEO
    // ========================================================

    if (
        seedanceMode === "text-to-video"
    ) {

        delete finalInput.image_urls;
        delete finalInput.video_urls;
        delete finalInput.audio_urls;
    }

    // ========================================================
    // 17. LOG
    // ========================================================

    console.log("");
    console.log("==============================================");
    console.log("🎬 SEEDANCE 2.0");
    console.log("==============================================");

    console.log(
        "➡️ Engine ID :",
        engineId
    );

    console.log(
        "➡️ Endpoint :",
        targetEngineId
    );

    console.log(
        "➡️ Mode :",
        seedanceMode
    );

    console.log(
        "➡️ Tier :",
        isFast
            ? "FAST"
            : "STANDARD"
    );

    console.log(
        "➡️ Images :",
        uniqueImages.length
    );

    console.log(
        "➡️ Vidéos :",
        uniqueVideos.length
    );

    console.log(
        "➡️ Audios :",
        finalUniqueAudios.length
    );

    console.log(
        "➡️ Résolution :",
        resolution
    );

    console.log(
        "➡️ Durée :",
        seedanceDuration
    );

    console.log(
        "➡️ Aspect ratio :",
        aspectRatio
    );

    console.log(
        "➡️ Audio généré :",
        Boolean(generateAudio)
    );

    console.log("==============================================");

    console.log(
        "📦 PAYLOAD SEEDANCE 2.0 :"
    );

    console.log(
        JSON.stringify(
            finalInput,
            null,
            2
        )
    );

    console.log("==============================================");
const PUBLIC_URL = process.env.PUBLIC_API_URL || "https://eclipse-ai.onrender.com";

    const toPublicUrl = (url) => {
        if (!url) return null;
        if (url.includes("localhost:5000") || url.includes("127.0.0.1:5000")) {
            return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, PUBLIC_URL);
        }
        return url;
    };

    if (finalInput.image_url) {
        finalInput.image_url = toPublicUrl(finalInput.image_url);
    }
    if (finalInput.end_image_url) {
        finalInput.end_image_url = toPublicUrl(finalInput.end_image_url);
    }
    if (Array.isArray(finalInput.image_urls)) {
        finalInput.image_urls = finalInput.image_urls.map(toPublicUrl);
    }

    // (Optionnel) Tu peux rajouter un console.log ici pour vérifier que le payload final a bien les URLs ngrok :
    console.log("📦 PAYLOAD FINAL AVEC URLS PUBLIQUES :", JSON.stringify(finalInput, null, 2));
}

// --- Logic Seedance 1.5 ---// --- Logic Seedance 1.5 ---
else if (engineId.includes("seedance")) {
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



// --- APPEL RÉEL A FAL.AI ---
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
        }

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

        // 🚀 Envoi de l'e-mail via l'API HTTP de Brevo (Contourne le blocage Render)
// 🚀 1. Envoi du code de vérification à l'utilisateur
        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "Ovortex", email: "imir.guerni@gmail.com" },
                to: [{ email: trimmedEmail }],
                subject: 'Votre code de vérification Ovortex',
                htmlContent: `<p>Votre code de sécurité à usage unique est : <strong>${otpCode}</strong>. Il est valable 5 minutes.</p>`
            })
        });

        const brevoData = await brevoResponse.json();

        if (!brevoResponse.ok) {
            throw new Error(brevoData.message || "Erreur lors de l'envoi de l'e-mail via Brevo");
        }

        // 🚀 2. AJOUT : Envoi d'une notification à l'administrateur
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "Ovortex Alerte", email: "imir.guerni@gmail.com" },
                to: [{ email: "imir.guerni@gmail.com" }], // 👈 Votre adresse perso pour recevoir l'alerte
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
            essentiel: 300, 
            standard: 700, 
            master: 1200, 
            elite: 2500, 
            legende: 8000 
        };


        for (const doc of expiredSubs.docs) {

            const data = doc.data();

            const plan = (data.userPlan || '').toLowerCase();

            const baseCredits = creditsByPlan[plan] || 300;


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