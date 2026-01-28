// User roles (matches database schema)
export type UserRole = 'associate' | 'admin' | 'regular' | 'driver';

// Urgency levels for medication requests
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

// Task priority and status
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Shift types
export type ShiftType = 'regular' | 'on_call' | 'driver';

// Driver shift status
export type DriverShiftStatus = 'on_duty' | 'off_duty' | 'on_delivery';

// Message recipient types
export type RecipientType = 'user' | 'store' | 'role' | 'broadcast';

// Notification preference options
export type NotificationMethod = 'email' | 'popup' | 'both' | 'none';

// Store type
export interface Store {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  store_id: string | null;
  store?: Store;
  notification_preference: NotificationMethod;
  task_reminder_preference: NotificationMethod;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Driver type
export interface Driver {
  id: string;
  user_id: string | null;
  user?: UserProfile;
  store_id: string;
  store?: Store;
  name: string;
  phone: string;
  is_available: boolean;
  shift_status: DriverShiftStatus;
  created_at: string;
  updated_at: string;
}

// Task type
export interface Task {
  id: string;
  title: string;
  description: string | null;
  store_id: string;
  store?: Store;
  assigned_to: string;
  assigned_to_user?: UserProfile;
  assigned_by: string;
  assigned_by_user?: UserProfile;
  due_date: string;
  due_time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  reminder_at: string | null;
  reminder_type: 'email' | 'popup' | 'both' | null;
  reminder_sent: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Message type
export interface Message {
  id: string;
  sender_id: string;
  sender?: UserProfile;
  recipient_type: RecipientType;
  recipient_id: string | null;
  recipient?: UserProfile | Store;
  recipient_role: UserRole | null;
  subject: string;
  body: string;
  is_email: boolean;
  is_read: boolean;
  email_sent_at: string | null;
  created_at: string;
}

// Shift schedule type
export interface ShiftSchedule {
  id: string;
  store_id: string;
  store?: Store;
  user_id: string;
  user?: UserProfile;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  notes: string | null;
  created_by: string;
  created_by_user?: UserProfile;
  created_at: string;
  updated_at: string;
}

// Notification preferences type
export interface NotificationPreference {
  id: string;
  user_id: string;
  task_assigned: NotificationMethod;
  task_reminder: NotificationMethod;
  task_completed: NotificationMethod;
  request_received: NotificationMethod;
  request_updated: NotificationMethod;
  message_received: NotificationMethod;
  schedule_changed: NotificationMethod;
  created_at: string;
  updated_at: string;
}

// Inventory item type
export interface InventoryItem {
  id: string;
  store_id: string;
  store?: Store;
  item_code: string;
  din_number: string | null;
  upc: string | null;
  manufacturer_code: string;
  brand_name: string | null;
  generic_name: string | null;
  strength: string | null;
  description: string;
  size: number;
  unit_of_measure: string;
  marketing_status: string;
  order_control: string;
  backroom_stock: number;
  on_hand: number;
  total_quantity: number;
  cost: number;
  days_aging: number | null;
  report_date: string;
  created_at: string;
  updated_at: string;
}

// Request status
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'counter_offer' | 'completed' | 'cancelled';

// Medication request type
export interface MedicationRequest {
  id: string;
  from_store_id: string;
  from_store?: Store;
  to_store_id: string;
  to_store?: Store;
  din_number: string;
  upc: string | null;
  medication_name: string;
  requested_quantity: number;
  offered_quantity: number | null;
  status: RequestStatus;
  urgency: UrgencyLevel;
  driver_id: string | null;
  driver?: Driver;
  message: string | null;
  response_message: string | null;
  requested_by: string;
  requested_by_user?: UserProfile;
  responded_by: string | null;
  responded_by_user?: UserProfile;
  driver_notified_at: string | null;
  driver_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Notification types
export type NotificationType =
  | 'request_received'
  | 'request_accepted'
  | 'request_declined'
  | 'counter_offer'
  | 'request_completed'
  | 'inventory_updated'
  | 'task_assigned'
  | 'task_reminder'
  | 'task_completed'
  | 'message_received'
  | 'schedule_changed'
  | 'system';

// Notification type
export interface Notification {
  id: string;
  user_id: string | null;
  store_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  delivery_method: 'email' | 'popup' | 'sms' | 'both';
  related_request_id: string | null;
  related_task_id: string | null;
  is_read: boolean;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

// Report upload type
export interface ReportUpload {
  id: string;
  store_id: string;
  store?: Store;
  uploaded_by: string;
  uploaded_by_user?: UserProfile;
  file_name: string;
  report_date: string;
  items_count: number;
  total_value: number;
  status: 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
}

// Parsed inventory item from PDF
export interface ParsedInventoryItem {
  item_code: string;
  manufacturer_code: string;
  description: string;
  size: number;
  unit_of_measure: string;
  marketing_status: string;
  order_control: string;
  backroom_stock: number;
  on_hand: number;
  total_quantity: number;
  cost: number;
  days_aging: number | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter and sort options
export interface InventoryFilters {
  search: string;
  marketing_status: string[];
  order_control: string[];
  min_days_aging: number | null;
  max_days_aging: number | null;
  min_quantity: number | null;
  max_quantity: number | null;
  store_id: string | null;
}

export interface SortOption {
  field: keyof InventoryItem;
  direction: 'asc' | 'desc';
}

// Duplicate drug detection result
export interface DuplicateDrugGroup {
  generic_name: string;
  strength: string;
  item_count: number;
  items: {
    id: string;
    din_number: string | null;
    upc: string | null;
    brand_name: string | null;
    description: string;
    total_quantity: number;
    cost: number;
  }[];
}

// Role permission helpers
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  associate: 4,
  admin: 3,
  regular: 2,
  driver: 1,
};

// Check if a role can manage another role
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  // Associates can manage all roles
  if (managerRole === 'associate') return true;
  // Admins can manage admin, regular, driver but NOT associate
  if (managerRole === 'admin') return targetRole !== 'associate';
  // Others cannot manage roles
  return false;
}

// Check if a role can see cost data
export function canViewCosts(role: UserRole): boolean {
  return role === 'associate' || role === 'admin';
}

// Check if a role can upload PDFs
export function canUploadPDF(role: UserRole): boolean {
  return role === 'associate' || role === 'admin';
}

// Check if a role can manage inventory
export function canManageInventory(role: UserRole): boolean {
  return role === 'associate' || role === 'admin';
}

// Check if a role can assign tasks to others
export function canAssignTasks(role: UserRole): boolean {
  return role === 'associate' || role === 'admin';
}

// Check if a role can create schedules
export function canCreateSchedules(role: UserRole): boolean {
  return role === 'associate' || role === 'admin';
}

// Check if a role can send broadcast messages
export function canBroadcast(role: UserRole): boolean {
  return role === 'associate';
}

// Check if a role receives SMS (drivers only)
export function receivesSMS(role: UserRole): boolean {
  return role === 'driver';
}
