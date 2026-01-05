/**
 * Utilitário de debug para autenticação
 * Use no console do navegador para debugar problemas de login
 */

import { supabase } from '../lib/supabase';

export const debugAuth = {
  // Verificar conexão com Supabase
  async checkConnection() {
    console.log('🔍 Verificando conexão com Supabase...');
    console.log('URL:', process.env.REACT_APP_SUPABASE_URL);
    console.log('Key configurada:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Erro na conexão:', error);
        return false;
      }
      
      console.log('✅ Conexão OK');
      return true;
    } catch (err) {
      console.error('❌ Erro:', err);
      return false;
    }
  },

  // Listar todos os usuários
  async listUsers() {
    console.log('🔍 Listando usuários...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro:', error);
        return;
      }
      
      console.table(data);
      return data;
    } catch (err) {
      console.error('❌ Erro:', err);
    }
  },

  // Testar login
  async testLogin(username: string, password: string) {
    console.log(`🔍 Testando login: ${username}...`);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro na query:', error);
        return null;
      }
      
      if (!data) {
        console.log('❌ Usuário não encontrado ou senha incorreta');
        return null;
      }
      
      console.log('✅ Login OK:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro:', err);
      return null;
    }
  },

  // Verificar se usuário existe
  async checkUserExists(username: string) {
    console.log(`🔍 Verificando se usuário "${username}" existe...`);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('username', username)
        .limit(1);
      
      if (error) {
        console.error('❌ Erro:', error);
        return false;
      }
      
      if (data && data.length > 0) {
        const userData = data[0] as any;
        console.log('✅ Usuário existe:', userData);
        return true;
      }
      
      console.log('❌ Usuário não existe');
      return false;
    } catch (err) {
      console.error('❌ Erro:', err);
      return false;
    }
  },

  // Testar criação de usuário
  async testRegister(username: string, password: string, role: string = 'aluno') {
    console.log(`🔍 Testando cadastro: ${username}...`);
    
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .limit(1);
      
      if (existing && existing.length > 0) {
        console.log('❌ Usuário já existe:', existing[0]);
        return { success: false, error: 'Usuário já existe', existing: existing[0] };
      }
      
      const insertData = {
        username,
        password,
        role,
      };
      
      console.log('📤 Dados a inserir:', insertData);
      
      const { data, error } = await supabase
        .from('users')
        .insert(insertData as never)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro no cadastro:', error);
        console.error('Código:', error.code);
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
        
        // Análise do erro
        if (error.code === '42501' || error.message?.includes('permission')) {
          console.error('🔒 PROBLEMA: Política RLS bloqueando inserção!');
          console.error('💡 Solução: Execute supabase_fix_rls.sql no Supabase');
        } else if (error.code === '23505' || error.message?.includes('duplicate')) {
          console.error('🔒 PROBLEMA: Usuário duplicado!');
        } else if (error.code === 'PGRST301') {
          console.error('🔒 PROBLEMA: Erro de autenticação JWT!');
          console.error('💡 Solução: Verifique as variáveis de ambiente');
        }
        
        return { success: false, error };
      }
      
      if (!data) {
        console.log('❌ Usuário não foi criado (sem dados retornados)');
        return { success: false, error: 'Sem dados retornados' };
      }
      
      const userData = data as any;
      console.log('✅ Cadastro OK:', userData);
      return { success: true, data: userData };
    } catch (err) {
      console.error('❌ Erro:', err);
      return { success: false, error: err };
    }
  },

  // Verificar políticas RLS
  async checkRLS() {
    console.log('🔍 Verificando políticas RLS...');
    
    try {
      // Tentar ler usuários
      const { data: readData, error: readError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      console.log('Leitura:', readError ? '❌ Bloqueada' : '✅ Permitida', readError);
      
      // Tentar inserir (não vai inserir, só testar permissão)
      const testData = {
        username: 'test_rls_' + Date.now(),
        password: 'test',
        role: 'aluno'
      };
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(testData as never);
      
      console.log('Inserção:', insertError ? '❌ Bloqueada' : '✅ Permitida', insertError);
      
    } catch (err) {
      console.error('❌ Erro:', err);
    }
  }
};

// Disponibilizar no window para uso no console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  console.log('💡 Use debugAuth no console para debugar autenticação');
  console.log('   Exemplos:');
  console.log('   - debugAuth.checkConnection()');
  console.log('   - debugAuth.listUsers()');
  console.log('   - debugAuth.testLogin("admin", "admin123")');
  console.log('   - debugAuth.checkUserExists("admin")');
  console.log('   - debugAuth.checkRLS()');
}
