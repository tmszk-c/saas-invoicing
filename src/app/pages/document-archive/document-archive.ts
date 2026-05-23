import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Invoice {
  _id?: string;
  number: string;
  clientName: string;
  clientNip?: string;
  issueDate: string;
  totalGross: any;
  status: string;
  items?: any[];
  ksefId?: string;
}

@Component({
  selector: 'app-document-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-archive.html'
})
export class DocumentArchiveComponent implements OnInit {
  invoices: Invoice[] = [];
  searchQuery: string = '';

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadInvoices();
      }, 300);
    }
  }
// Wywołanie prawdziwego połączenia z KSeF (Krok 1)
  sendToKsef(invoiceId: string | undefined) {
    if (!invoiceId) return;

    if (confirm('Czy połączyć się z Ministerstwem Finansów (KSeF Test)?')) {
      this.http.put(`http://localhost:3000/api/invoices/${invoiceId}/ksef`, {})
        .subscribe({
          next: (response: any) => {
            alert(response.message);
            // Nie odświeżamy jeszcze statusu, bo to dopiero Krok 1
          },
          error: (err) => alert('Błąd połączenia z KSeF: ' + err.message)
        });
    }
  }
  loadInvoices() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any[]>('http://localhost:3000/api/invoices')
      .subscribe({
        next: (data) => {
          // Mapujemy dane i zaokrąglamy totalGross dla każdej faktury
          this.invoices = data.map(inv => ({
            ...inv,
            totalGross: Number(inv.totalGross).toFixed(2)
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Błąd pobierania faktur z bazy:', err);
          this.errorMessage = 'Nie udało się wczytać archiwum wystawionych faktur.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get filteredInvoices() {
    if (!this.invoices) return [];
    const query = (this.searchQuery || '').toLowerCase();

    return this.invoices.filter(inv => {
      const num = (inv.number || '').toLowerCase();
      const client = (inv.clientName || '').toLowerCase();
      return num.includes(query) || client.includes(query);
    });
  }

  downloadPdf(invoiceNumber: string) {
    const invoice = this.invoices.find(inv => inv.number === invoiceNumber);
    if (!invoice) {
      alert('Nie znaleziono szczegółów faktury!');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FAKTURA VAT', 14, 22);

    doc.setFontSize(11);
    doc.text(`Numer: ${invoice.number}`, 14, 32);
    doc.text(`Data wystawienia: ${invoice.issueDate}`, 14, 38);

    doc.setFontSize(12);
    doc.text('Sprzedawca:', 14, 55);
    doc.setFontSize(10);
    doc.text('Moja Firma SaaS (Test)', 14, 62);
    doc.text('NIP: 1112223344', 14, 68);

    doc.setFontSize(12);
    doc.text('Nabywca:', 110, 55);
    doc.setFontSize(10);
    doc.text(invoice.clientName, 110, 62);
    if (invoice.clientNip) {
      doc.text(`NIP: ${invoice.clientNip}`, 110, 68);
    }

    const tableBody = invoice.items && invoice.items.length > 0
      ? invoice.items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        `${item.priceNetto} zl`,
        `${item.vatRate}%`,
        `${(item.gross * item.quantity).toFixed(2)} zl`
      ])
      : [['-', 'Brak szczegolow', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: 80,
      head: [['Lp.', 'Nazwa uslugi/produktu', 'Ilosc', 'Cena Netto', 'VAT', 'Wartosc Brutto']],
      body: tableBody,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text(`DO ZAPLATY: ${Number(invoice.totalGross).toFixed(2)} zl`, 14, finalY + 15);

    const safeFileName = `Faktura_${invoice.number.replace(/\//g, '_')}.pdf`;
    doc.save(safeFileName);
  }
}
