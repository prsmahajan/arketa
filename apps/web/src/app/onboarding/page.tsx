'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stepper } from './stepper';
import { Users, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'studio' | 'instructor' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ creator_type: selectedType })
          .eq('id', user.id);
      }
      
      router.push('/onboarding/account');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stepper currentStep={2} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h1>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => setSelectedType('studio')}
          className={cn(
            "w-full flex items-center justify-between p-6 rounded-xl border transition-all text-left group bg-white",
            selectedType === 'studio' 
              ? "border-gray-900 ring-1 ring-gray-900" 
              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <Users size={24} />
            </div>
            <span className="font-medium text-gray-600 group-hover:text-gray-900">I'm a Studio</span>
          </div>
          <ArrowRight size={20} className={cn("text-gray-300 transition-colors", selectedType === 'studio' ? "text-gray-900" : "group-hover:text-gray-500")} />
        </button>

        <button
          onClick={() => setSelectedType('instructor')}
          className={cn(
            "w-full flex items-center justify-between p-6 rounded-xl border transition-all text-left group bg-white",
            selectedType === 'instructor' 
              ? "border-gray-900 ring-1 ring-gray-900" 
              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <User size={24} />
            </div>
            <span className="font-medium text-gray-600 group-hover:text-gray-900">I'm an Instructor</span>
          </div>
          <ArrowRight size={20} className={cn("text-gray-300 transition-colors", selectedType === 'instructor' ? "text-gray-900" : "group-hover:text-gray-500")} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-8">
        <Button variant="outline" onClick={() => router.back()} className="px-8 h-12 text-sm font-medium border-gray-200 text-gray-600">
          Prev: Email
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedType || loading}
          loading={loading}
          className="px-8 h-12 text-sm font-medium bg-[#6B7280] hover:bg-[#4B5563] text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          Next: Account Info
        </Button>
      </div>
    </>
  );
}
