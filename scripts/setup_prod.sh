#!/bin/bash
# Script de Setup Automatizado - SIGOQ
# Este script deve ser executado dentro do container de backend na VPS.

set -e # Aborta o script em caso de erro

echo "----------------------------------------------------------"
echo "🚀 Iniciando Configuração de Produção SIGOQ"
echo "----------------------------------------------------------"

echo "1/4 -> Executando migrações do banco de dados..."
python manage.py migrate --no-input

echo "2/4 -> Coletando arquivos estáticos (Frontend Assets)..."
python manage.py collectstatic --no-input

echo "3/4 -> Restaurando/Validando Status do Kanban (IDs Críticos)..."
python manage.py shell -c "
from comercial.models import StatusOportunidade
data = [
    (1, 'Prospecção', '#5D87FF', 1, False),
    (2, 'Qualificação', '#49BEFF', 2, False),
    (3, 'Proposta', '#FFAE1F', 3, True),
    (4, 'Negociação', '#13DEB9', 4, False),
    (5, 'Fechado/Ganho', '#2A3547', 5, False),
    (6, 'Perdido', '#FA896B', 6, False)
]
for id, nome, cor, ordem, tech in data:
    StatusOportunidade.objects.update_or_create(
        id=id, 
        defaults={'nome': nome, 'cor': cor, 'ordem': ordem, 'notifica_setor_tecnico': tech}
    )
print('Status do Kanban validados com sucesso!')
"

echo "4/5 -> Verificando integridade das configurações de preço..."
python manage.py shell -c "
from orcamentos.models import ConfiguracaoPreco
if not ConfiguracaoPreco.objects.filter(ativo=True).exists():
    print('Atenção: Nenhuma configuração de preço ativa encontrada. Lembre-se de configurar os markups no sistema.')
else:
    print('Configurações de preço detectadas.')
"

echo "5/5 -> Garantindo privilégios de ADMIN para todos os Superusuários..."
python manage.py shell -c "
from django.contrib.auth.models import User
from usuarios.models import Perfil
superusers = User.objects.filter(is_superuser=True)
if superusers.exists():
    for u in superusers:
        # Garante is_staff para acesso administrativo
        if not u.is_staff:
            u.is_staff = True
            u.save()
            print(f'-> Ativado is_staff para {u.username}')
        
        # Garante Perfil com Cargo ADMIN para regras de BI
        perfil, created = Perfil.objects.get_or_create(user=u)
        if perfil.cargo != 'ADMIN':
            perfil.cargo = 'ADMIN'
            perfil.save()
            print(f'-> Cargo ADMIN vinculado ao perfil de {u.username}.')
        else:
            print(f'-> Usuário {u.username} já possui perfil ADMIN completo.')
else:
    print('Aviso: Nenhum superusuário encontrado. Crie um para liberar o acesso total.')
"

echo "----------------------------------------------------------"
echo "✅ Setup de Produção Concluído!"
echo "----------------------------------------------------------"
echo "DICA: Se ainda não criou um administrador, execute:"
echo "docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser"
echo "Depois, rode este script novamente para aplicar as permissões de Perfil."
echo "----------------------------------------------------------"
