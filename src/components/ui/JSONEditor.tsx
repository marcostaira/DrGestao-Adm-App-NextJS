'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  disabled?: boolean;
  className?: string;
}

export function JSONEditor({ 
  value, 
  onChange, 
  isValid = true, 
  disabled = false,
  className 
}: JSONEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajustar altura automaticamente
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab para indentação
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Reposicionar cursor
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full min-h-[400px] p-4 border rounded-lg font-mono text-sm resize-none",
          "focus:outline-none focus:ring-2 focus:ring-[#008089] focus:border-transparent",
          "bg-gray-900 text-green-400 border-gray-700",
          !isValid && "border-red-500 bg-red-50 text-red-900",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        placeholder="Digite o JSON aqui..."
        spellCheck={false}
      />
      
      {/* Indicador de status */}
      <div className="absolute top-2 right-2">
        {isValid ? (
          <div className="w-3 h-3 bg-green-500 rounded-full" title="JSON válido" />
        ) : (
          <div className="w-3 h-3 bg-red-500 rounded-full" title="JSON inválido" />
        )}
      </div>
    </div>
  );
}