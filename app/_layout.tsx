import { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
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

  return (
    <View className="border-b border-slate-800 bg-slate-950/80 px-4 h-16 flex-row items-center justify-between">
      <Link href="/" asChild>
        <Pressable className="flex-row items-center gap-2">
          <Swords size={24} color="#818cf8" />
          <Text className="font-bold text-xl text-indigo-400">Shik-Shak</Text>
        </Pressable>
      </Link>

      <View className="flex-row items-center gap-4">
        <Link href="/practice" asChild>
          <Pressable className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg active:bg-slate-800">
            <Brain size={16} color="#f8fafc" />
            <Text className="text-slate-100 text-sm font-medium">Practice</Text>
          </Pressable>
        </Link>

        <Link href="/battle/lobby" asChild>
          <Pressable className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg active:bg-slate-800">
            <Swords size={16} color="#f8fafc" />
            <Text className="text-slate-100 text-sm font-medium">Battle</Text>
          </Pressable>
        </Link>

        {user ? (
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
              <User size={16} color="#818cf8" />
              <Text className="text-slate-300 text-sm">{user.username}</Text>
            </View>
            <Pressable onPress={handleSignOut} className="p-2 rounded-lg active:bg-slate-800">
              <LogOut size={16} color="#94a3b8" />
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

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Route protection gatekeeper
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect unauthenticated user to login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect logged-in user away from auth screens
      router.replace('/');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Navbar />
      {/* Stack renders the active screen matching the current file route */}
      <View className="flex-1 px-4 py-6">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}