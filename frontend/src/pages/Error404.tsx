import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';

const Error404: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container fluid style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F2F6FA',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                position: 'relative',
                marginBottom: '40px',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '180px',
                    fontWeight: 900,
                    color: '#EBEEF2',
                    lineHeight: 1
                }}>404</div>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2
                }}>
                    <Ghost size={120} color="#5D87FF" strokeWidth={1.5} />
                </div>
            </div>

            <h1 className="h2 fw-extrabold mb-3" style={{ color: '#2A3547' }}>Opps!!!</h1>
            <p className="text-muted mb-4 fs-5 fw-medium">
                A página que você está procurando não foi encontrada em nosso servidor.
            </p>

            <Button
                variant="primary"
                className="shadow-premium rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
                onClick={() => navigate('/')}
            >
                <Home size={20} />
                VOLTAR PARA O DASHBOARD
            </Button>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 10px 30px rgba(93, 135, 255, 0.25) !important;
                    transition: all 0.2s ease;
                }
                .shadow-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(93, 135, 255, 0.35) !important;
                }
            `}</style>
        </Container>
    );
};

export default Error404;
