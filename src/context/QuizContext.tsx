import { createContext, useContext, useState, ReactNode } from 'react';
import { Subject, Question } from '../types';
import { subjects as defaultSubjects, questions as defaultQuestions } from '../data/mockData';

interface QuizContextType {
  subjects: Subject[];
  questions: Question[];
  addSubject: (subject: Subject) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  getQuestionsBySubject: (subjectId: string) => Question[];
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const stored = localStorage.getItem('subjects');
    return stored ? JSON.parse(stored) : defaultSubjects;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const stored = localStorage.getItem('questions');
    return stored ? JSON.parse(stored) : defaultQuestions;
  });

  const addSubject = (subject: Subject) => {
    const newSubjects = [...subjects, subject];
    setSubjects(newSubjects);
    localStorage.setItem('subjects', JSON.stringify(newSubjects));
  };

  const addQuestion = (question: Question) => {
    const newQuestions = [...questions, question];
    setQuestions(newQuestions);
    localStorage.setItem('questions', JSON.stringify(newQuestions));
  };

  const updateQuestion = (question: Question) => {
    const newQuestions = questions.map((q) =>
      q.id === question.id ? question : q
    );
    setQuestions(newQuestions);
    localStorage.setItem('questions', JSON.stringify(newQuestions));
  };

  const deleteQuestion = (questionId: string) => {
    const newQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(newQuestions);
    localStorage.setItem('questions', JSON.stringify(newQuestions));
  };

  const getQuestionsBySubject = (subjectId: string) => {
    return questions.filter((q) => q.subjectId === subjectId);
  };

  return (
    <QuizContext.Provider
      value={{
        subjects,
        questions,
        addSubject,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        getQuestionsBySubject,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}



