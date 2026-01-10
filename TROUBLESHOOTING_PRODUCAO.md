# 🔧 Troubleshooting - Problema em Produção (Vercel)

## ❌ Problema: Usuário criado consegue fazer login mas não aparece no banco

### Situação
- ✅ Login funciona (admin e aluno)
- ✅ Novo usuário "Carola" consegue fazer login
- ❌ Usuário "Carola" não aparece no banco de dados

## 🔍 Diagnóstico

### 1. Verificar se o Usuário Existe no Banco

Execute o script SQL `supabase_verificar_usuario.sql` no Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `supabase_verificar_usuario.sql`
5. Execute o script completo

**Resultados esperados:**
- Se o usuário aparecer: ✅ Usuário existe, problema pode ser de visualização/permissão
- Se o usuário NÃO aparecer: ❌ Usuário não foi criado, problema é na inserção

### 2. Verificar Console do Navegador (Produção)

No Vercel, os logs do console podem ser vistos:

1. Abra a aplicação: https://new-quiz-4380wur96-piterboscolos-projects.vercel.app/
2. Abra o DevTools (F12)
3. Vá na aba **Console**
4. Tente criar um novo usuário
5. Procure por mensagens que começam com:
   - `📝 Tentando cadastrar usuário`
   - `✅ Usuário cadastrado com sucesso`
   - `❌ Erro ao criar usuário`

### 3. Verificar Variáveis de Ambiente no Vercel

**IMPORTANTE**: No Vercel, você precisa configurar as variáveis de ambiente!

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Verifique se existem:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

**Se não existirem, adicione:**
```
REACT_APP_SUPABASE_URL=https://autzgrrevjmckxbydahx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHpncnJldmptY2t4YnlkYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDg4ODcsImV4cCI6MjA4MzAyNDg4N30.Y1Yyc2DGLy6gLvvRBEcfRpThG9xHALN0G725YDNW1BA
```

**⚠️ IMPORTANTE**: Após adicionar variáveis de ambiente, você DEVE fazer um novo deploy!

### 4. Verificar Políticas RLS

Execute no SQL Editor do Supabase:

```sql
-- Ver todas as políticas da tabela users
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';
```

**Política de INSERT deve existir e permitir inserção:**
```sql
CREATE POLICY "Users can insert their own user" 
ON users FOR INSERT 
WITH CHECK (true);
```

Se não existir ou estiver bloqueando, execute `supabase_fix_rls.sql`.

### 5. Testar Inserção Direta no Banco

Execute no SQL Editor do Supabase:

```sql
INSERT INTO users (username, password, role) 
VALUES ('carola_teste_direto', 'teste123', 'aluno')
ON CONFLICT (username) DO NOTHING
RETURNING *;
```

**Se funcionar**: O problema está no código da aplicação ou nas políticas RLS
**Se não funcionar**: O problema está no banco de dados (schema, constraints, etc.)

## ✅ Soluções

### Solução 1: Configurar Variáveis de Ambiente no Vercel

1. Acesse Vercel Dashboard
2. Settings → Environment Variables
3. Adicione as variáveis (veja passo 3 acima)
4. Faça um novo deploy

### Solução 2: Corrigir Políticas RLS

Execute o script `supabase_fix_rls.sql` no Supabase SQL Editor.

### Solução 3: Verificar Logs de Erro

1. Abra o console do navegador na aplicação em produção
2. Tente criar um novo usuário
3. Copie todos os logs que aparecerem
4. Procure por erros específicos:
   - `42501` = Erro de permissão (RLS)
   - `23505` = Violação de constraint única
   - `PGRST301` = Erro de autenticação JWT

### Solução 4: Usar Debug no Console do Navegador

Na aplicação em produção, abra o console (F12) e execute:

```javascript
// Verificar conexão
debugAuth.checkConnection()

// Verificar se usuário existe
debugAuth.checkUserExists('Carola')

// Listar todos os usuários
debugAuth.listUsers()

// Tentar criar usuário de teste
debugAuth.testRegister('carola_debug', 'teste123', 'aluno')
```

## 🔍 Possíveis Causas

1. **Variáveis de ambiente não configuradas no Vercel**
   - ✅ Solução: Configurar no Vercel Dashboard

2. **Políticas RLS bloqueando INSERT**
   - ✅ Solução: Executar `supabase_fix_rls.sql`

3. **Erro silencioso no código**
   - ✅ Solução: Verificar logs do console

4. **Usuário sendo criado mas não retornado pela query**
   - ✅ Solução: Verificar se `.select()` está sendo usado após `.insert()`

5. **Problema de CORS ou rede**
   - ✅ Solução: Verificar aba Network no DevTools

## 📋 Checklist de Verificação

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Novo deploy feito após configurar variáveis
- [ ] Script `supabase_verificar_usuario.sql` executado
- [ ] Políticas RLS verificadas e corrigidas
- [ ] Console do navegador verificado (sem erros)
- [ ] Teste de inserção direta no banco funcionou
- [ ] Debug no console executado

## 🆘 Próximos Passos

1. Execute `supabase_verificar_usuario.sql` e me envie os resultados
2. Verifique as variáveis de ambiente no Vercel
3. Faça um novo deploy se necessário
4. Teste criar um novo usuário e me envie os logs do console
