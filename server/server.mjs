
// ============================================================
// MOTEUR LOCAL OVX — utilise la puissance de VOTRE PC
// Version 1.0.1
// Chargement automatique du fichier .env
//
// Prérequis :
//   - Node.js 18+
//   - ffmpeg et ffprobe
//   - realesrgan-ncnn-vulkan (facultatif)
//
// Lancement : node server.mjs
//
// Sécurité :
//   - Écoute uniquement sur 127.0.0.1
//   - Authentification par jeton
//   - Origines contrôlées
//   - Aucune commande shell
// ============================================================

import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const VERSION = '1.0.1';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// ---------- Chargement automatique du .env ----------

function loadDotEnv() {
  const envFiles = [
    path.join(SCRIPT_DIR, '.env'),
    path.resolve(SCRIPT_DIR, '..', '.env'),
    path.join(process.cwd(), '.env')
  ];

  for (const envFile of [...new Set(envFiles)]) {
    if (!fs.existsSync(envFile)) continue;

    try {
      const content = fs.readFileSync(envFile, 'utf8');

      for (const line of content.split(/\r?\n/)) {
        const match = line.match(
          /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/
        );

        if (!match) continue;

        const key = match[1];
        let value = match[2];

        // Les variables déjà définies dans Windows sont prioritaires.
        if (process.env[key] !== undefined) continue;

        // Gestion des valeurs entre guillemets.
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);

          if (line.includes('="')) {
            value = value
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r');
          }
        } else {
          value = value.replace(/\s+#.*$/, '').trim();
        }

        process.env[key] = value;
      }

      console.log(`Configuration chargée : ${envFile}`);
      return;
    } catch (error) {
      console.error(`Erreur lecture .env : ${error.message}`);
    }
  }

  console.log(
    'Aucun fichier .env trouvé. Utilisation des variables système.'
  );
}

loadDotEnv();

const env = process.env;

// ---------- Configuration ----------

export const CONFIG = {
  host: env.OVX_HOST || '127.0.0.1',
  port: env.OVX_PORT === undefined ? 47831 : Number(env.OVX_PORT),

  ffmpeg: env.OVX_FFMPEG || 'ffmpeg',
  ffprobe: env.OVX_FFPROBE || 'ffprobe',
  realesrgan: env.OVX_REALESRGAN || 'realesrgan-ncnn-vulkan',

  modelsDir: env.OVX_MODELS || '',

  origins: (env.OVX_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  maxBytes: (Number(env.OVX_MAX_MB) || 4096) * 1024 * 1024,
  maxFrames: Number(env.OVX_MAX_FRAMES) || 6000,
  maxOutputPixels:
    Number(env.OVX_MAX_OUTPUT_PIXELS) || 7680 * 4320,

  workDir:
    env.OVX_WORKDIR || path.join(os.tmpdir(), 'ovx-engine'),

  tokenFile:
    env.OVX_TOKEN_FILE ||
    path.join(os.homedir(), '.ovx-engine', 'token'),

  ttlMs: (Number(env.OVX_TTL_MIN) || 60) * 60 * 1000
};

const DEFAULT_MODELS = [
  'realesrgan-x4plus',
  'realesrnet-x4plus',
  'realesrgan-x4plus-anime',
  'realesr-animevideov3'
];

const MODEL_RE = /^[A-Za-z0-9._-]{1,64}$/;

const LOCAL_ORIGIN_RE =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

// ---------- Jeton ----------

async function loadToken() {
  if (env.OVX_TOKEN) return env.OVX_TOKEN;

  try {
    const token = (
      await fsp.readFile(CONFIG.tokenFile, 'utf8')
    ).trim();

    if (token.length >= 24) return token;
  } catch {
    // Fichier absent : création d'un nouveau jeton.
  }

  const token = crypto.randomBytes(24).toString('hex');

  await fsp.mkdir(path.dirname(CONFIG.tokenFile), {
    recursive: true
  });

  await fsp.writeFile(
    CONFIG.tokenFile,
    `${token}\n`,
    { mode: 0o600 }
  );

  return token;
}

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));

  return (
    x.length === y.length &&
    crypto.timingSafeEqual(x, y)
  );
};

