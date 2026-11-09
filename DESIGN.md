---
version: alpha
name: Brewprint
description: An elegant midnight espresso bar centered on one animated cutaway cup.
colors:
  ink: "#f3e7d3"
  paper: "#14110f"
  surface: "#221b16"
  muted: "#baaa96"
  line: "#514237"
  accent: "#dfb77b"
  accentInk: "#1c1510"
  brass: "#b48c54"
  burgundy: "#693442"
  glass: "#d5b584"
  espresso: "#754529"
  coffee: "#a16c43"
  water: "#86b8be"
  milk: "#efd3a3"
  foam: "#fff0d5"
typography:
  display: { fontFamily: 'Georgia, Cambria, serif', fontSize: 64px, lineHeight: 70.4px, fontWeight: 400 }
  title: { fontFamily: 'Georgia, Cambria, serif', fontSize: 28px, lineHeight: 35px, fontWeight: 400 }
  body: { fontFamily: 'system-ui, sans-serif', fontSize: 18px, lineHeight: 27px }
  small: { fontFamily: 'system-ui, sans-serif', fontSize: 16px, lineHeight: 24px }
spacing: { "1": 4px, "2": 8px, "3": 12px, "4": 16px, "5": 24px, "6": 32px, "7": 48px, "8": 64px }
rounded: { sm: 8px, md: 16px, pill: 999px }
---

# Brewprint espresso bar

Default dark: near-black walnut, warm ivory lettering, restrained burgundy and
brass. One original glass cutaway cup is centered in a softly lit scene; drink
choices sit directly beneath it. No repeating cup thumbnails or dashboard
panels. System serif headings and system sans-serif body text. No font CDNs,
stock assets, or third-party image dependencies.

## Components

Patterns live in `.agents/design/components.jsonc`.

- Cup: original SVG with glass reflections, a brass-edged saucer and steam.
  Constant interior height. Each layer's height is
  its amount divided by the declared capacity. Leave unused space visible.
  Ingredient chips beneath the cup are the text equivalent.
  Full-size HTML ingredient callouts connect to each layer with fine brass
  leaders. Separate thin/repeated layer labels without altering fill geometry.
  On phones, keep names at 16px beside the glass; amounts remain in the chips.
- Recipe choice: native button, `aria-pressed`, selected border and text cue;
  name and amount, no miniature cup. Clicking updates the central recipe cup.
  Pointer/touch selection brings an offscreen cup back into view; keyboard
  selection retains the user's place and announces the selected recipe.
- Mode switch: House menu / Build your own, two native pressed-state buttons.
  Both modes share the single central cup. Browsing shows recipes but preserves
  the custom build in memory; only "Use this recipe" replaces that build.
- Tray: original SVG ingredient icons beside the cup on its right, leaving
  the callouts on the left. No rectangular ingredient cards. Each icon is a
  native button labeled "Add {ingredient}": drag it to pour, or activate it
  with pointer, touch, Enter or Space. The drag ghost contains only its glyph.
  At 800px and narrower, show the icons above the cup in a compact row/grid.
  Keep the cup centered on wider screens and preserve 44px minimum targets.
- Builder: prominent labeled drop zone, visible drag feedback, polite live
  announcements, ingredient removal, undo last addition and reset.
  When ingredient totals match a house recipe's proportions, use its name
  and description above the cup and announce the match. Serving size and
  assembly order may differ; recognition never changes the build.
- API error: visible alert and explicit retry. No sample-data fallback.

## Layout and accessibility

Centered single-column experience, six choices below the cup (wrapping to two
columns on phones), 44px minimum targets and 3px offset focus rings.
Color never replaces labels. Body 18px, minimum UI
text 16px. Cup line art may scale, with full-size text outside the SVG.
Desktop maximum content width 1080px. Controls use 8px corners; mode switch
uses pill corners. SVG geometry and its scenic halo are original illustration,
not layout spacing tokens.
Use the spacing scale above; decorative borders may use 1-3px.

## Motion

Layer pours use 620ms eased reveals, staggered by 90ms in assembly order.
Existing layer geometry transitions over 700ms; glass reflections and gently
drifting steam are decorative. Never animate volume by normalizing a cup to
full. Reduced motion disables all animations/transitions and retains the final
accurate geometry immediately. No animation blocks clicking or keyboard use.

Foam represents
illustrative occupied volume, not liquid yield. Layers represent assembly
order, not density or fluid simulation.
