import React, { useState } from 'react';
import CampaignCard from '../components/CampaignCard';
import { mockCampaigns } from '../mock/mockCampaigns';

export default function CampaignList({ campaignsData = mockCampaigns, onSelectCampaign }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract campaign array from either direct array or backend { campaigns: [...] } object
    const rawCampaignList = Array.isArray(campaignsData) 
    ? campaignsData 
    : (campaignsData?.campaigns || []);

  // Ensure only approved campaigns appear in the public feed
    const approvedCampaigns = rawCampaignList.filter(
    c => !c.status || c.status === 'approved'
    );

    const categories = ['all', 'medical', 'education', 'emergency', 'business', 'other'];

  // Filter campaigns based on category
    const filteredCampaigns = selectedCategory === 'all'
    ? approvedCampaigns
    : approvedCampaigns.filter(c => c.category === selectedCategory);

    return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        
      {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            Lewegene (ለወገኔ) Crowdfunding
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Support urgent medical needs, education, emergency relief, and community projects across Ethiopia.
        </p>
        </div>

      {/* Category Filter Tabs */}
        <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
        }}>
        {categories.map(cat => (
            <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                border: '1px solid #d1d5db',
                backgroundColor: selectedCategory === cat ? '#111827' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#374151',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
            }}
            >
            {cat}
            </button>
        ))}
        </div>

      {/* Grid */}
        {filteredCampaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No approved campaigns found in this category.</p>
        </div>
        ) : (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
        }}>
            {filteredCampaigns.map(campaign => (
            <CampaignCard 
                key={campaign._id} 
                campaign={campaign} 
                onSelectCampaign={onSelectCampaign}
            />
            ))}
        </div>
        )}
    </div>
    );
}