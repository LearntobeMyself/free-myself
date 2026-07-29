"""FormatSpec-aligned Word formatting for Free myself.

Forces visible direct formatting + Word built-in styles so downloads
actually look different from the source.
"""

from __future__ import annotations

import base64
import io
import re
from typing import Any

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, Twips
from docx.text.paragraph import Paragraph

STYLE_CATALOG: dict[str, Any] = {
    "roles": ["title", "heading1", "heading2", "heading3", "body"],
    "fontEastAsia": ["黑体", "宋体", "楷体", "仿宋", "微软雅黑"],
    "fontAscii": ["Times New Roman", "Arial", "Calibri"],
    "align": ["left", "center", "right", "both"],
    "fontSizePt": {"min": 8, "max": 36, "step": 0.5},
    "lineSpacing": {"min": 1.0, "max": 3.0, "step": 0.25},
    "firstLineIndentChars": {"min": 0, "max": 4, "step": 1},
    "marginCm": {"min": 1.0, "max": 5.0, "step": 0.1},
}

ALIGN_MAP = {
    "left": WD_ALIGN_PARAGRAPH.LEFT,
    "center": WD_ALIGN_PARAGRAPH.CENTER,
    "right": WD_ALIGN_PARAGRAPH.RIGHT,
    "both": WD_ALIGN_PARAGRAPH.JUSTIFY,
}

