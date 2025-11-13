import { Component } from '@angular/core';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-school-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'overview', route: '/school-services/dashboard' },
    { label: 'Students', icon: 'students', route: '/school-services/students' },
    { label: 'Attendance', icon: 'attendance', route: '/school-services/attendance' },
    { label: 'Attendance History', icon: 'history', route: '/school-services/attendance/history' }
  ];
}
