import { Routes } from '@angular/router';
import { guardAdmin, guardEmpresa, guardSoporte } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app/productos' },

  { path: 'login', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },

  { path: 'soporte/login', loadComponent: () => import('./features/auth/login-soporte').then((m) => m.LoginSoporte) },

  {
    path: 'app',
    canActivate: [guardEmpresa],
    loadComponent: () => import('./features/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
      { path: 'productos', loadComponent: () => import('./features/productos/productos').then((m) => m.Productos) },
      { path: 'usuarios', canActivate: [guardAdmin], loadComponent: () => import('./features/usuarios/usuarios').then((m) => m.Usuarios) },
    ],
  },

  {
    path: 'soporte',
    canActivate: [guardSoporte],
    loadComponent: () => import('./features/soporte/soporte').then((m) => m.Soporte),
  },

  { path: '**', redirectTo: 'app/productos' },
];
