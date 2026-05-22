import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.html'
})
export class DashboardLayoutComponent {
  navigation = [
    { name: 'Pulpit', href: '/dashboard', icon: '📊' },
    { name: 'Klienci', href: '/clients', icon: '👥' },
    { name: 'Utwórz fakturę', href: '/invoice/new', icon: '📄' },
    { name: 'Produkty', href: '/products', icon: '📦' },
    { name: 'Archiwum', href: '/archive', icon: '📁' },
  ];

  constructor(private router: Router) {}

  // NOWOŚĆ: Funkcja czyszcząca pamięć po wylogowaniu
  logout() {
    if (confirm('Czy na pewno chcesz się wylogować?')) {
      localStorage.removeItem('user'); // Usuwamy "bilet wstępu"
      this.router.navigate(['/login']); // Wyrzucamy na zewnątrz
    }
  }
}
