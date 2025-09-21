import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import useUiStore from '../store/uiStore';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 40px 0;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Section = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 25px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const ActionButton = styled.button`
  display: inline-block;
  background-color: #e74c3c;
  color: #fff;
  padding: 8px 16px;
  border-radius: 5px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #c0392b;
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th, td {
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }

  th {
    background-color: #f9f9f9;
    font-weight: 700;
  }
`;

const ClickableTr = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #fafafa;
  }
`;

const DetailsTd = styled.td`
  background-color: #fdfdfd;
  padding: 20px 40px !important;
`;

const StretchListUl = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: square;
  color: #555;
  li {
    margin-bottom: 8px;
  }
`;

const RedoButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const NoHistory = styled.p`
  text-align: center;
  color: #888;
  padding: 2rem;
`;

const ProfileTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const SaveButton = styled(RedoButton)``;

// --- MAIN COMPONENT ---
const ProfilePage = () => {
  const navigate = useNavigate();
  const openModal = useUiStore(state => state.openModal);
  
  // State for Activity History
  const activityHistory = useUserStore(state => state.activityHistory);
  const resetActivityHistory = useUserStore(state => state.resetActivityHistory);
  const [expandedId, setExpandedId] = useState(null);

  // State for AI Profile
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const resetUserProfile = useUserStore(state => state.resetUserProfile);
  const [profileInput, setProfileInput] = useState(userProfile);

  useEffect(() => {
    setProfileInput(userProfile);
  }, [userProfile]);

  const handleSaveProfile = () => {
    setUserProfile(profileInput);
    openModal({
      title: '成功',
      message: 'AIがあなたのプロフィールを記憶しました。',
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

  const handleResetHistory = () => {
    openModal({
      title: 'アクティビティ履歴をリセット',
      message: 'すべてのアクティビティ履歴を削除します。この操作は元に戻せません。',
      confirmText: '削除する',
      onConfirm: resetActivityHistory,
    });
  };

  const handleRedo = (activity) => {
    const stretchList = activity.playlist.map(s => `- ${s.name}`).join('\n');
    const confirmationMessage = [
      `実行時間: ${activity.duration}秒`,
      `休憩時間: ${activity.rest}秒`,
      '',
      'ストレッチ一覧:',
      stretchList,
    ].join('\n');

    openModal({
      title: 'ストレッチを再実行しますか？',
      message: confirmationMessage,
      confirmText: '再実行',
      onConfirm: () => {
        navigate('/stretch/play', {
          state: {
            playlist: activity.playlist,
            duration: activity.duration,
            rest: activity.rest,
          },
        });
      },
    });
  };

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <PageContainer>
      <h1>マイページ</h1>

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

      <Section>
        <SectionHeader>
          <SectionTitle>アクティビティ履歴</SectionTitle>
          {activityHistory.length > 0 && (
            <ActionButton onClick={handleResetHistory}>履歴をリセット</ActionButton>
          )}
        </SectionHeader>
        {activityHistory.length > 0 ? (
          <HistoryTable>
            <thead>
              <tr>
                <th>実施日時</th>
                <th>合計時間</th>
                <th>実施ストレッチ数</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {activityHistory.map(item => (
                <React.Fragment key={item.id}>
                  <ClickableTr onClick={() => toggleDetails(item.id)}>
                    <td>{new Date(item.date).toLocaleString('ja-JP')}</td>
                    <td>{`${Math.floor(item.totalDuration / 60)}分 ${item.totalDuration % 60}秒`}</td>
                    <td>{item.playlist.length}</td>
                    <td>
                      <RedoButton onClick={(e) => { e.stopPropagation(); handleRedo(item); }}>再実行</RedoButton>
                    </td>
                  </ClickableTr>
                  {expandedId === item.id && (
                    <tr>
                      <DetailsTd colSpan="4">
                        <h4>実施したストレッチ:</h4>
                        <StretchListUl>
                          {item.playlist.map(stretch => (
                            <li key={stretch.id}>{stretch.name}</li>
                          ))}
                        </StretchListUl>
                      </DetailsTd>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </HistoryTable>
        ) : (
          <NoHistory>アクティビティ履歴はまだありません。</NoHistory>
        )}
      </Section>

    </PageContainer>
  );
};

export default ProfilePage;
