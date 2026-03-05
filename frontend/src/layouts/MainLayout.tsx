import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { LayoutDashboard, FileText, Settings, Users, LogOut } from 'lucide-react';

const MainLayout: React.FC = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Orçamentos', path: '/', icon: <FileText size={20} /> },
        { name: 'Clientes', path: '#', icon: <Users size={20} /> },
        { name: 'Configurações', path: '#', icon: <Settings size={20} /> },
    ];

    return (
        <Container fluid>
            <Row>
                <Col md={2} className="sidebar px-0 d-none d-md-block">
                    <div className="px-4 mb-5">
                        <h2 className="h4 fw-bold">SIGOQ</h2>
                        <span className="text-secondary small">Painel Orçamentista</span>
                    </div>
                    <Nav className="flex-column">
                        {menuItems.map((item) => (
                            <Nav.Link
                                key={item.name}
                                as={Link as any}
                                to={item.path}
                                className={location.pathname === item.path ? 'active' : ''}
                            >
                                <span className="me-2">{item.icon}</span>
                                {item.name}
                            </Nav.Link>
                        ))}
                        <Nav.Link href="http://localhost:8000/admin/logout/" className="mt-5 text-danger">
                            <span className="me-2"><LogOut size={20} /></span>
                            Sair
                        </Nav.Link>
                    </Nav>
                </Col>
                <Col md={10} className="px-0">
                    <header className="glass-header px-4 py-3">
                        <h1 className="h5 fw-semibold mb-0">Sistema Integrado de Gestão de Orçamentos</h1>
                    </header>
                    <main className="p-4">
                        <Outlet />
                    </main>
                </Col>
            </Row>
        </Container>
    );
};

export default MainLayout;
