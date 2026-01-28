-- PharmSync - Update Demo Profiles
-- Run AFTER creating users through registration
-- This updates their roles based on email pattern
-- =============================================

-- First, verify stores exist
SELECT id, name, code FROM stores;

-- =============================================
-- Option 1: Update profiles by email
-- Run this after registering users with these emails
-- =============================================

-- Update Associate (email: associate@pharmsync.demo or similar)
UPDATE profiles 
SET 
  role = 'associate',
  full_name = COALESCE(full_name, 'Alex Associate'),
  phone = COALESCE(phone, '519-555-0001'),
  store_id = NULL  -- Associates have access to all stores
WHERE email LIKE '%associate%' OR email LIKE '%assoc%';

-- Update Admin for Grand Ave (email containing 'admin')
UPDATE profiles 
SET 
  role = 'admin',
  full_name = COALESCE(full_name, 'Adam Admin'),
  phone = COALESCE(phone, '519-555-0002'),
  store_id = (SELECT id FROM stores WHERE code = '1021' LIMIT 1)
WHERE email LIKE '%admin%' AND email NOT LIKE '%admin2%';

-- Update Regular User (email containing 'regular' or 'user')
UPDATE profiles 
SET 
  role = 'regular',
  full_name = COALESCE(full_name, 'Rachel Regular'),
  phone = COALESCE(phone, '519-555-0003'),
  store_id = (SELECT id FROM stores WHERE code = '1021' LIMIT 1)
WHERE (email LIKE '%regular%' OR email LIKE '%user%') AND email NOT LIKE '%regular2%';

-- Update Driver (email containing 'driver')
UPDATE profiles 
SET 
  role = 'driver',
  full_name = COALESCE(full_name, 'Derek Driver'),
  phone = COALESCE(phone, '519-555-0004'),
  store_id = (SELECT id FROM stores WHERE code = '1021' LIMIT 1)
WHERE email LIKE '%driver%';

-- =============================================
-- Option 2: Update specific user IDs
-- Uncomment and replace UUIDs with actual user IDs
-- =============================================

/*
-- Associate
UPDATE profiles 
SET role = 'associate', store_id = NULL
WHERE id = 'YOUR-USER-UUID-HERE';

-- Admin
UPDATE profiles 
SET role = 'admin', store_id = (SELECT id FROM stores WHERE code = '1021')
WHERE id = 'YOUR-USER-UUID-HERE';

-- Regular
UPDATE profiles 
SET role = 'regular', store_id = (SELECT id FROM stores WHERE code = '1021')
WHERE id = 'YOUR-USER-UUID-HERE';

-- Driver
UPDATE profiles 
SET role = 'driver', store_id = (SELECT id FROM stores WHERE code = '1021')
WHERE id = 'YOUR-USER-UUID-HERE';
*/

-- =============================================
-- Create driver record for driver users
-- =============================================
INSERT INTO drivers (user_id, store_id, name, phone, is_available, shift_status)
SELECT 
  p.id,
  p.store_id,
  p.full_name,
  COALESCE(p.phone, '519-555-0004'),
  true,
  'off_duty'
FROM profiles p
WHERE p.role = 'driver' AND p.store_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- =============================================
-- Verify demo profiles
-- =============================================
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.phone,
  s.name as store_name,
  s.code as store_code
FROM profiles p
LEFT JOIN stores s ON p.store_id = s.id
ORDER BY 
  CASE p.role 
    WHEN 'associate' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'regular' THEN 3 
    WHEN 'driver' THEN 4 
  END;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo profiles updated!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Role Hierarchy:';
  RAISE NOTICE '   1. Associate - Full access to all stores';
  RAISE NOTICE '   2. Admin - Store-level management (Grand Ave)';
  RAISE NOTICE '   3. Regular - Day-to-day operations';
  RAISE NOTICE '   4. Driver - SMS notifications only';
END $$;
