import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 ${({ theme }) => theme.spacing.large};
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Logo = styled(NavLink)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.large};
  align-items: center;
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: 500;
  position: relative;
  padding: 5px 0;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserProfileLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const LoginButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Header = () => {
  const { user, isGuest, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navigate to home page to login
    navigate('/');
  }

  const renderAuthSection = () => {
    if (isLoading) {
      return null; // Or a loading spinner
    }

    if (user) {
      return (
        <UserProfileLink to="/settings">
          <UserAvatar src={user.photoURL} alt={user.displayName} />
          <span>{user.displayName}</span>
        </UserProfileLink>
      );
    }

    if (isGuest) {
      return <LoginButton onClick={handleLogin}>ログイン</LoginButton>;
    }

    return null; // Not logged in and not a guest
  };

  return (
    <HeaderContainer>
      <Logo to={user || isGuest ? '/home' : '/'}>AI.stretch</Logo>
      <Nav>
        {(user || isGuest) && (
          <>
            <StyledNavLink to="/home">ホーム</StyledNavLink>
            <StyledNavLink to="/stretch">ストレッチ</StyledNavLink>
            <StyledNavLink to="/history">履歴</StyledNavLink>
            <StyledNavLink to="/settings">設定</StyledNavLink>
          </>
        )}
        <AuthSection>
          {renderAuthSection()}
        </AuthSection>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
