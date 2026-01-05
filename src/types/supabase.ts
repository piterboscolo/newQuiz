// Tipos gerados automaticamente pelo Supabase
// Por enquanto, vamos definir manualmente baseado no schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: 'aluno' | 'admin'
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          role: 'aluno' | 'admin'
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: 'aluno' | 'admin'
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          subject_id: string
          question: string
          options: Json
          correct_answer: number
          fun_fact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          subject_id: string
          question: string
          options: Json
          correct_answer: number
          fun_fact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          question?: string
          options?: Json
          correct_answer?: number
          fun_fact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          username: string
          login_time: string
          logout_time: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          login_time?: string
          logout_time?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          login_time?: string
          logout_time?: string | null
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          avatar: string | null
          uploaded_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avatar?: string | null
          uploaded_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avatar?: string | null
          uploaded_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_statistics: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          total_attempts: number
          correct_answers: number
          wrong_answers: number
          last_attempt_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          total_attempts?: number
          correct_answers?: number
          wrong_answers?: number
          last_attempt_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          total_attempts?: number
          correct_answers?: number
          wrong_answers?: number
          last_attempt_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_quiz_stats: {
        Row: {
          id: string
          user_id: string
          username: string
          total_quizzes: number
          total_first_attempt_correct: number
          total_questions: number
          last_quiz_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          total_quizzes?: number
          total_first_attempt_correct?: number
          total_questions?: number
          last_quiz_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          total_quizzes?: number
          total_first_attempt_correct?: number
          total_questions?: number
          last_quiz_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      answered_questions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          question_id: string
          answered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          question_id: string
          answered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          question_id?: string
          answered_at?: string
        }
      }
    }
  }
}