// ---------- Outils ----------

function runCapture(cmd, args, { timeoutMs = 4000 } = {}) {
  return new Promise((resolve) => {
    let out = '';
    let settled = false;

    const done = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    let child;

    try {
      child = spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
    } catch {
      done({ ok: false, out: '' });
      return;
    }

    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {
        // Ignoré.
      }

      done({ ok: true, out });
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      out += data;
    });

    child.stderr.on('data', (data) => {
      out += data;
    });

    child.on('error', () => {
      clearTimeout(timer);
      done({ ok: false, out: '' });
    });

    child.on('close', () => {
      clearTimeout(timer);
      done({ ok: true, out });
    });
  });
}

let capsCache = {
  at: 0,
  value: null
};

async function capabilities() {
  if (
    capsCache.value &&
    Date.now() - capsCache.at < 30_000
  ) {
    return capsCache.value;
  }

  const [ff, fp, re] = await Promise.all([
    runCapture(CONFIG.ffmpeg, ['-version']),
    runCapture(CONFIG.ffprobe, ['-version']),
    runCapture(CONFIG.realesrgan, ['-h'])
  ]);

  let models = DEFAULT_MODELS;

  if (CONFIG.modelsDir) {
    try {
      const files = await fsp.readdir(CONFIG.modelsDir);

      const found = [
        ...new Set(
          files
            .filter((file) => file.endsWith('.param'))
            .map((file) => file.slice(0, -6))
        )
      ].filter((model) => MODEL_RE.test(model));

      if (found.length) models = found;
    } catch {
      // Dossier absent : modèles par défaut.
    }
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

  capsCache = {
    at: Date.now(),
    value
  };

  return value;
}

// ---------- Tâches ----------

const jobs = new Map();
const queue = [];

let running = null;

const newId = () =>
  crypto.randomBytes(9).toString('hex');

const tail = (value, length = 400) =>
  String(value).slice(-length).trim();

function publicJob(job) {
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: Math.round(job.progress * 1000) / 1000,
    stage: job.stage,
    error: job.error || null
  };
}

async function removeJobFiles(job) {
  try {
    await fsp.rm(job.dir, {
      recursive: true,
      force: true
    });
  } catch {
    // Ignoré.
  }
}

function killJob(job) {
  job.cancelled = true;

  if (job.proc) {
    try {
      job.proc.kill('SIGKILL');
    } catch {
      // Ignoré.
    }
  }
}

// Lance une commande fixe sans shell.

function runJobProcess(
  job,
  cmd,
  args,
  { onStdout, onStderr } = {}
) {
  return new Promise((resolve, reject) => {
    if (job.cancelled) {
      reject(new Error('annulé'));
      return;
    }

    let errTail = '';
    let child;

    try {
      child = spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
    } catch (error) {
      reject(
        new Error(
          `Impossible de lancer « ${cmd} » : ${error.message}`
        )
      );
      return;
    }

    job.proc = child;

    child.stdout.on('data', (data) => {
      if (onStdout) onStdout(String(data));
    });

    child.stderr.on('data', (data) => {
      const value = String(data);

      const useful = value
        .split(/\r?\n/)
        .filter(
          (line) =>
            line.trim() &&
            !/^\s*\d+(\.\d+)?%\s*$/.test(line)
        )
        .join(' | ');

      if (useful) {
        errTail = tail(`${errTail} ${useful}`, 800);
      }

      if (onStderr) onStderr(value);
    });

    child.on('error', (error) => {
      job.proc = null;

      reject(
        new Error(
          error.code === 'ENOENT'
            ? `Outil introuvable : « ${cmd} » (voir README)`
            : error.message
        )
      );
    });

    child.on('close', (code) => {
      job.proc = null;

      if (job.cancelled) {
        reject(new Error('annulé'));
      } else if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `« ${path.basename(cmd)} » a échoué (code ${code}) : ${
              errTail || 'aucun détail'
            }`
          )
        );
      }
    });
  });
}

