# DESIGN.md — 호박(🎃 Hobak) Design System Specification
> Generated & governed by **`ui-setup`** (`sickn33/agentic-awesome-skills` / `bitjaru/styleseed`) + **`antigravity-design-expert`**.

## 1. Project Identity
- **Service Name**: 호박 (Hobak Market — 우리 동네 중고거래 웹서비스)
- **Application Type**: C2C Hyperlocal Secondhand Marketplace (상품목록 · 상품상세 · 글쓰기 통합 웹서비스)
- **Design Engines**:
  - **StyleSeed `ui-setup`**: Semantic Token Architecture (`tokens/*.json` + `css/theme.css`), Multi-Skin Presets, Light/Dark Mode WCAG Token Mapping, Interactive Setup Wizard (`js/ui-setup.js`).
  - **Antigravity Design (`antigravity-design-expert`)**: Weightless Elevation, 3D Spatial Depth (`perspective`, `translateZ`), Frosted Glassmorphism (`backdrop-filter`), GSAP + ScrollTrigger Physics.

---

## 2. Token Architecture (Source of Truth)

| Category | JSON Manifest | CSS Custom Property Prefix | Description |
| :--- | :--- | :--- | :--- |
| **Colors** | [tokens/colors.json](file:///c:/agapp_project/hobak/tokens/colors.json) | `--hobak-*`, `--ss-color-*` | Brand primary, surface elevations, text hierarchy, borders, status badges (Light & Dark) |
| **Typography** | [tokens/typography.json](file:///c:/agapp_project/hobak/tokens/typography.json) | `--ss-font-*`, `--ss-text-*` | `Pretendard` font stack, modular scale (`12px`–`28px`), weights, line-heights |
| **Radii** | [tokens/radii.json](file:///c:/agapp_project/hobak/tokens/radii.json) | `--ss-radius-*`, `--hobak-radius-*` | `sharp` (10px), `rounded` (20px default), `soft` (28px), `pill` (999px) |
| **Shadows** | [tokens/shadows.json](file:///c:/agapp_project/hobak/tokens/shadows.json) | `--ss-shadow-*`, `--ag-shadow-*` | Multi-layered weightless diffused shadows for Light and Dark modes |
| **Spacing** | [tokens/spacing.json](file:///c:/agapp_project/hobak/tokens/spacing.json) | `--ss-space-*` | 4px/8px spatial grid system (`4px` to `64px`) |

---

## 3. Interchangeable Brand Skins (`data-skin`)
1. **`hobak` (🎃 호박 오리지널 — Default)**:
   - Primary Accent: `#FF6F0F` (Hover: `#E85D00`, Soft Surface: `#FFF4EB`)
   - Personality: 따뜻하고 친근한 우리 동네 중고거래 감성
2. **`toss` (💳 Toss 클린 파이낸스)**:
   - Primary Accent: `#3182F6` (Hover: `#1B64DA`, Soft Surface: `#E8F3FF`)
   - Personality: 압도적인 가독성과 깔끔한 금융/커머스 인터페이스
3. **`linear` (📐 Linear 스페이셜)**:
   - Primary Accent: `#5E6AD2` (Hover: `#4B56B8`, Soft Surface: `#EEF0FF`)
   - Personality: 정교한 1px 헤어라인 보더와 기하학적 모던 워크스페이스
4. **`stripe` (✨ Stripe 에디토리얼)**:
   - Primary Accent: `#635BFF` (Hover: `#4F46E5`, Soft Surface: `#F0EFFF`)
   - Personality: 깊이감 있는 그라데이션과 세련된 글로벌 커머스 무드

---

## 4. Dark Mode & Accessibility Rules (`data-theme="dark"`)
- Activated via `document.documentElement.setAttribute('data-theme', 'dark')` (or `.dark` class).
- Never invert colors blindly; elevate dark surfaces progressively:
  - Background Canvas: `#0D0F14`
  - Elevated Glass Card: `rgba(24, 27, 36, 0.78)` with `1px solid rgba(255, 255, 255, 0.12)`
  - Secondary Surface / Input: `rgba(34, 38, 50, 0.85)`
  - Primary Text: `#F3F5F8` (WCAG AAA contrast)
  - Secondary Text: `#A6AEB9`
  - Muted Text: `#6E7785`
