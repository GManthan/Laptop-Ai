import React, { useState } from 'react';
import './ConfigPanel.css';

const ConfigPanel = ({ onApiKeySubmit, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('openai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onApiKeySubmit(apiKey, apiProvider);
      onClose();
    } catch (error) {
      alert('Failed to configure AI service: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="config-panel-overlay">
      <div className="config-panel">
        <div className="config-header">
          <h3>🤖 AI Service Configuration</h3>
          <button className="close-btn" onClick={onClose} title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="config-form">
          <div className="config-section">
            <p className="config-description">
              To enable the full AI assistant experience, please provide your API key.
              Your key is stored locally and never sent to our servers.
            </p>
            
            <div className="form-group">
              <label htmlFor="apiProvider">AI Provider:</label>
              <select 
                id="apiProvider" 
                value={apiProvider} 
                onChange={(e) => setApiProvider(e.target.value)}
                className="provider-select"
              >
                <option value="openai">OpenAI (GPT-3.5/GPT-4)</option>
                <option value="claude">Anthropic Claude</option>
                <option value="custom">Custom API</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="apiKey">
                {apiProvider === 'openai' && 'OpenAI API Key:'}
                {apiProvider === 'claude' && 'Claude API Key:'}
                {apiProvider === 'custom' && 'Custom API Key:'}
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'claude' ? 'Claude' : 'API'} key`}
                className="api-key-input"
                required
              />
            </div>
            
            <div className="api-info">
              {apiProvider === 'openai' && (
                <div className="info-box">
                  <p><strong>Get your OpenAI API key:</strong></p>
                  <ol>
                    <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
                    <li>Click "Create new secret key"</li>
                    <li>Copy and paste the key above</li>
                  </ol>
                </div>
              )}
              
              {apiProvider === 'claude' && (
                <div className="info-box">
                  <p><strong>Get your Claude API key:</strong></p>
                  <ol>
                    <li>Visit <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></li>
                    <li>Go to API Keys section</li>
                    <li>Create a new API key</li>
                    <li>Copy and paste the key above</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          
          <div className="config-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={!apiKey.trim() || isSubmitting}>
              {isSubmitting ? 'Configuring...' : 'Save Configuration'}
            </button>
          </div>
        </form>
        
        <div className="config-footer">
          <p className="privacy-note">
            🔒 Your API key is stored locally in your browser and is never transmitted to our servers.
            You can remove it anytime by clearing your browser data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;