async function countFiles(dir) {
  try {
    return (
      await fsp.readdir(dir)
    ).filter((file) => file.endsWith('.png')).length;
  } catch {
    return 0;
  }
}

const parseFraction = (value) => {
  const match = /^(\d+)\/(\d+)$/.exec(
    String(value || '')
  );

  if (!match || Number(match[2]) === 0) {
    return null;
  }

  return {
    text: value,
    value: Number(match[1]) / Number(match[2])
  };
};

const realesrganArgs = (
  input,
  output,
  scale,
  model
) => [
  '-i', input,
  '-o', output,
  '-s', String(scale),
  '-n', model,
  '-f', 'png',
  ...(CONFIG.modelsDir
    ? ['-m', CONFIG.modelsDir]
    : [])
];

// ---------- Agrandissement image ----------

async function processUpscaleImage(job) {
  job.stage = 'agrandissement IA';

  job.output = path.join(job.dir, 'output.png');
  job.outMime = 'image/png';

  await runJobProcess(
    job,
    CONFIG.realesrgan,
    realesrganArgs(
      job.input,
      job.output,
      job.scale,
      job.model
    ),
    {
      onStderr: (value) => {
        const matches = [
          ...value.matchAll(/(\d+(?:\.\d+)?)%/g)
        ];

        const match = matches.pop();

        if (match) {
          job.progress = Math.min(
            0.99,
            Number(match[1]) / 100
          );
        }
      }
    }
  );

  await fsp.access(job.output);
}

// ---------- Agrandissement vidéo ----------

async function processUpscaleVideo(job) {
  const framesIn = path.join(job.dir, 'in');
  const framesOut = path.join(job.dir, 'out');

  await fsp.mkdir(framesIn);
  await fsp.mkdir(framesOut);

  // 1. Analyse vidéo.

  job.stage = 'analyse';

  let probeOut = '';

  await runJobProcess(
    job,
    CONFIG.ffprobe,
    [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries',
      'stream=avg_frame_rate,r_frame_rate,nb_frames,width,height,duration:format=duration',
      '-of', 'json',
      job.input
    ],
    {
      onStdout: (value) => {
        probeOut += value;
      }
    }
  );

  const info = JSON.parse(probeOut || '{}');

  const stream =
    (info.streams && info.streams[0]) || {};

  const fps =
    parseFraction(stream.avg_frame_rate) ||
    parseFraction(stream.r_frame_rate);

  if (!fps || !stream.width || !stream.height) {
    throw new Error(
      'Vidéo illisible (pas de piste vidéo).'
    );
  }

  const duration =
    Number(stream.duration) ||
    Number(info.format && info.format.duration) ||
    0;

  const total =
    Number(stream.nb_frames) ||
    Math.max(1, Math.round(duration * fps.value));

  if (total > CONFIG.maxFrames) {
    throw new Error(
      `Vidéo trop longue : ${total} images (maximum ${CONFIG.maxFrames}). Découpez-la d'abord.`
    );
  }

  if (
    stream.width *
      job.scale *
      stream.height *
      job.scale >
    CONFIG.maxOutputPixels
  ) {
    throw new Error(
      `Résultat trop grand (${stream.width * job.scale}×${
        stream.height * job.scale
      }).`
    );
  }

  // 2. Extraction des images.

  job.stage = 'extraction des images';

  const poll1 = setInterval(async () => {
    job.progress =
      0.15 *
      Math.min(
        1,
        (await countFiles(framesIn)) / total
      );
  }, 400);

  try {
    await runJobProcess(
      job,
      CONFIG.ffmpeg,
      [
        '-hide_banner',
        '-loglevel', 'error',
        '-y',
        '-i', job.input,
        '-an',
        '-vsync', '0',
        path.join(framesIn, '%08d.png')
      ]
    );
  } finally {
    clearInterval(poll1);
  }

  // 3. Agrandissement IA des images.

  job.stage = 'agrandissement IA';

  const poll2 = setInterval(async () => {
    job.progress =
      0.15 +
      0.7 *
        Math.min(
          1,
          (await countFiles(framesOut)) / total
        );
  }, 500);

  try {
    await runJobProcess(
      job,
      CONFIG.realesrgan,
      realesrganArgs(
        framesIn,
        framesOut,
        job.scale,
        job.model
      )
    );
  } finally {
    clearInterval(poll2);
  }

  await fsp.rm(framesIn, {
    recursive: true,
    force: true
  });

  // 4. Réassemblage et son d'origine.

  job.stage = 'encodage';

  job.output = path.join(job.dir, 'output.mp4');
  job.outMime = 'video/mp4';

  await runJobProcess(
    job,
    CONFIG.ffmpeg,
    [
      '-hide_banner',
      '-loglevel', 'error',
      '-nostats',
      '-progress', 'pipe:1',
      '-y',

      '-framerate', fps.text,
      '-i', path.join(framesOut, '%08d.png'),
      '-i', job.input,

      '-map', '0:v:0',
      '-map', '1:a:0?',

      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '16',
      '-pix_fmt', 'yuv420p',

      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',

      job.output
    ],
    {
      onStdout: (value) => {
        const matches = [
          ...value.matchAll(/frame=(\d+)/g)
        ];

        const match = matches.pop();

        if (match) {
          job.progress =
            0.85 +
            0.14 *
              Math.min(
                1,
                Number(match[1]) / total
              );
        }
      }
    }
  );

  await fsp.rm(framesOut, {
    recursive: true,
    force: true
  });

  await fsp.access(job.output);
}

