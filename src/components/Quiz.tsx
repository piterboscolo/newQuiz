import { useState, useEffect, useRef } from 'react';
import { Subject, Question, QuizResult } from '../types';
import './Quiz.css';

interface QuizProps {
  subject: Subject;
  questions: Question[];
  onComplete: (results: QuizResult[]) => void;
  onBack: () => void;
  onRestart?: () => void;
  quizKey?: number;
}

export function Quiz({ subject, questions, onComplete, onBack, onRestart, quizKey }: QuizProps) {
  // Fila de questões pendentes (modelo Duolingo)
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctQuestions, setCorrectQuestions] = useState<Set<string>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);

  // Inicializar a fila com todas as questões
  useEffect(() => {
    setQuestionQueue([...questions]);
    setCurrentQuestionIndex(0);
    setCorrectQuestions(new Set());
    setSelectedAnswer(-1);
    setAnswerResult(null);
    setIsComplete(false);
    setShowAnswer(false);
  }, [quizKey, questions]);

  const currentQuestion = questionQueue[currentQuestionIndex];
  const totalOriginalQuestions = questions.length;
  const correctCount = correctQuestions.size;
  const progress = totalOriginalQuestions > 0 ? (correctCount / totalOriginalQuestions) * 100 : 0;

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
    
    setTimeout(() => {
      if (answerResult) {
        // Acertou: marca como correta e remove da fila
        const updatedCorrectQuestions = new Set(correctQuestions);
        updatedCorrectQuestions.add(currentQuestion.id);
        setCorrectQuestions(updatedCorrectQuestions);
        
        const newQueue = questionQueue.filter((_, idx) => idx !== currentQuestionIndex);
        
        if (newQueue.length === 0) {
          // Todas as questões foram acertadas!
          // Aguardar um pouco antes de finalizar para mostrar o feedback
          setTimeout(() => {
            handleFinish(updatedCorrectQuestions);
          }, 300);
          return;
        }
        
        // Ajusta o índice se necessário
        const nextIndex = currentQuestionIndex >= newQueue.length ? 0 : currentQuestionIndex;
        setQuestionQueue(newQueue);
        setCurrentQuestionIndex(nextIndex);
      } else {
        // Errou: adiciona a questão de volta ao final da fila
        const newQueue = [...questionQueue];
        const wrongQuestion = newQueue.splice(currentQuestionIndex, 1)[0];
        newQueue.push(wrongQuestion);
        
        setQuestionQueue(newQueue);
        // Mantém o mesmo índice (a questão anterior foi removida, então a próxima está no mesmo lugar)
        if (currentQuestionIndex >= newQueue.length - 1) {
          setCurrentQuestionIndex(0);
        }
      }
      
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

  const handleFinish = (finalCorrectQuestions?: Set<string>) => {
    // Criar resultados baseados nas questões corretas
    // Usar o set passado como parâmetro ou o estado atual
    const correctSet = finalCorrectQuestions || correctQuestions;
    const results: QuizResult[] = questions.map((question) => ({
      questionId: question.id,
      selectedAnswer: -1, // Não rastreamos respostas individuais no modelo Duolingo
      isCorrect: correctSet.has(question.id), // Se a fila está vazia, todas foram acertadas
    }));
    setIsComplete(true);
    onComplete(results);
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
            {correctCount} de {totalOriginalQuestions} corretas
          </span>
        </div>
        {questionQueue.length > 0 && (
          <div className="queue-info">
            <span className="queue-text">
              {questionQueue.length} questão{questionQueue.length !== 1 ? 'ões' : ''} restante{questionQueue.length !== 1 ? 's' : ''}
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

