"""FormatSpec-aligned Word formatting for Free myself."""

from __future__ import annotations

import io
import re
from typing import Any

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, Twips
from docx.text.paragraph import Paragraph


ALIGN_MAP = {
    "left": WD_ALIGN_PARAGRAPH.LEFT,
    "center": WD_ALIGN_PARAGRAPH.CENTER,
    "right": WD_ALIGN_PARAGRAPH.RIGHT,
    "both": WD_ALIGN_PARAGRAPH.JUSTIFY,
}

STYLE_NAME_TO_ROLE = {
    "title": "title",
    "heading 1": "heading1",
    "heading1": "heading1",
    "heading 2": "heading2",
    "heading2": "heading2",
    "heading 3": "heading3",
    "heading3": "heading3",
    "quote": "quote",
    "intense quote": "quote",
    "caption": "caption",
    "normal": "body",
    "body text": "body",
}


def styles_by_role(spec: dict[str, Any]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for s in spec.get("styles") or []:
        role = s.get("role")
        if role:
            out[role] = s
    return out


def guess_role(paragraph: Paragraph, text: str, index: int) -> str:
    name = (paragraph.style.name if paragraph.style else "Normal") or "Normal"
    key = name.strip().lower()
    if key in STYLE_NAME_TO_ROLE:
        return STYLE_NAME_TO_ROLE[key]

    stripped = text.strip()
    if not stripped:
        return "body"
    if index == 0 and len(stripped) < 80:
        return "title"
    if re.match(r"^第[一二三四五六七八九十百千0-9]+[章节部]", stripped):
        return "heading1"
    if re.match(r"^[一二三四五六七八九十]+[、.．]", stripped):
        return "heading2"
    if stripped.startswith("参考文献") or stripped.lower().startswith("reference"):
        return "bibliography"
    if stripped.startswith(">") or stripped.startswith("「"):
        return "quote"
    return "body"


def set_run_font(run, style: dict[str, Any]) -> None:
    font_ascii = style.get("fontAscii") or "Times New Roman"
    font_east = style.get("fontEastAsia") or "宋体"
    size = float(style.get("fontSizePt") or 12)
    run.font.size = Pt(size)
    run.font.bold = bool(style.get("bold", False))
    run.font.italic = bool(style.get("italic", False))
    run.font.name = font_ascii
    r = run._element
    rPr = r.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    rFonts.set(qn("w:ascii"), font_ascii)
    rFonts.set(qn("w:hAnsi"), font_ascii)
    rFonts.set(qn("w:eastAsia"), font_east)
    rFonts.set(qn("w:cs"), font_ascii)


def apply_paragraph_style(paragraph: Paragraph, style: dict[str, Any]) -> None:
    align = style.get("align") or "both"
    paragraph.alignment = ALIGN_MAP.get(align, WD_ALIGN_PARAGRAPH.JUSTIFY)

    pf = paragraph.paragraph_format
    pf.space_before = Pt(float(style.get("spaceBeforePt") or 0))
    pf.space_after = Pt(float(style.get("spaceAfterPt") or 0))

    line = float(style.get("lineSpacing") or 1.5)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = line

    size = float(style.get("fontSizePt") or 12)
    # Approximate Chinese char width ≈ font size in points → twips (~20 twips/pt)
    first_chars = float(style.get("firstLineIndentChars") or 0)
    hanging_chars = float(style.get("hangingIndentChars") or 0)
    char_twips = size * 20
    if hanging_chars > 0:
        pf.first_line_indent = Twips(int(-hanging_chars * char_twips))
        pf.left_indent = Twips(int(hanging_chars * char_twips))
    elif first_chars > 0:
        pf.first_line_indent = Twips(int(first_chars * char_twips))
        pf.left_indent = Twips(0)
    else:
        pf.first_line_indent = Twips(0)

    text = paragraph.text
    if not paragraph.runs and text:
        paragraph.add_run(text)

    for run in paragraph.runs:
        set_run_font(run, style)


def apply_margins(doc: Document, spec: dict[str, Any]) -> None:
    margin = (spec.get("meta") or {}).get("marginCm") or {}
    top = float(margin.get("top", 2.54))
    bottom = float(margin.get("bottom", 2.54))
    left = float(margin.get("left", 3.17))
    right = float(margin.get("right", 3.17))
    for section in doc.sections:
        section.top_margin = Cm(top)
        section.bottom_margin = Cm(bottom)
        section.left_margin = Cm(left)
        section.right_margin = Cm(right)


def format_existing_docx(docx_bytes: bytes, spec: dict[str, Any]) -> bytes:
    doc = Document(io.BytesIO(docx_bytes))
    apply_margins(doc, spec)
    by_role = styles_by_role(spec)
    body_style = by_role.get("body") or {
        "fontEastAsia": "宋体",
        "fontAscii": "Times New Roman",
        "fontSizePt": 12,
        "align": "both",
        "lineSpacing": 1.5,
        "firstLineIndentChars": 2,
    }

    for i, para in enumerate(doc.paragraphs):
        text = para.text or ""
        if not text.strip():
            continue
        role = guess_role(para, text, i)
        style = by_role.get(role) or body_style
        apply_paragraph_style(para, style)

    # tables: apply body style to cell paragraphs
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    if para.text.strip():
                        apply_paragraph_style(para, body_style)

    out = io.BytesIO()
    doc.save(out)
    return out.getvalue()


def _add_styled_paragraph(doc: Document, text: str, style: dict[str, Any]) -> None:
    para = doc.add_paragraph()
    run = para.add_run(text)
    set_run_font(run, style)
    apply_paragraph_style(para, style)


def markdown_to_docx(markdown: str, spec: dict[str, Any]) -> bytes:
    by_role = styles_by_role(spec)
    mapping = spec.get("mdMapping") or {}
    body = by_role.get("body") or {
        "fontEastAsia": "宋体",
        "fontAscii": "Times New Roman",
        "fontSizePt": 12,
        "align": "both",
        "lineSpacing": 1.5,
        "firstLineIndentChars": 2,
    }

    def role_style(role: str) -> dict[str, Any]:
        return by_role.get(role) or body

    doc = Document()
    apply_margins(doc, spec)
    # remove default empty paragraph if present
    if doc.paragraphs and not doc.paragraphs[0].text:
        p = doc.paragraphs[0]._element
        p.getparent().remove(p)

    lines = markdown.replace("\r\n", "\n").split("\n")
    i = 0
    in_code = False
    code_buf: list[str] = []

    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("```"):
            if in_code:
                style = role_style(mapping.get("code") or "code")
                _add_styled_paragraph(doc, "\n".join(code_buf), style)
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(line)
            i += 1
            continue

        if not line.strip():
            i += 1
            continue

        if line.startswith("### "):
            role = mapping.get("h3") or "heading3"
            _add_styled_paragraph(doc, line[4:].strip(), role_style(role))
        elif line.startswith("## "):
            role = mapping.get("h2") or "heading2"
            _add_styled_paragraph(doc, line[3:].strip(), role_style(role))
        elif line.startswith("# "):
            role = mapping.get("h1") or "heading1"
            # first h1 often acts as title if no prior content
            if len(doc.paragraphs) == 0 and "title" in by_role:
                _add_styled_paragraph(doc, line[2:].strip(), role_style("title"))
            else:
                _add_styled_paragraph(doc, line[2:].strip(), role_style(role))
        elif line.startswith("> "):
            role = mapping.get("blockquote") or "quote"
            _add_styled_paragraph(doc, line[2:].strip(), role_style(role))
        else:
            role = mapping.get("paragraph") or "body"
            _add_styled_paragraph(doc, line.strip(), role_style(role))
        i += 1

    if in_code and code_buf:
        _add_styled_paragraph(doc, "\n".join(code_buf), role_style(mapping.get("code") or "code"))

    out = io.BytesIO()
    doc.save(out)
    return out.getvalue()
