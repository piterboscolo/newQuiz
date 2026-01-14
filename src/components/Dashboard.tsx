import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlunoDashboard } from './AlunoDashboard';
import { AdminDashboard } from './AdminDashboard';
import { Profile } from './Profile';
import { getUserProfile } from '../services/profileService';
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Carregar avatar do perfil do usuário
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) {
        setUserAvatar(null);
        return;
      }

      // Primeiro tentar usar o avatar do contexto
      if (user.avatar) {
        setUserAvatar(user.avatar);
        return;
      }

      // Se não tiver avatar no contexto, buscar do user_profiles
      try {
        const result = await getUserProfile(user.id);
        if (result.success && result.profile) {
          const avatar = result.profile.uploaded_image || result.profile.avatar || null;
          setUserAvatar(avatar);
        } else {
          setUserAvatar(null);
        }
      } catch (err) {
        console.error('Erro ao carregar avatar:', err);
        setUserAvatar(null);
      }
    };

    loadUserAvatar();
  }, [user]);

  // Logout automático após 10 minutos de inatividade
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos em milissegundos

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(async () => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          await logout();
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

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer, true);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, logout, navigate]);

  if (!user) {
    return null;
  }

  const getUserAvatar = () => {
    // Priorizar avatar carregado do perfil, depois do contexto
    const avatarValue = userAvatar || user?.avatar;
    
    if (avatarValue) {
      // Se for uma imagem (data:image), retornar diretamente
      if (avatarValue.startsWith('data:image')) {
        return avatarValue;
      }
      // Se for um ID de avatar preset, buscar o emoji
      const avatar = PRESET_AVATARS.find(a => a.id === avatarValue);
      return avatar ? avatar.emoji : avatarValue;
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
          <Profile 
            onBack={() => {
              setShowProfile(false);
              // Recarregar avatar quando fechar o perfil
              if (user) {
                getUserProfile(user.id).then(result => {
                  if (result.success && result.profile) {
                    const avatar = result.profile.uploaded_image || result.profile.avatar || null;
                    setUserAvatar(avatar);
                  }
                });
              }
            }} 
          />
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
