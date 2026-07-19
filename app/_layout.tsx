import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link, router, useSegments } from 'expo-router';
// Removed Lucide imports to stop the SVG engine crash
import { useAuthStore } from '../store/authStore';
import '../global.css';

// 🚨 REQUIRED FOR ANDROID: Enable LayoutAnimation for the smooth slider effect
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function Navbar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  
  // State for the slider animation
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMenu(!showMenu);
  };

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOut();
    router.replace('/login');
  };

  return (
    <View className="z-50 relative">
      <View className="border-b border-slate-800 bg-slate-950/95 px-4 h-16 flex-row items-center justify-between z-50">
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
            // 🚨 Updated Classy Clickable Username Pill
            <Pressable 
              onPress={toggleMenu} 
              className={`flex-row items-center gap-2 px-3 py-1.5 rounded-lg border ${
                showMenu ? 'bg-slate-800 border-indigo-500/50' : 'bg-slate-900 border-slate-700'
              } active:bg-slate-800`}
            >
              <Text className="text-sm">👤</Text>
              <Text className="text-slate-200 font-semibold text-sm">{user.username}</Text>
            </Pressable>
          ) : (
            <Link href="/login" asChild>
              <Pressable className="px-4 py-1.5 rounded-lg bg-indigo-600 active:bg-indigo-500">
                <Text className="text-sm font-medium text-white">Sign In</Text>
              </Pressable>
            </Link>
          )}
        </View>
      </View>

      {/* 🚨 The Animated Dropdown Menu Slider */}
      {showMenu && user && (
        <View className="absolute top-16 right-4 mt-2 w-64 bg-slate-900/95 border border-slate-700 rounded-2xl p-4 shadow-2xl z-40">
          
          <View className="flex-row items-center gap-3 mb-4 border-b border-slate-800 pb-4">
            <View className="w-12 h-12 bg-indigo-600 rounded-full items-center justify-center border border-indigo-400">
              <Text className="text-white font-bold text-xl">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base" numberOfLines={1}>
                {user.username}
              </Text>
              <Text className="text-slate-400 text-xs" numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
          
          <Pressable 
            onPress={handleSignOut} 
            className="w-full py-3 rounded-xl bg-red-950/30 border border-red-900/50 items-center justify-center active:bg-red-900/40"
          >
            <Text className="text-red-400 font-semibold">Sign Out</Text>
          </Pressable>
          
        </View>
      )}
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
  }, [user, loading, inAuthGroup, isReady]);

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