// ---------- Exécution des tâches ----------

async function runJob(job) {
  job.status = 'running';

  try {
    if (job.type === 'upscale-image') {
      await processUpscaleImage(job);
    } else {
      await processUpscaleVideo(job);
    }

    job.progress = 1;
    job.status = 'done';
    job.stage = 'terminé';

  } catch (error) {
    if (job.cancelled) {
      job.status = 'cancelled';
      job.error = null;
    } else {
      job.status = 'error';
      job.error = tail(error.message, 600);
    }

    await removeJobFiles(job);
  }
}

function pump() {
  if (running || !queue.length) return;

  const job = queue.shift();

  if (job.cancelled) {
    pump();
    return;
  }

  running = job;

  runJob(job).finally(() => {
    running = null;
    pump();
  });
}

// ---------- HTTP ----------

function originAllowed(origin) {
  if (!origin) return true;

  return (
    LOCAL_ORIGIN_RE.test(origin) ||
    CONFIG.origins.includes(origin)
  );
}

function corsHeaders(req) {
  const origin = req.headers.origin;

  if (!origin || !originAllowed(origin)) {
    return {};
  }

  const headers = {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods':
      'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type',
    'Access-Control-Max-Age': '600'
  };

  if (
    req.headers[
      'access-control-request-private-network'
    ] === 'true'
  ) {
    headers[
      'Access-Control-Allow-Private-Network'
    ] = 'true';
  }

  return headers;
}

function send(res, req, status, body, extra = {}) {
  const payload =
    typeof body === 'string' || Buffer.isBuffer(body)
      ? body
      : JSON.stringify(body);

  res.writeHead(status, {
    'Content-Type':
      typeof body === 'string' || Buffer.isBuffer(body)
        ? 'text/plain; charset=utf-8'
        : 'application/json; charset=utf-8',

    'Cache-Control': 'no-store',

    ...corsHeaders(req),
    ...extra
  });

  res.end(payload);
}

