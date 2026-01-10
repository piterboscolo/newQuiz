-- ============================================
-- VERIFICAR USUÁRIO "CAROLA" NO BANCO
-- ============================================
-- Execute este script para verificar se o usuário foi criado

-- ============================================
-- 1. BUSCAR USUÁRIO "CAROLA"
-- ============================================
SELECT 
  id,
  username,
  role,
  created_at,
  updated_at,
  CASE 
    WHEN created_at IS NOT NULL THEN '✅ Usuário existe no banco'
    ELSE '❌ Usuário não encontrado'
  END as status
FROM users
WHERE username ILIKE '%carola%'
ORDER BY created_at DESC;

-- ============================================
-- 2. LISTAR TODOS OS USUÁRIOS (ÚLTIMOS 10)
-- ============================================
SELECT 
  id,
  username,
  role,
  created_at,
  updated_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 3. VERIFICAR POLÍTICAS RLS DA TABELA USERS
-- ============================================
SELECT 
  policyname as nome_politica,
  cmd as operacao,
  qual as condicao_using,
  with_check as condicao_check,
  CASE 
    WHEN cmd = 'SELECT' THEN '🔍 Leitura'
    WHEN cmd = 'INSERT' THEN '➕ Inserção'
    WHEN cmd = 'UPDATE' THEN '✏️ Atualização'
    WHEN cmd = 'DELETE' THEN '🗑️ Deleção'
    ELSE cmd
  END as tipo_operacao
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY cmd;

-- ============================================
-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS está HABILITADO - políticas são aplicadas'
    ELSE '✅ RLS está DESABILITADO - todas operações permitidas'
  END as status_rls
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- ============================================
-- 5. TESTE DE INSERÇÃO MANUAL (OPCIONAL)
-- ============================================
-- Descomente para testar inserção direta
-- INSERT INTO users (username, password, role) 
-- VALUES ('carola_teste', 'teste123', 'aluno')
-- ON CONFLICT (username) DO NOTHING
-- RETURNING id, username, role, created_at;

-- ============================================
-- 6. VERIFICAR SESSÕES DO USUÁRIO
-- ============================================
SELECT 
  us.id,
  us.user_id,
  u.username,
  us.login_time,
  us.logout_time,
  us.is_active,
  CASE 
    WHEN us.is_active THEN '🟢 Sessão ativa'
    ELSE '🔴 Sessão inativa'
  END as status_sessao
FROM user_sessions us
JOIN users u ON u.id = us.user_id
WHERE u.username ILIKE '%carola%'
ORDER BY us.login_time DESC
LIMIT 5;

-- ============================================
-- 7. CONTAR TOTAL DE USUÁRIOS POR ROLE
-- ============================================
SELECT 
  role,
  COUNT(*) as total_usuarios,
  MIN(created_at) as primeiro_cadastro,
  MAX(created_at) as ultimo_cadastro
FROM users
GROUP BY role
ORDER BY total_usuarios DESC;

-- ============================================
-- INTERPRETAÇÃO DOS RESULTADOS
-- ============================================
-- 
-- Se o usuário "Carola" aparecer na query 1:
--   ✅ O usuário FOI criado no banco
--   🔍 Verifique se há problemas de permissão para visualizar
--
-- Se o usuário "Carola" NÃO aparecer:
--   ❌ O usuário NÃO foi criado no banco
--   🔍 Verifique as políticas RLS (query 3)
--   🔍 Verifique se RLS está habilitado (query 4)
--   🔍 Verifique os logs do console do navegador
--
-- Se as políticas RLS estiverem bloqueando INSERT:
--   💡 Execute o script supabase_fix_rls.sql
--
-- ============================================
