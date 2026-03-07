import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { Plus } from 'lucide-react';

import { orcamentoApi } from '../../api/orcamentos';
import { usuarioApi } from '../../api/usuarios';
import { clienteApi } from '../../api/clientes';

import { useOrcamentoState } from './hooks/useOrcamentoState';
import EditorHeader from './components/EditorHeader';
import BasicInfoCard from './components/BasicInfoCard';
import KitSection from './components/KitSection';
import PricingSummary from './components/PricingSummary';
import ProductSearchModal from './components/ProductSearchModal';
import ConfirmModal from '../../components/ConfirmModal';
import OpportunityFileManager from '../../components/OpportunityFileManager';

const OrcamentoEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showSearchModal, setShowModal] = useState(false);
    const [fileManagerShow, setFileManagerShow] = useState(false);
    const [activeKitIndex, setActiveKitIndex] = useState<number | null>(null);
    
    // Estados de Confirmação
    const [confirmAction, setConfirmAction] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', onConfirm: () => {} });

    const { data: config } = useQuery({
        queryKey: ['config-preco'],
        queryFn: orcamentoApi.getConfig
    });

    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: clienteApi.list
    });

    const { data: vendedores = [] } = useQuery({
        queryKey: ['vendedores'],
        queryFn: () => usuarioApi.list({ role: 'COMERCIAL' })
    });

    const { data: remoteOrcamento, isLoading: isFetching } = useQuery({
        queryKey: ['orcamento', id],
        queryFn: () => orcamentoApi.get(id!),
        enabled: !!id
    });

    // Prefetch de materiais para "aquecer" o banco e o cache
    useQuery({
        queryKey: ['search-products', '', undefined, undefined],
        queryFn: () => produtoApi.list(),
        staleTime: 1000 * 60 * 5
    });

    const {
        localOrcamento, addKit, deleteKit, updateKitName,
        addItemToKit, deleteItem, updateItemQuantity, updateBasicInfo, recalculate
    } = useOrcamentoState(id, remoteOrcamento, config);

    const saveMutation = useMutation({
        mutationFn: (data: any) => id ? orcamentoApi.update(id, data) : orcamentoApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
            navigate('/orcamentos');
        }
    });

    const revisionMutation = useMutation({
        mutationFn: () => orcamentoApi.createRevision(id!),
        onSuccess: (newOrc) => navigate(`/orcamento/${newOrc.id}`)
    });

    const handleDeleteKit = (idx: number) => {
        setConfirmAction({
            show: true,
            title: 'Excluir Kit',
            message: `Deseja realmente remover o kit "${localOrcamento.kits?.[idx]?.nome}"? Todos os itens vinculados a ele serão excluídos.`,
            onConfirm: () => {
                deleteKit(idx);
                setConfirmAction(prev => ({ ...prev, show: false }));
            }
        });
    };

    const handleFinalize = () => {
        setConfirmAction({
            show: true,
            title: 'Finalizar Orçamento',
            message: 'Deseja finalizar esta proposta e enviar para revisão/cliente? Após o envio, o orçamento será bloqueado para edições simples.',
            onConfirm: () => {
                saveMutation.mutate({ ...localOrcamento, status: 'ENVIADO' });
                setConfirmAction(prev => ({ ...prev, show: false }));
            }
        });
    };

    const handleSearchMaterial = (idx: number) => {
        setActiveKitIndex(idx);
        setShowModal(true);
    };

    if (isFetching) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <div className="p-4" style={{ backgroundColor: '#F2F6FA', minHeight: '100vh' }}>
            <EditorHeader
                id={id}
                orcamento={localOrcamento}
                onSave={() => saveMutation.mutate(localOrcamento)}
                onFinalize={handleFinalize}
                onCreateRevision={() => revisionMutation.mutate()}
                onOpenFiles={() => setFileManagerShow(true)}
                isSaving={saveMutation.isPending}
                isCreatingRevision={revisionMutation.isPending}
            />

            <Row>
                <Col lg={8}>
                    <BasicInfoCard
                        orcamento={localOrcamento}
                        clientes={clientes}
                        vendedores={vendedores}
                        onUpdate={updateBasicInfo}
                    />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Estrutura de Kits</h5>
                        <Button variant="primary" size="sm" onClick={addKit} className="rounded-pill px-4 fw-bold shadow-sm">
                            <Plus size={16} className="me-1" /> ADICIONAR CONJUNTO
                        </Button>
                    </div>

                    {localOrcamento.kits?.map((kit, idx) => (
                        <KitSection
                            key={idx}
                            kit={kit}
                            index={idx}
                            onUpdateName={updateKitName}
                            onDeleteKit={handleDeleteKit}
                            onSearchMaterial={handleSearchMaterial}
                            onAddProduct={addItemToKit}
                            onDeleteItem={deleteItem}
                            onUpdateQuantity={updateItemQuantity}
                        />
                    ))}
                </Col>

                <Col lg={4}>
                    <PricingSummary
                        orcamento={localOrcamento}
                        config={config?.[0]}
                        onRecalculate={recalculate}
                    />
                </Col>
            </Row>

            <ProductSearchModal
                show={showSearchModal}
                onHide={() => setShowModal(false)}
                onSelect={(produto) => {
                    if (activeKitIndex !== null) {
                        addItemToKit(activeKitIndex, produto);
                        setShowModal(false);
                    }
                }}
            />

            {/* Gerenciador de Arquivos */}
            {localOrcamento.oportunidade && (
                <OpportunityFileManager 
                    show={fileManagerShow}
                    onHide={() => setFileManagerShow(false)}
                    oportunidadeId={localOrcamento.oportunidade}
                    oportunidadeTitulo={localOrcamento.cliente_detalhe?.razao_social || 'Oportunidade'}
                    readonly={true}
                />
            )}

            <ConfirmModal
                show={confirmAction.show}
                title={confirmAction.title}
                message={confirmAction.message}
                onConfirm={confirmAction.onConfirm}
                onCancel={() => setConfirmAction(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default OrcamentoEditor;
