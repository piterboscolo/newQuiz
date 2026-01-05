-- ============================================
-- SCRIPT DE VERIFICAÇÃO - DADOS DO BANCO
-- ============================================
-- Execute este script para verificar se os dados foram populados corretamente

-- ============================================
-- 1. RESUMO GERAL
-- ============================================
SELECT 
  '📊 RESUMO GERAL' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  'Usuários cadastrados' as item,
  COUNT(*)::text as valor
FROM users
UNION ALL
SELECT 
  'Matérias disponíveis',
  COUNT(*)::text
FROM subjects
UNION ALL
SELECT 
  'Questões cadastradas',
  COUNT(*)::text
FROM questions
UNION ALL
SELECT 
  'Perfis de usuário',
  COUNT(*)::text
FROM user_profiles
UNION ALL
SELECT 
  'Sessões ativas',
  COUNT(*)::text
FROM user_sessions
WHERE is_active = true
UNION ALL
SELECT 
  'Estatísticas de quiz',
  COUNT(*)::text
FROM quiz_statistics
UNION ALL
SELECT 
  'Estatísticas gerais',
  COUNT(*)::text
FROM user_quiz_stats
UNION ALL
SELECT 
  'Questões respondidas',
  COUNT(*)::text
FROM answered_questions;

-- ============================================
-- 2. LISTA DE USUÁRIOS
-- ============================================
SELECT 
  '👥 USUÁRIOS' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  id,
  username,
  role,
  created_at
FROM users
ORDER BY created_at;

-- ============================================
-- 3. PERFIS DE USUÁRIO
-- ============================================
SELECT 
  '👤 PERFIS' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  u.username,
  up.avatar,
  CASE WHEN up.uploaded_image IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_imagem,
  up.updated_at
FROM user_profiles up
JOIN users u ON up.user_id = u.id
ORDER BY u.username;

-- ============================================
-- 4. SESSÕES ATIVAS
-- ============================================
SELECT 
  '🔐 SESSÕES ATIVAS' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  username,
  login_time,
  is_active,
  CASE 
    WHEN logout_time IS NOT NULL THEN logout_time
    ELSE NULL
  END as logout_time
FROM user_sessions
WHERE is_active = true
ORDER BY login_time DESC;

-- ============================================
-- 5. ESTATÍSTICAS POR USUÁRIO
-- ============================================
SELECT 
  '📈 ESTATÍSTICAS POR USUÁRIO' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  u.username,
  u.role,
  COALESCE(uqs.total_quizzes, 0) as total_quizzes,
  COALESCE(uqs.total_first_attempt_correct, 0) as acertos_primeira,
  COALESCE(uqs.total_questions, 0) as total_questoes,
  CASE 
    WHEN uqs.total_questions > 0 THEN 
      ROUND((uqs.total_first_attempt_correct::numeric / uqs.total_questions) * 100, 2)
    ELSE 0
  END as precisao_percentual,
  uqs.last_quiz_date
FROM users u
LEFT JOIN user_quiz_stats uqs ON u.id = uqs.user_id
ORDER BY uqs.total_first_attempt_correct DESC NULLS LAST;

-- ============================================
-- 6. ESTATÍSTICAS POR MATÉRIA
-- ============================================
SELECT 
  '📚 ESTATÍSTICAS POR MATÉRIA' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  s.name as materia,
  COUNT(DISTINCT qs.user_id) as total_alunos,
  SUM(qs.total_attempts) as total_tentativas,
  SUM(qs.correct_answers) as total_acertos,
  SUM(qs.wrong_answers) as total_erros,
  CASE 
    WHEN SUM(qs.total_attempts) > 0 THEN
      ROUND((SUM(qs.correct_answers)::numeric / SUM(qs.total_attempts)) * 100, 2)
    ELSE 0
  END as taxa_acerto_percentual
FROM subjects s
LEFT JOIN quiz_statistics qs ON s.id = qs.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- ============================================
-- 7. RANKING DE USUÁRIOS
-- ============================================
SELECT 
  '🏆 RANKING DE USUÁRIOS' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  ROW_NUMBER() OVER (
    ORDER BY 
      uqs.total_first_attempt_correct DESC, 
      uqs.total_quizzes DESC
  ) as posicao,
  u.username,
  uqs.total_quizzes,
  uqs.total_first_attempt_correct,
  uqs.total_questions,
  CASE 
    WHEN uqs.total_questions > 0 THEN
      ROUND((uqs.total_first_attempt_correct::numeric / uqs.total_questions) * 100, 2)
    ELSE 0
  END as precisao_percentual,
  uqs.last_quiz_date
FROM user_quiz_stats uqs
JOIN users u ON uqs.user_id = u.id
ORDER BY 
  uqs.total_first_attempt_correct DESC, 
  uqs.total_quizzes DESC;

-- ============================================
-- 8. QUESTÕES MAIS RESPONDIDAS
-- ============================================
SELECT 
  '❓ QUESTÕES MAIS RESPONDIDAS' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  s.name as materia,
  q.question,
  COUNT(aq.id) as vezes_respondida
FROM answered_questions aq
JOIN questions q ON aq.question_id = q.id
JOIN subjects s ON q.subject_id = s.id
GROUP BY s.name, q.question, q.id
ORDER BY vezes_respondida DESC
LIMIT 10;

-- ============================================
-- 9. ATIVIDADE RECENTE
-- ============================================
SELECT 
  '🕐 ATIVIDADE RECENTE' as secao,
  '' as detalhe,
  '' as valor;

SELECT 
  u.username,
  s.name as materia,
  qs.last_attempt_date,
  qs.total_attempts,
  qs.correct_answers,
  qs.wrong_answers
FROM quiz_statistics qs
JOIN users u ON qs.user_id = u.id
JOIN subjects s ON qs.subject_id = s.id
ORDER BY qs.last_attempt_date DESC
LIMIT 10;

-- ============================================
-- 10. VERIFICAÇÃO DE INTEGRIDADE
-- ============================================
SELECT 
  '✅ VERIFICAÇÃO DE INTEGRIDADE' as secao,
  '' as detalhe,
  '' as valor;

-- Verificar referências quebradas
SELECT 
  'Questões sem matéria' as verificacao,
  COUNT(*)::text as quantidade
FROM questions q
LEFT JOIN subjects s ON q.subject_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT 
  'Estatísticas sem usuário',
  COUNT(*)::text
FROM quiz_statistics qs
LEFT JOIN users u ON qs.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
  'Estatísticas sem matéria',
  COUNT(*)::text
FROM quiz_statistics qs
LEFT JOIN subjects s ON qs.subject_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT 
  'Questões respondidas sem usuário',
  COUNT(*)::text
FROM answered_questions aq
LEFT JOIN users u ON aq.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
  'Questões respondidas sem questão',
  COUNT(*)::text
FROM answered_questions aq
LEFT JOIN questions q ON aq.question_id = q.id
WHERE q.id IS NULL;

-- ============================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- ============================================
