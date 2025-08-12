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
    if (!this.apiKey) {
      throw new Error('AI API key not configured. Please set REACT_APP_OPENAI_API_KEY in your environment.');
    }

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
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
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
    const prompt = `Based on the following user preferences, recommend 3 specific laptop models with current prices and detailed reasons:

User Preferences:
- Primary use: ${userPreferences.primaryUse || 'General use'}
- Budget: ${userPreferences.budget || 'Not specified'}
- Brand preference: ${userPreferences.brandPreference || 'No preference'}
- Screen size: ${userPreferences.screenSize || 'Any size'}
- Battery life importance: ${userPreferences.batteryLife || 'Moderate'}
- Connectivity needs: ${userPreferences.connectivity || 'Standard ports'}
- Other requirements: ${userPreferences.otherRequirements || 'None'}

Please format your response with:
1. **Laptop Name** - Price
   - Key specs
   - Why it's perfect for their needs

2. **Laptop Name** - Price
   - Key specs  
   - Why it's perfect for their needs

3. **Laptop Name** - Price
   - Key specs
   - Why it's perfect for their needs`;

    return await this.sendMessage(prompt);
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