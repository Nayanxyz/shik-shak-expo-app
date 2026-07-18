import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getSocket, disconnectSocket } from '../../../lib/socket';
import { useGameStore } from '../../../store/gameStore';
import { useAuthStore } from '../../../store/authStore';
import MathHtml from '../../../components/MathHtml';

export default function BattleGameScreen() {
  const { roomCode } = useLocalSearchParams();
  const store = useGameStore();
  const authUser = useAuthStore((s) => s.user);

  const [phase, setPhase] = useState<'waiting' | 'playing' | 'results' | 'leaderboard' | 'finished'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [nextQuestionIn, setNextQuestionIn] = useState(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [forfeitMessage, setForfeitMessage] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const nextQuestionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenersAttached = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    socket.on('question_start', (data: any) => {
      setCurrentQuestion(data);
      setPhase('playing');
      setSelectedOption(null);
      setHasAnswered(false);
      setAnswerResult(null);
      setTimeLeft(data.time_limit);
      startTimeRef.current = Date.now();
    });

    socket.on('timer_tick', (data: any) => {
      setTimeLeft(data.remaining);
    });

    socket.on('question_results', (data: any) => {
      setPhase('results');
      setAnswerResult(data);
    });

    socket.on('leaderboard', (data: any) => {
      setPhase('leaderboard');
      setLeaderboard(data.rankings);
      setNextQuestionIn(data.next_question_in);
      
      let ticks = data.next_question_in;
      if (nextQuestionTimerRef.current) clearInterval(nextQuestionTimerRef.current);
      nextQuestionTimerRef.current = setInterval(() => {
        ticks -= 1;
        setNextQuestionIn(ticks);
        if (ticks <= 0) {
          if (nextQuestionTimerRef.current) clearInterval(nextQuestionTimerRef.current);
        }
      }, 1000);
    });

    socket.on('game_over', (data: any) => {
      setPhase('finished');
      // Push final rankings to Zustand store so the Results screen can read them
      useGameStore.setState({ finalRankings: data.final_rankings });
      
      setTimeout(() => {
        router.replace(`/battle/results/${roomCode}`);
      }, 2000);
    });

    socket.on('room_forfeited', (data: any) => {
      setForfeitMessage(data.message);
    });

    return () => {
      socket.off('question_start');
      socket.off('timer_tick');
      socket.off('question_results');
      socket.off('leaderboard');
      socket.off('game_over');
      socket.off('room_forfeited');
      if (nextQuestionTimerRef.current) clearInterval(nextQuestionTimerRef.current);
      listenersAttached.current = false;
    };
  }, [roomCode]);

  const submitAnswer = (optionId: string) => {
    if (hasAnswered || phase !== 'playing') return;
    
    setSelectedOption(optionId);
    setHasAnswered(true);

    const timeTaken = Date.now() - startTimeRef.current;
    const socket = getSocket();
    
    socket.emit('submit_answer', {
      room_code: roomCode,
      question_number: currentQuestion?.question_number,
      selected_option: optionId,
      time_taken_ms: timeTaken
    });
  };

  const handleExit = () => {
    const socket = getSocket();
    if (socket && roomCode) {
      socket.emit('leave_room', { room_code: (roomCode as string).toUpperCase() });
    }
    disconnectSocket();
    store.resetGame();
    router.replace('/'); 
  };

  const forfeitAndExit = () => {
    disconnectSocket();
    store.resetGame();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-slate-950">
      
      {/* Forfeit Modal */}
      <Modal transparent visible={!!forfeitMessage} animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm items-center">
            <Text className="text-4xl mb-4">⚠️</Text>
            <Text className="text-xl font-bold text-red-400 mb-2">Battle Forfeited</Text>
            <Text className="text-slate-300 text-center mb-6">{forfeitMessage}</Text>
            <Pressable onPress={forfeitAndExit} className="w-full py-4 rounded-xl bg-slate-800 items-center">
              <Text className="text-white font-medium">Return Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Exit Modal */}
      <Modal transparent visible={showExitConfirm} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center p-4">
          <View className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">⚠️</Text>
              <Text className="text-xl font-bold text-yellow-400">Leave Battle?</Text>
            </View>
            <Text className="text-slate-400">{phase === 'finished' ? "Return to lobby? Your results have been saved." : "Leaving forfeits the active battle ranking metrics completely."}</Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 items-center">
                <Text className="font-medium text-white">Stay</Text>
              </Pressable>
              <Pressable onPress={handleExit} className="flex-1 py-3 rounded-xl bg-red-600 flex-row items-center justify-center gap-2">
                <Text className="text-white text-lg">🚪</Text>
                <Text className="font-medium text-white">Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <Text className="text-xl">⚔️</Text>
            <Text className="font-semibold text-slate-300">Room: {roomCode}</Text>
          </View>
          <Pressable onPress={() => setShowExitConfirm(true)} className="flex-row items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
            <Text className="text-lg">🚪</Text>
            <Text className="text-white text-sm">Exit</Text>
          </Pressable>
        </View>

        {phase === 'waiting' && (
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-5xl mb-4">⌛</Text>
            <Text className="text-xl text-white font-bold">Waiting for host to start...</Text>
          </View>
        )}

        {/* --- PLAYING PHASE --- */}
        {phase === 'playing' && currentQuestion && (
          <View className="space-y-6">
            <View className="flex-row justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <View>
                <Text className="text-slate-400 text-sm">Question</Text>
                <Text className="text-white font-bold text-xl">{currentQuestion.question_number} / {currentQuestion.total_questions}</Text>
              </View>
              <View className="w-14 h-14 rounded-full bg-slate-800 border-4 border-indigo-500 items-center justify-center">
                <Text className="text-white font-bold text-xl">{timeLeft}</Text>
              </View>
            </View>

            <View className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <MathHtml html={currentQuestion.question_text} />
            </View>

            <View className="gap-3">
              {currentQuestion.options?.map((opt: any) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => submitAnswer(opt.id)}
                    disabled={hasAnswered}
                    className={`p-4 rounded-xl border flex-row items-center gap-4 ${
                      isSelected ? 'bg-indigo-600/30 border-indigo-500' : 'bg-slate-900 border-slate-800'
                    } ${hasAnswered && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isSelected ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                      <Text className="text-white font-bold">{opt.id}</Text>
                    </View>
                    <View className="flex-1">
                      <MathHtml html={opt.text} />
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {hasAnswered && (
              <View className="p-4 bg-slate-800 rounded-xl items-center mt-4">
                <Text className="text-white">Waiting for other players...</Text>
              </View>
            )}
          </View>
        )}

        {/* --- RESULTS PHASE --- */}
        {phase === 'results' && answerResult && currentQuestion && (
          <View className="space-y-6">
            <Text className="text-2xl font-bold text-white text-center mb-4">Round Results</Text>
            
            <View className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <Text className="text-slate-400 mb-2">Question:</Text>
              <MathHtml html={currentQuestion.question_text} />
            </View>

            <View className="bg-slate-800 p-6 rounded-2xl border border-green-500/50">
              <Text className="text-green-400 font-bold mb-2">Correct Answer ({answerResult.correct_option}):</Text>
              <MathHtml html={currentQuestion.options.find((o: any) => o.id === answerResult.correct_option)?.text || ''} />
              <View className="mt-4 pt-4 border-t border-slate-700">
                <Text className="text-slate-300 font-bold mb-2">Explanation:</Text>
                <MathHtml html={answerResult.explanation} />
              </View>
            </View>

            <View className="gap-2 mt-4">
              <Text className="text-slate-400 uppercase font-semibold text-xs ml-2">Player Performance</Text>
              {answerResult.player_results?.map((p: any, i: number) => (
                <View key={i} className={`flex-row justify-between p-4 rounded-xl border ${p.is_correct ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg">{p.is_correct ? '✅' : '❌'}</Text>
                    <Text className="text-white font-medium">{p.name}</Text>
                  </View>
                  <Text className={p.is_correct ? 'text-green-400' : 'text-slate-400'}>
                    {p.score_gained > 0 ? `+${p.score_gained}` : p.score_gained} pts
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* --- LEADERBOARD PHASE --- */}
        {phase === 'leaderboard' && (
          <View className="space-y-4">
            <View className="items-center mb-6">
              <Text className="text-4xl mb-2">🏆</Text>
              <Text className="text-2xl font-bold text-white">Current Standings</Text>
              <Text className="text-indigo-400 mt-2">Next question in {nextQuestionIn}s...</Text>
            </View>

            <View className="gap-3">
              {leaderboard.map((p: any, i: number) => (
                <View key={p.user_id} className={`flex-row items-center justify-between p-4 rounded-xl border ${i === 0 ? 'bg-yellow-900/30 border-yellow-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <View className="flex-row items-center gap-4">
                    <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center">
                      <Text className="text-white font-bold">{p.rank}</Text>
                    </View>
                    <View>
                      <Text className="text-white font-bold text-lg">{p.name}</Text>
                      <View className="flex-row gap-2">
                         <Text className="text-slate-400 text-xs">🔥 Streak {p.max_streak}</Text>
                         <Text className="text-slate-400 text-xs">🎯 {p.accuracy}%</Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-indigo-400">{p.total_score}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}