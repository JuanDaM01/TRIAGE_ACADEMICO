import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    form: FormGroup;

    showPassword = false;

    constructor(private fb: FormBuilder) {

        this.form = this.fb.group({
            email: [
                '',
                [
                    Validators.required,
                    Validators.email
                ]
            ],

            password: [
                '',
                Validators.required
            ],

            remember: [false]
        });
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        console.log(this.form.value);

        /**
         * AQUÍ VA TU LOGIN
         */
    }

    get email() {
        return this.form.get('email');
    }

    get password() {
        return this.form.get('password');
    }
}