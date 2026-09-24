import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

export default function CampaignCard({ campaign }) {
  const [isHovered, setIsHovered] = useState(false);
  const { id, title, category, description, goal, raised, image, location } = campaign;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isHovered 
          ? '0 12px 20px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0px)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
    >
      {/* Campaign Image with Subtle Zoom on Hover */}
      <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
        <img 
          src={image || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&w=800&q=80"} 
          alt={title}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.04)' : 'scale(1.0)',
            transition: 'transform 0.3s ease'
          }}
        />
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: '#111827',
          color: '#ffffff',
          fontSize: '0.75rem',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '9999px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {category}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
            📍 {location || "Ethiopia"}
          </span>
          <h3 style={{ 
            fontSize: '1.15rem', 
            fontWeight: '700', 
            color: isHovered ? '#16a34a' : '#111827', 
            margin: '0 0 8px 0', 
            lineHeight: '1.3',
            transition: 'color 0.2s ease'
          }}>
            {title}
          </h3>
          <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        </div>

        {/* Progress & Actions */}
        <div>
          <ProgressBar raised={raised} goal={goal} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Raised</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#111827' }}>
                {raised.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>ETB</span>
              </div>
            </div>
            
            <Link 
              to={`/campaign/${id}`}
              style={{
                padding: '8px 16px',
                backgroundColor: isHovered ? '#15803d' : '#16a34a',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'inline-block',
                transition: 'background-color 0.2s ease'
              }}
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}