import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReportService } from '../../core/services/report.service';
import { Kpis } from '../../core/models/campuslab.models';

@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly reportService = inject(ReportService);

  protected readonly kpis = signal<Kpis | null>(null);
  protected readonly cargandoKpis = signal(false);

  ngOnInit(): void {
    if (this.auth.tieneAlgunRol('ADMIN', 'AUDITOR')) {
      this.cargandoKpis.set(true);
      this.reportService.kpis().subscribe({
        next: (kpis) => {
          this.kpis.set(kpis);
          this.cargandoKpis.set(false);
        },
        error: () => this.cargandoKpis.set(false),
      });
    }
  }
}
