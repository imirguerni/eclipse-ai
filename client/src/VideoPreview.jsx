import { useEffect, useRef } from "react";

function VideoPreview({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    // Réinitialisation forcée si le src change
    video.load(); 

    const tryPlay = async () => {
      try {
        video.currentTime = 0.1;
        await video.play();
      } catch (err) {
        // L'autoplay est souvent bloqué par le navigateur si l'utilisateur n'a pas interagi
        console.log("Autoplay bloqué, attend l'interaction.");
      }
    };

    // On utilise 'loadeddata' car c'est le moment où la première frame est disponible
    video.addEventListener("loadeddata", tryPlay);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      // Optionnel : arrêter la vidéo au démontage
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
      className="render-media"
      style={{
        maxHeight: "70vh",
        borderRadius: "12px",
        objectFit: "cover",
        backgroundColor: "#000",
        width: "100%" // Ajouté pour assurer le comportement responsive
      }}
    />
  );
}

export default VideoPreview;