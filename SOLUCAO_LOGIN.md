# 🔐 Solução para Problema de Login

## ❌ Problema: "Usuário ou senha incorretos"

### Possíveis Causas

1. **Usuários padrão não existem no banco**
2. **Políticas RLS bloqueando leitura**
3. **Erro na query do Supabase**
4. **Variáveis de ambiente não configuradas**

## ✅ Soluções

### 1. Verificar e Criar Usuários Padrão

Execute este script no SQL Editor do Supabase:

```sql
-- Verificar usuários existentes
SELECT id, username, role FROM users;

-- Inserir usuários padrão se não existirem
INSERT INTO users (id, username, password, role) 
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'aluno', 'aluno123', 'aluno')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role;
```

Ou execute o arquivo `supabase_check_users.sql` completo.

### 2. Verificar Políticas RLS

Execute no SQL Editor:

```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Se necessário, corrigir políticas
-- Execute o arquivo supabase_fix_rls.sql
```

### 3. Usar Ferramenta de Debug

Abra o console do navegador (F12) e execute:

```javascript
// Verificar conexão
debugAuth.checkConnection()

// Listar todos os usuários
debugAuth.listUsers()

// Testar login
debugAuth.testLogin('admin', 'admin123')

// Verificar se usuário existe
debugAuth.checkUserExists('admin')

// Verificar políticas RLS
debugAuth.checkRLS()
```

### 4. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` existe e contém:

```env
REACT_APP_SUPABASE_URL=https://autzgrrevjmckxbydahx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_secret_wzcIRiCzZn9oTsvUG1nKkQ_JFZfcvSU
```

**Importante**: Reinicie o servidor após criar/alterar o `.env`:
```bash
npm start
```

### 5. Verificar Console do Navegador

Ao tentar fazer login, o console agora mostrará:
- ✅ Se o usuário foi encontrado
- ✅ Se a senha está correta
- ❌ Erros detalhados se houver problemas

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar se usuários existem
```sql
SELECT * FROM users WHERE username IN ('admin', 'aluno');
```

### Passo 2: Testar query de login manualmente
```sql
SELECT * FROM users 
WHERE username = 'admin' 
  AND password = 'admin123';
```

### Passo 3: Verificar políticas RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

### Passo 4: Verificar no console do navegador
Abra F12 → Console e tente fazer login. Você verá logs detalhados.

## 🛠️ Correções Aplicadas

1. ✅ **Logs detalhados adicionados** - Agora você verá exatamente onde está falhando
2. ✅ **Verificação em duas etapas** - Primeiro verifica se usuário existe, depois senha
3. ✅ **Ferramenta de debug criada** - `debugAuth` disponível no console
4. ✅ **Script SQL de verificação** - `supabase_check_users.sql`

## 📋 Checklist

- [ ] Execute `supabase_check_users.sql` no Supabase
- [ ] Verifique se usuários foram criados
- [ ] Reinicie o servidor (`npm start`)
- [ ] Abra o console do navegador (F12)
- [ ] Tente fazer login e veja os logs
- [ ] Use `debugAuth` no console para diagnosticar

## 🆘 Se Ainda Não Funcionar

1. **Verifique o console do navegador** - Veja os logs detalhados
2. **Execute `debugAuth.checkConnection()`** - Verifica conexão
3. **Execute `debugAuth.listUsers()`** - Lista todos os usuários
4. **Execute `debugAuth.testLogin('admin', 'admin123')`** - Testa login diretamente
5. **Verifique políticas RLS** - Execute `supabase_fix_rls.sql`

## 📝 Notas

- Os logs agora são mais detalhados e mostram cada etapa do processo
- A ferramenta `debugAuth` está disponível no console do navegador
- Use `debugAuth` para diagnosticar problemas rapidamente
