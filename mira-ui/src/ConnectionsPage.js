import React, { useState, useEffect } from "react";
import "./App.css";

function ConnectionToggle({ label, onToggle, enabled = false }) {
  const [thumbActive, setThumbActive] = useState(false);

  // Animate thumb scale on toggle
  const handleToggle = () => {
    if (onToggle) {
      onToggle(label, !enabled);
    }
    setThumbActive(true);
    setTimeout(() => setThumbActive(false), 180); // 180ms scale effect
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 2 }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          style={{ display: 'none' }}
        />
                  <span
            style={{
              width: 34,
              height: 18,
              background: enabled ? '#444' : 'var(--input-border)',
              borderRadius: 12,
              position: 'relative',
              transition: 'background 0.25s cubic-bezier(.4,1.6,.6,1)',
              display: 'inline-block',
              boxShadow: 'none',
            }}
          >
                      <span
              style={{
                position: 'absolute',
                left: enabled ? 18 : 2,
                top: 1,
                width: 14,
                height: 14,
                background: 'var(--bg)',
                borderRadius: '50%',
                boxShadow: '0 1px 2px #0001',
                transition: 'left 0.22s cubic-bezier(.4,1.6,.6,1), transform 0.18s cubic-bezier(.4,1.6,.6,1)',
                border: '1px solid var(--input-border)',
                transform: thumbActive ? 'scale(1.18)' : 'scale(1)',
              }}
            />
        </span>
      </label>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2, fontWeight: 500, letterSpacing: 0.1, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{enabled ? 'Connected' : 'Connect'}</span>
    </div>
  );
}

