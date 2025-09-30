import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
      console.log('❌ No Poe API key found, using pool data');
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
Budget: ${JSON.stringify(budget)}`;
      
      console.log('🚀 POE API call prepared but using pool data instead');
      // const response = await this.invokeModel(prompt, true);
      
      return this.getMockTravelCards(slotType);
    } catch (error) {
      console.error('❌ Poe API error generating cards:', error);
      console.log('🔄 Falling back to pool data');
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
    try {
      const poolPath = path.resolve(__dirname, '../pool.json');
      const poolData = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
      
      const typeMap = {
        'breakfast': 'food', 'lunch': 'food', 'dinner': 'food',
        'morning': 'poi', 'afternoon': 'poi', 'evening': 'poi', 'night': 'poi',
        'accommodation': 'hotel'
      };
      
      const poolType = typeMap[slotType] || 'poi';
      const pool = poolData[poolType] || [];
      
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      return selected.map(item => ({
        option_id: item.id,
        title: item.name,
        intro: item.intro || this.generateRecommendationReason(item.name, slotType),
        images: [item.image || `https://picsum.photos/400/240?random=${Math.random()}`],
        reviews: [{author: 'Traveler', text: 'Highly recommended!'}],
        transit: {hint: item.traffic || 'MTR 10-15 minutes'},
        traffic: item.traffic,
        userComment: item.userComment,
        scores: {popularity: item.rating, preference_match: 0.8, weather_fit: 0.9}
      }));
    } catch (error) {
      console.error('Error loading pool data:', error);
      return [{
        option_id: `${slotType}-fallback`,
        title: 'Victoria Peak',
        intro: 'A stunning viewpoint offering panoramic views of Hong Kong.',
        images: ['https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=240&fit=crop'],
        reviews: [{author: 'Traveler', text: 'Amazing experience!'}],
        transit: {hint: 'Peak Tram 15 minutes'},
        scores: {popularity: 4.5, preference_match: 0.8, weather_fit: 0.9}
      }];
    }
  }
  
  generateRecommendationReason(name, slotType) {
    const reasons = {
      poi: [
        `${name} offers stunning views and unique cultural experiences perfect for sightseeing.`,
        `A must-visit destination that showcases Hong Kong's rich heritage and modern charm.`,
        `${name} provides excellent photo opportunities and memorable experiences.`,
        `This iconic location perfectly captures the essence of Hong Kong's vibrant culture.`
      ],
      food: [
        `${name} serves authentic Hong Kong cuisine with exceptional flavors and quality.`,
        `A local favorite known for traditional recipes and outstanding service.`,
        `${name} offers the perfect taste of Hong Kong's culinary heritage.`,
        `Highly rated for its authentic dishes and welcoming atmosphere.`
      ],
      hotel: [
        `${name} provides luxury accommodation with excellent location and amenities.`,
        `Perfect for travelers seeking comfort and convenience in the heart of Hong Kong.`,
        `${name} offers exceptional service and modern facilities for a memorable stay.`,
        `Ideally located with easy access to major attractions and transportation.`
      ]
    };
    
    const typeMap = {
      'breakfast': 'food', 'lunch': 'food', 'dinner': 'food',
      'morning': 'poi', 'afternoon': 'poi', 'evening': 'poi', 'night': 'poi',
      'accommodation': 'hotel'
    };
    
    const reasonType = typeMap[slotType] || 'poi';
    const reasonList = reasons[reasonType];
    return reasonList[Math.floor(Math.random() * reasonList.length)];
  }

  getMockRecommendations(budget) {
    const recommendations = [
      { name: 'Victoria Peak', reason: 'Must-visit Hong Kong attraction with 360-degree city views', type: 'poi' },
      { name: 'Tim Ho Wan', reason: 'Michelin one-star dim sum restaurant with great value', type: 'food' },
      { name: 'Peninsula Hotel', reason: 'Classic luxury hotel with excellent service', type: 'hotel' }
    ];
    return { recommendations };
  }

  async analyzePhoto(imageBase64, language = 'en', location = null) {
    if (!this.apiKey) {
      return this.getMockPhotoAnalysis(language, location);
    }
    
    try {
      const locationInfo = location ? `\nUser location: ${location.latitude}, ${location.longitude}` : '';
      const prompt = language === 'zh' 
        ? `分析這張香港景點照片，提供詳細的導遊介紹。${locationInfo}\n請以JSON格式回應：\n{\n  "title": "景點名稱",\n  "description": "詳細介紹",\n  "tags": ["標籤1", "標籤2"]\n}`
        : `Analyze this Hong Kong attraction photo and provide detailed guide information.${locationInfo}\nRespond in JSON format:\n{\n  "title": "Attraction Name",\n  "description": "Detailed description",\n  "tags": ["tag1", "tag2"]\n}`;
      
      const response = await this.invokeModel(prompt, true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Photo analysis error:', error);
      return this.getMockPhotoAnalysis(language, location);
    }
  }

  getMockPhotoAnalysis(language = 'en', location = null) {
    const mockData = {
      en: {
        title: 'Victoria Peak',
        description: 'Victoria Peak is Hong Kong\'s most popular tourist attraction, offering breathtaking panoramic views of the city skyline, Victoria Harbour, and surrounding islands. At 552 meters above sea level, it provides the perfect vantage point to appreciate Hong Kong\'s stunning urban landscape.',
        tags: ['Scenic Views', 'Tourist Attraction', 'Photography', 'Sunset Views', 'City Skyline']
      },
      zh: {
        title: '太平山頂',
        description: '太平山頂是香港最受歡迎的旅遊景點，可欣賞到令人嘆為觀止的城市天際線、維多利亞港和周圍島嶼的全景。海拔552米的高度為欣賞香港壯麗的都市景觀提供了完美的制高點。',
        tags: ['風景觀賞', '旅遊景點', '攝影', '日落美景', '城市天際線']
      }
    };
    return mockData[language] || mockData.en;
  }

  async generatePlanOverview(plan) {
    if (!this.apiKey) {
      return this.getMockPlanOverview(plan);
    }
    
    try {
      const selectedItems = [];
      const slots = plan.itinerary?.[0]?.slots || [];
      
      slots.forEach(slot => {
        const selected = slot.options.find(o => o.option_id === slot.selected_option_id);
        if (selected) {
          selectedItems.push(`${slot.slot_id}: ${selected.title}`);
        }
      });
      
      const prompt = `As a Hong Kong travel expert, analyze this travel plan and provide suggestions:\n\nSelected items: ${selectedItems.join(', ')}\nWeather: ${JSON.stringify(plan.context.weather)}\nBudget: ${JSON.stringify(plan.inputs.budget)}\n\nProvide a friendly overview with weather-based suggestions in 2-3 sentences.`;
      
      const response = await this.invokeModel(prompt, false);
      return response;
    } catch (error) {
      console.error('Plan overview error:', error);
      return this.getMockPlanOverview(plan);
    }
  }
  
  getMockPlanOverview(plan, currentSlots = null) {
    // Use current slots if available, otherwise fall back to plan data
    const slots = currentSlots || plan.itinerary?.[0]?.slots || [];
    const selectedCount = slots.filter(s => s.selected_option_id).length;
    const totalSlots = slots.length;
    
    // Get selected items for more personalized analysis
    const selectedItems = [];
    slots.forEach(slot => {
      const selected = slot.options.find(o => o.option_id === slot.selected_option_id);
      if (selected) {
        selectedItems.push({ slot: slot.slot_id, name: selected.title });
      }
    });
    
    if (selectedCount === 0) {
      return 'Welcome to your Hong Kong adventure! 🇭🇰 I notice you haven\'t selected your activities yet. Based on the current weather, I recommend starting with indoor attractions like museums or shopping malls, then moving to outdoor sightseeing when conditions are favorable.';
    } else if (selectedCount < totalSlots / 2) {
      const selectedNames = selectedItems.map(item => item.name).join(', ');
      return `Great start on your Hong Kong itinerary! 🎯 You\'ve selected ${selectedCount} out of ${totalSlots} activities including ${selectedNames}. Based on the weather forecast, I suggest adding some flexible indoor options like shopping centers or cultural sites as backup plans. Don\'t forget to try local dim sum and take the Star Ferry for authentic Hong Kong experiences!`;
    } else {
      const highlights = selectedItems.slice(0, 3).map(item => item.name).join(', ');
      return `Excellent Hong Kong travel plan! 🌟 You\'ve thoughtfully selected ${selectedCount} activities including ${highlights} and more. Your itinerary showcases the best of Hong Kong with a great mix of dining, attractions, and accommodation. Based on current weather conditions, remember to wear comfortable walking shoes and bring a light jacket for air-conditioned venues. Have an amazing trip!`;
    }
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