import React, { useState } from 'react';
import './PreferenceForm.css';

const PreferenceForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    primaryUse: '',
    budget: '',
    brandPreference: '',
    screenSize: '',
    batteryLife: '',
    connectivity: '',
    otherRequirements: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return formData.primaryUse && formData.budget && formData.screenSize;
  };

  return (
    <div className="preference-form">
      <div className="form-container">
        <div className="form-header">
          <h2>Quick Laptop Finder</h2>
          <p>Fill out this form to get instant laptop recommendations</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Primary Use *</label>
            <div className="radio-group">
              {['Work & Productivity', 'Gaming', 'Content Creation', 'Student Use', 'General Use'].map(option => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name="primaryUse"
                    value={option}
                    checked={formData.primaryUse === option}
                    onChange={(e) => handleInputChange('primaryUse', e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Budget Range *</label>
            <div className="radio-group">
              {['Under $500', '$500 - $1000', '$1000 - $1500', '$1500 - $2500', 'Over $2500'].map(option => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name="budget"
                    value={option}
                    checked={formData.budget === option}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Brand Preference</label>
            <select 
              value={formData.brandPreference}
              onChange={(e) => handleInputChange('brandPreference', e.target.value)}
            >
              <option value="">No preference</option>
              <option value="Apple">Apple</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Lenovo">Lenovo</option>
              <option value="ASUS">ASUS</option>
              <option value="Acer">Acer</option>
              <option value="Microsoft">Microsoft</option>
              <option value="MSI">MSI</option>
            </select>
          </div>

          <div className="form-section">
            <label>Screen Size Preference *</label>
            <div className="radio-group">
              {['13-14 inches (Ultraportable)', '15-16 inches (Balanced)', '17+ inches (Large)'].map(option => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name="screenSize"
                    value={option}
                    checked={formData.screenSize === option}
                    onChange={(e) => handleInputChange('screenSize', e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Battery Life Importance</label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.batteryLife || 3}
                onChange={(e) => handleInputChange('batteryLife', e.target.value)}
                className="slider"
              />
              <div className="slider-labels">
                <span>Not Important</span>
                <span>Very Important</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label>Required Connectivity</label>
            <div className="checkbox-group">
              {['USB-C', 'HDMI', 'SD Card', 'Ethernet', 'Multiple USB ports'].map(option => (
                <label key={option} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    checked={formData.connectivity?.includes(option) || false}
                    onChange={(e) => {
                      const current = formData.connectivity || '';
                      const options = current ? current.split(', ') : [];
                      if (e.target.checked) {
                        options.push(option);
                      } else {
                        const index = options.indexOf(option);
                        if (index > -1) options.splice(index, 1);
                      }
                      handleInputChange('connectivity', options.join(', '));
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Additional Requirements</label>
            <textarea
              value={formData.otherRequirements}
              onChange={(e) => handleInputChange('otherRequirements', e.target.value)}
              placeholder="Any specific software requirements, preferred operating system, or other needs..."
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={!isFormValid()}
          >
            Find My Perfect Laptop
          </button>
        </form>
      </div>
    </div>
  );
};

export default PreferenceForm;