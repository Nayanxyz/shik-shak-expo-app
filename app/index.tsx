import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

// 🚨 Lucide completely removed to protect the Android SVG engine

const features = [
  { icon: <Text className="text-2xl">🧠</Text>, title: 'AI-Powered Questions', desc: 'Groq LLM generates fresh JEE/NEET MCQs every time' },
  { icon: <Text className="text-2xl">🎯</Text>, title: 'Smart Validation', desc: 'Math/Physics checked with SymPy, Chemistry with PubChem' },
  { icon: <Text className="text-2xl">👥</Text>, title: 'Live Battles', desc: 'Compete with up to 4 players in real-time' },
  { icon: <Text className="text-2xl">⏱️</Text>, title: 'Time Bonuses', desc: 'Answer fast for extra points — speed matters!' },
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
        
        {/* Hero Section */}
        <View className="items-center pt-8 pb-4 px-4">
          <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Text className="text-sm">✨</Text>
            <Text className="text-indigo-300 text-sm">Powered by Nayanxyz</Text>
          </View>
          
          <Text className="text-5xl font-bold text-center text-white mb-6">
            The Ultimate Arena
          </Text>
          
          <Text className="text-lg text-center text-slate-400 mb-10 leading-relaxed">
            Practice solo or battle friends with AI-generated JEE/NEET questions.
          </Text>
          
          <View className="w-full gap-4">
            <Pressable
              onPress={() => router.push('/practice')}
              className="flex-row items-center justify-center gap-2 px-8 py-4 bg-indigo-600 active:bg-indigo-500 rounded-xl"
            >
              <Text className="text-xl">🧠</Text>
              <Text className="font-semibold text-lg text-white">Start Practice</Text>
            </Pressable>
            
            <Pressable
              onPress={() => router.push('/battle/lobby')}
              className="flex-row items-center justify-center gap-2 px-8 py-4 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl"
            >
              <Text className="text-xl">⚔️</Text>
              <Text className="font-semibold text-lg text-white">Battle Arena</Text>
            </Pressable>
          </View>
        </View>

        {/* Subjects */}
        <View className="px-4">
          <Text className="text-2xl font-bold text-center text-white mb-6">Choose Your Subject</Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {subjects.map((s) => (
              <Pressable
                key={s.name}
                onPress={() => router.push({ pathname: '/practice', params: { subject: s.id } })}
                className={`w-[48%] p-5 rounded-2xl border border-white/10 active:border-white/20 ${s.bg}`}
              >
                <View className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center mb-4">
                  <Text className={`text-2xl ${s.iconColor}`}>{s.icon}</Text>
                </View>
                <Text className="font-bold text-lg text-white">{s.name}</Text>
                <Text className="text-slate-400 text-xs mt-1">JEE/NEET level</Text>
                <View className="mt-4">
                  <Text className="text-lg">▶️</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Features */}
        <View className="px-4 gap-4">
          {features.map((f) => (
            <View
              key={f.title}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
              <View className="w-10 h-10 rounded-lg bg-indigo-500/20 items-center justify-center mb-4">
                {f.icon}
              </View>
              <Text className="font-semibold text-white mb-2">{f.title}</Text>
              <Text className="text-slate-400 text-sm leading-relaxed">{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Stats Banner */}
        <View className="mx-4 py-8 px-6 rounded-2xl bg-indigo-950 border border-indigo-500/20">
          <View className="flex-row flex-wrap justify-between gap-y-8">
            {[
              { label: 'Questions Generated', value: '∞', sub: 'AI-powered' },
              { label: 'Subjects', value: '4', sub: 'Math, Physics, Chem, Bio' },
              { label: 'Battle Players', value: '4', sub: 'Max per room' },
              { label: 'Time Limit', value: '60s', sub: 'Per question' },
            ].map((stat) => (
              <View key={stat.label} className="w-[45%] items-center text-center">
                <Text className="text-3xl font-bold text-indigo-300">{stat.value}</Text>
                <Text className="text-sm font-medium text-white mt-1 text-center">{stat.label}</Text>
                <Text className="text-xs text-slate-400 text-center">{stat.sub}</Text>
              </View>
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}