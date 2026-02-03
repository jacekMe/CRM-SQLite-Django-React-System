from rest_framework import serializers
from .models import Klienci, Pracownicy, Zadania, Umowy, Produkty, StatusKlienta, TypZadania, StatusZadania, TypUmowy

# --- Słowniki ---
class StatusKlientaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusKlienta
        fields = '__all__'

class TypZadaniaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypZadania
        fields = '__all__'

# --- Główne Dane ---
class KlienciSerializer(serializers.ModelSerializer):
    class Meta:
        model = Klienci
        fields = '__all__'

class PracownicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pracownicy
        fields = '__all__'

class ProduktySerializer(serializers.ModelSerializer):
    class Meta:
        model = Produkty
        fields = '__all__'

class ZadaniaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zadania
        fields = '__all__'

class UmowySerializer(serializers.ModelSerializer):
    class Meta:
        model = Umowy
        fields = '__all__'

class TypUmowySerializer(serializers.ModelSerializer):
    class Meta:
        model = TypUmowy
        fields = '__all__'

class StatusZadaniaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusZadania
        fields = '__all__'