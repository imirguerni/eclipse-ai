// test-securite.js
const { PRICING_DATA } = require('./pricingConfig.js');

function simulerVerificationPrix(planUtilisateur, engineId, qualityKey, costEnvoyeParLeClient) {
  console.log(`\n--- Test de sécurité anti-fraude ---`);
  console.log(`Plan utilisateur : ${planUtilisateur}`);
  console.log(`Moteur demandé : ${engineId} | Qualité : ${qualityKey}`);
  console.log(`Coût envoyé par le client (tentative) : ${costEnvoyeParLeClient} éclairs`);

  const planTarif = PRICING_DATA[planUtilisateur] || PRICING_DATA["0.00"];
  const vraiPrix = planTarif?.[engineId]?.[qualityKey];

  if (vraiPrix === undefined) {
    console.log("❌ Résultat : Moteur ou qualité inconnu -> BLOQUÉ");
    return false;
  }

  console.log(`💰 Vrai prix calculé par le serveur : ${vraiPrix} éclairs`);

  if (costEnvoyeParLeClient !== vraiPrix) {
    console.log(`🚨 ALERTE SÉCURITÉ : Tentative de fraude détectée ! Le client a essayé de payer ${costEnvoyeParLeClient} au lieu de ${vraiPrix}.`);
    console.log("🛑 RÉSULTAT : Requête rejetée avec succès ! Aucun crédit débité.");
    return false;
  } else {
    console.log("✅ RÉSULTAT : Prix valide, la génération peut continuer.");
    return true;
  }
}

// Lancement du test avec tentative de triche (1 au lieu de 65)
simulerVerificationPrix("12.99", "kling30", "hd10", 1);