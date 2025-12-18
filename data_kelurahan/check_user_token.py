# check_user_token.py
# Script untuk memeriksa dan membuat token untuk user Django

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

def check_and_create_tokens():
    """Cek semua user dan buat token jika belum ada"""
    
    print("=" * 50)
    print("Checking Django Users and Tokens")
    print("=" * 50)
    
    users = User.objects.all()
    
    if not users.exists():
        print("\n❌ Tidak ada user di database!")
        print("Buat superuser dengan: python manage.py createsuperuser")
        return
    
    print(f"\n📋 Total users: {users.count()}\n")
    
    for user in users:
        print(f"Username: {user.username}")
        print(f"  - Email: {user.email or '(tidak ada)'}")
        print(f"  - Is superuser: {user.is_superuser}")
        print(f"  - Is active: {user.is_active}")
        
        # Cek atau buat token
        token, created = Token.objects.get_or_create(user=user)
        
        if created:
            print(f"  - ✅ Token BARU dibuat: {token.key}")
        else:
            print(f"  - ✓ Token sudah ada: {token.key}")
        
        print()
    
    print("=" * 50)
    print("Selesai!")
    print("=" * 50)

if __name__ == '__main__':
    check_and_create_tokens()
