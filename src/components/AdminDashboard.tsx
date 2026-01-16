import { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { QuizStatistics, UserRanking, UserQuizStats, User } from '../types';
import { getAllQuizStatistics, getAllUserQuizStats, getAllUsersWithDetails, getUserRankings, getActiveSessions, getQuizStatisticsBySubject } from '../services/adminService';
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
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [usersFilter, setUsersFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [usersWithAvatars, setUsersWithAvatars] = useState<Map<string, { type: 'image' | 'emoji'; value: string; color?: string }>>(new Map());
  const [subjectStatistics, setSubjectStatistics] = useState<Array<{
    subjectId: string;
    subjectName: string;
    totalAttempts: number;
    totalCorrect: number;
    totalWrong: number;
    uniqueUsers: number;
  }>>([]);

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

        // Carregar estatísticas de quiz (usado apenas para calcular matéria mais realizada)
        const statsResult = await getAllQuizStatistics();
        if (statsResult.success && statsResult.statistics) {
          setStatistics(statsResult.statistics);
        }


        // Carregar ranking
        const rankingsResult = await getUserRankings();
        if (rankingsResult.success && rankingsResult.rankings) {
          setUserRankings(rankingsResult.rankings);
        }

        // Carregar estatísticas agregadas por matéria
        const subjectStatsResult = await getQuizStatisticsBySubject();
        if (subjectStatsResult.success && subjectStatsResult.statistics) {
          setSubjectStatistics(subjectStatsResult.statistics);
        }

        // Carregar sessões ativas
        const sessionsResult = await getActiveSessions();
        if (sessionsResult.success && sessionsResult.sessions) {
          setActiveSessions(sessionsResult.sessions);
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
                {(() => {
                  // Criar um Set com IDs de usuários que têm sessões ativas
                  const activeUserIds = new Set(activeSessions.map(s => s.userId));
                  
                  // Se o usuário atual não estiver nas sessões ativas, adicionar
                  if (currentUser && !activeUserIds.has(currentUser.id)) {
                    activeUserIds.add(currentUser.id);
                  }
                  
                  return activeUserIds.size;
                })()}
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
                  // Usar isActive se disponível
                  if (u.isActive !== undefined) return u.isActive === true;
                  // Fallback: usar lastLogin
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
                  // Usar isActive se disponível
                  if (u.isActive !== undefined) return u.isActive === false;
                  // Fallback: usar lastLogin
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
                    // Usar isActive se disponível (mais preciso)
                    if (u.isActive !== undefined) return u.isActive === true;
                    // Fallback: usar lastLogin
                    if (!u.lastLogin) return false;
                    return new Date(u.lastLogin) > sevenDaysAgo;
                  }
                  if (usersFilter === 'inactive') {
                    // Usuário atual nunca é considerado inativo
                    if (currentUser && u.id === currentUser.id) return false;
                    // Usar isActive se disponível (mais preciso)
                    if (u.isActive !== undefined) return u.isActive === false;
                    // Fallback: usar lastLogin
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
                
                // Usar o campo isActive da sessão (mais preciso)
                if (user.isActive !== undefined) {
                  return user.isActive === true;
                }
                
                // Fallback: usar lastLogin se isActive não estiver disponível
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
          <p className="section-description">Ranking baseado em pontuação total (acertos nos quizzes)</p>
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
                        <span className="ranking-stat ranking-score">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <strong>{ranking.totalScore || 0} pontos</strong>
                        </span>
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
                          {ranking.totalFirstAttemptCorrect} acertos
                        </span>
                        <span className="ranking-stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {ranking.accuracy}% precisão
                        </span>
                      </div>
                      {ranking.topSubjects && ranking.topSubjects.length > 0 && (
                        <div className="ranking-subjects">
                          <span className="ranking-subjects-label">Matérias que mais pontua:</span>
                          <div className="ranking-subjects-list">
                            {ranking.topSubjects.map((subject) => (
                              <span key={subject.subjectId} className="ranking-subject-badge">
                                {subject.subjectName} ({subject.score} pts)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfico de Matérias Mais Jogadas */}
        <div className="stats-section">
          <h3>📊 Matérias Mais Jogadas</h3>
          <p className="section-description">Gráfico mostrando as matérias com mais tentativas de quiz</p>
          <div className="quiz-chart-container">
            {subjectStatistics.length > 0 ? (
              <div className="quiz-chart">
                {(() => {
                  const maxAttempts = Math.max(...subjectStatistics.map(s => s.totalAttempts), 1);
                  const topSubjects = subjectStatistics.slice(0, 10); // Top 10 matérias
                  
                  return topSubjects.map((stat, index) => {
                    const percentage = maxAttempts > 0 ? (stat.totalAttempts / maxAttempts) * 100 : 0;
                    const colors = [
                      '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
                      '#06b6d4', '#ef4444', '#14b8a6', '#f97316', '#6366f1'
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={stat.subjectId} className="quiz-chart-item">
                        <div className="quiz-chart-label">
                          <span className="quiz-chart-subject">{stat.subjectName}</span>
                          <span className="quiz-chart-value">{stat.totalAttempts} tentativas</span>
                        </div>
                        <div className="quiz-chart-bar-container">
                          <div 
                            className="quiz-chart-bar"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: color
                            }}
                          >
                            <span className="quiz-chart-bar-value">
                              {stat.totalAttempts}
                            </span>
                          </div>
                        </div>
                        <div className="quiz-chart-details">
                          <span className="quiz-chart-detail-item">
                            ✅ {stat.totalCorrect} acertos
                          </span>
                          <span className="quiz-chart-detail-item">
                            ❌ {stat.totalWrong} erros
                          </span>
                          <span className="quiz-chart-detail-item">
                            👥 {stat.uniqueUsers} usuário{stat.uniqueUsers !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="quiz-chart-empty">
                <p>Nenhuma estatística disponível ainda.</p>
                <p className="quiz-chart-empty-hint">As estatísticas aparecerão quando os alunos começarem a fazer os quizzes.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
