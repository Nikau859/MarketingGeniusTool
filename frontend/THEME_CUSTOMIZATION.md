# Theme and Layout Customization Guide

This guide will help you customize the theme and layout of your Marketing Genius Tool website.

## 🎨 Quick Customization Options

### 1. **Color Schemes**
You can easily change the color scheme by modifying the CSS variables in `src/custom-theme.css`:

```css
:root {
  /* Primary Colors */
  --primary-color: #3b82f6;    /* Change this for main brand color */
  --primary-dark: #1d4ed8;     /* Darker shade of primary */
  --primary-light: #60a5fa;    /* Lighter shade of primary */
  
  /* Secondary Colors */
  --secondary-color: #10b981;  /* Change this for accent color */
  --secondary-dark: #059669;   /* Darker shade of secondary */
  --secondary-light: #34d399;  /* Lighter shade of secondary */
}
```

### 2. **Pre-built Themes**
The website includes 5 pre-built themes that you can switch between:
- **Default**: Blue and green
- **Ocean**: Teal and cyan
- **Sunset**: Orange and pink
- **Forest**: Green and lime
- **Royal**: Purple and magenta

### 3. **Typography**
Change fonts by updating the font imports in `src/index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## 🛠️ Advanced Customization

### 1. **Theme Configuration File**
Edit `src/theme-config.ts` to customize:
- Color palettes
- Typography settings
- Spacing and layout
- Shadows and animations
- Breakpoints

### 2. **Custom CSS Classes**
Add your own styles in `src/custom-theme.css`:

```css
/* Custom button styles */
.my-custom-button {
  background: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.my-custom-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}
```

### 3. **Layout Modifications**
Modify the layout structure in `src/index.html`:

```html
<!-- Add new sections -->
<section class="my-custom-section">
  <div class="container mx-auto">
    <!-- Your content here -->
  </div>
</section>
```

## 🎯 Component Customization

### 1. **PayPal Button Styling**
Customize the PayPal button appearance in `src/components/PayPalSubscriptionButton.tsx`:

```typescript
window.paypal.Buttons({
  style: {
    shape: "rect",        // "rect", "pill", "sharp"
    layout: "vertical",   // "vertical", "horizontal"
    color: "gold",        // "gold", "blue", "silver", "white", "black"
    label: "subscribe",   // "paypal", "checkout", "buynow", "pay", "installment", "subscribe", "order"
  },
  // ... rest of configuration
});
```

### 2. **Card Components**
Modify card styles in `src/custom-theme.css`:

```css
.card-modern {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  transition: all 0.3s ease;
}

.card-modern:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

## 🌙 Dark Mode Support

The website automatically supports dark mode based on user preferences. Customize dark mode colors:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #0f172a;
    --surface-color: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
}
```

## 📱 Responsive Design

The website is fully responsive. Customize breakpoints in `src/theme-config.ts`:

```typescript
breakpoints: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

## 🎨 Adding New Themes

To add a new theme, modify the `ThemeSwitcher.tsx` component:

```typescript
const themes = {
  // ... existing themes
  myNewTheme: {
    name: 'My New Theme',
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
    background: 'linear-gradient(135deg, #color1, #color2)',
  },
};
```

## 🔧 Development Tips

### 1. **Hot Reloading**
Run the development server to see changes instantly:
```bash
cd frontend
npm run dev
```

### 2. **CSS Variables**
Use CSS variables for consistent theming:
```css
.my-element {
  color: var(--primary-color);
  background: var(--surface-color);
  border-radius: var(--border-radius);
}
```

### 3. **Tailwind Utilities**
Combine custom CSS with Tailwind utilities:
```html
<div class="card-modern bg-gradient-to-r from-primary-500 to-secondary-500">
  <!-- Content -->
</div>
```

## 📋 Common Customizations

### 1. **Change Brand Colors**
1. Update `--primary-color` in `custom-theme.css`
2. Modify the gradient backgrounds in `index.html`
3. Update the theme switcher colors in `ThemeSwitcher.tsx`

### 2. **Add New Sections**
1. Add HTML structure in `index.html`
2. Style with Tailwind classes or custom CSS
3. Add animations using the provided CSS classes

### 3. **Modify Layout**
1. Change the grid system in the features section
2. Adjust spacing and padding
3. Modify the card layouts

### 4. **Custom Animations**
Add new animations in `custom-theme.css`:

```css
@keyframes myAnimation {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.my-animation {
  animation: myAnimation 0.6s ease-out;
}
```

## 🚀 Deployment

After making changes:
1. Test locally with `npm run dev`
2. Build for production: `npm run build`
3. Deploy the `dist` folder to your hosting service

## 📞 Support

For advanced customization needs, you can:
- Modify the React components in `src/components/`
- Add new pages and routes
- Integrate additional UI libraries
- Customize the PayPal integration

Remember to maintain consistency across your design system and test on different devices and browsers! 