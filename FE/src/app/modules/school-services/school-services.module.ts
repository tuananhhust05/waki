import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentsComponent } from './components/students/students.component';
import { StudentCreateComponent } from './components/student-create/student-create.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { AttendanceHistoryComponent } from './components/attendance-history/attendance-history.component';
import { AuthService } from './services/auth.service';
import { SchoolService } from './services/school.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'students/create', component: StudentCreateComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'attendance-history', component: AttendanceHistoryComponent }
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    StudentsComponent,
    StudentCreateComponent,
    AttendanceComponent,
    AttendanceHistoryComponent
  ],
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule.forChild(routes)],
  providers: [AuthService, SchoolService]
})
export class SchoolServicesModule { }


