-- ============================================
-- SCHEMA DO BANCO DE DADOS - APP QUIZ
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql

-- ============================================
-- 1. TABELA: users (Usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('aluno', 'admin')),
  avatar VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 2. TABELA: subjects (Matérias)
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABELA: questions (Questões)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(50) PRIMARY KEY,
  subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de strings: ["opção1", "opção2", ...]
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0),
  fun_fact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- ============================================
-- 4. TABELA: user_sessions (Sessões de Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON user_sessions(login_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- ============================================
-- 5. TABELA: user_profiles (Perfis de Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar VARCHAR(50),
  uploaded_image TEXT, -- URL ou base64 da imagem
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- 6. TABELA: quiz_statistics (Estatísticas de Quiz por Matéria)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  last_attempt_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quiz_statistics_user_id ON quiz_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_statistics_subject_id ON quiz_statistics(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_statistics_last_attempt ON quiz_statistics(last_attempt_date);

-- ============================================
-- 7. TABELA: user_quiz_stats (Estatísticas Gerais do Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS user_quiz_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  total_quizzes INTEGER DEFAULT 0,
  total_first_attempt_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  last_quiz_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_quiz_stats_user_id ON user_quiz_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_stats_last_quiz ON user_quiz_stats(last_quiz_date);

-- ============================================
-- 8. TABELA: answered_questions (Histórico de Questões Respondidas)
-- ============================================
CREATE TABLE IF NOT EXISTS answered_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_answered_questions_user_id ON answered_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_answered_questions_subject_id ON answered_questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_answered_questions_question_id ON answered_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_answered_questions_answered_at ON answered_questions(answered_at);

-- ============================================
-- 9. FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_statistics_updated_at BEFORE UPDATE ON quiz_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quiz_stats_updated_at BEFORE UPDATE ON user_quiz_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. POLÍTICAS RLS (Row Level Security)
-- ============================================
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE answered_questions ENABLE ROW LEVEL SECURITY;

-- Políticas para users
-- NOTA: Como não estamos usando Supabase Auth, as políticas são mais permissivas
-- Em produção, considere implementar autenticação adequada
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own user" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own user" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete users" ON users FOR DELETE USING (true); -- Temporariamente permitir todos para facilitar testes

-- Políticas para subjects (todos podem ler, apenas admins podem modificar)
CREATE POLICY "Everyone can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Admins can insert subjects" ON subjects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update subjects" ON subjects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete subjects" ON subjects FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para questions (todos podem ler, apenas admins podem modificar)
CREATE POLICY "Everyone can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Admins can insert questions" ON questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update questions" ON questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete questions" ON questions FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own sessions" ON user_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own sessions" ON user_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own sessions" ON user_sessions FOR DELETE USING (user_id = auth.uid());

-- Políticas para user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own profile" ON user_profiles FOR DELETE USING (user_id = auth.uid());

-- Políticas para quiz_statistics
CREATE POLICY "Users can view their own statistics" ON quiz_statistics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own statistics" ON quiz_statistics FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own statistics" ON quiz_statistics FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all statistics" ON quiz_statistics FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para user_quiz_stats
CREATE POLICY "Users can view all stats" ON user_quiz_stats FOR SELECT USING (true);
CREATE POLICY "Users can insert their own stats" ON user_quiz_stats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own stats" ON user_quiz_stats FOR UPDATE USING (user_id = auth.uid());

-- Políticas para answered_questions
CREATE POLICY "Users can view their own answered questions" ON answered_questions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own answered questions" ON answered_questions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own answered questions" ON answered_questions FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 11. DADOS INICIAIS
-- ============================================

-- Inserir usuários padrão
-- NOTA: As senhas devem ser hasheadas em produção!
-- Por enquanto, vamos inserir as senhas em texto plano para compatibilidade
INSERT INTO users (id, username, password, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'aluno', 'aluno123', 'aluno')
ON CONFLICT (id) DO NOTHING;

-- Inserir matérias padrão
INSERT INTO subjects (id, name, description) VALUES
  ('1', 'Matemática', 'Questões de matemática'),
  ('2', 'Português', 'Questões de português'),
  ('3', 'História', 'Questões de história'),
  ('4', 'Geografia', 'Questões de geografia'),
  ('5', 'Ciências', 'Questões de ciências'),
  ('6', 'Inglês', 'Questões de inglês'),
  ('7', 'Física', 'Questões de física'),
  ('8', 'Química', 'Questões de química')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. As questões serão inseridas via aplicação ou script separado
-- 3. Configure as variáveis de ambiente no .env
-- 4. Teste a conexão com a aplicação
--
-- NOTA: Em produção, implemente hash de senhas (bcrypt, argon2, etc.)
-- ============================================
