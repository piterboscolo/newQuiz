import { useState } from 'react';
import { databaseTester, TestResult } from '../utils/databaseTest';
import './DatabaseTest.css';

export function DatabaseTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  } | null>(null);

  const runTests = () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);
    
    // Executar testes
    const testResults = databaseTester.runAllTests();
    setResults(testResults);
    
    // Calcular resumo
    const passed = testResults.filter(r => r.status === 'pass').length;
    const failed = testResults.filter(r => r.status === 'fail').length;
    const warnings = testResults.filter(r => r.status === 'warning').length;
    
    setSummary({
      total: testResults.length,
      passed,
      failed,
      warnings,
    });
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return '#10b981';
      case 'fail':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="database-test-container">
      <div className="database-test-header">
        <h2>🧪 Teste de Conexões com o Banco de Dados</h2>
        <p>Este painel testa todas as conexões e operações do localStorage</p>
      </div>

      <div className="database-test-controls">
        <button 
          onClick={runTests} 
          disabled={isRunning}
          className="test-button"
        >
          {isRunning ? 'Executando testes...' : '▶️ Executar Testes'}
        </button>
        
        <button 
          onClick={() => {
            databaseTester.cleanup();
            alert('Dados de teste limpos!');
          }}
          className="cleanup-button"
        >
          🧹 Limpar Dados de Teste
        </button>
      </div>

      {summary && (
        <div className="database-test-summary">
          <h3>📊 Resumo</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{summary.total}</span>
            </div>
            <div className="stat-item success">
              <span className="stat-label">✅ Passou:</span>
              <span className="stat-value">{summary.passed}</span>
              <span className="stat-percentage">
                ({((summary.passed / summary.total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="stat-item error">
              <span className="stat-label">❌ Falhou:</span>
              <span className="stat-value">{summary.failed}</span>
              <span className="stat-percentage">
                ({((summary.failed / summary.total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="stat-item warning">
              <span className="stat-label">⚠️ Avisos:</span>
              <span className="stat-value">{summary.warnings}</span>
              <span className="stat-percentage">
                ({((summary.warnings / summary.total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="database-test-results">
          <h3>📋 Resultados Detalhados</h3>
          <div className="results-list">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`result-item result-${result.status}`}
                style={{ borderLeftColor: getStatusColor(result.status) }}
              >
                <div className="result-header">
                  <span className="result-icon">{getStatusIcon(result.status)}</span>
                  <span className="result-test">{result.test}</span>
                  <span className="result-status">{result.status.toUpperCase()}</span>
                </div>
                <div className="result-message">{result.message}</div>
                {result.details && (
                  <div className="result-details">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isRunning && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Executando testes...</p>
        </div>
      )}
    </div>
  );
}
