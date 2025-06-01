# KitchenAI App Wireframes

## Overview
KitchenAI is an intelligent meal planning and food inventory management application that uses AI to help users reduce food waste, stay within budget, and discover great deals. This document outlines the wireframes and user flows for the application.

## Core User Flows

### 1. Home Screen

```
┌─────────────────────────────────────────────────┐
│                   KITCHEN AI                     │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │             │  │             │  │         │  │
│  │    Smart    │  │    Meal     │  │ Grocery │  │
│  │  Inventory  │  │   Planner   │  │  Deals  │  │
│  │             │  │             │  │         │  │
│  └─────────────┘  └─────────────┘  └─────────┘  │
│                                                 │
│  Quick Actions:                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ What's for dinner tonight?              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ What can I make with chicken and pasta? │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Expiring Soon:                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Milk (2 days), Spinach (1 day)          │    │
│  │ → Get recipe suggestions                 │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Inventory Management

```
┌─────────────────────────────────────────────────┐
│                   INVENTORY                      │
│                                                 │
│  ┌─────────────────┐  ┌────────────────────┐    │
│  │ Search Inventory│  │ Add New Item       │    │
│  └─────────────────┘  └────────────────────┘    │
│                                                 │
│  Filters: All | Pantry | Fridge | Freezer       │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Item         Quantity   Expiry          │    │
│  │ ─────────────────────────────────────── │    │
│  │ Milk         1L        Jan 15 (2 days)  │    │
│  │ Chicken      500g      Jan 20           │    │
│  │ Pasta        2 boxes   Jul 30           │    │
│  │ Spinach      250g      Jan 14 (1 day)   │    │
│  │ Eggs         6         Jan 25           │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Smart Suggestions:                             │
│  ┌─────────────────────────────────────────┐    │
│  │ Use spinach soon! → Recipe suggestions  │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘

Add Item Modal:
┌─────────────────────────────────────────────────┐
│               ADD INVENTORY ITEM                 │
│                                                 │
│  Name: [_______________________]                │
│                                                 │
│  Category: [Vegetables ▼]                       │
│                                                 │
│  Quantity: [___] Unit: [grams ▼]                │
│                                                 │
│  Location: ○ Pantry ○ Fridge ○ Freezer ○ Other  │
│                                                 │
│  Purchase Date: [01/13/2024]                    │
│                                                 │
│  Expiry Date: [01/20/2024]                      │
│                                                 │
│  Price: [$ _____] (optional)                    │
│                                                 │
│  Notes: [_______________________]                │
│                                                 │
│  [Camera Icon] Scan Barcode/Take Photo          │
│                                                 │
│  [Cancel]                  [Add Item]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. AI Meal Planner

```
┌─────────────────────────────────────────────────┐
│                 MEAL PLANNER                     │
│                                                 │
│  Tabs: AI Planner | Weekly Plan | Saved Plans   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Weekly Budget: [$150____]                │    │
│  │                                         │    │
│  │ Plan for:                               │    │
│  │ [✓] Mon [✓] Tue [✓] Wed [✓] Thu [✓] Fri │    │
│  │ [ ] Sat [ ] Sun                         │    │
│  │                                         │    │
│  │ Dietary Restrictions:                   │    │
│  │ [ ] Vegetarian [ ] Gluten-Free [✓] Dairy-Free│
│  │                                         │    │
│  │ Preferred Cuisines:                     │    │
│  │ [✓] Italian [✓] Mexican [ ] Chinese     │    │
│  │                                         │    │
│  │ Preferences:                            │    │
│  │ [Quick weeknight meals, high protein]   │    │
│  │                                         │    │
│  │ [✓] Use what's in my inventory          │    │
│  │                                         │    │
│  │ [       Generate Meal Plan        ]     │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. Generated Meal Plan View

```
┌─────────────────────────────────────────────────┐
│                 WEEKLY PLAN                      │
│                                                 │
│  Budget: $150  |  Estimated Cost: $132.50       │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Monday                                  │    │
│  │ ────────────────────────────────────── │    │
│  │ Breakfast: Spinach & Egg Scramble      │    │
│  │ Lunch: Chicken Salad Wrap              │    │
│  │ Dinner: Pasta Primavera                │    │
│  │                                         │    │
│  │ [View Recipes & Details]                │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Tuesday                                 │    │
│  │ ────────────────────────────────────── │    │
│  │ Breakfast: Overnight Oats               │    │
│  │ Lunch: Leftovers - Pasta Primavera      │    │
│  │ Dinner: Taco Night                      │    │
│  │                                         │    │
│  │ [View Recipes & Details]                │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  (Additional days...)                           │
│                                                 │
│  [   Save Plan   ]  [   Generate Grocery List   ]│
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5. Recipe Detail View

