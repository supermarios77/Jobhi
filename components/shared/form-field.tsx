"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  isValid?: boolean;
  className?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  helperText,
  isValid,
  className,
  inputClassName,
}: FormFieldProps) {
  const hasError = !!error;
  const showValid = isValid && !hasError && value.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="block text-base sm:text-lg font-medium text-foreground mb-2"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={cn(
            "w-full px-5 py-4 rounded-lg border-2 bg-background text-foreground placeholder:text-text-secondary/60",
            "focus:outline-none focus:ring-4 transition-all text-base sm:text-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : showValid
              ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
              : "border-border focus:border-foreground focus:ring-foreground/20",
            inputClassName
          )}
        />
        
        {/* Validation Icons */}
        {showValid && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
          </div>
        )}
        {hasError && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !hasError && (
        <p id={`${id}-helper`} className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p
          id={`${id}-error`}
          className="text-sm sm:text-base text-destructive flex items-start gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

