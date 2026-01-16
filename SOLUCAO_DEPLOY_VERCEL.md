# Solução: Erro no Deploy do Vercel

## 🔍 Problema

O comando `npm run build` está falhando no Vercel com erro de código 1.

## ✅ Soluções Aplicadas

1. **Script de build simplificado**: Removido `cross-env` que pode causar problemas no Vercel
2. **Configuração do Vercel atualizada**: Adicionado `installCommand` e configurações de memória
3. **Arquivo `.npmrc`**: Configurado para reduzir verbosidade

## 📋 Checklist para Deploy no Vercel

### 1. Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis de ambiente no Vercel:

- `REACT_APP_SUPABASE_URL` - URL do seu projeto Supabase
- `REACT_APP_SUPABASE_ANON_KEY` - Chave anon (pública) do Supabase

**Como configurar:**
1. Acesse o dashboard do Vercel
2. Vá em Settings → Environment Variables
3. Adicione as variáveis acima

### 2. Configuração do Build

O `vercel.json` já está configurado corretamente:
- Framework: `create-react-app`
- Output Directory: `build`
- Build Command: `npm run build`

### 3. Possíveis Problemas e Soluções

#### Problema: Erro de memória durante o build
**Solução**: O `vercel.json` já inclui `NODE_OPTIONS=--max-old-space-size=4096`

#### Problema: Variáveis de ambiente não encontradas
**Solução**: Configure as variáveis no dashboard do Vercel (veja item 1)

#### Problema: Dependências não instaladas
**Solução**: O Vercel executa `npm install` automaticamente. Se houver problemas, verifique o `package.json`

### 4. Verificar Logs do Build

Se o build ainda falhar:
1. Acesse o dashboard do Vercel
2. Vá em Deployments
3. Clique no deployment que falhou
4. Veja os logs completos do build

## 🔧 Comandos de Teste Local

Para testar o build localmente antes de fazer deploy:

```bash
# Limpar cache e node_modules (se necessário)
rm -rf node_modules package-lock.json
npm install

# Testar build
npm run build

# Verificar se a pasta build foi criada
ls build
```

## 📝 Nota Importante

Se o build funcionar localmente mas falhar no Vercel, geralmente é por:
1. **Variáveis de ambiente não configuradas** (mais comum)
2. **Problemas de memória** (já resolvido com NODE_OPTIONS)
3. **Versão do Node.js** (Vercel usa Node 18 por padrão, que é compatível)

## 🚀 Próximos Passos

1. Configure as variáveis de ambiente no Vercel
2. Faça um novo deploy
3. Verifique os logs se ainda houver erro
