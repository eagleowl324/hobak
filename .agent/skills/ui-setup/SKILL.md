---
name: ui-setup
description: Interactive setup wizard — guides you step-by-step to configure the design system, tokens, brand skins, typography, and light/dark mode for your project.
risk: critical
source: https://github.com/bitjaru/styleseed (via sickn33/agentic-awesome-skills)
---

# UI Setup — Design System Setup Wizard (`ui-setup`)

## Overview
`ui-setup` (originating from **StyleSeed** `bitjaru/styleseed` and distributed in **`sickn33/agentic-awesome-skills`**) is a step-by-step design system configuration skill and token architecture engine. Its goal is to eliminate generic "AI slop" by enforcing structured design token manifests (`tokens/*.json`), semantic CSS custom properties (`css/theme.css`), interchangeable brand skins, WCAG-compliant dark mode, and a root design specification (`DESIGN.md`).

## Execution Steps

### Step 1: Brand & Theme Discovery
Identify or configure the core design parameters for the application:
- **App Type**: Local Community & Secondhand Marketplace (`중고 거래 웹서비스 '호박'`)
- **Brand Skins**:
  - `hobak` (Default: Warm Pumpkin `#FF6F0F`, cozy approachable surfaces)
  - `toss` (Toss-inspired `#3182F6`, high-contrast financial clarity, generous radii)
  - `linear` (Linear-inspired `#5E6AD2`, precision 1px borders, geometric radii)
  - `stripe` (Stripe-inspired `#635BFF`, editorial depth and layered shadows)
- **Color Mode**: Synchronized Light Mode (`:root`) and Dark Mode (`[data-theme="dark"]` / `.dark`)
- **Radius & Typography Scales**: Configurable corner radius (`sharp`, `rounded`, `soft`) and font scale (`compact`, `default`, `comfortable`).

### Step 2: Source-of-Truth Token Manifests (`tokens/*.json`)
Maintain structured JSON token files as the single source of truth:
1. `tokens/colors.json` — Brand primary/accent scales, semantic surfaces, text hierarchy, borders, and status colors for both Light and Dark themes.
2. `tokens/typography.json` — Font family stacks (`Pretendard`), modular type scale, font weights, and line heights.
3. `tokens/radii.json` — Corner radius tokens (`--radius-xs` through `--radius-pill`).
4. `tokens/shadows.json` — Elevation shadow tokens (`--shadow-xs` through `--shadow-stage`).
5. `tokens/spacing.json` — 4px/8px spatial grid tokens (`--space-1` through `--space-16`).

### Step 3: CSS Theme Implementation (`css/theme.css`)
- Map all JSON tokens to `:root` CSS Custom Properties.
- Provide token-level overrides for `[data-theme="dark"]` (`.dark`), `[data-skin="*"]`, `[data-radius="*"]`, and `[data-scale="*"]` so components never require hardcoded color overrides.

### Step 4: Design System Lockfile (`DESIGN.md`) & Interactive Wizard (`js/ui-setup.js`)
- Record the active design decisions in `DESIGN.md` at the repository root.
- Expose an interactive UI Setup Wizard in the application so users and developers can preview skins, toggle dark mode, adjust radii/typography, and inspect live design tokens.
