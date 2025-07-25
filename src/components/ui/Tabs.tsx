'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, className, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn("w-full", className)}>
      {/* Tab headers */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-[#008089] text-[#008089]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTabContent}
      </div>
    </div>
  );
}