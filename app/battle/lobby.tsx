import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Swords, Users, Clock, Plus, LogIn, Copy, Check, LogOut, Crown, UserX, RefreshCw, AlertCircle, Zap, BookOpen, Dices, Minus } from 'lucide-react-native';
import { getSocket, disconnectSocket } from '../../lib/socket';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const;
const DIFFICULTIES = ['LOW', 'HIGH'] as const;

// (Keep your MASTER_CHAPTER_DATABASE exactly as it is in your web code)
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
  const chapters = MASTER_CHAPTER_DATABASE[subject] || [];
  if (chapters.length < count) return [];
  const shuffled = [...chapters].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(c => c.id);
}

export default function BattleLobbyScreen() {
  const store = useGameStore();
  const authUser = useAuthStore((s) => s.user);

  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [subject, setSubject] = useState('MATH');
  const [difficulty, setDifficulty] = useState('LOW');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [playerName, setPlayerName] = useState(authUser?.username || '');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const listenersAttached = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    socket.on('room_created', (data: any) => {
      store.setRoom(data);
      store.setConnected(true);
      setIsConnecting(false);
    });

    socket.on('questions_ready', () => setQuestionsReady(true));

    socket.on('room_joined', (data: any) => {
      store.setRoom(data);
      store.setConnected(true);
      setIsConnecting(false);
    });

    socket.on('player_joined', (data: any) => store.setPlayers(data.players));
    
    socket.on('player_left', (data: any) => {
      store.setPlayers(data.players);
      setPopupMessage("A player has left the room.");
    });

    socket.on('player_left_notification', (data: any) => setPopupMessage(data.message));

    socket.on('kicked', () => {
      store.setRoom(null);
      store.setPlayers([]);
      store.setConnected(false);
      setError('You were kicked from the room');
    });

    socket.on('left_room', () => {
      store.setRoom(null);
      store.setPlayers([]);
      store.setConnected(false);
    });

    socket.on('game_starting', (data: any) => {
      router.push(`/battle/game/${data.room_code}`);
    });

    socket.on('error', (data: any) => {
      setError(data.message);
      setIsConnecting(false);
    });

    socket.on('room_forfeited', (data: any) => {
      setPopupMessage(data.message);
      disconnectSocket();
      store.setRoom(null); 
      store.resetGame();
      router.replace('/');
    });

    socket.on('connect', () => setDisconnected(false));
    socket.on('disconnect', () => setDisconnected(true));

    if (socket.connected) setDisconnected(false);

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('questions_ready');
      socket.off('kicked');
      socket.off('left_room');
      socket.off('game_starting');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_forfeited');
      listenersAttached.current = false;
    }
  }, []);

  useEffect(() => {
    if (!store.roomCode) {
      setMode('menu');
      setSelectedChapters([]);
      setJoinCode('');
      setError('');
      setQuestionsReady(false);
    }
  }, [store.roomCode]);

  const toggleChapter = (id: string) => {
    setSelectedChapters(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const createRoom = () => {
    if (selectedChapters.length !== 5 || !playerName.trim()) return;
    setIsConnecting(true);
    setError('');
    setQuestionsReady(false);

    const socket = getSocket();
    const chapterMix = selectedChapters.map(id => {
      const ch = MASTER_CHAPTER_DATABASE[subject]?.find(c => c.id === id);
      return { id, name: ch?.name || id };
    });

    socket.emit('create_room', {
      subject,
      difficulty,
      chapter_mix: chapterMix,
      player_name: playerName.trim(),
      max_players: maxPlayers,
      time_per_question: timePerQuestion,
      user_id: authUser?.id || `guest_${Math.random().toString(36).slice(2, 10)}`
    });
  };

  const joinRoom = () => {
    if (!joinCode.trim() || !playerName.trim()) return;
    setIsConnecting(true);
    setError('');

    const socket = getSocket();
    socket.emit('join_room', {
      room_code: joinCode.trim().toUpperCase(),
      player_name: playerName.trim(),
      user_id: authUser?.id
    });
  };

  const leaveRoom = () => {
    const socket = getSocket();
    if (socket && store.roomCode) {
      socket.emit('leave_room', { room_code: store.roomCode });
    }
    disconnectSocket();
    store.setRoom(null); 
    store.resetGame();
    setShowExitConfirm(false);
    router.replace('/'); 
  };

  const kickPlayer = (targetSid: string) => {
    const socket = getSocket();
    if (socket && store.isHost) {
      socket.emit('kick_player', { target_sid: targetSid });
    }
  };

  const copyCode = async () => {
    if (store.roomCode) {
      await Clipboard.setStringAsync(store.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startGame = () => {
    const socket = getSocket();
    if (socket && store.isHost && store.roomCode) {
      socket.emit('start_game', { room_code: store.roomCode });
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      
      {/* Exit Modal */}
      <Modal transparent visible={showExitConfirm} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center p-4">
          <View className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <View className="flex-row items-center gap-3">
              <AlertCircle size={24} color="#facc15" />
              <Text className="text-xl font-bold text-yellow-400">Leave Room?</Text>
            </View>
            <Text className="text-slate-400">If you leave now, you'll exit the room and lose your spot.</Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 active:bg-slate-700 items-center">
                <Text className="text-white font-medium">Stay</Text>
              </Pressable>
              <Pressable onPress={leaveRoom} className="flex-1 py-3 rounded-xl bg-red-600 active:bg-red-500 items-center justify-center flex-row gap-2">
                <LogOut size={16} color="#ffffff" />
                <Text className="text-white font-medium">Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notice Modal */}
      <Modal transparent visible={!!popupMessage} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center p-4">
          <View className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4 items-center">
            <View className="w-12 h-12 rounded-full bg-yellow-500/20 items-center justify-center mb-2">
              <AlertCircle size={24} color="#facc15" />
            </View>
            <Text className="text-xl font-bold text-white">Notice</Text>
            <Text className="text-slate-400 text-center">{popupMessage}</Text>
            <Pressable onPress={() => setPopupMessage('')} className="w-full py-3 mt-4 rounded-xl bg-slate-800 active:bg-slate-700 items-center">
              <Text className="text-white font-medium">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-white mb-2">Battle Arena</Text>
          <Text className="text-slate-400">Create a room or join an existing battle</Text>
          {disconnected && (
            <View className="mt-4 flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#facc15" />
              <Text className="text-yellow-400 text-sm">Reconnecting to server...</Text>
            </View>
          )}
        </View>

        {mode === 'menu' && !store.roomCode && (
          <View className="gap-6">
            <Pressable onPress={() => setMode('create')} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 active:border-indigo-500/50">
              <View className="w-14 h-14 rounded-xl bg-indigo-500/20 items-center justify-center mb-4">
                <Plus size={28} color="#818cf8" />
              </View>
              <Text className="text-xl font-bold text-white mb-2">Create Room</Text>
              <Text className="text-slate-400">Host a new battle and invite friends</Text>
            </Pressable>
            
            <Pressable onPress={() => setMode('join')} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 active:border-purple-500/50">
              <View className="w-14 h-14 rounded-xl bg-purple-500/20 items-center justify-center mb-4">
                <LogIn size={28} color="#c084fc" />
              </View>
              <Text className="text-xl font-bold text-white mb-2">Join Room</Text>
              <Text className="text-slate-400">Enter a room code to join a battle</Text>
            </Pressable>
          </View>
        )}

        {mode === 'create' && !store.roomCode && (
          <View className="space-y-6">
            <Pressable onPress={() => setMode('menu')} className="mb-4">
              <Text className="text-slate-400">← Back</Text>
            </Pressable>
            
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Your Name</Text>
              <TextInput 
                value={playerName} 
                onChangeText={setPlayerName} 
                placeholder="Enter your name" 
                placeholderTextColor="#64748b"
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white" 
              />
            </View>

            {/* Subject and Difficulty Grids... (Same mapping logic as Practice, omitted for brevity but they are standard flex-row flex-wrap mappings) */}
            
