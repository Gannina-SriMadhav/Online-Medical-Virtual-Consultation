import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await loginUser(email, password);
      // token returns something like "mock-jwt-token-for-test@gmail.com-role-PATIENT"
      if(token) {
         const authRoleMatch = token.match(/-role-([a-zA-Z]+)$/);
         if (authRoleMatch && authRoleMatch[1]) {
             const actualRole = authRoleMatch[1].toLowerCase();
             localStorage.setItem('userEmail', email);
             toast.success('Successfully logged in!');
             navigate(`/${actualRole}-dashboard`);
         } else {
             toast.error('Invalid token format received.');
         }
      }
    } catch (err) {
      toast.error(err.message || 'Invalid credentials! Please try again or create an account.');
    }
  };

  return (
    <div className="landing-wrapper" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="glow-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
          ← Back to Home
        </Link>
      </div>
      <div className="glass-card" style={{ padding: '3rem', width: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Welcome Back</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          
          
          <button type="submit" className="glow-button" style={{ marginTop: '1rem' }}>Sign In</button>
        </form>
        <p style={{marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--accent-purple)'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
