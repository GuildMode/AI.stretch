import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { useStretchStore } from './store/stretchStore';
import useAuthStore from './store/authStore';
import { initializeFirebase } from './firebase';
import useUserDataSync from './hooks/useUserDataSync';

import { ThemeProvider } from 'styled-components';
import { getTheme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import useUiStore from './store/uiStore';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import StretchListPage from './pages/StretchListPage';
import SettingsPage from './pages/SettingsPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import StretchDetailPage from './pages/StretchDetailPage';
import StretchSetupPage from './pages/StretchSetupPage';
import StretchExecutionPage from './pages/StretchExecutionPage';
import SessionCompletionPage from './pages/SessionCompletionPage';
import DeveloperPage from './pages/DeveloperPage';
import DeveloperRoute from './components/DeveloperRoute';

// Components
import Header from './components/Header';
import Modal from './components/Modal';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.5rem;
`;

function App() {
  const [isAppInitialized, setAppInitialized] = useState(false);
  const listenToAuthChanges = useAuthStore(state => state.listenToAuthChanges);
  const themeMode = useUiStore(state => state.themeMode);
  const activeTheme = getTheme(themeMode);

  // This effect runs once on app startup to initialize services.
  useEffect(() => {
    initializeFirebase().then(success => {
      if (success) {
        // After Firebase is ready, start listening for auth changes.
        listenToAuthChanges();
        setAppInitialized(true);
      }
      // If initialization fails, the app will be stuck on the loading screen.
    });
  }, [listenToAuthChanges]);

  // This effect initializes the stretch data from the local data file.
  const initializeStretches = useStretchStore(state => state.initializeStretches);
  useEffect(() => {
    initializeStretches();
  }, [initializeStretches]);

  // This custom hook syncs user data with Firestore or localStorage.
  useUserDataSync();

  // Render a loading screen until services are ready.
  if (!isAppInitialized) {
    return <LoadingScreen>アプリを初期化しています...</LoadingScreen>;
  }

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyle />
      <Router>
        <Header />
        <main>
          <AppContainer>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<DashboardPage />} />
              <Route path="/stretch" element={<StretchListPage />} />
              <Route path="/stretch/setup" element={<StretchSetupPage />} />
              <Route path="/stretch/play" element={<StretchExecutionPage />} />
              <Route path="/stretch/complete" element={<SessionCompletionPage />} />
              <Route path="/stretch/:id" element={<StretchDetailPage />} />
              <Route path="/history" element={<ActivityHistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route element={<DeveloperRoute />}>
                <Route path="/developer" element={<DeveloperPage />} />
              </Route>
            </Routes>
          </AppContainer>
        </main>
        <Modal />
      </Router>
    </ThemeProvider>
  );
}

export default App;