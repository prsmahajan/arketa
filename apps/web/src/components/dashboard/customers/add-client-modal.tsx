'use client';

import { useState } from 'react';
import { X, ChevronUp, ChevronDown, CalendarDays } from 'lucide-react';
import Calendar from '@/components/ui/calendar';

export type AddClientForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  location: string;
  birthday: Date | null;
  gender: string;
  shippingAddress: string;
  originalMilestone: number;
};

type AddClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: AddClientForm) => void;
};

const GENDER_OPTIONS = [
  'Choose one...',
  'Female',
  'Male',
  'Non-binary/genderqueer',
  'I prefer to self-identify',
  'Prefer not to say',
] as const;

const INITIAL_FORM: AddClientForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryCode: 'US',
  location: 'Unassigned',
  birthday: null,
  gender: '',
  shippingAddress: '',
  originalMilestone: 0,
};

const INPUT_CLASS =
  'w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

const SELECT_CLASS =
  'w-full h-10 appearance-none rounded-md border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

function formatBirthday(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AddClientModal({ isOpen, onClose, onSubmit }: AddClientModalProps) {
  const [form, setForm] = useState<AddClientForm>(INITIAL_FORM);
  const [additionalOpen, setAdditionalOpen] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!isOpen) return null;

  const update = <K extends keyof AddClientForm>(key: K, value: AddClientForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
    setForm(INITIAL_FORM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-full max-w-[450px] max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Add new client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder="Enter client's first name..."
              className={INPUT_CLASS}
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="Enter client's last name..."
              className={INPUT_CLASS}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="Enter client's email address..."
              className={INPUT_CLASS}
            />
          </div>

          {/* Phone Number */}
          <div className="mb-1">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phone Number</label>
            <div className="flex">
              <button className="flex h-10 items-center gap-1 rounded-l-md border border-r-0 border-gray-300 bg-white px-2 text-sm text-gray-700">
                <span className="text-base">🇺🇸</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="Enter client's phone number..."
                className="flex-1 h-10 rounded-r-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Optional</p>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Location</label>
            <div className="relative">
              <select
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="Unassigned">Unassigned</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setAdditionalOpen((prev) => !prev)}
              className="flex w-full items-center justify-between mb-4"
            >
              <span className="text-sm font-bold text-gray-900">Additional Information</span>
              {additionalOpen ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </button>

            {additionalOpen && (
              <div>
                {/* Birthday */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Birthday
                  </label>
                  <button
                    onClick={() => setCalendarOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <CalendarDays size={16} className="text-gray-400" />
                    {form.birthday ? formatBirthday(form.birthday) : 'Select date'}
                  </button>
                  {form.birthday && (
                    <button
                      onClick={() => update('birthday', null)}
                      className="block text-xs text-gray-500 mt-1 hover:text-gray-700"
                    >
                      Remove birthday
                    </button>
                  )}
                  {calendarOpen && (
                    <div className="absolute left-0 top-[68px] z-10">
                      <Calendar
                        selected={form.birthday || new Date()}
                        onSelect={(date) => {
                          update('birthday', date);
                          setCalendarOpen(false);
                        }}
                        onClose={() => setCalendarOpen(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="mb-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Gender</label>
                  <div className="relative">
                    <select
                      value={form.gender || 'Choose one...'}
                      onChange={(e) =>
                        update('gender', e.target.value === 'Choose one...' ? '' : e.target.value)
                      }
                      className={SELECT_CLASS}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Optional</p>
                </div>

                {/* Shipping Address */}
                <div className="mb-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    value={form.shippingAddress}
                    onChange={(e) => update('shippingAddress', e.target.value)}
                    placeholder="Search for a place..."
                    className={INPUT_CLASS}
                  />
                  <p className="text-xs text-gray-400 mt-1">Optional</p>
                </div>

                {/* Original Milestone */}
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Original Milestone
                  </label>
                  <input
                    type="number"
                    value={form.originalMilestone}
                    onChange={(e) => update('originalMilestone', Number(e.target.value))}
                    min={0}
                    className={INPUT_CLASS}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    The number of classes taken before joining Arketa — contributes to the client&apos;s
                    milestone
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            className="w-full h-11 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Add new client
          </button>
        </div>
      </div>
    </div>
  );
}
