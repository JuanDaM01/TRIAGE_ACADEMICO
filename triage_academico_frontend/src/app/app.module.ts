import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './appRouting.module';   // Si aún lo usas

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: []   // ← vacío
})
export class AppModule { }