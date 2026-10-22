import { memo, useEffect, useMemo, useRef, useState } from "react";

/**
 * SmartVideo : lecteur vidéo qui évite les saccades.
 *
 * variant="player" : lecteur principal (controls, preload auto, autoplay)
 * variant="loop"   : aperçu en boucle, muet, ne joue QUE quand il est visible
 * variant="thumb"  : miniature statique (une image figée à startAt secondes),
 *                    ne charge RIEN tant qu'elle n'est pas visible à l'écran
 *
 * Pourquoi ça réduit les saccades :
 *  - un seul décodage actif à la fois au lieu de N vidéos qui jouent en même temps
 *  - preload="metadata" pour les miniatures (au lieu de "auto" qui télécharge tout)
 *  - pas de crossOrigin inutile (il force du CORS et peut casser le cache/range requests)
 *  - React.memo : un re-render de App (frappe dans le prompt, etc.) ne touche plus à la vidéo
 *  - source MP4 H.264 proposée avant le WebM pour profiter du décodage matériel
 */

const withFragment = (url, t) => (t > 0 ? `${url}#t=${t}` : url);

// Pour les fichiers locaux /videos/xxx.webm : on tente d'abord /videos/xxx.mp4 (H.264, accéléré GPU),
// puis le WebM en secours (si le .mp4 n'existe pas, le navigateur passe automatiquement au suivant).
const buildSources = (src) => {
  if (!src) return [];
  const m = /^(\/videos\/[^?#]+)\.webm$/i.exec(src);
  if (m) return [{ src: `${m[1]}.mp4`, type: "video/mp4" }, { src, type: "video/webm" }];
  return [{ src }];
};

function useInView(ref, enabled, rootMargin = "250px") {
  const [inView, setInView] = useState(!enabled);
  useEffect(() => {
    if (!enabled) { setInView(true); return undefined; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled, rootMargin]);
  return inView;
}

function SmartVideoBase({ src, poster, variant = "player", startAt = 0, style, className, onError }) {
  const ref = useRef(null);
  const lazy = variant !== "player";
  const inView = useInView(ref, lazy);
  const [everVisible, setEverVisible] = useState(!lazy);

  useEffect(() => { if (inView) setEverVisible(true); }, [inView]);

  const sources = useMemo(() => buildSources(src), [src]);
  const sourcesKey = sources.map((s) => s.src).join("|");
  const frag = variant === "thumb" ? startAt : 0;

  // Recharge si la source change (ou quand elle devient visible pour la première fois)
  useEffect(() => {
    const v = ref.current;
    if (v && everVisible && sourcesKey) v.load();
  }, [sourcesKey, everVisible]);

  // Boucle : joue seulement quand visible, pause sinon (libère le décodeur)
  useEffect(() => {
    const v = ref.current;
    if (!v || variant !== "loop" || !everVisible) return;
    if (inView) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else v.pause();
  }, [inView, everVisible, variant, sourcesKey]);

  const handleLoadedMetadata = (e) => {
    if (variant !== "thumb" || startAt <= 0) return;
    const v = e.currentTarget;
    // Évite de dépasser la durée réelle (le code d'origine cassait sur les clips < 4 s)
    const max = Number.isFinite(v.duration) ? Math.max(0, v.duration - 0.1) : startAt;
    const target = Math.min(startAt, max);
    if (Math.abs(v.currentTime - target) > 0.2) v.currentTime = target;
  };

  const isPlayer = variant === "player";
  const isThumb = variant === "thumb";

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      poster={poster}
      muted={!isPlayer}
      playsInline
      controls={isPlayer}
      loop={variant === "loop"}
      autoPlay={!isThumb && everVisible}
      preload={!everVisible ? "none" : isThumb ? "metadata" : "auto"}
      onLoadedMetadata={handleLoadedMetadata}
      onError={onError}
    >
      {everVisible &&
        sources.map((s) => (
          <source key={s.src} src={withFragment(s.src, frag)} type={s.type} />
        ))}
    </video>
  );
}

const SmartVideo = memo(SmartVideoBase);
export default SmartVideo;
