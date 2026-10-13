import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { ArrowRight, BookOpen, Check, Copy, GraduationCap, Headphones, Leaf, Link2, LoaderCircle, LockKeyhole, Plus, Users, Video, X } from 'lucide-react';

const JITSI_DOMAIN = 'meet.jit.si';
let jitsiScriptPromise;
function loadJitsiApi() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (!jitsiScriptPromise) jitsiScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load the meeting service. Check your internet connection and try again.'));
    document.head.appendChild(script);
  });
  return jitsiScriptPromise;
}

function JitsiMeeting({ roomCode, name, onLeave }) {
  const hostRef = useRef(null);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    let api;
    let cancelled = false;
    loadJitsiApi().then(() => {
      if (cancelled || !hostRef.current) return;
      api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: `MeetNest-${roomCode}`,
        parentNode: hostRef.current,
        width: '100%', height: '100%',
        userInfo: { displayName: name },
        configOverwrite: { startWithAudioMuted: true, startWithVideoMuted: true },
        interfaceConfigOverwrite: { MOBILE_APP_PROMO: false },
      });
      api.addEventListener('readyToClose', onLeave);
    }).catch((error) => { if (!cancelled) setLoadError(error.message); });
    return () => { cancelled = true; api?.dispose(); };
  }, [roomCode, name, onLeave]);
  return <><div className="jitsi-host" ref={hostRef}/>{loadError && <div className="meeting-error"><p>{loadError}</p><button onClick={onLeave}>Back to MeetNest</button></div>}</>;
}

function App() {
  const [page, setPage] = useState('home');
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [active, setActive] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const createRoom = async () => {
    setError(''); setBusy(true);
    try {
      const response = await fetch('/api/rooms', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create a room.');
      setRoomCode(data.roomCode); setPage('join');
    } catch (e) { setError(e.message || 'Could not reach the server.'); }
    finally { setBusy(false); }
  };

  const joinRoom = (event) => {
    event?.preventDefault(); setError('');
    if (roomCode.trim().length !== 8 || !displayName.trim()) return;
    setActive({ roomCode: roomCode.trim().toUpperCase(), name: displayName.trim().slice(0, 32) });
    setPage('meeting');
  };

  const leave = () => { setActive(null); setPage('home'); setError(''); };
  const copyCode = async () => { try { await navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setError('Copy failed. You can select the code and copy it.'); } };

  if (page === 'meeting' && active) return <div className="meeting-shell"><header className="meeting-top"><a className="brand" onClick={leave}><span className="brand-mark"><Leaf size={19}/></span>meetnest</a><div className="room-chip"><span className="live-dot"/>Room <b>{active.roomCode}</b></div><button className="leave-button" onClick={leave}><X size={17}/> Leave room</button></header><main className="meeting-main"><JitsiMeeting roomCode={active.roomCode} name={active.name} onLeave={leave}/></main></div>;

  return <div className="app-shell">
    <header className="site-header"><a className="brand" href="#" onClick={(e)=>{e.preventDefault();setPage('home')}}><span className="brand-mark"><Leaf size={19}/></span>meetnest</a><div className="header-note"><LockKeyhole size={14}/> No accounts. Just your study group.</div></header>
    <main className="main-content">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> A little space to focus together</div><h1>Good company.<br/><em>Better studying.</em></h1><p className="hero-text">Make a room for your study group, share the code, and get right into it. No sign-up, no fuss.</p><div className="hero-points"><span><Check size={15}/> Free to join</span><span><Check size={15}/> Audio & video</span><span><Check size={15}/> Made for students</span></div></div><div className="hero-art" aria-hidden="true"><div className="sun-shape"/><div className="art-window"><div className="window-head"><span/><span/><span/></div><div className="window-content"><div className="tiny-person person-one"><i/><b/></div><div className="tiny-person person-two"><i/><b/></div><div className="tiny-person person-three"><i/><b/></div><div className="book-stack"><i/><i/><i/></div></div></div><span className="art-spark spark-a">✳</span><span className="art-spark spark-b">✦</span><div className="art-caption"><BookOpen size={15}/> study nook, currently open</div></div></section>
      <section className="action-grid" aria-label="Get started">
        <article className="action-card create-card"><div className="card-icon green-icon"><Plus size={21}/></div><div className="card-kicker">START A SESSION</div><h2>Make your own room</h2><p>Get a fresh room code to share with your classmates.</p>{page==='home' ? <button className="primary-button" onClick={createRoom} disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Video size={17}/>} Create a room <ArrowRight size={16}/></button> : <div className="created-room"><div className="code-label">YOUR ROOM CODE</div><div className="code-row"><strong>{roomCode}</strong><button aria-label="Copy room code" onClick={copyCode}>{copied?<Check size={17}/>:<Copy size={17}/>}</button></div><button className="primary-button" onClick={()=>{setDisplayName('');setPage('join')}}>Enter this room <ArrowRight size={16}/></button></div>}<div className="card-foot"><Users size={14}/> Anyone with the code can join</div></article>
        <article className="action-card join-card"><div className="card-icon peach-icon"><Link2 size={20}/></div><div className="card-kicker">JOIN A SESSION</div><h2>Have a room code?</h2><p>Enter the code your friend or classmate shared.</p><form onSubmit={(e)=>{e.preventDefault();setPage('join')}}><label className="field-label" htmlFor="room-code">Room code</label><div className="input-wrap"><input id="room-code" value={roomCode} onChange={(e)=>setRoomCode(e.target.value.replace(/[^a-fA-F0-9]/g,'').slice(0,8).toUpperCase())} placeholder="e.g. 4F8A2C1D" maxLength={8}/><button type="submit" aria-label="Continue" disabled={roomCode.length!==8}><ArrowRight size={18}/></button></div><div className="card-foot"><Headphones size={14}/> You can choose your name next</div></form></article>
      </section>
      {page==='join' && <div className="join-overlay" role="dialog" aria-modal="true" aria-labelledby="join-title"><form className="join-modal" onSubmit={joinRoom}><button type="button" className="modal-close" aria-label="Close" onClick={()=>setPage('home')}><X size={18}/></button><div className="card-icon green-icon"><Video size={19}/></div><div className="card-kicker">YOU’RE ALMOST THERE</div><h2 id="join-title">Join room <span className="modal-code">{roomCode}</span></h2><p>What should your classmates call you?</p><label className="field-label" htmlFor="display-name">Your name</label><input className="name-input" id="display-name" autoFocus maxLength={32} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="e.g. Alex" required/><div className="modal-error" role="alert">{error}</div><button className="primary-button" type="submit" disabled={!displayName.trim()}><Video size={17}/> Join meeting <ArrowRight size={16}/></button><div className="privacy-note"><LockKeyhole size={13}/> Your mic and camera permissions are controlled by your browser.</div></form></div>}
      {error && page!=='join' && <div className="toast-error" role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss"><X size={15}/></button></div>}
      <section className="how"><div className="how-title"><span className="eyebrow-line"/> EASY AS 1, 2, 3</div><div className="steps"><div className="step"><span>01</span><div><b>Create or join</b><small>Start a room or enter a code</small></div></div><div className="step-divider"/><div className="step"><span>02</span><div><b>Pick your name</b><small>No account or email needed</small></div></div><div className="step-divider"/><div className="step"><span>03</span><div><b>Study together</b><small>Turn on video when you’re ready</small></div></div></div></section>
    </main><footer className="site-footer"><span><GraduationCap size={16}/> A calmer corner of the internet for students</span><span>Built for good focus <span className="heart">✳</span></span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
