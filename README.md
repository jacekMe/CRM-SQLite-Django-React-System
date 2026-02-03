# System CRM "Firma X" 🚀

## 📝 Opis projektu
Full-stackowy system CRM stworzony w celu usprawnienia zarządzania relacjami z klientami oraz monitorowania działań sprzedażowych. Aplikacja oferuje system logowania z podziałem na role (Szef/Przedstawiciel), co pozwala na precyzyjne zarządzanie uprawnieniami wewnątrz organizacji.

## 🛠 Technologie
* **Backend:** Django (Python), Django REST Framework
* **Frontend:** React.js, Node.js
* **Baza danych:** SQLite
* **Komunikacja:** REST API

## ✨ Kluczowe funkcjonalności
* **Zarządzanie klientami:** Pełny moduł CRUD (tworzenie, odczyt, aktualizacja, usuwanie).
* **System ról:** * **Szef:** Pełny dostęp do danych i zarządzania użytkownikami.
  * **Przedstawiciel:** Ograniczony dostęp, skupiony na operacjach sprzedażowych.
* **Bezpieczeństwo:** Autoryzacja i uwierzytelnianie użytkowników.

## 🚀 Uruchomienie projektu
Szczegółowe instrukcje instalacji dla systemów Windows oraz Linux/macOS znajdują się w pliku [instrukcja.txt](./instrukcja.txt).

### Szybki start (wymagany Python i Node.js):
1. **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS lub .\venv\Scripts\activate na Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
## 👤 Dane testowe do logowania
* **Szef:**
  * login: `jan`
  * hasło: `pass123`
* **Przedstawiciel:**
  * login: `adam`
  * hasło: `pass123`  
