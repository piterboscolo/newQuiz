# 🚀 Guia de Configuração do Supabase

Este guia explica como configurar o banco de dados Supabase para a aplicação Quiz.

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. URL e chave anônima do projeto (já configuradas no `.env`)

## 🔧 Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 2. Executar o Schema Principal

1. Abra o arquivo `supabase_schema.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

Este script cria:
- ✅ Todas as tabelas necessárias
- ✅ Índices para performance
- ✅ Triggers para atualização automática de timestamps
- ✅ Políticas RLS (Row Level Security)
- ✅ Usuários padrão (admin e aluno)
- ✅ Matérias padrão

### 3. Executar o Script de Questões

1. Abra o arquivo `supabase_insert_questions.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**

Este script insere todas as questões iniciais do sistema.

### 4. Verificar a Instalação

Execute a seguinte query para verificar se tudo foi criado corretamente:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar usuários
SELECT id, username, role FROM users;

-- Verificar matérias
SELECT id, name FROM subjects;

-- Verificar questões
SELECT COUNT(*) as total_questoes FROM questions;
SELECT subject_id, COUNT(*) as total 
FROM questions 
GROUP BY subject_id 
ORDER BY subject_id;
```

## 📊 Estrutura das Tabelas

### 1. `users`
Armazena os usuários do sistema (alunos e administradores).

**Campos:**
- `id` (UUID) - Identificador único
- `username` (VARCHAR) - Nome de usuário (único)
- `password` (VARCHAR) - Senha (deve ser hasheada em produção)
- `role` (VARCHAR) - 'aluno' ou 'admin'
- `avatar` (VARCHAR) - ID do avatar
- `created_at`, `updated_at` - Timestamps

### 2. `subjects`
Armazena as matérias disponíveis.

**Campos:**
- `id` (VARCHAR) - Identificador único
- `name` (VARCHAR) - Nome da matéria
- `description` (TEXT) - Descrição
- `created_at`, `updated_at` - Timestamps

### 3. `questions`
Armazena todas as questões do sistema.

**Campos:**
- `id` (VARCHAR) - Identificador único
- `subject_id` (VARCHAR) - Referência à matéria
- `question` (TEXT) - Texto da questão
- `options` (JSONB) - Array de opções: `["opção1", "opção2", ...]`
- `correct_answer` (INTEGER) - Índice da resposta correta
- `fun_fact` (TEXT) - Curiosidade sobre a questão
- `created_at`, `updated_at` - Timestamps

### 4. `user_sessions`
Armazena as sessões de login dos usuários.

**Campos:**
- `id` (UUID) - Identificador único
- `user_id` (UUID) - Referência ao usuário
- `username` (VARCHAR) - Nome de usuário
- `login_time` (TIMESTAMP) - Data/hora do login
- `logout_time` (TIMESTAMP) - Data/hora do logout (opcional)
- `is_active` (BOOLEAN) - Se a sessão está ativa

### 5. `user_profiles`
Armazena os perfis dos usuários (avatar, imagem).

**Campos:**
- `id` (UUID) - Identificador único
- `user_id` (UUID) - Referência ao usuário (único)
- `avatar` (VARCHAR) - ID do avatar pré-definido
- `uploaded_image` (TEXT) - URL ou base64 da imagem
- `created_at`, `updated_at` - Timestamps

### 6. `quiz_statistics`
Armazena estatísticas de quiz por matéria e usuário.

**Campos:**
- `id` (UUID) - Identificador único
- `user_id` (UUID) - Referência ao usuário
- `subject_id` (VARCHAR) - Referência à matéria
- `total_attempts` (INTEGER) - Total de tentativas
- `correct_answers` (INTEGER) - Respostas corretas
- `wrong_answers` (INTEGER) - Respostas erradas
- `last_attempt_date` (TIMESTAMP) - Data da última tentativa
- `created_at`, `updated_at` - Timestamps

### 7. `user_quiz_stats`
Armazena estatísticas gerais de quiz por usuário.

**Campos:**
- `id` (UUID) - Identificador único
- `user_id` (UUID) - Referência ao usuário (único)
- `username` (VARCHAR) - Nome de usuário
- `total_quizzes` (INTEGER) - Total de quizzes realizados
- `total_first_attempt_correct` (INTEGER) - Acertos de primeira tentativa
- `total_questions` (INTEGER) - Total de questões respondidas
- `last_quiz_date` (TIMESTAMP) - Data do último quiz
- `created_at`, `updated_at` - Timestamps

### 8. `answered_questions`
Armazena o histórico de questões respondidas.

**Campos:**
- `id` (UUID) - Identificador único
- `user_id` (UUID) - Referência ao usuário
- `subject_id` (VARCHAR) - Referência à matéria
- `question_id` (VARCHAR) - Referência à questão
- `answered_at` (TIMESTAMP) - Data/hora da resposta

## 🔐 Segurança (RLS)

O script configura Row Level Security (RLS) em todas as tabelas com as seguintes políticas:

### Usuários
- ✅ Todos podem visualizar usuários
- ✅ Todos podem criar usuários (registro)
- ✅ Usuários podem atualizar seus próprios dados
- ✅ Apenas admins podem deletar usuários

### Matérias e Questões
- ✅ Todos podem visualizar
- ✅ Apenas admins podem criar, atualizar ou deletar

### Sessões
- ✅ Usuários podem ver apenas suas próprias sessões
- ✅ Usuários podem gerenciar apenas suas próprias sessões

### Perfis
- ✅ Todos podem visualizar perfis
- ✅ Usuários podem gerenciar apenas seus próprios perfis

### Estatísticas
- ✅ Usuários podem ver apenas suas próprias estatísticas
- ✅ Admins podem ver todas as estatísticas

## ⚠️ Notas Importantes

### Senhas
⚠️ **ATENÇÃO**: As senhas estão em texto plano no script inicial. Em produção, você DEVE:
1. Implementar hash de senhas (bcrypt, argon2, etc.)
2. Usar autenticação do Supabase Auth ao invés de senhas em texto plano
3. Considerar usar JWT tokens

### IDs dos Usuários Padrão
Os usuários padrão usam UUIDs fixos:
- Admin: `00000000-0000-0000-0000-000000000001`
- Aluno: `00000000-0000-0000-0000-000000000002`

### IDs de Matérias e Questões
As matérias e questões usam IDs em formato string (ex: '1', '2', '100', etc.) para manter compatibilidade com o código existente.

## 🧪 Testando a Conexão

Após executar os scripts, você pode testar a conexão:

1. Verifique se as variáveis de ambiente estão configuradas no `.env`
2. Execute a aplicação: `npm start`
3. Tente fazer login com:
   - Usuário: `admin` / Senha: `admin123`
   - Usuário: `aluno` / Senha: `aluno123`

## 🔄 Próximos Passos

1. ✅ Executar os scripts SQL no Supabase
2. ⏳ Configurar o cliente Supabase na aplicação
3. ⏳ Migrar os contextos para usar Supabase
4. ⏳ Implementar hash de senhas
5. ⏳ Testar todas as funcionalidades

## 📚 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [SQL Editor do Supabase](https://supabase.com/dashboard/project/_/sql)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Troubleshooting

### Erro: "relation already exists"
Algumas tabelas já existem. Você pode:
1. Deletar as tabelas existentes manualmente
2. Usar `DROP TABLE IF EXISTS` antes de criar
3. Executar apenas as partes que faltam

### Erro: "permission denied"
Verifique se você tem permissões de administrador no projeto Supabase.

### Erro: "duplicate key value"
Alguns dados já existem. O script usa `ON CONFLICT DO NOTHING` para evitar erros.

### Políticas RLS bloqueando acesso
Se as políticas RLS estiverem muito restritivas, você pode temporariamente desabilitá-las:
```sql
ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;
```

**⚠️ Não faça isso em produção!**
