-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA user_profiles
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
--
-- PROBLEMA: As políticas RLS estão usando auth.uid() mas o projeto
-- não usa Supabase Auth, então auth.uid() sempre retorna NULL,
-- bloqueando INSERT e UPDATE na tabela user_profiles
-- ============================================

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- ============================================
-- 2. CRIAR POLÍTICAS CORRIGIDAS
-- ============================================
-- Como não estamos usando Supabase Auth, as políticas precisam ser
-- mais permissivas. Em produção, considere implementar autenticação adequada.

-- Política para visualizar perfis (todos podem ver)
CREATE POLICY "Users can view all profiles" 
ON user_profiles FOR SELECT 
USING (true);

-- Política para inserir perfis (todos podem criar)
-- NOTA: A validação de que o user_id pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (true);

-- Política para atualizar perfis (todos podem atualizar)
-- NOTA: A validação de que o perfil pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Política para deletar perfis (todos podem deletar)
-- NOTA: A validação de que o perfil pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can delete their own profile" 
ON user_profiles FOR DELETE 
USING (true);

-- ============================================
-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Se RLS não estiver habilitado, execute:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. VERIFICAR POLÍTICAS CRIADAS
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
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Como não estamos usando Supabase Auth, as políticas RLS são
-- mais permissivas. A segurança deve ser garantida na aplicação:
--
-- 1. Sempre valide que o user_id pertence ao usuário autenticado
--    antes de fazer INSERT/UPDATE/DELETE
-- 2. Use a chave ANON do Supabase (não a SERVICE_ROLE)
-- 3. Em produção, considere implementar Supabase Auth ou
--    outra solução de autenticação adequada
-- ============================================

