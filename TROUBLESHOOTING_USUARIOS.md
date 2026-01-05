# 🔧 Troubleshooting - Criação de Usuários

Este guia ajuda a resolver problemas com a criação de usuários no Supabase.

## ❌ Problema: Usuários não estão sendo salvos no banco

### Possíveis Causas

1. **Políticas RLS bloqueando inserção**
2. **Variáveis de ambiente não configuradas**
3. **Erro na conexão com Supabase**
4. **Tabela não existe ou schema diferente**

## 🔍 Diagnóstico

### 1. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` existe e contém:

```env
REACT_APP_SUPABASE_URL=https://autzgrrevjmckxbydahx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_secret_wzcIRiCzZn9oTsvUG1nKkQ_JFZfcvSU
```

**Importante**: Reinicie o servidor de desenvolvimento após criar/alterar o `.env`:
```bash
npm start
```

### 2. Verificar Console do Navegador

Abra o DevTools (F12) e verifique:
- Erros no console
- Mensagens de erro do Supabase
- Requisições de rede (aba Network)

### 3. Verificar Políticas RLS

Execute no SQL Editor do Supabase:

```sql
-- Ver políticas da tabela users
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

### 4. Testar Inserção Direta

Execute no SQL Editor do Supabase:

```sql
-- Teste de inserção direta
INSERT INTO users (username, password, role) 
VALUES ('teste_direto', 'teste123', 'aluno')
ON CONFLICT (username) DO NOTHING
RETURNING *;
```

Se isso funcionar, o problema está nas políticas RLS ou no código da aplicação.

## ✅ Soluções

### Solução 1: Corrigir Políticas RLS

Execute o script `supabase_fix_rls.sql` no SQL Editor do Supabase.

Este script:
- Remove políticas antigas
- Cria políticas corretas para permitir inserção
- Permite que qualquer pessoa crie usuários (necessário para registro)

### Solução 2: Desabilitar RLS Temporariamente (APENAS PARA TESTES)

⚠️ **NÃO USE EM PRODUÇÃO!**

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Solução 3: Verificar Código

Certifique-se de que:

1. O cliente Supabase está configurado corretamente (`src/lib/supabase.ts`)
2. O AuthContext está usando Supabase (`src/context/AuthContext.tsx`)
3. As funções são assíncronas (async/await)

### Solução 4: Usar Service Role Key (APENAS PARA TESTES)

⚠️ **NUNCA USE EM PRODUÇÃO! A service_role key bypassa todas as políticas RLS!**

Se precisar testar rapidamente, você pode temporariamente usar a service_role key:

1. Vá em Settings → API no dashboard do Supabase
2. Copie a `service_role` key (NÃO a `anon` key)
3. Use no `.env` temporariamente

**IMPORTANTE**: Volte para a `anon` key antes de fazer deploy!

## 🧪 Teste Manual

### 1. Teste no Console do Navegador

Abra o console (F12) e execute:

```javascript
// Verificar se Supabase está configurado
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);

// Testar inserção direta
const { data, error } = await window.supabase
  .from('users')
  .insert({ username: 'teste_console', password: 'teste123', role: 'aluno' })
  .select();

console.log('Data:', data);
console.log('Error:', error);
```

### 2. Verificar Dados no Banco

Execute no SQL Editor:

```sql
-- Ver todos os usuários
SELECT id, username, role, created_at FROM users ORDER BY created_at DESC;

-- Ver últimos 10 usuários criados
SELECT id, username, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📋 Checklist

- [ ] Arquivo `.env` existe e está configurado
- [ ] Servidor foi reiniciado após criar `.env`
- [ ] Tabela `users` existe no banco
- [ ] Políticas RLS permitem inserção
- [ ] Cliente Supabase está configurado
- [ ] AuthContext está usando Supabase
- [ ] Funções são assíncronas (async/await)
- [ ] Console do navegador não mostra erros
- [ ] Teste de inserção direta funciona

## 🔐 Políticas RLS Recomendadas

Para produção, use estas políticas:

```sql
-- Visualizar: todos podem ver
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);

-- Inserir: todos podem criar (registro público)
CREATE POLICY "Public insert access" ON users FOR INSERT WITH CHECK (true);

-- Atualizar: apenas o próprio usuário
CREATE POLICY "Users can update own" ON users FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Deletar: apenas admins
CREATE POLICY "Admins can delete" ON users FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
);
```

## 🆘 Se Nada Funcionar

1. Verifique os logs do Supabase no dashboard
2. Verifique a aba Network no DevTools para ver as requisições
3. Teste com uma inserção SQL direta
4. Verifique se há erros de CORS
5. Verifique se a URL do Supabase está correta

## 📚 Recursos

- [Documentação RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Troubleshooting Supabase](https://supabase.com/docs/guides/platform/troubleshooting)
