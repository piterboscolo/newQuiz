export type UserRole = 'aluno' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  funFact?: string;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface QuizStatistics {
  subjectId: string;
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastAttemptDate?: string;
}

export interface UserSession {
  userId: string;
  username: string;
  loginTime: string;
}

