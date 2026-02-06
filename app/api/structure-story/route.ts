// API Route: Structure voice recording into story sections using Gemini AI
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const { transcription, language } = await request.json();

        if (!transcription || transcription.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'No transcription provided' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Fallback if no API key
            return NextResponse.json(
                { success: false, error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-flash-latest (Stable, higher limits)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Step 1: Translate to English if needed
        let englishTranscription = transcription;
        // Check for Hindi/Devanagari script or common Hindi words in Roman script
        const isHindiScript = /[\u0900-\u097F]/.test(transcription);
        // Expanded list of common Hinglish words for better detection
        const hasHindiWords = /\b(mujhe|aap|main|mein|hum|tum|hai|h|ho|tha|thi|nahin|nahi|nhi|koshish|subah|raat|achcha|acha|bahut|bhot|kya|kyun|kab|kaise|lekin|magar|kyunki|par|se|ka|ki|ke)\b/i.test(transcription);
        const isHindi = language === 'hi-IN' || isHindiScript || hasHindiWords;



        if (isHindi) {
            const translationPrompt = `Translate the following text to fluent, natural English. The text contains a mix of English and Hindi (Hinglish), and possibly some Devanagari script. Translate ALL Hindi words and phrases to English while preserving the meaning, tone, and emotion:

---
${transcription}
---

Return ONLY the complete English translation, nothing else. Make it sound natural and coherent.`;

            try {
                const translationResult = await model.generateContent(translationPrompt);
                englishTranscription = translationResult.response.text().trim();
            } catch (err: unknown) {
                const translationError = err as Error;
                console.error('Translation failed:', translationError);
                // If translation fails, continue with original text
                englishTranscription = transcription;
            }
        }

        // Step 2: Structure the story (now in English)
        const structuringPrompt = `You are an expert story editor. The user has shared their personal experience${isHindi ? ' (originally in mixed Hindi-English, now translated)' : ''}. Your job is to intelligently analyze the content and structure it into three distinct sections:

1. **What Happened** - Extract the actual events, situation, and context from their story
2. **What I Learned** - Identify the insights, lessons, or realizations (even if not explicitly stated, infer from the story)
3. **Advice for Others** - Generate helpful recommendations based on their experience (even if they didn't explicitly give advice, create it based on their learnings)

Additional tasks:
- Generate a compelling, short title (max 60 characters) that captures the essence
- Determine the most relevant category: work, health, money, relationships, or life
- Determine if the overall experience was positive (true) or a lesson/challenge (false)
- Suggest 3-5 relevant tags (lowercase, hyphenated like 'career-change', 'morning-routine', 'sleep-health')

Here is the user's story:

---
${englishTranscription}
---

IMPORTANT INSTRUCTIONS:
- Each section should be 2-4 complete sentences
- Write in first-person perspective, maintaining the user's authentic voice
- If a section isn't explicitly mentioned, intelligently infer it from the context
- Make the content flow naturally and sound like a real person sharing their story
- For "Advice for Others", create practical tips based on what they learned

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "title": "compelling title here",
  "category": "health",
  "isPositive": true,
  "whatHappened": "paragraph describing what happened",
  "whatILearned": "paragraph describing the lessons learned",
  "adviceForOthers": "paragraph with advice for others",
  "tags": ["tag1", "tag2", "tag3"]
}`;

        const result = await model.generateContent(structuringPrompt);
        const responseText = result.response.text();

        // Clean the response (remove markdown code blocks if present)
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
        }

        const structured = JSON.parse(cleanedResponse);

        return NextResponse.json({
            success: true,
            data: {
                ...structured,
                originalLanguage: isHindi ? 'Hindi' : 'English',
                wasTranslated: isHindi,
            },
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error structuring story:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to structure story' },
            { status: 500 }
        );
    }
}
