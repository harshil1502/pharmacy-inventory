-- Fix RLS Infinite Recursion for Profiles Table
-- Run this in Supabase SQL Editor
-- =============================================

-- First, drop the problematic policies on profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Associates can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage store profiles" ON profiles;

-- Create a security definer function to get user role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to get user store_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate profiles policies using the security definer functions
-- This avoids infinite recursion

-- Everyone can view profiles (needed for user lookups)
CREATE POLICY "Profiles viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated 
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Associates can insert/delete any profile
CREATE POLICY "Associates can insert profiles"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'associate');

CREATE POLICY "Associates can delete profiles"
  ON profiles FOR DELETE TO authenticated
  USING (public.get_my_role() = 'associate');

-- Admins can insert profiles for their store only
CREATE POLICY "Admins can insert store profiles"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin' 
    AND store_id = public.get_my_store_id()
  );

-- =============================================
-- Also fix other tables that reference profiles
-- =============================================

-- Drop and recreate inventory policies
DROP POLICY IF EXISTS "Inventory viewable by store users" ON inventory_items;
DROP POLICY IF EXISTS "Associates and admins can manage inventory" ON inventory_items;

CREATE POLICY "Inventory viewable by store users"
  ON inventory_items FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR store_id = public.get_my_store_id()
  );

CREATE POLICY "Associates and admins can manage inventory"
  ON inventory_items FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
  );

-- Drop and recreate medication_requests policies
DROP POLICY IF EXISTS "Users can view their store requests" ON medication_requests;
DROP POLICY IF EXISTS "Store users can create requests" ON medication_requests;
DROP POLICY IF EXISTS "Store users can respond to requests" ON medication_requests;

CREATE POLICY "Users can view their store requests"
  ON medication_requests FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR public.get_my_store_id() = from_store_id 
    OR public.get_my_store_id() = to_store_id
  );

CREATE POLICY "Store users can create requests"
  ON medication_requests FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_store_id() = from_store_id 
    AND public.get_my_role() != 'driver'
  );

CREATE POLICY "Store users can respond to requests"
  ON medication_requests FOR UPDATE TO authenticated
  USING (
    (public.get_my_store_id() = from_store_id OR public.get_my_store_id() = to_store_id)
    AND public.get_my_role() != 'driver'
  );

-- Drop and recreate tasks policies
DROP POLICY IF EXISTS "Users can view relevant tasks" ON tasks;
DROP POLICY IF EXISTS "Associates can create tasks for anyone" ON tasks;
DROP POLICY IF EXISTS "Admins can create tasks for store users" ON tasks;
DROP POLICY IF EXISTS "Regular users can create self tasks" ON tasks;
DROP POLICY IF EXISTS "Task assignees can update own tasks" ON tasks;

CREATE POLICY "Users can view relevant tasks"
  ON tasks FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR assigned_to = auth.uid()
    OR assigned_by = auth.uid()
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
  );

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('associate', 'admin', 'regular')
  );

CREATE POLICY "Task assignees can update own tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- Drop and recreate messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR public.get_my_role() = 'associate'
    OR (recipient_type = 'store' AND public.get_my_store_id()::text = recipient_id::text)
    OR (recipient_type = 'role' AND public.get_my_role() = recipient_role)
    OR recipient_type = 'broadcast'
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() 
    AND public.get_my_role() != 'driver'
  );

-- Drop and recreate shift_schedules policies
DROP POLICY IF EXISTS "Users can view relevant schedules" ON shift_schedules;
DROP POLICY IF EXISTS "Associates and admins can manage schedules" ON shift_schedules;

CREATE POLICY "Users can view relevant schedules"
  ON shift_schedules FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
    OR user_id = auth.uid()
  );

CREATE POLICY "Associates and admins can manage schedules"
  ON shift_schedules FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
  );

-- Drop and recreate drivers policies
DROP POLICY IF EXISTS "Drivers viewable by store users" ON drivers;
DROP POLICY IF EXISTS "Associates and admins can manage drivers" ON drivers;

CREATE POLICY "Drivers viewable by store users"
  ON drivers FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR store_id = public.get_my_store_id()
  );

CREATE POLICY "Associates and admins can manage drivers"
  ON drivers FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
  );

-- Drop and recreate report_uploads policies
DROP POLICY IF EXISTS "Associates and admins can view uploads" ON report_uploads;
DROP POLICY IF EXISTS "Associates and admins can upload" ON report_uploads;

CREATE POLICY "Associates and admins can view uploads"
  ON report_uploads FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
  );

CREATE POLICY "Associates and admins can upload"
  ON report_uploads FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'associate'
    OR (public.get_my_role() = 'admin' AND store_id = public.get_my_store_id())
  );

-- Drop and recreate notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR store_id = public.get_my_store_id()
  );

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed successfully!';
  RAISE NOTICE 'The infinite recursion issue has been resolved.';
END $$;
