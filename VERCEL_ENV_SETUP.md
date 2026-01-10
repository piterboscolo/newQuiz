# 🔧 Configurar Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Variáveis de Ambiente no Vercel

No Vercel, as variáveis de ambiente do arquivo `.env` **NÃO são automaticamente usadas**!

Você **DEVE** configurá-las manualmente no dashboard do Vercel.

## 📋 Passo a Passo

### 1. Acessar o Dashboard do Vercel

1. Acesse: https://vercel.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `new-quiz` (ou o nome do seu projeto)

### 2. Configurar Variáveis de Ambiente

1. No menu do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Você verá uma lista de variáveis (pode estar vazia)

### 3. Adicionar Variáveis do Supabase

Clique em **Add New** e adicione cada variável:

#### Variável 1:
- **Name**: `REACT_APP_SUPABASE_URL`
- **Value**: `https://autzgrrevjmckxbydahx.supabase.co`
- **Environment**: Selecione todas as opções:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### Variável 2:
- **Name**: `REACT_APP_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHpncnJldmptY2t4YnlkYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDg4ODcsImV4cCI6MjA4MzAyNDg4N30.Y1Yyc2DGLy6gLvvRBEcfRpThG9xHALN0G725YDNW1BA`
- **Environment**: Selecione todas as opções:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### 4. Salvar e Fazer Novo Deploy

1. Clique em **Save** para cada variável
2. **IMPORTANTE**: Após adicionar as variáveis, você DEVE fazer um novo deploy!

**Opções para fazer deploy:**
- **Opção 1**: Fazer um commit e push (deploy automático)
- **Opção 2**: No dashboard do Vercel, vá em **Deployments** → **Redeploy** (último deployment)

### 5. Verificar se Funcionou

Após o deploy:

1. Acesse sua aplicação: https://new-quiz-4380wur96-piterboscolos-projects.vercel.app/
2. Abra o console do navegador (F12)
3. Tente criar um novo usuário
4. Verifique se não há erros de autenticação JWT

## 🔍 Verificar Variáveis Configuradas

No dashboard do Vercel:
1. Settings → Environment Variables
2. Você deve ver as duas variáveis listadas
3. Verifique se estão marcadas para **Production**

## ⚠️ Problemas Comuns

### Problema 1: Variáveis não aparecem após adicionar

**Solução**: Certifique-se de clicar em **Save** após adicionar cada variável.

### Problema 2: Deploy não usa as variáveis

**Solução**: 
- Faça um novo deploy após adicionar as variáveis
- As variáveis só são aplicadas em novos deploys

### Problema 3: Erro "Forbidden use of secret API key"

**Solução**: 
- Certifique-se de usar a **anon key** (não a service_role key)
- A anon key começa com `eyJ...`
- A service_role key começa com `sb_secret_...`

### Problema 4: Variáveis funcionam localmente mas não em produção

**Solução**: 
- Variáveis do `.env` local NÃO são usadas no Vercel
- Você DEVE configurá-las no dashboard do Vercel

## 📝 Checklist

- [ ] Acessei o dashboard do Vercel
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei `REACT_APP_SUPABASE_URL`
- [ ] Adicionei `REACT_APP_SUPABASE_ANON_KEY`
- [ ] Marquei todas as opções de Environment (Production, Preview, Development)
- [ ] Cliquei em Save para cada variável
- [ ] Fiz um novo deploy
- [ ] Testei criar um usuário na aplicação
- [ ] Verifiquei o console do navegador (sem erros)

## 🆘 Se Ainda Não Funcionar

1. Verifique se as variáveis estão corretas (sem espaços extras)
2. Verifique se fez um novo deploy após adicionar
3. Verifique os logs do console do navegador
4. Execute o script `supabase_verificar_usuario.sql` no Supabase
5. Verifique as políticas RLS (execute `supabase_fix_rls.sql`)
