import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainContent from "./MainContent";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <MainContent />
      </div>
    </div>
  );
}

export default App;
