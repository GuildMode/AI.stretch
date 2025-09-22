import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const DeveloperRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    // 認証状態が確認できるまで何も表示しないか、ローディング表示を出す
    return <div>Loading...</div>;
  }

  // 開発者のメールアドレス
  const developerEmail = 'guild.mov@gmail.com';

  // ユーザーがログインしており、かつメールアドレスが一致する場合のみ子ルートを表示
  return user && user.email.toLowerCase() === developerEmail ? <Outlet /> : <Navigate to="/home" />;
};

export default DeveloperRoute;
