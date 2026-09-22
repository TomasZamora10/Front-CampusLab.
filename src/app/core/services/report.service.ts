import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { Kpis, TopResource } from '../models/campuslab.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(Api);

  kpis(): Observable<Kpis> {
    return this.api.get<Kpis>('/report/kpis');
  }

  topResources(limit = 10): Observable<TopResource[]> {
    return this.api.get<TopResource[]>('/report/top-resources', { limit });
  }
}
