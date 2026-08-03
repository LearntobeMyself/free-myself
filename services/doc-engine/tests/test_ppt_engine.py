"""Tests for Markdown → PPTX outline engine."""

from __future__ import annotations

import io

from pptx import Presentation

from ppt_engine import (
    THEMES,
    markdown_to_pptx,
    parse_markdown_outline,
    resolve_theme,
    theme_catalog,
)


SAMPLE = """# 周会汇报

本周工作进展摘要

## 本周进展

- 完成文档工坊排版链路
- 修复页边距校验
- 补充回归测试

## 下周计划

- 上线 PPT 工作室
- 收集使用反馈

## 谢谢
"""


def test_theme_catalog_has_three_themes():
    catalog = theme_catalog()
    assert catalog["aspect"] == "16:9"
    ids = {t["id"] for t in catalog["themes"]}
    assert ids == set(THEMES.keys())
    assert len(ids) == 3


def test_resolve_theme_defaults_and_overrides():
    assert resolve_theme({}).id == "business-light"
    assert resolve_theme({"themeId": "academic-clean"}).id == "academic-clean"
    assert resolve_theme({"themeId": "nope"}).id == "business-light"


def test_parse_markdown_outline_structure():
    plans = parse_markdown_outline(SAMPLE)
    assert plans[0].kind == "cover"
    assert plans[0].title == "周会汇报"
    assert "进展" in plans[0].subtitle
    kinds = [p.kind for p in plans]
    assert "content" in kinds
    assert kinds[-1] == "closing"
    progress = next(p for p in plans if p.title == "本周进展")
    assert len(progress.bullets) == 3


def test_markdown_to_pptx_bytes_and_slide_count():
    raw, summary = markdown_to_pptx(SAMPLE, {"themeId": "minimal-ink"})
    assert raw[:2] == b"PK"
    assert summary["themeId"] == "minimal-ink"
    assert summary["slideCount"] >= 3

    prs = Presentation(io.BytesIO(raw))
    assert len(prs.slides) == summary["slideCount"]
    assert prs.slide_width > prs.slide_height  # 16:9


def test_plain_text_without_headings_still_builds():
    raw, summary = markdown_to_pptx("只是一句话标题\n\n- 要点一\n- 要点二", {})
    assert summary["slideCount"] >= 1
    assert len(raw) > 1000
