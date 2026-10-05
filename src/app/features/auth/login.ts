import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { leerError } from '../../core/errores';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <!-- Panel informativo: solo desktop/tablet ancho -->
      <div class="relative hidden overflow-hidden bg-gradient-to-br from-tinta via-tinta to-[#0a3a63] p-10 lg:flex lg:flex-col lg:justify-between">
        <!-- Manchas de profundidad, sutiles -->
        <div class="pointer-events-none absolute -top-16 -left-16 h-72 w-72 rounded-full bg-acento/30 blur-3xl blob-flotar"></div>
        <div class="pointer-events-none absolute -right-14 -bottom-20 h-80 w-80 rounded-full bg-verde/15 blur-3xl blob-flotar" style="animation-delay:3s"></div>

        <div class="relative z-10">
          <p class="trazo-acento mb-2 h-1 bg-acento"></p>
          <p class="text-xs tracking-widest text-white/50">INVENTARIO</p>
          <h2 class="mt-2 max-w-xs text-3xl font-light text-white">Tu inventario,<br />con criterio.</h2>
          <p class="mt-3 max-w-xs text-sm text-white/60">No solo cuenta productos: te avisa, te ordena y te ahorra tiempo.</p>
        </div>

        <div class="relative z-10 flex flex-col gap-4">
          <div class="feature-in flex items-start gap-3" style="animation-delay:150ms">
            <svg class="mt-0.5 h-5 w-5 shrink-0 text-acento" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-white">Stock en tiempo real</p>
              <p class="text-xs text-white/50">Cada movimiento se refleja al instante.</p>
            </div>
          </div>
          <div class="feature-in flex items-start gap-3" style="animation-delay:300ms">
            <svg class="mt-0.5 h-5 w-5 shrink-0 text-ambar" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
            </svg>
            <div>
              <p class="text-sm font-medium text-white">Alertas de stock bajo</p>
              <p class="text-xs text-white/50">Antes de que se note en el mostrador.</p>
            </div>
          </div>
          <div class="feature-in flex items-start gap-3" style="animation-delay:450ms">
            <svg class="mt-0.5 h-5 w-5 shrink-0 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m4 6V7m4 10v-3M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-white">Reportes al instante</p>
              <p class="text-xs text-white/50">Decisiones con datos, no con intuición.</p>
            </div>
          </div>
        </div>

        <div class="relative z-10 min-h-12 border-l-2 border-acento/60 pl-4">
          @for (frase of [frases[fraseIndex()]]; track fraseIndex()) {
            <p class="feature-in text-sm italic text-white/70">"{{ frase }}"</p>
          }
        </div>
      </div>

      <!-- Formulario -->
      <div class="mx-auto flex w-full max-w-sm flex-col justify-center px-4 py-16">
        <p class="text-xs tracking-widest text-tinta/50">INVENTARIO</p>
        <h1 class="mb-6 text-3xl font-light">Iniciar sesión</h1>

        <form (ngSubmit)="entrar()">
          <label class="etiqueta" for="u">Usuario</label>
          <input id="u" name="u" class="campo mb-3" [(ngModel)]="username" autocomplete="username" />

          <label class="etiqueta" for="p">Contraseña</label>
          <input id="p" name="p" type="password" class="campo mb-4" [(ngModel)]="password" autocomplete="current-password" />

          @if (error()) {
            <p class="mb-3 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ error() }}</p>
          }

          <button class="btn-acento w-full py-2 transition-colors" [disabled]="cargando()">
            {{ cargando() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>

        <div class="mt-8 flex items-center justify-between text-xs text-tinta/50">
          <span>Demo: admin / admin123</span>
          <a routerLink="/soporte/login" class="text-acento hover:underline">Soporte técnico</a>
        </div>
      </div>
    </div>
  `,
})
export class Login implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  error = signal('');
  cargando = signal(false);

  frases = [
    'Lo que no se cuenta, se pierde.',
    'Un inventario claro es una venta segura.',
    'Menos conteo manual, más control.',
    'Saber qué tienes es saber qué puedes vender.',
  ];
  fraseIndex = signal(0);
  private intervalo?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.intervalo = setInterval(() => {
      this.fraseIndex.update((i) => (i + 1) % this.frases.length);
    }, 4500);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  entrar() {
    this.error.set('');
    this.cargando.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/app/productos']),
      error: (e) => {
        this.error.set(leerError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }
}
