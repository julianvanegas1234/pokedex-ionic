import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./detalle/detalle.page').then((m) => m.DetallePage),
  },
  {
    path: 'formulario',
    loadComponent: () => import('./formulario/formulario.page').then((m) => m.FormularioPage),
  },
  {
    path: 'formulario/:id',
    loadComponent: () => import('./formulario/formulario.page').then((m) => m.FormularioPage),
  },
  {
    path: 'ar',
    loadComponent: () => import('./ar/ar.page').then((m) => m.ArPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];