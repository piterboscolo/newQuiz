-- ============================================
-- LIMPEZA - REMOVER DADOS DE TESTE DE CARGA
-- ============================================
-- ATENÇÃO: Este script remove TODOS os dados de teste de carga
-- Execute apenas se quiser limpar os dados gerados pelo teste

-- ============================================
-- CONFIRMAÇÃO
-- ============================================
-- Descomente as linhas abaixo para executar a limpeza

-- ============================================
-- 1. REMOVER QUESTÕES RESPONDIDAS
-- ============================================
-- DELETE FROM answered_questions 
-- WHERE user_id IN (
--   SELECT id FROM users WHERE username LIKE 'loadtest_user_%'
-- );

-- ============================================
-- 2. REMOVER ESTATÍSTICAS DE QUIZ
-- ============================================
-- DELETE FROM quiz_statistics 
-- WHERE user_id IN (
--   SELECT id FROM users WHERE username LIKE 'loadtest_user_%'
-- );

-- ============================================
-- 3. REMOVER ESTATÍSTICAS GERAIS
-- ============================================
-- DELETE FROM user_quiz_stats 
-- WHERE user_id IN (
--   SELECT id FROM users WHERE username LIKE 'loadtest_user_%'
-- );

-- ============================================
-- 4. REMOVER PERFIS
-- ============================================
-- DELETE FROM user_profiles 
-- WHERE user_id IN (
--   SELECT id FROM users WHERE username LIKE 'loadtest_user_%'
-- );

-- ============================================
-- 5. REMOVER SESSÕES
-- ============================================
-- DELETE FROM user_sessions 
-- WHERE user_id IN (
--   SELECT id FROM users WHERE username LIKE 'loadtest_user_%'
-- );

-- ============================================
-- 6. REMOVER USUÁRIOS
-- ============================================
-- DELETE FROM users 
-- WHERE username LIKE 'loadtest_user_%';

-- ============================================
-- VERIFICAÇÃO APÓS LIMPEZA
-- ============================================
-- Execute após a limpeza para verificar
SELECT 
  'Usuários de teste restantes' as item,
  COUNT(*)::text as valor
FROM users
WHERE username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Estatísticas de teste restantes',
  COUNT(*)::text
FROM quiz_statistics qs
JOIN users u ON qs.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Questões respondidas de teste restantes',
  COUNT(*)::text
FROM answered_questions aq
JOIN users u ON aq.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%';
