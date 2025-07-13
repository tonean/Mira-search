import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainContent from "./MainContent";
import "./App.css";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="app-container">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar}
      />
      <div className={`main-area ${isSidebarCollapsed ? 'main-area-expanded' : ''}`}>
        <TopBar />
        <MainContent />
      </div>
    </div>
  );
}

export default App;
