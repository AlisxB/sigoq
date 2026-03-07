import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Form, InputGroup } from 'react-bootstrap';
import {
    LayoutDashboard, FileText, Settings, Users, LogOut, Rocket,
    Search, Bell, Moon, Sun, LayoutGrid, ChevronDown, MessageSquare,
    Calendar, Mail, User, Phone, BookOpen, Layers, Menu, Target, Box, Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import LogoutModal from '../components/LogoutModal';

interface MenuItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles: Role[];
}

interface MenuSection {
    title: string;
    roles: Role[];
    items: MenuItem[];
}

const MainLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const allSections: MenuSection[] = [
        {
            title: 'HOME',
            roles: ['ADMIN', 'VENDEDOR', 'ORCAMENTISTA'],
            items: [
                { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'VENDEDOR', 'ORCAMENTISTA'] },
            ]
        },
        {
            title: 'VENDEDOR',
            roles: ['ADMIN', 'VENDEDOR'],
            items: [
                { name: 'Clientes', path: '/clientes', icon: <Users size={20} />, roles: ['ADMIN', 'VENDEDOR'] },
                { name: 'Fornecedores', path: '/fornecedores', icon: <Rocket size={20} />, roles: ['ADMIN'] },
                { name: 'Kanban', path: '/kanban', icon: <LayoutGrid size={20} />, roles: ['ADMIN', 'VENDEDOR'] },
                { name: 'Metas Mensais', path: '/metas', icon: <Target size={20} />, roles: ['ADMIN'] },
            ]
        },
        {
            title: 'ENGENHARIA',
            roles: ['ADMIN', 'ORCAMENTISTA'],
            items: [
                { name: 'Orçamentos', path: '/orcamentos', icon: <FileText size={20} />, roles: ['ADMIN', 'ORCAMENTISTA'] },
                { name: 'Materiais', path: '/materiais', icon: <Box size={20} />, roles: ['ADMIN', 'ORCAMENTISTA'] },
                { name: 'Categorias', path: '/categorias', icon: <Layers size={20} />, roles: ['ADMIN'] },
            ]
        },
        {
            title: 'SISTEMA',
            roles: ['ADMIN'],
            items: [
                { name: 'Configurações', path: '/configuracoes', icon: <Settings size={20} />, roles: ['ADMIN'] },
                { name: 'Usuários', path: '/usuarios', icon: <User size={20} />, roles: ['ADMIN'] },
            ]
        }
    ];

    const sections = allSections
        .filter(section => section.roles.includes(user?.role || 'ORCAMENTISTA'))
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(user?.role || 'ORCAMENTISTA'))
        }))
        .filter(section => section.items.length > 0);

    const showSectionTitles = user?.role === 'ADMIN' || sections.length > 2;
    const isExpanded = !isCollapsed || isHovered;
    const sidebarWidth = isExpanded ? '280px' : '90px';

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `${sidebarWidth} 1fr`,
            height: '100vh',
            width: '100vw',
            backgroundColor: '#F2F6FA',
            overflow: 'hidden',
            transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            {/* Sidebar */}
            <aside
                onMouseEnter={() => isCollapsed && setIsHovered(true)}
                onMouseLeave={() => isCollapsed && setIsHovered(false)}
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    margin: '15px',
                    padding: isExpanded ? '24px 15px' : '24px 10px',
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 30px)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1000
                }}
            >
                <div className={`d-flex align-items-center mb-4 px-2 ${isExpanded ? 'justify-content-start gap-3' : 'justify-content-center'}`}>
                    <div style={{
                        backgroundColor: '#5D87FF',
                        padding: '10px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <Rocket size={22} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    {isExpanded && (
                        <h2 className="h5 fw-bold mb-0 text-nowrap" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>SIGOQ Admin</h2>
                    )}
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '5px' }}>
                    {sections.map(section => (
                        <div key={section.title} className="mb-4">
                            {isExpanded && showSectionTitles ? (
                                <p className="text-muted fw-bold px-3 mb-3" style={{ fontSize: '11px', letterSpacing: '1px', opacity: 0.6 }}>{section.title}</p>
                            ) : isExpanded ? (
                                <div style={{ marginBottom: '10px' }}></div>
                            ) : (
                                <div style={{ height: '1px', backgroundColor: '#F1F3F4', margin: '0 15px 15px 15px' }}></div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            title={!isExpanded ? item.name : ''}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: isExpanded ? 'flex-start' : 'center',
                                                gap: isExpanded ? '12px' : '0',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                color: isActive ? '#FFFFFF' : '#5A6A83',
                                                backgroundColor: isActive ? '#5D87FF' : 'transparent',
                                                textDecoration: 'none',
                                                fontWeight: isActive ? '600' : '500',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                boxShadow: isActive ? '0px 4px 12px rgba(93, 135, 255, 0.3)' : 'none'
                                            }}
                                        >
                                            <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                                            {isExpanded && <span className="text-nowrap">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Card - Bottom */}
                <Link 
                    to="/perfil"
                    className="text-decoration-none"
                    style={{
                        backgroundColor: 'rgba(93, 135, 255, 0.08)',
                        borderRadius: '20px',
                        padding: isExpanded ? '15px' : '10px',
                        display: 'flex',
                        justifyContent: isExpanded ? 'flex-start' : 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 135, 255, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 135, 255, 0.08)'}
                >
                    <div className={`d-flex align-items-center ${isExpanded ? 'gap-3 w-100' : 'justify-content-center'}`}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#5D87FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', flexShrink: 0
                        }}>
                            {user?.first_name?.charAt(0) || 'U'}
                        </div>
                        {isExpanded && (
                            <>
                                <div style={{ flexGrow: 1, minWidth: 0 }}>
                                    <p className="mb-0 fw-bold small text-nowrap text-truncate" style={{ color: '#2A3547' }}>{user?.first_name} {user?.last_name}</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>{user?.role}</p>
                                </div>
                                <div 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogoutClick(); }}
                                    title="Sair do sistema"
                                    style={{ 
                                        cursor: 'pointer', 
                                        flexShrink: 0,
                                        padding: '8px',
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 135, 255, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={18} color="#5D87FF" />
                                </div>
                            </>
                        )}
                        {!isExpanded && (
                            <div 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogoutClick(); }}
                                title="Sair do sistema"
                                style={{ 
                                    cursor: 'pointer', 
                                    flexShrink: 0,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 135, 255, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut size={18} color="#5D87FF" />
                            </div>
                        )}
                    </div>
                </Link>
            </aside>

            {/* Main Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '15px 15px 15px 0', height: '100vh', width: '100%', overflow: 'hidden' }}>
                <header style={{
                    marginBottom: '15px',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 10px'
                }}>
                    <div className="d-flex align-items-center gap-4">
                        <div
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{ padding: '8px', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#FFF', border: '1px solid #DFE5EF' }}
                        >
                            <Menu size={20} color="#5A6A83" />
                        </div>

                        <InputGroup style={{ width: '350px', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <InputGroup.Text className="bg-transparent border-0 pe-1 ps-3">
                                <Search size={18} color="#7C8FAC" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Busca global (clientes, orçamentos...)"
                                className="bg-transparent border-0 shadow-none py-2"
                                style={{ fontSize: '14px' }}
                            />
                        </InputGroup>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-3 pe-4 border-end d-none d-md-flex">
                            <img src="https://flagcdn.com/w20/br.png" width="22" alt="Brasil" style={{ borderRadius: '3px' }} />
                            <Moon size={22} color="#5A6A83" style={{ cursor: 'pointer' }} />
                            <Bell size={22} color="#5A6A83" style={{ cursor: 'pointer' }} />
                        </div>

                        <Link 
                            to="/perfil"
                            className="d-flex align-items-center gap-2 ps-2 text-decoration-none" 
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-none d-lg-block text-end">
                                <p className="mb-0 fw-bold small" style={{ color: '#2A3547' }}>{user?.first_name} {user?.last_name}</p>
                                <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>{user?.role === 'ADMIN' ? 'Administrador' : user?.role}</p>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(93, 135, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#5D87FF',
                                fontWeight: 'bold',
                                overflow: 'hidden'
                            }}>
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    `${user?.first_name?.charAt(0)}${user?.last_name?.charAt(0)}`
                                )}
                            </div>
                        </Link>
                        <div 
                            className="p-2 cursor-pointer" 
                            onClick={handleLogoutClick}
                            title="Sair do sistema"
                        >
                            <LogOut size={14} color="#5A6A83" />
                        </div>
                    </div>
                </header>

                <main style={{ flexGrow: 1, paddingRight: '5px', height: '100%', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutModal 
                show={showLogoutModal}
                onConfirm={logout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </div>
    );
};

export default MainLayout;
