import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import toast from 'react-hot-toast';
import { completeAppointment, issuePrescription, addMedicalRecord } from '../api';

const VideoConsultation = ({ appointmentId, patientId, isDoctor, onClose }) => {
  const [errorStatus, setErrorStatus] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [remoteStreamAttached, setRemoteStreamAttached] = useState(false);
  const remoteStreamAttachedRef = useRef(false);
  
  // Clinical Tools State
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('prescription');
  const [prescriptionData, setPrescriptionData] = useState({ medicationDetails: '', instructions: '' });
  const [recordData, setRecordData] = useState({ diagnosis: '', treatmentPlan: '' });
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize Media Devices immediately for preview
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
           localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        setErrorStatus('Failed to access camera and microphone. Please check permissions.');
      });

    return () => {
       if (localStreamRef.current) {
         localStreamRef.current.getTracks().forEach(track => track.stop());
       }
       if (peerInstance.current) {
         peerInstance.current.destroy();
       }
    };
  }, []);

  // Update tracks when toggling
  useEffect(() => {
     if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => track.enabled = micEnabled);
        localStreamRef.current.getVideoTracks().forEach(track => track.enabled = cameraEnabled);
     }
  }, [micEnabled, cameraEnabled]);

  const handleJoin = () => {
     setIsJoined(true);
     toast.success("Connecting to secure server...");
     
     const myId = `medconnect-appt-${appointmentId}-${isDoctor ? 'doctor' : 'patient'}`;
     const targetId = `medconnect-appt-${appointmentId}-${isDoctor ? 'patient' : 'doctor'}`;

     const peer = new Peer(myId, {
        config: {
           iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { 
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              },
              { 
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              },
              { 
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              }
           ]
        }
     });

     peer.on('open', () => {
       toast.success("Ready! Waiting for other party...");
       
       // Listen for incoming calls
       peer.on('call', (call) => {
          call.answer(localStreamRef.current);
          call.on('stream', (remoteStream) => {
             if (remoteVideoRef.current && !remoteStreamAttachedRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                remoteStreamAttachedRef.current = true;
                setRemoteStreamAttached(true);
                toast.success("Connected!");
             }
          });
       });

       // Actively dial the other person
       const attemptCall = () => {
          if (remoteStreamAttachedRef.current) return;
          const call = peer.call(targetId, localStreamRef.current);
          if (call) {
             call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current && !remoteStreamAttachedRef.current) {
                   remoteVideoRef.current.srcObject = remoteStream;
                   remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                   remoteStreamAttachedRef.current = true;
                   setRemoteStreamAttached(true);
                   toast.success("Connected!");
                }
             });
             call.on('error', () => {});
          }
       };

       attemptCall();
       
       const retryInterval = setInterval(() => {
          if(!remoteStreamAttachedRef.current && peerInstance.current && !peerInstance.current.disconnected) {
             attemptCall();
          } else {
             clearInterval(retryInterval);
          }
       }, 5000);
     });

     peer.on('error', (err) => {
        if(err.type !== 'peer-unavailable') {
            console.error("Peer error:", err.type);
        }
     });

     peerInstance.current = peer;
  };

  const handleEndCall = async () => {
     if(isDoctor) {
         try {
            await completeAppointment(appointmentId);
            toast.success("Consultation successfully completed and secured");
            onClose(); // Exit the room
         } catch(e) {
            toast.error("Failed to mark appointment as completed");
            onClose();
         }
     } else {
         onClose();
     }
  };

  const handlePrescriptionSubmit = async (e) => {
      e.preventDefault();
      try {
          await issuePrescription(appointmentId, prescriptionData);
          toast.success("Prescription securely saved to record!");
          setPrescriptionData({ medicationDetails: '', instructions: '' });
      } catch(e) {
          toast.error("Failed to save prescription.");
      }
  };

  const handleDiagnosisSubmit = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              patient: { id: patientId },
              diagnosis: recordData.diagnosis,
              treatmentPlan: recordData.treatmentPlan
          };
          await addMedicalRecord(payload);
          toast.success("Clinical diagnosis captured!");
          setRecordData({ diagnosis: '', treatmentPlan: '' });
      } catch(e) {
          toast.error("Failed to log diagnosis.");
      }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
       {/* HEADER */}
       <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
         <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>
           <span style={{ color: isJoined ? '#22c55e' : 'var(--accent-orange)' }}>● </span> 
           {isJoined ? 'LIVE Consultation Room' : 'Pre-Join Lobby'} #{appointmentId}
         </h2>
         <button onClick={onClose} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Leave Room</button>
       </div>
       
       {errorStatus && <div style={{ color: '#ef4444', textAlign: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.1)' }}>{errorStatus}</div>}

       <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
          
          {/* Main Display Box depending on state */}
          {!isJoined ? (
             <div className="glass-card" style={{ width: '95%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ flex: 1, minHeight: '250px', background: '#111', position: 'relative' }}>
                   <video 
                     ref={localVideoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   {!cameraEnabled && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222' }}>
                         <span style={{ color: 'var(--text-secondary)' }}>Camera is Off or Blocked</span>
                      </div>
                   )}
                </div>
                <div style={{ padding: '15px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', gap: '10px' }}>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setMicEnabled(!micEnabled)} style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', background: micEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', cursor: 'pointer', outline: '1px solid rgba(255,255,255,0.2)' }}>
                         {micEnabled ? '🎙️ Mic On' : '🔇 Mic Off'}
                      </button>
                      <button onClick={() => setCameraEnabled(!cameraEnabled)} style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', background: cameraEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', cursor: 'pointer', outline: '1px solid rgba(255,255,255,0.2)' }}>
                         {cameraEnabled ? '📹 Video On' : '🚫 Video Off'}
                      </button>
                   </div>
                   <button className="glow-button" onClick={handleJoin} style={{ padding: '12px 30px', fontSize: '1rem', whiteSpace: 'nowrap' }}>Join Consultation</button>
                </div>
             </div>
          ) : (
             <div style={{ display: 'flex', width: '100%', height: '100%', padding: '20px', gap: '20px', boxSizing: 'border-box', background: '#0a0a0a', paddingBottom: '100px' }}>
                
                {/* Local Video - Left Side */}
                <div className="glass-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)' }}>
                   <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '15px', color: 'white' }}>You ({isDoctor ? 'Doctor' : 'Patient'})</div>
                   {!cameraEnabled && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Camera Off</span>
                      </div>
                   )}
                </div>

                {/* Remote Video - Right Side */}
                <div className="glass-card" style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#111', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)' }}>
                   <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      onLoadedMetadata={(e) => {
                          e.target.play().catch(err => console.error("Meta play error", err));
                       }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '15px', color: 'white' }}>{isDoctor ? 'Patient' : 'Doctor'}</div>
                   {!remoteStreamAttached && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Waiting for connection...</span>
                      </div>
                   )}
                   
                   {/* Call Controls Floating */}
                   <div className="glass-card" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: `translateX(${showToolsPanel && isDoctor ? '-150%' : '-50%'})`, transition: 'all 0.3s ease', padding: '15px 30px', display: 'flex', gap: '20px', borderRadius: '50px', zIndex: 10 }}>
                      <button onClick={() => setMicEnabled(!micEnabled)} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: micEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {micEnabled ? '🎙️' : '🔇'}
                      </button>
                      <button onClick={() => setCameraEnabled(!cameraEnabled)} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: cameraEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {cameraEnabled ? '📹' : '🚫'}
                      </button>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
                      <button onClick={handleEndCall} style={{ height: '50px', borderRadius: '25px', padding: '0 25px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         📞 {isDoctor ? 'End Consultation' : 'Leave'}
                      </button>
                      {isDoctor && (
                          <button onClick={() => setShowToolsPanel(!showToolsPanel)} style={{ height: '50px', borderRadius: '25px', padding: '0 25px', border: '1px solid var(--accent-purple)', background: showToolsPanel ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginLeft: '10px' }}>
                              🗒️ Clinical Tools
                          </button>
                      )}
                   </div>
                   
                   {/* Clinical Form Sliding Panel (Doctors Only) */}
                   {isDoctor && (
                       <div className="glass-card" style={{ 
                           position: 'absolute', right: showToolsPanel ? '20px' : '-450px', top: '20px', bottom: '110px', width: '400px', 
                           transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 20, display: 'flex', flexDirection: 'column'
                       }}>
                           <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                               <button onClick={() => setActiveTab('prescription')} style={{ flex: 1, padding: '15px', background: activeTab === 'prescription' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'prescription' ? 'var(--accent-purple)' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>Prescribe</button>
                               <button onClick={() => setActiveTab('diagnose')} style={{ flex: 1, padding: '15px', background: activeTab === 'diagnose' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'diagnose' ? 'var(--accent-purple)' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>Diagnose</button>
                           </div>
                           <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                               {activeTab === 'prescription' ? (
                                   <form onSubmit={handlePrescriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      <h3 style={{ color: 'white', marginTop: 0 }}>Add E-Prescription</h3>
                                      <textarea placeholder="Medication Details (e.g., Amoxicillin 500mg)" required value={prescriptionData.medicationDetails} onChange={(e) => setPrescriptionData({...prescriptionData, medicationDetails: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', minHeight: '80px' }}></textarea>
                                      <textarea placeholder="Usage Instructions (e.g., Twice daily after meals)" required value={prescriptionData.instructions} onChange={(e) => setPrescriptionData({...prescriptionData, instructions: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', minHeight: '80px' }}></textarea>
                                      <button type="submit" className="glow-button" style={{ marginTop: '10px' }}>Issue Prescription</button>
                                   </form>
                               ) : (
                                   <form onSubmit={handleDiagnosisSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      <h3 style={{ color: 'white', marginTop: 0 }}>Clinical Record</h3>
                                      <textarea placeholder="Official Diagnosis" required value={recordData.diagnosis} onChange={(e) => setRecordData({...recordData, diagnosis: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', minHeight: '80px' }}></textarea>
                                      <textarea placeholder="Recommended Treatment Plan" required value={recordData.treatmentPlan} onChange={(e) => setRecordData({...recordData, treatmentPlan: e.target.value})} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', minHeight: '80px' }}></textarea>
                                      <button type="submit" className="glow-button" style={{ marginTop: '10px' }}>Save Log</button>
                                   </form>
                               )}
                           </div>
                       </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default VideoConsultation;
