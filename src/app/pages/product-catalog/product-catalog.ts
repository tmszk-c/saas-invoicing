import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Product {
  _id?: string;
  name: string;
  sku: string;
  priceNetto: number;
  vatRate: number;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-catalog.html'
})
export class ProductCatalogComponent implements OnInit {
  products: Product[] = [];
  searchQuery: string = '';

  isLoading: boolean = true;
  errorMessage: string = '';

  // NOWOŚĆ: Formularz dla produktów
  showAddForm: boolean = false;
  newProduct: Product = { name: '', sku: '', priceNetto: 0, vatRate: 23 };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadProducts();
      }, 300);
    }
  }

  loadProducts() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Product[]>('http://localhost:3000/api/products')
      .subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Błąd pobierania produktów:', err);
          this.errorMessage = 'Nie udało się wczytać katalogu produktów.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // NOWOŚĆ: Zapis produktu z formularza
  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.sku || this.newProduct.priceNetto <= 0) {
      alert('Uzupełnij nazwę, kod SKU i podaj cenę większą od zera!');
      return;
    }

    this.http.post('http://localhost:3000/api/products', this.newProduct)
      .subscribe({
        next: () => {
          this.loadProducts();
          this.showAddForm = false;
          this.newProduct = { name: '', sku: '', priceNetto: 0, vatRate: 23 };
        },
        error: (err) => console.error('Błąd dodawania produktu:', err)
      });
  }

  get filteredProducts() {
    if (!this.products) return [];
    return this.products.filter(product =>
      (product.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (product.sku || '').toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  deleteProduct(id: string | undefined) {
    if (!id) return;
    if (confirm('Czy na pewno chcesz usunąć ten produkt z cennika?')) {
      this.http.delete(`http://localhost:3000/api/products/${id}`)
        .subscribe({
          next: () => this.loadProducts(),
          error: (err) => console.error('Błąd usuwania produktu:', err)
        });
    }
  }
}
