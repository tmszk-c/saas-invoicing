import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    if (this.email && this.password) {

      this.http.post<any>('http://localhost:3000/api/login', {
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response) => {
          // Jeśli baza nas przepuści, zapisujemy dane w przeglądarce, żeby pamiętała, że jesteśmy zalogowani
          localStorage.setItem('user', JSON.stringify(response.user));

          // Otwieramy bramy do aplikacji
          this.router.navigate(['/clients']);
        },
        error: (err) => {
          // Komunikat, gdy np. podamy złe hasło
          alert(err.error.message || 'Nieprawidłowy e-mail lub hasło!');
        }
      });

    } else {
      alert('Wpisz e-mail i hasło!');
    }
  }
}
