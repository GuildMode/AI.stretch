import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';

import { useStretchStore } from '../store/stretchStore';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large} ${({ theme }) => theme.spacing.medium};
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StretchHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
  padding-bottom: ${({ theme }) => theme.spacing.medium};
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightGray};
`;

const NameContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const StretchName = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.h1};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
  margin: 0;
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Tag = styled.button`
  background-color: ${props => (props.type === 'equipment' ? `${props.theme.colors.accent}30` : `${props.theme.colors.primary}15`)};
  color: ${props => (props.type === 'equipment' ? props.theme.colors.accent : props.theme.colors.primary)};
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const DetailSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.h2};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 10px;
  margin-bottom: 15px;
`;

const StepList = styled.ol`
  padding-left: 20px;
  line-height: 1.8;
  font-size: ${({ theme }) => theme.fontSizes.body};
`;

const PointList = styled.ul`
    padding-left: 20px;
    line-height: 1.8;
    font-size: ${({ theme }) => theme.fontSizes.body};
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;

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
  const navigate = useNavigate();
  const { stretches, toggleFavorite } = useStretchStore();
  const stretch = stretches.find(s => s.id === id);

  const handleTagClick = (area) => {
    navigate('/stretch', { state: { initialFilter: area } });
  };

  if (!stretch) {
    return (
        <NotFoundContainer>
            <h2>ストレッチが見つかりません</h2>
            <BackLink to="/stretch">一覧に戻る</BackLink>
        </NotFoundContainer>
    );
  }

  return (
    <PageContainer>
      <StretchHeader>
        <NameContainer>
          <StretchName>{stretch.name}</StretchName>
          <FavoriteButton onClick={() => toggleFavorite(stretch.id)}>
            <FontAwesomeIcon icon={stretch.isFavorite ? fasStar : farStar} />
          </FavoriteButton>
        </NameContainer>
        <TagContainer>
          {stretch.targetArea.map(area => 
            <Tag key={area} onClick={() => handleTagClick(area)}>{area}</Tag>
          )}
          {stretch.equipment && stretch.equipment !== 'なし' && (
            <Tag as="span" type="equipment">&#x1F6E0; {stretch.equipment}</Tag>
          )}
        </TagContainer>
      </StretchHeader>

      <DetailSection>
        <SectionTitle>効果</SectionTitle>
        <p>{stretch.effect}</p>
      </DetailSection>

      <DetailSection>
        <SectionTitle>手順</SectionTitle>
        <StepList>
          {stretch.description.map((step, index) => <li key={index}>{step}</li>)}
        </StepList>
      </DetailSection>

      <DetailSection>
        <SectionTitle>ポイント</SectionTitle>
        <PointList>
            {stretch.points.map((point, index) => <li key={index}>{point}</li>)}
        </PointList>
      </DetailSection>

      <BackLink to="/stretch">← ストレッチ一覧に戻る</BackLink>
    </PageContainer>
  );
};

export default StretchDetailPage;