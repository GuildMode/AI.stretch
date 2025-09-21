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
  height: calc(100vh - 150px); /* Adjust height considering header */
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #222;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2.5rem;
  max-width: 600px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const CTAButton = styled.button`
  border: none;
  padding: 15px 35px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.3s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const GoogleButton = styled(CTAButton)`
  background-color: #4285F4;
  color: #FFFFFF;
  &:hover { background-color: #357ae8; }
`;

const GuestButton = styled(CTAButton)`
  background-color: #e0e0e0;
  color: #333;
  &:hover { background-color: #d5d5d5; }
`;

const HomePage = () => {
  const navigate = useNavigate();
  const setGuest = useAuthStore(state => state.setGuest);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(getFirebaseAuth(), googleProvider);
      // onAuthStateChanged in authStore will handle navigation and state updates
      // But we can navigate immediately for a better user experience.
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error);
      // Handle errors here, e.g., show a notification to the user
    }
  };

  const handleGuestLogin = () => {
    setGuest();
    navigate('/dashboard');
  };

  return (
    <HomeContainer>
      <Title>AI.stretch</Title>
      <Subtitle>AIがあなたのためのストレッチを提案するパーソナルトレーナー</Subtitle>
      <ButtonContainer>
        <GoogleButton onClick={handleGoogleLogin}>Googleでログイン</GoogleButton>
        <GuestButton onClick={handleGuestLogin}>ゲストとして始める</GuestButton>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default HomePage;
