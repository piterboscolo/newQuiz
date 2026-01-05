# 🔐 Como Resolver Problema de Login do Admin

## ❌ Problema: "Usuário ou senha incorretos" ao tentar logar com admin/admin123

## ✅ Solução Rápida

### Passo 1: Executar Script SQL no Supabase

1. Acesse o **SQL Editor** do Supabase
2. Abra o arquivo `supabase_fix_login.sql`
3. Copie e cole todo o conteúdo
4. Clique em **Run**

Este script vai:
- ✅ Verificar se os usuários existem
- ✅ Criar os usuários padrão se não existirem
- ✅ Corrigir as políticas RLS se necessário
- ✅ Testar se o login funcionaria

### Passo 2: Verificar no Console do Navegador

1. Abra o console (F12)
2. Tente fazer login novamente
3. Veja os logs detalhados que aparecem

### Passo 3: Usar Ferramenta de Debug

No console do navegador, execute:

```javascript
// Verificar se usuário existe
debugAuth.checkUserExists('admin')

// Testar login diretamente
debugAuth.testLogin('admin', 'admin123')

// Listar todos os usuários
debugAuth.listUsers()
```

## 🔍 O que o Script SQL Faz

1. **Verifica usuários existentes** - Mostra todos os usuários no banco
2. **Cria usuários padrão** - Garante que admin e aluno existem
3. **Corrige políticas RLS** - Permite leitura e inserção
4. **Testa login** - Verifica se a query funcionaria

## 📋 Checklist

- [ ] Execute `supabase_fix_login.sql` no Supabase
- [ ] Verifique se os usuários foram criados
- [ ] Abra o console do navegador (F12)
- [ ] Tente fazer login e veja os logs
- [ ] Use `debugAuth.testLogin('admin', 'admin123')` para testar

## 🆘 Se Ainda Não Funcionar

### Verificar no Console

Os logs agora mostram:
- ✅ Se o usuário foi encontrado
- ✅ Se a senha está correta
- ❌ Erros detalhados se houver problema
- 💡 Sugestões de solução

### Verificar no Supabase

Execute esta query no SQL Editor:

```sql
-- Verificar se admin existe e qual a senha
SELECT id, username, password, role 
FROM users 
WHERE username = 'admin';
```

Se a senha não for `admin123`, execute:

```sql
-- Atualizar senha do admin
UPDATE users 
SET password = 'admin123' 
WHERE username = 'admin';
```

## 🎯 Próximos Passos

1. **Execute o script SQL** (`supabase_fix_login.sql`)
2. **Reinicie o servidor** se necessário
3. **Tente fazer login** e veja os logs no console
4. **Use debugAuth** se precisar diagnosticar mais
