import { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { QuizStatistics } from '../types';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { subjects } = useQuiz();
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
      const activeSessions = sessions.filter((s: any) => {
        const sessionDate = new Date(s.loginTime);
        return sessionDate > oneDayAgo;
      });
      setLoggedUsers(activeSessions);
    };
    
    loadStatistics();
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadStatistics, 5000);
    return () => clearInterval(interval);
  }, []);

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
