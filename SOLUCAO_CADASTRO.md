# 🔧 Solução para Problema de Cadastro de Usuário

## ❌ Problema: Erro ao cadastrar usuário

### Possíveis Causas

1. **Políticas RLS bloqueando inserção** (mais comum)
2. **Usuário já existe** (duplicata)
3. **Erro de autenticação JWT**
4. **Variáveis de ambiente não configuradas**
5. **Tabela não existe ou schema diferente**

## ✅ Soluções Rápidas

### 1. Verificar Erro no Console

Abra o console do navegador (F12) e tente cadastrar. Você verá logs detalhados:
- ✅ Se as validações passaram
- ✅ Se o usuário já existe
- ❌ Erro detalhado se houver problema

### 2. Usar Ferramenta de Debug

No console do navegador, execute:

```javascript
// Testar cadastro diretamente
debugAuth.testRegister('teste_user', 'teste123', 'aluno')

// Verificar políticas RLS
debugAuth.checkRLS()

// Verificar conexão
debugAuth.checkConnection()
```

### 3. Corrigir Políticas RLS (MAIS COMUM)

Execute no SQL Editor do Supabase o arquivo `supabase_fix_rls.sql`:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can insert their own user" ON users;

-- Criar política que permite inserção
CREATE POLICY "Users can insert their own user" 
ON users FOR INSERT 
WITH CHECK (true);
```

Ou execute o script completo `supabase_fix_rls.sql`.

### 4. Verificar se Usuário Já Existe

No console do navegador:
```javascript
debugAuth.checkUserExists('nome_do_usuario')
```

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar Console
1. Abra F12 → Console
2. Tente cadastrar um usuário
3. Veja os logs detalhados que aparecem

### Passo 2: Testar com Debug
```javascript
debugAuth.testRegister('teste', 'teste123', 'aluno')
```

### Passo 3: Verificar Políticas RLS
Execute no Supabase:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Passo 4: Testar Inserção Direta
Execute no Supabase:
```sql
INSERT INTO users (username, password, role) 
VALUES ('teste_direto', 'teste123', 'aluno')
RETURNING *;
```

Se isso funcionar, o problema está nas políticas RLS.

## 🛠️ Correções Aplicadas

1. ✅ **Logs detalhados** - Mostra cada etapa do cadastro
2. ✅ **Tratamento de erros específicos** - Identifica tipo de erro
3. ✅ **Mensagens de erro claras** - Informa o que fazer
4. ✅ **Ferramenta de debug** - `debugAuth.testRegister()`

## 📋 Checklist

- [ ] Abrir console do navegador (F12)
- [ ] Tentar cadastrar e ver logs
- [ ] Executar `debugAuth.testRegister('teste', 'teste123')`
- [ ] Verificar políticas RLS no Supabase
- [ ] Executar `supabase_fix_rls.sql` se necessário
- [ ] Verificar variáveis de ambiente no `.env`
- [ ] Reiniciar servidor após alterar `.env`

## 🆘 Erros Comuns e Soluções

### Erro: "permission denied" ou código 42501
**Causa**: Política RLS bloqueando inserção
**Solução**: Execute `supabase_fix_rls.sql`

### Erro: "duplicate key" ou código 23505
**Causa**: Usuário já existe
**Solução**: Use outro nome de usuário

### Erro: "JWT" ou código PGRST301
**Causa**: Problema com variáveis de ambiente
**Solução**: Verifique `.env` e reinicie servidor

### Erro: "relation does not exist"
**Causa**: Tabela não existe
**Solução**: Execute `supabase_schema.sql`

## 📝 Notas

- Os logs agora mostram exatamente onde está falhando
- Use `debugAuth.testRegister()` para testar sem interface
- A maioria dos problemas é de políticas RLS
