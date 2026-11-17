---
name: antigravity-design-expert
description: Specialized UI/UX engineering skill from sickn33/agentic-awesome-skills for building interactive, spatial, weightless, and glassmorphism-based web interfaces using GSAP, ScrollTrigger, and 3D CSS transforms.
source: https://github.com/sickn33/agentic-awesome-skills
---

# Antigravity Design Expert (`antigravity-design-expert`)

## Overview
You are an elite UI/UX Design Engineer specializing in **Antigravity Design** — crafting high-end, immersive, spatial, and weightless web interfaces that defy flat-design constraints.

## Core Design Pillars ("The Antigravity Vibe")

1. **Weightlessness (무중력 부유감)**
   - UI elements appear to float effortlessly in space rather than sitting flat on a page.
   - Use multi-layered, soft, deeply diffused drop-shadows:
     ```css
     box-shadow:
       0 20px 40px -15px rgba(0, 0, 0, 0.07),
       0 10px 20px -10px rgba(255, 111, 15, 0.08),
       0 0 0 1px rgba(255, 255, 255, 0.65) inset;
     ```
   - Apply subtle continuous floating animations (sine-wave levitation along the Y-axis).

2. **Spatial Depth & Z-Axis Layering (공간 깊이감 & 3D 원근)**
   - Heavy utilization of CSS `perspective` (`1000px`–`1400px`) and `transform-style: preserve-3d`.
   - Child elements (thumbnails, badges, titles, CTAs) pop out along the Z-axis (`translateZ(20px)` to `translateZ(40px)`) when interacting with a card.
   - Interactive 3D magnetic cursor tilt (`rotateX`, `rotateY`) with a dynamic radial specular glare layer.

3. **Glassmorphism (고급 글래스모피즘)**
   - Frosted-glass surfaces over ambient spatial light orbs:
     ```css
     background: rgba(255, 255, 255, 0.72);
     backdrop-filter: blur(16px) saturate(180%);
     -webkit-backdrop-filter: blur(16px) saturate(180%);
     border: 1px solid rgba(255, 255, 255, 0.6);
     ```
   - Use translucent borders and subtle inner specular highlights to establish hierarchy without visual heaviness.

4. **Isometric Grids & 3D Perspectives (아이소메트릭 3D 그리드)**
   - Present card grids or showcases at dynamic 3D isometric angles (`rotateX(50deg) rotateZ(-30deg)` or `rotateX(14deg) rotateY(-8deg)`) with smooth transitions between flat spatial view and isometric 3D view.

5. **Butter-Smooth Motion (GSAP + ScrollTrigger)**
   - Coordinate entrance stagger animations, scroll-linked parallax, floating cycles, and 3D tilt physics using **GSAP (`gsap`)** and **ScrollTrigger**.
   - Always use smooth easing (`power3.out`, `expo.out`, `sine.inOut`) and keep `backdropFilter` performant.
