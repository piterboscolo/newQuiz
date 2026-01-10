import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subject, Question } from '../types';
import { subjects as defaultSubjects, questions as defaultQuestions } from '../data/mockData';
import { supabase } from '../lib/supabase';

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar subjects e questions do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('📥 Carregando subjects e questions do Supabase...');

        // Carregar subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (subjectsError) {
          console.error('❌ Erro ao carregar subjects:', subjectsError);
          // Fallback para dados padrão
          setSubjects(defaultSubjects);
        } else {
          const loadedSubjects: Subject[] = (subjectsData || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || undefined,
          }));
          console.log(`✅ ${loadedSubjects.length} subject(s) carregado(s)`);
          setSubjects(loadedSubjects.length > 0 ? loadedSubjects : defaultSubjects);
        }

        // Carregar questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('created_at');

        if (questionsError) {
          console.error('❌ Erro ao carregar questions:', questionsError);
          // Fallback para dados padrão
          setQuestions(defaultQuestions);
        } else {
          const loadedQuestions: Question[] = (questionsData || []).map((q: any) => ({
            id: q.id,
            subjectId: q.subject_id,
            question: q.question,
            options: q.options as string[],
            correctAnswer: q.correct_answer,
            funFact: q.fun_fact || undefined,
          }));
          console.log(`✅ ${loadedQuestions.length} question(s) carregada(s)`);
          setQuestions(loadedQuestions.length > 0 ? loadedQuestions : defaultQuestions);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
        // Fallback para dados padrão
        setSubjects(defaultSubjects);
        setQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addSubject = async (subject: Subject) => {
    try {
      console.log('➕ Adicionando subject:', subject);
      
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          id: subject.id,
          name: subject.name,
          description: subject.description || null,
        } as never)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar subject:', error);
        throw error;
      }

      const newSubjects = [...subjects, subject];
      setSubjects(newSubjects);
      console.log('✅ Subject adicionado com sucesso');
    } catch (err) {
      console.error('❌ Erro ao adicionar subject:', err);
      throw err;
    }
  };

  const addQuestion = async (question: Question) => {
    try {
      console.log('➕ Adicionando question:', question.id);
      
      const { data, error } = await supabase
        .from('questions')
        .insert({
          id: question.id,
          subject_id: question.subjectId,
          question: question.question,
          options: question.options,
          correct_answer: question.correctAnswer,
          fun_fact: question.funFact || null,
        } as never)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar question:', error);
        throw error;
      }

      const newQuestions = [...questions, question];
      setQuestions(newQuestions);
      console.log('✅ Question adicionada com sucesso');
    } catch (err) {
      console.error('❌ Erro ao adicionar question:', err);
      throw err;
    }
  };

  const updateQuestion = async (question: Question) => {
    try {
      console.log('✏️ Atualizando question:', question.id);
      
      const { error } = await supabase
        .from('questions')
        .update({
          subject_id: question.subjectId,
          question: question.question,
          options: question.options,
          correct_answer: question.correctAnswer,
          fun_fact: question.funFact || null,
        } as never)
        .eq('id', question.id);

      if (error) {
        console.error('❌ Erro ao atualizar question:', error);
        throw error;
      }

      const newQuestions = questions.map((q) =>
        q.id === question.id ? question : q
      );
      setQuestions(newQuestions);
      console.log('✅ Question atualizada com sucesso');
    } catch (err) {
      console.error('❌ Erro ao atualizar question:', err);
      throw err;
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      console.log('🗑️ Deletando question:', questionId);
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('❌ Erro ao deletar question:', error);
        throw error;
      }

      const newQuestions = questions.filter((q) => q.id !== questionId);
      setQuestions(newQuestions);
      console.log('✅ Question deletada com sucesso');
    } catch (err) {
      console.error('❌ Erro ao deletar question:', err);
      throw err;
    }
  };

  // Removido: sincronização com localStorage não é mais necessária

  const getQuestionsBySubject = (subjectId: string) => {
    return questions.filter((q) => q.subjectId === subjectId);
  };

  const resetToDefaults = () => {
    // Reset apenas no estado local (não deleta do banco)
    setSubjects(defaultSubjects);
    setQuestions(defaultQuestions);
    console.log('⚠️ Reset para dados padrão (apenas no estado local)');
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




