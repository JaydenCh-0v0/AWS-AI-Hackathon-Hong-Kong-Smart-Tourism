import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

dotenv.config();

class AWSAgent {
  constructor() {
    this.hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    
    if (this.hasCredentials) {
      this.client = new BedrockRuntimeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
    }
    this.modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
  }

  async generateItineraryRecommendations(userProfile, weatherData, budget) {
    if (!this.hasCredentials) {
      return this.getMockRecommendations(budget);
    }
    
    try {
      const prompt = `作為香港旅遊專家，根據以下資訊推薦行程：
用戶偏好：${JSON.stringify(userProfile)}
天氣：${JSON.stringify(weatherData)}
預算：${budget}

請推薦3個適合的景點/餐廳/住宿選項，格式：
{
  "recommendations": [
    {"name": "景點名", "reason": "推薦理由", "type": "poi/food/hotel"}
  ]
}`;

      const response = await this.invokeModel(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('AWS Bedrock API error:', error);
      return this.getMockRecommendations(budget);
    }
  }

  async chatWithUser(message, context) {
    if (!this.hasCredentials) {
      return this.getMockChatResponse(message);
    }
    
    try {
      const prompt = `你是香港旅遊助手🐸，用繁體中文回答。
對話歷史：${JSON.stringify(context)}
用戶問題：${message}

請提供友善、實用的旅遊建議。`;

      const response = await this.invokeModel(prompt);
      return response;
    } catch (error) {
      console.error('AWS Bedrock chat error:', error);
      return this.getMockChatResponse(message);
    }
  }

  async invokeModel(prompt) {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
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

export default new AWSAgent();