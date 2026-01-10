import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, saveUserProfile } from '../services/profileService';
import './Profile.css';

const PRESET_AVATARS = [
  { id: 'avatar1', emoji: '👤', color: '#2563eb' },
  { id: 'avatar2', emoji: '🎓', color: '#10b981' },
  { id: 'avatar3', emoji: '🧑‍💻', color: '#f59e0b' },
  { id: 'avatar4', emoji: '👨‍🎓', color: '#8b5cf6' },
  { id: 'avatar5', emoji: '👩‍🎓', color: '#ec4899' },
  { id: 'avatar6', emoji: '🧑‍🔬', color: '#06b6d4' },
  { id: 'avatar7', emoji: '👨‍🏫', color: '#ef4444' },
  { id: 'avatar8', emoji: '👩‍🏫', color: '#14b8a6' },
];

interface ProfileProps {
  onBack?: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preset' | 'upload'>('preset');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados temporários para mudanças não salvas
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState<string>('');
  const [tempUploadedImage, setTempUploadedImage] = useState<string>('');

  // Carregar perfil do Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getUserProfile(user.id);
        
        if (result.success && result.profile) {
          setSelectedAvatar(result.profile.avatar || '');
          setUploadedImage(result.profile.uploaded_image || '');
          setTempSelectedAvatar(result.profile.avatar || '');
          setTempUploadedImage(result.profile.uploaded_image || '');
        }
      } catch (err) {
        console.error('❌ Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="profile-container">Carregando perfil...</div>;

  const handleAvatarSelect = (avatarId: string) => {
    setTempSelectedAvatar(avatarId);
    setTempUploadedImage(''); // Limpar upload quando selecionar avatar
    setHasChanges(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      setTempUploadedImage(imageDataUrl);
      setTempSelectedAvatar(''); // Limpar avatar quando fazer upload
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUpload = () => {
    setTempUploadedImage('');
    setTempSelectedAvatar('');
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const result = await saveUserProfile(
        user.id,
        tempSelectedAvatar || null,
        tempUploadedImage || null
      );

      if (result.success) {
        setSelectedAvatar(tempSelectedAvatar);
        setUploadedImage(tempUploadedImage);
        setHasChanges(false);
        if (onBack) {
          onBack();
        }
      } else {
        alert(`Erro ao salvar perfil: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Erro ao salvar perfil:', err);
      alert('Erro ao salvar perfil. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setTempSelectedAvatar(selectedAvatar);
    setTempUploadedImage(uploadedImage);
    setHasChanges(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Removido: saveProfile agora usa saveUserProfile do serviço

  const getCurrentAvatar = () => {
    const currentImage = tempUploadedImage || uploadedImage;
    const currentAvatar = tempSelectedAvatar || selectedAvatar;
    
    if (currentImage) return currentImage;
    if (currentAvatar) {
      const avatar = PRESET_AVATARS.find(a => a.id === currentAvatar);
      return avatar ? avatar.emoji : '';
    }
    return '';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Meu Perfil</h2>
        <p>Personalize seu avatar</p>
      </div>

      <div className="profile-avatar-preview">
        <div className="avatar-preview-large">
          {(tempUploadedImage || uploadedImage) ? (
            <img src={tempUploadedImage || uploadedImage} alt="Avatar" className="avatar-image" />
          ) : (tempSelectedAvatar || selectedAvatar) ? (
            <div 
              className="avatar-emoji-large"
              style={{ 
                backgroundColor: PRESET_AVATARS.find(a => a.id === (tempSelectedAvatar || selectedAvatar))?.color || '#2563eb' 
              }}
            >
              {PRESET_AVATARS.find(a => a.id === (tempSelectedAvatar || selectedAvatar))?.emoji}
            </div>
          ) : (
            <div className="avatar-emoji-large" style={{ backgroundColor: '#2563eb' }}>
              👤
            </div>
          )}
        </div>
        <p className="avatar-preview-name">{user.username}</p>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === 'preset' ? 'active' : ''}
          onClick={() => setActiveTab('preset')}
        >
          Avatares
        </button>
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          Upload de Foto
        </button>
      </div>

      {activeTab === 'preset' && (
        <div className="profile-section">
          <h3>Escolha um Avatar</h3>
          <div className="avatars-grid">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = (tempSelectedAvatar || selectedAvatar) === avatar.id;
              return (
                <button
                  key={avatar.id}
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  style={{ backgroundColor: avatar.color }}
                >
                  <span className="avatar-emoji">{avatar.emoji}</span>
                  {isSelected && (
                    <div className="avatar-check">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="profile-section">
          <h3>Enviar sua Foto</h3>
          <div className="upload-area">
            {(tempUploadedImage || uploadedImage) ? (
              <div className="uploaded-preview">
                <img src={tempUploadedImage || uploadedImage} alt="Uploaded" className="uploaded-image" />
                <button onClick={handleRemoveUpload} className="remove-upload-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Remover
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Clique para fazer upload</p>
                <p className="upload-hint">PNG, JPG até 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="profile-actions">
        <button onClick={onBack || handleCancel} className="profile-button cancel-button">
          Voltar
        </button>
        <button 
          onClick={handleSave} 
          className="profile-button save-button"
          disabled={!hasChanges}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
