import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  constructor(private msalService: MsalService) {}

  login() {
    this.msalService.loginRedirect();
  }
}