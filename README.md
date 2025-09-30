# Hong Kong Smart Tourism - AI-Powered Travel Planning Platform

## Project Overview

Hong Kong Smart Tourism is an intelligent travel planning web application that leverages AI to create personalized, weather-aware itineraries for Hong Kong visitors. The platform combines real-time weather data, user preferences, and AI-powered recommendations to deliver a seamless travel planning experience through an intuitive swipe-based interface.

## Problem Statement

Planning a trip to Hong Kong involves juggling multiple sources of information:
- Weather forecasts and their impact on outdoor activities
- Diverse attraction options across different districts
- Restaurant recommendations based on cuisine preferences
- Accommodation choices within budget constraints
- Transportation logistics and timing optimization
- Real-time updates and changes during the trip

Traditional travel planning is time-consuming, fragmented across multiple platforms, and lacks personalization based on real-time conditions like weather and user preferences.

## Solution

Our AI-powered platform solves these challenges by:
- **Unified Planning Experience**: Single web application for complete trip planning
- **Weather-Aware Recommendations**: Integration with Hong Kong Observatory (HKO) API for real-time weather-based suggestions
- **AI-Powered Personalization**: Intelligent recommendations based on user preferences and travel patterns
- **Intuitive Selection Process**: Tinder-like swipe interface for easy decision making
- **Comprehensive Export Options**: PDF itineraries and calendar integration
- **Real-time Updates**: Weather alerts and itinerary adjustments

## How Amazon Q Developer Accelerated Our Development

### 1. Software Requirements Specification (SRS) and Product Requirements Document (PRD) Creation

Amazon Q Developer helped us establish a solid foundation by:
- **Structured Documentation**: Generated comprehensive SRS and PRD templates with industry best practices
- **Requirements Analysis**: Assisted in breaking down complex travel planning workflows into manageable features
- **API Design**: Helped define RESTful API endpoints and data contracts
- **Technical Architecture**: Provided guidance on system architecture decisions and technology stack selection

**Files Created**: `SRS.md`, `PRD.md` with detailed functional requirements, user stories, and technical specifications.

### 2. Project Planning and Task Management (Todo.md)

Amazon Q Developer streamlined our project management by:
- **Task Breakdown**: Converted high-level requirements into actionable development tasks
- **Priority Setting**: Helped categorize features into P1-P4 priorities for MVP development
- **Milestone Planning**: Created realistic timelines for demo and production releases
- **Progress Tracking**: Structured todo items with clear acceptance criteria

**Key Contribution**: Generated comprehensive `todo.md` with 11 development stages, from project setup to release rollout.

### 3. Demo Development and Rapid Prototyping

Amazon Q Developer accelerated our demo creation through:
- **Code Generation**: Rapid scaffolding of frontend components and backend API endpoints
- **Mock Data Creation**: Generated realistic Hong Kong attraction, restaurant, and hotel data
- **Integration Patterns**: Provided templates for API integrations and error handling
- **UI Component Development**: Assisted in creating responsive, accessible web components

**Demo Features Delivered**:
- Complete P1-P4 workflow (Input → Q&A → Itinerary → Overview)
- 8-slot daily itinerary system
- Swipe-based selection interface
- Weather integration with HKO API
- Calendar export functionality

### 4. UI Development and Server Requirements

Amazon Q Developer enhanced our development efficiency by:

**Frontend Development**:
- **Responsive Design**: Generated mobile-first CSS with proper viewport handling
- **Component Architecture**: Created modular JavaScript components for reusability
- **Accessibility Features**: Implemented ARIA labels, keyboard navigation, and WCAG compliance
- **Theme System**: Built dark/light mode support with CSS custom properties

**Backend API Development**:
- **Express.js Setup**: Scaffolded RESTful API with proper middleware configuration
- **Data Models**: Created Plan JSON schema with validation
- **Error Handling**: Implemented comprehensive error handling and logging
- **CORS Configuration**: Set up proper cross-origin resource sharing

**Key Files**: `server.js`, `styles.css`, `app_final.js`, `index.html`

### 5. Server Interface Testing

Amazon Q Developer facilitated robust testing through:
- **API Testing Strategies**: Provided patterns for testing REST endpoints
- **Mock Data Generation**: Created realistic test datasets for various scenarios
- **Error Scenario Testing**: Helped design tests for edge cases and failure modes
- **Integration Testing**: Assisted in testing third-party API integrations

