// store.ts
import { create } from "zustand";

interface AuthStore {
    token: string | null;
    userId: string;
    userName: string; // Add userName property
    setToken: (token: string | null) => void;
    setUserId: (userId: string) => void;
    setUserName: (userName: string) => void; // Add setUserName method
  }

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  userId: "",
  userName: "", // Add userName property
  setToken: (token) => set({ token }),
  setUserId: (userId) => set({ userId }),
  setUserName: (userName) => set({ userName }), // Add setUserName method
}));