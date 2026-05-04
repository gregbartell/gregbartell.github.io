---
version: alpha
name: Centennial
description: Personal-hobby aesthetic for the Washington License Plate Collection, drawn from the 1989 WA Centennial license plate — sky gradients, stamped-aluminum surfaces, and registration-sticker accents.

colors:
  primary: "#14213d"           # ink — navy used for text, card rims, structure
  secondary: "#b9d6e8"         # sky — the plate's mid-band atmosphere
  tertiary: "#c8252c"          # cherry — heritage WA red, used sparingly for accents
  neutral: "#fbfcfd"           # paper — near-white card and page-top surface

  ink-2: "#1f2c52"
  cherry-deep: "#8e161c"
  sky-haze: "#e7f0f6"
  sky-pale: "#d2e2ec"
  sky-deep: "#a8c6d6"
  paper-line: "#d4dde4"
  silhouette-back: "#c5dbe7"
  silhouette-front: "#a4c1d4"

  # Registration-sticker palette — used to color-code category headings and badges
  tab-black: "#0e1726"
  tab-green: "#1d6d3a"
  tab-red: "#b21e23"
  tab-blue: "#1c4d8c"

typography:
  display:
    fontFamily: Bevan
    fontSize: 1.75rem
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.005em
  headline-lg:
    fontFamily: Big Shoulders Display
    fontSize: 2.2rem
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0.07em
  headline-md:
    fontFamily: Big Shoulders Display
    fontSize: 1.7rem
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0.06em
  title-md:
    fontFamily: Spectral
    fontSize: 1.15rem
    fontWeight: 700
    lineHeight: 1.2
  body-md:
    fontFamily: Recursive
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  label-md:
    fontFamily: Big Shoulders Display
    fontSize: 0.85rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.18em
  label-sm:
    fontFamily: Big Shoulders Display
    fontSize: 0.78rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.22em

rounded:
  sm: 2px      # buttons, registration tabs, stickers — die-cut metal
  md: 6px      # stamped plate cards
  lg: 8px      # softer non-stamped card variant

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container: 1200px

components:
  button-primary:
    backgroundColor: "{colors.tab-blue}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 0.65rem 1.4rem 0.55rem
  button-primary-hover:
    backgroundColor: "#163d70"

  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"

  badge:
    backgroundColor: "{colors.tab-red}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 4px 8px 3px

  modal:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: 3px
---

# Centennial

A personal design system for *My Washington License Plate Collection*, a hobby site cataloging photographs of WA State special license plates.

## Overview

