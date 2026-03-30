'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  Plus,
  Trash2,
  X,
  HelpCircle,
  RefreshCw,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllTimezones } from '@/lib/timezone';
import {
  type TimeSlot,
  TIME_OPTIONS,
  timeSlotId,
  hasAnyOverlap,
  findOverlappingPair,
  formatDateShort,
  formatDateLong,
} from '@/lib/date-utils';
import Calendar from '@/components/ui/calendar';

// ─── Types ───────────────────────────────────────────────────────────────────

type DaySchedule = Record<string, TimeSlot[]>;

interface OverrideEntry {
  id: string;
  startDate: Date;
  endDate: Date | null;
  mode: 'unavailable' | 'available';
  timeSlots: TimeSlot[];
}

// ─── TimeSelect ──────────────────────────────────────────────────────────────

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
        <ChevronDown size={12} />
      </div>
    </div>
  );
}

// ─── TimeSlotRow ─────────────────────────────────────────────────────────────

function TimeSlotRow({
  slot,
  onUpdate,
  onDelete,
}: {
  slot: TimeSlot;
  onUpdate: (updated: TimeSlot) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <TimeSelect value={slot.start} onChange={(v) => onUpdate({ ...slot, start: v })} />
      <span className="text-sm text-gray-400">&mdash;</span>
      <TimeSelect value={slot.end} onChange={(v) => onUpdate({ ...slot, end: v })} />
      <button
        onClick={onDelete}
        className="ml-auto rounded p-1 text-gray-300 transition-colors hover:text-gray-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ─── DayRow ──────────────────────────────────────────────────────────────────

function DayRow({
  day,
  slots,
  onSlotsChange,
}: {
  day: string;
  slots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
}) {
  const overlap = hasAnyOverlap(slots);
  const overlapPair = findOverlappingPair(slots);

  const addSlot = () => {
    onSlotsChange([...slots, { id: timeSlotId(), start: '9:00am', end: '5:00pm' }]);
  };

  const updateSlot = (idx: number, updated: TimeSlot) => {
    const next = [...slots];
    next[idx] = updated;
    onSlotsChange(next);
  };

  const deleteSlot = (idx: number) => {
    onSlotsChange(slots.filter((_, i) => i !== idx));
  };

  const combineTimeframe = () => {
    if (!overlapPair) return;
    onSlotsChange(slots.filter((_, i) => i !== overlapPair[0]));
  };

  return (
    <div className="py-4">
      <div className="flex items-start gap-8">
        <span className="w-10 pt-2 text-sm font-bold text-gray-900">{day}</span>
        <div className="flex-1 space-y-3">
          {slots.length === 0 && (
            <span className="inline-block pt-2 text-sm text-rose-300">Unavailable</span>
          )}
          {slots.map((slot, i) => (
            <TimeSlotRow
              key={slot.id}
              slot={slot}
              onUpdate={(u) => updateSlot(i, u)}
              onDelete={() => deleteSlot(i)}
            />
          ))}
          {overlap && (
            <>
              <p className="text-sm text-red-500">Times overlap with another set of times.</p>
              <button
                onClick={combineTimeframe}
                className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                <RefreshCw size={13} />
                Combine Timeframe
              </button>
            </>
          )}
          <button
            onClick={addSlot}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            <Plus size={14} />
            Add timeframe
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OverrideModal ───────────────────────────────────────────────────────────

function OverrideModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (entry: OverrideEntry) => void;
}) {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [mode, setMode] = useState<'unavailable' | 'available'>('unavailable');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const addSlot = () => {
    setTimeSlots([...timeSlots, { id: timeSlotId(), start: '9:00am', end: '5:00pm' }]);
  };

  const updateSlot = (idx: number, updated: TimeSlot) => {
    const next = [...timeSlots];
    next[idx] = updated;
    setTimeSlots(next);
  };

  const deleteSlot = (idx: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    onAdd({
      id: timeSlotId(),
      startDate,
      endDate,
      mode,
      timeSlots: mode === 'available' ? timeSlots : [],
    });
    onClose();
  };

  const overlap = hasAnyOverlap(timeSlots);
  const overlapPair = findOverlappingPair(timeSlots);

  const combineTimeframe = () => {
    if (!overlapPair) return;
    setTimeSlots(timeSlots.filter((_, i) => i !== overlapPair[0]));
  };

  const dateLabel = endDate
    ? `${formatDateLong(startDate)} - ${formatDateLong(endDate)}`
    : formatDateLong(startDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
      <div className="w-full max-w-[480px] rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900">Assign Specific Hours</h3>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500">
            Select a date to assign specific hours for an override:
          </p>

          {/* Date pickers */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowStartCal(!showStartCal);
                  setShowEndCal(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <CalendarIcon size={14} className="text-gray-400" />
                {formatDateShort(startDate)}
              </button>
              {showStartCal && (
                <div className="absolute left-0 top-full z-50 mt-1">
                  <Calendar
                    selected={startDate}
                    onSelect={setStartDate}
                    onClose={() => setShowStartCal(false)}
                  />
                </div>
              )}
            </div>

            <span className="text-sm text-gray-400">to</span>

            <div className="relative">
              <button
                onClick={() => {
                  setShowEndCal(!showEndCal);
                  setShowStartCal(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400"
              >
                <CalendarIcon size={14} className="text-gray-300" />
                {endDate ? formatDateShort(endDate) : 'Select date'}
              </button>
              {showEndCal && (
                <div className="absolute left-0 top-full z-50 mt-1">
                  <Calendar
                    selected={endDate || today}
                    onSelect={setEndDate}
                    onClose={() => setShowEndCal(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Selected date display */}
          <div className="mt-5 rounded-lg border border-gray-100 p-4">
            <p className="text-center text-sm font-semibold text-gray-900">{dateLabel}</p>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="overrideMode"
                  checked={mode === 'unavailable'}
                  onChange={() => {
                    setMode('unavailable');
                    setTimeSlots([]);
                  }}
                  className="h-4 w-4 border-gray-300 text-gray-900 accent-gray-800"
                />
                <span className="text-sm text-gray-700">Unavailable all day</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="overrideMode"
                  checked={mode === 'available'}
                  onChange={() => setMode('available')}
                  className="h-4 w-4 border-gray-300 text-gray-900 accent-gray-800"
                />
                <span className="text-sm text-gray-700">Only available between:</span>
              </label>

              {mode === 'available' && (
                <div className="space-y-3 pl-6">
                  {timeSlots.map((slot, i) => (
                    <TimeSlotRow
                      key={slot.id}
                      slot={slot}
                      onUpdate={(u) => updateSlot(i, u)}
                      onDelete={() => deleteSlot(i)}
                    />
                  ))}
                  {overlap && (
                    <>
                      <p className="text-sm text-red-500">
                        Times overlap with another set of times.
                      </p>
                      <button
                        onClick={combineTimeframe}
                        className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
                      >
                        <RefreshCw size={13} />
                        Combine Timeframe
                      </button>
                    </>
                  )}
                  <button
                    onClick={addSlot}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                  >
                    <Plus size={14} />
                    Add timeframe
                  </button>
                </div>
              )}

              {mode === 'unavailable' && (
                <div className="pl-6">
                  <button
                    disabled
                    className="flex cursor-not-allowed items-center gap-1 text-sm font-medium text-gray-300"
                  >
                    <Plus size={14} />
                    Add timeframe
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleAdd}
            className="w-full rounded-lg bg-gray-800 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900"
          >
            Add Override
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function OverridesTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <HelpCircle size={18} className="text-gray-400" />
      {show && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800" />
          Override your regular weekly availability for specific dates. Useful for holidays,
          vacations, or one-off schedule changes.
        </div>
      )}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'service'>('general');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrides, setOverrides] = useState<OverrideEntry[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule>(() => {
    const init: DaySchedule = {};
    DAYS.forEach((d) => (init[d] = []));
    return init;
  });

  const timezones = useMemo(() => getAllTimezones(), []);

  const updateDaySlots = useCallback((day: string, slots: TimeSlot[]) => {
    setSchedule((prev) => ({ ...prev, [day]: slots }));
  }, []);

  const handleAddOverride = (entry: OverrideEntry) => {
    setOverrides((prev) => [...prev, entry]);
  };

  const handleDeleteOverride = (id: string) => {
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <>
      {showOverrideModal && (
        <OverrideModal
          onClose={() => setShowOverrideModal(false)}
          onAdd={handleAddOverride}
        />
      )}

      <div className="flex gap-6 p-6">
        {/* Main Content */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">Settings for General Availability</h2>
          <p className="mt-1 text-sm text-gray-500">
            Changes made here will affect availability for all appointments.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Availability Timezone</label>
              <div className="relative mt-1">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Services</label>
              <div className="relative mt-1">
                <select className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-400 focus:border-gray-400 focus:outline-none">
                  <option>Select...</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-base font-bold text-gray-900">Weekly Hours</h3>

          <div className="mt-3 flex items-center gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                'border-b-2 pb-2.5 text-sm font-medium transition-colors',
                activeTab === 'general'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={cn(
                'border-b-2 pb-2.5 text-sm font-medium transition-colors',
                activeTab === 'service'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              Add Availability by Service
            </button>
          </div>

          {activeTab === 'general' && (
            <div className="divide-y divide-gray-100">
              {DAYS.map((day) => (
                <DayRow
                  key={day}
                  day={day}
                  slots={schedule[day]}
                  onSlotsChange={(slots) => updateDaySlots(day, slots)}
                />
              ))}
            </div>
          )}

          {activeTab === 'service' && (
            <div className="py-6">
              <label className="text-sm font-medium text-gray-700">Select a Service</label>
              <div className="relative mt-1">
                <select className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  <option>Select a Service</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          )}

          <button className="mt-4 rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">
            Save Changes
          </button>
        </div>

        {/* Sidebar: Overrides */}
        <div className="w-[320px] flex-shrink-0">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-gray-900">Overrides</h3>
              <OverridesTooltip />
            </div>

            {overrides.length > 0 && (
              <div className="mt-4 space-y-3">
                {overrides.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateLong(o.startDate)}
                        {o.endDate && ` - ${formatDateLong(o.endDate)}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {o.mode === 'unavailable'
                          ? 'Unavailable all day'
                          : `${o.timeSlots.length} timeframe${o.timeSlots.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOverride(o.id)}
                      className="text-gray-300 transition-colors hover:text-gray-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowOverrideModal(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Add A Date Override
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
