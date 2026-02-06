import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string | number;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, value, min, max, step = 0.1, onChange, displayValue, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="space-y-2">
        {(label || displayValue !== undefined) && (
          <div className="flex justify-between items-center">
            {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
            <span className="text-sm font-mono text-slate-500">
              {displayValue !== undefined ? displayValue : value}
            </span>
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={cn(
              'w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-[#119a6a]/20',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-[#119a6a]',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:appearance-none',
              '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-[#119a6a]',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:shadow-md',
              '[&::-moz-range-thumb]:cursor-pointer',
              className
            )}
            style={{
              background: `linear-gradient(to right, #119a6a 0%, #119a6a ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
            }}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
