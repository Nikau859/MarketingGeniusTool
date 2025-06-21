// Theme Configuration
// Modify these values to customize your website's appearance

export interface ThemeConfig {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent: Record<string, string>;
    neutral: {
      white: string;
      gray: Record<string, string>;
      black: string;
    };
  };
  typography: {
    fonts: {
      primary: string;
      secondary: string;
      mono: string;
    };
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  animations: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  breakpoints: Record<string, string>;
}

export const themeConfig: ThemeConfig = {
  // Color Schemes
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main primary color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary Brand Colors
    secondary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main secondary color
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    
    // Accent Colors
    accent: {
      purple: '#8b5cf6',
      pink: '#ec4899',
      orange: '#f59e0b',
      yellow: '#eab308',
      red: '#ef4444',
      green: '#10b981',
    },
    
    // Neutral Colors
    neutral: {
      white: '#ffffff',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      black: '#000000',
    }
  },
  
  // Typography
  typography: {
    fonts: {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
      secondary: 'Poppins, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Consolas, Monaco, monospace',
    },
    
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    }
  },
  
  // Spacing and Layout
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  
  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    }
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};

// Helper function to get CSS custom properties
export function getCSSVariables(): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Convert colors to CSS variables
  Object.entries(themeConfig.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          variables[`--color-${category}-${shade}`] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested objects like neutral.gray
          Object.entries(value).forEach(([nestedShade, nestedValue]) => {
            if (typeof nestedValue === 'string') {
              variables[`--color-${category}-${shade}-${nestedShade}`] = nestedValue;
            }
          });
        }
      });
    }
  });
  
  return variables;
}

// Helper function to apply theme to document
export function applyTheme(): void {
  const root = document.documentElement;
  const variables = getCSSVariables();
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

export default themeConfig; 