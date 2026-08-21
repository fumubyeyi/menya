---
name: quick-changes
description: For small, low-risk edits in Menya.prototype (default values, copy/label text, ordering, minor styling), skip the full build-and-browser-test cycle and just make the edit. For deleting or renaming a component, search the repo for every reference first, review breaking changes with the user before editing, and offer an in-browser test afterward.
---

# Quick changes in Menya.prototype

This repo (`Menya.prototype/`) is a React/Vite/TypeScript prototype with no
type-checking step in `npm run build` (no `typescript` devDependency — Vite
strips types via esbuild without checking them). Because of that, the usual
verification loop for this repo is: `npm run build` to catch import/syntax
errors, plus a live Playwright smoke test through the actual UI for anything
that could plausibly break at runtime.

That full loop (spin up the dev server, `npm install --no-save playwright`,
drive a headless browser, screenshot, tear it all down) is the right call for
real feature work, but it's overkill for trivial edits. Skip it for changes
like:

- Default form values (e.g. a default location, a default time)
- Copy/label/button text changes (text only — not file/export/component renames, see below)
- Reordering existing elements (button order, nav order, field order)
- Minor styling/alignment tweaks that don't touch component logic

For these, just make the edit directly — no `npm run build`, no browser
smoke test — unless the user asks for verification or something about the
change looks like it could plausibly break (e.g. it touches state logic,
context methods, routing, or data shape, not just a literal/label/ordering).

Still verify normally (build + live browser test, per the `run` skill) for:

- New pages, routes, or nav entries
- New or changed data/context logic (state shape, add/remove/update methods)
- Multi-step interactive flows (forms, modals, wizards)
- Anything where a broken import or bad JSX would only surface at runtime

When genuinely unsure which bucket a change falls into, it's fine to at
least run `npm run build` (cheap, catches import/JSX errors) without going
all the way to a browser smoke test.

## Deleting or renaming a component

This is its own category, separate from the quick-edit list above — never
treat a component/file/export rename or deletion as a trivial edit, even
though a rename can feel cosmetic.

1. **Search first.** Before touching the component, grep the whole repo
   (not just the obvious directory) for every way it could be referenced:
   the import path, the exported symbol name, JSX usage (`<ComponentName`),
   and — for a rename — the old name as a plain string (route paths, nav
   labels, titleMap keys, localStorage keys, test fixtures, docs). Don't
   assume the only callers are the ones you already know about.

2. **Classify the change.** If nothing else in the repo references it, it's
   safe to proceed directly. If other files import it, render it, route to
   it, or otherwise depend on it, it's a **breaking change** — go to step 3
   instead of just making the edit.

3. **For a breaking change, stop and present a review before editing:**
   what's being deleted/renamed, the full list of files/call sites that
   reference it (with enough context to judge impact — not just a file
   count), and what breaks if those call sites aren't updated too. Ask the
   user to confirm before proceeding — don't make the change speculatively
   and fix fallout after.

4. **If the user accepts the review**, make the change along with updating
   every affected call site found in step 1, then ask the user whether they
   want an in-browser smoke test run before considering it done — don't
   default to skipping verification the way the quick-edit list above does,
   since a missed reference here fails silently (blank page, dead route,
   broken nav) rather than loudly.
