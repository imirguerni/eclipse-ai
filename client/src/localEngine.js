// Client du moteur local : confie les tâches lourdes à la puissance du PC.

export const DEFAULT_ENGINE_URL = 'http://127.0.0.1:47831';

// Récupère le jeton depuis le fichier .env (Vite) ou utilise une valeur par défaut sécurisée
export const DEFAULT_ENGINE_TOKEN = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OVX_TOKEN) || 
  'ovx_secret_token_12345';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readError(res) {
  try {
    const j = await res.json();
    if (j && j.error) return j.error;
  } catch { /* corps non JSON */ }
  return `Erreur ${res.status}`;
}

export function createLocalEngine({ url = DEFAULT_ENGINE_URL, token = DEFAULT_ENGINE_TOKEN } = {}) {
  const activeToken = token || DEFAULT_ENGINE_TOKEN;
  const base = String(url).replace(/\/+$/, '');
  const auth = () => (activeToken ? { Authorization: `Bearer ${activeToken}` } : {});

  // Le moteur est-il lancé ? Le jeton est-il accepté ? Quels outils sont installés ?
  async function detect({ timeoutMs = 1500 } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}/health`, { headers: auth(), signal: ctrl.signal });
      if (!res.ok) return { online: false };
      const j = await res.json();
      if (!j || j.ok !== true || j.name !== 'ovx-local-engine') return { online: false };
      return { online: true, authorized: Boolean(j.authorized), version: j.version || '', capabilities: j.capabilities || null };
    } catch {
      return { online: false };
    } finally {
      clearTimeout(timer);
    }
  }

  async function runJob(type, blob, { scale = 4, model = '', onProgress, shouldStop, pollMs = 500 } = {}) {
    const params = new URLSearchParams({ type, scale: String(scale) });
    if (model) params.set('model', model);
    const post = await fetch(`${base}/jobs?${params}`, {
      method: 'POST',
      headers: { ...auth(), 'Content-Type': blob.type || 'application/octet-stream' },
      body: blob
    });
    if (!post.ok) throw new Error(await readError(post));
    const { id } = await post.json();

    const remove = () => fetch(`${base}/jobs/${id}`, { method: 'DELETE', headers: auth() }).catch(() => {});
    try {
      for (;;) {
        if (shouldStop && shouldStop()) throw new Error('Traitement annulé.');
        const st = await fetch(`${base}/jobs/${id}`, { headers: auth() });
        if (!st.ok) throw new Error(await readError(st));
        const s = await st.json();
        if (onProgress) onProgress(s.progress, s.stage);
        if (s.status === 'done') break;
        if (s.status === 'error') throw new Error(s.error || 'Échec du moteur local.');
        if (s.status === 'cancelled') throw new Error('Traitement annulé.');
        await sleep(pollMs);
      }
      const out = await fetch(`${base}/jobs/${id}/result`, { headers: auth() });
      if (!out.ok) throw new Error(await readError(out));
      return await out.blob();
    } finally {
      await remove(); // libère le disque du PC dans tous les cas
    }
  }

  return {
    url: base,
    token: activeToken,
    detect,
    upscaleImage: (blob, opts) => runJob('upscale-image', blob, opts),
    upscaleVideo: (blob, opts) => runJob('upscale-video', blob, opts)
  };
}

// Facteur ×2, ×3 ou ×4 le plus proche (par excès) pour atteindre un agrandissement donné.
export const pickScale = (ratio) => (ratio <= 2 ? 2 : ratio <= 3 ? 3 : 4);