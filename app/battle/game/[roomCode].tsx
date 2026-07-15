import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Swords, Clock, Trophy, Zap, LogOut, AlertTriangle, RefreshCw, CheckCircle, XCircle, Crown, Target } from 'lucide-react-native';
import { getSocket, disconnectSocket } from '../../../lib/socket';
import { useGameStore } from '../../../store/gameStore';
import { useAuthStore } from '../../../store/authStore';
import MathHtml from '../../../components/MathHtml';

export default function BattleGameScreen() {
  const { roomCode } = useLocalSearchParams();
  const store = useGameStore();
  const authUser = useAuthStore((s) => s.user);

  const [phase, setPhase] = useState<'playing' | 'results' | 'leaderboard' | 'finished'>('playing');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [forfeitMessage, setForfeitMessage] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [finalRankings, setFinalRankings] = useState<any[]>([]);
  const [nextQuestionIn, setNextQuestionIn] = useState(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [error, setError] = useState('');

  const startTimeRef = useRef<number>(0);
  const nextQuestionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenersAttached = useRef(false);


  const handleExit = () => {
    const socket = getSocket();
    if (socket && roomCode) {
      socket.emit('leave_room', { room_code: (roomCode as string).toUpperCase() });
    }
    disconnectSocket();
    store.resetGame();
    router.replace('/'); 
  };

  const question = store.questions[0];

  return (
    <View className="flex-1 bg-slate-950">
      <Modal transparent visible={showExitConfirm} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center p-4">
          <View className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <View className="flex-row items-center gap-3">
              <AlertTriangle size={24} color="#facc15" />
              <Text className="text-xl font-bold text-yellow-400">Leave Battle?</Text>
            </View>
            <Text className="text-slate-400">{phase === 'finished' ? "Return to lobby? Your results have been saved." : "Leaving forfeits the active battle ranking metrics completely."}</Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 items-center">
                <Text className="font-medium text-white">Stay</Text>
              </Pressable>
              <Pressable onPress={handleExit} className="flex-1 py-3 rounded-xl bg-red-600 flex-row items-center justify-center gap-2">
                <LogOut size={16} color="#fff" />
                <Text className="font-medium text-white">Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <Swords size={20} color="#818cf8" />
            <Text className="font-semibold text-slate-300">Room: {roomCode}</Text>
          </View>
          <Pressable onPress={() => setShowExitConfirm(true)} className="flex-row items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
            <LogOut size={16} color="#94a3b8" />
            <Text className="text-white text-sm">Exit</Text>
          </Pressable>
        </View>

        {/* Use Native Modals or conditional Views for the rest of the game phases (Playing, Leaderboard, Finished) using the same View mappings from Practice mode. */}
      </ScrollView>
    </View>
  );
}