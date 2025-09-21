
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useUserStore } from '../store/userStore';

// --- Audio Placeholder Functions ---
// NOTE: These are placeholders. You need to implement the actual audio playback.
// 1. Add your audio files (e.g., countdown.mp3, rest.mp3) to the `public/assets/` directory.
// 2. Use the <audio> element with a ref to control playback.

const playCountdownSound = () => {
  console.log('PLAY: Countdown sound');
};

const playRestEndSound = () => {
  console.log('PLAY: Rest end sound');
};


// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px); // Assuming header height is 80px
  padding: 2rem;
  background-color: #f4f7f6;
`;

const TimerCircle = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 2rem;
`;

const TimerSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const TimerPath = styled.circle`
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
`;

const TimerBackground = styled(TimerPath)`
  stroke: #e6e6e6;
`;

const TimerProgress = styled(TimerPath)`
  stroke: ${props => (props.isResting ? '#f39c12' : '#3498db')};
  stroke-dasharray: 628; // 2 * PI * 100
  stroke-dashoffset: ${props => 628 * (1 - props.progress)};
  transition: stroke-dashoffset 1s linear, stroke 0.5s;
`;


const TimeDisplay = styled.div`
  font-size: 5rem;
  font-weight: 700;
  color: #333;
  z-index: 1;
`;

const StatusLabel = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 1rem;
  z-index: 1;
  height: 2.2rem; // Add height to prevent layout shift
`;

const StretchInfo = styled.div`
  text-align: left;
  max-width: 600px;
  width: 100%;
  z-index: 1;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
`;

const StretchName = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const InstructionList = styled.ol`
  padding-left: 20px;
  margin: 0;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.7;
`;

const InstructionStep = styled.li`
  margin-bottom: 1rem;
  &::marker {
    font-weight: 700;
    color: #3498db;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const ControlButton = styled.button`
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background-color: #3498db;
    color: white;
    &:hover { background-color: #2980b9; }
  }

  &.secondary {
    background-color: #e0e0e0;
    color: #333;
    &:hover { background-color: #bdbdbd; }
  }
  
  &.skip {
    background-color: #95a5a6;
    color: white;
    &:hover { background-color: #7f8c8d; }
  }
`;


// --- MAIN COMPONENT ---
const StretchExecutionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addActivity = useUserStore((state) => state.addActivity);
  const { playlist, duration, rest } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef(null);

  const finishSession = useCallback(() => {
    const totalDuration = (duration * playlist.length) + (rest * (playlist.length - 1));
    const activity = {
      id: Date.now(),
      date: new Date().toISOString(),
      playlist,
      duration,
      rest,
      totalDuration,
    };
    addActivity(activity);
    navigate('/stretch/setup', { state: { finished: true } });
  }, [playlist, duration, rest, addActivity, navigate]);

  const handleNext = useCallback(() => {
    if (isResting) { // Rest is over, start next stretch
      playRestEndSound();
      if (currentIndex + 1 < playlist.length) {
        setCurrentIndex(prev => prev + 1);
        setIsResting(false);
        setTimeLeft(duration);
      } else {
        finishSession();
      }
    } else { // Stretch is over, start rest or finish
      if (currentIndex + 1 < playlist.length) {
        setIsResting(true);
        setTimeLeft(rest);
      }
      else {
        finishSession();
      }
    }
  }, [isResting, currentIndex, playlist, duration, rest, finishSession]);

  useEffect(() => {
    if (!playlist || playlist.length === 0) {
      navigate('/stretch/setup');
      return;
    }
    
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, playlist, navigate]);

  useEffect(() => {
    if (!isResting && timeLeft > 0 && timeLeft <= 3) {
      playCountdownSound();
    }

    if (timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, isResting, handleNext]);

  if (!playlist || playlist.length === 0) {
    return null; // or a loading/redirecting message
  }

  const currentStretch = playlist[currentIndex];
  const nextStretch = playlist[currentIndex + 1];
  const totalDuration = isResting ? rest : duration;
  const progress = timeLeft / totalDuration;

  const infoStretch = isResting ? nextStretch : currentStretch;

  return (
    <PageContainer>
      <StatusLabel>
        {isResting ? `休憩中 (次は: ${nextStretch?.name})` : 'ストレッチ中'}
      </StatusLabel>
      
      <TimerCircle>
        <TimerSvg viewBox="0 0 220 220">
          <TimerBackground cx="110" cy="110" r="100" />
          <TimerProgress
            cx="110"
            cy="110"
            r="100"
            isResting={isResting}
            progress={progress}
          />
        </TimerSvg>
        <TimeDisplay>{timeLeft}</TimeDisplay>
      </TimerCircle>

      <StretchInfo>
        <StretchName>{infoStretch.name}</StretchName>
        <InstructionList>
          {infoStretch.description.map((step, index) => (
            <InstructionStep key={index}>{step}</InstructionStep>
          ))}
        </InstructionList>
      </StretchInfo>

      <Controls>
        <ControlButton className="primary" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? '再開' : '一時停止'}
        </ControlButton>
        <ControlButton className="skip" onClick={handleNext}>スキップ</ControlButton>
        <ControlButton className="secondary" onClick={finishSession}>
          終了
        </ControlButton>
      </Controls>
    </PageContainer>
  );
};

export default StretchExecutionPage;
