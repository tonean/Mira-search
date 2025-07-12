import React from "react";
import "./App.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-top-section">
        <div className="sidebar-icon-row">
          <span className="sidebar-hamburger">&#9776;</span>
        </div>
        <button className="new-task-btn">+ Add Connection</button>
        <div className="filters">
          <button className="filter selected">All</button>
          <button className="filter">Favorites</button>
          <button className="filter">Scheduled</button>
        </div>
        <div className="create-task-hint">
          <div className="dotted-box" />
          <span>Create a new task to get started</span>
        </div>
      </div>
      <div className="sidebar-icons">
        {/* Icons can be added here */}
        <span>🏠</span>
        <span>❓</span>
        <span>💡</span>
        <span>⚗️</span>
        <span>🔗</span>
      </div>
    </div>
  );
} 