import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, role?: UserRole) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários padrão (em produção, isso viria de um backend)
const defaultUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'aluno', password: 'aluno123', role: 'aluno' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const getUsers = (): User[] => {
    const stored = localStorage.getItem('users');
    if (stored) {
      return JSON.parse(stored);
    }
    // Salvar usuários padrão na primeira vez
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      
      // Salvar sessão de usuário logado
      const sessionsKey = 'userSessions';
      const existingSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
      const session = {
        userId: foundUser.id,
        username: foundUser.username,
        loginTime: new Date().toISOString(),
      };
      
      // Remover sessões antigas (mais de 24 horas)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeSessions = existingSessions.filter((s: any) => {
        const sessionDate = new Date(s.loginTime);
        return sessionDate > oneDayAgo && s.userId !== foundUser.id;
      });
      
      // Adicionar nova sessão se não existir
      if (!activeSessions.find((s: any) => s.userId === foundUser.id)) {
        activeSessions.push(session);
      }
      
      localStorage.setItem(sessionsKey, JSON.stringify(activeSessions));
      return true;
    }
    return false;
  };

  const register = (username: string, password: string, role: UserRole = 'aluno'): { success: boolean; message: string } => {
    const users = getUsers();
    
    if (users.find((u) => u.username === username)) {
      return { success: false, message: 'Usuário já existe' };
    }

    if (username.length < 3) {
      return { success: false, message: 'Usuário deve ter pelo menos 3 caracteres' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    return { success: true, message: 'Cadastro realizado com sucesso!' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

