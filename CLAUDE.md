# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WME Bootstrap is the initialization library for WME (Waze Map Editor) userscripts. It bridges the WME SDK events to jQuery custom events, allowing scripts to listen for feature selection changes via events like `segment.wme`, `venue.wme`, `node.wme`, etc.

Source is written in TypeScript under `src/`, built with Rollup into a single IIFE at `dist/WME-Bootstrap.user.js`. GreasyFork auto-syncs from the dist output.

## Commands

- **Install:** `npm install`
- **Build:** `npm run build`
- **Watch:** `npm run watch`
- No test or lint steps exist.

## Architecture

```
src/
├── meta.ts          # userscript header
├── globals.d.ts     # getWmeSdk declaration
├── bootstrap.ts     # SELECTORS + Bootstrap class
└── index.ts         # instantiates Bootstrap
```

## Event Flow

1. WME fires `wme-ready` DOM event
2. Bootstrap.init() fires `bootstrap.wme` jQuery event (consumed by all WME scripts)
3. Bootstrap.setup() registers `wme-feature-editor-opened` handler
4. On feature selection → eventHandler() maps SDK feature types to jQuery events:
   - segment → `segment.wme` / `segments.wme`
   - venue → `venue.wme` / `venues.wme` + `point.wme` / `place.wme` / `residential.wme`
   - node → `node.wme` / `nodes.wme`
   - etc.
5. On deselection → fires `none.wme`

## Coding Conventions

- TypeScript with `strict: false`
- GitHub Actions auto-builds `dist/` on push to master
