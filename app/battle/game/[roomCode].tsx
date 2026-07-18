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

