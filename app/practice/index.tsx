import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Brain, Clock, CheckCircle, XCircle, ArrowRight, BookOpen, Dices, Zap, LogOut, AlertCircle } from 'lucide-react-native';
import MathHtml from '../../components/MathHtml';
import { apiFetch } from '../../lib/api';

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const;
const DIFFICULTIES = ['LOW', 'HIGH'] as const;

// (Keep your MASTER_CHAPTER_DATABASE exactly as it is here)
