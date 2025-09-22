import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CompletionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 70px); // Adjust for header height
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
`;

const HomeButton = styled.button`
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const SessionCompletionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalDuration, playlist } = location.state || {};

  if (!totalDuration || !playlist) {
    // In case the page is accessed directly without state
    return (
      <CompletionContainer>
        <Title>お疲れ様でした！</Title>
        <Message>セッションの記録が見つかりませんでした。</Message>
        <HomeButton onClick={() => navigate('/home')}>ホームに戻る</HomeButton>
      </CompletionContainer>
    );
  }

  const totalMinutes = Math.floor(totalDuration / 60);
  const uniqueParts = [...new Set(playlist.flatMap(stretch => stretch.targetArea))].length;

  return (
    <CompletionContainer>
      <Title>お疲れ様でした！</Title>
      <Message>
        合計{totalMinutes}分のストレッチで、{uniqueParts}つの部位をほぐしました。
      </Message>
      <HomeButton onClick={() => navigate('/home')}>ホームに戻る</HomeButton>
    </CompletionContainer>
  );
};

export default SessionCompletionPage;
