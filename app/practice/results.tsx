import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Trophy, Target, CheckCircle, XCircle, RotateCcw, ArrowRight, Zap, TrendingUp } from 'lucide-react-native';
import { apiFetch } from '../../lib/api';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  // Ensure we safely extract the ID if Expo Router passes it as an array
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  
