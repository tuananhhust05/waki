import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Waki Platform';
  mobileMenuOpen = false;
  servicesMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.servicesMenuOpen = false;
    }
  }

  toggleServicesMenu() {
    this.servicesMenuOpen = !this.servicesMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.servicesMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.has-dropdown') && !target.closest('.menu-toggle') && !target.closest('.mobile-dropdown')) {
      this.servicesMenuOpen = false;
    }
  }
}


