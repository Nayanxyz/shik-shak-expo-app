import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link, router, useSegments } from 'expo-router';
import { Swords, Brain, LogOut, User } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import '../global.css';

function Navbar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

