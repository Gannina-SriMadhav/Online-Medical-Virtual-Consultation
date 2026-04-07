import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import toast from 'react-hot-toast';

const VideoConsultation = ({ appointmentId, isDoctor, onClose }) => {
  const [errorStatus, setErrorStatus] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [remoteStreamAttached, setRemoteStreamAttached] = useState(false);
  const remoteStreamAttachedRef = useRef(false);
  
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
             <div className="glass-card" style={{ width: '95%', maxWidth: '800px', height: 'auto', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, minHeight: '300px', background: '#111', position: 'relative' }}>
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
                <div className="glass-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.1)' }}>
                   <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '15px', color: 'white' }}>{isDoctor ? 'Patient' : 'Doctor'}</div>
                   {!remoteStreamAttached && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Waiting for connection...</span>
                      </div>
                   )}
                </div>

                {/* Call Controls Floating */}
                <div className="glass-card" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', display: 'flex', gap: '20px', borderRadius: '50px', zIndex: 10 }}>
                   <button onClick={() => setMicEnabled(!micEnabled)} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: micEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {micEnabled ? '🎙️' : '🔇'}
                   </button>
                   <button onClick={() => setCameraEnabled(!cameraEnabled)} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: cameraEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444', color: 'white', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {cameraEnabled ? '📹' : '🚫'}
                   </button>
                   <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
                   <button onClick={onClose} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      📞
                   </button>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default VideoConsultation;
