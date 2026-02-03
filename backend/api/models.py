from django.db import models
from django.contrib.auth.models import User


# --- 1. SŁOWNIKI (Tabele Słownikowe) ---

class StatusKlienta(models.Model):
    idStatusKlienta = models.AutoField(primary_key=True)
    Nazwa = models.CharField(max_length=100)

    def __str__(self):
        return self.Nazwa

class TypZadania(models.Model):
    idTypZadania = models.AutoField(primary_key=True)
    Nazwa = models.CharField(max_length=100)

    def __str__(self):
        return self.Nazwa

class StatusZadania(models.Model):
    idStatusZadania = models.AutoField(primary_key=True)
    Nazwa = models.CharField(max_length=100)

    def __str__(self):
        return self.Nazwa

class TypUmowy(models.Model):
    idTypUmowy = models.AutoField(primary_key=True)
    Nazwa = models.CharField(max_length=100)

    def __str__(self):
        return self.Nazwa

# --- 2. TABELE NIEZALEŻNE ---

class Produkty(models.Model):
    idProduktu = models.AutoField(primary_key=True)
    NazwaProduktu = models.CharField(max_length=200)
    Jednostka = models.CharField(max_length=20, null=True, blank=True)
    CenaBazowa = models.DecimalField(max_digits=10, decimal_places=2)
    CenaKonkurencji = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    StanMagazynowy = models.IntegerField(default=0)

    def __str__(self):
        return self.NazwaProduktu

# --- PRACOWNICY I LOGOWANIE ---
# Łączę tabelę Pracownicy z wbudowanym systemem logowania Django (User).
class Pracownicy(models.Model):
    idPracownika = models.AutoField(primary_key=True)
    # Link do użytkownika systemowego (login/hasło)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    Imie = models.CharField(max_length=50)
    Nazwisko = models.CharField(max_length=50)
    Rola = models.CharField(max_length=50) # 'Szef' lub 'Przedstawiciel'
    ObszarZadania = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.Imie} {self.Nazwisko} ({self.Rola})"

# --- 3. TABELE ZALEŻNE ---

class Klienci(models.Model):
    idKlienta = models.AutoField(primary_key=True)
    NazwaFirmy = models.CharField(max_length=100)
    Adres = models.CharField(max_length=100, null=True, blank=True)
    Miasto = models.CharField(max_length=50, null=True, blank=True)
    Email = models.CharField(max_length=100, null=True, blank=True)
    NIP = models.CharField(max_length=15, null=True, blank=True)
    
    # Relacja do słownika
    idStatusKlienta = models.ForeignKey(StatusKlienta, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.NazwaFirmy

class OsobyDecyzyjne(models.Model):
    idOsoby = models.AutoField(primary_key=True)
    idKlienta = models.ForeignKey(Klienci, on_delete=models.CASCADE, related_name='osoby_decyzyjne')
    Imie = models.CharField(max_length=50, null=True, blank=True)
    Nazwisko = models.CharField(max_length=50, null=True, blank=True)
    Stanowisko = models.CharField(max_length=100, null=True, blank=True)
    Telefon = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.Imie} {self.Nazwisko}"

class Zadania(models.Model):
    idZadania = models.AutoField(primary_key=True)
    idPracownika = models.ForeignKey(Pracownicy, on_delete=models.CASCADE)
    idKlienta = models.ForeignKey(Klienci, on_delete=models.CASCADE)
    idTypZadania = models.ForeignKey(TypZadania, on_delete=models.SET_NULL, null=True)
    
    DataPlanowana = models.DateTimeField(null=True, blank=True)
    DataWykonania = models.DateTimeField(null=True, blank=True)
    
    idStatusZadania = models.ForeignKey(StatusZadania, on_delete=models.SET_NULL, null=True)
    WynikNotatka = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Zadanie dla {self.idKlienta}"

class Umowy(models.Model):
    idUmowy = models.AutoField(primary_key=True)
    idKlienta = models.ForeignKey(Klienci, on_delete=models.CASCADE)
    idPracownika = models.ForeignKey(Pracownicy, on_delete=models.CASCADE)
    idProduktu = models.ForeignKey(Produkty, on_delete=models.SET_NULL, null=True)
    
    Ilosc = models.IntegerField(null=True, blank=True)
    idTypUmowy = models.ForeignKey(TypUmowy, on_delete=models.SET_NULL, null=True)
    
    DataZawarcia = models.DateTimeField(auto_now_add=True) # auto_now_add to odpowiednik DEFAULT GETDATE()
    KwotaUmowy = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    PrzedmiotUmowy = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Umowa nr {self.idUmowy}"