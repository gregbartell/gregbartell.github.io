---
version: alpha
name: Centennial
description: "Personal-hobby aesthetic for the Washington License Plate Collection, drawn from the 1989 Washington Centennial license plate: sky gradients, stamped-aluminum surfaces, paper index slips, and registration-sticker accents."
colors:
  primary: "#14213d"
  secondary: "#b9d6e8"
  tertiary: "#c8252c"
  neutral: "#fbfcfd"
  ink: "#14213d"
  ink-2: "#1f2c52"
  ink-line: "rgba(20, 33, 61, 0.18)"
  cherry: "#c8252c"
  cherry-deep: "#8e161c"
  paper-top: "#fbfcfd"
  sky-haze: "#e7f0f6"
  sky-pale: "#d2e2ec"
  sky: "#b9d6e8"
  sky-deep: "#a8c6d6"
  silhouette-back: "#c5dbe7"
  silhouette-front: "#a4c1d4"
  paper-line: "#d4dde4"
  warning: "#c47c0e"
  tab-black: "#0e1726"
  tab-green: "#1d6d3a"
  tab-red: "#b21e23"
  tab-blue: "#1c4d8c"
  tab-blue-hover: "#163d70"
  white: "#ffffff"
typography:
  body-md:
    fontFamily: Recursive
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: "1.55"
    letterSpacing: "0"
  display-flourish:
    fontFamily: Bevan
    fontSize: 1.75rem
    fontWeight: "400"
    lineHeight: "1.05"
    letterSpacing: 0.005em
  subtitle:
    fontFamily: Bevan
    fontSize: "clamp(1.25rem, 2.8vw, 1.95rem)"
    fontWeight: "400"
    lineHeight: "1"
    letterSpacing: 0.005em
  headline-lg:
    fontFamily: Big Shoulders Display
    fontSize: "clamp(1.7rem, 3vw, 2.2rem)"
    fontWeight: "900"
    lineHeight: "1"
    letterSpacing: 0.07em
  headline-md:
    fontFamily: Big Shoulders Display
    fontSize: 1.7rem
    fontWeight: "900"
    lineHeight: "1"
    letterSpacing: 0.06em
  title-md:
    fontFamily: Spectral
    fontSize: 1.15rem
    fontWeight: "700"
    lineHeight: normal
    letterSpacing: "0"
  category-header:
    fontFamily: Recursive
    fontSize: 0.8rem
    fontWeight: "700"
    lineHeight: normal
    letterSpacing: 0.14em
  button-md:
    fontFamily: Big Shoulders Display
    fontSize: 1rem
    fontWeight: "800"
    lineHeight: "1"
    letterSpacing: 0.14em
  label-md:
    fontFamily: Big Shoulders Display
    fontSize: 0.85rem
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: 0.18em
  label-sm:
    fontFamily: Big Shoulders Display
    fontSize: 0.62rem
    fontWeight: "900"
    lineHeight: "1"
    letterSpacing: 0.16em
  sticker-foot:
    fontFamily: Big Shoulders Display
    fontSize: 0.3em
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: 0.2em
  index-body:
    fontFamily: Recursive
    fontSize: 0.74rem
    fontWeight: "400"
    lineHeight: normal
    letterSpacing: "0"
rounded:
  sticker: 2px
  modal: 3px
  stamped-card: 6px
  card-base: 8px
  dot: 50%
spacing:
  page-max: 1200px
  wordmark-max: 720px
  grid-min-column: 280px
  grid-gap: 1.5rem
  section-gap: 3.5rem
  desktop-main-padding: "2.5rem 1.5rem 4rem"
  mobile-main-padding: "2rem 1rem 3rem"
  mobile-breakpoint: 700px
components:
  masthead:
    background: "paper-to-sky gradient with mountain silhouettes"
    maxWidth: "{spacing.page-max}"
    wordmarkMaxWidth: "{spacing.wordmark-max}"
  button-primary:
    backgroundColor: "{colors.tab-blue}"
    textColor: "{colors.white}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sticker}"
    padding: "0.8rem 1.7rem 0.7rem"
  button-primary-hover:
    backgroundColor: "{colors.tab-blue-hover}"
  plate-card:
    backgroundColor: "{colors.paper-top}"
    textColor: "{colors.ink}"
    borderColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.stamped-card}"
  category-sticker:
    backgroundColor: "{colors.tab-blue}"
    textColor: "{colors.white}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sticker}"
    padding: "5px 10px 4px"
  badge-warning:
    backgroundColor: "{colors.tab-red}"
    textColor: "{colors.white}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sticker}"
    padding: "4px 8px 3px"
  empty-plate:
    backgroundColor: "{colors.paper-top}"
    stripeColor: "{colors.tab-blue}"
    stampColor: "{colors.cherry}"
    typography: "{typography.index-body}"
    fontVariationSettings: '"MONO" 1'
  status-modal:
    backgroundColor: "{colors.paper-top}"
    textColor: "{colors.ink}"
    rounded: "{rounded.modal}"
    maxWidth: 880px
  image-modal:
    overlayColor: "rgba(20, 33, 61, 0.88)"
    rounded: "{rounded.sticker}"
