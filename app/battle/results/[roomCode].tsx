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

 