export const AI_WRITING_TIPS: Record<string, { tips: string[]; prompts: string[] }> = {
    title: {
        tips: [
            '✨ Keep it concise but descriptive',
            '🎯 Highlight the key decision or moment',
            '💡 Make it intriguing to draw readers in',
        ],
        prompts: [
            'The Day I Decided to...',
            'Why I [Action] and What Happened',
            'My [Category] Turning Point',
        ],
    },
    whatHappened: {
        tips: [
            '📖 Set the scene - where were you? What was happening?',
            '🎭 Include your emotions and thoughts at the time',
            '⏰ Mention the timeline - how long did this take?',
        ],
        prompts: [
            'Start with: "It all started when..."',
            'Describe: "I was at a crossroads because..."',
            'Share: "The moment I realized I needed to change was..."',
        ],
    },
    whatILearned: {
        tips: [
            '🧠 Focus on the insight, not just the outcome',
            '🔄 How did this change your perspective?',
            '💎 What would you not have known otherwise?',
        ],
        prompts: [
            'The biggest lesson was...',
            'I never realized that... until this happened',
            'This taught me that... is more important than...',
        ],
    },
    adviceForOthers: {
        tips: [
            '🎯 Be specific and actionable',
            '⚠️ Include what to avoid',
            '✅ Share concrete steps to take',
        ],
        prompts: [
            'If I could go back, I would...',
            'Before you do this, make sure to...',
            'The one thing I wish someone told me is...',
        ],
    },
};

export const fixGrammar = (text: string): string => {
    let fixed = text;
    // Common grammar fixes
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
    fixed = fixed.replace(/shouldnt\b/gi, "shouldn't");
    fixed = fixed.replace(/wouldnt\b/gi, "wouldn't");
    fixed = fixed.replace(/couldnt\b/gi, "couldn't");
    fixed = fixed.replace(/wasnt\b/gi, "wasn't");
    fixed = fixed.replace(/isnt\b/gi, "isn't");
    fixed = fixed.replace(/arent\b/gi, "aren't");
    fixed = fixed.replace(/werent\b/gi, "weren't");
    fixed = fixed.replace(/thats\b/gi, "that's");
    fixed = fixed.replace(/whats\b/gi, "what's");
    fixed = fixed.replace(/heres\b/gi, "here's");
    fixed = fixed.replace(/theres\b/gi, "there's");
    fixed = fixed.replace(/youre\b/gi, "you're");
    fixed = fixed.replace(/theyre\b/gi, "they're");
    fixed = fixed.replace(/were\b(?!\s+(not|going|able|ready))/gi, "we're");
    fixed = fixed.replace(/alot\b/gi, "a lot");
    fixed = fixed.replace(/definately\b/gi, "definitely");
    fixed = fixed.replace(/seperate\b/gi, "separate");
    fixed = fixed.replace(/occured\b/gi, "occurred");
    fixed = fixed.replace(/recieve\b/gi, "receive");
    if (fixed.length > 0 && !/[.!?]$/.test(fixed.trim())) {
        fixed = fixed.trim() + '.';
    }
    return fixed;
};

export const expandText = (text: string, field: string): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return text;

    const expansions: Record<string, string[]> = {
        whatHappened: [
            'Looking back, I can see how significant this moment truly was.',
            'The emotions I felt during this time were complex and profound.',
            'This situation challenged me in ways I hadn\'t anticipated.',
            'Every detail of this moment is etched in my memory.',
        ],
        whatILearned: [
            'This realization didn\'t come easily, but it was worth the struggle.',
            'Understanding this has fundamentally changed how I approach similar situations.',
            'I now apply this lesson in many areas of my life.',
            'This wisdom has become one of my guiding principles.',
        ],
        adviceForOthers: [
            'Trust me when I say this approach makes all the difference.',
            'I wish someone had shared this insight with me earlier.',
            'Taking this advice could save you a lot of time and heartache.',
            'This perspective has helped not just me, but many others I\'ve shared it with.',
        ],
    };

    const fieldExpansions = expansions[field] || expansions.whatHappened;
    const randomExpansion = fieldExpansions[Math.floor(Math.random() * fieldExpansions.length)];

    let expanded = text.trim();
    if (!expanded.endsWith('.') && !expanded.endsWith('!') && !expanded.endsWith('?')) {
        expanded += '.';
    }
    expanded += ' ' + randomExpansion;
    return expanded;
};

export const makeEngaging = (text: string): string => {
    let engaging = text;
    engaging = engaging.replace(/\bgood\b/gi, 'wonderful');
    engaging = engaging.replace(/\bbad\b/gi, 'challenging');
    engaging = engaging.replace(/\bsaid\b/gi, 'shared');
    engaging = engaging.replace(/\bthink\b/gi, 'believe');
    engaging = engaging.replace(/\bwent\b/gi, 'ventured');
    engaging = engaging.replace(/\bgot\b/gi, 'received');
    engaging = engaging.replace(/\bmade\b/gi, 'crafted');
    engaging = engaging.replace(/\btried\b/gi, 'endeavored');
    engaging = engaging.replace(/\bhard\b/gi, 'challenging');
    engaging = engaging.replace(/\bnice\b/gi, 'remarkable');
    engaging = engaging.replace(/\bvery\b/gi, 'incredibly');
    engaging = engaging.replace(/\breally\b/gi, 'truly');
    return engaging;
};

export const improveClarity = (text: string): string => {
    let clear = text;
    clear = clear.replace(/\bbasically\b/gi, '');
    clear = clear.replace(/\bactually\b/gi, '');
    clear = clear.replace(/\bliterally\b/gi, '');
    clear = clear.replace(/\bkind of\b/gi, '');
    clear = clear.replace(/\bsort of\b/gi, '');
    clear = clear.replace(/\byou know\b/gi, '');
    clear = clear.replace(/\blike\b(?=\s+[a-z])/gi, '');
    clear = clear.replace(/\bum\b/gi, '');
    clear = clear.replace(/\buh\b/gi, '');
    clear = clear.replace(/\s+/g, ' ').trim();
    return clear;
};
