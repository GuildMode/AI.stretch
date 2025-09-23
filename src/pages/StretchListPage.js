import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';

import { useStretchStore } from '../store/stretchStore';

// --- Icons ---
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// --- Styles ---
const StretchListContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large} ${({ theme }) => theme.spacing.medium};
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column; /* Stack vertically on mobile */
  gap: ${({ theme }) => theme.spacing.medium};
  align-items: stretch; /* Stretch items to fill width */
  margin-bottom: ${({ theme }) => theme.spacing.large};

  @media (min-width: 768px) {
    flex-direction: row; /* Back to horizontal on desktop */
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.h1};
  margin: 0;
  text-align: center; /* Center title on mobile */

  @media (min-width: 768px) {
    text-align: left; /* Align left on desktop */
  }
`;

const SetupButton = styled.button`
  padding: 12px 24px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%; /* Full width on mobile */

  &:hover {
    opacity: 0.9;
  }

  @media (min-width: 768px) {
    width: auto; /* Auto width on desktop */
  }
`;

const FilterControls = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xlarge};
  position: relative;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const FilterCountBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
`;

const FilterPanel = styled.div`
  position: absolute;
  top: 100%;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.large};
  z-index: 10;
  width: 90vw; /* Use viewport width for mobile */
  max-width: 500px; /* Keep max-width for larger screens */
  left: 50%;
  /* Center the panel and handle animation */
  transform: ${props => (props.isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)')};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const CheckboxGroup = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.large};
    margin: 0 0 12px 0;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  background-color: ${props => (props.checked ? `${props.theme.colors.primary}15` : props.theme.colors.surface)};
  border-color: ${props => (props.checked ? props.theme.colors.primary : props.theme.colors.border)};

  input {
    display: none;
  }
`;

const StretchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.large};
`;

const StretchCard = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.medium};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.accent};
  z-index: 2;
`;

const StretchName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
  padding-right: 2rem; // space for favorite button
`;

const TagsContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: ${props => (props.type === 'equipment' ? `${props.theme.colors.accent}30` : `${props.theme.colors.primary}15`)};
  color: ${props => (props.type === 'equipment' ? props.theme.colors.accent : props.theme.colors.primary)};
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: #777;
`;

// --- Component ---
const StretchListPage = () => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    targetArea: [],
    equipment: [],
    stretchType: [],
  });
  const filterPanelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { stretches, toggleFavorite } = useStretchStore();

  useEffect(() => {
    const { initialFilter } = location.state || {};
    if (initialFilter && initialFilter.category && initialFilter.value) {
      setFilters(prev => ({
        ...prev,
        [initialFilter.category]: [initialFilter.value]
      }));
      // Clear the state from location to prevent re-applying on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const bodyPartGroups = {
    '上半身': ['首', '肩', '背中', '胸', '腕', '手', 'お腹', '腰'],
    '下半身': ['お尻', '股関節', '脚', '足'],
    '複合': ['全身', '体側'],
  };
  const stretchTypeOptions = ['静的', '動的'];
  const equipmentOptions = useMemo(() => [...new Set(stretches.map(s => s.equipment).filter(Boolean))], [stretches]);

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const sortedAndFilteredStretches = useMemo(() => {
    return stretches
      .filter(stretch => {
        const targetAreaMatch = filters.targetArea.length === 0 || stretch.targetArea.some(area => filters.targetArea.includes(area));
        const equipmentMatch = filters.equipment.length === 0 || filters.equipment.includes(stretch.equipment);
        const stretchTypeMatch = filters.stretchType.length === 0 || filters.stretchType.includes(stretch.stretchType);
        return targetAreaMatch && equipmentMatch && stretchTypeMatch;
      })
      .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
  }, [filters, stretches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFavoriteClick = (e, stretchId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent card click event
    toggleFavorite(stretchId);
  };

  const totalFilterCount = filters.targetArea.length + filters.equipment.length + filters.stretchType.length;

  return (
    <StretchListContainer>
      <HeaderContainer>
        <Title>ストレッチ</Title>
        <SetupButton onClick={() => navigate('/stretch/setup')}>
          カスタムストレッチを開始
        </SetupButton>
      </HeaderContainer>

      <FilterControls ref={filterPanelRef}>
        <FilterButton onClick={() => setPanelOpen(prev => !prev)}>
          <FilterIcon />
          <span>フィルター</span>
          {totalFilterCount > 0 && <FilterCountBadge>{totalFilterCount}</FilterCountBadge>}
        </FilterButton>

        <FilterPanel isOpen={isPanelOpen}>
          {Object.entries(bodyPartGroups).map(([groupName, areas]) => (
            <CheckboxGroup key={groupName}>
              <h3>{groupName}</h3>
              <CheckboxContainer>
                {areas.map(area => (
                  <CheckboxLabel key={area} checked={filters.targetArea.includes(area)}>
                    <input type="checkbox" checked={filters.targetArea.includes(area)} onChange={() => handleCheckboxChange('targetArea', area)} />
                    {area}
                  </CheckboxLabel>
                ))}
              </CheckboxContainer>
            </CheckboxGroup>
          ))}
          <CheckboxGroup>
            <h3>種類で絞り込む</h3>
            <CheckboxContainer>
              {stretchTypeOptions.map(type => (
                <CheckboxLabel key={type} checked={filters.stretchType.includes(type)}>
                  <input type="checkbox" checked={filters.stretchType.includes(type)} onChange={() => handleCheckboxChange('stretchType', type)} />
                  {type}
                </CheckboxLabel>
              ))}
            </CheckboxContainer>
          </CheckboxGroup>
          <CheckboxGroup>
            <h3>道具で絞り込む</h3>
            <CheckboxContainer>
              {equipmentOptions.map(eq => (
                <CheckboxLabel key={eq} checked={filters.equipment.includes(eq)}>
                  <input type="checkbox" checked={filters.equipment.includes(eq)} onChange={() => handleCheckboxChange('equipment', eq)} />
                  {eq}
                </CheckboxLabel>
              ))}
            </CheckboxContainer>
          </CheckboxGroup>
        </FilterPanel>
      </FilterControls>

      {sortedAndFilteredStretches.length > 0 ? (
        <StretchGrid>
          {sortedAndFilteredStretches.map((stretch) => (
            <StretchCard key={stretch.id} to={`/stretch/${stretch.id}`}>
              <FavoriteButton onClick={(e) => handleFavoriteClick(e, stretch.id)}>
                <FontAwesomeIcon icon={stretch.isFavorite ? fasStar : farStar} />
              </FavoriteButton>
              <StretchName>{stretch.name}</StretchName>
              <TagsContainer>
                {stretch.targetArea.map(area => <Tag key={area}>{area}</Tag>)} 
                {stretch.equipment && stretch.equipment !== 'なし' && (
                  <Tag type="equipment">&#x1F6E0; {stretch.equipment}</Tag>
                )}
              </TagsContainer>
            </StretchCard>
          ))}
        </StretchGrid>
      ) : (
        <NoResults>
          <p>該当するストレッチが見つかりませんでした。</p>
        </NoResults>
      )}
    </StretchListContainer>
  );
};
export default StretchListPage;
