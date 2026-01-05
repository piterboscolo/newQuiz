-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA CRIAÇÃO DE USUÁRIOS
-- ============================================
-- Execute este script se a criação de usuários não estiver funcionando

-- ============================================
-- 1. VERIFICAR POLÍTICAS ATUAIS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- ============================================
-- 2. REMOVER POLÍTICAS EXISTENTES (SE NECESSÁRIO)
-- ============================================
-- Descomente se precisar remover políticas antigas
-- DROP POLICY IF EXISTS "Users can view all users" ON users;
-- DROP POLICY IF EXISTS "Users can insert their own user" ON users;
-- DROP POLICY IF EXISTS "Users can update their own user" ON users;
-- DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- ============================================
-- 3. CRIAR POLÍTICAS CORRIGIDAS
-- ============================================

-- Política para visualizar usuários (todos podem ver)
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" 
ON users FOR SELECT 
USING (true);

-- Política para inserir usuários (todos podem criar - necessário para registro)
DROP POLICY IF EXISTS "Users can insert their own user" ON users;
CREATE POLICY "Users can insert their own user" 
ON users FOR INSERT 
WITH CHECK (true);

-- Política para atualizar usuários (usuários podem atualizar apenas seus próprios dados)
DROP POLICY IF EXISTS "Users can update their own user" ON users;
CREATE POLICY "Users can update their own user" 
ON users FOR UPDATE 
USING (true)  -- Temporariamente permitir todos para facilitar testes
WITH CHECK (true);

-- Política para deletar usuários (apenas admins)
DROP POLICY IF EXISTS "Admins can delete users" ON users;
CREATE POLICY "Admins can delete users" 
ON users FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Se RLS não estiver habilitado, execute:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. TESTE DE INSERÇÃO (OPCIONAL)
-- ============================================
-- Descomente para testar a inserção
-- INSERT INTO users (username, password, role) 
-- VALUES ('teste_rls', 'teste123', 'aluno')
-- ON CONFLICT (username) DO NOTHING;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Se ainda não funcionar, pode ser que o Supabase esteja usando
-- autenticação diferente. Nesse caso, você pode temporariamente
-- desabilitar RLS para testes (NÃO RECOMENDADO EM PRODUÇÃO):
--
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
--
-- Ou usar a service_role key ao invés da anon key no cliente Supabase
-- ============================================
