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

// Generate image with Gemini - Main image generation function
export async function generateWithFlux({
    text_prompt,
    user_images = [],
    identity_refs = [],
    width = 1280,
    height = 720
}) {
    // Determine aspect ratio
    let aspectRatio = '16:9';
    if (width === height) {
        aspectRatio = '1:1';
    } else if (height > width) {
        aspectRatio = '9:16';
    }

    // If we have user images, use Gemini's image editing/generation with reference
    if (user_images.length > 0) {
        try {
            // Fetch the user image and convert to base64
            const imageResponse = await fetch(user_images[0]);
            const imageBlob = await imageResponse.blob();
            const base64Image = await blobToBase64(imageBlob);

            // Enhanced prompt for better results
            const enhancedPrompt = `${text_prompt}

Important instructions:
- Maintain the exact facial features and identity from the reference image
- Create a cinematic, professional quality image
- Fill the entire frame with no empty spaces
- Use dramatic lighting and vibrant colors
- Make it look like a viral YouTube thumbnail
- Output in ${aspectRatio} aspect ratio at high resolution (4K quality)`;

            // Use Gemini 2.0 Flash experimental image generation
            const res = await fetch(
                `${GEMINI_API_URL}/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: enhancedPrompt },
                                {
                                    inline_data: {
                                        mime_type: imageBlob.type || 'image/jpeg',
                                        data: base64Image.split(',')[1]
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            responseModalities: ['image', 'text'],
                        }
                    })
                }
            );

            const data = await res.json();

            if (data.error) {
                console.error('Gemini Image Edit Error:', data.error);
                // Fall back to pure generation if editing fails
                return generatePureImage(text_prompt, aspectRatio);
            }

            // Find image in response
            const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inline_data);

            if (imagePart) {
                return {
                    data: {
                        imagesBase64: [imagePart.inline_data.data]
                    }
                };
            }

            // If no image in response, fall back to pure generation
            return generatePureImage(text_prompt, aspectRatio);

        } catch (err) {
            console.error('Image generation with reference failed:', err);
            // Fall back to pure generation
            return generatePureImage(text_prompt, aspectRatio);
        }
    }

    // Pure text-to-image generation using Imagen 3
    return generatePureImage(text_prompt, aspectRatio);
}

// Pure image generation without reference - using Nano Banana Pro (Gemini 3 Pro Image) with 4K
async function generatePureImage(prompt, aspectRatio = '16:9') {
    const enhancedPrompt = `${prompt}

Style: Ultra-realistic, cinematic, professional photography quality, dramatic lighting, vibrant colors, viral YouTube thumbnail style.`;

    const res = await fetch(
        `${GEMINI_API_URL}/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: enhancedPrompt }]
                }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {
                        aspectRatio: aspectRatio,
                        imageSize: '4K'
                    }
                }
            })
        }
    );

    const data = await res.json();

    if (data.error) {
        console.error('Nano Banana Pro Error:', data.error);
        throw new Error(data.error.message || 'Image generation failed');
    }

    // Find image in response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
        throw new Error('No image generated');
    }

    return {
        data: {
            imagesBase64: [imagePart.inlineData.data]
        }
    };
}

// Face detection using Gemini Vision
export async function detectFaces({ image_url }) {
    try {
        const imageResponse = await fetch(image_url);
        const imageBlob = await imageResponse.blob();
        const base64Image = await blobToBase64(imageBlob);

        const res = await fetch(
            `${GEMINI_API_URL}/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `Analyze this image and detect all human faces. For each face found, provide the bounding box coordinates as percentages of the image dimensions.

Return a JSON object in this exact format:
{
  "faces": [
    { "x": <number 0-100>, "y": <number 0-100>, "width": <number 0-100>, "height": <number 0-100> }
  ]
}

Where:
- x, y are the top-left corner position as percentage of image width/height
- width, height are the face box size as percentage of image dimensions
- Convert to approximate pixel values assuming 1280x720 resolution

If no faces are found, return { "faces": [] }`
                            },
                            {
                                inline_data: {
                                    mime_type: imageBlob.type || 'image/jpeg',
                                    data: base64Image.split(',')[1]
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.1
                    }
                })
            }
        );

        const data = await res.json();

        if (data.error) {
            console.warn('Face detection error:', data.error);
            return { data: { faces: [] } };
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return { data: { faces: [] } };
        }

        try {
            const parsed = JSON.parse(text);

            // Convert percentages to approximate pixels (for 1280x720)
            const faces = (parsed.faces || []).map(face => ({
                x: Math.round((face.x / 100) * 1280),
                y: Math.round((face.y / 100) * 720),
                width: Math.round((face.width / 100) * 1280),
                height: Math.round((face.height / 100) * 720)
            }));

            return { data: { faces } };
        } catch {
            console.warn('Failed to parse face detection response');
            return { data: { faces: [] } };
        }
    } catch (err) {
        console.error('Face detection failed:', err);
        return { data: { faces: [] } };
    }
}

// Creative assistant using Gemini
export async function creativeAssistant({ prompt, context = '' }) {
    const res = await fetch(
        `${GEMINI_API_URL}/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 4096
                }
            })
        }
    );

    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    };
}

// Web scraping - Note: This requires server-side implementation for full functionality
export async function firecrawlScrape({ url }) {
    console.warn('Web scraping requires server-side implementation for security reasons.');
    console.warn('Consider using Supabase Edge Functions with a scraping library.');
    return {
        data: null,
        error: 'Web scraping not available in browser. Use server-side implementation.'
    };
}

// PayPal functions - These work with PayPal's client-side SDK
// For full functionality, you should implement server-side handlers

export async function paypalCreateOrder({ packageId }) {
    // This should ideally call your server to create the order
    // For now, we'll use PayPal's client-side order creation
    console.log('Creating PayPal order for package:', packageId);

    // Return mock data - the actual order is created by PayPal SDK buttons
    return {
        data: {
            id: 'pending_client_side',
            packageId
        }
    };
}

export async function paypalCaptureOrder({ orderID }) {
    // This should call your server to capture the order and update user credits
    console.log('Capturing PayPal order:', orderID);

    // For now, just log success
    return {
        success: true,
        message: 'Order captured (server-side implementation needed for credit updates)'
    };
}

export async function paypalWebhook(data) {
    // Webhooks should be handled server-side
    console.log('PayPal webhook received:', data);
    return { success: true };
}

export async function getPaypalConfig() {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId || clientId === 'demo') {
        console.warn('PayPal client ID not configured. Payments will be in demo mode.');
    }

    return {
        data: {
            clientId: clientId || 'demo'
        }
    };
}

export async function paypalActivateSubscription({ subscriptionID, planId }) {
    // This should call your server to activate the subscription
    console.log('Activating subscription:', subscriptionID, 'for plan:', planId);

    return {
        success: true,
        message: 'Subscription activated (server-side implementation needed)'
    };
}

// Vertex Gemini Image - Now uses our generateWithFlux
export const vertexGeminiImage = generateWithFlux;

// Flux Kontext Edit - Now uses our generateWithFlux
export const fluxKontextEdit2p = generateWithFlux;
