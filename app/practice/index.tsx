import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Brain, Clock, CheckCircle, XCircle, ArrowRight, BookOpen, Dices, Zap, LogOut, AlertCircle } from 'lucide-react-native';
import MathHtml from '../../components/MathHtml';
import { apiFetch } from '../../lib/api';

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const;
const DIFFICULTIES = ['LOW', 'HIGH'] as const;

// (Keep your MASTER_CHAPTER_DATABASE exactly as it is here)
const MASTER_CHAPTER_DATABASE: Record<string, { id: string; name: string }[]> = {
  MATH: [
    {"id": "M1101", "name": "Sets, Relations and Functions"},
    {"id": "M1102", "name": "Trigonometric Functions"},
    {"id": "M1103", "name": "Complex Numbers and Quadratic Equations"},
    {"id": "M1104", "name": "Linear Inequalities"},
    {"id": "M1105", "name": "Permutations and Combinations"},
    {"id": "M1106", "name": "Binomial Theorem"},
    {"id": "M1107", "name": "Sequences and Series"},
    {"id": "M1108", "name": "Straight Lines"},
    {"id": "M1109", "name": "Conic Sections"},
    {"id": "M1110", "name": "Introduction to Three-Dimensional Geometry"},
    {"id": "M1111", "name": "Limits and Derivatives"},
    {"id": "M1112", "name": "Statistics and Probability"},
    {"id": "M1201", "name": "Inverse Trigonometric Functions"},
    {"id": "M1202", "name": "Matrices and Determinants"},
    {"id": "M1203", "name": "Continuity and Differentiability"},
    {"id": "M1204", "name": "Application of Derivatives"},
    {"id": "M1205", "name": "Integrals (Definite and Indefinite)"},
    {"id": "M1206", "name": "Application of Integrals"},
    {"id": "M1207", "name": "Differential Equations"},
    {"id": "M1208", "name": "Vector Algebra"},
    {"id": "M1209", "name": "Three-Dimensional Geometry (Vectors)"},
    {"id": "M1210", "name": "Linear Programming"},
    {"id": "M1211", "name": "Probability (Advanced)"}
  ],
  PHYSICS: [
    {"id": "P1101", "name": "Units and Measurements"},
    {"id": "P1102", "name": "Motion in a Straight Line"},
    {"id": "P1103", "name": "Motion in a Plane (Vectors & Projectiles)"},
    {"id": "P1104", "name": "Laws of Motion and Friction"},
    {"id": "P1105", "name": "Work, Energy and Power"},
    {"id": "P1106", "name": "System of Particles and Rotational Motion"},
    {"id": "P1107", "name": "Gravitation"},
    {"id": "P1108", "name": "Mechanical Properties of Solids"},
    {"id": "P1109", "name": "Mechanical Properties of Fluids"},
    {"id": "P1110", "name": "Thermal Properties of Matter"},
    {"id": "P1111", "name": "Thermodynamics"},
    {"id": "P1112", "name": "Kinetic Theory of Gases"},
    {"id": "P1113", "name": "Oscillations (SHM)"},
    {"id": "P1114", "name": "Waves and Acoustics"},
    {"id": "P1201", "name": "Electric Charges and Fields"},
    {"id": "P1202", "name": "Electrostatic Potential and Capacitance"},
    {"id": "P1203", "name": "Current Electricity"},
    {"id": "P1204", "name": "Moving Charges and Magnetism"},
    {"id": "P1205", "name": "Magnetism and Matter"},
    {"id": "P1206", "name": "Electromagnetic Induction"},
    {"id": "P1207", "name": "Alternating Current"},
    {"id": "P1208", "name": "Electromagnetic Waves"},
    {"id": "P1209", "name": "Ray Optics and Optical Instruments"},
    {"id": "P1210", "name": "Wave Optics (Interference & Diffraction)"},
    {"id": "P1211", "name": "Dual Nature of Radiation and Matter"},
    {"id": "P1212", "name": "Atoms and Nuclei"},
    {"id": "P1213", "name": "Semiconductor Electronics: Materials and Devices"}
  ],
  CHEMISTRY: [
    {"id": "C1101", "name": "Some Basic Concepts of Chemistry (Mole Concept)"},
    {"id": "C1102", "name": "Structure of Atom"},
    {"id": "C1103", "name": "Classification of Elements and Periodicity"},
    {"id": "C1104", "name": "Chemical Bonding and Molecular Structure"},
    {"id": "C1105", "name": "Chemical Thermodynamics"},
    {"id": "C1106", "name": "Equilibrium (Chemical and Ionic)"},
    {"id": "C1107", "name": "Redox Reactions"},
    {"id": "C1108", "name": "Organic Chemistry: Some Basic Principles and Techniques (GOC)"},
    {"id": "C1109", "name": "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)"},
    {"id": "C1201", "name": "Solutions"},
    {"id": "C1202", "name": "Electrochemistry"},
    {"id": "C1203", "name": "Chemical Kinetics"},
    {"id": "C1204", "name": "The d- and f-Block Elements"},
    {"id": "C1205", "name": "Coordination Compounds"},
    {"id": "C1206", "name": "Haloalkanes and Haloarenes"},
    {"id": "C1207", "name": "Alcohols, Phenols and Ethers"},
    {"id": "C1208", "name": "Aldehydes, Ketones and Carboxylic Acids"},
    {"id": "C1209", "name": "Amines (Organic Compounds Containing Nitrogen)"},
    {"id": "C1210", "name": "Biomolecules"}
  ],
  BIOLOGY: [
    {"id": "B1101", "name": "The Living World and Biological Classification"},
    {"id": "B1102", "name": "Plant Kingdom"},
    {"id": "B1103", "name": "Animal Kingdom"},
    {"id": "B1104", "name": "Morphology and Anatomy of Flowering Plants"},
    {"id": "B1105", "name": "Structural Organisation in Animals"},
    {"id": "B1106", "name": "Cell: The Unit of Life"},
    {"id": "B1107", "name": "Biomolecules (Biological aspect)"},
    {"id": "B1108", "name": "Cell Cycle and Cell Division"},
    {"id": "B1109", "name": "Photosynthesis in Higher Plants"},
    {"id": "B1110", "name": "Respiration in Plants"},
    {"id": "B1111", "name": "Plant Growth and Development"},
    {"id": "B1112", "name": "Breathing and Exchange of Gases"},
    {"id": "B1113", "name": "Body Fluids and Circulation"},
    {"id": "B1114", "name": "Excretory Products and their Elimination"},
    {"id": "B1115", "name": "Locomotion and Movement"},
    {"id": "B1116", "name": "Neural Control and Coordination"},
    {"id": "B1117", "name": "Chemical Coordination and Integration"},
    {"id": "B1201", "name": "Sexual Reproduction in Flowering Plants"},
    {"id": "B1202", "name": "Human Reproduction and Reproductive Health"},
    {"id": "B1203", "name": "Principles of Inheritance and Variation (Genetics I)"},
    {"id": "B1204", "name": "Molecular Basis of Inheritance (Genetics II)"},
    {"id": "B1205", "name": "Evolution"},
    {"id": "B1206", "name": "Human Health and Disease"},
    {"id": "B1207", "name": "Microbes in Human Welfare"},
    {"id": "B1208", "name": "Biotechnology: Principles and Processes"},
    {"id": "B1209", "name": "Biotechnology and its Applications"},
    {"id": "B1210", "name": "Organisms and Populations"},
    {"id": "B1211", "name": "Ecosystem"},
    {"id": "B1212", "name": "Biodiversity and Conservation"}
  ]
};

