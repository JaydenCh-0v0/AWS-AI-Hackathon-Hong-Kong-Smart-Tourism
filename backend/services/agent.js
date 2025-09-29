import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加載 .env 文件（在 backend 目錄下）
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const POE_API_KEY = process.env.POE_API_KEY;
console.log('🔑 POE_API_KEY loaded:', POE_API_KEY ? 'YES' : 'NO');
console.log('🔑 POE_API_KEY value:', POE_API_KEY ? POE_API_KEY.substring(0, 10) + '...' : 'undefined');
console.log('📁 .env path:', path.resolve(__dirname, '../.env'));
const POE_API_URL = 'https://api.poe.com/v1/chat/completions';
const POE_MODEL = 'gpt-3.5-turbo'; // 可改成 deepseek-chat、gpt-4、claude-3-opus 等

class PoeAgent {
  constructor() {
    this.apiKey = POE_API_KEY;
  }

  async generateItineraryRecommendations(userProfile, weatherData, budget) {
    if (!this.apiKey) {
      return this.getMockRecommendations(budget);
    }
    try {
      const prompt = `As a Hong Kong travel expert, recommend itinerary based on the following information:
User preferences: ${JSON.stringify(userProfile)}
Weather: ${JSON.stringify(weatherData)}
Budget: ${JSON.stringify(budget)}

Please recommend 3 suitable attractions/restaurants/accommodation options, must return valid JSON format:
{
  "recommendations": [
    {
      "name": "Attraction Name",
      "reason": "Recommendation reason",
      "type": "poi/food/hotel",
      "rating": 4.5,
      "price_range": "HKD 100-300",
      "location": "Specific address",
      "opening_hours": "Operating hours",
      "highlights": ["Feature 1", "Feature 2"]
    }
  ]
}`;
      const response = await this.invokeModel(prompt, true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Poe API error:', error);
      return this.getMockRecommendations(budget);
    }
  }

  async chatWithUser(message, context) {
    if (!this.apiKey) {
      return this.getMockChatResponse(message);
    }
    try {
      const prompt = `You are a Hong Kong travel assistant 🐸, please answer in English.\nConversation history: ${JSON.stringify(context)}\nUser question: ${message}\n\nPlease provide friendly and practical travel advice.`;
      const response = await this.invokeModel(prompt, false);
      return response;
    } catch (error) {
      console.error('Poe chat error:', error);
      return this.getMockChatResponse(message);
    }
  }

  async generateTravelCards(slotType, userProfile, weatherData, budget) {
    console.log(`🎯 Generating travel cards for slot: ${slotType}`);
    console.log(`📊 User profile:`, userProfile);
    console.log(`🌤️ Weather data:`, weatherData);
    console.log(`💰 Budget:`, budget);
    
    if (!this.apiKey) {
      console.log('❌ No Poe API key found, using mock data');
      return this.getMockTravelCards(slotType);
    }
    
    try {
      const typeMap = {
        'breakfast': 'breakfast restaurants',
        'lunch': 'lunch restaurants', 
        'dinner': 'dinner restaurants',
        'morning': 'morning attractions',
        'afternoon': 'afternoon attractions',
        'evening': 'evening attractions',
        'night': 'night activities',
        'accommodation': 'accommodation hotels'
      };
      
      const prompt = `As a Hong Kong travel expert, recommend 3 options for ${typeMap[slotType] || 'attractions'}.
User preferences: ${JSON.stringify(userProfile)}
Weather: ${JSON.stringify(weatherData)}
Budget: ${JSON.stringify(budget)}

Please return standard JSON format with detailed information:
{
  "options": [
    {
      "option_id": "unique_id",
      "title": "Location name",
      "intro": "Brief introduction (within 50 words)",
      "search_keywords": "English search keywords",
      "reviews": [
        {"author": "Username", "text": "Real review"}
      ],
      "transit": {"hint": "Transportation method"},
      "scores": {
        "popularity": 4.5,
        "preference_match": 0.8,
        "weather_fit": 0.9
      },
      "details": {
        "address": "Detailed address",
        "price_range": "Price range",
        "opening_hours": "Operating hours",
        "phone": "Phone number",
        "highlights": ["Feature 1", "Feature 2", "Feature 3"]
      }
    }
  ]
}`;
      
      console.log('🚀 Calling Poe API...');
      const response = await this.invokeModel(prompt, true);
      console.log('📥 Poe API response:', response.substring(0, 200) + '...');
      
      const parsed = JSON.parse(response);
      const options = parsed.options || [];
      
      // Add real images using Unsplash API
      for (const option of options) {
        const keywords = option.search_keywords || option.title;
        try {
          const imageData = await this.getUnsplashImage(keywords);
          option.images = [imageData.url];
          option.photographer = imageData.photographer;
        } catch (error) {
          console.error('Failed to get Unsplash image:', error);
          option.images = [`https://picsum.photos/400/240?random=${Math.random()}`];
          option.photographer = 'Unknown';
        }
      }
      
      console.log(`✅ Generated ${options.length} travel cards with real images`);
      return options;
    } catch (error) {
      console.error('❌ Poe API error generating cards:', error);
      console.log('🔄 Falling back to mock data');
      return this.getMockTravelCards(slotType);
    }
  }

  async invokeModel(prompt, isJson = false) {
    const systemContent = isJson ? 
      'You are a Hong Kong travel expert. Please answer strictly in the required JSON format, do not add any other text.' :
      'You are a Hong Kong travel assistant, please answer in English.';
      
    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: prompt }
    ];
    const body = {
      model: POE_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: isJson ? 2000 : 1000
    };
    
