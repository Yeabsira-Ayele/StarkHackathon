import React, { useState } from 'react';
import CampaignCard from '../components/CampaignCard';
import { mockCampaigns } from '../mock/mockCampaigns';

export default function CampaignList({ campaignsData = mockCampaigns }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const rawCampaignList = Array.isArray(campaignsData) 
    ? campaignsData 
    : (campaignsData?.campaigns || []);

    const approvedCampaigns = rawCampaignList.filter(
    c => !c.status || c.status === 'approved'
    );

    const categories = ['all', 'medical', 'education', 'emergency', 'business', 'other'];

    const filteredCampaigns = selectedCategory === 'all'
    ? approvedCampaigns
    : approvedCampaigns.filter(c => c.category === selectedCategory);

    const totalRaisedAll = approvedCampaigns.reduce((acc, curr) => acc + (curr.raised || 0), 0);

    return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
      {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.85rem', fontWeight: '700', padding: '6px 14px', borderRadius: '9999px', letterSpacing: '0.05em' }}>
            ETHIOPIA CROWDFUNDING
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', margin: '12px 0 8px 0', lineHeight: '1.2' }}>
            Lewegene (ለወገኔ)
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            Empowering communities through transparent crowdfunding for medical emergencies, education, and local innovation across Ethiopia.
        </p>

        {/* Top Summary Metrics */}
        <div style={{ display: 'inline-flex', gap: '24px', backgroundColor: '#f9fafb', padding: '12px 24px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Active Campaigns</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{approvedCampaigns.length}</span>
            </div>
            <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />
            <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Total Raised</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#16a34a' }}>{totalRaisedAll.toLocaleString()} ETB</span>
            </div>
        </div>
        </div>

      {/* Category Filter Tabs */}
        <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '28px',
            justifyContent: 'center',
            flexWrap: 'wrap'
        }}>
        {categories.map(cat => (
            <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: selectedCategory === cat ? '1px solid #111827' : '1px solid #e5e7eb',
                backgroundColor: selectedCategory === cat ? '#111827' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#4b5563',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
            }}
            >
            {cat}
            </button>
        ))}
        </div>

      {/* Campaign Grid */}
        {filteredCampaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #d1d5db' }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>No approved campaigns found in this category.</p>
        </div>
        ) : (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
        }}>
            {filteredCampaigns.map(campaign => (
            <CampaignCard 
                key={campaign.id || campaign._id} 
                campaign={campaign} 
            />
            ))}
        </div>
        )}
    </div>
    );
}