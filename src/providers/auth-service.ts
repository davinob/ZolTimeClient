import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
  
  constructor(private afAuth: AngularFireAuth) { 
   }
  
  public getAuthState():Observable<any>
  {
    return this.afAuth.authState;
  }
  
  loginUser(newEmail: string, newPassword: string): Promise<any> {
  return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }
  
  resetPassword(email: string): Promise<any> {
  return this.afAuth.auth.sendPasswordResetEmail(email);
}
  
  logoutUser(): Promise<any> {
  return this.afAuth.auth.signOut();
  
  }
  

  signupUser(newEmail: string, newPassword: string): Promise<any> {
  return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword);
  }




  
 
}