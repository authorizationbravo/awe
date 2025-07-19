// AI Chat Completion Edge Function
// Handles requests to various LLM providers (OpenAI, Claude, Mistral)

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { messages, model, provider, stream = false, userApiKey } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('Messages array is required');
        }

        if (!model || !provider) {
            throw new Error('Model and provider are required');
        }

        // Get API key from environment or user provided
        let apiKey = userApiKey;
        if (!apiKey) {
            switch (provider) {
                case 'openai':
                    apiKey = Deno.env.get('OPENAI_API_KEY');
                    break;
                case 'claude':
                    apiKey = Deno.env.get('ANTHROPIC_API_KEY');
                    break;
                case 'mistral':
                    apiKey = Deno.env.get('MISTRAL_API_KEY');
                    break;
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }
        }

        if (!apiKey) {
            throw new Error(`API key not found for provider: ${provider}`);
        }

        // Format messages for the specific provider
        const formattedMessages = formatMessagesForProvider(messages, provider);
        
        // Make API call based on provider
        let response;
        switch (provider) {
            case 'openai':
                response = await callOpenAI(formattedMessages, model, apiKey, stream);
                break;
            case 'claude':
                response = await callClaude(formattedMessages, model, apiKey, stream);
                break;
            case 'mistral':
                response = await callMistral(formattedMessages, model, apiKey, stream);
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chat completion error:', error);

        const errorResponse = {
            error: {
                code: 'CHAT_COMPLETION_FAILED',
                message: error.message,
                provider: req.provider || 'unknown'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function formatMessagesForProvider(messages: any[], provider: string) {
    // Format messages according to provider requirements
    switch (provider) {
        case 'openai':
            return messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        case 'claude':
            return messages.map(msg => ({
                role: msg.role === 'user' ? 'human' : 'assistant',
                content: msg.content
            }));
        case 'mistral':
            return messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        default:
            return messages;
    }
}

async function callOpenAI(messages: any[], model: string, apiKey: string, stream: boolean) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages,
            stream
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: data.model
    };
}

async function callClaude(messages: any[], model: string, apiKey: string, stream: boolean) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model,
            max_tokens: 4000,
            messages,
            stream
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        content: data.content[0]?.text || '',
        usage: data.usage,
        model: data.model
    };
}

async function callMistral(messages: any[], model: string, apiKey: string, stream: boolean) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages,
            stream
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mistral API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: data.model
    };
}