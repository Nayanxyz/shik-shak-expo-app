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
