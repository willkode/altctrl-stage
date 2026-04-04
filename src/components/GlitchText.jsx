import { useState, useEffect, useRef } from "react";

export default function GlitchText({ text, className = "", tag: Tag = "span", style }) {
  const [glitching, setGlitching] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timeout;
    const schedule = () => {
      timeout = setTimeout(() => {
        // Run a burst of 3-5 rapid glitch frames
        const bursts = Math.floor(Math.random() * 3) + 3;
        let i = 0;
        const burst = setInterval(() => {
          setGlitching(true);
          setPhase(Math.random());
          setTimeout(() => setGlitching(false), 80 + Math.random() * 60);
          i++;
          if (i >= bursts) {
            clearInterval(burst);
            schedule();
          }
        }, 120);
      }, 2000 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  const cyan = { color: "#00f5ff" };
  const pink = { color: "#ff0080" };

  // Random clip slices based on phase
  const slice1Top = Math.floor(phase * 60) + 5;
  const slice1Bot = slice1Top + Math.floor(phase * 20) + 8;
  const slice2Top = Math.floor((1 - phase) * 50) + 45;
  const slice2Bot = slice2Top + Math.floor(phase * 15) + 6;
  const shiftX1 = (phase > 0.5 ? 1 : -1) * (Math.floor(phase * 6) + 2);
  const shiftX2 = (phase > 0.5 ? -1 : 1) * (Math.floor(phase * 8) + 3);

  return (
    <Tag className={`relative ${className}`} style={style}>
      {text}
      {glitching && (
        <>
          <span aria-hidden className="absolute inset-0 pointer-events-none select-none" style={{
            ...cyan,
            clipPath: `polygon(0 ${slice1Top}%, 100% ${slice1Top}%, 100% ${slice1Bot}%, 0 ${slice1Bot}%)`,
            transform: `translate(${shiftX1}px, 0)`,
            opacity: 0.9,
          }}>{text}</span>
          <span aria-hidden className="absolute inset-0 pointer-events-none select-none" style={{
            ...pink,
            clipPath: `polygon(0 ${slice2Top}%, 100% ${slice2Top}%, 100% ${slice2Bot}%, 0 ${slice2Bot}%)`,
            transform: `translate(${shiftX2}px, 0)`,
            opacity: 0.85,
          }}>{text}</span>
          <span aria-hidden className="absolute inset-0 pointer-events-none select-none" style={{
            color: "#fff",
            clipPath: `polygon(0 ${Math.floor(phase * 40) + 30}%, 100% ${Math.floor(phase * 40) + 30}%, 100% ${Math.floor(phase * 40) + 34}%, 0 ${Math.floor(phase * 40) + 34}%)`,
            transform: `translate(${-shiftX1 * 2}px, 0)`,
            opacity: 0.6,
            filter: "blur(0.5px)",
          }}>{text}</span>
        </>
      )}
    </Tag>
  );
}