import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'family-wallet',
    loadChildren: () => import('./modules/family-wallet/family-wallet.module').then(m => m.FamilyWalletModule)
  },
  {
    path: 'pos-management',
    loadChildren: () => import('./modules/pos-management/pos-management.module').then(m => m.PosManagementModule)
  },
  {
    path: 'ai-technologies',
    loadChildren: () => import('./modules/ai-technologies/ai-technologies.module').then(m => m.AiTechnologiesModule)
  },
  {
    path: 'school-services',
    loadChildren: () => import('./modules/school-services/school-services.module').then(m => m.SchoolServicesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


