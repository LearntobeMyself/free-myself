# AGENTS.md — Free myself

This repository is both a product and a **Harness Engineering** training ground.

## Formula

`Agent = Model + Harness`

- Model reasons and proposes tool calls.
- Harness owns context injection, tool execution, loop control, deterministic verification, persistence, and traces.

## Project map

- `services/doc-engine/` — **Python** FastAPI + python-docx (Word 改格式 / MD→Word)
- `src/lib/doc-engine-client.ts` — Next.js proxy to the Python service
- `src/lib/format-spec.ts` — Format Spec schema (shared with Python)
- `src/lib/github.ts` — live GitHub repos for LearntobeMyself
- `src/harness/` — mini agent loop (smoke + ingest_spec)
- `src/app/workbench/docs` — Document Studio (Word / MD 排版)
- `src/app/workbench/ppt` — PPT Studio (Markdown 大纲 → 可编辑 .pptx)
- `evals/` — Vitest regressions

## Commands

- `npm run dev` — local site
- `npm run doc-engine` — Python formatter on `:8765` (activate venv first; see `services/doc-engine/README.md`)
- `npm test` — Vitest (must be green before push)
- `npm run build` — production build
- `npm run lint` — ESLint

## Release cadence (mandatory)

One feature slice = one commit = one push to GitHub.

**Standing order:** after a feature slice is done and tests are green, the agent **must** commit and `git push` immediately. Do **not** wait for the user to remind you to upload. Do **not** leave finished work only on the local machine. See also `src/harness/README.md`.

1. Implement only that slice
2. `npm test` green (and `npm run typecheck` / `npm run build` when UI/routes change)
3. Commit with a focused message (`feat:` / `fix:` / `style:` / `perf:` / `docs:`)
4. `git push origin HEAD` (usually `main`) before starting the next slice

Do **not** batch unrelated features into one mega-commit.

## Do not commit

- `node_modules/`, `.next/`, `out/`, `coverage/`, `build/`
- `.env*` and any token/secret files (`GITHUB_TOKEN`, API keys)
- `data/**/*.json` and other workbench runtime personal data
- `uploads/`, `tmp/`, user-uploaded document binaries
- `services/doc-engine/.venv/`
- OS junk: `.DS_Store`, `Thumbs.db`, `*.pem`

## May commit

- Source under `src/`, `services/doc-engine/` (no venv), `evals/`, `docs/`
- CI workflows, `AGENTS.md`, `.cursor/rules`, empty `data/**/.gitkeep`
- `.env.example` with placeholder keys only (no real secrets)

## GitHub projects + token

- Homepage pulls public repos for `LearntobeMyself` via GitHub REST API.
- Optional local/CI secret: `GITHUB_TOKEN` for private repos / higher rate limits.
- Never write the token into the repo. Use environment variables or hosting secrets only.

## Preferences / constraints

- Workbench product focus: Document Studio + PPT Studio (no commodity PDF/OCR clones).
- Document / PPT formatting is Python-first (`python-docx` / `python-pptx`); do not reintroduce Node generators as the main path.
- Do not ship untested feature points.
- Do not build commodity PDF merge / image compress / generic OCR clones.
- Prefer local `data/` for personal content.
