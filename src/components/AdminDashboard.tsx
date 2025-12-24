import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { Subject, Question } from '../types';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { subjects, questions, addSubject, addQuestion, updateQuestion, deleteQuestion } = useQuiz();
  const [activeTab, setActiveTab] = useState<'subjects' | 'questions'>('subjects');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [questionForm, setQuestionForm] = useState({
    subjectId: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
    funFact: '',
  });

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectForm.name,
      description: subjectForm.description,
    };

    addSubject(newSubject);
    setSubjectForm({ name: '', description: '' });
    setShowSubjectForm(false);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.question.trim() || !questionForm.subjectId) return;

    const newQuestion: Question = {
      id: editingQuestion?.id || Date.now().toString(),
      subjectId: questionForm.subjectId,
      question: questionForm.question,
      options: [
        questionForm.option1,
        questionForm.option2,
        questionForm.option3,
        questionForm.option4,
      ],
      correctAnswer: questionForm.correctAnswer,
      funFact: questionForm.funFact.trim() || undefined,
    };

    if (editingQuestion) {
      updateQuestion(newQuestion);
      setEditingQuestion(null);
    } else {
      addQuestion(newQuestion);
    }

    setQuestionForm({
      subjectId: '',
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      funFact: '',
    });
    setShowQuestionForm(false);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      subjectId: question.subjectId,
      question: question.question,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correctAnswer: question.correctAnswer,
      funFact: question.funFact || '',
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta questão?')) {
      deleteQuestion(questionId);
    }
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || 'Desconhecida';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          Matérias
        </button>
        <button
          className={activeTab === 'questions' ? 'active' : ''}
          onClick={() => setActiveTab('questions')}
        >
          Questões
        </button>
      </div>

      {activeTab === 'subjects' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gerenciar Matérias</h2>
            <button
              onClick={() => setShowSubjectForm(!showSubjectForm)}
              className="add-button"
            >
              {showSubjectForm ? 'Cancelar' : '+ Adicionar Matéria'}
            </button>
          </div>

          {showSubjectForm && (
            <form onSubmit={handleAddSubject} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome da Matéria</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={subjectForm.description}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <button type="submit" className="submit-button">
                Adicionar
              </button>
            </form>
          )}

          <div className="items-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className="item-card">
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
                <div className="item-meta">
                  {questions.filter((q) => q.subjectId === subject.id).length}{' '}
                  questões
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gerenciar Questões</h2>
            <button
              onClick={() => {
                setShowQuestionForm(!showQuestionForm);
                setEditingQuestion(null);
                setQuestionForm({
                  subjectId: '',
                  question: '',
                  option1: '',
                  option2: '',
                  option3: '',
                  option4: '',
                  correctAnswer: 0,
                  funFact: '',
                });
              }}
              className="add-button"
            >
              {showQuestionForm ? 'Cancelar' : '+ Adicionar Questão'}
            </button>
          </div>

          {showQuestionForm && (
            <form onSubmit={handleAddQuestion} className="admin-form">
              <div className="form-group">
                <label>Matéria</label>
                <select
                  value={questionForm.subjectId}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, subjectId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione uma matéria</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Questão</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, question: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opção 1</label>
                  <input
                    type="text"
                    value={questionForm.option1}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, option1: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Opção 2</label>
                  <input
                    type="text"
                    value={questionForm.option2}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, option2: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opção 3</label>
                  <input
                    type="text"
                    value={questionForm.option3}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, option3: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Opção 4</label>
                  <input
                    type="text"
                    value={questionForm.option4}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, option4: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Resposta Correta</label>
                <select
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value={0}>Opção 1</option>
                  <option value={1}>Opção 2</option>
                  <option value={2}>Opção 3</option>
                  <option value={3}>Opção 4</option>
                </select>
              </div>
              <div className="form-group">
                <label>Curiosidade (Fun Fact) - Opcional</label>
                <textarea
                  value={questionForm.funFact}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, funFact: e.target.value })
                  }
                  rows={3}
                  placeholder="Adicione uma curiosidade interessante sobre esta questão..."
                />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '5px' }}>
                  Esta curiosidade será mostrada quando o aluno responder a questão (tanto ao acertar quanto ao errar).
                </small>
              </div>
              <button type="submit" className="submit-button">
                {editingQuestion ? 'Atualizar' : 'Adicionar'}
              </button>
            </form>
          )}

          <div className="questions-list">
            {questions.map((question) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <h4>{question.question}</h4>
                  <span className="question-subject">
                    {getSubjectName(question.subjectId)}
                  </span>
                </div>
                <div className="question-options">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`question-option ${
                        index === question.correctAnswer ? 'correct' : ''
                      }`}
                    >
                      {option}
                      {index === question.correctAnswer && ' ✓'}
                    </div>
                  ))}
                </div>
                <div className="question-actions">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="delete-button"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

