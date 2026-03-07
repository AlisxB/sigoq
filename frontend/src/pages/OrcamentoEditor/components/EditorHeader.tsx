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

    const getStatusVariant = (status?: string) => {
        const variants: Record<string, string> = {
            'RASCUNHO': 'secondary',
            'ELABORACAO': 'info',
            'REVISAO': 'warning',
            'ENVIADO': 'primary',
            'APROVADO': 'success',
            'REPROVADO': 'danger',
        };
        return variants[status || ''] || 'secondary';
    };

    return (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div className="d-flex align-items-center">
                <Button 
                    variant="light" 
                    onClick={() => navigate(-1)} 
                    className="me-3 p-2 rounded-circle shadow-sm border"
                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} className="text-dark" />
                </Button>
                <div>
                    <h1 className="h4 fw-extrabold mb-0" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        {!id ? 'Novo Orçamento' : `ORC-${orcamento.numero?.toString().padStart(4, '0')}`}
                    </h1>
                    <div className="d-flex align-items-center mt-1">
                        <span className="text-muted small fw-medium">Revisão R{orcamento.revisao?.toString().padStart(2, '0') || '00'}</span>
                        {orcamento.status && (
                            <Badge 
                                bg={getStatusVariant(orcamento.status)} 
                                className="ms-2 x-small rounded-pill px-2 py-1"
                                style={{ fontSize: '0.65rem' }}
                            >
                                {orcamento.status}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {orcamento.oportunidade && (
                    <Button
                        variant="light"
                        className="d-flex align-items-center text-primary fw-bold rounded-pill px-3 shadow-sm border"
                        onClick={onOpenFiles}
                        style={{ backgroundColor: '#FFFFFF' }}
                    >
                        <Paperclip size={18} className="me-2" />
                        Arquivos ({orcamento.total_arquivos || 0})
                    </Button>
                )}
                {id && (
                    <>
                        <Button
                            variant="outline-primary"
                            className="d-flex align-items-center rounded-pill px-3 fw-bold"
                            onClick={onCreateRevision}
                            disabled={isCreatingRevision}
                        >
                            <Copy size={18} className="me-2" />
                            {isCreatingRevision ? 'Criando...' : 'Nova Revisão'}
                        </Button>
                        <Button
                            className="d-flex align-items-center rounded-pill px-3 fw-bold shadow-sm"
                            onClick={onFinalize}
                            disabled={isSaving}
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: 'white' }}
                        >
                            <Send size={18} className="me-2" />
                            Finalizar
                        </Button>
                    </>
                )}
                <Button
                    variant="primary"
                    className="d-flex align-items-center shadow-sm rounded-pill px-4 fw-bold"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <Save size={18} className="me-2" />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
            </div>
        </div>
    );
};

export default EditorHeader;
