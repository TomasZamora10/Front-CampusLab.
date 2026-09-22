import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { AuditEntry } from '../../core/models/campuslab.models';

@Component({
  imports: [DatePipe, FormsModule],
  selector: 'app-audit',
  styleUrl: './audit.scss',
  templateUrl: './audit.html',
})
export class Audit implements OnInit {
  private readonly auditService = inject(AuditService);

  protected readonly entradas = signal<AuditEntry[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtroReservaId = signal<string>('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const reservaId = Number(this.filtroReservaId());
    const consulta = reservaId > 0
      ? this.auditService.timelineDeReserva(reservaId)
      : this.auditService.listar();

    consulta.subscribe({
      next: (pagina) => {
        this.entradas.set(pagina.content);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(this.mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  limpiarFiltro(): void {
    this.filtroReservaId.set('');
    this.cargar();
  }

  private mensajeError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 403) return 'La auditoría es solo para Admin/Auditor.';
    return 'No fue posible cargar el timeline de auditoría.';
  }
}
