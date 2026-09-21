import React, { useState } from 'react';

export default function CreateCampaign() {
    const [title, setTitle] = useState('');
    const [goal, setGoal] = useState('');

    const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, goal });
    };

    return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2>Create a New Campaign</h2>
        <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Campaign Title</label>
            <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            />
        </div>
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Target Goal (ETB)</label>
            <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Submit Campaign
        </button>
        </form>
    </div>
    );
}