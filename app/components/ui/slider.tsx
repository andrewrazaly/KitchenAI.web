'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
  showValue?: boolean;
  showMinMax?: boolean;
  unit?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ 
  className = '', 
  showValue = true, 
  showMinMax = false, 
  unit = '', 
  formatValue, 
  value,
  defaultValue = [1],
  min = 1,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false,
  ...props 
}, ref) => {
  const currentValue = value || defaultValue;
  const displayValue = formatValue ? formatValue(currentValue[0]) : `${currentValue[0]}${unit ? ` ${unit}` : ''}`;

  return (
    <div className="w-full space-y-2">
      {(showValue || showMinMax) && (
        <div className="flex justify-between items-center">
          {showMinMax && (
            <span className="text-xs text-gray-500">{min}</span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-800 bg-green-100 px-2 py-1 rounded-md">
              {displayValue}
            </span>
          )}
          {showMinMax && (
            <span className="text-xs text-gray-500">{max}</span>
          )}
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={`relative flex w-full touch-none select-none items-center ${className}`}
        value={currentValue}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
        disabled={disabled}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full bg-green-600 rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-green-600 bg-white shadow-md ring-offset-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:scale-110 cursor-pointer" />
      </SliderPrimitive.Root>
      
      {showMinMax && !showValue && (
        <div className="flex justify-center">
          <span className="text-sm font-medium text-gray-800">
            {displayValue}
          </span>
        </div>
      )}
    </div>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider }; 