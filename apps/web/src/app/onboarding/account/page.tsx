'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stepper } from '../stepper';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase';

export default function AccountInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    firstName: '',
    lastName: '',
    website: '',
    phone: '',
    countryCode: 'US'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update Profile
        await supabase
          .from('profiles')
          .update({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            website: formData.website,
            phone: formData.phone
          })
          .eq('id', user.id);

        // Update Community Name
        if (formData.businessName) {
          await supabase
            .from('communities')
            .update({ name: formData.businessName })
            .eq('creator_id', user.id);
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stepper currentStep={3} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account details</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Business Name</label>
            <Input 
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <Input 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <Input 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Website</label>
            <Input 
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://"
              className="h-12"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <div className="flex gap-2">
              <div className="w-20 flex-shrink-0">
                <div className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xl">
                  🇺🇸
                </div>
              </div>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(555) 000-0000"
                className="h-12 flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8">
          <Button type="button" variant="outline" onClick={() => router.back()} className="px-8 h-12 text-sm font-medium border-gray-200 text-gray-600">
            Prev: About You
          </Button>
          <Button 
            type="submit"
            loading={loading}
            className="px-8 h-12 text-sm font-medium bg-[#374151] hover:bg-[#1f2937] text-white"
          >
            Next: Confirmation
          </Button>
        </div>
      </form>
    </>
  );
}
