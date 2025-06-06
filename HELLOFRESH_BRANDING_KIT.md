## HelloFresh Colour Branding Kit

This document outlines the colour palette and usage guidelines for the HelloFresh brand. The goal is to maintain a consistent and recognizable visual identity across all platforms.

**Core Philosophy:** The HelloFresh colour scheme revolves around freshness, nature, health, and a friendly, approachable feel. Green is a dominant colour, symbolizing natural ingredients and growth. White provides a clean and simple backdrop, while accents of other vibrant colours can add energy and highlight calls to action.

### Primary Colours:

These are the foundational colours of the HelloFresh brand.

*   **HelloFresh Green (Lime):**
    *   HEX: `#91c11e`
    *   RGB: `(145, 193, 30)`
    *   Usage: This is the main brand colour. It should be used prominently in logos, primary call-to-action buttons, and as a key accent colour. It evokes freshness and naturalness.
*   **White:**
    *   HEX: `#ffffff`
    *   RGB: `(255, 255, 255)`
    *   Usage: Primarily used for backgrounds to ensure readability and a clean aesthetic. Also used for text on dark backgrounds.

### Secondary Colours:

These colours complement the primary palette and can be used for secondary elements, illustrations, and to add visual interest.

*   **HelloFresh Palm Leaf (Darker Green):**
    *   HEX: `#659a41`
    *   RGB: `(101, 154, 65)`
    *   Usage: Can be used for secondary buttons, text, or as a darker shade of the primary green for depth and contrast.
*   **Dark Grey (for Text):**
    *   HEX: `#3c3c3c`
    *   RGB: `(60, 60, 60)`
    *   Usage: Preferred for body text and headlines to ensure readability against light backgrounds.
*   **Yellow (Accent):**
    *   HEX: `#E8DE10`
    *   RGB: `(232, 222, 16)`
    *   Usage: Can be used sparingly for highlighting information, illustrations, or secondary calls to action where appropriate, adding warmth and energy.
*   **Orange (Accent):**
    *   HEX: `#ef9d17`
    *   RGB: `(239, 157, 23)`
    *   Usage: Similar to yellow, can be used for accents that convey enthusiasm and creativity.

### Component-Specific Colour Guidelines:

*   **Buttons:**
    *   **Primary CTA (Call To Action):**
        *   Background: HelloFresh Green (`#91c11e`)
        *   Text: White (`#ffffff`)
    *   **Secondary CTA:**
        *   Background: HelloFresh Palm Leaf (`#659a41`) or White (`#ffffff`) with a HelloFresh Green border/text.
        *   Text: White (`#ffffff`) if on a dark background, or HelloFresh Green (`#91c11e`) if on a light background.
    *   **Ghost Buttons (Transparent with Border):**
        *   Border: HelloFresh Green (`#91c11e`)
        *   Text: HelloFresh Green (`#91c11e`)
        *   Background: Transparent
*   **Input Fields:**
    *   Background: White (`#ffffff`)
    *   Border: Light Grey (e.g., `#cccccc` or a subtle shade)
    *   Focus Border: HelloFresh Green (`#91c11e`) or a slightly darker shade like HelloFresh Palm Leaf (`#659a41`).
    *   Text Color: Dark Grey (e.g., `#3c3c3c`)
    *   Placeholder Text Color: Medium Grey (e.g., `#888888`)
*   **Text:**
    *   **Headings:** Dark Grey (e.g., `#3c3c3c`) or HelloFresh Palm Leaf (`#659a41`) for emphasis.
    *   **Body Text:** Dark Grey (e.g., `#3c3c3c`) for maximum readability.
    *   **Links:** A distinct colour, potentially a blue (e.g., `#3AA4CB` - Moonstone, as seen in some palettes) or HelloFresh Green (`#91c11e`) if it provides enough contrast and fits the design. Consistency is key.
*   **Backgrounds:**
    *   Primary: White (`#ffffff`)
    *   Secondary/Sections: Very Light Grey (e.g., `#f8f8f8`) or subtle tints of the primary green for visual separation.
*   **Icons & Illustrations:**
    *   Should primarily use the defined HelloFresh Green, Palm Leaf, White, and Dark Grey.
    *   Accent colours like Yellow or Orange can be used sparingly within illustrations to add vibrancy and highlight details.
    *   Illustrations often feature a "homemade" and friendly feel.

### Accessibility Considerations:

*   Ensure sufficient contrast between text and background colours to meet WCAG AA accessibility standards. This is particularly important for text, buttons, and input fields.
*   Tools should be used to check contrast ratios.

### General Notes for the Developer:

*   The brand aims for a clean, vibrant, and user-friendly interface.
*   Consistency in colour usage across all elements is crucial for brand recognition.
*   The "lime" (HelloFresh Green) is a central and recognizable element of the brand.
*   The design should feel modern and approachable.
*   Refer to the official HelloFresh website (hellofresh.com.au) for live examples and context.

This branding kit should provide a solid foundation for your AI developer to implement the HelloFresh colour scheme accurately and consistently.

### CSS Custom Properties (Variables)

For easy implementation across the project:

```css
:root {
  /* Primary Colors */
  --hellofresh-green: #91c11e;
  --hellofresh-white: #ffffff;
  
  /* Secondary Colors */
  --hellofresh-palm-leaf: #659a41;
  --hellofresh-dark-grey: #3c3c3c;
  --hellofresh-yellow: #E8DE10;
  --hellofresh-orange: #ef9d17;
  
  /* Utility Colors */
  --hellofresh-light-grey: #f8f8f8;
  --hellofresh-medium-grey: #888888;
  --hellofresh-border-grey: #cccccc;
  --hellofresh-moonstone: #3AA4CB;
}
``` 