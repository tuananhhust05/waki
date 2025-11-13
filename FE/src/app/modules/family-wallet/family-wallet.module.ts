import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FamilyManagementComponent } from './components/family-management/family-management.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { PaymentComponent } from './components/payment/payment.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

import { AuthService } from './services/auth.service';
import { WalletService } from './services/wallet.service';
import { FamilyService } from './services/family.service';
import { PaymentService } from './services/payment.service';
import { NotificationService } from './services/notification.service';
import { SocketService } from './services/socket.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'family', component: FamilyManagementComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'transfer', component: TransferComponent },
  { path: 'expense', component: ExpenseComponent },
  { path: 'notifications', component: NotificationsComponent }
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    FamilyManagementComponent,
    WalletComponent,
    PaymentComponent,
    TransferComponent,
    ExpenseComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    AuthService,
    WalletService,
    FamilyService,
    PaymentService,
    NotificationService,
    SocketService
  ]
})
export class FamilyWalletModule { }


