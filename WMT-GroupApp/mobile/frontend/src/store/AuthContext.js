import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, login as loginSvc, register as registerSvc, logout as logoutSvc, refreshUser } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    (async () => {
      try { setUser(await getCurrentUser()); }
      catch { setUser(null); }
      finally { setLoading(false); }
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const u = await loginSvc(email, password);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (payload) => {
    const u = await registerSvc(payload);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await logoutSvc();
    setUser(null);
  }, []);

  const reload = useCallback(async () => {
    try { const u = await refreshUser(); setUser(u); return u; }
    catch { return user; }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, reload, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
};
