export type UserRole = 'aluno' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  avatar?: string; // URL da imagem ou ID do avatar pré-determinado
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

export interface UserQuizStats {
  userId: string;
  username: string;
  totalQuizzes: number; // Total de quizzes realizados
  totalFirstAttemptCorrect: number; // Total de acertos de primeira tentativa
  totalQuestions: number; // Total de questões respondidas
  lastQuizDate?: string;
}

export interface UserRanking {
  position: number;
  userId: string;
  username: string;
  totalQuizzes: number;
  totalFirstAttemptCorrect: number;
  accuracy: number; // Porcentagem de acertos de primeira
  avatar?: string;
}
