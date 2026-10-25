// Mixage audio : piste d'origine (avec les sections supprimées) + musique, rendu hors ligne.

// Pour un bloc audio source [chunkStart, chunkEnd], liste les lectures à programmer dans la
// vidéo finale (une par section conservée qui le recoupe).
export function scheduleChunk(ranges, chunkStart, chunkEnd) {
  const jobs = [];
  ranges.forEach((r) => {
    const from = Math.max(chunkStart, r.start);
    const to = Math.min(chunkEnd, r.end);
    if (to - from > 1e-4) jobs.push({ when: r.outStart + (from - r.start), offset: from - chunkStart, duration: to - from });
  });
  return jobs;
}

const getAudioContextCtor = () => (typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null);

export async function decodeAudioFile(file) {
  const Ctor = getAudioContextCtor();
  if (!Ctor) throw new Error('Audio non supporté par ce navigateur.');
  const ctx = new Ctor();
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    return { buffer, duration: buffer.duration };
  } finally {
    ctx.close?.();
  }
}

// Lit la piste audio d'origine sous forme de blocs AudioBuffer (mediabunny si disponible,
// sinon décodage direct du fichier).
export async function collectOriginalAudio(mediabunny, inputAudioTrack, sourceBlob, duration) {
  const chunks = [];
  if (inputAudioTrack && mediabunny && typeof mediabunny.AudioBufferSink === 'function') {
    const sink = new mediabunny.AudioBufferSink(inputAudioTrack);
    for await (const item of sink.buffers(0, duration)) chunks.push({ buffer: item.buffer, timestamp: item.timestamp });
    return chunks;
  }
  const Ctor = getAudioContextCtor();
  if (!Ctor) return chunks;
  const ctx = new Ctor();
  try {
    const buffer = await ctx.decodeAudioData(await sourceBlob.arrayBuffer());
    chunks.push({ buffer, timestamp: 0 });
  } finally {
    ctx.close?.();
  }
  return chunks;
}

// music : { buffer, volume (0..2), offset (s), loop, fadeIn (s), fadeOut (s) } | null
export async function renderMix({ ranges, totalDuration, originalChunks, originalVolume, music, sampleRate = 48000 }) {
  if (typeof OfflineAudioContext === 'undefined') throw new Error('Rendu audio hors ligne non supporté.');
  const length = Math.ceil(totalDuration * sampleRate);
  if (length * 2 * 4 > 450 * 1024 * 1024) throw new Error('Durée trop longue pour le mixage audio (environ 20 minutes maximum).');
  const ctx = new OfflineAudioContext(2, length, sampleRate);

  if (originalVolume > 0) {
    const master = ctx.createGain();
    master.gain.value = originalVolume;
    master.connect(ctx.destination);
    originalChunks.forEach(({ buffer, timestamp }) => {
      scheduleChunk(ranges, timestamp, timestamp + buffer.duration).forEach((job) => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(master);
        src.start(job.when, job.offset, job.duration);
      });
    });
  }

  if (music && music.buffer && music.volume > 0) {
    const gain = ctx.createGain();
    const start = Math.max(0, music.offset || 0);
    const end = totalDuration;
    const vol = music.volume;
    gain.gain.setValueAtTime(music.fadeIn > 0 ? 0 : vol, start);
    if (music.fadeIn > 0) gain.gain.linearRampToValueAtTime(vol, start + music.fadeIn);
    if (music.fadeOut > 0 && end - music.fadeOut > start) {
      gain.gain.setValueAtTime(vol, end - music.fadeOut);
      gain.gain.linearRampToValueAtTime(0, end);
    }
    gain.connect(ctx.destination);
    const src = ctx.createBufferSource();
    src.buffer = music.buffer;
    src.loop = Boolean(music.loop);
    src.connect(gain);
    if (start < end) src.start(start, 0, music.loop ? end - start : undefined);
  }
  return ctx.startRendering();
}

// Découpe un AudioBuffer en blocs AudioSample (repli quand AudioBufferSource n'existe pas).
export function* iterateSamples(mediabunny, audioBuffer, chunkSeconds = 1) {
  if (!mediabunny || typeof mediabunny.AudioSample !== 'function') throw new Error('AudioSample indisponible.');
  const sr = audioBuffer.sampleRate;
  const ch = audioBuffer.numberOfChannels;
  const step = Math.floor(sr * chunkSeconds);
  const channels = Array.from({ length: ch }, (_, c) => audioBuffer.getChannelData(c));
  for (let start = 0; start < audioBuffer.length; start += step) {
    const len = Math.min(step, audioBuffer.length - start);
    const data = new Float32Array(len * ch);
    for (let c = 0; c < ch; c++) data.set(channels[c].subarray(start, start + len), c * len);
    yield new mediabunny.AudioSample({ data, format: 'f32-planar', numberOfChannels: ch, sampleRate: sr, timestamp: start / sr });
  }
}
