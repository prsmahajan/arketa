'use client';

import { create } from 'zustand';

export type CardSize = 'Small' | 'Medium' | 'Large';

export interface DashboardCardConfig {
  id: string;
  label: string;
  enabled: boolean;
  selectedSize?: CardSize;
  sizes?: CardSize[];
}

const DEFAULT_DASHBOARD_CARDS: DashboardCardConfig[] = [
  {
    id: 'notification-center',
    label: 'Notification Center',
    sizes: ['Small', 'Medium', 'Large'],
    selectedSize: 'Medium',
    enabled: true,
  },
  {
    id: 'upcoming-schedule',
    label: 'Upcoming Schedule',
    sizes: ['Small', 'Medium', 'Large'],
    selectedSize: 'Small',
    enabled: true,
  },
  {
    id: 'favorite-reports',
    label: 'Favorite Reports',
    enabled: true,
  },
];

interface UIState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isCustomizeDashboardOpen: boolean;
  openCustomizeDashboard: () => void;
  closeCustomizeDashboard: () => void;
  dashboardCards: DashboardCardConfig[];
  saveDashboardCards: (cards: DashboardCardConfig[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  isCustomizeDashboardOpen: false,
  openCustomizeDashboard: () => set({ isCustomizeDashboardOpen: true }),
  closeCustomizeDashboard: () => set({ isCustomizeDashboardOpen: false }),
  dashboardCards: DEFAULT_DASHBOARD_CARDS,
  saveDashboardCards: (cards) => set({ dashboardCards: cards }),
}));
