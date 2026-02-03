from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    StatusKlienta, TypZadania, StatusZadania, TypUmowy, 
    Produkty, Pracownicy, Klienci, OsobyDecyzyjne, Zadania, Umowy
)
from datetime import datetime

class Command(BaseCommand):
    help = 'Wypełnia bazę danymi z SQL Server'

    def handle(self, *args, **kwargs):
        self.stdout.write("--- START: Czyszczenie starej bazy ---")
        
        # Usuwamy dane w odwrotnej kolejności (żeby nie naruszyć kluczy obcych)
        Umowy.objects.all().delete()
        Zadania.objects.all().delete()
        OsobyDecyzyjne.objects.all().delete()
        Klienci.objects.all().delete()
        Pracownicy.objects.all().delete()
        Produkty.objects.all().delete()
        TypUmowy.objects.all().delete()
        StatusZadania.objects.all().delete()
        TypZadania.objects.all().delete()
        StatusKlienta.objects.all().delete()
        
        # Usuwamy userów systemowych (poza superuserem adminem, jeśli istnieje)
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write("--- 1. WYPEŁNIANIE SŁOWNIKÓW ---")

        # StatusKlienta (ID będą: 1, 2, 3, 4)
        StatusKlienta.objects.create(Nazwa='Potencjalny')
        StatusKlienta.objects.create(Nazwa='Aktywny')
        StatusKlienta.objects.create(Nazwa='Archiwalny')
        StatusKlienta.objects.create(Nazwa='Zablokowany')

        # TypZadania
        TypZadania.objects.create(Nazwa='Telefon - Pierwszy kontakt')
        TypZadania.objects.create(Nazwa='Spotkanie handlowe')
        TypZadania.objects.create(Nazwa='Telefon - Follow up (po ofercie)')
        TypZadania.objects.create(Nazwa='Telefon - Quality Check (po dostawie)')
        TypZadania.objects.create(Nazwa='Wysyłka Newslettera')
        TypZadania.objects.create(Nazwa='Monitoring cen konkurencji')

        # StatusZadania
        StatusZadania.objects.create(Nazwa='Zaplanowane')
        StatusZadania.objects.create(Nazwa='Zrealizowane')
        StatusZadania.objects.create(Nazwa='Anulowane')

        # TypUmowy
        TypUmowy.objects.create(Nazwa='Sprzedaż') # ID 1
        TypUmowy.objects.create(Nazwa='Kupno')    # ID 2

        self.stdout.write("--- 2. PRODUKTY ---")
        
        products_data = [
            ('Ziemniak Jadalny Gala', 'kg', 1.80, 2.10),
            ('Marchew Płukana Premium', 'kg', 2.20, 2.45),
            ('Cebula Żółta', 'kg', 2.00, 2.30),
            ('Kapusta Biała', 'szt', 4.50, 5.20),
            ('Pomidor Malinowy Polski', 'kg', 9.50, 11.00),
            ('Ogórek Gruntowy', 'kg', 6.00, 7.50),
            ('Jabłko Szampion', 'kg', 3.00, 3.40),
            ('Gruszka Konferencja', 'kg', 5.50, 6.20),
            ('Śliwka Węgierka', 'kg', 4.80, 5.50),
            ('Truskawka Deserowa (Sezon)', 'kg', 14.00, 16.50),
            ('Jajka Wiejskie "0" (Wolny wybieg) - Paleta 30szt', 'szt', 35.00, 39.00),
            ('Jajka Rozmiar L - Paleta 30szt', 'szt', 28.00, 32.00),
            ('Pietruszka Korzeń', 'kg', 6.50, 7.80),
            ('Burak Czerwony', 'kg', 1.50, 1.80),
        ]
        
        for p in products_data:
            Produkty.objects.create(NazwaProduktu=p[0], Jednostka=p[1], CenaBazowa=p[2], CenaKonkurencji=p[3])

        self.stdout.write("--- 3. PRACOWNICY (I USERZY) ---")

        # Funkcja pomocnicza do tworzenia pracownika z loginem
        def create_emp(username, imie, nazwisko, rola, obszar):
            user = User.objects.create_user(username=username, email=f'{username}@firma.pl', password='pass123')
            Pracownicy.objects.create(user=user, Imie=imie, Nazwisko=nazwisko, Rola=rola, ObszarZadania=obszar)

        # ID 1: Jan Kowalski (Szef)
        create_emp('jan', 'Jan', 'Kowalski', 'Szef', 'Zielona Góra - Centrala')
        # ID 2: Adam Nowak (Poznań)
        create_emp('adam', 'Adam', 'Nowak', 'Przedstawiciel Handlowy', 'Poznań')
        # ID 3: Piotr Wiśniewski (Szczecin)
        create_emp('piotr', 'Piotr', 'Wiśniewski', 'Przedstawiciel Handlowy', 'Szczecin')
        # ID 4: Anna Zielińska (Wrocław)
        create_emp('anna', 'Anna', 'Zielińska', 'Przedstawiciel Handlowy', 'Wrocław')

        self.stdout.write("--- 4. KLIENCI ---")

        # Lista klientów (Nazwa, Adres, Miasto, ID_Statusu, Email, NIP)
        klienci_data = [
            # A) MAŁE SKLEPY (1-15)
            ('Warzywniak "Zielone Jabłuszko"', 'ul. Stefana Batorego 12', 'Zielona Góra', 2, 'sklep@jabluszko.zg.pl', '9291112233'),
            ('Sklep Spożywczy "U Ani"', 'ul. Ptasia 8', 'Zielona Góra', 2, 'anna.kowalska@op.pl', '9730001122'),
            ('Delikatesy Centrum', 'ul. Wyszyńskiego 25', 'Zielona Góra', 2, 'dc.wyszynskiego@delikatesy.pl', '9293334455'),
            ('Żabka (Franczyza nr 402)', 'ul. Zacisze 5', 'Zielona Góra', 2, 'zabka.zacisze@zabka.pl', '9739998877'),
            ('Sklep Osiedlowy "Promyk"', 'ul. Rzeźniczaka 3', 'Zielona Góra', 2, 'promyk@osiedle.pl', '9295556677'),
            ('Warzywa i Owoce "Witaminka"', 'ul. Sulechowska 15', 'Zielona Góra', 1, 'witaminka@wp.pl', '9731112200'),
            ('Chata Polska', 'ul. Morelowa 10', 'Zielona Góra', 2, 'chata.morelowa@chatapolska.pl', '9298887766'),
            ('Spożywczy "Groszek"', 'ul. Jedności 40', 'Zielona Góra', 2, 'groszek.jednosci@gmail.com', '9732223344'),
            ('Mini Market "Pod Wieżą"', 'ul. Wieża Braniborska 1', 'Zielona Góra', 1, 'podwieza@market.pl', '9290009988'),
            ('Sklep "U Sąsiada"', 'ul. 1 Maja 4', 'Zielona Góra', 2, 'sasiad.sklep@onet.pl', '9734445566'),
            ('Eko-Sklepik "Natura"', 'ul. Kupiecka 33', 'Zielona Góra', 2, 'natura.kupiecka@eko.pl', '9297776655'),
            ('Warzywniak na Ryneczku', 'ul. Owocowa 2 (Rynek)', 'Zielona Góra', 2, 'brak', '9736665544'),
            ('Społem PSS "Warta"', 'ul. Fabryczna 1', 'Zielona Góra', 2, 'spolem.fabryczna@pss.zg.pl', '9291231234'),
            ('Lewiatan', 'ul. Anny Jagiellonki 2', 'Zielona Góra', 2, 'lewiatan.jagiellonki@lewiatan.pl', '9739876543'),
            ('Sklep Monopolowo-Spożywczy', 'ul. Lwowska 7', 'Zielona Góra', 3, 'lwowska.sklep@wp.pl', '9295554433'),

            # B) SIECI (16-24)
            ('Jeronimo Martins (Biedronka)', 'ul. Wojska Polskiego 23', 'Zielona Góra', 2, 'bok@biedronka.pl', '7791011327'),
            ('Jeronimo Martins (Biedronka)', 'ul. Szosa Kisielińska 22', 'Zielona Góra', 2, 'sklep.zg2@biedronka.pl', '7791011327'),
            ('Jeronimo Martins (Biedronka)', 'ul. Batorego 128', 'Zielona Góra', 2, 'sklep.zg3@biedronka.pl', '7791011327'),
            ('Lidl Polska', 'ul. Sienkiewicza 2', 'Zielona Góra', 2, 'sekretariat@lidl.pl', '7811005000'),
            ('Lidl Polska', 'ul. Staszica 5', 'Zielona Góra', 2, 'sklep.staszica@lidl.pl', '7811005000'),
            ('Lidl Polska', 'ul. Szosa Kisielińska 4', 'Zielona Góra', 2, 'sklep.kisielinska@lidl.pl', '7811005000'),
            ('Dino Polska', 'ul. Jędrzychowska 44', 'Zielona Góra', 2, 'bok@dino.pl', '6171965000'),
            ('Dino Polska', 'ul. Przylep-Solidarności 1', 'Zielona Góra (Przylep)', 2, 'sklep.przylep@dino.pl', '6171965000'),
            ('Dino Polska', 'ul. Głogowska 102 (Racula)', 'Zielona Góra (Racula)', 2, 'sklep.racula@dino.pl', '6171965000'),

            # C) ROLNICY (25-30)
            ('Gospodarstwo Rolne "Złoty Kłos"', 'ul. Ochla-Zielona 5', 'Zielona Góra (Ochla)', 2, 'jan.rolnik@ochla.pl', '9290010022'),
            ('Sadownictwo Kowalscy', 'Stary Kisielin - Pionierów 12', 'Zielona Góra', 2, 'jablka.kowalscy@wp.pl', '9730020033'),
            ('Farma Drobiu "Jajko Lubuskie"', 'Zawada 45', 'Zielona Góra (Zawada)', 2, 'biuro@jajkolubuskie.pl', '9290030044'),
            ('Janusz Nowak - Rolnik Indywidualny', 'Przylep - 22 Lipca 8', 'Zielona Góra', 2, 'j.nowak@gmail.com', '1000523698'),
            ('Gospodarstwo Ekologiczne "Eko-Warzywko"', 'Łężyca-Odrzańska 2', 'Zielona Góra', 2, 'eko@lezyca.pl', '9730050066'),
            ('Plantacja Pomidorów "Czerwony Baron"', 'Nowy Kisielin - Przemysłowa 4', 'Zielona Góra', 2, 'pomidory@kisielin.pl', '9290060077'),
        ]

        for k in klienci_data:
            # Używamy idStatusKlienta_id, aby bezpośrednio przypisać ID (szybciej niż szukanie obiektu)
            Klienci.objects.create(NazwaFirmy=k[0], Adres=k[1], Miasto=k[2], idStatusKlienta_id=k[3], Email=k[4], NIP=k[5])

        self.stdout.write("--- 5. OSOBY DECYZYJNE ---")

        osoby_data = [
            (1, 'Anna', 'Zielińska', 'Właściciel', '601-111-222'),
            (2, 'Janusz', 'Kowalski', 'Właściciel', '602-222-333'),
            (3, 'Maria', 'Nowak', 'Kierownik Sklepu', '603-333-444'),
            (4, 'Piotr', 'Wiśniewski', 'Franczyzobiorca', '604-444-555'),
            (5, 'Krystyna', 'Wójcik', 'Właściciel', '605-555-666'),
            (6, 'Barbara', 'Kamińska', 'Kierownik', '606-666-777'),
            (7, 'Tomasz', 'Lewandowski', 'Kierownik Zmiany', '607-777-888'),
            (8, 'Paweł', 'Zając', 'Właściciel', '608-888-999'),
            (9, 'Ewa', 'Szymańska', 'Właściciel', '609-999-000'),
            (10, 'Marek', 'Woźniak', 'Właściciel', '501-111-222'),
            (11, 'Dorota', 'Kozłowska', 'Manager', '502-222-333'),
            (12, 'Halina', 'Mazurek', 'Właściciel', '503-333-444'),
            (13, 'Jerzy', 'Kwiatkowski', 'Kierownik Działu Warzyw', '504-444-555'),
            (14, 'Magdalena', 'Krawczyk', 'Kierownik Sklepu', '505-555-666'),
            (15, 'Andrzej', 'Piotrowski', 'Właściciel', '506-666-777'),
            (16, 'Monika', 'Jankowska', 'Kierownik Sklepu', '700-100-100'),
            (17, 'Robert', 'Grabowski', 'Kierownik Sklepu', '700-100-200'),
            (18, 'Agnieszka', 'Pawłowska', 'Kierownik Sklepu', '700-100-300'),
            (19, 'Katarzyna', 'Michalska', 'Kierownik Sklepu', '700-200-100'),
            (20, 'Marcin', 'Nowicki', 'Kierownik Sklepu', '700-200-200'),
            (21, 'Joanna', 'Adamczyk', 'Kierownik Sklepu', '700-200-300'),
            (22, 'Wojciech', 'Dudek', 'Kierownik Sklepu', '700-300-100'),
            (23, 'Sylwia', 'Wieczorek', 'Kierownik Sklepu', '700-300-200'),
            (24, 'Krzysztof', 'Majewski', 'Kierownik Sklepu', '700-300-300'),
            (25, 'Zdzisław', 'Rolnicki', 'Właściciel Gospodarstwa', '660-111-000'),
            (26, 'Adam', 'Sadownik', 'Właściciel', '660-222-000'),
            (27, 'Beata', 'Kurnicka', 'Dyrektor Farmy', '660-333-000'),
            (28, 'Janusz', 'Nowak', 'Rolnik', '660-444-000'),
            (29, 'Elżbieta', 'Ekol', 'Właścicielka', '660-555-000'),
            (30, 'Zbigniew', 'Pomidorski', 'Prezes', '660-666-000'),
        ]

        for o in osoby_data:
            OsobyDecyzyjne.objects.create(
                idKlienta_id=o[0], # ID klienta
                Imie=o[1], 
                Nazwisko=o[2], 
                Stanowisko=o[3], 
                Telefon=o[4]
            )

        self.stdout.write("--- 6. UMOWY ---")

        # idKlienta, idPracownika, idProduktu, Ilosc, idTypUmowy, Data, Kwota, Przedmiot
        # UWAGA: Data musi być obiektem datetime lub stringiem ISO
        umowy_data = [
            (1, 2, 1, 200, 1, '2023-10-01', 360.00, 'Dostawa ziemniaków Gala'),
            (16, 1, 7, 5000, 1, '2023-09-15', 15000.00, 'Kontrakt miesięczny na jabłka Szampion'),
            (22, 1, 5, 500, 1, '2023-10-05', 4750.00, 'Interwencyjny zakup pomidorów'),
            (4, 2, 12, 50, 1, '2023-08-20', 1400.00, 'Abonament: 50 palet jajek L tygodniowo'),
            # Kupno (idTypUmowy = 2)
            (26, 1, 7, 10000, 2, '2023-09-01', 25000.00, 'ZAKUP: Kontrakt na dostawę jabłek z sadu'),
            (27, 3, 11, 2000, 2, '2023-09-10', 60000.00, 'ZAKUP: Stała współpraca - odbiór jajek wiejskich'),
            (28, 4, 1, 5000, 2, '2023-09-25', 7500.00, 'ZAKUP: Ziemniaki po wykopkach'),
        ]

        for u in umowy_data:
            Umowy.objects.create(
                idKlienta_id=u[0],
                idPracownika_id=u[1],
                idProduktu_id=u[2],
                Ilosc=u[3],
                idTypUmowy_id=u[4],
                DataZawarcia=u[5], # Django przyjmie stringa YYYY-MM-DD jako datę
                KwotaUmowy=u[6],
                PrzedmiotUmowy=u[7]
            )

        self.stdout.write(self.style.SUCCESS("SUKCES! Baza danych została wypełniona."))