"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "section" | "article" | "li";
};

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`fm-reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

export function SpotlightCard({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
  }

  const cls = `fm-spotlight group ${className}`;

  if (href) {
    return (
      <a
        ref={ref as never}
        href={href}
        className={cls}
        onMouseMove={onMove}
        onMouseLeave={() => {
          ref.current?.style.setProperty("--spot-x", "50%");
          ref.current?.style.setProperty("--spot-y", "40%");
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      ref={ref as never}
      className={cls}
      onMouseMove={onMove}
      onMouseLeave={() => {
        ref.current?.style.setProperty("--spot-x", "50%");
        ref.current?.style.setProperty("--spot-y", "40%");
      }}
    >
      {children}
    </div>
  );
}

/** Soft cursor glow that follows pointer on the hero — calm, not neon. */
export function HeroAtmosphere({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className="fm-hero-atmosphere">
      <div className="fm-hero-orb" aria-hidden />
      <div className="fm-hero-grid" aria-hidden />
      <div className="fm-hero-sheen" aria-hidden />
      {children}
    </div>
  );
}
