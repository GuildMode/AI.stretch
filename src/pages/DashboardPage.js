import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { STRETCH_DATA } from '../data/STRETCH_DATA';
import AIChat from '../components/AIChat';
import { useUserStore } from '../store/userStore';
import { useStretchStore } from '../store/stretchStore';


const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #444;
  margin: 0;
`;

const ExecuteAllButton = styled.button`
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background-color: #2ecc71;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #27ae60;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

// --- Stretch Card Styles (from StretchPage) ---
const StretchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const StretchCard = styled(Link)`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: #333;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StretchName = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
`;

const TagsContainer = styled.div`
  margin-top: 1rem;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 6px;
  margin-bottom: 6px;
`;
// --- End of Stretch Card Styles ---

const DashboardPage = () => {
  const navigate = useNavigate();
  const aiSuggestions = useUserStore((state) => state.aiSuggestions);
  const stretches = useStretchStore((state) => state.stretches);

  const suggestedStretches = React.useMemo(() => {
    if (!aiSuggestions || aiSuggestions.length === 0) {
      return [];
    }
    // Map IDs from suggestions to full stretch objects
    return aiSuggestions.map(id => stretches.find(s => s.id === id)).filter(Boolean);
  }, [aiSuggestions, stretches]);

  const handleExecuteAll = () => {
    navigate('/stretch/setup', { state: { preselectedIds: aiSuggestions } });
  };

  return (
    <DashboardContainer>
      <Title>マイダッシュボード</Title>
      
      <AIChat />

      <SectionHeader>
        <SectionTitle>AIから提案されたストレッチ</SectionTitle>
        {suggestedStretches.length > 0 && (
            <ExecuteAllButton onClick={handleExecuteAll}>
              すべて実行
            </ExecuteAllButton>
        )}
      </SectionHeader>
      {suggestedStretches.length > 0 ? (
        <StretchGrid>
          {suggestedStretches.map(stretch => (
            <StretchCard key={stretch.id} to={`/stretch/${stretch.id}`}>
              <StretchName>{stretch.name}</StretchName>
              <TagsContainer>
                {stretch.targetArea.map(area => <Tag key={area}>{area}</Tag>)}
              </TagsContainer>
            </StretchCard>
          ))}
        </StretchGrid>
      ) : (
        <p>AIトレーナーに話しかけて、あなたに合ったストレッチを提案してもらいましょう。</p>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;