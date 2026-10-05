import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { leerError } from '../../core/errores';

// Acceso exclusivo del SUPERADMIN; el backend rechaza aquí a cualquier otro rol
@Component({
  selector: 'app-login-soporte',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-tinta text-white">
      <div class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <p class="text-xs tracking-widest text-white/50">SOPORTE TÉCNICO</p>
        <h1 class="mb-6 text-3xl font-light">Acceso interno</h1>

        <form (ngSubmit)="entrar()">
          <label class="mb-0.5 block text-xs text-white/60" for="u">Usuario</label>
          <input id="u" name="u" class="mb-3 w-full border border-white/30 bg-transparent px-2 py-1 text-sm outline-none focus:border-white"
                 [(ngModel)]="username" autocomplete="username" />

          <label class="mb-0.5 block text-xs text-white/60" for="p">Contraseña</label>
          <input id="p" name="p" type="password" class="mb-4 w-full border border-white/30 bg-transparent px-2 py-1 text-sm outline-none focus:border-white"
                 [(ngModel)]="password" autocomplete="current-password" />

          @if (error()) {
            <p class="mb-3 border-l-4 border-rojo bg-white/5 px-2 py-1 text-sm">{{ error() }}</p>
          }

          <button class="w-full border border-white bg-white px-3 py-2 text-sm text-tinta hover:bg-white/90" [disabled]="cargando()">
            {{ cargando() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>

        <div class="mt-8 flex items-center justify-between text-xs text-white/50">
          <span>Demo: soporte / soporte123</span>
          <a routerLink="/login" class="hover:underline">Volver</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginSoporte {
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  error = signal('');
  cargando = signal(false);

  entrar() {
    this.error.set('');
    this.cargando.set(true);
    this.auth.loginSoporte(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/soporte']),
      error: (e) => {
        this.error.set(leerError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }
}
