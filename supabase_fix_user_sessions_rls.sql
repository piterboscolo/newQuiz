-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA user_sessions
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
--
-- PROBLEMA: As políticas RLS estão usando auth.uid() mas o projeto
-- não usa Supabase Auth, então auth.uid() sempre retorna NULL,
-- bloqueando INSERT e UPDATE na tabela user_sessions
-- ============================================

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS
-- ============================================
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- ============================================
-- 2. CRIAR POLÍTICAS CORRIGIDAS
-- ============================================
-- Como não estamos usando Supabase Auth, as políticas precisam ser
-- mais permissivas. A validação de que o user_id pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS.

-- Política para visualizar sessões (todos podem ver)
CREATE POLICY "Users can view all sessions" 
ON user_sessions FOR SELECT 
USING (true);

-- Política para inserir sessões (todos podem criar)
-- NOTA: A validação de que o user_id pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can insert their own sessions" 
ON user_sessions FOR INSERT 
WITH CHECK (true);

-- Política para atualizar sessões (todos podem atualizar)
-- NOTA: A validação de que a sessão pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can update their own sessions" 
ON user_sessions FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Política para deletar sessões (todos podem deletar)
-- NOTA: A validação de que a sessão pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can delete their own sessions" 
ON user_sessions FOR DELETE 
USING (true);

-- ============================================
-- 3. GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. VERIFICAR POLÍTICAS CRIADAS (OPCIONAL)
-- ============================================
-- Descomente as linhas abaixo se quiser verificar as políticas criadas:
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'user_sessions';

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

