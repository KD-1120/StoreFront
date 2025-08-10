import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';
import { ProfileService } from '../utils/supabase/profiles';
import { Database } from '../utils/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; success?: boolean; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile asynchronously but don't block setting loading to false
        if (session?.user) {
          loadProfile(session.user.id, session.user).catch(err => {
            console.error('[AuthProvider] Initial profile loading failed:', err);
          });
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AuthProvider] Error getting initial session:', err);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile asynchronously but don't block setting loading to false
        if (session?.user) {
          loadProfile(session.user.id, session.user).catch(err => {
            console.error('[AuthProvider] Profile loading failed:', err);
          });
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string, userData?: User) => {
    try {
      const profile = await ProfileService.getOrCreateProfile(userId, userData);
      setProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      });

      if (signupError) {
        return { error: signupError.message };
      }

      // If email confirmation is required, inform the user
      if (data.user && !data.session) {
        return { 
          error: 'Please check your email to confirm your account before signing in.',
          requiresEmailConfirmation: true 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Network error during signup' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Network error during sign in' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const updatedProfile = await ProfileService.updateProfile(user.id, updates);
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      signUp,
      signIn,
      signOut,
      loading,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider. Component tree:', document.location.href);
    
    // In development, provide a fallback during hot reload issues
    if (process.env.NODE_ENV === 'development') {
      console.warn('Providing fallback auth context during development hot reload');
      return {
        user: null,
        profile: null,
        session: null,
        signUp: async () => ({ error: 'Auth not available during hot reload' }),
        signIn: async () => ({ error: 'Auth not available during hot reload' }),
        signOut: async () => {},
        loading: true,
        updateProfile: async () => {},
      };
    }
    
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}