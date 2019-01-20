import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../_services';

@Component({templateUrl: 'login.component.html'})
export class LoginComponent implements OnInit{

    loginForm: FormGroup;
    submitted = false;
    loading = false;
    returnUrl: string;
    error = '';
    


    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    ngOnInit(){
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // logout the person when he opens the app for the first time
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f(){
        return this.loginForm.controls;
    }

    // on submit
    onSubmit(){
        this.submitted = true;

        // stop if form is invalid
        if(this.loginForm.invalid){
            return;
        }

        this.loading = true;

        this.authenticationService.login(this.f.username.value, this.f.password.value)
        .pipe(first())
        .subscribe(
            data => {
                this.router.navigate([this.returnUrl]);
            },
            error => {
                this.error = error;
                this.loading = false;
            }
        )
    }
}