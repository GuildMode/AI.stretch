import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { useStretchStore } from '../store/stretchStore';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 2rem 0;
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
`;

const StretchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StretchItem = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid ${props => (props.checked ? '#3498db' : '#eee')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3498db;
  }
`;

const ConfigPanel = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ConfigTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const InputGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const Summary = styled.div`
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
  h3 {
    margin: 0 0 1rem 0;
  }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background-color: #2ecc71;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #27ae60;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

// --- MAIN COMPONENT ---
const StretchSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastStretchSettings = useUserStore(state => state.lastStretchSettings);
  const setLastStretchSettings = useUserStore(state => state.setLastStretchSettings);
  const stretches = useStretchStore(state => state.stretches);

  const [selectedIds, setSelectedIds] = useState([]);
  const [duration, setDuration] = useState(lastStretchSettings.duration);
  const [rest, setRest] = useState(lastStretchSettings.rest);

  useEffect(() => {
    // Handle pre-selected stretches from other pages (e.g., Dashboard, AI Chat)
    if (location.state?.preselectedIds) {
      setSelectedIds(location.state.preselectedIds);
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

  const handleStart = () => {
    // Save the current settings for the next session
    setLastStretchSettings({ duration, rest });

    const playlist = stretches.filter(s => selectedIds.includes(s.id));
    navigate('/stretch/play', {
      state: {
        playlist,
        duration: Number(duration),
        rest: Number(rest),
      },
    });
  };

  return (
    <PageContainer>
      <Title>ストレッチの準備</Title>
      <MainLayout>
        <div>
          <h2>1. ストレッチを選択 (複数可)</h2>
          <StretchList>
            {stretches.map(stretch => (
              <StretchItem key={stretch.id} checked={selectedIds.includes(stretch.id)}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(stretch.id)}
                  onChange={() => handleSelect(stretch.id)}
                />
                {stretch.name}
              </StretchItem>
            ))}
          </StretchList>
        </div>

        <ConfigPanel>
          <ConfigTitle>2. 時間を設定</ConfigTitle>
          <InputGroup>
            <label htmlFor="duration">実行時間 (秒)</label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              min="10"
            />
          </InputGroup>
          <InputGroup>
            <label htmlFor="rest">休憩時間 (秒)</label>
            <input
              id="rest"
              type="number"
              value={rest}
              onChange={e => setRest(Number(e.target.value))}
              min="5"
            />
          </InputGroup>

          <Summary>
            <h3>合計時間: {Math.floor(totalTime / 60)}分 {totalTime % 60}秒</h3>
            <p>選択したストレッチ: {selectedIds.length}個</p>
          </Summary>

          <StartButton onClick={handleStart} disabled={selectedIds.length === 0}>
            スタート
          </StartButton>
        </ConfigPanel>
      </MainLayout>
    </PageContainer>
  );
};

export default StretchSetupPage;