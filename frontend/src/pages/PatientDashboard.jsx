import React, { useState, useEffect } from 'react';
import { getPatientAppointments, getPatientRecords, createAppointment, getAllUsers, getAllPrescriptions, cancelAppointment } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import { Video, XCircle, Calendar, FileText, Pill, LogOut } from 'lucide-react';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [bookData, setBookData] = useState({ doctorId: '', date: '' });
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const users = await getAllUsers();
    const myEmail = localStorage.getItem('userEmail');
    const me = (users || []).find(u => u.email === myEmail);
    const myId = me ? me.id : null;
    
    if(me) {
       setPatientName(me.name);
       setPatientId(myId);
    }

    if (!myId) return;

    const appts = await getPatientAppointments(myId);
    const recs = await getPatientRecords(myId);
    const allScripts = await getAllPrescriptions();

    setAppointments(appts || []);
    setRecords(recs || []);
    setScripts((allScripts || []).filter(s => s.appointment?.patient?.id === myId));
    setDoctors((users || []).filter(u => u.role === 'DOCTOR'));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({
        patient: { id: patientId },
        doctor: { id: parseInt(bookData.doctorId) },
        appointmentDate: new Date(bookData.date).toISOString(),
        status: 'CONFIRMED'
      });
      setShowModal(false);
      loadData();
      toast.success("Appointment Successfully Booked!");
    } catch (err) {
      toast.error("Booking failed. Make sure DB is running and a Doctor exists.");
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Cancel this appointment permanently?")) return;
    try {
      const ok = await cancelAppointment(id);
      if(ok) {
         toast.success("Appointment Canceled!");
         loadData();
      } else {
         toast.error("Error canceling appointment.");
      }
    } catch (err) { toast.error("Failed to execute cancel action."); }
  };

  const startCall = (apptId) => {
    setActiveAppt(apptId);
    setInCall(true);
  };

  if (inCall) {
    return <VideoConsultation appointmentId={activeAppt} isDoctor={false} onClose={() => setInCall(false)} />;
  }

  return (
    <div className="landing-wrapper" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
        <button onClick={() => window.location.href='/'} className="glow-button" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingTop: '2rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.8rem' }}>Welcome, {patientName || 'Patient'}!</h1>
        <p style={{marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '1.1rem'}}>
          Patient Portal • Select an option below to manage your health journey, track prescriptions, and access clinical guidance en route.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Calendar size={20} className="glow-text"/> Book an Appointment</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '45px' }}>Find a specialist and schedule a virtual consultation immediately.</p>
             <button className="glow-button" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>Find Doctor</button>
          </div>
          
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Pill size={20} style={{ color: 'var(--accent-orange)' }}/> My Prescriptions</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '45px' }}>View your active e-prescriptions and medication details.</p>
             <button className="glow-button" onClick={() => setShowScriptsModal(true)} style={{ background: 'transparent', border: '1px solid var(--accent-orange)', width: '100%' }}>View Scripts</button>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><FileText size={20} style={{ color: '#3b82f6' }}/> Medical Records</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '45px' }}>Access your past diagnosis and lab reports securely.</p>
             <button className="glow-button" onClick={() => setShowRecordsModal(true)} style={{ background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.6)', color: 'white', width: '100%' }}>View Records ({records.length})</button>
          </div>
        </div>
        
        <div className="glass-card" style={{ marginTop: '2.5rem', padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)', fontSize: '1.4rem' }}>Upcoming Appointments</h3>
          {appointments.length === 0 ? (
             <p style={{ color: 'var(--text-secondary)' }}>You have no upcoming appointments in the database right now.</p>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map(appt => (
                <div key={appt.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{fontSize: '1.1rem'}}>Dr. {appt.doctor?.name || 'Specialist'}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{new Date(appt.appointmentDate).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <span className="glow-text" style={{ fontSize: '0.9rem', marginRight: '10px' }}>{appt.status}</span>
                     <button className="glow-button pulse-button" onClick={() => startCall(appt.id)} style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Video size={16} /> Join Video
                     </button>
                     <button onClick={() => handleCancel(appt.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Cancel Appointment">
                       <XCircle size={18} />
                     </button>
                  </div>
                </div>
              ))}
             </div>
          )}
        </div>
      </div>

      {showScriptsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>My Prescriptions</h2>
              <button onClick={() => setShowScriptsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            {scripts.length === 0 ? (
               <p style={{ color: 'var(--text-secondary)' }}>No active prescriptions found.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {scripts.map(rx => (
                   <div key={rx.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', borderLeft: rx.isFulfilled ? '4px solid #22c55e' : '4px solid var(--accent-orange)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <h4 style={{ color: 'var(--text-primary)' }}>Prescription #RX-{rx.id}</h4>
                       <span style={{ color: rx.isFulfilled ? '#22c55e' : 'var(--accent-orange)', fontSize: '0.8rem', fontWeight: 'bold' }}>{rx.isFulfilled ? 'DISPENSED' : 'PENDING PHARMACY'}</span>
                     </div>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Prescribed by Dr. {rx.appointment?.doctor?.name || rx.appointment?.doctor?.id}</p>
                     <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                       <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>💊 {rx.medicationDetails}</p>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{rx.instructions}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}

      {showRecordsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Medical Records</h2>
              <button onClick={() => setShowRecordsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            {records.length === 0 ? (
               <p style={{ color: 'var(--text-secondary)' }}>No medical records on file.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {records.map(rec => (
                   <div key={rec.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', borderLeft: '4px solid var(--accent-purple)' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{new Date(rec.recordDate).toLocaleString()} • Attending Dr. {rec.doctor?.name || rec.doctor?.id}</p>
                     <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Diagnosis: {rec.diagnosis}</h4>
                     <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}><strong>Treatment Plan:</strong> {rec.treatmentPlan}</p>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '2rem' }}>Schedule Appointment</h2>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <select required value={bookData.doctorId} onChange={e => setBookData({...bookData, doctorId: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)' }}>
                <option value="" disabled style={{color: 'black'}}>Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id} style={{color: 'black'}}>{d.name} ({d.specialist || 'Specialist'})</option>)}
                {doctors.length === 0 && <option value="2" style={{color: 'black'}}>Demo Doctor (ID 2)</option>}
              </select>
              <input type="datetime-local" required value={bookData.date} onChange={e => setBookData({...bookData, date: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>Confirm Booking</button>
                <button type="button" onClick={() => setShowModal(false)} className="glow-button" style={{ background: 'transparent', border: '1px solid gray', flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientDashboard;
