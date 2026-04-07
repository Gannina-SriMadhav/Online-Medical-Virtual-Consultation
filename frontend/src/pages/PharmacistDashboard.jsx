import React, { useState, useEffect } from 'react';
import { getAllPrescriptions, getAllUsers, fulfillPrescription } from '../api';

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [pharmacistName, setPharmacistName] = useState('Pharmacist');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const rx = await getAllPrescriptions();
    setPrescriptions(rx || []);
    
    const users = await getAllUsers();
    const myEmail = localStorage.getItem('userEmail');
    const me = (users || []).find(u => u.email === myEmail);
    if(me) setPharmacistName(me.name);
  };

  const handleFulfill = async (id) => {
    if(!window.confirm("Mark this prescription as fulfilled and archive it?")) return;
    try {
      await fulfillPrescription(id);
      loadData(); // Refresh to move it to the archive section
    } catch(err) {
      alert("Failed to fulfill prescription. Backend sync error.");
    }
  };

  const pendingRx = prescriptions.filter(p => !p.isFulfilled);
  const archivedRx = prescriptions.filter(p => p.isFulfilled);

  return (
    <div className="landing-wrapper" style={{ position: 'relative', overflowY: 'auto' }}>
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
        <button onClick={() => window.location.href='/'} className="glow-button" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>Logout</button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.8rem' }}>Welcome, {pharmacistName}!</h1>
        <p style={{marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '1.1rem'}}>
          Pharmacy Portal • Manage incoming e-prescriptions, track active orders, and fulfill medications efficiently.
        </p>
        
        {/* Pending Queue */}
        <div className="glass-card" style={{ marginTop: '3rem', padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)' }}>E-Prescription Incoming Queue ({pendingRx.length})</h3>
          
          {pendingRx.length === 0 ? (
             <p style={{ color: 'var(--text-secondary)' }}>Queue is empty! No active scripts from Doctors.</p>
          ) : (
            pendingRx.map(rx => (
              <div key={rx.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderLeft: '4px solid var(--accent-purple)' }}>
                <div>
                  <h4 style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>Prescription #RX-{rx.id}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
                    Patient Profile ID: {rx.appointment?.patient?.id || 'N/A'} | Prescribing Doctor ID: {rx.appointment?.doctor?.id || 'N/A'}
                  </p>
                  <div style={{ background: 'rgba(155, 81, 224, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '1rem', border: '1px solid rgba(155, 81, 224, 0.3)' }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold' }}>💊 {rx.medicationDetails}</p>
                    <p style={{ color: 'var(--accent-orange)', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: '500' }}>Instructions: {rx.instructions}</p>
                  </div>
                </div>
                <button className="glow-button" onClick={() => handleFulfill(rx.id)} style={{ padding: '12px 24px' }}>Mark Fulfilled</button>
              </div>
            ))
          )}
        </div>

        {/* Archival Queue */}
        <div className="glass-card" style={{ marginTop: '2.5rem', padding: '2.5rem', opacity: 0.8 }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#22c55e' }}>Archived & Fulfilled Prescriptions ({archivedRx.length})</h3>
          
          {archivedRx.length === 0 ? (
             <p style={{ color: 'var(--text-secondary)' }}>No prescriptions have been fulfilled yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {archivedRx.map(rx => (
                <div key={rx.id} style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <h4 style={{ color: 'var(--text-primary)' }}>#RX-{rx.id}</h4>
                     <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ DISPENSED</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>For Patient ID: {rx.appointment?.patient?.id}</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{rx.medicationDetails}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default PharmacistDashboard;
