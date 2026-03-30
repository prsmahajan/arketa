'use client';

import { useState, useCallback } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import type { Tag } from './clients-data';
import { TagBadge } from './tag-badge';
import { useClickOutside } from './use-click-outside';

type SelectionActionBarProps = {
  selectedCount: number;
  tags: Tag[];
  selectedClientTagIds: string[];
  onAddTag: (tagId: string) => void;
  onRemoveTags: (tagIds: string[]) => void;
  onClear: () => void;
  onOpenAddTag: () => void;
};

export function SelectionActionBar({
  selectedCount,
  tags,
  selectedClientTagIds,
  onAddTag,
  onRemoveTags,
  onClear,
  onOpenAddTag,
}: SelectionActionBarProps) {
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [removeTagOpen, setRemoveTagOpen] = useState(false);
  const [removeChecked, setRemoveChecked] = useState<Set<string>>(new Set());
  const [removeSearch, setRemoveSearch] = useState('');

  const closeAdd = useCallback(() => setAddTagOpen(false), []);
  const closeRemove = useCallback(() => {
    setRemoveTagOpen(false);
    setRemoveChecked(new Set());
    setRemoveSearch('');
  }, []);

  const addRef = useClickOutside<HTMLDivElement>(addTagOpen, closeAdd);
  const removeRef = useClickOutside<HTMLDivElement>(removeTagOpen, closeRemove);

  const assignedTags = tags.filter((t) => selectedClientTagIds.includes(t.id));
  const filteredRemoveTags = assignedTags.filter((t) =>
    t.name.toLowerCase().includes(removeSearch.toLowerCase()),
  );

  const toggleRemoveCheck = (tagId: string) => {
    setRemoveChecked((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleRemoveConfirm = () => {
    if (removeChecked.size > 0) onRemoveTags(Array.from(removeChecked));
    closeRemove();
  };

  return (
    <div className="flex justify-center border-t border-gray-200 bg-white px-6 py-2.5">
      <div className="flex items-center gap-3 rounded-full border border-dashed border-gray-300 bg-white px-4 py-2 shadow-sm">
        {/* Selected count + clear */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          {selectedCount} selected
          <button
            onClick={onClear}
            className="rounded-full p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Add tag */}
        <div ref={addRef} className="relative">
          <button
            onClick={() => setAddTagOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} className="text-gray-400" />
            Add tag
          </button>
          {addTagOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    onAddTag(tag.id);
                    setAddTagOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <TagBadge tag={tag} />
                </button>
              ))}
              {tags.length === 0 && (
                <p className="px-3 py-1.5 text-xs text-gray-400">No tags yet</p>
              )}
              <button
                onClick={() => {
                  setAddTagOpen(false);
                  onOpenAddTag();
                }}
                className="flex w-full items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100"
              >
                <Plus size={14} className="text-gray-500" />
                Add new tag
              </button>
            </div>
          )}
        </div>

        {/* Remove tag */}
        <div ref={removeRef} className="relative">
          <button
            onClick={() => setRemoveTagOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Minus size={14} className="text-gray-400" />
            Remove tag
          </button>
          {removeTagOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-[220px] rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="px-3 pt-3 pb-2">
                <input
                  type="text"
                  value={removeSearch}
                  onChange={(e) => setRemoveSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full h-8 rounded border border-gray-300 bg-white px-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>

              <div className="px-3 py-1 max-h-[160px] overflow-y-auto">
                {filteredRemoveTags.length > 0 ? (
                  filteredRemoveTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1"
                    >
                      <input
                        type="checkbox"
                        checked={removeChecked.has(tag.id)}
                        onChange={() => toggleRemoveCheck(tag.id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 accent-[#5b7a6e] cursor-pointer"
                      />
                      <TagBadge tag={tag} />
                    </label>
                  ))
                ) : (
                  <p className="py-1.5 text-xs text-gray-400">No tags found</p>
                )}
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                <button
                  onClick={handleRemoveConfirm}
                  disabled={removeChecked.size === 0}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={closeRemove}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
