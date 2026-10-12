import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabase } from '../api/supabase';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = api.getToken();

        if (isLiveSupabase() && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            api.setToken(session.access_token);
            const me = await api.getMe();
            setUser(session.user);
            setProfile(me);
          } else if (storedToken) {
            // Token in storage
            const me = await api.getMe();
            setUser(me);
            setProfile(me);
          }
        } else if (storedToken) {
          // Offline / Demo session restoration
          const me = await api.getMe();
          setUser(me);
          setProfile(me);
        }
      } catch (err) {
        console.warn('Session restoration note:', err.message);
        api.setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase Auth state changes if live Supabase is enabled
    if (isLiveSupabase() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.access_token) {
          api.setToken(session.access_token);
          try {
            const me = await api.getMe();
            setUser(session.user);
            setProfile(me);
          } catch (e) {
            console.error('Failed to sync auth state', e);
          }
        } else if (event === 'SIGNED_OUT') {
          api.setToken(null);
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sign In with email & password
  const login = async (email, password) => {
    setError(null);
    try {
      if (isLiveSupabase() && supabase) {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (sbError) throw sbError;
        if (data.session?.access_token) {
          api.setToken(data.session.access_token);
          const me = await api.getMe();
          setUser(data.user);
          setProfile(me);
          return me;
        }
      } else {
        // Demo authentication mode
        // Look up role by demo email or fallback to athlete
        let role = 'athlete';
        if (email.includes('coach')) role = 'coach';
        else if (email.includes('academy') || email.includes('club')) role = 'club';
        else if (email.includes('organizer')) role = 'organizer';

        const demoToken = `demo-token-${role}`;
        api.setToken(demoToken);
        const me = await api.getMe();
        setUser(me);
        setProfile(me);
        return me;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign Up with email, password, and metadata
  const register = async ({ email, password, full_name, role, city, state, primary_sport_id }) => {
    setError(null);
    try {
      if (isLiveSupabase() && supabase) {
        const { data, error: sbError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name, role }
          }
        });
        if (sbError) throw sbError;

        if (data.session?.access_token) {
          api.setToken(data.session.access_token);
          // Sync profile to database via Express API
          const synced = await api.syncProfile({
            full_name,
            role,
            city,
            state,
            primary_sport_id
          });
          setUser(data.user);
          setProfile(synced);
          return synced;
        }
        return data.user;
      } else {
        // Demo mode registration
        const demoToken = `demo-token-${role || 'athlete'}`;
        api.setToken(demoToken);
        const synced = await api.syncProfile({
          full_name,
          role: role || 'athlete',
          city,
          state,
          primary_sport_id
        });
        setUser(synced);
        setProfile(synced);
        return synced;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Quick Demo Login (for college presentation, hackathon & instant review)
  const quickDemoLogin = async (role = 'athlete') => {
    const demoToken = `demo-token-${role}`;
    api.setToken(demoToken);
    const me = await api.getMe();
    setUser(me);
    setProfile(me);
    return me;
  };

  // Sign Out
  const logout = async () => {
    try {
      if (isLiveSupabase() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Signout note:', err.message);
    } finally {
      api.setToken(null);
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const me = await api.getMe();
      setProfile(me);
      return me;
    } catch (e) {
      console.warn('Profile refresh notice:', e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshProfile,
        isAuthenticated: !!profile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
