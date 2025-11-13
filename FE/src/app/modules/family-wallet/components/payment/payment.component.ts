import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { WalletService } from '../../services/wallet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentForm = {
    amount: 0,
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    cardType: 'visa' as 'visa' | 'mastercard'
  };

  loading = false;
  message = '';
  error = '';
  wallet: any = null;

  constructor(
    private paymentService: PaymentService,
    private walletService: WalletService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || user.role !== 'parent') {
      this.router.navigate(['/family-wallet/dashboard']);
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
      }
    );
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      if (value.length > 19) value = value.substring(0, 19);
    }
    this.paymentForm.cardNumber = value;
    
    // Auto-detect card type
    if (value.startsWith('4')) {
      this.paymentForm.cardType = 'visa';
    } else if (value.startsWith('5') || value.startsWith('2')) {
      this.paymentForm.cardType = 'mastercard';
    }
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentForm.expiryDate = value;
  }

  formatCvv(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    this.paymentForm.cvv = value;
  }

  processPayment(): void {
    this.error = '';
    this.message = '';

    // Validation
    if (!this.paymentForm.amount || this.paymentForm.amount <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (!this.paymentForm.cardNumber || this.paymentForm.cardNumber.replace(/\s/g, '').length < 13) {
      this.error = 'Please enter a valid card number';
      return;
    }

    if (!this.paymentForm.cardHolder || this.paymentForm.cardHolder.length < 3) {
      this.error = 'Please enter card holder name';
      return;
    }

    if (!this.paymentForm.expiryDate || this.paymentForm.expiryDate.length !== 5) {
      this.error = 'Please enter a valid expiry date (MM/YY)';
      return;
    }

    if (!this.paymentForm.cvv || this.paymentForm.cvv.length < 3) {
      this.error = 'Please enter a valid CVV';
      return;
    }

    this.loading = true;

    this.paymentService.processPayment({
      amount: this.paymentForm.amount,
      cardNumber: this.paymentForm.cardNumber.replace(/\s/g, ''),
      cardHolder: this.paymentForm.cardHolder,
      expiryDate: this.paymentForm.expiryDate,
      cvv: this.paymentForm.cvv,
      cardType: this.paymentForm.cardType
    }).subscribe(
      (response) => {
        this.message = 'Payment processed successfully!';
        this.loadWallet();
        setTimeout(() => {
          this.router.navigate(['/family-wallet/dashboard']);
        }, 2000);
      },
      (error) => {
        this.error = error.error?.error || 'Payment failed. Please try again.';
        this.loading = false;
      }
    );
  }
}

