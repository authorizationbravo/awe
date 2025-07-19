# AI Chat Platform - Supabase Backend

## Overview
This directory contains all the backend infrastructure for the AI Chat Platform, including database schemas, Edge Functions, and configuration files.

## Database Schema
The platform uses the following main tables:
- `profiles` - User profiles and settings
- `conversations` - Chat conversations
- `messages` - Individual chat messages
- `code_executions` - Code execution history
- `file_uploads` - File upload metadata
- `visualizations` - Data visualization configurations
- `user_sessions` - WebSocket session management
- `api_usage` - API usage tracking

## Edge Functions

### chat-completion.ts
Handles AI chat completions for multiple providers:
- OpenAI (GPT-3.5, GPT-4)
- Anthropic Claude
- Mistral AI
- Support for custom API keys

### code-execution.ts
Secure code execution environment:
- Python code execution
- JavaScript/TypeScript execution
- Sandboxed environment
- Result storage in database

### websocket-handler.ts
Real-time communication:
- WebSocket connection management
- Typing indicators
- Live chat updates
- Session management

### file-upload.ts
File upload and management:
- Secure file uploads to Supabase Storage
- File type validation
- Size limits (10MB)
- Metadata storage

## Setup Instructions

1. **Database Setup**
   ```sql
   -- Run the database-schema.sql file in your Supabase SQL editor
   ```

2. **Storage Buckets**
   Create these storage buckets in Supabase:
   - `chat-files` (for file uploads)
   - `avatars` (for user avatars)

3. **Edge Functions Deployment**
   ```bash
   # Deploy all edge functions
   supabase functions deploy chat-completion
   supabase functions deploy code-execution
   supabase functions deploy websocket-handler
   supabase functions deploy file-upload
   ```

4. **Environment Variables**
   Set these in your Supabase Edge Functions environment:
   ```
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_claude_key
   MISTRAL_API_KEY=your_mistral_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_URL=your_supabase_url
   ```

## Security Features

- Row Level Security (RLS) enabled on all tables
- User isolation (users can only access their own data)
- API key validation
- File type and size validation
- Token-based authentication
- Secure WebSocket connections

## Performance Optimizations

- Database indexes on frequently queried columns
- Efficient message pagination
- Lazy loading for file uploads
- Connection pooling for WebSocket
- Caching for frequently accessed data

## Monitoring and Logging

- All Edge Functions include comprehensive error logging
- API usage tracking for billing and analytics
- Performance metrics collection
- User activity monitoring

## Scaling Considerations

- Horizontal scaling through Supabase's infrastructure
- Edge Functions auto-scale based on demand
- Database connection pooling
- CDN integration for file uploads
- Rate limiting implementation

For more detailed documentation, see the individual function files and database schema comments.