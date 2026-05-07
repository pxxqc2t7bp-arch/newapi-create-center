import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function EditableValue({ 
  value, 
  onChange, 
  min, 
  max,
  unit = ""
}: { 
  value: number; 
  onChange: (val: number) => void; 
  min: number; 
  max: number; 
  unit?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleBlur = () => {
    setIsEditing(false);
    let num = parseInt(tempValue);
    if (isNaN(num)) {
      setTempValue(value.toString());
      return;
    }
    num = Math.max(min, Math.min(max, num));
    onChange(num);
    setTempValue(num.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center text-xs text-slate-700 relative">
        <input
          autoFocus
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-16 text-center bg-white/60 backdrop-blur-md border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-md px-1 py-1 outline-none focus:ring-2 focus:ring-blue-400/50 transition-all font-medium"
          min={min}
          max={max}
        />
      </div>
    );
  }

  return (
    <span 
      className="text-xs font-medium text-slate-600 cursor-text hover:text-blue-600 bg-white/40 hover:bg-white/60 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-md px-3 py-1 transition-all border border-white/60 hover:border-blue-200 flex items-center justify-center min-w-[40px]"
      onClick={() => {
        setTempValue(value.toString());
        setIsEditing(true);
      }}
      title="点击编辑"
    >
      {value}{unit}
    </span>
  );
}

export function GlassSlider({ 
  value, 
  min, 
  max, 
  onChange, 
  colorClass = "accent-blue-500" 
}: { 
  value: number; 
  min: number; 
  max: number; 
  onChange: (val: number) => void; 
  colorClass?: string; 
}) {
  return (
    <div className="relative w-full h-5 flex items-center group">
      <div className="absolute w-full h-2 bg-black/5 backdrop-blur-sm rounded-full shadow-inner border border-white/20 pointer-events-none transition-colors group-hover:bg-black/10" />
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={cn("w-full h-full relative z-10 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-current", colorClass)}
        style={{ color: 'var(--tw-accent-color)' }}
      />
    </div>
  );
}
