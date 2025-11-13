import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet.service';
import { FamilyService } from '../../services/family.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fw-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  wallet: any = null;
  family: any = null;
  user: any = null;
  loading = true;
  transactions: any[] = [];
  showUserMenu = false;
  notifications: any[] = [];
  unreadCount = 0;
  private socketSubscription?: Subscription;

  constructor(
    private walletService: WalletService,
    private familyService: FamilyService,
    private authService: AuthService,
    private socketService: SocketService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
    this.setupSocket();
    this.loadNotifications();
    this.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  setupSocket(): void {
    this.socketService.connect();
    
    this.socketSubscription = this.socketService.onNotification().subscribe((data: any) => {
      console.log('Notification received:', data);
      
      // Update wallet balance if provided
      if (data.newBalance !== undefined && this.wallet) {
        this.wallet.balance = data.newBalance;
      }
      
      // Reload wallet to get latest balance
      this.loadWallet();
      
      // Show browser notification
      this.showBrowserNotification(data.title, data.message);
      
      // Reload notifications
      this.loadNotifications();
    });
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  showBrowserNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/assets/icon-192x192.png',
        badge: '/assets/icon-192x192.png'
      });
    }
  }

  loadWallet(): void {
    this.walletService.getMyWallet().subscribe(
      (response) => {
        this.wallet = response.wallet;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading wallet:', error);
        this.loading = false;
      }
    );
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(undefined, 10).subscribe(
      (response) => {
        this.notifications = response.notifications || [];
        this.unreadCount = this.notifications.filter((n: any) => !n.is_read).length;
      },
      (error) => {
        console.error('Error loading notifications:', error);
      }
    );
  }

  loadData(): void {
    this.loadWallet();

    this.familyService.getMyFamily().subscribe(
      (response) => {
        this.family = response.family;
      },
      (error) => {
        console.error('Error loading family:', error);
      }
    );

    this.walletService.getTransactions(5).subscribe(
      (response) => {
        this.transactions = response.transactions || [];
      },
      (error) => {
        console.error('Error loading transactions:', error);
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/family-wallet/login']);
  }

  goToFamilyManagement(): void {
    this.router.navigate(['/family-wallet/family']);
  }

  formatCurrency(amount: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}


