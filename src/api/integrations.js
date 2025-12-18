import { supabase } from './supabaseClient';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Helper function to convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// InvokeLLM - Using Gemini 2.0 Flash
export async function InvokeLLM({ prompt, file_urls = [], response_json_schema }) {
    const parts = [{ text: prompt }];

    // Add images if provided
    for (const url of file_urls) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const base64 = await blobToBase64(blob);
            parts.push({
                inline_data: {
                    mime_type: blob.type || 'image/jpeg',
                    data: base64.split(',')[1]
                }
            });
        } catch (err) {
            console.warn('Failed to load image:', url, err);
        }
    }

    const requestBody = {
        contents: [{ parts }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
        }
    };

    // Add JSON response format if schema provided
    if (response_json_schema) {
        requestBody.generationConfig.responseMimeType = 'application/json';
        requestBody.generationConfig.responseSchema = response_json_schema;
    }

    const res = await fetch(
        `${GEMINI_API_URL}/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        }
    );

    const data = await res.json();

    if (data.error) {
        console.error('Gemini API Error:', data.error);
        throw new Error(data.error.message || 'Gemini API error');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No response from Gemini');
    }

    if (response_json_schema) {
        try {
            return JSON.parse(text);
        } catch {
            // Try to extract JSON from the response if it's wrapped in markdown
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1] || jsonMatch[0]);
            }
            throw new Error('Failed to parse JSON response');
        }
    }

    return text;
}

// UploadFile - Using Supabase Storage
export async function UploadFile({ file }) {
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
        .from('public-files')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message || 'Failed to upload file');
    }

    const { data: { publicUrl } } = supabase.storage
        .from('public-files')
        .getPublicUrl(filePath);

    return { file_url: publicUrl };
}

// UploadPrivateFile - Using Supabase Storage (private bucket)
export async function UploadPrivateFile({ file }) {
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `private/${fileName}`;

    const { error } = await supabase.storage
        .from('private-files')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw new Error(error.message);

    return { file_path: filePath };
}

// CreateFileSignedUrl - Get a signed URL for private files
export async function CreateFileSignedUrl({ path, expiresIn = 3600 }) {
    const { data, error } = await supabase.storage
        .from('private-files')
        .createSignedUrl(path, expiresIn);

    if (error) throw new Error(error.message);

    return { signed_url: data?.signedUrl };
}

// GenerateImage - Using Gemini Imagen 3
export async function GenerateImage({ prompt, width = 1024, height = 1024 }) {
    // Determine aspect ratio based on dimensions
    let aspectRatio = '1:1';
    if (width > height) {
        aspectRatio = '16:9';
    } else if (height > width) {
        aspectRatio = '9:16';
    }

    const res = await fetch(
        `${GEMINI_API_URL}/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio,
                    personGeneration: 'allow_adult',
                    outputOptions: {
                        mimeType: 'image/png'
                    }
                }
            })
        }
    );

    const data = await res.json();

    if (data.error) {
        console.error('Imagen API Error:', data.error);
        throw new Error(data.error.message || 'Image generation failed');
    }

    return {
        imageBase64: data.predictions?.[0]?.bytesBase64Encoded
    };
}

// ExtractDataFromUploadedFile - Use Gemini for extraction
export async function ExtractDataFromUploadedFile({ file_url, prompt }) {
    return InvokeLLM({
        prompt: prompt || 'Extract all text and relevant data from this file.',
        file_urls: [file_url],
        response_json_schema: {
            type: 'object',
            properties: {
                extracted_text: { type: 'string' },
                data: { type: 'object' }
            }
        }
    });
}

// SendEmail - Stub (needs server-side implementation)
export async function SendEmail({ to, subject, body }) {
    console.warn('Email sending requires server-side implementation. Consider using Supabase Edge Functions with Resend or SendGrid.');
    return { success: false, error: 'Not implemented' };
}

// Export Core for backward compatibility
export const Core = {
    InvokeLLM,
    SendEmail,
    UploadFile,
    GenerateImage,
    ExtractDataFromUploadedFile,
    CreateFileSignedUrl,
    UploadPrivateFile
};
