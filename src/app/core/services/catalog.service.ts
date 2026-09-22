import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { CatalogResource, ResourceType } from '../models/campuslab.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(Api);

  listar(tipo?: ResourceType): Observable<CatalogResource[]> {
    return this.api.get<CatalogResource[]>('/catalog/resources', { type: tipo });
  }

  obtener(id: number): Observable<CatalogResource> {
    return this.api.get<CatalogResource>(`/catalog/resources/${id}`);
  }

  crear(recurso: CatalogResource): Observable<CatalogResource> {
    return this.api.post<CatalogResource>('/catalog/resources', recurso);
  }

  actualizarStock(id: number, stockCupo: number): Observable<CatalogResource> {
    return this.api.put<CatalogResource>(`/catalog/resources/${id}`, { stockCupo });
  }
}
