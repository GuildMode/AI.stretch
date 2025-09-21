import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

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

const CTAButton = styled(Link)`
  background-color: #333333;
  color: #FFFFFF;
  border: none;
  padding: 15px 35px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.3s ease;

  &:hover {
    background-color: #000;
    transform: translateY(-3px);
  }
`;

const HomePage = () => {
  return (
    <HomeContainer>
      <Title>AI.stretch</Title>
      <Subtitle>AIがあなたのためのストレッチを提案するパーソナルトレーナー</Subtitle>
      <CTAButton to="/dashboard">無料で始める</CTAButton>
    </HomeContainer>
  );
};

export default HomePage;