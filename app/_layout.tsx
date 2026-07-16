import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link, router, useSegments } from 'expo-router';
// Removed Lucide imports to stop the SVG engine crash
import { useAuthStore } from '../store/authStore';
import '../global.css';

function Navbar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View className="border-b border-slate-800 bg-slate-950/80 px-4 h-16 flex-row items-center justify-between">
      <Link href="/" asChild>
        <Pressable className="flex-row items-center gap-2">
          <Text className="text-xl">⚔️</Text>
          <Text className="font-bold text-xl text-indigo-400">Shik-Shak</Text>
        </Pressable>
      </Link>

      <View className="flex-row items-center gap-4">
        <Link href="/practice" asChild>
          <Pressable className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg active:bg-slate-800">
            <Text className="text-sm">🧠</Text>
            <Text className="text-slate-100 text-sm font-medium">Practice</Text>
          </Pressable>
        </Link>

        <Link href="/battle/lobby" asChild>
          <Pressable className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg active:bg-slate-800">
            <Text className="text-sm">⚔️</Text>
            <Text className="text-slate-100 text-sm font-medium">Battle</Text>
          </Pressable>
        </Link>

        {user ? (
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
              <Text className="text-sm">👤</Text>
              <Text className="text-slate-300 text-sm">{user.username}</Text>
            </View>
            <Pressable onPress={handleSignOut} className="p-2 rounded-lg active:bg-slate-800">
              <Text className="text-sm">🚪</Text>
            </Pressable>
          </View>
        ) : (
          <Link href="/login" asChild>
            <Pressable className="px-4 py-1.5 rounded-lg bg-indigo-600 active:bg-indigo-500">
              <Text className="text-sm font-medium text-white">Sign In</Text>
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const { user, loading, loadUser } = useAuthStore();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  // 1. Move inAuthGroup HERE, outside the useEffect
  const inAuthGroup = segments[0] === 'login' || segments[0] === 'auth';

  useEffect(() => {
    loadUser().finally(() => setIsReady(true));
  }, [loadUser]);

  useEffect(() => {
    if (!isReady || loading) return;

    // 2. Now this logic can still use it...
    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, inAuthGroup, isReady]); // (Added inAuthGroup to dependency array)

  if (!isReady || loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* 3. ...and your UI can use it too! */}
      {!inAuthGroup && <Navbar />}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#020617' } }} />
    </SafeAreaView>
  );
}