import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(false);

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

  const startDemo = () => {
    setShowChat(true);
  };

  const endDemo = () => {
    setShowChat(false);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      {!showChat ? (
        <main className="landing-page">
          {/* Navigation */}
          <nav className="nav-header">
            <div className="nav-container">
              <div className="brand">
                <div className="brand-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                  </svg>
                </div>
                <span className="brand-name">LaptopAI</span>
              </div>
              <button className="theme-toggle" onClick={toggleTheme}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-container">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-text">✨ Powered by Advanced AI</span>
                </div>
                <h1 className="hero-title">
                  The Future of 
                  <span className="gradient-text"> Laptop Shopping</span>
                </h1>
                <p className="hero-subtitle">
                  Revolutionizing how customers discover, compare, and purchase laptops through 
                  intelligent AI conversations and personalized recommendations.
                </p>
                <div className="hero-stats">
                  <div className="stat">
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Accuracy</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">3x</div>
                    <div className="stat-label">Faster</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Available</div>
                  </div>
                </div>
                <div className="hero-actions">
                  <button className="demo-btn primary" onClick={startDemo}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                    </svg>
                    Experience Live Demo
                  </button>
                  <button className="demo-btn secondary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                    </svg>
                    View Presentation
                  </button>
                </div>
              </div>
              <div className="hero-visual">
                <div className="ai-showcase">
                  <div className="showcase-card main">
                    <div className="card-header">
                      <div className="ai-indicator">
                        <div className="ai-dot"></div>
                        <span>AI Assistant</span>
                      </div>
                      <div className="status-badge">Active</div>
                    </div>
                    <div className="card-content">
                      <div className="message-preview">
                        <div className="user-message">"I need a gaming laptop under $1500"</div>
                        <div className="ai-response">
                          <div className="typing-dots">
                            <span></span><span></span><span></span>
                          </div>
                          <p>Based on your requirements, I recommend the SkU...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="showcase-card secondary">
                    <div className="metric">
                      <div className="metric-value">127%</div>
                      <div className="metric-label">ROI Increase</div>
                    </div>
                  </div>
                  <div className="showcase-card tertiary">
                    <div className="feature-list">
                      <div className="feature-item">✓ Voice Recognition</div>
                      <div className="feature-item">✓ Smart Recommendations</div>
                      <div className="feature-item">✓ Price Comparison</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Value Proposition */}
          <section className="value-section">
            <div className="value-container">
              <div className="section-header">
                <h2>Why LaptopAI Changes Everything</h2>
                <p>Transform your laptop retail business with AI-powered customer assistance</p>
              </div>
              <div className="value-grid">
                <div className="value-card">
                  <div className="value-icon">🎯</div>
                  <h3>Precision Matching</h3>
                  <p>Advanced algorithms analyze customer needs and match them with perfect laptop specifications</p>
                  <div className="value-metric">95% satisfaction rate</div>
                </div>
                <div className="value-card">
                  <div className="value-icon">⚡</div>
                  <h3>Instant Expertise</h3>
                  <p>Every customer gets expert-level guidance instantly, no waiting for human specialists</p>
                  <div className="value-metric">3x faster decisions</div>
                </div>
                <div className="value-card">
                  <div className="value-icon">💰</div>
                  <h3>Revenue Growth</h3>
                  <p>Increase conversion rates and average order value through intelligent upselling</p>
                  <div className="value-metric">+127% ROI</div>
                </div>
                <div className="value-card">
                  <div className="value-icon">🌐</div>
                  <h3>Scale Globally</h3>
                  <p>Serve unlimited customers simultaneously with consistent quality across all channels</p>
                  <div className="value-metric">24/7 availability</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <div className="demo-mode">
          <div className="demo-header">
            <div className="demo-nav">
              <div className="demo-brand">
                <div className="brand-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                  </svg>
                </div>
                <span>LaptopAI Demo</span>
              </div>
              <div className="demo-controls">
                <button className="theme-toggle" onClick={toggleTheme}>
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button className="end-demo-btn" onClick={endDemo}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                  Exit Demo
                </button>
              </div>
            </div>
            <div className="demo-status">
              <div className="status-indicator">
                <div className="live-dot"></div>
                <span>Live Demo Active</span>
              </div>
            </div>
          </div>
          <main className="demo-main">
            <ChatInterface isDarkMode={isDarkMode} onMinimize={endDemo} />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;