import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from '../api/auth';
import { getOwnProfile as apiGetOwnProfile } from '../api/profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('wc_token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('wc_userId'));
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wc_profile')) || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('wc_token', token);
    } else {
      localStorage.removeItem('wc_token');
    }
  }, [token]);

  useEffect(() => {
    if (userId) localStorage.setItem('wc_userId', userId);
    else localStorage.removeItem('wc_userId');
  }, [userId]);

  useEffect(() => {
    if (profile) localStorage.setItem('wc_profile', JSON.stringify(profile));
    else localStorage.removeItem('wc_profile');
  }, [profile]);

  // login with email/password, store token and fetch profile
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (!res || !res.token) throw new Error('Login failed');
    setToken(res.token);
    setUserId(res.userId);
    // fetch profile and store (pass userId to support in-memory dev fallback)
    try {
      const p = await apiGetOwnProfile(res.token, res.userId);
      setProfile(p);
      // return profile to caller so they can act immediately
      return { ...res, profile: p };
    } catch (err) {
      // ignore; profile can be created later
      console.warn('Failed to fetch profile after login', err);
      return res;
    }
  };

  // if token exists (e.g. page reload) and we don't have profile, try to fetch it
  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (!token || profile) return;
      try {
        const p = await apiGetOwnProfile(token, userId);
        if (!cancelled) setProfile(p);
      } catch (err) {
        console.warn('Failed to fetch profile on load', err);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [token, userId, profile]);

  const logout = () => {
    setToken(null);
    setUserId(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, profile, setProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
