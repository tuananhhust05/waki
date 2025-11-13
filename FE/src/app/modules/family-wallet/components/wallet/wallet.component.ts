import { Component, OnInit, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fw-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit, OnDestroy {
  wallet: any = null;
  familyWallets: any[] = [];
  transactions: any[] = [];
  amount: number = 0;
  expenseAmount: number = 0;
  expenseMerchant: string = '';
  expenseDescription: string = '';
  expenseCategory: string = 'expense';
  message: string = '';
  error: string = '';
  loading = false;
  showExpenseForm = false;
  showTransactions = true;
  private socketSubscription?: Subscription;

  constructor(
    private walletService: WalletService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadWallet();
    this.loadFamilyWallets();
    this.loadTransactions();
    this.setupSocket();
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  setupSocket(): void {
    this.socketSubscription = this.socketService.onNotification().subscribe((data: any) => {
      if (data.newBalance !== undefined) {
        this.loadWallet();
      }
    });
  }

  loadWallet(): void {
    this.walletService.getMyWallet().subscribe(
      (response) => {
        this.wallet = response.wallet;
      },
      (error) => {
        console.error('Error loading wallet:', error);
      }
    );
  }

  loadFamilyWallets(): void {
    this.walletService.getFamilyWallets().subscribe(
      (response) => {
        this.familyWallets = response.wallets || [];
      },
      (error) => {
        console.error('Error loading family wallets:', error);
      }
    );
  }

  loadTransactions(): void {
    this.walletService.getTransactions(50).subscribe(
      (response) => {
        this.transactions = response.transactions || [];
      },
      (error) => {
        console.error('Error loading transactions:', error);
      }
    );
  }

  addFunds(): void {
    this.error = '';
    this.message = '';
    
    if (!this.amount || this.amount <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    this.walletService.addFunds({
      amount: this.amount,
      wallet_id: this.wallet.id
    }).subscribe(
      (response) => {
        this.message = 'Funds added successfully';
        this.amount = 0;
        this.loadWallet();
        this.loadTransactions();
      },
      (error) => {
        this.error = error.error?.error || 'Failed to add funds';
      }
    );
  }

  createExpense(): void {
    this.error = '';
    this.message = '';

    if (!this.expenseAmount || this.expenseAmount <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (this.wallet && this.wallet.balance < this.expenseAmount) {
      this.error = 'Insufficient balance';
      return;
    }

    this.loading = true;

    this.paymentService.createExpense({
      amount: this.expenseAmount,
      merchant: this.expenseMerchant,
      description: this.expenseDescription,
      category: this.expenseCategory
    }).subscribe(
      (response) => {
        this.message = 'Expense created successfully';
        this.expenseAmount = 0;
        this.expenseMerchant = '';
        this.expenseDescription = '';
        this.showExpenseForm = false;
        this.loadWallet();
        this.loadTransactions();
        this.loading = false;
      },
      (error) => {
        this.error = error.error?.error || 'Failed to create expense';
        this.loading = false;
      }
    );
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  getTransactionIcon(type: string): string {
    return type === 'credit' ? '💰' : '💸';
  }
}
