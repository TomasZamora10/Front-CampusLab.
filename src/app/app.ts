import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from './core/services/auth.service';
import { Navbar } from './components/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly auth = inject(AuthService);

  private readonly msalService = inject(MsalService);
  private readonly router = inject(Router);

  constructor() {
    // Sin esto, MSAL nunca consume el hash "#code=..." que Azure agrega al
    // volver del loginRedirect(): la app queda mostrando /login con ese hash
    // pegado en la URL y getAllAccounts() nunca deja de estar vacio. Va en
    // el constructor del componente raiz (no en Login) para que se procese
    // una sola vez, apenas arranca la app, sin importar en que ruta haya
    // caido el redirect.
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result?.account) {
          this.msalService.instance.setActiveAccount(result.account);
          // Sin esto, tras un login exitoso la app se queda mostrando la
          // pantalla de /login (nada la saca de ahi), lo cual parece un
          // login roto aunque MSAL ya haya procesado todo bien.
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: (error) => console.error('Error procesando el redirect de MSAL:', error),
    });
  }

  ngOnInit(): void {
    this.auth.inicializar();
  }
}
