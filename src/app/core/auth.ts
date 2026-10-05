import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Sesion } from './modelos';

const CLAVE = 'inventario.sesion';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  // La sesión es una señal: los componentes se redibujan solos cuando cambia
  readonly sesion = signal<Sesion | null>(this.leerGuardada());
  readonly esAdmin = computed(() => this.sesion()?.rol === 'ADMIN');
  readonly esSoporte = computed(() => this.sesion()?.rol === 'SUPERADMIN');

  private leerGuardada(): Sesion | null {
    const txt = localStorage.getItem(CLAVE);
    return txt ? (JSON.parse(txt) as Sesion) : null;
  }

  get token(): string | null {
    return this.sesion()?.token ?? null;
  }

  login(username: string, password: string) {
    return this.http.post<Sesion>('/api/auth/login', { username, password })
      .pipe(tap((s) => this.guardar(s)));
  }

  loginSoporte(username: string, password: string) {
    return this.http.post<Sesion>('/api/auth/soporte/login', { username, password })
      .pipe(tap((s) => this.guardar(s)));
  }

  private guardar(s: Sesion) {
    localStorage.setItem(CLAVE, JSON.stringify(s));
    this.sesion.set(s);
  }

  salir() {
    const soporte = this.esSoporte();
    localStorage.removeItem(CLAVE);
    this.sesion.set(null);
    this.router.navigate([soporte ? '/soporte/login' : '/login']);
  }
}
