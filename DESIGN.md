---
name: Solar SaaS Design System
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4e4634'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#807662'
  outline-variant: '#d1c5ae'
  surface-tint: '#765b00'
  primary: '#765b00'
  on-primary: '#ffffff'
  primary-container: '#efc13e'
  on-primary-container: '#674f00'
  inverse-primary: '#efc13e'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#615e55'
  on-tertiary: '#ffffff'
  tertiary-container: '#cac6bb'
  on-tertiary-container: '#55524a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf93'
  primary-fixed-dim: '#efc13e'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#594400'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e7e2d6'
  tertiary-fixed-dim: '#cac6bb'
  on-tertiary-fixed: '#1d1c15'
  on-tertiary-fixed-variant: '#49473e'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
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
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The visual identity is built upon the concept of "Illuminated Efficiency." It translates the solar energy from the logo into a high-performance executive SaaS environment. The brand personality is radiant and optimistic yet grounded in data-driven professionalism. 

The design style follows a **Modern Corporate** aesthetic with **Tactile** accents. It utilizes ample whitespace to ensure clarity, while using the vibrant yellow palette to highlight critical actions and data insights. The goal is to evoke a sense of reliability and forward-thinking energy, moving away from cold, traditional enterprise blues in favor of a warm, human-centric solar palette.

## Colors
The palette is derived directly from the solar-themed logo, optimized for digital accessibility and executive interfaces.

- **Primary (Solar Gold):** Used for primary calls-to-action, active states, and data highlights. It represents energy and the core focus of the product.
- **Secondary (Charcoal):** Used for primary typography, headers, and navigation backgrounds to provide a professional, high-contrast anchor.
- **Tertiary (Warm White):** A soft, sun-bleached off-white used for large background surfaces to reduce eye strain compared to pure white.
- **Neutrals:** A range of greys used for borders, secondary text, and disabled states, ensuring the primary gold remains the focal point.

## Typography
Plus Jakarta Sans is the sole typeface for this design system to maintain a cohesive, modern, and energetic feel. Its geometric construction mirrors the "O" and sun-disk shapes in the logo.

- **Headlines:** Use Bold weights with tight letter-spacing to create a sense of executive authority.
- **Body:** Standardized at 16px for optimal readability in data-heavy SaaS environments.
- **Labels:** Utilized for table headers and small UI descriptors, often paired with a slight uppercase treatment to differentiate from body text.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy emphasizes "Radiant Hierarchy"—placing the most critical solar-data visualizations at the center or top-left "hotspots" of the screen.

- **Desktop:** 12 columns with 24px gutters. Max-width container of 1440px to ensure legibility on ultra-wide monitors.
- **Tablet:** 8 columns with 20px gutters. 
- **Mobile:** 4 columns with 16px gutters and 16px side margins.
- **Rhythm:** All spacing follows a 4px baseline grid to ensure mathematical harmony and alignment across components.

## Elevation & Depth
Depth is handled through **Tonal Layering** supplemented by **Ambient Solar Shadows**. 

Instead of traditional neutral shadows, shadows in this design system have a very subtle yellow tint (#EFC13E at 5-10% opacity) to simulate light reflecting off the primary brand color.
- **Level 0 (Base):** Warm White background (#F9F4E8).
- **Level 1 (Cards/Surface):** Pure White (#FFFFFF) with a soft 2px border (#EAEAEA).
- **Level 2 (Dropdowns/Modals):** Pure White with a diffused shadow (0px 8px 24px) tinted with the primary yellow.

## Shapes
The shape language is inspired by the sun disk and the radiating rays. We use a **Rounded** (0.5rem) approach for most UI elements to feel approachable and modern, avoiding the harshness of sharp corners.

Buttons and specific "status" chips may use **Pill** shapes to echo the circularity of the logo's core icon. Interactive elements should feel soft and "clickable," inviting user engagement through radius consistency.

## Components
- **Buttons:** Primary buttons use the Solar Gold (#EFC13E) with Charcoal text (#2D2D2D) for maximum impact. Hover states involve a slight scale increase (1.02x) and a deepening of the shadow to feel "energized."
- **Input Fields:** Use a subtle inset shadow to appear recessed into the UI. Focus states use a 2px Solar Gold border.
- **Chips:** Used for status indicators (e.g., "Active," "Optimized"). These use low-opacity versions of the primary color with high-contrast text.
- **Cards:** White surfaces with a 1px border. The top of important cards can feature a 4px "Radiance Border" in Solar Gold to denote priority.
- **Data Visuals:** Charts should prioritize the brand yellow, using Charcoal and Neutral Greys for secondary data sets to ensure the solar identity remains dominant.
- **Navigation:** A dark-themed sidebar using the Secondary Charcoal (#2D2D2D) provides a high-contrast frame that makes the internal "Solar" content pop.