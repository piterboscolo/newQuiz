# Solução: Sessões de Usuário Não Estão Sendo Gravadas

## Problema

Ao fazer login, a informação de que o usuário está logado não está sendo gravada na tabela `user_sessions` do banco de dados.

## Causa

O projeto não está usando **Supabase Auth**, mas as políticas RLS (Row Level Security) na tabela `user_sessions` estão usando `auth.uid()`, que é uma função do Supabase Auth. Como não há autenticação do Supabase, `auth.uid()` sempre retorna `NULL`, fazendo com que as políticas bloqueiem INSERT e UPDATE.

## Solução

Execute o script SQL `supabase_fix_user_sessions_rls.sql` no SQL Editor do Supabase:

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Abra o arquivo `supabase_fix_user_sessions_rls.sql`
5. Copie e cole o conteúdo no editor
6. Clique em **Run** (ou pressione Ctrl+Enter)

## Melhorias no Código

Além de corrigir as políticas RLS, o código foi melhorado para:

1. **Verificar sessão existente**: Antes de criar uma nova sessão, verifica se já existe uma sessão ativa para o usuário
2. **Atualizar ao invés de criar**: Se já existe uma sessão ativa, atualiza o `login_time` ao invés de criar uma nova
3. **Melhor tratamento de erros**: Logs mais detalhados para facilitar o debug
4. **Atualizar sessão no carregamento**: Quando o usuário recarrega a página, a sessão também é atualizada

## Verificação

Após executar o script, verifique:

1. Faça login com um usuário
2. Verifique no Supabase se a sessão foi criada/atualizada na tabela `user_sessions`
3. O card "Usuários Logados" no dashboard do admin deve mostrar o usuário

## Nota de Segurança

As políticas RLS agora são mais permissivas porque não temos Supabase Auth. A segurança é garantida na aplicação:
- O código sempre valida que o `user_id` passado pertence ao usuário autenticado
- Apenas o usuário logado pode fazer login e criar sua própria sessão
- A validação é feita no frontend e deve ser reforçada no backend em produção

## Arquivos Modificados

- ✅ `supabase_fix_user_sessions_rls.sql` - Script SQL para corrigir as políticas
- ✅ `supabase_schema.sql` - Schema atualizado com políticas corretas
- ✅ `src/context/AuthContext.tsx` - Melhorias na lógica de criação/atualização de sessões

