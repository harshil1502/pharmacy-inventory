# PharmSync - Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** January 2025  
**Author:** Development Team  
**Status:** In Development

---

## 1. Executive Summary

PharmSync is a multi-store pharmacy inventory management platform designed to streamline medication transfers between pharmacy locations, manage inventory data, and facilitate communication across stores. The system provides role-based access control with four distinct user types: Associate, Admin, Regular User, and Driver.

---

## 2. Product Vision

### 2.1 Problem Statement
Pharmacy networks with multiple locations face challenges in:
- Tracking inventory across stores in real-time
- Efficiently transferring medications between locations
- Managing staff schedules and task assignments
- Communicating urgent requests to drivers
- Maintaining accurate inventory data from PDF reports

### 2.2 Solution
PharmSync provides a centralized platform that:
- Enables real-time inventory visibility across all stores
- Facilitates medication transfer requests with approval workflows
- Supports comprehensive task management and scheduling
- Delivers targeted notifications via email, in-app, and SMS
- Processes PDF investment analysis reports automatically

### 2.3 Target Users
- Pharmacy Associates (Regional/Corporate level)
- Store Administrators
- Pharmacy Staff (Regular Users)
- Delivery Drivers

---

## 3. User Roles & Permissions Matrix

### 3.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         ASSOCIATE                                │
│              (Highest Level - Multi-Store Access)                │
│                    Maximum Capabilities                          │
├─────────────────────────────────────────────────────────────────┤
│                           ADMIN                                  │
│                  (Store Level Management)                        │
│               Manages own store operations                       │
├─────────────────────────────────────────────────────────────────┤
│                       REGULAR USER                               │
│                    (Staff Operations)                            │
│              Day-to-day pharmacy tasks                           │
├─────────────────────────────────────────────────────────────────┤
│                          DRIVER                                  │
│               (Delivery Notifications Only)                      │
│            Receives pickup alerts via SMS                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Permission Matrix

| Feature | Associate | Admin | Regular User | Driver |
|---------|-----------|-------|--------------|--------|
| **INVENTORY** |||||
| View all stores' inventory | ✅ | Own store only | Own store only | ❌ |
| View $ values/costs | ✅ | ✅ Own store | ❌ | ❌ |
| Upload PDF reports | ✅ | ✅ Own store | ❌ | ❌ |
| CRUD inventory items | ✅ | ✅ Own store | ❌ | ❌ |
| View raw PDFs | ✅ | ✅ Own store | ❌ | ❌ |
| View processed data | ✅ | ✅ | ✅ Limited (no $) | ❌ |
| Identify duplicate drugs | ✅ | ✅ | ❌ | ❌ |
| **MEDICATION REQUESTS** |||||
| Create requests (DIN, UPC, Qty) | ✅ | ✅ | ✅ | ❌ |
| Accept/Decline requests | ✅ | ✅ | ✅ | ❌ |
| Select driver & urgency | ✅ | ✅ | ✅ | ❌ |
| **USER MANAGEMENT** |||||
| Create new users | ✅ All stores | ✅ Own store | ❌ | ❌ |
| Update user roles | ✅ All roles | ✅ (not Associate) | ❌ | ❌ |
| Update user information | ✅ | ✅ Own store | ❌ Own profile | ❌ Own profile |
| View all users | ✅ | ✅ Own store | ❌ | ❌ |
| **COMMUNICATION - EMAIL** |||||
| Email specific user | ✅ | ✅ | ✅ | ❌ |
| Email selected store staff | ✅ | ✅ Own store | ❌ | ❌ |
| Email all store admins | ✅ | ❌ | ❌ | ❌ |
| Email all store staff | ✅ | ❌ | ❌ | ❌ |
| **COMMUNICATION - MESSAGING** |||||
| Send to specific user | ✅ | ✅ | ✅ | ❌ |
| Send to stores | ✅ | ❌ | ✅ | ❌ |
| Send to admins | ✅ | ❌ | ✅ | ❌ |
| Send to Associate | ✅ | ❌ | ✅ | ❌ |
| View all chats | ✅ | Own store | Own chats | ❌ |
| **TASK MANAGEMENT** |||||
| Create tasks for self | ✅ | ✅ | ✅ | ❌ |
| Assign tasks to any user | ✅ | ❌ | ❌ | ❌ |
| Assign tasks to store users | ✅ | ✅ Own store | ❌ | ❌ |
| Update own tasks | ✅ | ✅ | ✅ | ❌ |
| Create daily to-do lists | ✅ | ✅ | ❌ | ❌ |
| Set reminders | ✅ | ✅ | ✅ | ❌ |
| Choose notification preference | ✅ | ✅ | ✅ | ❌ |
| **SCHEDULING** |||||
| Create shift schedules | ✅ All stores | ✅ Own store | ❌ | ❌ |
| View schedules | ✅ All | ✅ Own store | ✅ Own schedule | ✅ Own schedule |
| **NOTIFICATIONS** |||||
| Email notifications | ✅ | ✅ | ✅ | ❌ |
| Pop-up notifications | ✅ | ✅ | ✅ | ❌ |
| SMS notifications | ❌ | ❌ | ❌ | ✅ |
| Notification preferences | ✅ | ✅ | ✅ | ✅ (Limited) |

