# AGENTS.md — Free Myself

This repository is both a product and a **Harness Engineering** training ground.

## Formula

`Agent = Model + Harness`

- Model reasons and proposes tool calls.
- Harness owns context injection, tool execution, loop control, deterministic verification, persistence, and traces.

## Project map

- `src/harness/` — mini agent loop, tool registry, trace store
- `src/lib/github.ts` — live GitHub repos for LearntobeMyself
- `src/lib/format-spec.ts` — user Format Spec language
- `src/lib/document-engine.ts` — Word / Markdown apply + verify
- `src/lib/passport.ts` — Context Passport
- `src/lib/open-loop.ts` — commitment extraction
- `src/app/workbench/` — private workbench UI
- `evals/` — regression fixtures for harness + docs

## Commands

- `npm run dev` — local site
- `npm test` — Vitest (must be green before push)
- `npm run build` — production build
- `npm run lint` — ESLint

## Release cadence (mandatory)

One feature slice = one commit = one push.

1. Implement only that slice
2. `npm test` green (and `npm run build` when UI/routes change)
3. Commit with a focused message (`feat:` / `style:` / `perf:` / `docs:`)
4. `git push origin main`

Do **not** batch unrelated features into one mega-commit.

## Do not commit

- `node_modules/`, `.next/`, `out/`, `coverage/`, `build/`
- `.env*` and any token/secret files (`GITHUB_TOKEN`, API keys)
- `data/**/*.json` and other workbench runtime personal data
- `uploads/`, `tmp/`, user-uploaded document binaries
- OS junk: `.DS_Store`, `Thumbs.db`, `*.pem`

## May commit

- Source under `src/`, `evals/`, `docs/`, `content/` (non-secret config)
- CI workflows, `AGENTS.md`, `.cursor/rules`, empty `data/**/.gitkeep`
- `.env.example` with placeholder keys only (no real secrets)

## GitHub projects + token

- Homepage pulls public repos for `LearntobeMyself` via GitHub REST API.
- Optional local/CI secret: `GITHUB_TOKEN` for private repos / higher rate limits.
- Never write the token into the repo. Use environment variables or hosting secrets only.

## Preferences / constraints

- Deterministic verifiers beat model self-grading.
- Do not ship untested feature points.
- Do not build commodity PDF merge / image compress / generic OCR clones.
- Document Studio is **spec-driven**: user requirements → apply → verify with the same spec.
- Public UI: light, spacious, kimi-inspired — not dark IDE clones.
- Prefer local `data/` for personal content.
