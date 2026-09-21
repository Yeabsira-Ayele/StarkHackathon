import React from 'react';

export default function ProgressBar({ raised, goal }) {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

    return (
    <div style={{ width: '100%', margin: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px', fontWeight: '600' }}>
        <span style={{ color: '#16a34a' }}>{percentage}% Raised</span>
        <span style={{ color: '#6b7280' }}>Goal: {goal.toLocaleString()} ETB</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
        <div 
            style={{ 
                width: `${percentage}%`, 
                height: '100%', 
                backgroundColor: percentage >= 100 ? '#059669' : '#16a34a',
                transition: 'width 0.4s ease-in-out',
                borderRadius: '9999px'
            }} 
        />
        </div>
    </div>
    );
}