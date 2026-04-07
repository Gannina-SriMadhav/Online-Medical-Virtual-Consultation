import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-logo-box">
             <span className="brand-icon">✚</span>
          </div>
          <span className="brand-text">MedConnect</span>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="book-call-btn">BOOK A CALL</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            GET HEALTHY <span className="red-plus">+</span> STRONGER<br/>
            WITH A SYSTEM THAT<br/>
            WORKS FOR YOU
          </h1>
          
          <p className="hero-subtitle">
            Science-backed medicine, expert guidance, and<br/>
            real accountability—built around your schedule.
          </p>

          <Link to="/login" className="glow-red-btn">
            BOOK FREE CONSULTATION
          </Link>

          <div style={{ marginTop: '5rem', maxWidth: '600px', opacity: 0.7, lineHeight: 1.6, fontSize: '0.95rem', fontStyle: 'italic', letterSpacing: '0.5px' }}>
             "Your health is your profoundest investment. Early clinical consultation and continuous reliable care build the unshakeable foundation for a stronger, longer life."
          </div>
        </div>
      </main>

      {/* Hidden Admin Access */}
      <Link to="/admin" style={{ position: 'fixed', bottom: '15px', right: '15px', color: 'white', opacity: 0.15, textDecoration: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>
         Restricted Portal
      </Link>
    </div>
  );
};

export default LandingPage;
