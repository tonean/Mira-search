import React from "react";
import "./App.css";

export default function TopBar() {
  return (
    <div className="top-bar">
      <button 
        style={{
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
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
        style={{
          backgroundColor: 'transparent',
          color: '#000',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Sign up
      </button>
    </div>
  );
} 