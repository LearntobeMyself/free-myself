# Harness map — Free Myself

## What we built

A **mini agent harness** that turns workbench jobs into observable loops:

```text
goal → policy decision → tool execute → observe → verify → continue | stop
```

## Layers

| Layer | Code | Responsibility |
|---|---|---|
| Loop | `src/harness/loop.ts` | Step budget, decisions, completion |
| Tools | `src/harness/tools.ts` + `registry.ts` | Schema'd capabilities |
| Trace | `src/harness/trace-store.ts` | Persist runs under `data/traces/` |
| Verify | tool `verify_doc` + `verifyBlocksAgainstSpec` | Maker-checker |
| Context | Passport + Format Spec | What the agent is allowed to know |
| Eval | `evals/*.test.ts` | Prevent silent regressions |

## Document Studio as harness homework

1. `ingest_spec` — NL/JSON → FormatSpec
2. `apply_styles` / `md_to_docx` — deterministic apply
3. `verify_doc` — same Spec as acceptance criteria
4. Repair loop once if verify fails
5. Trace UI for postmortem

## Outer harness (dogfood)

- `AGENTS.md` and `.cursor/rules` guide coding agents working on this repo.
- CI runs lint + test on push/PR.
- Release rule: red tests never push a feature commit.
