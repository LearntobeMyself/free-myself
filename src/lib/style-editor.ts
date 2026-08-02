import type { CSSProperties } from "react";
import {
  DEFAULT_MATCH_RULES,
  MATCH_PRESETS,
  defaultCourseReportSpec,
  type FormatSpec,
  type MatchRule,
  type StyleDef,
  type StyleRole,
  type TableSpec,
} from "@/lib/format-spec";

export const EDIT_ROLES: StyleRole[] = [
  "title",
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "body",
];

export const ROLE_LABELS: Record<string, string> = {
  title: "标题",
  heading1: "一级 H1",
  heading2: "二级 H2",
  heading3: "三级 H3",
  heading4: "四级 H4",
  body: "正文",
  bibliography: "参考文献",
  caption: "图/表题",
};

export const FONT_EAST = ["黑体", "宋体", "楷体", "仿宋", "微软雅黑"] as const;
export const FONT_ASCII = ["Times New Roman", "Arial", "Calibri"] as const;
export const COLOR_PRESETS = ["#000000", "#333333", "#C00000"] as const;

export function visibleCourseReportSpec(): FormatSpec {
  const base = defaultCourseReportSpec("课程报告（可视）");
  return {
    ...base,
    meta: { ...base.meta, name: "课程报告（可视）" },
    styles: base.styles.map((s) => ({ ...s, color: "#000000" })),
    matchRules: [...DEFAULT_MATCH_RULES],
  };
}

export function styleOf(spec: FormatSpec, role: StyleRole): StyleDef {
  const found = spec.styles.find((s) => s.role === role);
  if (found) return found;
  return {
    role,
    fontEastAsia: "宋体",
    fontAscii: "Times New Roman",
    fontSizePt: 12,
    bold: false,
    italic: false,
    color: "#000000",
    align: "both",
    lineSpacing: 1.5,
    spaceBeforePt: 0,
    spaceAfterPt: 0,
    firstLineIndentChars: 0,
    hangingIndentChars: 0,
  };
}

export function patchRole(
  spec: FormatSpec,
  role: StyleRole,
  patch: Partial<StyleDef>,
): FormatSpec {
  const has = spec.styles.some((s) => s.role === role);
  const styles = has
    ? spec.styles.map((s) => (s.role === role ? { ...s, ...patch, role } : s))
    : [...spec.styles, { ...styleOf(spec, role), ...patch, role }];
  return { ...spec, styles };
}

export function patchMargins(
  spec: FormatSpec,
  marginCm: Partial<FormatSpec["meta"]["marginCm"]>,
): FormatSpec {
  return {
    ...spec,
    meta: {
      ...spec.meta,
      marginCm: { ...spec.meta.marginCm, ...marginCm },
    },
  };
}

export function patchTable(spec: FormatSpec, patch: Partial<TableSpec>): FormatSpec {
  return { ...spec, table: { ...spec.table, ...patch } };
}

const PRESET_PATTERNS = new Set(MATCH_PRESETS.map((p) => p.pattern));

export function isCustomMatchRule(rule: MatchRule): boolean {
  return !PRESET_PATTERNS.has(rule.pattern);
}

/** Custom starts-with rules win over presets when patterns overlap. */
export function orderMatchRules(rules: MatchRule[]): MatchRule[] {
  const custom = rules.filter(isCustomMatchRule);
  const presets = rules.filter((r) => !isCustomMatchRule(r));
  return [...custom, ...presets];
}

export function setMatchRules(spec: FormatSpec, rules: MatchRule[]): FormatSpec {
  return { ...spec, matchRules: orderMatchRules(rules) };
}

/** Toggle a preset on/off in matchRules (by underlying pattern). */
export function toggleMatchPreset(spec: FormatSpec, presetId: string, on: boolean): FormatSpec {
  const preset = MATCH_PRESETS.find((p) => p.id === presetId);
  if (!preset) return spec;
  const without = spec.matchRules.filter((r) => r.pattern !== preset.pattern);
  if (!on) return setMatchRules(spec, without);
  const existingRole = spec.matchRules.find((r) => r.pattern === preset.pattern)?.role;
  return setMatchRules(spec, [
    ...without,
    {
      role: existingRole ?? preset.role,
      pattern: preset.pattern,
      flags: "i",
    },
  ]);
}

export function isPresetEnabled(spec: FormatSpec, presetId: string): boolean {
  const preset = MATCH_PRESETS.find((p) => p.id === presetId);
  if (!preset) return false;
  return spec.matchRules.some((r) => r.pattern === preset.pattern);
}

/** Current heading level assigned to a preset (falls back to preset default). */
export function getPresetRole(spec: FormatSpec, presetId: string): StyleRole {
  const preset = MATCH_PRESETS.find((p) => p.id === presetId);
  if (!preset) return "body";
  const found = spec.matchRules.find((r) => r.pattern === preset.pattern);
  return found?.role ?? preset.role;
}

/** Change which heading level a checked preset maps to. */
export function setPresetRole(
  spec: FormatSpec,
  presetId: string,
  role: StyleRole,
): FormatSpec {
  const preset = MATCH_PRESETS.find((p) => p.id === presetId);
  if (!preset) return spec;
  const has = spec.matchRules.some((r) => r.pattern === preset.pattern);
  if (!has) {
    return setMatchRules(spec, [
      ...spec.matchRules,
      { role, pattern: preset.pattern, flags: "i" },
    ]);
  }
  return setMatchRules(
    spec,
    spec.matchRules.map((r) =>
      r.pattern === preset.pattern ? { ...r, role } : r,
    ),
  );
}

/** 「以 xxx 开头」→ 安全转成匹配规则，用户无需写正则 */
export function startsWithRule(role: StyleRole, text: string): MatchRule | null {
  const t = text.trim();
  if (!t) return null;
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { role, pattern: `^${escaped}`, flags: "i" };
}

export function cssFromStyle(style: StyleDef): CSSProperties {
  const align =
    style.align === "both"
      ? "justify"
      : style.align === "center"
        ? "center"
        : style.align === "right"
          ? "right"
          : "left";
  return {
    fontFamily: `"${style.fontEastAsia}", "${style.fontAscii}", serif`,
    fontSize: `${style.fontSizePt}pt`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? "italic" : "normal",
    color: style.color || "#000000",
    textAlign: align,
    lineHeight: style.lineSpacing,
    textIndent:
      style.firstLineIndentChars > 0
        ? `${style.firstLineIndentChars}em`
        : undefined,
    marginTop: style.spaceBeforePt ? `${style.spaceBeforePt}pt` : undefined,
    marginBottom: style.spaceAfterPt ? `${style.spaceAfterPt}pt` : undefined,
  };
}
