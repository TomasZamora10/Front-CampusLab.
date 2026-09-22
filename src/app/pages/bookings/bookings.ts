import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BookingsService } from '../../core/services/bookings.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CatalogResource, EstadoReserva, Reserva, ReservaRequest } from '../../core/models/campuslab.models';

/** Topologia de la maquina de estados (espejo de EstadoReserva en bookings), solo para decidir que botones mostrar. */
const TRANSICIONES: Record<EstadoReserva, EstadoReserva[]> = {
  SOLICITADA: ['APROBADA', 'CANCELADA'],
  APROBADA: ['EN_PREPARACION', 'CANCELADA'],
  EN_PREPARACION: ['EN_USO', 'CANCELADA'],
  EN_USO: ['DEVUELTA'],
  DEVUELTA: [],
  CANCELADA: [],
};

const ETIQUETAS: Record<EstadoReserva, string> = {
  SOLICITADA: 'Solicitada',
  APROBADA: 'Aprobar',
  EN_PREPARACION: 'Marcar en preparación',
  EN_USO: 'Marcar en uso',
  DEVUELTA: 'Marcar devuelta',
  CANCELADA: 'Cancelar',
};

@Component({
  imports: [FormsModule, DatePipe],
  selector: 'app-bookings',
  styleUrl: './bookings.scss',
  templateUrl: './bookings.html',
})
export class Bookings implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly bookingsService = inject(BookingsService);
  private readonly catalogService = inject(CatalogService);

  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly recursos = signal<CatalogResource[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtroEstado = signal<EstadoReserva | ''>('');

  protected readonly mostrarFormularioNuevo = signal(false);
  protected readonly guardando = signal(false);
  protected nuevaReserva: ReservaRequest = this.reservaVacia();

  protected readonly cancelandoId = signal<number | null>(null);
  protected motivoCancelacion = '';

  readonly ETIQUETAS = ETIQUETAS;

  ngOnInit(): void {
    this.cargar();
    this.catalogService.listar().subscribe({ next: (r) => this.recursos.set(r) });
  }

  puedeCrear(): boolean {
    return this.auth.tieneAlgunRol('ADMIN', 'ESTUDIANTE');
  }

  transicionesDisponibles(reserva: Reserva): EstadoReserva[] {
    return TRANSICIONES[reserva.estado] ?? [];
  }

  nombreRecurso(recursoId: number): string {
    return this.recursos().find((r) => r.id === recursoId)?.name ?? `Recurso #${recursoId}`;
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.bookingsService.listar({ estado: this.filtroEstado() || undefined }).subscribe({
      next: (pagina) => {
        this.reservas.set(pagina.content);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(this.mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  cambiarFiltro(estado: EstadoReserva | ''): void {
    this.filtroEstado.set(estado);
    this.cargar();
  }

  abrirFormularioNuevo(): void {
    this.nuevaReserva = this.reservaVacia();
    this.mostrarFormularioNuevo.set(true);
  }

  cancelarNuevo(): void {
    this.mostrarFormularioNuevo.set(false);
  }

  crearReserva(): void {
    this.guardando.set(true);
    this.bookingsService.crear(this.nuevaReserva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormularioNuevo.set(false);
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(err));
      },
    });
  }

  transicionar(reserva: Reserva, nuevoEstado: EstadoReserva): void {
    if (nuevoEstado === 'CANCELADA') {
      this.cancelandoId.set(reserva.id);
      this.motivoCancelacion = '';
      return;
    }
    this.ejecutarTransicion(reserva.id, nuevoEstado);
  }

  confirmarCancelacion(reserva: Reserva): void {
    if (!this.motivoCancelacion.trim()) {
      return;
    }
    this.ejecutarTransicion(reserva.id, 'CANCELADA', this.motivoCancelacion.trim());
  }

  cancelarCancelacion(): void {
    this.cancelandoId.set(null);
  }

  private ejecutarTransicion(id: number, nuevoEstado: EstadoReserva, motivoCancelacion?: string): void {
    this.error.set(null);
    this.bookingsService.cambiarEstado(id, { nuevoEstado, motivoCancelacion }).subscribe({
      next: () => {
        this.cancelandoId.set(null);
        this.cargar();
      },
      error: (err) => this.error.set(this.mensajeError(err)),
    });
  }

  private reservaVacia(): ReservaRequest {
    return { recursoId: this.recursos()[0]?.id ?? 0, fechaInicio: '', fechaFin: '', observaciones: '' };
  }

  private mensajeError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    const detalle = (err as { error?: { message?: string } })?.error?.message;
    if (status === 401) return 'Sesión expirada, vuelve a iniciar sesión.';
    if (status === 403) return 'No tienes permiso para esta acción.';
    if (status === 400 && detalle) return detalle;
    return 'No fue posible completar la operación.';
  }
}
