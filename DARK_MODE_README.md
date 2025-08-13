# Dark Mode Implementation

This project now includes a comprehensive dark mode toggle feature that allows users to switch between light and dark themes.

## Features

- **Theme Toggle Button**: Located in the header next to the notifications bell
- **System Theme Detection**: Automatically detects and follows the user's system preference
- **Persistent Storage**: Theme preference is saved in localStorage
- **Smooth Transitions**: No flash of unstyled content during theme changes
- **Comprehensive Coverage**: All dashboard components support both light and dark themes

## How It Works

### Theme Provider
The `ThemeProvider` component wraps the entire application and provides theme context using `next-themes`. It's configured with:
- `attribute="class"` - Uses CSS classes for theme switching
- `defaultTheme="system"` - Follows system preference by default
- `enableSystem` - Enables system theme detection
- `disableTransitionOnChange` - Prevents flash during theme changes

### Custom Hook
The `useTheme` hook provides:
- `theme` - Current theme (light/dark)
- `toggleTheme()` - Function to switch between themes
- `mounted` - Boolean to prevent hydration mismatch
- `setTheme()` - Function to set specific theme

### CSS Variables
Dark mode styles are implemented using Tailwind CSS's `dark:` prefix and CSS custom properties defined in `global.css`.

## Usage

### Toggle Theme
Click the moon/sun icon in the header to switch between light and dark modes.

### Programmatic Theme Control
```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme:
      {' '}
      {theme}
    </button>
  );
}
```

## Components Updated

The following components now support dark mode:
- Header (with theme toggle button)
- Sidebar
- DashboardContent
- AlertCard
- MetricsGrid
- All other dashboard cards

## Styling Guidelines

When adding new components, use these Tailwind classes for dark mode support:

```tsx
// Backgrounds
className = 'bg-white dark:bg-slate-900';

// Text
className = 'text-slate-900 dark:text-white';

// Borders
className = 'border-slate-200 dark:border-slate-700';

// Hover states
className = 'hover:bg-slate-100 dark:hover:bg-slate-800';
```

## Browser Support

- Modern browsers with CSS custom properties support
- Automatic fallback to light theme for unsupported browsers
- No JavaScript required for basic functionality

## Performance

- Theme switching is instant with no page reload
- CSS variables provide efficient theme switching
- Minimal bundle size impact
- Optimized for both light and dark themes
