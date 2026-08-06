import type { LearnTrackSlug } from "@/lib/learn-progress";

export type MedalVisualTier = "seed" | "bronze" | "silver" | "gold" | "mythic";

const TIER_COLORS: Record<
  MedalVisualTier,
  { rim: string; rimHi: string; enamel: string; enamelDeep: string; glow: string }
> = {
  seed: {
    rim: "#8a9aa6",
    rimHi: "#c5d0d8",
    enamel: "#3d7a74",
    enamelDeep: "#1a5f59",
    glow: "rgba(26,95,89,0.2)",
  },
  bronze: {
    rim: "#a67c52",
    rimHi: "#e2c19a",
    enamel: "#2f7d4a",
    enamelDeep: "#1f5c38",
    glow: "rgba(166,124,82,0.28)",
  },
  silver: {
    rim: "#7d8b98",
    rimHi: "#e8eef3",
    enamel: "#1a5f59",
    enamelDeep: "#0f3f3b",
    glow: "rgba(125,139,152,0.3)",
  },
  gold: {
    rim: "#b8892d",
    rimHi: "#f0d78c",
    enamel: "#145a54",
    enamelDeep: "#0b3a36",
    glow: "rgba(184,137,45,0.35)",
  },
  mythic: {
    rim: "#c4a35a",
    rimHi: "#fff1c4",
    enamel: "#0e4a45",
    enamelDeep: "#072e2b",
    glow: "rgba(26,95,89,0.4)",
  },
};

export function tierForRank(rank: number): MedalVisualTier {
  if (rank >= 28) return "mythic";
  if (rank >= 14) return "gold";
  if (rank >= 7) return "silver";
  if (rank >= 3) return "bronze";
  return "seed";
}

type IconKind =
  | "spark"
  | "flame3"
  | "wreath7"
  | "loop"
  | "anvil"
  | "walker"
  | "moon"
  | "forge"
  | "ice"
  | "slash3"
  | "week"
  | "sense"
  | "knight"
  | "blade"
  | "storm"
  | "century";

const ICON_BY_ID: Record<string, IconKind> = {
  "h-first": "spark",
  "h-streak3": "flame3",
  "h-week": "wreath7",
  "h-total7": "loop",
  "h-streak14": "anvil",
  "h-total21": "walker",
  "h-total30": "moon",
  "h-streak30": "forge",
  "l-first": "ice",
  "l-streak3": "slash3",
  "l-week": "week",
  "l-total15": "sense",
  "l-streak14": "knight",
  "l-total30": "blade",
  "l-streak30": "storm",
  "l-total100": "century",
};

