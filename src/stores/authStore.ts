import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { UserRole } from '../types';

interface AppUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  email_verified_at?: string;
  phone_verified_at?: string;
  dealer_id?: number;
}

interface AuthState {
  session: Session | null;
  authUser: SupabaseUser | null; // Supabase auth user (auth.users)
  appUser: AppUser | null; // Naše users tabulka (rozšířená o role atd.)
  loading: boolean;
  initialized: boolean;

  init: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<AppUser, 'name' | 'phone' | 'avatar_url'>>) => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

async function loadAppUser(authUser: SupabaseUser | null): Promise<AppUser | null> {
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, phone, avatar_url, role, email_verified_at, phone_verified_at, dealer_id')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.warn('loadAppUser error:', error.message);
  }

  // Pokud users row ještě neexistuje (signup nebyl synchronizován trigger),
  // vytvoříme ho z auth.users
  if (!data) {
    const meta = authUser.user_metadata as Record<string, unknown>;
    const insertPayload = {
      id: authUser.id,
      email: authUser.email ?? '',
      name: (meta?.name as string) ?? null,
      role: ((meta?.role as UserRole) ?? 'buyer') as UserRole,
      email_verified_at: authUser.email_confirmed_at ?? null,
    };
    const { data: created, error: insertError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, email, name, phone, avatar_url, role, email_verified_at, phone_verified_at, dealer_id')
      .single();

    if (insertError) {
      console.warn('users row create failed:', insertError.message);
      return {
        id: authUser.id,
        email: authUser.email ?? '',
        role: 'buyer',
      };
    }
    return created as AppUser;
  }

  return data as AppUser;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  authUser: null,
  appUser: null,
  loading: true,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user ?? null;
    const appUser = await loadAppUser(authUser);
    set({ session, authUser, appUser, loading: false });

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const newAuthUser = newSession?.user ?? null;
      const newAppUser = await loadAppUser(newAuthUser);
      set({ session: newSession, authUser: newAuthUser, appUser: newAppUser });
    });
  },

  signUp: async (email, password, name, role) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/prihlaseni`,
      },
    });
    if (error) throw error;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  signInWithMagicLink: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/profil`,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, authUser: null, appUser: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/prihlaseni`,
    });
    if (error) throw error;
  },

  updateProfile: async (updates) => {
    const user = get().authUser;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select('id, email, name, phone, avatar_url, role, email_verified_at, phone_verified_at, dealer_id')
      .single();
    if (error) throw error;
    set({ appUser: data as AppUser });
  },

  refreshAppUser: async () => {
    const authUser = get().authUser;
    const appUser = await loadAppUser(authUser);
    set({ appUser });
  },
}));
