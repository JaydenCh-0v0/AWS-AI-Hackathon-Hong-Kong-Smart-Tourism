import dotenv from 'dotenv';

dotenv.config();

const POE_API_KEY = process.env.POE_API_KEY;
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
      const prompt = `作為香港旅遊專家，根據以下資訊推薦行程：
用戶偏好：${JSON.stringify(userProfile)}
天氣：${JSON.stringify(weatherData)}
預算：${JSON.stringify(budget)}

請推薦3個適合的景點/餐廳/住宿選項，必須返回有效的JSON格式：
{
  "recommendations": [
    {
      "name": "景點名稱",
      "reason": "推薦理由",
      "type": "poi/food/hotel",
      "rating": 4.5,
      "price_range": "HKD 100-300",
      "location": "具體地址",
      "opening_hours": "營業時間",
      "highlights": ["特色1", "特色2"]
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
      const prompt = `你是香港旅遊助手🐸，用繁體中文回答。\n對話歷史：${JSON.stringify(context)}\n用戶問題：${message}\n\n請提供友善、實用的旅遊建議。`;
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
        'breakfast': '早餐餐廳',
        'lunch': '午餐餐廳', 
        'dinner': '晚餐餐廳',
        'morning': '上午景點',
        'afternoon': '下午景點',
        'evening': '傍晚景點',
        'night': '夜間活動',
        'accommodation': '住宿酒店'
      };
      
      const prompt = `作為香港旅遊專家，為${typeMap[slotType] || '景點'}推薦3個選項。
用戶偏好：${JSON.stringify(userProfile)}
天氣：${JSON.stringify(weatherData)}
預算：${JSON.stringify(budget)}

請返回標準JSON格式，包含詳細資訊：
{
  "options": [
    {
      "option_id": "unique_id",
      "title": "地點名稱",
      "intro": "簡短介紹(50字內)",
      "search_keywords": "英文搜尋關鍵字",
      "reviews": [
        {"author": "用戶名", "text": "真實評價"}
      ],
      "transit": {"hint": "交通方式"},
      "scores": {
        "popularity": 4.5,
        "preference_match": 0.8,
        "weather_fit": 0.9
      },
      "details": {
        "address": "詳細地址",
        "price_range": "價格範圍",
        "opening_hours": "營業時間",
        "phone": "電話號碼",
        "highlights": ["特色1", "特色2", "特色3"]
      }
    }
  ]
}`;
      
      console.log('🚀 Calling Poe API...');
      const response = await this.invokeModel(prompt, true);
      console.log('📥 Poe API response:', response.substring(0, 200) + '...');
      
      const parsed = JSON.parse(response);
      const options = parsed.options || [];
      
      // Add real images using Unsplash
      for (const option of options) {
        const keywords = option.search_keywords || option.title;
        option.images = [
          `https://source.unsplash.com/400x240/?${encodeURIComponent(keywords)}`,
          `https://source.unsplash.com/400x240/?hong-kong,${encodeURIComponent(keywords)}`,
          `https://source.unsplash.com/400x240/?${encodeURIComponent(keywords)},travel`
        ];
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
      '你是香港旅遊專家。請嚴格按照要求的JSON格式回答，不要添加任何其他文字。' :
      '你是香港旅遊助手，請用繁體中文回答。';
      
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

  getMockTravelCards(slotType) {
    const getUnsplashImage = (keywords) => `https://source.unsplash.com/400x240/?${encodeURIComponent(keywords)}`;
    
    const cardTemplates = {
      'morning': [
        {
          option_id: `${slotType}-1`,
          title: '太平山頂',
          intro: '香港最著名的觀景點，俯瞰維多利亞港全景',
          images: [getUnsplashImage('victoria peak hong kong'), getUnsplashImage('hong kong skyline'), getUnsplashImage('peak tram')],
          reviews: [{author: '旅行者A', text: '景色壯觀，必訪景點！'}],
          transit: {hint: '山頂纜車15分鐘'},
          scores: {popularity: 4.8, preference_match: 0.9, weather_fit: 0.8},
          details: {
            address: '香港島太平山頂',
            price_range: 'HKD 65-99',
            opening_hours: '07:00-24:00',
            phone: '+852 2849 0668',
            highlights: ['360度景觀', '山頂纜車', '杜莎夫人蠟像館']
          }
        }
      ],
      'lunch': [
        {
          option_id: `${slotType}-1`,
          title: '添好運點心專門店',
          intro: '世界最便宜米其林一星餐廳，港式點心經典',
          images: [getUnsplashImage('dim sum hong kong'), getUnsplashImage('chinese food'), getUnsplashImage('tim ho wan')],
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
          title: '半島酒店',
          intro: '香港經典奢華酒店，服務一流，位於尖沙咀黃金地段',
          images: [getUnsplashImage('peninsula hotel hong kong'), getUnsplashImage('luxury hotel'), getUnsplashImage('hong kong hotel')],
          reviews: [{author: '商務旅客C', text: '服務無可挑剝，位置絕佳'}],
          transit: {hint: '機場快線45分鐘'},
          scores: {popularity: 4.9, preference_match: 0.9, weather_fit: 1.0},
          details: {
            address: '尖沙咀街角',
            price_range: 'HKD 3000-8000',
            opening_hours: '24小時',
            phone: '+852 2920 2888',
            highlights: ['奢華服務', '黃金地段', '歷史悠久']
          }
        }
      ]
    };
    return cardTemplates[slotType] || cardTemplates['morning'];
  }

  getMockRecommendations(budget) {
    const recommendations = [
      { name: '太平山頂', reason: '香港必訪景點，360度城市景觀', type: 'poi' },
      { name: '添好運', reason: '米其林一星茶餐廳，性價比高', type: 'food' },
      { name: '半島酒店', reason: '經典奢華酒店，服務一流', type: 'hotel' }
    ];
    return { recommendations };
  }

  getMockChatResponse(message) {
    const responses = {
      '推薦': '我建議你可以在早上安排太平山，下午去星光大道！🏔️',
      '天氣': '根據天氣預報，建議安排室內活動如購物或博物館參觀。🌧️',
      '行程': '我可以幫你自動完成今天的行程安排，需要我開始嗎？📋',
      '景點': '這個景點很棒！我推薦你也可以考慮附近的其他景點。🎯',
      '交通': '讓我為你優化一下交通路線，這樣會更省時間。🚇'
    };
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) return response;
    }
    return '我是你的香港旅遊助手🐸！我可以幫你推薦景點、安排行程、提供交通建議。有什麼想了解的嗎？';
  }
}

export default new PoeAgent();