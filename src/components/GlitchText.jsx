import { useState, useEffect } from "react";

export default function GlitchText({ text, className = "", tag: Tag = "span" }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 300);
    };
    const interval = setInterval(trigger, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tag className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {glitching && (
        <>
          <span
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              color: "#00f5ff",
              clipPath: "polygon(0 15%, 100% 15%, 100% 40%, 0 40%)",
              transform: "translate(-2px, 0)",
              opacity: 0.8,
            }}
          >
            {text}
          </span>
          <span
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              color: "#ff0080",
              clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)",
              transform: "translate(2px, 0)",
              opacity: 0.8,
            }}
          >
            {text}
          </span>
        </>
      )}
    </Tag>
  );
}