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
  token: null, // Initialize as null on the server
  userId: '', // Initialize as empty on the server
  userName: '', // Initialize as empty on the server
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },
  setUserId: (userId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
    set({ userId });
  },
  setUserName: (userName) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', userName);
    }
    set({ userName });
  },
}));