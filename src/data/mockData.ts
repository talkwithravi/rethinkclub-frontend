export interface User {
  id: string;
  username: string;
  avatar: string;
  joinDate: string;
  postCount: number;
  reputation: number;
  badges: string[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  category: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  lastActivity: string;
  color: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'MindfulSarah',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    joinDate: '2024-01-15',
    postCount: 47,
    reputation: 892,
    badges: ['Top Contributor', 'Mindfulness Expert']
  },
  {
    id: '2',
    username: 'GoalGetter23',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    joinDate: '2024-02-20',
    postCount: 32,
    reputation: 654,
    badges: ['Goal Achiever', 'Motivator']
  },
  {
    id: '3',
    username: 'WellnessWarrior',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    joinDate: '2024-03-10',
    postCount: 28,
    reputation: 543,
    badges: ['Health Advocate']
  },
  {
    id: '4',
    username: 'CareerClimber',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: '2024-01-30',
    postCount: 41,
    reputation: 721,
    badges: ['Career Expert', 'Mentor']
  }
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Goal Setting & Achievement',
    description: 'Share your goals, track progress, and celebrate victories',
    icon: '🎯',
    postCount: 156,
    lastActivity: '2 hours ago',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: '2',
    name: 'Mindfulness & Mental Health',
    description: 'Discuss meditation, stress management, and mental wellness',
    icon: '🧠',
    postCount: 203,
    lastActivity: '1 hour ago',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: '3',
    name: 'Career Development',
    description: 'Professional growth, networking, and career transitions',
    icon: '💼',
    postCount: 134,
    lastActivity: '3 hours ago',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: '4',
    name: 'Relationships & Communication',
    description: 'Building better relationships and communication skills',
    icon: '💬',
    postCount: 89,
    lastActivity: '4 hours ago',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: '5',
    name: 'Health & Wellness',
    description: 'Physical health, fitness, nutrition, and lifestyle',
    icon: '🏃‍♀️',
    postCount: 178,
    lastActivity: '30 minutes ago',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: '6',
    name: 'Book Discussions',
    description: 'Share insights from personal development books',
    icon: '📚',
    postCount: 67,
    lastActivity: '5 hours ago',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: '7',
    name: 'Success Stories',
    description: 'Celebrate achievements and inspire others',
    icon: '🌟',
    postCount: 92,
    lastActivity: '1 hour ago',
    color: 'bg-yellow-100 text-yellow-800'
  }
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'How I overcame procrastination in 30 days',
    content: 'After years of struggling with procrastination, I finally found a system that works. Here\'s my step-by-step approach that helped me become more productive and focused...',
    author: mockUsers[1],
    category: 'Goal Setting & Achievement',
    createdAt: '2024-07-18T10:30:00Z',
    updatedAt: '2024-07-18T10:30:00Z',
    upvotes: 47,
    downvotes: 2,
    commentCount: 23,
    tags: ['productivity', 'habits', 'motivation'],
    isPinned: true
  },
  {
    id: '2',
    title: 'Daily meditation changed my perspective on stress',
    content: 'I started meditating 10 minutes every morning six months ago. The transformation in how I handle stress and anxiety has been remarkable...',
    author: mockUsers[0],
    category: 'Mindfulness & Mental Health',
    createdAt: '2024-07-17T14:15:00Z',
    updatedAt: '2024-07-17T14:15:00Z',
    upvotes: 62,
    downvotes: 1,
    commentCount: 31,
    tags: ['meditation', 'stress', 'mindfulness']
  },
  {
    id: '3',
    title: 'Career pivot at 35: My journey from finance to UX design',
    content: 'Making a career change in your 30s can be scary, but it was the best decision I ever made. Here\'s how I successfully transitioned...',
    author: mockUsers[3],
    category: 'Career Development',
    createdAt: '2024-07-16T09:45:00Z',
    updatedAt: '2024-07-16T09:45:00Z',
    upvotes: 38,
    downvotes: 0,
    commentCount: 18,
    tags: ['career-change', 'ux-design', 'transition']
  },
  {
    id: '4',
    title: 'Building confidence through small wins',
    content: 'Confidence isn\'t built overnight. I learned to celebrate small victories and gradually build momentum. Here are the strategies that worked for me...',
    author: mockUsers[2],
    category: 'Goal Setting & Achievement',
    createdAt: '2024-07-15T16:20:00Z',
    updatedAt: '2024-07-15T16:20:00Z',
    upvotes: 29,
    downvotes: 1,
    commentCount: 15,
    tags: ['confidence', 'self-improvement', 'mindset']
  },
  {
    id: '5',
    title: 'Book recommendation: Atomic Habits - Life changing insights',
    content: 'Just finished reading Atomic Habits by James Clear. The concept of 1% daily improvements really resonated with me. Let\'s discuss the key takeaways...',
    author: mockUsers[0],
    category: 'Book Discussions',
    createdAt: '2024-07-14T11:30:00Z',
    updatedAt: '2024-07-14T11:30:00Z',
    upvotes: 45,
    downvotes: 0,
    commentCount: 27,
    tags: ['atomic-habits', 'book-review', 'habits']
  }
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: '1',
    content: 'This is exactly what I needed to read today! The Pomodoro technique you mentioned has been a game-changer for me too.',
    author: mockUsers[0],
    postId: '1',
    createdAt: '2024-07-18T11:15:00Z',
    upvotes: 12,
    downvotes: 0
  },
  {
    id: '2',
    content: 'Thank you for sharing your journey! I\'ve been struggling with the same issues. Could you elaborate on the "two-minute rule" you mentioned?',
    author: mockUsers[2],
    postId: '1',
    createdAt: '2024-07-18T12:30:00Z',
    upvotes: 8,
    downvotes: 0
  },
  {
    id: '3',
    content: 'Meditation has been transformative for me as well. I started with just 5 minutes and gradually increased. The key is consistency!',
    author: mockUsers[1],
    postId: '2',
    createdAt: '2024-07-17T15:45:00Z',
    upvotes: 15,
    downvotes: 0
  }
];

// Community Stats
export const communityStats = {
  totalMembers: 2847,
  totalPosts: 1219,
  totalComments: 4563,
  activeToday: 234
};
