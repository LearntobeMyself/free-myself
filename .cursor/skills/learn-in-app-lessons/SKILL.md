---
name: learn-in-app-lessons
description: >-
  Convert Free Myself Harness / LeetCode curriculum from GitHub blob links into
  in-app lesson pages with styled markdown and interactive checkpoints. Use when
  the user asks to batch-fix learn docs, open day plans in-app (not GitHub),
  add 检查点 checkboxes, or wire /learn/harness and /learn/leetcode articles.
---

# Learn in-app lessons (Harness + LeetCode)

## Goal

Curriculum clicks must open **站内课文** (`/learn/{track}/{slug}`), never GitHub blob URLs. Markdown lives under `docs/learn/{track}/`; the UI renders it with Free Myself typography and **interactive checkpoints**.

Hub board must show a clear hierarchy — **not** a flat mix of overview / month / week / day:

1. **总纲**（overview）
2. **月 / 阶段地图**（month）
3. **周索引**（week）→ nested **日细案**（day）
4. **资料**（ref，optional）

Data: `HARNESS_CURRICULUM_SECTIONS` / `LEETCODE_CURRICULUM_SECTIONS` in `src/lib/learn-curriculum.ts`.  
UI: `CurriculumBoard` in `src/components/learn/curriculum-board.tsx`.

Tracks: `harness` | `leetcode`.

## Non-negotiables

1. **Navigation** — `CurriculumList` / any curriculum index uses `lessonHref(docPath)` → `/learn/harness/...` or `/learn/leetcode/...`. Do **not** use `learnDocUrl` / `harnessDocUrl` for learner navigation (those are optional “view source on GitHub” only).
2. **Content source** — single source of truth: `docs/learn/harness/*.md` and `docs/learn/leetcode/*.md`. Do not duplicate bodies into React strings.
3. **Checkpoints** — every manual / verify / deliverable item the learner must actually do is a GFM task list item:
   ```markdown
   - [ ] 具体可验收的一句话
   ```
   The lesson UI turns these into clickable `.fm-checkpoint` rows (localStorage progress). Do not use plain `1. 2. 3.` for deliverables if you want them trackable.
4. **Relative links** — link other curriculum files as `./foo.md` or `bar.md`. Loader rewrites them to `/learn/{track}/{slug}`. `README.md` → slug `overview`.
5. **Visual language** — use existing `.fm-lesson*` / `.fm-checkpoint*` in `globals.css`; light, spacious, teal accent `#1a5f59`. No dark-IDE clone, no purple glow cards in the hero.
6. **Brand** — **Free Myself**; Chinese UI copy concise.

## Batch conversion checklist (per markdown file)

For each `docs/learn/{track}/*.md` that learners open:

1. Ensure file is listed in `HARNESS_CURRICULUM` or `LEETCODE_CURRICULUM` with correct `docPath` (if it should appear on the hub).
2. Convert **交付物 / 今日目标 / 收工清单 / 边做边验** numbered lists into `- [ ] ...`.
3. Keep explanatory prose as normal markdown (headings, tables, code fences).
4. Prefer one **收工清单** section at the end with all must-pass checks.
5. Smoke: open `http://localhost:3000/learn/{track}/{slug}` — title in hero, relative links stay in-app, checkboxes toggle and persist after refresh.
6. Run `npm test` (and `npm run typecheck` if routes/UI changed). Then commit **one slice** and `git push` per repo standing order.

## Code map

| Piece | Path |
|---|---|
| Href helper + block split (client-safe) | `src/lib/learn-lessons.ts` |
| Disk loader (`loadLesson`) | `src/lib/learn-lessons-server.ts` |
| Re-export `lessonHref` | `src/lib/learning-journal.ts` |
| Hierarchical board data | `src/lib/learn-curriculum.ts` |
| Hub + CurriculumBoard | `src/components/learn/journal-hub.tsx`, `curriculum-board.tsx` |
| Lesson UI + checkpoints | `src/components/learn/lesson-view.tsx` |
| Routes | `src/app/learn/harness/[slug]/page.tsx`, `src/app/learn/leetcode/[slug]/page.tsx` |
| Styles | `src/app/globals.css` (`.fm-lesson*`, `.fm-checkpoint*`) |
| Evals | `evals/learn-lessons.test.ts`, `evals/learning-journal.test.ts` |

## Slug rules

| File | URL |
|---|---|
| `docs/learn/harness/month-01-day01.md` | `/learn/harness/month-01-day01` |
| `docs/learn/harness/README.md` | `/learn/harness/overview` |
| `docs/learn/leetcode/week1-day01.md` | `/learn/leetcode/week1-day01` |

Slug charset: `[a-zA-Z0-9._-]+` only.

## Checkpoint copy rules

- One action per line; start with a verb when possible（打印 / 写好 / 提交 / 勾完）.
- Include the acceptance hint in the same line（例：`lab vitest 绿`）.
- Do **not** put multi-paragraph text inside a single `- [ ]`.
- Optional stretch goals: separate `- [ ]` under「可选加餐」, not mixed into must-pass 收工清单 without labeling.

## When user says「批量改呈现」

1. Read this skill.
2. Enumerate all curriculum `docPath`s + any day files linked from week indexes.
3. For each file: add/normalize `- [ ]` checkpoints; fix broken relative links.
4. Confirm hub uses `lessonHref` (already should).
5. Add/adjust Vitest if new helpers or route rules change.
6. Ship as focused commits (e.g. `feat(learn): in-app checkpoints for harness day02–07`).

## Out of scope

- Do not replace Document Studio / PPT Studio markdown pipelines.
- Do not commit `data/learn/*.json` runtime progress or `.env*`.
- Do not edit `.cursor/plans` plan files.
