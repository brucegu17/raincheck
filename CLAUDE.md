# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

「洪水预报员 · 清溪镇保卫战」— a single-file HTML educational game (Chinese, 小学四年级 / 4th-grade AI literacy classroom). Inspired by Google Research "AI Quests · Market Marshes". Everything ships in `game.html`: markup, CSS, JS, SVG art, audio synthesis, TTS, and game data. **No build step, no dependencies, no network at runtime.** Run by double-clicking `game.html`.

## Run / iterate

- Open: `open game.html` (or just double-click). Reload the browser tab after edits.
- There is no test suite, lint config, or package manager. Don't add one without asking — the "single offline HTML" constraint is the product.
- `shots/` and `*.tmp` are gitignored (used for ad-hoc screenshots during iteration).

## Architecture of `game.html`

The file is one ~2000-line document. Everything is global on `window`. Order matters: CSS first, then `<section class="screen">` blocks, then a single `<script>` tag containing the whole engine.

**Five game screens** (`<section class="screen" id="s-…">`), navigated by `go(screenId, step)` which toggles the `.active` class and updates the top step indicator:
- `s-intro` — name entry / start
- `s-collect` — Level 1: explore the town, click hotspots to find data sources (5 good + 3 decoys)
- `s-clean` — Level 2: spot bad rows in a table (missing / outliers / duplicates / impossible values)
- `s-train` — Level 3: pick the right features to train on
- `s-deploy` — Level 4: full-screen "theater" deciding whether to issue flood warnings over 3 days
- `s-end` — score breakdown, stars, grade, local scoreboard, CSV export

**Game data lives in `SETS` (~line 1375)** — three parallel question sets `A` / `B` / `C`. Each set has its own `decoys` (wrong data sources), `rows` (table to clean), and `days` (decision scenarios). `GOOD_SOURCES` (~line 1366) is shared across all sets and is the pedagogical core ("these five inputs are what a real flood model uses"). When adding/editing pedagogical content, edit these tables — do not hard-code per-level logic.

**Question-set rotation (核心教学约束):** `startGame()` (~line 1546) reads `localStorage['qx_last_set']` and *excludes* it from the draw pool, so two consecutive students on the same laptop never see the same set. Preserve this invariant when touching set selection. Feature order in Level 3 is also shuffled per session so answer position doesn't leak.

**Score model:** `S` (~line 1469) holds player state. Each level writes into `S.pts.{collect,clean,train,decide}` (total 100). `gradeOf(total)` (~line 1968) maps to stars + 称号. `finishGame()` (~line 1978) persists to `localStorage['qxz_scoreboard_v1']` with an in-memory `memDB` fallback for when storage is blocked.

**Audio engine `AU` (~line 1117)** is hand-built on Web Audio — synthesized tones, a two-voice step sequencer for per-scene BGM, and a noise-based "rain" texture. Zero audio files. `setScene(sceneKey)` switches BGM; `SCENE_OF` (~line 1485) maps screens to scenes. `sndOn` / `voiceOn` flags are persisted in localStorage (`qx_snd`, `qx_voice`).

**TTS (云博士语音, ~line 1219):** browser `speechSynthesis` only. `pickVoice()` scores available voices for Mandarin quality (prefers Xiaoxiao/Yunxi/Tingting etc.). `SPEAK` maps screens to narration. The cloud-doctor SVG mascot's mouth animates via the `.speak` CSS class while talking. Both audio and voice gracefully no-op if APIs are missing.

**Art:** all illustrations are inline SVG. The town map for Level 1 is cloned into the data-detail modal (`#dataModal`) with renamed gradient IDs (`docSVG` / clone logic ~line 1323) — gradient ID collisions between the hidden modal and the visible page will break colors, so keep the rename step if you touch that area.

**Accessibility / motion:** several effects (`confetti`, `headerRain`, bubble field) check `prefers-reduced-motion: reduce` and skip. Respect this when adding animations.

## Conventions to follow

- Keep everything in `game.html`. No external assets, no fetch, no CDN.
- All text-facing strings are Chinese; tone is warm and aimed at 9–10 year olds. Match the existing voice when adding copy.
- Section dividers in the source use Unicode box-drawing comments (`/* ═════ … ═════ */`, `/* ═══════════ … ═══════════ */`) — keep this style when adding new regions so the file stays navigable.
- The README's version table (`v1-audio`, `v2-explore`, …) is appended to per major iteration; add a new row when you ship a similarly large change.
