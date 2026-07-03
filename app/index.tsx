import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Brain, Swords, Target, Users, Clock, ChevronRight, Sparkles } from 'lucide-react-native';

const features = [
  { icon: <Brain size={24} color="#818cf8" />, title: 'AI-Powered Questions', desc: 'Groq LLM generates fresh JEE/NEET MCQs every time' },
  { icon: <Target size={24} color="#818cf8" />, title: 'Smart Validation', desc: 'Math/Physics checked with SymPy, Chemistry with PubChem' },
  { icon: <Users size={24} color="#818cf8" />, title: 'Live Battles', desc: 'Compete with up to 4 players in real-time' },
  { icon: <Clock size={24} color="#818cf8" />, title: 'Time Bonuses', desc: 'Answer fast for extra points — speed matters!' },
];

