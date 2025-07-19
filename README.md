# AI Chat Platform with IDE Capabilities

A powerful, production-ready AI chat platform that combines conversational AI with a full-featured integrated development environment (IDE). Chat with multiple LLM providers, execute code, create visualizations, and build amazing projects—all in one seamless platform.

## ✨ Features

### 🤖 Multi-LLM Chat Interface
- Support for OpenAI GPT-4, Anthropic Claude, Mistral AI, and local models
- Real-time conversations with typing indicators
- Message history and conversation management
- Markdown rendering with syntax highlighting
- Message actions (copy, rating, text-to-speech)

### 💻 Integrated Development Environment
- **Monaco Editor**: Full-featured code editor with IntelliSense
- **Multi-language Support**: Python, JavaScript, TypeScript, HTML, CSS, JSON, SQL, Markdown
- **Code Execution**: Run code directly in the browser with real-time results
- **Syntax Highlighting**: Beautiful code presentation with multiple themes
- **File Management**: Upload, download, and manage code files

### 📊 Data Visualization
- **Plotly.js Integration**: Create interactive charts and graphs
- **Multiple Chart Types**: Line, bar, pie, scatter, and custom visualizations
- **Real-time Editing**: Modify chart configurations with live preview
- **Export Capabilities**: Download charts and data in various formats

### 🔧 Advanced IDE Features
- **Resizable Panels**: Customizable workspace layout
- **Multi-window Interface**: Work with multiple panels simultaneously
- **Output Panel**: View execution results, errors, and logs
- **iframe Embedding**: Integrate external web content securely
- **File Upload/Download**: Manage project files easily

### 🚀 Professional Features
- **User Authentication**: Secure login and user management
- **Settings Management**: Customize appearance, API keys, and preferences
- **Template System**: Quick start templates for different use cases
- **Real-time Collaboration**: WebSocket-based live updates
- **Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Quick Start

### Demo Mode
1. Visit the deployed application
2. Click "Continue with Demo Account" on the login page
3. Explore all features without setting up API keys
4. Try the example prompts and templates

### Full Setup
1. **Create Account**: Sign up with your email
2. **Onboarding**: Follow the guided setup process
3. **API Keys**: Add your LLM provider API keys (optional)
4. **Start Building**: Create your first conversation

## 🛠 Technical Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for responsive, utility-first styling
- **Framer Motion** for smooth animations and transitions
- **Monaco Editor** for professional code editing experience
- **Plotly.js** for interactive data visualizations
- **React Router** for client-side navigation
- **React Hot Toast** for elegant notifications

### Backend Infrastructure
- **Supabase** for authentication, database, and real-time features
- **Edge Functions** for serverless API endpoints
- **Row Level Security** for data protection
- **WebSocket Support** for real-time communication

## 🌟 Getting Started Examples

### Data Analysis with Python
```python
import pandas as pd
import matplotlib.pyplot as plt

# Load and analyze sales data
data = pd.read_json('/data/sample-data.json')
sales_df = pd.DataFrame(data['examples']['datasets']['sales']['data'])

# Create visualization
plt.figure(figsize=(10, 6))
plt.plot(sales_df['month'], sales_df['sales'])
plt.title('Monthly Sales Trend')
plt.xlabel('Month')
plt.ylabel('Sales ($)')
plt.show()
```

### API Integration with JavaScript
```javascript
// Fetch and process external data
async function analyzeMarketData() {
  const response = await fetch('https://api.example.com/market-data');
  const data = await response.json();
  
  const analysis = {
    average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
    trend: calculateTrend(data),
    predictions: generatePredictions(data)
  };
  
  console.log('Market Analysis:', analysis);
  return analysis;
}
```

---

**Built with ❤️ by MiniMax Agent**

*Empowering developers, data scientists, and creators with AI-powered development tools.*