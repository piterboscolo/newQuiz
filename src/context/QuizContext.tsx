import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  resetToDefaults: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const stored = localStorage.getItem('subjects');
    // Se não houver dados salvos ou se os dados padrão tiverem mais matérias, usar os padrões
    if (!stored || defaultSubjects.length > JSON.parse(stored).length) {
      localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
      return defaultSubjects;
    }
    return JSON.parse(stored);
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const stored = localStorage.getItem('questions');
    // Se não houver dados salvos, usar os padrões
    if (!stored) {
      localStorage.setItem('questions', JSON.stringify(defaultQuestions));
      return defaultQuestions;
    }
    
    const storedQuestions = JSON.parse(stored);
    // Sempre usar os dados padrão se tiverem mais questões ou se for a primeira vez
    // Isso garante que novas questões sejam sempre carregadas
    if (defaultQuestions.length >= storedQuestions.length) {
      localStorage.setItem('questions', JSON.stringify(defaultQuestions));
      return defaultQuestions;
    }
    
    return storedQuestions;
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

  // Sincronizar com dados padrão quando houver mais questões no mockData
  useEffect(() => {
    const storedQuestions = localStorage.getItem('questions');
    if (!storedQuestions) {
      setQuestions(defaultQuestions);
      localStorage.setItem('questions', JSON.stringify(defaultQuestions));
    } else {
      const parsed = JSON.parse(storedQuestions);
      // Se os dados padrão tiverem mais ou igual número de questões, atualizar
      if (defaultQuestions.length >= parsed.length) {
        setQuestions(defaultQuestions);
        localStorage.setItem('questions', JSON.stringify(defaultQuestions));
      }
    }
  }, []);

  const getQuestionsBySubject = (subjectId: string) => {
    return questions.filter((q) => q.subjectId === subjectId);
  };

  const resetToDefaults = () => {
    setSubjects(defaultSubjects);
    setQuestions(defaultQuestions);
    localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
    localStorage.setItem('questions', JSON.stringify(defaultQuestions));
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
        resetToDefaults,
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




