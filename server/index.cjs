const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const multer = require('multer');

const app = express();
const PORT = 5000;

// --- CONFIGURATION ---
// Note : Garde ta clé en sécurité. Pour la production, utilise un fichier .env
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- FONCTIONS DE NETTOYAGE ---
// Essentiel pour éviter les erreurs 400 ou 530 lors de la génération d'images
const cleanTextForURL = (text) => {
    if (!text) return "image";
    return text
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/[()]/g, "") // Enlève les parenthèses
        .replace(/[^a-zA-Z0-9\s]/g, " ") // Caractères spéciaux -> espace
        .replace(/\s+/g, ' ') // Supprime les doubles espaces
        .trim();
};

const cleanMarkdown = (text) => {
    if (!text) return "";
    // Nettoie le gras, les titres et les barres pour une lecture fluide en chat
    return text.replace(/[#*|_~`]/g, '').replace(/---/g, '').trim();
};

// --- ROUTES ---

// 1. IA TEXTE (Gemini avec repli automatique sur Pollinations)
app.post('/intelligence', async (req, res) => {
    const { prompt } = req.body;
    const instruction = "Réponds en français court et professionnel : ";
    const fullPrompt = instruction + prompt;

    const modelsToTry = [
        "gemini-2.0-flash-lite-preview-02-05", 
        "gemini-1.5-flash"
    ];
    
    try {
        for (const modelName of modelsToTry) {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GOOGLE_API_KEY}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text;
                return res.json({ result: cleanMarkdown(text) });
            } 
        }

        // Repli si Gemini ne répond pas
        const backup = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`);
        const backupText = await backup.text();
        res.json({ result: cleanMarkdown(backupText) });

    } catch (e) { 
        console.error("Erreur Intelligence:", e);
        res.json({ result: "Problème technique temporaire. Réessaie dans un instant." }); 
    }
});

// 2. GÉNÉRATION D'IMAGES
app.post('/generate', async (req, res) => {
    const { text, width, height } = req.body;
    try {
        const cleanPrompt = cleanTextForURL(text);
        const seed = Math.floor(Math.random() * 999999);
        
        // nologo=true et seed aléatoire garantissent une image fraîche
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=${width || 1024}&height=${height || 1024}&seed=${seed}&nologo=true`;
        
        console.log("🚀 Image générée :", cleanPrompt);
        res.json({ url: imageUrl, type: "IMAGE" }); 
    } catch (e) { 
        console.error("Erreur Image:", e);
        res.status(500).json({ error: "Erreur lors de la création de l'image" }); 
    }
});

// 3. GÉNÉRATION VIDÉO
app.post('/generate-video', async (req, res) => {
    const { text } = req.body;
    try {
        const cleanPrompt = cleanTextForURL(text);
        const videoUrl = `https://video.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}`;
        
        console.log("🎬 Vidéo générée :", cleanPrompt);
        res.json({ url: videoUrl, videoUrl: videoUrl, type: "VIDEO" });
    } catch (e) {
        console.error("Erreur Vidéo:", e);
        res.status(500).json({ error: "Erreur lors de la création de la vidéo" });
    }
});

// 4. UPLOAD DE FICHIER (Images locales)
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu." });
    console.log("📁 Fichier reçu :", req.file.filename);
    res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🚀 SERVEUR PIX-PRO OPÉRATIONNEL`);
    console.log(`📡 URL locale : http://localhost:${PORT}`);
    console.log(`🔧 Prêt pour les requêtes React`);
    console.log(`==========================================\n`);
});