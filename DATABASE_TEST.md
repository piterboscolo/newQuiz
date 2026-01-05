# 🧪 Guia de Teste de Conexões com o Banco de Dados

Este documento explica como testar todas as conexões com o banco de dados (localStorage) da aplicação.

## 📋 Visão Geral

A aplicação usa o **localStorage** do navegador como banco de dados local. Todas as operações de leitura e escrita são testadas para garantir que funcionam corretamente.

## 🔑 Chaves do LocalStorage

A aplicação utiliza as seguintes chaves no localStorage:

### Chaves Fixas
- `user` - Usuário atualmente logado
- `users` - Lista de todos os usuários cadastrados
- `userSessions` - Sessões ativas de usuários
- `subjects` - Lista de matérias disponíveis
- `questions` - Lista de todas as questões
- `quizStatistics` - Estatísticas gerais de quizzes
- `userQuizStats` - Estatísticas de quizzes por usuário

### Chaves Dinâmicas
- `userProfile_{userId}` - Perfil do usuário (avatar, imagem, etc.)
- `quizStats_{userId}` - Estatísticas de quiz do usuário
- `answeredQuestions_{subjectId}` - Histórico de questões respondidas por matéria

## 🚀 Como Executar os Testes

### Opção 1: Via Console do Navegador

1. Abra a aplicação no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Execute o seguinte comando:

```javascript
testDatabase()
```

Isso executará todos os testes e mostrará os resultados no console.

### Opção 2: Via Componente React

Adicione o componente `DatabaseTest` à sua aplicação:

```tsx
import { DatabaseTest } from './components/DatabaseTest';

// No seu componente ou rota
<DatabaseTest />
```

### Opção 3: Via Rota Temporária

Adicione uma rota no `App.tsx`:

```tsx
import { DatabaseTest } from './components/DatabaseTest';

// Dentro das rotas
<Route path="/test-db" element={<DatabaseTest />} />
```

## 📊 Tipos de Testes Executados

### 1. Testes Básicos
- ✅ Disponibilidade do localStorage
- ✅ Quota de armazenamento disponível

### 2. Testes de Estrutura
- ✅ Estrutura de dados de usuários
- ✅ Estrutura de dados de matérias
- ✅ Estrutura de dados de questões
- ✅ Estrutura de dados de sessões

### 3. Testes de Operações CRUD
- ✅ Leitura e escrita de usuários
- ✅ Leitura e escrita de matérias
- ✅ Leitura e escrita de questões
- ✅ Leitura e escrita de sessões
- ✅ Operações de perfil de usuário
- ✅ Operações de estatísticas de quiz

### 4. Testes de Integridade
- ✅ Integridade referencial (questões → matérias)
- ✅ Consistência de dados (sessões → usuários)

### 5. Testes de Performance
- ✅ Performance de leitura
- ✅ Performance de escrita

## 📝 Interpretando os Resultados

### ✅ Passou (Verde)
O teste foi executado com sucesso e tudo está funcionando corretamente.

### ❌ Falhou (Vermelho)
O teste encontrou um problema crítico que precisa ser corrigido.

### ⚠️ Aviso (Amarelo)
O teste encontrou algo que pode ser melhorado, mas não é crítico.

## 🛠️ Funções Úteis no Console

### Executar todos os testes
```javascript
testDatabase()
```

### Ver todas as chaves do localStorage usadas
```javascript
getStorageKeys()
```

### Limpar dados de teste
```javascript
cleanupTestData()
```

### Ver dados específicos
```javascript
// Ver usuários
JSON.parse(localStorage.getItem('users') || '[]')

// Ver questões
JSON.parse(localStorage.getItem('questions') || '[]')

// Ver matérias
JSON.parse(localStorage.getItem('subjects') || '[]')

// Ver sessões
JSON.parse(localStorage.getItem('userSessions') || '[]')
```

## 🔍 Verificações Manuais

### 1. Verificar se os dados estão sendo salvos
1. Abra o DevTools (F12)
2. Vá para a aba "Application" (Chrome) ou "Storage" (Firefox)
3. Expanda "Local Storage"
4. Selecione o domínio da aplicação
5. Verifique se as chaves estão presentes

### 2. Verificar a estrutura dos dados
1. No DevTools, clique em uma chave do localStorage
2. Verifique se o JSON está bem formatado
3. Verifique se os campos obrigatórios estão presentes

### 3. Testar operações manualmente
```javascript
// Teste de escrita
localStorage.setItem('test', JSON.stringify({ data: 'test' }));

// Teste de leitura
const data = JSON.parse(localStorage.getItem('test') || '{}');
console.log(data);

// Limpar teste
localStorage.removeItem('test');
```

## ⚠️ Problemas Comuns

### 1. localStorage não está disponível
- **Causa**: Navegador não suporta localStorage ou está em modo privado
- **Solução**: Use um navegador moderno ou desative o modo privado

### 2. Quota excedida
- **Causa**: localStorage está cheio (geralmente 5-10MB)
- **Solução**: Limpe dados antigos ou aumente a quota

### 3. Dados corrompidos
- **Causa**: JSON malformado ou dados inválidos
- **Solução**: Limpe o localStorage e recarregue os dados padrão

### 4. Estrutura de dados inválida
- **Causa**: Dados salvos em formato antigo ou incompatível
- **Solução**: Execute `resetToDefaults()` no QuizContext ou limpe o localStorage

## 🧹 Limpeza de Dados

### Limpar dados de teste
```javascript
cleanupTestData()
```

### Limpar todo o localStorage
```javascript
localStorage.clear()
```

### Limpar dados específicos
```javascript
localStorage.removeItem('users');
localStorage.removeItem('questions');
localStorage.removeItem('subjects');
```

## 📈 Monitoramento

Para monitorar o uso do localStorage em tempo real:

```javascript
// Ver tamanho usado
function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024).toFixed(2) + ' KB';
}

console.log('Tamanho usado:', getLocalStorageSize());
```

## 🔐 Segurança

⚠️ **Importante**: O localStorage não é seguro para dados sensíveis!

- Não armazene senhas em texto plano
- Não armazene tokens de autenticação sem criptografia
- Considere usar sessionStorage para dados temporários
- Para produção, considere migrar para um backend real

## 📚 Próximos Passos

Para migrar para um banco de dados real:

1. Criar uma API backend (Node.js, Python, etc.)
2. Substituir chamadas ao localStorage por chamadas à API
3. Implementar autenticação adequada
4. Adicionar validação de dados no backend
5. Implementar backup e sincronização

## 🆘 Suporte

Se encontrar problemas:

1. Execute `testDatabase()` e verifique os resultados
2. Verifique o console do navegador para erros
3. Verifique a aba Application/Storage no DevTools
4. Limpe o localStorage e teste novamente
5. Verifique se o navegador suporta localStorage
