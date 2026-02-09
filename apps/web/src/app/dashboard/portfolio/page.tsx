'use client';

import { Card } from '@/components/ui';
import { Camera, Image, Link as LinkIcon, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { DashboardHomeSkeleton } from '@/components/dashboard/skeletons';

export default function PortfolioPage() {
  const { profile, isLoading } = useAuthStore();

  if (isLoading) return <DashboardHomeSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-gray-100 to-gray-50"></div>
        <div className="relative z-10 -mt-4">
          <div className="w-32 h-32 rounded-full bg-white p-1 mx-auto mb-4 shadow-sm">
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-4xl overflow-hidden relative group cursor-pointer">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-gray-300">📷</span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{profile?.name || 'Creator Name'}</h1>
          <p className="text-gray-500 font-medium">Wellness Coach & Fitness Expert</p>
          
          <div className="flex justify-center gap-3 mt-6">
            <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"><Instagram size={20} /></button>
            <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"><Twitter size={20} /></button>
            <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"><Linkedin size={20} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">About Me</h3>
            <textarea 
              className="w-full h-32 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 resize-none outline-none focus:ring-1 focus:ring-black"
              placeholder="Tell your story..."
              defaultValue="I help people transform their lives through holistic wellness and mindful movement. With over 10 years of experience..."
            ></textarea>
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800">Save</button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Gallery</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border border-dashed border-gray-200">
                  <Image className="text-gray-300" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Clients</span>
                <span className="font-bold">124</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Programs</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Rating</span>
                <span className="font-bold text-[#84CC16]">4.9 ★</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Links</h3>
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2">
              <LinkIcon size={16} /> Add Link
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
