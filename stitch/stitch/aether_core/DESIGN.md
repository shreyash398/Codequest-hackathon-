# Design System Specification: The Kinetic Ether

## 1. Overview & Creative North Star
The "Kinetic Ether" is the Creative North Star for this design system. It moves away from the static, mechanical interfaces of the past and into a fluid, luminous future. This system treats data as "captured light"—energy contained within layers of translucent glass and deep space.

To break the "template" look, we utilize **Intentional Asymmetry**. Dashboards should not be rigid grids; instead, they should feel like a coordinated organic system. Large-scale data visualizations (using `display-lg`) should overlap slightly with secondary control cards, creating a sense of three-dimensional depth and "breathing" space that feels high-end and editorial rather than purely utilitarian.

## 2. Colors: The Luminous Spectrum
The palette is rooted in the void of deep space, punctuated by high-chroma energy signals.

### Surface Hierarchy & The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through **Background Color Shifts**. 
- Place a `surface_container_low` card on a `background` base to create a subtle lift.
- Use `surface_container_highest` for active, interactive elements to pull them toward the user.
- **Nesting:** Never nest the same surface tier. If a container sits inside another, it must jump at least one tier (e.g., a `surface_container_low` inner element inside a `surface_container_highest` parent).

### The "Glass & Gradient" Rule
Floating elements (modals, tooltips, hover states) must utilize **Glassmorphism**. 
- Use `surface_variant` at 40-60% opacity with a `backdrop-filter: blur(24px)`.
- **Signature Textures:** For primary CTAs, do not use flat fills. Use a linear gradient from `primary` (#69daff) to `primary_container` (#00cffc) at a 135-degree angle to provide a "charged" aesthetic.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `background` | #070e1b | The base "void" layer. |
| `primary` | #69daff | Electric Blue: Active energy, flow, and primary actions. |
| `secondary` | #d674ff | Vibrant Purple: Optimization, AI insights, and secondary data. |
| `tertiary` | #8eff71 | Neon Green: Efficiency, positive status, and renewable sources. |
| `error` | #ff716c | Glowing Red: Critical waste, alerts, and system failure. |

## 3. Typography: Technical Elegance
We utilize a pairing of **Space Grotesk** (for high-impact data) and **Inter** (for technical precision).

*   **Display & Headlines (Space Grotesk):** These are the "Command" fonts. They should feel authoritative and slightly wider than standard fonts. Use `display-lg` for primary energy metrics to make them feel like monumental achievements.
*   **Body & Labels (Inter):** These are the "Operational" fonts. They provide maximum legibility against dark, blurred backgrounds. 
*   **Hierarchy Tip:** To convey brand identity, use `headline-sm` in `secondary` purple for section headers to create a rhythmic visual break from the `primary` blue data.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** and light physics, not drop shadows.

*   **The Layering Principle:** Use the `surface_container` tiers to stack elements. A `surface_container_lowest` (#000000) card on a `surface` background creates a "well" or "inset" effect, perfect for data logs.
*   **Ambient Shadows:** For floating glass panels, use shadows with a `40px` blur and `6%` opacity. The shadow color must be a tinted version of `surface_tint` (#69daff) to mimic the way blue light refracts through glass.
*   **The "Ghost Border":** When containment is required, use `outline_variant` at 15% opacity. This creates a "specular highlight" on the edge of the glass rather than a physical line.
*   **Glow States:** Elements with `primary` or `tertiary` status should have a subtle outer glow (`box-shadow: 0 0 15px rgba(142, 255, 113, 0.3)`) to indicate they are "powered on."

## 5. Components

### Cards & Containers
- **Visuals:** Minimum `rounded-lg` (2rem/32px) corner radius. Use `backdrop-filter: blur(20px)`.
- **Spacing:** No dividers. Separate content using `1.5rem` to `3rem` of vertical white space. Use `surface_container_low` background shifts to distinguish "header" areas from "content" areas.

### Buttons & Interaction
- **Primary:** Gradient fill (`primary` to `primary_dim`) with a `label-md` uppercase font. Subtle `0.5rem` glow on hover.
- **Secondary:** Transparent background with a `Ghost Border` (20% opacity `outline`).
- **Tertiary/Ghost:** No container. Use `primary` text with a trailing icon that shifts 4px on hover.

### Data Visualizations (High-Contrast)
- **Gauges:** Use `secondary` for the "path" and `primary` for the "fill." 
- **Active States:** Charts should feature a "pulse" animation on data nodes using `tertiary_fixed`.

### Input Fields
- **Base State:** `surface_container_high` with 20% opacity.
- **Focus State:** Border transitions to 40% `primary` opacity with a subtle inner glow. The label (`label-sm`) should float above and glow slightly in the `primary` color.

### Additional Contextual Components
- **Energy Pulse Chips:** Small `full` rounded chips with a slow opacity breathing animation (0.4 to 1.0) to indicate real-time data streaming.
- **Glass Overlays:** Full-screen blurs for system-wide alerts, using `error_container` at low opacity to "tint" the entire interface red during emergencies.

## 6. Do's and Don'ts

### Do
- **Do** use overlapping elements. Let a glass card sit 20px over the edge of a background gradient.
- **Do** prioritize legibility. Dark backgrounds require higher contrast; use `on_background` (#e2e8fb) for all critical text.
- **Do** use rounded corners generously. The `xl` (3rem) radius is preferred for large dashboard containers to soften the futuristic aesthetic.

### Don't
- **Don't** use solid black (#000000) unless it is for the `surface_container_lowest` layer to create depth.
- **Don't** use high-opacity borders. They break the illusion of light and glass.
- **Don't** use standard "drop shadows" (black/grey). Always tint your shadows with the accent color of the component.
- **Don't** crowd the interface. If a screen feels full, increase the spacing scale. Energy centers require "mental room" to process critical data.