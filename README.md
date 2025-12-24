# App Quiz

Aplicação de quiz com sistema de autenticação, áreas separadas para alunos e administradores, e seleção de matérias.

## Funcionalidades

- **Sistema de Login**: Autenticação com usuário e senha
- **Área do Aluno**: 
  - Seleção de matérias
  - Realização de quizzes
  - Visualização de resultados
- **Área do Administrador**:
  - Gerenciamento de matérias
  - Criação e edição de questões
  - Exclusão de questões

## Usuários de Teste

- **Admin**: 
  - Usuário: `admin`
  - Senha: `admin123`

- **Aluno**: 
  - Usuário: `aluno`
  - Senha: `aluno123`

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse a aplicação em `http://localhost:5173`

## Tecnologias

- React 18
- TypeScript
- Vite
- React Router DOM

## Estrutura do Projeto

```
src/
├── components/       # Componentes React
├── context/          # Contextos (Auth, Quiz)
├── data/             # Dados mockados
├── types/            # Definições TypeScript
├── App.tsx           # Componente principal
└── main.tsx          # Ponto de entrada
```

