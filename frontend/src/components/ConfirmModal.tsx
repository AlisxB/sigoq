import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Ok',
    cancelLabel = 'No',
}) => {
    return (
        <Modal 
            show={show} 
            onHide={onCancel} 
            centered 
            size="sm"
            className="custom-confirm-modal"
        >
            <Modal.Body className="p-4">
                <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{message}</p>
                
                <div className="d-flex justify-content-end gap-3 mt-4">
                    <Button 
                        onClick={onCancel}
                        className="border-0 shadow-sm btn-pill btn-cancel"
                    >
                        {cancelLabel}
                    </Button>
                    <Button 
                        onClick={onConfirm}
                        className="border-0 shadow-sm btn-pill btn-confirm"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </Modal.Body>

            <style>{`
                .custom-confirm-modal .modal-content {
                    border-radius: var(--radius-lg);
                    border: none;
                    box-shadow: var(--shadow-deep);
                }
                .btn-pill {
                    border-radius: var(--radius-pill) !important;
                    padding: 8px 25px !important;
                    font-weight: 600 !important;
                    transition: transform 0.2s ease;
                }
                .btn-pill:hover {
                    transform: translateY(-1px);
                    filter: brightness(0.95);
                }
                .btn-cancel {
                    background-color: var(--error) !important; /* Coral do Design System */
                    color: white !important;
                }
                .btn-confirm {
                    background-color: var(--info) !important; /* Azul do Design System */
                    color: white !important;
                }
            `}</style>
        </Modal>
    );
};

export default ConfirmModal;
