import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackScreen() {
  const loadUser = useAuthStore((s) => s.loadUser);
