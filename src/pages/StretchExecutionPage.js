import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as Tone from 'tone';
import useUserStore from '../store/userStore';

// --- Tone.js Synths ---
const preSynth = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
}).toDestination();
preSynth.volume.value = -20;

const switchSynth = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
}).toDestination();

// --- STYLED COMPONENTS (SHARED) ---
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
  stroke-width: ${props => props.strokeWidth || 12};
  stroke-linecap: round;
`;

const TimerBackground = styled(TimerPath)`
  stroke: #e0e0e0;
`;

const TimerProgress = styled(TimerPath)`
  stroke: ${props => (props.isResting ? props.theme.colors.accent : props.theme.colors.primary)};
  transition: stroke-dashoffset 1s linear, stroke 0.5s;
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


// --- DESKTOP-ONLY STYLED COMPONENTS ---
const DesktopPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background-color: ${props => props.theme.colors.lightGray};

  @media (max-width: 767px) {
    display: none;
  }
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
  flex-shrink: 0;
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
  height: 2.2rem;
  text-align: center;
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


// --- MOBILE-ONLY STYLED COMPONENTS ---
const MobilePageContainer = styled.div`
  display: none;
  background-color: ${props => props.theme.colors.lightGray};

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 70px); // Full height minus header
  }
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const MobileTimerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden; // To contain the ellipsed text
`;

const MobileCompactTimer = styled.div`
  width: 50px;
  height: 50px;
  position: relative;
  flex-shrink: 0;
  
  .time-display {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const MobileStretchName = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MobileContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const MobileControls = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;

  ${ControlButton}.primary {
    grid-column: 1 / -1; // Make pause/resume button full width
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
  const [isPaused, setIsPaused] = useState(false); // Start timer immediately

  const intervalRef = useRef(null);

  const finishSession = useCallback(() => {
    let actualDuration = 0;
    if (currentIndex > 0) {
      actualDuration += currentIndex * duration;
      actualDuration += (isResting ? currentIndex : currentIndex - 1) * rest;
    }
    const timeInCurrentSegment = (isResting ? rest : duration) - timeLeft;
    if (!isResting) actualDuration += timeInCurrentSegment;

    const activity = {
      id: Date.now(),
      date: new Date().toISOString(),
      playlist,
      duration,
      rest,
      totalDuration: actualDuration,
    };
    addActivity(activity);
    navigate('/stretch/complete', { state: { totalDuration: actualDuration, playlist } });
  }, [playlist, duration, rest, addActivity, navigate, currentIndex, isResting, timeLeft]);

  const handleNext = useCallback(() => {
    switchSynth.triggerAttackRelease('G4', '8n');
    if (isResting) {
      if (currentIndex + 1 < playlist.length) {
        setCurrentIndex(prev => prev + 1);
        setIsResting(false);
        setTimeLeft(duration);
      } else {
        finishSession();
      }
    } else {
      if (currentIndex + 1 < playlist.length) {
        setIsResting(true);
        setTimeLeft(rest);
      } else {
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
    if (isPaused) return;

    if (!isResting && timeLeft > 0 && timeLeft <= 3) {
      preSynth.triggerAttackRelease('C4', '32n');
    }

    if (timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, isResting, handleNext, isPaused]);

  if (!playlist || playlist.length === 0) {
    return null;
  }

  const currentStretch = playlist[currentIndex];
  const nextStretch = playlist[currentIndex + 1];
  const totalTimerDuration = isResting ? rest : duration;
  const progress = timeLeft / totalTimerDuration;

  const infoStretch = isResting ? nextStretch : currentStretch;

  const renderTimerProgress = (radius, strokeWidth) => {
    const circumference = 2 * Math.PI * radius;
    const svgSize = radius * 2 + strokeWidth * 2;
    return (
      <TimerSvg viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <TimerBackground cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} strokeWidth={strokeWidth} />
        <TimerProgress
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          isResting={isResting}
          strokeWidth={strokeWidth}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - progress),
          }}
        />
      </TimerSvg>
    );
  };

  return (
    <>
      {/* --- DESKTOP LAYOUT --- */}
      <DesktopPageContainer>
        <StatusLabel>
          {isResting ? `休憩中 (次は: ${nextStretch?.name})` : 'ストレッチ中'}
        </StatusLabel>
        
        <TimerCircle>
          {renderTimerProgress(100, 12)}
          <TimeDisplay>{timeLeft}</TimeDisplay>
        </TimerCircle>

        {infoStretch && <StretchInfo>
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
        </StretchInfo>}

        <Controls>
          <ControlButton className="primary" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '再開' : '一時停止'}
          </ControlButton>
          <ControlButton className="skip" onClick={handleNext}>スキップ</ControlButton>
          <ControlButton className="secondary" onClick={finishSession}>
            終了
          </ControlButton>
        </Controls>
      </DesktopPageContainer>

      {/* --- MOBILE LAYOUT --- */}
      <MobilePageContainer>
        <MobileHeader>
          <MobileTimerInfo>
            <MobileCompactTimer>
              {renderTimerProgress(20, 8)}
              <div className="time-display">{timeLeft}</div>
            </MobileCompactTimer>
            {infoStretch && <MobileStretchName>
              {isResting ? `休憩中 (次は: ${nextStretch?.name})` : infoStretch.name}
            </MobileStretchName>}
          </MobileTimerInfo>
        </MobileHeader>

        <MobileContent>
          {infoStretch && (
            <>
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
            </>
          )}
        </MobileContent>

        <MobileControls>
           <ControlButton className="primary" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '再開' : '一時停止'}
          </ControlButton>
          <ControlButton className="skip" onClick={handleNext}>スキップ</ControlButton>
          <ControlButton className="secondary" onClick={finishSession}>
            終了
          </ControlButton>
        </MobileControls>
      </MobilePageContainer>
    </>
  );
};

export default StretchExecutionPage;
