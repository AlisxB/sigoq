import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Card, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { 
    File, Folder, FolderPlus, Upload, Trash2, Download, 
    FileText, Image as ImageIcon, FileArchive, ChevronRight, ChevronDown,
    HardDrive, Package, FolderDown, FileDown
} from 'lucide-react';
import { comercialApi } from '../api/comercial';
import { ArquivoOportunidade } from '../types';

interface FileManagerProps {
    show: boolean;
    onHide: () => void;
    oportunidadeId: number;
    oportunidadeTitulo: string;
    readonly?: boolean;
}

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    fullPath: string; // Ex: root/PastaA/Sub
    relativeDirPath: string; // Ex: PastaA/Sub/ (O que usamos na query do backend)
    fileData?: ArquivoOportunidade;
    children?: Record<string, FileNode>;
}

const OpportunityFileManager: React.FC<FileManagerProps> = ({ 
    show, onHide, oportunidadeId, oportunidadeTitulo, readonly = false 
}) => {
    const [files, setFiles] = useState<ArquivoOportunidade[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await comercialApi.listArquivos(oportunidadeId);
            setFiles(data);
        } catch (error) {
            console.error("Erro ao carregar arquivos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [oportunidadeId]);

    useEffect(() => {
        if (show) fetchFiles();
    }, [show, fetchFiles]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readonly) return;
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setIsUploading(true);
        setUploadError(null);
        
        const filesToUpload: File[] = [];
        const pathsToUpload: string[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            filesToUpload.push(file);
            let path = (file as any).webkitRelativePath || '';
            if (path) {
                const parts = path.split('/');
                parts.pop();
                path = parts.join('/') + '/';
            }
            pathsToUpload.push(path);
        }

        try {
            await comercialApi.uploadArquivos(oportunidadeId, filesToUpload, pathsToUpload);
            fetchFiles();
        } catch (error: any) {
            setUploadError("Falha no upload. Verifique o tamanho dos arquivos ou sua conexão.");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (readonly) return;
        if (!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;
        try {
            await comercialApi.deleteArquivo(id);
            fetchFiles();
        } catch (error) {
            alert("Erro ao excluir arquivo.");
        }
    };

    const buildTree = (): FileNode => {
        const root: FileNode = { 
            name: 'Arquivos da OP', type: 'folder', fullPath: 'root', relativeDirPath: '', children: {} 
        };
        
        files.forEach(file => {
            const pathParts = file.caminho_relativo.split('/').filter(p => p !== '');
            let currentNode = root;
            let currentFullPath = 'root';
            let currentRelativeDirPath = '';

            pathParts.forEach(part => {
                currentFullPath += `/${part}`;
                currentRelativeDirPath += `${part}/`;
                if (!currentNode.children) currentNode.children = {};
                if (!currentNode.children[part]) {
                    currentNode.children[part] = { 
                        name: part, 
                        type: 'folder', 
                        fullPath: currentFullPath,
                        relativeDirPath: currentRelativeDirPath,
                        children: {} 
                    };
                }
                currentNode = currentNode.children[part];
            });

            if (!currentNode.children) currentNode.children = {};
            currentNode.children[file.nome_original] = {
                name: file.nome_original,
                type: 'file',
                fullPath: `${currentFullPath}/${file.nome_original}`,
                relativeDirPath: currentRelativeDirPath,
                fileData: file
            };
        });

        return root;
    };

    const toggleFolder = (path: string) => {
        const newSet = new Set(expandedFolders);
        if (newSet.has(path)) newSet.delete(path);
        else newSet.add(path);
        setExpandedFolders(newSet);
    };

    const renderIcon = (ext: string) => {
        const e = ext.toLowerCase();
        if (['.pdf'].includes(e)) return <FileText size={18} className="text-danger" />;
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(e)) return <ImageIcon size={18} className="text-primary" />;
        if (['.zip', '.rar', '.7z'].includes(e)) return <FileArchive size={18} className="text-warning" />;
        if (['.dxf', '.dwg', '.stp'].includes(e)) return <Package size={18} className="text-success" />;
        return <File size={18} className="text-muted" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderTree = (node: FileNode, level: number = 0) => {
        const isExpanded = expandedFolders.has(node.fullPath);
        const children = node.children ? Object.values(node.children) : [];
        
        children.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return (
            <div key={node.fullPath}>
                {node.fullPath !== 'root' && (
                    <div 
                        className={`d-flex align-items-center py-2 px-2 rounded-2 hover-bg-light cursor-pointer group`}
                        style={{ marginLeft: `${level * 20}px` }}
                        onClick={() => node.type === 'folder' && toggleFolder(node.fullPath)}
                    >
                        <div className="me-2 text-muted">
                            {node.type === 'folder' ? (
                                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                            ) : null}
                        </div>
                        <div className="me-2">
                            {node.type === 'folder' ? (
                                <Folder size={18} className="text-warning fill-warning" />
                            ) : (
                                renderIcon(node.fileData?.extensao || '')
                            )}
                        </div>
                        <div className="flex-grow-1 text-truncate" style={{ fontSize: '0.9rem', fontWeight: node.type === 'folder' ? 600 : 400 }}>
                            {node.name}
                        </div>
                        
                        <div className="d-flex align-items-center gap-2 opacity-hover">
                            {node.type === 'folder' ? (
                                <Button 
                                    variant="link" size="sm" className="p-0 text-muted" 
                                    title="Baixar pasta como ZIP"
                                    onClick={(e) => { e.stopPropagation(); window.open(comercialApi.getZipUrl(oportunidadeId, node.relativeDirPath), '_blank'); }}
                                >
                                    <FolderDown size={14} />
                                </Button>
                            ) : (
                                <>
                                    <span className="x-small text-muted me-2">{formatSize(node.fileData?.tamanho || 0)}</span>
                                    <Button 
                                        variant="link" size="sm" className="p-0 text-muted" 
                                        onClick={(e) => { e.stopPropagation(); window.open(`http://localhost:8000${node.fileData?.arquivo}`, '_blank'); }}
                                    >
                                        <Download size={14} />
                                    </Button>
                                    {!readonly && (
                                        <Button 
                                            variant="link" size="sm" className="p-0 text-danger"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(node.fileData!.id); }}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {isExpanded && children.map(child => renderTree(child, level + 1))}
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable className="modal-premium">
            <Modal.Header closeButton className="border-0 px-4 pt-4">
                <Modal.Title className="fw-bold w-100">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <div className="icon-box bg-primary-subtle text-primary me-3">
                                <HardDrive size={20} />
                            </div>
                            <div>
                                <div className="h5 mb-0">{readonly ? 'Visualizar Arquivos' : 'Arquivos Técnicos'}</div>
                                <div className="text-muted small fw-normal">OP-{oportunidadeId.toString().padStart(4, '0')} | {oportunidadeTitulo}</div>
                            </div>
                        </div>
                        {files.length > 0 && (
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
                                onClick={() => window.open(comercialApi.getZipUrl(oportunidadeId), '_blank')}
                            >
                                <FileDown size={16} /> Baixar Tudo (ZIP)
                            </Button>
                        )}
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {uploadError && <Alert variant="danger" className="rounded-12 border-0 shadow-sm">{uploadError}</Alert>}
                
                {!readonly && (
                    <div className="d-flex gap-2 mb-4">
                        <div className="position-relative overflow-hidden flex-grow-1">
                            <Button variant="primary" className="w-100 fw-bold rounded-12 py-2 d-flex align-items-center justify-content-center">
                                {isUploading ? <Spinner size="sm" className="me-2" /> : <Upload size={18} className="me-2" />}
                                {isUploading ? 'Enviando...' : 'Fazer Upload de Pastas/Arquivos'}
                            </Button>
                            <input 
                                type="file" 
                                multiple 
                                // @ts-ignore
                                webkitdirectory="" 
                                directory=""
                                className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </div>
                        <div className="position-relative overflow-hidden">
                            <Button variant="outline-primary" className="fw-bold rounded-12 py-2 px-4">
                                Subir ZIP
                            </Button>
                            <input 
                                type="file" 
                                accept=".zip"
                                className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </div>
                    </div>
                )}

                <Card className="border-0 shadow-sm rounded-12 bg-light bg-opacity-50" style={{ minHeight: '300px' }}>
                    <Card.Body className="p-3">
                        {isLoading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FolderPlus size={48} className="opacity-20 mb-3" />
                                <p className="mb-0">Nenhum arquivo anexado.</p>
                            </div>
                        ) : (
                            renderTree(buildTree())
                        )}
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                <div className="me-auto text-muted x-small fw-medium">
                    Total: {files.length} arquivo(s) | {formatSize(files.reduce((acc, f) => acc + f.tamanho, 0))}
                </div>
                <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={onHide}>Fechar</Button>
            </Modal.Footer>

            <style>{`
                .hover-bg-light:hover { background-color: rgba(93, 135, 255, 0.08); }
                .cursor-pointer { cursor: pointer; }
                .opacity-hover { opacity: 0; transition: 0.2s; }
                .hover-bg-light:hover .opacity-hover { opacity: 1; }
                .icon-box {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .x-small { font-size: 0.75rem; }
                .fill-warning { fill: rgba(255, 193, 7, 0.2); }
            `}</style>
        </Modal>
    );
};

export default OpportunityFileManager;
