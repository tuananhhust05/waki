import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  loading = true;
  unreadCount = 0;
  private socketSubscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.setupSocket();
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  setupSocket(): void {
    this.socketSubscription = this.socketService.onNotification().subscribe((data: any) => {
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(undefined, 50).subscribe(
      (response) => {
        this.notifications = response.notifications || [];
        this.unreadCount = this.notifications.filter((n: any) => !n.is_read).length;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    );
  }

  markAsRead(notification: any): void {
    if (notification.is_read) return;

    this.notificationService.updateNotification(notification._id, { is_read: true }).subscribe(
      (response) => {
        notification.is_read = true;
        this.unreadCount = this.notifications.filter((n: any) => !n.is_read).length;
      },
      (error) => {
        console.error('Error marking notification as read:', error);
      }
    );
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(
      (response) => {
        this.notifications.forEach((n: any) => n.is_read = true);
        this.unreadCount = 0;
      },
      (error) => {
        console.error('Error marking all as read:', error);
      }
    );
  }

  deleteNotification(notification: any): void {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    this.notificationService.deleteNotification(notification._id).subscribe(
      (response) => {
        this.notifications = this.notifications.filter((n: any) => n._id !== notification._id);
        if (!notification.is_read) {
          this.unreadCount--;
        }
      },
      (error) => {
        console.error('Error deleting notification:', error);
      }
    );
  }

  deleteAllNotifications(): void {
    if (!confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    this.notificationService.deleteAllNotifications().subscribe(
      (response) => {
        this.notifications = [];
        this.unreadCount = 0;
      },
      (error) => {
        console.error('Error deleting all notifications:', error);
      }
    );
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'money_received':
        return '💰';
      case 'child_payment':
        return '💳';
      case 'transfer':
        return '📤';
      default:
        return '🔔';
    }
  }
}

