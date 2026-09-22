import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { AuditEntry, PageResponse } from '../models/campuslab.models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly api = inject(Api);

  listar(filtros?: { eventType?: string; page?: number; size?: number }):
    Observable<PageResponse<AuditEntry>> {
    return this.api.get<PageResponse<AuditEntry>>('/audit', {
      eventType: filtros?.eventType,
      page: filtros?.page ?? 0,
      size: filtros?.size ?? 20,
      sort: 'eventTimestamp,desc',
    });
  }

  timelineDeReserva(reservaId: number): Observable<PageResponse<AuditEntry>> {
    return this.api.get<PageResponse<AuditEntry>>(`/audit/reservas/${reservaId}`, {
      size: 100,
      sort: 'eventTimestamp,asc',
    });
  }
}
