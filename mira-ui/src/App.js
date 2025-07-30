import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MainContent from './MainContent';
import ConnectionsPage from './ConnectionsPage';
import LoadingScreen from './LoadingScreen';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [connectedServices, setConnectedServices] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavigateChat = (chatTitle) => {
    console.log('Navigate to chat:', chatTitle);
  };

  const handleDeleteChat = (index) => {
    setChatHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleConnectionUpdate = (service, connected) => {
    if (connected) {
      setConnectedServices(prev => [...prev.filter(s => s !== service), service]);
    } else {
      setConnectedServices(prev => prev.filter(s => s !== service));
    }
  };

  const handleOpenMira = () => {
    setShowLoadingScreen(false);
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (showLoadingScreen) {
    return <LoadingScreen onOpenMira={handleOpenMira} />;
  }

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar 
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebar}
                chatHistory={chatHistory}
                onNavigateChat={handleNavigateChat}
                onDeleteChat={handleDeleteChat}
                darkMode={darkMode}
                connectedServices={connectedServices}
              />
              <div className={`main-area ${isSidebarCollapsed ? 'main-area-expanded' : ''}`}>
                <TopBar 
                  darkMode={darkMode} 
                  toggleDarkMode={toggleDarkMode}
                  onSignUpClick={handleSignUp}
                  onLoginClick={handleLogin}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
                <MainContent darkMode={darkMode} />
              </div>
            </>
          } />
          <Route path="/connections" element={
            <>
              <Sidebar 
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebar}
                chatHistory={chatHistory}
                onNavigateChat={handleNavigateChat}
                onDeleteChat={handleDeleteChat}
                darkMode={darkMode}
                connectedServices={connectedServices}
              />
              <div className={`main-area ${isSidebarCollapsed ? 'main-area-expanded' : ''}`}>
                <TopBar 
                  darkMode={darkMode} 
                  toggleDarkMode={toggleDarkMode}
                  onSignUpClick={handleSignUp}
                  onLoginClick={handleLogin}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
                <ConnectionsPage 
                  isSidebarCollapsed={isSidebarCollapsed}
                  onConnectionUpdate={handleConnectionUpdate}
                />
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;