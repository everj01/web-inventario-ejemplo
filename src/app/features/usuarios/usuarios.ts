import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosApi } from '../../core/api';
import { leerError } from '../../core/errores';
import { Auth } from '../../core/auth';
import { Usuario } from '../../core/modelos';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  template: `
    <div class="grid gap-4 md:grid-cols-[1fr_300px]">
      <section>
        <h2 class="mb-2 text-sm tracking-widest text-tinta/50">USUARIOS DE LA EMPRESA</h2>
        @if (error()) {
          <p class="mb-3 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ error() }}</p>
        }
        <div class="border border-borde">
          <table class="tabla w-full text-sm">
            <thead>
              <tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th></th></tr>
            </thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr>
                  <td>{{ u.nombre }}</td>
                  <td class="text-tinta/60">{{ u.username }}</td>
                  <td>{{ u.rol === 'ADMIN' ? 'Administrador' : 'Empleado' }}</td>
                  <td class="text-right">
                    @if (u.id !== auth.sesion()?.id) {
                      <button class="text-rojo hover:underline" (click)="eliminar(u)">Eliminar</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <form class="h-fit border border-borde p-3" (ngSubmit)="crear()">
        <h2 class="mb-2 text-sm font-semibold">Nuevo usuario</h2>

        <label class="etiqueta">Nombre</label>
        <input class="campo mb-2" name="nombre" [(ngModel)]="form.nombre" />
        <span class="error">{{ errores()['nombre'] }}</span>

        <label class="etiqueta">Usuario</label>
        <input class="campo mb-2" name="username" [(ngModel)]="form.username" />
        <span class="error">{{ errores()['username'] }}</span>

        <label class="etiqueta">Contraseña</label>
        <input class="campo mb-2" type="password" name="password" [(ngModel)]="form.password" />
        <span class="error">{{ errores()['password'] }}</span>

        <label class="etiqueta">Rol</label>
        <select class="campo mb-3" name="rol" [(ngModel)]="form.rol">
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>

        @if (errorForm()) {
          <p class="mb-2 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ errorForm() }}</p>
        }
        <button class="btn-acento w-full">Crear usuario</button>
      </form>
    </div>
  `,
})
export class Usuarios {
  private api = inject(UsuariosApi);
  auth = inject(Auth);

  usuarios = signal<Usuario[]>([]);
  error = signal('');
  errorForm = signal('');
  errores = signal<Record<string, string>>({});
  form = { nombre: '', username: '', password: '', rol: 'EMPLEADO' };

  constructor() {
    this.cargar();
  }

  cargar() {
    this.api.listar().subscribe({
      next: (lista) => this.usuarios.set(lista),
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }

  crear() {
    this.errores.set({});
    this.errorForm.set('');
    this.api.crear(this.form).subscribe({
      next: () => {
        this.form = { nombre: '', username: '', password: '', rol: 'EMPLEADO' };
        this.cargar();
      },
      error: (e) => {
        const err = leerError(e);
        this.errores.set(err.errores ?? {});
        this.errorForm.set(err.mensaje);
      },
    });
  }

  eliminar(u: Usuario) {
    if (!confirm(`¿Eliminar al usuario "${u.username}"?`)) return;
    this.api.eliminar(u.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }
}
