import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Trophy, Target, CheckCircle, XCircle, RotateCcw, ArrowRight, Zap, TrendingUp } from 'lucide-react-native';
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
        <XCircle size={48} color="#f87171" className="mb-4" />
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

