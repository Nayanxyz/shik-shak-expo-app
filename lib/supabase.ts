import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-url-polyfill/auto'; // Required for Supabase in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Required for web browser to close automatically when redirected back
WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Keeps the user logged in after app closes
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Keep false, we handle deep links manually
  },
});

export const signUpWithEmail = async (email: string, password: string, username: string) => {
  const redirectUrl = Linking.createURL('/auth/callback'); 
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { username },
      emailRedirectTo: redirectUrl, 
    }
  });
  return { data, error };
};

export const verifyEmailOtp = async (email: string, code: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const redirectUrl = Linking.createURL('/');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { 
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, 
    }
  });

  if (error) return { data, error };

  if (!data || !('url' in data) || !data.url) {
    return { data: null, error: new Error("No URL returned from Supabase.") };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === 'success' && result.url) {
    const hash = result.url.split('#')[1];
    if (hash) {
      const params = new URLSearchParams(hash); 
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const sessionResult = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        return sessionResult;
      }
    }
  }
  
  return { data: null, error: new Error("Google sign-in was cancelled or failed.") };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const upsertProfile = async (profile: {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  return { data, error };
};