'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../app/components/ui/dialog";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { Textarea } from "../../../app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../app/components/ui/select";
import { Label } from "../../../app/components/ui/label";
import { addRecipeToReel } from '../../lib/saved-reels-service';
import { useSupabase } from '../../../app/hooks/useSupabase';
import { toast } from 'sonner';

interface RecipeDialogProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeDialog({ reelId, isOpen, onClose }: RecipeDialogProps) {
  const supabase = useSupabase();
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: '',
    servings: 1,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    cuisine: '',
    tags: ['']
  });

  const handleAddIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const handleAddInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const handleAddTag = () => {
    setRecipe(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = value;
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...recipe.tags];
    newTags[index] = value.toLowerCase();
    setRecipe(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleSave = async () => {
    try {
      // Filter out empty values
      const cleanedRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.filter(Boolean),
        instructions: recipe.instructions.filter(Boolean),
        tags: recipe.tags.filter(Boolean)
      };

      await addRecipeToReel(reelId, cleanedRecipe, supabase);
      toast.success('Recipe added to reel successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add recipe');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recipe Details</DialogTitle>
          <DialogDescription>
            Add recipe details to your saved reel for better organization
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              id="name"
              value={recipe.name}
              onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter recipe name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={recipe.description}
              onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter recipe description"
            />
          </div>

          <div className="grid gap-2">
            <Label>Ingredients</Label>
            {recipe.ingredients.map((ingredient, index) => (
              <Input
                key={index}
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
            ))}
            <Button type="button" variant="outline" onClick={handleAddIngredient}>
              Add Ingredient
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Instructions</Label>
            {recipe.instructions.map((instruction, index) => (
              <Textarea
                key={index}
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
              />
            ))}
            <Button type="button" variant="outline" onClick={handleAddInstruction}>
              Add Step
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cookingTime">Cooking Time</Label>
              <Input
                id="cookingTime"
                value={recipe.cookingTime}
                onChange={(e) => setRecipe(prev => ({ ...prev, cookingTime: e.target.value }))}
                placeholder="e.g. 30 minutes"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={recipe.servings}
                onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={recipe.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                  setRecipe(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                value={recipe.cuisine}
                onChange={(e) => setRecipe(prev => ({ ...prev, cuisine: e.target.value }))}
                placeholder="e.g. Italian"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            {recipe.tags.map((tag, index) => (
              <Input
                key={index}
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder={`Tag ${index + 1}`}
              />
            ))}
            <Button type="button" variant="outline" onClick={handleAddTag}>
              Add Tag
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Recipe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 