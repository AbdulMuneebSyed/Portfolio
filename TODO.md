# TODO

Open work only. When something ships, delete its line; git history keeps
the record. How the app works and the rules for changing it are in
`CLAUDE.md`.

Last reviewed: 2026-10-15.

## Ideas not built yet

- Launchpad.
- Hot corners.
- Window → Move & Resize menu items.
- Drag several selected desktop files at once (selection exists; dragging
  moves one file).
- Notes: a notes list (the app holds a single note today).
- Music on iPhone: a mini player outside the Now Playing screen.
- GitHub: a contribution graph.
- Settings › Appearance on iPhone still shows Mac thumbnails.
- Activity Monitor: CPU / Memory / Energy tabs and more columns; Trash as a
  Finder window.

## Engineering

- `npm run lint` crashes (`next lint`, ESLint 9, legacy `.eslintrc.json`).
  Move to a flat `eslint.config.mjs` and get it passing; then consider
  turning off `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`
  in `next.config.mjs`.
- Browser tests (Playwright): `scripts/test-macos.cjs` covers pure logic
  only. Start with unlock → open each Dock app → no horizontal overflow at
  1440×900 and 393×852.
- Phone app open/close still animates an icon-shaped `clip-path` (not on
  the compositor); kept for the look.

## Needs the owner (not done by code alone)

- Résumé: currently locked (`profile.resumeLocked`). Decide when to publish
  the new one; then restore the PDF and page image (see `CLAUDE.md` §6).
- Real screenshots for Arrwin, AiResumate, Hypogen and the paper.
- Repo links for Hypogen, LaunchPad and MuneebOS, and a link to the paper.
- AiResumate as a job and Capco-CS as a project: keep both?
- Keep the click sound opt-in? Auto-start the tour on first visit
  (`components/desktop.tsx`)?
