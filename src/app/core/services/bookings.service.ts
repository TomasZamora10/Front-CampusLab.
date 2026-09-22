import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import {
  CambioEstadoRequest,
  EstadoReserva,
  PageResponse,
  Reserva,
  ReservaRequest,
} from '../models/campuslab.models';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly api = inject(Api);

  listar(filtros?: { estado?: EstadoReserva; recursoId?: number; page?: number; size?: number }):
    Observable<PageResponse<Reserva>> {
    return this.api.get<PageResponse<Reserva>>('/bookings', {
      estado: filtros?.estado,
      recursoId: filtros?.recursoId,
      page: filtros?.page ?? 0,
      size: filtros?.size ?? 20,
      sort: 'fechaCreacion,desc',
    });
  }

  obtener(id: number): Observable<Reserva> {
    return this.api.get<Reserva>(`/bookings/${id}`);
  }

  crear(reserva: ReservaRequest): Observable<Reserva> {
    return this.api.post<Reserva>('/bookings', reserva);
  }

  cambiarEstado(id: number, cambio: CambioEstadoRequest): Observable<Reserva> {
    return this.api.put<Reserva>(`/bookings/${id}/status`, cambio);
  }
}
