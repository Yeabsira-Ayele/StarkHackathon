import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';

export default function App() {
    return (
    <Router>
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        
        {/* Navigation Bar */}
        <header style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            sticky: 'top'
        }}>
            <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a', textDecoration: 'none' }}>
            Lewegene (ለወገኔ)
            </Link>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#374151', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                Explore Feed
            </Link>
            <Link 
                to="/create" 
                style={{ 
                backgroundColor: '#16a34a', 
                color: '#ffffff', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: '600', 
                fontSize: '0.875rem' 
                }}
            >
                + Start Campaign
            </Link>
            </div>
        </header>

        {/* Dynamic Page Content */}
        <main>
            <Routes>
            <Route path="/" element={<CampaignList />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/create" element={<CreateCampaign />} />
            </Routes>
        </main>
        </div>
    </Router>
    );
}