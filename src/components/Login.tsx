import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (login(username, password)) {
      navigate('/dashboard');
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const result = register(username, password);
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        setIsRegister(false);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>App Quiz</h1>
        <h2>{isRegister ? 'Cadastro' : 'Login'}</h2>
        
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
              />
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="login-button">
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="switch-mode">
          <p>
            {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <button type="button" onClick={switchMode} className="switch-button">
              {isRegister ? 'Fazer login' : 'Cadastrar-se'}
            </button>
          </p>
        </div>

        {!isRegister && (
          <div className="login-hint">
            <p>Usuários de teste:</p>
            <p>Admin: admin / admin123</p>
            <p>Aluno: aluno / aluno123</p>
          </div>
        )}
      </div>
    </div>
  );
}

