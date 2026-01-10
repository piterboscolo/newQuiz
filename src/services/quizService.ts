import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type QuizStatistics = Database['public']['Tables']['quiz_statistics'];
type UserQuizStats = Database['public']['Tables']['user_quiz_stats'];
type AnsweredQuestions = Database['public']['Tables']['answered_questions'];

/**
 * Salva ou atualiza estatísticas de quiz por matéria
 */
export async function saveQuizStatistics(
  userId: string,
  subjectId: string,
  correctCount: number,
  wrongCount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Salvando estatísticas de quiz:', { userId, subjectId, correctCount, wrongCount });

    // Verificar se já existe estatística para este usuário e matéria
    const { data: existing, error: fetchError } = await supabase
      .from('quiz_statistics')
      .select('id, total_attempts, correct_answers, wrong_answers')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (não é erro se não existir)
      console.error('❌ Erro ao buscar estatísticas:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const now = new Date().toISOString();

    if (existing) {
      // Atualizar estatísticas existentes
      const existingData = existing as any;
      const updateData: QuizStatistics['Update'] = {
        total_attempts: (existingData.total_attempts || 0) + 1,
        correct_answers: (existingData.correct_answers || 0) + correctCount,
        wrong_answers: (existingData.wrong_answers || 0) + wrongCount,
        last_attempt_date: now,
        updated_at: now,
      };

      const { error: updateError } = await supabase
        .from('quiz_statistics')
        .update(updateData as never)
        .eq('id', existingData.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar estatísticas:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ Estatísticas atualizadas com sucesso');
      return { success: true };
    } else {
      // Criar nova estatística
      const insertData: QuizStatistics['Insert'] = {
        user_id: userId,
        subject_id: subjectId,
        total_attempts: 1,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        last_attempt_date: now,
      };

      const { error: insertError } = await supabase
        .from('quiz_statistics')
        .insert(insertData as never);

      if (insertError) {
        console.error('❌ Erro ao criar estatísticas:', insertError);
        return { success: false, error: insertError.message };
      }

      console.log('✅ Estatísticas criadas com sucesso');
      return { success: true };
    }
  } catch (err: any) {
    console.error('❌ Erro ao salvar estatísticas:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Salva ou atualiza estatísticas gerais do usuário
 */
export async function saveUserQuizStats(
  userId: string,
  username: string,
  firstAttemptCorrect: number,
  totalQuestions: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Salvando estatísticas gerais do usuário:', {
      userId,
      username,
      firstAttemptCorrect,
      totalQuestions,
    });

    // Verificar se já existe estatística para este usuário
    const { data: existing, error: fetchError } = await supabase
      .from('user_quiz_stats')
      .select('id, total_quizzes, total_first_attempt_correct, total_questions')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar estatísticas do usuário:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const now = new Date().toISOString();

    if (existing) {
      // Atualizar estatísticas existentes
      const existingData = existing as any;
      const updateData: UserQuizStats['Update'] = {
        total_quizzes: (existingData.total_quizzes || 0) + 1,
        total_first_attempt_correct: (existingData.total_first_attempt_correct || 0) + firstAttemptCorrect,
        total_questions: (existingData.total_questions || 0) + totalQuestions,
        last_quiz_date: now,
        updated_at: now,
      };

      const { error: updateError } = await supabase
        .from('user_quiz_stats')
        .update(updateData as never)
        .eq('id', existingData.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar estatísticas do usuário:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ Estatísticas do usuário atualizadas com sucesso');
      return { success: true };
    } else {
      // Criar nova estatística
      const insertData: UserQuizStats['Insert'] = {
        user_id: userId,
        username: username,
        total_quizzes: 1,
        total_first_attempt_correct: firstAttemptCorrect,
        total_questions: totalQuestions,
        last_quiz_date: now,
      };

      const { error: insertError } = await supabase
        .from('user_quiz_stats')
        .insert(insertData as never);

      if (insertError) {
        console.error('❌ Erro ao criar estatísticas do usuário:', insertError);
        return { success: false, error: insertError.message };
      }

      console.log('✅ Estatísticas do usuário criadas com sucesso');
      return { success: true };
    }
  } catch (err: any) {
    console.error('❌ Erro ao salvar estatísticas do usuário:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Salva questões respondidas pelo usuário
 */
export async function saveAnsweredQuestions(
  userId: string,
  subjectId: string,
  questionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Salvando questões respondidas:', {
      userId,
      subjectId,
      questionCount: questionIds.length,
    });

    if (questionIds.length === 0) {
      console.log('⚠️ Nenhuma questão para salvar');
      return { success: true };
    }

    // Verificar quais questões já foram respondidas
    const { data: existing, error: fetchError } = await supabase
      .from('answered_questions')
      .select('question_id')
      .eq('user_id', userId)
      .in('question_id', questionIds);

    if (fetchError) {
      console.error('❌ Erro ao buscar questões respondidas:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const existingQuestionIds = new Set(existing?.map((e: any) => e.question_id) || []);
    const newQuestionIds = questionIds.filter((id) => !existingQuestionIds.has(id));

    if (newQuestionIds.length === 0) {
      console.log('✅ Todas as questões já foram respondidas anteriormente');
      return { success: true };
    }

    // Inserir apenas as novas questões
    const insertData: AnsweredQuestions['Insert'][] = newQuestionIds.map((questionId) => ({
      user_id: userId,
      subject_id: subjectId,
      question_id: questionId,
    }));

    const { error: insertError } = await supabase
      .from('answered_questions')
      .insert(insertData as never);

    if (insertError) {
      console.error('❌ Erro ao salvar questões respondidas:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log(`✅ ${newQuestionIds.length} questão(ões) salva(s) com sucesso`);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Erro ao salvar questões respondidas:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Busca questões já respondidas pelo usuário em uma matéria
 */
export async function getAnsweredQuestions(
  userId: string,
  subjectId: string
): Promise<{ success: boolean; questionIds?: string[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('answered_questions')
      .select('question_id')
      .eq('user_id', userId)
      .eq('subject_id', subjectId);

    if (error) {
      console.error('❌ Erro ao buscar questões respondidas:', error);
      return { success: false, error: error.message };
    }

    const questionIds = data?.map((item: any) => item.question_id) || [];
    return { success: true, questionIds };
  } catch (err: any) {
    console.error('❌ Erro ao buscar questões respondidas:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}
