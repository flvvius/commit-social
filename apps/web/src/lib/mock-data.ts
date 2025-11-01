// Mock data for the Commit social app
export type Post = {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
  };
  department: string;
  type: "text" | "image" | "collaborative";
  title?: string;
  content: string;
  images?: { url: string; caption: string }[];
  tags: string[];
  createdAt: Date;
  reactions: { emoji: string; count: number; userReacted: boolean }[];
  comments: number;
  shares: number;
  awards: number;
};

export type Comment = {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: Date;
  reactions: { emoji: string; count: number }[];
};

export type Group = {
  id: string;
  name: string;
  icon: string;
  members: number;
  isJoined: boolean;
};

export type Department = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
};

export const mockUsers = {
  current: {
    id: "user-1",
    name: "Alex Johnson",
    avatar: "/professional-profile-avatar.png",
    banner: "/professional-banner-background.jpg",
    bio: "Coffee enthusiast, code explorer, always learning 🚀",
    badges: ["Early Adopter", "Active Member", "Helpful"],
    socialLinks: [
      { platform: "twitter", url: "#" },
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
    streak: 7,
    joinedDate: new Date("2023-01-15"),
  },
};

export const mockDepartments: Department[] = [
  {
    id: "dept-1",
    name: "Engineering",
    description: "Tech discussions and code reviews",
    memberCount: 2543,
    postCount: 1203,
  },
  {
    id: "dept-2",
    name: "Design",
    description: "Design trends and UI/UX discussions",
    memberCount: 1823,
    postCount: 856,
  },
  {
    id: "dept-3",
    name: "Marketing",
    description: "Campaign ideas and growth strategies",
    memberCount: 1205,
    postCount: 634,
  },
  {
    id: "dept-4",
    name: "Product",
    description: "Product roadmap and feature discussions",
    memberCount: 987,
    postCount: 521,
  },
];

export const mockGroups: Group[] = [
  { id: "g1", name: "Book Club", icon: "📚", members: 234, isJoined: true },
  {
    id: "g2",
    name: "Coffee Lovers",
    icon: "☕",
    members: 1203,
    isJoined: true,
  },
  { id: "g3", name: "Gaming", icon: "🎮", members: 892, isJoined: false },
  { id: "g4", name: "Fitness", icon: "💪", members: 567, isJoined: false },
  { id: "g5", name: "Music", icon: "🎵", members: 445, isJoined: false },
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    author: {
      id: "u1",
      name: "Sarah Chen",
      avatar: "/diverse-woman-avatar.png",
      badge: "Verified",
    },
    department: "Engineering",
    type: "text",
    title: "Best practices for React performance optimization",
    content:
      "Just finished implementing some performance improvements on our main app. Here are the key takeaways: 1) Memoization is your friend, 2) Watch out for unnecessary re-renders, 3) Code splitting can be a game changer. Happy to discuss more!",
    tags: ["React", "Performance", "Tips"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reactions: [
      { emoji: "👍", count: 42, userReacted: true },
      { emoji: "❤️", count: 18, userReacted: false },
      { emoji: "🔥", count: 12, userReacted: false },
    ],
    comments: 8,
    shares: 3,
    awards: 2,
  },
  {
    id: "post-2",
    author: {
      id: "u2",
      name: "Marcus Williams",
      avatar: "/man-avatar.png",
    },
    department: "Design",
    type: "image",
    content:
      "New UI system we are rolling out next quarter. Clean, minimal, and accessible 🎨",
    images: [
      {
        url: "/modern-ui-design-system-mockup.jpg",
        caption: "New design system components",
      },
    ],
    tags: ["Design", "UI", "NewRelease"],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    reactions: [
      { emoji: "👍", count: 156, userReacted: false },
      { emoji: "😍", count: 45, userReacted: true },
    ],
    comments: 23,
    shares: 12,
    awards: 5,
  },
  {
    id: "post-3",
    author: {
      id: "u3",
      name: "Emma Rodriguez",
      avatar: "/woman-avatar-with-smile.jpg",
    },
    department: "Marketing",
    type: "text",
    title: "Q4 Campaign Performance",
    content:
      "Excited to share that our Q4 campaign exceeded targets by 23%! 🎉 The collaborative approach really paid off. Thanks to everyone who contributed ideas and feedback.",
    tags: ["Marketing", "Campaign", "Success"],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    reactions: [
      { emoji: "🎉", count: 89, userReacted: true },
      { emoji: "👏", count: 67, userReacted: false },
    ],
    comments: 15,
    shares: 8,
    awards: 8,
  },
];

export const mockBirthdays = [
  { name: "Jamie Lee", date: "2024-11-01", avatar: "/diverse-avatars.png" },
  { name: "Taylor Smith", date: "2024-11-02", avatar: "/diverse-avatars.png" },
  { name: "Casey Brown", date: "2024-11-05", avatar: "/diverse-avatars.png" },
];

export const mockMessages = [
  {
    id: "m1",
    sender: "Alex Thompson",
    preview: "Hey, did you see the new docs?",
    unread: true,
  },
  {
    id: "m2",
    sender: "Jordan Miles",
    preview: "Sure, see you at 3!",
    unread: false,
  },
  {
    id: "m3",
    sender: "Casey Davis",
    preview: "I think we should consider...",
    unread: true,
  },
];

export const mockQuiz = {
  id: "quiz-1",
  question: "What is the capital of Japan?",
  options: ["Tokyo", "Osaka", "Kyoto", "Hiroshima"],
  correctAnswer: 0,
};

export const mockGame = {
  id: "game-1",
  type: "trivia",
  title: "Daily Tech Trivia",
  question: "Which company created the first web browser?",
  difficulty: "medium" as const,
};
