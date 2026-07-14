import { create } from 'zustand'

export interface Player {
  sid: string
  user_id: string
  name: string
  avatar_url?: string
  is_host: boolean
  is_connected: boolean
  total_score: number
  correct_count: number
  wrong_count: number
  time_limit?: number
}

export interface Question {
  question_number: number
  question_text: string
  options: { id: string; text: string }[]
  correct_option?: string
  explanation?: string
  time_limit?: number
}

