# Session handoff — initial implementation

## Done
- Scaffolded Next.js app with design tokens and public homepage
- Mini harness: loop, registry, tools, traces, Trace UI
- Context Passport + Open Loop + Document Studio (Format Spec, Word format, MD↔Word)
- Vitest evals green (9), lint + build green
- CI workflow + AGENTS.md + docs/harness.md

## Next
- Optional: mammoth-based real DOCX upload parse path in UI
- Optional: GitHub API live project grid for LearntobeMyself
- Dogfood Passport handoffs while iterating

## Pitfalls
- Folder name has a space; create-next-app needed temp dir rename
- React 19 lint dislikes naive useEffect setState; use async + cancelled flag
