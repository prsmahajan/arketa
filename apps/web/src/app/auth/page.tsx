'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button, Input } from '@/components/ui';
import type { UserRole } from '@aghor/shared';
import { Info } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Default to creator based on the B2B context of the design
  const [role] = useState<UserRole>('creator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        // Extract name from email as a fallback since name field is removed
        const name = email.split('@')[0];
        result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } },
        });
      }

      const { error } = result;

      if (error) throw error;
      
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : (isLogin ? 'Login failed' : 'Registration failed');
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Get started with Aghor'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                Password
                <Info size={14} className="text-gray-400" />
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••••••" 
                  minLength={8} 
                  required 
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-10"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 hover:text-gray-900 mt-1.5 font-medium"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>

            <div className="pt-2">
              {!isLogin && (
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  By signing up you agree to aghor&apos;s <Link href="/terms" className="text-gray-900 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-gray-900 hover:underline">Privacy Policy</Link>
                </p>
              )}

              <Button 
                type="submit" 
                loading={loading} 
                className="w-full h-12 text-base font-medium rounded-lg"
              >
                {isLogin ? 'Log in' : 'Sign up'}
              </Button>
            </div>
          </form>

          <p className="text-sm text-gray-500 mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-gray-900 font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Column - Branding */}
      <div className="hidden lg:flex w-1/2 bg-white flex-col justify-center px-12 xl:px-24 relative overflow-hidden">
        <div className="w-full max-w-[480px]">
          <div className="flex items-center gap-2 mb-8">
            {/* Aghor Logo Mark */}
            <div className="flex gap-[3px]">
              <div className="w-[10px] h-6 border-2 border-black rounded-l-full border-r-0"></div>
              <div className="w-[10px] h-6 bg-black rounded-r-full"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight">aghor</span>
          </div>
          
          <h2 className="text-[42px] leading-[1.1] font-bold text-gray-900 mb-6 tracking-tight">
            Grow beyond classes
          </h2>
          
          <p className="text-lg text-gray-500 leading-relaxed mb-12 font-light">
            Running your modern wellness studio just got easier. With aghor, sell everything from in-person classes to online programs — all from your own website.
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=b6e3f4`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-500">
              Over 10k Happy Customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
