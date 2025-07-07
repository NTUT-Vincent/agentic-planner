# 🎯 Agentic Planner - AI-Powered Multi-Goal Planning Platform

<div align="center">
  
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)

*An intelligent planning system that transforms natural language goals into actionable, trackable plans using AI agents*

[🚀 Live Demo](#) | [📖 Documentation](#-api-documentation) | [🛠 Setup Guide](#-quick-start)

</div>

## 🌟 Overview

**Agentic Planner** is a full-stack AI-powered planning platform that revolutionizes how people approach goal setting and achievement. By combining **LangGraph AI agents** with an intuitive React frontend, users can simply describe their goals in natural language and receive structured, actionable plans with automated progress tracking.

### 💡 Key Innovation
- **Natural Language Processing**: Describe goals conversationally ("I want to prepare for IELTS in 3 months")
- **AI Agent Workflow**: 4-agent system that parses, plans, tracks, and updates goals automatically
- **Intelligent Progress Updates**: Update progress using natural language ("I read 25 pages today")
- **Multi-Domain Support**: Study plans, fitness goals, financial targets, and life tasks

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Layer      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (LangGraph)   │
│                 │    │                 │    │                 │
│ • Task Dashboard│    │ • REST API      │    │ • Goal Parser   │
│ • Progress UI   │    │ • WebSocket     │    │ • Planner Agent │
│ • AI Chat       │    │ • Auth System   │    │ • Progress AI   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                        ┌─────────────────┐
                        │   Database      │
                        │   (MongoDB)     │
                        │                 │
                        │ • User Plans    │
                        │ • Task Data     │
                        │ • Progress Logs │
                        └─────────────────┘
```

## ✨ Features

### 🎯 **Smart Goal Processing**
- **Natural Language Input**: "I want to lose 10kg in 4 months through diet and exercise"
- **AI-Powered Planning**: Automatically generates structured tasks with timelines
- **Multi-Goal Support**: Study, fitness, financial, and life goals

### 📊 **Intelligent Progress Tracking**
- **AI Progress Updates**: "I ran 5km today and ate healthy meals"
- **Automatic Status Management**: Tasks auto-update based on progress
- **Visual Progress Indicators**: Real-time completion tracking

### 🤖 **AI Agent Workflow**
1. **GoalParserAgent**: Extracts structured data from natural language
2. **PlannerAgent**: Creates detailed task breakdown with timelines
3. **TrackerAgent**: Manages task states and progress
4. **ProgressUpdaterAgent**: Analyzes updates and adjusts plans

### 💻 **Modern User Experience**
- **Responsive Dashboard**: Clean, intuitive interface
- **Real-time Updates**: Instant progress synchronization
- **Mobile-Friendly**: Works seamlessly across devices

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI/ML**: LangGraph, LangChain, Google Gemini
- **Database**: MongoDB Atlas with Motor async driver
- **Authentication**: JWT-based auth system
- **WebSocket**: Real-time updates

### DevOps & Tools
- **Database**: MongoDB Atlas (Cloud)
- **API Documentation**: FastAPI auto-generated OpenAPI
- **Environment Management**: python-dotenv
- **Package Management**: npm, pip

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB Atlas account
- Google Gemini API key

### Backend Setup
```bash
# Clone repository
git clone https://github.com/yourusername/agentic-planner.git
cd agentic-planner/backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and Google API key

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Navigate to frontend
cd ../frontend/my-agentic-app

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API endpoints

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 📡 API Reference

### Core Endpoints

#### Plans Management
```bash
POST /api/create              # Create AI-generated plan
GET /api/status/{plan_id}     # Get plan statistics
GET /api/plans/user/{user_id} # Get user's plans
```

#### Task Operations
```bash
GET /api/tasks/{plan_id}      # Get plan tasks
GET /api/tasks/user/{user_id} # Get user tasks
PATCH /api/tasks/{task_id}    # Update task
```

#### AI-Powered Progress
```bash
POST /api/progress/ai-update       # Single task AI update
POST /api/progress/bulk-ai-update  # Multiple tasks AI update
```

### Example API Calls

<details>
<summary>📋 Create a Study Plan</summary>

```bash
curl -X POST "http://localhost:8000/api/create" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "title": "IELTS Preparation",
    "plan_type": "study", 
    "description": "Prepare for IELTS exam in 3 months, target score 7.5",
    "start_date": "2024-01-01T00:00:00",
    "end_date": "2024-04-01T00:00:00"
  }'
```

</details>

<details>
<summary>🤖 AI Progress Update</summary>

```bash
curl -X POST "http://localhost:8000/api/progress/ai-update" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task123",
    "user_id": "user123",
    "user_input": "I finished reading 25 pages today and understood most of the grammar concepts"
  }'
```

</details>

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Overview)
*Clean, intuitive dashboard showing all active plans and progress*

### Task Management
![Tasks](https://via.placeholder.com/800x400?text=Task+Management)
*Detailed task view with AI-powered progress updates*

### AI Chat Interface
![AI Chat](https://via.placeholder.com/800x400?text=AI+Chat+Interface)
*Natural language interaction for goal creation and progress updates*

## 🎯 Use Cases

### 📚 **Academic Goals**
- IELTS/TOEFL preparation
- Course completion tracking
- Research project management

### 💪 **Fitness & Health**
- Weight loss programs
- Workout routine tracking
- Nutrition goal monitoring

### 💰 **Financial Planning**
- Saving targets
- Investment tracking
- Budget management

### 🏠 **Life Management**
- Home improvement projects
- Skill development
- Personal organization

## 🔮 Future Enhancements

- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Team Collaboration**: Shared goals and progress tracking
- [ ] **Advanced Analytics**: Detailed progress insights and predictions
- [ ] **Integration APIs**: Connect with fitness trackers, calendars, etc.
- [ ] **Voice Interface**: Voice-activated goal creation and updates
- [ ] **Gamification**: Achievement badges and progress rewards

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 📚 API Documentation

Once running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **API Schema**: http://localhost:8000/openapi.json

---

<div align="center">
  <p>⭐ Star this repository if you find it helpful!</p>
  <p>Made with ❤️ and lots of ☕</p>
</div>
