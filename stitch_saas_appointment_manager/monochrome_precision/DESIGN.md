---
name: Monochrome Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system prioritizes absolute clarity and functional minimalism for high-density SaaS environments. By stripping away color-driven emotional cues, the interface directs total focus toward data and user intent. The aesthetic is rooted in a refined interpretation of **Minimalism** blended with **Corporate Modern** structures, heavily influenced by the structural logic of Material Design 3 but executed with a strict grayscale discipline.

The target audience consists of professionals in data-heavy industries (SaaS, FinTech, DevTools) who value efficiency over ornamentation. The emotional response is one of calm authority, reliability, and precision.

**Style Guidelines:**
- **Strict Grayscale:** Use color only for critical state-based interruptions (if absolutely necessary, otherwise use weight and symbols).
- **Whitespace as Hierarchy:** Larger gaps denote distinct functional blocks; smaller gaps denote related data points.
- **Intentional Reduction:** Every border, shadow, and line must serve a structural purpose. If it doesn't aid navigation, remove it.

## Colors

The palette is restricted to a high-contrast monochrome scale to ensure maximum legibility and a sophisticated, "archival" digital aesthetic.

- **Primary (#111111):** Used for primary actions, headings, and high-emphasis icons.
- **Secondary (#F5F5F5):** The "Surface" color. Used for large background areas and subtle container differentiation.
- **Tertiary (#FFFFFF):** The "Elevated Surface" color. Used for cards, modals, and input fields to make them pop against the secondary background.
- **Neutral/Border (#E5E5E5):** Used exclusively for structural strokes and dividers.

State signaling should rely on **Black** for active/selected states and **Light Gray** for inactive/disabled states.

## Typography

The design system utilizes **Inter** for all roles. Its neutral, systematic nature supports the "utility-first" philosophy of the dashboard. 

**Application Rules:**
- **Headlines:** Use tight letter-spacing and semi-bold weights to create a strong visual anchor.
- **Body:** Standard weight for readability. Use `body-md` as the default for dashboard metrics and table data.
- **Labels:** Use `label-sm` with uppercase treatment for table headers and category descriptors to differentiate them from interactive data.

## Layout & Spacing

This design system employs a **12-column fluid grid** for the main content area, allowing the dashboard to scale from laptop screens to ultra-wide monitors effectively.

- **Grid Logic:** Use a 24px gutter to maintain a sense of openness. Margins on desktop are 32px, providing "breathing room" at the edges of the viewport.
- **Spacing Scale:** A strict 4px base unit (4, 8, 16, 24, 32, 48, 64) is used for all internal component padding and margins.
- **Mobile Adaptation:** On mobile devices, the grid collapses to a single column with 16px margins. Headlines scale down per the typography tokens to maintain hierarchy without overflowing.

## Elevation & Depth

In a monochrome system, depth is communicated through **Tonal Layers** and extremely **Subtle Shadows**.

1.  **Level 0 (Base):** Background color `#F5F5F5`.
2.  **Level 1 (Cards/Sheet):** Surface color `#FFFFFF` with a 1px border of `#E5E5E5`.
3.  **Level 2 (Interactive/Floating):** Surface color `#FFFFFF` with a subtle ambient shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`.

Shadows are never harsh or high-opacity. They should appear as a soft diffusion of light rather than a dark silhouette. No gradients are permitted; depth is purely a matter of layering white surfaces over light gray backgrounds.

## Shapes

The design system utilizes a **Rounded** shape language to soften the industrial feel of the monochrome palette.

- **Base Radius:** 8px (`rounded-md`) for buttons and input fields.
- **Container Radius:** 12px–16px (`rounded-lg` or `rounded-xl`) for cards, modals, and main content areas.
- **Logic:** Larger components receive larger radii to emphasize their role as "containers" of information, while smaller interactive elements remain slightly sharper for a tool-like precision.

## Components

### Buttons
- **Primary:** Solid `#111111` background with `#FFFFFF` text. No border.
- **Secondary:** White `#FFFFFF` background with a 1px `#E5E5E5` border and `#111111` text.
- **Ghost:** Transparent background, `#111111` text. Used for low-priority actions.

### Input Fields
- **Default:** White background, 1px `#E5E5E5` border. 
- **Focus:** 1.5px `#111111` border. 
- **Labels:** Positioned above the field using `label-md` in `#111111`.

### Status Badges (Chips)
- **Neutral:** `#F5F5F5` background with `#111111` text.
- **High Emphasis:** `#111111` background with `#FFFFFF` text.
- Badges should use `label-sm` typography and a pill-shape (radius: 100px).

### Cards
- White background, 1px `#E5E5E5` border, 12px-16px corner radius.
- Use 24px internal padding to maintain the minimalist aesthetic.

### Data Tables
- Clean, no vertical borders. 
- Headers: `label-sm` (uppercase) with a 1px bottom border of `#E5E5E5`.
- Rows: 56px height, subtle `#F5F5F5` hover state.