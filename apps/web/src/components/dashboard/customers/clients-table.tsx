'use client';

import { cn } from '@/lib/utils';
import type { Client, Tag, DisplaySettings } from './clients-data';
import { DISPLAY_COLUMNS } from './clients-data';
import { TagBadge } from './tag-badge';
import { RowActionsMenu } from './row-actions-menu';
import { SelectionActionBar } from './selection-action-bar';

type ClientsTableProps = {
  clients: Client[];
  tags: Tag[];
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  onAddTagToClients: (clientIds: string[], tagId: string) => void;
  onRemoveTagsFromClients: (clientIds: string[], tagIds: string[]) => void;
  onOpenAddTag: () => void;
  displaySettings: DisplaySettings;
};

function getCellValue(client: Client, key: string, tags: Tag[]) {
  if (key === 'tags') {
    const clientTags = client.tags
      .map((id) => tags.find((t) => t.id === id))
      .filter((t): t is Tag => !!t);
    if (clientTags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {clientTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>
    );
  }
  return (client as unknown as Record<string, string>)[key] || '--';
}

export function ClientsTable({
  clients,
  tags,
  selectedIds,
  onSelectedIdsChange,
  onAddTagToClients,
  onRemoveTagsFromClients,
  onOpenAddTag,
  displaySettings,
}: ClientsTableProps) {
  const { visibleColumns, condensed } = displaySettings;
  const activeColumns = DISPLAY_COLUMNS.filter((col) => visibleColumns.has(col.key));
  const allSelected = clients.length > 0 && selectedIds.size === clients.length;
  const hasSelection = selectedIds.size > 0;

  // +2 for select and actions columns
  const totalColSpan = activeColumns.length + 2;

  const toggleAll = () => {
    onSelectedIdsChange(allSelected ? new Set() : new Set(clients.map((c) => c.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedIdsChange(next);
  };

  const textSize = condensed ? 'text-xs' : 'text-sm';
  const cellPy = condensed ? 'py-1.5' : 'py-3';
  const cellPx = condensed ? 'px-2' : 'px-3';
  const headerPy = condensed ? 'py-1.5' : 'py-2.5';
  const checkboxPl = condensed ? 'pl-4' : 'pl-6';
  const checkboxPr = condensed ? 'pr-2' : 'pr-3';
  const actionsPl = condensed ? 'pl-2' : 'pl-3';
  const actionsPr = condensed ? 'pr-4' : 'pr-6';

  return (
    <>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 bg-white">
              {/* Checkbox column */}
              <th className={cn('w-12 text-left', checkboxPl, checkboxPr, headerPy)}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 accent-[#5b7a6e] cursor-pointer"
                />
              </th>

              {/* Data columns */}
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left font-semibold text-gray-700 uppercase tracking-wider border-l border-gray-200',
                    cellPx,
                    headerPy,
                    condensed ? 'text-[10px]' : 'text-xs',
                    col.width,
                  )}
                >
                  {col.label}
                </th>
              ))}

              {/* Actions column */}
              <th className={cn('w-12', actionsPl, actionsPr, headerPy)} />
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => {
              const isSelected = selectedIds.has(client.id);
              return (
                <tr
                  key={client.id}
                  className={cn(
                    'border-b border-gray-100 transition-colors hover:bg-gray-50',
                    isSelected && 'bg-gray-50',
                  )}
                >
                  {/* Checkbox */}
                  <td className={cn(checkboxPl, checkboxPr, cellPy)}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(client.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-[#5b7a6e] cursor-pointer"
                    />
                  </td>

                  {/* Data cells */}
                  {activeColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        cellPx,
                        cellPy,
                        textSize,
                        col.key === 'name' ? 'text-gray-900' : 'text-gray-500',
                      )}
                    >
                      {getCellValue(client, col.key, tags)}
                    </td>
                  ))}

                  {/* Actions */}
                  <td className={cn('text-right', actionsPl, actionsPr, cellPy)}>
                    <RowActionsMenu clientId={client.id} />
                  </td>
                </tr>
              );
            })}

            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasSelection && (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          tags={tags}
          selectedClientTagIds={Array.from(
            new Set(
              clients
                .filter((c) => selectedIds.has(c.id))
                .flatMap((c) => c.tags),
            ),
          )}
          onAddTag={(tagId) => onAddTagToClients(Array.from(selectedIds), tagId)}
          onRemoveTags={(tagIds) => onRemoveTagsFromClients(Array.from(selectedIds), tagIds)}
          onClear={() => onSelectedIdsChange(new Set())}
          onOpenAddTag={onOpenAddTag}
        />
      )}
    </>
  );
}
