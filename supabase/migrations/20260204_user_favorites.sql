-- Migration: Add user_favorites table for quick-access items
-- Created: 2026-02-04

-- User favorites table for quick-access items
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  din TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, din)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_din ON user_favorites(din);

-- RLS policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites  
DROP POLICY IF EXISTS "Users can add own favorites" ON user_favorites;
CREATE POLICY "Users can add own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
DROP POLICY IF EXISTS "Users can remove own favorites" ON user_favorites;
CREATE POLICY "Users can remove own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);
