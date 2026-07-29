# Free Myself

个人解放站 + **Harness 练兵场**。

对外仓库 = Model + Harness** 的实践作品：对外是 LearntobeMyself 的项目主页，对内是可验证的工作台（Context Passport、Open Loop、Document Studio、Traces）。

仓库：[https://github.com/LearntobeMyself/free-myself](https://github.com/LearntobeMyself/free-myself)

## Quick start

```bash
npm install
npm run dev
npm test
```

- Public site: `/`
- Workbench: `/workbench`
- Harness notes: [`docs/harness.md`](docs/harness.md)

## Product slices

| Area | Why it exists |
|---|---|
| Context Passport | Stop re-explaining yourself to every AI session; export AGENTS.md / Cursor rules; drift-check commands |
| Open Loop | Paste chat → extract *my* commitments with source spans |
| Document Studio | **Your Format Spec** drives Word formatting and Markdown↔Word; same Spec verifies the result |
| Mini Harness | Loop / tools / verify / traces — career practice for harness engineering |

## Document Studio difference

We do **not** compete with “pick a pretty template” formatters.

1. You write requirements (NL or form) → `FormatSpec`
2. System applies styles / converts
3. Verifier checks the **same** Spec
4. Trace shows each harness step

v1 focuses on common Chinese academic/office fields (fonts, size, spacing, margins, heading/body roles). Complex floating layouts and full thesis template packs are explicitly out of scope for now.

## Architecture

```text
Public pages ──► projects grid (WIP detail placeholders)
Workbench   ──► Passport / Open Loop / Docs / Traces
                 └─► src/harness (shared runtime)
```

## Scripts

- `npm run dev` — Next.js dev server
- `npm test` — Vitest unit + eval suites
- `npm run build` — production build
- `npm run lint` — ESLint

## License

Private learning / portfolio project for LearntobeMyself unless otherwise stated.
