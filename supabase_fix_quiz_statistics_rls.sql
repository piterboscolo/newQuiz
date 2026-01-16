-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA quiz_statistics
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
--
-- PROBLEMA: As políticas RLS estão usando auth.uid() mas o projeto
-- não usa Supabase Auth, então auth.uid() sempre retorna NULL,
-- bloqueando INSERT e UPDATE na tabela quiz_statistics
-- ============================================

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS
-- ============================================
DROP POLICY IF EXISTS "Users can view their own statistics" ON quiz_statistics;
DROP POLICY IF EXISTS "Users can insert their own statistics" ON quiz_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON quiz_statistics;
DROP POLICY IF EXISTS "Admins can view all statistics" ON quiz_statistics;

-- ============================================
-- 2. CRIAR POLÍTICAS CORRIGIDAS
-- ============================================
-- Como não estamos usando Supabase Auth, as políticas precisam ser
-- mais permissivas. A validação de que o user_id pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS.

-- Política para visualizar estatísticas (todos podem ver)
CREATE POLICY "Users can view all statistics" 
ON quiz_statistics FOR SELECT 
USING (true);

-- Política para inserir estatísticas (todos podem criar)
-- NOTA: A validação de que o user_id pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can insert their own statistics" 
ON quiz_statistics FOR INSERT 
WITH CHECK (true);

-- Política para atualizar estatísticas (todos podem atualizar)
-- NOTA: A validação de que a estatística pertence ao usuário atual
-- deve ser feita na aplicação, não nas políticas RLS
CREATE POLICY "Users can update their own statistics" 
ON quiz_statistics FOR UPDATE 
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================
ALTER TABLE quiz_statistics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Como não estamos usando Supabase Auth, as políticas RLS são
-- mais permissivas. A segurança deve ser garantida na aplicação:
--
-- 1. Sempre valide que o user_id pertence ao usuário autenticado
--    antes de fazer INSERT/UPDATE
-- 2. Use a chave ANON do Supabase (não a SERVICE_ROLE)
-- 3. Em produção, considere implementar Supabase Auth ou
--    outra solução de autenticação adequada
-- ============================================
