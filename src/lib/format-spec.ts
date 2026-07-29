import { z } from "zod";

export const StyleRoleSchema = z.enum([
  "title",
  "heading1",
  "heading2",
  "heading3",
  "body",
  "quote",
  "code",
  "caption",
  "bibliography",
  "footer",
]);

export type StyleRole = z.infer<typeof StyleRoleSchema>;

export const StyleDefSchema = z.object({
  role: StyleRoleSchema,
  fontEastAsia: z.string().default("宋体"),
  fontAscii: z.string().default("Times New Roman"),
  fontSizePt: z.number().positive().default(12),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  align: z.enum(["left", "center", "right", "both"]).default("both"),
  lineSpacing: z.number().positive().default(1.5),
  spaceBeforePt: z.number().min(0).default(0),
  spaceAfterPt: z.number().min(0).default(0),
  firstLineIndentChars: z.number().min(0).default(0),
  hangingIndentChars: z.number().min(0).default(0),
  outlineLevel: z.number().int().min(0).max(9).optional(),
});

export type StyleDef = z.infer<typeof StyleDefSchema>;

export const FormatSpecSchema = z.object({
  id: z.string().optional(),
  meta: z.object({
    name: z.string().min(1),
    scene: z.string().default("general"),
    paper: z.enum(["A4"]).default("A4"),
    marginCm: z
      .object({
        top: z.number().positive().default(2.54),
        bottom: z.number().positive().default(2.54),
        left: z.number().positive().default(3.17),
        right: z.number().positive().default(3.17),
      })
      .default({ top: 2.54, bottom: 2.54, left: 3.17, right: 3.17 }),
  }),
  styles: z.array(StyleDefSchema).min(1),
  numbering: z
    .object({
      enabled: z.boolean().default(false),
      formatHint: z.string().optional(),
    })
    .default({ enabled: false }),
  mdMapping: z
    .object({
      h1: StyleRoleSchema.default("heading1"),
      h2: StyleRoleSchema.default("heading2"),
      h3: StyleRoleSchema.default("heading3"),
      paragraph: StyleRoleSchema.default("body"),
      blockquote: StyleRoleSchema.default("quote"),
      code: StyleRoleSchema.default("code"),
    })
    .default({
      h1: "heading1",
      h2: "heading2",
      h3: "heading3",
      paragraph: "body",
      blockquote: "quote",
      code: "code",
    }),
  warnings: z.array(z.string()).default([]),
});

export type FormatSpec = z.infer<typeof FormatSpecSchema>;

export function defaultCourseReportSpec(name = "课程报告规范"): FormatSpec {
  return FormatSpecSchema.parse({
    meta: {
      name,
      scene: "course-report",
      paper: "A4",
      marginCm: { top: 2.54, bottom: 2.54, left: 3.17, right: 3.17 },
    },
    styles: [
      {
        role: "title",
        fontEastAsia: "黑体",
        fontAscii: "Times New Roman",
        fontSizePt: 16,
        bold: true,
        align: "center",
        lineSpacing: 1.5,
        firstLineIndentChars: 0,
      },
      {
        role: "heading1",
        fontEastAsia: "黑体",
        fontAscii: "Times New Roman",
        fontSizePt: 14,
        bold: true,
        align: "left",
        lineSpacing: 1.5,
        spaceBeforePt: 12,
        spaceAfterPt: 6,
        outlineLevel: 1,
      },
      {
        role: "heading2",
        fontEastAsia: "黑体",
        fontAscii: "Times New Roman",
        fontSizePt: 12,
        bold: true,
        align: "left",
        lineSpacing: 1.5,
        spaceBeforePt: 8,
        spaceAfterPt: 4,
        outlineLevel: 2,
      },
      {
        role: "heading3",
        fontEastAsia: "楷体",
        fontAscii: "Times New Roman",
        fontSizePt: 12,
        bold: true,
        align: "left",
        lineSpacing: 1.5,
        outlineLevel: 3,
      },
      {
        role: "body",
        fontEastAsia: "宋体",
        fontAscii: "Times New Roman",
        fontSizePt: 12,
        align: "both",
        lineSpacing: 1.5,
        firstLineIndentChars: 2,
      },
      {
        role: "quote",
        fontEastAsia: "楷体",
        fontAscii: "Times New Roman",
        fontSizePt: 12,
        italic: true,
        align: "both",
        lineSpacing: 1.5,
        firstLineIndentChars: 2,
      },
      {
        role: "code",
        fontEastAsia: "宋体",
        fontAscii: "Consolas",
        fontSizePt: 10,
        align: "left",
        lineSpacing: 1.15,
      },
      {
        role: "bibliography",
        fontEastAsia: "宋体",
        fontAscii: "Times New Roman",
        fontSizePt: 10.5,
        align: "both",
        lineSpacing: 1.5,
        hangingIndentChars: 2,
      },
      {
        role: "caption",
        fontEastAsia: "宋体",
        fontAscii: "Times New Roman",
        fontSizePt: 10.5,
        align: "center",
        lineSpacing: 1.5,
      },
      {
        role: "footer",
        fontEastAsia: "宋体",
        fontAscii: "Times New Roman",
        fontSizePt: 9,
        align: "center",
        lineSpacing: 1,
      },
    ],
    numbering: { enabled: false },
    warnings: [
      "v1 不保证复杂页眉域、浮动图文框、修订痕迹",
      "目录域与公式需后续迭代",
    ],
  });
}

const CN_SIZE: Record<string, number> = {
  初号: 42,
  小初: 36,
  一号: 26,
  小一: 24,
  二号: 22,
  小二: 18,
  三号: 16,
  小三: 15,
  四号: 14,
  小四: 12,
  五号: 10.5,
  小五: 9,
};

