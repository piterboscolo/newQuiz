import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { getUserProfile } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Carregar usuário do banco se existir no localStorage
  useEffect(() => {
    const loadUser = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) return;

      try {
        const parsedUser = JSON.parse(stored);
        if (!parsedUser?.id) return;

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('user');
          setUser(null);
          return;
        }

        if (!data) {
          // Usuário não existe mais no banco, limpar localStorage
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Atualizar dados do usuário
          const userData = data as any;
          const updatedUser: User = {
            id: userData.id,
            username: userData.username,
            password: userData.password,
            role: userData.role as UserRole,
            avatar: userData.avatar || undefined,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Atualizar sessão no banco de dados
          try {
            const now = new Date().toISOString();
            
            // Verificar se já existe uma sessão ativa
            const { data: existingSession } = await supabase
              .from('user_sessions')
              .select('id')
              .eq('user_id', updatedUser.id)
              .eq('is_active', true)
              .maybeSingle();

            if (existingSession) {
              // Atualizar sessão existente
              await supabase
                .from('user_sessions')
                .update({
                  login_time: now,
                  is_active: true,
                  logout_time: null,
                } as never)
                .eq('id', (existingSession as any).id);
            } else {
              // Criar nova sessão
              await supabase
                .from('user_sessions')
                .insert({
                  user_id: updatedUser.id,
                  username: updatedUser.username,
                  login_time: now,
                  is_active: true,
                } as never);
            }
          } catch (sessionErr) {
            // Silenciar erro de sessão no carregamento inicial
            console.log('Nota: Sessão não atualizada no carregamento inicial');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        localStorage.removeItem('user');
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentando fazer login:', username);
      console.log('🔑 Senha fornecida:', password.substring(0, 2) + '***');
      
      // Buscar usuário com username e password juntos (mais eficiente)
      console.log('🔍 Buscando usuário no banco...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro na query de login:', error);
        console.error('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Se for erro de permissão, informar sobre RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.error('🔒 PROBLEMA: Política RLS bloqueando leitura!');
          console.error('💡 Solução: Execute supabase_fix_rls.sql no Supabase');
        }
        
        return false;
      }

      if (!data) {
        console.log('❌ Usuário não encontrado ou senha incorreta');
        
        // Verificar se pelo menos o usuário existe (para dar mensagem melhor)
        const { data: userExists } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .limit(1);
        
        if (userExists && userExists.length > 0) {
          console.log('⚠️ Usuário existe mas senha está incorreta');
        } else {
          console.log('⚠️ Usuário não existe no banco');
          console.log('💡 Solução: Execute supabase_fix_login.sql no Supabase para criar usuários padrão');
        }
        
        return false;
      }

      const userData = data as any;
      console.log('✅ Login bem-sucedido!', {
        id: userData.id,
        username: userData.username,
        role: userData.role
      });

      const foundUser: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        role: userData.role as UserRole,
        avatar: userData.avatar || undefined,
      };

      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));

      // Salvar sessão no banco de dados
      try {
        const now = new Date().toISOString();
        
        // Primeiro, verificar se já existe uma sessão ativa para este usuário
        const { data: existingSession, error: checkError } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('user_id', foundUser.id)
          .eq('is_active', true)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar sessão existente:', checkError);
        }

        if (existingSession) {
          // Atualizar sessão existente
          const { error: updateError } = await supabase
            .from('user_sessions')
            .update({
              login_time: now,
              is_active: true,
              logout_time: null,
            } as never)
            .eq('id', (existingSession as any).id);

          if (updateError) {
            console.error('❌ Erro ao atualizar sessão:', updateError);
            console.error('Detalhes:', {
              code: updateError.code,
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint
            });
          } else {
            console.log('✅ Sessão atualizada com sucesso');
          }
        } else {
          // Criar nova sessão
          const sessionData: {
            user_id: string;
            username: string;
            login_time: string;
            is_active: boolean;
          } = {
            user_id: foundUser.id,
            username: foundUser.username,
            login_time: now,
            is_active: true,
          };
          
          const { error: insertError } = await supabase
            .from('user_sessions')
            .insert(sessionData as never);

          if (insertError) {
            console.error('❌ Erro ao criar sessão:', insertError);
            console.error('Detalhes:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            });
            
            // Se for erro de política RLS, informar
            if (insertError.code === '42501' || insertError.message?.includes('permission') || insertError.message?.includes('policy')) {
              console.error('🔒 PROBLEMA: Política RLS bloqueando inserção de sessão!');
              console.error('💡 Solução: Verifique as políticas RLS da tabela user_sessions no Supabase');
            }
          } else {
            console.log('✅ Sessão criada com sucesso');
          }
        }
      } catch (sessionErr: any) {
        console.error('❌ Erro ao criar/atualizar sessão:', sessionErr);
        console.error('Stack:', sessionErr.stack);
      }

      return true;
    } catch (err) {
      console.error('Erro no login:', err);
      return false;
    }
  };

  const register = async (username: string, password: string, role: UserRole = 'aluno'): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📝 Tentando cadastrar usuário:', username);
      
      // Validações
      if (username.length < 3) {
        console.log('❌ Validação falhou: username muito curto');
        return { success: false, message: 'Usuário deve ter pelo menos 3 caracteres' };
      }

      if (password.length < 6) {
        console.log('❌ Validação falhou: senha muito curta');
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }

      console.log('✅ Validações passaram');

      // Verificar se usuário já existe
      console.log('🔍 Verificando se usuário já existe...');
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .limit(1);

      if (checkError) {
        console.error('❌ Erro ao verificar usuário:', checkError);
        console.error('Detalhes:', {
          code: checkError.code,
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint
        });
        
        // Se for erro de política RLS, retornar mensagem específica
        if (checkError.code === '42501' || checkError.message?.includes('permission')) {
          return { success: false, message: 'Erro de permissão. Verifique as políticas RLS no Supabase.' };
        }
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0] as any;
        console.log('❌ Usuário já existe:', existingUser.username);
        return { success: false, message: 'Usuário já existe' };
      }

      console.log('✅ Usuário não existe, prosseguindo com cadastro...');

      // Criar novo usuário no banco
      const userData: {
        username: string;
        password: string;
        role: UserRole;
      } = {
        username,
        password,
        role,
      };
      
      console.log('💾 Tentando inserir usuário no banco...');
      console.log('📤 Dados a inserir:', { username, role, password: '***' });
      
      const { data: newUser, error: insertError } = await (supabase
        .from('users')
        .insert(userData as never)
        .select()
        .maybeSingle());

      if (insertError) {
        console.error('❌ Erro ao criar usuário:', insertError);
        console.error('Detalhes do erro:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Verificar se é erro de duplicata
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
          console.log('⚠️ Usuário já existe no banco');
          return { success: false, message: 'Usuário já existe' };
        }
        
        // Verificar se é erro de política RLS
        if (insertError.code === '42501' || insertError.message?.includes('permission') || insertError.message?.includes('policy')) {
          console.error('🔒 ERRO CRÍTICO: Política RLS bloqueando inserção!');
          console.error('💡 Solução: Execute o script supabase_fix_rls.sql no Supabase');
          console.error('📖 Veja TROUBLESHOOTING_PRODUCAO.md para mais detalhes');
          return { success: false, message: 'Erro de permissão. Execute o script supabase_fix_rls.sql no Supabase para corrigir as políticas RLS.' };
        }
        
        // Verificar se é erro de JWT/autenticação
        if (insertError.code === 'PGRST301' || insertError.message?.includes('JWT') || insertError.message?.includes('secret')) {
          console.error('🔒 ERRO CRÍTICO: Problema de autenticação JWT!');
          console.error('💡 Solução: Verifique as variáveis de ambiente no Vercel');
          console.error('📖 Veja TROUBLESHOOTING_PRODUCAO.md para mais detalhes');
          return { success: false, message: 'Erro de autenticação. Verifique as variáveis de ambiente no Vercel e faça um novo deploy.' };
        }
        
        // Erro genérico
        console.error('❌ Erro desconhecido ao criar usuário');
        return { success: false, message: `Erro ao criar usuário: ${insertError.message || 'Tente novamente'}` };
      }

      if (!newUser) {
        console.error('❌ Usuário não foi criado (sem dados retornados)');
        console.error('💡 Isso pode indicar que:');
        console.error('   1. A inserção foi bloqueada silenciosamente');
        console.error('   2. As políticas RLS não permitem retornar dados');
        console.error('   3. Há um problema com a query SELECT após INSERT');
        
        // Tentar verificar se o usuário foi criado mesmo assim
        console.log('🔍 Verificando se o usuário foi criado mesmo sem retorno...');
        const { data: verifyUser } = await supabase
          .from('users')
          .select('id, username, role')
          .eq('username', username)
          .maybeSingle();
        
        if (verifyUser) {
          console.log('✅ Usuário FOI criado! Mas não foi retornado pela query INSERT');
          console.log('📋 Dados do usuário:', verifyUser);
          return { success: true, message: 'Cadastro realizado com sucesso!' };
        } else {
          console.error('❌ Usuário realmente NÃO foi criado no banco');
          return { success: false, message: 'Erro ao criar usuário. Nenhum dado retornado do banco.' };
        }
      }

      const newUserData = newUser as any;
      console.log('✅ Usuário cadastrado com sucesso!', {
        id: newUserData.id,
        username: newUserData.username,
        role: newUserData.role,
        created_at: newUserData.created_at
      });
      
      // Verificação adicional: confirmar que o usuário existe no banco
      console.log('🔍 Verificação adicional: confirmando que usuário existe no banco...');
      const { data: confirmUser } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', newUserData.id)
        .maybeSingle();
      
      if (confirmUser) {
        console.log('✅ Confirmação: Usuário existe no banco de dados');
      } else {
        console.error('⚠️ AVISO: Usuário não encontrado na verificação adicional!');
      }
      
      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);
      console.error('Stack trace:', err.stack);
      return { success: false, message: `Erro ao criar usuário: ${err.message || 'Tente novamente'}` };
    }
  };

  const refreshUser = async () => {
    const currentUser = user;
    if (!currentUser?.id) return;

    try {
      // Buscar dados do usuário da tabela users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        return;
      }

      if (data) {
        const userData = data as any;
        
        // Buscar avatar do perfil (user_profiles) para garantir que temos o mais atualizado
        let avatarValue = userData.avatar || undefined;
        try {
          const profileResult = await getUserProfile(currentUser.id);
          if (profileResult.success && profileResult.profile) {
            // Priorizar uploaded_image sobre avatar
            avatarValue = profileResult.profile.uploaded_image || profileResult.profile.avatar || userData.avatar || undefined;
          }
        } catch (profileErr) {
          console.error('Erro ao buscar perfil para atualizar avatar:', profileErr);
          // Continuar com o avatar da tabela users se houver erro
        }

        const updatedUser: User = {
          id: userData.id,
          username: userData.username,
          password: userData.password,
          role: userData.role as UserRole,
          avatar: avatarValue,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Usuário atualizado no contexto com avatar:', avatarValue ? 'definido' : 'não definido');
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
    }
  };

  const logout = async () => {
    const currentUser = user;
    
    // Atualizar sessão no banco de dados ANTES de limpar o estado
    if (currentUser) {
      try {
        const now = new Date().toISOString();
        const updateData: {
          is_active: boolean;
          logout_time: string;
        } = {
          is_active: false,
          logout_time: now,
        };
        
        console.log('🚪 Fazendo logout do usuário:', currentUser.username);
        
        // Desativar TODAS as sessões ativas do usuário (pode haver múltiplas)
        const { data, error } = await supabase
          .from('user_sessions')
          .update(updateData as never)
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .select();

        if (error) {
          console.error('❌ Erro ao atualizar sessão no logout:', error);
          console.error('Detalhes:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // Se for erro de política RLS, informar
          if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
            console.error('🔒 PROBLEMA: Política RLS bloqueando atualização de sessão!');
            console.error('💡 Solução: Execute supabase_fix_user_sessions_rls.sql no Supabase');
          }
        } else {
          const updatedCount = data?.length || 0;
          if (updatedCount > 0) {
            console.log(`✅ ${updatedCount} sessão(ões) desativada(s) com sucesso`);
          } else {
            console.log('⚠️ Nenhuma sessão ativa encontrada para desativar');
          }
        }
      } catch (err: any) {
        console.error('❌ Erro ao atualizar sessão no logout:', err);
        console.error('Stack:', err.stack);
      }
    }

    // Limpar estado do usuário após atualizar a sessão
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
        refreshUser,
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

