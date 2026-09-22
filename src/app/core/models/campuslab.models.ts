export type ResourceType = 'LABORATORIO' | 'EQUIPO' | 'INSUMO';

export interface CatalogResource {
  id?: number;
  name: string;
  resourceType: ResourceType;
  description?: string;
  location?: string;
  stockCupo: number;
  createdAt?: string;
  updatedAt?: string;
}

export type EstadoReserva =
  | 'SOLICITADA'
  | 'APROBADA'
  | 'EN_PREPARACION'
  | 'EN_USO'
  | 'DEVUELTA'
  | 'CANCELADA';

export interface Reserva {
  id: number;
  recursoId: number;
  usuarioSolicitanteId: number;
  estado: EstadoReserva;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
  aprobadoPor?: number;
  fechaAprobacion?: string;
  motivoCancelacion?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface ReservaRequest {
  recursoId: number;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
}

export interface CambioEstadoRequest {
  nuevoEstado: EstadoReserva;
  motivoCancelacion?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditEntry {
  id: number;
  eventId: string;
  eventType: string;
  reservaId: number;
  recursoId?: number;
  usuarioId?: number;
  estado?: string;
  traceId?: string;
  correlationId?: string;
  eventTimestamp: string;
  recibidoEn: string;
}

export interface Kpis {
  totalReservas: number;
  porEstado: Record<string, number>;
  tasaAprobacion: number;
  tasaCancelacion: number;
}

export interface TopResource {
  recursoId: number;
  cantidadReservas: number;
}
