import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../core/auth';

// Marco de la aplicación: barra superior y navegación
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="border-b border-borde">
      <div class="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-1 px-3 py-2">
        <span class="text-xs tracking-widest text-tinta/50">INVENTARIO</span>
        <span class="text-sm font-semibold">{{ sesion()?.empresaNombre }}</span>
        <div class="ml-auto flex items-center gap-3 text-xs text-tinta/60">
          <span>{{ sesion()?.nombre }} · {{ sesion()?.rol === 'ADMIN' ? 'Administrador' : 'Empleado' }}</span>
          <button class="btn no-imprimir" (click)="auth.salir()">Salir</button>
        </div>
      </div>

      <nav class="mx-auto flex max-w-6xl gap-5 px-3 no-imprimir">
        <a routerLink="/app/productos" routerLinkActive="border-acento text-tinta"
           class="-mb-px border-b-2 border-transparent pb-1.5 text-sm text-tinta/60">Productos</a>
        @if (auth.esAdmin()) {
          <a routerLink="/app/usuarios" routerLinkActive="border-acento text-tinta"
             class="-mb-px border-b-2 border-transparent pb-1.5 text-sm text-tinta/60">Usuarios</a>
        }
      </nav>
    </header>

    <main class="mx-auto max-w-6xl px-3 py-4">
      <router-outlet />
    </main>
  `,
})
export class Shell {
  auth = inject(Auth);
  sesion = this.auth.sesion;
}
