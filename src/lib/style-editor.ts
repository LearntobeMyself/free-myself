import type { CSSProperties } from "react";
import {
  defaultCourseReportSpec,
  type FormatSpec,
  type StyleDef,
  type StyleRole,
} from "@/lib/format-spec";

export const EDIT_ROLES: StyleRole[] = [
  "title",
  "heading1",
  "heading2",
  "heading3",
  "body",
];

export const ROLE_LABELS: Record<string, string> = {
  title: "标题",
  heading1: "一级标题 H1",
  heading2: "二级标题 H2",
  heading3: "三级标题 H3",
  body: "正文",
};

export const FONT_EAST = ["黑体", "宋体", "楷体", "仿宋", "微软雅黑"] as const;
export const FONT_ASCII = ["Times New Roman", "Arial", "Calibri"] as const;

/** Preset with clear visual differences (still course-report-ish). */
export function visibleCourseReportSpec(): FormatSpec {
  const base = defaultCourseReportSpec("课程报告（可视）");
  return {
    ...base,
    meta: {
      ...base.meta,
      name: "课程报告（可视）",
      marginCm: { top: 2.54, bottom: 2.54, left: 3.17, right: 3.17 },
    },
    styles: base.styles.map((s) => {
      if (s.role === "title") {
        return { ...s, fontEastAsia: "黑体", fontSizePt: 18, bold: true, align: "center" };
      }
      if (s.role === "heading1") {
        return { ...s, fontEastAsia: "黑体", fontSizePt: 16, bold: true };
      }
      if (s.role === "heading2") {
        return { ...s, fontEastAsia: "黑体", fontSizePt: 14, bold: true };
      }
      if (s.role === "body") {
        return {
          ...s,
          fontEastAsia: "宋体",
          fontSizePt: 12,
          lineSpacing: 1.5,
          firstLineIndentChars: 2,
          align: "both",
        };
      }
      return s;
    }),
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
