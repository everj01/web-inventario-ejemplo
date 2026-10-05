export type Rol = 'SUPERADMIN' | 'ADMIN' | 'EMPLEADO';

export interface Sesion {
  token: string;
  id: number;
  uuid: string;
  nombre: string;
  username: string;
  rol: Rol;
  empresaId: number | null;
  empresaNombre: string | null;
}

export interface Producto {
  id: number;
  uuid: string;            // identificador público -> va en el QR
  identificador: string;   // SKU del negocio -> va en el código de barras
  nombre: string;
  categoria: string | null;
  precio: number;
  stock: number;
  stockMinimo: number;
}

export type ProductoForm = Omit<Producto, 'id' | 'uuid'>;

export interface Usuario {
  id: number;
  uuid: string;
  nombre: string;
  username: string;
  rol: Rol;
  activo: boolean;
  empresaId: number | null;
  empresaNombre: string | null;
}

export interface Empresa {
  id: number;
  uuid: string;
  nombre: string;
  ruc: string | null;
  activo: boolean;
  usuarios: number;
  productos: number;
}

// Forma de los errores que devuelve el backend
export interface ErrorApi {
  mensaje: string;
  errores?: Record<string, string>;
}
