import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  companyName = '';
  nip = '';
  email = '';
  password = '';

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    if (this.companyName && this.nip && this.email && this.password) {

      // Paczka z danymi do bazy
      const newUser = {
        companyName: this.companyName,
        nip: this.nip,
        email: this.email,
        password: this.password
      };

      // Wysyłamy prośbę do Node.js
      this.http.post('http://localhost:3000/api/register', newUser)
        .subscribe({
          next: () => {
            alert('Konto utworzone pomyślnie! Możesz się teraz zalogować.');
            this.router.navigate(['/login']); // Przekierowanie na logowanie
          },
          error: (err) => {
            alert(err.error.message || 'Wystąpił błąd podczas rejestracji.');
          }
        });

    } else {
      alert('Wypełnij wszystkie pola!');
    }
  }
}
