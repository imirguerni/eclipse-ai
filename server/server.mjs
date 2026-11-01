#!/usr/bin/env node
// ============================================================
// MOTEUR LOCAL OVX — utilise la puissance de VOTRE PC (carte graphique, processeur)
// pour les tâches trop lourdes pour le navigateur. Aucune dépendance npm.
//
// Prérequis (à installer une fois) :
//   - Node.js 18+                      (pour lancer ce fichier)
//   - ffmpeg et ffprobe                (dans le PATH)
//   - realesrgan-ncnn-vulkan           (agrandissement IA sur GPU Vulkan : NVIDIA, AMD, Intel)
//
// Lancement :   node server.mjs
// Le programme affiche un JETON : collez-le une fois dans l'application (panneau « Moteur local »).
//
// SÉCURITÉ : le serveur n'écoute que sur 127.0.0.1 (ce PC), exige le jeton, n'accepte que les sites autorisés
// (localhost + OVX_ORIGINS), n'exécute que des commandes FIXES avec des paramètres validés (jamais de shell)
// et travaille uniquement dans un dossier temporaire qu'il nettoie.
// ============================================================
import 'dotenv/config';
import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const VERSION = '1.0.0';
const env = process.env;

export const CONFIG = {
  host: env.OVX_HOST || '127.0.0.1',
  port: env.OVX_PORT === undefined ? 47831 : Number(env.OVX_PORT),
  ffmpeg: env.OVX_FFMPEG || 'ffmpeg',
  ffprobe: env.OVX_FFPROBE || 'ffprobe',
  realesrgan: env.OVX_REALESRGAN || 'realesrgan-ncnn-vulkan',
  modelsDir: env.OVX_MODELS || '', // dossier « models » de realesrgan-ncnn-vulkan (facultatif)
  origins: (env.OVX_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean), // ex. https://monsite.com
  maxBytes: (Number(env.OVX_MAX_MB) || 4096) * 1024 * 1024,
  maxFrames: Number(env.OVX_MAX_FRAMES) || 6000,
  maxOutputPixels: Number(env.OVX_MAX_OUTPUT_PIXELS) || 7680 * 4320,
  workDir: env.OVX_WORKDIR || path.join(os.tmpdir(), 'ovx-engine'),
  tokenFile: env.OVX_TOKEN_FILE || path.join(os.homedir(), '.ovx-engine', 'token'),
  ttlMs: (Number(env.OVX_TTL_MIN) || 60) * 60 * 1000
};

const DEFAULT_MODELS = ['realesrgan-x4plus', 'realesrnet-x4plus', 'realesrgan-x4plus-anime', 'realesr-animevideov3'];
const MODEL_RE = /^[A-Za-z0-9._-]{1,64}$/;
const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

