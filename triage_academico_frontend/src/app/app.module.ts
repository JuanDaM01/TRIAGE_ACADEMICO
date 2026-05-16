import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
    declarations: [],
    imports: [
        BrowserModule
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