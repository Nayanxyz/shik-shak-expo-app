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

