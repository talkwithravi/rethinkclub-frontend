import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { text, mode, field } = await request.json();

        if (!text || !mode) {
            return NextResponse.json(
                { error: 'Text and mode are required' },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not configured, using fallback enhancement');
            return NextResponse.json({
                enhanced: fallbackEnhance(text, mode),
                usedFallback: true
            });
        }

        // Get the model (using gemini-pro for broad compatibility)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Create prompt based on enhancement mode
        const prompt = getPromptForMode(text, mode, field);

        // Generate enhanced text
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhanced = response.text();

        return NextResponse.json({
            enhanced: enhanced.trim(),
            usedFallback: false
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Gemini API error:', error);

        // Parse the text from the request body for fallback
        try {
            const body = await request.clone().json();
            return NextResponse.json({
                enhanced: fallbackEnhance(body.text, body.mode),
                usedFallback: true,
                error: error.message
            });
        } catch {
            return NextResponse.json(
                { error: 'Enhancement failed', details: error.message },
                { status: 500 }
            );
        }
    }
}

// Create the appropriate prompt based on enhancement mode
function getPromptForMode(text: string, mode: string, field?: string): string {
    const fieldContext = field ? `This is for the "${field}" section of a personal experience story.` : '';

    const prompts: Record<string, string> = {
        grammar: `Fix the grammar, spelling, and punctuation in the following text. Only fix errors, don't change the meaning or add new content. Return ONLY the corrected text, nothing else.

Text: "${text}"`,

        expand: `Expand the following text to add more detail and depth while keeping the same voice and meaning. Add 1-2 more sentences that elaborate on the experience. ${fieldContext} Return ONLY the expanded text, nothing else.

Text: "${text}"`,

        engaging: `Make the following text more engaging and vivid by using stronger, more descriptive words. Keep the same meaning but make it more compelling to read. Don't add new content, just improve the word choices. Return ONLY the improved text, nothing else.

Text: "${text}"`,

        clarity: `Improve the clarity of the following text by removing filler words, simplifying complex sentences, and making it easier to understand. Keep the same meaning. Return ONLY the clarified text, nothing else.

Text: "${text}"`,

        all: `Improve the following text by:
1. Fixing any grammar, spelling, or punctuation errors
2. Making the language more engaging and vivid
3. Removing filler words and improving clarity
4. If the text is short (under 100 characters), add 1-2 sentences that expand on the experience

${fieldContext}

Keep the same voice and meaning. Return ONLY the improved text, nothing else.

Text: "${text}"`,
    };

    return prompts[mode] || prompts.all;
}

// Fallback enhancement when Gemini API is not available
function fallbackEnhance(text: string, mode: string): string {
    let enhanced = text;

    // Basic grammar fixes
    const fixGrammar = (t: string): string => {
        let fixed = t;
        fixed = fixed.replace(/\bi\b/g, 'I');
        fixed = fixed.replace(/\s+/g, ' ');
        fixed = fixed.replace(/([.!?])\s*([a-z])/g, (_, p, c) => `${p} ${c.toUpperCase()}`);
        fixed = fixed.replace(/^([a-z])/g, (c) => c.toUpperCase());
        fixed = fixed.replace(/\bi'm\b/gi, "I'm");
        fixed = fixed.replace(/\bi've\b/gi, "I've");
        fixed = fixed.replace(/\bi'll\b/gi, "I'll");
        fixed = fixed.replace(/\bi'd\b/gi, "I'd");
        fixed = fixed.replace(/dont\b/gi, "don't");
        fixed = fixed.replace(/didnt\b/gi, "didn't");
        fixed = fixed.replace(/cant\b/gi, "can't");
        fixed = fixed.replace(/wont\b/gi, "won't");
        fixed = fixed.replace(/alot\b/gi, "a lot");
        if (fixed.length > 0 && !/[.!?]$/.test(fixed.trim())) {
            fixed = fixed.trim() + '.';
        }
        return fixed;
    };

    const makeEngaging = (t: string): string => {
        let engaging = t;
        engaging = engaging.replace(/\bgood\b/gi, 'wonderful');
        engaging = engaging.replace(/\bbad\b/gi, 'challenging');
        engaging = engaging.replace(/\bvery\b/gi, 'incredibly');
        engaging = engaging.replace(/\breally\b/gi, 'truly');
        return engaging;
    };

    switch (mode) {
        case 'grammar':
            enhanced = fixGrammar(text);
            break;
        case 'engaging':
            enhanced = makeEngaging(fixGrammar(text));
            break;
        case 'expand':
            enhanced = fixGrammar(text);
            if (!enhanced.endsWith('.')) enhanced += '.';
            enhanced += ' This experience taught me valuable lessons that I carry with me.';
            break;
        case 'clarity':
            enhanced = fixGrammar(text);
            enhanced = enhanced.replace(/\bbasically\b/gi, '');
            enhanced = enhanced.replace(/\bactually\b/gi, '');
            enhanced = enhanced.replace(/\s+/g, ' ').trim();
            break;
        case 'all':
        default:
            enhanced = fixGrammar(text);
            enhanced = makeEngaging(enhanced);
            if (enhanced.length < 100) {
                enhanced += ' Looking back, this moment was truly significant.';
            }
            break;
    }

    return enhanced;
}
