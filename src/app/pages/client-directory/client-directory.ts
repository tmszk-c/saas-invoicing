import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Client {
  _id?: string;
  name: string;
  nip: string;
  email: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-client-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-directory.html'
})
export class ClientDirectoryComponent implements OnInit {
  clients: Client[] = [];
  searchQuery: string = '';
  filterStatus: string = 'all';

  isLoading: boolean = true;
  errorMessage: string = '';

  // NOWOŚĆ: Zmienne do obsługi formularza
  showAddForm: boolean = false;
  newClient: Client = { name: '', nip: '', email: '', status: 'active' };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadClients();
      }, 300);
    }
  }

  loadClients() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Client[]>('http://localhost:3000/api/clients')
      .subscribe({
        next: (data) => {
          this.clients = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Błąd pobierania klientów:', err);
          this.errorMessage = 'Nie udało się pobrać danych z bazy.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // NOWOŚĆ: Prawdziwe zapisywanie formularza
  saveClient() {
    if (!this.newClient.name || !this.newClient.nip || !this.newClient.email) {
      alert('Wypełnij wszystkie pola formularza!');
      return;
    }

    this.http.post('http://localhost:3000/api/clients', this.newClient)
      .subscribe({
        next: () => {
          this.loadClients();
          this.showAddForm = false; // Ukrywa formularz po sukcesie
          this.newClient = { name: '', nip: '', email: '', status: 'active' }; // Czyści pola
        },
        error: (err) => console.error('Błąd dodawania klienta:', err)
      });
  }

  get filteredClients() {
    if (!this.clients) return [];
    return this.clients.filter(client => {
      const matchesSearch = (client.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (client.nip || '').includes(this.searchQuery);
      const matchesStatus = this.filterStatus === 'all' || client.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  deleteClient(id: string | undefined) {
    if (!id) return;
    if (confirm('Czy na pewno chcesz usunąć tego klienta z bazy?')) {
      this.http.delete(`http://localhost:3000/api/clients/${id}`)
        .subscribe({
          next: () => this.loadClients(),
          error: (err) => console.error('Błąd usuwania klienta:', err)
        });
    }
  }
}
