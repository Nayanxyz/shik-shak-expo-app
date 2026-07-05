import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackScreen() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase handles the URL session extraction natively
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.replace('/login');
        return;
      }

