-- ============================================
-- TESTE DE PERFORMANCE - BANCO DE DADOS
-- ============================================
-- Este script testa a performance de várias operações

-- ============================================
-- 1. TESTE DE LEITURA - BUSCAR USUÁRIOS
-- ============================================
EXPLAIN ANALYZE
SELECT * FROM users 
WHERE username LIKE 'loadtest_user_%' 
LIMIT 100;

-- ============================================
-- 2. TESTE DE LEITURA - ESTATÍSTICAS COM JOIN
-- ============================================
EXPLAIN ANALYZE
SELECT 
  u.username,
  s.name as materia,
  qs.total_attempts,
  qs.correct_answers,
  qs.wrong_answers
FROM quiz_statistics qs
JOIN users u ON qs.user_id = u.id
JOIN subjects s ON qs.subject_id = s.id
WHERE u.username LIKE 'loadtest_user_%'
ORDER BY qs.last_attempt_date DESC
LIMIT 100;

-- ============================================
-- 3. TESTE DE AGRAGAÇÃO - RANKING
-- ============================================
EXPLAIN ANALYZE
SELECT 
  ROW_NUMBER() OVER (ORDER BY uqs.total_first_attempt_correct DESC) as posicao,
  u.username,
  uqs.total_quizzes,
  uqs.total_first_attempt_correct,
  ROUND((uqs.total_first_attempt_correct::numeric / NULLIF(uqs.total_questions, 0)) * 100, 2) as precisao
FROM user_quiz_stats uqs
JOIN users u ON uqs.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
ORDER BY uqs.total_first_attempt_correct DESC
LIMIT 50;

-- ============================================
-- 4. TESTE DE CONTAGEM - ESTATÍSTICAS POR MATÉRIA
-- ============================================
EXPLAIN ANALYZE
SELECT 
  s.name as materia,
  COUNT(DISTINCT qs.user_id) as total_alunos,
  SUM(qs.total_attempts) as total_tentativas,
  SUM(qs.correct_answers) as total_acertos,
  AVG(qs.correct_answers::numeric / NULLIF(qs.total_attempts, 0)) as taxa_media
FROM subjects s
LEFT JOIN quiz_statistics qs ON s.id = qs.subject_id
GROUP BY s.id, s.name
ORDER BY total_tentativas DESC;

-- ============================================
-- 5. TESTE DE BUSCA - QUESTÕES RESPONDIDAS
-- ============================================
EXPLAIN ANALYZE
SELECT 
  u.username,
  s.name as materia,
  COUNT(aq.id) as total_respondidas
FROM answered_questions aq
JOIN users u ON aq.user_id = u.id
JOIN subjects s ON aq.subject_id = s.id
WHERE u.username LIKE 'loadtest_user_%'
GROUP BY u.id, u.username, s.id, s.name
ORDER BY total_respondidas DESC
LIMIT 100;

-- ============================================
-- 6. TESTE DE ESCRITA - INSERIR NOVA ESTATÍSTICA
-- ============================================
DO $$
DECLARE
  test_user_id UUID;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
BEGIN
  -- Pegar um usuário de teste
  SELECT id INTO test_user_id 
  FROM users 
  WHERE username LIKE 'loadtest_user_%' 
  LIMIT 1;
  
  -- Teste de inserção
  start_time := clock_timestamp();
  
  INSERT INTO quiz_statistics (user_id, subject_id, total_attempts, correct_answers, wrong_answers)
  VALUES (test_user_id, '1', 1, 1, 0)
  ON CONFLICT (user_id, subject_id) DO UPDATE SET
    total_attempts = quiz_statistics.total_attempts + 1,
    correct_answers = quiz_statistics.correct_answers + 1,
    updated_at = NOW();
  
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE 'Tempo de inserção/atualização: %', duration;
END $$;

-- ============================================
-- 7. TESTE DE ESCRITA EM MASSA
-- ============================================
DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
  rows_affected INTEGER;
BEGIN
  start_time := clock_timestamp();
  
  INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at)
  SELECT 
    u.id,
    q.subject_id,
    q.id,
    NOW()
  FROM users u
  CROSS JOIN questions q
  WHERE u.username LIKE 'loadtest_user_%'
    AND random() < 0.1
  LIMIT 1000
  ON CONFLICT (user_id, question_id) DO NOTHING;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE 'Inserção em massa: % linhas em %', rows_affected, duration;
END $$;

-- ============================================
-- 8. TESTE DE ÍNDICES
-- ============================================
-- Verificar se os índices estão sendo usados
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users 
WHERE username = 'loadtest_user_50';

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM quiz_statistics 
WHERE user_id = (SELECT id FROM users WHERE username = 'loadtest_user_50' LIMIT 1);

-- ============================================
-- 9. ESTATÍSTICAS DO BANCO
-- ============================================
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 10. CONTAGEM DE REGISTROS POR TABELA
-- ============================================
SELECT 
  'users' as tabela,
  COUNT(*) as total_registros
FROM users
WHERE username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'user_profiles',
  COUNT(*)
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'user_sessions',
  COUNT(*)
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'quiz_statistics',
  COUNT(*)
FROM quiz_statistics qs
JOIN users u ON qs.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'user_quiz_stats',
  COUNT(*)
FROM user_quiz_stats uqs
JOIN users u ON uqs.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'answered_questions',
  COUNT(*)
FROM answered_questions aq
JOIN users u ON aq.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%';
