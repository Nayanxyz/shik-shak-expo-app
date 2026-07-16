import { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

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
      if (isSignUp) {
        setError("Verification email sent! Please check your inbox before logging in.");
      } else {
        await loadUser();
        router.replace('/');
      }
    }
    
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    
    // REMOVED: The Platform restriction checking block has been removed
    // to allow native app runtimes (iOS/Android) to call the OAuth module.
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError.message);
    } else {
      await loadUser();
      router.replace('/');
    }
    
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      {/* Change justifycontent to justifyContent */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className="w-full max-w-md mx-auto space-y-6 py-8">
          
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
            disabled={loading}
            className="w-full flex-row items-center justify-center gap-3 py-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700"
          >
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
                  <Text className="text-lg">👤</Text> 
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

            <View className="relative justify-center">
              <View className="absolute left-3 z-10">
                <Text className="text-lg">📧</Text>
              </View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
              />
            </View>

            <View className="relative justify-center">
              <View className="absolute left-3 z-10">
                <Text className="text-lg">🔒</Text>
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 z-10 p-1"
              >
                <Text className="text-lg">{showPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>

            {error ? (
              <View className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <Text className="text-red-400 text-sm">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleEmailAuth}
              disabled={loading}
              className={`w-full py-3 rounded-xl flex-row items-center justify-center gap-2 ${
                loading ? 'bg-slate-800' : 'bg-indigo-600 active:bg-indigo-500'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#cbd5e1" />
              ) : (
                <Text className="font-semibold text-white">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-center items-center mt-4 gap-1">
            <Text className="text-slate-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <Pressable onPress={() => { setIsSignUp(!isSignUp); setError(''); }}>
              <Text className="text-indigo-400 font-medium text-sm">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}