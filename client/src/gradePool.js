// Pool de Web Workers : répartit l'étalonnage sur plusieurs cœurs du processeur.

export const detectCores = () =>
  typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;

export const workersSupported = () => typeof Worker !== 'undefined';

export class GradePool {
  constructor(size) {
    this.size = Math.max(1, Math.floor(size));
    this.workers = [];
    this.idle = [];
    this.queue = [];
    this.pending = new Map();
    this.nextId = 1;
    this.plan = null;
    this.failed = false;
    this.closed = false;
    try {
      for (let i = 0; i < this.size; i++) {
        const worker = new Worker(new URL('./gradeWorker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => this.handleMessage(worker, e.data);
        worker.onerror = (e) => this.fail(new Error((e && e.message) || 'Erreur du worker'));
        this.workers.push(worker);
        this.idle.push(worker);
      }
    } catch (error) {
      this.terminate();
      throw error;
    }
  }

  // Envoie le plan d'étalonnage à tous les workers (les tâches suivantes l'utilisent).
  setPlan(plan) {
    this.plan = plan;
    if (this.closed) return;
    this.workers.forEach((w) => w.postMessage({ type: 'plan', plan }));
  }

  // `buffer` appartient désormais au worker (transfert). Retourne les pixels traités.
  submit(buffer, width, height, seed = 0, region = null) {
    return new Promise((resolve, reject) => {
      if (this.closed) { reject(new Error('Pool de workers fermé.')); return; }
      this.queue.push({ id: this.nextId++, buffer, width, height, seed, region, resolve, reject });
      this.dispatch();
    });
  }

  dispatch() {
    while (this.idle.length && this.queue.length && !this.closed) {
      const worker = this.idle.pop();
      const job = this.queue.shift();
      this.pending.set(job.id, { resolve: job.resolve, reject: job.reject, worker });
      worker.postMessage(
        { type: 'job', id: job.id, buffer: job.buffer, width: job.width, height: job.height, seed: job.seed, region: job.region },
        [job.buffer]
      );
    }
  }

  handleMessage(worker, msg) {
    const entry = this.pending.get(msg.id);
    if (!entry) return;
    this.pending.delete(msg.id);
    this.idle.push(worker);
    if (msg.type === 'done') entry.resolve(new Uint8ClampedArray(msg.buffer));
    else entry.reject(new Error(msg.message || 'Échec du traitement.'));
    this.dispatch();
  }

  fail(error) {
    this.failed = true;
    this.pending.forEach((entry) => entry.reject(error));
    this.queue.forEach((job) => job.reject(error));
    this.pending.clear();
    this.queue = [];
    this.terminate();
  }

  // Traite une image entière. Sans effet « global » (flous), l'image est découpée en bandes
  // traitées en parallèle ; sinon un seul worker la traite (le thread principal reste libre).
  // `imageData` n'est modifié qu'en cas de succès complet.
  async processFrame(imageData, seed = 0) {
    const plan = this.plan;
    if (!plan || plan.identity) return;
    const { width: w, height: h, data } = imageData;
    const bands = plan.global || this.size < 2 || h < 64 ? 1 : Math.min(this.size, Math.floor(h / 32));
    if (bands === 1) {
      const out = await this.submit(data.slice().buffer, w, h, seed, null);
      data.set(out);
      return;
    }
    const rows = Math.ceil(h / bands);
    const parts = [];
    for (let b = 0; b < bands; b++) {
      const y0 = b * rows;
      const y1 = Math.min(h, y0 + rows);
      if (y0 >= y1) break;
      parts.push({
        y0,
        job: this.submit(data.slice(y0 * w * 4, y1 * w * 4).buffer, w, y1 - y0, seed, { offsetY: y0, fullHeight: h })
      });
    }
    const results = await Promise.all(parts.map((p) => p.job));
    results.forEach((out, k) => data.set(out, parts[k].y0 * w * 4));
  }

  // Traite une image dans un seul worker (export vidéo : une image par worker).
  processWhole(imageData, seed = 0) {
    return this.submit(imageData.data.slice().buffer, imageData.width, imageData.height, seed, null);
  }

  terminate() {
    this.closed = true;
    this.workers.forEach((w) => { try { w.terminate(); } catch { /* ignoré */ } });
    this.workers = [];
    this.idle = [];
  }
}
