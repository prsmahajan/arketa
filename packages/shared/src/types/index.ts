import type {
  UserRole,
  MembershipStatus,
  ProgramVisibility,
  ProgramMemberStatus,
  BookingStatus,
  PaymentType,
  PurchaseStatus,
  PurchaseStore,
  LocationType,
} from '../constants';

// ─── Profile ─────────────────────────────────────────────────
export interface Profile {
  id: string; // matches auth.users.id
  name: string;
  avatar_url: string | null;
  role: UserRole;
  rc_app_user_id: string | null; // RevenueCat app user ID
  created_at: string;
  updated_at: string;
}

// ─── Community ───────────────────────────────────────────────
export interface Community {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  membership_entitlement_id: string | null; // RevenueCat entitlement for membership
  created_at: string;
  updated_at: string;
  // joined fields
  creator?: Profile;
}

// ─── Membership ──────────────────────────────────────────────
export interface Membership {
  id: string;
  user_id: string;
  community_id: string;
  status: MembershipStatus;
  rc_entitlement_id: string | null; // RevenueCat entitlement that granted this
  joined_at: string;
  created_at: string;
  // joined
  profile?: Profile;
}

// ─── Program ─────────────────────────────────────────────────
export interface Program {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  price_cents: number;
  capacity: number | null;
  visibility: ProgramVisibility;
  rc_product_id: string | null; // RevenueCat product for this program
  created_at: string;
  updated_at: string;
  // computed
  member_count?: number;
  is_enrolled?: boolean;
}

// ─── Program Member ──────────────────────────────────────────
export interface ProgramMember {
  id: string;
  user_id: string;
  program_id: string;
  status: ProgramMemberStatus;
  enrolled_at: string;
  created_at: string;
  profile?: Profile;
}

// ─── Post ────────────────────────────────────────────────────
export interface Post {
  id: string;
  author_id: string;
  community_id: string;
  program_id: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // joined
  author?: Profile;
  comment_count?: number;
  like_count?: number;
  is_liked?: boolean;
}

// ─── Comment ─────────────────────────────────────────────────
export interface Comment {
  id: string;
  author_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author?: Profile;
}

// ─── Like ────────────────────────────────────────────────────
export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// ─── Class ───────────────────────────────────────────────────
export interface Class {
  id: string;
  community_id: string;
  program_id: string | null;
  title: string;
  description: string | null;
  date_time: string;
  duration_minutes: number;
  location_type: LocationType;
  location_value: string;
  created_at: string;
  updated_at: string;
  // joined
  program?: { id: string; name: string } | null;
  booking_count?: number;
  is_booked?: boolean;
}

// ─── Booking ─────────────────────────────────────────────────
export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  status: BookingStatus;
  created_at: string;
}

// ─── Purchase (synced from RevenueCat) ───────────────────────
export interface Purchase {
  id: string;
  user_id: string;
  rc_product_id: string;
  rc_transaction_id: string | null;
  rc_entitlement_id: string | null;
  store: PurchaseStore;
  amount_cents: number | null;
  currency: string;
  type: PaymentType;
  reference_id: string | null;
  status: PurchaseStatus;
  purchased_at: string;
  expires_at: string | null;
  created_at: string;
}

// ─── Weekly Prompt ───────────────────────────────────────────
export interface WeeklyPrompt {
  id: string;
  program_id: string;
  content: string;
  week_number: number;
  created_at: string;
}

// ─── Member Note ─────────────────────────────────────────────
export interface MemberNote {
  id: string;
  creator_id: string;
  member_id: string;
  community_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ─── Engagement Streak ───────────────────────────────────────
export interface EngagementStreak {
  id: string;
  user_id: string;
  community_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardMetrics {
  active_members: number;
  program_enrollments: number;
  monthly_revenue: number;
}

export interface DashboardEngagement {
  posts_this_week: number;
  comments_this_week: number;
}

// ─── Member Profile View ─────────────────────────────────────
export interface MemberProfileView {
  profile: Profile;
  membership: Membership;
  program_enrollments: (ProgramMember & { program: Program })[];
  attendance_count: number;
  engagement_streak: EngagementStreak | null;
}
