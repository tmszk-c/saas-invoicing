import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Client { _id?: string; name: string; nip: string; email?: string; }
export interface Product { _id?: string; name: string; priceNetto: number; vatRate: number; }
export interface InvoiceItem extends Product { itemId: string; quantity: number; gross: number; }

@Component({
  selector: 'app-invoice-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-creator.html'
})
export class InvoiceCreatorComponent implements OnInit {
  clients: Client[] = [];
  products: Product[] = [];

  selectedClientId: string = '';
  items: InvoiceItem[] = [];
  isSubmitting: boolean = false;
  errors: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadClients();
    this.loadProducts();
  }

  loadClients() {
    this.http.get<Client[]>('http://localhost:3000/api/clients').subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Błąd pobierania klientów:', err)
    });
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost:3000/api/products').subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error('Błąd pobierania produktów:', err)
    });
  }

  get selectedClient() {
    return this.clients.find(c => c._id === this.selectedClientId);
  }

  get totalGross() {
    return this.items.reduce((sum, item) => sum + item.gross * item.quantity, 0);
  }

  addProduct(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const productId = selectElement.value;
    if (!productId) return;

    const product = this.products.find(p => p._id === productId);
    if (product) {
      this.items.push({
        ...product,
        itemId: Date.now().toString(),
        quantity: 1,
        gross: product.priceNetto * (1 + product.vatRate / 100)
      });
      this.errors = [];
    }
    selectElement.value = '';
  }

  removeItem(itemId: string) {
    this.items = this.items.filter(item => item.itemId !== itemId);
  }

  // ZAKTUALIZOWANA FUNKCJA WYSTAWIANIA FAKTURY
  handleSubmit() {
    this.errors = [];
    if (!this.selectedClientId) this.errors.push("Wybierz nabywcę z bazy danych.");
    if (this.items.length === 0) this.errors.push("Dodaj przynajmniej jedną pozycję do faktury.");

    if (this.errors.length > 0) return;

    this.isSubmitting = true;
    const client = this.selectedClient;

    // Generowanie prostego numeru faktury na podstawie dzisiejszej daty
    const today = new Date();
    const invoiceNumber = `FV/${today.getFullYear()}/${today.getMonth() + 1}/${Math.floor(Math.random() * 1000)}`;

    // Składamy paczkę z danymi dla serwera Node.js
    const newInvoice = {
      number: invoiceNumber,
      clientName: client?.name,
      clientNip: client?.nip,
      items: this.items,
      totalGross: this.totalGross,
      issueDate: today.toISOString().split('T')[0],
      status: 'pending' // Domyślnie oczekuje na wysyłkę do KSeF
    };

    // Wysyłamy do bazy!
    this.http.post('http://localhost:3000/api/invoices', newInvoice)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          alert(`Sukces! Faktura ${invoiceNumber} została wygenerowana i zapisana w chmurze!`);

          // Czyszczenie formularza po sukcesie
          this.items = [];
          this.selectedClientId = '';
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Błąd zapisu faktury:', err);
          alert('Wystąpił błąd podczas zapisywania faktury. Sprawdź serwer.');
        }
      });
  }
}
