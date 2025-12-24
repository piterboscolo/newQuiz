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

