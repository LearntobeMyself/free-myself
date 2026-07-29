# Free myself · Python 排版引擎

本机服务：按 FormatSpec 改已有 Word，或把 Markdown 转成 Word。

## 启动

```bash
cd services/doc-engine
python -m venv .venv

# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8765

# macOS / Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8765
```

健康检查：`GET http://127.0.0.1:8765/health`

Next.js 通过环境变量 `DOC_ENGINE_URL`（默认 `http://127.0.0.1:8765`）转发请求。

## 接口

- `POST /v1/format-docx` — multipart：`file`（.docx）+ `spec`（JSON 字符串）
- `POST /v1/md-to-docx` — JSON：`{ "markdown": "...", "spec": { ... } }`

## 测试

```bash
cd services/doc-engine
pytest -q
```