---

## 4. Feature Specifications

### 4.1 ASSOCIATE Role (Maximum Capabilities)

#### 4.1.1 Overview
Associates have complete access to all system features across all stores. They serve as regional or corporate-level managers with oversight of the entire pharmacy network.

#### 4.1.2 Capabilities
1. **All Chats Access**: View conversations across all stores
2. **$ Value Visibility**: See inventory costs and financial data for all stores
3. **Task Assignment**: Assign tasks to any user in any store
4. **Email Communication**:
   - Send to selected staff member
   - Send to selected store's staff members
   - Send to all store admins
   - Send to all store staff (broadcast)
5. **Document Access**:
   - View all raw uploaded PDFs
   - View all processed data on website
6. **Future Operations**: Additional operational tasks as system expands

### 4.2 ADMIN Role (Store Level)

#### 4.2.1 Overview
Admins manage operations within their assigned store. They have elevated privileges but are restricted to their store's scope.

#### 4.2.2 Capabilities

**Inventory Management:**
- Upload PDF Investment Analysis Reports for their store
- Adjust inventory numbers manually
- Perform full CRUD operations on inventory data
- Identify duplicate drugs (same name + strength, different UPC/Brand/DIN)
- View cost/$ values for their store

**User Management:**
- Create new users for their store
- Update user roles (can assign: Admin, Regular, Driver - NOT Associate)
- Update user information (name, email, phone, etc.)

**Task Management:**
- Create daily to-do lists for self
- Create tasks for specific users in their store
- Receive task reminders via:
  - Email notification
  - Pop-up notification
  - Both (configurable preference)
- Receive task completion notifications

**Scheduling:**
- Create and manage shift schedules for their store

**Communication:**
- Send messages to specific users in their store

### 4.3 REGULAR USER Role (Staff)

#### 4.3.1 Overview
Regular users are pharmacy staff who handle day-to-day operations, including medication requests and personal task management.

#### 4.3.2 Capabilities

**Medication Requests:**
- Request drugs from specific stores using:
  - DIN Number (required)
  - UPC Code (optional)
  - Quantity (required)
- Accept incoming medication requests
- Select driver for delivery from store's driver options
- Set urgency level (Low/Medium/High/Critical)
- Note: Different phone numbers may apply based on driver availability

**Task Management:**
- Update own assigned tasks
- Create tasks for self
- Set reminders within selected timeframe

**Communication:**
- Send messages via email to:
  - Specific users
  - Stores
  - Admins
  - Associate

### 4.4 DRIVER Role

#### 4.4.1 Overview
Drivers receive SMS notifications when medication transfers are approved. They have minimal system access focused solely on delivery coordination.

#### 4.4.2 Capabilities

**Notifications:**
- Receive SMS upon request approval/settlement
- Notifications include:
  - Pickup store name and address
  - Number of medications (count only)
  - Urgency level
- **Privacy Protection**: Notifications do NOT include:
  - Medication names
  - Drug details
  - DIN numbers
  - Patient information

