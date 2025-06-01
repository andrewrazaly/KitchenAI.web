# KitchenAI Design System

## Brand Identity

KitchenAI is a smart, fresh, and intuitive application that helps users manage their food inventory, reduce waste, and make cooking decisions easier. The brand should evoke feelings of:

- Freshness
- Sustainability
- Innovation
- Efficiency
- Friendliness

## Color Palette

### Primary Colors

- **Mint Green** `#2DCE89` - Primary brand color, represents freshness and sustainability
- **Lime Green** `#82D616` - Secondary brand color, brings vibrancy and energy
- **Citrus Yellow** `#FFD60A` - Accent color, adds warmth and optimism

### Secondary Colors

- **Teal** `#11CDEF` - Cool complementary color for UI elements
- **Navy** `#344767` - For text and dark UI elements
- **Gray Shades**:
  - Light: `#F8F9FA`
  - Medium: `#E9ECEF`
  - Dark: `#CED4DA`

### Semantic Colors

- **Success**: `#2DCE89` (Same as primary)
- **Warning**: `#FB6340` (Warm orange)
- **Danger**: `#F5365C` (Bright red)
- **Info**: `#11CDEF` (Teal)

## Typography

### Font Families

- **Primary Font**: Inter - Clean, modern and highly readable
- **Accent Font**: Montserrat - For headings and emphasis
- **Fallbacks**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif

### Font Sizes

- **Base Size**: 16px
- **Headings**:
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - H4: 1.25rem (20px)
  - H5: 1rem (16px)
  - H6: 0.875rem (14px)
- **Body Text**:
  - Regular: 1rem (16px)
  - Small: 0.875rem (14px)
  - Extra Small: 0.75rem (12px)

### Font Weights

- Light: 300
- Regular: 400
- Medium: 500
- Semi-Bold: 600
- Bold: 700

## Components

### Buttons

- **Primary Button**:
  - Background: Mint Green `#2DCE89`
  - Text: White `#FFFFFF`
  - Hover: Darker mint `#26ae74`
  - Border-radius: 8px
  - Padding: 10px 20px
  - Font-weight: 600

- **Secondary Button**:
  - Background: White `#FFFFFF`
  - Text: Navy `#344767`
  - Border: 1px solid Navy `#344767`
  - Hover: Light gray background `#F8F9FA`
  - Border-radius: 8px
  - Padding: 10px 20px
  - Font-weight: 600

- **Accent Button**:
  - Background: Citrus Yellow `#FFD60A`
  - Text: Navy `#344767`
  - Hover: Darker yellow `#E6C009`
  - Border-radius: 8px
  - Padding: 10px 20px
  - Font-weight: 600

### Input Fields

- **Text Inputs**:
  - Border: 1px solid Medium Gray `#E9ECEF`
  - Focus Border: Mint Green `#2DCE89`
  - Border-radius: 8px
  - Padding: 10px 12px
  - Background: White `#FFFFFF`

- **Checkboxes & Radio Buttons**:
  - Accent Color: Mint Green `#2DCE89`
  - Size: 18px

- **Select Menus**:
  - Same styling as text inputs
  - Dropdown icon color: Navy `#344767`

### Cards

- Background: White `#FFFFFF`
- Border: None
- Border-radius: 12px
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.05)
- Heading color: Navy `#344767`
- Padding: 20px

### Tables

- Header Background: Light Gray `#F8F9FA`
- Header Text: Navy `#344767`
- Header Font Weight: 600
- Row Border: 1px solid Medium Gray `#E9ECEF`
- Row Hover: Very Light Gray `#F8F9FA`
- Cell Padding: 12px 16px

## Layout & Spacing

- **Container Max Width**: 1200px
- **Grid System**: 12-column
- **Spacing Scale**:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - xxl: 48px

## Navbar

- Background: White `#FFFFFF`
- Shadow: 0 2px 4px rgba(0, 0, 0, 0.05)
- Links: Navy `#344767`
- Active Link: Mint Green `#2DCE89`

## Icons

- Primary Color: Navy `#344767`
- Accent Icons: Mint Green `#2DCE89` or Citrus Yellow `#FFD60A`
- Size: 24px for navigation/actions, 16px for inline/small icons

## Implementation Guidelines

### Classes to Update

- Main container backgrounds: Add subtle patterns or gradients using the mint/lime color family
- Buttons: Update with new color scheme, add hover effects and transitions
- Cards: Add subtle border-left accents in mint green for important cards
- Form elements: Update focus states to use mint green
- Text: Update heading font to Montserrat and body text to Inter
- Tables: Update header styling and hover states

### CSS Variables to Set

```css
:root {
  /* Colors */
  --color-primary: #2DCE89;
  --color-secondary: #82D616;
  --color-accent: #FFD60A;
  --color-teal: #11CDEF;
  --color-navy: #344767;
  --color-gray-light: #F8F9FA;
  --color-gray-medium: #E9ECEF;
  --color-gray-dark: #CED4DA;
  --color-success: #2DCE89;
  --color-warning: #FB6340;
  --color-danger: #F5365C;
  --color-info: #11CDEF;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-accent: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-size-base: 16px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  
  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### Tailwind Config Updates

For a Tailwind CSS implementation, update the tailwind.config.js file with these values. 