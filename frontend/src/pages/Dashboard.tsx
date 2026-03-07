import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboardView from './Dashboard/views/AdminDashboardView';
import SalesDashboardView from './Dashboard/views/SalesDashboardView';
import TechnicalDashboardView from './Dashboard/views/TechnicalDashboardView';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // Renderiza a visão específica baseada no cargo do usuário
    switch (user?.role) {
        case 'ADMIN':
            return <AdminDashboardView />;
        case 'VENDEDOR':
            return <SalesDashboardView />;
        case 'ORCAMENTISTA':
            return <TechnicalDashboardView />;
        default:
            // Fallback para admin ou uma página de acesso negado
            return <AdminDashboardView />;
    }
};

export default Dashboard;
