import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductsComponent }
];

@NgModule({
  declarations: [LoginComponent, DashboardComponent, ProductsComponent],
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule.forChild(routes)],
  providers: [AuthService, ProductService]
})
export class PosManagementModule { }


