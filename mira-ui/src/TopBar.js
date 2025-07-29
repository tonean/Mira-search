import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function TopBar({ darkMode, toggleDarkMode, onSignUpClick, onLoginClick, user, isAuthenticated, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const modalRef = useRef(null);
  const profileRef = useRef(null);

  const handleProfileClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    onLogout();
    setShowLogoutModal(false);
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogoutModal && 
          modalRef.current && 
          !modalRef.current.contains(event.target) &&
          profileRef.current &&
          !profileRef.current.contains(event.target)) {
        setShowLogoutModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoutModal]);

  return (
    <div className="top-bar">
      {!isAuthenticated ? (
        <>
          <button 
            onClick={onLoginClick}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--border-dark)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Log in
          </button>
          <button 
            onClick={onSignUpClick}
            style={{
              backgroundColor: 'var(--primary)',
              color: darkMode ? 'var(--border-dark)' : '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Sign up
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <div 
            ref={profileRef}
            onClick={handleProfileClick}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'transparent'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}>
            <img 
              src={user?.picture} 
              alt={user?.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              display: 'none',
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                {user?.given_name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#000',
                lineHeight: '1.2',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {user?.given_name && user?.family_name 
                  ? `${user.given_name} ${user.family_name}` 
                  : user?.name || 'User'
                }
              </span>
              <span style={{ 
                fontSize: '0.85rem', 
                color: '#666',
                lineHeight: '1.2'
              }}>
                Free
              </span>
            </div>
          </div>

          {/* Logout Modal */}
          {showLogoutModal && (
            <div 
              ref={modalRef}
              style={{
                position: 'absolute',
                top: '50px',
                right: '0px',
                zIndex: 3000
              }}
            >
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '8px 12px',
                minWidth: '120px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e0e0e0'
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    color: '#d32f2f',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
          </button>
              </div>
            </div>
          )}
        </div>
      )}
      <button
        onClick={toggleDarkMode}
        style={{
          background: 'none',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 20,
          color: 'var(--primary)'
        }}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          // Sun icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          // Moon icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
        )}
      </button>
    </div>
  );
} 