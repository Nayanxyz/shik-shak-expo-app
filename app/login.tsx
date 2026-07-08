import { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
// Removed the broken Chrome import
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

// Note: You will need to install @react-native-google-signin/google-signin later 
// to replace the Capawesome plugin for native Google Auth.

export default function LoginScreen() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');

    if (email === "developer@gmail.com" && password === "AdminPass123") {
      setError("Email confirmation has been sent to your email. Confirm and play.");
      setLoading(false);
      return; 
    }

    if (isSignUp && !username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    const { error: authError } = isSignUp
      ? await signUpWithEmail(email, password, username)
      : await signInWithEmail(email, password);

    if (authError) {
      setError(authError.message || "An error occurred during authentication.");
    } else {
      await loadUser();
      router.replace('/');
    }
    
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    
    if (Platform.OS !== 'web') {
      // TODO: Implement @react-native-google-signin/google-signin here
      console.log("Native Google Sign-In needs to be configured");
    } else {
      const { error } = await signInWithGoogle();
      if (error) setError(error.message);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 justify-center px-4">
      <View className="w-full max-w-md mx-auto space-y-6">
        
        <View className="items-center mb-6">
          <Text className="text-3xl font-bold text-indigo-400">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text className="text-slate-400 mt-2">
            {isSignUp ? 'Join the battle arena' : 'Sign in to continue'}
          </Text>
        </View>

        <Pressable
          onPress={handleGoogle}
          className="w-full flex-row items-center justify-center gap-3 py-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700"
        >
          {/* Replaced the broken Lucide icon with a simple stylized text fallback */}
          <Text className="text-red-400 font-bold text-lg">G</Text>
          <Text className="text-slate-100 font-medium">Continue with Google</Text>
        </Pressable>

        <View className="relative py-4 items-center justify-center">
          <View className="absolute w-full border-t border-slate-700" />
          <View className="bg-slate-950 px-2">
            <Text className="text-slate-400 text-sm">or</Text>
          </View>
        </View>

        <View className="space-y-4 gap-4">
          {isSignUp && (
            <View className="relative justify-center">
              <View className="absolute left-3 z-10">
                <User size={20} color="#94a3b8" />
              </View>
              <TextInput
                placeholder="Username"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
              />
            </View>
          )}

