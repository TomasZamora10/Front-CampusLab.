import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { Kpis, TopResource } from '../models/campuslab.models';

/** Formato que espera el backend: last{N}h o last{N}d (ej. last24h, last7d). */
export type Rango = 'last24h' | 'last7d' | 'last30d';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(Api);

  kpis(range?: Rango): Observable<Kpis> {
    return this.api.get<Kpis>('/report/kpis', { range });
  }

  topResources(range?: Rango, limit = 10): Observable<TopResource[]> {
    return this.api.get<TopResource[]>('/report/top-resources', { range, limit });
  }
}
