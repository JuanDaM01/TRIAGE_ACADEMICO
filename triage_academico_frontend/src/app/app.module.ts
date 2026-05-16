import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule 
    ],
    providers: [
        provideAnimations(),
        provideHttpClient(
            withInterceptors([authInterceptor])
        )
    ],
    bootstrap: []
})
export class AppModule { }