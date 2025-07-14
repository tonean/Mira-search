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
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="#888" strokeWidth="1.5" fill="none"/>
              <line x1="7" y1="2" x2="7" y2="18" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
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