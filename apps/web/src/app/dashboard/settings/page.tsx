'use client';

import { SettingsSidebar } from '@/components/dashboard/settings/settings-sidebar';
import { SettingsCard } from '@/components/dashboard/settings/settings-card';
import { SETTINGS_CATEGORIES } from '@/components/dashboard/settings/settings-data';

export default function SettingsPage() {
  return (
    <>
      <SettingsSidebar />
      <div className="py-3 pr-3 pl-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SETTINGS_CATEGORIES.map((category) => (
            <SettingsCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </>
  );
}
