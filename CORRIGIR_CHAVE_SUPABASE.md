# 🔑 Como Corrigir a Chave do Supabase

## ❌ Erro: "Forbidden use of secret API key in browser"

Este erro acontece quando você está usando a **service_role key** (chave secreta) no navegador. Esta chave só pode ser usada no servidor por questões de segurança.

## ✅ Solução

### Você precisa usar a ANON KEY (chave pública), não a SERVICE_ROLE KEY!

### Passo 1: Obter a Chave Correta

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Na seção **Project API keys**, você verá:
   - **anon** `public` - Esta é a que você precisa! ✅
   - **service_role** `secret` - Esta NÃO pode ser usada no navegador! ❌

### Passo 2: Atualizar o arquivo .env

Abra o arquivo `.env` e altere para usar a **anon key**:

```env
REACT_APP_SUPABASE_URL=https://autzgrrevjmckxbydahx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

**IMPORTANTE**: 
- ✅ Use a chave que começa com `eyJ...` (anon key)
- ❌ NÃO use a chave que começa com `sb_secret_...` (service_role key)

### Passo 3: Reiniciar o Servidor

Após alterar o `.env`, você DEVE reiniciar o servidor:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm start
```

## 🔍 Como Identificar as Chaves

### Anon Key (Pública) - ✅ Use Esta
- Começa com `eyJ...`
- Tem o label "anon" e "public"
- Pode ser usada no navegador
- É segura para uso público

### Service Role Key (Secreta) - ❌ NÃO Use Esta
- Começa com `sb_secret_...` ou similar
- Tem o label "service_role" e "secret"
- NÃO pode ser usada no navegador
- Só deve ser usada no servidor

## ⚠️ Segurança

- **NUNCA** exponha a service_role key no código do navegador
- **SEMPRE** use a anon key no frontend
- A anon key é segura porque as políticas RLS protegem os dados
- A service_role key bypassa todas as políticas RLS

## 📋 Checklist

- [ ] Acessei Settings → API no Supabase
- [ ] Copiei a chave **anon** (não a service_role)
- [ ] Atualizei o arquivo `.env` com a anon key
- [ ] Reiniciei o servidor (`npm start`)
- [ ] Tentei fazer login novamente

## 🆘 Se Ainda Não Funcionar

1. Verifique se copiou a chave correta (anon, não service_role)
2. Verifique se o arquivo `.env` está na raiz do projeto
3. Verifique se reiniciou o servidor após alterar
4. Verifique se não há espaços extras na chave
5. Limpe o cache do navegador (Ctrl+Shift+Delete)
