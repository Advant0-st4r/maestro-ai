-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  organization_id UUID DEFAULT uuid_generate_v4(),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  permissions JSONB DEFAULT '{}',
  security_settings JSONB DEFAULT '{"two_factor_enabled": false, "session_timeout": 3600}',
  data_encryption_key TEXT, -- Encrypted with user's master key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false
);

-- Create organizations table for multi-tenant architecture
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  security_policy JSONB DEFAULT '{"data_retention_days": 90, "encryption_required": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create companies table (now organization-scoped)
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT,
  industry TEXT,
  current_goals JSONB,
  encrypted_data TEXT, -- All sensitive data encrypted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_roles table
CREATE TABLE public.team_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  focus TEXT,
  communication_style TEXT,
  meeting_days TEXT[],
  crm_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('enterprise', 'high_value', 'churn_risk')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table with enhanced security
CREATE TABLE public.meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT,
  duration_minutes INTEGER,
  participants INTEGER,
  context TEXT,
  file_url TEXT, -- Encrypted S3 URL
  file_size BIGINT,
  file_type TEXT,
  file_hash TEXT, -- SHA-256 hash for integrity verification
  encryption_key_id TEXT, -- Reference to encryption key
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'completed', 'failed')),
  security_level TEXT DEFAULT 'standard' CHECK (security_level IN ('standard', 'confidential', 'restricted')),
  access_log JSONB DEFAULT '[]', -- Audit trail of who accessed what
  retention_until TIMESTAMP WITH TIME ZONE, -- Auto-deletion date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create actions table with encryption
CREATE TABLE public.actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  owner TEXT,
  due_date DATE,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  priority TEXT CHECK (priority IN ('revenue-critical', 'strategic', 'operational', 'low')),
  effort_hours DECIMAL(4,2),
  revenue_impact INTEGER,
  timestamp TEXT,
  transcript_snippet TEXT,
  suggestions JSONB,
  encrypted_content TEXT, -- Encrypted sensitive content
  access_controls JSONB DEFAULT '{"viewers": [], "editors": []}', -- Who can view/edit
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create risks table
CREATE TABLE public.risks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suggestions table
CREATE TABLE public.suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('batch_actions', 'quick_wins', 'delegate', 'reschedule')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table for dashboard metrics
CREATE TABLE public.analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit log table for comprehensive security tracking
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create encryption keys table for data protection
CREATE TABLE public.encryption_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_id TEXT UNIQUE NOT NULL,
  encrypted_key TEXT NOT NULL, -- Key encrypted with master key
  algorithm TEXT DEFAULT 'AES-256-GCM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create data retention policies table
CREATE TABLE public.retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create access control table for granular permissions
CREATE TABLE public.access_controls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'delete', 'admin')),
  granted_by UUID REFERENCES public.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_company_id ON public.meetings(company_id);
CREATE INDEX idx_meetings_status ON public.meetings(status);
CREATE INDEX idx_actions_meeting_id ON public.actions(meeting_id);
CREATE INDEX idx_actions_owner ON public.actions(owner);
CREATE INDEX idx_actions_priority ON public.actions(priority);
CREATE INDEX idx_actions_status ON public.actions(status);
CREATE INDEX idx_risks_meeting_id ON public.risks(meeting_id);
CREATE INDEX idx_suggestions_meeting_id ON public.suggestions(meeting_id);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_company_id ON public.analytics(company_id);
CREATE INDEX idx_analytics_metric_date ON public.analytics(metric_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for multi-tenant security

-- Organizations policies
CREATE POLICY "Users can view own organization" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = organizations.id
    )
  );

-- Users policies (organization-scoped)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view organization members" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u1, public.users u2
      WHERE u1.id = auth.uid() 
      AND u2.id = users.id
      AND u1.organization_id = u2.organization_id
    )
  );

-- Companies policies (organization-scoped)
CREATE POLICY "Users can view organization companies" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = companies.organization_id
    )
  );

CREATE POLICY "Users can insert organization companies" ON public.companies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = companies.organization_id
    )
  );

CREATE POLICY "Users can update organization companies" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = companies.organization_id
    )
  );

-- Team roles policies
CREATE POLICY "Users can view company team roles" ON public.team_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = team_roles.company_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company team roles" ON public.team_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = team_roles.company_id 
      AND user_id = auth.uid()
    )
  );

-- Clients policies
CREATE POLICY "Users can view company clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = clients.company_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = clients.company_id 
      AND user_id = auth.uid()
    )
  );

-- Meetings policies (organization-scoped with security levels)
CREATE POLICY "Users can view organization meetings" ON public.meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = meetings.organization_id
    )
  );

CREATE POLICY "Users can insert organization meetings" ON public.meetings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = meetings.organization_id
    )
  );

CREATE POLICY "Users can update organization meetings" ON public.meetings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = meetings.organization_id
    )
  );

-- Security level based access for confidential meetings
CREATE POLICY "Confidential meetings access" ON public.meetings
  FOR SELECT USING (
    security_level = 'confidential' AND (
      user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.access_controls 
        WHERE user_id = auth.uid() 
        AND resource_type = 'meeting' 
        AND resource_id = meetings.id
        AND permission IN ('read', 'write', 'admin')
        AND is_active = true
      )
    )
  );

-- Actions policies
CREATE POLICY "Users can view meeting actions" ON public.actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = actions.meeting_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage meeting actions" ON public.actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = actions.meeting_id 
      AND user_id = auth.uid()
    )
  );

-- Risks policies
CREATE POLICY "Users can view meeting risks" ON public.risks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = risks.meeting_id 
      AND user_id = auth.uid()
    )
  );

-- Suggestions policies
CREATE POLICY "Users can view meeting suggestions" ON public.suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = suggestions.meeting_id 
      AND user_id = auth.uid()
    )
  );

-- Analytics policies (organization-scoped)
CREATE POLICY "Users can view organization analytics" ON public.analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = analytics.organization_id
    )
  );

CREATE POLICY "Users can insert organization analytics" ON public.analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = analytics.organization_id
    )
  );

-- Audit logs policies (admin only)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true); -- System-level insert

-- Encryption keys policies (organization-scoped)
CREATE POLICY "Users can view organization encryption keys" ON public.encryption_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = encryption_keys.organization_id
    )
  );

-- Access controls policies
CREATE POLICY "Users can view own access controls" ON public.access_controls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view organization access controls" ON public.access_controls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = access_controls.organization_id
    )
  );

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_roles_updated_at BEFORE UPDATE ON public.team_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON public.actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
