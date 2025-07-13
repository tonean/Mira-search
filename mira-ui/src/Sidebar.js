import React, { useState } from "react";
import "./App.css";

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const handleMouseEnter = () => {
    if (isCollapsed) {
      onToggleCollapse();
    }
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) {
      onToggleCollapse();
    }
  };

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-top-section">
        <div className="sidebar-icon-row">
          <span 
            className="sidebar-hamburger" 
            onClick={onToggleCollapse}
            style={{ cursor: 'pointer' }}
          >
            &#9776;
          </span>
        </div>
        {!isCollapsed && (
          <>
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
          </>
        )}
      </div>
      <div className="sidebar-icons">
        {!isCollapsed ? (
          <>
            <span>🏠</span>
            <span>❓</span>
            <span>💡</span>
            <span>⚗️</span>
            <span>🔗</span>
          </>
        ) : (
          <div className="collapsed-icons">
            <span>🏠</span>
            <span>❓</span>
            <span>💡</span>
            <span>⚗️</span>
            <span>🔗</span>
          </div>
        )}
      </div>
    </div>
  );
} 