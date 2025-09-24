'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/libs/utils';

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
};

export function ColorPicker({ value, onChange, disabled, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color: string) => {
    onChange(color);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-12 w-full justify-start gap-3 border-2 border-dashed transition-all duration-200 hover:border-solid',
            className,
          )}
          style={{ backgroundColor: value }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm font-medium text-gray-700">
              {value.toUpperCase()}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Choose a color</div>
          <HexColorPicker
            color={value}
            onChange={handleColorChange}
            className="!h-48 !w-48"
          />
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-xs text-gray-600">{value.toUpperCase()}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
