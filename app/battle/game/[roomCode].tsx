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


