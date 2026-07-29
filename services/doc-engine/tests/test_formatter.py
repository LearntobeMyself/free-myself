"""Tests for forced visible formatting."""

from __future__ import annotations

import io

from docx import Document
from docx.shared import Pt

from formatter import format_existing_docx, markdown_to_docx

# Deliberately exaggerated so tests catch "no-op" formatting.
LOUD_SPEC = {
    "meta": {
        "name": "夸张测试规范",
        "scene": "test",
        "paper": "A4",
        "marginCm": {"top": 2.0, "bottom": 2.0, "left": 4.0, "right": 2.5},
    },
    "styles": [
        {
            "role": "title",
            "fontEastAsia": "黑体",
            "fontAscii": "Arial",
            "fontSizePt": 22,
            "bold": True,
            "align": "center",
            "lineSpacing": 1.5,
            "firstLineIndentChars": 0,
        },
        {
            "role": "heading1",
            "fontEastAsia": "黑体",
            "fontAscii": "Arial",
            "fontSizePt": 18,
            "bold": True,
            "align": "left",
            "lineSpacing": 1.5,
        },
        {
            "role": "body",
            "fontEastAsia": "楷体",
            "fontAscii": "Arial",
            "fontSizePt": 18,
            "bold": False,
            "align": "both",
            "lineSpacing": 2.0,
            "firstLineIndentChars": 2,
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


def test_format_docx_loud_margins_and_fonts():
    out, summary = format_existing_docx(_sample_docx_bytes(), LOUD_SPEC)
    assert summary["paragraphsStyled"] >= 3
    assert summary["bodySizePt"] == 18

    doc = Document(io.BytesIO(out))
    section = doc.sections[0]
    assert abs(section.left_margin.cm - 4.0) < 0.05

    paras = [p for p in doc.paragraphs if p.text.strip()]
    assert paras[0].runs
    assert paras[0].runs[0].font.size == Pt(22)
    assert paras[0].runs[0].font.bold is True

    body = paras[-1]
    assert body.runs[0].font.size == Pt(18)


def test_md_to_docx_loud_body():
    md = "# 人工智能导论\n\n## 背景\n\n本节讨论排版。\n"
    out, summary = markdown_to_docx(md, LOUD_SPEC)
    assert summary["paragraphsStyled"] >= 2
    doc = Document(io.BytesIO(out))
    assert abs(doc.sections[0].left_margin.cm - 4.0) < 0.05
    texts = [p.text for p in doc.paragraphs if p.text.strip()]
    assert "人工智能导论" in texts[0]
