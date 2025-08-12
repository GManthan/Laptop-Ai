import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ isDarkMode, chatOnlyMode = false, isCallActive = false }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your AI laptop assistant. I'm here to help you find the perfect laptop based on your specific needs and preferences. Let's start with a few questions:",
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'bot',
      text: "What's your name?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
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
  const [chatStuck, setChatStuck] = useState(false);

  const questions = [
    "What's your name?",
    "What will you primarily use the laptop for?",
    "What's your budget range?",
    "Do you have any brand preferences?",
    "What screen size do you prefer?",
    "How important is battery life to you?",
    "Do you need specific ports or connectivity options?",
    "Any other requirements or preferences?"
  ];

  const mockRecommendations = [
    {
      id: 1,
      name: "MacBook Air M3",
      brand: "Apple",
      price: "$1,099",
      image: "💻",
      specs: "M3 Chip, 8GB RAM, 256GB SSD",
      reason: "Perfect for productivity and long battery life"
    },
    {
      id: 2,
      name: "Dell XPS 13",
      brand: "Dell", 
      price: "$899",
      image: "💻",
      specs: "Intel i5-13th Gen, 8GB RAM, 512GB SSD",
      reason: "Great balance of performance and portability"
    },
    {
      id: 3,
      name: "ASUS ROG Strix G15",
      brand: "ASUS",
      price: "$1,299", 
      image: "🎮",
      specs: "AMD Ryzen 7, 16GB RAM, RTX 4060",
      reason: "Excellent for gaming and content creation"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = (userMessage, questionIndex) => {
    setChatStuck(false);
    setIsTyping(true);
    setIsSpeaking(true);
    
    const timeout = setTimeout(() => {
      const newCollectedInfo = { ...collectedInfo };
      
      switch (questionIndex) {
        case 0:
          newCollectedInfo.name = userMessage;
          break;
        case 1:
          newCollectedInfo.primaryUse = userMessage;
          break;
        case 2:
          newCollectedInfo.budget = userMessage;
          break;
        case 3:
          newCollectedInfo.brandPreference = userMessage;
          break;
        case 4:
          newCollectedInfo.screenSize = userMessage;
          break;
        case 5:
          newCollectedInfo.batteryLife = userMessage;
          break;
        case 6:
          newCollectedInfo.connectivity = userMessage;
          break;
        case 7:
          newCollectedInfo.otherRequirements = userMessage;
          break;
        default:
          break;
      }
      
      setCollectedInfo(newCollectedInfo);
      
      let botResponse;
      const nextQuestionIndex = questionIndex + 1;
      
      if (nextQuestionIndex < questions.length) {
        if (questionIndex === 0) {
          botResponse = `Nice to meet you, ${userMessage}! ${questions[nextQuestionIndex]}`;
        } else {
          botResponse = `Perfect! ${questions[nextQuestionIndex]}`;
        }
        setCurrentQuestion(nextQuestionIndex);
      } else {
        botResponse = `Excellent, ${newCollectedInfo.name}! I have all the information I need. Based on your requirements, I can recommend some outstanding laptops that would be perfect for your needs. Would you like me to show you the top options?`;
        setShowRecommendations(true);
      }
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
    }, 1200 + Math.random() * 800);

    setTimeout(() => {
      if (timeout) {
        setChatStuck(true);
      }
    }, 10000);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (showRecommendations && inputValue.toLowerCase().includes('yes')) {
      showRecommendationsList();
    } else if (showRecommendations && inputValue.toLowerCase().includes('no')) {
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        text: "No problem! Feel free to ask me any other questions about laptops or if you'd like to start over with new requirements.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      simulateBotResponse(inputValue, currentQuestion);
    }
    
    setInputValue('');
  };

  const showRecommendationsList = () => {
    setIsTyping(true);
    setTimeout(() => {
      const recommendationText = `Here are my top 3 laptop recommendations for you, ${collectedInfo.name}:

${mockRecommendations.map((laptop, index) => 
`${index + 1}. ${laptop.image} **${laptop.name}** - ${laptop.price}
   ${laptop.specs}
   ${laptop.reason}`
).join('\n\n')}

Would you like more details about any of these laptops?`;

      const botMessage = {
        id: Date.now(),
        type: 'bot',
        text: recommendationText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

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
    <div className={`chat-interface ${chatOnlyMode ? 'chat-only' : ''}`}>
      {chatOnlyMode && (
        <div className="user-info-panel">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <h3>{collectedInfo.name || 'Guest User'}</h3>
              <div className="user-info-grid">
                {collectedInfo.primaryUse && <div className="info-item"><strong>Use:</strong> {collectedInfo.primaryUse}</div>}
                {collectedInfo.budget && <div className="info-item"><strong>Budget:</strong> {collectedInfo.budget}</div>}
                {collectedInfo.brandPreference && <div className="info-item"><strong>Brand:</strong> {collectedInfo.brandPreference}</div>}
                {collectedInfo.screenSize && <div className="info-item"><strong>Size:</strong> {collectedInfo.screenSize}</div>}
              </div>
            </div>
          </div>
          {showRecommendations && (
            <div className="quick-recommendations">
              <h4>📱 Quick Recommendations</h4>
              {mockRecommendations.slice(0, 2).map(laptop => (
                <div key={laptop.id} className="mini-laptop-card">
                  <span className="laptop-emoji">{laptop.image}</span>
                  <div>
                    <div className="laptop-name">{laptop.name}</div>
                    <div className="laptop-price">{laptop.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
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
            {chatStuck ? '⚠️ Chat seems stuck - try refreshing' : 
             isTyping ? 'Thinking...' : 
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
                placeholder={isInCall ? "Voice mode active - speak or type..." : "Type your message here..."}
                disabled={isTyping}
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
    </div>
  );
};

export default ChatInterface;