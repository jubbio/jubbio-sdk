import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { JubbioAuth, type JubbioAuthConfig, type JubbioUser } from 'jubbio-auth';

interface JubbioContextValue {
  auth: JubbioAuth;
  user: JubbioUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setUser: (user: JubbioUser | null) => void;
}

const JubbioContext = createContext<JubbioContextValue | null>(null);

export interface JubbioProviderProps {
  config: JubbioAuthConfig;
  children: ReactNode;
}

export function JubbioProvider({ config, children }: JubbioProviderProps) {
  const auth = useMemo(() => new JubbioAuth(config), [config.clientId, config.redirectUri]);
  const [user, setUser] = useState<JubbioUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = auth.isLoggedIn();

  // Try to fetch user on mount if token exists
  useEffect(() => {
    if (isLoggedIn && !user) {
      setIsLoading(true);
      auth.getUser()
        .then(setUser)
        .catch(() => {}) // Token might be expired
        .finally(() => setIsLoading(false));
    }
  }, [isLoggedIn]);

  const login = async () => {
    setIsLoading(true);
    try {
      await auth.login();
    } catch {
      setIsLoading(false);
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const value: JubbioContextValue = {
    auth, user, isLoggedIn, isLoading, login, logout, setUser
  };

  return (
    <JubbioContext.Provider value={value}>
      {children}
    </JubbioContext.Provider>
  );
}

export function useJubbio(): JubbioContextValue {
  const ctx = useContext(JubbioContext);
  if (!ctx) throw new Error('useJubbio must be used within <JubbioProvider>');
  return ctx;
}
