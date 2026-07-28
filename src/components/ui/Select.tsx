import React from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options?: SelectOption[]; // Make optional with default
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ 
    options = [], // Add default empty array
    value, 
    onChange, 
    placeholder = 'Select an option', 
    label, 
    error, 
    helperText, 
    disabled, 
    required,
    className,
    size = 'default'
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const selectRef = React.useRef<HTMLDivElement>(null);
    
    const selectedOption = options?.find(option => option.value === value);
    const hasError = !!error;

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm min-w-[120px]',
      default: 'h-11 px-4 text-sm min-w-[140px]',
      lg: 'h-12 px-4 text-base min-w-[160px]',
    };

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && focusedIndex >= 0) {
            const option = options[focusedIndex];
            if (!option.disabled) {
              onChange(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex(prev => {
              const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
              return options[nextIndex]?.disabled ? nextIndex + 1 : nextIndex;
            });
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex(prev => {
              const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
              return options[nextIndex]?.disabled ? nextIndex - 1 : nextIndex;
            });
          }
          break;
      }
    };

    const handleOptionClick = (option: SelectOption) => {
      if (option.disabled) return;
      onChange(option.value);
      setIsOpen(false);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative" ref={selectRef}>
          <button
            ref={ref}
            type="button"
            className={cn(
              'flex w-full items-center justify-between rounded-lg border-2 bg-white shadow-sm transition-all duration-200',
              'hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:shadow-lg focus:ring-4 focus:ring-blue-100',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200',
              sizeClasses[size],
              hasError && 'border-red-300 focus:border-red-500 focus:ring-red-100',
              !hasError && !isOpen && 'border-gray-200',
              isOpen && !hasError && 'border-blue-500 shadow-lg ring-4 ring-blue-100',
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn(
              'font-medium truncate',
              selectedOption ? 'text-gray-900' : 'text-gray-500'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDownIcon 
              className={cn(
                'h-5 w-5 text-gray-400 transition-all duration-200 flex-shrink-0 ml-2',
                isOpen && 'rotate-180 text-blue-500',
                !disabled && 'group-hover:text-gray-600'
              )} 
            />
          </button>

          {isOpen && options.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="max-h-64 overflow-auto py-2" role="listbox">
                {options.map((option, index) => (
                  <div
                    key={option.value}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center px-4 py-3 text-sm transition-colors duration-150',
                      option.disabled && 'cursor-not-allowed opacity-50',
                      !option.disabled && 'hover:bg-blue-50 hover:text-blue-900',
                      focusedIndex === index && 'bg-blue-50 text-blue-900',
                      value === option.value && 'bg-blue-100 text-blue-900 font-medium'
                    )}
                    onClick={() => handleOptionClick(option)}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {value === option.value && (
                      <CheckIcon className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn(
            "text-sm",
            error ? "text-red-600" : "text-gray-500"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };