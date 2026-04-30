# Repository Guidelines

## Project Structure & Module Organization

This repository contains a minimal Chromium browser extension for hiding YouTube Shorts.

- `manifest.json` defines the extension metadata and content script registration.
- `content.js` contains all runtime behavior for detecting YouTube routes, redirecting Shorts pages, and hiding Shorts elements.
- `README.md` documents user-facing installation and usage.
- `AGENTS.md` documents contributor and agent workflow.

There are currently no test, build, asset, or packaging directories. Keep new files at the root unless the project grows enough to justify folders such as `tests/` or `assets/`.

## Build, Test, and Development Commands

There is no build step. The extension is loaded directly as an unpacked extension.

- `node --check content.js`: validates JavaScript syntax without running the script.
- `git status --short --branch`: checks local changes and branch tracking.
- `git log --oneline --decorate -5`: reviews recent commit style.

For local manual testing, open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select this repository folder. After edits, reload the extension and refresh YouTube tabs.

## Coding Style & Naming Conventions

Use plain JavaScript with no dependencies. Prefer small, named functions over inline blocks when behavior has a clear purpose.

- Use 2-space indentation.
- Use `const` by default; use `let` only for mutable state.
- Use uppercase `*_SELECTOR`, `*_PATH`, or `*_CLASS` constants for shared string values.
- Keep selectors scoped and performance-conscious. Avoid expensive global CSS selectors such as `:has(...)` on YouTube pages.

## Testing Guidelines

There is no automated test framework yet. At minimum, run:

```bash
node --check content.js
```

Manual checks should cover:

- YouTube homepage loads without noticeable slowdown.
- Shorts do not appear in homepage or watch-page recommendations.
- Search results remain usable, including Shorts results.
- Direct `/shorts` URLs redirect away.

## Commit & Pull Request Guidelines

Existing commits use short imperative summaries, for example `Add README`, `Optimize Shorts cleanup`, and `Reduce cleanup impact`. Continue using concise messages that describe the change.

Pull requests should include:

- a short summary of behavior changed
- manual test results
- notes about performance impact, especially if selectors or DOM scanning changed
- screenshots only when visible UI behavior changes

## Agent-Specific Instructions

Keep changes small and performance-oriented. YouTube is a dynamic app, so avoid mutation observers or repeated full-document scans unless there is a measured need.
