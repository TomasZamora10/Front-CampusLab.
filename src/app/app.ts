import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { AdminPingService } from './core/services/admin-ping.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('frontend-campuslab');
  protected readonly isLoggedIn = signal(false);
  protected readonly pingResult = signal<string | null>(null);
  // Roles del App Registration de Azure AD, leidos del claim "roles" del ID
  // token (Admin / Tecnico / Estudiante / Auditor segun el caso CampusLab).
  protected readonly roles = signal<string[]>([]);

  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly adminPingService = inject(AdminPingService);
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
    this.msalBroadcastService.inProgress$
      .pipe(filter((status) => status === InteractionStatus.None))
      .subscribe(() => {
        const accounts = this.msalService.instance.getAllAccounts();
        this.isLoggedIn.set(accounts.length > 0);

        // Al recargar la pagina (sin pasar por el redirect de login) no hay
        // cuenta activa todavia: sin fijarla aqui, MsalInterceptor no puede
        // adquirir el token en silencio para las llamadas al BFF.
        if (accounts.length > 0 && !this.msalService.instance.getActiveAccount()) {
          this.msalService.instance.setActiveAccount(accounts[0]);
        }

        this.roles.set(this.leerRolesDeLaCuentaActiva());
      });
  }

  /**
   * App Roles configurados en el App Registration de Azure AD: llegan en el
   * claim "roles" del ID token de la cuenta activa (mismo claim que valida
   * el BFF en el access token). Si no hay cuenta o el claim no viene, se
   * devuelve un arreglo vacio en vez de fallar.
   */
  private leerRolesDeLaCuentaActiva(): string[] {
    const cuenta = this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];
    const roles = cuenta?.idTokenClaims?.['roles'];
    return Array.isArray(roles) ? (roles as string[]) : [];
  }

  logout(): void {
    this.msalService.logoutRedirect();
  }

  probarAdminPing(): void {
    this.pingResult.set(null);
    this.adminPingService.ping().subscribe({
      next: (respuesta) => {
        console.log('Respuesta de /api/admin/ping:', respuesta);
        this.pingResult.set(JSON.stringify(respuesta));
      },
      error: (error) => {
        console.error('Error llamando a /api/admin/ping:', error);
        this.pingResult.set(`Error ${error.status ?? ''}: ${error.message ?? error}`);
      },
    });
  }
}
