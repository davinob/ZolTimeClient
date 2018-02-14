import { Component,ViewChild } from '@angular/core';
import { 
  IonicPage, 
  NavController} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../providers/auth-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import { LoginPage } from '../login/login';
import { EmailValidator } from '../../validators/email';
import { UserService } from '../../providers/user-service';

 

@IonicPage()
@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {
 
  
  public signupForm:FormGroup;

  constructor(public nav: NavController, public authService: AuthService, 
    public formBuilder: FormBuilder,
    public userService: UserService,
    public alertAndLoadingService: AlertAndLoadingService,

    ) {

    this.signupForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      name: ['', Validators.required],
     });
    
    
    
    
  }

  signupUser(){
    if (!this.signupForm.valid){
      console.log("FORM INVALID"+this.signupForm.value);
    } else {
      this.authService.signupUser(this.signupForm.value.email, this.signupForm.value.password)
      .then(user => {
        console.log("LOGOUT:"+user);
        this.authService.logoutUser().then(()=>
        {
        console.log("SIGNUP:"+user);
        
         this.userService.createUser(
          user.uid, user.email, this.signupForm.value.name)
        .then(()=> {
          this.nav.setRoot(LoginPage);
          console.log("Document successfully written!");
          })
          .catch((error)=> {
            this.alertAndLoadingService.showToast(error);
          });
        });
      }).catch((error) => {
        this.alertAndLoadingService.showToast(error);
       
      });

   
      this.alertAndLoadingService.showLoading();
    }
  }
  
 

  
  
  
 
   
    
    
  
    
}