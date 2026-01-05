import { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { Subject, Question, QuizResult, UserQuizStats } from '../types';
import { Quiz } from './Quiz';
import { getSubjectConfig } from '../utils/subjectConfig';
import './AlunoDashboard.css';

interface AlunoDashboardProps {
  onQuizStateChange?: (isActive: boolean) => void;
}

export function AlunoDashboard({ onQuizStateChange }: AlunoDashboardProps) {
  const { subjects, getQuestionsBySubject } = useQuiz();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizKey, setQuizKey] = useState(() => Date.now());

  useEffect(() => {
    if (onQuizStateChange) {
      onQuizStateChange(isQuizActive);
    }
  }, [isQuizActive, onQuizStateChange]);

  const handleSelectSubject = (subject: Subject) => {
    const subjectQuestions = getQuestionsBySubject(subject.id);
    if (subjectQuestions.length === 0) {
      alert('Esta matéria ainda não possui questões disponíveis.');
      return;
    }
    setSelectedSubject(subject);
    setQuestions(subjectQuestions);
    setIsQuizActive(true);
    setResults([]);
    setQuizKey(Date.now()); // Nova key única quando iniciar novo quiz
  };

  const handleQuizComplete = (quizResults: QuizResult[], attempts?: { correct: number; wrong: number }) => {
    setResults(quizResults);
    setIsQuizActive(false);
    
    // Salvar estatísticas
    if (selectedSubject) {
      // Usar as tentativas reais do quiz (acertos e erros durante todo o processo)
      // Se não foram fornecidas, usar o resultado final como fallback
      const correctCount = attempts?.correct ?? quizResults.filter((r) => r.isCorrect).length;
      const wrongCount = attempts?.wrong ?? (quizResults.length - correctCount);
      
      // Debug: log para verificar os valores
      console.log('Estatísticas do Quiz:', {
        subject: selectedSubject.name,
        correct: correctCount,
        wrong: wrongCount,
        attempts: attempts
      });
      
      // Obter estatísticas existentes
      const statsKey = 'quizStatistics';
      const existingStats = JSON.parse(localStorage.getItem(statsKey) || '[]');
      
      // Encontrar ou criar estatística para esta matéria
      const subjectStatsIndex = existingStats.findIndex(
        (s: any) => s.subjectId === selectedSubject.id
      );
      
      if (subjectStatsIndex >= 0) {
        existingStats[subjectStatsIndex].totalAttempts += 1;
        existingStats[subjectStatsIndex].correctAnswers += correctCount;
        existingStats[subjectStatsIndex].wrongAnswers += wrongCount;
        existingStats[subjectStatsIndex].lastAttemptDate = new Date().toISOString();
      } else {
        existingStats.push({
          subjectId: selectedSubject.id,
          totalAttempts: 1,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          lastAttemptDate: new Date().toISOString(),
        });
      }
      
      console.log('Estatísticas salvas:', existingStats[subjectStatsIndex >= 0 ? subjectStatsIndex : existingStats.length - 1]);
      localStorage.setItem(statsKey, JSON.stringify(existingStats));
      
      // Salvar estatísticas por usuário para o ranking
      if (user) {
        const userStatsKey = 'userQuizStats';
        const existingUserStats = JSON.parse(localStorage.getItem(userStatsKey) || '[]');
        const userStatsIndex = existingUserStats.findIndex(
          (s: UserQuizStats) => s.userId === user.id
        );
        
        // O correctCount já representa acertos de primeira tentativa (conforme lógica do Quiz.tsx)
        const firstAttemptCorrect = correctCount;
        const totalQuestions = quizResults.length;
        
        if (userStatsIndex >= 0) {
          existingUserStats[userStatsIndex].totalQuizzes += 1;
          existingUserStats[userStatsIndex].totalFirstAttemptCorrect += firstAttemptCorrect;
          existingUserStats[userStatsIndex].totalQuestions += totalQuestions;
          existingUserStats[userStatsIndex].lastQuizDate = new Date().toISOString();
        } else {
          existingUserStats.push({
            userId: user.id,
            username: user.username,
            totalQuizzes: 1,
            totalFirstAttemptCorrect: firstAttemptCorrect,
            totalQuestions: totalQuestions,
            lastQuizDate: new Date().toISOString(),
          });
        }
        
        localStorage.setItem(userStatsKey, JSON.stringify(existingUserStats));
      }
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setIsQuizActive(false);
    setResults([]);
  };

  const handleRestartQuiz = () => {
    // Limpa os resultados primeiro
    setResults([]);
    // Garante que o quiz está ativo
    if (selectedSubject) {
      const subjectQuestions = getQuestionsBySubject(selectedSubject.id);
      if (subjectQuestions.length > 0) {
        setQuestions(subjectQuestions);
        setIsQuizActive(true);
        // Gera uma nova key única baseada em timestamp
        // Isso força a remontagem COMPLETA do componente Quiz
        setQuizKey(Date.now());
      }
    } else {
      // Se não houver matéria selecionada, gera nova key
      setQuizKey(Date.now());
    }
  };

  if (isQuizActive && selectedSubject && questions.length > 0) {
    return (
      <Quiz
        key={quizKey}
        quizKey={quizKey}
        subject={selectedSubject}
        questions={questions}
        onComplete={handleQuizComplete}
        onBack={handleBackToSubjects}
        onRestart={handleRestartQuiz}
      />
    );
  }

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalQuestions = results.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="aluno-dashboard">
      {results.length > 0 ? (
        <div className="quiz-results">
          <h2>Resultado do Quiz</h2>
          <div className="result-card">
            <div className="result-score">
              <div className="score-circle">
                <span className="score-number">{percentage}%</span>
              </div>
              <p className="score-text">
                Você acertou {correctCount} de {totalQuestions} questões
              </p>
            </div>
            <div className="result-details">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <span>Questão {index + 1}:</span>
                  <span>{result.isCorrect ? '✓ Correto' : '✗ Incorreto'}</span>
                </div>
              ))}
            </div>
            <div className="result-actions">
              <button onClick={handleRestartQuiz} className="restart-button">
                ↻ Reiniciar Quiz
              </button>
              <button onClick={handleBackToSubjects} className="back-button">
                Voltar para Matérias
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-header-section">
            <h2>Selecione uma Matéria</h2>
            <p className="dashboard-subtitle">Escolha uma matéria para começar o quiz</p>
          </div>
          <div className="subjects-grid">
            {subjects.map((subject) => {
              const questionCount = getQuestionsBySubject(subject.id).length;
              const config = getSubjectConfig(subject);
              return (
                <div
                  key={subject.id}
                  className="subject-card"
                  style={{ '--subject-color': config.color, '--subject-gradient': config.gradient } as React.CSSProperties}
                >
                  <div className="subject-card-header">
                    <div className="subject-icon" style={{ background: config.gradient }}>
                      <span className="icon-emoji">{config.icon}</span>
                    </div>
                    <div className="subject-info">
                      <h3>{subject.name}</h3>
                      <p>{subject.description}</p>
                    </div>
                  </div>
                  <div className="subject-card-footer">
                    <div className="question-count">
                      <span className="count-number">{questionCount}</span>
                      <span className="count-label">
                        {questionCount === 1 ? 'questão' : 'questões'}
                      </span>
                    </div>
                    <button
                      className="access-button"
                      onClick={() => handleSelectSubject(subject)}
                      disabled={questionCount === 0}
                    >
                      Acessar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

