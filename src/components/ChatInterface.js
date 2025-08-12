import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import aiService from '../services/aiService';
import ConfigPanel from './ConfigPanel';

const ChatInterface = ({ isDarkMode, isCallActive = false }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your AI laptop assistant. I'm here to help you find the perfect laptop based on your specific needs and preferences. What's your name?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [conversationMode, setConversationMode] = useState('questioning'); // 'questioning', 'recommendations', 'general'

  // Check AI service configuration on component mount
  useEffect(() => {
    const checkAIService = async () => {
      try {
        // Test with a simple message
        await aiService.sendMessage('Hello', {});
        setIsConnected(true);
      } catch (error) {
        console.warn('AI Service not available:', error.message);
        setIsConnected(false);
        if (error.message.includes('API key')) {
          setAiError('AI service not configured. Please add your API key to use the full AI assistant.');
        } else {
          setAiError('AI service temporarily unavailable.');
        }
      }
    };
    
    // Only check if we have an API key configured
    if (process.env.REACT_APP_OPENAI_API_KEY || process.env.REACT_APP_CLAUDE_API_KEY || process.env.REACT_APP_AI_API_KEY) {
      checkAIService();
    } else {
      setAiError('No AI API key configured. Add REACT_APP_OPENAI_API_KEY to your .env file.');
      setIsConnected(false);
    }
  }, []);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAIResponse = async (userMessage) => {
    setIsTyping(true);
    setIsSpeaking(true);
    setAiError(null);
    
    try {
      let response;
      
      // Update collected info based on conversation flow
      const updatedInfo = updateUserInfo(userMessage);
      
      // Choose AI service method based on conversation mode
      if (conversationMode === 'recommendations' && Object.values(updatedInfo).filter(v => v).length >= 4) {
        response = await aiService.getLaptopRecommendations(updatedInfo);
      } else {
        response = await aiService.sendMessage(userMessage, updatedInfo);
      }
      
      // Check if we should switch to recommendations mode
      if (Object.values(updatedInfo).filter(v => v).length >= 6) {
        setConversationMode('recommendations');
        setShowRecommendations(true);
      }
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsConnected(true);
      
    } catch (error) {
      console.error('AI Response Error:', error);
      setAiError(error.message);
      setIsConnected(false);
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now(),
        type: 'bot',
        text: `I'm having trouble connecting to my AI service right now. ${error.message.includes('API key') ? 'Please check the API configuration.' : 'Let me try to help you anyway - what specific laptop features are you looking for?'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
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
    } else if (!newInfo.brandPreference && (lowerMessage.includes('apple') || lowerMessage.includes('dell') || lowerMessage.includes('hp') || lowerMessage.includes('lenovo'))) {
      newInfo.brandPreference = userMessage;
    }
    
    setCollectedInfo(newInfo);
    return newInfo;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

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

  // Clear conversation and start fresh
  const resetConversation = () => {
    aiService.clearHistory();
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: "Hello! I'm your AI laptop assistant. I'm here to help you find the perfect laptop based on your specific needs and preferences. What's your name?",
        timestamp: new Date()
      }
    ]);
    setCollectedInfo({
      name: 'Guest User',
      primaryUse: '',
      budget: '',
      brandPreference: '',
      screenSize: '',
      batteryLife: '',
      connectivity: '',
      otherRequirements: ''
    });
    setCurrentQuestion(0);
    setShowRecommendations(false);
    setConversationMode('questioning');
    setAiError(null);
  };
  
  // Handle API key configuration
  const handleApiKeySubmit = async (apiKey, provider) => {
    // Store API key locally
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_provider', provider);
    
    // Update service configuration
    aiService.apiKey = apiKey;
    if (provider === 'claude') {
      aiService.baseUrl = 'https://api.anthropic.com/v1';
    } else if (provider === 'openai') {
      aiService.baseUrl = 'https://api.openai.com/v1';
    }
    
    // Test the connection
    try {
      await aiService.sendMessage('Hello', {});
      setIsConnected(true);
      setAiError(null);
      
      // Add success message
      const successMessage = {
        id: Date.now(),
        type: 'bot',
        text: `✅ AI service connected successfully! I'm ready to help you find the perfect laptop. What's your name?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      setIsConnected(false);
      setAiError('Failed to connect with the provided API key. Please check and try again.');
      throw error;
    }
  };
  
  // Load saved API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_provider');
    
    if (savedApiKey) {
      aiService.apiKey = savedApiKey;
      if (savedProvider === 'claude') {
        aiService.baseUrl = 'https://api.anthropic.com/v1';
      }
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
    if (!micEnabled) {
      setInputValue('🎤 Listening...');
      setTimeout(() => {
        setInputValue('I need a laptop for gaming and content creation with a budget around $1500');
      }, 2000);
    } else {
      setInputValue('');
    }
  };

  const toggleCall = () => {
    setIsInCall(!isInCall);
    if (!isInCall) {
      setIsSpeaking(true);
      const callMessage = {
        id: Date.now(),
        type: 'bot',
        text: "Perfect! I'm now in voice mode. You can speak to me directly, and I'll respond with voice as well. What would you like to know about laptops?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, callMessage]);
      setTimeout(() => setIsSpeaking(false), 3000);
    } else {
      setIsSpeaking(false);
      setMicEnabled(false);
    }
  };

  return (
    <div className="chat-interface">
      
      <div className="chat-container">
        <div className="voice-header">
          <div className={`voice-visualizer ${isSpeaking ? 'speaking' : ''}`}>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
          <div className="status-text">
            {aiError ? '⚠️ AI Service Error' : 
             !isConnected ? '🔄 Reconnecting...' :
             isTyping ? 'AI is thinking...' : 
             isSpeaking ? 'Speaking...' : 
             isInCall ? 'Connected' : 'Ready to help'}
          </div>
        </div>

        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <div className="message-content typing">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {aiError && (
          <div className="ai-error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{aiError}</span>
              {aiError.includes('API key') && (
                <button 
                  className="config-btn" 
                  onClick={() => setShowConfigPanel(true)}
                  title="Configure AI Service"
                >
                  ⚙️ Configure
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="controls-section">
          <div className="voice-controls">
            <button 
              className={`control-btn call-btn ${isInCall ? 'active' : ''}`}
              onClick={toggleCall}
              title={isInCall ? 'End call' : 'Start voice call'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                {isInCall ? (
                  <path d="M12,9C13.66,9 15,7.66 15,6C15,4.34 13.66,3 12,3C10.34,3 9,4.34 9,6C9,7.66 10.34,9 12,9M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M16,13H8A2,2 0 0,0 6,15C6,17.22 7.79,19 10,19H14C16.21,19 18,17.22 18,15A2,2 0 0,0 16,13Z"/>
                ) : (
                  <path d="M15,12A3,3 0 0,0 18,9A3,3 0 0,0 15,6A3,3 0 0,0 12,9A3,3 0 0,0 15,12M6,10V7H4V10H1V12H4V15H6V12H9V10M15,16C12.33,16 7,17.33 7,20V22H23V20C23,17.33 17.67,16 15,16Z"/>
                )}
              </svg>
            </button>
            
            <button 
              className={`control-btn mic-btn ${micEnabled ? 'active' : ''}`}
              onClick={toggleMic}
              disabled={!isInCall}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                {micEnabled ? (
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V20A1,1 0 0,1 12,21A1,1 0 0,1 11,20V17.93C7.61,17.44 5,14.53 5,11A1,1 0 0,1 6,10A1,1 0 0,1 7,11A5,5 0 0,0 12,16A5,5 0 0,0 17,11A1,1 0 0,1 18,10A1,1 0 0,1 19,11Z"/>
                ) : (
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V20A1,1 0 0,1 12,21A1,1 0 0,1 11,20V17.93C7.61,17.44 5,14.53 5,11A1,1 0 0,1 6,10A1,1 0 0,1 7,11A5,5 0 0,0 12,16A5,5 0 0,0 17,11A1,1 0 0,1 18,10A1,1 0 0,1 19,11M16.5,12C16.5,12 17.5,12 17.5,12L22,16.5L20.5,18L16,13.5C16,13.5 16,12.5 16,12.5L16.5,12M3.27,2L21,19.73L19.73,21L2,3.27L3.27,2Z"/>
                )}
              </svg>
            </button>
          </div>
          
          <div className="input-section">
            <div className="input-container">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={aiError ? "AI service unavailable - check configuration" : isInCall ? "Voice mode active - speak or type..." : "Type your message here..."}
                disabled={isTyping || (aiError && !aiError.includes('API key'))}
                rows="1"
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isTyping || inputValue.trim() === ''}
                className="send-btn"
                title="Send message"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20L21,12L3,4V11L14,12L3,13V20M5,17V15.5L11.5,12L5,8.5V7L18,12L5,17Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showConfigPanel && (
        <ConfigPanel 
          onApiKeySubmit={handleApiKeySubmit}
          onClose={() => setShowConfigPanel(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;