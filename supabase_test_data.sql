-- ============================================
-- SCRIPT DE TESTE - POPULAR BANCO DE DADOS
-- ============================================
-- Execute este script APÓS executar supabase_schema.sql
-- Este script popula o banco com dados de teste

-- ============================================
-- 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
-- ============================================
-- Descomente as linhas abaixo se quiser limpar os dados antes de popular
-- DELETE FROM answered_questions;
-- DELETE FROM quiz_statistics;
-- DELETE FROM user_quiz_stats;
-- DELETE FROM user_profiles;
-- DELETE FROM user_sessions;
-- DELETE FROM questions;
-- DELETE FROM subjects;
-- DELETE FROM users WHERE id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- ============================================
-- 2. INSERIR USUÁRIOS DE TESTE ADICIONAIS
-- ============================================
INSERT INTO users (id, username, password, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'teste_aluno1', 'teste123', 'aluno'),
  ('22222222-2222-2222-2222-222222222222', 'teste_aluno2', 'teste123', 'aluno'),
  ('33333333-3333-3333-3333-333333333333', 'teste_admin', 'teste123', 'admin')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- ============================================
-- 3. INSERIR PERFIS DE USUÁRIO
-- ============================================
INSERT INTO user_profiles (user_id, avatar, uploaded_image) VALUES
  ('00000000-0000-0000-0000-000000000001', 'avatar1', NULL),
  ('00000000-0000-0000-0000-000000000002', 'avatar2', NULL),
  ('11111111-1111-1111-1111-111111111111', 'avatar3', NULL),
  ('22222222-2222-2222-2222-222222222222', 'avatar4', NULL)
ON CONFLICT (user_id) DO UPDATE SET
  avatar = EXCLUDED.avatar,
  updated_at = NOW();