function CenterIcon({ kind, light }: { kind: IconKind; light: string }) {
  switch (kind) {
    case "spark":
      return (
        <g stroke={light} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M36 22v28M22 36h28M26 26l20 20M46 26L26 46" />
        </g>
      );
    case "flame3":
      return (
        <path
          d="M36 50c8-6 10-14 8-22 0 6-4 8-4 8 4-12 0-20-4-26-6 8-10 16-10 24 0 10 4 14 10 16z"
          fill={light}
          opacity="0.95"
        />
      );
    case "wreath7":
      return (
        <g fill="none" stroke={light} strokeWidth="2">
          <circle cx="36" cy="36" r="12" />
          <path d="M24 40c2 6 6 10 12 12 6-2 10-6 12-12" />
          <path d="M30 28l6-6 6 6" />
        </g>
      );
    case "loop":
      return (
        <g fill="none" stroke={light} strokeWidth="2.4" strokeLinecap="round">
          <path d="M24 36c0-7 6-12 12-12s12 5 12 12-6 12-12 12c-4 0-7-2-9-4" />
          <path d="M22 40l5-1 1 5" />
        </g>
      );
    case "anvil":
      return (
        <g fill={light}>
          <rect x="22" y="40" width="28" height="6" rx="1" />
          <path d="M26 40V30h20v10" />
          <rect x="30" y="22" width="12" height="8" rx="1" />
        </g>
      );
    case "walker":
      return (
        <g fill="none" stroke={light} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="36" cy="24" r="4" />
          <path d="M36 28v12M36 40l-8 10M36 40l8 10M28 34h16" />
        </g>
      );
    case "moon":
      return (
        <path
          d="M40 22a14 14 0 1 0 10 20 16 16 0 0 1-10-20z"
          fill={light}
        />
      );
    case "forge":
      return (
        <g fill="none" stroke={light} strokeWidth="2.2" strokeLinecap="round">
          <path d="M20 48h32" />
          <path d="M28 48V34l8-10 8 10v14" />
          <path d="M32 28h8" />
        </g>
      );
    case "ice":
      return (
        <g stroke={light} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M36 20v32M24 28l24 16M48 28L24 44" />
        </g>
      );
    case "slash3":
      return (
        <g stroke={light} strokeWidth="2.6" strokeLinecap="round">
          <path d="M24 48L40 22" />
          <path d="M30 50L46 24" opacity="0.7" />
          <path d="M18 46L34 20" opacity="0.45" />
        </g>
      );
    case "week":
      return (
        <g fill="none" stroke={light} strokeWidth="2">
          <rect x="22" y="24" width="28" height="24" rx="3" />
          <path d="M22 32h28M30 24v8M42 24v8" />
          <circle cx="32" cy="40" r="2" fill={light} stroke="none" />
          <circle cx="40" cy="40" r="2" fill={light} stroke="none" />
        </g>
      );
    case "sense":
      return (
        <g fill="none" stroke={light} strokeWidth="2.2">
          <circle cx="36" cy="36" r="10" />
          <circle cx="36" cy="36" r="3" fill={light} stroke="none" />
          <path d="M36 20v4M36 48v4M20 36h4M48 36h4" strokeLinecap="round" />
        </g>
      );
    case "knight":
      return (
        <g fill={light}>
          <path d="M36 20l12 8v10c0 8-6 14-12 16-6-2-12-8-12-16V28z" opacity="0.9" />
          <path d="M30 34h12v4H30z" fill="#0b3a36" />
        </g>
      );
    case "blade":
      return (
        <g fill="none" stroke={light} strokeWidth="2.2" strokeLinecap="round">
          <path d="M26 46L46 22" />
          <path d="M24 40l6 6" />
          <path d="M40 24l6 2-2 6" />
        </g>
      );
    case "storm":
      return (
        <path
          d="M40 20L28 36h8l-4 16 16-20h-8l8-12z"
          fill={light}
        />
      );
    case "century":
      return (
        <g fill="none" stroke={light} strokeWidth="2.2">
          <circle cx="36" cy="36" r="14" />
          <path
            d="M30 40c2 4 6 6 10 4 3-1 5-4 5-8 0-5-4-8-9-8"
            strokeLinecap="round"
          />
        </g>
      );
    default:
      return <circle cx="36" cy="36" r="8" fill={light} />;
  }
}

export function LearnMedalArt({
  medalId,
  rank,
  earned,
  track,
  size = 88,
  title,
}: {
  medalId: string;
  rank: number;
  earned: boolean;
  track: LearnTrackSlug;
  size?: number;
  title: string;
}) {
  const tier = tierForRank(rank);
  const c = TIER_COLORS[tier];
  const icon = ICON_BY_ID[medalId] ?? (track === "harness" ? "loop" : "blade");
  const uid = medalId.replace(/[^a-z0-9-]/gi, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-label={title}
      className={earned ? "fm-medal-art" : "fm-medal-art fm-medal-art-locked"}
    >
      <defs>
        <radialGradient id={`enamel-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={c.enamel} />
          <stop offset="100%" stopColor={c.enamelDeep} />
        </radialGradient>
        <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.rimHi} />
          <stop offset="45%" stopColor={c.rim} />
          <stop offset="100%" stopColor={c.rimHi} />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={c.glow} />
        </filter>
      </defs>

      {/* ribbon */}
      <path
        d="M26 48 L22 66 L36 58 L50 66 L46 48"
        fill={earned ? c.enamelDeep : "#9aa3ad"}
        opacity={earned ? 0.9 : 0.35}
      />

      <g filter={earned ? `url(#glow-${uid})` : undefined} opacity={earned ? 1 : 0.38}>
        <circle cx="36" cy="34" r="24" fill={`url(#rim-${uid})`} />
        <circle cx="36" cy="34" r="19" fill={`url(#enamel-${uid})`} />
        <circle
          cx="36"
          cy="34"
          r="19"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
        <g transform="translate(0 -2)">
          <CenterIcon kind={icon} light={earned ? "#f4f7f6" : "#d7dee5"} />
        </g>
      </g>

      {!earned ? (
        <g>
          <circle cx="36" cy="34" r="24" fill="rgba(18,23,28,0.18)" />
          <rect
            x="31"
            y="30"
            width="10"
            height="8"
            rx="1.5"
            fill="rgba(255,255,255,0.55)"
          />
          <path
            d="M33 30v-3a3 3 0 0 1 6 0v3"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.8"
          />
        </g>
      ) : null}
    </svg>
  );
}