// ---------- jeton ----------
// Jeton UNIVERSEL par défaut : le même que dans localEngine.js, donc rien à copier ni à saisir (connexion automatique).
// Dans ce cas, la protection repose sur la liste des sites autorisés (OVX_ORIGINS), le contrôle du Host et l'écoute locale.
// Pour un jeton personnel : lancez avec OVX_TOKEN=... (et donnez le même au composant via la propriété localEngine.token).
export const DEFAULT_TOKEN = '';
async function loadToken() {
  if (!env.OVX_TOKEN) {
  throw new Error('OVX_TOKEN absent du fichier .env');
}
return env.OVX_TOKEN;
}

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ---------- outils ----------
function runCapture(cmd, args, { timeoutMs = 4000 } = {}) {
  return new Promise((resolve) => {
    let out = '';
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    let child;
    try {
      child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch { done({ ok: false, out: '' }); return; }
    const timer = setTimeout(() => { try { child.kill(); } catch { /* ignoré */ } done({ ok: true, out }); }, timeoutMs);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', () => { clearTimeout(timer); done({ ok: false, out: '' }); }); // ENOENT : outil absent
    child.on('close', () => { clearTimeout(timer); done({ ok: true, out }); });
  });
}

let capsCache = { at: 0, value: null };
async function capabilities() {
  if (capsCache.value && Date.now() - capsCache.at < 30_000) return capsCache.value;
  const [ff, fp, re] = await Promise.all([
    runCapture(CONFIG.ffmpeg, ['-version']),
    runCapture(CONFIG.ffprobe, ['-version']),
    runCapture(CONFIG.realesrgan, ['-h'])
  ]);
  let models = DEFAULT_MODELS;
  if (CONFIG.modelsDir) {
    try {
      const files = await fsp.readdir(CONFIG.modelsDir);
      const found = [...new Set(files.filter((f) => f.endsWith('.param')).map((f) => f.slice(0, -6)))].filter((m) => MODEL_RE.test(m));
      if (found.length) models = found;
    } catch { /* dossier absent : liste par défaut */ }
  }
  const value = {
    ffmpeg: ff.ok,
    ffprobe: fp.ok,
    realesrgan: re.ok,
    models,
    platform: `${os.platform()} ${os.arch()}`,
    cpus: os.cpus().length,
    memoryGB: Math.round(os.totalmem() / 1024 ** 3)
  };
  capsCache = { at: Date.now(), value };
  return value;
}

// ---------- tâches ----------
const jobs = new Map();
const queue = [];
let running = null;

const newId = () => crypto.randomBytes(9).toString('hex');
const tail = (s, n = 400) => String(s).slice(-n).trim();

function publicJob(j) {
  return { id: j.id, type: j.type, status: j.status, progress: Math.round(j.progress * 1000) / 1000, stage: j.stage, error: j.error || null };
}

async function removeJobFiles(job) {
  try { await fsp.rm(job.dir, { recursive: true, force: true }); } catch { /* ignoré */ }
}

function killJob(job) {
  job.cancelled = true;
  if (job.proc) { try { job.proc.kill('SIGKILL'); } catch { /* ignoré */ } }
}

// Lance une commande FIXE (tableau d'arguments, jamais de shell). Garde la fin de stderr pour les messages d'erreur.
function runJobProcess(job, cmd, args, { onStdout, onStderr } = {}) {
  return new Promise((resolve, reject) => {
    if (job.cancelled) { reject(new Error('annulé')); return; }
    let errTail = '';
    let child;
    try {
      child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (e) { reject(new Error(`Impossible de lancer « ${cmd} » : ${e.message}`)); return; }
    job.proc = child;
    child.stdout.on('data', (d) => { if (onStdout) onStdout(String(d)); });
    child.stderr.on('data', (d) => {
      const s = String(d);
      // On ne garde pour le message d'erreur que les lignes utiles (pas les « 12.50% » de progression).
      const useful = s.split(/\r?\n/).filter((l) => l.trim() && !/^\s*\d+(\.\d+)?%\s*$/.test(l)).join(' | ');
      if (useful) errTail = tail(`${errTail} ${useful}`, 800);
      if (onStderr) onStderr(s);
    });
    child.on('error', (e) => { job.proc = null; reject(new Error(e.code === 'ENOENT' ? `Outil introuvable : « ${cmd} » (voir README)` : e.message)); });
    child.on('close', (code) => {
      job.proc = null;
      if (job.cancelled) reject(new Error('annulé'));
      else if (code === 0) resolve();
      else reject(new Error(`« ${path.basename(cmd)} » a échoué (code ${code}) : ${errTail || 'aucun détail'}`));
    });
  });
}

async function countFiles(dir) {
  try { return (await fsp.readdir(dir)).filter((f) => f.endsWith('.png')).length; } catch { return 0; }
}

const parseFraction = (s) => {
  const m = /^(\d+)\/(\d+)$/.exec(String(s || ''));
  if (!m || Number(m[2]) === 0) return null;
  return { text: s, value: Number(m[1]) / Number(m[2]) };
};

const realesrganArgs = (input, output, scale, model) => [
  '-i', input, '-o', output, '-s', String(scale), '-n', model, '-f', 'png',
  ...(CONFIG.modelsDir ? ['-m', CONFIG.modelsDir] : [])
];

async function processUpscaleImage(job) {
  job.stage = 'agrandissement IA';
  job.output = path.join(job.dir, 'output.png');
  job.outMime = 'image/png';
  await runJobProcess(job, CONFIG.realesrgan, realesrganArgs(job.input, job.output, job.scale, job.model), {
    onStderr: (s) => {
      const m = [...s.matchAll(/(\d+(?:\.\d+)?)%/g)].pop();
      if (m) job.progress = Math.min(0.99, Number(m[1]) / 100);
    }
  });
  await fsp.access(job.output);
}

async function processUpscaleVideo(job) {
  const framesIn = path.join(job.dir, 'in');
  const framesOut = path.join(job.dir, 'out');
  await fsp.mkdir(framesIn);
  await fsp.mkdir(framesOut);

  // 1. analyse de la vidéo
  job.stage = 'analyse';
  let probeOut = '';
  await runJobProcess(job, CONFIG.ffprobe, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=avg_frame_rate,r_frame_rate,nb_frames,width,height,duration:format=duration',
    '-of', 'json', job.input
  ], { onStdout: (s) => { probeOut += s; } });
  const info = JSON.parse(probeOut || '{}');
  const st = (info.streams && info.streams[0]) || {};
  const fps = parseFraction(st.avg_frame_rate) || parseFraction(st.r_frame_rate);
  if (!fps || !st.width || !st.height) throw new Error('Vidéo illisible (pas de piste vidéo).');
  const duration = Number(st.duration) || Number(info.format && info.format.duration) || 0;
  const total = Number(st.nb_frames) || Math.max(1, Math.round(duration * fps.value));
  if (total > CONFIG.maxFrames) throw new Error(`Vidéo trop longue : ${total} images (maximum ${CONFIG.maxFrames}). Découpez-la d'abord.`);
  if (st.width * job.scale * st.height * job.scale > CONFIG.maxOutputPixels) throw new Error(`Résultat trop grand (${st.width * job.scale}×${st.height * job.scale}).`);

  // 2. extraction des images (PNG sans perte)
  job.stage = 'extraction des images';
  const poll1 = setInterval(async () => { job.progress = 0.15 * Math.min(1, (await countFiles(framesIn)) / total); }, 400);
  try {
    await runJobProcess(job, CONFIG.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', job.input, '-an', '-vsync', '0', path.join(framesIn, '%08d.png')]);
  } finally { clearInterval(poll1); }

  // 3. agrandissement IA de toutes les images
  job.stage = 'agrandissement IA';
  const poll2 = setInterval(async () => { job.progress = 0.15 + 0.7 * Math.min(1, (await countFiles(framesOut)) / total); }, 500);
  try {
    await runJobProcess(job, CONFIG.realesrgan, realesrganArgs(framesIn, framesOut, job.scale, job.model));
  } finally { clearInterval(poll2); }
  await fsp.rm(framesIn, { recursive: true, force: true }); // libère le disque

  // 4. réassemblage + son d'origine
  job.stage = 'encodage';
  job.output = path.join(job.dir, 'output.mp4');
  job.outMime = 'video/mp4';
  await runJobProcess(job, CONFIG.ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-nostats', '-progress', 'pipe:1', '-y',
    '-framerate', fps.text, '-i', path.join(framesOut, '%08d.png'), '-i', job.input,
    '-map', '0:v:0', '-map', '1:a:0?',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', job.output
  ], {
    onStdout: (s) => {
      const m = [...s.matchAll(/frame=(\d+)/g)].pop();
      if (m) job.progress = 0.85 + 0.14 * Math.min(1, Number(m[1]) / total);
    }
  });
  await fsp.rm(framesOut, { recursive: true, force: true });
  await fsp.access(job.output);
}

async function runJob(job) {
  job.status = 'running';
  try {
    if (job.type === 'upscale-image') await processUpscaleImage(job);
    else await processUpscaleVideo(job);
    job.progress = 1;
    job.status = 'done';
    job.stage = 'terminé';
  } catch (e) {
    if (job.cancelled) { job.status = 'cancelled'; job.error = null; } else { job.status = 'error'; job.error = tail(e.message, 600); }
    await removeJobFiles(job);
  }
}

function pump() {
  if (running || !queue.length) return;
  const job = queue.shift();
  if (job.cancelled) { pump(); return; }
  running = job;
  runJob(job).finally(() => { running = null; pump(); });
}

// ---------- HTTP ----------
function originAllowed(origin) {
  if (!origin) return true; // outil en ligne de commande : le jeton reste obligatoire
  return LOCAL_ORIGIN_RE.test(origin) || CONFIG.origins.includes(origin);
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (!origin || !originAllowed(origin)) return {};
  const h = {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600'
  };
  if (req.headers['access-control-request-private-network'] === 'true') h['Access-Control-Allow-Private-Network'] = 'true';
  return h;
}

function send(res, req, status, body, extra = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' || Buffer.isBuffer(body) ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(req),
    ...extra
  });
  res.end(payload);
}

