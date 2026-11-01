import { useEffect, useRef } from "react";

function VideoPreview({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return undefined;
    let disposed = false;

    const tryPlay = async () => {
      if (disposed || !video.isConnected) return;
      try {
        // Ne jamais demander 0,1 s au-delà de la durée d'une vidéo très courte.
        if (Number.isFinite(video.duration) && video.duration > 0) {
          const startAt = Math.min(0.1, Math.max(0, video.duration - 0.01));
          if (Math.abs(video.currentTime - startAt) > 0.015 && !video.seeking) video.currentTime = startAt;
        }
        await video.play();
      } catch {
        // L'autoplay peut être refusé par le navigateur : les contrôles restent disponibles.
      }
    };

    video.addEventListener("loadeddata", tryPlay);
    if (video.readyState >= 2) tryPlay();
    else video.load();

    return () => {
      disposed = true;
      video.removeEventListener("loadeddata", tryPlay);
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      loop
      preload="metadata"
      className="render-media"
      style={{
        maxHeight: "70vh",
        borderRadius: "12px",
        objectFit: "cover",
        backgroundColor: "#000",
        width: "100%"
      }}
    />
  );
}

export default VideoPreview;
