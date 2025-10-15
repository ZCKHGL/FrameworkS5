from django import forms
from .models import Warga, Pengaduan

class WargaForm(forms.ModelForm):
    class Meta:
        model = Warga
        fields = ['nik', 'nama_lengkap', 'alamat', 'tanggal_lahir', 'no_telepon']
        widgets = {
            'tanggal_lahir': forms.DateInput(attrs={'type': 'date'}),
        }


class PengaduanForm(forms.ModelForm):
    class Meta:
        model = Pengaduan
        fields = ['pelapor', 'judul', 'isi']
        widgets = {
            'isi': forms.Textarea(attrs={'rows':4}),
        }