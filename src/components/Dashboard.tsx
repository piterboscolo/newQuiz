import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlunoDashboard } from './AlunoDashboard';
import { AdminDashboard } from './AdminDashboard';
import './Dashboard.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>App Quiz</h1>
        <div className="user-info">
          <span>Olá, {user.username}</span>
          <span className="user-role">({user.role === 'admin' ? 'Administrador' : 'Aluno'})</span>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        {user.role === 'admin' ? <AdminDashboard /> : <AlunoDashboard />}
      </main>
    </div>
  );
}


