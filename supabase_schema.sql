-- SQL Migration to create the Saunas table matching the PRD schema
-- Execute this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS saunas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sauna_id TEXT UNIQUE NOT NULL,
    coordinates JSONB NOT NULL, -- { lat: float, lng: float }
    metadata JSONB NOT NULL,    -- { country: string, region: string, type: string }
    content JSONB NOT NULL,     -- { sv: {...}, fi: {...}, en: {...} }
    media JSONB NOT NULL,       -- { featured_image: string, images: string[], audio_interviews: {title, url, speaker, duration, description}[], video_clips: {title, url, description, thumbnail}[] }
    contact JSONB NOT NULL,     -- { website: string, phone: string, address: string }
    pedagogical_link TEXT,
    created_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table for Roles and Approval Status
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'banned'
    full_name TEXT,
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Non-recursive function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (is_admin());

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'pending');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on Saunas
ALTER TABLE saunas ENABLE ROW LEVEL SECURITY;

-- Public can only see approved saunas
CREATE POLICY "Public see approved saunas" ON saunas
    FOR SELECT USING (status = 'approved');

-- Admins can see everything
CREATE POLICY "Admins see all" ON saunas
    FOR ALL USING (is_admin());

-- Logged in users can insert
CREATE POLICY "Logged in users can insert" ON saunas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Storage setup for Sauna Media
-- Note: Buckets might need to be created in the UI or via this SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sauna-media', 'sauna-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'sauna-media');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sauna-media' AND auth.role() = 'authenticated');
CREATE POLICY "Admins Full Access" ON storage.objects FOR ALL USING (
    bucket_id = 'sauna-media' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
