# Meeting Maestro - AI-Powered Meeting Triage Tool

A comprehensive Next.js 14 application that transforms meetings into actionable insights with AI-powered triage and smart optimization for SMEs.

## 🚀 Features

### Core Functionality
- **AI Meeting Analysis**: Upload audio/video files and get intelligent action item extraction
- **Smart Prioritization**: Revenue-critical, strategic, and operational action classification
- **Role-Tailored Delivery**: Personalized emails and calendar events based on team roles
- **Company Profile Integration**: Context-aware suggestions using company data
- **Real-time Dashboard**: Track productivity, revenue impact, and team performance

### Enhanced Features
- **Risk Detection**: Automatic identification of churn risks and workload warnings
- **Batch Optimization**: AI suggestions for grouping related tasks
- **Quick Wins**: Identification of tasks that can be completed quickly
- **Delegation Suggestions**: Smart recommendations for task redistribution
- **Analytics Dashboard**: Comprehensive metrics for leadership and individual views

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS v3 with custom color palette
- **Authentication**: NextAuth v5 with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **Analytics**: PostHog integration
- **Enhanced Auth**: Clerk integration (optional)
- **UI Components**: Radix UI + shadcn/ui

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials
- PostHog account (optional)
- Clerk account (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd meeting-maestro
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Clerk (for enhanced auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Optional: PostHog (for analytics)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth configuration
│   │   ├── upload/              # File upload endpoint
│   │   ├── profile/             # Company profile endpoint
│   │   ├── get-actions/         # Fetch meeting actions
│   │   └── verify/              # Verify and deliver actions
│   ├── dashboard/               # Analytics dashboard
│   ├── verify/[meetingId]/      # Action verification page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── HomePage.tsx         # Main landing page
│   │   ├── UploadForm.tsx       # File upload form
│   │   ├── ProfileForm.tsx      # Company profile form
│   │   ├── VerifyPage.tsx       # Action verification
│   │   ├── DashboardPage.tsx    # Analytics dashboard
│   │   └── RecentMeetings.tsx   # Meeting history
│   ├── integrations/
│   │   └── supabase/            # Database client & types
│   └── lib/                     # Utility functions
├── supabase/
│   └── migrations/              # Database schema
└── public/                      # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#0070f3` (buttons, links)
- **Primary Hover**: `#0369a1`
- **Background**: `#ffffff` (white)
- **Text**: `#000000` (headlines), `#6b7280` (body)
- **Success**: `#10b981` (green)
- **Error**: `#ef4444` (red)
- **Light Gray**: `#f3f4f6` (tables, inputs)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, high contrast
- **Body**: Clean, readable gray

## 🔧 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### Meeting Management
- `POST /api/upload` - Upload meeting files
- `GET /api/get-actions?meetingId=uuid` - Fetch meeting actions
- `POST /api/verify` - Verify and deliver actions

### Profile Management
- `POST /api/profile` - Upload company profile

## 📊 Database Schema

### Core Tables
- **users** - User profiles and authentication
- **companies** - Company information and goals
- **meetings** - Meeting metadata and files
- **actions** - Extracted action items with priorities
- **risks** - Identified risks and warnings
- **suggestions** - AI optimization recommendations
- **analytics** - Dashboard metrics and KPIs

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **JWT-based authentication** with NextAuth
- **File type validation** for uploads
- **Size limits** (100MB max file size)
- **Environment variable protection**

## 📈 Analytics Integration

### PostHog Setup (Optional)

1. Create PostHog account
2. Get your project API key
3. Add to environment variables
4. Analytics will automatically track:
   - User engagement
   - Feature usage
   - Performance metrics
   - Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔮 Roadmap

### Phase 2 Features
- **CRM Integration**: HubSpot, Salesforce, Pipedrive
- **Project Management**: Asana, Monday, ClickUp
- **Advanced Analytics**: Custom dashboards
- **Mobile App**: React Native companion
- **AI Enhancements**: GPT-4 integration for better analysis

### Phase 3 Features
- **Multi-language Support**
- **Advanced Security**: SOC 2 compliance
- **Enterprise Features**: SSO, advanced permissions
- **API Access**: Public API for integrations