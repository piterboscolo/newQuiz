/**
 * Script de Teste de Conexões com o Banco de Dados (localStorage)
 * 
 * Este script testa todas as operações de leitura e escrita
 * no localStorage usado como banco de dados da aplicação.
 */

export interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class DatabaseTester {
  private results: TestResult[] = [];

  // Chaves do localStorage identificadas
  private readonly STORAGE_KEYS = {
    USER: 'user',
    USERS: 'users',
    USER_SESSIONS: 'userSessions',
    SUBJECTS: 'subjects',
    QUESTIONS: 'questions',
    USER_PROFILE: (userId: string) => `userProfile_${userId}`,
    QUIZ_STATS: (userId: string) => `quizStats_${userId}`,
    QUIZ_STATISTICS: 'quizStatistics',
    USER_QUIZ_STATS: 'userQuizStats',
    ANSWERED_HISTORY: (subjectId: string) => `answeredQuestions_${subjectId}`,
  };

  /**
   * Executa todos os testes
   */
  runAllTests(): TestResult[] {
    this.results = [];
    
    console.log('🧪 Iniciando testes de conexão com o banco de dados...\n');
    
    // Testes básicos
    this.testLocalStorageAvailability();
    this.testStorageQuota();
    
    // Testes de estrutura de dados
    this.testUsersStructure();
    this.testSubjectsStructure();
    this.testQuestionsStructure();
    this.testSessionsStructure();
    
    // Testes de operações CRUD
    this.testUserOperations();
    this.testSubjectOperations();
    this.testQuestionOperations();
    this.testSessionOperations();
    this.testProfileOperations();
    this.testQuizStatsOperations();
    
    // Testes de integridade
    this.testDataIntegrity();
    this.testDataConsistency();
    
    // Testes de performance
    this.testReadPerformance();
    this.testWritePerformance();
    
    // Resumo
    this.printSummary();
    
    return this.results;
  }

  /**
   * Testa se o localStorage está disponível
   */
  private testLocalStorageAvailability(): void {
    try {
      if (typeof Storage === 'undefined') {
        this.addResult('fail', 'localStorage não está disponível', 'O navegador não suporta localStorage');
        return;
      }
      
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (value === 'test') {
        this.addResult('pass', 'localStorage está disponível e funcional', 'Operações básicas funcionando');
      } else {
        this.addResult('fail', 'localStorage não está funcionando corretamente', 'Falha ao ler/escrever');
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao acessar localStorage', e.message);
    }
  }

  /**
   * Testa a quota de armazenamento
   */
  private testStorageQuota(): void {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then((estimate) => {
          const used = estimate.usage || 0;
          const quota = estimate.quota || 0;
          const percentage = ((used / quota) * 100).toFixed(2);
          
          this.addResult(
            'pass',
            `Quota de armazenamento: ${(used / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB (${percentage}%)`,
            { used, quota, percentage }
          );
        });
      } else {
        this.addResult('warning', 'Não foi possível verificar a quota de armazenamento', 'API não disponível');
      }
    } catch (e: any) {
      this.addResult('warning', 'Erro ao verificar quota', e.message);
    }
  }

  /**
   * Testa a estrutura de dados de usuários
   */
  private testUsersStructure(): void {
    try {
      const usersStr = localStorage.getItem(this.STORAGE_KEYS.USERS);
      if (!usersStr) {
        this.addResult('warning', 'Nenhum usuário encontrado no banco', 'Dados padrão serão criados no primeiro uso');
        return;
      }
      
      const users = JSON.parse(usersStr);
      if (!Array.isArray(users)) {
        this.addResult('fail', 'Estrutura de usuários inválida', 'Esperado: array, Recebido: ' + typeof users);
        return;
      }
      
      const validUsers = users.filter((u: any) => 
        u && 
        typeof u.id === 'string' && 
        typeof u.username === 'string' && 
        typeof u.password === 'string' && 
        (u.role === 'admin' || u.role === 'aluno')
      );
      
      if (validUsers.length === users.length) {
        this.addResult('pass', `Estrutura de usuários válida (${users.length} usuários)`, { count: users.length });
      } else {
        this.addResult('warning', `Alguns usuários têm estrutura inválida`, { total: users.length, valid: validUsers.length });
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao validar estrutura de usuários', e.message);
    }
  }

  /**
   * Testa a estrutura de dados de matérias
   */
  private testSubjectsStructure(): void {
    try {
      const subjectsStr = localStorage.getItem(this.STORAGE_KEYS.SUBJECTS);
      if (!subjectsStr) {
        this.addResult('warning', 'Nenhuma matéria encontrada no banco', 'Dados padrão serão criados no primeiro uso');
        return;
      }
      
      const subjects = JSON.parse(subjectsStr);
      if (!Array.isArray(subjects)) {
        this.addResult('fail', 'Estrutura de matérias inválida', 'Esperado: array');
        return;
      }
      
      const validSubjects = subjects.filter((s: any) => 
        s && 
        typeof s.id === 'string' && 
        typeof s.name === 'string' && 
        typeof s.description === 'string'
      );
      
      if (validSubjects.length === subjects.length) {
        this.addResult('pass', `Estrutura de matérias válida (${subjects.length} matérias)`, { count: subjects.length });
      } else {
        this.addResult('warning', `Algumas matérias têm estrutura inválida`, { total: subjects.length, valid: validSubjects.length });
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao validar estrutura de matérias', e.message);
    }
  }

  /**
   * Testa a estrutura de dados de questões
   */
  private testQuestionsStructure(): void {
    try {
      const questionsStr = localStorage.getItem(this.STORAGE_KEYS.QUESTIONS);
      if (!questionsStr) {
        this.addResult('warning', 'Nenhuma questão encontrada no banco', 'Dados padrão serão criados no primeiro uso');
        return;
      }
      
      const questions = JSON.parse(questionsStr);
      if (!Array.isArray(questions)) {
        this.addResult('fail', 'Estrutura de questões inválida', 'Esperado: array');
        return;
      }
      
      const validQuestions = questions.filter((q: any) => 
        q && 
        typeof q.id === 'string' && 
        typeof q.subjectId === 'string' && 
        typeof q.question === 'string' && 
        Array.isArray(q.options) && 
        typeof q.correctAnswer === 'number' &&
        q.options.length > 0 &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.options.length
      );
      
      if (validQuestions.length === questions.length) {
        this.addResult('pass', `Estrutura de questões válida (${questions.length} questões)`, { count: questions.length });
      } else {
        this.addResult('warning', `Algumas questões têm estrutura inválida`, { total: questions.length, valid: validQuestions.length });
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao validar estrutura de questões', e.message);
    }
  }

  /**
   * Testa a estrutura de dados de sessões
   */
  private testSessionsStructure(): void {
    try {
      const sessionsStr = localStorage.getItem(this.STORAGE_KEYS.USER_SESSIONS);
      if (!sessionsStr) {
        this.addResult('pass', 'Nenhuma sessão ativa', 'Normal se não houver usuários logados');
        return;
      }
      
      const sessions = JSON.parse(sessionsStr);
      if (!Array.isArray(sessions)) {
        this.addResult('fail', 'Estrutura de sessões inválida', 'Esperado: array');
        return;
      }
      
      const validSessions = sessions.filter((s: any) => 
        s && 
        typeof s.userId === 'string' && 
        typeof s.username === 'string' && 
        typeof s.loginTime === 'string'
      );
      
      if (validSessions.length === sessions.length) {
        this.addResult('pass', `Estrutura de sessões válida (${sessions.length} sessões)`, { count: sessions.length });
      } else {
        this.addResult('warning', `Algumas sessões têm estrutura inválida`, { total: sessions.length, valid: validSessions.length });
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao validar estrutura de sessões', e.message);
    }
  }

  /**
   * Testa operações CRUD de usuários
   */
  private testUserOperations(): void {
    try {
      // Teste de leitura
      const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
      this.addResult('pass', 'Leitura de usuários funcionando', { count: users.length });
      
      // Teste de escrita (temporário)
      const testUser = { id: '__test__', username: '__test__', password: '__test__', role: 'aluno' as const };
      const originalUsers = [...users];
      const testUsers = [...users, testUser];
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(testUsers));
      
      // Verificar se foi salvo
      const savedUsers = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
      if (savedUsers.length === testUsers.length) {
        this.addResult('pass', 'Escrita de usuários funcionando', 'Dados salvos corretamente');
      } else {
        this.addResult('fail', 'Falha na escrita de usuários', 'Dados não foram salvos');
      }
      
      // Restaurar dados originais
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(originalUsers));
    } catch (e: any) {
      this.addResult('fail', 'Erro nas operações de usuários', e.message);
    }
  }

  /**
   * Testa operações CRUD de matérias
   */
  private testSubjectOperations(): void {
    try {
      const subjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SUBJECTS) || '[]');
      this.addResult('pass', 'Leitura de matérias funcionando', { count: subjects.length });
      
      // Teste de escrita
      const testSubject = { id: '__test__', name: 'Teste', description: 'Matéria de teste' };
      const originalSubjects = [...subjects];
      const testSubjects = [...subjects, testSubject];
      localStorage.setItem(this.STORAGE_KEYS.SUBJECTS, JSON.stringify(testSubjects));
      
      const savedSubjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SUBJECTS) || '[]');
      if (savedSubjects.length === testSubjects.length) {
        this.addResult('pass', 'Escrita de matérias funcionando', 'Dados salvos corretamente');
      } else {
        this.addResult('fail', 'Falha na escrita de matérias', 'Dados não foram salvos');
      }
      
      localStorage.setItem(this.STORAGE_KEYS.SUBJECTS, JSON.stringify(originalSubjects));
    } catch (e: any) {
      this.addResult('fail', 'Erro nas operações de matérias', e.message);
    }
  }

  /**
   * Testa operações CRUD de questões
   */
  private testQuestionOperations(): void {
    try {
      const questions = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.QUESTIONS) || '[]');
      this.addResult('pass', 'Leitura de questões funcionando', { count: questions.length });
      
      // Teste de escrita
      const testQuestion = {
        id: '__test__',
        subjectId: '1',
        question: 'Teste?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        funFact: 'Teste'
      };
      const originalQuestions = [...questions];
      const testQuestions = [...questions, testQuestion];
      localStorage.setItem(this.STORAGE_KEYS.QUESTIONS, JSON.stringify(testQuestions));
      
      const savedQuestions = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.QUESTIONS) || '[]');
      if (savedQuestions.length === testQuestions.length) {
        this.addResult('pass', 'Escrita de questões funcionando', 'Dados salvos corretamente');
      } else {
        this.addResult('fail', 'Falha na escrita de questões', 'Dados não foram salvos');
      }
      
      localStorage.setItem(this.STORAGE_KEYS.QUESTIONS, JSON.stringify(originalQuestions));
    } catch (e: any) {
      this.addResult('fail', 'Erro nas operações de questões', e.message);
    }
  }

  /**
   * Testa operações de sessões
   */
  private testSessionOperations(): void {
    try {
      const sessions = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_SESSIONS) || '[]');
      this.addResult('pass', 'Leitura de sessões funcionando', { count: sessions.length });
      
      // Teste de escrita
      const testSession = {
        userId: '__test__',
        username: '__test__',
        loginTime: new Date().toISOString()
      };
      const originalSessions = [...sessions];
      const testSessions = [...sessions, testSession];
      localStorage.setItem(this.STORAGE_KEYS.USER_SESSIONS, JSON.stringify(testSessions));
      
      const savedSessions = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_SESSIONS) || '[]');
      if (savedSessions.length === testSessions.length) {
        this.addResult('pass', 'Escrita de sessões funcionando', 'Dados salvos corretamente');
      } else {
        this.addResult('fail', 'Falha na escrita de sessões', 'Dados não foram salvos');
      }
      
      localStorage.setItem(this.STORAGE_KEYS.USER_SESSIONS, JSON.stringify(originalSessions));
    } catch (e: any) {
      this.addResult('fail', 'Erro nas operações de sessões', e.message);
    }
  }

  /**
   * Testa operações de perfil de usuário
   */
  private testProfileOperations(): void {
    try {
      const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
      if (users.length === 0) {
        this.addResult('warning', 'Nenhum usuário para testar perfis', 'Crie usuários primeiro');
        return;
      }
      
      const testUserId = users[0].id;
      const profileKey = this.STORAGE_KEYS.USER_PROFILE(testUserId);
      const originalProfile = localStorage.getItem(profileKey);
      
      // Teste de escrita
      const testProfile = { avatar: 'avatar1', uploadedImage: '' };
      localStorage.setItem(profileKey, JSON.stringify(testProfile));
      
      // Teste de leitura
      const savedProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
      if (savedProfile.avatar === testProfile.avatar) {
        this.addResult('pass', 'Operações de perfil funcionando', 'Perfil salvo e lido corretamente');
      } else {
        this.addResult('fail', 'Falha nas operações de perfil', 'Dados não foram salvos corretamente');
      }
      
      // Restaurar
      if (originalProfile) {
        localStorage.setItem(profileKey, originalProfile);
      } else {
        localStorage.removeItem(profileKey);
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro nas operações de perfil', e.message);
    }
  }

  /**
   * Testa operações de estatísticas de quiz
   */
  private testQuizStatsOperations(): void {
    try {
      // Teste de estatísticas gerais
      const statsKey = this.STORAGE_KEYS.QUIZ_STATISTICS;
      const originalStats = localStorage.getItem(statsKey);
      
      const testStats = [{ subjectId: '1', correct: 5, wrong: 2 }];
      localStorage.setItem(statsKey, JSON.stringify(testStats));
      
      const savedStats = JSON.parse(localStorage.getItem(statsKey) || '[]');
      if (savedStats.length === testStats.length) {
        this.addResult('pass', 'Operações de estatísticas gerais funcionando', 'Dados salvos corretamente');
      } else {
        this.addResult('fail', 'Falha nas operações de estatísticas gerais', 'Dados não foram salvos');
      }
      
      if (originalStats) {
        localStorage.setItem(statsKey, originalStats);
      } else {
        localStorage.removeItem(statsKey);
      }
      
      // Teste de histórico de questões respondidas
      const historyKey = this.STORAGE_KEYS.ANSWERED_HISTORY('1');
      const originalHistory = localStorage.getItem(historyKey);
      
      const testHistory = ['q1', 'q2', 'q3'];
      localStorage.setItem(historyKey, JSON.stringify(testHistory));
      
      const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (savedHistory.length === testHistory.length) {
        this.addResult('pass', 'Operações de histórico de questões funcionando', 'Dados salvos corretamente');
      } else {
        this.addResult('fail', 'Falha nas operações de histórico', 'Dados não foram salvos');
      }
      
      if (originalHistory) {
        localStorage.setItem(historyKey, originalHistory);
      } else {
        localStorage.removeItem(historyKey);
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro nas operações de estatísticas', e.message);
    }
  }

  /**
   * Testa a integridade dos dados
   */
  private testDataIntegrity(): void {
    try {
      const questions = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.QUESTIONS) || '[]');
      const subjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SUBJECTS) || '[]');
      
      // Verificar se todas as questões referenciam matérias válidas
      const subjectIds = new Set(subjects.map((s: any) => s.id));
      const invalidQuestions = questions.filter((q: any) => !subjectIds.has(q.subjectId));
      
      if (invalidQuestions.length === 0) {
        this.addResult('pass', 'Integridade referencial válida', 'Todas as questões referenciam matérias válidas');
      } else {
        this.addResult('warning', `Questões com referências inválidas encontradas`, { count: invalidQuestions.length });
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao verificar integridade', e.message);
    }
  }

  /**
   * Testa a consistência dos dados
   */
  private testDataConsistency(): void {
    try {
      const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
      const sessions = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_SESSIONS) || '[]');
      
      // Verificar se todas as sessões referenciam usuários válidos
      const userIds = new Set(users.map((u: any) => u.id));
      const invalidSessions = sessions.filter((s: any) => !userIds.has(s.userId));
      
      if (invalidSessions.length === 0) {
        this.addResult('pass', 'Consistência de dados válida', 'Todas as sessões referenciam usuários válidos');
      } else {
        this.addResult('warning', `Sessões órfãs encontradas`, { count: invalidSessions.length });
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao verificar consistência', e.message);
    }
  }

  /**
   * Testa performance de leitura
   */
  private testReadPerformance(): void {
    try {
      const iterations = 100;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        localStorage.getItem(this.STORAGE_KEYS.USERS);
        localStorage.getItem(this.STORAGE_KEYS.SUBJECTS);
        localStorage.getItem(this.STORAGE_KEYS.QUESTIONS);
      }
      
      const end = performance.now();
      const avgTime = (end - start) / iterations;
      
      if (avgTime < 1) {
        this.addResult('pass', `Performance de leitura: ${avgTime.toFixed(3)}ms por operação`, 'Performance excelente');
      } else if (avgTime < 5) {
        this.addResult('pass', `Performance de leitura: ${avgTime.toFixed(3)}ms por operação`, 'Performance boa');
      } else {
        this.addResult('warning', `Performance de leitura: ${avgTime.toFixed(3)}ms por operação`, 'Performance pode ser melhorada');
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao testar performance de leitura', e.message);
    }
  }

  /**
   * Testa performance de escrita
   */
  private testWritePerformance(): void {
    try {
      const iterations = 100;
      const testData = { test: 'data' };
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        localStorage.setItem('__perf_test__', JSON.stringify(testData));
      }
      
      const end = performance.now();
      localStorage.removeItem('__perf_test__');
      const avgTime = (end - start) / iterations;
      
      if (avgTime < 1) {
        this.addResult('pass', `Performance de escrita: ${avgTime.toFixed(3)}ms por operação`, 'Performance excelente');
      } else if (avgTime < 5) {
        this.addResult('pass', `Performance de escrita: ${avgTime.toFixed(3)}ms por operação`, 'Performance boa');
      } else {
        this.addResult('warning', `Performance de escrita: ${avgTime.toFixed(3)}ms por operação`, 'Performance pode ser melhorada');
      }
    } catch (e: any) {
      this.addResult('fail', 'Erro ao testar performance de escrita', e.message);
    }
  }

  /**
   * Adiciona um resultado ao array
   */
  private addResult(status: 'pass' | 'fail' | 'warning', message: string, details?: any): void {
    const test = this.results.length + 1;
    this.results.push({ test: `Teste ${test}`, status, message, details });
    
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${message}`, details || '');
  }

  /**
   * Imprime resumo dos testes
   */
  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(50));
    console.log(`Total de testes: ${total}`);
    console.log(`✅ Passou: ${passed} (${((passed/total)*100).toFixed(1)}%)`);
    console.log(`❌ Falhou: ${failed} (${((failed/total)*100).toFixed(1)}%)`);
    console.log(`⚠️  Avisos: ${warnings} (${((warnings/total)*100).toFixed(1)}%)`);
    console.log('='.repeat(50));
    
    if (failed === 0) {
      console.log('🎉 Todos os testes críticos passaram!');
    } else {
      console.log('⚠️  Alguns testes falharam. Revise os detalhes acima.');
    }
  }

  /**
   * Retorna todas as chaves do localStorage usadas pela aplicação
   */
  getStorageKeys(): string[] {
    const keys: string[] = [];
    
    // Chaves fixas
    keys.push(this.STORAGE_KEYS.USER);
    keys.push(this.STORAGE_KEYS.USERS);
    keys.push(this.STORAGE_KEYS.USER_SESSIONS);
    keys.push(this.STORAGE_KEYS.SUBJECTS);
    keys.push(this.STORAGE_KEYS.QUESTIONS);
    keys.push(this.STORAGE_KEYS.QUIZ_STATISTICS);
    keys.push(this.STORAGE_KEYS.USER_QUIZ_STATS);
    
    // Chaves dinâmicas (exemplos)
    const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
    users.forEach((u: any) => {
      keys.push(this.STORAGE_KEYS.USER_PROFILE(u.id));
      keys.push(this.STORAGE_KEYS.QUIZ_STATS(u.id));
    });
    
    const subjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SUBJECTS) || '[]');
    subjects.forEach((s: any) => {
      keys.push(this.STORAGE_KEYS.ANSWERED_HISTORY(s.id));
    });
    
    return keys;
  }

  /**
   * Limpa dados de teste do localStorage
   */
  cleanup(): void {
    const testKeys = ['__test__', '__perf_test__'];
    testKeys.forEach(key => localStorage.removeItem(key));
  }
}

// Exportar para uso
export const databaseTester = new DatabaseTester();

// Função helper para executar testes no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testDatabase = () => {
    return databaseTester.runAllTests();
  };
  
  (window as any).getStorageKeys = () => {
    return databaseTester.getStorageKeys();
  };
  
  (window as any).cleanupTestData = () => {
    databaseTester.cleanup();
    console.log('✅ Dados de teste limpos');
  };
}
