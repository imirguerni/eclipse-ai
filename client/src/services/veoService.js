// services/veoService.js
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

async function genererVideoVeo(promptTexte) {
    try {
        const auth = new GoogleAuth({ 
            keyFilename: './serviceAccountKey.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        
        // Note: Selon la documentation Google, Veo s'appelle souvent avec ':predict' 
        // ou des patterns longs-running sur Vertex AI. On garde l'URL validée de ton projet.
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/eclipse-ai-96f30/locations/us-central1/publishers/google/models/veo-2.0-generate-001:predict`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [
                    { prompt: promptTexte }
                ],
                parameters: {
                    aspectRatio: "16:9",
                    durationSeconds: 5
                }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }
        return data; // Retourne l'opération ou la vidéo générée à l'appelant
    } catch (error) {
        console.error("Erreur dans VeoService :", error.message);
        throw error;
    }
}

module.exports = { genererVideoVeo };