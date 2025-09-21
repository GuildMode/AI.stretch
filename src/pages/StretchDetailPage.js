import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { STRETCH_DATA } from '../data/STRETCH_DATA.js';

import { useStretchStore } from '../store/stretchStore';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 40px 0;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StretchHeader = styled.div`
  margin-bottom: 30px;
`;

const StretchName = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const TargetArea = styled.p`
  color: #666;
  font-size: 1.2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
`;

const StepList = styled.ol`
  padding-left: 20px;
  line-height: 1.8;
`;

const PointList = styled.ul`
    padding-left: 20px;
    line-height: 1.8;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  color: #555;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NotFoundContainer = styled.div`
    text-align: center;
    padding: 80px 0;
`;

// --- MAIN COMPONENT ---
const StretchDetailPage = () => {
  const { id } = useParams();
  const stretch = useStretchStore(state => state.stretches.find(s => s.id === id));

  if (!stretch) {
    return (
        <NotFoundContainer>
            <h2>ストレッチが見つかりません</h2>
            <BackLink to="/dashboard">一覧に戻る</BackLink>
        </NotFoundContainer>
    );
  }

  return (
    <PageContainer>
      <StretchHeader>
        <StretchName>{stretch.name}</StretchName>
        <TargetArea>対象部位: {stretch.targetArea.join(', ')}</TargetArea>
      </StretchHeader>

      <DetailSection>
        <SectionTitle>手順</SectionTitle>
        <StepList>
          {stretch.description.map((step, index) => <li key={index}>{step}</li>)}
        </StepList>
      </DetailSection>

      <DetailSection>
        <SectionTitle>効果</SectionTitle>
        <p>{stretch.effect}</p>
      </DetailSection>

      <DetailSection>
        <SectionTitle>ポイント</SectionTitle>
        <PointList>
            {stretch.points.map((point, index) => <li key={index}>{point}</li>)}
        </PointList>
      </DetailSection>

      <BackLink to="/dashboard">← ストレッチ一覧に戻る</BackLink>
    </PageContainer>
  );
};

export default StretchDetailPage;