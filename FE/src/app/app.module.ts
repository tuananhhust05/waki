import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { IconComponent } from './components/icon/icon.component';

// Family Wallet Module
import { FamilyWalletModule } from './modules/family-wallet/family-wallet.module';

// POS Management Module
import { PosManagementModule } from './modules/pos-management/pos-management.module';

// AI Technologies Module
import { AiTechnologiesModule } from './modules/ai-technologies/ai-technologies.module';

// School Services Module
import { SchoolServicesModule } from './modules/school-services/school-services.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    IconComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FamilyWalletModule,
    PosManagementModule,
    AiTechnologiesModule,
    SchoolServicesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


