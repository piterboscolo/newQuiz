import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!');
  console.error('Verifique se REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY estão no arquivo .env');
}

// Verificar se está usando a chave errada (service_role)
if (supabaseAnonKey.startsWith('sb_secret_') || supabaseAnonKey.includes('service_role')) {
  console.error('❌ ERRO CRÍTICO: Você está usando a SERVICE_ROLE KEY (chave secreta)!');
  console.error('❌ Esta chave NÃO pode ser usada no navegador!');
  console.error('✅ Solução: Use a ANON KEY (chave pública) no arquivo .env');
  console.error('📖 Veja o arquivo CORRIGIR_CHAVE_SUPABASE.md para instruções');
  console.error('🔗 Acesse: Settings → API no Supabase e copie a chave "anon" (não a "service_role")');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Não usar sessão do Supabase Auth, vamos gerenciar manualmente
  },
});
