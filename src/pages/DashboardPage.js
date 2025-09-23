import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

import AIChat from '../components/AIChat';
import useUserStore from '../store/userStore';
import { useStretchStore } from '../store/stretchStore';

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large} ${({ theme }) => theme.spacing.medium};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.medium} 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.large};
  margin-top: ${({ theme }) => theme.spacing.xlarge};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.small};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.medium};
    margin-top: ${({ theme }) => theme.spacing.large};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.h2};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.h3};
  }
`;

const ExecuteButton = styled.button`
  padding: 10px 20px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover { opacity: 0.9; }
  &:disabled { background-color: #bdc3c7; cursor: not-allowed; }

  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 20px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.large};
`;

const Card = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.medium};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
`;

const TagsContainer = styled.div`
  margin-top: 1rem;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  margin-right: 6px;
  margin-bottom: 6px;
`;

const EquipmentTag = styled(Tag)`
  background-color: ${({ theme }) => theme.colors.accent}30;
  color: ${({ theme }) => theme.colors.accent};
`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { aiSuggestions, savedRoutines } = useUserStore();
  const stretches = useStretchStore((state) => state.stretches);

  const suggestedStretches = React.useMemo(() => {
    if (!aiSuggestions || aiSuggestions.length === 0) return [];
    return aiSuggestions.map(id => stretches.find(s => s.id === id)).filter(Boolean);
  }, [aiSuggestions, stretches]);

  const handleExecuteAISuggestions = () => {
    navigate('/stretch/setup', { state: { preselectedIds: aiSuggestions } });
  };

  const handleExecuteRoutine = (routine) => {
    navigate('/stretch/setup', {
      state: {
        preselectedIds: routine.stretchIds,
        duration: routine.duration,
        rest: routine.rest,
      },
    });
  };

  return (
    <DashboardContainer>
      
      <AIChat />

      <SectionHeader>
        <SectionTitle>AIから提案されたストレッチ</SectionTitle>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end', flexGrow: 1 }}>
          {suggestedStretches.length > 0 && (
              <ExecuteButton onClick={handleExecuteAISuggestions}>
                すべて実行
              </ExecuteButton>
          )}
        </div>
      </SectionHeader>
      {suggestedStretches.length > 0 ? (
        <CardGrid>
          {suggestedStretches.map(stretch => (
            <Card key={stretch.id} to={`/stretch/${stretch.id}`}>
              <CardTitle>{stretch.name}</CardTitle>
              <TagsContainer>
                {stretch.targetArea.map(area => <Tag key={area}>{area}</Tag>)}
                {stretch.equipment && stretch.equipment !== 'なし' && (
                  <EquipmentTag>&#x1F6E0; {stretch.equipment}</EquipmentTag>
                )}
              </TagsContainer>
            </Card>
          ))}
        </CardGrid>
      ) : (
        <p>AIトレーナーに話しかけて、あなたに合ったストレッチを提案してもらいましょう。</p>
      )}

      {savedRoutines.length > 0 && (
        <>
          <SectionHeader>
            <SectionTitle>保存したメニュー</SectionTitle>
          </SectionHeader>
          <CardGrid>
            {savedRoutines.map(routine => (
              <Card as="div" key={routine.id} style={{cursor: 'default'}}>
                <CardTitle>{routine.name}</CardTitle>
                <div style={{ marginTop: 'auto' }}>
                  <ExecuteButton onClick={() => handleExecuteRoutine(routine)} style={{width: '100%'}}>
                    実行する
                  </ExecuteButton>
                </div>
              </Card>
            ))}
          </CardGrid>
        </>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;
