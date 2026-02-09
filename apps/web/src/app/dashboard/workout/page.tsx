'use client';

import { Card } from '@/components/ui';
import { Plus, Flame, Clock, ChevronRight, PlayCircle } from 'lucide-react';

const mockWorkouts = [
  { title: 'Full Body HIIT', duration: '30 min', cal: '320 kcal', level: 'Intense', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60' },
  { title: 'Morning Yoga Flow', duration: '20 min', cal: '150 kcal', level: 'Beginner', image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&auto=format&fit=crop&q=60' },
  { title: 'Core Strength', duration: '15 min', cal: '180 kcal', level: 'Medium', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60' },
  { title: 'Upper Body Power', duration: '45 min', cal: '410 kcal', level: 'Advanced', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60' },
];

export default function WorkoutPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage video content & plans</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#D2F05D] text-black rounded-xl text-sm font-bold hover:bg-[#c2e04d] transition-colors">
          <Plus size={18} /> Add Workout
        </button>
      </div>

      {/* Featured Card */}
      <div className="relative rounded-3xl overflow-hidden h-80 group cursor-pointer">
        <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=1200&auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white w-full">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">New Series</span>
          <h2 className="text-3xl font-black mb-2">30-Day Summer Shred</h2>
          <p className="text-gray-200 mb-6 max-w-lg">A comprehensive 4-week program designed to build lean muscle and boost endurance.</p>
          <button className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <PlayCircle size={20} /> View Program
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockWorkouts.map((w, i) => (
          <div key={i} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
              <img src={w.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={w.title} />
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                {w.duration}
              </div>
            </div>
            <div className="px-2 pb-2">
              <h3 className="font-bold text-gray-900 mb-1">{w.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {w.cal}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{w.level}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
