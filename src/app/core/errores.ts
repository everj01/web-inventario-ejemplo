import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from './modelos';

// Normaliza cualquier error HTTP a { mensaje, errores }
export function leerError(e: unknown): ErrorApi {
  if (e instanceof HttpErrorResponse) {
    const cuerpo = e.error as ErrorApi | null;
    if (cuerpo?.mensaje) return { mensaje: cuerpo.mensaje, errores: cuerpo.errores ?? {} };
    if (e.status === 0) return { mensaje: 'No se pudo conectar con el servidor', errores: {} };
    return { mensaje: `Error ${e.status}`, errores: {} };
  }
  return { mensaje: 'Error inesperado', errores: {} };
}
