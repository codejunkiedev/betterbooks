# Notification System for Accountant Questions

## Overview

This feature allows users to receive notifications and view questions from their accountants on their dashboard. The system includes:

1. **Notification Badge**: Shows unread message count in the navigation
2. **Questions Section**: Displays questions from accountants on the user dashboard
3. **Reply Functionality**: Users can reply to accountant questions with context

## Components

### NotificationBadge
- **Location**: `src/shared/components/NotificationBadge.tsx`
- **Purpose**: Displays a red badge with unread message count
- **Usage**: Used in navigation to show notification count

### AccountantQuestions
- **Location**: `src/features/users/dashboard/AccountantQuestions.tsx`
- **Purpose**: Main component for displaying accountant questions
- **Features**:
  - Shows recent questions from accountants
  - Displays unread count badge
  - Click to view question details and reply
  - Auto-marks messages as read when opened

### useNotifications Hook
- **Location**: `src/shared/hooks/useNotifications.ts`
- **Purpose**: Manages notification state and unread counts
- **Features**:
  - Fetches unread message count
  - Provides refresh functionality
  - Handles loading states

## Database Schema

The system uses the existing `messages` table with the following structure:

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    related_document_id UUID,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## How It Works

### For Accountants
1. Accountants can use the existing `CommentPanel` component to send questions
2. Questions are automatically sent to the company owner (user)
3. Messages are stored in the `messages` table with proper relationships

### For Users
1. Users see a notification badge on the "Home" navigation item
2. The dashboard displays a "Questions from Your Accountant" section
3. Clicking a question opens a dialog showing:
   - Question context (document name and content)
   - Reply textarea
   - Send reply functionality
4. Messages are automatically marked as read when opened

## Integration Points

### User Dashboard
- Added `AccountantQuestions` component to the main dashboard
- Shows recent questions with unread indicators

### Navigation
- Updated `UserLayout` to include notification badges
- Badge appears on the "Home" link when there are unread messages

### Message System
- Uses existing `createDocumentMessage` function for replies
- Integrates with existing notification system
- Supports real-time updates

## Usage Examples

### Sending a Question (Accountant)
```typescript
// Accountants can use the CommentPanel component
<CommentPanel
  isOpen={isCommentPanelOpen}
  onClose={() => setIsCommentPanelOpen(false)}
  documentId={document.id}
  documentName={document.original_filename}
/>
```

### Viewing Questions (User)
```typescript
// Users see questions automatically on their dashboard
<AccountantQuestions />
```

### Notification Badge
```typescript
// Badge appears automatically in navigation
<SidebarLink
  to="/"
  icon={<Home />}
  label="Home"
  notificationCount={unreadCount}
/>
```

## Features

### ✅ Implemented
- [x] Notification badge in navigation
- [x] Questions section on user dashboard
- [x] Click to view question details
- [x] Reply functionality
- [x] Auto-mark as read
- [x] Unread count tracking
- [x] Document context display
- [x] Real-time notification updates

### 🔄 Future Enhancements
- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications
- [ ] Push notifications
- [ ] Message threading
- [ ] File attachments in replies
- [ ] Message search and filtering
- [ ] Bulk message actions

## Testing

To test the notification system:

1. **As an Accountant**:
   - Navigate to a client's documents
   - Use the CommentPanel to send a question
   - Verify the message appears in the messages table

2. **As a User**:
   - Check that notification badge appears in navigation
   - Verify questions appear in dashboard
   - Test reply functionality
   - Confirm messages are marked as read

## Security

- Row Level Security (RLS) policies ensure users only see their own messages
- Accountants can only send messages to their assigned clients
- All message operations are properly authenticated
- Message content is sanitized and validated 