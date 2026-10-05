import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Empresa, Producto, ProductoForm, Usuario } from './modelos';

@Injectable({ providedIn: 'root' })
export class ProductosApi {
  private http = inject(HttpClient);

  listar(buscar?: string) {
    const params = buscar ? new HttpParams().set('buscar', buscar) : undefined;
    return this.http.get<Producto[]>('/api/productos', { params });
  }
  porCodigo(codigo: string) {
    return this.http.get<Producto>(`/api/productos/codigo/${encodeURIComponent(codigo)}`);
  }
  crear(p: ProductoForm) {
    return this.http.post<Producto>('/api/productos', p);
  }
  actualizar(id: number, p: ProductoForm) {
    return this.http.put<Producto>(`/api/productos/${id}`, p);
  }
  moverStock(id: number, cantidad: number) {
    return this.http.patch<Producto>(`/api/productos/${id}/stock`, { cantidad });
  }
  eliminar(id: number) {
    return this.http.delete<void>(`/api/productos/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class UsuariosApi {
  private http = inject(HttpClient);

  listar() {
    return this.http.get<Usuario[]>('/api/usuarios');
  }
  crear(datos: { nombre: string; username: string; password: string; rol: string }) {
    return this.http.post<Usuario>('/api/usuarios', datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`/api/usuarios/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SoporteApi {
  private http = inject(HttpClient);

  empresas() {
    return this.http.get<Empresa[]>('/api/soporte/empresas');
  }
  crearEmpresa(datos: unknown) {
    return this.http.post<Empresa>('/api/soporte/empresas', datos);
  }
  actualizarEmpresa(id: number, datos: unknown) {
    return this.http.put<Empresa>(`/api/soporte/empresas/${id}`, datos);
  }
  usuarios(empresaId: number) {
    return this.http.get<Usuario[]>(`/api/soporte/empresas/${empresaId}/usuarios`);
  }
  productos(empresaId: number) {
    return this.http.get<Producto[]>(`/api/soporte/empresas/${empresaId}/productos`);
  }
  cambiarEstadoUsuario(id: number, activo: boolean) {
    return this.http.patch<Usuario>(`/api/soporte/usuarios/${id}/estado?activo=${activo}`, {});
  }
}
