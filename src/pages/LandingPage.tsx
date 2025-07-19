import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, MessageSquare, BarChart3, Play, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Chat IDE</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              AI Chat Platform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                With IDE Powers
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate AI-powered development environment. Chat with multiple LLMs, 
              execute code, create visualizations, and build amazing projects—all in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete development environment powered by AI, designed for modern developers and data scientists.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all hover:transform hover:scale-105"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Supercharge Your Development?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of developers who are building faster with AI-powered tools.
            </p>
            
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 AI Chat IDE. Built with ❤️ for developers.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: 'Multi-LLM Chat',
    description: 'Chat with GPT-4, Claude, Mistral, and local models in one interface.',
    color: 'bg-blue-500'
  },
  {
    icon: Code,
    title: 'Code Execution',
    description: 'Run Python, JavaScript, and TypeScript code with instant results.',
    color: 'bg-green-500'
  },
  {
    icon: BarChart3,
    title: 'Data Visualization',
    description: 'Create interactive charts and plots with Plotly integration.',
    color: 'bg-purple-500'
  },
  {
    icon: Globe,
    title: 'Web Integration',
    description: 'Embed websites and external content with secure iframes.',
    color: 'bg-orange-500'
  },
  {
    icon: Zap,
    title: 'Real-time Collaboration',
    description: 'Share workspaces and collaborate with your team in real-time.',
    color: 'bg-yellow-500'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your code and data stay secure with enterprise-grade encryption.',
    color: 'bg-red-500'
  }
];

export default LandingPage;