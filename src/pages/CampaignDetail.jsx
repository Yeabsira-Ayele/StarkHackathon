import React, { useState } from 'react';
import ProgressBar from '../components/ProgressBar';

export default function CampaignDetail({ campaign, onBack }) {
    const [donateAmount, setDonateAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [donated, setDonated] = useState(false);

    if (!campaign) {
    return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No campaign selected.</p>
        <button onClick={onBack} style={{ padding: '8px 16px', cursor: 'pointer' }}>Back to Campaigns</button>
        </div>
    );
    }

    const handleDonate = (e) => {
    e.preventDefault();
    setDonated(true);
    };

    return (
    <div style={{ maxWidth: '800px', margin: '32px auto', padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <button 
        onClick={onBack}
        style={{ padding: '6px 12px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', cursor: 'pointer' }}
        >
        ← Back to Campaigns
        </button>

        <span style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
        {campaign.category}
        </span>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>{campaign.title}</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>Created by <strong>{campaign.creatorName || 'Anonymous'}</strong></p>

        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <ProgressBar raisedAmount={campaign.raisedAmount} goalAmount={campaign.goalAmount} />
        </div>

        <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Campaign Story</h3>
        <p style={{ color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{campaign.story}</p>
        </div>

      {/* Donation Form */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Support this Campaign</h3>

        {donated ? (
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            🎉 Thank you for your support! Your donation attempt has been received.
            </div>
        ) : (
            <form onSubmit={handleDonate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
            <input 
                type="number" 
                required 
                min="1" 
                placeholder="Amount in ETB (e.g., 250)" 
                value={donateAmount} 
                onChange={(e) => setDonateAmount(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
            <input 
                type="text" 
                placeholder="Your Name (Optional)" 
                value={donorName} 
                onChange={(e) => setDonorName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
            <button 
                type="submit" 
                style={{ padding: '12px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >
                Donate via Links.et
            </button>
            </form>
        )}
        </div>
    </div>
    );
}