```
┌─────────────────────────────────────────────────┐
│               RECIPE DETAILS                     │
│                                                 │
│  Pasta Primavera                                │
│  ───────────────────────────────────────────── │
│                                                 │
│  Servings: 4   |   Prep: 15 min   |   Cook: 20 min│
│                                                 │
│  Ingredients:                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ ✓ 8 oz pasta (in inventory)             │    │
│  │ ✓ 2 tbsp olive oil (in inventory)       │    │
│  │ ✓ 2 cloves garlic (in inventory)        │    │
│  │ □ 1 bell pepper                         │    │
│  │ □ 1 zucchini                            │    │
│  │ ✓ 1 cup spinach (in inventory)          │    │
│  │ □ 1/4 cup parmesan                      │    │
│  │ ✓ Salt & pepper (in inventory)          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Instructions:                                  │
│  1. Cook pasta according to package directions  │
│  2. Heat oil in large pan over medium heat      │
│  3. Add garlic and sauté until fragrant         │
│  4. Add vegetables and cook until tender        │
│  5. Toss with pasta, season with salt & pepper  │
│  6. Sprinkle with parmesan and serve            │
│                                                 │
│  Nutrition: 320 cal | 12g protein | 45g carbs   │
│                                                 │
│  Est. Cost: $3.50 per serving                   │
│                                                 │
│  [  Add Missing Items to Grocery List  ]        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6. Grocery List

```
┌─────────────────────────────────────────────────┐
│                GROCERY LIST                      │
│                                                 │
│  Budget: $150  |  Estimated Cost: $42.75        │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ [Add Item]        [Find Deals]          │    │
│  │                                         │    │
│  │ □ Bell Pepper (1)           $1.50       │    │
│  │ □ Zucchini (1)              $1.25       │    │
│  │ □ Parmesan (1/4 cup)        $2.00       │    │
│  │ □ Ground Beef (1 lb)        $6.50       │    │
│  │ □ Taco Shells (1 box)       $3.00       │    │
│  │ □ Salsa (1 jar)             $3.50       │    │
│  │ □ Greek Yogurt (16 oz)      $4.00       │    │
│  │ □ Oats (1 lb)               $3.50       │    │
│  │ □ Bananas (5)               $2.50       │    │
│  │                                         │    │
│  │ [Optimize for Deals]                    │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Smart Suggestions:                             │
│  ┌─────────────────────────────────────────┐    │
│  │ FreshGrocer has bell peppers on sale!   │    │
│  │ Save $0.50 by buying there.             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7. Deals View

```
┌─────────────────────────────────────────────────┐
│                GROCERY DEALS                     │
│                                                 │
│  ┌─────────────────────┐  ┌─────────────────┐   │
│  │ Search [_________]  │  │ Filter by Store ▼│   │
│  └─────────────────────┘  └─────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                50% OFF                  │    │
│  │                                         │    │
│  │  Bell Peppers                           │    │
│  │  FreshGrocer                            │    │
│  │                                         │    │
│  │  $1.50  $0.75                           │    │
│  │                                         │    │
│  │  Valid until Jan 18                     │    │
│  │  [Add to List]                          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                30% OFF                  │    │
│  │                                         │    │
│  │  Chicken Breast (1 lb)                  │    │
│  │  SuperMarket                            │    │
│  │                                         │    │
│  │  $5.99  $4.19                           │    │
│  │                                         │    │
│  │  Valid until Jan 20                     │    │
│  │  [Add to List]                          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 8. AI Assistant Chat Interface

```
┌─────────────────────────────────────────────────┐
│                 KITCHEN ASSISTANT                │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Ask me anything about meal planning,    │    │
│  │ recipes, or your inventory!             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  You: What can I make with chicken and pasta?   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ KitchenAI: Based on your inventory, you │    │
│  │ could make:                             │    │
│  │                                         │    │
│  │ 1. Chicken Alfredo Pasta                │    │
│  │ 2. Lemon Chicken Pasta                  │    │
│  │ 3. Chicken & Vegetable Pasta Bake       │    │
│  │                                         │    │
│  │ You have most ingredients for option 1. │    │
│  │ Would you like to see the recipe?       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  You: Yes, show me the Chicken Alfredo recipe   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ KitchenAI: Here's the Chicken Alfredo   │    │
│  │ recipe:                                 │    │
│  │                                         │    │
│  │ Ingredients:                            │    │
│  │ - 8 oz pasta (✓ in inventory)           │    │
│  │ - 2 chicken breasts (✓ in inventory)    │    │
│  │ - 2 tbsp butter (✓ in inventory)        │    │
│  │ - 1 cup heavy cream (✗ not in inventory)│    │
│  │ - 1/2 cup parmesan (✗ not in inventory) │    │
│  │                                         │    │
│  │ [See Full Recipe] [Add Missing Items]   │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [Type your question...]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 9. Camera/Computer Vision Interface for Inventory

