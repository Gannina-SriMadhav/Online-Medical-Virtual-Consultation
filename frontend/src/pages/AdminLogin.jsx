import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Default system admin credentials bypass for demo purposes
    if(email === 'admin@medconnect.com' && password === 'admin123') {
      navigate('/admin-dashboard');
    } else {
      alert("Invalid Admin Credentials. Access Denied.");
    }
  };

  return (
    <div className="landing-wrapper" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="glow-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
          ← Back to Network
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '3rem', width: '400px', textAlign: 'center', border: '1px solid #ef4444', boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)' }}>
        <div style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>🔒</div>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', color: '#ef4444' }}>System Administrator</h2>
        
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="email" placeholder="Admin Email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          />
          <input 
            type="password" placeholder="Passcode" required value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          />
          <button type="submit" className="glow-button" style={{ marginTop: '1rem', background: '#ef4444', border: 'none', color: 'white' }}>Authorize Override</button>
        </form>
      </div>
    </div>
  );
};
export default AdminLogin;
