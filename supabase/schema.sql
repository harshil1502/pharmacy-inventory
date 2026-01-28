-- PharmSync Database Schema v2.0
-- Run this in your Supabase SQL Editor
-- Supports: Associate, Admin, Regular, Driver roles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STORES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- Updated roles: associate, admin, regular, driver
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (role IN ('associate', 'admin', 'regular', 'driver')),
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  notification_preference VARCHAR(20) DEFAULT 'both' CHECK (notification_preference IN ('email', 'popup', 'both', 'none')),
  task_reminder_preference VARCHAR(20) DEFAULT 'both' CHECK (task_reminder_preference IN ('email', 'popup', 'both', 'none')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DRIVERS TABLE (for delivery drivers)
-- =============================================
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  shift_status VARCHAR(20) DEFAULT 'off_duty' CHECK (shift_status IN ('on_duty', 'off_duty', 'on_delivery')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INVENTORY ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  item_code VARCHAR(10) NOT NULL,
  din_number VARCHAR(20),
  upc VARCHAR(20),
  manufacturer_code VARCHAR(20) NOT NULL,
  brand_name VARCHAR(255),
  generic_name VARCHAR(255),
  strength VARCHAR(100),
  description VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  unit_of_measure VARCHAR(10) NOT NULL DEFAULT 'EA',
  marketing_status VARCHAR(5) NOT NULL DEFAULT 'C',
  order_control VARCHAR(5) NOT NULL DEFAULT 'N',
  backroom_stock INTEGER NOT NULL DEFAULT 0,
  on_hand INTEGER NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  days_aging INTEGER,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, item_code, manufacturer_code)
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory_items(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_description ON inventory_items(description);
CREATE INDEX IF NOT EXISTS idx_inventory_din ON inventory_items(din_number);
CREATE INDEX IF NOT EXISTS idx_inventory_upc ON inventory_items(upc);
CREATE INDEX IF NOT EXISTS idx_inventory_generic ON inventory_items(generic_name);

-- =============================================
-- MEDICATION REQUESTS TABLE (Updated)
-- =============================================
CREATE TABLE IF NOT EXISTS medication_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  to_store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  din_number VARCHAR(20) NOT NULL,
  upc VARCHAR(20),
  medication_name VARCHAR(255) NOT NULL,
  requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
  offered_quantity INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'counter_offer', 'completed', 'cancelled')),
  urgency VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  message TEXT,
  response_message TEXT,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_notified_at TIMESTAMP WITH TIME ZONE,
  driver_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_requests_from_store ON medication_requests(from_store_id);
CREATE INDEX IF NOT EXISTS idx_requests_to_store ON medication_requests(to_store_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON medication_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_driver ON medication_requests(driver_id);

-- =============================================
-- TASKS TABLE (New)
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  due_time TIME,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  reminder_at TIMESTAMP WITH TIME ZONE,
  reminder_type VARCHAR(10) CHECK (reminder_type IN ('email', 'popup', 'both')),
  reminder_sent BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_store ON tasks(store_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- =============================================
-- MESSAGES TABLE (New)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'store', 'role', 'broadcast')),
  recipient_id UUID,
  recipient_role VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_email BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(recipient_type);

-- =============================================
-- SHIFT SCHEDULES TABLE (New)
-- =============================================
CREATE TABLE IF NOT EXISTS shift_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type VARCHAR(20) DEFAULT 'regular' CHECK (shift_type IN ('regular', 'on_call', 'driver')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schedules_store ON shift_schedules(store_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON shift_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON shift_schedules(date);

-- =============================================
-- NOTIFICATION PREFERENCES TABLE (New)
-- =============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_assigned VARCHAR(10) DEFAULT 'both' CHECK (task_assigned IN ('email', 'popup', 'both', 'none')),
  task_reminder VARCHAR(10) DEFAULT 'both' CHECK (task_reminder IN ('email', 'popup', 'both', 'none')),
  task_completed VARCHAR(10) DEFAULT 'popup' CHECK (task_completed IN ('email', 'popup', 'both', 'none')),
  request_received VARCHAR(10) DEFAULT 'both' CHECK (request_received IN ('email', 'popup', 'both', 'none')),
  request_updated VARCHAR(10) DEFAULT 'popup' CHECK (request_updated IN ('email', 'popup', 'both', 'none')),
  message_received VARCHAR(10) DEFAULT 'popup' CHECK (message_received IN ('email', 'popup', 'both', 'none')),
  schedule_changed VARCHAR(10) DEFAULT 'email' CHECK (schedule_changed IN ('email', 'popup', 'both', 'none')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  delivery_method VARCHAR(10) DEFAULT 'popup' CHECK (delivery_method IN ('email', 'popup', 'sms', 'both')),
  related_request_id UUID REFERENCES medication_requests(id) ON DELETE SET NULL,
  related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_sent BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_store ON notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;

-- =============================================
-- REPORT UPLOADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS report_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  report_date DATE NOT NULL,
  items_count INTEGER NOT NULL DEFAULT 0,
  total_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_uploads ENABLE ROW LEVEL SECURITY;

-- STORES POLICIES
CREATE POLICY "Stores viewable by authenticated users"
  ON stores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Associates can manage stores"
  ON stores FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate'));

-- PROFILES POLICIES
CREATE POLICY "Profiles viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Associates can manage all profiles"
  ON profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate'));

CREATE POLICY "Admins can manage store profiles"
  ON profiles FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.store_id = profiles.store_id
  ));

-- DRIVERS POLICIES
CREATE POLICY "Drivers viewable by store users"
  ON drivers FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND store_id = drivers.store_id)
  );

