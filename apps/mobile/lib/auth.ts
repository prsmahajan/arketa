import { create } from 'zustand';
import type { Profile } from '@aghor/shared';

interface AuthState {
  profile: Profile | null;
  communityId: string | null;
  isLoading: boolean;
  setProfile: (p: Profile | null) => void;
  setCommunityId: (id: string | null) => void;
  setLoading: (l: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  communityId: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setCommunityId: (communityId) => set({ communityId }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ profile: null, communityId: null }),
}));
