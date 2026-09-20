import React from 'react';

export default function ProgressBar({ raisedAmount = 0, goalAmount = 1 }) {
  const percentage = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100);

    return (
    <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
        <span>{raisedAmount.toLocaleString()} ETB raised</span>
        <span>{percentage}% of {goalAmount.toLocaleString()} ETB</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
        <div 
            style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            backgroundColor: '#16a34a', 
            borderRadius: '9999px',
            transition: 'width 0.3s ease-in-out'
            }} 
        />
        </div>
    </div>
    );
}