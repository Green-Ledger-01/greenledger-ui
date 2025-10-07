# 🎨 GreenLedger Design System

## Overview

A modern, agricultural-themed design system built for professional user interfaces with comprehensive color palettes, systematic spacing, and consistent component patterns.

## 🎨 Color Palette

### Primary Colors (Agricultural Green)
- **Usage**: CTAs, brand elements, primary actions
- **Scale**: 50-950 with semantic naming
- **Key Colors**: 
  - `primary-600` (#16a34a) - Main brand color
  - `primary-700` (#15803d) - Hover states
  - `primary-100` (#dcfce7) - Light backgrounds

### Complementary Colors

#### Earth Tones
- **Usage**: Secondary actions, warm highlights
- **Colors**: Orange spectrum (#f97316 family)
- **Application**: Secondary buttons, accent elements

#### Professional Blue (Accent)
- **Usage**: Informational elements, links
- **Colors**: Blue spectrum (#2563eb family)
- **Application**: Info badges, secondary CTAs

#### Semantic Colors
- **Success**: Green tones for positive states
- **Warning**: Amber tones for caution states  
- **Error**: Red tones for error states

#### Neutral Grays
- **Usage**: Text, backgrounds, borders
- **Scale**: 0-950 comprehensive grayscale
- **Key Colors**:
  - `neutral-900` - Primary text
  - `neutral-600` - Secondary text
  - `neutral-200` - Borders
  - `neutral-50` - Light backgrounds

## 📏 Spacing System

Based on 4px increments for mathematical consistency:

- **Micro**: 1-2 (4-8px) - Tight spacing
- **Small**: 3-4 (12-16px) - Component padding
- **Medium**: 6-8 (24-32px) - Section spacing
- **Large**: 12-16 (48-64px) - Layout spacing
- **Touch**: 44px minimum for interactive elements

## 📝 Typography Scale

Systematic scale with proper line heights:

- **Display**: 3xl-6xl for hero sections
- **Headings**: xl-2xl for section titles
- **Body**: base-lg for content
- **Supporting**: xs-sm for captions

## 🎨 Component System

### Buttons
```css
.btn-primary    /* Primary actions */
.btn-secondary  /* Secondary actions */
.btn-accent     /* Informational actions */
.btn-ghost      /* Subtle actions */
```

### Cards
```css
.card           /* Base card */
.card-elevated  /* With shadow and hover */
.card-interactive /* Clickable with animations */
```

### Form Elements
```css
.input-modern   /* Consistent form inputs */
.form-group     /* Form field grouping */
.form-label     /* Field labels */
.form-error     /* Error messages */
```

### Status Indicators
```css
.badge-success  /* Success states */
.badge-warning  /* Warning states */
.badge-error    /* Error states */
.badge-neutral  /* Neutral states */
```

## ✨ Animation System

### Principles
- **Duration**: 200-300ms for interactions
- **Easing**: Cubic-bezier for natural feel
- **Purpose**: Enhance UX, not distract
- **Accessibility**: Respects reduced motion

### Available Animations
- `animate-fade-in-up` - Entrance animations
- `animate-scale-in` - Modal/popup entrances
- `animate-bounce-subtle` - Attention grabbers
- `animate-pulse-glow` - Status indicators

## 🌱 Agricultural Theme Elements

### Patterns
- `.pattern-farm` - Subtle dot pattern
- `.pattern-crop` - Geometric crop pattern

### Gradients
- `.gradient-primary` - Brand gradient
- `.gradient-hero` - Hero section gradient
- `.gradient-earth` - Earth tone gradient

### Status Colors
- `.status-farmer` - Farmer role indicator
- `.status-transport` - Transport role indicator
- `.status-buyer` - Buyer role indicator

## 📱 Mobile Optimization

### Touch Targets
- Minimum 44px for all interactive elements
- `.touch-target` utility class
- Safe area inset support

### Responsive Utilities
- `.mobile-only` / `.desktop-only`
- Container system with `.container-modern`
- Systematic breakpoints (xs, sm, md, lg, xl, 2xl)

## 🎯 Usage Guidelines

### Do's
- Use systematic spacing (4px increments)
- Apply consistent color semantics
- Implement proper focus states
- Follow animation principles
- Maintain touch-friendly sizing

### Don'ts
- Mix arbitrary spacing values
- Use colors outside the system
- Create overly complex animations
- Ignore accessibility requirements
- Break responsive patterns

## 🔧 Implementation

### CSS Classes
All design system elements are available as Tailwind CSS classes and custom component classes defined in `src/index.css`.

### Component Usage
```tsx
// Modern button
<button className="btn-primary btn-md focus-ring">
  Primary Action
</button>

// Enhanced card
<div className="card card-elevated p-6">
  Card content
</div>

// Status indicator
<span className="badge-success">
  Active
</span>
```

### Color Usage
```tsx
// Background colors
<div className="bg-primary-50">Light background</div>
<div className="bg-primary-600">Brand background</div>

// Text colors
<h1 className="text-neutral-900">Primary heading</h1>
<p className="text-neutral-600">Secondary text</p>
```

## 🚀 Performance

### Optimizations
- GPU acceleration for animations
- Efficient CSS custom properties
- Minimal bundle impact
- Tree-shakeable utilities

### Best Practices
- Use `gpu-accelerated` class for animated elements
- Implement `transition-modern` for consistent timing
- Apply `focus-ring` for accessibility
- Utilize `hover:lift` for interactive feedback

This design system ensures consistent, professional, and accessible user interfaces while maintaining the agricultural theme and modern aesthetic appropriate for GreenLedger's blockchain supply chain platform.