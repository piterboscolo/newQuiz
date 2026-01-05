-- ============================================
-- VERIFICAR E CORRIGIR USUÁRIOS PADRÃO
-- ============================================
-- Execute este script para verificar se os usuários padrão existem

-- 1. Verificar usuários existentes
SELECT 
  'Usuários no banco:' as info,
  COUNT(*) as total
FROM users;

SELECT 
  id,
  username,
  role,
  created_at
FROM users
ORDER BY created_at;

-- 2. Verificar se usuários padrão existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN '✅ Admin existe'
    ELSE '❌ Admin NÃO existe'
  END as status_admin,
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE username = 'aluno') THEN '✅ Aluno existe'
    ELSE '❌ Aluno NÃO existe'
  END as status_aluno;

-- 3. Inserir usuários padrão se não existirem
INSERT INTO users (id, username, password, role) 
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'aluno', 'aluno123', 'aluno')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- 4. Verificar novamente após inserção
SELECT 
  id,
  username,
  role,
  CASE 
    WHEN password = 'admin123' THEN '✅ Senha correta'
    ELSE '❌ Senha diferente'
  END as senha_status
FROM users
WHERE username IN ('admin', 'aluno');

-- 5. Testar query de login (simular login do admin)
SELECT 
  id,
  username,
  password,
  role
FROM users
WHERE username = 'admin' 
  AND password = 'admin123';

-- 6. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;
