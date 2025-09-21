import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useUserStore } from '../store/userStore';

const HeaderContainer = styled.header`
  padding: 20px 40px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

  // NavLinkがアクティブな（現在のページと一致する）場合に適用されるスタイル
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

const LogoutButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #d32f2f;
  }
`;

const Header = () => {
  const reset = useUserStore((state) => state.reset);

  const handleLogout = () => {
    reset();
    // 必要に応じて、ホームページやログインページにリダイレクトする処理を追加
  };

  return (
    <HeaderContainer>
      <Logo to="/">AI.stretch</Logo>
      <Nav>
        <StyledNavLink to="/dashboard">ダッシュボード</StyledNavLink>
        <StyledNavLink to="/stretch">ストレッチ一覧</StyledNavLink>
        <StyledNavLink to="/profile">プロフィール</StyledNavLink>
        <LogoutButton onClick={handleLogout}>ログアウト</LogoutButton>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;