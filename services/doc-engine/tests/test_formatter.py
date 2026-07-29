"""Lightweight tests for the Python doc-engine."""

from __future__ import annotations

import io

from docx import Document
from docx.shared import Cm, Pt

from formatter import format_existing_docx, markdown_to_docx


DEFAULT_SPEC = {
    "meta": {
        "name": "课程报告规范",
        "scene": "course-report",
        "paper": "A4",
        "marginCm": {"top": 2.54, "bottom": 2.54, "left": 3.17, "right": 3.17},
    },
    "styles": [
        {
            "role": "title",
            "fontEastAsia": "黑体",
            "fontAscii": "Times New Roman",
            "fontSizePt": 16,
            "bold": True,
            "align": "center",
            "lineSpacing": 1.5,
            "firstLineIndentChars": 0,
        },
        {
            "role": "body",
            "fontEastAsia": "宋体",
            "fontAscii": "Times New Roman",
            "fontSizePt": 12,
            "align": "both",
            "lineSpacing": 1.5,
            "firstLineIndentChars": 2,
        },
        {
            "role": "heading1",
            "fontEastAsia": "黑体",
            "fontAscii": "Times New Roman",
            "fontSizePt": 14,
            "bold": True,
            "align": "left",
            "lineSpacing": 1.5,
        },
    ],
    "mdMapping": {
        "h1": "heading1",
        "h2": "heading2",
        "h3": "heading3",
        "paragraph": "body",
        "blockquote": "quote",
        "code": "code",
    },
}


def _sample_docx_bytes() -> bytes:
    doc = Document()
    doc.add_paragraph("人工智能导论课程报告")
    doc.add_paragraph("第一章 背景")
    doc.add_paragraph("本节讨论大模型与文档排版。")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_format_docx_margins_and_body_font():
    out = format_existing_docx(_sample_docx_bytes(), DEFAULT_SPEC)
    doc = Document(io.BytesIO(out))
    section = doc.sections[0]
    assert abs(section.left_margin.cm - 3.17) < 0.05
    assert abs(section.top_margin.cm - 2.54) < 0.05

    body_paras = [p for p in doc.paragraphs if p.text.strip()]
    assert len(body_paras) >= 2
    # last non-empty should be body-ish with Song / 12pt
    last = body_paras[-1]
    assert last.runs
    assert last.runs[0].font.size == Pt(12)


def test_md_to_docx_produces_paragraphs():
    md = "# 人工智能导论\n\n## 背景\n\n本节讨论排版。\n"
    out = markdown_to_docx(md, DEFAULT_SPEC)
    doc = Document(io.BytesIO(out))
    texts = [p.text for p in doc.paragraphs if p.text.strip()]
    assert "人工智能导论" in texts[0]
    assert any("背景" in t for t in texts)
    assert abs(doc.sections[0].left_margin.cm - 3.17) < 0.05
