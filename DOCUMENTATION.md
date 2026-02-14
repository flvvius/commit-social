# Commit - Social Media Application Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Core Features & Business Logic](#core-features--business-logic)
6. [User Flow Diagrams](#user-flow-diagrams)
7. [API Documentation](#api-documentation)
8. [Setup & Development](#setup--development)

---

## 🎯 Project Overview

**Commit** is an internal social media platform designed for company-wide engagement, knowledge sharing, and team collaboration. The platform combines traditional social media features (posts, comments, reactions) with enterprise-specific functionality like Q&A systems, daily quizzes, gamification through badges and streaks, and team-based interactions.

### Key Objectives

- Foster internal communication and knowledge sharing
- Gamify employee engagement through badges, streaks, and points
- Provide a Q&A platform with AI-powered answers
- Enable social interactions (posts, comments, reactions, messaging)
- Build community through departments and interest-based groups
- Encourage daily engagement through quizzes and streaks

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16.0.0 (React 19.2.0)
- **Language**: TypeScript 5
- **Styling**:
  - TailwindCSS 4.1.10 with custom OKLCH color system
  - Radix UI Themes 3.2.1 for component library
- **UI Components**:
  - shadcn/ui (Radix-based components)
  - Lucide React (icons)
  - FilePond (file uploads)
  - Sonner (toast notifications)
- **State Management**: Convex React hooks (real-time reactive queries)
- **Authentication**: Clerk (Next.js integration)
- **Form Handling**: Tanstack React Form 1.12.3
- **Search**: Fuse.js 7.1.0 (fuzzy search)

### Backend

- **Platform**: Convex (Backend-as-a-Service)
  - Real-time reactive database
  - Type-safe queries and mutations
  - Built-in authentication
  - File storage
  - Scheduled functions
- **AI Integration**: OpenAI API (for knowledge base Q&A)
- **Language**: TypeScript 5

### Monorepo Management

- **Build System**: Turborepo 2.5.4
- **Package Manager**: npm 11.6.0
- **Workspace Structure**:
  - `apps/web` - Next.js frontend application
  - `packages/backend` - Convex backend functions and schema

### Authentication & Authorization

- **Provider**: Clerk
- **Method**: JWT tokens with Convex integration
- **Features**: Social login, user management, session handling

---

## 🏗 Architecture

### Application Structure

```
commit-social/
├── apps/
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── page.tsx          # Home/Landing (→ Feed when authenticated)
│       │   │   ├── feed/             # Main feed with posts
│       │   │   ├── profile/          # User profiles (own & others)
│       │   │   ├── groups/           # Interest groups
│       │   │   ├── messages/         # Direct messaging
│       │   │   ├── questions/        # Q&A system
│       │   │   ├── dashboard/        # User dashboard
│       │   │   ├── admin/            # Admin panel (KB management)
│       │   │   └── layout.tsx        # 3-column layout (left/center/right)
│       │   ├── components/
│       │   │   ├── feed/             # Post creation, display, comments
│       │   │   ├── games/            # Daily quiz component
│       │   │   ├── groups/           # Group management
│       │   │   ├── messages/         # Chat interface
│       │   │   └── ui/               # Reusable UI components
│       │   └── lib/
│       │       ├── badges.ts         # Badge system configuration
│       │       └── utils.ts          # Utility functions
│       └── public/
│           └── badges/               # Badge images
└── packages/
    └── backend/                      # Convex Backend
        └── convex/
            ├── schema.ts             # Database schema definition
            ├── posts.ts              # Post CRUD operations
            ├── users.ts              # User management
            ├── groups.ts             # Group operations
            ├── messages.ts           # Messaging system
            ├── questions.ts          # Q&A questions
            ├── answers.ts            # Q&A answers
            ├── reactions.ts          # Emoji reactions
            ├── comments.ts           # Comment system
            ├── quizzes.ts            # Daily quiz logic
            ├── streaks.ts            # Streak tracking
            ├── notifications.ts      # Notification system
            ├── ai.ts                 # AI-powered Q&A
            ├── kb.ts                 # Knowledge base
            └── auth.config.ts        # Clerk integration
```

### Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│   Next.js   │ ◄─────► │    Convex    │ ◄─────► │   Clerk     │
│   Client    │  React  │   Backend    │   JWT   │    Auth     │
│             │  Hooks  │              │  Tokens │             │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│             │         │              │
│  Real-time  │         │   OpenAI     │
│  Updates    │         │     API      │
│             │         │              │
└─────────────┘         └──────────────┘
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │ Departments  │       │    Groups    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ _id          │       │ _id          │       │ _id          │
│ clerkId      │       │ name         │       │ name         │
│ name         │       │ slug         │       │ slug         │
│ email        │◄──┐   │ emoji        │       │ emoji        │
│ avatarUrl    │   │   │ description  │       │ description  │
│ departmentId │───┘   │ members[]    │       │ members[]    │
│ interests[]  │───────┐└──────────────┘       │ iconUrl      │
│ badges[]     │       └────────────────────►  │ createdAt    │
│ points       │                               └──────────────┘
│ streak       │
│ bio          │       ┌──────────────┐
│ birthday     │       │    Posts     │
└──────────────┘       ├──────────────┤
       │               │ _id          │
       │               │ authorId     │───┐
       │               │ content      │   │
       │               │ type         │   │
       │               │ mediaUrls[]  │   │
       │               │ media[]      │   │
       │               │ isShowcase   │   │
       │               │ departmentId │   │
       │               │ groupId      │   │
       │               │ createdAt    │   │
       │               └──────────────┘   │
       │                      │            │
       │                      ▼            │
       │               ┌──────────────┐   │
       │               │  Comments    │   │
       │               ├──────────────┤   │
       │               │ _id          │   │
       │               │ postId       │   │
       └──────────────►│ authorId     │   │
                       │ content      │   │
                       │ parentId     │   │
                       │ createdAt    │   │
                       └──────────────┘   │
                              │            │
                              ▼            │
                       ┌──────────────┐   │
                       │  Reactions   │   │
                       ├──────────────┤   │
                       │ _id          │   │
                       │ postId       │   │
                       │ commentId    │   │
                       │ answerId     │   │
                       │ userId       │◄──┘
                       │ emojiName    │
                       │ createdAt    │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Questions   │       │   Answers    │       │  Quizzes     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ _id          │       │ _id          │       │ _id          │
│ authorId     │       │ questionId   │───┐   │ question     │
│ title        │◄──────│ authorId     │   │   │ answers[]    │
│ body         │       │ content      │   │   │ correctAnswer│
│ tags[]       │       │ createdAt    │   │   │ date         │
│ acceptedId   │───────┘              │   │   └──────────────┘
│ createdAt    │                       │   │
└──────────────┘                       │   │   ┌──────────────┐
                                       │   │   │   Streaks    │
                                       │   │   ├──────────────┤
                                       │   └──►│ userId       │
                                       │       │ currentStreak│
                                       │       │ lastAnswered │
                                       │       └──────────────┘
                                       │
┌──────────────┐       ┌──────────────┐
│Conversations │       │   Messages   │
├──────────────┤       ├──────────────┤
│ _id          │       │ _id          │
│ type         │◄──────│ conversationId
│ participants │       │ senderId     │
│ lastMessageAt│       │ content      │
└──────────────┘       │ mediaUrls[]  │
       │               │ readBy[]     │
       │               │ createdAt    │
       │               └──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│ConversationM.│       │Notifications │
├──────────────┤       ├──────────────┤
│ _id          │       │ _id          │
│ conversationId       │ userId       │
│ userId       │       │ type         │
│ lastReadAt   │       │ message      │
│ unreadCount  │       │ read         │
└──────────────┘       │ createdAt    │
                       └──────────────┘

┌──────────────┐
│    kbDocs    │
├──────────────┤
│ _id          │
│ title        │
│ content      │
│ tags[]       │
│ authorId     │
│ createdAt    │
└──────────────┘
```

### Schema Details

#### **users**

Core user profile table with authentication, profile data, gamification metrics, and department/group associations.

```typescript
{
  clerkId: string (optional)        // Clerk authentication ID
  name: string                      // Display name
  email: string                     // Unique email (indexed)
  avatarUrl?: string                // Profile picture URL
  bannerUrl?: string                // Profile banner image
  birthday?: string                 // Format: YYYY-MM-DD
  position?: string                 // Job title
  departmentId?: Id<"departments">  // Associated department
  bio?: string                      // User biography
  isShowcase?: boolean              // Featured user flag
  points?: number                   // Gamification points
  streak?: number                   // Current quiz streak
  socialLinks?: Array<{             // External social profiles
    platform: string
    url: string
  }>
  badges?: string[]                 // Badge filenames
  interests?: Id<"groups">[]        // Joined groups
  lastActive?: number               // Timestamp
}
```

**Indexes**: `by_email`, `by_clerkId`

#### **posts**

Main content entity supporting text, images, and showcase achievements.

```typescript
{
  authorId: Id<"users">
  departmentId?: Id<"departments">
  groupId?: Id<"groups">
  type: string                      // "text" | "image" | "collab"
  content: string                   // Post text content
  isShowcase?: boolean              // Highlighted achievement post
  mediaUrls?: string[]              // Legacy media URLs
  media?: Array<{                   // Media with captions
    url: string
    caption?: string
  }>
  tags?: Id<"tags">[]
  collabId?: Id<"collaborations">
  createdAt: number
  updatedAt?: number
}
```

**Indexes**: `by_author`, `by_department`, `by_group`

#### **groups** & **departments**

Groups are interest-based communities, departments are organizational units.

```typescript
// groups & departments share similar structure
{
  name: string
  slug: string                      // URL-friendly identifier
  emoji?: string                    // Display icon
  description?: string
  members?: Id<"users">[]           // Member list
  iconUrl?: string                  // (groups only)
  createdAt: number
}
```

**Indexes**: `by_name`, `by_slug`

#### **comments**

Nested comments supporting posts and answers.

```typescript
{
  postId?: Id<"posts">
  answerId?: Id<"answers">
  authorId: Id<"users">
  content: string
  parentCommentId?: Id<"comments">  // For nested replies
  createdAt: number
}
```

**Indexes**: `by_post`, `by_answer`, `by_parent`

#### **reactions**

Emoji reactions for posts, comments, and answers.

```typescript
{
  postId?: Id<"posts">
  answerId?: Id<"answers">
  commentId?: Id<"comments">
  userId: Id<"users">
  type: string                      // "emoji" | "poza"
  emojiName?: string                // e.g., "fire", "heart"
  pozaURL?: string                  // Custom image reaction
  createdAt: number
}
```

**Indexes**: `by_post`, `by_answer`, `by_comment`

#### **questions** & **answers**

Q&A system with point rewards.

```typescript
// questions
{
  authorId: Id<"users">
  title: string
  body: string
  tags?: string[]
  acceptedAnswerId?: Id<"answers">  // Marked solution
  createdAt: number
  updatedAt?: number
}

// answers
{
  questionId: Id<"questions">
  authorId: Id<"users">
  content: string
  createdAt: number
  updatedAt?: number
}
```

**Business Rule**: Users cannot answer their own questions. Approved answers earn 15 points, reactions earn 1 point.

#### **quizzes** & **streaks**

Daily trivia game with streak tracking.

```typescript
// quizzes
{
  question: string
  answers: string[]                 // Array of choices
  correctAnswer: number             // Index of correct answer
  date: string                      // YYYY-MM-DD (indexed)
}

// streaks
{
  userId: Id<"users">
  currentStreak: number
  lastAnsweredDate: string          // YYYY-MM-DD
}
```

**Business Rule**: One answer per day. Correct answers increment streak, wrong answers reset it.

#### **conversations**, **messages**, **conversationMembers**

Private messaging system.

```typescript
// conversations
{
  type: string                      // "direct" | "group"
  participants: Id<"users">[]
  lastMessageAt?: number
  createdAt: number
}

// messages
{
  conversationId: Id<"conversations">
  senderId: Id<"users">
  content: string
  mediaUrls?: string[]
  readBy: Id<"users">[]             // Read receipts
  createdAt: number
}

// conversationMembers
{
  conversationId: Id<"conversations">
  userId: Id<"users">
  lastReadAt?: number
  unreadCount: number               // Cached counter
}
```

#### **notifications**

System notifications including "cigarette call" feature.

```typescript
{
  userId: Id<"users">;
  type: string; // "comment", "reaction", "cigarette_call"
  message: string;
  createdAt: number;
  read: boolean;
}
```

#### **kbDocs**

Knowledge base documents for AI-powered answers.

```typescript
{
  title: string
  content: string
  tags?: string[]
  authorId?: Id<"users">
  createdAt: number
  updatedAt?: number
}
```

---

## 🎮 Core Features & Business Logic

### 1. Authentication & User Management

**Technology**: Clerk + Convex integration

**Flow**:

1. User signs in via Clerk (social/email)
2. JWT token passed to Convex
3. `users.syncUser` mutation creates/updates user record
4. User profile linked by `clerkId` and `email`

**Key Functions**:

- `users.syncUser()` - Auto-sync from Clerk on login
- `users.getCurrentUser()` - Get authenticated user
- `users.updateProfile()` - Edit bio, banner, social links, birthday

### 2. Posts & Feed System

**Post Types**:

- **Text**: Standard text posts
- **Image**: Posts with media gallery (carousel support)
- **Showcase**: Highlighted achievement posts (special styling)
- **Collab**: Collaborative posts (future feature)

**Features**:

- Multi-image uploads with captions
- Department/group tagging
- Real-time updates via Convex
- Carousel navigation for multiple images
- Copy link to post

**Badge Triggers**:

- "Active Contributor" badge awarded after 3 posts

**Key Functions**:

- `posts.create()` - Create new post with media
- `posts.listRecent()` - Fetch feed with filters
- `posts.listByGroup()` - Filter by group
- `posts.get()` - Get single post with reactions

### 3. Comments System

**Features**:

- Nested comments (parent-child relationships)
- Real-time updates
- Supports comments on posts and answers
- Author information embedded

**Key Functions**:

- `comments.create()` - Add comment
- `comments.queries.listForPost()` - Get post comments with nesting
- `comments.queries.listForAnswer()` - Get answer comments

### 4. Reactions (Emoji)

**Supported Emojis**: 🔥 (fire), ❤️ (heart), 🎉 (tada), 😂 (joy)

**Features**:

- Toggle behavior (click again to remove)
- Real-time reaction counts
- Point rewards for answer reactions (+1 point per reaction)

**Key Functions**:

- `reactions.add()` - Toggle reaction on post/comment/answer

### 5. Groups & Departments

**Groups**: Interest-based communities users can join
**Departments**: Organizational units (e.g., Engineering, Marketing)

**Features**:

- Join/leave groups
- Post filtering by group/department
- Member lists with user details
- Custom emojis and icons
- Slug-based URLs

**Special Group**: "Smokers Lounge" - triggers "Smoke Break Crew" badge

**Key Functions**:

- `groups.list()` - List all groups with join status
- `groups.join()` - Join a group
- `groups.leave()` - Leave a group
- `groups.getMembers()` - Get member list

### 6. Q&A System

**Workflow**:

1. User asks question with title, body, tags
2. Other users submit answers (cannot answer own question)
3. Question author approves best answer
4. Answer author receives 15 points
5. Reactions on answers add 1 point each

**AI Integration**:

- Knowledge base documents indexed
- Simple tokenization-based search
- OpenAI API generates answers from KB context
- Max 3 relevant KB docs used per answer

**Key Functions**:

- `questions.create()` - Post new question
- `questions.list()` - Browse questions with answer counts
- `questions.get()` - Get question with ranked answers
- `answers.create()` - Submit answer
- `answers.approve()` - Mark answer as accepted (question author only)
- `ai.answerQuestion()` - Generate AI answer from KB

### 7. Daily Quiz & Streaks

**Mechanics**:

- One quiz per day (indexed by date YYYY-MM-DD)
- One attempt per user per day
- Correct answer: increment streak
- Wrong answer: reset streak to 0
- Quiz data: question + 4 answers + correct index

**Badge Triggers**:

- "Streak Hero" badge for streak > 5
- "Daily Game" badge for first quiz completion

**Key Functions**:

- `quizzes.getToday()` - Fetch today's quiz + answered status
- `quizzes.answerToday()` - Submit answer and update streak
- `streaks.getCurrent()` - Get user's current streak

### 8. Gamification: Badges & Points

**Badge System**:

- Badges stored as filenames in `users.badges[]`
- Images in `/public/badges/`
- Displayed on user profiles

**Available Badges**:

1. **Active Contributor** - Post 3+ times
2. **Streak Hero** - Achieve 5+ day quiz streak
3. **Smoke Break Crew** - Join "Smokers Lounge" group
4. **Daily Game** - Play quiz at least once
5. **Quiz Master** - Excellence in daily quizzes

**Points System**:

- Approved answer: +15 points
- Reaction on answer: +1 point
- Points displayed on profile
- Leaderboard potential (not yet implemented)

### 9. Messaging System

**Features**:

- Direct 1-on-1 conversations
- Group conversations (multi-user)
- Read receipts (`readBy` array)
- Unread count caching per user
- Media attachments support
- Real-time message delivery

**Key Functions**:

- `messages.sendMessage()` - Send message
- `messages.getOrCreateDirectConversation()` - Start chat
- `messages.listConversations()` - Get user's chat list
- `messages.getMessages()` - Fetch conversation messages
- `messages.markAsRead()` - Update read status

### 10. Notifications

**Types**:

- `comment` - New comment on your post
- `reaction` - Someone reacted to your content
- `cigarette_call` - Group smoke break notification
- `mention` - (future)
- `badge_earned` - (future)

**Special Feature: Cigarette Call**

- Send notification to all group members
- Creates direct message conversations
- Sends "Come to smoke" message to each member
- Excludes sender from notifications

**Key Functions**:

- `notifications.sendCigaretteCall()` - Notify group
- `notifications.listForCurrentUser()` - Get user notifications
- `notifications.markAllRead()` - Clear notifications

### 11. Search & Discovery

**Frontend Search** (Fuse.js):

- Fuzzy search across posts, users, groups
- Real-time filtering as user types
- 300ms debounce on search input
- URL-based search params (`?q=...`)

**Backend Search** (Convex):

- Simple pattern matching for KB docs
- Tag-based filtering for questions
- Member filtering for groups

### 12. Profile Management

**Features**:

- Custom bio (text area)
- Profile banner image
- Social media links (up to 6 platforms)
- Badge showcase
- Birthday display (YYYY-MM-DD)
- Personal post history
- Current streak display
- Edit dialog with form validation

**Social Platforms Supported**:
GitHub, LinkedIn, Twitter/X, Facebook, Instagram, YouTube, TikTok, Behance, Dribbble, Medium, Dev.to, Stack Overflow, Website, Other

### 13. Admin Features

**Knowledge Base Management** (`/admin/kb`):

- Create KB documents
- List all documents
- Delete documents
- Tag-based organization
- Used by AI for Q&A grounding

---

## 📊 User Flow Diagrams

### Authentication Flow

```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│   Clerk     │      │   Already   │
│  Sign In    │─────►│Authenticated│
└──────┬──────┘      └──────┬──────┘
       │                    │
       ▼                    │
┌─────────────┐            │
│ JWT Token   │            │
│  to Convex  │            │
└──────┬──────┘            │
       │                    │
       ▼                    │
┌─────────────┐            │
│users.syncUser            │
│  Mutation   │            │
└──────┬──────┘            │
       │                    │
       └────────┬───────────┘
                ▼
       ┌─────────────┐
       │Onboarding   │
       │  Dialog     │
       │(First Login)│
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │   Feed      │
       │    Page     │
       └─────────────┘
```

### Post Creation & Engagement Flow

```
┌─────────────┐
│ Create Post │
│   Dialog    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│Upload Images│      │  Select     │
│(FilePond)   │──────┤Group/Dept   │
└─────────────┘      └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │posts.create │
                     │  Mutation   │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Badge Check  │
                     │(3+ posts?)  │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Real-time    │
                     │Feed Update  │
                     └──────┬──────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐     ┌─────────────┐
│Add Reaction │      │Add Comment  │     │  Share Link │
│  (Toggle)   │      │(Nested OK)  │     │(Copy URL)   │
└─────────────┘      └─────────────┘     └─────────────┘
```

### Q&A Flow

```
┌─────────────┐
│Ask Question │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│questions.   │
│  create     │
└──────┬──────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│Manual Answer│        │  AI Answer  │
│(Other Users)│        │(KB + OpenAI)│
└──────┬──────┘        └──────┬──────┘
       │                      │
       │                      │
       └──────────┬───────────┘
                  ▼
           ┌─────────────┐
           │Display All  │
           │  Answers    │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │React to     │
           │Answers      │
           │(+1 point)   │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │Author       │
           │Approves Best│
           │(+15 points) │
           └─────────────┘
```

### Daily Quiz Flow

```
┌─────────────┐
│Check Today's│
│   Quiz      │
│(by UTC date)│
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│Already      │      │ Quiz        │
│Answered?    │─No──►│ Available   │
└──────┬──────┘      └──────┬──────┘
       │Yes                 │
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│Show Disabled│      │Select Answer│
│  State      │      │   Button    │
└─────────────┘      └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Submit Answer│
                     │ (one shot)  │
                     └──────┬──────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
         ┌─────────────┐         ┌─────────────┐
         │  Correct!   │         │   Wrong!    │
         │Streak += 1  │         │Streak = 0   │
         └──────┬──────┘         └──────┬──────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                     ┌─────────────┐
                     │Check Streak │
                     │  > 5?       │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Award "Streak│
                     │ Hero" Badge │
                     └─────────────┘
```

### Group Join & Cigarette Call Flow

```
┌─────────────┐
│Browse Groups│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Join "Smokers│
│  Lounge"    │
└──────┬──────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│Award "Smoke │    │See Group    │
│Break" Badge │    │   Posts     │
└─────────────┘    └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │"Cigarette   │
                   │  Call"      │
                   │ Notification│
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │For Each     │
                   │Member:      │
                   └──────┬──────┘
                          │
                ┌─────────┼─────────┐
                ▼                   ▼
         ┌─────────────┐     ┌─────────────┐
         │Create/Find  │     │   Send      │
         │Direct Chat  │────►│"Come to     │
         │             │     │  smoke"     │
         └─────────────┘     └──────┬──────┘
                                    │
                                    ▼
                             ┌─────────────┐
                             │Notification │
                             │  + Message  │
                             └─────────────┘
```

### Messaging Flow

```
┌─────────────┐
│Click Message│
│  Button     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Select User  │
│  or Group   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│Get/Create   │────►│Load Message │
│Conversation │     │  History    │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │Type Message │
                    │+ Attach     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │messages.    │
                    │sendMessage  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │Update       │
                    │Unread Count │
                    │for Recipient│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │Real-time    │
                    │Delivery     │
                    └─────────────┘
```

---

## 📡 API Documentation

### Posts API

#### `posts.create(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  content: string
  type?: "text" | "image" | "collab"
  mediaUrls?: string[]
  imageIds?: Id<"_storage">[]
  images?: Array<{ id: Id<"_storage">, caption?: string }>
  departmentId?: Id<"departments">
  groupId?: Id<"groups">
  isShowcase?: boolean
}
```

**Returns**: `Id<"posts">`  
**Side Effects**:

- Creates user if doesn't exist
- Awards "Active Contributor" badge after 3 posts
- Resolves storage IDs to public URLs

#### `posts.listRecent(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  limit?: number  // default 50, max 200
}
```

**Returns**:

```typescript
Array<{
  _id: Id<"posts">;
  content: string;
  createdAt: number;
  author: { _id; name; avatarUrl; position };
  department?: { _id; name; emoji };
  group?: { _id; name; emoji };
  mediaUrls?: string[];
  reactionCounts?: Record<string, number>;
  isShowcase?: boolean;
}>;
```

#### `posts.get(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  id: Id<"posts">;
}
```

**Returns**: Post with enriched author, department, group, reactions

#### `posts.listByGroup(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  groupId: Id<"groups">
  limit?: number
}
```

**Returns**: Array of posts filtered by group

---

### Users API

#### `users.syncUser()`

**Type**: Mutation  
**Auth**: Required  
**Args**: None  
**Returns**: `Id<"users">`  
**Purpose**: Create or update user from Clerk identity

#### `users.getCurrentUser()`

**Type**: Query  
**Auth**: Required  
**Args**: None  
**Returns**: Current user document or null

#### `users.updateProfile(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  bio?: string
  bannerUrl?: string
  socialLinks?: Array<{ platform: string, url: string }>
  badges?: string[]
  birthday?: string  // YYYY-MM-DD
}
```

**Returns**: `{ ok: true }`  
**Validation**:

- Max 6 social links
- Platform names max 24 chars
- Max 64 badges

#### `users.listUpcomingBirthdays(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  days?: number  // default 7
}
```

**Returns**: Array of users with birthdays in next N days

---

### Groups API

#### `groups.list(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  joined?: boolean  // filter by user's joined groups
}
```

**Returns**:

```typescript
Array<{
  _id: Id<"groups">;
  name: string;
  slug: string;
  emoji?: string;
  description?: string;
  memberCount: number;
  isJoined: boolean; // for current user
}>;
```

#### `groups.join(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  groupId: Id<"groups">;
}
```

**Side Effects**:

- Adds user to `groups.members[]`
- Adds group to `users.interests[]`
- Awards "Smoke Break Crew" badge if joining "Smokers Lounge"

#### `groups.leave(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  groupId: Id<"groups">;
}
```

---

### Questions & Answers API

#### `questions.create(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  title: string
  body: string
  tags?: string[]
}
```

**Returns**: Question document

#### `questions.get(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  id: Id<"questions">;
}
```

**Returns**:

```typescript
{
  _id: Id<"questions">;
  title: string;
  body: string;
  author: {
    (_id, name, avatarUrl);
  }
  isMine: boolean; // is current user the author
  answers: Array<{
    _id: Id<"answers">;
    content: string;
    author: { _id; name; avatarUrl };
    reactionCounts: Record<string, number>;
    totalReacts: number;
  }>; // sorted by reactions, accepted first
}
```

#### `answers.create(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  questionId: Id<"questions">;
  content: string;
}
```

**Returns**: Answer document  
**Validation**: Cannot answer own question

#### `answers.approve(args)`

**Type**: Mutation  
**Auth**: Required (must be question author)  
**Args**:

```typescript
{
  questionId: Id<"questions">;
  answerId: Id<"answers">;
}
```

**Returns**: `{ success: true }`  
**Side Effects**:

- Reverts points from previous accepted answer (-15)
- Awards +15 points to new answer author
- Updates `questions.acceptedAnswerId`

---

### Quizzes & Streaks API

#### `quizzes.getToday()`

**Type**: Query  
**Auth**: Optional  
**Args**: None  
**Returns**:

```typescript
{
  available: boolean
  date?: string
  question?: string
  answers?: string[]
  hasAnsweredToday?: boolean
}
```

#### `quizzes.answerToday(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  answerIndex: number;
}
```

**Returns**:

```typescript
{
  ok: boolean
  correct?: boolean
  currentStreak?: number
  reason?: "no_quiz" | "already_answered"
}
```

**Side Effects**:

- Updates streak (increment if correct, reset if wrong)
- Awards "Streak Hero" badge if streak > 5
- Awards "Daily Game" badge on first quiz

#### `streaks.getCurrent()`

**Type**: Query  
**Auth**: Required  
**Args**: None  
**Returns**: Streak document for current user

---

### Reactions API

#### `reactions.add(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  postId?: Id<"posts">
  answerId?: Id<"answers">
  commentId?: Id<"comments">
  emojiName: string  // "fire", "heart", "tada", "joy"
}
```

**Returns**:

```typescript
{
  success: true;
  toggled: "added" | "removed";
}
```

**Behavior**: Toggle - removes if already reacted, adds otherwise  
**Side Effects**: ±1 point to answer author if reacting to answer

---

### Comments API

#### `comments.create(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  postId?: Id<"posts">
  answerId?: Id<"answers">
  content: string
  parentCommentId?: Id<"comments">  // for nested replies
}
```

**Returns**: Comment document

#### `comments.queries.listForPost(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  postId: Id<"posts">
  limit?: number
}
```

**Returns**: Array of comments with author info and nesting

---

### Messages API

#### `messages.sendMessage(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  conversationId: Id<"conversations">
  content: string
  mediaUrls?: string[]
}
```

**Side Effects**:

- Adds message to conversation
- Updates `conversations.lastMessageAt`
- Increments `unreadCount` for recipients

#### `messages.getOrCreateDirectConversation(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  otherUserId: Id<"users">;
}
```

**Returns**: `Id<"conversations">`  
**Behavior**: Returns existing conversation or creates new one

#### `messages.listConversations()`

**Type**: Query  
**Auth**: Required  
**Returns**:

```typescript
Array<{
  _id: Id<"conversations">;
  type: "direct" | "group";
  participants: User[];
  lastMessage?: { content; createdAt };
  unreadCount: number;
}>;
```

#### `messages.getMessages(args)`

**Type**: Query  
**Auth**: Required  
**Args**:

```typescript
{
  conversationId: Id<"conversations">
  limit?: number
}
```

**Returns**: Array of messages with sender info

#### `messages.markAsRead(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  conversationId: Id<"conversations">;
}
```

**Side Effects**: Resets unread count to 0

---

### Notifications API

#### `notifications.sendCigaretteCall(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  groupName: string;
}
```

**Returns**:

```typescript
{
  delivered: number; // count of notified members
}
```

**Side Effects**:

- Creates notification for each group member
- Creates/finds direct conversation with each member
- Sends "Come to smoke" message
- Increments unread counts

#### `notifications.listForCurrentUser()`

**Type**: Query  
**Auth**: Required  
**Returns**: Array of notifications (max 50, recent first)

#### `notifications.markAllRead()`

**Type**: Mutation  
**Auth**: Required  
**Side Effects**: Sets `read: true` for all user notifications

---

### AI API

#### `ai.createDoc(args)`

**Type**: Mutation  
**Auth**: Required  
**Args**:

```typescript
{
  title: string
  content: string
  tags?: string[]
}
```

**Returns**: KB document

#### `ai.listDocs(args)`

**Type**: Query  
**Auth**: Optional  
**Args**:

```typescript
{
  limit?: number  // 1-200, default 100
}
```

**Returns**: Array of KB documents

#### `ai.answerQuestion(args)`

**Type**: Action (async)  
**Auth**: Optional  
**Args**:

```typescript
{
  questionId?: Id<"questions">
  text?: string
}
```

**Returns**: AI-generated answer string  
**Process**:

1. Fetch question text
2. Retrieve all KB documents
3. Score docs by keyword overlap
4. Select top 3 relevant docs
5. Send to OpenAI with context
6. Return answer (max ~150 words)

**Environment**: Requires `OPENAI_API_KEY`

---

## 🚀 Setup & Development

### Prerequisites

- Node.js 20+
- npm 11.6.0+
- Clerk account
- Convex account
- OpenAI API key (for AI features)

### Installation

1. **Clone repository**

   ```bash
   git clone <repo-url>
   cd commit-social
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Convex**

   ```bash
   npm run dev:setup
   ```

   This will:
   - Create new Convex project
   - Configure environment
   - Deploy backend schema

4. **Configure Clerk**
   - Create application at clerk.com
   - Get JWT Issuer Domain from "convex" JWT template
   - Add to Convex environment:
     ```bash
     npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-domain>
     ```

5. **Configure OpenAI (optional)**

   ```bash
   npx convex env set OPENAI_API_KEY sk-...
   ```

6. **Configure Clerk in Next.js**
   - Create `.env.local` in `apps/web/`:
     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
     CLERK_SECRET_KEY=sk_...
     NEXT_PUBLIC_CONVEX_URL=https://your-convex-url
     ```

7. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts:
   - Next.js app at `http://localhost:3001`
   - Convex backend (connected to cloud)

### Project Scripts

```bash
# Development
npm run dev              # Start all workspaces
npm run dev:web          # Start only Next.js app
npm run dev:server       # Start only Convex backend
npm run dev:setup        # Configure Convex project

# Build
npm run build            # Build all workspaces

# Type Checking
npm run check-types      # Run TypeScript checks
```

### Seeding Data

The application includes seed functionality (`seed.ts` and `<SeedButton />`):

- Creates sample departments
- Creates sample groups (including "Smokers Lounge")
- Creates sample users
- Creates sample posts
- Creates sample quizzes

**Usage**: Click "Seed Data" button in dev environment or call `seed.populateAll()` mutation.

### Database Migrations

Convex handles schema migrations automatically:

1. Update `schema.ts`
2. Deploy with `npx convex dev` or `npx convex deploy`
3. Schema evolves without manual migrations

### File Storage

Images/media handled via Convex Storage:

1. Upload file via Convex storage API
2. Get `Id<"_storage">`
3. Pass to mutations (e.g., `posts.create`)
4. Convex resolves to public URL

### Environment Variables

**Convex Backend** (set via `npx convex env set`):

- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer
- `OPENAI_API_KEY` - OpenAI API key (optional)

**Next.js Frontend** (`.env.local`):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`

### Deployment

**Frontend (Vercel)**:

1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy

**Backend (Convex)**:

```bash
npx convex deploy --prod
```

### Troubleshooting

**Issue**: "User not found" errors  
**Solution**: Ensure `users.syncUser()` is called on login (see `UserSync` component)

**Issue**: Images not loading  
**Solution**: Check storage URLs are resolved before passing to components

**Issue**: Quiz not appearing  
**Solution**: Ensure quiz exists for current UTC date in `quizzes` table

**Issue**: Clerk authentication fails  
**Solution**: Verify JWT issuer domain matches between Clerk and Convex

---

## 📁 Code Organization

### Frontend Structure

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with 3-column grid
│   ├── page.tsx           # Landing (redirects to /feed)
│   ├── feed/              # Main social feed
│   ├── profile/           # User profiles
│   │   ├── page.tsx       # Current user profile
│   │   └── [id]/page.tsx  # Other user profiles
│   ├── groups/
│   │   └── [id]/page.tsx  # Group detail page
│   ├── messages/          # Messaging interface
│   ├── questions/         # Q&A pages
│   │   └── [id]/page.tsx  # Question detail
│   ├── dashboard/         # User dashboard
│   └── admin/
│       └── kb/            # Knowledge base admin
├── components/
│   ├── navbar.tsx         # Top navigation
│   ├── left-sidebar.tsx   # Groups/navigation
│   ├── right-sidebar.tsx  # Daily quiz, birthdays
│   ├── user-sync.tsx      # Clerk → Convex sync
│   ├── onboarding-dialog.tsx
│   ├── feed/
│   │   ├── create-post.tsx
│   │   ├── post-card.tsx
│   │   ├── posts-list.tsx
│   │   └── comments-section.tsx
│   ├── games/
│   │   └── daily-quiz.tsx
│   ├── groups/
│   │   └── create-group-dialog.tsx
│   ├── messages/
│   │   ├── conversation-list.tsx
│   │   ├── chat-window.tsx
│   │   └── new-message-dialog.tsx
│   └── ui/               # Reusable components
├── lib/
│   ├── badges.ts         # Badge system
│   └── utils.ts          # Utilities
└── index.css             # Global styles + OKLCH tokens
```

### Backend Structure

```
packages/backend/convex/
├── schema.ts             # All table schemas
├── auth.config.ts        # Clerk integration
├── posts.ts              # Post mutations & queries
├── users.ts              # User management
├── groups.ts             # Groups & departments
├── messages.ts           # Messaging system
├── questions.ts          # Q&A questions
├── answers.ts            # Q&A answers
├── comments.ts           # Comment system
│   └── comments.queries.ts
├── reactions.ts          # Emoji reactions
├── quizzes.ts            # Daily quiz
├── streaks.ts            # Streak tracking
├── notifications.ts      # Notification system
├── ai.ts                 # AI Q&A with KB
├── kb.ts                 # Knowledge base
├── search.ts             # Search utilities
├── seed.ts               # Data seeding
├── usersHelper.ts        # User utilities
└── _generated/           # Convex auto-generated types
```

---

## 🎨 Styling System

### Color Tokens (OKLCH)

Defined in `apps/web/src/index.css`:

```css
:root {
  --brand-pink: oklch(0.73 0.18 350) --brand-purple: oklch(0.65 0.25 300)
    --brand-blue: oklch(0.68 0.22 250);
}

[data-theme="dark"] {
  --brand-pink: oklch(0.8 0.2 350) --brand-purple: oklch(0.75 0.28 300)
    --brand-blue: oklch(0.78 0.25 250);
}
```

### Utility Classes

- `bg-gradient-primary` - Purple → Pink → Blue gradient
- `text-gradient-primary` - Gradient text effect
- `gradient-border` - 1px gradient border
- `bg-app` - Background with subtle colorful blobs

### Component Styling

- Uses Radix UI Themes CSS variables
- TailwindCSS for utilities
- Custom animations via `tw-animate-css`

---

## 🔒 Security Considerations

1. **Authentication**: All mutations verify user via Clerk JWT
2. **Authorization**:
   - Question authors can approve answers
   - Users cannot answer own questions
   - Profile edits limited to current user
3. **Data Validation**:
   - Input sanitization in mutations
   - Length limits on text fields
   - Badge/link count limits
4. **Privacy**:
   - Email addresses not exposed to frontend
   - User identity resolved server-side
5. **Rate Limiting**: Convex provides built-in rate limiting

---

## 🔮 Future Enhancements

### Planned Features

- [ ] Leaderboard (points-based)
- [ ] Mention system (@username)
- [ ] Rich text editor for posts
- [ ] Post bookmarks/save
- [ ] Advanced search filters
- [ ] Notification preferences
- [ ] Group chat (multi-user conversations)
- [ ] File attachments in messages
- [ ] Video posts
- [ ] Live polls
- [ ] Event calendar
- [ ] Birthday reminders automation
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Technical Debt

- [ ] Optimize image loading (lazy loading, CDN)
- [ ] Add comprehensive error boundaries
- [ ] Implement pagination for large lists
- [ ] Add unit tests
- [ ] Add E2E tests (Playwright)
- [ ] Performance monitoring
- [ ] SEO optimization
- [ ] Accessibility audit

---

## 📞 Support & Contact

For questions or issues:

1. Check existing documentation
2. Review Convex logs for backend errors
3. Check browser console for frontend errors
4. Review Clerk dashboard for auth issues

---

## 📄 License

[Add your license here]

---

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org/)
- [Convex](https://convex.dev/)
- [Clerk](https://clerk.com/)
- [Radix UI](https://radix-ui.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Last Updated**: February 14, 2026  
**Version**: 1.0.0
