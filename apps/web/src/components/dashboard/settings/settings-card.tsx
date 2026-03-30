import Link from 'next/link';
import type { SettingsCategory } from './settings-data';

export function SettingsCard({ category }: { category: SettingsCategory }) {
  const Icon = category.icon;
  return (
    <div className="bg-white rounded-lg border border-[#ccc] p-6 flex flex-col">
      <div className="flex items-center gap-2.5 mb-1">
        <Icon size={20} className="text-gray-500 flex-shrink-0" />
        <h3 className="text-base font-bold text-gray-900">{category.title}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{category.description}</p>

      <div className="space-y-2">
        {category.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
