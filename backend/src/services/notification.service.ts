import { query } from '../config/database';

export type NotificationEventType = 
  | 'member_joined'
  | 'credit_over_limit'
  | 'cash_discrepancy'
  | 'delivery_issue'
  | 'credit_writeoff'
  | 'vehicle_service_due'
  | 'admin_action';

export interface NotificationData {
  type: NotificationEventType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Create a notification for the owner
export async function notifyOwner(orgId: string, event: NotificationData) {
  try {
    // Get owner user ID
    const ownerResult = await query(
      'SELECT id FROM users WHERE org_id = $1 AND role = $2',
      [orgId, 'owner']
    );
    
    if (!ownerResult.rows.length) {
      console.log('No owner found for org:', orgId);
      return;
    }
    
    const ownerId = ownerResult.rows[0].id;
    
    await query(
      `INSERT INTO notifications (org_id, user_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orgId, ownerId, event.type, event.title, event.body, JSON.stringify(event.data || {})]
    );
    
    console.log('Notification created for owner:', event.title);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Create a notification for multiple users
export async function notifyUsers(userIds: string[], event: NotificationData) {
  try {
    for (const userId of userIds) {
      await query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, event.type, event.title, event.body, JSON.stringify(event.data || {})]
      );
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string, limit: number = 50) {
  const result = await query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

// Mark notification as read
export async function markAsRead(notificationId: string, userId: string) {
  await query(
    `UPDATE notifications 
     SET read_at = NOW() 
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
  await query(
    `UPDATE notifications 
     SET read_at = NOW() 
     WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
}

// Get unread notification count
export async function getUnreadCount(userId: string) {
  const result = await query(
    `SELECT COUNT(*) as count FROM notifications 
     WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  return parseInt(result.rows[0]?.count || '0');
}

// Helper functions for specific events
export function createMemberJoinedNotification(newUserName: string, role: string): NotificationData {
  return {
    type: 'member_joined',
    title: 'New Team Member',
    body: `${newUserName} joined as ${role}`,
    data: { newUserName, role }
  };
}

export function createDeliveryIssueNotification(deliveryId: string, customerName: string, issueType: string): NotificationData {
  return {
    type: 'delivery_issue',
    title: 'Delivery Issue Reported',
    body: `Issue reported for delivery to ${customerName}: ${issueType}`,
    data: { deliveryId, customerName, issueType }
  };
}

export function createCashDiscrepancyNotification(siteName: string, difference: number): NotificationData {
  return {
    type: 'cash_discrepancy',
    title: 'Cash Discrepancy',
    body: `Cash discrepancy at ${siteName}: ₹${Math.abs(difference).toLocaleString()}`,
    data: { siteName, difference }
  };
}

export function createCreditOverLimitNotification(customerName: string, amount: number, approvedBy: string): NotificationData {
  return {
    type: 'credit_over_limit',
    title: 'Credit Over Limit',
    body: `Credit sale of ₹${amount.toLocaleString()} approved for ${customerName} by ${approvedBy}`,
    data: { customerName, amount, approvedBy }
  };
}
