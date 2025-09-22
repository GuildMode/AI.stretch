import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getFirebaseAuth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import useAuthStore from '../store/authStore';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 70px); // Header height
  text-align: center;
  padding: 0 ${({ theme }) => theme.spacing.medium};
  animation: ${fadeIn} 0.8s ease-out;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.h1};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.large};
  max-width: 600px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const CTAButton = styled.button`
  padding: 12px 30px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius};
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.3s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.boxShadow};
  }
`;

const GoogleButton = styled(CTAButton)`
  background-color: #4285F4;
  color: #FFFFFF;
  &:hover { background-color: #357ae8; }
`;

const GuestButton = styled(CTAButton)`
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  &:hover { background-color: #d1d5db; } // Tailwind Gray 300
`;

const HomePage = () => {
  const navigate = useNavigate();
  const setGuest = useAuthStore(state => state.setGuest);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(getFirebaseAuth(), googleProvider);
      // onAuthStateChanged in authStore will handle navigation and state updates
      // But we can navigate immediately for a better user experience.
      navigate('/home');
    } catch (error) {
      console.error("Error during Google login:", error);
      // Handle errors here, e.g., show a notification to the user
    }
  };

  const handleGuestLogin = () => {
    setGuest();
    navigate('/home');
  };

  return (
    <HomeContainer>
      <Title>AI.stretch</Title>
      <Subtitle>あなたのためのストレッチを提案するAIパーソナルトレーナー</Subtitle>
      <ButtonContainer>
        <GoogleButton onClick={handleGoogleLogin}>Googleでログイン</GoogleButton>
        <GuestButton onClick={handleGuestLogin}>ゲストとして始める</GuestButton>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default HomePage;
