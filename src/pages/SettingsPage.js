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
  flex-wrap: wrap; /* Allow items to wrap */
  gap: ${({ theme }) => theme.spacing.medium}; /* Add gap for wrapped items */
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
  flex-direction: column; /* Stack buttons vertically on mobile */
  gap: 1rem;

  & > button {
    width: 100%;
    padding: 12px; /* Add more padding for easier tapping */
    font-size: 1rem;
  }

  @media (min-width: 768px) {
    flex-direction: row; /* Horizontal layout on desktop */
    justify-content: flex-end;

    & > button {
      width: auto;
      padding: 8px 16px;
      font-size: 0.9rem;
    }
  }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.medium};
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: center;

  h4 {
    font-size: 1.8rem;
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
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
    resetUserProfile, 
    activityHistory
  } = useUserStore();

  const [profileInput, setProfileInput] = useState(userProfile);

  const stats = React.useMemo(() => {
    if (!activityHistory || activityHistory.length === 0) {
      return { registrationDate: null, stretchDays: 0, totalStretches: 0, totalDuration: 0 };
    }

    const sortedHistory = [...activityHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstDay = new Date(sortedHistory[0].date);
    const registrationDate = firstDay.toLocaleDateString('ja-JP');

    const stretchDays = new Set(activityHistory.map(a => new Date(a.date).toDateString())).size;
    const totalStretches = activityHistory.reduce((sum, a) => sum + a.playlist.length, 0);
    const totalDuration = activityHistory.reduce((sum, a) => sum + a.totalDuration, 0);

    return { registrationDate, stretchDays, totalStretches, totalDuration };
  }, [activityHistory]);

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
      message: 'AIパーソナルトレーナーの記憶が保存されました。',
      confirmText: 'OK',
    });
  };

  const handleResetProfile = () => {
    openModal({
      title: '記憶をリセット',
      message: 'AIパーソナルトレーナーに記憶させた情報をすべてリセットします。\nよろしいですか？',
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
          <div>
            <UserName>{user ? user.displayName : (isGuest ? 'ゲストユーザー' : '未ログイン')}</UserName>
            {user && <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>{user.email}</p>}
            {stats.registrationDate && <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>登録日: {stats.registrationDate}</p>}
          </div>
        </UserInfo>
        {activityHistory.length > 0 && (
          <StatsGrid>
            <StatCard>
              <h4>{stats.stretchDays}</h4>
              <p>ストレッチ日数</p>
            </StatCard>
            <StatCard>
              <h4>{stats.totalStretches}</h4>
              <p>ストレッチ回数</p>
            </StatCard>
            <StatCard>
              <h4>{Math.floor(stats.totalDuration / 60)}<span style={{fontSize: '1rem'}}>分</span></h4>
              <p>ストレッチ時間</p>
            </StatCard>
          </StatsGrid>
        )}
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
          <SectionTitle>AIパーソナルトレーナーの記憶</SectionTitle>
        </SectionHeader>
        <p style={{ marginTop: 0, color: '#666' }}>
          AIにあなたのことを教えると、よりパーソナライズされた提案を受けられるようになります。<br/>
          （例：30代男性、デスクワーク中心。運動不足で腰痛持ち。）
        </p>
        <ProfileTextArea
          value={profileInput}
          onChange={(e) => setProfileInput(e.target.value)}
          placeholder="あなたの身体の特徴、目標、悩みなどを自由に入力してください..."
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