function pickSize(text: string, fallback: number): number {
  for (const [k, v] of Object.entries(CN_SIZE)) {
    if (text.includes(k)) return v;
  }
  const pt = text.match(/(\d+(?:\.\d+)?)\s*pt/i);
  if (pt) return Number(pt[1]);
  return fallback;
}

function pickAlign(text: string): StyleDef["align"] {
  if (text.includes("居中") || /center/i.test(text)) return "center";
  if (text.includes("右对齐")) return "right";
  if (text.includes("左对齐")) return "left";
  return "both";
}

/** Heuristic NL → FormatSpec (no model required). */
export function ingestSpecFromNaturalLanguage(text: string, name?: string): FormatSpec {
  const base = defaultCourseReportSpec(name ?? "自然语言规范");
  const lower = text;

  const margin = lower.match(/页边距[^0-9]*([0-9.]+)[^0-9]+([0-9.]+)/);
  if (margin) {
    const a = Number(margin[1]);
    const b = Number(margin[2]);
    base.meta.marginCm = { top: a, bottom: a, left: b, right: b };
  }
  const margin4 = lower.match(
    /上下\s*([0-9.]+).*?左右\s*([0-9.]+)/,
  );
  if (margin4) {
    const tb = Number(margin4[1]);
    const lr = Number(margin4[2]);
    base.meta.marginCm = { top: tb, bottom: tb, left: lr, right: lr };
  }

  const titleChunk = lower.match(/标题[^。；;\n]{0,40}/)?.[0] ?? "";
  const bodyChunk = lower.match(/正文[^。；;\n]{0,60}/)?.[0] ?? "";
  const h1Chunk = lower.match(/(一级标题|标题一)[^。；;\n]{0,40}/)?.[0] ?? "";

  const patch = (role: StyleRole, chunk: string, defaults: Partial<StyleDef>) => {
    const idx = base.styles.findIndex((s) => s.role === role);
    if (idx < 0) return;
    const cur = base.styles[idx];
    base.styles[idx] = {
      ...cur,
      ...defaults,
      fontSizePt: chunk ? pickSize(chunk, cur.fontSizePt) : cur.fontSizePt,
      align: chunk ? pickAlign(chunk) : cur.align,
      bold: chunk.includes("加粗") || chunk.includes("黑体") ? true : cur.bold,
      fontEastAsia: chunk.includes("黑体")
        ? "黑体"
        : chunk.includes("楷体")
          ? "楷体"
          : chunk.includes("宋体")
            ? "宋体"
            : cur.fontEastAsia,
      lineSpacing: /1\.5|一点五|1点5/.test(chunk) ? 1.5 : cur.lineSpacing,
      firstLineIndentChars: /首行缩进\s*两|首行缩进\s*2|缩进两字符/.test(chunk)
        ? 2
        : cur.firstLineIndentChars,
      hangingIndentChars: /悬挂缩进/.test(chunk) ? 2 : cur.hangingIndentChars,
    };
  };

  patch("title", titleChunk, {});
  patch("heading1", h1Chunk || titleChunk, {});
  patch("body", bodyChunk, {});
  if (/参考文献/.test(lower) && /悬挂/.test(lower)) {
    patch("bibliography", "参考文献悬挂缩进", {});
  }

  base.meta.name = name ?? "自然语言规范";
  base.warnings = [
    ...base.warnings,
    "由启发式解析自然语言生成，请在表单中确认关键字段",
  ];

  return normalizeSpec(base);
}

export function normalizeSpec(input: unknown): FormatSpec {
  const parsed = FormatSpecSchema.parse(input);
  const roles = new Set(parsed.styles.map((s) => s.role));
  if (!roles.has("body")) {
    parsed.styles.push({
      role: "body",
      fontEastAsia: "宋体",
      fontAscii: "Times New Roman",
      fontSizePt: 12,
      bold: false,
      italic: false,
      align: "both",
      lineSpacing: 1.5,
      spaceBeforePt: 0,
      spaceAfterPt: 0,
      firstLineIndentChars: 2,
      hangingIndentChars: 0,
    });
  }
  // Deduplicate by role (last wins)
  const map = new Map<StyleRole, StyleDef>();
  for (const s of parsed.styles) map.set(s.role, s);
  parsed.styles = [...map.values()];
  return parsed;
}

export function validateSpec(spec: FormatSpec): {
  ok: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [...spec.warnings];
  if (!spec.styles.some((s) => s.role === "body")) {
    errors.push("缺少 body 样式");
  }
  for (const s of spec.styles) {
    if (s.fontSizePt < 8 || s.fontSizePt > 72) {
      errors.push(`${s.role} 字号不合理: ${s.fontSizePt}`);
    }
    if (!s.fontEastAsia) warnings.push(`${s.role} 未指定中文字体`);
  }
  const m = spec.meta.marginCm;
  if (m.left + m.right >= 20) errors.push("左右页边距过大");
  return { ok: errors.length === 0, errors, warnings };
}

export function styleByRole(spec: FormatSpec, role: StyleRole): StyleDef {
  return (
    spec.styles.find((s) => s.role === role) ??
    spec.styles.find((s) => s.role === "body")!
  );
}

export function roleToWordStyleName(role: StyleRole): string {
  switch (role) {
    case "title":
      return "Title";
    case "heading1":
      return "Heading 1";
    case "heading2":
      return "Heading 2";
    case "heading3":
      return "Heading 3";
    case "quote":
      return "Quote";
    case "code":
      return "Code";
    case "bibliography":
      return "Bibliography";
    case "caption":
      return "Caption";
    case "footer":
      return "Footer";
    default:
      return "Normal";
  }
}
