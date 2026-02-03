from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KlienciViewSet, PracownicyViewSet, ZadaniaViewSet, 
    UmowyViewSet, ProduktyViewSet, LoginView, TypUmowyViewSet,
    StatusKlientaViewSet, TypZadaniaViewSet, StatusZadaniaViewSet
)

router = DefaultRouter()
router.register(r'klienci', KlienciViewSet)
router.register(r'pracownicy', PracownicyViewSet)
router.register(r'zadania', ZadaniaViewSet)
router.register(r'umowy', UmowyViewSet)
router.register(r'produkty', ProduktyViewSet)
router.register(r'typ-umowy', TypUmowyViewSet)
router.register(r'statusy', StatusKlientaViewSet)
router.register(r'typ-zadania', TypZadaniaViewSet)
router.register(r'status-zadania', StatusZadaniaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
]