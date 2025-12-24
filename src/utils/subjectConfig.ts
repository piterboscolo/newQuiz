import { Subject } from '../types';

export interface SubjectConfig {
  icon: string;
  color: string;
  gradient: string;
}

const subjectConfigs: Record<string, SubjectConfig> = {
  'Matemática': {
    icon: '🔢',
    color: '#4A90E2',
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
  },
  'Português': {
    icon: '📚',
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
  },
  'História': {
    icon: '🏛️',
    color: '#F39C12',
    gradient: 'linear-gradient(135deg, #F39C12 0%, #D68910 100%)',
  },
  'Geografia': {
    icon: '🌍',
    color: '#27AE60',
    gradient: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
  },
  'Ciências': {
    icon: '🔬',
    color: '#9B59B6',
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
  },
  'Inglês': {
    icon: '🇬🇧',
    color: '#3498DB',
    gradient: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
  },
  'Física': {
    icon: '⚛️',
    color: '#E67E22',
    gradient: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
  },
  'Química': {
    icon: '🧪',
    color: '#1ABC9C',
    gradient: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)',
  },
};

export function getSubjectConfig(subject: Subject): SubjectConfig {
  return subjectConfigs[subject.name] || {
    icon: '📖',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };
}

