OVORTEX — MODULE FILTRE — REVISION 8

CONTENU
- 12 fichiers source : les 9 fichiers du module Filtre + aiEnhance.js + aiModels.js + aiSuperResolution.js.
- Aucun App.jsx, index.js, serveur, fichier .env ou poids ONNX n'est inclus.

NOUVEAUTÉ : MODÈLES NEURONAUX ONNX IDENTIFIÉS ET MOTEURS SÉPARÉS

1) RESTAURATION X1 — SwinIR Color Denoising σ=25
- URL épinglée : https://huggingface.co/Heliosoph/swinir-onnx/resolve/a4a77e2/swinir_denoising_color_25.onnx
- Entrée : image, float32 RGB NCHW [1,3,128,128], valeurs [0,1].
- Sortie : denoised, float32 RGB NCHW [1,3,128,128].
- Taille annoncée par le dépôt : 54,9 MB.
- Licence annoncée : Apache-2.0.
- Le moteur aiEnhance.js impose des tuiles de 128x128 et vérifie que la sortie reste x1.
- Limite essentielle : le checkpoint est entraîné pour du bruit gaussien σ=25. Il s'agit d'un débruiteur spécialisé, pas d'un déflouteur universel ni d'un modèle de reconstruction de détails absents. Il peut lisser une image déjà propre ou mal adaptée à ce bruit.

2) SUPER-RÉSOLUTION X4 — Real-ESRGAN x4plus
- URL : https://huggingface.co/skillsafe-ai/realesrgan-x4plus/resolve/main/model.onnx
- Entrée documentée : float32 RGB NCHW [1,3,H,W], valeurs [0,1].
- Sortie documentée : RGB x4.
- Taille annoncée : environ 63,95 MB en FP32.
- Licence des poids annoncée : BSD-3-Clause.
- Le moteur aiSuperResolution.js vérifie la sortie x4 et réutilise le découpage en tuiles du moteur existant.
- Limite essentielle : un modèle de super-résolution génère des détails plausibles ; ils ne sont pas nécessairement présents dans l'original.

FICHIERS AJOUTÉS / MODIFIÉS
- Filtre.jsx : ajout d'un bouton « Restaurer IA x1 » distinct de « Capture IA » ; le nouveau bouton appelle createAiEnhancer avec le runtime ORT déjà fourni via aiUpscale.ort, conserve la résolution d'origine, applique ensuite les réglages Filtre et exporte en PNG / transmet à l'historique.
- aiModels.js : registre de modèles, URL, contrats I/O, tailles, licences et limites connues.
- aiEnhance.js : moteur SwinIR x1, taille de tuile fixe 128, auto-test, rejet des sorties x2/x4, libération ONNX.
- aiSuperResolution.js : moteur Real-ESRGAN x4 séparé, auto-test, rejet des échelles incompatibles et libération ONNX.

UTILISATION CÔTÉ APPLICATION
Le runtime doit être fourni par l'application (onnxruntime-web) ; les poids sont chargés à la demande depuis les URL ci-dessus. Exemple :

import * as ort from 'onnxruntime-web';
import { createAiEnhancer } from './aiEnhance.js';
import { createAiSuperResolution } from './aiSuperResolution.js';

const denoiser = createAiEnhancer({ ort });
const restoredCanvas = await denoiser.enhance(sourceCanvas, { onProgress });

const superResolver = createAiSuperResolution({ ort });
const upscaledCanvas = await superResolver.upscale(sourceCanvas, { onProgress });

await denoiser.dispose();
await superResolver.dispose();

IMPORTANT : la restauration x1 est maintenant raccordée à l'interface Filtre, sans modifier App.jsx ni index.js. Le parent doit toujours fournir aiUpscale.ort (onnxruntime-web) ; la propriété modelUrl de l'ancien upscaler n'est pas réutilisée pour SwinIR, dont l'URL par défaut est définie dans aiModels.js. Le navigateur doit autoriser le chargement distant (CORS/CSP). Pour une mise en production fiable, héberger les poids sur le stockage OVortex après validation des licences et empreintes.

TESTS EXÉCUTÉS SUR LES SOURCES DE CETTE ARCHIVE
- Tests de régression du module : timeline, effets pixel, LUT, audio, équivalence traitement par bandes.
- Tests de paramètres invalides : workers, tuiles, timeline et audio.
- Tests ONNX simulés : moteur d'agrandissement, restauration x1, super-résolution x4, dimensions, progression, rejet d'échelles incompatibles, fallback WebGPU vers WASM, libération des sessions.
- Tests moteur local simulés : succès, progression bornée, ID encodé, timeout et nettoyage.
- Vérification syntaxique JavaScript et JSX.
- Vérification d'intégrité de l'archive ZIP.

VALIDATION SUPPLÉMENTAIRE — RÉVISION 8
- Le bouton « Restaurer IA x1 » est conditionné à la présence de aiUpscale.ort ; il utilise une session ONNX indépendante de l'upscaler x4.
- Le traitement est une restauration/débruitage x1 avec SwinIR Color Denoising σ=25, pas une super-résolution ni un déflouteur général.
- Transpilation syntaxique JSX de Filtre.jsx réussie.
- Les tests de régression et tests ONNX simulés ont été rejoués après modification : réussite.

LIMITES DE VALIDATION
- Le téléchargement réel des poids n'a pas été possible depuis cet environnement (résolution DNS réseau indisponible).
- Aucun fichier .onnx réel n'est inclus ; les tests d'inférence sont simulés et ne valident ni qualité visuelle, ni compatibilité effective du binaire téléchargé.
- Aucun navigateur, GPU physique, téléphone Android, export MP4 complet ou lecture 4K n'a été testé.
- Le SwinIR σ=25 est un débruiteur spécialisé : il ne doit pas être activé automatiquement sur toutes les images.
- Le Real-ESRGAN x4 peut être très lent en WASM/CPU sur une machine modeste ; le traitement vidéo image par image n'est pas recommandé sur une machine avec 1 Go de VRAM.
- Les curseurs classiques et OVortex Enhance multi-échelle restent distincts des deux modèles neuronaux.


REVISION 9 — BRANCHEMENT AUTONOME DU RUNTIME ONNX
- Le bouton Restaurer IA x1 ne dépend plus de la propriété aiUpscale transmise par App.jsx.
- Au premier clic, Filtre réutilise aiUpscale.ort si fourni ; sinon il importe onnxruntime-web/webgpu, avec repli sur onnxruntime-web.
- Dépendance requise dans le dossier client : npm install onnxruntime-web. Aucun changement de App.jsx ou index.js.
- Le modèle SwinIR reste téléchargé à la demande depuis l’URL déclarée dans aiModels.js ; aucun poids ONNX n’est inclus dans l’archive.
- Vérifications effectuées : syntaxe JSX/JS et tests unitaires simulés. L’inférence réelle avec les poids du modèle et un navigateur n’a pas été exécutée.
