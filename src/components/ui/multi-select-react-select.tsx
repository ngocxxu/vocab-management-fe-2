'use client';

import type { MultiValue } from 'react-select';
import React from 'react';
import Select from 'react-select';

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  maxCount?: number;
  className?: string;
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Choose subjects...',
  isDisabled = false,
  isLoading = false,
  className = '',
}) => {
  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleChange = (selectedOptions: MultiValue<Option>) => {
    const values = selectedOptions.map(option => option.value);
    onChange(values);
  };

  const formatOptionLabel = (option: Option) => {
    return (
      <div className="flex items-center justify-between">
        <span>{option.label}</span>
      </div>
    );
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      'minHeight': '36px', // h-9 to match other form elements
      'height': 'auto',
      'borderColor': state.isFocused
        ? 'hsl(var(--ring))'
        : state.hasValue
          ? 'hsl(var(--border))'
          : 'hsl(var(--border))',
      'boxShadow': state.isFocused
        ? '0 0 0 3px hsl(var(--ring) / 0.5)'
        : '0 1px 2px 0 rgb(0 0 0 / 0.05)', // shadow-xs
      'backgroundColor': 'transparent',
      'borderRadius': '6px', // rounded-md
      'border': '1px solid hsl(var(--border))',
      'transition': 'color, box-shadow',
      '&:hover': {
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
      },
      '&:focus-within': {
        borderColor: 'hsl(var(--ring))',
        boxShadow: '0 0 0 3px hsl(var(--ring) / 0.5)',
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: '2px 8px', // px-3 py-1
      gap: '4px',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '14px', // text-sm
      margin: '0',
      padding: '0',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px', // text-sm
      margin: '0',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--secondary))',
      borderRadius: '4px', // rounded-sm
      border: '1px solid hsl(var(--border))',
      margin: '1px',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--secondary-foreground))',
      fontSize: '12px', // text-xs
      padding: '2px 6px',
      fontWeight: '500',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      'color': 'hsl(var(--muted-foreground))',
      'borderRadius': '0 4px 4px 0',
      'padding': '2px 4px',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      padding: '0 8px',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      display: 'none', // Hide the separator
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      'color': 'hsl(var(--muted-foreground))',
      'padding': '0',
      '&:hover': {
        color: 'hsl(var(--foreground))',
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      'color': 'hsl(var(--muted-foreground))',
      'padding': '0',
      '&:hover': {
        color: 'hsl(var(--foreground))',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px', // rounded-md
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // shadow-md
      marginTop: '4px',
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '4px', // p-1
      maxHeight: '200px',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      'backgroundColor': state.isFocused
        ? 'hsl(var(--accent))'
        : 'transparent',
      'color': state.isFocused
        ? 'hsl(var(--accent-foreground))'
        : 'hsl(var(--foreground))',
      'fontSize': '14px', // text-sm
      'padding': '6px 8px', // py-1.5 px-2
      'borderRadius': '4px', // rounded-sm
      'cursor': 'pointer',
      '&:hover': {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
      },
      '&:active': {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
      padding: '8px 12px',
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
      padding: '8px 12px',
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isLoading={isLoading}
        formatOptionLabel={formatOptionLabel}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={customStyles}
        maxMenuHeight={200}
        menuPlacement="auto"
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable={false}
        isSearchable={true}
        noOptionsMessage={() => 'No subjects found'}
        loadingMessage={() => 'Loading subjects...'}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        classNames={{
          control: () => 'border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50',
          valueContainer: () => 'px-3 py-1',
          input: () => 'text-sm',
          placeholder: () => 'text-muted-foreground text-sm',
          multiValue: () => 'bg-secondary text-secondary-foreground',
          multiValueLabel: () => 'text-xs',
          multiValueRemove: () => 'hover:bg-destructive hover:text-destructive-foreground',
          menu: () => 'bg-popover text-popover-foreground border shadow-md',
          option: () => 'text-sm hover:bg-accent hover:text-accent-foreground',
        }}
      />
    </div>
  );
};

export default MultiSelect;
