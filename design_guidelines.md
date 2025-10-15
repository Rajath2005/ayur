# Ayurvedic AI Chatbot - Design Guidelines

## Design Approach
**Selected Approach:** Hybrid Design System with Wellness Focus
- **Foundation:** Material Design principles for familiar, accessible patterns
- **Aesthetic Inspiration:** Headspace, Calm, and modern telehealth platforms
- **Core Philosophy:** Blend clinical trust with natural wellness aesthetics

## Color Palette

### Light Mode
- **Primary (Herbal Green):** 142 45% 35% - Deep, trustworthy sage green for primary actions and branding
- **Primary Hover:** 142 45% 30% - Darker shade for interactive states
- **Secondary (Warm Accent):** 35 70% 60% - Warm terracotta/amber for secondary CTAs and highlights
- **Background Base:** 0 0% 98% - Soft off-white for main backgrounds
- **Surface:** 0 0% 100% - Pure white for cards and elevated surfaces
- **Text Primary:** 142 20% 15% - Deep charcoal with green undertone
- **Text Secondary:** 142 15% 45% - Muted gray-green for supporting text
- **Border:** 142 15% 85% - Subtle green-tinted borders

### Dark Mode
- **Primary (Herbal Green):** 142 40% 55% - Brighter sage for visibility on dark
- **Primary Hover:** 142 45% 60% - Lighter for hover states
- **Secondary (Warm Accent):** 35 60% 65% - Softer terracotta for dark mode
- **Background Base:** 142 15% 8% - Deep charcoal with green undertone
- **Surface:** 142 12% 12% - Elevated surfaces, slightly lighter
- **Text Primary:** 142 10% 95% - Near-white with subtle green tint
- **Text Secondary:** 142 8% 70% - Muted light gray-green
- **Border:** 142 10% 20% - Subtle borders for dark mode

### Semantic Colors
- **Success:** 142 50% 45% - Medical approval green
- **Warning:** 35 75% 55% - Warm amber for cautions
- **Error:** 0 70% 50% - Medical red for alerts
- **Info:** 200 80% 50% - Calm blue for information

## Typography

**Font Stack:**
- **Primary (Headings):** 'Inter', system-ui, -apple-system, sans-serif
- **Secondary (Body):** 'Inter', system-ui, sans-serif
- **Monospace (Code/Data):** 'JetBrains Mono', 'Fira Code', monospace

**Hierarchy:**
- **Hero Heading:** text-5xl lg:text-6xl, font-bold, tracking-tight
- **Section Heading:** text-3xl lg:text-4xl, font-semibold
- **Card Title:** text-xl lg:text-2xl, font-semibold
- **Body Large:** text-lg, font-normal, leading-relaxed
- **Body:** text-base, font-normal, leading-relaxed
- **Small:** text-sm, leading-normal
- **Tiny:** text-xs, tracking-wide

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- **Component Padding:** p-4 (mobile), p-6 or p-8 (desktop)
- **Section Spacing:** py-12 (mobile), py-20 or py-24 (desktop)
- **Card Gaps:** gap-4 or gap-6
- **Element Margins:** mb-2, mb-4, mb-6, mb-8

**Container Strategy:**
- **Max Width:** max-w-7xl for full-width sections, max-w-4xl for content
- **Chat Container:** max-w-5xl for optimal reading
- **Dashboard:** Full viewport with sidebar (w-64 fixed, rest fluid)

## Component Library

### Navigation
- **Landing Header:** Transparent overlay on hero → solid on scroll, backdrop-blur-md
- **Dashboard Sidebar:** Fixed w-64, herbal green accent on active items, smooth transitions
- **Mobile Nav:** Slide-in drawer with overlay, hamburger menu

### Hero Section (Landing)
- **Layout:** Full viewport height (min-h-screen), 2-column grid (lg:grid-cols-2)
- **Left Column:** Headline (text-5xl lg:text-6xl), subtitle, dual CTA buttons (primary + outline)
- **Right Column:** Hero illustration/image showing Ayurvedic herbs, wellness imagery
- **Background:** Subtle gradient from soft green tint to background
- **Buttons on Images:** Outline buttons with backdrop-blur-lg bg-white/10 dark:bg-black/20

### Chat Interface
- **Message Bubbles:** 
  - User: Herbal green background, white text, rounded-2xl, ml-auto max-w-[80%]
  - AI: Light gray background (light mode), dark surface (dark mode), rounded-2xl, mr-auto max-w-[80%]
- **Input Area:** Sticky bottom, white surface with shadow-lg, rounded-full input, icon buttons
- **Typing Indicator:** Animated dots in AI bubble style
- **File Attachments:** Small preview cards with remove icon, rounded-lg borders

### Sidebar (Conversations)
- **Conversation Items:** Hover state with subtle green tint, active state with green background
- **New Chat Button:** Full-width, primary green, icon + text
- **Quick Actions:** Grid of 2x2 cards with icons, subtle borders, hover lift effect

### Cards & Surfaces
- **Primary Cards:** White/dark surface, rounded-xl, shadow-sm, hover:shadow-md transition
- **Feature Cards:** Icon at top (size-12), title, description, centered or left-aligned
- **Stat Cards:** Large number (text-3xl), label below, colored accent border-t-4
- **Elevation:** Use shadow-sm, shadow-md, shadow-lg sparingly for hierarchy

### Forms & Inputs
- **Text Inputs:** Rounded-lg, border-2, focus:ring-2 ring-primary, px-4 py-3
- **Buttons Primary:** Herbal green, white text, rounded-lg, px-6 py-3, font-medium
- **Buttons Secondary:** Outline with primary color, hover fills with primary
- **File Upload:** Dashed border, drag-drop zone, icon + text, hover state with green tint

### Modals & Overlays
- **Modal Backdrop:** bg-black/50 dark:bg-black/70, backdrop-blur-sm
- **Modal Content:** Centered, max-w-lg, rounded-2xl, shadow-2xl, p-6 or p-8
- **Close Button:** Absolute top-right, rounded-full, hover:bg-gray-100

## Images

### Landing Page Hero
- **Description:** Serene overhead shot of Ayurvedic herbs, spices, and natural remedies arranged on a wooden surface. Include turmeric, ginger, holy basil, and mortar & pestle. Warm, natural lighting with soft shadows
- **Placement:** Right side of hero section (50% width on desktop, full-width on mobile below text)
- **Treatment:** Subtle fade at edges, slight overlay to ensure text contrast if overlapping

### Dashboard/Features
- **Herb Icons:** Minimalist line illustrations of common Ayurvedic herbs integrated into feature cards
- **Wellness Imagery:** Optional background patterns with subtle herb motifs in light green opacity

## Animations

**Minimal & Purposeful:**
- **Page Transitions:** Simple fade-in (300ms) on route changes
- **Chat Messages:** Slide-up with fade (200ms) for new messages
- **Button Hovers:** Scale 1.02 and shadow increase (150ms)
- **Sidebar Toggle:** Slide-in/out (250ms ease-out)
- **Typing Indicator:** Subtle pulsing dots animation
- **NO:** Parallax, elaborate scroll animations, or distracting motion

## Responsive Breakpoints

- **Mobile:** < 640px - Single column, stacked navigation, full-width chat
- **Tablet:** 640px - 1024px - Collapsible sidebar, 2-column grids
- **Desktop:** > 1024px - Fixed sidebar, multi-column layouts, optimized chat width

## Accessibility & Dark Mode

- **Color Contrast:** Minimum WCAG AA (4.5:1 for text)
- **Focus Indicators:** Visible 2px ring in primary color, offset by 2px
- **Dark Mode Toggle:** Persistent via localStorage, smooth transition-colors (200ms)
- **Form Inputs:** Maintain consistent dark backgrounds in dark mode, no white inputs

## Key Principles

1. **Trust Through Simplicity:** Clean layouts, ample whitespace, no clutter
2. **Natural Wellness:** Herbal green palette evokes nature and healing
3. **Functional Clarity:** Chat interface prioritizes readability and efficiency
4. **Calm Interactions:** Gentle animations, soft shadows, rounded corners throughout
5. **Medical Credibility:** Professional typography, structured information hierarchy