import React, { useState, useRef } from 'react';
import { Card, Table, Button, Form, Spinner } from 'react-bootstrap';
import { Trash2, Compass, Box, Plus, Search } from 'lucide-react';
import { Kit, ItemOrcamento, Produto } from '../../../types';
import { produtoApi } from '../../../api/produtos';

interface KitSectionProps {
    kit: Kit;
    index: number;
    onUpdateName: (index: number, name: string) => void;
    onDeleteKit: (index: number) => void;
    onDeleteItem: (kitIndex: number, itemIndex: number) => void;
    onUpdateQuantity: (kitIndex: number, itemIndex: number, quantity: string) => void;
    onSearchMaterial: (index: number) => void;
    onAddProduct: (kitIndex: number, product: Produto) => void;
}

const ItemRow: React.FC<{
    item: ItemOrcamento;
    kitIndex: number;
    itemIndex: number;
    onDelete: (ki: number, ii: number) => void;
    onUpdateQty: (ki: number, ii: number, q: string) => void;
}> = ({ item, kitIndex, itemIndex, onDelete, onUpdateQty }) => (
    <tr className="align-middle">
        <td className="ps-4 py-3">
            <div className="fw-bold text-dark">{item.codigo}</div>
            <div className="small text-muted text-truncate" style={{ maxWidth: '250px' }}>{item.descricao}</div>
        </td>
        <td style={{ width: '100px' }}>
            <Form.Control
                size="sm"
                type="number"
                className="text-center fw-bold border-0 bg-light rounded-8"
                value={item.quantidade}
                onChange={(e) => onUpdateQty(kitIndex, itemIndex, e.target.value)}
                style={{ height: '32px' }}
            />
        </td>
        <td className="text-dark fw-medium">R$ {parseFloat(item.custo_unit_snapshot).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td className="fw-bold" style={{ color: 'var(--success)' }}>R$ {parseFloat(item.vlr_unit_venda || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td className="text-end pe-4">
            <Button variant="light" className="text-danger p-2 rounded-circle hover-bg-danger-subtle border-0" onClick={() => onDelete(kitIndex, itemIndex)}>
                <Trash2 size={16} />
            </Button>
        </td>
    </tr>
);

const KitSection: React.FC<KitSectionProps> = ({
    kit, index, onUpdateName, onDeleteKit, onDeleteItem, onUpdateQuantity, onSearchMaterial, onAddProduct
}) => {
    const [quickCode, setQuickCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleQuickAdd = async () => {
        const code = quickCode.trim();
        if (!code) return;

        setIsSearching(true);
        try {
            const product = await produtoApi.getByCode(code);
            if (product) {
                onAddProduct(index, product);
                setQuickCode('');
                // Foca novamente o input para a próxima entrada
                setTimeout(() => inputRef.current?.focus(), 50);
            } else {
                alert(`Material com código "${code}" não encontrado.`);
            }
        } catch (error) {
            console.error("Erro na busca rápida:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Card className="card-premium mb-4 border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ height: '4px', backgroundColor: 'var(--primary)', width: '100%' }}></div>
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center px-4">
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                    <div className="bg-primary-light p-2 rounded-8 text-primary">
                        <Box size={18} />
                    </div>
                    <Form.Control
                        className="border-0 fw-extrabold text-primary p-0 shadow-none fs-5 bg-transparent"
                        value={kit.nome}
                        onChange={(e) => onUpdateName(index, e.target.value)}
                        placeholder="Nome do Conjunto / Kit"
                        style={{ width: 'auto', minWidth: '300px' }}
                    />
                </div>
                <Button 
                    variant="light" 
                    size="sm" 
                    className="text-danger rounded-pill px-3 fw-bold border"
                    onClick={() => onDeleteKit(index)}
                >
                    <Trash2 size={14} className="me-1" /> Remover Kit
                </Button>
            </Card.Header>
            <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4 border-0 text-muted x-small fw-bold" style={{ width: '40%' }}>CÓDIGO / ITEM</th>
                            <th className="border-0 text-muted x-small fw-bold">QTD</th>
                            <th className="border-0 text-muted x-small fw-bold">CUSTO UNIT.</th>
                            <th className="border-0 text-muted x-small fw-bold">VENDA UNIT.</th>
                            <th className="text-end pe-4 border-0 text-muted x-small fw-bold">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kit.itens.map((item, iIdx) => (
                            <ItemRow
                                key={iIdx}
                                item={item}
                                kitIndex={index}
                                itemIndex={iIdx}
                                onDelete={onDeleteItem}
                                onUpdateQty={onUpdateQuantity}
                            />
                        ))}
                        
                        {/* Linha de Entrada Rápida - Estilizada como uma linha da tabela */}
                        <tr className="bg-white border-top shadow-sm" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <td className="ps-4 py-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="flex-grow-1" style={{ maxWidth: '200px' }}>
                                        <Form.Control
                                            ref={inputRef}
                                            size="sm"
                                            placeholder="Digitar Código..."
                                            className="fw-bold border-0 bg-primary-light rounded-8 px-3"
                                            value={quickCode}
                                            onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                                            disabled={isSearching}
                                            style={{ height: '38px', color: 'var(--primary)' }}
                                        />
                                    </div>
                                    {isSearching ? (
                                        <Spinner animation="border" size="sm" variant="primary" />
                                    ) : (
                                        <div className="text-muted x-small italic opacity-50 d-none d-md-block">
                                            Pressione Enter
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="bg-light rounded-8" style={{ height: '32px', width: '60px', opacity: 0.3 }}></div>
                            </td>
                            <td>
                                <div className="text-muted x-small opacity-30">---</div>
                            </td>
                            <td>
                                <div className="text-muted x-small opacity-30">---</div>
                            </td>
                            <td className="text-end pe-4">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="d-inline-flex align-items-center rounded-pill px-3 fw-bold border-2"
                                    onClick={() => onSearchMaterial(index)}
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    <Compass size={14} className="me-2" /> CATÁLOGO
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Card.Body>
            <style>{`
                .rounded-8 { border-radius: 8px !important; }
                .bg-primary-light { background-color: rgba(93, 135, 255, 0.1); }
                .hover-bg-danger-subtle:hover { background-color: rgba(250, 137, 107, 0.1) !important; }
                .table-modern th { font-size: 0.7rem; letter-spacing: 0.05rem; }
                .italic { font-style: italic; }
                .group:hover .opacity-hover { opacity: 1; }
            `}</style>
        </Card>
    );
};

export default KitSection;
