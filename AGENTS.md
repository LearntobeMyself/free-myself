# AGENTS.md — Free Myself

This repository is both a product and a **Harness Engineering** training ground.

## Formula

`Agent = Model + Harness`

- Model reasons and proposes tool calls.
- Harness owns context injection, tool execution, loop control, deterministic verification, persistence, and traces.

## Project map

- `src/harness/` — mini agent loop, tool registry, trace store
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

## Preferences / constraints

- Deterministic verifiers beat model self-grading.
- Do not ship untested feature points.
- Do not build commodity PDF merge / image compress / generic OCR clones.
- Document Studio is **spec-driven**: user requirements → apply → verify with the same spec.
- Never commit secrets. Prefer local `data/` for personal content.
- Keep UI restrained (tokenized, minimal glow/glass).

## Done definition for a feature slice

1. Implementation complete
2. `npm test` green
3. Commit with clear message
4. Push to `https://github.com/LearntobeMyself/free-myself.git`
