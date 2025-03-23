import { create } from 'zustand';

type SupabaseAuthStore = {
  supabaseUserId: string | null;
  setSupabaseUserId: (userId: string | null) => void;
};

export const useSupabaseAuthStore = create<SupabaseAuthStore>((set) => ({
  supabaseUserId: null,
  setSupabaseUserId: (userId) => set({ supabaseUserId: userId }),
}));