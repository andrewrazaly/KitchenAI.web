'use client';

import React, { useState } from 'react';
import { Button } from "./ui/button";

// Demo function to show how voice parsing works
export function parseVoiceDemo(text: string) {
  const items: any[] = [];
  
  // Enhanced regex patterns for parsing grocery lists
  const patterns = [
    // Pattern: "500 grams of chicken" or "2 kg rice"
    /(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?|items?)\s+(?:of\s+)?([a-zA-Z\s]+)/gi,
    // Pattern: "chicken 500 grams" 
    /([a-zA-Z\s]+?)\s+(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?|items?)/gi,
    // Pattern: "I have 3 apples"
    /(?:I\s+have\s+|get\s+|buy\s+|need\s+)?(\d+(?:\.\d+)?)\s+([a-zA-Z\s]+)/gi
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let quantity, unit, name;
      
      if (pattern.source.includes('grams?|kg')) {
        // First two patterns with explicit units
        quantity = parseFloat(match[1]);
        unit = match[2].toLowerCase();
        name = match[3].trim();
      } else {
        // Third pattern - assume items
        quantity = parseFloat(match[1]);
        name = match[2].trim();
        unit = 'item';
      }

      if (quantity && name && quantity > 0) {
        // Normalize unit
        let normalizedUnit = 'item';
        if (unit.includes('g') && !unit.includes('kg')) normalizedUnit = 'g';
        else if (unit.includes('kg') || unit.includes('kilogram')) normalizedUnit = 'kg';

        // Clean up name
        const cleanName = name
          .replace(/\b(and|or|with|plus)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanName.length > 1) {
          items.push({
            name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            quantity,
            unit: normalizedUnit,
            confidence: 0.85
          });
        }
      }
    }
  });

  return items;
}

export default function VoiceDemo() {
  const [testInput, setTestInput] = useState("I have 500 grams of chicken, 2 kg rice, 300 grams tomatoes, and 6 apples");
  const [results, setResults] = useState<any[]>([]);

  const handleTest = () => {
    const parsed = parseVoiceDemo(testInput);
    setResults(parsed);
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Voice Parsing Demo</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Input:</label>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Try: '500 grams chicken, 2 kg rice, 300 grams tomatoes, 6 apples'"
          />
        </div>
        
        <Button onClick={handleTest} className="bg-blue-600 text-white">
          Parse Text
        </Button>
        
        {results.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Parsed Items:</h4>
            <div className="space-y-2">
              {results.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border">
                  <strong>{item.name}</strong>: {item.quantity} {item.unit} 
                  <span className="text-sm text-gray-500 ml-2">
                    (confidence: {Math.round(item.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 