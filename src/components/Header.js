import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';

const HeaderContainer = styled.header`
  padding: 20px 40px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`;

const Logo = styled(NavLink)`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 30px;
  align-items: center;
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: #555;
  font-size: 16px;
  font-weight: 500;
  position: relative;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #000;
  }

  &.active {
    color: #3498db;
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #3498db;
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
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #2980b9;
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
        <UserProfileLink to="/profile">
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
      <Logo to={user || isGuest ? '/dashboard' : '/'}>AI.stretch</Logo>
      <Nav>
        {(user || isGuest) && (
          <>
            <StyledNavLink to="/dashboard">ダッシュボード</StyledNavLink>
            <StyledNavLink to="/stretch">ストレッチ一覧</StyledNavLink>
            <StyledNavLink to="/profile">プロフィール</StyledNavLink>
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