The visual identity borrows directly from the **1989 Washington Centennial license plate**: a soft Pacific Northwest sky gradient fading into the silhouette of distant mountain ranges, with stamped-aluminum cards riding on top. Heritage cherry red — the same red found on older WA plates — handles accents and personality. A four-color **registration-sticker palette** (the renewal tabs glued to a license plate's corner) codes section headings and badges.

The voice is casual and a little self-deprecating. This is a labor of love, not a corporate product, and the design should feel handmade, regional, and a little nostalgic without tipping into kitsch.

## Colors

The palette is built around three roles plus a paper neutral.

- **Primary — Ink (#14213d):** A deep navy for body text, plate-card rims, and structural lines. The "permanent record" tone of the system. `ink-2` is a slightly lifted shade for secondary structural moments.
- **Secondary — Sky (#b9d6e8):** The middle band of the Centennial-plate atmosphere. Sky extends across a five-stop gradient from `paper-top` (near-white horizon) through `sky-haze`, `sky-pale`, and `sky` down to `sky-deep` at the base. Together they paint the masthead and any "open sky" surface.
- **Tertiary — Cherry (#c8252c):** Heritage WA red, used sparingly: the page subtitle, the footer flourish, the intro card's left rule, the status-button indicator dot, and the "Awaiting Photo" rubber stamp. `cherry-deep` (#8e161c) reinforces shadows and stamp ink.
- **Neutral — Paper (#fbfcfd):** The off-white page and card surface. Pairs with `paper-line` (#d4dde4) for hairlines and dividers.

**Mountain silhouettes** (`silhouette-back`, `silhouette-front`) are lighter sky tints so the ranges recede behind foreground content rather than competing with it.

The **registration-sticker palette** — `tab-black`, `tab-green`, `tab-red`, `tab-blue` — codes category headings (one color per category) and powers small badges. These hues never appear in body text.

## Typography

Four typefaces, each with a clear role:

- **Recursive** — body copy. A variable sans that also handles tabular figures in status badges.
- **Big Shoulders Display** — section headlines, button labels, and registration-sticker text. Always uppercase, 900 weight for headlines and 700 for labels, with generous letter-spacing (0.06–0.22em depending on size). It does the "stamped, official-looking" work.
- **Spectral** — plate-card titles. A serif that gives each entry a small museum-card feel.
- **Bevan** — cherry-colored flourishes: the subtitle, the welcome line in the intro card, and the footer line. A heavy slab reserved for moments of personality.

Use one display face per element — don't mix Big Shoulders and Bevan in the same line.

## Layout

A single content column, max 1200px (`spacing.container`), centered with generous side gutters that collapse on narrow viewports. The plate index uses a CSS Grid with `auto-fill` columns at `minmax(280px, 1fr)`, gapped 24px (`spacing.lg`). Sections are stacked with roughly 56px of vertical breathing room between them.

Spacing follows a loose 4/8 px rhythm rather than a rigid grid.

## Elevation & Depth

Cards mimic die-cut stamped-aluminum tags resting on paper. Depth comes from a layered shadow stack, not a single drop shadow:

1. **Embossed top rim** — a 1px inset white highlight catching the upper edge.
2. **Pressed bottom fold** — a 1px inset navy shadow where the plate meets the paper.
3. **Hard ground shadow** — short, offset, near-opaque navy, suggesting the sharp shadow of a thick object.
4. **Soft cast** — a diffuse navy glow further below, blending the card into the page.

The masthead is a top-down gradient from `paper-top` through the sky stops to `sky-deep`, with mountain silhouettes layered at the bottom. A faint radial-dot grain overlays the body and masthead to suggest paper texture.

## Shapes

Corners are nearly square — the design language is *industrial / stamped*.

- **2px (`rounded.sm`)** — buttons, registration tabs, stickers, badges. Reads as die-cut metal.
- **6px (`rounded.md`)** — plate cards. Just enough softness to feel hand-held.
- **8px (`rounded.lg`)** — softer non-stamped card variant.

Don't mix the sticker scale and the card scale within a single element.

## Components

### Buttons

The primary button is modeled on a registration sticker: deep blue ground (`tab-blue`), white uppercase Big Shoulders Display label with 0.18em tracking, a small cherry indicator dot, 2px corners, and a layered inset-plus-cast shadow. Hover lifts the button 2px and deepens both shadow and saturation.

### Cards

Cards use the paper neutral over a 1–2px navy rim and the four-stack stamped shadow described in *Elevation & Depth*. Card titles use `title-md` (Spectral 700) on a paper header strip separated from the photo by a 1px paper line. Cards may carry a small registration-sticker badge in the top-right corner to flag status.

### Badges

Badges are tiny stickers in the registration-tab palette — typically `tab-red` for warnings — using `label-sm` text, white ink, 2px corners, and the same inset-highlight-plus-shadow stack as the registration tabs they imitate.

### Modals

Modals sit over a navy-tinted backdrop with a 4px backdrop blur. Content is paper-colored, ~880px max width, with a 5px cherry top border (an "official document" mark) and a stacked paper-card shadow.

## Do's and Don'ts

- **Do** reserve cherry red for moments of personality (subtitle, footer, accents, rubber stamps) and for actionable cues (the status-button indicator). **Don't** paint structural elements cherry.
- **Do** use one display face per element. **Don't** mix Big Shoulders Display and Bevan in the same line.
- **Do** keep card corners (6–8px) distinct from sticker / tab / badge corners (2px). **Don't** use one radius across both.
- **Do** use the registration-tab palette only for category coding and badges. **Don't** substitute it for body text, links, or large surfaces.
- **Do** let the sky gradient and mountain silhouette carry the page's regional identity. **Don't** add competing decorative imagery on top of them.
