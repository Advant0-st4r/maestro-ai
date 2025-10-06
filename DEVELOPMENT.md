# Development Guide - Meeting Maestro

This guide covers the development setup, architecture decisions, and contribution guidelines for the Meeting Maestro project.

## 🏗 Architecture Overview

### Frontend Architecture
- **Next.js 14** with App Router for modern React development
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for utility-first styling with custom design system
- **Radix UI + shadcn/ui** for accessible, customizable components
- **React Hook Form** for form management and validation
- **TanStack Query** for server state management

### Backend Architecture
- **Next.js API Routes** for serverless API endpoints
- **NextAuth v5** for authentication with Google OAuth
- **Supabase** for PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** for data protection
- **JWT-based sessions** for stateless authentication

### Analytics & Monitoring
- **PostHog** for user analytics and feature tracking
- **Clerk** (optional) for enhanced authentication features
- **Error boundaries** for graceful error handling
- **Custom middleware** for security and routing

## 🚀 Development Setup

### Prerequisites
```bash
# Node.js 18+ required
node --version

# Package manager (npm, yarn, or pnpm)
npm --version
```

### Environment Variables
Create `.env.local` with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Enhanced Features
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Database Setup

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize project
   supabase init
   
   # Link to your project
   supabase link --project-ref your-project-ref
   ```

2. **Run Migrations**
   ```bash
   # Apply database schema
   supabase db push
   
   # Or run locally
   supabase start
   supabase db reset
   ```

3. **Verify Schema**
   ```bash
   # Check tables
   supabase db diff
   ```

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📁 Project Structure

```
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── upload/               # File upload endpoint
│   │   ├── profile/              # Company profile endpoint
│   │   ├── get-actions/          # Fetch meeting actions
│   │   └── verify/               # Verify and deliver actions
│   ├── dashboard/                # Analytics dashboard
│   ├── verify/[meetingId]/       # Action verification page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   ├── providers.tsx             # Context providers
│   └── globals.css               # Global styles
├── src/
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── Header.tsx            # Navigation header
│   │   ├── HomePage.tsx          # Main landing page
│   │   ├── UploadForm.tsx        # File upload form
│   │   ├── ProfileForm.tsx       # Company profile form
│   │   ├── VerifyPage.tsx        # Action verification
│   │   ├── DashboardPage.tsx     # Analytics dashboard
│   │   ├── RecentMeetings.tsx    # Meeting history
│   │   ├── ErrorBoundary.tsx     # Error handling
│   │   ├── LoadingSpinner.tsx    # Loading states
│   │   └── PostHogProvider.tsx   # Analytics provider
│   ├── lib/                      # Utility functions
│   │   ├── utils.ts              # General utilities
│   │   ├── api-client.ts         # API client with error handling
│   │   ├── clerk.ts              # Clerk integration
│   │   └── posthog.ts            # Analytics tracking
│   └── integrations/
│       └── supabase/             # Database client & types
├── supabase/
│   └── migrations/               # Database schema
├── middleware.ts                 # Next.js middleware
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary: #0070f3;           /* Blue buttons, links */
--primary-hover: #0369a1;     /* Hover states */
--primary-foreground: #ffffff; /* White text on blue */

/* Semantic Colors */
--success: #10b981;           /* Green success states */
--destructive: #ef4444;       /* Red error states */
--warning: #f59e0b;           /* Yellow warnings */

/* Neutral Colors */
--background: #ffffff;         /* White background */
--foreground: #000000;         /* Black headlines */
--muted: #f3f4f6;             /* Light gray backgrounds */
--muted-foreground: #6b7280;  /* Gray body text */
```

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: text-4xl → text-3xl → text-xl → text-lg → text-base → text-sm
- **Weights**: font-bold (headlines), font-medium (subheadings), font-normal (body)

### Component Patterns
- **Cards**: `shadow-md` with `rounded-lg` borders
- **Buttons**: Primary blue with hover effects
- **Forms**: Clean inputs with validation states
- **Tables**: Alternating row colors with hover states
- **Loading**: Consistent spinner and skeleton patterns

## 🔧 API Design

### RESTful Endpoints

#### Authentication
```typescript
GET/POST /api/auth/[...nextauth]  // NextAuth handlers
```

#### Meeting Management
```typescript
POST /api/upload                   // Upload meeting file
GET  /api/get-actions?meetingId   // Fetch meeting actions
POST /api/verify                  // Verify and deliver actions
```

#### Profile Management
```typescript
POST /api/profile                 // Upload company profile
```

### Request/Response Patterns

#### Success Response
```typescript
{
  success: true,
  data: T,
  message?: string
}
```

#### Error Response
```typescript
{
  success: false,
  error: string,
  details?: any
}
```

### Error Handling
- **HTTP Status Codes**: Proper status codes for different error types
- **Validation**: Input validation with clear error messages
- **Rate Limiting**: Protection against abuse
- **CORS**: Proper cross-origin headers

## 🗄 Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT,
  industry TEXT,
  current_goals JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Meetings
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT,
  duration_minutes INTEGER,
  participants INTEGER,
  context TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Actions
```sql
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  owner TEXT,
  due_date DATE,
  confidence DECIMAL(3,2),
  priority TEXT,
  effort_hours DECIMAL(4,2),
  revenue_impact INTEGER,
  timestamp TEXT,
  transcript_snippet TEXT,
  suggestions JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example policy for meetings
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);
```

## 🔒 Security Considerations

### Authentication
- **NextAuth v5** with Google OAuth
- **JWT tokens** for stateless authentication
- **Session management** with secure cookies
- **CSRF protection** built into NextAuth

### Data Protection
- **Row Level Security (RLS)** on all database tables
- **Input validation** on all API endpoints
- **File type validation** for uploads
- **Size limits** (100MB max file size)
- **Environment variable protection**

### Security Headers
```typescript
// middleware.ts
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
```

## 📊 Analytics Integration

### PostHog Setup
```typescript
// Track custom events
import { trackEvent } from '@/lib/posthog'

trackEvent('meeting_uploaded', {
  meeting_id: 'abc-123',
  file_size: 42 * 1024 * 1024,
  duration_minutes: 45
})
```

### Event Tracking
- **User Actions**: Login, logout, file uploads
- **Feature Usage**: Dashboard views, action verification
- **Performance**: Page load times, API response times
- **Errors**: Error boundary triggers, API failures

## 🧪 Testing Strategy

### Unit Tests
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Integration Tests
- **API endpoints** with mock data
- **Database operations** with test database
- **Authentication flows** with test users

### E2E Tests
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables for Production
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

### Database Migration
```bash
# Apply migrations to production
supabase db push --linked
```

## 🤝 Contributing

### Code Style
- **ESLint** configuration for consistent code style
- **Prettier** for code formatting
- **TypeScript** strict mode enabled
- **Conventional commits** for commit messages

### Git Workflow
1. Create feature branch from `main`
2. Make changes with proper commits
3. Create pull request with description
4. Code review and approval
5. Merge to `main`

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
```

## 📚 Additional Resources

### Documentation
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [NextAuth v5 Documentation](https://authjs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

### Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [PostHog Documentation](https://posthog.com/docs)

### Design Resources
- [Figma Design System](https://figma.com) (if available)
- [Tailwind UI Components](https://tailwindui.com/)
- [Heroicons](https://heroicons.com/)
- [Lucide Icons](https://lucide.dev/)
