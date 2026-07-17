import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
// 🚨 Lucide completely removed to protect the Android SVG engine
import { apiFetch } from '../../lib/api';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  // Ensure we safely extract the ID if Expo Router passes it as an array
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.replace('/practice');
      return;
    }
    
    const fetchResults = async () => {
      try {
        const data = await apiFetch(`/api/v1/practice/${sessionId}/results`);
        setResults(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [sessionId]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" className="mb-4" />
        <Text className="text-slate-400">Loading results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center px-4">
        <Text className="text-5xl mb-4">❌</Text>
        <Text className="text-xl font-bold text-white mb-2">Failed to load results</Text>
        <Text className="text-slate-400 text-center mb-8">{error}</Text>
        <Pressable onPress={() => router.replace('/practice')} className="px-8 py-4 bg-indigo-600 active:bg-indigo-500 rounded-xl">
          <Text className="font-semibold text-white">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const accuracy = results?.accuracy || 0;
  const totalScore = results?.total_score || 0;
  const correct = results?.correct_count || 0;
  const wrong = results?.wrong_count || 0;
  const total = correct + wrong;

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-orange-500 items-center justify-center mb-4">
          <Text className="text-4xl text-white">🏆</Text>
        </View>
        <Text className="text-3xl font-bold text-white">Practice Complete!</Text>
        <Text className="text-slate-400 mt-2">Here's how you performed</Text>
      </View>

      {/* Score Card */}
      <View className="p-8 rounded-2xl bg-indigo-950 border border-indigo-500/20 items-center mb-8">
        <Text className="text-6xl font-bold text-indigo-300">{totalScore}</Text>
        <Text className="text-slate-400 mt-2">Total Score</Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        <View className="w-[48%] p-4 rounded-xl bg-green-900/30 border border-green-500/20 items-center">
          <Text className="text-2xl mb-2">✅</Text>
          <Text className="text-2xl font-bold text-green-300">{correct}</Text>
          <Text className="text-xs text-slate-400">Correct</Text>
        </View>
        <View className="w-[48%] p-4 rounded-xl bg-red-900/30 border border-red-500/20 items-center">
          <Text className="text-2xl mb-2">❌</Text>
          <Text className="text-2xl font-bold text-red-300">{wrong}</Text>
          <Text className="text-xs text-slate-400">Wrong</Text>
        </View>
        <View className="w-[48%] p-4 rounded-xl bg-blue-900/30 border border-blue-500/20 items-center">
          <Text className="text-2xl mb-2">🎯</Text>
          <Text className="text-2xl font-bold text-blue-300">{total}</Text>
          <Text className="text-xs text-slate-400">Total</Text>
        </View>
        <View className="w-[48%] p-4 rounded-xl bg-indigo-900/30 border border-indigo-500/20 items-center">
          <Text className="text-2xl mb-2">🎯</Text>
          <Text className="text-2xl font-bold text-indigo-300">{accuracy}%</Text>
          <Text className="text-xs text-slate-400">Accuracy</Text>
        </View>
      </View>

      {/* Accuracy Bar */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-slate-400">Accuracy</Text>
          <Text className="text-sm font-bold text-indigo-300">{accuracy}%</Text>
        </View>
        <View className="h-4 bg-slate-800 rounded-full overflow-hidden">
          <View 
            className={`h-full rounded-full ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${accuracy}%` }} 
          />
        </View>
      </View>

