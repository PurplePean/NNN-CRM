# 🎨 UI Components & Design System Guide

## Overview
This guide shows how to use the enhanced design system in the Industrial CRM application.

## 🎨 Color System

### Using Theme Colors

#### Industrial Theme
Professional, neutral colors for industrial real estate:
```jsx
<div className="bg-industrial-900 text-industrial-50">
  Dark industrial background
</div>

<div className="bg-industrial-50 text-industrial-900">
  Light industrial background
</div>
```

#### Primary Brand Colors
```jsx
<button className="bg-primary-600 hover:bg-primary-700 text-white">
  Primary Button
</button>
```

#### Status Colors
```jsx
{/* Success */}
<div className="bg-success-100 text-success-800 border-success-300">
  Success message
</div>

{/* Warning */}
<div className="bg-warning-100 text-warning-800 border-warning-300">
  Warning message
</div>

{/* Danger */}
<div className="bg-danger-100 text-danger-800 border-danger-300">
  Error message
</div>
```

## 🧩 Component Classes

### Buttons
Pre-configured button styles with smooth interactions:

```jsx
{/* Enhanced button with transitions */}
<button className="btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
  Click Me
</button>

{/* Button with scale effect on click */}
<button className="btn bg-success-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg">
  Submit
</button>
```

The `.btn` class automatically includes:
- Smooth transitions (200ms)
- Scale effect on active state (98%)
- Easy to combine with Tailwind utilities

### Cards

#### Basic Card
```jsx
<div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow-soft">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Card content</p>
</div>
```

#### Interactive Card with Hover
```jsx
<div className="card card-hover bg-white dark:bg-slate-800 p-6 rounded-lg shadow-soft cursor-pointer">
  <h3 className="text-lg font-semibold mb-2">Hover Me</h3>
  <p className="text-gray-600">I lift on hover!</p>
</div>
```

The `.card-hover` class adds:
- Shadow increase on hover
- Subtle lift effect (-2px translateY)
- Smooth 300ms transition

### Glass Morphism
Modern glass effect for overlays and modals:

```jsx
<div className="glass p-8 rounded-2xl border border-white/20">
  <h2 className="text-xl font-bold mb-4">Glass Panel</h2>
  <p>Beautiful frosted glass effect</p>
</div>
```

### Gradient Overlays
Subtle gradient backgrounds:

```jsx
<div className="gradient-overlay p-6 rounded-lg">
  <p>Subtle gradient from primary to industrial colors</p>
</div>
```

## ✨ Animations

### Fade In Animation
```jsx
<div className="animate-fade-in">
  This fades in smoothly
</div>
```

### Slide Animations
```jsx
{/* Slide from right */}
<div className="animate-slide-in">
  Slides in from right
</div>

{/* Slide from bottom */}
<div className="animate-slide-up">
  Slides up from bottom
</div>
```

### Scale Animation
```jsx
<div className="animate-scale-in">
  Scales up on entrance
</div>
```

### Staggered Animations
Perfect for lists and grids:

```jsx
<div className="stagger-animation space-y-4">
  <div className="card">Item 1 (delays 0.05s)</div>
  <div className="card">Item 2 (delays 0.1s)</div>
  <div className="card">Item 3 (delays 0.15s)</div>
  <div className="card">Item 4 (delays 0.2s)</div>
  {/* Automatically staggers up to 8 children */}
</div>
```

### Pulse Animation (Slow)
```jsx
<div className="animate-pulse-slow">
  Gentle pulsing effect
</div>
```

## 🎭 Interactive Effects

### Hover Lift
```jsx
<div className="hover-lift p-4 bg-white rounded-lg shadow">
  Lifts slightly on hover
</div>
```

### Hover Glow
```jsx
<button className="hover-glow px-6 py-3 bg-primary-600 text-white rounded-lg">
  Shadow glows on hover
</button>
```

### Focus Visible Ring
Accessible focus indicators:

```jsx
<button className="focus-visible-ring px-4 py-2 rounded-lg">
  Keyboard accessible button
</button>
```

## 📜 Custom Scrollbar

### Apply Custom Scrollbar
```jsx
<div className="custom-scrollbar overflow-y-auto h-96">
  <p>Long content that scrolls...</p>
  {/* Styled scrollbar appears */}
</div>
```

Features:
- 8px width
- Rounded thumb
- Dark mode support
- Hover effect on thumb

## 🎨 Shadow System

### Soft Shadows
```jsx
<div className="shadow-soft">Subtle shadow</div>
<div className="shadow-medium">Medium shadow</div>
<div className="shadow-large">Large shadow</div>
<div className="shadow-xl-dark">Extra large dark shadow</div>
```

## 🌈 Complete Component Examples

