# SIGOQ - Sistema Integrado de Gestão de Orçamentos de Quadros Elétricos

Este projeto é um MVP para a gestão de orçamentos de quadros elétricos, desenvolvido com Django e PostgreSQL.

## 🚀 Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo
1. Clone o repositório.
2. Copie o arquivo de exemplo de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Suba os containers com Docker Compose:
   ```bash
   sudo docker-compose up -d --build
   ```
4. Execute as migrações do banco de dados:
   ```bash
   sudo docker-compose exec web python manage.py migrate
   ```
5. Crie um superusuário para acessar o painel administrativo:
   ```bash
   sudo docker-compose exec web python manage.py createsuperuser
   ```
6. Acesse a aplicação em: [http://localhost:8000](http://localhost:8000)

## 📁 Estrutura do Projeto
- `sigoq/`: Configurações principais do projeto Django.
- `usuarios/`: Gestão de perfis e autenticação (Vendedores, Orçamentistas).
- `core/`: Componentes compartilhados e middlewares (ex: isolamento comercial).
- `docs/`: Documentação detalhada em `.context/docs/`.
- `plans/`: Planos de execução por fase em `.context/plans/`.

## 🛠️ Tecnologias
- **Backend:** Django 4.2
- **Banco de Dados:** PostgreSQL 15
- **Cache/Background:** Redis 7
- **Conteinerização:** Docker / Docker Compose

## 🗓️ Próximos Módulos (Plano 2+)
1. **Fase 2: Cadastros Base** - Implementação de Clientes, Produtos e Fornecedores.
2. **Fase 3: CRM & Kanban** - Funil de vendas para oportunidades comerciais.
3. **Fase 4: Motor de Orçamentos** - Cálculos automáticos, snapshots e versionamento.
4. **Fase 5: Documentação PDF** - Geração de propostas usando WeasyPrint.
5. **Fase 6: Homologação & Segurança** - Auditoria e validação final de regras.

## 📄 Licença
Consulte o PDF de especificações para detalhes sobre as regras de negócio e requisitos funcionais.
