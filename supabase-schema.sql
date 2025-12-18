-- ============================================
-- Creative Magic - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Projects Table
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_url TEXT,
  youtube_video_id TEXT,
  youtube_video_title TEXT,
  source_thumbnail_url TEXT,
  user_image_url TEXT,
  flux_result_image_url TEXT,
  final_image_url TEXT,
  thumbnail_prompt TEXT,
  hebrew_headline TEXT,
  color_palette JSONB DEFAULT '[]',
  composition_notes TEXT,
  editor_json JSONB,
  size_preset TEXT DEFAULT 'youtube',
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- User Profiles Table (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 5,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan_id TEXT,
  paypal_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Fonts Table
-- ============================================
CREATE TABLE IF NOT EXISTS fonts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fonts ENABLE ROW LEVEL SECURITY;

-- Anyone can view fonts
CREATE POLICY "Anyone can view fonts" ON fonts
  FOR SELECT USING (true);

-- Insert some default Hebrew fonts
INSERT INTO fonts (name, file_url, category, sort_order) VALUES
  ('Heebo', 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap', 'hebrew', 1),
  ('Rubik', 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;900&display=swap', 'hebrew', 2),
  ('Assistant', 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;700;800&display=swap', 'hebrew', 3),
  ('Secular One', 'https://fonts.googleapis.com/css2?family=Secular+One&display=swap', 'hebrew', 4),
  ('Varela Round', 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap', 'hebrew', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- Credit Packages Table
-- ============================================
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packages" ON credit_packages
  FOR SELECT USING (true);

-- Insert default packages
INSERT INTO credit_packages (package_id, name, credits, price, sort_order) VALUES
  ('starter', 'סטארטר', 10, 29.00, 1),
  ('pro', 'פרו', 30, 69.00, 2),
  ('business', 'עסקי', 100, 149.00, 3)
ON CONFLICT (package_id) DO NOTHING;

-- ============================================
-- Subscription Plans Table
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  credits_per_cycle INTEGER NOT NULL,
  cycle_days INTEGER DEFAULT 30,
  paypal_plan_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans" ON subscription_plans
  FOR SELECT USING (true);

-- Insert default plan
INSERT INTO subscription_plans (name, price, credits_per_cycle, paypal_plan_id) VALUES
  ('מנוי חודשי', 49.00, 25, 'P-YOUR-PLAN-ID-HERE')
ON CONFLICT DO NOTHING;

-- ============================================
-- Businesses Table (if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '[]',
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own businesses" ON businesses
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Copy Personas Table (if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS copy_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE copy_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personas" ON copy_personas
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Conversations Table (if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Messages Table (if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages" ON messages
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Liked Ads Table (if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS liked_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_url TEXT,
  screenshot_url TEXT,
  notes TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE liked_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own liked ads" ON liked_ads
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Storage Buckets Setup
-- Run these in Supabase Dashboard -> Storage
-- ============================================
-- 1. Create bucket 'public-files' with public access
-- 2. Create bucket 'private-files' with private access

-- Storage policies (run in SQL editor)
-- For public-files bucket:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-files', 'public-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can read public files
CREATE POLICY "Public files are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-files');

-- Policy: Authenticated users can upload to public-files
CREATE POLICY "Authenticated users can upload public files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public-files' 
    AND auth.role() = 'authenticated'
  );

-- For private-files bucket:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('private-files', 'private-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can only access their own private files
CREATE POLICY "Users can access own private files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'private-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Done! Your database is ready.
-- ============================================
