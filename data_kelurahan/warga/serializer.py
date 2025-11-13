from rest_framework import serializers
from .models import Warga, Pengaduan


class WargaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Warga
		# Tentukan field dari model Warga yang ingin kita ekspos di API
		fields = [
			'id',
			'nik',
			'nama_lengkap',
			'alamat',
			'tanggal_lahir',
			'no_telepon',
			'tanggal_registrasi',
		]


class PengaduanSerializer(serializers.ModelSerializer):
	class Meta:
		model = Pengaduan
		# Tentukan field dari model Warga yang ingin kita ekspos di API
		fields = [
			'id',
			'pelapor',
			'judul',
			'isi',
			'status',
		]

