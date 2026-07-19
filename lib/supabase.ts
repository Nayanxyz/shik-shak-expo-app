import * as Linking from 'expo-linking';
import 'react-native-url-polyfill/auto'; // Required for Supabase in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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

// Configure Google Sign-In with your Web Client ID
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
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

// 🚨 Native Google Sign-In (Bypasses Web Browser entirely)
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    
    // Triggers the native Android bottom-sheet
    const response = await GoogleSignin.signIn();
    
    let idToken: string | null | undefined = null;

    // Type-safe check for newer v13+ SDK
    if (response.type === 'success') {
      idToken = response.data.idToken;
    } else if (response.type === 'cancelled') {
      return { data: null, error: new Error("Sign-in was cancelled.") };
    } else {
      // Fallback for older SDK versions
      idToken = (response as any).idToken || (response as any).data?.idToken;
    }

    if (!idToken) {
      return { data: null, error: new Error("No ID token found from Google.") };
    }

    // Authenticate with Supabase using the Native token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    return { data, error };
  } catch (error: any) {
    console.error("Native Google Sign-In Error:", error);
    return { data: null, error };
  }
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