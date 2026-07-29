# Free Myself

个人解放站 + **Harness 练兵场**。

对外仓库 = Model + Harness** 的实践作品：对外是 LearntobeMyself 的 GitHub 项目墙，对内是可验证的工作台（Context Passport、Open Loop、Document Studio、Traces）。

仓库：[https://github.com/LearntobeMyself/free-myself](https://github.com/LearntobeMyself/free-myself)

## Quick start

```bash
npm install
npm run dev
npm test
```

Optional (private repos / higher API quota):

```bash
# PowerShell
$env:GITHUB_TOKEN="ghp_xxx"
npm run dev
```

Never commit the token. Copy placeholders only into `.env.example` if needed.

- Public site: `/` (live GitHub repos)
- Workbench: `/workbench`
- Harness notes: [`docs/harness.md`](docs/harness.md)

## Product slices

| Area | Why it exists |
|---|---|
| GitHub Projects | Show *your* real repositories, not fake local cards |
| Context Passport | Stop re-explaining yourself to every AI session; export AGENTS.md / Cursor rules |
| Open Loop | Paste chat → extract *my* commitments with source spans |
| Document Studio | **Your Format Spec** drives Word / Markdown↔Word; same Spec verifies the result |
| Mini Harness | Loop / tools / verify / traces — career practice for harness engineering |

## Release cadence

Feature slice → tests green → single commit → push. See [`AGENTS.md`](AGENTS.md) for the do-not-commit list.

## Document Studio difference

We do **not** compete with “pick a pretty template” formatters.

1. You write requirements (NL or form) → `FormatSpec`
2. System applies styles / converts
3. Verifier checks the **same** Spec
4. Trace shows each harness step

## Architecture

```text
Public pages ──► GitHub API project grid + detail placeholders
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
