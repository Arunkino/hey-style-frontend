import { useRef, useState } from "react";

const swingStyles = `
  @keyframes chairSwing {
    0%   { transform: rotateY(-30deg); }
    50%  { transform: rotateY(30deg); }
    100% { transform: rotateY(-30deg); }
  }

  @keyframes chairSwingShadow {
    0%   { transform: scaleX(0.8) translateX(-12px); opacity: 0.3; }
    50%  { transform: scaleX(1.1) translateX(12px); opacity: 0.5; }
    100% { transform: scaleX(0.8) translateX(-12px); opacity: 0.3; }
  }

  @keyframes mascotTap {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.08); }
    70%  { transform: scale(0.96); }
    100% { transform: scale(1); }
  }

  .mascot-scene {
    perspective: 800px;
    perspective-origin: center bottom;
    display: inline-block;
  }

  .mascot-swing {
    animation: chairSwing 4s ease-in-out infinite;
    transform-origin: bottom center;
    transform-style: preserve-3d;
    display: block;
    filter: drop-shadow(0px 24px 32px rgba(120, 80, 220, 0.35));
    transition: filter 0.2s;
  }

  .mascot-swing.paused {
    animation-play-state: paused;
  }

  .mascot-swing.tap-feedback {
    animation: mascotTap 0.4s ease-out forwards;
    filter: drop-shadow(0px 28px 40px rgba(142, 80, 255, 0.6));
  }

  .mascot-shadow {
    height: 18px;
    background: radial-gradient(ellipse, rgba(80,40,160,0.45) 0%, transparent 70%);
    border-radius: 50%;
    margin: 0 auto;
    margin-top: -8px;
    animation: chairSwingShadow 4s ease-in-out infinite;
    transform-origin: center;
  }

  .mascot-shadow.paused {
    animation-play-state: paused;
  }

  /* Only pause on hover for non-touch devices */
  @media (hover: hover) {
    .mascot-scene:hover .mascot-swing:not(.tap-feedback),
    .mascot-scene:hover .mascot-shadow {
      animation-play-state: paused;
    }
  }
`;

export default function MascotSwing({
  src = "/mascot_sitting_salon_chair.png",
  width = 400,
  alt = "Hey Style Mascot on chair",
}) {
  const imgRef = useRef(null);
  const shadowRef = useRef(null);
  const restartTimer = useRef(null);
  const [tapping, setTapping] = useState(false);

  const handleTap = (e) => {
    // Only handle touch (not mouse clicks, which are handled by CSS hover)
    if (e.type === "touchstart") e.preventDefault();

    if (tapping) return;
    setTapping(true);

    const img = imgRef.current;
    const shadow = shadowRef.current;
    if (!img || !shadow) return;

    // Show tap feedback: bounce animation + bright glow
    img.classList.remove("paused");
    img.classList.add("tap-feedback");
    shadow.classList.remove("paused");

    clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => {
      if (img) img.classList.remove("tap-feedback");
      setTapping(false);
    }, 420);
  };

  return (
    <>
      <style>{swingStyles}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div
          className="mascot-scene"
          style={{ width: "100%", maxWidth: width, display: "flex", justifyContent: "center" }}
          onTouchStart={handleTap}
        >
          <img
            ref={imgRef}
            className="mascot-swing"
            src={src}
            alt={alt}
            draggable={false}
            style={{ userSelect: "none", width: "100%", maxWidth: width, height: "auto", cursor: "pointer" }}
          />
        </div>
        <div ref={shadowRef} className="mascot-shadow" style={{ width: "55%", maxWidth: width * 0.55 }} />
      </div>
    </>
  );
}