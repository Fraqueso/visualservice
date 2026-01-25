-- VisualService Database Schema
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'active',
    subscription_expires_at TIMESTAMPTZ,
    google_business_url TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums table
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    watermarked_url TEXT,
    thumbnail_url TEXT,
    captured_at TIMESTAMPTZ NOT NULL,
    tier_at_capture subscription_tier NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    photo_hash TEXT,
    device_info JSONB,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for album cover photo after photos table exists
ALTER TABLE albums ADD CONSTRAINT fk_cover_photo
    FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Photo-Album junction table (many-to-many)
CREATE TABLE photo_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id, album_id)
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_code TEXT NOT NULL REFERENCES photos(code) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    customer_email TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification logs (for analytics)
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_code TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    ip_hash TEXT,
    referrer TEXT,
    user_agent TEXT
);

-- API Keys (Enterprise only)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    key_preview TEXT NOT NULL,
    name TEXT,
    rate_limit INTEGER DEFAULT 1000,
    requests_today INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks (Enterprise only)
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret TEXT,
    active BOOLEAN DEFAULT true,
    last_fired_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook delivery logs
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_code ON photos(code);
CREATE INDEX idx_photos_captured_at ON photos(captured_at DESC);
CREATE INDEX idx_photos_expires_at ON photos(expires_at);
CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_photo_albums_photo_id ON photo_albums(photo_id);
CREATE INDEX idx_photo_albums_album_id ON photo_albums(album_id);
CREATE INDEX idx_feedback_photo_code ON feedback(photo_code);
CREATE INDEX idx_verification_logs_photo_code ON verification_logs(photo_code);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Albums policies
CREATE POLICY "Users can view own albums" ON albums
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create albums" ON albums
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums" ON albums
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums" ON albums
    FOR DELETE USING (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view own photos" ON photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create photos" ON photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON photos
    FOR DELETE USING (auth.uid() = user_id);

-- Photo albums policies
CREATE POLICY "Users can view own photo_albums" ON photo_albums
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM photos WHERE photos.id = photo_albums.photo_id AND photos.user_id = auth.uid())
    );

CREATE POLICY "Users can manage own photo_albums" ON photo_albums
    FOR ALL USING (
        EXISTS (SELECT 1 FROM photos WHERE photos.id = photo_albums.photo_id AND photos.user_id = auth.uid())
    );

-- Feedback policies (public can insert, only photo owner can view)
CREATE POLICY "Anyone can submit feedback" ON feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Photo owner can view feedback" ON feedback
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM photos WHERE photos.code = feedback.photo_code AND photos.user_id = auth.uid())
    );

-- API Keys policies (Enterprise only)
CREATE POLICY "Users can view own api_keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own api_keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Webhooks policies (Enterprise only)
CREATE POLICY "Users can view own webhooks" ON webhooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own webhooks" ON webhooks
    FOR ALL USING (auth.uid() = user_id);

-- Webhook deliveries policies
CREATE POLICY "Users can view own webhook_deliveries" ON webhook_deliveries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM webhooks WHERE webhooks.id = webhook_deliveries.webhook_id AND webhooks.user_id = auth.uid())
    );

-- Functions

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get photo by code (for public verification)
CREATE OR REPLACE FUNCTION verify_photo_code(p_code TEXT)
RETURNS TABLE (
    code TEXT,
    captured_at TIMESTAMPTZ,
    verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        photos.code,
        photos.captured_at,
        (photos.expires_at > NOW()) AS verified
    FROM photos
    WHERE photos.code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate expiry based on tier
CREATE OR REPLACE FUNCTION calculate_expiry(tier subscription_tier)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    CASE tier
        WHEN 'free' THEN RETURN NOW() + INTERVAL '30 days';
        WHEN 'pro' THEN RETURN NOW() + INTERVAL '1 year';
        WHEN 'enterprise' THEN RETURN NOW() + INTERVAL '10 years';
        ELSE RETURN NOW() + INTERVAL '30 days';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to count user albums (for Free tier limit)
CREATE OR REPLACE FUNCTION count_user_albums(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM albums WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_photo_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION generate_verification_code() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_expiry(subscription_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION count_user_albums(UUID) TO authenticated;
