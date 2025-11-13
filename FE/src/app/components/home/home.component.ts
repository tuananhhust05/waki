import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  services = [
    {
      id: 'family-wallet',
      name: 'Family Wallet',
      description: 'Manage family finances, expenses, and budgets with ease',
      icon: 'wallet',
      route: '/family-wallet/login'
    },
    {
      id: 'pos-management',
      name: 'POS Management',
      description: 'Complete point of sale system for your business',
      icon: 'shopping-cart',
      route: '/pos-management/login'
    },
    {
      id: 'ai-technologies',
      name: 'AI Technologies',
      description: 'Cutting-edge artificial intelligence solutions',
      icon: 'ai',
      route: '/ai-technologies/login'
    },
    {
      id: 'school-services',
      name: 'School Services',
      description: 'Comprehensive school management services',
      icon: 'school',
      route: '/school-services/login'
    }
  ];

  features = [
    {
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with end-to-end encryption',
      icon: 'check'
    },
    {
      title: 'Easy to Use',
      description: 'Intuitive interface designed for everyone',
      icon: 'check'
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support when you need it',
      icon: 'check'
    },
    {
      title: 'Scalable',
      description: 'Grows with your business needs',
      icon: 'check'
    }
  ];

  stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500+', label: 'Businesses' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  constructor(private router: Router) {}

  navigateToService(route: string) {
    this.router.navigate([route]);
  }
}