```
┌─────────────────────────────────────────────────┐
│               SCAN INVENTORY ITEM                │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │             [Camera Viewfinder]         │    │
│  │                                         │    │
│  │      Position barcode in the frame      │    │
│  │               or                        │    │
│  │        Take photo of food item          │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [Barcode Mode]  |  [Image Recognition Mode]    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Last scanned:                           │    │
│  │ • Organic Milk, 1 gal                   │    │
│  │ • Granny Smith Apples, 3 count          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [Cancel]           [Capture]                   │
│                                                 │
└─────────────────────────────────────────────────┘

Result Screen:
┌─────────────────────────────────────────────────┐
│               ITEM RECOGNIZED                    │
│                                                 │
│  Item: Organic Whole Milk                       │
│  Brand: Horizon                                 │
│  Size: 1 gallon                                 │
│                                                 │
│  Category: Dairy                                │
│  Location: Refrigerator                         │
│                                                 │
│  Estimated Expiry: 10 days from purchase        │
│                                                 │
│  Quantity: [1] Unit: [gallon]                   │
│                                                 │
│  Price: [$ 5.99] (optional)                     │
│                                                 │
│  Purchase Date: [01/13/2024]                    │
│                                                 │
│  [Edit Details]     [Add to Inventory]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 10. User Preferences & Settings

```
┌─────────────────────────────────────────────────┐
│                USER PREFERENCES                  │
│                                                 │
│  Dietary Preferences:                           │
│  ┌─────────────────────────────────────────┐    │
│  │ [✓] Dairy-Free                          │    │
│  │ [ ] Vegetarian                          │    │
│  │ [ ] Vegan                               │    │
│  │ [ ] Gluten-Free                         │    │
│  │ [ ] Keto                                │    │
│  │ [ ] Paleo                               │    │
│  │ [ ] Low-Sodium                          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Allergies & Restrictions:                      │
│  ┌─────────────────────────────────────────┐    │
│  │ [✓] Peanuts                             │    │
│  │ [ ] Tree Nuts                           │    │
│  │ [ ] Shellfish                           │    │
│  │ [ ] Eggs                                │    │
│  │ [ ] Soy                                 │    │
│  │ [Add Other] ________________             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Household Size: [2▼] people                    │
│                                                 │
│  Weekly Budget: [$150____]                      │
│                                                 │
│  Preferred Stores:                              │
│  ┌─────────────────────────────────────────┐    │
│  │ [✓] SuperMarket                         │    │
│  │ [✓] FreshGrocer                         │    │
│  │ [ ] BudgetMart                          │    │
│  │ [Add Other] ________________             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [    Save Preferences   ]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Enhanced Features

Based on the requirements and AI suggestions, the following enhanced features are included in the wireframes:

### 1. Computer Vision for Food Recognition
- Camera interface to scan barcodes or take photos of food items
- AI-powered recognition of food items and estimated expiry dates
- Automated addition to inventory with suggested categorization

### 2. Smart Inventory Management
- Expiry date tracking with visual indicators
- Notifications for items nearing expiration
- Suggestions for recipes using expiring ingredients
- Automatic categorization and organization

### 3. AI-Powered Meal Planning
- Personalized meal suggestions based on:
  - User preferences and dietary restrictions
  - Current inventory (prioritizing expiring items)
  - Budget constraints
  - Seasonal availability
  - Previously liked recipes
- Weekly meal planning with nutritional balance
- Leftover incorporation into subsequent meals

### 4. Budget Optimization
- Setting weekly/monthly grocery budgets
- Cost estimation for meal plans and recipes
- Alternatives suggestions to reduce costs
- Visualization of spending patterns

### 5. Deal Scraping & Integration
- Automated scraping of local grocery store deals
- Integration of deals into grocery lists
- Suggestions for store selection based on deals
- Notification of special deals on frequently purchased items

### 6. Conversational AI Assistant
- Natural language interface for queries about recipes, inventory, and meal plans
- Voice interface for hands-free interaction while cooking
- Contextual understanding of user needs
- Proactive suggestions based on inventory and user patterns

## User Journey Map

A typical user journey might follow this path:

1. **Onboarding** - Set dietary preferences, allergies, household size, and budget
2. **Inventory Setup** - Add initial inventory items (scan, photo, or manual entry)
3. **Meal Planning** - Generate a week's meal plan based on preferences and inventory
4. **Grocery List Creation** - Auto-generate a list of needed items not in inventory
5. **Deal Integration** - Optimize grocery list based on current deals
6. **Shopping** - Purchase items and update inventory (scan receipts or items)
7. **Cooking** - Follow recipes with step-by-step instructions
8. **Inventory Updates** - Items used are automatically deducted from inventory
9. **Feedback** - Rate recipes and provide preferences for better future recommendations

This iterative cycle continues, with the AI learning more about the user's preferences and patterns over time, making increasingly accurate and helpful suggestions.

## Mobile-First Design Considerations

The wireframes prioritize a mobile-first approach, ensuring that all functionality is accessible and usable on smaller screens. Key considerations include:

- Large touch targets for easy interaction
- Progressive disclosure of information to prevent overwhelming users
- Bottom-navigation for key functions (Inventory, Meal Plan, Grocery List, Deals)
- Contextual actions based on current view
- Voice input option for hands-free operation, especially during cooking

## Prototyping Next Steps

1. Convert wireframes to interactive prototypes
2. Conduct user testing with target demographic
3. Refine UI/UX based on feedback
4. Implement core functionality MVP
5. Test AI integration with limited feature set
6. Expand features based on user adoption and feedback 