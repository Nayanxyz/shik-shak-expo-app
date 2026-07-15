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

