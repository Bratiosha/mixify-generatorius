// store.ts
import { create } from 'zustand';

type AuthStore = {
  token: string | null;
  userId: string;
  userName: string;
  setToken: (token: string | null) => void;
  setUserId: (userId: string) => void;
  setUserName: (userName: string) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token') || null,
  userId: localStorage.getItem('userId') || '',
  userName: localStorage.getItem('userName') || '',
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setUserId: (userId) => {
    localStorage.setItem('userId', userId);
    set({ userId });
  },
  setUserName: (userName) => {
    localStorage.setItem('userName', userName);
    set({ userName });
  },
}));