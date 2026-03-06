import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { Plus } from 'lucide-react';

import { orcamentoApi } from '../../../api/orcamentos';
import { usuarioApi } from '../../../api/usuarios';
import { clienteApi } from '../../../api/clientes';

import { useOrcamentoState } from './hooks/useOrcamentoState';
import EditorHeader from './components/EditorHeader';
import BasicInfoCard from './components/BasicInfoCard';
import KitSection from './components/KitSection';
import PricingSummary from './components/PricingSummary';
import ProductSearchModal from './components/ProductSearchModal';

const OrcamentoEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const [showSearchModal, setShowModal] = useState(false);
    const [activeKitIndex, setActiveKitIndex] = useState<number | null>(null);

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

    if (isFetching) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <div className="pb-5">
            <EditorHeader 
                id={id} 
                orcamento={localOrcamento}
                onSave={() => saveMutation.mutate(localOrcamento)}
                onFinalize={() => saveMutation.mutate({ ...localOrcamento, status: 'ENVIADO' })}
                onCreateRevision={() => revisionMutation.mutate()}
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

                    {localOrcamento.kits?.map((kit, idx) => (
                        <KitSection 
                            key={idx}
                            kit={kit}
                            index={idx}
                            onUpdateName={updateKitName}
                            onDeleteKit={deleteKit}
                            onDeleteItem={deleteItem}
                            onUpdateQuantity={updateItemQuantity}
                            onSearchMaterial={(kIdx) => {
                                setActiveKitIndex(kIdx);
                                setShowModal(true);
                            }}
                        />
                    ))}

                    <Button variant="outline-primary" className="w-100 border-dashed py-3 mb-4 shadow-sm fw-bold" onClick={addKit}>
                        <Plus size={18} className="me-2" /> Adicionar Novo Kit de Materiais
                    </Button>
                </Col>

                <Col lg={4}>
                    <PricingSummary 
                        id={id}
                        orcamento={localOrcamento}
                        onRecalculate={recalculate}
                    />
                </Col>
            </Row>

            <ProductSearchModal 
                show={showSearchModal}
                onHide={() => setShowModal(false)}
                onSelect={(p) => activeKitIndex !== null && addItemToKit(activeKitIndex, p)}
            />
        </div>
    );
};

export default OrcamentoEditor;
