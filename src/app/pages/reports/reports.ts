import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { ReportService, Rango } from '../../core/services/report.service';
import { CatalogResource, Kpis, TopResource } from '../../core/models/campuslab.models';

@Component({
  imports: [DecimalPipe, KeyValuePipe, FormsModule],
  selector: 'app-reports',
  styleUrl: './reports.scss',
  templateUrl: './reports.html',
})
export class Reports implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly catalogService = inject(CatalogService);

  protected readonly kpis = signal<Kpis | null>(null);
  protected readonly topResources = signal<TopResource[]>([]);
  protected readonly recursos = signal<CatalogResource[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  // Ejemplo del caso: KPIs por defecto en last24h, top-resources en last7d.
  // El selector de la UI aplica el mismo rango a ambos por simplicidad.
  protected readonly rango = signal<Rango>('last24h');

  ngOnInit(): void {
    this.catalogService.listar().subscribe({ next: (r) => this.recursos.set(r) });
    this.cargar();
  }

  cambiarRango(rango: Rango): void {
    this.rango.set(rango);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.reportService.kpis(this.rango()).subscribe({
      next: (kpis) => {
        this.kpis.set(kpis);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(this.mensajeError(err));
        this.cargando.set(false);
      },
    });

    this.reportService.topResources(this.rango(), 10).subscribe({ next: (r) => this.topResources.set(r) });
  }

  nombreRecurso(recursoId: number): string {
    return this.recursos().find((r) => r.id === recursoId)?.name ?? `Recurso #${recursoId}`;
  }

  private mensajeError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 403) return 'Los reportes son solo para Admin.';
    return 'No fue posible cargar los reportes.';
  }
}