async function saveBody(req, dest, limit) {
  let size = 0;

  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      size += chunk.length;

      if (size > limit) {
        callback(
          Object.assign(
            new Error('Fichier trop volumineux'),
            { code: 'E2BIG' }
          )
        );
      } else {
        callback(null, chunk);
      }
    }
  });

  await pipeline(
    req,
    counter,
    fs.createWriteStream(dest)
  );

  return size;
}

// ---------- Création du serveur ----------

export function createServer(token) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(
        req.url,
        'http://localhost'
      );

      const origin = req.headers.origin;

      if (origin && !originAllowed(origin)) {
        send(res, req, 403, {
          error:
            'Origine non autorisée. Ajoutez-la dans OVX_ORIGINS.'
        });
        return;
      }

      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          ...corsHeaders(req)
        });

        res.end();
        return;
      }

      const auth = req.headers.authorization || '';

      const authorized =
        auth.startsWith('Bearer ') &&
        safeEqual(auth.slice(7), token);

      // Santé du moteur.

      if (
        req.method === 'GET' &&
        url.pathname === '/health'
      ) {
        const body = {
          ok: true,
          name: 'ovx-local-engine',
          version: VERSION,
          authorized
        };

        if (authorized) {
          body.capabilities = await capabilities();
        }

        send(res, req, 200, body);
        return;
      }

      if (!authorized) {
        send(res, req, 401, {
          error: 'Jeton manquant ou incorrect.'
        });
        return;
      }

      // POST /jobs

      if (
        req.method === 'POST' &&
        url.pathname === '/jobs'
      ) {
        const type = url.searchParams.get('type');

        const scale = Number(
          url.searchParams.get('scale') || 4
        );

        const model =
          url.searchParams.get('model') ||
          'realesrgan-x4plus';

        if (
          type !== 'upscale-image' &&
          type !== 'upscale-video'
        ) {
          send(res, req, 400, {
            error: 'type invalide'
          });
          return;
        }

        if (![2, 3, 4].includes(scale)) {
          send(res, req, 400, {
            error: 'scale doit valoir 2, 3 ou 4'
          });
          return;
        }

        if (!MODEL_RE.test(model)) {
          send(res, req, 400, {
            error: 'nom de modèle invalide'
          });
          return;
        }

        const declared = Number(
          req.headers['content-length'] || 0
        );

        if (declared > CONFIG.maxBytes) {
          send(res, req, 413, {
            error: 'Fichier trop volumineux'
          });
          return;
        }

        const id = newId();

        const dir = path.join(
          CONFIG.workDir,
          id
        );

        await fsp.mkdir(dir, {
          recursive: true
        });

        const job = {
          id,
          type,
          scale,
          model,
          dir,
          input: path.join(dir, 'input.bin'),
          status: 'queued',
          progress: 0,
          stage: 'en attente',
          createdAt: Date.now(),
          cancelled: false,
          proc: null
        };

        try {
          const size = await saveBody(
            req,
            job.input,
            CONFIG.maxBytes
          );

          if (!size) {
            throw Object.assign(
              new Error('Fichier vide'),
              { code: 'EEMPTY' }
            );
          }

        } catch (error) {
          await removeJobFiles(job);

          send(
            res,
            req,
            error.code === 'E2BIG' ? 413 : 400,
            {
              error:
                error.code === 'E2BIG'
                  ? 'Fichier trop volumineux'
                  : error.message
            }
          );

          return;
        }

        jobs.set(id, job);
        queue.push(job);
        pump();

        send(res, req, 202, { id });
        return;
      }

      // Consultation, résultat et annulation.

      const match =
        /^\/jobs\/([a-f0-9]{18})(\/result)?$/.exec(
          url.pathname
        );

      if (match) {
        const job = jobs.get(match[1]);

        if (!job) {
          send(res, req, 404, {
            error: 'Tâche inconnue'
          });
          return;
        }

        if (
          req.method === 'GET' &&
          !match[2]
        ) {
          send(
            res,
            req,
            200,
            publicJob(job)
          );
          return;
        }

        if (
          req.method === 'GET' &&
          match[2]
        ) {
          if (job.status !== 'done') {
            send(res, req, 409, {
              error: 'Résultat pas encore prêt'
            });
            return;
          }

          const stat = await fsp.stat(
            job.output
          );

          res.writeHead(200, {
            'Content-Type': job.outMime,
            'Content-Length': stat.size,
            'Cache-Control': 'no-store',
            ...corsHeaders(req)
          });

          fs.createReadStream(job.output).pipe(res);
          return;
        }

        if (
          req.method === 'DELETE' &&
          !match[2]
        ) {
          killJob(job);
          jobs.delete(job.id);

          const index = queue.indexOf(job);

          if (index >= 0) {
            queue.splice(index, 1);
          }

          if (job !== running) {
            await removeJobFiles(job);
          }

          send(res, req, 200, {
            ok: true
          });

          return;
        }
      }

      send(res, req, 404, {
        error: 'Route inconnue'
      });

    } catch (error) {
      send(res, req, 500, {
        error: tail(
          error && error.message
            ? error.message
            : error,
          300
        )
      });
    }
  });
}

