import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large} ${({ theme }) => theme.spacing.medium};
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.h1};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const HistoryItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const HistoryHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const HistoryDetails = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

const StretchPlaylist = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin: 0;
`;

const StretchPlaylistItem = styled.li`
  padding: 4px 0;
`;

const RerunButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
  &:hover { opacity: 0.9; }
`;

const NoHistory = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.large};
`;

// --- MAIN COMPONENT ---
const ActivityHistoryPage = () => {
  const navigate = useNavigate();
  const { activityHistory } = useUserStore();
  const [openItemId, setOpenItemId] = useState(null);

  const handleToggle = (id) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  const handleRerun = (activity) => {
    navigate('/stretch/setup', {
      state: {
        preselectedIds: activity.playlist.map(s => s.id),
        duration: activity.duration,
        rest: activity.rest,
      },
    });
  };

  return (
    <PageContainer>
      <Title>アクティビティ履歴</Title>
      {activityHistory.length > 0 ? (
        activityHistory.map(item => (
          <HistoryItem key={item.id}>
            <HistoryHeader onClick={() => handleToggle(item.id)}>
              <div>
                <strong>{new Date(item.date).toLocaleString('ja-JP')}</strong>
                <div style={{ color: '#6B7280' }}>
                  {`${Math.floor(item.totalDuration / 60)}分 ${item.totalDuration % 60}秒`} / {item.playlist.length}種目
                </div>
              </div>
              <RerunButton onClick={(e) => { e.stopPropagation(); handleRerun(item); }}>
                再実行
              </RerunButton>
            </HistoryHeader>
            {openItemId === item.id && (
              <HistoryDetails>
                <p>実行時間: {item.duration}秒, 休憩時間: {item.rest}秒</p>
                <StretchPlaylist>
                  {item.playlist.map(stretch => (
                    <StretchPlaylistItem key={stretch.id}>{stretch.name}</StretchPlaylistItem>
                  ))}
                </StretchPlaylist>
              </HistoryDetails>
            )}
          </HistoryItem>
        ))
      ) : (
        <NoHistory>アクティビティ履歴はまだありません。</NoHistory>
      )}
    </PageContainer>
  );
};

export default ActivityHistoryPage;
