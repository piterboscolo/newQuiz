# Como Limpar o LocalStorage e Carregar Novas Questões

Se as novas questões não aparecerem no quiz, você precisa limpar o localStorage do navegador.

## Opção 1: Via Console do Navegador (Recomendado)

1. Abra o aplicativo no navegador
2. Pressione `F12` para abrir as Ferramentas de Desenvolvedor
3. Vá para a aba "Console"
4. Digite e pressione Enter:
```javascript
localStorage.removeItem('questions');
localStorage.removeItem('subjects');
location.reload();
```

## Opção 2: Via Interface do Admin (Se disponível)

Se houver um botão de reset no painel admin, use-o para resetar os dados.

## Opção 3: Limpar Todo o LocalStorage

1. Abra as Ferramentas de Desenvolvedor (F12)
2. Vá para a aba "Application" (Chrome) ou "Storage" (Firefox)
3. No menu lateral, clique em "Local Storage"
4. Selecione o domínio do seu site
5. Clique com o botão direito e escolha "Clear" ou delete os itens "questions" e "subjects"
6. Recarregue a página (F5)

Após limpar, as novas questões do mockData.ts serão carregadas automaticamente.
