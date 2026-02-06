import { Experience } from './types';

export const CATEGORIES = [
    { id: 'work', label: 'Work', color: '#a5b4fc', emoji: '💼' },
    { id: 'health', label: 'Health', color: '#6ee7b7', emoji: '🌿' },
    { id: 'money', label: 'Money', color: '#fcd34d', emoji: '💰' },
    { id: 'relationships', label: 'Relationships', color: '#f9a8d4', emoji: '💕' },
    { id: 'life', label: 'Life', color: '#c4b5fd', emoji: '✨' },
];

export const SUGGESTED_TAGS = [
    'career-change', 'investment', 'health-journey', 'relationship-advice',
    'life-lesson', 'mistake', 'success', 'failure', 'growth', 'mindset'
];

export const BADGES = [
    { id: 'first-story', name: 'First Story', icon: '🌟', requirement: 'Share your first experience' },
    { id: 'storyteller', name: 'Storyteller', icon: '📚', requirement: 'Share 5 experiences' },
    { id: 'helper', name: 'Helper', icon: '🤝', requirement: 'Get 10 helpful reactions' },
    { id: 'inspirer', name: 'Inspirer', icon: '✨', requirement: 'Get 25 inspiring reactions' },
    { id: 'veteran', name: 'Veteran', icon: '🏆', requirement: 'Share 25 experiences' },
];

export const getCategoryInfo = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId) || { label: 'Other', color: '#cbd5e1', emoji: '📌' };
};

export const USER_STATS = {
    totalExperiences: 3,
    totalHelped: 165,
    totalViews: 5560,
    earnedBadges: ['first-story', 'helper'],
};

export const SAMPLE_EXPERIENCES: Experience[] = [
    {
        id: '1',
        title: 'Taking the Startup Leap',
        category: 'work',
        wasPositive: true,
        whatHappened: 'Left my stable corporate job to start my own company. It was terrifying but also the most liberating decision I ever made.',
        whatILearned: 'Security is an illusion. Growth happens outside comfort zones. The fear of regret is worse than the fear of failure.',
        adviceForOthers: 'Have 6 months of savings before you jump. Build your network while employed. Start side projects first.',
        createdAt: '2024-12-15',
        tags: ['career-change', 'startup', 'risk-taking'],
        reactions: { helpful: 42, inspiring: 28, eyeOpening: 15 },
        userReaction: null,
        comments: [
            { id: 'c1', author: 'Anonymous', text: 'This is exactly what I needed to hear. Thank you for sharing!', createdAt: '2024-12-16' },
            { id: 'c2', author: 'CareerChanger', text: 'How long did it take before you felt stable?', createdAt: '2024-12-17' },
        ],
        commentsCount: 2,
        views: 1250,
    },
    {
        id: '2',
        title: 'The Investment Mistake',
        category: 'money',
        wasPositive: false,
        whatHappened: 'Put all my savings into a single stock that crashed 80% in a month. Lost years of hard-earned money.',
        whatILearned: 'Never put all eggs in one basket. Diversification is key. Emotions are your worst enemy in investing.',
        adviceForOthers: 'Research thoroughly and spread your investments. Set stop-losses. Never invest money you cannot afford to lose.',
        createdAt: '2024-11-20',
        tags: ['investment', 'mistake', 'money-lesson'],
        reactions: { helpful: 89, inspiring: 12, eyeOpening: 67 },
        userReaction: null,
        comments: [
            { id: 'c3', author: 'NewInvestor', text: 'This saved me from making the same mistake. Thank you!', createdAt: '2024-11-22' },
        ],
        commentsCount: 1,
        views: 3420,
    },
    {
        id: '3',
        title: 'Running My First Marathon',
        category: 'health',
        wasPositive: true,
        whatHappened: 'Trained for 6 months and completed a full marathon. Started as someone who couldn\'t run a mile.',
        whatILearned: 'Consistency beats intensity. Small daily efforts compound. Your mind gives up before your body does.',
        adviceForOthers: 'Start with a training plan and stick to it. Find a running community. Celebrate small wins along the way.',
        createdAt: '2024-10-05',
        tags: ['health-journey', 'marathon', 'discipline', 'success'],
        reactions: { helpful: 34, inspiring: 156, eyeOpening: 23 },
        userReaction: null,
        comments: [],
        commentsCount: 0,
        views: 890,
    },
];

export const RETHINKER_BUDDY_PROFILE = {
    name: 'Rethinker Buddy 🤖',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RethinkerBuddy',
    role: 'Your Smart Assistant'
};

export const RETHINKER_BUDDY_STORIES: Experience[] = [
    {
        id: 'bot_story_1',
        title: 'The "Perfect" Trap',
        category: 'life',
        wasPositive: false,
        whatHappened: 'I spent months trying to make my first project perfect before showing it to anyone. By the time I launched, the market had moved on.',
        whatILearned: 'Done is better than perfect. Feedback is fuel. Early validation saves time.',
        adviceForOthers: 'Launch your MVP (Minimum Viable Product/Project) early. Don\'t be afraid of imperfections, they are opportunities to learn.',
        createdAt: '2024-01-01',
        tags: ['perfectionism', 'mistake', 'growth-mindset'],
        reactions: { helpful: 150, inspiring: 85, eyeOpening: 92 },
        userReaction: null,
        comments: [],
        commentsCount: 0,
        views: 5000,
    },
    {
        id: 'bot_story_2',
        title: 'Ignoring the "Soft" Skills',
        category: 'work',
        wasPositive: false,
        whatHappened: 'I focused only on my technical coding skills and ignored communication and teamwork. I got passed over for a promotion despite being the best coder.',
        whatILearned: 'Technical skills get you hired; soft skills get you promoted. Empathy and communication are superpowers.',
        adviceForOthers: 'Invest in your emotional intelligence as much as your technical craft. Listen more than you speak.',
        createdAt: '2024-01-02',
        tags: ['career', 'soft-skills', 'hard-truth'],
        reactions: { helpful: 200, inspiring: 45, eyeOpening: 120 },
        userReaction: null,
        comments: [],
        commentsCount: 0,
        views: 4500,
    },
    {
        id: 'bot_story_3',
        title: 'Burning the Candle at Both Ends',
        category: 'health',
        wasPositive: false,
        whatHappened: 'I thought sleep was for the weak. I hustled 18 hours a day until my body shut down and I was forced to take a month off.',
        whatILearned: 'Rest is not idleness; it\'s part of the work. You can\'t pour from an empty cup.',
        adviceForOthers: 'Prioritize sleep and recovery. Your productivity will actually increase when you are well-rested.',
        createdAt: '2024-01-03',
        tags: ['health', 'burnout', 'lesson'],
        reactions: { helpful: 300, inspiring: 100, eyeOpening: 180 },
        userReaction: null,
        comments: [],
        commentsCount: 0,
        views: 6000,
    }
];

export const RETHINKER_BUDDY_COMMENTS = [
    "This is such a valuable share! 🌟 Thank you for being vulnerable.",
    "Great insight! Rethinking this experience will surely help others. 💡",
    "Turning a setback into a comeback is the Rethinker way! 🚀",
    "Love the perspective shift here. Thanks for your wisdom! ✨",
    "This resonates so much. It's all about the learning journey! 📚",
    "Detailed and helpful advice. Keep shining! 💫",
];
