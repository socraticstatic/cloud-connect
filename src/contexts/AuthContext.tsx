import { createContext, useContext, useState, ReactNode } from 'react';

const STORAGE_KEY = 'att_nb_user';

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: false;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());

  const signIn = (email: string) => {
    const u = { email: email.toLowerCase().trim() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
