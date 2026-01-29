-- PharmSync Request Logs
-- Tracks requesting and sending pharmacy activity
-- Auto-deletes after 4 days
-- =============================================

-- REQUEST LOGS TABLE
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Log type: 'outgoing' (requesting pharmacy) or 'incoming' (sending pharmacy)
  log_type VARCHAR(10) NOT NULL CHECK (log_type IN ('outgoing', 'incoming')),
  
  -- Store that this log belongs to
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  store_code VARCHAR(10),
  
  -- User who performed the action (requester or responder)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  
  -- The other store involved
  other_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  other_store_name VARCHAR(255),
  other_store_code VARCHAR(10),
  
  -- Medication details
  medication_name VARCHAR(255) NOT NULL,
  din_number VARCHAR(20),
  quantity INTEGER NOT NULL,
  
  -- Action details
  action VARCHAR(50) NOT NULL, -- 'requested', 'accepted', 'declined', 'counter_offered', 'completed'
  
  -- Reference to original request
  request_id UUID REFERENCES medication_requests(id) ON DELETE SET NULL,
  
  -- Timestamps
  action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '4 days'),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_request_logs_store ON request_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_user ON request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_type ON request_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_request_logs_action_at ON request_logs(action_at);
CREATE INDEX IF NOT EXISTS idx_request_logs_expires_at ON request_logs(expires_at);

-- Enable RLS
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their store logs"
  ON request_logs FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'associate'
    OR store_id = public.get_my_store_id()
  );

CREATE POLICY "System can create logs"
  ON request_logs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Associates can delete logs"
  ON request_logs FOR DELETE TO authenticated
  USING (public.get_my_role() = 'associate');

-- =============================================
-- FUNCTION: Log request creation (outgoing request)
-- =============================================
CREATE OR REPLACE FUNCTION log_medication_request()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name VARCHAR(255);
  v_user_email VARCHAR(255);
  v_from_store RECORD;
  v_to_store RECORD;
BEGIN
  -- Get user details
  SELECT full_name, email INTO v_user_name, v_user_email
  FROM profiles WHERE id = NEW.requested_by;
  
  -- Get from store details
  SELECT name, code INTO v_from_store
  FROM stores WHERE id = NEW.from_store_id;
  
  -- Get to store details
  SELECT name, code INTO v_to_store
  FROM stores WHERE id = NEW.to_store_id;
  
  -- Log for REQUESTING pharmacy (outgoing request)
  INSERT INTO request_logs (
    log_type, store_id, store_name, store_code,
    user_id, user_name, user_email,
    other_store_id, other_store_name, other_store_code,
    medication_name, din_number, quantity,
    action, request_id, action_at
  ) VALUES (
    'outgoing', NEW.from_store_id, v_from_store.name, v_from_store.code,
    NEW.requested_by, v_user_name, v_user_email,
    NEW.to_store_id, v_to_store.name, v_to_store.code,
    NEW.medication_name, NEW.din_number, NEW.requested_quantity,
    'requested', NEW.id, NEW.created_at
  );
  
  -- Log for SENDING pharmacy (incoming request)
  INSERT INTO request_logs (
    log_type, store_id, store_name, store_code,
    user_id, user_name, user_email,
    other_store_id, other_store_name, other_store_code,
    medication_name, din_number, quantity,
    action, request_id, action_at
  ) VALUES (
    'incoming', NEW.to_store_id, v_to_store.name, v_to_store.code,
    NEW.requested_by, v_user_name, v_user_email,
    NEW.from_store_id, v_from_store.name, v_from_store.code,
    NEW.medication_name, NEW.din_number, NEW.requested_quantity,
    'requested', NEW.id, NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Log request status changes
-- =============================================
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name VARCHAR(255);
  v_user_email VARCHAR(255);
  v_from_store RECORD;
  v_to_store RECORD;
  v_action VARCHAR(50);
  v_quantity INTEGER;
BEGIN
  -- Only log on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Determine action based on new status
  CASE NEW.status
    WHEN 'accepted' THEN v_action := 'accepted';
    WHEN 'declined' THEN v_action := 'declined';
    WHEN 'counter_offer' THEN v_action := 'counter_offered';
    WHEN 'completed' THEN v_action := 'completed';
    WHEN 'cancelled' THEN v_action := 'cancelled';
    ELSE RETURN NEW; -- Don't log other status changes
  END CASE;
  
  -- Get responder details (if available)
  IF NEW.responded_by IS NOT NULL THEN
    SELECT full_name, email INTO v_user_name, v_user_email
    FROM profiles WHERE id = NEW.responded_by;
  END IF;
  
  -- Get store details
  SELECT name, code INTO v_from_store
  FROM stores WHERE id = NEW.from_store_id;
  
  SELECT name, code INTO v_to_store
  FROM stores WHERE id = NEW.to_store_id;
  
  -- Use offered quantity if available, otherwise requested
  v_quantity := COALESCE(NEW.offered_quantity, NEW.requested_quantity);
  
  -- Log for REQUESTING pharmacy (they receive the response)
  INSERT INTO request_logs (
    log_type, store_id, store_name, store_code,
    user_id, user_name, user_email,
    other_store_id, other_store_name, other_store_code,
    medication_name, din_number, quantity,
    action, request_id, action_at
  ) VALUES (
    'outgoing', NEW.from_store_id, v_from_store.name, v_from_store.code,
    NEW.responded_by, v_user_name, v_user_email,
    NEW.to_store_id, v_to_store.name, v_to_store.code,
    NEW.medication_name, NEW.din_number, v_quantity,
    v_action, NEW.id, NOW()
  );
  
  -- Log for SENDING pharmacy (they took the action)
  INSERT INTO request_logs (
    log_type, store_id, store_name, store_code,
    user_id, user_name, user_email,
    other_store_id, other_store_name, other_store_code,
    medication_name, din_number, quantity,
    action, request_id, action_at
  ) VALUES (
    'incoming', NEW.to_store_id, v_to_store.name, v_to_store.code,
    NEW.responded_by, v_user_name, v_user_email,
    NEW.from_store_id, v_from_store.name, v_from_store.code,
    NEW.medication_name, NEW.din_number, v_quantity,
    v_action, NEW.id, NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS log_new_medication_request ON medication_requests;
DROP TRIGGER IF EXISTS log_medication_request_update ON medication_requests;

-- Trigger for new requests
CREATE TRIGGER log_new_medication_request
  AFTER INSERT ON medication_requests
  FOR EACH ROW EXECUTE FUNCTION log_medication_request();

-- Trigger for status changes
CREATE TRIGGER log_medication_request_update
  AFTER UPDATE ON medication_requests
  FOR EACH ROW EXECUTE FUNCTION log_request_status_change();

-- =============================================
-- FUNCTION: Cleanup expired logs (call periodically)
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_request_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM request_logs
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Request logs table created successfully!';
  RAISE NOTICE '📋 Features:';
  RAISE NOTICE '   - Tracks outgoing requests (requesting pharmacy)';
  RAISE NOTICE '   - Tracks incoming requests (sending pharmacy)';
  RAISE NOTICE '   - Auto-logs on request creation and status changes';
  RAISE NOTICE '   - Auto-expires after 4 days';
  RAISE NOTICE '   - Call cleanup_expired_request_logs() to purge expired logs';
END $$;
