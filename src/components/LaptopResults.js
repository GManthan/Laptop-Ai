import React, { useState, useEffect } from 'react';
import './LaptopResults.css';

const LaptopResults = ({ preferences, onStartOver }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateRecommendations = (prefs) => {
    const mockLaptops = [
      {
        id: 1,
        name: "MacBook Air M3",
        brand: "Apple",
        price: 1099,
        image: "💻",
        specs: {
          processor: "Apple M3",
          ram: "8GB",
          storage: "256GB SSD",
          display: "13.6\" Liquid Retina",
          battery: "Up to 18 hours",
          weight: "2.7 lbs"
        },
        pros: ["Excellent battery life", "Lightweight and portable", "Great build quality", "Silent operation"],
        cons: ["Limited ports", "Not great for gaming", "Expensive storage upgrades"],
        matchScore: 92,
        bestFor: ["Work & Productivity", "Student Use", "General Use"]
      },
      {
        id: 2,
        name: "Dell XPS 13",
        brand: "Dell",
        price: 899,
        image: "💻",
        specs: {
          processor: "Intel Core i5-13th Gen",
          ram: "8GB",
          storage: "512GB SSD",
          display: "13.4\" FHD+",
          battery: "Up to 12 hours",
          weight: "2.6 lbs"
        },
        pros: ["Premium build quality", "Good display", "Compact design", "Good performance"],
        cons: ["Limited ports", "Can get warm", "Average battery life"],
        matchScore: 88,
        bestFor: ["Work & Productivity", "Student Use"]
      },
      {
        id: 3,
        name: "SkU",
        brand: "***",
        price: 1299,
        image: "🎮",
        specs: {
          processor: "AMD Ryzen 7 6800H",
          ram: "16GB",
          storage: "512GB SSD",
          display: "15.6\" FHD 144Hz",
          battery: "Up to 8 hours",
          weight: "5.1 lbs"
        },
        pros: ["Excellent gaming performance", "High refresh display", "Good cooling", "Customizable RGB"],
        cons: ["Heavy", "Short battery life", "Can be noisy"],
        matchScore: 95,
        bestFor: ["Gaming", "Content Creation"]
      },
      {
        id: 4,
        name: "Lenovo ThinkPad X1 Carbon",
        brand: "Lenovo",
        price: 1599,
        image: "💼",
        specs: {
          processor: "Intel Core i7-13th Gen",
          ram: "16GB",
          storage: "512GB SSD",
          display: "14\" WUXGA",
          battery: "Up to 15 hours",
          weight: "2.5 lbs"
        },
        pros: ["Excellent keyboard", "Durable build", "Great for business", "Good security features"],
        cons: ["Expensive", "Not great for gaming", "Conservative design"],
        matchScore: 90,
        bestFor: ["Work & Productivity"]
      },
      {
        id: 5,
        name: "HP Pavilion 15",
        brand: "HP",
        price: 649,
        image: "💻",
        specs: {
          processor: "AMD Ryzen 5 5600H",
          ram: "8GB",
          storage: "256GB SSD",
          display: "15.6\" FHD",
          battery: "Up to 8 hours",
          weight: "3.9 lbs"
        },
        pros: ["Great value", "Decent performance", "Good for everyday tasks", "Affordable"],
        cons: ["Build quality could be better", "Average display", "Limited gaming capability"],
        matchScore: 75,
        bestFor: ["Student Use", "General Use"]
      }
    ];

    let filtered = mockLaptops;
    let scores = {};

    mockLaptops.forEach(laptop => {
      let score = laptop.matchScore;
      
      if (prefs.primaryUse && laptop.bestFor.includes(prefs.primaryUse)) {
        score += 10;
      }
      
      if (prefs.brandPreference && laptop.brand === prefs.brandPreference) {
        score += 8;
      }
      
      if (prefs.budget) {
        const budgetRanges = {
          'Under $500': [0, 500],
          '$500 - $1000': [500, 1000],
          '$1000 - $1500': [1000, 1500],
          '$1500 - $2500': [1500, 2500],
          'Over $2500': [2500, 10000]
        };
        
        const range = budgetRanges[prefs.budget];
        if (range && laptop.price >= range[0] && laptop.price <= range[1]) {
          score += 15;
        } else {
          score -= 10;
        }
      }
      
      scores[laptop.id] = Math.max(0, Math.min(100, score));
    });

    filtered = filtered.map(laptop => ({
      ...laptop,
      matchScore: scores[laptop.id]
    }));

    filtered.sort((a, b) => b.matchScore - a.matchScore);
    
    return filtered.slice(0, 4);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const recs = generateRecommendations(preferences);
      setRecommendations(recs);
      setLoading(false);
    }, 1500);
  }, [preferences]);

  const getMatchColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#2196F3';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <div className="laptop-results">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Finding your perfect laptop...</h2>
          <p>Analyzing your preferences and comparing thousands of models</p>
        </div>
      </div>
    );
  }

  return (
    <div className="laptop-results">
      <div className="results-header">
        <h2>Your Laptop Recommendations</h2>
        <p>Based on your preferences, here are the best laptops for you</p>
        <button onClick={onStartOver} className="start-over-btn">
          Start Over
        </button>
      </div>

      <div className="results-grid">
        {recommendations.map((laptop, index) => (
          <div key={laptop.id} className={`laptop-card ${index === 0 ? 'best-match' : ''}`}>
            {index === 0 && <div className="best-match-badge">Best Match</div>}
            
            <div className="laptop-header">
              <div className="laptop-icon">{laptop.image}</div>
              <div className="laptop-info">
                <h3>{laptop.name}</h3>
                <p className="brand">{laptop.brand}</p>
                <p className="price">${laptop.price}</p>
              </div>
              <div 
                className="match-score"
                style={{ color: getMatchColor(laptop.matchScore) }}
              >
                {laptop.matchScore}% Match
              </div>
            </div>

            <div className="specs-section">
              <h4>Specifications</h4>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Processor:</span>
                  <span>{laptop.specs.processor}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">RAM:</span>
                  <span>{laptop.specs.ram}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Storage:</span>
                  <span>{laptop.specs.storage}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Display:</span>
                  <span>{laptop.specs.display}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Battery:</span>
                  <span>{laptop.specs.battery}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Weight:</span>
                  <span>{laptop.specs.weight}</span>
                </div>
              </div>
            </div>

            <div className="pros-cons-section">
              <div className="pros">
                <h4>✅ Pros</h4>
                <ul>
                  {laptop.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                </ul>
              </div>
              <div className="cons">
                <h4>❌ Cons</h4>
                <ul>
                  {laptop.cons.map((con, i) => <li key={i}>{con}</li>)}
                </ul>
              </div>
            </div>

            <div className="best-for-section">
              <h4>Best for:</h4>
              <div className="tags">
                {laptop.bestFor.map((use, i) => (
                  <span key={i} className="tag">{use}</span>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button className="view-details-btn">View Details</button>
              <button className="compare-btn">Add to Compare</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaptopResults;