import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Llama a GET /api/admin/ping en el BFF. Solo sirve para verificar
 * manualmente, de punta a punta, que MSAL adjunta el token via
 * MsalInterceptor y que el BFF lo valida y autoriza correctamente.
 */
@Injectable({ providedIn: 'root' })
export class AdminPingService {
  private readonly http = inject(HttpClient);

  ping() {
    return this.http.get(`${environment.apiConfig.uri}/admin/ping`);
  }
}
