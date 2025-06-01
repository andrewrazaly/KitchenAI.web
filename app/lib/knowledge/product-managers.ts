export const productManagerPersonas = {
  innovationPM: {
    name: "Alex Thompson",
    specialty: "Innovation and Emerging Technologies",
    background: "10 years experience in AI/ML products",
    focusAreas: [
      "Cutting-edge technology integration",
      "User-centric innovation",
      "Market disruption strategies",
      "Early adopter engagement"
    ],
    suggestionsStyle: "Forward-thinking, emphasizes innovation and user delight",
    commonAdvice: [
      "Start with a clear user pain point",
      "Test revolutionary features with a small user group",
      "Balance innovation with usability",
      "Consider future scalability from day one",
      "Build in feedback loops for rapid iteration"
    ]
  },

  userExperiencePM: {
    name: "Sarah Chen",
    specialty: "User Experience and Interface Design",
    background: "UX researcher turned Product Manager",
    focusAreas: [
      "User journey optimization",
      "Accessibility standards",
      "Interface simplification",
      "User research methodologies"
    ],
    suggestionsStyle: "User-centric, focuses on simplicity and accessibility",
    commonAdvice: [
      "Always start with user research",
      "Design for inclusivity",
      "Reduce cognitive load",
      "Create clear user flows",
      "Test with diverse user groups"
    ]
  },

  dataAnalyticsPM: {
    name: "Marcus Rodriguez",
    specialty: "Data Analytics and Metrics",
    background: "Data scientist with product focus",
    focusAreas: [
      "KPI definition and tracking",
      "A/B testing strategies",
      "Data-driven decision making",
      "Performance optimization"
    ],
    suggestionsStyle: "Analytical, bases decisions on concrete metrics",
    commonAdvice: [
      "Define measurable success metrics",
      "Implement comprehensive analytics",
      "Use data to validate assumptions",
      "Track user behavior patterns",
      "Make iterative improvements based on data"
    ]
  },

  growthPM: {
    name: "Jordan Lee",
    specialty: "Growth and Scale",
    background: "Growth hacker turned Product Manager",
    focusAreas: [
      "User acquisition",
      "Retention strategies",
      "Viral mechanics",
      "Monetization optimization"
    ],
    suggestionsStyle: "Growth-focused, emphasizes scalability and viral potential",
    commonAdvice: [
      "Build viral loops into core features",
      "Focus on key retention metrics",
      "Optimize onboarding flow",
      "Create shareable moments",
      "Design for network effects"
    ]
  },

  aiEthicsPM: {
    name: "Dr. Maya Patel",
    specialty: "AI Ethics and Responsible Innovation",
    background: "PhD in AI Ethics, 5 years in product",
    focusAreas: [
      "Ethical AI development",
      "Bias detection and mitigation",
      "Privacy protection",
      "Transparent AI systems"
    ],
    suggestionsStyle: "Ethically-minded, focuses on responsible innovation",
    commonAdvice: [
      "Consider ethical implications early",
      "Build in transparency mechanisms",
      "Test for potential biases",
      "Protect user privacy by design",
      "Create clear accountability structures"
    ]
  },

  mealPlanningPM: {
    name: "Rachel Martinez",
    specialty: "AI-Driven Meal Planning Systems",
    background: "Culinary Institute + 8 years in food-tech products",
    focusAreas: [
      "Personalized nutrition",
      "Recipe optimization",
      "Smart kitchen integration",
      "Food waste reduction"
    ],
    suggestionsStyle: "Culinary-focused, emphasizes practical implementation and user delight",
    commonAdvice: [
      "Start with core meal planning functionality before adding advanced features",
      "Focus on reducing decision fatigue for users",
      "Ensure robust dietary restriction handling",
      "Build strong data foundations for personalization",
      "Prioritize features that prevent food waste"
    ],
    domainKnowledge: {
      coreFunctionalities: {
        recipeDatabase: {
          indexing: [
            "Cuisine type",
            "Preparation time",
            "Skill level",
            "Cost per serving",
            "Seasonality"
          ],
          nutritionTracking: [
            "Macronutrients per serving",
            "Micronutrients",
            "Allergen information",
            "Dietary compliance"
          ]
        },
        mealPlanGeneration: {
          features: [
            "Multi-day scheduling",
            "Leftover integration",
            "Caloric target adaptation",
            "Macro balancing"
          ],
          constraints: [
            "Dietary restrictions",
            "Budget limits",
            "Time availability",
            "Skill level"
          ]
        },
        groceryManagement: {
          features: [
            "Automated list generation",
            "Pantry synchronization",
            "Barcode scanning",
            "Smart inventory tracking"
          ],
          integration: [
            "Local store pricing",
            "Online ordering",
            "Delivery services",
            "Seasonal availability"
          ]
        },
        cookingGuidance: {
          interfaces: [
            "Step-by-step instructions",
            "Voice commands",
            "Video tutorials",
            "Real-time adjustments"
          ],
          smartFeatures: [
            "Hands-free control",
            "Timer management",
            "Quantity conversion",
            "Technique guidance"
          ]
        }
      },
      advancedFeatures: {
        aiPersonalization: {
          learning: [
            "Taste preferences",
            "Cooking skill progression",
            "Schedule patterns",
            "Budget optimization"
          ],
          adaptation: [
            "Smart ingredient substitution",
            "Portion size adjustment",
            "Complexity scaling",
            "Time management"
          ]
        },
        constraintOptimization: {
          parameters: [
            "Budget constraints",
            "Time availability",
            "Nutritional targets",
            "Ingredient availability"
          ],
          modes: [
            "Quick-fix meals",
            "Batch cooking",
            "Budget-friendly",
            "Nutrition-focused"
          ]
        },
        socialFeatures: {
          community: [
            "Recipe sharing",
            "Meal plan exchange",
            "Group challenges",
            "Social cooking"
          ],
          collaboration: [
            "Family meal coordination",
            "Shared shopping lists",
            "Group meal planning",
            "Recipe reviews"
          ]
        }
      },
      userProblems: {
        decisionFatigue: {
          problem: "I don't know what to cook",
          solutions: [
            "AI-powered suggestions",
            "Pantry-based recommendations",
            "Quick-decision interfaces",
            "Favorite meal rotation"
          ]
        },
        dietaryRestrictions: {
          problem: "I have specific dietary needs",
          solutions: [
            "Allergen filtering",
            "Automatic substitutions",
            "Certification badges",
            "Cross-contamination warnings"
          ]
        },
        timeManagement: {
          problem: "I have limited time",
          solutions: [
            "Quick meal filters",
            "Batch cooking plans",
            "Prep-ahead suggestions",
            "Time-optimized shopping"
          ]
        },
        budgetConstraints: {
          problem: "I need to control costs",
          solutions: [
            "Budget tracking",
            "Price optimization",
            "Sale integration",
            "Bulk cooking plans"
          ]
        },
        nutritionGoals: {
          problem: "I want to meet health targets",
          solutions: [
            "Macro tracking",
            "Portion control",
            "Progress monitoring",
            "Health app integration"
          ]
        },
        wasteReduction: {
          problem: "I hate wasting food",
          solutions: [
            "Leftover recipes",
            "Expiry tracking",
            "Ingredient optimization",
            "Storage guidance"
          ]
        }
      }
    }
  },

  getAdvice: function(area: 'innovation' | 'ux' | 'data' | 'growth' | 'ethics' | 'meal-planning') {
    switch(area) {
      case 'innovation':
        return this.innovationPM;
      case 'ux':
        return this.userExperiencePM;
      case 'data':
        return this.dataAnalyticsPM;
      case 'growth':
        return this.growthPM;
      case 'ethics':
        return this.aiEthicsPM;
      case 'meal-planning':
        return this.mealPlanningPM;
      default:
        throw new Error('Unknown area of expertise');
    }
  },

  getAllSuggestions: function(feature: string) {
    return {
      innovation: this.innovationPM.commonAdvice,
      ux: this.userExperiencePM.commonAdvice,
      data: this.dataAnalyticsPM.commonAdvice,
      growth: this.growthPM.commonAdvice,
      ethics: this.aiEthicsPM.commonAdvice,
      'meal-planning': this.mealPlanningPM.commonAdvice
    };
  },

  getPrioritizedAdvice: function(feature: string, priorities: string[]) {
    const allAdvice = this.getAllSuggestions(feature);
    return priorities.map(priority => ({
      area: priority,
      advice: allAdvice[priority as keyof typeof allAdvice]
    }));
  },

  getMealPlanningFeatures: function(category: 'core' | 'advanced' | 'problems') {
    const pm = this.mealPlanningPM;
    switch(category) {
      case 'core':
        return pm.domainKnowledge.coreFunctionalities;
      case 'advanced':
        return pm.domainKnowledge.advancedFeatures;
      case 'problems':
        return pm.domainKnowledge.userProblems;
      default:
        throw new Error('Unknown category');
    }
  }
}; 