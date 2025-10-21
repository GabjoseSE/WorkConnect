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

  // we persist token and userId explicitly in login/logout to control session vs persistent storage

  useEffect(() => {
    if (profile) localStorage.setItem('wc_profile', JSON.stringify(profile));
    else localStorage.removeItem('wc_profile');
  }, [profile]);

  // login with email/password, store token and fetch profile
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (!res || !res.token) throw new Error('Login failed');
    setToken(res.token);
    // backend may return `id` instead of `userId` — accept either
    const resolvedUserId = res.userId || res.id || null;
    setUserId(resolvedUserId);
    // Clear any stale profile while we fetch the correct one
    setProfile(null);
    // persist token and userId to localStorage (remember behavior removed)
    try {
      localStorage.setItem('wc_token', res.token);
      if (resolvedUserId) localStorage.setItem('wc_userId', resolvedUserId);
    } catch (e) { /* ignore storage errors */ }
    // fetch profile and store (pass email and userId to support various server behaviors)
    try {
      const p = await apiGetOwnProfile(res.token, resolvedUserId, email);
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
      if (!token) return;
      // if we already have a profile, but it belongs to a different user, refetch
      if (profile && userId && String(profile.userId) === String(userId)) return;
      try {
    // try fetching with token/userId first, fallback to token+email if userId absent
    const p = await apiGetOwnProfile(token, userId, null);
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
    try {
      localStorage.removeItem('wc_token');
      localStorage.removeItem('wc_userId');
      sessionStorage.removeItem('wc_token');
      sessionStorage.removeItem('wc_userId');
    } catch (e) { /* ignore */ }
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
