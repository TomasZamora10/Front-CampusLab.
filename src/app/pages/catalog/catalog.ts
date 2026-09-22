import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CatalogResource, ResourceType } from '../../core/models/campuslab.models';

@Component({
  imports: [FormsModule],
  selector: 'app-catalog',
  styleUrl: './catalog.scss',
  templateUrl: './catalog.html',
})
export class Catalog implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly catalogService = inject(CatalogService);

  protected readonly recursos = signal<CatalogResource[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtroTipo = signal<ResourceType | ''>('');

  protected readonly mostrarFormularioNuevo = signal(false);
  protected readonly guardando = signal(false);
  // Estado de formulario: propiedad simple (no signal), es lo que espera
  // [(ngModel)] para el binding bidireccional.
  protected nuevoRecurso: CatalogResource = this.recursoVacio();

  ngOnInit(): void {
    this.cargar();
  }

  puedeAdministrar(): boolean {
    return this.auth.tieneAlgunRol('ADMIN', 'TECNICO');
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.catalogService.listar(this.filtroTipo() || undefined).subscribe({
      next: (recursos) => {
        this.recursos.set(recursos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(this.mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  cambiarFiltro(tipo: ResourceType | ''): void {
    this.filtroTipo.set(tipo);
    this.cargar();
  }

  abrirFormularioNuevo(): void {
    this.nuevoRecurso = this.recursoVacio();
    this.mostrarFormularioNuevo.set(true);
  }

  cancelarNuevo(): void {
    this.mostrarFormularioNuevo.set(false);
  }

  crearRecurso(): void {
    this.guardando.set(true);
    this.catalogService.crear(this.nuevoRecurso).subscribe({
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

  actualizarStock(recurso: CatalogResource, valor: string): void {
    const nuevoStock = Number(valor);
    if (!Number.isFinite(nuevoStock) || nuevoStock < 0 || !recurso.id) {
      return;
    }
    this.catalogService.actualizarStock(recurso.id, nuevoStock).subscribe({
      next: (actualizado) => {
        this.recursos.update((lista) =>
          lista.map((r) => (r.id === actualizado.id ? actualizado : r)));
      },
      error: (err) => this.error.set(this.mensajeError(err)),
    });
  }

  private recursoVacio(): CatalogResource {
    return { name: '', resourceType: 'EQUIPO', description: '', location: '', stockCupo: 0 };
  }

  private mensajeError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 401) return 'Sesión expirada, vuelve a iniciar sesión.';
    if (status === 403) return 'No tienes permiso para esta acción.';
    return 'No fue posible completar la operación.';
  }
}
