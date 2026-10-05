import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductosApi } from '../../core/api';
import { leerError } from '../../core/errores';
import { Producto, ProductoForm } from '../../core/modelos';
import { Codigos } from './codigos';
import { Escaner } from '../../shared/escaner';

const VACIO = (): ProductoForm => ({
  identificador: '', nombre: '', categoria: '', precio: 0, stock: 0, stockMinimo: 5,
});

@Component({
  selector: 'app-productos',
  imports: [FormsModule, DecimalPipe, Codigos, Escaner],
  template: `
    <!-- Resumen en mosaicos -->
    <section class="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div class="tile">
        <p class="text-xs text-tinta/60">Productos</p>
        <p class="text-2xl font-light">{{ productos().length }}</p>
      </div>
      <div class="tile">
        <p class="text-xs text-tinta/60">Valor</p>
        <p class="text-2xl font-light">S/ {{ valor() | number: '1.2-2' }}</p>
      </div>
      <button class="tile text-left" [class.border-ambar]="porReponer()" (click)="soloBajo.set(!soloBajo())">
        <p class="text-xs text-tinta/60">{{ soloBajo() ? 'Filtrando' : 'Por reponer' }}</p>
        <p class="text-2xl font-light" [class.text-ambar]="porReponer()">{{ porReponer() }}</p>
      </button>
      <button class="tile bg-acento text-left text-white" (click)="escaneando.set(true)">
        <p class="text-xs text-white/70">Cámara</p>
        <p class="text-lg leading-7 font-light">Escanear</p>
      </button>
    </section>

    <!-- Barra de acciones -->
    <section class="mb-3 flex flex-wrap gap-2">
      <input class="campo max-w-xs flex-1" placeholder="Buscar por nombre o identificador"
             [(ngModel)]="buscar" (keyup.enter)="cargar()" />
      <button class="btn" (click)="cargar()">Buscar</button>
      <button class="btn-acento" (click)="nuevo()">Nuevo</button>
    </section>

    @if (error()) {
      <p class="mb-3 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ error() }}</p>
    }

    <!-- Tabla (pantallas medianas en adelante) -->
    <div class="hidden overflow-x-auto border border-borde md:block">
      <table class="tabla w-full text-sm">
        <thead>
          <tr>
            <th>Identificador</th>
            <th>Producto</th>
            <th class="text-right">Precio</th>
            <th>Stock</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (p of visibles(); track p.id) {
            <tr [class.bg-ambar]="false" [class.bg-gris]="bajo(p)">
              <td class="font-mono text-xs">{{ p.identificador }}</td>
              <td>
                {{ p.nombre }}
                <span class="text-xs text-tinta/50">{{ p.categoria || '' }}</span>
              </td>
              <td class="text-right tabular-nums">{{ p.precio | number: '1.2-2' }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="btn-icono" (click)="mover(p, -1)">−</button>
                  <span class="w-8 text-center tabular-nums" [class.text-ambar]="bajo(p)">{{ p.stock }}</span>
                  <button class="btn-icono" (click)="mover(p, 1)">+</button>
                  <span class="ml-1 text-xs text-tinta/40">mín {{ p.stockMinimo }}</span>
                </div>
              </td>
              <td class="text-right whitespace-nowrap">
                <button class="text-acento hover:underline" (click)="verCodigos(p)">Códigos</button>
                <button class="ml-3 text-acento hover:underline" (click)="editar(p)">Editar</button>
                <button class="ml-3 text-rojo hover:underline" (click)="eliminar(p)">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="py-6 text-center text-tinta/50">{{ mensajeVacio() }}</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Lista (móvil) -->
    <div class="space-y-2 md:hidden">
      @for (p of visibles(); track p.id) {
        <div class="tile" [class.border-ambar]="bajo(p)">
          <div class="flex justify-between gap-2">
            <div>
              <p class="text-sm font-semibold">{{ p.nombre }}</p>
              <p class="font-mono text-xs text-tinta/50">{{ p.identificador }}</p>
            </div>
            <p class="text-sm tabular-nums">S/ {{ p.precio | number: '1.2-2' }}</p>
          </div>
          <div class="mt-2 flex items-center gap-1">
            <button class="btn-icono" (click)="mover(p, -1)">−</button>
            <span class="w-8 text-center tabular-nums" [class.text-ambar]="bajo(p)">{{ p.stock }}</span>
            <button class="btn-icono" (click)="mover(p, 1)">+</button>
            <span class="ml-auto flex gap-3 text-xs">
              <button class="text-acento" (click)="verCodigos(p)">Códigos</button>
              <button class="text-acento" (click)="editar(p)">Editar</button>
              <button class="text-rojo" (click)="eliminar(p)">Eliminar</button>
            </span>
          </div>
        </div>
      } @empty {
        <p class="py-6 text-center text-sm text-tinta/50">{{ mensajeVacio() }}</p>
      }
    </div>

    <!-- Formulario -->
    @if (mostrarForm()) {
      <div class="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-tinta/40 p-3">
        <form class="mt-6 w-full max-w-lg border border-borde bg-white" (ngSubmit)="guardar()">
          <div class="border-b border-borde px-3 py-2">
            <h2 class="text-sm font-semibold">{{ editandoId() ? 'Editar producto' : 'Nuevo producto' }}</h2>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
            <label class="col-span-2">
              <span class="etiqueta">Identificador (SKU)</span>
              <input class="campo" name="identificador" [(ngModel)]="form.identificador" />
              <span class="error">{{ errores()['identificador'] }}</span>
            </label>
            <label class="col-span-2">
              <span class="etiqueta">Categoría</span>
              <input class="campo" name="categoria" [(ngModel)]="form.categoria" />
            </label>
            <label class="col-span-4">
              <span class="etiqueta">Nombre</span>
              <input class="campo" name="nombre" [(ngModel)]="form.nombre" />
              <span class="error">{{ errores()['nombre'] }}</span>
            </label>
            <label class="col-span-2 sm:col-span-2">
              <span class="etiqueta">Precio</span>
              <input class="campo" type="number" step="0.01" min="0" name="precio" [(ngModel)]="form.precio" />
              <span class="error">{{ errores()['precio'] }}</span>
            </label>
            <label>
              <span class="etiqueta">Stock</span>
              <input class="campo" type="number" min="0" name="stock" [(ngModel)]="form.stock" />
              <span class="error">{{ errores()['stock'] }}</span>
            </label>
            <label>
              <span class="etiqueta">Stock mínimo</span>
              <input class="campo" type="number" min="0" name="stockMinimo" [(ngModel)]="form.stockMinimo" />
              <span class="error">{{ errores()['stockMinimo'] }}</span>
            </label>
          </div>

          @if (errorForm()) {
            <p class="mx-3 mb-2 border-l-4 border-rojo bg-rojo/5 px-2 py-1 text-sm text-rojo">{{ errorForm() }}</p>
          }

          <div class="flex justify-end gap-2 border-t border-borde px-3 py-2">
            <button type="button" class="btn" (click)="mostrarForm.set(false)">Cancelar</button>
            <button class="btn-acento">Guardar</button>
          </div>
        </form>
      </div>
    }

    @if (codigosDe(); as p) {
      <app-codigos [producto]="p" (cerrar)="codigosDe.set(null)" />
    }

    @if (escaneando()) {
      <app-escaner (leido)="buscarCodigo($event)" (cerrar)="escaneando.set(false)" />
    }
  `,
})
export class Productos {
  private api = inject(ProductosApi);