async function saveBody(req, dest, limit) {
  let size = 0;
  const counter = new Transform({
    transform(chunk, _enc, cb) {
      size += chunk.length;
      if (size > limit) cb(Object.assign(new Error('Fichier trop volumineux'), { code: 'E2BIG' }));
      else cb(null, chunk);
    }
  });
  await pipeline(req, counter, fs.createWriteStream(dest));
  return size;
}

export function createServer(token) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const origin = req.headers.origin;

      // Défense contre le « DNS rebinding » : seules les adresses locales sont acceptées dans l'en-tête Host.
      const hostName = String(req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
      if (!['127.0.0.1', 'localhost', '[::1]'].includes(hostName)) { send(res, req, 403, { error: 'Host non autorisé.' }); return; }

      if (origin && !originAllowed(origin)) { send(res, req, 403, { error: 'Origine non autorisée. Ajoutez-la dans OVX_ORIGINS.' }); return; }
      if (req.method === 'OPTIONS') { res.writeHead(204, { ...corsHeaders(req) }); res.end(); return; }

      const auth = req.headers.authorization || '';
      const authorized = auth.startsWith('Bearer ') && safeEqual(auth.slice(7), token);

      if (req.method === 'GET' && url.pathname === '/health') {
        const body = { ok: true, name: 'ovx-local-engine', version: VERSION, authorized };
        if (authorized) body.capabilities = await capabilities();
        send(res, req, 200, body);
        return;
      }
      if (!authorized) { send(res, req, 401, { error: 'Jeton manquant ou incorrect.' }); return; }

      // POST /jobs?type=upscale-image|upscale-video&scale=2|3|4&model=...
      if (req.method === 'POST' && url.pathname === '/jobs') {
        const type = url.searchParams.get('type');
        const scale = Number(url.searchParams.get('scale') || 4);
        const model = url.searchParams.get('model') || 'realesrgan-x4plus';
        if (type !== 'upscale-image' && type !== 'upscale-video') { send(res, req, 400, { error: 'type invalide' }); return; }
        if (![2, 3, 4].includes(scale)) { send(res, req, 400, { error: 'scale doit valoir 2, 3 ou 4' }); return; }
        if (!MODEL_RE.test(model)) { send(res, req, 400, { error: 'nom de modèle invalide' }); return; }
        const declared = Number(req.headers['content-length'] || 0);
        if (declared > CONFIG.maxBytes) { send(res, req, 413, { error: 'Fichier trop volumineux' }); return; }

        const id = newId();
        const dir = path.join(CONFIG.workDir, id);
        await fsp.mkdir(dir, { recursive: true });
        const job = { id, type, scale, model, dir, input: path.join(dir, 'input.bin'), status: 'queued', progress: 0, stage: 'en attente', createdAt: Date.now(), cancelled: false, proc: null };
        try {
          const size = await saveBody(req, job.input, CONFIG.maxBytes);
          if (!size) throw Object.assign(new Error('Fichier vide'), { code: 'EEMPTY' });
        } catch (e) {
          await removeJobFiles(job);
          send(res, req, e.code === 'E2BIG' ? 413 : 400, { error: e.code === 'E2BIG' ? 'Fichier trop volumineux' : e.message });
          return;
        }
        jobs.set(id, job);
        queue.push(job);
        pump();
        send(res, req, 202, { id });
        return;
      }

      const m = /^\/jobs\/([a-f0-9]{18})(\/result)?$/.exec(url.pathname);
      if (m) {
        const job = jobs.get(m[1]);
        if (!job) { send(res, req, 404, { error: 'Tâche inconnue' }); return; }
        if (req.method === 'GET' && !m[2]) { send(res, req, 200, publicJob(job)); return; }
        if (req.method === 'GET' && m[2]) {
          if (job.status !== 'done') { send(res, req, 409, { error: 'Résultat pas encore prêt' }); return; }
          const stat = await fsp.stat(job.output);
          res.writeHead(200, { 'Content-Type': job.outMime, 'Content-Length': stat.size, 'Cache-Control': 'no-store', ...corsHeaders(req) });
          fs.createReadStream(job.output).pipe(res);
          return;
        }
        if (req.method === 'DELETE' && !m[2]) {
          killJob(job);
          jobs.delete(job.id);
          const i = queue.indexOf(job);
          if (i >= 0) queue.splice(i, 1);
          if (job !== running) await removeJobFiles(job); // la tâche en cours se nettoie elle-même à son arrêt
          send(res, req, 200, { ok: true });
          return;
        }
      }
      send(res, req, 404, { error: 'Route inconnue' });
    } catch (e) {
      send(res, req, 500, { error: tail(e && e.message ? e.message : e, 300) });
    }
  });
}

