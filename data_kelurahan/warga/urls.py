from django.urls import path
from .views import WargaListView, WargaDetailView, PengaduanListView, WargaCreateView, PengaduanCreateView

urlpatterns = [
    path('warga/',WargaListView.as_view(), name='warga_list'),
    path('<int:pk>/', WargaDetailView.as_view(), name='warga_detail'),
    path('pengaduan/', PengaduanListView.as_view(), name='pengaduan_list'),
    path('pengaduan/tambah/', PengaduanCreateView.as_view(), name='pengaduan_add'),
    path('warga/add/', WargaCreateView.as_view(), name='warga_add'),
]