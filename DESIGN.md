---
version: alpha
name: Brewprint
description: An original vintage espresso bar for learning how coffee drinks are assembled.
colors:
  ink: "#38251f"
  paper: "#fff8e9"
  surface: "#f5ead6"
  muted: "#69534a"
  line: "#bfa582"
  accent: "#742c39"
  accentInk: "#fff8e9"
  brass: "#ad8040"
  espresso: "#502c20"
  coffee: "#855237"
  water: "#a8d8de"
  milk: "#efdab0"
  foam: "#fffdf6"
typography:
  display: { fontFamily: 'Georgia, Cambria, serif', fontSize: 64px, lineHeight: 68px, fontWeight: 700 }
  title: { fontFamily: 'Georgia, Cambria, serif', fontSize: 36px, lineHeight: 42px, fontWeight: 700 }
  body: { fontFamily: 'system-ui, sans-serif', fontSize: 18px, lineHeight: 27px }
  small: { fontFamily: 'system-ui, sans-serif', fontSize: 16px, lineHeight: 24px }
spacing: { "1": 4px, "2": 8px, "3": 12px, "4": 16px, "5": 24px, "6": 32px, "7": 48px, "8": 64px }
rounded: { sm: 8px, md: 16px, pill: 999px }
---

# Brewprint espresso bar

Walnut tones, warm ivory, burgundy signage and brass rules. The star is an
original SVG cutaway cup on a saucer, not a generic dashboard. System serif
headings and high-contrast system sans-serif text are readable on a projector.
No font CDNs, stock assets, or third-party image dependencies.

## Components

Patterns live in `.agents/design/components.jsonc`.

- Cup: original SVG with a constant interior height. Each layer's height is
  its amount divided by the declared capacity. Leave unused space visible.
  Adjacent ingredient names and amounts are the text equivalent.
- Recipe tile: native button, `aria-pressed`, selected border and text cue.
  Browsing never changes the builder. Only "Use this recipe" does that.
- Tray: draggable ingredients with clearly labeled equivalent Add buttons.
- Builder: prominent labeled drop zone, visible drag feedback, polite live
  announcements, ingredient removal, undo last addition and reset.
- API error: visible alert and explicit retry. No sample-data fallback.

## Layout and accessibility

Responsive two-column workbench, six-drink gallery, 44px minimum targets,
3px offset focus rings. Color never replaces labels. Body 18px, minimum UI
text 16px. Cup line art may scale, with full-size text outside the SVG.
Desktop maximum width 1440px. Panels use 16px corners, controls 8px.
Use the spacing scale above; decorative borders may use 1-3px.

Reduced motion disables transitions; no essential animation. Foam represents
illustrative occupied volume, not liquid yield. Layers represent assembly
order, not density or fluid simulation.
