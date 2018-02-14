import { Component } from '@angular/core';
import { 
  IonicPage, 
  NavController} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import { EmailValidator } from '../../validators/email';
import { TutorialPage } from '../tutorial/tutorial';
import 'rxjs/add/operator/map';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  
  public loginForm:FormGroup;
  
  public errorMessages:any[];
  
  constructor(public navCtrl: NavController, public authService: AuthService, 
    public formBuilder: FormBuilder, 
    public alertAndLoadingService: AlertAndLoadingService, public userService:UserService) {
    
      this.loginForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
      });
      
            

  }
  
   loginUser(){
     console.log("LOGIN CALLLED");
    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
    } else {
      this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {
         console.log(authData);
         console.log(authData.uid);
        this.userService.initCurrentUser(authData.uid);
        }).catch((error) => {
        this.authService.logoutUser();
        this.alertAndLoadingService.showToast(error);
        
      });

    this.alertAndLoadingService.showLoading();
    }
  }

  goToResetPassword(){
    this.navCtrl.push('ResetPasswordPage');
  }

  createAccount(){
    this.navCtrl.push('SignUpPage');
  }
  
  



}