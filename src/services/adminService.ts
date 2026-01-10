import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { QuizStatistics, UserQuizStats, UserRanking } from '../types';

type QuizStatsRow = Database['public']['Tables']['quiz_statistics']['Row'];
type UserQuizStatsRow = Database['public']['Tables']['user_quiz_stats']['Row'];
type UserSessionRow = Database['public']['Tables']['user_sessions']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];
type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];

/**
 * Busca todas as estatísticas de quiz
 */
export async function getAllQuizStatistics(): Promise<{
  success: boolean;
  statistics?: QuizStatistics[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('quiz_statistics')
      .select('*')
      .order('last_attempt_date', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { success: false, error: error.message };
    }

    const statistics: QuizStatistics[] = (data || []).map((s: any) => ({
      subjectId: s.subject_id,
      totalAttempts: s.total_attempts || 0,
      correctAnswers: s.correct_answers || 0,
      wrongAnswers: s.wrong_answers || 0,
      lastAttemptDate: s.last_attempt_date || undefined,
    }));

    return { success: true, statistics };
  } catch (err: any) {
    console.error('❌ Erro ao buscar estatísticas:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Busca todas as estatísticas de usuários
 */
export async function getAllUserQuizStats(): Promise<{
  success: boolean;
  stats?: UserQuizStats[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('user_quiz_stats')
      .select('*')
      .order('total_quizzes', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar estatísticas de usuários:', error);
      return { success: false, error: error.message };
    }

    const stats: UserQuizStats[] = (data || []).map((s: any) => ({
      userId: s.user_id,
      username: s.username,
      totalQuizzes: s.total_quizzes || 0,
      totalFirstAttemptCorrect: s.total_first_attempt_correct || 0,
      totalQuestions: s.total_questions || 0,
      lastQuizDate: s.last_quiz_date || undefined,
    }));

    return { success: true, stats };
  } catch (err: any) {
    console.error('❌ Erro ao buscar estatísticas de usuários:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Busca sessões ativas (últimas 24 horas)
 */
export async function getActiveSessions(): Promise<{
  success: boolean;
  sessions?: Array<{ userId: string; username: string; loginTime: string }>;
  error?: string;
}> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('user_sessions')
      .select('user_id, username, login_time')
      .eq('is_active', true)
      .gte('login_time', oneDayAgo)
      .order('login_time', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar sessões ativas:', error);
      return { success: false, error: error.message };
    }

    // Remover duplicatas (manter apenas a mais recente por usuário)
    const uniqueSessions = new Map<string, { userId: string; username: string; loginTime: string }>();
    (data || []).forEach((s: any) => {
      const existing = uniqueSessions.get(s.user_id);
      if (!existing || new Date(s.login_time) > new Date(existing.loginTime)) {
        uniqueSessions.set(s.user_id, {
          userId: s.user_id,
          username: s.username,
          loginTime: s.login_time,
        });
      }
    });

    return { success: true, sessions: Array.from(uniqueSessions.values()) };
  } catch (err: any) {
    console.error('❌ Erro ao buscar sessões ativas:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Busca todos os usuários com suas últimas sessões e perfis
 */
export async function getAllUsersWithDetails(): Promise<{
  success: boolean;
  users?: Array<{
    id: string;
    username: string;
    role: string;
    avatar: string | null;
    lastLogin: string | null;
    isActive: boolean;
  }>;
  error?: string;
}> {
  try {
    // Buscar usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, role, avatar');

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return { success: false, error: usersError.message };
    }

    // Buscar últimas sessões
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('user_id, login_time, is_active')
      .order('login_time', { ascending: false });

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
      return { success: false, error: sessionsError.message };
    }

    // Criar mapa de últimas sessões
    const lastLoginMap = new Map<string, { loginTime: string; isActive: boolean }>();
    (sessions || []).forEach((s: any) => {
      const existing = lastLoginMap.get(s.user_id);
      if (!existing || new Date(s.login_time) > new Date(existing.loginTime)) {
        lastLoginMap.set(s.user_id, {
          loginTime: s.login_time,
          isActive: s.is_active || false,
        });
      }
    });

    // Combinar dados
    const usersWithDetails = (users || []).map((u: any) => {
      const session = lastLoginMap.get(u.id);
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        avatar: u.avatar,
        lastLogin: session?.loginTime || null,
        isActive: session?.isActive || false,
      };
    });

    return { success: true, users: usersWithDetails };
  } catch (err: any) {
    console.error('❌ Erro ao buscar usuários:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Calcula ranking de usuários
 */
export async function getUserRankings(): Promise<{
  success: boolean;
  rankings?: UserRanking[];
  error?: string;
}> {
  try {
    // Buscar estatísticas de usuários
    const statsResult = await getAllUserQuizStats();
    if (!statsResult.success || !statsResult.stats) {
      return { success: false, error: statsResult.error };
    }

    // Buscar usuários para obter avatares
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, avatar');

    if (usersError) {
      console.error('❌ Erro ao buscar usuários para ranking:', usersError);
      return { success: false, error: usersError.message };
    }

    const userMap = new Map<string, string | null>();
    (users || []).forEach((u: any) => {
      userMap.set(u.id, u.avatar);
    });

    // Calcular ranking
    const rankings: UserRanking[] = statsResult.stats
      .map((stat) => {
        const accuracy = stat.totalQuestions > 0
          ? Math.round((stat.totalFirstAttemptCorrect / stat.totalQuestions) * 100)
          : 0;

        return {
          position: 0, // Será calculado após ordenação
          userId: stat.userId,
          username: stat.username,
          totalQuizzes: stat.totalQuizzes,
          totalFirstAttemptCorrect: stat.totalFirstAttemptCorrect,
          accuracy: accuracy,
          avatar: userMap.get(stat.userId) || undefined,
        };
      })
      .sort((a, b) => {
        // Ordenar por: 1) Total de quizzes, 2) Acertos de primeira, 3) Precisão
        if (b.totalQuizzes !== a.totalQuizzes) {
          return b.totalQuizzes - a.totalQuizzes;
        }
        if (b.totalFirstAttemptCorrect !== a.totalFirstAttemptCorrect) {
          return b.totalFirstAttemptCorrect - a.totalFirstAttemptCorrect;
        }
        return b.accuracy - a.accuracy;
      })
      .map((ranking, index) => ({
        ...ranking,
        position: index + 1,
      }));

    return { success: true, rankings };
  } catch (err: any) {
    console.error('❌ Erro ao calcular ranking:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}
