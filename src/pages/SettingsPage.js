import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import useUiStore from '../store/uiStore';
import useAuthStore from '../store/authStore';
import { getFirebaseAuth } from '../firebase';
import { signOut } from 'firebase/auth';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large} ${({ theme }) => theme.spacing.medium};
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.h1};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.large};
  margin-bottom: ${({ theme }) => theme.spacing.large};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.h2};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ActionButton = styled.button`
  display: inline-block;
  background-color: #e74c3c;
  color: #fff;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #c0392b;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const UserAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

const UserName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.h3};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  margin: 0;
`;

const ProfileTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const SaveButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

// --- Theme Toggle Switch ---
const ThemeSwitchLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const ThemeSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 26px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 34px;
  transition: background-color 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: transform 0.2s;
  }
`;

const ThemeSwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${ThemeSwitch} {
    background: ${({ theme }) => theme.colors.primary};
  }

  &:checked + ${ThemeSwitch}::before {
    transform: translateX(24px);
  }
`;


// --- MAIN COMPONENT ---
const SettingsPage = () => {
  const navigate = useNavigate();
  const { openModal } = useUiStore();
  const { themeMode, toggleThemeMode } = useUiStore();
  const { user, isGuest } = useAuthStore();
  
  const { 
    userProfile, 
    setUserProfile, 
    resetUserProfile 
  } = useUserStore();

  const [profileInput, setProfileInput] = useState(userProfile);

  useEffect(() => {
    setProfileInput(userProfile);
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSaveProfile = () => {
    setUserProfile(profileInput);
    openModal({
      title: '成功',
      message: 'AIのプロフィールへの記憶が保存されました。',
      confirmText: 'OK',
    });
  };

  const handleResetProfile = () => {
    openModal({
      title: '記憶をリセット',
      message: 'AIに記憶させたプロフィール情報をすべて削除します。よろしいですか？',
      confirmText: 'リセットする',
      onConfirm: () => {
        resetUserProfile();
      },
    });
  };

  return (
    <PageContainer>
      <Title>設定</Title>

      <Section>
        <SectionHeader>
          <SectionTitle>ユーザー情報</SectionTitle>
          {user && <ActionButton onClick={handleLogout}>ログアウト</ActionButton>}
        </SectionHeader>
        <UserInfo>
          {user && <UserAvatar src={user.photoURL} alt="User avatar" />}
          <UserName>{user ? user.displayName : (isGuest ? 'ゲストユーザー' : '未ログイン')}</UserName>
        </UserInfo>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>テーマ切り替え</SectionTitle>
        </SectionHeader>
        <ThemeSwitchLabel>
          <span>{themeMode === 'light' ? 'ライトテーマ' : 'ダークテーマ'}</span>
          <ThemeSwitchInput type="checkbox" checked={themeMode === 'dark'} onChange={toggleThemeMode} />
          <ThemeSwitch />
        </ThemeSwitchLabel>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>AIトレーナーの記憶</SectionTitle>
        </SectionHeader>
        <p style={{ marginTop: 0, color: '#666' }}>
          AIにあなたのことを教えることで、よりパーソナライズされた提案を受けられるようになります。<br/>
          （例：30代男性、デスクワーク中心。運動不足で腰痛持ち。目標は疲労回復。）
        </p>
        <ProfileTextArea
          value={profileInput}
          onChange={(e) => setProfileInput(e.target.value)}
          placeholder="あなたの体の特徴、目標、悩みなどを自由に入力してください..."
        />
        <ButtonGroup>
          <ActionButton onClick={handleResetProfile}>記憶をリセット</ActionButton>
          <SaveButton onClick={handleSaveProfile}>記憶させる</SaveButton>
        </ButtonGroup>
      </Section>

    </PageContainer>
  );
};

export default SettingsPage;
