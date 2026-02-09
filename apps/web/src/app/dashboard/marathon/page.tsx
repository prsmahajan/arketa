'use client';

import { Trophy, Medal, Timer, TrendingUp } from 'lucide-react';

export default function MarathonPage() {
  return (
    <div className="space-y-8">
      <div className="bg-[#D2F05D] rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Active Challenge</span>
          <h1 className="text-4xl font-black text-black mb-4 leading-tight">Spring Wellness Marathon</h1>
          <p className="text-black/80 font-medium mb-8">Join 450+ members in this 30-day consistency challenge. Track your habits, workouts, and meals.</p>
          <div className="flex gap-4">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">Join Now</button>
            <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">Leaderboard</button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <Trophy size={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <Medal size={24} />
          </div>
          <h3 className="font-bold text-xl mb-1">Rank #42</h3>
          <p className="text-sm text-gray-500">Top 10% of participants</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Timer size={24} />
          </div>
          <h3 className="font-bold text-xl mb-1">12 Days Left</h3>
          <p className="text-sm text-gray-500">Keep pushing!</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-bold text-xl mb-1">85% Score</h3>
          <p className="text-sm text-gray-500">Consistency rating</p>
        </div>
      </div>
    </div>
  );
}
