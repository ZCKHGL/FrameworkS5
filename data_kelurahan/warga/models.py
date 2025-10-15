from django.db import models
from datetime import date

# Create your models here.
class Warga(models.Model):
    nik = models.CharField(
        max_length=16,
        unique=True,
        verbose_name="Nomor Induk Kependudukan"
    )
    nama_lengkap = models.CharField(
        max_length=100,
        verbose_name="Nama Lengkap"
    )
    alamat = models.TextField(
        verbose_name="Alamat Tinggal"
    )
    tanggal_lahir = models.DateField(
        blank=True,
        null=True,
        verbose_name="Tanggal Lahir"
    )
    no_telepon = models.CharField(
        max_length=15,
        blank=True,
        verbose_name="Nomor Telepon"
    )
    tanggal_registrasi = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.nama_lengkap

class Pengaduan(models.Model):
    STATUS_CHOICES = [
        ('BARU', 'Baru'),
        ('DIPROSES', 'Diproses'),
        ('SELESAI', 'Selesai'),
    ]

    pelapor = models.ForeignKey(Warga, on_delete=models.CASCADE, related_name='pengaduan')
    judul = models.CharField(
        max_length=200, 
        verbose_name="Judul Pengaduan"
    )
    isi = models.TextField(
        verbose_name="Isi Pengaduan"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='BARU')
    tanggal_pengaduan = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.judul
