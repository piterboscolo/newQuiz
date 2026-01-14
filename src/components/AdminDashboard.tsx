import { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { QuizStatistics, UserRanking, UserQuizStats, User } from '../types';
import { getAllQuizStatistics, getAllUserQuizStats, getAllUsersWithDetails, getUserRankings } from '../services/adminService';
import './AdminDashboard.css';

const PRESET_AVATARS = [
  { id: 'avatar1', emoji: '👤', color: '#2563eb' },
  { id: 'avatar2', emoji: '🎓', color: '#10b981' },
  { id: 'avatar3', emoji: '🧑', color: '#f59e0b' },
  { id: 'avatar4', emoji: '👨‍🎓', color: '#8b5cf6' },
  { id: 'avatar5', emoji: '👩‍🎓', color: '#ec4899' },
  { id: 'avatar6', emoji: '🧑', color: '#06b6d4' },
  { id: 'avatar7', emoji: '👨‍🏫', color: '#ef4444' },
  { id: 'avatar8', emoji: '👩‍🏫', color: '#14b8a6' },
];

export function AdminDashboard() {
  const { subjects } = useQuiz();
  const { user: currentUser } = useAuth();
  const [statistics, setStatistics] = useState<QuizStatistics[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersFilter, setUsersFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [usersWithAvatars, setUsersWithAvatars] = useState<Map<string, { type: 'image' | 'emoji'; value: string; color?: string }>>(new Map());

  // Função auxiliar para obter avatar
  const getUserAvatar = (userId: string, avatar: string | null | undefined) => {
    if (avatar) {
      // Se for uma imagem (data:image), retornar diretamente
      if (avatar.startsWith('data:image')) {
        return { type: 'image' as const, value: avatar };
      }
      // Se for um ID de avatar preset, buscar o emoji
      const avatarData = PRESET_AVATARS.find((a) => a.id === avatar);
      if (avatarData) {
        return { type: 'emoji' as const, value: avatarData.emoji, color: avatarData.color };
      }
      // Se for um emoji direto
      return { type: 'emoji' as const, value: avatar, color: '#2563eb' };
    }
    return { type: 'emoji' as const, value: '👤', color: '#2563eb' };
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || 'Desconhecida';
  };

  // Carregar estatísticas do Supabase
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        console.log('📥 Carregando estatísticas do Supabase...');

        // Carregar estatísticas de quiz
        const statsResult = await getAllQuizStatistics();
        if (statsResult.success && statsResult.statistics) {
          setStatistics(statsResult.statistics);
        }


        // Carregar ranking
        const rankingsResult = await getUserRankings();
        if (rankingsResult.success && rankingsResult.rankings) {
          setUserRankings(rankingsResult.rankings);
        }

        // Carregar todos os usuários
        const usersResult = await getAllUsersWithDetails();
        if (usersResult.success && usersResult.users) {
          // Armazenar todos os usuários
          setAllUsers(usersResult.users);
          
          // Criar mapa de avatares
          const avatarMap = new Map<string, { type: 'image' | 'emoji'; value: string; color?: string }>();
          usersResult.users.forEach((u) => {
            avatarMap.set(u.id, getUserAvatar(u.id, u.avatar));
          });
          setUsersWithAvatars(avatarMap);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar estatísticas:', err);
      }
    };

    // Carregar imediatamente
    loadStatistics();
    
    // Configurar intervalo para recarregar a cada 30 segundos
    const intervalId = setInterval(() => {
      loadStatistics();
    }, 30000);
    
    // Cleanup: limpar intervalo quando o componente desmontar ou currentUser mudar
    return () => {
      clearInterval(intervalId);
    };
  }, [currentUser]);

  // Calcular matéria mais realizada
  const getMostPopularSubject = () => {
    if (statistics.length === 0) return null;
    const sorted = [...statistics].sort((a, b) => b.totalAttempts - a.totalAttempts);
    return sorted[0];
  };

  const mostPopular = getMostPopularSubject();

  return (
    <div className="admin-dashboard">
      <div className="admin-section">
        <h2>Estatísticas do Sistema</h2>
        
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Usuários Logados</h3>
              <p className="stat-value">
                {allUsers.filter(u => {
                  // Usuário atual sempre é considerado logado
                  if (currentUser && u.id === currentUser.id) return true;
                  if (!u.lastLogin) return false;
                  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return new Date(u.lastLogin) > twentyFourHoursAgo;
                }).length}
              </p>
              <p className="stat-label">Nas últimas 24 horas</p>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C16.84 2 20.87 5.38 21.8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Matéria Mais Realizada</h3>
              <p className="stat-value">
                {mostPopular ? getSubjectName(mostPopular.subjectId) : 'N/A'}
              </p>
              <p className="stat-label">
                {mostPopular ? `${mostPopular.totalAttempts} tentativas` : 'Sem dados'}
              </p>
            </div>
          </div>
        </div>

        {/* Usuários do Sistema */}
        <div className="stats-section">
          <div className="section-header-with-filter">
            <div>
              <h3>👥 Usuários do Sistema</h3>
              <p className="section-description">Gerencie todos os usuários do sistema com controle de status ativo/inativo</p>
            </div>
            <div className="users-filter-buttons">
              <button
                className={`filter-button ${usersFilter === 'all' ? 'active' : ''}`}
                onClick={() => setUsersFilter('all')}
              >
                Todos ({allUsers.length})
              </button>
              <button
                className={`filter-button ${usersFilter === 'active' ? 'active' : ''}`}
                onClick={() => setUsersFilter('active')}
              >
                Ativos ({allUsers.filter(u => {
                  // Usuário atual sempre é considerado ativo
                  if (currentUser && u.id === currentUser.id) return true;
                  if (!u.lastLogin) return false;
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(u.lastLogin) > sevenDaysAgo;
                }).length})
              </button>
              <button
                className={`filter-button ${usersFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => setUsersFilter('inactive')}
              >
                Inativos ({allUsers.filter(u => {
                  // Usuário atual nunca é considerado inativo
                  if (currentUser && u.id === currentUser.id) return false;
                  if (!u.lastLogin) return true;
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(u.lastLogin) <= sevenDaysAgo;
                }).length})
              </button>
            </div>
          </div>
          
          <div className="users-unified-list">
            {(() => {
              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              
              const filteredUsers = allUsers
                .filter((u) => {
                  if (usersFilter === 'all') return true;
                  if (usersFilter === 'active') {
                    // Usuário atual sempre é considerado ativo
                    if (currentUser && u.id === currentUser.id) return true;
                    if (!u.lastLogin) return false;
                    return new Date(u.lastLogin) > sevenDaysAgo;
                  }
                  if (usersFilter === 'inactive') {
                    // Usuário atual nunca é considerado inativo
                    if (currentUser && u.id === currentUser.id) return false;
                    if (!u.lastLogin) return true;
                    return new Date(u.lastLogin) <= sevenDaysAgo;
                  }
                  return true;
                })
                .sort((a, b) => {
                  // Ordenar alfabeticamente por username
                  return a.username.localeCompare(b.username, 'pt-BR', { sensitivity: 'base' });
                });

              const formatLastLogin = (loginTime: string | null) => {
                if (!loginTime) return '';
                const date = new Date(loginTime);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 60) return `${diffMins} min atrás`;
                if (diffHours < 24) return `${diffHours}h atrás`;
                if (diffDays < 7) return `${diffDays} dias atrás`;
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              };

              const isUserActive = (user: any) => {
                // Usuário atual sempre é considerado ativo
                if (currentUser && user.id === currentUser.id) return true;
                if (!user.lastLogin) return false;
                return new Date(user.lastLogin) > sevenDaysAgo;
              };

              if (filteredUsers.length === 0) {
                return (
                  <div className="users-empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Nenhum usuário encontrado com este filtro.</p>
                  </div>
                );
              }

              return filteredUsers.map((user) => {
                const avatar = usersWithAvatars.get(user.id) || getUserAvatar(user.id, user.avatar);
                const active = isUserActive(user);
                
                return (
                  <div key={user.id} className={`user-status-item-unified ${active ? 'user-active' : 'user-inactive'}`}>
                    <div className="user-status-avatar" style={avatar.type === 'emoji' ? { backgroundColor: avatar.color } : {}}>
                      {avatar.type === 'image' ? (
                        <img src={avatar.value} alt={user.username} />
                      ) : (
                        <span>{avatar.value}</span>
                      )}
                    </div>
                    <div className="user-status-info">
                      <div className="user-status-header-row">
                        <div className="user-status-name">{user.username}</div>
                        <div className={`user-status-badge ${active ? 'status-active' : 'status-inactive'}`}>
                          {active ? (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" fill="#10b981" stroke="white" strokeWidth="2"/>
                            </svg>
                          ) : (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" fill="#94a3b8" stroke="white" strokeWidth="2"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="user-status-meta">
                        <span className="user-status-role">{user.role === 'admin' ? 'Admin' : 'Aluno'}</span>
                        {formatLastLogin(user.lastLogin) && (
                          <>
                            <span className="user-status-separator">•</span>
                            <span className="user-status-date">{formatLastLogin(user.lastLogin)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Ranking de Usuários */}
        <div className="stats-section">
          <h3>🏆 Ranking de Usuários</h3>
          <p className="section-description">Usuários que mais realizaram quizzes e acertaram de primeira</p>
          {userRankings.length === 0 ? (
            <div className="ranking-empty">
              <p>Nenhum usuário completou quizzes ainda.</p>
            </div>
          ) : (
            <div className="ranking-list">
              {userRankings.map((ranking) => {
                const avatar = usersWithAvatars.get(ranking.userId) || getUserAvatar(ranking.userId, ranking.avatar);
                const getMedal = (position: number) => {
                  if (position === 1) return '🥇';
                  if (position === 2) return '🥈';
                  if (position === 3) return '🥉';
                  return `#${position}`;
                };
                
                return (
                  <div 
                    key={ranking.userId} 
                    className={`ranking-item ${ranking.position <= 3 ? 'ranking-top' : ''}`}
                  >
                    <div className="ranking-position">
                      <span className="ranking-medal">{getMedal(ranking.position)}</span>
                    </div>
                    <div className="ranking-avatar" style={avatar.type === 'emoji' ? { backgroundColor: avatar.color } : {}}>
                      {avatar.type === 'image' ? (
                        <img src={avatar.value} alt={ranking.username} />
                      ) : (
                        <span>{avatar.value}</span>
                      )}
                    </div>
                    <div className="ranking-info">
                      <div className="ranking-name">{ranking.username}</div>
                      <div className="ranking-stats">
                        <span className="ranking-stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {ranking.totalQuizzes} quiz{ranking.totalQuizzes !== 1 ? 'zes' : ''}
                        </span>
                        <span className="ranking-stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C16.84 2 20.87 5.38 21.8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {ranking.totalFirstAttemptCorrect} acertos de primeira
                        </span>
                        <span className="ranking-stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {ranking.accuracy}% precisão
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="stats-section">
          <h3>Estatísticas por Matéria</h3>
          <div className="subject-stats-grid">
            {subjects.map((subject) => {
              const subjectStats = statistics.find((s) => s.subjectId === subject.id);
              const totalAttempts = subjectStats?.totalAttempts || 0;

              return (
                <div 
                  key={subject.id} 
                  className="subject-stat-card-compact"
                  onClick={() => setSelectedSubjectId(subject.id)}
                >
                  <div className="subject-card-content">
                    <div className="subject-card-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="subject-card-info">
                      <h4>{subject.name}</h4>
                      <p className="subject-card-description">{subject.description}</p>
                      {totalAttempts > 0 && (
                        <span className="subject-card-badge">{totalAttempts} tentativa{totalAttempts !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="subject-card-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Estatísticas Detalhadas */}
        {selectedSubjectId && (() => {
          const subject = subjects.find((s) => s.id === selectedSubjectId);
          const subjectStats = statistics.find((s) => s.subjectId === selectedSubjectId);
          const totalAnswers = subjectStats 
            ? subjectStats.correctAnswers + subjectStats.wrongAnswers 
            : 0;
          const correctPercentage = totalAnswers > 0 && subjectStats
            ? Math.round((subjectStats.correctAnswers / totalAnswers) * 100)
            : 0;
          const wrongPercentage = totalAnswers > 0 && subjectStats
            ? Math.round((subjectStats.wrongAnswers / totalAnswers) * 100)
            : 0;

          return (
            <div className="stat-modal-overlay" onClick={() => setSelectedSubjectId(null)}>
              <div className="stat-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="stat-modal-header">
                  <div className="stat-modal-title-section">
                    <div className="stat-modal-icon-header">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h2>{subject?.name || 'Estatísticas'}</h2>
                      <p className="stat-modal-subtitle">{subject?.description || ''}</p>
                    </div>
                  </div>
                  <button 
                    className="stat-modal-close"
                    onClick={() => setSelectedSubjectId(null)}
                    aria-label="Fechar"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="stat-modal-body">
                  {subjectStats ? (
                    <>
                      <div className="stat-modal-grid">
                        <div className="stat-modal-card">
                          <div className="stat-modal-icon stat-modal-primary">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-modal-card-content">
                            <h3>Total de Tentativas</h3>
                            <p className="stat-modal-value">{subjectStats.totalAttempts}</p>
                            <p className="stat-modal-description">Vezes que o quiz foi realizado</p>
                          </div>
                        </div>

                        <div className="stat-modal-card">
                          <div className="stat-modal-icon stat-modal-success">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C16.84 2 20.87 5.38 21.8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-modal-card-content">
                            <h3>Acertos</h3>
                            <p className="stat-modal-value stat-modal-success-text">{subjectStats.correctAnswers}</p>
                            <p className="stat-modal-description">
                              {totalAnswers > 0 ? `${correctPercentage}% das respostas` : 'Nenhuma resposta ainda'}
                            </p>
                          </div>
                        </div>

                        <div className="stat-modal-card">
                          <div className="stat-modal-icon stat-modal-error">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-modal-card-content">
                            <h3>Erros</h3>
                            <p className="stat-modal-value stat-modal-error-text">{subjectStats.wrongAnswers}</p>
                            <p className="stat-modal-description">
                              {totalAnswers > 0 ? `${wrongPercentage}% das respostas` : 'Nenhuma resposta ainda'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {totalAnswers > 0 && (
                        <div className="stat-modal-progress">
                          <h3>Distribuição de Respostas</h3>
                          <div className="stat-progress-bar-large">
                            <div 
                              className="stat-progress-correct-large" 
                              style={{ width: `${correctPercentage}%` }}
                            >
                              {correctPercentage > 10 && (
                                <span className="stat-progress-label">{correctPercentage}%</span>
                              )}
                            </div>
                            <div 
                              className="stat-progress-wrong-large" 
                              style={{ width: `${wrongPercentage}%` }}
                            >
                              {wrongPercentage > 10 && (
                                <span className="stat-progress-label">{wrongPercentage}%</span>
                              )}
                            </div>
                          </div>
                          <div className="stat-progress-legend">
                            <div className="stat-legend-item">
                              <div className="stat-legend-color stat-legend-correct"></div>
                              <span>Acertos ({subjectStats.correctAnswers})</span>
                            </div>
                            <div className="stat-legend-item">
                              <div className="stat-legend-color stat-legend-wrong"></div>
                              <span>Erros ({subjectStats.wrongAnswers})</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="stat-modal-empty">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>Nenhuma estatística disponível para esta matéria ainda.</p>
                      <p className="stat-modal-empty-hint">As estatísticas aparecerão quando os alunos começarem a fazer os quizzes desta matéria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
