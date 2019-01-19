import { Injectable } from "@angular/core";
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';;

/*
FAKE BACKEND

This will serve as a standalone backend with delayed response so that it can imitate a real backend - using 
DELAYED OBSERVABLE

1. It will check the user credentails that come from "Authentication Service" during login
2. It will also work as a fake database keeping the user details - The user can requests for the user details only when the requests has valid JWT Token in its request authorization header

API
1. To check credentials - /users/authenticate
2. To give back user details - /users
*/


@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor{
    
    constructor(){}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        // test user - (one of the users detais in database)
        let testUser  = {
            id: 1, 
            username: 'test',
            password: 'test',
            firstName: 'Test',
            lastName: 'User'
        }

        // wrapping the API's in delayed observable to simulate the Server API Calls
        return of(null).pipe(
            mergeMap(() => {

                // API 1: Authenticate - Will be hit by Authentication Service - STARTS
                if(request.url.endsWith('/users/authenticate') && request.method === 'POST'){


                    //check the credentials entered by the user with the data in database
                    if(request.body.username === testUser.username && request.body.password === testUser.password){
                        
                        // if login details are valid, return status 200 with a Fake JWT Token
                        let body = {
                            id: testUser.id,
                            username: testUser.username,
                            firstName: testUser.firstName,
                            lastName: testUser.lastName,
                            token: '0000-fake-jwt-token-0000'
                        }

                        return of(new HttpResponse({status: 200, body}))
                    }
                    else {
                        // if the credentials by user doesn't match the data in the db, return Status 400 - Bad Request
                        return throwError({
                            error: {
                                message: 'Username or Password is incorrect.'
                            }
                        })
                    }
                }
                // API 1: Authenticate - Will be hit by Authentication Service - ENDS



                // SECURE API END POINT - will check for valid JWT Token in Request
                // API 2: Get all users data (we now have only 1 user - testUser) - STARTS
                if(request.url.endsWith('/users') && request.method === 'GET'){

                    // check for a fake jwt token. If valid JWT token found, return the list of users, else throw error
                    if(request.headers.get('Authorization') === 'Bearer 0000-fake-jwt-token-0000'){
                        return of(new HttpResponse({status: 200, body: [testUser]}));
                    }
                    else{
                        // invalid JWT token found in request header
                        return throwError({
                            error: {
                                message: 'Unauthorized'
                            }
                        });
                    }
                }
                // API 2: Get all users data (we now have only 1 user - testUser) - ENDS


                // Pass any other requests left (unhandled
                return next.handle(request);
            })
        )
        // call materialize and dematerialize to ensure delay even if an error is thrown
        .pipe(materialize())
        .pipe(delay(500))
        .pipe(dematerialize());
    }
}

// creating a PROVIDER
export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};


