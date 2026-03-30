'use client';

import { useState, useCallback } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import type { Tag, DisplaySettings } from './clients-data';
import { useClickOutside } from './use-click-outside';
import { DisplayPopover } from './display-popover';

type ClientsToolbarProps = {
  onAddNew: () => void;
  tags: Tag[];
  onOpenAddTag: () => void;
  onToggleTagOnSelected: (tagId: string, checked: boolean) => void;
  hasSelection: boolean;
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (settings: DisplaySettings) => void;
};

const MORE_OPTIONS = ['Upload CSV', 'Export CSV', 'Create segment', 'Create custom field'] as const;

export function ClientsToolbar({
  onAddNew,
  tags,
  onOpenAddTag,
  onToggleTagOnSelected,
  hasSelection,
  displaySettings,
  onDisplaySettingsChange,
}: ClientsToolbarProps) {
  const [search, setSearch] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const closeMore = useCallback(() => setMoreOpen(false), []);
  const closeTags = useCallback(() => setTagsOpen(false), []);
  const moreRef = useClickOutside<HTMLDivElement>(moreOpen, closeMore);
  const tagsRef = useClickOutside<HTMLDivElement>(tagsOpen, closeTags);

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  return (
    <div className="flex items-center justify-between gap-3 px-6">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a client"
            className="h-8 w-[220px] rounded border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors"
          />
        </div>

        {/* Tags dropdown */}
        <div ref={tagsRef} className="relative">
          <button
            onClick={() => setTagsOpen((prev) => !prev)}
            className="h-8 rounded border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tags
          </button>
          {tagsOpen && (
            <div className="absolute left-0 top-9 z-10 w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags"
                  className="w-full h-8 rounded border border-gray-300 bg-white px-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
              {filteredTags.length > 0 && (
                <div className="px-3 py-1">
                  {filteredTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex w-full items-center gap-2 px-1 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-gray-300 accent-[#5b7a6e] cursor-pointer"
                        onChange={(e) => onToggleTagOnSelected(tag.id, e.target.checked)}
                        disabled={!hasSelection}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setTagsOpen(false);
                  onOpenAddTag();
                }}
                className="flex w-full items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100"
              >
                <Plus size={14} className="text-gray-500" />
                Add new tag
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DisplayPopover
          settings={displaySettings}
          onSettingsChange={onDisplaySettingsChange}
        />

        <div ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className="flex h-8 items-center gap-1 rounded border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            More
            <ChevronDown size={14} className="text-gray-500" />
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-9 z-10 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {MORE_OPTIONS.map((option) => (
                <button
                  key={option}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onAddNew}
          className="h-8 rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Add new
        </button>
      </div>
    </div>
  );
}
