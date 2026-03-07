import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { LogOut, DoorOpen } from 'lucide-react';

interface LogoutModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ show, onConfirm, onCancel }) => {
    return (
        <Modal 
            show={show} 
            onHide={onCancel} 
            centered 
            className="logout-custom-modal"
        >
            <Modal.Body className="text-center p-5">
                {/* Ícone de Saída Ilustrativo */}
                <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-primary-subtle rounded-circle p-4 shadow-sm">
                    <DoorOpen size={48} className="text-primary" />
                </div>

                <h3 className="fw-extrabold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    Até logo!
                </h3>
                <p className="text-secondary mb-5 fs-5">
                    Você está prestes a sair do <strong>SIGOQ Admin</strong>. Deseja realmente encerrar sua sessão?
                </p>
                
                <div className="d-flex flex-column gap-3 px-4">
                    <Button 
                        onClick={onConfirm}
                        className="border-0 py-3 shadow-sm btn-pill btn-logout-confirm"
                    >
                        <LogOut size={18} className="me-2" /> SIM, ENCERRAR SESSÃO
                    </Button>
                    <Button 
                        variant="link"
                        onClick={onCancel}
                        className="text-muted text-decoration-none fw-bold"
                    >
                        CONTINUAR TRABALHANDO
                    </Button>
                </div>
            </Modal.Body>

            <style>{`
                .logout-custom-modal .modal-content {
                    border-radius: 24px;
                    border: none;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .bg-primary-subtle {
                    background-color: #e3f2fd !important;
                }
                .btn-pill {
                    border-radius: var(--radius-pill) !important;
                    font-weight: 700 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-logout-confirm {
                    background-color: #5D87FF !important; /* Azul Primário para ação positiva */
                    color: white !important;
                }
                .btn-logout-confirm:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 15px rgba(93, 135, 255, 0.3) !important;
                }
            `}</style>
        </Modal>
    );
};

export default LogoutModal;
