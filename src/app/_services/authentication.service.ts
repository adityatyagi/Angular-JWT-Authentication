import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';

// authentication service is used to LOGIN and LOGOUT of the application
// it posts the creds (username and password) to the backend and check for the response if it has JWT token
// if the response from the backend has jwt token, then the authentication was succesful
// on successful authentication, the user details are stored in the local storage + jwt token

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    constructor(private http: HttpClient){}

    // login
    login(username: string, password:string){
        return this.http.post(`${config.apiUrl}/users/authenticate`, {username,password})
        .pipe(
            // the backend service sends an instance of the user
            map(user => {
                // login successful if the response has jwt token
                if(user && user.token){
                    // store user details and jwt token in the local storage to keep the user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }

                return user;
            })
        );
    }



    // logout
    logout(){
        // remove user from local storage
        localStorage.removeItem('currentUser');
    }
}
