# 🔧 Como Atualizar o Arquivo .env

## ❌ Problema Identificado

Você está usando a **service_role key** (chave secreta) que começa com `sb_secret_...`

Esta chave **NÃO pode ser usada no navegador** por questões de segurança!

## ✅ Solução: Usar a ANON KEY

### Passo 1: Obter a Chave Correta no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Na seção **Project API keys**, você verá duas chaves:

   **✅ ANON KEY (Pública)** - Use esta!
   - Label: `anon` `public`
   - Começa com: `eyJ...` (JWT token)
   - Esta é a chave que você precisa!

   **❌ SERVICE_ROLE KEY (Secreta)** - NÃO use esta!
   - Label: `service_role` `secret`
   - Começa com: `sb_secret_...`
   - Esta é a que você está usando (ERRADO!)

### Passo 2: Atualizar o Arquivo .env

Abra o arquivo `.env` na raiz do projeto e altere para:

```env
REACT_APP_SUPABASE_URL=https://autzgrrevjmckxbydahx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...SUA_ANON_KEY_AQUI
```

**IMPORTANTE**: 
- Substitua `eyJ...SUA_ANON_KEY_AQUI` pela chave **anon** que você copiou
- A chave anon é longa e começa com `eyJ`
- NÃO use a chave que começa com `sb_secret_`

### Passo 3: Reiniciar o Servidor

Após alterar o `.env`, você **DEVE** reiniciar o servidor:

```bash
# Pare o servidor (Ctrl+C no terminal)
# Depois inicie novamente:
npm start
```

## 🔍 Como Verificar se Está Correto

Após reiniciar, o console do navegador não deve mais mostrar o erro:
- ❌ "Forbidden use of secret API key" - Este erro não deve aparecer
- ✅ A aplicação deve funcionar normalmente

## 📝 Exemplo de .env Correto

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://autzgrrevjmckxbydahx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHpncnJldmptY2t4YnlkYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU3NjAwMH0.EXEMPLO_DE_CHAVE_ANON
```

## ⚠️ Segurança

- ✅ **Anon Key**: Segura para usar no navegador (protegida por RLS)
- ❌ **Service Role Key**: NUNCA use no navegador (bypassa todas as proteções)

## 🆘 Se Não Souber Qual Chave Usar

1. Vá em Settings → API no Supabase
2. Procure pela chave com label **"anon"** e **"public"**
3. Esta é a chave que você precisa copiar
4. Cole no `.env` como `REACT_APP_SUPABASE_ANON_KEY`
