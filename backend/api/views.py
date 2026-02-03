from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from django.contrib.auth import authenticate

# import wszystkich modeli
from .models import Klienci, Pracownicy, Zadania, Umowy, Produkty, TypUmowy, StatusKlienta, TypZadania, StatusZadania

# import wszystkich serializerów
from .serializers import (
    KlienciSerializer, PracownicySerializer, ZadaniaSerializer, UmowySerializer, 
    ProduktySerializer, TypUmowySerializer, StatusKlientaSerializer, TypZadaniaSerializer,
    StatusZadaniaSerializer
)

class KlienciViewSet(viewsets.ModelViewSet):
    queryset = Klienci.objects.all()
    serializer_class = KlienciSerializer

class PracownicyViewSet(viewsets.ModelViewSet):
    queryset = Pracownicy.objects.all()
    serializer_class = PracownicySerializer

class ZadaniaViewSet(viewsets.ModelViewSet):
    queryset = Zadania.objects.all()
    serializer_class = ZadaniaSerializer

class UmowyViewSet(viewsets.ModelViewSet):
    queryset = Umowy.objects.all()
    serializer_class = UmowySerializer

class ProduktyViewSet(viewsets.ModelViewSet):
    queryset = Produkty.objects.all()
    serializer_class = ProduktySerializer

class TypUmowyViewSet(viewsets.ModelViewSet):
    queryset = TypUmowy.objects.all()
    serializer_class = TypUmowySerializer

class StatusKlientaViewSet(viewsets.ModelViewSet):
    queryset = StatusKlienta.objects.all()
    serializer_class = StatusKlientaSerializer

class TypZadaniaViewSet(viewsets.ModelViewSet):
    queryset = TypZadania.objects.all()
    serializer_class = TypZadaniaSerializer

class StatusZadaniaViewSet(viewsets.ModelViewSet):
    queryset = StatusZadania.objects.all()
    serializer_class = StatusZadaniaSerializer

# --- Logowanie ---
class LoginView(APIView):
    def post(self, request):
        login = request.data.get('login')
        password = request.data.get('password')
        
        # Sprawdzamy w bazie użytkowników Django
        user = authenticate(username=login, password=password)
        
        if user is not None:
            # Jeśli user istnieje, znajdujemy powiązanego pracownika
            try:
                pracownik = user.pracownicy
                serializer = PracownicySerializer(pracownik)
                return Response(serializer.data)
            except Exception as e:
                return Response({"error": "Użytkownik nie jest pracownikiem"}, status=400)
        else:
            return Response({"error": "Błędny login lub hasło"}, status=401)