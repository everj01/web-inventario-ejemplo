import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// Usuarios de empresa (ADMIN o EMPLEADO)
export const guardEmpresa: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const s = auth.sesion();
  if (s && s.rol !== 'SUPERADMIN') return true;
  return router.createUrlTree(['/login']);
};

export const guardAdmin: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.esAdmin() ? true : router.createUrlTree(['/app/productos']);
};

export const guardSoporte: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.esSoporte() ? true : router.createUrlTree(['/soporte/login']);
};
