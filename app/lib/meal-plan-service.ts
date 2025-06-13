export interface QueuedRecipe {
  id: string;
  title: string;
  source: string;
  image: string;
  cookingTime: string;
  difficulty: string;
  assignedTo?: {
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
  };
}

export const addRecipeToQueue = (recipe: {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  prepTime?: string;
  difficulty?: string;
}): boolean => {
  try {
    const existingQueue = getRecipeQueue();
    
    // Check if recipe is already in queue
    const isAlreadyInQueue = existingQueue.some(item => item.id === recipe.id);
    if (isAlreadyInQueue) {
      return false; // Recipe already in queue
    }
    
    const queuedRecipe: QueuedRecipe = {
      id: recipe.id,
      title: recipe.title,
      source: recipe.creator,
      image: recipe.imageUrl,
      cookingTime: recipe.prepTime || '30 min',
      difficulty: recipe.difficulty || 'Medium'
    };
    
    const updatedQueue = [queuedRecipe, ...existingQueue];
    localStorage.setItem('mealPlannerQueue', JSON.stringify(updatedQueue));
    
    return true;
  } catch (error) {
    console.error('Error adding recipe to queue:', error);
    return false;
  }
};

export const getRecipeQueue = (): QueuedRecipe[] => {
  try {
    const stored = localStorage.getItem('mealPlannerQueue');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading recipe queue:', error);
    return [];
  }
};

export const removeFromQueue = (recipeId: string): boolean => {
  try {
    const existingQueue = getRecipeQueue();
    const updatedQueue = existingQueue.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('mealPlannerQueue', JSON.stringify(updatedQueue));
    return true;
  } catch (error) {
    console.error('Error removing recipe from queue:', error);
    return false;
  }
}; 