---

# Design System: Washington License Plate Collection

## 1. Visual Theme & Atmosphere

This site is a personal catalog interface built around the visual memory of the
1989 Washington Centennial license plate. The page uses pale Pacific Northwest
sky gradients, faint paper grain, and layered mountain silhouettes to make the
whole viewport feel like a soft plate background rather than a generic web page.

The UI language is deliberately tactile: plate cards have navy stamped rims,
embossed edge highlights, hard ground shadows, and small renewal-tab stickers.
The voice is casual and a little self-deprecating. This is a labor-of-love hobby
site, not a corporate product, and the design should feel handmade, regional,
archival, and nostalgic without tipping into kitsch.

## 2. Color Palette & Roles

### Primary Foundation

**Plate Ink Navy (#14213d)** is the primary text, card rim, rule, status badge,
modal overlay base, and structural shadow color. It is the authoritative
"printed record" tone of the system. **Lifted Ink Navy (#1f2c52)** is a subtle
secondary structural text color for modal category headers. **Ink Line
(rgba(20, 33, 61, 0.18))** is the translucent rule used for footer dividers,
scrollbar thumbs, and quiet structural lines.

**Paper Top (#fbfcfd)** is the near-white card, modal, intro panel, and masthead
top surface. **Paper Line (#d4dde4)** handles hairlines, dividers, card title
rules, and dashed empty states.

**Sky Haze (#e7f0f6), Sky Pale (#d2e2ec), Plate Sky (#b9d6e8), and Sky Deep
(#a8c6d6)** create the fixed page gradient, masthead gradient, image backing,
and pale empty-state surface. Sky Deep is the lower atmospheric stop that gives
the page and masthead gradients a little more depth; `--cream` aliases Sky Haze
and `--paper` aliases Paper Top in the current CSS.

**Silhouette Back (#c5dbe7)** and **Silhouette Front (#a4c1d4)** are receding
mountain tints used only in the masthead SVG.

### Accent & Interactive

**Cherry Registration Red (#c8252c)** is the main personality accent. It appears
on the subtitle, intro panel rule, section header double rules, focus outlines,
footer flourish, action-button dot, and pending-photo stamp. **Deep Cherry
(#8e161c)** appears in the live CSS as a literal wordmark drop-shadow tint
rather than as a named custom property.

**Registration Blue (#1c4d8c)** is the primary button, category sticker option,
and empty-plate strip. Its hover state deepens to **Pressed Tab Blue
(#163d70)**.

**Tab Black (#0e1726), Tab Green (#1d6d3a), Tab Red (#b21e23), and Tab Blue
(#1c4d8c)** are the small registration-sticker palette. They should stay on
labels, badges, and category markers rather than becoming large content fields.

**Warning Amber (#c47c0e)** is reserved for the status modal's photo-upgrade
column marker.

### Typography & Text Hierarchy

All foreground text ultimately sits on Ink Navy, Lifted Ink Navy, or White.
White is only used inside saturated sticker/button surfaces and modal controls.
Lifted Ink Navy should stay secondary and structural, not become a separate body
copy color.

### Functional States

Focus is a 2px Cherry outline with 3px offset. Hover states use shallow physical
movement: the status button lifts 2px, plate cards lift 4px, and close buttons
scale to 1.1. Missing photos render as paper index slips; low-quality photos get
a Tab Red "LOW QUALITY" sticker.

## 3. Typography Rules

### Hierarchy & Weights

**Recursive** is the body face for readable copy, status lists, tabular badge
numbers, and the monospaced-feeling index slip body. Body text is 1rem at 1.55
line-height.

**Big Shoulders Display** is the official stamped display face. It is uppercase
for section headings, action buttons, modal headings, modal column headings,
stickers, labels, and badges. It uses heavy weights from 700 to 900 and broad
tracking from 0.04em to 0.22em.

**Spectral** is reserved for plate-card titles at 1.15rem and 700 weight,
creating a small museum-label feeling beneath each image.

**Bevan** is used sparingly for personality: the masthead subtitle, the intro
welcome line, and the footer flourish. It stays cherry-colored and heavy.

Use one display face per element. Do not mix Big Shoulders Display and Bevan in
the same line; Big Shoulders does official stamped work, while Bevan carries
personality moments.

### Spacing Principles

Display text is tight vertically, often line-height 1, to mimic stamped plate
lettering. Body copy remains more relaxed at 1.55. Tracking increases as labels
get smaller: the main section heading uses 0.07em, buttons use 0.14em, category
sticker footers use 0.2em, and index-strip text uses 0.22em.

## 4. Component Stylings

### Buttons

The primary action button is a registration tab: Registration Blue background,
white uppercase Big Shoulders Display text, 2px corners, a small Cherry dot,
inset highlights, a hard navy ground shadow, and a soft blue cast shadow. Hover
darkens the blue and lifts the button 2px; active returns it to the page.

### Cards & Plate Containers

Plate cards are Paper Top surfaces with Ink Navy rims. With
`body.stamped-cards`, they use a 2px border, 6px radius, an embossed top edge,
a pressed bottom fold, a hard navy ground shadow, and a soft cast shadow.
Images keep a fixed 2:1 aspect ratio and cover the available width; titles sit
in a Spectral paper strip separated by a Paper Line divider.

Depth comes from a layered shadow stack rather than a single drop shadow: a
1px inset white top highlight, a 1px inset navy bottom fold, a short hard navy
ground shadow, and a diffuse navy cast shadow. This keeps cards feeling like
die-cut stamped tags resting on paper.

### Navigation

There is no global navigation. The page is organized as a stacked catalog of
category sections, each introduced by a registration-sticker code and a
red thick-thin double rule. The status checklist is the only top-level control,
centered below the intro.

### Inputs & Forms

The site has no form fields. Interactive controls are buttons and clickable
plate images. Focus treatment is shared across the status button, image
buttons, and modal close buttons.

### Domain-Specific Components

**Category stickers** are tiny renewal-tab labels with 2px corners, white text,
and color-coded grounds from the tab palette. They combine a short mark such as
`UNI`, `MIL`, or `SPT` with a footer line such as `WASHINGTON`.

**Empty plate placeholders** render missing photos as archival index slips:
paper grain, a Registration Blue strip, Recursive body rows with the `"MONO" 1`
font-variation setting, dashed write-in lines, and a rotated Cherry "Pending"
rubber stamp.

**Status modal** is an official-document panel: Paper Top background, 3px radius,
5px Cherry top border, heavy shadow stack, two-column grid, sticky uppercase
column headers, count badges, and thin scrollbars.

**Image modal** is a focused preview: Ink Navy overlay at high opacity with a
4px backdrop blur, the image constrained to 90% of viewport width and height,
2px image radius, and a large soft black shadow.

## 5. Layout Principles

### Grid & Structure

The masthead is full width with a centered 1200px inner column and a wordmark
image capped at 720px. The main content also caps at 1200px and uses stacked
sections. Plate entries use CSS Grid with `repeat(auto-fill, minmax(280px, 1fr))`
and a 1.5rem gap.

### Whitespace Strategy

Spacing follows a loose 4px/8px rhythm expressed mostly in rem values. The main
content uses `2.5rem 1.5rem 4rem` padding on desktop and `2rem 1rem 3rem` at
the mobile breakpoint. Sections are separated by 3.5rem. The intro card uses
about 24px internal padding, plate cards use compact 1rem title padding, and
the modal uses 2rem by 2.5rem padding.

### Alignment & Visual Balance

The masthead and footer are centered; catalog content is left-aligned for easy
scanning. Section headings flex-wrap so stickers and labels can stay together
on smaller screens without forcing overflow. Cards prioritize image inspection
with a stable 2:1 media area and compact labels.

### Responsive Behavior & Touch

At `max-width: 700px`, the status modal collapses from two columns to one,
masthead and main padding shrink, and the status button becomes smaller but
keeps generous tap padding. Image previews and the status modal use viewport
constraints (`90%` image bounds, `92%` modal width, `92vh` max height) to remain
usable on small screens.

## 6. Design System Notes for Stitch Generation

### Language to Use

Use phrases like "Washington Centennial plate", "soft Pacific Northwest sky",
"stamped aluminum", "registration tab", "paper index slip", "archival hobby
catalog", "navy ink", and "cherry red accent".

### Color References

Use Ink Navy for text and rims, Lifted Ink Navy for subtle secondary structure,
Paper Top for cards and modal bodies, Sky Haze and Sky Pale for page atmosphere,
Plate Sky and Sky Deep for the lower gradient/image surround zone, Cherry for
rare accent marks, and the registration-tab palette only for small stickers and
badges.

### Component Prompts

Create a plate-card grid with 2:1 photo thumbnails, near-white paper title
strips, navy stamped rims, subtle embossed edge highlights, and a layered hard
plus soft shadow stack.

Create a missing-photo placeholder as a paper index slip with a blue catalog
strip, dashed metadata lines, and a rotated cherry rubber stamp reading
"Pending".

Create a checklist modal as an official paper document over a dark navy blurred
backdrop, with a cherry top rule, uppercase condensed headings, count badges,
and two responsive status columns.

### Incremental Iteration

Preserve the near-square industrial radii: 2px for stickers and buttons, 3px
for modal/document panels, and 6px for stamped plate cards. Do not introduce
large rounded cards, large decorative gradients, or unrelated illustrative
elements; the sky gradient, mountain silhouettes, and plate photos already
provide the visual identity.

### Guardrails

- Do reserve Cherry Red for moments of personality, status accents, focus
  outlines, and rubber-stamp details. Do not use it for large structural
  surfaces.
- Do keep card corners distinct from sticker, tab, and badge corners. Stamped
  cards use 6px; stickers, tabs, and badges use 2px.
- Do keep the registration-tab palette on category coding and small badges. Do
  not use those colors for body text, links, or large content fields.
- Do let the sky gradient and mountain silhouette carry the regional identity.
  Do not add competing decorative imagery on top of them.
