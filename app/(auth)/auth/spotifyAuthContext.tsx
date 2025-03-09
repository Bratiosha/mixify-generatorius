import { createContext, useState, useEffect, ReactNode } from "react";


interface AuthContextType {
  token: string | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get("access_token");

    if (accessToken) {
      setToken(accessToken);
      window.history.pushState({}, "", "/"); // Clear the URL
    }
  }, []);

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("spotify_token");
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ token, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
