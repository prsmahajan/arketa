'use client';

import React from 'react';

export default function BeyondClassesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-auto flex flex-col">
        {children}
      </div>
    </div>
  );
}
