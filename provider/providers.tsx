// app/providers.tsx
'use client';

import { useAuthStore } from '@/store/store';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setToken } = useAuthStore();

  // Initialize token from URL or localStorage on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');

    if (accessToken) {
      setToken(accessToken);
      window.history.pushState({}, '', '/');
    }
  }, [setToken]);

  return <>{children}</>;
}