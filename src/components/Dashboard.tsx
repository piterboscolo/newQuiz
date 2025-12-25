import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlunoDashboard } from './AlunoDashboard';
import { AdminDashboard } from './AdminDashboard';
import { Profile } from './Profile';
import './Dashboard.css';

const PRESET_AVATARS = [
  { id: 'avatar1', emoji: '👤', color: '#2563eb' },
  { id: 'avatar2', emoji: '🎓', color: '#10b981' },
  { id: 'avatar3', emoji: '🧑‍💻', color: '#f59e0b' },
  { id: 'avatar4', emoji: '👨‍🎓', color: '#8b5cf6' },
  { id: 'avatar5', emoji: '👩‍🎓', color: '#ec4899' },
  { id: 'avatar6', emoji: '🧑‍🔬', color: '#06b6d4' },
  { id: 'avatar7', emoji: '👨‍🏫', color: '#ef4444' },
  { id: 'avatar8', emoji: '👩‍🏫', color: '#14b8a6' },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Logout automático após 10 minutos de inatividade e ao fechar a aplicação
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos em milissegundos

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(() => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          logout();
          navigate('/');
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Eventos que indicam atividade do usuário
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    // Limpar sessão ao fechar a aba/janela
    const handleBeforeUnload = () => {
      if (user) {
        const sessionsKey = 'userSessions';
        const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
        const updatedSessions = sessions.filter((s: any) => s.userId !== user.id);
        localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
      }
    };

    // Limpar sessão quando a página fica oculta (aba inativa)
    const handleVisibilityChange = () => {
      if (document.hidden && user) {
        const sessionsKey = 'userSessions';
        const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
        const updatedSessions = sessions.filter((s: any) => s.userId !== user.id);
        localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer, true);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, logout, navigate]);

  if (!user) {
    return null;
  }

  const getUserAvatar = () => {
    const userProfile = JSON.parse(localStorage.getItem(`userProfile_${user.id}`) || '{}');
    if (userProfile.uploadedImage) return userProfile.uploadedImage;
    if (userProfile.avatar) {
      const avatar = PRESET_AVATARS.find(a => a.id === userProfile.avatar);
      return avatar ? avatar.emoji : '👤';
    }
    return '👤';
  };

  const avatar = getUserAvatar();
  const isImage = avatar.startsWith('data:image');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          <button 
            onClick={() => setShowProfile(!showProfile)} 
            className="user-avatar-button"
            title="Meu Perfil"
          >
            {isImage ? (
              <img src={avatar} alt="Avatar" className="header-avatar-image" />
            ) : (
              <div className="header-avatar-emoji">{avatar}</div>
            )}
          </button>
          <span>Olá, {user.username}</span>
          <span className="user-role">({user.role === 'admin' ? 'Administrador' : 'Aluno'})</span>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        {showProfile ? (
          <Profile onBack={() => setShowProfile(false)} />
        ) : (
          user.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <AlunoDashboard onQuizStateChange={setIsQuizActive} />
          )
        )}
      </main>
    </div>
  );
}
