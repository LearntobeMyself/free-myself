# Harness — Free Myself

`Agent = Model + Harness`

This folder is the execution spine for workbench agent loops (tools, registry, traces).
The same cadence applies to **product work** done by coding agents on this repo.

## Release cadence (mandatory — do not wait for a reminder)

After **each** completed feature slice:

1. Keep the slice focused (one concern).
2. `npm test` green (`npm run typecheck` / `npm run build` when UI or routes change).
3. `git add` only that slice’s files (never secrets, `data/**/*.json`, uploads, `.env*`).
4. Commit with `feat:` / `fix:` / `style:` / `perf:` / `docs:`.
5. **`git push origin HEAD` immediately** — upload to GitHub before starting the next slice.

Do **not** leave finished features only on the local machine.
Do **not** batch unrelated features into one mega-commit / mega-push.
Do **not** wait for the user to say “push” or “upload to GitHub”.