  productos = signal<Producto[]>([]);
  buscar = '';
  soloBajo = signal(false);
  error = signal('');
  escaneando = signal(false);
  codigosDe = signal<Producto | null>(null);

  form: ProductoForm = VACIO();
  editandoId = signal<number | null>(null);
  mostrarForm = signal(false);
  errores = signal<Record<string, string>>({});
  errorForm = signal('');

  visibles = computed(() => this.soloBajo() ? this.productos().filter((p) => this.bajo(p)) : this.productos());
  porReponer = computed(() => this.productos().filter((p) => this.bajo(p)).length);
  valor = computed(() => this.productos().reduce((s, p) => s + Number(p.precio) * p.stock, 0));
  mensajeVacio = computed(() =>
    this.soloBajo() ? 'Todo el stock está por encima del mínimo.' : 'Sin productos. Crea el primero con “Nuevo”.');

  constructor() {
    this.cargar();
  }

  bajo(p: Producto) {
    return p.stock <= p.stockMinimo;
  }

  cargar() {
    this.error.set('');
    this.api.listar(this.buscar.trim() || undefined).subscribe({
      next: (lista) => this.productos.set(lista),
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }

  nuevo() {
    this.form = VACIO();
    this.editandoId.set(null);
    this.abrirForm();
  }

  editar(p: Producto) {
    this.form = {
      identificador: p.identificador, nombre: p.nombre, categoria: p.categoria,
      precio: p.precio, stock: p.stock, stockMinimo: p.stockMinimo,
    };
    this.editandoId.set(p.id);
    this.abrirForm();
  }

  private abrirForm() {
    this.errores.set({});
    this.errorForm.set('');
    this.mostrarForm.set(true);
  }

  guardar() {
    const id = this.editandoId();
    const peticion = id ? this.api.actualizar(id, this.form) : this.api.crear(this.form);
    peticion.subscribe({
      next: () => {
        this.mostrarForm.set(false);
        this.cargar();
      },
      error: (e) => {
        const err = leerError(e);
        this.errores.set(err.errores ?? {});
        this.errorForm.set(err.mensaje);
      },
    });
  }

  mover(p: Producto, cantidad: number) {
    this.api.moverStock(p.id, cantidad).subscribe({
      next: (actualizado) => this.productos.update((lista) => lista.map((x) => (x.id === p.id ? actualizado : x))),
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }

  eliminar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.api.eliminar(p.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }

  verCodigos(p: Producto) {
    this.codigosDe.set(p);
  }

  // Llega del escáner: puede ser el uuid del QR o el identificador del código de barras
  buscarCodigo(codigo: string) {
    this.escaneando.set(false);
    this.api.porCodigo(codigo).subscribe({
      next: (p) => {
        this.productos.update((lista) => (lista.some((x) => x.id === p.id) ? lista : [p, ...lista]));
        this.error.set('');
        this.editar(p);
      },
      error: (e) => this.error.set(leerError(e).mensaje),
    });
  }
}
