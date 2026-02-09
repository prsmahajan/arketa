// ─── User Roles ──────────────────────────────────────────────
export const UserRole = {
  CREATOR: 'creator',
  MEMBER: 'member',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ─── Membership ──────────────────────────────────────────────
export const MembershipStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

// ─── Program ─────────────────────────────────────────────────
export const ProgramVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;
export type ProgramVisibility = (typeof ProgramVisibility)[keyof typeof ProgramVisibility];

export const ProgramMemberStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type ProgramMemberStatus =
  (typeof ProgramMemberStatus)[keyof typeof ProgramMemberStatus];

// ─── Classes ─────────────────────────────────────────────────
export const LocationType = {
  ZOOM: 'zoom',
  PHYSICAL: 'physical',
} as const;
export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const BookingStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// ─── Payments / Purchases ───────────────────────────────────
export const PaymentType = {
  MEMBERSHIP: 'membership',
  PROGRAM: 'program',
  CLASS: 'class',
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const PurchaseStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;
export type PurchaseStatus = (typeof PurchaseStatus)[keyof typeof PurchaseStatus];

export const PurchaseStore = {
  APP_STORE: 'app_store',
  PLAY_STORE: 'play_store',
  WEB: 'web',
  PROMOTIONAL: 'promotional',
} as const;
export type PurchaseStore = (typeof PurchaseStore)[keyof typeof PurchaseStore];

// ─── Pagination ──────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Supabase Table Names ────────────────────────────────────
export const Tables = {
  PROFILES: 'profiles',
  COMMUNITIES: 'communities',
  MEMBERSHIPS: 'memberships',
  PROGRAMS: 'programs',
  PROGRAM_MEMBERS: 'program_members',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  CLASSES: 'classes',
  BOOKINGS: 'bookings',
  PURCHASES: 'purchases',
  WEEKLY_PROMPTS: 'weekly_prompts',
  MEMBER_NOTES: 'member_notes',
  ENGAGEMENT_STREAKS: 'engagement_streaks',
} as const;
