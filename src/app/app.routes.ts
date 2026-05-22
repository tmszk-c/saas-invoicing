import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout';
import { ClientDirectoryComponent } from './pages/client-directory/client-directory';
import { InvoiceCreatorComponent } from './pages/invoice-creator/invoice-creator';
import { ProductCatalogComponent } from './pages/product-catalog/product-catalog';
import { DocumentArchiveComponent } from './pages/document-archive/document-archive';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home';
import { authGuard } from './guards/auth.guard'; // Importujemy strażnika

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard], // 🛡️ STRAŻNIK: Blokuje dostęp do całego panelu dzieci poniżej!
    children: [
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'clients', component: ClientDirectoryComponent },
      { path: 'invoice/new', component: InvoiceCreatorComponent },
      { path: 'products', component: ProductCatalogComponent },
      { path: 'archive', component: DocumentArchiveComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
