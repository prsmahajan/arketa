'use client';

import { useState, useMemo } from 'react';
import { ClientsToolbar } from '@/components/dashboard/customers/clients-toolbar';
import { ClientsTable } from '@/components/dashboard/customers/clients-table';
import { ClientsPagination } from '@/components/dashboard/customers/clients-pagination';
import { AddClientModal } from '@/components/dashboard/customers/add-client-modal';
import type { AddClientForm } from '@/components/dashboard/customers/add-client-modal';
import { AddTagModal } from '@/components/dashboard/customers/add-tag-modal';
import { SAMPLE_CLIENTS, DEFAULT_DISPLAY_SETTINGS } from '@/components/dashboard/customers/clients-data';
import type { Client, Tag, DisplaySettings } from '@/components/dashboard/customers/clients-data';

export default function ClientsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(SAMPLE_CLIENTS);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);

  const pageSize = displaySettings.itemsPerPage;

  // Paginated clients
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return clients.slice(start, start + pageSize);
  }, [clients, currentPage, pageSize]);

  // Reset to page 1 when items per page changes
  const handleDisplaySettingsChange = (next: DisplaySettings) => {
    if (next.itemsPerPage !== displaySettings.itemsPerPage) {
      setCurrentPage(1);
    }
    setDisplaySettings(next);
  };

  const handleAddClient = (form: AddClientForm) => {
    const newClient: Client = {
      id: String(Date.now()),
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email || '--',
      phone: form.phone || '--',
      tags: [],
      lastInteraction: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      birthday: form.birthday
        ? form.birthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '--',
      lifecycleStage: '--',
      marketingOptIn: '--',
      marketingPushOptIn: '--',
      marketingTextOptIn: '--',
      source: '--',
      transactionalTextOptIn: '--',
    };
    setClients((prev) => [...prev, newClient]);
    setAddModalOpen(false);
  };

  const handleAddTag = (tag: Tag) => {
    setTags((prev) => [...prev, tag]);
    if (selectedIds.size > 0) {
      setClients((prev) =>
        prev.map((c) =>
          selectedIds.has(c.id) ? { ...c, tags: [...c.tags, tag.id] } : c,
        ),
      );
    }
  };

  const handleAddTagToClients = (clientIds: string[], tagId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        clientIds.includes(c.id) && !c.tags.includes(tagId)
          ? { ...c, tags: [...c.tags, tagId] }
          : c,
      ),
    );
  };

  const handleRemoveTagsFromClients = (clientIds: string[], tagIds: string[]) => {
    setClients((prev) =>
      prev.map((c) =>
        clientIds.includes(c.id)
          ? { ...c, tags: c.tags.filter((t) => !tagIds.includes(t)) }
          : c,
      ),
    );
  };

  const handleToggleTagOnSelected = (tagId: string, checked: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (checked) {
      handleAddTagToClients(ids, tagId);
    } else {
      handleRemoveTagsFromClients(ids, [tagId]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col">
      <div className="pt-2 pb-3 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 px-6">
          Clients
        </h1>
        <ClientsToolbar
          onAddNew={() => setAddModalOpen(true)}
          tags={tags}
          onOpenAddTag={() => setAddTagModalOpen(true)}
          onToggleTagOnSelected={handleToggleTagOnSelected}
          hasSelection={selectedIds.size > 0}
          displaySettings={displaySettings}
          onDisplaySettingsChange={handleDisplaySettingsChange}
        />
      </div>

      <ClientsTable
        clients={paginatedClients}
        tags={tags}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onAddTagToClients={handleAddTagToClients}
        onRemoveTagsFromClients={handleRemoveTagsFromClients}
        onOpenAddTag={() => setAddTagModalOpen(true)}
        displaySettings={displaySettings}
      />

      <ClientsPagination
        totalClients={clients.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      <AddClientModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddClient}
      />

      <AddTagModal
        isOpen={addTagModalOpen}
        onClose={() => setAddTagModalOpen(false)}
        onSubmit={handleAddTag}
      />
    </div>
  );
}
