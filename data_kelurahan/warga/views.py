from django.shortcuts import render
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .models import Warga, Pengaduan
from django.urls import reverse_lazy
from .forms import WargaForm, PengaduanForm
# DRF imports for API views
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializer import WargaSerializer

# Create your views here.
class WargaListView(ListView):
    model = Warga

class WargaDetailView(DetailView):
    model = Warga

class PengaduanListView(ListView):
    model = Pengaduan

class WargaCreateView(CreateView):
    model = Warga
    form_class = WargaForm
    template_name = 'warga/warga_form.html'
    success_url = reverse_lazy('warga_list')


class PengaduanCreateView(CreateView):
    model = Pengaduan
    form_class = PengaduanForm
    template_name = 'warga/pengaduan_form.html'
    success_url = reverse_lazy('pengaduan_list')

class WargaUpdateView(UpdateView):
    model = Warga
    form_class = WargaForm
    template_name = 'warga/warga_form.html'
    success_url = reverse_lazy('warga_list')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Data warga berhasil diperbarui.')
        return response

class WargaDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Warga
    template_name = 'warga/warga_confirm_delete.html'
    success_url = reverse_lazy('warga_list')

    def test_func(self):
        # only staff users can delete
        return self.request.user.is_staff

    def handle_no_permission(self):
        messages.error(self.request, 'Anda tidak memiliki izin untuk menghapus data warga.')
        return super().handle_no_permission()

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        messages.success(request, f"Data warga '{obj.nama_lengkap}' berhasil dihapus.")
        return super().delete(request, *args, **kwargs)


class PengaduanUpdateView(UpdateView):
    model = Pengaduan
    form_class = PengaduanForm
    template_name = 'warga/pengaduan_form.html'
    success_url = reverse_lazy('pengaduan_list')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Pengaduan berhasil diperbarui.')
        return response


class PengaduanDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Pengaduan
    template_name = 'warga/pengaduan_confirm_delete.html'
    success_url = reverse_lazy('pengaduan_list')

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        messages.error(self.request, 'Anda tidak memiliki izin untuk menghapus pengaduan.')
        return super().handle_no_permission()

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        messages.success(request, f"Pengaduan '{obj.judul}' berhasil dihapus.")
        return super().delete(request, *args, **kwargs)


# --- API VIEWS ---
class WargaListAPIView(ListAPIView):
    queryset = Warga.objects.all()
    serializer_class = WargaSerializer


class WargaDetailAPIView(RetrieveAPIView):
    """API endpoint that returns detail for a single Warga by PK."""
    queryset = Warga.objects.all()
    serializer_class = WargaSerializer