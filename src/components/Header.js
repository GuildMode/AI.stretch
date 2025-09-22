import React, { useState } from 'react';
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
  display: none; /* Hidden on mobile by default */
  @media (min-width: 768px) {
    display: flex;
    gap: ${({ theme }) => theme.spacing.large};
    align-items: center;
  }
`;

const MobileMenu = styled.nav`
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.surface};
  position: absolute;
  top: 70px; /* Position below the header */
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.large};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MenuIcon = styled.div`
  display: block;
  cursor: pointer;

  div {
    width: 25px;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.text};
    margin: 5px 0;
    transition: 0.4s;
  }

  @media (min-width: 768px) {
    display: none;
  }
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

  /* For mobile dropdown */
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.medium};
    margin-top: ${({ theme }) => theme.spacing.medium};
    padding-top: ${({ theme }) => theme.spacing.medium};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    width: 100%;
  }
`;

const UserProfileLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }

  span {
    display: none;
    @media (min-width: 768px) {
      display: inline;
    }
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

  @media (max-width: 767px) {
    width: 100%;
    text-align: center;
  }
`;

const Header = () => {
  const { user, isGuest, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/');
    setMenuOpen(false);
  }

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const renderAuthSection = (isMobile) => {
    if (isLoading) {
      return null; // Or a loading spinner
    }

    if (user) {
      if (isMobile) {
        return null; // Per user request, hide profile icon in mobile menu
      }
      return (
        <UserProfileLink to="/settings" onClick={closeMenu}>
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
      <Logo to={user || isGuest ? '/home' : '/'} onClick={closeMenu}>AI.stretch</Logo>
      
      {/* Desktop Navigation */}
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
          {renderAuthSection(false)}
        </AuthSection>
      </Nav>

      {/* Hamburger Icon for mobile */}
      {(user || isGuest) && (
        <MenuIcon onClick={() => setMenuOpen(!isMenuOpen)}>
          <div />
          <div />
          <div />
        </MenuIcon>
      )}

      {/* Mobile Navigation Menu */}
      <MobileMenu isOpen={isMenuOpen}>
        {(user || isGuest) && (
          <>
            <StyledNavLink to="/home" onClick={closeMenu}>ホーム</StyledNavLink>
            <StyledNavLink to="/stretch" onClick={closeMenu}>ストレッチ</StyledNavLink>
            <StyledNavLink to="/history" onClick={closeMenu}>履歴</StyledNavLink>
            <StyledNavLink to="/settings" onClick={closeMenu}>設定</StyledNavLink>
          </>
        )}
        <AuthSection>
          {renderAuthSection(true)}
        </AuthSection>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
