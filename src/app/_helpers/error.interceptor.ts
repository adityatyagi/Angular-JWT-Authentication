import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthenticationService } from "../_services";

/*
Http error interceptor works with the calling service and the API's
It intercepts the responses from the API and check for the status codes (if there were any errors).
Error Status 401: Unauthorized Response - the user will be automatically logged out
All other errors are RE-THROWN to be caught by the calling service so an alert can be displayed to the user 
 */

 @Injectable()
 export class ErrorInterceptor implements HttpInterceptor{
     constructor(private authenticationService: AuthenticationService){}

     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        return next.handle(request)
        .pipe(
            catchError(err => {
                if(err.status === 401){
                    // auto logout on unauthorized response
                    this.authenticationService.logout();
                    location.reload(true);
                }

                const error = err.error.message || err.statusText;
                return throwError(error);

            })
        )
     }

}