// Nettoyage des tâches anciennes (jamais récupérées).
function startCleaner() {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const job of jobs.values()) {
      if (job !== running && now - job.createdAt > CONFIG.ttlMs) { jobs.delete(job.id); removeJobFiles(job); }
    }
  }, 60_000);
  timer.unref();
  return timer;
}

export async function start() {
  const token = await loadToken();
  await fsp.mkdir(CONFIG.workDir, { recursive: true });
  const server = createServer(token);
  startCleaner();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(CONFIG.port, CONFIG.host, resolve); });
  return { server, token, port: server.address().port };
}

// Exécution directe : node server.mjs
if (import.meta.url === new URL(process.argv[1], 'file://').href || process.argv[1]?.endsWith('server.mjs')) {
  if (process.argv.includes('--help')) {
    console.log('Moteur local OVX — variables : OVX_PORT, OVX_ORIGINS, OVX_FFMPEG, OVX_FFPROBE, OVX_REALESRGAN, OVX_MODELS, OVX_MAX_MB, OVX_MAX_FRAMES, OVX_WORKDIR, OVX_TOKEN');
    process.exit(0);
  }
  start().then(async ({ token, port }) => {
    const caps = await capabilities();
    console.log('\n  Moteur local OVX démarré');
    console.log(`  Adresse : http://${CONFIG.host}:${port}`);
    console.log(token === DEFAULT_TOKEN
      ? '  Jeton   : universel (connexion automatique avec l’application, rien à copier)'
      : '  Jeton   : personnalisé (OVX_TOKEN) — donnez le même à l’application via localEngine.token');
    console.log('');
    console.log(`  ffmpeg ${caps.ffmpeg ? '✔' : '✘ introuvable'} | ffprobe ${caps.ffprobe ? '✔' : '✘ introuvable'} | realesrgan-ncnn-vulkan ${caps.realesrgan ? '✔' : '✘ introuvable'}`);
    if (CONFIG.origins.length) console.log(`  Sites autorisés en plus de localhost : ${CONFIG.origins.join(', ')}`);
    else console.log('  ⚠ Pour un site en ligne, lancez avec OVX_ORIGINS=https://votre-site.com (sans cela, seul localhost est accepté).');
    console.log('');
  }).catch((e) => { console.error('Démarrage impossible :', e.message); process.exit(1); });
  const stop = () => { console.log('\nArrêt du moteur local.'); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
