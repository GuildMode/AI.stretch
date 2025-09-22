import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { useStretchStore } from '../store/stretchStore';
import useUiStore from '../store/uiStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrash } from '@fortawesome/free-solid-svg-icons';

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large} ${({ theme }) => theme.spacing.medium};
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.h1};
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* Single column for mobile */
  gap: ${({ theme }) => theme.spacing.large};

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 350px; /* Two columns for desktop */
  }
`;

const StretchListContainer = styled.div``;

const StretchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StretchItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${props => (props.checked ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => (props.checked ? `0 0 0 1px ${props.theme.colors.primary}` : 'none')};

  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const StretchInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TagsContainer = styled.div`
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

const FavoriteIcon = styled(FontAwesomeIcon)`
  color: ${({ theme }) => theme.colors.accent};
  margin-left: auto;
`;

const FilterControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const FilterButtonWrapper = styled.div`
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
  left: 0; /* Align with the button */
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.large};
  z-index: 10;
  width: 300px; /* A more reasonable default width */
  max-width: 90vw; /* Use viewport width for mobile */
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transform: ${props => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
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
  background-color: ${props => (props.checked ? `${props.theme.colors.primary}15` : props.theme.colors.surface)};
  border-color: ${props => (props.checked ? props.theme.colors.primary : props.theme.colors.border)};
  input { display: none; }
`;

const ConfigPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    position: sticky;
    top: 2rem;
  }
`;

const ConfigTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const InputGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    font-size: 1rem;
  }
`;