**Assignment:**
- Assigned to specific store number
- Can be assigned to multiple stores if needed

---

## 5. Data Models

### 5.1 Updated User Profile

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'associate' | 'admin' | 'regular' | 'driver';
  store_id: string | null;        // null for associate
  notification_preference: 'email' | 'popup' | 'both';
  task_reminder_preference: 'email' | 'popup' | 'both';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### 5.2 Driver Model

```typescript
interface Driver {
  id: string;
  user_id: string;                // Links to profile
  store_id: string;               // Primary assigned store
  phone: string;                  // SMS number
  is_available: boolean;
  shift_status: 'on_duty' | 'off_duty' | 'on_delivery';
  created_at: string;
  updated_at: string;
}
```

### 5.3 Task Model

```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  store_id: string;
  assigned_to: string;            // User ID
  assigned_by: string;            // User ID
  due_date: string;
  due_time: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reminder_at: string | null;
  reminder_type: 'email' | 'popup' | 'both' | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### 5.4 Updated Medication Request

```typescript
interface MedicationRequest {
  id: string;
  from_store_id: string;
  to_store_id: string;
  din_number: string;             // Required
  upc: string | null;             // Optional
  medication_name: string;
  requested_quantity: number;
  offered_quantity: number | null;
  status: RequestStatus;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  driver_id: string | null;       // Selected driver
  message: string | null;
  response_message: string | null;
  requested_by: string;
  responded_by: string | null;
  driver_notified_at: string | null;
  driver_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### 5.5 Message Model

```typescript
interface Message {
  id: string;
  sender_id: string;
  recipient_type: 'user' | 'store' | 'role' | 'broadcast';
  recipient_id: string | null;    // User ID or Store ID
  recipient_role: string | null;  // 'admin' | 'associate' for role-based
  subject: string;
  body: string;
  is_email: boolean;              // Send via email
  is_read: boolean;
  email_sent_at: string | null;
  created_at: string;
}
```

### 5.6 Shift Schedule Model

```typescript
interface ShiftSchedule {
  id: string;
  store_id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: 'regular' | 'on_call' | 'driver';
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### 5.7 Notification Preferences

```typescript
interface NotificationPreference {
  id: string;
  user_id: string;
  task_assigned: 'email' | 'popup' | 'both' | 'none';
  task_reminder: 'email' | 'popup' | 'both' | 'none';
  task_completed: 'email' | 'popup' | 'both' | 'none';
  request_received: 'email' | 'popup' | 'both' | 'none';
  request_updated: 'email' | 'popup' | 'both' | 'none';
  message_received: 'email' | 'popup' | 'both' | 'none';
  schedule_changed: 'email' | 'popup' | 'both' | 'none';
  created_at: string;
  updated_at: string;
}
```

---

## 6. Duplicate Drug Detection

### 6.1 Logic
System identifies potential duplicates when:
```
Same (Generic Name + Strength) 
BUT Different (UPC OR Brand OR DIN)
```

### 6.2 Display
- Side-by-side comparison view
- Highlight differences in red
- Action buttons: Merge | Keep Separate | Ignore

### 6.3 Example
```
┌─────────────────────────────────────────────────────────────────┐
│ POTENTIAL DUPLICATE DETECTED                                     │
├─────────────────────────┬───────────────────────────────────────┤
│ Drug A                  │ Drug B                                 │
├─────────────────────────┼───────────────────────────────────────┤
│ Metformin 500mg         │ Metformin 500mg                       │
│ DIN: 02394561           │ DIN: 02421689                         │ ← Different
│ Brand: Glucophage       │ Brand: Generic                        │ ← Different
│ UPC: 058685012345       │ UPC: 062589874521                     │ ← Different
│ Qty: 1,500              │ Qty: 800                              │
│ Cost: $125.00           │ Cost: $95.00                          │
└─────────────────────────┴───────────────────────────────────────┘
[Merge] [Keep Separate] [Dismiss]
```

---

## 7. Driver SMS Notification Format

### 7.1 Privacy Requirements
**CRITICAL**: Driver SMS must NOT contain medication details.

### 7.2 SMS Template
```
📦 PharmSync Pickup Alert
━━━━━━━━━━━━━━━━━━━━━━━━
Pickup From: [Store Name]
Address: [Store Address]
Items: [Count] medication(s)
Urgency: [🟢LOW | 🟡MEDIUM | 🟠HIGH | 🔴CRITICAL]
━━━━━━━━━━━━━━━━━━━━━━━━
Reply OK to confirm receipt
```

### 7.3 Urgency Color Coding
- 🟢 LOW - Standard delivery
- 🟡 MEDIUM - Same-day priority
- 🟠 HIGH - Rush delivery
- 🔴 CRITICAL - Immediate attention required

---

## 8. User Interface Flows

### 8.1 Regular User: Create Request Flow
```
1. Click "New Request" button
2. Select target store from dropdown
3. Enter DIN number (required)
   - Auto-populates medication name if found
4. Optionally enter UPC code
5. Enter quantity
6. Select driver from store's available drivers
   - Shows: Name | Phone Number | Status
7. Select urgency level
8. Add optional message
9. Submit request
```

### 8.2 Admin: Create Task Flow
```
1. Click "Create Task" or select from calendar
2. Enter task title
3. Add description (optional)
4. Assign to:
   - Self
   - Select user from store
5. Set due date and time
6. Set priority level
7. Configure reminder:
   - Time before due
   - Notification method (email/popup/both)
8. Save task
```

### 8.3 Associate: Broadcast Email Flow
```
1. Click "Send Email"
2. Select recipients:
   - [ ] Specific user (search)
   - [ ] Store staff (select stores)
   - [ ] All store admins
   - [ ] All staff
3. Enter subject
4. Compose message (rich text)
5. Preview
6. Send
```

---

## 9. API Endpoints

### 9.1 Tasks
```
GET    /api/tasks              # List tasks (role-filtered)
GET    /api/tasks/:id          # Get task details
POST   /api/tasks              # Create task
PATCH  /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
POST   /api/tasks/:id/complete # Mark complete
```

### 9.2 Messages
```
GET    /api/messages           # List messages
POST   /api/messages           # Send in-app message
POST   /api/messages/email     # Send email
PATCH  /api/messages/:id/read  # Mark as read
```

### 9.3 Schedules
```
GET    /api/schedules          # List schedules
POST   /api/schedules          # Create shift
PATCH  /api/schedules/:id      # Update shift
DELETE /api/schedules/:id      # Delete shift
```

### 9.4 Drivers
```
GET    /api/drivers            # List store drivers
GET    /api/drivers/:id        # Get driver details
PATCH  /api/drivers/:id/status # Update availability
```

### 9.5 Notifications
```
GET    /api/notifications              # List notifications
PATCH  /api/notifications/:id/read     # Mark as read
GET    /api/notifications/preferences  # Get preferences
PATCH  /api/notifications/preferences  # Update preferences
```

---

## 10. Technical Implementation Notes

### 10.1 Email Service
- Use Supabase Auth for transactional emails
- Integrate Resend or SendGrid for custom emails
- Queue system for batch emails (Associate broadcasts)

### 10.2 SMS Service
- Twilio integration for driver SMS
- Webhook for delivery confirmation
- Fallback to email if SMS fails

### 10.3 Real-time Updates
- Supabase Realtime for notifications
- WebSocket connections for chat
- Optimistic UI updates

### 10.4 PDF Processing
- Server-side processing via API route
- Store original file in Supabase Storage
- Parse using pdf-parse library
- Batch insert processed items

---

## 11. Security Considerations

### 11.1 Role-Based Access Control
- RLS policies on all tables
- API route protection middleware
- Client-side role checks for UI

### 11.2 Data Protection
- Cost data filtered for non-admin users
- Driver SMS sanitized of drug info
- Audit logging for sensitive operations

### 11.3 Privacy Compliance
- No medication details in driver notifications
- User data access restricted by role
- Secure file storage with access controls

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Request fulfillment time | < 24 hours |
| Task completion rate | > 90% |
| Driver notification delivery | < 30 seconds |
| System uptime | 99.9% |
| User satisfaction score | > 4.5/5 |

---


---

*End of Product Requirements Document*
