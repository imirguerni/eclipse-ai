const { fal } = require("@fal-ai/client");

// Configuration de la clé API
fal.config({ 
    credentials: process.env.FAL_KEY || "" 
});

async function testVideoCommunication() {
    console.log("1. Soumission de la tâche vidéo à Fal.ai...");
    
    try {
        const { request_id } = await fal.queue.submit("fal-ai/minimax/hailuo-02/standard/text-to-video", {
            input: {
                prompt: "A beautiful cinematic shot of a red car driving on a coastal road",
                duration: "6"
            }
        });

        console.log("✅ SUCCÈS ! Tâche créée chez Fal. ID de requête :", request_id);
        console.log("2. Vérification du statut...");

        const status = await fal.queue.status("fal-ai/minimax/hailuo-02/standard/text-to-video", {
            requestId: request_id,
            logs: true
        });

        console.log("Statut actuel chez Fal :", status.status);

    } catch (err) {
        console.error("❌ ÉCHEC de communication avec Fal.ai :", err.message);
    }
}

testVideoCommunication();