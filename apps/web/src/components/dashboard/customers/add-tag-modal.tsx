'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TAG_COLORS } from './clients-data';
import type { Tag } from './clients-data';

type AddTagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tag: Tag) => void;
};

export function AddTagModal({ isOpen, onClose, onSubmit }: AddTagModalProps) {
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!tagName.trim()) return;
    onSubmit({
      id: String(Date.now()),
      name: tagName.trim(),
      color: selectedColor,
    });
    setTagName('');
    setSelectedColor('blue');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-full max-w-[380px] max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Add New Tag</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tag Name</label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors mb-4"
          />

          {/* Color options */}
          <div className="space-y-2.5">
            {TAG_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className="block"
              >
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium transition-colors',
                    color.bg,
                    color.text,
                    color.border,
                    selectedColor === color.name && 'ring-2 ring-offset-1 ring-gray-400',
                  )}
                >
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={!tagName.trim()}
            className="w-full h-11 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add New Tag
          </button>
        </div>
      </div>
    </div>
  );
}
