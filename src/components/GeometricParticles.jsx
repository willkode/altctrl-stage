import { useMemo } from "react";

const shapes = ["circle", "square", "x", "bar"];

function Particle({ shape, x, y, size, color, opacity }) {
  if (shape === "circle") return (
    <div className="absolute rounded-full border" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, borderColor: color, opacity }} />
  );
  if (shape === "square") return (
    <div className="absolute border" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, borderColor: color, opacity }} />
  );
  if (shape === "x") return (
    <div className="absolute font-bold select-none" style={{ left: `${x}%`, top: `${y}%`, color, opacity, fontSize: size * 1.2, lineHeight: 1 }}>×</div>
  );
  if (shape === "bar") return (
    <div className="absolute rounded-sm" style={{ left: `${x}%`, top: `${y}%`, width: size * 3, height: 2, backgroundColor: color, opacity }} />
  );
  return null;
}

export default function GeometricParticles() {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 28; i++) {
      const colorRoll = Math.random();
      arr.push({
        id: i,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        x: 2 + Math.random() * 96,
        y: 2 + Math.random() * 96,
        size: 6 + Math.floor(Math.random() * 10),
        color: colorRoll > 0.6 ? "#00f5ff" : colorRoll > 0.3 ? "#ff0080" : "#ff2040",
        opacity: 0.15 + Math.random() * 0.35,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => <Particle key={p.id} {...p} />)}
    </div>
  );
}