/** Tilt.tsx — the 3D tilt-on-hover wrapper giving cards their cinematic motion. */
import { useRef, type ReactNode } from "react";

/** 3D perspective tilt with a moving metallic glare. */
export function Tilt({ children, className = "", max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
    if (glare.current) {
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, oklch(0.95 0.08 90 / 0.25), transparent 55%)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    if (glare.current) glare.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
    >
      {children}
      <div ref={glare} className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300" />
    </div>
  );
}