const Summary = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1.5rem;
  h3 {
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover { opacity: 0.9; }
  &:disabled { background-color: #bdc3c7; cursor: not-allowed; }
`;

const SaveButton = styled(StartButton)`
  background-color: ${({ theme }) => theme.colors.accent};
`;

const SavedRoutinesList = styled.div`
  h3 { margin-top: 0; }
`;

const RoutineItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  &:hover { background-color: ${({ theme }) => theme.colors.background}; }
`;

const IconButton = styled.button`
  background: none; 
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

// --- MAIN COMPONENT ---
const StretchSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    lastStretchSettings, 
    setLastStretchSettings, 
    showTagsInSetup, 
    toggleShowTagsInSetup,
    savedRoutines,
    addRoutine,
    deleteRoutine
  } = useUserStore();
  const { openModal } = useUiStore();
  const stretches = useStretchStore(state => state.stretches);

  const [selectedIds, setSelectedIds] = useState([]);
  const [duration, setDuration] = useState(lastStretchSettings.duration);
  const [rest, setRest] = useState(lastStretchSettings.rest);
  
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [filters, setFilters] = useState({ targetArea: [], equipment: [] });
  const filterPanelRef = useRef(null);
  const targetAreaOptions = useMemo(() => [...new Set(stretches.flatMap(s => s.targetArea))], [stretches]);
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

  const sortedAndFilteredStretches = useMemo(() => {
    return stretches
      .filter(stretch => {
        const targetAreaMatch = filters.targetArea.length === 0 || stretch.targetArea.some(area => filters.targetArea.includes(area));
        const equipmentMatch = filters.equipment.length === 0 || filters.equipment.includes(stretch.equipment);
        return targetAreaMatch && equipmentMatch;
      })
      .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
  }, [filters, stretches]);

  useEffect(() => {
    if (location.state?.preselectedIds) {
      setSelectedIds(location.state.preselectedIds);
    }
    if (location.state?.duration) {
      setDuration(location.state.duration);
    }
    if (location.state?.rest) {
      setRest(location.state.rest);
    }
  }, [location.state]);

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalTime = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    const total = (duration * selectedIds.length) + (rest * (selectedIds.length - 1));
    return total > 0 ? total : 0;
  }, [selectedIds, duration, rest]);

  const handleStart = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setLastStretchSettings({ duration, rest });
    const playlist = stretches.filter(s => selectedIds.includes(s.id));
    navigate('/stretch/play', { state: { playlist, duration: Number(duration), rest: Number(rest) } });
  };

  const handleSaveRoutine = () => {
    if (selectedIds.length === 0) return;

    openModal({
      type: 'prompt',
      title: 'メニューを保存',
      message: 'このストレッチメニューの名前を入力してください:',
      confirmText: '保存',
      cancelText: 'キャンセル',
      initialValue: '',
      onConfirm: (routineName) => {
        if (routineName) {
          const newRoutine = {
            id: Date.now().toString(),
            name: routineName,
            stretchIds: selectedIds,
            duration: Number(duration),
            rest: Number(rest),
          };
          addRoutine(newRoutine);
          openModal({ 
            title: '成功', 
            message: `「${routineName}」を保存しました。`,
            confirmText: 'OK'
          });
        }
      },
    });
  };

  const handleLoadRoutine = (routine) => {
    setSelectedIds(routine.stretchIds);
    setDuration(routine.duration);
    setRest(routine.rest);
  };

  const handleDeleteRoutine = (routineId, routineName) => {
    openModal({
      title: '確認',
      message: `「${routineName}」を削除しますか？`,
      confirmText: '削除',
      onConfirm: () => deleteRoutine(routineId),
    });
  };

  return (
    <PageContainer>
      <Title>ストレッチの準備</Title>
      <MainLayout>
        <StretchListContainer>
          <h2>ストレッチを選択</h2>
          <FilterControls>
            <FilterButtonWrapper ref={filterPanelRef}>
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
                        <input type="checkbox" checked={filters.targetArea.includes(area)} onChange={() => handleCheckboxChange('targetArea', area)} />
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
                        <input type="checkbox" checked={filters.equipment.includes(eq)} onChange={() => handleCheckboxChange('equipment', eq)} />
                        {eq}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </CheckboxGroup>
              </FilterPanel>
            </FilterButtonWrapper>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={showTagsInSetup} onChange={toggleShowTagsInSetup} />
              タグを表示
            </label>
          </FilterControls>
          <StretchList>
            {sortedAndFilteredStretches.map(stretch => (
              <StretchItem key={stretch.id} checked={selectedIds.includes(stretch.id)}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(stretch.id)}
                  onChange={() => handleSelect(stretch.id)}
                  style={{ marginTop: '4px' }}
                />
                <StretchInfo>
                  <span>{stretch.name}</span>
                  {showTagsInSetup && (
                    <TagsContainer>
                      {stretch.targetArea.map(area => <Tag key={area}>{area}</Tag>)} 
                      {stretch.equipment && stretch.equipment !== 'なし' && (
                        <Tag type="equipment">&#x1F6E0; {stretch.equipment}</Tag>
                      )}
                    </TagsContainer>
                  )}
                </StretchInfo>
                {stretch.isFavorite && <FavoriteIcon icon={faStar} />}
              </StretchItem>
            ))}
          </StretchList>
        </StretchListContainer>

        <ConfigPanel>
          <ConfigTitle>時間を設定</ConfigTitle>
          <InputGroup>
            <label htmlFor="duration">実行時間 (秒)</label>
            <input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min="10" />
          </InputGroup>
          <InputGroup>
            <label htmlFor="rest">休憩時間 (秒)</label>
            <input id="rest" type="number" value={rest} onChange={e => setRest(Number(e.target.value))} min="5" />
          </InputGroup>

          <Summary>
            <h3>合計時間: {Math.floor(totalTime / 60)}分 {totalTime % 60}秒</h3>
            <p>選択したストレッチ: {selectedIds.length}個</p>
          </Summary>

          <StartButton onClick={handleStart} disabled={selectedIds.length === 0}>
            スタート
          </StartButton>
          <SaveButton onClick={handleSaveRoutine} disabled={selectedIds.length === 0}>
            このメニューを保存
          </SaveButton>
          
          {savedRoutines.length > 0 && (
            <SavedRoutinesList>
              <h3>保存したメニュー</h3>
              {savedRoutines.map(routine => (
                <RoutineItem key={routine.id}>
                  <span onClick={() => handleLoadRoutine(routine)} style={{ cursor: 'pointer' }}>{routine.name}</span>
                  <IconButton onClick={() => handleDeleteRoutine(routine.id, routine.name)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
                </RoutineItem>
              ))}
            </SavedRoutinesList>
          )}
        </ConfigPanel>
      </MainLayout>
    </PageContainer>
  );
};

export default StretchSetupPage;
