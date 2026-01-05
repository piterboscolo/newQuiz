# 🚀 Guia de Teste de Carga - Banco de Dados

Este guia explica como executar testes de carga no banco de dados Supabase.

## 📋 Arquivos Disponíveis

1. **`supabase_load_test.sql`** - Gera dados em massa para teste de carga
2. **`supabase_performance_test.sql`** - Testa a performance de várias operações
3. **`supabase_cleanup_load_test.sql`** - Remove dados de teste de carga

## 🎯 Objetivo

Testar a capacidade e performance do banco de dados com grandes volumes de dados simulando uso real da aplicação.

## 📊 Configuração do Teste

Antes de executar, você pode ajustar os parâmetros no arquivo `supabase_load_test.sql`:

```sql
num_users INTEGER := 100;           -- Número de usuários a criar
num_questions_per_user INTEGER := 50; -- Questões respondidas por usuário
num_quizzes_per_user INTEGER := 10;  -- Quizzes por usuário
```

### Volumes Recomendados

#### Teste Leve
- `num_users := 50`
- `num_questions_per_user := 20`
- `num_quizzes_per_user := 5`

#### Teste Médio
- `num_users := 100`
- `num_questions_per_user := 50`
- `num_quizzes_per_user := 10`

#### Teste Pesado
- `num_users := 500`
- `num_questions_per_user := 100`
- `num_quizzes_per_user := 20`

#### Teste Extremo
- `num_users := 1000`
- `num_questions_per_user := 200`
- `num_quizzes_per_user := 50`

⚠️ **ATENÇÃO**: Testes pesados podem demorar vários minutos e consumir recursos do Supabase.

## 🔧 Passo a Passo

### 1. Preparação

1. Certifique-se de que o schema principal foi executado (`supabase_schema.sql`)
2. Certifique-se de que as questões foram inseridas (`supabase_insert_questions.sql`)
3. Faça backup do banco se necessário

### 2. Executar Teste de Carga

1. Abra o **SQL Editor** do Supabase
2. Abra o arquivo `supabase_load_test.sql`
3. Ajuste os parâmetros conforme necessário
4. Copie e cole o conteúdo no editor
5. Clique em **Run**
6. Aguarde a conclusão (pode demorar alguns minutos)

### 3. Verificar Dados Criados

Após a execução, o script mostrará um resumo:
- Total de usuários criados
- Total de perfis
- Total de sessões
- Total de estatísticas
- Total de questões respondidas

### 4. Executar Testes de Performance

1. Abra o arquivo `supabase_performance_test.sql`
2. Execute cada seção individualmente ou todo o arquivo
3. Analise os resultados de `EXPLAIN ANALYZE`

### 5. Limpar Dados (Opcional)

Se quiser remover os dados de teste:

1. Abra `supabase_cleanup_load_test.sql`
2. Descomente as seções de DELETE
3. Execute o script
4. Verifique se os dados foram removidos

## 📈 Métricas a Observar

### Durante a Execução

1. **Tempo de Execução**
   - Anote quanto tempo cada seção leva
   - Compare com diferentes volumes

2. **Mensagens de Erro**
   - Verifique se há erros de constraint
   - Verifique se há timeouts

3. **Uso de Recursos**
   - Monitore o uso de CPU e memória no dashboard do Supabase
   - Verifique o uso de espaço em disco

### Após a Execução

1. **Tamanho das Tabelas**
   - Execute a query de tamanho no script de performance
   - Compare com o tamanho antes do teste

2. **Performance das Queries**
   - Analise os resultados de `EXPLAIN ANALYZE`
   - Verifique se os índices estão sendo usados
   - Identifique queries lentas

3. **Contagem de Registros**
   - Verifique se todos os dados foram criados
   - Compare com os valores esperados

## 🔍 Análise de Resultados

### EXPLAIN ANALYZE

O `EXPLAIN ANALYZE` mostra:
- **Planning Time**: Tempo para planejar a query
- **Execution Time**: Tempo para executar a query
- **Index Usage**: Se os índices estão sendo usados
- **Seq Scan**: Se está fazendo scan sequencial (lento)

### Indicadores de Performance

✅ **Bom**:
- Planning Time < 1ms
- Execution Time < 100ms para queries simples
- Uso de índices (Index Scan)
- Buffer hits altos

⚠️ **Atenção**:
- Planning Time > 10ms
- Execution Time > 1s
- Seq Scan em tabelas grandes
- Buffer misses altos

❌ **Problema**:
- Timeouts
- Execution Time > 10s
- Sem uso de índices em queries complexas
- Erros de memória

## 🎯 Cenários de Teste

### Teste 1: Carga Inicial
- 100 usuários
- 50 questões por usuário
- Verificar tempo de inserção

### Teste 2: Consultas Complexas
- Executar queries de ranking
- Executar agregações
- Verificar uso de índices

### Teste 3: Escrita em Massa
- Inserir múltiplas estatísticas
- Inserir múltiplas questões respondidas
- Verificar tempo de escrita

### Teste 4: Concorrência
- Simular múltiplos usuários acessando simultaneamente
- Verificar locks e deadlocks
- Monitorar performance sob carga

## 📊 Queries Úteis para Monitoramento

### Verificar Tamanho das Tabelas
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

### Verificar Índices
```sql
SELECT 
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Verificar Estatísticas de Tabelas
```sql
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

## ⚠️ Avisos Importantes

1. **Backup**: Sempre faça backup antes de executar testes de carga
2. **Recursos**: Testes pesados podem consumir muitos recursos
3. **Limpeza**: Remova os dados de teste após os testes
4. **Produção**: NUNCA execute testes de carga em produção
5. **Limites**: Respeite os limites do plano do Supabase

## 🆘 Troubleshooting

### Erro: "out of memory"
- Reduza o número de usuários
- Execute em lotes menores
- Aumente os recursos do Supabase

### Erro: "timeout"
- Reduza o volume de dados
- Execute em partes menores
- Verifique a conexão

### Performance Lenta
- Verifique se os índices existem
- Analise as queries com EXPLAIN
- Considere otimizar as queries

### Dados Não Inseridos
- Verifique constraints
- Verifique se há conflitos
- Verifique logs de erro

## 📚 Próximos Passos

Após os testes de carga:

1. ✅ Analisar resultados
2. ✅ Identificar gargalos
3. ✅ Otimizar queries lentas
4. ✅ Adicionar índices se necessário
5. ✅ Documentar limitações
6. ✅ Planejar escalabilidade

## 🔗 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [Performance Tuning](https://supabase.com/docs/guides/database/performance)
