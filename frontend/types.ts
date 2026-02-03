
export interface StatusKlienta {
  idStatusKlienta: number;
  Nazwa: string;
}

export interface TypZadania {
  idTypZadania: number;
  Nazwa: string;
}

export interface StatusZadania {
  idStatusZadania: number;
  Nazwa: string;
}

export interface TypUmowy {
  idTypUmowy: number;
  Nazwa: string;
}

export interface Product {
  idProduktu: number;
  NazwaProduktu: string;
  Jednostka: string;
  CenaBazowa: number;
  CenaKonkurencji?: number;
  StanMagazynowy: number; 
}

export interface Employee {
  idPracownika: number;
  Imie: string;
  Nazwisko: string;
  Rola: 'Szef' | 'Przedstawiciel';
  ObszarZadania?: string;
  user?: number;
  // login?: string; // Dla potrzeb logowania w aplikacji
  // password?: string;
}

export interface Client {
  idKlienta: number;
  NazwaFirmy: string;
  Adres: string;
  Miasto: string;
  idStatusKlienta: number;
  Email: string;
  NIP: string;
  idStatusKlienta: number;
}

export interface DecisionMaker {
  idOsoby: number;
  idKlienta: number;
  Imie: string;
  Nazwisko: string;
  Stanowisko: string;
  Telefon: string;
}

export interface Task {
  idZadania: number;
  idPracownika: number;
  idKlienta: number;
  idTypZadania: number;
  DataPlanowana: string;
  DataWykonania?: string;
  idStatusZadania: number;
  WynikNotatka?: string;
}

export interface Contract {
  idUmowy: number;
  idKlienta: number;
  idPracownika: number;
  idProduktu: number;
  Ilosc: number;
  idTypUmowy: number;
  DataZawarcia: string;
  KwotaUmowy: number;
  PrzedmiotUmowy: string;
  Pozycje?: any[];
}
