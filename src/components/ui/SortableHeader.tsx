import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SortField, SortDirection, SortConfig } from '@/hooks/useAdminUsers';

interface SortableHeaderProps {
  field: SortField;
  currentSort: SortConfig;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader({ 
  field, 
  currentSort, 
  onSort, 
  children, 
  className 
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;
  const direction = currentSort.direction;

  const getSortIcon = () => {
    if (!isActive) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    return direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-[#008089]" />
      : <ChevronDown className="h-4 w-4 text-[#008089]" />;
  };

  return (
    <th 
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none",
        isActive && "bg-gray-50",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between group">
        <span className={cn(
          isActive && "text-[#008089] font-semibold"
        )}>
          {children}
        </span>
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {getSortIcon()}
        </div>
      </div>
    </th>
  );
}