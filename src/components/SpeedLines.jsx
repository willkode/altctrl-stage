import { useMemo } from "react";

export default function SpeedLines() {
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const isCyan = Math.random() > 0.35;
      arr.push({
        id: i,
        top: Math.random() * 100,
        width: 40 + Math.random() * 220,
        left: Math.random() * 90,
        opacity: 0.08 + Math.random() * 0.25,
        height: 1 + Math.floor(Math.random() * 3),
        color: isCyan ? "#00f5ff" : Math.random() > 0.5 ? "#ff0080" : "#ff2040",
        blur: Math.random() > 0.6 ? 2 : 0,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((l) => (
        <div
          key={l.id}
          className="absolute rounded-full"
          style={{
            top: `${l.top}%`,
            left: `${l.left}%`,
            width: `${l.width}px`,
            height: `${l.height}px`,
            backgroundColor: l.color,
            opacity: l.opacity,
            filter: l.blur ? `blur(${l.blur}px)` : undefined,
            boxShadow: `0 0 ${6 + l.blur * 2}px ${l.color}`,
            animation: `speedline ${l.duration}s ${l.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes speedline {
          0% { opacity: 0; transform: scaleX(0.3) translateX(-20px); }
          50% { opacity: 1; }
          100% { opacity: 0.1; transform: scaleX(1.1) translateX(10px); }
        }
      `}</style>
    </div>
  );
}