**Testing Approach**:
```javascript
// Example API endpoint testing pattern
app.post('/plans/:id/swipe', async (req, res) => {
  // Input validation
  // Business logic processing
  // Error handling with proper HTTP status codes
  // Response formatting
});
```

### 6. Feature Development and Mock Data Creation

Amazon Q Developer accelerated feature implementation by:

**AI Agent Integration**:
- **Poe API Integration**: Implemented AI-powered travel recommendations
- **Prompt Engineering**: Created effective prompts for Hong Kong-specific travel advice
- **Fallback Mechanisms**: Built robust fallback systems when AI services are unavailable
- **Data Processing**: Structured AI responses into consistent JSON formats

**Mock Data Systems**:
- **Pool Data Management**: Created `pool.json` with 200+ Hong Kong attractions
- **Image Integration**: Integrated Unsplash API for dynamic, relevant images
- **Review Generation**: Implemented realistic user review systems
- **Rating Systems**: Built comprehensive scoring algorithms

**Key Features Implemented**:
```javascript
// AI-powered travel card generation
async generateTravelCards(slotType, userProfile, weatherData, budget) {
  // AI prompt construction
  // API integration with fallbacks
  // Data transformation and validation
}
```

### 7. AI API Integration and Enhancement

Amazon Q Developer streamlined AI integration through:

**Multi-Provider Support**:
- **Poe API Integration**: Primary AI service for travel recommendations
- **Fallback Systems**: Robust mock responses when AI services are unavailable
- **Error Handling**: Comprehensive error recovery and user experience preservation
- **Response Processing**: Structured JSON parsing and validation

**AI Features Implemented**:
- **Travel Card Generation**: AI-powered attraction/restaurant/hotel recommendations
- **Chat Assistant**: Interactive travel advice and Q&A functionality
- **Photo Analysis**: AI-powered landmark recognition and description
- **Plan Overview**: Intelligent itinerary analysis and suggestions

**Code Example**:
```javascript
// AI service with fallback pattern
async generateItineraryRecommendations(userProfile, weatherData, budget) {
  if (!this.apiKey) {
    return this.getMockRecommendations(budget);
  }
  try {
    const response = await this.invokeModel(prompt, true);
    return JSON.parse(response);
  } catch (error) {
    console.error('AI API error:', error);
    return this.getMockRecommendations(budget);
  }
}
```

### 8. Workflow Testing and Validation

Amazon Q Developer enhanced our testing methodology through:

**End-to-End Workflow Testing**:
- **User Journey Validation**: Complete P1→P2→P3→P4 flow testing
- **State Management**: Proper data persistence across workflow steps
- **Error Recovery**: Graceful handling of interruptions and failures
- **Performance Monitoring**: Response time optimization and bottleneck identification

**Integration Testing**:
- **Weather API Integration**: HKO 9-day forecast integration and fallbacks
- **Calendar Export**: ICS file generation and Google Calendar integration
- **PDF Generation**: Placeholder implementation with future enhancement path
- **Cross-browser Compatibility**: Responsive design testing across devices

### 9. Architecture Evaluation and Optimization

Amazon Q Developer provided architectural guidance for:

**System Architecture Assessment**:
- **Scalability Planning**: Horizontal scaling strategies for API and frontend
- **Performance Optimization**: Caching strategies and CDN integration
- **Security Implementation**: OAuth integration, JWT sessions, and data protection
- **Monitoring and Observability**: Structured logging and metrics collection

**Technology Stack Validation**:
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Backend**: Node.js with Express.js for RESTful APIs
- **Data Storage**: In-memory storage for demo, with database migration path
- **External Integrations**: HKO Weather API, Unsplash Images, Poe AI API

**Architecture Decisions**:
```javascript
// Modular service architecture
class PoeAgent {
  async generateTravelCards() { /* AI integration */ }
  async chatWithUser() { /* Interactive assistance */ }
  async analyzePhoto() { /* Image recognition */ }
  getMockTravelCards() { /* Fallback system */ }
}
```

## Technical Architecture

### Frontend Stack
- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties and responsive design
- **UI Components**: Modular component architecture
- **State Management**: Local storage and in-memory state
- **Accessibility**: WCAG 2.1 AA compliance

### Backend Stack
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful architecture with JSON responses
- **Data Storage**: In-memory Map for demo (database-ready)
- **External APIs**: HKO Weather, Unsplash Images, Poe AI
- **File Processing**: ICS calendar generation, PDF export ready

