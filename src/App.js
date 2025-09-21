import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { useStretchStore } from './store/stretchStore';

import useUserDataSync from './hooks/useUserDataSync';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import StretchListPage from './pages/StretchListPage';
import ProfilePage from './pages/ProfilePage';
import StretchDetailPage from './pages/StretchDetailPage';
import StretchSetupPage from './pages/StretchSetupPage';
import StretchExecutionPage from './pages/StretchExecutionPage';
import DeveloperPage from './pages/DeveloperPage';

// Components
import Header from './components/Header';
import Modal from './components/Modal';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

function App() {
  useUserDataSync();
  const initializeStretches = useStretchStore(state => state.initializeStretches);

  useEffect(() => {
    initializeStretches();
  }, [initializeStretches]);

  return (
    <Router>
      <Header />
      <main>
        <AppContainer>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stretch" element={<StretchListPage />} />
            <Route path="/stretch/setup" element={<StretchSetupPage />} />
            <Route path="/stretch/play" element={<StretchExecutionPage />} />
            <Route path="/stretch/:id" element={<StretchDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/developer" element={<DeveloperPage />} />
          </Routes>
        </AppContainer>
      </main>
      <Modal />
    </Router>
  );
}

export default App;