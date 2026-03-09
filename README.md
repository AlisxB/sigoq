# SIGOQ - Sistema Integrado de Gestão de Orçamentos de Quadros Elétricos

O **SIGOQ** é uma plataforma sênior de gestão e Business Intelligence (BI) desenvolvida sob medida para fabricantes de quadros elétricos. Ele resolve o problema da gestão fragmentada ao centralizar o catálogo de materiais, automatizar o motor de precificação técnica e gerenciar o funil de vendas (CRM) em uma infraestrutura moderna e blindada.

---

## 🚀 Principais Funcionalidades

### 1. Governança Comercial (Kanban)
- **Fluxo Blindado**: Oportunidades seguem estágios rígidos regidos por IDs fixos (Prospecção → Qualificação → Orçamento → Negociação → Fechado).
- **Liberação Técnica (Portão de Avanço)**: Cards só avançam para 'Negociação' ou 'Ganho' após o check verde (✓) emitido pelo setor de orçamentos.
- **Blindagem de Retrocesso ("No Rollback")**: Uma vez liberado pela engenharia, o card é bloqueado para retornar a fases iniciais, garantindo a integridade do processo.
- **Validação de Perda**: Exige justificativa técnica ou comercial obrigatória para alimentar os gráficos de análise de perdas.

### 2. Motor de Precificação Técnica (Engenharia)
- **Snapshot de Custos**: Ao inserir um material, o sistema congela o custo base e descrição, protegendo o orçamento de flutuações futuras do catálogo.
- **Metodologia de Markup Divisor**: Automatiza cálculos de impostos, fretes, comissões e margens alvo.
- **Kits de Montagem**: Agrupamento lógico de materiais para acelerar a criação de orçamentos complexos.

### 3. Business Intelligence & Dashboards
- **Visão 360°**: Dashboards especializados para Administração, Vendas e Engenharia.
- **Análise Temporal**: Gráficos dinâmicos com filtros por Dia, Mês e Ano.
- **Gestão de Metas**: Planejamento financeiro global e individual com visualização em grade anual.

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, React-Bootstrap 5 |
| **Backend** | Python 3.11, Django 4.2, Django REST Framework |
| **Banco de Dados** | PostgreSQL 15, Redis 7 |
| **Infraestrutura** | Docker, Nginx (Reverse Proxy), Certbot (SSL) |
| **Documentos** | WeasyPrint (PDFs de Proposta Comercial) |

---

## 🌐 Guia de Deploy na VPS (Produção)

Este sistema utiliza uma arquitetura de **Segurança por Isolamento**. Os containers realizam bind apenas em `127.0.0.1`, tornando-os invisíveis para o tráfego externo direto e acessíveis exclusivamente via Nginx Global.

### 1. Pré-requisitos na VPS
- Docker e Docker Compose instalados.
- Nginx instalado no Host principal (fora do Docker).
- Domínio configurado apontando para o IP da VPS.

### 2. Preparação do Ambiente
Crie o arquivo `.env` na raiz do projeto:
```env
# Segurança Django
DJANGO_SECRET_KEY=sua_chave_ultra_segura_aqui
DEBUG=False

# Banco de Dados
POSTGRES_DB=sigoq_db
POSTGRES_USER=sigoq_user
POSTGRES_PASSWORD=senha_forte_banco

# URLs e Redes
VITE_API_URL=  # Deixe vazio se usar Nginx como proxy no mesmo domínio
```

### 3. Build e Execução
```bash
# Sobe a infraestrutura completa em background
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Setup Inicial Automatizado (Obrigatório)
Após o primeiro build, execute o script de bootstrap para configurar a base de dados, os status vitais do Kanban e garantir privilégios de ADMIN para o seu superusuário:

```bash
docker compose -f docker-compose.prod.yml exec backend bash scripts/setup_prod.sh
```

### 5. Configuração do Administrador
1. **Crie o usuário mestre** (se ainda não existir):
   ```bash
   docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
   ```
2. **Execute o setup novamente** para vincular o cargo de ADMIN ao novo usuário:
   ```bash
   docker compose -f docker-compose.prod.yml exec backend bash scripts/setup_prod.sh
   ```

### 6. Configuração do Nginx Global (Host)
Exemplo de bloco de configuração para `/etc/nginx/sites-available/sigoq`:
```nginx
server {
    server_name sigoq.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8002; # Frontend
        include proxy_params;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001; # Backend API
        include proxy_params;
    }

    # Gerado pelo Certbot
    listen 443 ssl; 
    ...
}
```

---

## 🛠 Comandos de Manutenção

- **Ver Logs em Tempo Real**:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f backend
  ```
- **Importação Massiva de Materiais**:
  Certifique-se de que o arquivo `materiais.xlsx` está na raiz e execute:
  ```bash
  docker compose -f docker-compose.prod.yml exec backend python scripts/import_materiais.py
  ```
- **Backup do Banco de Dados**:
  ```bash
  docker exec -t sigoq_db_prod pg_dumpall -c -U sigoq_user > backup_data.sql
  ```

---

**Importante**: Qualquer alteração estrutural deve ser precedida pela consulta a estes arquivos para garantir que as travas de segurança e IDs fixos sejam preservados.

---

## 📄 Licença e Propriedade
Sistema desenvolvido para **MSF Soluções** para uso exclusivo da SIGOQ. Todos os direitos reservados.
