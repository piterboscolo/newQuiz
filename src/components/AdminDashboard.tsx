import { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { QuizStatistics } from '../types';
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
      // Filtrar sessões ativas (últimas 24 horas)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let activeSessions = sessions.filter((s: any) => {
        const sessionDate = new Date(s.loginTime);
        return sessionDate > oneDayAgo;
      });
      
      // Se o usuário atual está logado, garantir que ele apareça como online
      if (currentUser) {
        const currentUserSession = activeSessions.find((s: any) => s.userId === currentUser.id);
        if (currentUserSession) {
          // Atualizar o loginTime do usuário atual para agora (sempre online)
          currentUserSession.loginTime = new Date().toISOString();
          // Atualizar no localStorage também
          const updatedSessions = sessions.map((s: any) => {
            if (s.userId === currentUser.id) {
              return { ...s, loginTime: new Date().toISOString() };
            }
            return s;
          });
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

        <div className="stats-section">
          <h3>Estatísticas por Matéria</h3>
          <div className="subject-stats-grid">
            {subjects.map((subject) => {
              const subjectStats = statistics.find((s) => s.subjectId === subject.id);
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
                <div key={subject.id} className="subject-stat-card">
                  <h4>{subject.name}</h4>
                  <div className="stat-details">
                    <div className="stat-row">
                      <span className="stat-label">Tentativas:</span>
                      <span className="stat-number">{subjectStats?.totalAttempts || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label stat-correct">Acertos:</span>
                      <span className="stat-number">{subjectStats?.correctAnswers || 0}</span>
                      {totalAnswers > 0 && (
                        <span className="stat-percentage">({correctPercentage}%)</span>
                      )}
                    </div>
                    <div className="stat-row">
                      <span className="stat-label stat-wrong">Erros:</span>
                      <span className="stat-number">{subjectStats?.wrongAnswers || 0}</span>
                      {totalAnswers > 0 && (
                        <span className="stat-percentage">({wrongPercentage}%)</span>
                      )}
                    </div>
                    <div className="stat-progress-bar">
                      <div 
                        className="stat-progress-correct" 
                        style={{ width: `${correctPercentage}%` }}
                      ></div>
                      <div 
                        className="stat-progress-wrong" 
                        style={{ width: `${wrongPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
