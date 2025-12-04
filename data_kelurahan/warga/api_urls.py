from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WargaViewSet, PengaduanViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, routers
from rest_framework.views import APIView

# Buat sebuah router dan daftarkan ViewSet kita
router = DefaultRouter()
router.register(r'warga', WargaViewSet, basename='warga')
router.register(r'pengaduan', PengaduanViewSet, basename='pengaduan')

urlpatterns = [
    #path('', include(router.urls)),
    #path('warga/', WargaListAPIView.as_view(), name='api-warga-list'),
    #path('warga/<int:pk>/', WargaDetailAPIView.as_view(), name='api-warga-detail'),
    #path('pengaduan/', PengaduanListAPIView.as_view(), name='api-pengaduan-list'),
    #path('pengaduan/<int:pk>/', PengaduanDetailAPIView.as_view(), name='api-pengaduan-detail'),
    path('', include(router.urls)),

]

# Pada setiap ViewSet atau APIView, tambahkan:
class YourViewSet(viewsets.ModelViewSet):[IsAuthenticated]
    # ...existing code...    # ...existing code...

