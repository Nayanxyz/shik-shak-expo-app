import { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getSocket } from '../../../lib/socket';
import { useGameStore } from '../../../store/gameStore';

export default function BattleResultsScreen() {
  const { roomCode } = useLocalSearchParams();
  const store = useGameStore();
  const rankings = store.finalRankings || [];
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (!rankings.length) {
      router.replace('/battle/lobby');
      return;
    }

    const socket = getSocket();
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    // 🚨 Listen for the host restarting the room
    socket.on('room_restarted', () => {
      // Keep the room data in the store, just go back to the lobby waiting area
      router.replace('/battle/lobby');
    });

    return () => {
      socket.off('room_restarted');
      listenersAttached.current = false;
    };
  }, [rankings]);

  const handleRestart = () => {
    const socket = getSocket();
    if (socket && roomCode) {
      socket.emit('restart_room', { room_code: roomCode });
    }
  };

  const handleLeave = () => {
    const socket = getSocket();
    if (socket && roomCode) {
      socket.emit('leave_room', { room_code: roomCode });
    }
    store.resetGame();
    router.replace('/');
  };

  if (!rankings.length) return null;

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-orange-500 items-center justify-center mb-4">
          <Text className="text-4xl text-white">🏆</Text>
        </View>
        <Text className="text-3xl font-bold text-white">Battle Complete!</Text>
        <Text className="text-slate-400 mt-2">Room: {roomCode}</Text>
      </View>

      {rankings[0] && (
        <View className="p-6 rounded-2xl bg-yellow-900/30 border border-yellow-500/30 items-center mb-6">
          <Text className="text-3xl mb-2">👑</Text>
          <Text className="text-lg text-yellow-300 font-semibold">Winner</Text>
          <Text className="text-2xl font-bold text-white mt-1">{rankings[0].name}</Text>
          <Text className="text-slate-400 mt-1">
            {rankings[0].total_score} points • {rankings[0].accuracy}% accuracy
          </Text>
        </View>
      )}

      <View className="space-y-3 mb-8 gap-3">
        {rankings.map((p: any, i: number) => (
          <View key={p.user_id} className={`flex-row items-center justify-between p-4 rounded-2xl border ${
            i === 0 ? "bg-orange-900/20 border-yellow-500/30" :
            i === 1 ? "bg-slate-800/50 border-slate-400/30" :
            i === 2 ? "bg-red-900/20 border-orange-500/30" :
            "bg-slate-900 border-slate-800"
          }`}>
            <View className="flex-row items-center gap-4">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${
                i === 0 ? "bg-yellow-500" :
                i === 1 ? "bg-slate-400" :
                i === 2 ? "bg-orange-500" :
                "bg-slate-800"
              }`}>
                {i === 0 ? <Text className="text-2xl">👑</Text> : <Text className="font-bold text-lg text-white">{p.rank}</Text>}
              </View>
              <View>
                <Text className="font-bold text-lg text-white">{p.name}</Text>
                <View className="flex-row items-center gap-3 mt-1">
                  <View className="flex-row items-center gap-1"><Text className="text-xs">🎯</Text><Text className="text-xs text-slate-400">{p.accuracy}%</Text></View>
                  <View className="flex-row items-center gap-1"><Text className="text-xs">⚡</Text><Text className="text-xs text-slate-400">Streak {p.max_streak}</Text></View>
                </View>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-indigo-300">{p.total_score}</Text>
              <Text className="text-xs text-slate-400">points</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row gap-4 mb-4">
        {store.isHost ? (
          <Pressable onPress={handleRestart} className="flex-1 py-4 rounded-xl bg-indigo-600 active:bg-indigo-500 flex-row justify-center items-center gap-2">
            <Text className="text-xl text-white">🔄</Text>
            <Text className="font-semibold text-white">Play Again (Same Room)</Text>
          </Pressable>
        ) : (
          <View className="flex-1 py-4 rounded-xl bg-slate-800 border border-slate-700 flex-row justify-center items-center gap-2">
            <ActivityIndicator size="small" color="#94a3b8" />
            <Text className="font-semibold text-slate-400 text-sm">Waiting for host to restart...</Text>
          </View>
        )}
      </View>
      
      <Pressable onPress={handleLeave} className="w-full py-4 rounded-xl bg-slate-900 border border-slate-700 flex-row justify-center items-center gap-2">
        <Text className="font-semibold text-white">Leave Room & Go Home</Text>
      </Pressable>
      
    </ScrollView>
  );
}