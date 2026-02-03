
import { Client, Employee, Product, Task, Contract, StatusKlienta, TypZadania, StatusZadania, TypUmowy } from './types';

export const DICT_STATUS_KLIENTA: StatusKlienta[] = [
  { idStatusKlienta: 1, Nazwa: 'Potencjalny' },
  { idStatusKlienta: 2, Nazwa: 'Aktywny' }
];

export const DICT_TYP_ZADANIA: TypZadania[] = [
  { idTypZadania: 1, Nazwa: 'Wizyta' },
  { idTypZadania: 2, Nazwa: 'Telefon' }
];

export const DICT_STATUS_ZADANIA: StatusZadania[] = [
  { idStatusZadania: 1, Nazwa: 'Zaplanowane' },
  { idStatusZadania: 2, Nazwa: 'Zrealizowane' }
];

export const DICT_TYP_UMOWY: TypUmowy[] = [
  { idTypUmowy: 1, Nazwa: 'Dostawa ciągła' },
  { idTypUmowy: 2, Nazwa: 'Jednorazowa' },
  { idTypUmowy: 3, Nazwa: 'Promocyjna' }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { idPracownika: 1, Imie: 'Jan', Nazwisko: 'Kowalski', login: 'jan', password: '123', Rola: 'Przedstawiciel', ObszarZadania: 'Poznań' },
  { idPracownika: 2, Imie: 'Anna', Nazwisko: 'Nowak', login: 'anna', password: '123', Rola: 'Przedstawiciel', ObszarZadania: 'Wrocław' },
  { idPracownika: 3, Imie: 'Piotr', Nazwisko: 'Wiśniewski', login: 'piotr', password: '123', Rola: 'Przedstawiciel', ObszarZadania: 'Szczecin' },
  { idPracownika: 4, Imie: 'Marek', Nazwisko: 'Szef', login: 'szef', password: 'admin', Rola: 'Szef', ObszarZadania: 'Zielona Góra' },
];

export const MOCK_CLIENTS: Client[] = [
  { idKlienta: 1, NazwaFirmy: 'Sklep u Aliny', Adres: 'ul. Główna 1', Miasto: 'Poznań', NIP: '1234567890', Email: 'alina@sklep.pl', idStatusKlienta: 2 },
  { idKlienta: 2, NazwaFirmy: 'Warzywniak Zielony', Adres: 'ul. Leśna 5', Miasto: 'Wrocław', NIP: '0987654321', Email: 'zielony@market.pl', idStatusKlienta: 1 },
  { idKlienta: 3, NazwaFirmy: 'Eko-Market', Adres: 'ul. Polna 12', Miasto: 'Szczecin', NIP: '1122334455', Email: 'kontakt@ekomarket.pl', idStatusKlienta: 2 },
];

export const MOCK_PRODUCTS: Product[] = [
  { idProduktu: 1, NazwaProduktu: 'Jabłka Eko', Jednostka: 'kg', CenaBazowa: 4.50, CenaKonkurencji: 4.80, currentStock: 1250 },
  { idProduktu: 2, NazwaProduktu: 'Marchewka Bio', Jednostka: 'kg', CenaBazowa: 3.20, CenaKonkurencji: 3.10, currentStock: 420 },
  { idProduktu: 3, NazwaProduktu: 'Jaja wiejskie', Jednostka: 'szt', CenaBazowa: 1.20, CenaKonkurencji: 1.50, currentStock: 85 },
];

export const MOCK_TASKS: Task[] = [
  { idZadania: 1, idPracownika: 1, idKlienta: 1, idTypZadania: 1, DataPlanowana: '2024-05-20T10:00:00', idStatusZadania: 2, DataWykonania: '2024-05-20T10:30:00', WynikNotatka: 'Klient zadowolony z dostawy.' },
  { idZadania: 2, idPracownika: 1, idKlienta: 1, idTypZadania: 2, DataPlanowana: '2024-05-22T09:00:00', idStatusZadania: 1 },
  { idZadania: 3, idPracownika: 2, idKlienta: 2, idTypZadania: 1, DataPlanowana: '2024-05-21T14:00:00', idStatusZadania: 1 },
];

export const MOCK_CONTRACTS: Contract[] = [
  { 
    idUmowy: 1, 
    idKlienta: 1, 
    idPracownika: 1, 
    idProduktu: 1, 
    Ilosc: 300, 
    idTypUmowy: 1, 
    DataZawarcia: '2024-05-01', 
    KwotaUmowy: 1350, 
    PrzedmiotUmowy: 'Jabłka Eko' 
  },
  { 
    idUmowy: 2, 
    idKlienta: 3, 
    idPracownika: 3, 
    idProduktu: 2, 
    Ilosc: 150, 
    idTypUmowy: 2, 
    DataZawarcia: '2024-05-10', 
    KwotaUmowy: 480, 
    PrzedmiotUmowy: 'Marchewka Bio' 
  },
];
