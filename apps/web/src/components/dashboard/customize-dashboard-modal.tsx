'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, PieChart, GripVertical, X } from 'lucide-react';
import { useUIStore, type DashboardCardConfig, type CardSize } from '@/lib/ui-store';
import { cn } from '@/lib/utils';

const CARD_ICONS: Record<string, React.ElementType> = {
  'notification-center': Bell,
  'upcoming-schedule': Calendar,
  'favorite-reports': PieChart,
};

export function CustomizeDashboardModal() {
  const { isCustomizeDashboardOpen, closeCustomizeDashboard, dashboardCards, saveDashboardCards } =
    useUIStore();
  const [cards, setCards] = useState<DashboardCardConfig[]>(dashboardCards);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (isCustomizeDashboardOpen) {
      setCards(dashboardCards);
    }
  }, [isCustomizeDashboardOpen, dashboardCards]);

  if (!isCustomizeDashboardOpen) return null;

  const enabledCards = cards.filter((c) => c.enabled);
  const availableCards = [...cards.filter((c) => !c.enabled)].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag ghost semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedId || draggedId === targetId) return;

    setCards((prev) => {
      const updated = [...prev];
      const dragIdx = updated.findIndex((c) => c.id === draggedId);
      const targetIdx = updated.findIndex((c) => c.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      const [dragged] = updated.splice(dragIdx, 1);
      updated.splice(targetIdx, 0, dragged);
      return updated;
    });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const setSize = (id: string, size: CardSize) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, selectedSize: size } : c)));
  };

  const toggleEnabled = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  const handleSave = () => {
    saveDashboardCards(cards);
    closeCustomizeDashboard();
  };

  const handleCancel = () => {
    setCards(dashboardCards);
    closeCustomizeDashboard();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={handleCancel} />

      <div className="relative flex w-full max-w-[660px] flex-col rounded-xl border border-gray-100 bg-white shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Customize Dashboard</h2>
          <button
            onClick={handleCancel}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 overflow-y-auto px-6 py-5">
          {/* Enabled Cards */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Enabled Cards</p>
              <p className="mt-1 text-sm text-gray-500">
                Drag cards to reorder them. Disabled cards will be hidden from your dashboard.
              </p>
            </div>

            {enabledCards.length > 0 && (
              <div className="space-y-2">
                {enabledCards.map((card) => {
                  const Icon = CARD_ICONS[card.id];
                  const isDragging = draggedId === card.id;
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragOver={(e) => handleDragOver(e, card.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 cursor-grab active:cursor-grabbing transition-all',
                        isDragging && 'opacity-40 scale-[0.98]',
                      )}
                    >
                      <GripVertical size={15} className="flex-shrink-0 text-gray-300 pointer-events-none" />
                      <Icon size={15} className="flex-shrink-0 text-gray-500 pointer-events-none" />
                      <span className="flex-1 text-sm text-gray-800 pointer-events-none">{card.label}</span>
                      <div className="flex items-center gap-1">
                        {card.sizes?.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSize(card.id, size)}
                            className={cn(
                              'rounded border px-2.5 py-[5px] text-xs font-medium leading-none transition-colors',
                              card.selectedSize === size
                                ? 'border-gray-700 bg-gray-700 text-white'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                            )}
                          >
                            {size}
                          </button>
                        ))}
                        <button
                          onClick={() => toggleEnabled(card.id)}
                          className="rounded border border-gray-200 bg-white px-2.5 py-[5px] text-xs font-medium leading-none text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Cards */}
          {availableCards.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Available Cards</p>
                <p className="mt-1 text-sm text-gray-500">
                  Enable cards to add them to your dashboard.
                </p>
              </div>

              <div className="space-y-2">
                {availableCards.map((card) => {
                  const Icon = CARD_ICONS[card.id];
                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3"
                    >
                      <Icon size={15} className="flex-shrink-0 text-gray-400" />
                      <span className="flex-1 text-sm text-gray-500">{card.label}</span>
                      <button
                        onClick={() => toggleEnabled(card.id)}
                        className="rounded border border-gray-600 bg-gray-600 px-2.5 py-[5px] text-xs font-medium leading-none text-white transition-colors hover:bg-gray-700"
                      >
                        Enable
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleCancel}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
