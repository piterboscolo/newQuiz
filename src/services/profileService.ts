import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type UserProfile = Database['public']['Tables']['user_profiles'];

/**
 * Busca o perfil do usuário
 */
export async function getUserProfile(
  userId: string
): Promise<{ success: boolean; profile?: { avatar: string | null; uploaded_image: string | null }; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('avatar, uploaded_image')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (não é erro se não existir)
      console.error('❌ Erro ao buscar perfil:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      profile: data ? { avatar: (data as any).avatar, uploaded_image: (data as any).uploaded_image } : undefined,
    };
  } catch (err: any) {
    console.error('❌ Erro ao buscar perfil:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

/**
 * Salva ou atualiza o perfil do usuário
 */
export async function saveUserProfile(
  userId: string,
  avatar: string | null,
  uploadedImage: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Salvando perfil do usuário:', { userId, avatar: avatar ? 'definido' : 'null', uploadedImage: uploadedImage ? 'definido' : 'null' });

    // Verificar se já existe perfil
    const { data: existing, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar perfil existente:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const now = new Date().toISOString();

    if (existing) {
      // Atualizar perfil existente
      const updateData: UserProfile['Update'] = {
        avatar: avatar,
        uploaded_image: uploadedImage,
        updated_at: now,
      };

      const existingData = existing as any;
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData as never)
        .eq('id', existingData.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError);
        return { success: false, error: updateError.message };
      }

      // Atualizar também o avatar na tabela users
      if (avatar || uploadedImage) {
        const avatarValue = uploadedImage || avatar || null;
        await supabase
          .from('users')
          .update({ avatar: avatarValue } as never)
          .eq('id', userId);
      }

      console.log('✅ Perfil atualizado com sucesso');
      return { success: true };
    } else {
      // Criar novo perfil
      const insertData: UserProfile['Insert'] = {
        user_id: userId,
        avatar: avatar,
        uploaded_image: uploadedImage,
      };

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(insertData as never);

      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError);
        return { success: false, error: insertError.message };
      }

      // Atualizar também o avatar na tabela users
      if (avatar || uploadedImage) {
        const avatarValue = uploadedImage || avatar || null;
        await supabase
          .from('users')
          .update({ avatar: avatarValue } as never)
          .eq('id', userId);
      }

      console.log('✅ Perfil criado com sucesso');
      return { success: true };
    }
  } catch (err: any) {
    console.error('❌ Erro ao salvar perfil:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}