function getRandomChapters(subject: string, count: number = 5): string[] {
  const chapters = MASTER_CHAPTER_DATABASE[subject];
  if (!chapters || chapters.length < count) return [];
  return [...chapters].sort(() => Math.random() - 0.5).slice(0, count).map(c => c.id);
}

export default function PracticeScreen() {
  const params = useLocalSearchParams();
  // Safe extraction of params in case they are arrays
  const initialSubject = Array.isArray(params.subject) ? params.subject[0] : params.subject;

  const [step, setStep] = useState<'select' | 'loading' | 'playing'>('select');
  const [subject, setSubject] = useState<string>(initialSubject || 'MATH');
  const [difficulty, setDifficulty] = useState<string>('LOW');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const timerActiveRef = useRef(false);

  const handleSubmit = useCallback(async (option: string | null) => {
    if (!session || showResult) return;
    try {
      const data = await apiFetch('/api/v1/practice/answer', {
        method: 'POST',
        body: JSON.stringify({ session_id: session.session_id, question_number: currentQ + 1, selected_option: option }),
      });
      setResult(data);
      setShowResult(true);
      timerActiveRef.current = false;
    } catch (e) {
      console.error(e);
    }
  }, [session, showResult, currentQ]);

  useEffect(() => {
    if (step !== 'playing' || showResult) {
      timerActiveRef.current = false;
      return;
    }
    if (timeRemaining <= 0) {
      timerActiveRef.current = false;
      handleSubmit(null);
      return;
    }
    if (timerActiveRef.current) return;
    timerActiveRef.current = true;
    
    // Explicitly typed as ReturnType<typeof setInterval> for RN/NodeJS compatibility
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          clearInterval(timer);
          timerActiveRef.current = false;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      timerActiveRef.current = false;
    }
  }, [step, showResult, timeRemaining, handleSubmit]);

  const toggleChapter = (id: string) => {
    setSelectedChapters(prev => prev.includes(id) ? prev.filter(c => c !== id) : (prev.length >= 5 ? prev : [...prev, id]));
  };

  const randomizeChapters = () => setSelectedChapters(getRandomChapters(subject, 5));

  const startPractice = async () => {
    if (selectedChapters.length !== 5) return;
    setStep('loading');
    setError('');
    try {
      const chapterMix = selectedChapters.map(id => ({ id, name: MASTER_CHAPTER_DATABASE[subject].find(c => c.id === id)?.name || id }));
      const data = await apiFetch('/api/v1/practice/start', {
        method: 'POST',
        body: JSON.stringify({ subject, difficulty, chapter_mix: chapterMix }),
      });
      setSession(data);
      setCurrentQ(0);
      setTimeRemaining(60);
      setSelectedOption(null);
      setShowResult(false);
      setStep('playing');
    } catch (e: any) {
      setError(e.message || "Failed to start session.");
      setStep('select');
    }
  };

  const handleLeavePractice = async () => {
    if (!session?.session_id) {
      router.replace('/');
      return;
    }
    try {
      await apiFetch('/api/v1/practice/finish', {
        method: 'POST',
        body: JSON.stringify({ session_id: session.session_id }),
      });
    } catch (e) {
      console.error("Failed to finish practice session cleanly:", e);
    } finally {
      setShowExitConfirm(false);
      router.replace('/');
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= session.total_questions) {
      // Changed to template literal format to bypass strict TS router matching issues
      router.replace(`/practice/results?sessionId=${session.session_id}`);
      return;
    }
    setCurrentQ(prev => prev + 1);
    setTimeRemaining(60);
    setSelectedOption(null);
    setShowResult(false);
    setResult(null);
  };

  const activeQuestion = session?.questions?.[currentQ];

  return (
    <View className="flex-1 bg-slate-950">
      
      {/* Native Modal for Exit Confirmation */}
      <Modal transparent visible={showExitConfirm} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center p-4">
          <View className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <View className="flex-row items-center gap-3">
              <AlertCircle size={24} color="#facc15" />
              <Text className="text-xl font-bold text-yellow-400">Leave Practice?</Text>
            </View>
            <Text className="text-slate-400">Your session will end and any unanswered questions will be skipped.</Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 items-center">
                <Text className="text-white font-medium">Stay</Text>
              </Pressable>
              <Pressable onPress={handleLeavePractice} className="flex-1 py-3 rounded-xl bg-red-600 active:bg-red-500 items-center justify-center flex-row gap-2">
                <LogOut size={16} color="#ffffff" />
                <Text className="text-white font-medium">Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {step === 'select' && (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-white mb-2">Practice Mode</Text>
            <Text className="text-slate-400 text-center">Select your subject, difficulty, and 5 chapters</Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Subject</Text>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {SUBJECTS.map(s => (
                <Pressable key={s} onPress={() => { setSubject(s); setSelectedChapters([]); }}
                  className={`w-[48%] p-4 rounded-xl border ${subject === s ? 'border-indigo-500 bg-indigo-900/50' : 'border-slate-700 bg-slate-900'}`}
                >
                  <BookOpen size={20} color={subject === s ? '#818cf8' : '#94a3b8'} />
                  <Text className={`font-semibold mt-2 ${subject === s ? 'text-indigo-300' : 'text-slate-300'}`}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Difficulty</Text>
            <View className="flex-row gap-3">
              {DIFFICULTIES.map(d => (
                <Pressable key={d} onPress={() => setDifficulty(d)}
                  className={`flex-1 p-4 rounded-xl border ${difficulty === d ? (d === 'LOW' ? 'border-green-500 bg-green-900/50' : 'border-red-500 bg-red-900/50') : 'border-slate-700 bg-slate-900'}`}
                >
                  <Zap size={20} color={difficulty === d ? (d === 'LOW' ? '#4ade80' : '#f87171') : '#94a3b8'} />
                  <Text className={`font-semibold mt-2 ${difficulty === d ? (d === 'LOW' ? 'text-green-300' : 'text-red-300') : 'text-slate-300'}`}>
                    {d === 'LOW' ? 'Foundation' : 'Advanced'}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-1">{d === 'LOW' ? '2-3 min per question' : '5-8 min per question'}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-6 flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Chapters ({selectedChapters.length}/5)</Text>
              <Pressable onPress={randomizeChapters} className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900/50 border border-indigo-500/30">
                <Dices size={16} color="#818cf8" />
                <Text className="text-indigo-300 text-sm">Random 5</Text>
              </Pressable>
            </View>
            <View className="space-y-2 gap-2">
              {MASTER_CHAPTER_DATABASE[subject].map(ch => (
                <Pressable key={ch.id} onPress={() => toggleChapter(ch.id)}
                  className={`p-4 rounded-xl border flex-row items-center ${selectedChapters.includes(ch.id) ? 'border-indigo-500 bg-indigo-900/50' : 'border-slate-700 bg-slate-900'}`}
                >
                  <View className={`w-5 h-5 rounded border items-center justify-center mr-3 ${selectedChapters.includes(ch.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                    {selectedChapters.includes(ch.id) && <Text className="text-white text-xs font-bold">✓</Text>}
                  </View>
                  <Text className={`flex-1 ${selectedChapters.includes(ch.id) ? 'text-indigo-300' : 'text-slate-300'}`}>{ch.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {error ? (
            <View className="p-4 rounded-xl bg-red-900/50 border border-red-500/20 mb-4">
              <Text className="text-red-300 text-sm">{error}</Text>
            </View>
          ) : null}

          <Pressable onPress={startPractice} disabled={selectedChapters.length !== 5}
            className={`w-full py-4 rounded-xl items-center ${selectedChapters.length === 5 ? 'bg-indigo-600 active:bg-indigo-500' : 'bg-slate-800'}`}
          >
            <Text className={`font-semibold text-lg ${selectedChapters.length === 5 ? 'text-white' : 'text-slate-500'}`}>Start Practice Session</Text>
          </Pressable>
        </ScrollView>
      )}

      {step === 'loading' && (
        <View className="flex-1 justify-center items-center px-4">
          <ActivityIndicator size="large" color="#6366f1" className="mb-6" />
          <Text className="text-xl font-semibold text-white">Generating Questions...</Text>
          <Text className="text-slate-400 mt-2 text-center">Shik Shak AI is crafting your personalized exam</Text>
        </View>
      )}

      {step === 'playing' && activeQuestion && (
        <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2">
              <Brain size={16} color="#94a3b8" />
              <Text className="text-sm text-slate-400">Q {currentQ + 1} of {session.total_questions}</Text>
            </View>
            <View className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${timeRemaining <= 10 ? 'bg-red-900/50' : 'bg-slate-800'}`}>
              <Clock size={16} color={timeRemaining <= 10 ? '#fca5a5' : '#e2e8f0'} />
              <Text className={`font-mono text-sm ${timeRemaining <= 10 ? 'text-red-300' : 'text-slate-200'}`}>{timeRemaining}s</Text>
            </View>
            <Pressable onPress={() => setShowExitConfirm(true)} className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
              <LogOut size={16} color="#94a3b8" />
            </Pressable>
          </View>
          
          <View className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
            <View className="h-full bg-indigo-500 rounded-full" style={{ width: `${((currentQ + 1) / session.total_questions) * 100}%` }} />
          </View>

          <View className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
            <MathHtml html={activeQuestion.question_text} />
          </View>

          <View className="space-y-3 mb-6 gap-3">
            {activeQuestion.options.map((opt: any) => (
              <Pressable key={opt.id} onPress={() => !showResult && setSelectedOption(opt.id)} disabled={showResult}
                className={`w-full p-4 rounded-xl border flex-row items-center ${
                  showResult 
                    ? (opt.id === result?.correct_option ? 'border-green-500 bg-green-900/30' : (opt.id === selectedOption ? 'border-red-500 bg-red-900/30' : 'border-slate-800 opacity-50')) 
                    : (selectedOption === opt.id ? 'border-indigo-500 bg-indigo-900/30' : 'border-slate-700 bg-slate-900')
                }`}
              >
                <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                  showResult 
                    ? (opt.id === result?.correct_option ? 'bg-green-500' : (opt.id === selectedOption ? 'bg-red-500' : 'bg-slate-800')) 
                    : (selectedOption === opt.id ? 'bg-indigo-500' : 'bg-slate-800')
                }`}>
                  <Text className="font-bold text-white text-sm">{opt.id}</Text>
                </View>
                <View className="flex-1 pointer-events-none">
                  <MathHtml html={opt.text} />
                </View>
              </Pressable>
            ))}
          </View>

