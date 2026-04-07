import React, { useState, useEffect } from 'react';
import { getDoctorConsultations, issuePrescription, addMedicalRecord, getAllUsers, cancelAppointment } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import { Video, Calendar, XCircle, LogOut, FilePlus, Zap } from 'lucide-react';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [inCall, setInCall] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const [activePatientId, setActivePatientId] = useState(null);
  
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  
  const [rxData, setRxData] = useState({ appointmentId: '', medicationDetails: '', instructions: '' });
  const [recordData, setRecordData] = useState({ patientId: '', diagnosis: '', treatmentPlan: '' });

  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(() => loadAppointments(), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = async () => {
    const users = await getAllUsers();
    const myEmail = localStorage.getItem('userEmail');
    const me = (users || []).find(u => u.email === myEmail);
    const myId = me ? me.id : null;

    if (me) {
      setDoctorName(me.name);
      setDoctorId(myId);
    }
    
    if (!myId) return;

    const data = await getDoctorConsultations(myId);
    setAppointments(data || []);
  };

  const startCall = (apptId, patientId) => {
    setActivePatient(apptId);
    setActivePatientId(patientId);
    setInCall(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await issuePrescription({
        appointment: { id: parseInt(rxData.appointmentId) },
        medicationDetails: rxData.medicationDetails,
        instructions: rxData.instructions,
        issuedAt: new Date().toISOString()
      });
      toast.success('Prescription sent to Pharmacy successfully!');
      setShowPrescriptionModal(false);
    } catch (err) { toast.error('Failed to issue prescription.'); }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicalRecord({
        doctor: { id: doctorId },
        patient: { id: parseInt(recordData.patientId) },
        diagnosis: recordData.diagnosis,
        treatmentPlan: recordData.treatmentPlan,
        recordDate: new Date().toISOString()
      });
      toast.success('Medical Record Updated!');
      setShowRecordModal(false);
    } catch (err) { toast.error('Failed to add medical record.'); }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Cancel this appointment permanently?")) return;
    try {
      const ok = await cancelAppointment(id);
      if(ok) {
         toast.success("Appointment Canceled!");
         loadAppointments();
      } else {
         toast.error("Error canceling appointment.");
      }
    } catch (err) { toast.error("Failed to execute cancel action."); }
  };

  if (inCall) {
    return <VideoConsultation appointmentId={activePatient} patientId={activePatientId} isDoctor={true} onClose={() => { setInCall(false); loadAppointments(); }} />;
  }

  return (
    <div className="landing-wrapper" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
        <button onClick={() => window.location.href='/'} className="glow-button" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingTop: '2rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.8rem' }}>Welcome, Dr. {doctorName || 'Specialist'}!</h1>
        <p style={{marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '1.1rem'}}>
          Provider Portal • Conduct virtual consultations, deploy e-prescriptions, and manage your clinical patient records flawlessly.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} /> Scheduled Consultations</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No live appointments pending.</p>
            ) : appointments.filter(a => a.status !== 'COMPLETED').map((appt) => (
                <div key={appt.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem' }}>{appt.patient?.name || 'Unknown Patient'}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>ID: {appt.id} • {new Date(appt.appointmentDate).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <button className="glow-button pulse-button" onClick={() => startCall(appt.id, appt.patient?.id)} style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Video size={16} /> Join Video
                     </button>
                     <button onClick={() => handleCancel(appt.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Cancel Appointment">
                       <XCircle size={18} />
                     </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-orange)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={24} /> Quick Actions</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <li><button onClick={() => setShowPrescriptionModal(true)} className="glow-button" style={{ width: '100%', background: 'transparent', border: '1px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FilePlus size={18} /> Write E-Prescription
            </button></li>
            <li><button onClick={() => setShowRecordModal(true)} className="glow-button" style={{ width: '100%', background: 'transparent', border: '1px solid var(--accent-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FilePlus size={18} /> Update Medical Record
            </button></li>
          </ul>
        </div>
      </div>
      </div>

      {showPrescriptionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '500px' }}>
            <h2 style={{ marginBottom: '2rem' }}>Issue E-Prescription</h2>
            <form onSubmit={handlePrescriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <select required value={rxData.appointmentId} onChange={e => setRxData({...rxData, appointmentId: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                 <option value="" disabled style={{color: 'black'}}>Select Appointment ID</option>
                 {appointments.map(a => <option key={a.id} value={a.id} style={{color: 'black'}}>Appt #{a.id} - {a.patient?.name || 'Unknown'}</option>)}
              </select>
              <textarea placeholder="Medication Details (e.g. Amoxicillin 500mg)" required value={rxData.medicationDetails} onChange={e => setRxData({...rxData, medicationDetails: e.target.value})} rows="3" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <textarea placeholder="Instructions (e.g. Take 1 every 12 hours)" required value={rxData.instructions} onChange={e => setRxData({...rxData, instructions: e.target.value})} rows="2" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>Send to Pharmacy</button>
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="glow-button" style={{ background: 'transparent', border: '1px solid gray', flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '500px' }}>
            <h2 style={{ marginBottom: '2rem' }}>Update Medical Record</h2>
            <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="number" placeholder="Patient ID (e.g. 1)" required value={recordData.patientId} onChange={e => setRecordData({...recordData, patientId: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <textarea placeholder="Diagnosis" required value={recordData.diagnosis} onChange={e => setRecordData({...recordData, diagnosis: e.target.value})} rows="3" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <textarea placeholder="Treatment Plan" required value={recordData.treatmentPlan} onChange={e => setRecordData({...recordData, treatmentPlan: e.target.value})} rows="3" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>Save Record</button>
                <button type="button" onClick={() => setShowRecordModal(false)} className="glow-button" style={{ background: 'transparent', border: '1px solid gray', flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DoctorDashboard;
