import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; success?: boolean; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Try using Supabase auth directly first
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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
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
        session: null,
        signUp: async () => ({ error: 'Auth not available during hot reload' }),
        signIn: async () => ({ error: 'Auth not available during hot reload' }),
        signOut: async () => {},
        loading: true,
      };
    }
    
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}