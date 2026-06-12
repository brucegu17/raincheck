---
name: raincheck-ui-quality
description: Use this skill before claiming any UI change is complete in the raincheck project — runs a 12-item self-check that prevents the spacing / centering / overflow / wide-screen / mentor-card-bloat regressions that repeatedly broke iteration in v1.
---

# raincheck · UI Quality Checklist

This skill exists because the v1 single-HTML codebase repeatedly produced the same five
UI regressions (oversized mentor cards, broken centering, off-canvas content, wide-screen
empty space, dense headers). Every UI-touching change in this project MUST pass this
checklist before it is reported as complete.

Whenever you finish a CSS or layout-affecting change, walk through these 12 items in
order. If any item fails, fix it before continuing.

---

## 1. Design tokens only — no naked `px` in components

Components must consume values from `src/design/tokens.css`:

- spacing → `var(--space-1..8)`
- font size → `var(--font-xs..4xl)`
- radius → `var(--radius-1..5)` or `--radius-pill`
- shadow → `var(--shadow-ink-*)`
- color → `var(--c-*)`

Allowed exceptions: SVG `viewBox`, intrinsic image dimensions (e.g. avatar size derived from a `size` prop), animation durations expressed via `var(--dur-*)`.

If you wrote a raw `8px` / `24px` / `30px` inside a `.vue` `<style scoped>` block, replace it with the closest token.

## 2. Spacing uses Stack / Cluster / Grid — not ad-hoc margin

Vertical rhythm comes from the `<Stack :gap>` primitive. Horizontal flow comes from
`<Cluster :gap justify align>`. Self-adapting columns come from `<Grid :min :gap>`. Do
not invent local flexbox layouts when these primitives apply.

## 3. Reading width budget — content never exceeds `--reading-max`

Long text blocks (mentor speech, decision narrative, cut-scene title) must be wrapped in
`<Center max="reading">`. The widest interactive content uses `<Center max="layout">`.
Only the decision stage (`SceneDeploy`) uses full-viewport width — and even there the
content layer is capped by `max-width: var(--reading-max)`.

## 4. First-viewport budget — 100vh must show the main interaction

For every scene that is the entry to a level (collect, clean, train, deploy intro), the
**primary interaction** (map, cards, chips, weather panel) must be visible without
scrolling at 1440×900.

Concretely:

- TopHud height ≤ `var(--header-h)` (64px desktop / 56px mobile)
- MentorCard height ≤ 64px when expanded, ≤ 48px when collapsed
- Page title + sub combined ≤ 64px
- Total chrome above primary interaction ≤ 220px

If a header section grows past these caps, collapse MentorCard or remove the sub.

## 5. MentorCard is a pill, never a 130px white box

The `<MentorCard>` component takes ONE line of text. Multi-paragraph instructions go
into TTS narration, not into the card. If you find yourself stuffing >40 Chinese chars
into one MentorCard, you are using the wrong tool — use a `<details>` collapsible or
narration instead.

## 6. Lists fill their container — `.cres` style mistake guard

Any `display: flex` row inside a list MUST also have `width: 100%` OR live inside a
`<Grid>` primitive. If you write a `.flex { display: flex }` rule on a card that lives
in a list, also assert `width: 100%` or wrap with Grid. This is exactly the bug that
caused image 7.

## 7. Centering is intentional — declare WHY you center

Three valid centering contracts:

- `<Center max="…">` for content max-width + horizontal centering
- `display: grid; place-items: center` for single-child viewport centering (modals, stages)
- `text-align: center` only for inline runs (not for block layout)

Never combine `display: flex` + `justify-content: center` + `align-items: center` ad-hoc
on layout containers when one of the above primitives applies. Comment WHY whenever you
use raw flex centering.

## 8. Full-bleed sections break out cleanly

When a `<section>` needs to escape the central layout container, use the documented
break-out pattern (used by `SceneDeploy`):

```css
.stage {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  min-height: calc(100vh - var(--header-h));
}
.stage > .content { max-width: var(--reading-max); margin-inline: auto; }
```

