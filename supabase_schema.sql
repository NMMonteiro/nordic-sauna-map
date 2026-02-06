-- Execute this in your Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net"; -- For making HTTP requests to Edge Functions

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
    metadata JSONB DEFAULT '{}'::jsonb,
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

-- Public can see all saunas for now to ensure the map isn't blank
DROP POLICY IF EXISTS "Public see approved saunas" ON saunas;
CREATE POLICY "Public see all saunas" ON saunas
    FOR SELECT USING (true);

-- Admins can see everything
DROP POLICY IF EXISTS "Admins see all" ON saunas;
CREATE POLICY "Admins see all" ON saunas
    FOR ALL USING (is_admin());

-- Logged in users can insert and see their own
DROP POLICY IF EXISTS "Logged in users can insert" ON saunas;
CREATE POLICY "Logged in users can insert" ON saunas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can see own entries" ON saunas
    FOR SELECT USING (auth.uid() = created_by);

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

-- Learning Materials Table
CREATE TABLE IF NOT EXISTS learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'presentation', 'video', 'twee')),
    url TEXT,
    file_path TEXT,
    thumbnail TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    category TEXT DEFAULT 'Sauna Stories',
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to increment blog view count
CREATE OR REPLACE FUNCTION increment_blog_view(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Learning Materials Policies
CREATE POLICY "Public Read Learning Materials" ON learning_materials FOR SELECT USING (true);
CREATE POLICY "Admin All Learning Materials" ON learning_materials FOR ALL USING (is_admin());

-- Blog Posts Policies
CREATE POLICY "Public Read Approved Blog Posts" ON blog_posts FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors Read Own Blog Posts" ON blog_posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors Insert Blog Posts" ON blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors Update Own Pending Posts" ON blog_posts FOR UPDATE USING (auth.uid() = author_id AND status = 'pending_approval');
CREATE POLICY "Admins Manage All Blog Posts" ON blog_posts FOR ALL USING (is_admin());

-- Add Storage Buckets for Education and Blog
INSERT INTO storage.buckets (id, name, public) VALUES ('education', 'education', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media', 'blog-media', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Education
CREATE POLICY "Public Education Access" ON storage.objects FOR SELECT USING (bucket_id = 'education');
CREATE POLICY "Admin Education Management" ON storage.objects FOR ALL USING (bucket_id = 'education' AND is_admin());

-- Storage Policies for Blog Media
CREATE POLICY "Public Blog Media Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-media');
CREATE POLICY "Authenticated Blog Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-media' AND auth.role() = 'authenticated');
CREATE POLICY "Owners Blog Delete" ON storage.objects FOR DELETE USING (bucket_id = 'blog-media' AND auth.uid() = owner);

-- Notification System Triggers
-- This function will call a Supabase Edge Function to send emails
CREATE OR REPLACE FUNCTION public.notify_on_change()
RETURNS trigger AS $$
DECLARE
  project_url TEXT := 'https://hgpcpontdxjsbqsjiech.supabase.co';
  -- We'll use a safer way to pass the auth header if possible, or use a vault secret
  -- For now, we will use the net.http_post directly with the known URL
BEGIN
  PERFORM
    net.http_post(
      url := concat(project_url, '/functions/v1/notify'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        -- This requires the service role key. Since we can't set DB params, 
        -- the most reliable way in a trigger is to pass it or have the function 
        -- check for a custom header that only the DB knows.
        'Authorization', concat('Bearer ', 'REPLACE_WITH_YOUR_ACTUAL_SERVICE_ROLE_KEY')
      ),
      body := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        'operation', TG_OP
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Saunas
DROP TRIGGER IF EXISTS on_sauna_change ON saunas;
CREATE TRIGGER on_sauna_change
AFTER INSERT OR UPDATE ON saunas
FOR EACH ROW EXECUTE FUNCTION notify_on_change();

-- Trigger for Blog Posts
DROP TRIGGER IF EXISTS on_blog_post_change ON blog_posts;
CREATE TRIGGER on_blog_post_change
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION notify_on_change();

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous signups for newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Only admins can see the list
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers
    FOR SELECT USING (is_admin());

-- Add trigger for newsletter notifications
CREATE TRIGGER on_newsletter_signup
AFTER INSERT ON newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION notify_on_change();
