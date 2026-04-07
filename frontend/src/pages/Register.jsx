import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE } from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', role: 'PATIENT', 
    age: '', specialist: '', licenseNumber: '', certificateData: '' 
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
       toast.error("Passwords do not match!");
       return;
    }
    
    try {
      const payload = { ...formData };
      
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error('Registration failed. Email might be already in use.');
      }
    } catch (err) {
      toast.error('Error connecting to backend database. Make sure Spring Boot is running!');
    }
  };

  return (
    <div className="landing-wrapper" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      
      {/* Back to Home Button */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="glow-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
          ← Back to Home
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '3rem', width: '500px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Create Account</h2>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <select 
            value={formData.role} 
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--accent-purple)', outline: 'none' }}
          >
            <option value="PATIENT" style={{color: 'black'}}>Register as Patient</option>
            <option value="DOCTOR" style={{color: 'black'}}>Register as Doctor</option>
            <option value="PHARMACIST" style={{color: 'black'}}>Register as Pharmacist</option>
          </select>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ flex: 2, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
            <input type="number" placeholder="Age" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <input type="email" placeholder="Email Address (e.g. user@gmail.com)" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
          <input type="password" placeholder="Create Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
          <input type="password" placeholder="Confirm Password" required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />

          {/* Dynamic Doctor Fields */}
          {formData.role === 'DOCTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(155, 81, 224, 0.05)', borderRadius: '10px', border: '1px solid rgba(155, 81, 224, 0.2)' }}>
              <input type="text" placeholder="Specialist Area (e.g. Cardiology)" required value={formData.specialist} onChange={(e) => setFormData({...formData, specialist: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="text" placeholder="Medical License Number" required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Doctor Certificate (PDF/Img)</label>
                <input type="file" required onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({...formData, certificateData: reader.result});
                    reader.readAsDataURL(file);
                  }
                }} style={{ color: 'white' }} />
              </div>
            </div>
          )}

          {/* Dynamic Pharmacist Fields */}
          {formData.role === 'PHARMACIST' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(242, 153, 74, 0.05)', borderRadius: '10px', border: '1px solid rgba(242, 153, 74, 0.2)' }}>
              <input type="text" placeholder="Pharmacy License Number" required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Pharmacist Certificate</label>
                <input type="file" required onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({...formData, certificateData: reader.result});
                    reader.readAsDataURL(file);
                  }
                }} style={{ color: 'white' }} />
              </div>
            </div>
          )}
          
          <button type="submit" className="glow-button" style={{ marginTop: '1rem' }}>Complete Registration</button>
        </form>
        <p style={{marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--accent-purple)'}}>Log In</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
