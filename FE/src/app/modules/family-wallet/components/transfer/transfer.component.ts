import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { FamilyService } from '../../services/family.service';
import { WalletService } from '../../services/wallet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  familyMembers: any[] = [];
  selectedChild: any = null;
  amount: number = 0;
  description: string = '';
  loading = false;
  message = '';
  error = '';
  wallet: any = null;

  constructor(
    private paymentService: PaymentService,
    private familyService: FamilyService,
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
    this.loadFamilyMembers();
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

  loadFamilyMembers(): void {
    this.familyService.getMyFamily().subscribe(
      (response) => {
        if (response.family && response.family.members) {
          this.familyMembers = response.family.members.filter((m: any) => m.role === 'member');
        }
      },
      (error) => {
        console.error('Error loading family members:', error);
      }
    );
  }

  transferMoney(): void {
    this.error = '';
    this.message = '';

    if (!this.selectedChild) {
      this.error = 'Please select a child';
      return;
    }

    if (!this.amount || this.amount <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (this.wallet && this.wallet.balance < this.amount) {
      this.error = 'Insufficient balance';
      return;
    }

    this.loading = true;

    this.paymentService.transferToChild({
      childUserId: this.selectedChild.id || this.selectedChild.user_id || this.selectedChild._id,
      amount: this.amount,
      description: this.description
    }).subscribe(
      (response) => {
        this.message = `Successfully transferred ${this.amount} SAR to ${this.selectedChild.full_name || this.selectedChild.email}`;
        this.loadWallet();
        this.amount = 0;
        this.description = '';
        this.selectedChild = null;
        this.loading = false;
        setTimeout(() => {
          this.message = '';
        }, 5000);
      },
      (error) => {
        this.error = error.error?.error || 'Transfer failed. Please try again.';
        this.loading = false;
      }
    );
  }
}

