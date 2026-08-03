"""FastAPI document formatting service for Free myself."""

from __future__ import annotations

import json
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from formatter import (
    STYLE_CATALOG,
    bytes_to_b64,
    format_existing_docx,
    markdown_to_docx,
)
from ppt_engine import markdown_to_pptx, theme_catalog

app = FastAPI(title="Free myself doc-engine", version="0.3.0")


class MdToDocxBody(BaseModel):
    markdown: str = Field(min_length=1)
    spec: dict[str, Any]


class MdToPptxBody(BaseModel):
    markdown: str = Field(min_length=1)
    spec: dict[str, Any] = Field(default_factory=dict)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/catalog")
def catalog() -> dict[str, Any]:
    return STYLE_CATALOG


@app.post("/v1/format-docx")
async def format_docx(
    file: UploadFile = File(...),
    spec: str = Form(...),
) -> dict[str, Any]:
    try:
        spec_obj = json.loads(spec)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"invalid spec JSON: {e}") from e

    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="only .docx uploads are supported")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="empty file")

    try:
        out, summary = format_existing_docx(raw, spec_obj)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"format failed: {e}") from e

    return {
        "ok": True,
        "docxBase64": bytes_to_b64(out),
        "byteLength": len(out),
        "summary": summary,
    }


@app.post("/v1/md-to-docx")
async def md_to_docx(body: MdToDocxBody) -> dict[str, Any]:
    try:
        out, summary = markdown_to_docx(body.markdown, body.spec)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"convert failed: {e}") from e

    return {
        "ok": True,
        "docxBase64": bytes_to_b64(out),
        "byteLength": len(out),
        "summary": summary,
    }


@app.get("/v1/ppt-themes")
def ppt_themes() -> dict[str, Any]:
    return theme_catalog()


@app.post("/v1/md-to-pptx")
async def md_to_pptx(body: MdToPptxBody) -> dict[str, Any]:
    try:
        out, summary = markdown_to_pptx(body.markdown, body.spec)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"pptx convert failed: {e}") from e

    return {
        "ok": True,
        "pptxBase64": bytes_to_b64(out),
        "byteLength": len(out),
        "summary": summary,
    }
