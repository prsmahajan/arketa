import { cn } from '@/lib/utils';
import { TAG_COLORS } from './clients-data';
import type { Tag } from './clients-data';

export function getTagStyle(colorName: string) {
  return TAG_COLORS.find((c) => c.name === colorName) || TAG_COLORS[0];
}

export function TagBadge({ tag }: { tag: Tag }) {
  const style = getTagStyle(tag.color);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        style.border,
      )}
    >
      {tag.name}
    </span>
  );
}
