import React, { useState, useEffect } from 'react';
import { getAllUsers, approveUser, deleteUser } from '../api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data || []);
  };

  const handleApprove = async (id) => {
    if(!window.confirm("Approve this medical professional? They will instantly gain platform access.")) return;
    try {
      await approveUser(id);
      toast.success("User approved!");
      loadUsers();
    } catch(err) { toast.error("Approval failed."); }
  };

  const handleRemove = async (id) => {
    if(!window.confirm("Permanently delete this user from the system?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted.");
      loadUsers();
    } catch(err) { toast.error("Failed to delete user."); }
  };

  const handleViewCert = (data) => {
    if (data && data.startsWith('data:')) {
      const win = window.open();
      win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
      const certUrl = (data && data.includes('http')) ? data : 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=1000';
      window.open(certUrl, '_blank', 'width=800,height=900');
    }
  };

  const pendingProviders = users.filter(u => !u.isApproved && (u.role === 'DOCTOR' || u.role === 'PHARMACIST'));
  const verifiedProviders = users.filter(u => u.isApproved && (u.role === 'DOCTOR' || u.role === 'PHARMACIST'));
  const patients = users.filter(u => u.role === 'PATIENT');

  const ProviderTable = ({ title, dataset, isPending = false }) => (
    <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: isPending ? 'var(--accent-orange)' : '#22c55e' }}>{title} ({dataset.length})</h3>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
        {dataset.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)' }}>No providers in this category.</p>
        ) : (
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                 <th style={{ padding: '12px' }}>Provider Name / Role</th>
                 <th style={{ padding: '12px' }}>Credentials</th>
                 <th style={{ padding: '12px' }}>Status</th>
                 <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {dataset.map(u => (
                 <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <td style={{ padding: '12px' }}>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>{u.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.8rem' }}>#{u.id}</span></div>
                      <div style={{ color: 'var(--accent-purple)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold' }}>{u.role}</div>
                   </td>
                   <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <div>Lic: {u.licenseNumber || 'None Provided'}</div>
                      <button onClick={() => handleViewCert(u.certificateData || u.certificatePath)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', marginTop: '6px', cursor: 'pointer' }}>View Certificate</button>
                   </td>
                   <td style={{ padding: '12px' }}>
                      {u.isApproved ? (
                         <span style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Verified</span>
                      ) : (
                         <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Pending Review</span>
                      )}
                   </td>
                   <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!u.isApproved && (
                          <button onClick={() => handleApprove(u.id)} className="glow-button" style={{ background: 'rgba(34, 197, 94, 0.8)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Approve</button>
                        )}
                        <button onClick={() => handleRemove(u.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="landing-wrapper" style={{ position: 'relative', overflowY: 'auto' }}>
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
        <button onClick={() => window.location.href='/'} className="glow-button" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>Logout</button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.8rem' }}>Welcome, System Administrator!</h1>
        <p style={{marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem'}}>
          Admin Portal • Manage user accounts, verify clinician credentials, and categorize registered patients.
        </p>
        
        <ProviderTable title="Pending Approval (Docs/Pharmacies)" dataset={pendingProviders} isPending={true} />
        <ProviderTable title="Verified Providers" dataset={verifiedProviders} isPending={false} />

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Registered Patients ({patients.length})</h3>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
            {patients.length === 0 ? (
               <p style={{ color: 'var(--text-secondary)' }}>No patients currently registered.</p>
            ) : (
               <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                     <th style={{ padding: '12px' }}>Patient Name</th>
                     <th style={{ padding: '12px' }}>Email</th>
                     <th style={{ padding: '12px' }}>Age</th>
                     <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {patients.map(u => (
                     <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <td style={{ padding: '12px', color: 'white', fontWeight: 'bold' }}>{u.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.8rem' }}>#{u.id}</span></td>
                       <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                       <td style={{ padding: '12px', color: 'white' }}>{u.age || 'N/A'}</td>
                       <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button onClick={() => handleRemove(u.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;
