import { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { QuizStatistics, UserRanking, UserQuizStats, User } from '../types';
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
  const [loggedUsers, setLoggedUsers] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || 'Desconhecida';
  };

  // Carregar estatísticas
  useEffect(() => {
    const loadStatistics = () => {
      const statsKey = 'quizStatistics';
      const stats = JSON.parse(localStorage.getItem(statsKey) || '[]');
      setStatistics(stats);
      
      const sessionsKey = 'userSessions';
      const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
      
      // Filtrar sessões ativas (últimas 24 horas) e remover duplicatas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let activeSessions = sessions.filter((s: any) => {
        const sessionDate = new Date(s.loginTime);
        return sessionDate > oneDayAgo;
      });
      
      // Remover sessões duplicadas (manter apenas a mais recente por usuário)
      const uniqueSessions = new Map();
      activeSessions.forEach((session: any) => {
        const existing = uniqueSessions.get(session.userId);
        if (!existing || new Date(session.loginTime) > new Date(existing.loginTime)) {
          uniqueSessions.set(session.userId, session);
        }
      });
      activeSessions = Array.from(uniqueSessions.values());
      
      // Se o usuário atual está logado, garantir que ele apareça como online
      if (currentUser) {
        const currentUserSession = activeSessions.find((s: any) => s.userId === currentUser.id);
        if (currentUserSession) {
          // Atualizar o loginTime do usuário atual para agora (sempre online)
          currentUserSession.loginTime = new Date().toISOString();
          // Atualizar no localStorage também, removendo duplicatas
          const updatedSessions = Array.from(
            new Map(
              sessions.map((s: any) => {
                if (s.userId === currentUser.id) {
                  return [s.userId, { ...s, loginTime: new Date().toISOString() }];
                }
                return [s.userId, s];
              })
            ).values()
          );
          localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
        } else {
          // Se não existe sessão, criar uma para o usuário atual
          const newSession = {
            userId: currentUser.id,
            username: currentUser.username,
            loginTime: new Date().toISOString(),
          };
          activeSessions.push(newSession);
          const allSessions = [...sessions, newSession];
          localStorage.setItem(sessionsKey, JSON.stringify(allSessions));
        }
      }
      
      setLoggedUsers(activeSessions);
      
      // Carregar e calcular ranking de usuários
      const userStatsKey = 'userQuizStats';
      const userStats: UserQuizStats[] = JSON.parse(localStorage.getItem(userStatsKey) || '[]');
      
      // Carregar dados de usuários para obter avatares
      const usersKey = 'users';
      const users: User[] = JSON.parse(localStorage.getItem(usersKey) || '[]');
      
      // Calcular ranking
      const rankings: UserRanking[] = userStats
        .map((stat) => {
          const user = users.find((u) => u.id === stat.userId);
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
            avatar: user?.avatar,
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
      
      setUserRankings(rankings);
    };
    
    loadStatistics();
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadStatistics, 5000);
    return () => clearInterval(interval);
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
              <p className="stat-value">{loggedUsers.length}</p>
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

        {loggedUsers.length > 0 && (
          <div className="stats-section">
            <h3>Usuários Ativos</h3>
            <div className="users-list">
              {loggedUsers.map((user, index) => {
                const loginDate = new Date(user.loginTime);
                const timeAgo = Math.floor((Date.now() - loginDate.getTime()) / 1000 / 60); // minutos
                const timeAgoText = timeAgo < 60 
                  ? `${timeAgo} min atrás`
                  : timeAgo < 1440
                  ? `${Math.floor(timeAgo / 60)} h atrás`
                  : `${Math.floor(timeAgo / 1440)} dias atrás`;
                
                const getUserAvatar = () => {
                  const userProfile = JSON.parse(localStorage.getItem(`userProfile_${user.userId}`) || '{}');
                  if (userProfile.uploadedImage) return { type: 'image', value: userProfile.uploadedImage };
                  if (userProfile.avatar) {
                    const avatar = PRESET_AVATARS.find(a => a.id === userProfile.avatar);
                    return { type: 'emoji', value: avatar ? avatar.emoji : '👤', color: avatar?.color || '#2563eb' };
                  }
                  return { type: 'emoji', value: '👤', color: '#2563eb' };
                };

                const avatar = getUserAvatar();
                
                // Verificar se está online (últimos 5 minutos) ou se é o usuário atual
                const isOnline = timeAgo < 5 || (currentUser && user.userId === currentUser.id);
                
                return (
                  <div 
                    key={user.userId || index} 
                    className="user-card-compact"
                    title={`${user.username} - ${isOnline ? 'Online' : 'Offline'} (${timeAgoText})`}
                  >
                    <div className="user-avatar-compact" style={avatar.type === 'emoji' ? { backgroundColor: avatar.color } : {}}>
                      {avatar.type === 'image' ? (
                        <img src={avatar.value} alt={user.username} className="user-avatar-image-compact" />
                      ) : (
                        <span className="user-avatar-emoji-compact">{avatar.value}</span>
                      )}
                    </div>
                    <div className="user-info-compact">
                      <span className="user-name-compact">{user.username}</span>
                      <span className="user-time-compact">{timeAgoText}</span>
                    </div>
                    <div className={`user-status-compact ${isOnline ? 'online' : 'offline'}`}>
                      {isOnline ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#10b981" stroke="white" strokeWidth="2"/>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#94a3b8" stroke="white" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <div className="user-tooltip">
                      <div className="tooltip-content">
                        <div className="tooltip-header">
                          <div className="tooltip-avatar" style={avatar.type === 'emoji' ? { backgroundColor: avatar.color } : {}}>
                            {avatar.type === 'image' ? (
                              <img src={avatar.value} alt={user.username} />
                            ) : (
                              <span>{avatar.value}</span>
                            )}
                          </div>
                          <div className="tooltip-info">
                            <div className="tooltip-name">{user.username}</div>
                            <div className={`tooltip-status ${isOnline ? 'online' : 'offline'}`}>
                              {isOnline ? '● Online' : '○ Offline'}
                            </div>
                          </div>
                        </div>
                        <div className="tooltip-time">Último acesso: {timeAgoText}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                const getAvatar = () => {
                  // Buscar avatar do perfil do usuário (mesmo método usado para usuários logados)
                  const userProfile = JSON.parse(localStorage.getItem(`userProfile_${ranking.userId}`) || '{}');
                  if (userProfile.uploadedImage) {
                    return { type: 'image' as const, value: userProfile.uploadedImage };
                  }
                  if (userProfile.avatar) {
                    const avatarData = PRESET_AVATARS.find((a) => a.id === userProfile.avatar);
                    if (avatarData) {
                      return { type: 'emoji' as const, value: avatarData.emoji, color: avatarData.color };
                    }
                  }
                  // Avatar padrão
                  const defaultAvatar = PRESET_AVATARS[0];
                  return { type: 'emoji' as const, value: defaultAvatar.emoji, color: defaultAvatar.color };
                };
                
                const avatar = getAvatar();
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
