import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';


import { useStretchStore } from '../store/stretchStore';

// --- Icons ---
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// --- Styles ---
const StretchListContainer = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #333;
`;

const SetupButton = styled.button`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #3498db;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #2980b9;
  }
`;

const FilterControls = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
  position: relative;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  color: #333; /* アイコンとテキストの色を明示的に指定 */
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const FilterCountBadge = styled.span`
  background-color: #3498db;
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
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 24px;
  z-index: 10;
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transform: ${props => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
`;

const CheckboxGroup = styled.div`
  h3 {
    font-size: 1.1rem;
    margin: 0 0 12px 0;
    color: #333;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  background-color: ${props => (props.checked ? '#e0e7ff' : '#fff')};
  border-color: ${props => (props.checked ? '#4f46e5' : '#ddd')};

  input {
    display: none;
  }
`;

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
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: ${props => (props.type === 'equipment' ? '#d4edda' : '#e0e7ff')};
  color: ${props => (props.type === 'equipment' ? '#155724' : '#4f46e5')};
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
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
  });
  const filterPanelRef = useRef(null);
  const navigate = useNavigate();
  const stretches = useStretchStore(state => state.stretches);

  // フィルターの選択肢をデータから動的に生成
  const targetAreaOptions = useMemo(() => [...new Set(stretches.flatMap(s => s.targetArea))], [stretches]);
  const equipmentOptions = useMemo(() => [...new Set(stretches.map(s => s.equipment).filter(Boolean))], [stretches]);

  // チェックボックス変更ハンドラ
  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value) // 既に存在すれば削除
        : [...currentValues, value]; // 存在しなければ追加
      return { ...prev, [category]: newValues };
    });
  };

  // フィルタリングされたストレッチリスト
  const filteredStretches = useMemo(() => {
    return stretches.filter(stretch => {
      const targetAreaMatch = filters.targetArea.length === 0 || stretch.targetArea.some(area => filters.targetArea.includes(area));
      const equipmentMatch = filters.equipment.length === 0 || filters.equipment.includes(stretch.equipment);
      return targetAreaMatch && equipmentMatch;
    });
  }, [filters]);

  // パネルの外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalFilterCount = filters.targetArea.length + filters.equipment.length;

  return (
    <StretchListContainer>
      <HeaderContainer>
        <Title>ストレッチ一覧</Title>
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
          <CheckboxGroup>
            <h3>部位で絞り込む</h3>
            <CheckboxContainer>
              {targetAreaOptions.map(area => (
                <CheckboxLabel key={area} checked={filters.targetArea.includes(area)}>
                  <input
                    type="checkbox"
                    checked={filters.targetArea.includes(area)}
                    onChange={() => handleCheckboxChange('targetArea', area)}
                  />
                  {area}
                </CheckboxLabel>
              ))}
            </CheckboxContainer>
          </CheckboxGroup>

          <CheckboxGroup>
            <h3>道具で絞り込む</h3>
            <CheckboxContainer>
              {equipmentOptions.map(eq => (
                <CheckboxLabel key={eq} checked={filters.equipment.includes(eq)}>
                  <input
                    type="checkbox"
                    checked={filters.equipment.includes(eq)}
                    onChange={() => handleCheckboxChange('equipment', eq)}
                  />
                  {eq}
                </CheckboxLabel>
              ))}
            </CheckboxContainer>
          </CheckboxGroup>
        </FilterPanel>
      </FilterControls>

      {filteredStretches.length > 0 ? (
        <StretchGrid>
          {filteredStretches.map((stretch) => (
            <StretchCard key={stretch.id} to={`/stretch/${stretch.id}`}>
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
