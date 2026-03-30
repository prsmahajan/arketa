import {
  FileText,
  Users,
  CalendarDays,
  MessageSquare,
  Link2,
  CreditCard,
  Globe,
  ClipboardList,
  UserCog,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type SettingsLink = {
  label: string;
  href: string;
};

export type SettingsCategory = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  links: SettingsLink[];
};

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'business-settings',
    title: 'Business Settings',
    description: 'Edit your business information and settings',
    icon: FileText,
    links: [
      { label: 'General Business Settings', href: '/dashboard/settings/business/general' },
      { label: 'Public Facing Settings', href: '/dashboard/settings/business/public' },
      { label: 'Locations', href: '/dashboard/settings/business/locations' },
      { label: 'Sub Management', href: '/dashboard/settings/business/sub-management' },
      { label: 'Taxes', href: '/dashboard/settings/business/taxes' },
      { label: 'Language Customization', href: '/dashboard/settings/business/language' },
      { label: 'Revenue Categories', href: '/dashboard/settings/business/revenue-categories' },
      { label: 'FAQs', href: '/dashboard/settings/business/faqs' },
    ],
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Manage how your client information is stored',
    icon: Users,
    links: [
      { label: 'General Client Settings', href: '/dashboard/settings/clients/general' },
      { label: 'Required Sign-Up Fields', href: '/dashboard/settings/clients/signup-fields' },
      { label: 'Custom Fields', href: '/dashboard/settings/clients/custom-fields' },
      { label: 'Forms', href: '/dashboard/settings/clients/forms' },
      { label: 'Family Sharing', href: '/dashboard/settings/clients/family-sharing' },
      { label: 'Tags', href: '/dashboard/settings/clients/tags' },
    ],
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    description: 'Customize scheduling information',
    icon: CalendarDays,
    links: [
      { label: 'General Schedule Settings', href: '/dashboard/settings/scheduling/general' },
      { label: 'Booking Windows', href: '/dashboard/settings/scheduling/booking-windows' },
      { label: 'Waitlist', href: '/dashboard/settings/scheduling/waitlist' },
      { label: 'No Show/Late Cancel Fees', href: '/dashboard/settings/scheduling/cancel-fees' },
      { label: 'Guest List Booking', href: '/dashboard/settings/scheduling/guest-list' },
    ],
  },
  {
    id: 'communications',
    title: 'Communications',
    description: 'Manage client communications',
    icon: MessageSquare,
    links: [
      { label: 'Text Reminders', href: '/dashboard/settings/communications/text-reminders' },
      {
        label: 'Transactional Emails',
        href: '/dashboard/settings/communications/transactional-emails',
      },
      {
        label: 'Sent Transactional Messages',
        href: '/dashboard/settings/communications/sent-messages',
      },
      {
        label: 'Confirmation Emails',
        href: '/dashboard/settings/communications/confirmation-emails',
      },
      {
        label: 'Email Suppression List',
        href: '/dashboard/settings/communications/suppression-list',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: "Arketa's connections to the outside world",
    icon: Link2,
    links: [
      { label: 'Payments', href: '/dashboard/settings/integrations/payments' },
      { label: 'Integrations', href: '/dashboard/settings/integrations/all' },
    ],
  },
  {
    id: 'my-plan',
    title: 'My Plan',
    description: 'What you are paying for',
    icon: CreditCard,
    links: [{ label: 'Billing', href: '/dashboard/settings/plan/billing' }],
  },
  {
    id: 'member-perks',
    title: 'Member Perks',
    description:
      'Offer special privileges to incentivize customers to become long-term loyal customers',
    icon: Globe,
    links: [
      { label: 'Early Booking Privileges', href: '/dashboard/settings/perks/early-booking' },
      { label: 'Discounts', href: '/dashboard/settings/perks/discounts' },
    ],
  },
  {
    id: 'front-desk-reporting',
    title: 'Front Desk Reporting',
    description: 'Reports that help you understand your daily operations',
    icon: ClipboardList,
    links: [
      { label: 'Gift Cards', href: '/dashboard/settings/reporting/gift-cards' },
      {
        label: 'Legacy Reports (No longer maintained)',
        href: '/dashboard/settings/reporting/legacy',
      },
    ],
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'Manage staff compensation and commission settings',
    icon: UserCog,
    links: [{ label: 'Commissions', href: '/dashboard/settings/staff/commissions' }],
  },
];
