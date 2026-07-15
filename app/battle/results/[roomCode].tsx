import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Trophy, Crown, Swords, ArrowRight, Zap, Target, Users } from 'lucide-react-native';
import { useGameStore } from '../../../store/gameStore';

export default function BattleResultsScreen() {
  const { roomCode } = useLocalSearchParams();
  const store = useGameStore();
  const rankings = store.finalRankings || [];

  useEffect(() => {
    if (!rankings.length) {
      router.replace('/battle/lobby');
    }
  }, [rankings]);

  if (!rankings.length) return null;

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-orange-500 items-center justify-center mb-4">
          <Trophy size={40} color="#fff" />
        </View>
        <Text className="text-3xl font-bold text-white">Battle Complete!</Text>
        <Text className="text-slate-400 mt-2">Room: {roomCode}</Text>
      </View>

      {rankings[0] && (
        <View className="p-6 rounded-2xl bg-yellow-900/30 border border-yellow-500/30 items-center mb-6">
          <Crown size={32} color="#facc15" className="mb-2" />
          <Text className="text-lg text-yellow-300 font-semibold">Winner</Text>
          <Text className="text-2xl font-bold text-white mt-1">{rankings[0].name}</Text>
          <Text className="text-slate-400 mt-1">
            {rankings[0].total_score} points • {rankings[0].accuracy}% accuracy
          </Text>
        </View>
      )}