    console.log('📡 Sending request to Poe API:', POE_API_URL);
    console.log('🔑 Using API key:', this.apiKey ? 'SET' : 'NOT SET');
    
    const res = await fetch(POE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    console.log('📊 Response status:', res.status);
    const data = await res.json();
    console.log('📋 Response data:', JSON.stringify(data, null, 2));
    
    return data.choices?.[0]?.message?.content || JSON.stringify(data);
  }

  async getUnsplashImage(spotName) {
    const API_KEY = "uBAILJNqyodVFUCyY4nBFOXiB1Y4Zk0_yWikmyhyudk";
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(spotName + ' Hong Kong')}&per_page=1`, {
        headers: { 'Authorization': `Client-ID ${API_KEY}` }
      });
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return {
          url: photo.urls.regular,
          photographer: photo.user.name
        };
      }
    } catch (error) {
      console.error('Unsplash API error:', error);
    }
    return { url: `https://picsum.photos/400/240?random=${Math.random()}`, photographer: 'Unknown' };
  }

  getMockTravelCards(slotType) {
    const getRandomImage = () => `https://picsum.photos/400/240?random=${Math.random()}`;
    
    const cardTemplates = {
      'morning': [
        {
          option_id: `${slotType}-1`,
          title: 'Victoria Peak',
          intro: 'Hong Kong\'s most famous viewpoint, overlooking Victoria Harbour',
          images: [getRandomImage()],
          reviews: [{author: 'Traveler A', text: 'Spectacular scenery, must-visit attraction!'}],
          transit: {hint: 'Peak Tram 15 minutes'},
          scores: {popularity: 4.8, preference_match: 0.9, weather_fit: 0.8},
          details: {
            address: 'Victoria Peak, Hong Kong Island',
            price_range: 'HKD 65-99',
            opening_hours: '07:00-24:00',
            phone: '+852 2849 0668',
            highlights: ['360-degree views', 'Peak Tram', 'Madame Tussauds']
          }
        }
      ],
      'lunch': [
        {
          option_id: `${slotType}-1`,
          title: '添好運點心專門店',
          intro: '世界最便宜米其林一星餐廳，港式點心經典',
          images: [getRandomImage()],
          reviews: [{author: '美食家B', text: '性價比超高的米其林體驗'}],
          transit: {hint: '地鐵深水埗站5分鐘'},
          scores: {popularity: 4.6, preference_match: 0.8, weather_fit: 1.0},
          details: {
            address: '深水埗福榮街9-11號',
            price_range: 'HKD 50-150',
            opening_hours: '10:00-21:30',
            phone: '+852 2788 1226',
            highlights: ['米其林一星', '叉燒包', '酥皮焗叉燒包']
          }
        }
      ],
      'accommodation': [
        {
          option_id: `${slotType}-1`,
          title: 'The Peninsula Hotel',
          intro: 'Hong Kong\'s classic luxury hotel with excellent service in prime Tsim Sha Tsui location',
          images: [getRandomImage()],
          reviews: [{author: 'Business Traveler C', text: 'Impeccable service, excellent location'}],
          transit: {hint: 'Airport Express 45 minutes'},
          scores: {popularity: 4.9, preference_match: 0.9, weather_fit: 1.0},
          details: {
            address: 'Salisbury Road, Tsim Sha Tsui',
            price_range: 'HKD 3000-8000',
            opening_hours: '24 hours',
            phone: '+852 2920 2888',
            highlights: ['Luxury Service', 'Prime Location', 'Historic Heritage']
          }
        }
      ]
    };
    return cardTemplates[slotType] || cardTemplates['morning'];
  }

  getMockRecommendations(budget) {
    const recommendations = [
      { name: 'Victoria Peak', reason: 'Must-visit Hong Kong attraction with 360-degree city views', type: 'poi' },
      { name: 'Tim Ho Wan', reason: 'Michelin one-star dim sum restaurant with great value', type: 'food' },
      { name: 'Peninsula Hotel', reason: 'Classic luxury hotel with excellent service', type: 'hotel' }
    ];
    return { recommendations };
  }

  getMockChatResponse(message) {
    const responses = {
      'recommend': 'I suggest you can arrange Victoria Peak in the morning and Avenue of Stars in the afternoon! 🏔️',
      'weather': 'Based on the weather forecast, I recommend indoor activities like shopping or museum visits. 🌧️',
      'itinerary': 'I can help you automatically complete today\'s itinerary arrangement. Do you need me to start? 📋',
      'attraction': 'This attraction is great! I also recommend you consider other nearby attractions. 🎯',
      'transport': 'Let me optimize the transportation route for you, this will save more time. 🚇'
    };
    for (const [key, response] of Object.entries(responses)) {
      if (message.toLowerCase().includes(key)) return response;
    }
    return 'I am your Hong Kong travel assistant 🐸! I can help you recommend attractions, arrange itineraries, and provide transportation advice. What would you like to know?';
  }
}

export default new PoeAgent();