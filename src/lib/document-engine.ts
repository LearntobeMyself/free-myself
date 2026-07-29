import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  convertMillimetersToTwip,
} from "docx";
import type { FormatSpec, StyleDef, StyleRole } from "./format-spec";
import { roleToWordStyleName, styleByRole } from "./format-spec";
import type { VerifierResult } from "@/harness/types";

export type DocBlock = {
  role: StyleRole;
  text: string;
};

function cmToTwip(cm: number): number {
  return convertMillimetersToTwip(cm * 10);
}

function alignOf(a: StyleDef["align"]) {
  switch (a) {
    case "center":
      return AlignmentType.CENTER;
    case "right":
      return AlignmentType.RIGHT;
    case "both":
      return AlignmentType.BOTH;
    default:
      return AlignmentType.LEFT;
  }
}

function headingLevel(role: StyleRole) {
  if (role === "heading1") return HeadingLevel.HEADING_1;
  if (role === "heading2") return HeadingLevel.HEADING_2;
  if (role === "heading3") return HeadingLevel.HEADING_3;
  if (role === "title") return HeadingLevel.TITLE;
  return undefined;
}

function paragraphFromBlock(block: DocBlock, spec: FormatSpec): Paragraph {
  const style = styleByRole(spec, block.role);
  const indentTwip =
    style.firstLineIndentChars > 0
      ? Math.round(style.fontSizePt * 20 * style.firstLineIndentChars)
      : style.hangingIndentChars > 0
        ? Math.round(style.fontSizePt * 20 * style.hangingIndentChars)
        : 0;

  return new Paragraph({
    style: roleToWordStyleName(block.role),
    heading: headingLevel(block.role),
    alignment: alignOf(style.align),
    spacing: {
      before: Math.round(style.spaceBeforePt * 20),
      after: Math.round(style.spaceAfterPt * 20),
      line: Math.round(style.lineSpacing * 240),
      lineRule: "auto",
    },
    indent:
      style.firstLineIndentChars > 0
        ? { firstLine: indentTwip }
        : style.hangingIndentChars > 0
          ? { left: indentTwip, hanging: indentTwip }
          : undefined,
    children: [
      new TextRun({
        text: block.text,
        bold: style.bold,
        italics: style.italic,
        size: Math.round(style.fontSizePt * 2),
        font: style.fontAscii,
      }),
    ],
  });
}

export async function buildDocxFromBlocks(
  blocks: DocBlock[],
  spec: FormatSpec,
): Promise<Buffer> {
  const m = spec.meta.marginCm;
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: cmToTwip(m.top),
              bottom: cmToTwip(m.bottom),
              left: cmToTwip(m.left),
              right: cmToTwip(m.right),
            },
          },
        },
        children: blocks.map((b) => paragraphFromBlock(b, spec)),
      },
    ],
  });
  const buf = await Packer.toBuffer(doc);
  return Buffer.from(buf);
}

export function inferBlocksFromText(text: string): DocBlock[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [{ role: "body", text: "" }];

  return lines.map((line, i) => {
    if (i === 0 && line.length <= 40) return { role: "title" as const, text: line };
    if (
      /^第[一二三四五六七八九十\d]+[章节篇]/.test(line) ||
      /^[一二三四五六七八九十]+[、．.]/.test(line)
    ) {
      return { role: "heading1", text: line };
    }
    if (/^（[一二三四五六七八九十\d]+）|^\d+(\.\d+)+\s+/.test(line)) {
      return { role: "heading2", text: line };
    }
    if (/^>\s?/.test(line)) return { role: "quote", text: line.replace(/^>\s?/, "") };
    if (/^```/.test(line)) return { role: "code", text: line.replace(/```/g, "") };
    if (/^\[\d+\]/.test(line) || /^参考文献/.test(line)) {
      return { role: "bibliography", text: line };
    }
    return { role: "body", text: line };
  });
}

export function parseMarkdownToBlocks(md: string, spec: FormatSpec): DocBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: DocBlock[] = [];
  let inCode = false;
  let codeBuf: string[] = [];

  const flushCode = () => {
    if (codeBuf.length) {
      blocks.push({ role: spec.mdMapping.code, text: codeBuf.join("\n") });
      codeBuf = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (!line.trim()) continue;
    if (line.startsWith("### ")) {
      blocks.push({ role: spec.mdMapping.h3, text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      blocks.push({ role: spec.mdMapping.h2, text: line.slice(3) });
    } else if (line.startsWith("# ")) {
      blocks.push({ role: spec.mdMapping.h1, text: line.slice(2) });
    } else if (line.startsWith("> ")) {
      blocks.push({ role: spec.mdMapping.blockquote, text: line.slice(2) });
    } else {
      blocks.push({
        role: spec.mdMapping.paragraph,
        text: line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1"),
      });
    }
  }
  flushCode();
  return blocks;
}

export function blocksToMarkdown(blocks: DocBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.role) {
        case "title":
        case "heading1":
          return `# ${b.text}`;
        case "heading2":
          return `## ${b.text}`;
        case "heading3":
          return `### ${b.text}`;
        case "quote":
          return `> ${b.text}`;
        case "code":
          return `\`\`\`\n${b.text}\n\`\`\``;
        default:
          return b.text;
      }
    })
    .join("\n\n");
}

