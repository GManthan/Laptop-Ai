class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || process.env.REACT_APP_AI_API_KEY;
    this.baseUrl = process.env.REACT_APP_AI_API_URL || 'https://api.openai.com/v1';
    this.model = process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo';
    this.conversationHistory = [];
    this.systemPrompt = `You are an AI laptop assistant helping users find the perfect laptop based on their needs. 
    You are knowledgeable about various laptop brands, specifications, and use cases.
    
    Your role is to:
    1. Ask relevant questions to understand user needs
    2. Provide personalized laptop recommendations
    3. Explain technical specifications in user-friendly terms
    4. Help compare different options
    
    Keep responses conversational, helpful, and focused on laptop purchasing decisions.
    When making recommendations, provide specific models, prices, and reasons why they suit the user's needs.`;
  }

  async sendMessage(message, userInfo = {}) {
    // Always use local fallback first, no API key required
    try {
      const localResponse = await this.sendMessageLocal(message, userInfo);
      
      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: localResponse }
      );

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return localResponse;
    } catch (error) {
      console.error('Local AI Service Error:', error);
      
      // If local fails and we have an API key, try external service
      if (this.apiKey) {
        try {
          // Build conversation context
          const messages = [
            { role: 'system', content: this.systemPrompt },
            ...this.conversationHistory,
            { role: 'user', content: this.buildContextualMessage(message, userInfo) }
          ];

          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: this.model,
              messages: messages,
              max_tokens: 500,
              temperature: 0.7,
              stream: false,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`AI API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
          }

          const data = await response.json();
          const aiResponse = data.choices[0]?.message?.content?.trim();

          if (!aiResponse) {
            throw new Error('Invalid response from AI service');
          }

          // Update conversation history
          this.conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse }
          );

          // Keep conversation history manageable (last 20 messages)
          if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
          }

          return aiResponse;
        } catch (apiError) {
          console.error('External AI Service Error:', apiError);
          throw apiError;
        }
      } else {
        throw error;
      }
    }
  }

  buildContextualMessage(message, userInfo) {
    let contextualMessage = message;
    
    if (userInfo && Object.keys(userInfo).length > 0) {
      const context = Object.entries(userInfo)
        .filter(([key, value]) => value && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      if (context) {
        contextualMessage = `${message}\n\nUser context: ${context}`;
      }
    }
    
    return contextualMessage;
  }

  // Alternative service for Claude/Anthropic
  async sendMessageToClaude(message, userInfo = {}) {
    const claudeApiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: this.buildContextualMessage(message, userInfo)
            }
          ],
          system: this.systemPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text?.trim();
    } catch (error) {
      console.error('Claude Service Error:', error);
      throw error;
    }
  }

  // Fallback to local/mock service for development
  async sendMessageLocal(message, userInfo = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = this.generateContextualResponse(message, userInfo);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateContextualResponse(message, userInfo) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('gaming') || lowerMessage.includes('game')) {
      return [
        "For gaming, I'd recommend looking at laptops with dedicated graphics cards like RTX 4060 or above. What's your budget range?",
        "Gaming laptops need powerful GPUs and good cooling. Are you looking for portable or desktop replacement style?",
        "What types of games do you play? AAA titles need more power than indie games."
      ];
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
      return [
        "For budget-friendly options, I'd suggest looking at AMD Ryzen-based laptops or older Intel generations. What's your price range?",
        "Budget laptops can still be great! What will you primarily use it for?",
        "There are excellent value options under $800. Tell me about your main use cases."
      ];
    }
    
    if (lowerMessage.includes('work') || lowerMessage.includes('business') || lowerMessage.includes('office')) {
      return [
        "For work, reliability and battery life are key. Do you need to run specific software?",
        "Business laptops should have good keyboards and displays. Will you be traveling with it?",
        "What type of work will you be doing? This helps me recommend the right specs."
      ];
    }
    
    if (lowerMessage.includes('student') || lowerMessage.includes('school') || lowerMessage.includes('college')) {
      return [
        "Student laptops need to balance performance, portability, and price. What's your field of study?",
        "For students, I usually recommend something lightweight with good battery life. What's your budget?",
        "Are you in a technical field that requires specific software or general use?"
      ];
    }
    
    // Default responses
    return [
      "I'd be happy to help you find the perfect laptop! Can you tell me what you'll primarily use it for?",
      "Great question! To give you the best recommendation, what's your budget range and main use case?",
      "Let me help you with that. What are your priorities - performance, portability, or value?",
      `Thanks for that information${userInfo.name ? `, ${userInfo.name}` : ''}! Can you tell me more about your specific needs?`
    ];
  }

  // Get laptop recommendations based on user preferences
  async getLaptopRecommendations(userPreferences) {
    // Generate local recommendations based on user preferences
    return this.generateLocalRecommendations(userPreferences);
  }

  generateLocalRecommendations(userPreferences) {
    const { primaryUse } = userPreferences;
    const lowerUse = (primaryUse || '').toLowerCase();
    
    let recommendations = [];
    
    if (lowerUse.includes('gaming')) {
      recommendations = [
        {
          name: "Gaming Laptop Pro - SKU: LP-GM-001",
          price: "$1,299",
          specs: "AMD Ryzen 7, RTX 4060, 16GB RAM, 512GB SSD",
          reason: "Excellent gaming performance with high refresh rate display and powerful cooling system."
        },
        {
          name: "Gaming Laptop Standard - SKU: LP-GM-002",
          price: "$999",
          specs: "Intel i7, RTX 4050, 16GB RAM, 512GB SSD",
          reason: "Great value gaming laptop with solid performance for most modern games."
        },
        {
          name: "Gaming Laptop Elite - SKU: LP-GM-003",
          price: "$1,799",
          specs: "Intel i9, RTX 4070, 32GB RAM, 1TB SSD",
          reason: "Premium gaming experience with top-tier performance and premium build quality."
        }
      ];
    } else if (lowerUse.includes('work') || lowerUse.includes('business')) {
      recommendations = [
        {
          name: "Business Ultrabook Compact - SKU: LP-BZ-001",
          price: "$899",
          specs: "Intel i5, 8GB RAM, 256GB SSD, 13.3\" display",
          reason: "Ultra-portable with excellent build quality and long battery life for business use."
        },
        {
          name: "Business Laptop Professional - SKU: LP-BZ-002",
          price: "$1,399",
          specs: "Intel i7, 16GB RAM, 512GB SSD, 14\" display",
          reason: "Business-grade reliability with excellent keyboard and security features."
        },
        {
          name: "Business Laptop Premium - SKU: LP-BZ-003",
          price: "$1,199",
          specs: "ARM Processor, 8GB RAM, 256GB SSD, 13.6\" display",
          reason: "Exceptional performance per watt with incredible battery life and premium design."
        }
      ];
    } else if (lowerUse.includes('student') || lowerUse.includes('school')) {
      recommendations = [
        {
          name: "Student Laptop Budget - SKU: LP-ST-001",
          price: "$549",
          specs: "AMD Ryzen 5, 8GB RAM, 256GB SSD, 15.6\" display",
          reason: "Great value for students with solid performance for coursework and multimedia."
        },
        {
          name: "Student Laptop Standard - SKU: LP-ST-002",
          price: "$679",
          specs: "Intel i5, 8GB RAM, 512GB SSD, 15.6\" display",
          reason: "Well-rounded laptop perfect for school work with good battery life and display."
        },
        {
          name: "Student Laptop Premium - SKU: LP-ST-003",
          price: "$999",
          specs: "ARM Processor, 8GB RAM, 256GB SSD, 13.3\" display",
          reason: "Long-lasting battery and excellent performance for students with premium features."
        }
      ];
    } else {
      // General use recommendations
      recommendations = [
        {
          name: "General Purpose Laptop Standard - SKU: LP-GP-001",
          price: "$679",
          specs: "Intel i5, 8GB RAM, 512GB SSD, 15.6\" display",
          reason: "Versatile laptop perfect for everyday tasks with good performance and value."
        },
        {
          name: "General Purpose Laptop Budget - SKU: LP-GP-002",
          price: "$449",
          specs: "Intel i3, 8GB RAM, 256GB SSD, 15.6\" display",
          reason: "Budget-friendly option for basic computing needs and web browsing."
        },
        {
          name: "General Purpose Laptop Performance - SKU: LP-GP-003",
          price: "$599",
          specs: "AMD Ryzen 5, 8GB RAM, 512GB SSD, 15.6\" display",
          reason: "Good balance of performance and price for general productivity tasks."
        }
      ];
    }
    
    // Format recommendations
    let response = `Based on your preferences, here are my top 3 laptop recommendations:\n\n`;
    
    recommendations.forEach((laptop, index) => {
      response += `${index + 1}. **${laptop.name}** - ${laptop.price}\n`;
      response += `   - ${laptop.specs}\n`;
      response += `   - ${laptop.reason}\n\n`;
    });
    
    response += `Would you like more details about any of these laptops, or would you like me to adjust the recommendations based on different criteria?`;
    
    return response;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return [...this.conversationHistory];
  }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;