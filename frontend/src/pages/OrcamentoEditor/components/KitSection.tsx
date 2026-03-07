import React from 'react';
import { Card, Table, Button, Form } from 'react-bootstrap';
import { Trash2, Compass, Box } from 'lucide-react';
import { Kit, ItemOrcamento } from '../../../types';

interface KitSectionProps {
    kit: Kit;
    index: number;
    onUpdateName: (index: number, name: string) => void;
    onDeleteKit: (index: number) => void;
    onDeleteItem: (kitIndex: number, itemIndex: number) => void;
    onUpdateQuantity: (kitIndex: number, itemIndex: number, quantity: string) => void;
    onSearchMaterial: (index: number) => void;
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
    kit, index, onUpdateName, onDeleteKit, onDeleteItem, onUpdateQuantity, onSearchMaterial
}) => {
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
                <Table responsive hover className="mb-0 table-modern">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4 border-0 text-muted x-small fw-bold">ITEM / DESCRIÇÃO</th>
                            <th className="border-0 text-muted x-small fw-bold">QTD</th>
                            <th className="border-0 text-muted x-small fw-bold">CUSTO UNIT.</th>
                            <th className="border-0 text-muted x-small fw-bold">VENDA UNIT.</th>
                            <th className="text-end pe-4 border-0 text-muted x-small fw-bold">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kit.itens.length > 0 ? (
                            kit.itens.map((item, iIdx) => (
                                <ItemRow
                                    key={iIdx}
                                    item={item}
                                    kitIndex={index}
                                    itemIndex={iIdx}
                                    onDelete={onDeleteItem}
                                    onUpdateQty={onUpdateQuantity}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-muted small italic">
                                    Nenhum material adicionado a este kit.
                                </td>
                            </tr>
                        )}
                        <tr className="bg-light bg-opacity-50">
                            <td colSpan={5} className="p-3 text-center border-top">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="d-inline-flex align-items-center rounded-pill px-4 fw-bold shadow-sm"
                                    onClick={() => onSearchMaterial(index)}
                                >
                                    <Compass size={16} className="me-2" /> BUSCAR MATERIAL NO BANCO
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
            `}</style>
        </Card>
    );
};

export default KitSection;
