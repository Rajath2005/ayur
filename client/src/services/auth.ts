import { supabase } from './supabaseClient';
import type { User, AuthError, AuthResponse } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const signUp = async ({ email, password, name }: SignUpData): Promise<AuthUser> => {
  if (!supabase) throw new Error('Supabase is not initialized. Please check your environment variables.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      }
    }
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || name,
  };
};

export const signIn = async ({ email, password }: SignInData): Promise<AuthUser> => {
  if (!supabase) throw new Error('Supabase is not initialized. Please check your environment variables.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign in failed');

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || email.split('@')[0],
  };
};

export const signInWithGoogle = async (): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not initialized. Please check your environment variables.');

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    }
  });

  if (error) throw error;
};

export const logout = async (): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not initialized. Please check your environment variables.');

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const restoreSession = async (): Promise<AuthUser | null> => {
  if (!supabase) {
    console.warn('Supabase is not initialized. Please check your environment variables.');
    return null;
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Session restore error:', error);
    return null;
  }

  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
  };
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not initialized. Please check your environment variables.');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!supabase) {
    console.warn('Supabase is not initialized. Please check your environment variables.');
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.email!.split('@')[0],
  };
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!supabase) {
    console.warn('Supabase is not initialized. Please check your environment variables.');
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
      });
    } else {
      callback(null);
    }
  });

  return subscription;
};