### Modern Card with All Features
```jsx
<div className="card card-hover glass p-6 rounded-xl shadow-medium animate-fade-in">
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg">
      <Building2 size={24} />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-1">Property Name</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
        123 Industrial Way, City, State
      </p>
      <div className="flex gap-2">
        <button className="btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm focus-visible-ring">
          View Details
        </button>
        <button className="btn bg-industrial-200 dark:bg-industrial-700 text-industrial-900 dark:text-industrial-100 px-4 py-2 rounded-lg text-sm focus-visible-ring">
          Edit
        </button>
      </div>
    </div>
  </div>
</div>
```

### Animated List
```jsx
<div className="stagger-animation space-y-3">
  {items.map((item, index) => (
    <div key={index} className="card card-hover bg-white dark:bg-slate-800 p-4 rounded-lg shadow-soft">
      <h4 className="font-medium">{item.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
    </div>
  ))}
</div>
```

### Glass Modal
```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="glass max-w-md w-full p-8 rounded-2xl shadow-xl-dark animate-scale-in">
    <h2 className="text-2xl font-bold mb-4">Modal Title</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      Beautiful glass morphism modal with backdrop blur
    </p>
    <div className="flex gap-3">
      <button className="btn flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg focus-visible-ring">
        Confirm
      </button>
      <button className="btn flex-1 bg-industrial-200 dark:bg-industrial-700 text-industrial-900 dark:text-industrial-100 py-2 rounded-lg focus-visible-ring">
        Cancel
      </button>
    </div>
  </div>
</div>
```

### Status Badge
```jsx
{/* Success badge */}
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success-100 text-success-800 text-sm font-medium">
  <CheckCircle size={14} />
  Active
</span>

{/* Warning badge */}
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning-100 text-warning-800 text-sm font-medium">
  <AlertCircle size={14} />
  Pending
</span>

{/* Danger badge */}
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-danger-100 text-danger-800 text-sm font-medium">
  <X size={14} />
  Inactive
</span>
```

## 📱 Responsive Design

### Mobile-First Approach
All utilities are mobile-first. Use breakpoints for larger screens:

```jsx
<div className="
  p-4 sm:p-6 md:p-8
  text-sm sm:text-base md:text-lg
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
">
  Responsive content
</div>
```

### Responsive Utilities
```jsx
{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">Desktop only</div>

{/* Show on mobile, hide on desktop */}
<div className="block md:hidden">Mobile only</div>

{/* Responsive flex */}
<div className="flex flex-col md:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## 🌙 Dark Mode

### Toggle Dark Mode
The app uses class-based dark mode. Apply `dark:` variants:

```jsx
<div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
  Adapts to dark mode
</div>

<button className="
  bg-primary-600 hover:bg-primary-700
  dark:bg-primary-500 dark:hover:bg-primary-600
  text-white
">
  Dark mode aware button
</button>
```

## 🎯 Best Practices

### Do's ✅
1. **Use component classes** - `.btn`, `.card`, `.glass` for consistency
2. **Combine with Tailwind** - Layer component classes with utilities
3. **Leverage animations** - Use stagger effects for lists
4. **Think mobile-first** - Start with mobile, enhance for desktop
5. **Support dark mode** - Always include `dark:` variants
6. **Use semantic colors** - `success`, `warning`, `danger` for status

### Don'ts ❌
1. **Don't override component classes** - Extend instead
2. **Don't ignore accessibility** - Always use `focus-visible-ring`
3. **Don't hardcode colors** - Use theme colors instead
4. **Don't skip animations** - They improve UX significantly
5. **Don't forget dark mode** - Test both light and dark themes

## 🔧 Customization

### Extending Components
Create custom components by extending base classes:

```css
/* In your CSS file */
@layer components {
  .btn-large {
    @apply btn px-8 py-4 text-lg;
  }

  .card-featured {
    @apply card card-hover bg-gradient-to-br from-primary-50 to-industrial-50 dark:from-primary-900/20 dark:to-industrial-900/20;
  }
}
```

### Custom Animations
Add custom animations in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
    },
  },
}
```

## 📚 Quick Reference

### Common Combinations
```jsx
{/* Primary button */}
className="btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md hover-glow focus-visible-ring"

{/* Interactive card */}
className="card card-hover bg-white dark:bg-slate-800 p-6 rounded-xl shadow-medium"

{/* Input field */}
className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus-visible-ring"

{/* Success alert */}
className="p-4 rounded-lg bg-success-100 dark:bg-success-900/20 border border-success-300 text-success-800 dark:text-success-200"
```

## 🎓 Learning Path

1. Start with **color system** - Understand theme colors
2. Use **component classes** - `.btn`, `.card`, `.glass`
3. Add **animations** - Make UI feel alive
4. Apply **interactive effects** - Hover, focus, active states
5. Ensure **responsiveness** - Mobile to desktop
6. Support **dark mode** - Complete the experience

Happy building! 🚀
