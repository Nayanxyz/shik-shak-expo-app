import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { getSocket, disconnectSocket } from '../../lib/socket';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const;
const DIFFICULTIES = ['LOW', 'HIGH'] as const;

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
    {"id": "P1103", "name": "Motion in a Plane"},
    {"id": "P1104", "name": "Laws of Motion and Friction"},
    {"id": "P1105", "name": "Work, Energy and Power"},
    {"id": "P1106", "name": "Rotational Motion"},
    {"id": "P1107", "name": "Gravitation"},
    {"id": "P1108", "name": "Properties of Solids"},
    {"id": "P1109", "name": "Properties of Fluids"},
    {"id": "P1110", "name": "Thermal Properties of Matter"},
    {"id": "P1111", "name": "Thermodynamics"},
    {"id": "P1112", "name": "Kinetic Theory of Gases"},
    {"id": "P1113", "name": "Oscillations (SHM)"},
    {"id": "P1114", "name": "Waves and Acoustics"},
    {"id": "P1201", "name": "Electric Charges and Fields"},
    {"id": "P1202", "name": "Electrostatic Potential"},
    {"id": "P1203", "name": "Current Electricity"},
    {"id": "P1204", "name": "Moving Charges and Magnetism"},
    {"id": "P1205", "name": "Magnetism and Matter"},
    {"id": "P1206", "name": "Electromagnetic Induction"},
    {"id": "P1207", "name": "Alternating Current"},
    {"id": "P1208", "name": "Electromagnetic Waves"},
    {"id": "P1209", "name": "Ray Optics"},
    {"id": "P1210", "name": "Wave Optics"},
    {"id": "P1211", "name": "Dual Nature of Radiation"},
    {"id": "P1212", "name": "Atoms and Nuclei"},
    {"id": "P1213", "name": "Semiconductor Electronics"}
  ],
  CHEMISTRY: [
    {"id": "C1101", "name": "Mole Concept"},
    {"id": "C1102", "name": "Structure of Atom"},
    {"id": "C1103", "name": "Periodicity"},
    {"id": "C1104", "name": "Chemical Bonding"},
    {"id": "C1105", "name": "Chemical Thermodynamics"},
    {"id": "C1106", "name": "Equilibrium"},
    {"id": "C1107", "name": "Redox Reactions"},
    {"id": "C1108", "name": "Organic Chemistry (GOC)"},
    {"id": "C1109", "name": "Hydrocarbons"},
    {"id": "C1201", "name": "Solutions"},
    {"id": "C1202", "name": "Electrochemistry"},
    {"id": "C1203", "name": "Chemical Kinetics"},
    {"id": "C1204", "name": "The d- and f-Block Elements"},
    {"id": "C1205", "name": "Coordination Compounds"},
    {"id": "C1206", "name": "Haloalkanes and Haloarenes"},
    {"id": "C1207", "name": "Alcohols, Phenols and Ethers"},
    {"id": "C1208", "name": "Aldehydes, Ketones"},
    {"id": "C1209", "name": "Amines"},
    {"id": "C1210", "name": "Biomolecules"}
  ],
  BIOLOGY: [
    {"id": "B1101", "name": "Living World and Classification"},
    {"id": "B1102", "name": "Plant Kingdom"},
    {"id": "B1103", "name": "Animal Kingdom"},
    {"id": "B1104", "name": "Morphology of Flowering Plants"},
    {"id": "B1105", "name": "Structural Organisation in Animals"},
    {"id": "B1106", "name": "Cell: The Unit of Life"},
    {"id": "B1107", "name": "Biomolecules"},
    {"id": "B1108", "name": "Cell Cycle and Division"},
    {"id": "B1109", "name": "Photosynthesis"},
    {"id": "B1110", "name": "Respiration in Plants"},
    {"id": "B1111", "name": "Plant Growth"},
    {"id": "B1112", "name": "Breathing and Exchange of Gases"},
    {"id": "B1113", "name": "Body Fluids and Circulation"},
    {"id": "B1114", "name": "Excretory Products"},
    {"id": "B1115", "name": "Locomotion and Movement"},
    {"id": "B1116", "name": "Neural Control"},
    {"id": "B1117", "name": "Chemical Coordination"},
    {"id": "B1201", "name": "Sexual Reproduction in Plants"},
    {"id": "B1202", "name": "Human Reproduction"},
    {"id": "B1203", "name": "Genetics I"},
    {"id": "B1204", "name": "Genetics II"},
    {"id": "B1205", "name": "Evolution"},
    {"id": "B1206", "name": "Human Health and Disease"},
    {"id": "B1207", "name": "Microbes in Human Welfare"},
    {"id": "B1208", "name": "Biotechnology Principles"},
    {"id": "B1209", "name": "Biotechnology Applications"},
    {"id": "B1210", "name": "Organisms and Populations"},
    {"id": "B1211", "name": "Ecosystem"},
    {"id": "B1212", "name": "Biodiversity"}
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

    // 🚨 Add this missing listener!
    socket.on('player_kicked', (data: any) => {
      store.setPlayers(data.players);
      // Optional: Show a quick popup to the host that it worked
      setPopupMessage("Player was removed from the room.");
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
      socket.off('player_kicked');
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
              <Text className="text-2xl">⚠️</Text>
              <Text className="text-xl font-bold text-yellow-400">Leave Room?</Text>
            </View>
            <Text className="text-slate-400">If you leave now, you'll exit the room and lose your spot.</Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 active:bg-slate-700 items-center">
                <Text className="text-white font-medium">Stay</Text>
              </Pressable>
              <Pressable onPress={leaveRoom} className="flex-1 py-3 rounded-xl bg-red-600 active:bg-red-500 items-center justify-center flex-row gap-2">
                <Text className="text-white">🚪</Text>
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
              <Text className="text-2xl">⚠️</Text>
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

        {/* 1. MAIN MENU */}
        {mode === 'menu' && !store.roomCode && (
          <View className="gap-6">
            <Pressable onPress={() => setMode('create')} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 active:border-indigo-500/50">
              <View className="w-14 h-14 rounded-xl bg-indigo-500/20 items-center justify-center mb-4">
                <Text className="text-3xl">➕</Text>
              </View>
              <Text className="text-xl font-bold text-white mb-2">Create Room</Text>
              <Text className="text-slate-400">Host a new battle and invite friends</Text>
            </Pressable>
            
            <Pressable onPress={() => setMode('join')} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 active:border-purple-500/50">
              <View className="w-14 h-14 rounded-xl bg-purple-500/20 items-center justify-center mb-4">
                <Text className="text-3xl">🔑</Text>
              </View>
              <Text className="text-xl font-bold text-white mb-2">Join Room</Text>
              <Text className="text-slate-400">Enter a room code to join a battle</Text>
            </Pressable>
          </View>
        )}

        {/* 2. CREATE ROOM MENU */}
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

            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Subject</Text>
              <View className="flex-row flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => { setSubject(s); setSelectedChapters([]); }}
                    className={`px-4 py-2 rounded-xl border ${subject === s ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={subject === s ? 'text-white font-bold' : 'text-slate-400'}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Difficulty</Text>
              <View className="flex-row gap-2">
                {DIFFICULTIES.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl border items-center ${difficulty === d ? (d === 'LOW' ? 'bg-green-600 border-green-500' : 'bg-red-600 border-red-500') : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={difficulty === d ? 'text-white font-bold' : 'text-slate-400'}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-slate-400 uppercase">Chapters ({selectedChapters.length}/5)</Text>
                <Pressable onPress={() => setSelectedChapters(getRandomChapters(subject, 5))}>
                  <Text className="text-indigo-400 text-sm">Randomize 🎲</Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {MASTER_CHAPTER_DATABASE[subject]?.map((chapter) => {
                  const isSelected = selectedChapters.includes(chapter.id);
                  return (
                    <Pressable
                      key={chapter.id}
                      onPress={() => toggleChapter(chapter.id)}
                      className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-indigo-600/30 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}
                    >
                      <Text className={`text-xs ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>{chapter.name}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
            
            <View className="flex-row justify-between mb-6">
              <View className="w-[48%]">
                <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Max Players</Text>
                <View className="flex-row items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <Pressable onPress={() => setMaxPlayers(Math.max(2, maxPlayers - 1))} className="p-2 bg-slate-800 rounded-lg">
                    <Text className="text-white">➖</Text>
                  </Pressable>
                  <Text className="text-white font-bold">{maxPlayers}</Text>
                  <Pressable onPress={() => setMaxPlayers(Math.min(4, maxPlayers + 1))} className="p-2 bg-slate-800 rounded-lg">
                    <Text className="text-white">➕</Text>
                  </Pressable>
                </View>
              </View>
              
              <View className="w-[48%]">
                <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Time per Q</Text>
                <View className="flex-row items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <Pressable onPress={() => setTimePerQuestion(Math.max(30, timePerQuestion - 10))} className="p-2 bg-slate-800 rounded-lg">
                    <Text className="text-white">➖</Text>
                  </Pressable>
                  <Text className="text-white font-bold">{timePerQuestion}s</Text>
                  <Pressable onPress={() => setTimePerQuestion(Math.min(120, timePerQuestion + 10))} className="p-2 bg-slate-800 rounded-lg">
                    <Text className="text-white">➕</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {error ? <Text className="text-red-400 text-center mb-4">{error}</Text> : null}

            <Pressable 
              onPress={createRoom} 
              disabled={selectedChapters.length !== 5 || !playerName.trim() || isConnecting} 
              className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${(selectedChapters.length === 5 && playerName.trim() && !isConnecting) ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              {isConnecting ? <ActivityIndicator color="#fff" /> : <><Text className="text-xl">⚔️</Text><Text className="font-semibold text-white text-lg">Create Battle Room</Text></>}
            </Pressable>
          </View>
        )}

        {/* 3. JOIN ROOM MENU */}
        {mode === 'join' && !store.roomCode && (
          <View className="space-y-6">
            <Pressable onPress={() => setMode('menu')} className="mb-4">
              <Text className="text-slate-400">← Back</Text>
            </Pressable>
            
            <View className="mb-4">
              <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Your Name</Text>
              <TextInput 
                value={playerName} 
                onChangeText={setPlayerName} 
                placeholder="Enter your name" 
                placeholderTextColor="#64748b"
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white" 
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-400 uppercase mb-2">Room Code</Text>
              <TextInput 
                value={joinCode} 
                onChangeText={setJoinCode} 
                placeholder="Enter 6-digit code" 
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
                maxLength={6}
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-center text-2xl tracking-widest font-bold" 
              />
            </View>
            
            {error ? <Text className="text-red-400 text-center mb-4">{error}</Text> : null}

            <Pressable 
              onPress={joinRoom} 
              disabled={!playerName.trim() || joinCode.length !== 6 || isConnecting} 
              className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${(playerName.trim() && joinCode.length === 6 && !isConnecting) ? 'bg-purple-600 active:bg-purple-500' : 'bg-slate-800'}`}
            >
              {isConnecting ? <ActivityIndicator color="#fff" /> : <><Text className="text-xl">🔑</Text><Text className="font-semibold text-white text-lg">Join Room</Text></>}
            </Pressable>
          </View>
        )}

        {/* 4. ACTIVE ROOM / LOBBY WAITING AREA */}
        {store.roomCode && (
          <View className="space-y-6">
            <View className="bg-slate-900 p-6 rounded-2xl border border-slate-800 items-center">
              <Text className="text-slate-400 mb-2">Room Code</Text>
              <Pressable onPress={copyCode} className="flex-row items-center gap-3 bg-slate-950 px-6 py-3 rounded-xl border border-slate-800">
                <Text className="text-4xl font-bold text-white tracking-widest">{store.roomCode}</Text>
                <Text className="text-xl">{copied ? '✅' : '📋'}</Text>
              </Pressable>
              <Text className="text-slate-500 text-sm mt-4 text-center">Share this code with your friends to let them join!</Text>
            </View>

            <View className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-bold text-lg">Players ({store.players.length})</Text>
                {store.isHost && <Text className="text-indigo-400 text-xs">You are Host</Text>}
              </View>
              
              <View className="gap-2">
                {store.players.map((p, i) => (
                  <View key={p.sid} className="flex-row items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center">
                        <Text className="text-white font-bold">{p.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text className="text-white font-medium">{p.name} {p.is_host ? '👑' : ''}</Text>
                        <Text className="text-xs text-slate-400">{p.is_host ? 'Host' : 'Player'}</Text>
                      </View>
                    </View>
                    {store.isHost && !p.is_host && (
                      <Pressable onPress={() => kickPlayer(p.sid)} className="p-2 bg-red-900/30 rounded-lg">
                        <Text className="text-red-400 text-xs">Kick</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {store.isHost ? (
               <Pressable 
                 onPress={startGame} 
                 disabled={!questionsReady || store.players.length < 1} 
                 className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${questionsReady ? 'bg-green-600 active:bg-green-500' : 'bg-slate-800'}`}
               >
                 {!questionsReady ? (
                   <><ActivityIndicator color="#cbd5e1" /><Text className="text-slate-400 font-medium">Generating Battle...</Text></>
                 ) : (
                   <><Text className="text-xl">⚔️</Text><Text className="font-semibold text-white text-lg">Start Battle</Text></>
                 )}
               </Pressable>
            ) : (
               <View className="p-4 bg-slate-800 rounded-xl items-center flex-row justify-center gap-3">
                 <ActivityIndicator color="#facc15" />
                 <Text className="text-yellow-400 font-medium">Waiting for host to start...</Text>
               </View>
            )}

            <Pressable onPress={() => setShowExitConfirm(true)} className="py-4 mt-2 items-center">
              <Text className="text-red-400 font-medium">Leave Room</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </View>
  );
}