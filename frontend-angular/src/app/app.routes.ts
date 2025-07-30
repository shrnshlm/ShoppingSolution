import { Routes } from '@angular/router';
import { SignalsBasic } from './signals-basic/signals-basic';
import { SignalsAdvanced } from './signals-advanced/signals-advanced';
import { SignalsHttp } from './signals-http/signals-http';

export const routes: Routes = [
  { path: '', redirectTo: '/signals-basic', pathMatch: 'full' },
  { path: 'signals-basic', component: SignalsBasic },
  { path: 'signals-advanced', component: SignalsAdvanced },
  { path: 'signals-http', component: SignalsHttp },
  { path: '**', redirectTo: '/signals-basic' }
];