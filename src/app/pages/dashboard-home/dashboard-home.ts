import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.html'
})
export class DashboardHomeComponent implements OnInit {
  stats = { clients: 0, products: 0, invoices: 0, revenue: 0, pending: 0 };
  userName = 'Administratorze';

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.userName = JSON.parse(userStr).name;
      }
      setTimeout(() => {
        this.loadStats();
      }, 300);
    }
  }

  loadStats() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>('http://localhost:3000/api/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Wymuszenie odświeżenia kafelków
      },
      error: (err) => {
        console.error('Błąd pobierania statystyk:', err);
        this.errorMessage = 'Nie udało się połączyć z bazą danych. Spróbuj odświeżyć stronę.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
