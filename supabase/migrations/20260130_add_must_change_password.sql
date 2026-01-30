-- Add must_change_password column to profiles table
-- This flag forces users to change their password on first login

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Update existing users to not require password change
UPDATE profiles SET must_change_password = false WHERE must_change_password IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.must_change_password IS 'If true, user must change password before accessing the app';
