import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Sprawdzamy czy działa w przeglądarce, żeby uniknąć błędów SSR (hydracji)
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    const user = localStorage.getItem('user');
    if (user) {
      return true; // Użytkownik zalogowany - puszczamy dalej
    }
  }

  // Brak danych = wyrzucamy intruza na stronę logowania
  router.navigate(['/login']);
  return false;
};
