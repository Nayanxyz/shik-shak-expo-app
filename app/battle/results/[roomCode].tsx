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

