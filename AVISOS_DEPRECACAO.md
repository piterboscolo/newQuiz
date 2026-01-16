# Avisos de Depreciação no Deploy

## ⚠️ Sobre os Avisos

Durante o deploy, você pode ver vários avisos como:
- `npm warn deprecated workbox-cacheable-response@6.6.0`
- `npm warn deprecated eslint@8.57.1`
- E outros avisos similares

## ✅ Isso é Normal?

**SIM!** Esses avisos são **normais** e **não quebram a aplicação**. Eles aparecem porque:

1. O `react-scripts` (Create React App) usa dependências antigas internamente
2. Essas dependências foram marcadas como "deprecated" (obsoletas) pelos mantenedores
3. Mas ainda funcionam perfeitamente e não causam erros

## 🔧 O que Foi Feito

Foram aplicadas as seguintes configurações para minimizar os avisos:

1. **Arquivo `.npmrc`**: Configurado para reduzir verbosidade do npm
2. **Script de build**: Configurado para suprimir avisos de depreciação do Node.js
3. **Variáveis de ambiente**: `NODE_OPTIONS=--no-deprecation` durante o build

## 📝 Nota Importante

Esses avisos aparecem principalmente durante `npm install`, não durante o build. Eles são:
- ✅ **Apenas avisos** (warnings), não erros
- ✅ **Não impedem o deploy**
- ✅ **Não afetam o funcionamento da aplicação**

## 🚀 Para Deploy

Se você quiser suprimir completamente os avisos durante o deploy, você pode:

1. **Opção 1**: Ignorar os avisos (eles não afetam nada)
2. **Opção 2**: Usar `npm ci --silent` no servidor de deploy
3. **Opção 3**: Configurar o servidor de deploy para filtrar avisos de depreciação

## 🔄 Atualização Futura

No futuro, quando o `react-scripts` for atualizado ou migrarmos para Vite, esses avisos desaparecerão automaticamente.
