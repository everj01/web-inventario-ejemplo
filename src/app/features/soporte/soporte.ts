import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SoporteApi } from '../../core/api';
import { leerError } from '../../core/errores';
import { Auth } from '../../core/auth';
import { Empresa, Producto, Usuario } from '../../core/modelos';

// Panel del SUPERADMIN: ve y administra todas las empresas
@Component({
  selector: 'app-soporte',
  imports: [FormsModule],
  template: `
    <header class="bg-tinta text-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-4 px-3 py-2">
        <span class="text-xs tracking-widest text-white/50">SOPORTE TÉCNICO</span>
        <span class="text-sm font-semibold">Todas las empresas</span>
        <div class="ml-auto flex items-center gap-3 text-xs text-white/60">
          <span>{{ auth.sesion()?.nombre }}</span>
          <button class="border border-white/40 px-3 py-1 hover:bg-white/10" (click)="auth.salir()">Salir</button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-3 py-4">
      @if (error()) {
        <p class="mb-3 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ error() }}</p>
      }

      <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 class="mb-2 text-sm tracking-widest text-tinta/50">EMPRESAS</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            @for (e of empresas(); track e.id) {
              <button class="tile text-left" [class.border-acento]="seleccionada()?.id === e.id" (click)="seleccionar(e)">
                <div class="flex items-baseline justify-between">
                  <p class="text-sm font-semibold">{{ e.nombre }}</p>
                  <span class="text-xs" [class.text-rojo]="!e.activo">{{ e.activo ? 'Activa' : 'Inactiva' }}</span>
                </div>
                <p class="text-xs text-tinta/50">RUC {{ e.ruc || '—' }}</p>
                <p class="mt-1 text-xs text-tinta/60">{{ e.usuarios }} usuarios · {{ e.productos }} productos</p>
                <p class="font-mono text-[10px] break-all text-tinta/40">{{ e.uuid }}</p>
              </button>
            } @empty {
              <p class="text-sm text-tinta/50">No hay empresas registradas.</p>
            }
          </div>

          @if (seleccionada(); as emp) {
            <div class="mt-4 border border-borde">
              <div class="flex flex-wrap items-center gap-2 border-b border-borde px-3 py-2">
                <h3 class="text-sm font-semibold">{{ emp.nombre }}</h3>
                <button class="btn ml-auto" (click)="alternarEstado(emp)">
                  {{ emp.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </div>

              <div class="grid gap-4 p-3 md:grid-cols-2">
                <div>
                  <p class="mb-1 text-xs tracking-widest text-tinta/50">USUARIOS</p>
                  <table class="tabla w-full text-sm">
                    <tbody>
                      @for (u of usuarios(); track u.id) {
                        <tr>
                          <td>{{ u.nombre }}<span class="block text-xs text-tinta/50">{{ u.username }}</span></td>
                          <td class="text-xs">{{ u.rol }}</td>
                          <td class="text-right">
                            <button class="text-acento hover:underline" (click)="alternarUsuario(u)">
                              {{ u.activo ? 'Desactivar' : 'Activar' }}
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <div>
                  <p class="mb-1 text-xs tracking-widest text-tinta/50">PRODUCTOS</p>
                  <table class="tabla w-full text-sm">
                    <tbody>
                      @for (p of productos(); track p.id) {
                        <tr>
                          <td class="font-mono text-xs">{{ p.identificador }}</td>
                          <td>{{ p.nombre }}</td>
                          <td class="text-right tabular-nums">{{ p.stock }}</td>
                        </tr>
                      } @empty {
                        <tr><td class="py-3 text-center text-tinta/50">Sin productos</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
        </section>

        <form class="h-fit border border-borde p-3" (ngSubmit)="crearEmpresa()">
          <h2 class="mb-2 text-sm font-semibold">Dar de alta una empresa</h2>

          <label class="etiqueta">Nombre de la empresa</label>
          <input class="campo mb-2" name="nombre" [(ngModel)]="form.empresa.nombre" />
          <span class="error">{{ errores()['nombre'] }}</span>

          <label class="etiqueta">RUC</label>
          <input class="campo mb-3" name="ruc" [(ngModel)]="form.empresa.ruc" />

          <p class="mb-1 border-t border-borde pt-2 text-xs tracking-widest text-tinta/50">PRIMER ADMINISTRADOR</p>

          <label class="etiqueta">Nombre</label>
          <input class="campo mb-2" name="adminNombre" [(ngModel)]="form.admin.nombre" />

          <label class="etiqueta">Usuario</label>
          <input class="campo mb-2" name="adminUsername" [(ngModel)]="form.admin.username" />
          <span class="error">{{ errores()['username'] }}</span>

          <label class="etiqueta">Contraseña</label>
          <input class="campo mb-3" type="password" name="adminPassword" [(ngModel)]="form.admin.password" />
          <span class="error">{{ errores()['password'] }}</span>

          @if (errorForm()) {
            <p class="mb-2 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ errorForm() }}</p>
          }
          <button class="btn-acento w-full">Crear empresa</button>
        </form>
      </div>
    </main>
  `,
})
export class Soporte {
  private api = inject(SoporteApi);
  auth = inject(Auth);

  empresas = signal<Empresa[]>([]);
  seleccionada = signal<Empresa | null>(null);
  usuarios = signal<Usuario[]>([]);
  productos = signal<Producto[]>([]);
  error = signal('');
  errorForm = signal('');
  errores = signal<Record<string, string>>({});

  form = {
    empresa: { nombre: '', ruc: '', activo: true },
    admin: { nombre: '', username: '', password: '', rol: 'ADMIN' },
  };

  constructor() {
    this.cargar();
  }

  cargar() {
    this.api.empresas().subscribe({
      next: (lista) => this.empresas.set(lista),
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }

  seleccionar(e: Empresa) {
    this.seleccionada.set(e);
    this.api.usuarios(e.id).subscribe({ next: (u) => this.usuarios.set(u) });
    this.api.productos(e.id).subscribe({ next: (p) => this.productos.set(p) });
  }

  alternarEstado(e: Empresa) {
    this.api.actualizarEmpresa(e.id, { nombre: e.nombre, ruc: e.ruc, activo: !e.activo }).subscribe({
      next: (actualizada) => {
        this.seleccionada.set(actualizada);
        this.cargar();
      },
      error: (err) => this.error.set(leerError(err).mensaje),
    });
  }

  alternarUsuario(u: Usuario) {
    this.api.cambiarEstadoUsuario(u.id, !u.activo).subscribe({
      next: (actualizado) => this.usuarios.update((lista) => lista.map((x) => (x.id === u.id ? actualizado : x))),
      error: (err) => this.error.set(leerError(err).mensaje),
    });
  }

  crearEmpresa() {
    this.errores.set({});
    this.errorForm.set('');
    this.api.crearEmpresa(this.form).subscribe({
      next: () => {
        this.form = {
          empresa: { nombre: '', ruc: '', activo: true },
          admin: { nombre: '', username: '', password: '', rol: 'ADMIN' },
        };
        this.cargar();
      },
      error: (e) => {
        const err = leerError(e);
        this.errores.set(err.errores ?? {});
        this.errorForm.set(err.mensaje);
      },
    });
  }
}
