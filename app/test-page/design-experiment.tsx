'use client';

import React from 'react';

export default function DesignExperiment() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🎨 Design Experiment Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Safe Design Testing</h2>
          <p className="text-gray-600 mb-4">
            This page is completely separate from your main app. You can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Test new component designs</li>
            <li>Experiment with different layouts</li>
            <li>Try new color schemes</li>
            <li>Test animations and interactions</li>
            <li>Prototype new features</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example design experiment */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Card Design Test</h3>
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-4 text-white">
              <h4 className="font-semibold">Recipe Card</h4>
              <p className="text-sm opacity-90">This is a test design</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Button Design Test</h3>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors">
              Test Button
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Tips for Safe Design Work:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Always work on a separate branch</li>
            <li>• Create test pages like this one</li>
            <li>• Use component variants (e.g., ButtonV2, ButtonV3)</li>
            <li>• Keep original files as backup</li>
            <li>• Test thoroughly before merging</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 