### AI Integration
- **Primary AI**: Poe API for travel recommendations
- **Fallback System**: Comprehensive mock data from `pool.json`
- **Features**: Travel cards, chat assistance, photo analysis
- **Data Processing**: JSON schema validation and transformation

## Key Features

### 1. Intelligent Trip Planning (P1)
- Budget-aware recommendations (Low/Medium/High tiers)
- Date range validation with automatic night calculation
- Location autocomplete with quick-select options (Airport, West Kowloon)
- Real-time weather integration from Hong Kong Observatory

### 2. Preference Learning (P2)
- Interactive Q&A system with 4-card choice interface
- Progressive preference profiling
- Weather-aware activity suggestions
- AI-powered itinerary generation

### 3. Swipe-Based Selection (P3)
- Tinder-like interface for easy decision making
- Detailed card flip for reviews, images, and transit info
- Auto-refill system when options are depleted
- Selection persistence and history tracking

### 4. Comprehensive Export (P4)
- Day-by-day itinerary overview
- PDF export capability (placeholder implemented)
- ICS calendar file generation
- Social sharing functionality

### 5. AI-Powered Features
- **Travel Assistant Chat**: Interactive Q&A for travel advice
- **Photo Guide**: AI-powered landmark recognition and description
- **Smart Recommendations**: Context-aware suggestions based on weather and preferences
- **Plan Analysis**: Intelligent overview generation with personalized insights

## API Endpoints

```
POST /plans                    # Create new travel plan
GET  /weather?date=YYYY-MM-DD  # Get weather forecast
POST /plans/:id/answers        # Submit Q&A responses
POST /plans/:id/generate       # Generate AI itinerary
POST /plans/:id/swipe          # Record swipe selections
GET  /plans/:id                # Retrieve plan data
POST /plans/:id/finalize       # Finalize selections
POST /plans/:id/export/pdf     # Generate PDF export
POST /plans/:id/calendar       # Export to calendar
POST /plans/:id/chat           # AI chat assistance
POST /analyze-photo            # Photo analysis service
```

## Data Model

The application uses a comprehensive Plan JSON schema:

```json
{
  "plan_id": "unique_identifier",
  "created_at": "2025-01-XX",
  "inputs": {
    "budget": {"level": "medium", "currency": "HKD"},
    "date_range": {"start_date": "2025-02-01", "end_date": "2025-02-03"},
    "locations": {"start_place": "Airport", "end_place": "Central"}
  },
  "context": {
    "weather": [/* HKO forecast data */]
  },
  "expectation_answers": [/* User preferences */],
  "itinerary": [
    {
      "day_index": 1,
      "date": "2025-02-01",
      "slots": [
        {
          "slot_id": "breakfast",
          "label": "Breakfast (08:00–09:00)",
          "options": [/* AI-generated recommendations */],
          "selected_option_id": "selected_option",
          "swipe_history": [/* User interactions */]
        }
      ]
    }
  ]
}
```

## Installation and Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Add your API keys:
   # POE_API_KEY=your_poe_api_key
   ```

### Running the Application
```bash
# Start backend server
cd backend
npm start

# Access the application
# Frontend: http://localhost:3001
# API: http://localhost:3001/api
```

## Future Enhancements

### Phase 2 Development
- **Real-time Booking Integration**: Direct booking with hotels and restaurants
- **Advanced Routing**: Optimized transportation planning with real-time traffic
- **Multi-day Planning**: Extended itineraries beyond single-day planning
- **Social Features**: Plan sharing and collaborative editing
- **Mobile App**: Native iOS/Android applications

### Technical Improvements
- **Database Integration**: Migration from in-memory to persistent storage
- **Authentication System**: Complete OAuth implementation with user profiles
- **Performance Optimization**: CDN integration and advanced caching
- **Monitoring**: Comprehensive observability and analytics
- **Internationalization**: Multi-language support beyond English/Chinese

## Contributing

This project was developed for the AWS AI Hackathon Hong Kong 2025. The codebase demonstrates best practices in:
- AI integration with fallback systems
- Responsive web design
- RESTful API development
- Real-time data integration
- User experience optimization

## License

This project is developed for educational and demonstration purposes as part of the AWS AI Hackathon Hong Kong 2025.

---

**Developed with Amazon Q Developer** - This project showcases how AI-assisted development can accelerate the creation of complex, feature-rich applications while maintaining code quality and architectural best practices.