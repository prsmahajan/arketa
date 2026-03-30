'use client';

import { useState, useCallback } from 'react';
import { MoreHorizontal, Phone, Mail, MessageCircle, ClipboardCheck } from 'lucide-react';
import { useClickOutside } from './use-click-outside';

const ACTIONS = [
  { icon: Phone, label: 'Call' },
  { icon: Mail, label: 'Send email' },
  { icon: MessageCircle, label: 'Send text' },
  { icon: ClipboardCheck, label: 'Add task' },
] as const;

export function RowActionsMenu({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(open, close);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {ACTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Icon size={15} className="text-gray-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
