// Client du moteur local : confie les tâches lourdes à la puissance du PC.

export const DEFAULT_ENGINE_URL = 'http://127.0.0.1:47831';

// Aucun jeton de secours intégré au code.
// Attention : toute variable VITE_* est incluse dans le bundle navigateur et n'est pas secrète.
export const DEFAULT_ENGINE_TOKEN =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OVX_TOKEN) ||
  '';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readError(res) {
  try {
    const j = await res.json();
    if (j && j.error) return j.error;
  } catch { /* corps non JSON */ }
  return `Erreur ${res.status}`;
}

export function createLocalEngine({ url = DEFAULT_ENGINE_URL, token = DEFAULT_ENGINE_TOKEN } = {}) {
  const activeToken = typeof token === 'string' ? token : DEFAULT_ENGINE_TOKEN;
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

  async function runJob(type, blob, { scale = 4, model = '', onProgress, shouldStop, pollMs = 500, timeoutMs = 30 * 60 * 1000 } = {}) {
    if (!blob || typeof blob !== 'object') throw new Error('Fichier source absent pour le moteur local.');
    const safePollMs = Number.isFinite(Number(pollMs)) ? Math.max(150, Math.min(5000, Math.round(Number(pollMs)))) : 500;
    const safeTimeoutMs = Number.isFinite(Number(timeoutMs)) ? Math.max(1000, Math.min(2 * 60 * 60 * 1000, Math.round(Number(timeoutMs)))) : 30 * 60 * 1000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), safeTimeoutMs);
    const params = new URLSearchParams({ type, scale: String(scale) });
    if (model) params.set('model', model);
    let id = null;
    const remove = () => id ? fetch(`${base}/jobs/${encodeURIComponent(id)}`, { method: 'DELETE', headers: auth() }).catch(() => {}) : Promise.resolve();
    try {
      const post = await fetch(`${base}/jobs?${params}`, {
        method: 'POST',
        headers: { ...auth(), 'Content-Type': blob.type || 'application/octet-stream' },
        body: blob,
        signal: controller.signal
      });
      if (!post.ok) throw new Error(await readError(post));
      const payload = await post.json();
      id = payload && payload.id;
      if (typeof id !== 'string' || !id.trim()) throw new Error('Le moteur local a renvoyé un identifiant de tâche invalide.');

      for (;;) {
        if (shouldStop && shouldStop()) throw new Error('Traitement annulé.');
        if (controller.signal.aborted) throw new Error('Délai maximal du moteur local dépassé.');
        const st = await fetch(`${base}/jobs/${encodeURIComponent(id)}`, { headers: auth(), signal: controller.signal });
        if (!st.ok) throw new Error(await readError(st));
        const status = await st.json();
        if (typeof onProgress === 'function') onProgress(Number.isFinite(Number(status.progress)) ? Math.max(0, Math.min(1, Number(status.progress))) : 0, status.stage);
        if (status.status === 'done') break;
        if (status.status === 'error') throw new Error(status.error || 'Échec du moteur local.');
        if (status.status === 'cancelled') throw new Error('Traitement annulé.');
        await sleep(safePollMs);
      }
      const out = await fetch(`${base}/jobs/${encodeURIComponent(id)}/result`, { headers: auth(), signal: controller.signal });
      if (!out.ok) throw new Error(await readError(out));
      return await out.blob();
    } catch (error) {
      if (controller.signal.aborted) throw new Error('Délai maximal du moteur local dépassé.');
      throw error;
    } finally {
      clearTimeout(timeout);
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