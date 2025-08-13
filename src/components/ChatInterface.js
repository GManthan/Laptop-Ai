import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import aiService from '../services/aiService';

const ChatInterface = ({ isDarkMode, onMinimize }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your AI laptop assistant. I'm here to help you find the perfect laptop based on your specific needs and budget. What type of laptop are you looking for?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [aiError, setAiError] = useState(null);
  const messagesEndRef = useRef(null);
  const [collectedInfo, setCollectedInfo] = useState({
    name: 'Guest User',
    primaryUse: '',
    budget: '',
    brandPreference: '',
    screenSize: '',
    batteryLife: '',
    connectivity: '',
    otherRequirements: ''
  });
  const [currentQuestion] = useState(0);
  const [conversationMode, setConversationMode] = useState('questioning');

  // Quick action suggestions
  const quickActions = [
    "Gaming laptop under $1500",
    "Best laptop for programming",
    "Ultrabook for business travel",
    "Budget laptop for students",
    "Video editing workstation"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAIResponse = async (userMessage) => {
    setIsTyping(true);
    setAiError(null);
    
    try {
      // Update collected info based on conversation flow
      const updatedInfo = updateUserInfo(userMessage);
      
      let response;
      // Choose AI service method based on conversation mode
      if (conversationMode === 'recommendations' && Object.values(updatedInfo).filter(v => v).length >= 4) {
        response = await aiService.getLaptopRecommendations(updatedInfo);
      } else {
        response = await aiService.sendMessage(userMessage, updatedInfo);
      }
      
      // Check if we should switch to recommendations mode
      if (Object.values(updatedInfo).filter(v => v).length >= 6) {
        setConversationMode('recommendations');
      }
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('AI Response Error:', error);
      setAiError('AI service temporarily unavailable. Please try again.');
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now(),
        type: 'bot',
        text: `I'm having a brief issue but I'm back now! Let me help you find the perfect laptop - what specific features are you looking for?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const updateUserInfo = (userMessage) => {
    const newInfo = { ...collectedInfo };
    const lowerMessage = userMessage.toLowerCase();
    
    // Smart extraction of user preferences
    if (currentQuestion === 0 && !newInfo.name) {
      newInfo.name = userMessage;
    } else if (!newInfo.primaryUse && (lowerMessage.includes('gaming') || lowerMessage.includes('work') || lowerMessage.includes('school') || lowerMessage.includes('student'))) {
      newInfo.primaryUse = userMessage;
    } else if (!newInfo.budget && (lowerMessage.includes('$') || lowerMessage.includes('budget') || lowerMessage.includes('price'))) {
      newInfo.budget = userMessage;
    } else if (!newInfo.brandPreference && (lowerMessage.includes('performance') || lowerMessage.includes('budget') || lowerMessage.includes('premium') || lowerMessage.includes('business'))) {
      newInfo.brandPreference = userMessage;
    }
    
    setCollectedInfo(newInfo);
    return newInfo;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Handle AI response
    await handleAIResponse(inputValue);
    
    setInputValue('');
  };

  const handleQuickAction = async (action) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await handleAIResponse(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Simulate voice input
      setTimeout(() => {
        setInputValue('I need a laptop for gaming and video editing with a budget around $1500');
        setIsVoiceActive(false);
      }, 2000);
    }
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="ai-status-indicator"></div>
          <span>LaptopAI Assistant</span>
        </div>
        <div className="chat-controls">
          <button className="minimize-btn" onClick={onMinimize} title="Minimize chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,13H19V11H5V13Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {/* Status Banner */}
        {!aiError && (
          <div className="status-banner">
            <div className="status-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C13.75,2 15.25,3.5 15.25,5.25C15.25,7 13.75,8.5 12,8.5C10.25,8.5 8.75,7 8.75,5.25C8.75,3.5 10.25,2 12,2M4,18V20H20V18C20,16 16,15 12,15C8,15 4,16 4,18Z"/>
              </svg>
            </div>
            <div className="status-content">
              <div className="status-title">AI Assistant Active</div>
              <div className="status-description">I'm ready to help you find the perfect laptop for your needs</div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {aiError && (
          <div className="error-banner">
            <div className="status-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"/>
              </svg>
            </div>
            <div className="status-content">
              <div className="status-title">Connection Issue</div>
              <div className="status-description">{aiError}</div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="messages-area">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                  </svg>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <p>{message.text}</p>
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="typing-message">
              <div className="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                </svg>
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  AI is thinking...
                </span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="input-section">
        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action"
              onClick={() => handleQuickAction(action)}
              disabled={isTyping}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Container */}
        <div className="input-container">
          <textarea
            className="message-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isVoiceActive ? "🎤 Listening..." : "Ask me about laptops..."}
            disabled={isTyping}
            rows="1"
          />
          <div className="input-actions">
            <button
              className={`voice-btn ${isVoiceActive ? 'active' : ''}`}
              onClick={toggleVoice}
              disabled={isTyping}
              title={isVoiceActive ? 'Stop listening' : 'Start voice input'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {isVoiceActive ? (
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V20A1,1 0 0,1 12,21A1,1 0 0,1 11,20V17.93C7.61,17.44 5,14.53 5,11A1,1 0 0,1 6,10A1,1 0 0,1 7,11A5,5 0 0,0 12,16A5,5 0 0,0 17,11A1,1 0 0,1 18,10A1,1 0 0,1 19,11Z"/>
                ) : (
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V20A1,1 0 0,1 12,21A1,1 0 0,1 11,20V17.93C7.61,17.44 5,14.53 5,11A1,1 0 0,1 6,10A1,1 0 0,1 7,11A5,5 0 0,0 12,16A5,5 0 0,0 17,11A1,1 0 0,1 18,10A1,1 0 0,1 19,11Z"/>
                )}
              </svg>
            </button>
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={isTyping || inputValue.trim() === ''}
              title="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;