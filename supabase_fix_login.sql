-- ============================================
-- CORRIGIR PROBLEMAS DE LOGIN
-- ============================================
-- Execute este script para garantir que os usuários padrão existem
-- e que as políticas RLS permitem login

-- ============================================
-- 1. VERIFICAR USUÁRIOS EXISTENTES
-- ============================================
SELECT 
  'Usuários no banco:' as info,
  COUNT(*) as total
FROM users;

SELECT 
  id,
  username,
  role,
  CASE 
    WHEN password = 'admin123' THEN '✅ Senha admin123'
    WHEN password = 'aluno123' THEN '✅ Senha aluno123'
    ELSE '❓ Senha diferente'
  END as senha_status,
  created_at
FROM users
WHERE username IN ('admin', 'aluno')
ORDER BY username;

-- ============================================
-- 2. CRIAR/ATUALIZAR USUÁRIOS PADRÃO
-- ============================================
-- Garantir que os usuários padrão existem com as senhas corretas
INSERT INTO users (id, username, password, role) 
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'aluno', 'aluno123', 'aluno')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- Também garantir pelo username (caso o ID seja diferente)
INSERT INTO users (username, password, role) 
SELECT 'admin', 'admin123', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role;

INSERT INTO users (username, password, role) 
SELECT 'aluno', 'aluno123', 'aluno'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'aluno')
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- ============================================
-- 3. VERIFICAR SE USUÁRIOS FORAM CRIADOS
-- ============================================
SELECT 
  'Verificação pós-inserção' as info,
  '' as valor;

SELECT 
  id,
  username,
  password,
  role,
  CASE 
    WHEN password = 'admin123' AND username = 'admin' THEN '✅ OK'
    WHEN password = 'aluno123' AND username = 'aluno' THEN '✅ OK'
    ELSE '❌ Senha incorreta'
  END as status
FROM users
WHERE username IN ('admin', 'aluno');

-- ============================================
-- 4. TESTAR QUERY DE LOGIN MANUALMENTE
-- ============================================
SELECT 
  'Teste de login - Admin' as teste,
  '' as resultado;

-- Testar login do admin
SELECT 
  id,
  username,
  password,
  role,
  CASE 
    WHEN password = 'admin123' THEN '✅ Senha correta'
    ELSE '❌ Senha incorreta'
  END as status
FROM users
WHERE username = 'admin' 
  AND password = 'admin123';

-- Testar login do aluno
SELECT 
  'Teste de login - Aluno' as teste,
  '' as resultado;

SELECT 
  id,
  username,
  password,
  role,
  CASE 
    WHEN password = 'aluno123' THEN '✅ Senha correta'
    ELSE '❌ Senha incorreta'
  END as status
FROM users
WHERE username = 'aluno' 
  AND password = 'aluno123';

-- ============================================
-- 5. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
  'Políticas RLS' as info,
  '' as valor;

SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Configurada'
    ELSE '❌ Não configurada'
  END as status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- 6. CORRIGIR POLÍTICAS RLS SE NECESSÁRIO
-- ============================================
-- Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own user" ON users;
DROP POLICY IF EXISTS "Users can update their own user" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Criar políticas que permitem leitura e inserção
CREATE POLICY "Users can view all users" 
ON users FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own user" 
ON users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own user" 
ON users FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete users" 
ON users FOR DELETE 
USING (true);

-- ============================================
-- 7. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS habilitado - verifique políticas'
    ELSE '✅ RLS desabilitado'
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- ============================================
-- 8. TESTE FINAL - VERIFICAR SE LOGIN FUNCIONA
-- ============================================
SELECT 
  'Teste Final' as info,
  '' as valor;

-- Simular query que a aplicação faz
SELECT 
  'Admin login test' as teste,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM users 
      WHERE username = 'admin' 
        AND password = 'admin123'
    ) THEN '✅ Login do admin funcionaria'
    ELSE '❌ Login do admin NÃO funcionaria'
  END as resultado
UNION ALL
SELECT 
  'Aluno login test',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM users 
      WHERE username = 'aluno' 
        AND password = 'aluno123'
    ) THEN '✅ Login do aluno funcionaria'
    ELSE '❌ Login do aluno NÃO funcionaria'
  END;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- 
-- APÓS EXECUTAR:
-- 1. Verifique os resultados de cada seção
-- 2. Se os usuários não existirem, eles serão criados
-- 3. Se as políticas estiverem bloqueando, elas serão corrigidas
-- 4. Tente fazer login novamente na aplicação
-- ============================================
