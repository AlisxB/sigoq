import os
from .base import *

DEBUG = False

# A SECRET_KEY DEVE estar em variáveis de ambiente em produção
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# Banco de Dados Profissional (PostgreSQL)
import dj_database_url
db_config = dj_database_url.config(conn_max_age=600)

if not db_config:
    if os.environ.get('REQUIRE_POSTGRES', 'False') == 'True':
        raise Exception("DATABASE_URL não configurada. O PostgreSQL é obrigatório em produção.")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {'default': db_config}

# Confiança no Proxy Reverso (Essencial para VPS com Nginx Global)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Hosts Permitidos
ALLOWED_HOSTS = ['msf.desenrolaai.tech', '127.0.0.1', 'localhost']
env_hosts = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')
for host in env_hosts:
    if host and host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)

# --- TRAVAS ANTI-REDIRECIONAMENTO (Resolve o loop 301) ---
SECURE_SSL_REDIRECT = False  # O Nginx Global já faz isso
APPEND_SLASH = False         # Evita redirecionar para adicionar "/"
REMOVE_SLASH = False         # Evita redirecionar para remover "/"

# Segurança de Cookies - Configuração de Compatibilidade VPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_DOMAIN = None
CSRF_COOKIE_HTTPONLY = False

# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS e CSRF
CORS_ALLOWED_ORIGINS = [origin for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if origin]
CSRF_TRUSTED_ORIGINS = [origin for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if origin]
CORS_ALLOW_CREDENTIALS = True
