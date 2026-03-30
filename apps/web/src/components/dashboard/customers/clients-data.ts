export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  lastInteraction: string;
  birthday: string;
  lifecycleStage: string;
  marketingOptIn: string;
  marketingPushOptIn: string;
  marketingTextOptIn: string;
  source: string;
  transactionalTextOptIn: string;
};

export type DisplayColumn = {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
};

export type DisplaySettings = {
  visibleColumns: Set<string>;
  condensed: boolean;
  itemsPerPage: number;
};

export const TAG_COLORS: { name: string; bg: string; text: string; border: string }[] = [
  { name: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-300' },
  { name: 'green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-300' },
  { name: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-300' },
  { name: 'red', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-300' },
  { name: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-300' },
  { name: 'orange', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-300' },
  { name: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-300' },
  { name: 'pink', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-300' },
];

export const DISPLAY_COLUMNS: DisplayColumn[] = [
  { key: 'name', label: 'Name', width: 'min-w-[160px]', defaultVisible: true },
  { key: 'email', label: 'Email', width: 'min-w-[200px]', defaultVisible: true },
  { key: 'phone', label: 'Phone', width: 'min-w-[160px]', defaultVisible: true },
  { key: 'tags', label: 'Tags', width: 'min-w-[120px]', defaultVisible: true },
  { key: 'lastInteraction', label: 'Last Interaction', width: 'min-w-[140px]', defaultVisible: true },
  { key: 'birthday', label: 'Birthday', width: 'min-w-[120px]', defaultVisible: false },
  { key: 'lifecycleStage', label: 'Lifecycle Stage', width: 'min-w-[140px]', defaultVisible: false },
  { key: 'marketingOptIn', label: 'Marketing Opt-in', width: 'min-w-[140px]', defaultVisible: false },
  { key: 'marketingPushOptIn', label: 'Marketing Push Notification Opt In', width: 'min-w-[200px]', defaultVisible: false },
  { key: 'marketingTextOptIn', label: 'Marketing Text Opt In', width: 'min-w-[160px]', defaultVisible: false },
  { key: 'source', label: 'Source', width: 'min-w-[120px]', defaultVisible: false },
  { key: 'transactionalTextOptIn', label: 'Transactional Text Opt In', width: 'min-w-[180px]', defaultVisible: false },
];

export const DEFAULT_VISIBLE_COLUMNS = new Set(
  DISPLAY_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key),
);

export const DEFAULT_ITEMS_PER_PAGE = 10;

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  visibleColumns: new Set(DEFAULT_VISIBLE_COLUMNS),
  condensed: false,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
};

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'yog bhu',
    email: 'alexdhiman36@gmail.com',
    phone: '+91 90411 62603',
    tags: [],
    lastInteraction: 'Feb 9, 2026',
    birthday: '--',
    lifecycleStage: '--',
    marketingOptIn: '--',
    marketingPushOptIn: '--',
    marketingTextOptIn: '--',
    source: '--',
    transactionalTextOptIn: '--',
  },
  {
    id: '2',
    name: 'Walk-in Client',
    email: 'walkin+h4RttwQhOFVTELTj7jl...',
    phone: '--',
    tags: [],
    lastInteraction: '--',
    birthday: '--',
    lifecycleStage: '--',
    marketingOptIn: '--',
    marketingPushOptIn: '--',
    marketingTextOptIn: '--',
    source: '--',
    transactionalTextOptIn: '--',
  },
];
