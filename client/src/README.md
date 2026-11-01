# Moteur local OVX — utiliser la puissance de votre PC

Le navigateur est limité (mémoire, WebGPU, temps). Pour les tâches lourdes — surtout **l'agrandissement par IA d'une vidéo** — l'application peut confier le travail à ce petit programme qui tourne **sur votre PC** et utilise votre carte graphique.

```
Navigateur (Filtre.jsx)  ──►  Moteur local (ce dossier)  ──►  ffmpeg + Real-ESRGAN (GPU Vulkan)
        ▲                                                                │
        └──────────────────────── résultat (image ou MP4) ◄──────────────┘
```
Si le moteur n'est pas lancé, l'application continue de fonctionner dans le navigateur (mode « Auto »).

## 1. Installer (une seule fois)
| Outil | Rôle | Remarque |
|---|---|---|
| **Node.js 18+** | lance `server.mjs` | nodejs.org |
| **ffmpeg + ffprobe** | extraction / encodage vidéo | dans le `PATH` (testez `ffmpeg -version`). Vérifiez la licence de votre build (x264 = GPL). |
| **realesrgan-ncnn-vulkan** | agrandissement IA sur GPU (NVIDIA, AMD, Intel) | projet « Real-ESRGAN-ncnn-vulkan » ; décompressez-le avec son dossier `models`. |

Aucun `npm install` : `server.mjs` n'a **aucune dépendance**.

## 2. Lancer
```
node server.mjs
```
Le programme affiche son adresse. **Rien d'autre à faire** : l'application détecte le moteur toute seule (voyant vert dans *Performance → Moteur local*), grâce à un jeton universel partagé avec `localEngine.js`.

Variables utiles (voir `start.bat` / `start.sh`) :
| Variable | Rôle |
|---|---|
| `OVX_ORIGINS` | sites autorisés en plus de `localhost` (ex. `https://monsite.com`) — **à régler pour un site en ligne** |
| `OVX_TOKEN` | jeton personnalisé (sinon le jeton universel est utilisé) |
| `OVX_REALESRGAN` | chemin complet de `realesrgan-ncnn-vulkan` s'il n'est pas dans le `PATH` |
| `OVX_MODELS` | dossier `models` de Real-ESRGAN |
| `OVX_PORT` | port (47831 par défaut) |
| `OVX_MAX_MB` / `OVX_MAX_FRAMES` | taille et nombre d'images maximum (4096 Mo / 6000) |
| `OVX_WORKDIR` | dossier de travail temporaire (prévoyez de la place : les images sont stockées en PNG) |

## 3. Sécurité
- N'écoute que sur **127.0.0.1** : invisible depuis le réseau.
- **Jeton obligatoire** : universel par défaut (`ovx_secret_token_12345`, identique dans `localEngine.js`). Comme ce jeton est public dans le code de l'application, la vraie protection est la **liste des sites autorisés** (`OVX_ORIGINS`), le contrôle de l'en-tête `Host` et l'écoute locale uniquement. Pour un jeton personnel : `OVX_TOKEN=...` côté moteur et `localEngine={{ token: '...' }}` côté application.
- **Sites autorisés** uniquement : `localhost` et ceux listés dans `OVX_ORIGINS` (indispensable pour un site en ligne).
- N'exécute que des commandes **fixes** (jamais de shell), avec des paramètres validés (échelle 2/3/4, nom de modèle sans caractère spécial).
- Travaille dans un dossier temporaire nettoyé après chaque tâche (ou après 60 min).

## 4. Limites
- Une tâche à la fois (file d'attente) : le GPU est partagé.
- Une vidéo ×4 en HD peut prendre **longtemps** et beaucoup de disque (images PNG) : comptez plusieurs Go.
- Votre navigateur peut demander l'autorisation d'accéder au **réseau local / à cet ordinateur** : acceptez. Chrome, Edge et Firefox acceptent un site HTTPS qui parle à `127.0.0.1` ; Safari peut le bloquer.
- Pare-feu : aucune règle à ouvrir (connexion locale).
