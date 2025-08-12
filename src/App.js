import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showChatOnly, setShowChatOnly] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startCall = () => {
    setShowChat(true);
  };

  const endCall = () => {
    setShowChat(false);
  };

  const openChatOnly = () => {
    setShowChatOnly(true);
  };

  const closeChatOnly = () => {
    setShowChatOnly(false);
  };

  if (showChatOnly) {
    return (
      <div className={`App chat-only-mode ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="chat-only-header">
          <button className="back-btn" onClick={closeChatOnly} title="Back to main">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
            </svg>
          </button>
          <h1>AI Chat Assistant</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <main className="chat-only-main">
          <ChatInterface isDarkMode={isDarkMode} chatOnlyMode={true} />
        </main>
      </div>
    );
  }

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="App-header">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="App-main">
        {!showChat ? (
          <div className="ai-assistant-center">
            <div className="ai-avatar">
              <div className="ai-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H18A1,1 0 0,1 19,9V10C19,10.55 19.45,11 20,11A1,1 0 0,1 21,12A1,1 0 0,1 20,13C19.45,13 19,13.45 19,14V15A1,1 0 0,1 18,16H14A1,1 0 0,0 13,17V18.27C13.6,18.61 14,19.26 14,20A2,2 0 0,1 12,22A2,2 0 0,1 10,20C10,19.26 10.4,18.61 11,18.27V17A1,1 0 0,0 10,16H6A1,1 0 0,1 5,15V14C5,13.45 4.55,13 4,13A1,1 0 0,1 3,12A1,1 0 0,1 4,11C4.55,11 5,10.55 5,10V9A1,1 0 0,1 6,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,10A0.5,0.5 0 0,0 7,10.5A0.5,0.5 0 0,0 7.5,11A0.5,0.5 0 0,0 8,10.5A0.5,0.5 0 0,0 7.5,10M16.5,10A0.5,0.5 0 0,0 16,10.5A0.5,0.5 0 0,0 16.5,11A0.5,0.5 0 0,0 17,10.5A0.5,0.5 0 0,0 16.5,10M12,13A0.5,0.5 0 0,0 11.5,13.5A0.5,0.5 0 0,0 12,14A0.5,0.5 0 0,0 12.5,13.5A0.5,0.5 0 0,0 12,13Z"/>
                </svg>
              </div>
              <div className="ai-pulse-rings">
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
              </div>
            </div>
            
            <div className="ai-info">
              <h1>AI Laptop Assistant</h1>
              <p>Your intelligent laptop buying companion</p>
              <div className="ai-features">
                <div className="feature">🎯 Personalized Recommendations</div>
                <div className="feature">🗣️ Voice Interaction</div>
                <div className="feature">📊 Smart Comparison</div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="start-call-btn" onClick={startCall}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15,12A3,3 0 0,0 18,9A3,3 0 0,0 15,6A3,3 0 0,0 12,9A3,3 0 0,0 15,12M6,10V7H4V10H1V12H4V15H6V12H9V10M15,16C12.33,16 7,17.33 7,20V22H23V20C23,17.33 17.67,16 15,16Z"/>
                </svg>
                Start a Call
              </button>
              
              <button className="chat-mode-btn" onClick={openChatOnly}>
                💬 Chat Mode
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-active-container">
            <div className="chat-header-controls">
              <button className="end-call-btn" onClick={endCall}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9C13.66,9 15,7.66 15,6C15,4.34 13.66,3 12,3C10.34,3 9,4.34 9,6C9,7.66 10.34,9 12,9M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M16,13H8A2,2 0 0,0 6,15C6,17.22 7.79,19 10,19H14C16.21,19 18,17.22 18,15A2,2 0 0,0 16,13Z"/>
                </svg>
                End Call
              </button>
              <span className="call-status">🔴 Live Call Active</span>
            </div>
            <ChatInterface isDarkMode={isDarkMode} chatOnlyMode={false} isCallActive={true} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;