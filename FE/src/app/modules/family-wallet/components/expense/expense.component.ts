// Import necessary modules and services
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { WalletService } from '../../services/wallet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-fw-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  wallet: any = null;
  amount = 0;
  merchant = '';
  description = '';
  category = 'expense';
  message = '';
  error = '';
  loading = false;

  constructor(
    private paymentService: PaymentService,
    private walletService: WalletService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/family-wallet/login']);
      return;
    }
    this.loadWallet();
  }

  loadWallet(): void {
    this.walletService.getMyWallet().subscribe(
      (response) => {
        this.wallet = response.wallet;
      },
      (error) => {
        console.error('Error loading wallet:', error);
        this.error = error.error?.error || 'Failed to load wallet';
      }
    );
  }

  createExpense(): void {
    this.error = '';
    this.message = '';

    if (!this.amount || this.amount <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (this.wallet && this.wallet.balance < this.amount) {
      this.error = 'Insufficient balance';
      return;
    }

    this.loading = true;

    this.paymentService.createExpense({
      amount: this.amount,
      merchant: this.merchant,
      description: this.description,
      category: this.category
    }).subscribe(
      () => {
        this.message = 'Expense created successfully';
        this.amount = 0;
        this.merchant = '';
        this.description = '';
        this.category = 'expense';
        this.loading = false;
        this.loadWallet();
      },
      (error) => {
        this.error = error.error?.error || 'Failed to create expense';
        this.loading = false;
      }
    );
  }
}
