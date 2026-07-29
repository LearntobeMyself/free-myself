# Harness map — Free myself

## Product focus

Workbench is **Document Studio only**: upload Word / Markdown → FormatSpec → download Word.
Formatting runs in **`services/doc-engine`** (Python FastAPI + python-docx).

Next.js keeps UI, FormatSpec storage, and a thin proxy (`src/lib/doc-engine-client.ts`).

## Mini harness (still in repo)

```text
goal → policy decision → tool execute → observe → verify → continue | stop
```

| Layer | Code | Responsibility |
|---|---|---|
| Loop | `src/harness/loop.ts` | Step budget, decisions, completion |
| Tools | `src/harness/tools.ts` | Smoke tools + `ingest_spec` |
| Trace | `src/harness/trace-store.ts` | Persist runs under `data/traces/` (optional) |
| Spec | `src/lib/format-spec.ts` | Shared FormatSpec schema |
| Eval | `evals/*.test.ts` | Prevent silent regressions |

## Doc engine

1. Start: `npm run doc-engine` (needs `uvicorn` on PATH / venv activated)
2. `POST /v1/format-docx` — existing Word + spec
3. `POST /v1/md-to-docx` — Markdown + spec
4. Next routes `/api/docs/format` and `/api/docs/convert` forward to it

## Outer harness (dogfood)

- `AGENTS.md` and `.cursor/rules` guide coding agents working on this repo.
- CI runs lint + test on push/PR.
- Release rule: red tests never push a feature commit.
