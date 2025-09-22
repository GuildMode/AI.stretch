
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useUserStore from '../store/userStore';

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
  min-height: calc(100vh - 70px); // Header height
  padding: 2rem;
  background-color: ${props => props.theme.colors.lightGray};
`;

const TimerCircle = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.boxShadow};
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
  stroke: #e0e0e0;
`;

const TimerProgress = styled(TimerPath)`
  stroke: ${props => (props.isResting ? props.theme.colors.accent : props.theme.colors.primary)};
  stroke-dasharray: 628; // 2 * PI * 100
  stroke-dashoffset: ${props => 628 * (1 - props.progress)};
  transition: stroke-dashoffset 1s linear, stroke 0.5s;
`;


const TimeDisplay = styled.div`
  font-size: 5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  z-index: 1;
`;

const StatusLabel = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  z-index: 1;
  height: 2.2rem; // Add height to prevent layout shift
`;

const StretchInfo = styled.div`
  text-align: left;
  max-width: 600px;
  width: 100%;
  z-index: 1;
  background: ${props => props.theme.colors.white};
  padding: 2rem;
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.boxShadow};
`;

const StretchName = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.primary};
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const InstructionList = styled.ol`
  padding-left: 20px;
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.7;
`;

const InstructionStep = styled.li`
  margin-bottom: 1rem;
  &::marker {
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
  }
`;

const PointList = styled.ul`
  padding-left: 20px;
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.7;

  li {
    margin-bottom: 0.8rem;
    &::marker {
      color: ${props => props.theme.colors.secondary};
    }
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
  border: 1px solid transparent;
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: white;
    &:hover { opacity: 0.9; }
  }

  &.secondary {
    background-color: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.textSecondary};
    border-color: ${props => props.theme.colors.border};
    &:hover { background-color: ${props => props.theme.colors.background}; }
  }
  
  &.skip {
    background-color: ${props => props.theme.colors.accent};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.text};
    &:hover { opacity: 0.9; }
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
    // Calculate the actual duration based on completed stretches and rests
    let actualDuration = 0;
    if (currentIndex > 0) {
      actualDuration += currentIndex * duration; // Add completed stretches duration
      actualDuration += (isResting ? currentIndex : currentIndex - 1) * rest; // Add completed rests duration
    }
    // Add time spent in the current segment
    const timeInCurrentSegment = (isResting ? duration : duration) - timeLeft;
    if (!isResting) actualDuration += timeInCurrentSegment;

    const activity = {
      id: Date.now(),
      date: new Date().toISOString(),
      playlist,
      duration,
      rest,
      totalDuration: actualDuration, // Use the actual calculated duration
    };
    addActivity(activity);
    navigate('/stretch/complete', { state: { totalDuration: actualDuration, playlist } });
  }, [playlist, duration, rest, addActivity, navigate, currentIndex, isResting, timeLeft]);

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
        <SectionTitle>手順</SectionTitle>
        <InstructionList>
          {infoStretch.description.map((step, index) => (
            <InstructionStep key={index}>{step}</InstructionStep>
          ))}
        </InstructionList>

        <SectionTitle>ポイント</SectionTitle>
        <PointList>
          {infoStretch.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </PointList>
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
