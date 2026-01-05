-- ============================================
-- TESTE DE CARGA - BANCO DE DADOS
-- ============================================
-- Este script gera dados em massa para testar a performance do banco
-- ATENÇÃO: Este script pode demorar alguns minutos dependendo dos volumes

-- ============================================
-- CONFIGURAÇÃO - AJUSTE OS VALORES AQUI
-- ============================================
DO $$
DECLARE
  -- Ajuste estes valores conforme necessário
  num_users INTEGER := 100;           -- Número de usuários a criar
  num_questions_per_user INTEGER := 50; -- Questões respondidas por usuário
  num_quizzes_per_user INTEGER := 10;  -- Quizzes por usuário
BEGIN

-- ============================================
-- 1. CRIAR USUÁRIOS EM MASSA
-- ============================================
RAISE NOTICE 'Criando % usuários...', num_users;

INSERT INTO users (id, username, password, role)
SELECT 
  gen_random_uuid(),
  'loadtest_user_' || generate_series,
  'test123',
  CASE WHEN random() < 0.1 THEN 'admin' ELSE 'aluno' END
FROM generate_series(1, num_users)
ON CONFLICT (username) DO NOTHING;

RAISE NOTICE 'Usuários criados!';

-- ============================================
-- 2. CRIAR PERFIS PARA OS USUÁRIOS
-- ============================================
RAISE NOTICE 'Criando perfis de usuário...';

INSERT INTO user_profiles (user_id, avatar, uploaded_image)
SELECT 
  u.id,
  'avatar' || (floor(random() * 8)::integer + 1)::text,
  NULL
FROM users u
WHERE u.username LIKE 'loadtest_user_%'
  AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

RAISE NOTICE 'Perfis criados!';

-- ============================================
-- 3. CRIAR SESSÕES DE TESTE
-- ============================================
RAISE NOTICE 'Criando sessões...';

INSERT INTO user_sessions (user_id, username, login_time, is_active)
SELECT 
  u.id,
  u.username,
  NOW() - (random() * INTERVAL '30 days'),
  CASE WHEN random() < 0.2 THEN true ELSE false END
FROM users u
WHERE u.username LIKE 'loadtest_user_%'
LIMIT (num_users * 2); -- 2 sessões por usuário em média

RAISE NOTICE 'Sessões criadas!';

-- ============================================
-- 4. CRIAR ESTATÍSTICAS DE QUIZ POR MATÉRIA
-- ============================================
RAISE NOTICE 'Criando estatísticas de quiz...';

INSERT INTO quiz_statistics (user_id, subject_id, total_attempts, correct_answers, wrong_answers, last_attempt_date)
SELECT 
  u.id,
  s.id,
  (random() * 20 + 1)::integer,
  (random() * 15 + 1)::integer,
  (random() * 5 + 1)::integer,
  NOW() - (random() * INTERVAL '60 days')
FROM users u
CROSS JOIN subjects s
WHERE u.username LIKE 'loadtest_user_%'
  AND random() < 0.7 -- 70% dos usuários têm estatísticas em cada matéria
ON CONFLICT (user_id, subject_id) DO UPDATE SET
  total_attempts = EXCLUDED.total_attempts,
  correct_answers = EXCLUDED.correct_answers,
  wrong_answers = EXCLUDED.wrong_answers,
  last_attempt_date = EXCLUDED.last_attempt_date,
  updated_at = NOW();

RAISE NOTICE 'Estatísticas de quiz criadas!';

-- ============================================
-- 5. CRIAR ESTATÍSTICAS GERAIS
-- ============================================
RAISE NOTICE 'Criando estatísticas gerais...';

INSERT INTO user_quiz_stats (user_id, username, total_quizzes, total_first_attempt_correct, total_questions, last_quiz_date)
SELECT 
  u.id,
  u.username,
  (random() * num_quizzes_per_user + 1)::integer,
  (random() * (num_questions_per_user * num_quizzes_per_user * 0.8) + 1)::integer,
  (random() * (num_questions_per_user * num_quizzes_per_user) + 1)::integer,
  NOW() - (random() * INTERVAL '30 days')
FROM users u
WHERE u.username LIKE 'loadtest_user_%'
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  total_quizzes = EXCLUDED.total_quizzes,
  total_first_attempt_correct = EXCLUDED.total_first_attempt_correct,
  total_questions = EXCLUDED.total_questions,
  last_quiz_date = EXCLUDED.last_quiz_date,
  updated_at = NOW();

RAISE NOTICE 'Estatísticas gerais criadas!';

-- ============================================
-- 6. CRIAR HISTÓRICO DE QUESTÕES RESPONDIDAS
-- ============================================
RAISE NOTICE 'Criando histórico de questões respondidas...';

INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at)
SELECT 
  u.id,
  q.subject_id,
  q.id,
  NOW() - (random() * INTERVAL '90 days')
FROM users u
CROSS JOIN questions q
WHERE u.username LIKE 'loadtest_user_%'
  AND random() < (num_questions_per_user::float / (SELECT COUNT(*) FROM questions))
LIMIT (num_users * num_questions_per_user)
ON CONFLICT (user_id, question_id) DO NOTHING;

RAISE NOTICE 'Histórico de questões criado!';

RAISE NOTICE 'Teste de carga concluído!';

END $$;

-- ============================================
-- RESUMO DOS DADOS CRIADOS
-- ============================================
SELECT 
  '📊 RESUMO DO TESTE DE CARGA' as tipo,
  '' as valor;

SELECT 
  'Total de usuários de teste' as item,
  COUNT(*)::text as valor
FROM users
WHERE username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Total de perfis criados',
  COUNT(*)::text
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Total de sessões criadas',
  COUNT(*)::text
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Total de estatísticas de quiz',
  COUNT(*)::text
FROM quiz_statistics qs
JOIN users u ON qs.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Total de estatísticas gerais',
  COUNT(*)::text
FROM user_quiz_stats uqs
JOIN users u ON uqs.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%'
UNION ALL
SELECT 
  'Total de questões respondidas',
  COUNT(*)::text
FROM answered_questions aq
JOIN users u ON aq.user_id = u.id
WHERE u.username LIKE 'loadtest_user_%';
