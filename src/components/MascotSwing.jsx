import { useEffect, useRef } from "react";

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

  .mascot-scene:hover .mascot-swing,
  .mascot-scene:hover .mascot-shadow {
    animation-play-state: paused;
  }
`;

export default function MascotSwing({
  src = "/mascot_sitting_salon_chair.png",
  width = 400,
  alt = "Hey Style Mascot on chair",
}) {
  return (
    <>
      <style>{swingStyles}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div className="mascot-scene" style={{ width: "100%", maxWidth: width, display: "flex", justifyContent: "center" }}>
          <img
            className="mascot-swing"
            src={src}
            alt={alt}
            draggable={false}
            style={{ userSelect: "none", width: "100%", maxWidth: width, height: "auto" }}
          />
        </div>
        <div className="mascot-shadow" style={{ width: "55%", maxWidth: width * 0.55 }} />
      </div>
    </>
  );
}