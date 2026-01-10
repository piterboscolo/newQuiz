import { useState, useEffect, useRef } from 'react';
import { Subject, Question, QuizResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveAnsweredQuestions, getAnsweredQuestions } from '../services/quizService';
import './Quiz.css';

interface QuizProps {
  subject: Subject;
  questions: Question[];
  onComplete: (results: QuizResult[], attempts?: { correct: number; wrong: number }) => void;
  onBack: () => void;
  onRestart?: () => void;
  quizKey?: number;
}

export function Quiz({ subject, questions, onComplete, onBack, onRestart, quizKey }: QuizProps) {
  const { user } = useAuth();
  // Sistema simplificado: todas as questões são respondidas uma vez
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<string, boolean>>(new Map()); // questionId -> isCorrect
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);
  // Rastrear todas as tentativas de resposta (acertos e erros) usando useRef para garantir que sempre temos o valor atualizado
  const totalAttemptsRef = useRef({ correct: 0, wrong: 0 });
  const [totalAttempts, setTotalAttempts] = useState({ correct: 0, wrong: 0 });
  // Rastrear quais questões já foram respondidas em tentativas anteriores (para não contar novamente)
  const [previouslyAnsweredQuestions, setPreviouslyAnsweredQuestions] = useState<Set<string>>(new Set());

  // Inicializar o quiz
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnsweredQuestions(new Map());
    setSelectedAnswer(-1);
    setAnswerResult(null);
    setIsComplete(false);
    setShowAnswer(false);
    totalAttemptsRef.current = { correct: 0, wrong: 0 };
    setTotalAttempts({ correct: 0, wrong: 0 });
    
    // Carregar questões já respondidas anteriormente do Supabase
    const loadAnsweredQuestions = async () => {
      if (user) {
        try {
          const result = await getAnsweredQuestions(user.id, subject.id);
          if (result.success && result.questionIds) {
            setPreviouslyAnsweredQuestions(new Set(result.questionIds));
            console.log(`✅ ${result.questionIds.length} questão(ões) já respondida(s) carregada(s)`);
          }
        } catch (err) {
          console.error('❌ Erro ao carregar questões respondidas:', err);
        }
      }
    };
    
    loadAnsweredQuestions();
  }, [quizKey, questions, subject.id]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = answeredQuestions.size;
  const correctCount = Array.from(answeredQuestions.values()).filter(v => v === true).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswer || !currentQuestion) return; // Prevenir múltiplos cliques
    
    // Verificar se está correto ANTES de atualizar o estado
    const isAnswerCorrect = answerIndex === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answerIndex);
    setAnswerResult(isAnswerCorrect);
    
    // Pequeno delay para melhorar a experiência e animar a seleção
    setTimeout(() => {
      setShowAnswer(true);
      
      // Scroll suave para mostrar o feedback após um pequeno delay
      setTimeout(() => {
        if (feedbackRef.current) {
          const element = feedbackRef.current;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px de offset
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Fallback para mobile
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 400);
    }, 100);
  };

  const handleNext = () => {
    if (!currentQuestion || selectedAnswer === -1 || answerResult === null) return;

    setIsTransitioning(true);
    
    // Verificar se é a primeira vez que esta questão está sendo respondida
    const isFirstAttempt = !previouslyAnsweredQuestions.has(currentQuestion.id);
    
    // Só contar para estatísticas se for a primeira tentativa desta questão
    if (isFirstAttempt) {
      if (answerResult) {
        totalAttemptsRef.current.correct += 1;
      } else {
        totalAttemptsRef.current.wrong += 1;
      }
      // Atualizar também o estado para exibição
      setTotalAttempts({ ...totalAttemptsRef.current });
    }
    
    // Marcar a questão como respondida nesta tentativa (acertada ou errada)
    const updatedAnsweredQuestions = new Map(answeredQuestions);
    updatedAnsweredQuestions.set(currentQuestion.id, answerResult);
    setAnsweredQuestions(updatedAnsweredQuestions);
    
    // Se for a primeira tentativa, adicionar ao conjunto de questões já respondidas
    if (isFirstAttempt) {
      const updatedPreviouslyAnswered = new Set(previouslyAnsweredQuestions);
      updatedPreviouslyAnswered.add(currentQuestion.id);
      setPreviouslyAnsweredQuestions(updatedPreviouslyAnswered);
    }
    
    setTimeout(() => {
      // Verificar se todas as questões foram respondidas
      if (currentQuestionIndex + 1 >= totalQuestions) {
        // Todas as questões foram respondidas!
        // Aguardar um pouco antes de finalizar para mostrar o feedback
        setTimeout(() => {
          handleFinish(updatedAnsweredQuestions, { ...totalAttemptsRef.current });
        }, 300);
        return;
      }
      
      // Avançar para a próxima questão
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      setSelectedAnswer(-1);
      setAnswerResult(null);
      setShowAnswer(false);
      setIsTransitioning(false);
    }, 500); // Delay maior para mostrar o feedback
  };

  const handleRestart = () => {
    // Chamar a função de reiniciar do pai
    // Isso vai gerar uma nova key única e forçar remontagem completa
    // Não precisamos resetar aqui porque o componente será completamente remontado
    if (onRestart) {
      onRestart();
    }
  };

  const handleFinish = (finalAnsweredQuestions?: Map<string, boolean>, finalAttempts?: { correct: number; wrong: number }) => {
    // Criar resultados baseados nas questões respondidas
    // Usar o map passado como parâmetro ou o estado atual
    const answeredMap = finalAnsweredQuestions || answeredQuestions;
    
    // Salvar histórico de questões respondidas no Supabase
    if (user) {
      const allAnsweredQuestionIds = Array.from(new Set([
        ...Array.from(previouslyAnsweredQuestions),
        ...Array.from(answeredMap.keys())
      ]));
      
      if (allAnsweredQuestionIds.length > 0) {
        saveAnsweredQuestions(user.id, subject.id, allAnsweredQuestionIds)
          .then((result) => {
            if (result.success) {
              console.log('✅ Questões respondidas salvas no Supabase');
            } else {
              console.error('❌ Erro ao salvar questões respondidas:', result.error);
            }
          })
          .catch((err) => {
            console.error('❌ Erro ao salvar questões respondidas:', err);
          });
      }
    }
    
    // Criar resultados: usar o resultado da primeira tentativa de cada questão
    // Se a questão já foi respondida antes, usar o resultado da primeira vez
    // Se não, usar o resultado desta tentativa
    const results: QuizResult[] = questions.map((question) => {
      // Se já foi respondida antes, verificar no histórico
      // Por enquanto, vamos usar o resultado desta tentativa, mas as estatísticas já foram contabilizadas apenas na primeira vez
      const isCorrect = answeredMap.get(question.id) || false;
      return {
        questionId: question.id,
        selectedAnswer: -1,
        isCorrect: isCorrect,
      };
    });
    
    setIsComplete(true);
    // Passar também as estatísticas de tentativas (acertos e erros totais)
    // Priorizar o valor passado como parâmetro, senão usar o ref (que sempre tem o valor atualizado)
    const attemptsToPass = finalAttempts || { ...totalAttemptsRef.current };
    console.log('Quiz finalizado - Tentativas (apenas primeira vez):', attemptsToPass);
    onComplete(results, attemptsToPass);
  };

  if (isComplete) {
    return null;
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-container">
        <div className="quiz-content">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-header-top">
          <button onClick={onBack} className="back-button-small">
            ← Voltar para Matérias
          </button>
          {onRestart && (
            <button onClick={handleRestart} className="restart-button-small">
              ↻ Reiniciar Quiz
            </button>
          )}
        </div>
        <h2>{subject.name}</h2>
        <div className="quiz-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {answeredCount} de {totalQuestions} respondidas ({correctCount} corretas)
          </span>
        </div>
        {currentQuestionIndex < totalQuestions && (
          <div className="queue-info">
            <span className="queue-text">
              Questão {currentQuestionIndex + 1} de {totalQuestions}
            </span>
          </div>
        )}
      </div>

      <div className="quiz-content">
        <div 
          ref={questionCardRef}
          className={`question-card ${isTransitioning ? 'transitioning' : ''} ${showAnswer ? 'answer-revealed' : ''}`}
        >
          <h3 className="question-text">{currentQuestion.question}</h3>
          <div className="options-list">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              let buttonClass = 'option-button';
              
              if (showAnswer) {
                if (isSelected && answerResult) {
                  // Resposta selecionada e correta
                  buttonClass += ' correct-answer';
                } else if (isSelected && !answerResult) {
                  // Resposta selecionada e incorreta
                  buttonClass += ' incorrect-answer';
                } else if (isCorrectAnswer && !isSelected) {
                  // Resposta correta não selecionada (mostrar quando errou)
                  buttonClass += ' correct-answer';
                }
              } else if (isSelected) {
                // Apenas selecionada, ainda não mostrou resposta
                buttonClass += ' selected';
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => !showAnswer && handleAnswerSelect(index)}
                  disabled={showAnswer}
                >
                  {option}
                  {showAnswer && isCorrectAnswer && (
                    <span className="correct-indicator">✓ Resposta Correta</span>
                  )}
                  {showAnswer && isSelected && !answerResult && (
                    <span className="incorrect-indicator">✗ Sua Resposta</span>
                  )}
                </button>
              );
            })}
          </div>
          {showAnswer && currentQuestion && answerResult !== null && (
            <div 
              ref={feedbackRef}
              className={`answer-feedback ${!answerResult ? 'incorrect-feedback' : 'correct-feedback'} ${showAnswer ? 'show' : ''}`}
            >
              {!answerResult ? (
                <div className="feedback-content">
                  <p className="feedback-message">Você errou! Esta questão voltará ao final para tentar novamente. A resposta correta está destacada em verde.</p>
                  {currentQuestion.funFact && (
                    <div className="fun-fact">
                      <div className="fun-fact-icon">💡</div>
                      <div className="fun-fact-content">
                        <strong>Curiosidade:</strong>
                        <p>{currentQuestion.funFact}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="feedback-content">
                  <p className="feedback-message">Parabéns! Você acertou! ✓ Continue assim!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="quiz-navigation">
          <button
            onClick={handleNext}
            disabled={!showAnswer || selectedAnswer === -1}
            className="nav-button primary"
            style={{ width: '100%' }}
          >
            {answerResult 
              ? 'Continuar' 
              : 'Tentar Novamente Mais Tarde'}
          </button>
        </div>
      </div>
    </div>
  );
}

