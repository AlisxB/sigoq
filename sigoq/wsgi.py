import os
from django.core.wsgi import get_wsgi_application

# O padrão WSGI costuma ser produção ou herdar da variável de ambiente
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigoq.settings.production')

application = get_wsgi_application()