-- ============================================
-- 4. INSERIR SESSÕES DE TESTE
-- ============================================
INSERT INTO user_sessions (user_id, username, login_time, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', NOW() - INTERVAL '2 hours', true),
  ('00000000-0000-0000-0000-000000000002', 'aluno', NOW() - INTERVAL '1 hour', true),
  ('11111111-1111-1111-1111-111111111111', 'teste_aluno1', NOW() - INTERVAL '30 minutes', true),
  ('22222222-2222-2222-2222-222222222222', 'teste_aluno2', NOW() - INTERVAL '15 minutes', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. INSERIR ESTATÍSTICAS DE QUIZ (POR MATÉRIA)
-- ============================================
-- Estatísticas para o usuário admin
INSERT INTO quiz_statistics (user_id, subject_id, total_attempts, correct_answers, wrong_answers, last_attempt_date) VALUES
  ('00000000-0000-0000-0000-000000000001', '1', 5, 4, 1, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', '2', 10, 8, 2, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', '3', 3, 2, 1, NOW() - INTERVAL '3 days')
ON CONFLICT (user_id, subject_id) DO UPDATE SET
  total_attempts = EXCLUDED.total_attempts,
  correct_answers = EXCLUDED.correct_answers,
  wrong_answers = EXCLUDED.wrong_answers,
  last_attempt_date = EXCLUDED.last_attempt_date,
  updated_at = NOW();

-- Estatísticas para o usuário aluno
INSERT INTO quiz_statistics (user_id, subject_id, total_attempts, correct_answers, wrong_answers, last_attempt_date) VALUES
  ('00000000-0000-0000-0000-000000000002', '1', 8, 6, 2, NOW() - INTERVAL '5 hours'),
  ('00000000-0000-0000-0000-000000000002', '2', 15, 12, 3, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '4', 6, 5, 1, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '5', 4, 3, 1, NOW() - INTERVAL '3 days')
ON CONFLICT (user_id, subject_id) DO UPDATE SET
  total_attempts = EXCLUDED.total_attempts,
  correct_answers = EXCLUDED.correct_answers,
  wrong_answers = EXCLUDED.wrong_answers,
  last_attempt_date = EXCLUDED.last_attempt_date,
  updated_at = NOW();

-- Estatísticas para teste_aluno1
INSERT INTO quiz_statistics (user_id, subject_id, total_attempts, correct_answers, wrong_answers, last_attempt_date) VALUES
  ('11111111-1111-1111-1111-111111111111', '1', 12, 10, 2, NOW() - INTERVAL '2 hours'),
  ('11111111-1111-1111-1111-111111111111', '3', 7, 6, 1, NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '6', 5, 4, 1, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, subject_id) DO UPDATE SET
  total_attempts = EXCLUDED.total_attempts,
  correct_answers = EXCLUDED.correct_answers,
  wrong_answers = EXCLUDED.wrong_answers,
  last_attempt_date = EXCLUDED.last_attempt_date,
  updated_at = NOW();

-- Estatísticas para teste_aluno2
INSERT INTO quiz_statistics (user_id, subject_id, total_attempts, correct_answers, wrong_answers, last_attempt_date) VALUES
  ('22222222-2222-2222-2222-222222222222', '2', 20, 18, 2, NOW() - INTERVAL '30 minutes'),
  ('22222222-2222-2222-2222-222222222222', '4', 9, 8, 1, NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', '7', 6, 5, 1, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, subject_id) DO UPDATE SET
  total_attempts = EXCLUDED.total_attempts,
  correct_answers = EXCLUDED.correct_answers,
  wrong_answers = EXCLUDED.wrong_answers,
  last_attempt_date = EXCLUDED.last_attempt_date,
  updated_at = NOW();

-- ============================================
-- 6. INSERIR ESTATÍSTICAS GERAIS DE QUIZ
-- ============================================
INSERT INTO user_quiz_stats (user_id, username, total_quizzes, total_first_attempt_correct, total_questions, last_quiz_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 3, 14, 18, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', 'aluno', 4, 26, 33, NOW() - INTERVAL '5 hours'),
  ('11111111-1111-1111-1111-111111111111', 'teste_aluno1', 3, 20, 24, NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 'teste_aluno2', 3, 31, 35, NOW() - INTERVAL '30 minutes')
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  total_quizzes = EXCLUDED.total_quizzes,
  total_first_attempt_correct = EXCLUDED.total_first_attempt_correct,
  total_questions = EXCLUDED.total_questions,
  last_quiz_date = EXCLUDED.last_quiz_date,
  updated_at = NOW();

-- ============================================
-- 7. INSERIR HISTÓRICO DE QUESTÕES RESPONDIDAS
-- ============================================
-- Histórico para admin (Matemática)
INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '1', '1', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', '1', '2', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Histórico para aluno (Português)
INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at) VALUES
  ('00000000-0000-0000-0000-000000000002', '2', '100', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '2', '101', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '2', '102', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '2', '103', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '2', '104', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Histórico para aluno (Geografia)
INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at) VALUES
  ('00000000-0000-0000-0000-000000000002', '4', '300', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '4', '301', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '4', '302', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '4', '303', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '4', '304', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '4', '305', NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Histórico para teste_aluno1 (Matemática)
INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '1', '1', NOW() - INTERVAL '2 hours'),
  ('11111111-1111-1111-1111-111111111111', '1', '2', NOW() - INTERVAL '2 hours')
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Histórico para teste_aluno1 (História)
INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '3', '200', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '3', '201', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '3', '202', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '3', '203', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '3', '204', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '3', '205', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', '3', '206', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id, question_id) DO NOTHING;

-- Histórico para teste_aluno2 (Português)
INSERT INTO answered_questions (user_id, subject_id, question_id, answered_at) VALUES
  ('22222222-2222-2222-2222-222222222222', '2', '105', NOW() - INTERVAL '30 minutes'),
  ('22222222-2222-2222-2222-222222222222', '2', '106', NOW() - INTERVAL '30 minutes'),
  ('22222222-2222-2222-2222-222222222222', '2', '107', NOW() - INTERVAL '30 minutes'),
  ('22222222-2222-2222-2222-222222222222', '2', '108', NOW() - INTERVAL '30 minutes'),
  ('22222222-2222-2222-2222-222222222222', '2', '109', NOW() - INTERVAL '30 minutes')
ON CONFLICT (user_id, question_id) DO NOTHING;

-- ============================================
-- 8. VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================
-- Execute estas queries para verificar se os dados foram inseridos corretamente

-- Contar usuários
SELECT 'Total de usuários' as tipo, COUNT(*) as quantidade FROM users
UNION ALL
SELECT 'Total de perfis', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'Total de sessões ativas', COUNT(*) FROM user_sessions WHERE is_active = true
UNION ALL
SELECT 'Total de estatísticas de quiz', COUNT(*) FROM quiz_statistics
UNION ALL
SELECT 'Total de estatísticas gerais', COUNT(*) FROM user_quiz_stats
UNION ALL
SELECT 'Total de questões respondidas', COUNT(*) FROM answered_questions;

-- Ver estatísticas por usuário
SELECT 
  u.username,
  u.role,
  COALESCE(uqs.total_quizzes, 0) as total_quizzes,
  COALESCE(uqs.total_first_attempt_correct, 0) as acertos_primeira,
  COALESCE(uqs.total_questions, 0) as total_questoes,
  COUNT(DISTINCT qs.subject_id) as materias_estudadas
FROM users u
LEFT JOIN user_quiz_stats uqs ON u.id = uqs.user_id
LEFT JOIN quiz_statistics qs ON u.id = qs.user_id
GROUP BY u.id, u.username, u.role, uqs.total_quizzes, uqs.total_first_attempt_correct, uqs.total_questions
ORDER BY uqs.total_quizzes DESC NULLS LAST;

-- Ver estatísticas por matéria
SELECT 
  s.name as materia,
  COUNT(DISTINCT qs.user_id) as total_alunos,
  SUM(qs.total_attempts) as total_tentativas,
  SUM(qs.correct_answers) as total_acertos,
  SUM(qs.wrong_answers) as total_erros,
  ROUND(AVG(qs.correct_answers::numeric / NULLIF(qs.total_attempts, 0)) * 100, 2) as taxa_acerto_media
FROM subjects s
LEFT JOIN quiz_statistics qs ON s.id = qs.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- Ver ranking de usuários
SELECT 
  ROW_NUMBER() OVER (ORDER BY uqs.total_first_attempt_correct DESC, uqs.total_quizzes DESC) as posicao,
  u.username,
  uqs.total_quizzes,
  uqs.total_first_attempt_correct,
  uqs.total_questions,
  ROUND((uqs.total_first_attempt_correct::numeric / NULLIF(uqs.total_questions, 0)) * 100, 2) as precisao_percentual,
  uqs.last_quiz_date
FROM user_quiz_stats uqs
JOIN users u ON uqs.user_id = u.id
ORDER BY uqs.total_first_attempt_correct DESC, uqs.total_quizzes DESC;

-- ============================================
-- FIM DO SCRIPT DE TESTE
-- ============================================
-- 
-- DADOS INSERIDOS:
-- ✅ 3 usuários adicionais de teste
-- ✅ 4 perfis de usuário
-- ✅ 4 sessões de teste
-- ✅ Estatísticas de quiz para 4 usuários em várias matérias
-- ✅ Estatísticas gerais para 4 usuários
-- ✅ Histórico de questões respondidas para vários usuários
--
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Execute as queries de verificação para confirmar os dados
-- 3. Teste a aplicação com os dados populados
-- ============================================
