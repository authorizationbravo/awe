-- AI Chat Platform Database Schema
-- This file contains all table definitions for the platform

-- User profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    plan_type VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    api_keys JSONB DEFAULT '{}', -- Encrypted API keys storage
    preferences JSONB DEFAULT '{}', -- User preferences and settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    model_provider VARCHAR(50) NOT NULL, -- openai, claude, mistral, local
    model_name VARCHAR(100) NOT NULL,
    system_prompt TEXT,
    template_type VARCHAR(50), -- code, data-analysis, general, custom
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- attachments, code_execution_results, etc.
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code executions table
CREATE TABLE code_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    message_id UUID,
    language VARCHAR(50) NOT NULL, -- python, javascript, typescript, etc.
    code TEXT NOT NULL,
    output TEXT,
    error_output TEXT,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_id UUID,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data visualizations table
CREATE TABLE visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_id UUID,
    title VARCHAR(255),
    chart_type VARCHAR(50), -- line, bar, scatter, heatmap, etc.
    chart_config JSONB NOT NULL, -- Plotly.js configuration
    data_source JSONB, -- Data used for the chart
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for WebSocket connections
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0,
    request_type VARCHAR(50), -- chat, code_execution, embedding, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_code_executions_user_id ON code_executions(user_id);
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_visualizations_user_id ON visualizations(user_id);
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own messages" ON messages FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM conversations WHERE id = conversation_id
    )
);
CREATE POLICY "Users can manage own code executions" ON code_executions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own file uploads" ON file_uploads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own visualizations" ON visualizations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own API usage" ON api_usage FOR SELECT USING (auth.uid() = user_id);