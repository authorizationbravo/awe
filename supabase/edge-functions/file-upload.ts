// File Upload Edge Function
// Handles secure file uploads and processing

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
        const { fileData, fileName, fileType, conversationId } = await req.json();

        if (!fileData || !fileName) {
            throw new Error('File data and filename are required');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'text/csv', 'application/json', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (fileType && !allowedTypes.includes(fileType)) {
            throw new Error(`File type ${fileType} not allowed`);
        }

        // Extract base64 data
        const base64Data = fileData.split(',')[1];
        const mimeType = fileData.split(';')[0].split(':')[1] || fileType;
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        if (binaryData.length > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        const storagePath = `uploads/${userId}/${uniqueFileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/chat-files/${storagePath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/chat-files/${storagePath}`;

        // Save file metadata to database
        const fileRecord = {
            user_id: userId,
            conversation_id: conversationId,
            filename: fileName,
            file_type: mimeType,
            file_size: binaryData.length,
            storage_path: storagePath,
            metadata: {
                public_url: publicUrl,
                upload_timestamp: timestamp
            }
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/file_uploads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(fileRecord)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const uploadData = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                id: uploadData[0].id,
                publicUrl,
                fileName,
                fileType: mimeType,
                fileSize: binaryData.length,
                storagePath
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('File upload error:', error);

        const errorResponse = {
            error: {
                code: 'FILE_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});