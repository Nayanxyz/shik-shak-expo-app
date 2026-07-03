import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Brain, Swords, Target, Users, Clock, ChevronRight, Sparkles } from 'lucide-react-native';

const features = [
  { icon: <Brain size={24} color="#818cf8" />, title: 'AI-Powered Questions', desc: 'Groq LLM generates fresh JEE/NEET MCQs every time' },
  { icon: <Target size={24} color="#818cf8" />, title: 'Smart Validation', desc: 'Math/Physics checked with SymPy, Chemistry with PubChem' },
  { icon: <Users size={24} color="#818cf8" />, title: 'Live Battles', desc: 'Compete with up to 4 players in real-time' },
  { icon: <Clock size={24} color="#818cf8" />, title: 'Time Bonuses', desc: 'Answer fast for extra points — speed matters!' },
];

const subjects = [
  { id: 'MATH', name: 'Mathematics', icon: '∫', bg: 'bg-cyan-950/50', iconColor: 'text-cyan-400' },
  { id: 'PHYSICS', name: 'Physics', icon: '⚡', bg: 'bg-orange-950/50', iconColor: 'text-orange-400' },
  { id: 'CHEMISTRY', name: 'Chemistry', icon: '⚗️', bg: 'bg-emerald-950/50', iconColor: 'text-emerald-400' },
  { id: 'BIOLOGY', name: 'Biology', icon: '🧬', bg: 'bg-rose-950/50', iconColor: 'text-rose-400' },
];

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="space-y-12">
        
        {/* Hero */}
        <View className="items-center py-12 px-4">
          <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Sparkles size={16} color="#a5b4fc" />
            <Text className="text-indigo-300 text-sm">Powered by Nayanxyz</Text>
          </View>
          
          <Text className="text-5xl font-bold text-center text-indigo-400 mb-6">
            Shik-Shak Arena
          </Text>
          
          <Text className="text-lg text-center text-slate-400 mb-10 leading-relaxed">
            The ultimate competitive exam battleground. Practice solo or battle friends with AI-generated JEE/NEET questions.
          </Text>
          
          <View className="w-full gap-4">
            <Pressable
              onPress={() => router.push('/practice')}
              className="flex-row items-center justify-center gap-2 px-8 py-4 bg-indigo-600 active:bg-indigo-500 rounded-xl"
            >
              <Brain size={20} color="#ffffff" />
              <Text className="font-semibold text-lg text-white">Start Practice</Text>
            </Pressable>
            
            <Pressable
              onPress={() => router.push('/battle/lobby')}
              className="flex-row items-center justify-center gap-2 px-8 py-4 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl"
            >
              <Swords size={20} color="#ffffff" />
              <Text className="font-semibold text-lg text-white">Battle Arena</Text>
            </Pressable>
          </View>
        </View>

