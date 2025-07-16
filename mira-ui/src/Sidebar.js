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
            style={{ cursor: 'pointer', marginRight: isCollapsed ? 6 : 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="var(--text-muted)" strokeWidth="1.5" fill="none"/>
              <line x1="7" y1="2" x2="7" y2="18" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        {isCollapsed && (
          <div className="collapsed-icons">
            {/* Plus icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
            {/* Magnifying glass icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            {/* Globe icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/></svg></span>
            {/* User icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg></span>
          </div>
        )}
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
        {!isCollapsed && (
          <>
            {/* Plus icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
            {/* Magnifying glass icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            {/* Globe icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/></svg></span>
            {/* User icon */}
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg></span>
          </>
        )}
      </div>
    </div>
  );
} 