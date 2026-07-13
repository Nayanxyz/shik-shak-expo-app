import { create } from 'zustand';
import { supabase, getCurrentUser, getProfile, upsertProfile } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

