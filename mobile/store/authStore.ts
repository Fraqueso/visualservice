import { create } from 'zustand';
import { supabase, Profile } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isUpdating: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  changePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  isUpdating: false,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          session,
          user: session.user,
          profile: profile || null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          session: null,
          user: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            session,
            user: session.user,
            profile: profile || null,
          });
        } else {
          set({
            session: null,
            user: null,
            profile: null,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        profile: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'visualservice://reset-password',
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      set({ isUpdating: true });
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await get().refreshProfile();

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    } finally {
      set({ isUpdating: false });
    }
  },

  changePassword: async (newPassword: string) => {
    try {
      set({ isUpdating: true });
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Change password error:', error);
      return { error: error as Error };
    } finally {
      set({ isUpdating: false });
    }
  },

  deleteAccount: async () => {
    try {
      set({ isUpdating: true });
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      // Mark the account for deletion by updating the profile
      // The actual deletion will happen after 30 days via a background job
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: '[Deleted User]',
          business_name: null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Delete all user's photos from storage and database
      const { data: photos } = await supabase
        .from('photos')
        .select('id, image_url')
        .eq('user_id', user.id);

      if (photos && photos.length > 0) {
        // Delete photos from database (cascade will handle photo_albums)
        await supabase
          .from('photos')
          .delete()
          .eq('user_id', user.id);
      }

      // Delete user's albums
      await supabase
        .from('albums')
        .delete()
        .eq('user_id', user.id);

      // Sign out the user
      await supabase.auth.signOut();

      set({
        session: null,
        user: null,
        profile: null,
      });

      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error);
      return { error: error as Error };
    } finally {
      set({ isUpdating: false });
    }
  },

  refreshProfile: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      set({ profile: profile || null });
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  },
}));