This requires `body { overflow-x: hidden }` (already in `reset.css`). Never use
`width: 100vw` without `margin-inline: calc(50% - 50vw)` — it will overflow.

## 9. Wide-screen fill — no orphan content on ≥1600px

When the viewport exceeds 1600px, full-bleed scenes MUST add visual fill: backgrounds,
decorative SVGs at viewport edges, gradient washes — NOT empty space.

Test by resizing dev server window to 2000px wide. If the stage looks like a 720px
column floating in a sea of single-tone background, add layered decorations or widen
the content max-width responsively.

## 10. Vertical gap discipline in stage scenes

Inside full-bleed scenes (cutscene, day, result, finale in `SceneDeploy`):

- Use `<Stack :gap="3">` or `:gap="4"`. Never `:gap="6"` or larger.
- Element-to-element gap should never feel like "you could fit another element between
  them" — measure: if you can mentally fit a 80px button in a gap, the gap is too big.

The image 9/10 bug was caused by `:gap="6"` (32px) compounding with element margins.

## 11. Verify at 3 widths before claiming "done"

Open `npm run dev` and resize browser to:

- 1920 wide (laptop external monitor)
- 1280 wide (laptop)
- 390 wide (iPhone width simulation)

For each, walk through: intro → collect submit → clean submit → train pass →
deploy day 2 (high-risk) → result → finale → end.

At no point should:

- Content be cut off below the fold during a single interaction
- Horizontal scrollbar appear
- Elements overlap
- The mentor card exceed two lines

## 12. Honest reporting

When telling the user "I fixed image N":

- Do NOT claim "fixed" without actually running through #11.
- List the SPECIFIC class/component you changed.
- If you only fixed it for one width, say so.

---

## Quick run

```sh
cd /Users/zhiqianggu/Documents/Claude/raincheck
npm run dev                 # smoke test at 3 widths (item 11)
npm run build               # ensures vue-tsc + vite-singlefile both pass
open dist/index.html        # confirms double-click distribution still works
```

If any item above is not satisfied, the change is NOT done. Repeat.

---

## 13. The browser skill exists. Use it before claiming "fixed".

**The user is not your test agent.** When you change a `.vue` or `.css` file,
invoke `/browse` and screenshot the result yourself. Comparing against the user's
last red-marked screenshot is the bare minimum.

After ANY UI change in this project:

```bash
B="/Users/zhiqianggu/.claude/skills/gstack/browse/dist/browse"
$B viewport 1440x900
$B goto http://localhost:5273/
# Walk the actual flow that touches your change.
$B screenshot /tmp/after.png --viewport      # full viewport, no compression
# OR if you only care about one block:
$B screenshot /tmp/block.png --selector ".the-block-i-changed"
```

Then use the Read tool on the PNG and look at it. If you cannot, that's a blocker
— say so. Never write "刷新一下" / "请你测一下" / "应该好了" without having
actually verified.

## 14. Screenshot evidence is required for any "fixed" claim.

When you report a fix to the user, attach: (a) before-screenshot path,
(b) after-screenshot path, (c) one concrete sentence describing the visual
difference between them. Without all three, the fix is not done — it is a
hypothesis.

## 15. Compressed previews lie. Use `--viewport` or `--selector`.

The screenshot embed shrinks images to ~350px wide for the Read tool. Faint
white glows, subtle 1-2px borders, micro-shadows, and gradient stops in the
0.05–0.2 alpha range disappear in the thumbnail but render fine at full size.
If the issue is "I can't see X in the thumbnail," DO NOT immediately tweak X —
first take an element-level screenshot via `--selector`. Verify before fixing.

## 16. Vue computed needs reactive dependencies.

A `computed(() => dbLoad())` that wraps a localStorage read will only run
**once** (on first access), because the computed has no reactive trigger.
Pattern that worked in `SceneEnd.vue`:

```typescript
const board = ref<ScoreRecord[]>([]);
function refreshBoard() { board.value = dbLoad().slice().sort(...); }
onMounted(() => { writeNewRecord(); refreshBoard(); });
function clearAll() { dbSaveAll([]); refreshBoard(); }
```

Apply this any time you read from localStorage, IndexedDB, query params, or any
non-reactive source.
