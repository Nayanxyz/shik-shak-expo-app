import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
// 🚨 Lucide completely removed to protect the Android SVG engine
import { apiFetch } from '../../lib/api';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  // Ensure we safely extract the ID if Expo Router passes it as an array
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.replace('/practice');
      return;
    }
    
    const fetchResults = async () => {
      try {
        const data = await apiFetch(`/api/v1/practice/${sessionId}/results`);
        setResults(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [sessionId]);

