const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

async function testVertexFini() {
    try {
        const auth = new GoogleAuth({ 
            keyFilename: './serviceAccountKey.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        
        console.log("Token récupéré avec succès ! Envoi de la requête au endpoint Generative AI...");
        
        // ATTENTION : On utilise le endpoint :generateContent et non plus :predict
        const response = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/eclipse-ai-96f30/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: "Dis 'L'API fonctionne enfin !'" }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 100
                }
            })
        });

        const data = await response.json();
        if (response.status === 200) {
            console.log("\n✅ TOUT EST RÉPARÉ ! L'API répond parfaitement.");
            console.log("Réponse de Google :", data.candidates[0].content.parts[0].text);
        } else {
            console.log("\n❌ Erreur retournée par Google :");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log("\n❌ Erreur d'exécution :", error.message);
    }
}

testVertexFini();