ROLE_TO_WORD_STYLE = {
    "title": "Title",
    "heading1": "Heading 1",
    "heading2": "Heading 2",
    "heading3": "Heading 3",
    "body": "Normal",
    "quote": "Intense Quote",
    "bibliography": "Normal",
    "caption": "Caption",
    "code": "Normal",
    "footer": "Normal",
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
    # Only trust explicit structural styles — not Normal/Body Text
    if key in STYLE_NAME_TO_ROLE and key not in ("normal", "body text"):
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


def _set_rfonts(run, font_ascii: str, font_east: str) -> None:
    run.font.name = font_ascii
    r = run._element
    rPr = r.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    rFonts.set(qn("w:ascii"), font_ascii)
    rFonts.set(qn("w:hAnsi"), font_ascii)
    rFonts.set(qn("w:eastAsia"), font_east)
    rFonts.set(qn("w:cs"), font_ascii)


def set_run_font(run, style: dict[str, Any]) -> None:
    font_ascii = style.get("fontAscii") or "Times New Roman"
    font_east = style.get("fontEastAsia") or "宋体"
    size = float(style.get("fontSizePt") or 12)
    run.font.bold = bool(style.get("bold", False))
    run.font.italic = bool(style.get("italic", False))
    _set_rfonts(run, font_ascii, font_east)
    # Half-points in OOXML — set explicitly so built-in styles cannot hide size
    run.font.size = Pt(size)
    rPr = run._element.get_or_add_rPr()
    for tag in ("w:sz", "w:szCs"):
        existing = rPr.find(qn(tag))
        if existing is not None:
            rPr.remove(existing)
        node = OxmlElement(tag)
        node.set(qn("w:val"), str(int(round(size * 2))))
        rPr.append(node)


def _clear_paragraph_runs(paragraph: Paragraph) -> str:
    text = paragraph.text
    p = paragraph._p
    for child in list(p):
        if child.tag == qn("w:r"):
            p.remove(child)
    return text


def apply_paragraph_style(
    paragraph: Paragraph,
    style: dict[str, Any],
    *,
    role: str,
    doc: Document | None = None,
) -> None:
    """Force visible formatting: rebuild as one run + set Word style."""
    text = _clear_paragraph_runs(paragraph)

    word_style_name = ROLE_TO_WORD_STYLE.get(role, "Normal")
    if doc is not None:
        try:
            paragraph.style = doc.styles[word_style_name]
        except KeyError:
            try:
                paragraph.style = doc.styles["Normal"]
            except KeyError:
                pass

    align = style.get("align") or "both"
    paragraph.alignment = ALIGN_MAP.get(align, WD_ALIGN_PARAGRAPH.JUSTIFY)

    pf = paragraph.paragraph_format
    pf.space_before = Pt(float(style.get("spaceBeforePt") or 0))
    pf.space_after = Pt(float(style.get("spaceAfterPt") or 0))

    line = float(style.get("lineSpacing") or 1.5)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = line

    size = float(style.get("fontSizePt") or 12)
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
        pf.left_indent = Twips(0)

    # Re-clear in case assigning a Word style re-injected runs
    _clear_paragraph_runs(paragraph)
    run = paragraph.add_run(text)
    set_run_font(run, style)


def _patch_style_definition(doc: Document, word_name: str, style: dict[str, Any]) -> None:
    try:
        st = doc.styles[word_name]
    except KeyError:
        return
    if st.type != WD_STYLE_TYPE.PARAGRAPH:
        return
    font = st.font
    font_ascii = style.get("fontAscii") or "Times New Roman"
    font_east = style.get("fontEastAsia") or "宋体"
    font.size = Pt(float(style.get("fontSizePt") or 12))
    font.bold = bool(style.get("bold", False))
    font.italic = bool(style.get("italic", False))
    font.name = font_ascii
    try:
        rPr = st.element.get_or_add_rPr()
        rFonts = rPr.get_or_add_rFonts()
        rFonts.set(qn("w:ascii"), font_ascii)
        rFonts.set(qn("w:hAnsi"), font_ascii)
        rFonts.set(qn("w:eastAsia"), font_east)
    except Exception:  # noqa: BLE001
        pass
    align = style.get("align")
    if align and align in ALIGN_MAP:
        st.paragraph_format.alignment = ALIGN_MAP[align]
    line = float(style.get("lineSpacing") or 0)
    if line:
        st.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
        st.paragraph_format.line_spacing = line


def apply_document_style_defs(doc: Document, by_role: dict[str, dict[str, Any]]) -> None:
    for role, word_name in ROLE_TO_WORD_STYLE.items():
        if role in by_role:
            _patch_style_definition(doc, word_name, by_role[role])


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


def format_existing_docx(
    docx_bytes: bytes, spec: dict[str, Any]
) -> tuple[bytes, dict[str, Any]]:
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
    apply_document_style_defs(doc, by_role)

    role_counts: dict[str, int] = {}
    applied = 0
    for i, para in enumerate(doc.paragraphs):
        text = para.text or ""
        if not text.strip():
            continue
        role = guess_role(para, text, i)
        style = by_role.get(role) or body_style
        apply_paragraph_style(para, style, role=role, doc=doc)
        role_counts[role] = role_counts.get(role, 0) + 1
        applied += 1

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    if para.text.strip():
                        apply_paragraph_style(para, body_style, role="body", doc=doc)
                        applied += 1
                        role_counts["body"] = role_counts.get("body", 0) + 1

    out = io.BytesIO()
    doc.save(out)
    margin = (spec.get("meta") or {}).get("marginCm") or {}
    summary = {
        "paragraphsStyled": applied,
        "rolesUsed": role_counts,
        "marginCm": margin,
        "bodyFont": body_style.get("fontEastAsia"),
        "bodySizePt": body_style.get("fontSizePt"),
    }
    return out.getvalue(), summary


def _add_styled_paragraph(
    doc: Document, text: str, style: dict[str, Any], role: str
) -> None:
    para = doc.add_paragraph()
    word_style_name = ROLE_TO_WORD_STYLE.get(role, "Normal")
    try:
        para.style = doc.styles[word_style_name]
    except KeyError:
        pass

    align = style.get("align") or "both"
    para.alignment = ALIGN_MAP.get(align, WD_ALIGN_PARAGRAPH.JUSTIFY)
    pf = para.paragraph_format
    pf.space_before = Pt(float(style.get("spaceBeforePt") or 0))
    pf.space_after = Pt(float(style.get("spaceAfterPt") or 0))
    line = float(style.get("lineSpacing") or 1.5)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = line
    size = float(style.get("fontSizePt") or 12)
    first_chars = float(style.get("firstLineIndentChars") or 0)
    hanging_chars = float(style.get("hangingIndentChars") or 0)
    char_twips = size * 20
    if hanging_chars > 0:
        pf.first_line_indent = Twips(int(-hanging_chars * char_twips))
        pf.left_indent = Twips(int(hanging_chars * char_twips))
    elif first_chars > 0:
        pf.first_line_indent = Twips(int(first_chars * char_twips))
    else:
        pf.first_line_indent = Twips(0)

    run = para.add_run(text)
    set_run_font(run, style)


def markdown_to_docx(
    markdown: str, spec: dict[str, Any]
) -> tuple[bytes, dict[str, Any]]:
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
    apply_document_style_defs(doc, by_role)
    if doc.paragraphs and not doc.paragraphs[0].text:
        p = doc.paragraphs[0]._element
        p.getparent().remove(p)

    lines = markdown.replace("\r\n", "\n").split("\n")
    i = 0
    in_code = False
    code_buf: list[str] = []
    role_counts: dict[str, int] = {}

    def emit(text: str, role: str) -> None:
        _add_styled_paragraph(doc, text, role_style(role), role)
        role_counts[role] = role_counts.get(role, 0) + 1

    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("```"):
            if in_code:
                emit("\n".join(code_buf), mapping.get("code") or "code")
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
            emit(line[4:].strip(), mapping.get("h3") or "heading3")
        elif line.startswith("## "):
            emit(line[3:].strip(), mapping.get("h2") or "heading2")
        elif line.startswith("# "):
            if len(doc.paragraphs) == 0 and "title" in by_role:
                emit(line[2:].strip(), "title")
            else:
                emit(line[2:].strip(), mapping.get("h1") or "heading1")
        elif line.startswith("> "):
            emit(line[2:].strip(), mapping.get("blockquote") or "quote")
        else:
            emit(line.strip(), mapping.get("paragraph") or "body")
        i += 1

    if in_code and code_buf:
        emit("\n".join(code_buf), mapping.get("code") or "code")

    out = io.BytesIO()
    doc.save(out)
    summary = {
        "paragraphsStyled": sum(role_counts.values()),
        "rolesUsed": role_counts,
        "bodyFont": body.get("fontEastAsia"),
        "bodySizePt": body.get("fontSizePt"),
    }
    return out.getvalue(), summary


def bytes_to_b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")