// Accept isSidebarCollapsed as a prop
export default function ConnectionsPage({ isSidebarCollapsed = false, onConnectionUpdate }) {
  // Inject shake animation CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
        20%, 40%, 60%, 80% { transform: translateX(4px); }
      }
      .shake-animation {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [showTwitterModal, setShowTwitterModal] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Manual');
  const [twitterFile, setTwitterFile] = useState(null);
  const [linkedInFile, setLinkedInFile] = useState(null);
  const [twitterShake, setTwitterShake] = useState(false);
  const [linkedInShake, setLinkedInShake] = useState(false);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  const handleToggleConnection = (label, enabled) => {
    if (label === 'Twitter' && !twitterConnected) {
      setShowTwitterModal(true);
    }
    if (label === 'LinkedIn' && !linkedInConnected) {
      setShowLinkedInModal(true);
    }
  };

  const handleConnectionSuccess = (service) => {
    if (onConnectionUpdate) {
      onConnectionUpdate(service, true);
    }
    
    // Mark service as connected
    if (service === 'Twitter') {
      setTwitterConnected(true);
    }
    if (service === 'LinkedIn') {
      setLinkedInConnected(true);
    }
    
    // Close modals and reset files
    setShowTwitterModal(false);
    setShowLinkedInModal(false);
    setTwitterFile(null);
    setLinkedInFile(null);
  };

  const handleTwitterFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTwitterFile(file);
    }
  };

  const handleLinkedInFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLinkedInFile(file);
    }
  };

  const removeTwitterFile = () => {
    setTwitterFile(null);
    // Reset the file input
    const fileInput = document.getElementById('twitter-file-input');
    if (fileInput) fileInput.value = '';
  };

  const removeLinkedInFile = () => {
    setLinkedInFile(null);
    // Reset the file input
    const fileInput = document.getElementById('linkedin-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleTwitterUpload = () => {
    if (twitterFile) {
      handleConnectionSuccess('Twitter');
    } else {
      // Trigger shake animation
      setTwitterShake(true);
      setTimeout(() => setTwitterShake(false), 500);
    }
  };

  const handleLinkedInUpload = () => {
    if (linkedInFile) {
      handleConnectionSuccess('LinkedIn');
    } else {
      // Trigger shake animation
      setLinkedInShake(true);
      setTimeout(() => setLinkedInShake(false), 500);
    }
  };

  // Make content span the full width of the main area, with some responsive padding
  const pageStyle = {
    background: 'var(--bg)',
    minHeight: '100vh',
    padding: '0 0 0 0',
    width: '100%',
    boxSizing: 'border-box',
  };
  const contentStyle = {
    width: '100%',
    padding: isSidebarCollapsed ? '0 24px 0 40px' : '0 24px 0 60px',
    boxSizing: 'border-box',
    maxWidth: '100vw',
  };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 600, color: '#222', marginBottom: 20, marginTop: 8, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Find Connections</h1>
        <div style={{ color: '#333', fontSize: '1.0rem', marginBottom: 8 }}>
          Search your network for people you follow and you follows you to find connections and viable matches to your search.
        </div>
        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ marginRight: 4 }}><circle cx="10" cy="10" r="9" stroke="#bbb" strokeWidth="1.5"/><path d="M10 7v4" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="15" r="1" fill="#bbb"/></svg>
          We don't share, sell, or use your data to train AI models.
        </div>
        <div style={{ marginBottom: 18 }}>
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, marginBottom: 14, display: 'flex', alignItems: 'center', padding: '20px 16px', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style={{ width: 38, height: 38, marginRight: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.13rem', color: '#222', marginBottom: 4 }}>LinkedIn</div>
            <div style={{ color: '#444', fontSize: '0.95rem' }}>Connect with LinkedIn.</div>
          </div>
          <ConnectionToggle label="LinkedIn" onToggle={handleToggleConnection} enabled={linkedInConnected} />
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', padding: '20px 16px', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style={{ width: 38, height: 38, marginRight: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.13rem', color: '#222', marginBottom: 4 }}>Twitter</div>
            <div style={{ color: '#444', fontSize: '0.95rem' }}>Connect with Twitter.</div>
          </div>
          <ConnectionToggle label="Twitter" onToggle={handleToggleConnection} enabled={twitterConnected} />
        </div>
        
        {/* Coming Soon Section */}
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#888', marginBottom: 16 }}>Coming Soon</h3>
          <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, marginBottom: 14, display: 'flex', alignItems: 'center', padding: '20px 16px', gap: 18, opacity: 0.5, cursor: 'not-allowed' }}>
            <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="Gmail" style={{ width: 38, height: 38, marginRight: 8, opacity: 0.6 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '1.13rem', color: '#888', marginBottom: 4 }}>Gmail</div>
                              <div style={{ color: '#aaa', fontSize: '0.95rem' }}>Connect with Gmail.</div>
            </div>
                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
               <span style={{
                 width: 34,
                 height: 18,
                 background: '#f0f0f0',
                 borderRadius: 12,
                 position: 'relative',
                 display: 'inline-block',
               }}>
                 <span style={{
                   position: 'absolute',
                   left: 2,
                   top: 1,
                   width: 14,
                   height: 14,
                   background: '#fff',
                   borderRadius: '50%',
                   boxShadow: '0 1px 2px #0001',
                   border: '1px solid #e0e0e0',
                 }} />
               </span>
              <span style={{ color: '#bbb', fontSize: '0.8rem', marginTop: 2, fontWeight: 500, letterSpacing: 0.1, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Soon</span>
            </div>
          </div>
        </div>
        {/* Add extra space at the bottom for scrolling comfort */}
        <div style={{ height: 60 }} />
      </div>

      {/* Twitter Connection Modal */}
      {showTwitterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '85%',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2" style={{ marginRight: '10px' }}>
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#222', margin: 0, flex: 1 }}>
                Connect Twitter
              </h2>
              <button
                onClick={() => setShowTwitterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>



            {/* Manual Tab Content */}
            <div>
              {/* Hidden File Input */}
              <input
                type="file"
                id="twitter-file-input"
                accept=".js,.json"
                onChange={handleTwitterFileSelect}
                style={{ display: 'none' }}
              />
              
              {/* File Upload Section */}
              <div 
                onClick={() => document.getElementById('twitter-file-input').click()}
                className={twitterShake ? 'shake-animation' : ''}
                style={{ 
                  border: twitterFile ? '2px solid #1DA1F2' : '2px dashed #e0e0e0', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  textAlign: 'center',
                  marginBottom: '20px',
                  backgroundColor: twitterFile ? '#f0f8ff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!twitterFile) {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.borderColor = '#ccc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!twitterFile) {
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                {twitterFile ? (
                  <div>
                    {/* X button to remove file */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTwitterFile();
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'transparent',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#666'}
                      onMouseLeave={(e) => e.target.style.color = '#000'}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2" style={{ marginRight: '6px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1DA1F2', margin: 0 }}>
                        File Selected
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                      {twitterFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {(twitterFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#666" strokeWidth="2"/>
                      <path d="M12 8v8M8 12h8" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#222', margin: 0 }}>
                      File upload
                    </h3>
                  </div>
                )}
              </div>

                 {/* Instructions */}
                 <div style={{ marginBottom: '20px', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px' }}>
                                     <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '30px' }}>
                     <div style={{
                       width: '28px',
                       height: '28px',
                       borderRadius: '50%',
                       backgroundColor: '#e8f5e8',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       marginRight: '12px',
                       flexShrink: 0
                     }}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="#4caf50">
                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                         <polyline points="14,2 14,8 20,8"/>
                         <line x1="16" y1="13" x2="8" y2="13"/>
                         <line x1="16" y1="17" x2="8" y2="17"/>
                         <polyline points="10,9 9,9 8,9"/>
                       </svg>
                     </div>
                     <div>
                       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                         <span style={{ fontSize: '1rem', fontWeight: '600', color: '#4caf50', marginRight: '6px' }}>
                           Export your data
                         </span>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="#4caf50">
                           <path d="M7 17l9.2-9.2M17 17V7H7" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                       <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                         Download your data from Twitter.
                       </p>
                     </div>
                   </div>

                   <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                     <div style={{
                       width: '28px',
                       height: '28px',
                       borderRadius: '50%',
                       backgroundColor: '#e8f5e8',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       marginRight: '12px',
                       flexShrink: 0
                     }}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="#4caf50">
                         <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                       </svg>
                     </div>
                     <div>
                       <div style={{ fontSize: '1rem', fontWeight: '600', color: '#222', marginBottom: '2px' }}>
                         Locate the file
                       </div>
                       <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 6px 0' }}>
                         In your downloaded zip file, find
                       </p>
                       <code style={{ 
                         backgroundColor: '#f5f5f5', 
                         padding: '3px 6px', 
                         borderRadius: '4px', 
                         fontSize: '0.85rem',
                         color: '#666',
                         fontFamily: 'monospace'
                       }}>
                         export / data / follower.js
                       </code>
                     </div>
                   </div>
                </div>

                                 {/* Upload Button */}
                 <button 
                   style={{
                     width: '100%',
                     padding: '12px 20px',
                     backgroundColor: twitterFile ? '#333333' : '#ccc',
                     color: '#fff',
                     border: 'none',
                     borderRadius: '10px',
                     fontSize: '1rem',
                     fontWeight: '600',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '6px',
                     transition: 'background-color 0.2s',
                     opacity: twitterFile ? 1 : 0.6
                   }}
                   onMouseEnter={(e) => {
                     if (twitterFile) e.target.style.backgroundColor = '#222222';
                   }}
                   onMouseLeave={(e) => {
                     if (twitterFile) e.target.style.backgroundColor = '#333333';
                   }}
                   onClick={() => handleTwitterUpload()}
                 >
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                     <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                   </svg>
                   Upload
                 </button>
               </div>
          </div>
        </div>
      )}

      {/* LinkedIn Connection Modal */}
      {showLinkedInModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '85%',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5" style={{ marginRight: '10px' }}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#222', margin: 0, flex: 1 }}>
                Connect LinkedIn
              </h2>
              <button
                onClick={() => setShowLinkedInModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Manual Tab Content */}
            <div>
              {/* Hidden File Input */}
              <input
                type="file"
                id="linkedin-file-input"
                accept=".csv"
                onChange={handleLinkedInFileSelect}
                style={{ display: 'none' }}
              />
              
              {/* File Upload Section */}
              <div 
                onClick={() => document.getElementById('linkedin-file-input').click()}
                className={linkedInShake ? 'shake-animation' : ''}
                style={{ 
                  border: linkedInFile ? '2px solid #0077B5' : '2px dashed #e0e0e0', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  textAlign: 'center',
                  marginBottom: '20px',
                  backgroundColor: linkedInFile ? '#f0f8ff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!linkedInFile) {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.borderColor = '#ccc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!linkedInFile) {
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                {linkedInFile ? (
                  <div>
                    {/* X button to remove file */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLinkedInFile();
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'transparent',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#666'}
                      onMouseLeave={(e) => e.target.style.color = '#000'}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5" style={{ marginRight: '6px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0077B5', margin: 0 }}>
                        File Selected
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                      {linkedInFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {(linkedInFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#666" strokeWidth="2"/>
                      <path d="M12 8v8M8 12h8" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#222', margin: 0 }}>
                      File upload
                    </h3>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: '20px', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '30px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f5e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#4caf50">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: '#4caf50', marginRight: '6px' }}>
                        Export your data
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#4caf50">
                        <path d="M7 17l9.2-9.2M17 17V7H7" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                      Download your data from LinkedIn.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f5e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#4caf50">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#222', marginBottom: '2px' }}>
                      Locate the file
                    </div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 6px 0' }}>
                      In your downloaded zip file, find
                    </p>
                    <code style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '3px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      color: '#666',
                      fontFamily: 'monospace'
                    }}>
                      connections.csv
                    </code>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <button 
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  backgroundColor: linkedInFile ? '#333333' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s',
                  opacity: linkedInFile ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (linkedInFile) e.target.style.backgroundColor = '#222222';
                }}
                onMouseLeave={(e) => {
                  if (linkedInFile) e.target.style.backgroundColor = '#333333';
                }}
                                 onClick={() => handleLinkedInUpload()}
              >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                   <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                 </svg>
                 Upload
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 