export function structuralNormalize(md: string): string {
  return md
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function structureDiff(a: string, b: string): string[] {
  const na = structuralNormalize(a).split("\n");
  const nb = structuralNormalize(b).split("\n");
  const diffs: string[] = [];
  const max = Math.max(na.length, nb.length);
  for (let i = 0; i < max; i++) {
    if ((na[i] ?? "") !== (nb[i] ?? "")) {
      diffs.push(
        `L${i + 1}: ${JSON.stringify(na[i] ?? "")} ≠ ${JSON.stringify(nb[i] ?? "")}`,
      );
    }
  }
  return diffs;
}

export function verifyBlocksAgainstSpec(
  blocks: DocBlock[],
  spec: FormatSpec,
): VerifierResult {
  const checks: VerifierResult["checks"] = [];

  checks.push({
    id: "has-body-or-content",
    label: "文档含有内容块",
    passed: blocks.length > 0 && blocks.some((b) => b.text.trim().length > 0),
  });

  checks.push({
    id: "margins-defined",
    label: "页边距已定义",
    passed:
      spec.meta.marginCm.top > 0 &&
      spec.meta.marginCm.bottom > 0 &&
      spec.meta.marginCm.left > 0 &&
      spec.meta.marginCm.right > 0,
    detail: JSON.stringify(spec.meta.marginCm),
  });

  const body = styleByRole(spec, "body");
  checks.push({
    id: "body-style",
    label: "正文样式可用",
    passed: body.fontSizePt > 0 && body.lineSpacing > 0,
    detail: `${body.fontEastAsia} ${body.fontSizePt}pt ×${body.lineSpacing}`,
  });

  const rolesUsed = new Set(blocks.map((b) => b.role));
  for (const role of rolesUsed) {
    const s = spec.styles.find((x) => x.role === role);
    checks.push({
      id: `style-${role}`,
      label: `角色 ${role} 有对应样式`,
      passed: Boolean(s),
    });
  }

  checks.push({
    id: "first-line-indent-intent",
    label: "正文首行缩进意图已记录",
    passed: body.firstLineIndentChars >= 0,
    detail: `${body.firstLineIndentChars} 字符`,
  });

  return {
    passed: checks.every((c) => c.passed),
    checks,
  };
}

export async function markdownToDocx(md: string, spec: FormatSpec): Promise<{
  buffer: Buffer;
  blocks: DocBlock[];
  mapping: Array<{ md: string; role: StyleRole; wordStyle: string }>;
}> {
  const blocks = parseMarkdownToBlocks(md, spec);
  const buffer = await buildDocxFromBlocks(blocks, spec);
  const mapping = [
    { md: "#", role: spec.mdMapping.h1, wordStyle: roleToWordStyleName(spec.mdMapping.h1) },
    { md: "##", role: spec.mdMapping.h2, wordStyle: roleToWordStyleName(spec.mdMapping.h2) },
    { md: "###", role: spec.mdMapping.h3, wordStyle: roleToWordStyleName(spec.mdMapping.h3) },
    {
      md: "paragraph",
      role: spec.mdMapping.paragraph,
      wordStyle: roleToWordStyleName(spec.mdMapping.paragraph),
    },
    {
      md: ">",
      role: spec.mdMapping.blockquote,
      wordStyle: roleToWordStyleName(spec.mdMapping.blockquote),
    },
    { md: "```", role: spec.mdMapping.code, wordStyle: roleToWordStyleName(spec.mdMapping.code) },
  ];
  return { buffer, blocks, mapping };
}

export function docxHtmlLikeToBlocks(html: string): DocBlock[] {
  const blocks: DocBlock[] = [];
  const cleaned = html
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h1>/gi, "\n")
    .replace(/<\/h2>/gi, "\n")
    .replace(/<\/h3>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  const parts = cleaned.split(/\n+/);
  for (const part of parts) {
    const text = part.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    if (/<h1/i.test(part)) blocks.push({ role: "heading1", text });
    else if (/<h2/i.test(part)) blocks.push({ role: "heading2", text });
    else if (/<h3/i.test(part)) blocks.push({ role: "heading3", text });
    else if (/<blockquote/i.test(part)) blocks.push({ role: "quote", text });
    else if (/<pre|<code/i.test(part)) blocks.push({ role: "code", text });
    else blocks.push({ role: "body", text });
  }
  return blocks;
}
