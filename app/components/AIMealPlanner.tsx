'use client';

import { useState } from 'react';
import { dietaryRestrictionOptions, cuisineOptions } from '../models/Recipe';
import { daysOfWeek } from '../models/UserPreferences';

export default function AIMealPlanner() {
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState<number | ''>('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);
    
    // Simulate an API call to the AI service
    setTimeout(() => {
      setLoading(false);
      setResultMessage('Your meal plan has been generated and is ready! View it in the Meal Plan section.');
    }, 3000);
    
    // In a real application, you would call your backend API here
    // const response = await fetch('/api/generate-meal-plan', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     budget,
    //     preferences,
    //     restrictions,
    //     cuisines,
    //     days
    //   })
    // });
    // 
    // const data = await response.json();
    // setLoading(false);
    // if (response.ok) {
    //   setResultMessage('Your meal plan has been generated and is ready! View it in the Meal Plan section.');
    // } else {
    //   setResultMessage(`Error: ${data.message}`);
    // }
  };

  const handlePreferenceToggle = (preference: string) => {
    if (preferences.includes(preference)) {
      setPreferences(preferences.filter(p => p !== preference));
    } else {
      setPreferences([...preferences, preference]);
    }
  };

  const handleRestrictionToggle = (restriction: string) => {
    if (restrictions.includes(restriction)) {
      setRestrictions(restrictions.filter(r => r !== restriction));
    } else {
      setRestrictions([...restrictions, restriction]);
    }
  };

  const handleCuisineToggle = (cuisine: string) => {
    if (cuisines.includes(cuisine)) {
      setCuisines(cuisines.filter(c => c !== cuisine));
    } else {
      setCuisines([...cuisines, cuisine]);
    }
  };

  const handleDayToggle = (day: string) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-4">AI Meal Planner</h2>
      <p className="mb-4 text-gray-600">
        Our AI will create a personalized meal plan based on your preferences, dietary restrictions, and budget.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="budget" className="block mb-1 font-medium">Weekly Budget (optional)</label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
            placeholder="Enter your weekly grocery budget"
            className="input w-full"
            min="0"
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank if you don't want to set a budget constraint.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">Which days do you want to plan?</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-3 py-1 rounded-full text-sm ${
                  days.includes(day) 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">Dietary Restrictions</label>
          <div className="flex flex-wrap gap-2">
            {dietaryRestrictionOptions.map(restriction => (
              <button
                key={restriction}
                type="button"
                onClick={() => handleRestrictionToggle(restriction)}
                className={`px-3 py-1 rounded-full text-sm ${
                  restrictions.includes(restriction) 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {restriction}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">Preferred Cuisines</label>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.slice(0, 10).map(cuisine => (
              <button
                key={cuisine}
                type="button"
                onClick={() => handleCuisineToggle(cuisine)}
                className={`px-3 py-1 rounded-full text-sm ${
                  cuisines.includes(cuisine) 
                    ? 'bg-secondary-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {cuisine}
              </button>
            ))}
            {cuisines.length > 0 && (
              <button
                type="button"
                onClick={() => setCuisines([])}
                className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-1 font-medium">Food Preferences</label>
          <textarea
            placeholder="Enter any specific preferences (e.g., 'I love pasta', 'I want high protein meals', 'Quick 30-minute recipes only')"
            className="input w-full"
            rows={3}
            onChange={(e) => setPreferences(e.target.value.split(',').map(p => p.trim()).filter(p => p))}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={loading || days.length === 0}
        >
          {loading ? 'Generating Your Meal Plan...' : 'Create AI Meal Plan'}
        </button>
        
        {resultMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            {resultMessage}
          </div>
        )}
      </form>
    </div>
  );
} 