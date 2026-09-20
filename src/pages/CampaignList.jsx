import React, { useState } from 'react';

export default function CreateCampaign({ onCreateCampaign }) {
    const [formData, setFormData] = useState({
        title: '',
        story: '',
        goalAmount: '',
        category: 'medical',
        creatorName: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreateCampaign) {
        onCreateCampaign(formData);
    }
    setSubmitted(true);
    };

    if (submitted) {
    return (
        <div style={{
        maxWidth: '550px',
        margin: '40px auto',
        padding: '32px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        textAlign: 'center'
        }}>
        <h2 style={{ color: '#166534', marginBottom: '12px' }}>Campaign Submitted!</h2>
        <p style={{ color: '#15803d', lineHeight: '1.6' }}>
            Thank you for creating a campaign on <strong>Lewegene (ለወገኔ)</strong>. Your campaign is currently <strong>pending admin review</strong> and will appear on the public feed once approved.
        </p>
        <button 
            onClick={() => {
            setSubmitted(false);
            setFormData({ title: '', story: '', goalAmount: '', category: 'medical', creatorName: '' });
            }}
            style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#166534',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
            }}
        >
            Create Another Campaign
        </button>
        </div>
    );
    }

    return (
    <div style={{ maxWidth: '600px', margin: '32px auto', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Start a Lewegene Campaign</h2>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Campaign Title</label>
            <input 
                type="text" 
                required 
                placeholder="e.g., Medical Support for Family" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
        </div>

        <div>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Category</label>
            <select 
            value={formData.category} 
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
        >
            <option value="medical">Medical</option>
            <option value="education">Education</option>
            <option value="emergency">Emergency</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
        </select>
        </div>

        <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Goal Amount (ETB)</label>
            <input 
                type="number" 
                required 
                min="1" 
                placeholder="e.g., 50000" 
                value={formData.goalAmount} 
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
        />
        </div>

        <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Your Name (Optional)</label>
            <input 
                type="text" 
                placeholder="Anonymous if left blank" 
                value={formData.creatorName} 
                onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
        />
        </div>

        <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Campaign Story</label>
            <textarea 
                required 
                rows="4" 
                placeholder="Explain why you are raising funds..." 
                value={formData.story} 
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
        </div>

        <button 
            type="submit" 
            style={{ padding: '12px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
        >
            Submit Campaign for Review
        </button>
        </form>
    </div>
    );
}