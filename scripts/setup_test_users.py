import os
import django
import sys

# Setup django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

if "DJANGO_SETTINGS_MODULE" not in os.environ:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sigoq.settings.local")

try:
    django.setup()
    from django.contrib.auth.models import User
    from usuarios.models import Perfil

    def create_or_update_user(email, role, is_superuser=False):
        user, created = User.objects.get_or_create(username=email, defaults={'email': email})
        user.set_password(email)
        user.is_superuser = is_superuser
        user.is_staff = is_superuser
        user.save()
        
        # Perfil management
        perfil, p_created = Perfil.objects.get_or_create(user=user)
        perfil.cargo = role
        perfil.save()
        
        action = "Criado" if created else "Atualizado"
        print(f"[{action}] Usuário {email} - Cargo: {role} (Superuser: {is_superuser})")

    print("\n--- Configurando Usuários de Teste SIGOQ ---\n")
    create_or_update_user('admin@sigoq.com', 'ADMIN', is_superuser=True)
    create_or_update_user('vendedor@sigoq.com', 'VENDEDOR')
    create_or_update_user('orcamentista@sigoq.com', 'ORCAMENTISTA')
    print("\n------------------------------------------\n")

except Exception as e:
    print(f"Erro ao configurar usuários: {e}")
    sys.exit(1)
