import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { ArrowLeft, Save, Copy, Send, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Orcamento } from '../../../types';

interface EditorHeaderProps {
    id: string | undefined;
    orcamento: Partial<Orcamento>;
    onSave: () => void;
    onFinalize: () => void;
    onCreateRevision: () => void;
    onOpenFiles: () => void;
    isSaving: boolean;
    isCreatingRevision: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
    id, orcamento, onSave, onFinalize, onCreateRevision, onOpenFiles, isSaving, isCreatingRevision
}) => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
                <Button variant="link" onClick={() => navigate(-1)} className="me-3 p-0 text-dark">
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="h4 fw-extrabold mb-0" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>
                    {!id ? 'Novo Orçamento' : `ORC-${orcamento.numero?.toString().padStart(4, '0')}`}
                </h1>
                {orcamento.status && (
                    <Badge bg="primary" className="ms-3">{orcamento.status}</Badge>
                )}
            </div>
            <div className="d-flex align-items-center gap-2">
                {orcamento.oportunidade && (
                    <Button
                        variant="light"
                        className="d-flex align-items-center text-primary fw-bold"
                        onClick={onOpenFiles}
                    >
                        <Paperclip size={18} className="me-2" />
                        Anexos Técnicos ({orcamento.total_arquivos || 0})
                    </Button>
                )}
                {id && (
                    <>
                        <Button
                            variant="outline-primary"
                            className="d-flex align-items-center"
                            onClick={onCreateRevision}
                            disabled={isCreatingRevision}
                        >
                            <Copy size={18} className="me-2" />
                            {isCreatingRevision ? 'Criando...' : 'Nova Revisão'}
                        </Button>
                        <Button
                            variant="outline-success"
                            className="d-flex align-items-center"
                            onClick={onFinalize}
                            disabled={isSaving}
                        >
                            <Send size={18} className="me-2" />
                            Finalizar e Enviar
                        </Button>
                    </>
                )}
                <Button
                    variant="success"
                    className="d-flex align-items-center shadow-sm"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <Save size={18} className="me-2" />
                    {isSaving ? 'Salvando...' : 'Salvar Proposta'}
                </Button>
            </div>
        </div>
    );
};

export default EditorHeader;
