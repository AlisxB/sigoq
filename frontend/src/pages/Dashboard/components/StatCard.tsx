import React from 'react';
import { Card } from 'react-bootstrap';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    bgColor: string;
    txtColor?: string;
    action?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, value, subtitle, icon, bgColor, txtColor = '#FFFFFF', action 
}) => (
    <Card className="h-100 border-0 overflow-hidden shadow-none" style={{ backgroundColor: bgColor, borderRadius: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="white" />
            </svg>
        </div>
        <Card.Body className="p-4 d-flex flex-column justify-content-between position-relative" style={{ zIndex: 1 }}>
            <div className="d-flex justify-content-between align-items-start">
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    {icon}
                </div>
                {action}
            </div>
            <div>
                <h3 className="h2 fw-extrabold mb-1" style={{ color: txtColor, letterSpacing: '-1px' }}>{value}</h3>
                <p className="mb-0 fw-bold" style={{ color: txtColor, opacity: 0.9, fontSize: '14px' }}>{title}</p>
                {subtitle && (
                    <div className="text-nowrap mt-1" style={{ color: txtColor, fontSize: '11px', opacity: 0.7, fontWeight: 600 }}>
                        {subtitle}
                    </div>
                )}
            </div>
        </Card.Body>
    </Card>
);

export default StatCard;
