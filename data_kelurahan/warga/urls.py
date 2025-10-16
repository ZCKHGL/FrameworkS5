from django.urls import path
from .views import WargaListView, WargaDetailView, PengaduanListView, WargaCreateView, PengaduanCreateView, WargaUpdateView, WargaDeleteView, PengaduanUpdateView, PengaduanDeleteView

urlpatterns = [
    path('warga/',WargaListView.as_view(), name='warga_list'),
    path('<int:pk>/', WargaDetailView.as_view(), name='warga_detail'),
    path('pengaduan/', PengaduanListView.as_view(), name='pengaduan_list'),
    path('pengaduan/tambah/', PengaduanCreateView.as_view(), name='pengaduan_add'),
    path('warga/add/', WargaCreateView.as_view(), name='warga_add'),
    path('warga/<int:pk>/edit/', WargaUpdateView.as_view(), name='warga_edit'),
    path('warga/<int:pk>/delete/', WargaDeleteView.as_view(), name='warga_delete'),
    path('pengaduan/<int:pk>/edit/', PengaduanUpdateView.as_view(), name='pengaduan_edit'),
    path('pengaduan/<int:pk>/delete/', PengaduanDeleteView.as_view(), name='pengaduan_delete'),
]