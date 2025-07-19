// WebSocket Handler for Real-time Communication
// Manages real-time chat updates and notifications

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
        // Handle WebSocket upgrade
        if (req.headers.get('upgrade') === 'websocket') {
            const { socket, response } = Deno.upgradeWebSocket(req);
            
            socket.onopen = () => {
                console.log('WebSocket connection opened');
            };
            
            socket.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    await handleWebSocketMessage(socket, data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format'
                    }));
                }
            };
            
            socket.onclose = () => {
                console.log('WebSocket connection closed');
            };
            
            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
            return response;
        }

        // Handle regular HTTP requests for session management
        const { action, sessionToken, userId } = await req.json();
        
        switch (action) {
            case 'create_session':
                return await createSession(userId);
            case 'validate_session':
                return await validateSession(sessionToken);
            case 'destroy_session':
                return await destroySession(sessionToken);
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('WebSocket handler error:', error);
        
        return new Response(JSON.stringify({
            error: {
                code: 'WEBSOCKET_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function handleWebSocketMessage(socket: WebSocket, data: any) {
    const { type, payload } = data;
    
    switch (type) {
        case 'join_conversation':
            // Handle user joining a conversation
            socket.send(JSON.stringify({
                type: 'conversation_joined',
                conversationId: payload.conversationId
            }));
            break;
            
        case 'typing_start':
            // Broadcast typing indicator
            socket.send(JSON.stringify({
                type: 'user_typing',
                userId: payload.userId,
                conversationId: payload.conversationId
            }));
            break;
            
        case 'typing_stop':
            // Stop typing indicator
            socket.send(JSON.stringify({
                type: 'user_stopped_typing',
                userId: payload.userId,
                conversationId: payload.conversationId
            }));
            break;
            
        case 'ping':
            // Health check
            socket.send(JSON.stringify({ type: 'pong' }));
            break;
            
        default:
            socket.send(JSON.stringify({
                type: 'error',
                message: `Unknown message type: ${type}`
            }));
    }
}

async function createSession(userId: string) {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    await fetch(`${supabaseUrl}/rest/v1/user_sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userId,
            session_token: sessionToken,
            expires_at: expiresAt.toISOString()
        })
    });
    
    return new Response(JSON.stringify({
        data: { sessionToken, expiresAt }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function validateSession(sessionToken: string) {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/user_sessions?session_token=eq.${sessionToken}&expires_at=gte.${new Date().toISOString()}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });
    
    const sessions = await response.json();
    const isValid = sessions.length > 0;
    
    return new Response(JSON.stringify({
        data: { valid: isValid }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function destroySession(sessionToken: string) {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    await fetch(`${supabaseUrl}/rest/v1/user_sessions?session_token=eq.${sessionToken}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });
    
    return new Response(JSON.stringify({
        data: { destroyed: true }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}