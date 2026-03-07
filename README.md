# SIGOQ - Sistema Integrado de Gestão de Orçamentos de Quadros Elétricos

O SIGOQ é uma plataforma sênior de ERP e BI focada na automação do ciclo comercial e técnico para fabricantes de quadros elétricos. O sistema integra desde a prospecção de oportunidades no Kanban até a geração de propostas técnicas complexas com cálculos financeiros precisos.

## 🚀 Status do Projeto: Produção / Refatorado
O sistema passou por uma consolidação arquitetural completa, adotando padrões de **Service Layer** no backend e **Feature-Based Atomic Design** no frontend.

## 🛠️ Stack Tecnológica

### Backend (Sênior Architecture)
- **Framework:** Django 4.2+ (Python 3.12)
- **API:** Django Rest Framework (DRF)
- **Banco de Dados:** PostgreSQL 15
- **Geração de PDF:** WeasyPrint (Alta fidelidade visual)
- **Padrão de Projeto:** Service Layer + Pure Logic (Cálculos isolados dos Models)

### Frontend (Premium UI/UX)
- **Framework:** React 18 (Vite + TypeScript)
- **Gerenciamento de Estado/Cache:** TanStack Query (v5)
- **Design System:** Vanilla CSS + React Bootstrap (Custom Premium Cards)
- **Gráficos/BI:** ApexCharts (Biblioteca universal customizada)
- **Ícones:** Lucide React

## 💎 Funcionalidades Principais

### 📊 BI & Analytics Gerencial
- **Dashboards Customizados:** Visões específicas para Admin (Estratégico), Vendedor (Performance) e Orçamentista (Produtividade).
- **Dados em Tempo Real:** Sincronização automática (Polling) e manual sem necessidade de refresh da página.
- **Análise de Pareto:** Ranking automático dos Top 10 clientes e faturamento por categoria.

### 💼 CRM & Kanban
- **Pipeline Inteligente:** Gestão de oportunidades com validação obrigatória de perda (Motivos de Perda).
- **Gestão de Arquivos:** Suporte a upload de pastas completas e extração automática de arquivos .ZIP no servidor.
- **Sincronização Automática:** Movimentação automática para "Negociação" ao finalizar orçamentos técnicos.

### ⚙️ Motor de Orçamentos
- **Pricing Engine:** Cálculo automatizado via Markup Divisor (Custo / (1 - Encargos)).
- **Versionamento:** Sistema de revisões (R00, R01...) com snapshots de custo preservados.
- **Entrada Rápida:** Adição de materiais ao orçamento via digitação direta de código com latência zero.

## 📁 Estrutura do Projeto
- `frontend/`: Aplicação React moderna dividida por `pages/`, `components/` e `api/`.
- `orcamentos/`: Núcleo técnico com `logic/pricing.py` e `services.py`.
- `comercial/`: Gestão de leads, metas e arquivos técnicos.
- `usuarios/`: Controle de acesso granular e perfis customizados.
- `sigoq/settings/`: Configurações divididas entre `base`, `local` e `production`.

## 🚀 Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo
1. Clone o repositório.
2. Configure o ambiente:
   ```bash
   cp .env.example .env
   ```
3. Suba os containers:
   ```bash
   sudo docker-compose up -d --build
   ```
4. O sistema estará disponível em:
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)

## 📄 Licença
Propriedade intelectual restrita. Desenvolvido para gestão técnica industrial de alta precisão.
