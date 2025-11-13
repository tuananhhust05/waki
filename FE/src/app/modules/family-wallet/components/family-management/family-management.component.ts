import { Component, OnInit } from '@angular/core';
import { FamilyService } from '../../services/family.service';

@Component({
  selector: 'app-fw-family',
  templateUrl: './family-management.component.html',
  styleUrls: ['./family-management.component.css']
})
export class FamilyManagementComponent implements OnInit {
  family: any = null;
  newMember = {
    email: '',
    full_name: '',
    phone: '',
    relationship: 'child',
    role: 'member'
  };
  message: string = '';
  errorMessage: string = '';
  loading = false;
  newMemberPassword: string = '';
  newMemberEmail: string = '';
  showPassword: boolean = false;

  constructor(private familyService: FamilyService) {}

  ngOnInit(): void {
    this.loadFamily();
  }

  loadFamily(): void {
    this.familyService.getMyFamily().subscribe(
      (response) => {
        this.family = response.family;
      },
      (error) => {
        console.error('Error loading family:', error);
        this.errorMessage = 'Failed to load family information';
      }
    );
  }

  addMember(): void {
    // Reset messages
    this.message = '';
    this.errorMessage = '';

    // Validation
    if (!this.newMember.full_name || !this.newMember.email) {
      this.errorMessage = 'Full name and email are required';
      return;
    }

    this.loading = true;
    this.familyService.addMember(this.newMember).subscribe(
      (response) => {
        this.message = response.message || 'Member added successfully';
        // Store password and email if new account was created
        if (response.password) {
          this.newMemberPassword = response.password;
          this.newMemberEmail = response.member?.email || this.newMember.email;
          this.showPassword = true;
        }
        this.newMember = { email: '', full_name: '', phone: '', relationship: 'child', role: 'member' };
        this.loading = false;
        this.loadFamily();
        // Clear success message and password after 10 seconds
        setTimeout(() => {
          this.message = '';
          this.showPassword = false;
          this.newMemberPassword = '';
          this.newMemberEmail = '';
        }, 10000);
      },
      (error) => {
        console.error('Add member error:', error);
        this.errorMessage = error.error?.error || error.error?.message || 'Failed to add member';
        this.loading = false;
      }
    );
  }
}