CREATE POLICY "Associates and admins can manage drivers"
  ON drivers FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = drivers.store_id)
  );

-- INVENTORY POLICIES
CREATE POLICY "Inventory viewable by store users"
  ON inventory_items FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND store_id = inventory_items.store_id)
  );

CREATE POLICY "Associates and admins can manage inventory"
  ON inventory_items FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = inventory_items.store_id)
  );

-- MEDICATION REQUESTS POLICIES
CREATE POLICY "Users can view their store requests"
  ON medication_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (store_id = from_store_id OR store_id = to_store_id))
  );

CREATE POLICY "Store users can create requests"
  ON medication_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND store_id = from_store_id AND role != 'driver')
  );

CREATE POLICY "Store users can respond to requests"
  ON medication_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (store_id = from_store_id OR store_id = to_store_id) AND role != 'driver')
  );

-- TASKS POLICIES
CREATE POLICY "Users can view relevant tasks"
  ON tasks FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR assigned_to = auth.uid()
    OR assigned_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = tasks.store_id)
  );

CREATE POLICY "Associates can create tasks for anyone"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate'));

CREATE POLICY "Admins can create tasks for store users"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = tasks.store_id)
    AND EXISTS (SELECT 1 FROM profiles WHERE id = tasks.assigned_to AND store_id = tasks.store_id)
  );

CREATE POLICY "Regular users can create self tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'regular')
    AND assigned_to = auth.uid()
    AND assigned_by = auth.uid()
  );

CREATE POLICY "Task assignees can update own tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- MESSAGES POLICIES
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR (recipient_type = 'store' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND store_id::text = recipient_id::text))
    OR (recipient_type = 'role' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = recipient_role))
    OR recipient_type = 'broadcast'
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'driver'));

-- SHIFT SCHEDULES POLICIES
CREATE POLICY "Users can view relevant schedules"
  ON shift_schedules FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = shift_schedules.store_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Associates and admins can manage schedules"
  ON shift_schedules FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = shift_schedules.store_id)
  );

-- NOTIFICATION PREFERENCES POLICIES
CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND store_id = notifications.store_id));

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- REPORT UPLOADS POLICIES
CREATE POLICY "Associates and admins can view uploads"
  ON report_uploads FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = report_uploads.store_id)
  );

CREATE POLICY "Associates and admins can upload"
  ON report_uploads FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'associate')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND store_id = report_uploads.store_id)
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'regular'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create default notification preferences
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new profile
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON medication_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON shift_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notif_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to find duplicate drugs
CREATE OR REPLACE FUNCTION find_duplicate_drugs(p_store_id UUID)
RETURNS TABLE (
  generic_name VARCHAR,
  strength VARCHAR,
  item_count BIGINT,
  items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.generic_name,
    i.strength,
    COUNT(*) as item_count,
    jsonb_agg(jsonb_build_object(
      'id', i.id,
      'din_number', i.din_number,
      'upc', i.upc,
      'brand_name', i.brand_name,
      'description', i.description,
      'total_quantity', i.total_quantity,
      'cost', i.cost
    )) as items
  FROM inventory_items i
  WHERE i.store_id = p_store_id
    AND i.generic_name IS NOT NULL
    AND i.strength IS NOT NULL
  GROUP BY i.generic_name, i.strength
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================

-- Insert sample stores
INSERT INTO stores (name, code, address, phone) VALUES
  ('Grand Ave', '1021', '485 Grand Ave, Chatham, ON', '519-354-1660'),
  ('Nortown', '0713', '456 King St, Toronto, ON', '519-352-3200'),
  ('Queen St', '1037', '789 Queen St, Toronto, ON', '519-352-3360')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- REAL-TIME SUBSCRIPTIONS
-- =============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE medication_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