// ---------- Nettoyage automatique ----------

function startCleaner() {
  const timer = setInterval(() => {
    const now = Date.now();

    for (const job of jobs.values()) {
      if (
        job !== running &&
        now - job.createdAt > CONFIG.ttlMs
      ) {
        jobs.delete(job.id);
        removeJobFiles(job);
      }
    }
  }, 60_000);

  timer.unref();

  return timer;
}

// ---------- Démarrage ----------

export async function start() {
  const token = await loadToken();

  await fsp.mkdir(CONFIG.workDir, {
    recursive: true
  });

  const server = createServer(token);

  startCleaner();

  await new Promise((resolve, reject) => {
    server.once('error', reject);

    server.listen(
      CONFIG.port,
      CONFIG.host,
      resolve
    );
  });

  return {
    server,
    token,
    port: server.address().port
  };
}

// ---------- Exécution directe ----------

if (
  process.argv[1] &&
  (
    import.meta.url ===
      new URL(
        process.argv[1],
        'file://'
      ).href ||
    process.argv[1].endsWith('server.mjs')
  )
) {
  if (process.argv.includes('--help')) {
    console.log(
      'Moteur local OVX — variables : OVX_PORT, OVX_ORIGINS, OVX_FFMPEG, OVX_FFPROBE, OVX_REALESRGAN, OVX_MODELS, OVX_MAX_MB, OVX_MAX_FRAMES, OVX_WORKDIR, OVX_TOKEN'
    );

    process.exit(0);
  }

  start()
    .then(async ({ token, port }) => {
      const caps = await capabilities();

      console.log('\n  Moteur local OVX démarré');
      console.log(
        `  Adresse : http://${CONFIG.host}:${port}`
      );
      console.log(`  Jeton   : ${token}`);

      console.log(
        '  (copiez ce jeton dans l’application : Performance > Moteur local > Connecter)\n'
      );

      console.log(
        `  ffmpeg ${
          caps.ffmpeg ? '✔' : '✘ introuvable'
        } | ffprobe ${
          caps.ffprobe ? '✔' : '✘ introuvable'
        } | realesrgan-ncnn-vulkan ${
          caps.realesrgan ? '✔' : '✘ introuvable'
        }`
      );

      if (CONFIG.origins.length) {
        console.log(
          `  Sites autorisés en plus de localhost : ${CONFIG.origins.join(', ')}`
        );
      } else {
        console.log(
          '  Pour un site en ligne, configurez OVX_ORIGINS dans .env'
        );
      }

      console.log('');
    })
    .catch((error) => {
      console.error(
        'Démarrage impossible :',
        error.message
      );

      process.exit(1);
    });

  const stop = () => {
    console.log('\nArrêt du moteur local.');
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
