import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Video,
    Mic,
    MicOff,
    Hand,
    Share2,
    Settings,
    X,
    Monitor,
    Zap,
    Play,
    MonitorUp,
    MonitorOff,
    Cpu,
    Beaker,
    Waves
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Available labs that can be shared in a live session
const AVAILABLE_LABS = [
    {
        id: 'arduino',
        name: 'Arduino Uno',
        url: 'https://wokwi.com/projects/new/arduino-uno',
        icon: Cpu,
        color: 'bg-teal-500'
    },
    {
        id: 'chemistry',
        name: 'Chemistry (pH Scale)',
        url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html?locale=en',
        icon: Beaker,
        color: 'bg-purple-500'
    },
    {
        id: 'pendulum',
        name: 'Pendulum Lab',
        url: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html?locale=en',
        icon: Waves,
        color: 'bg-orange-500'
    },
    {
        id: 'ohms-law',
        name: 'Ohm\'s Law',
        url: 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html?locale=en',
        icon: Zap,
        color: 'bg-yellow-500'
    },
    {
        id: 'molecule-shapes',
        name: 'Molecule Shapes',
        url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=en',
        icon: Share2,
        color: 'bg-pink-500'
    },
    {
        id: 'double-slit',
        name: 'Wave Interference',
        url: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html?locale=en',
        icon: Share2,
        color: 'bg-blue-500'
    }
];

const LiveSessionPage = () => {
    const { courseId: routeRoomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const socketRef = useRef();

    // Session state
    const [roomId, setRoomId] = useState(routeRoomId || null);
    const [sessionName, setSessionName] = useState('');
    const [isInSession, setIsInSession] = useState(!!routeRoomId);
    const [selectedLab, setSelectedLab] = useState(AVAILABLE_LABS[0]);

    const [activeTab, setActiveTab] = useState('video');
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState([]);
    const [participants, setParticipants] = useState([]);

    // Mic state
    const [isMicOn, setIsMicOn] = useState(false);
    const localStreamRef = useRef(null);

    // Screen sharing state (for streaming the lab)
    const [isStreaming, setIsStreaming] = useState(false);
    const screenStreamRef = useRef(null);
    const peerConnectionsRef = useRef(new Map());
    const remoteVideoRef = useRef(null);
    const [receivingStream, setReceivingStream] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const iceCandidateQueueRef = useRef(new Map()); // socketId -> queue[]

    // Create peer connection for a student
    const createPeerConnectionForStudent = useCallback((studentSocketId) => {
        if (!screenStreamRef.current || !socketRef.current) return;

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionsRef.current.set(studentSocketId, pc);

        screenStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, screenStreamRef.current);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('webrtc_ice_candidate', {
                    courseId: roomId,
                    candidate: event.candidate,
                    targetSocketId: studentSocketId
                });
            }
        };

        pc.onnegotiationneeded = async () => {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current.emit('webrtc_offer', {
                    courseId: roomId,
                    offer: pc.localDescription,
                    targetSocketId: studentSocketId
                });
            } catch (err) {
                console.error('Error creating offer:', err);
            }
        };

        return pc;
    }, [roomId]);

    // Socket Connection
    useEffect(() => {
        if (!user || !roomId) return;

        const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Connected to live session server');
            socket.emit('join_session', { courseId: roomId, user });
        });

        socket.on('participants_updated', (list) => {
            setParticipants(list);
            // Teacher: if streaming, create peer connection for new students
            if (user.role === 'teacher' && screenStreamRef.current) {
                list.forEach(p => {
                    if (p.role === 'student' && !peerConnectionsRef.current.has(p.socketId)) {
                        createPeerConnectionForStudent(p.socketId);
                    }
                });
            }
        });

        socket.on('student_raised_hand', (student) => {
            if (user.role === 'teacher') {
                setRaisedHands(prev => [...prev.filter(h => h._id !== student._id), student]);
                toast(`${student.name} raised their hand!`, { icon: '👋' });
            }
        });

        socket.on('student_lowered_hand', (userId) => {
            setRaisedHands(prev => prev.filter(h => h._id !== userId));
        });

        socket.on('session_ended', () => {
            toast('Session has ended.', { icon: '📢' });
            cleanupStream();
            setIsInSession(false);
            setRoomId(null);
            navigate('/live-session');
        });

        // --- WebRTC signaling (student side) ---
        socket.on('screen_share_started', ({ teacherSocketId }) => {
            setReceivingStream(true);
            console.log('📡 Teacher started sharing:', teacherSocketId);
            toast.success('Teacher is sharing the lab!');
        });

        socket.on('screen_share_stopped', () => {
            setReceivingStream(false);
            setRemoteStream(null);
            peerConnectionsRef.current.forEach(pc => pc.close());
            peerConnectionsRef.current.clear();
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

        socket.on('webrtc_offer', async ({ offer, fromSocketId }) => {
            if (user.role !== 'student') return;
            console.log('📡 Received WebRTC offer from:', fromSocketId);
            try {
                // Cleanup existing PC for this sender if any
                if (peerConnectionsRef.current.has(fromSocketId)) {
                    peerConnectionsRef.current.get(fromSocketId).close();
                }

                const pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnectionsRef.current.set(fromSocketId, pc);
                iceCandidateQueueRef.current.set(fromSocketId, []);

                pc.ontrack = (event) => {
                    console.log('📡 Received remote track:', event.track.kind, 'Stream ID:', event.streams[0]?.id);
                    if (event.streams[0]) {
                        setRemoteStream(event.streams[0]);
                    }
                };

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('webrtc_ice_candidate', {
                            courseId: roomId,
                            candidate: event.candidate,
                            targetSocketId: fromSocketId
                        });
                    }
                };

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                console.log('✅ Remote description set for:', fromSocketId);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('✅ Local description (answer) created');

                socket.emit('webrtc_answer', {
                    courseId: roomId,
                    answer: pc.localDescription,
                    targetSocketId: fromSocketId
                });

                // Process queued candidates
                const queue = iceCandidateQueueRef.current.get(fromSocketId) || [];
                console.log(`📦 Processing ${queue.length} queued ICE candidates for: ${fromSocketId}`);
                for (const candidate of queue) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                iceCandidateQueueRef.current.delete(fromSocketId);

            } catch (err) {
                console.error('❌ Error handling offer:', err);
            }
        });

        socket.on('webrtc_answer', async ({ answer, fromSocketId }) => {
            const pc = peerConnectionsRef.current.get(fromSocketId);
            if (pc) {
                try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); }
                catch (err) { console.error('Error setting answer:', err); }
            }
        });

        socket.on('webrtc_ice_candidate', async ({ candidate, fromSocketId }) => {
            const pc = peerConnectionsRef.current.get(fromSocketId);
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('✅ ICE candidate added for:', fromSocketId);
                }
                catch (err) { console.error('❌ Error adding ICE:', err); }
            } else {
                console.log('📥 Queuing ICE candidate for:', fromSocketId);
                const queue = iceCandidateQueueRef.current.get(fromSocketId) || [];
                queue.push(candidate);
                iceCandidateQueueRef.current.set(fromSocketId, queue);
            }
        });

        return () => {
            socket.disconnect();
            cleanupStream();
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, user]);

    // --- Student: Attach remote stream when video element mounts ---
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            console.log('📺 Attaching remote stream to video element');
            remoteVideoRef.current.srcObject = remoteStream;

            // Explicitly play to prevent black screen if stuck
            const playPromise = remoteVideoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => console.log('Autoplay blocked initially, needs user interaction for sound. Video will remain muted.'));
            }
        }
    }, [remoteStream, receivingStream]);

    const cleanupStream = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
        }
        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();
        setIsStreaming(false);
    };

    // --- Teacher: Start/Stop streaming the lab tab ---
    const toggleLabStream = async () => {
        if (isStreaming) {
            cleanupStream();
            socketRef.current?.emit('screen_share_stopped', { courseId: roomId });
            toast('Lab streaming stopped.', { icon: '🖥️' });
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: true,
                    preferCurrentTab: true
                });
                screenStreamRef.current = stream;
                setIsStreaming(true);

                socketRef.current?.emit('screen_share_started', { courseId: roomId });

                // Peer connections for all current students
                participants.forEach(p => {
                    if (p.role === 'student') createPeerConnectionForStudent(p.socketId);
                });

                stream.getVideoTracks()[0].onended = () => {
                    cleanupStream();
                    socketRef.current?.emit('screen_share_stopped', { courseId: roomId });
                };

                toast.success('Lab is now streaming to students!');
            } catch (err) {
                console.error('Stream denied:', err);
                toast.error('Streaming was cancelled.');
            }
        }
    };

    // Mic
    const toggleMic = async () => {
        if (isMicOn) {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            setIsMicOn(false);
            toast('Microphone off', { icon: '🔇' });
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                setIsMicOn(true);
                toast.success('Microphone is live!');
            } catch (err) { toast.error('Could not access microphone.'); }
        }
    };

    const handleRaiseHand = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        if (newState) socketRef.current?.emit('raise_hand', { courseId: roomId, user });
        else socketRef.current?.emit('lower_hand', { courseId: roomId, userId: user._id });
    };

    const handleEndSession = () => {
        cleanupStream();
        socketRef.current?.emit('end_session', { courseId: roomId });
        setIsInSession(false);
        setRoomId(null);
        navigate('/live-session');
    };

    const handleStartSession = () => {
        const newRoomId = `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setRoomId(newRoomId);
        setIsInSession(true);
        navigate(`/live-session/${newRoomId}`, { replace: true });
    };

    const teacherParticipant = participants.find(p => p.role === 'teacher');
    const studentParticipants = participants.filter(p => p.role === 'student');
    const onlineCount = participants.length;

    // ============================================================
    // LOBBY — Teacher picks a lab and starts the session
    // ============================================================
    if (!isInSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-2xl w-full"
                    >
                        <div className="relative mx-auto w-28 h-28 mb-8">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl rotate-6 animate-pulse" />
                            <div className="absolute inset-0 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                <Video className="w-14 h-14 text-white" />
                            </div>
                        </div>

                        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Live Session</h1>

                        {user?.role === 'teacher' ? (
                            <>
                                <p className="text-slate-500 mb-6 text-lg">
                                    Select a lab, name your session, and go live.
                                </p>

                                {/* Lab Selector */}
                                <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto mb-6">
                                    {AVAILABLE_LABS.map(lab => {
                                        const Icon = lab.icon;
                                        return (
                                            <button
                                                key={lab.id}
                                                onClick={() => setSelectedLab(lab)}
                                                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${selectedLab.id === lab.id
                                                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10 scale-105'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 ${lab.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 block">{lab.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Session Name */}
                                <div className="max-w-sm mx-auto mb-6">
                                    <input
                                        type="text"
                                        placeholder="Session name (e.g. LED Blink Demo)..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        value={sessionName}
                                        onChange={(e) => setSessionName(e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={handleStartSession}
                                    className="inline-flex items-center px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    <Play className="w-6 h-6 mr-3 fill-white" />
                                    GO LIVE
                                </button>
                                <p className="text-xs text-slate-400 mt-4">
                                    The lab will open for you to interact with. Click "Stream to Students" to broadcast your view.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-500 mb-8 text-lg">
                                    Your teacher hasn't started a session yet. Check your dashboard.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    // ============================================================
    // SESSION VIEW
    // ============================================================
    const renderMainContent = () => {
        // --- STUDENT VIEW ---
        if (user.role === 'student') {
            if (receivingStream) {
                return (
                    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-4 left-4 z-10 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white font-bold flex items-center shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                            LIVE — Teacher's Lab
                        </div>
                        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-slate-300 font-medium">
                            👁️ View Only
                        </div>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            muted // Essential for browser autoplay policies
                            className="w-full h-full object-contain"
                            style={{ background: '#000' }}
                        />
                    </div>
                );
            }
            return (
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Monitor className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Waiting for Teacher</h3>
                    <p className="text-slate-500 max-w-sm">
                        Your teacher will start sharing the lab shortly. You'll see their live interactions here in real-time.
                    </p>
                </div>
            );
        }

        // --- TEACHER VIEW: Interactive Wokwi Lab ---
        const labUrl = selectedLab?.url;

        return (
            <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
                {/* Lab info bar */}
                <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 ${selectedLab.color} rounded-lg flex items-center justify-center`}>
                            {React.createElement(selectedLab.icon, { className: 'w-4 h-4 text-white' })}
                        </div>
                        <span className="text-white font-bold text-sm">{selectedLab.name}</span>
                        {isStreaming && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                                STREAMING TO {studentParticipants.length} STUDENT{studentParticipants.length !== 1 ? 'S' : ''}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={toggleLabStream}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isStreaming
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {isStreaming ? (
                            <><MonitorOff className="w-3.5 h-3.5" /><span>Stop Streaming</span></>
                        ) : (
                            <><MonitorUp className="w-3.5 h-3.5" /><span>Stream to Students</span></>
                        )}
                    </button>
                </div>

                {/* Lab iframe — teacher can interact */}
                {labUrl ? (
                    <iframe
                        src={labUrl}
                        title={selectedLab.name}
                        className="flex-1 w-full border-0"
                        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <p className="text-sm">This lab is a local component. Use "Stream to Students" to broadcast your view.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-[3] p-4 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-3 animate-pulse" />
                                {sessionName || 'Live Session'}
                            </h1>
                            <p className="text-sm text-slate-500 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {onlineCount} participant{onlineCount !== 1 ? 's' : ''} online
                                {teacherParticipant && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • Led by {teacherParticipant.name}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Room link copied!');
                                }}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono transition-all"
                            >
                                📋 {roomId?.slice(-8)}
                            </button>
                            {user.role === 'teacher' ? (
                                <button
                                    onClick={handleEndSession}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center shadow-lg transition-all"
                                >
                                    <X className="w-4 h-4 mr-2" /> End Session
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all"
                                >
                                    Leave
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        {renderMainContent()}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex-1 w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 overflow-hidden">
                    <div className="bg-slate-800 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white uppercase tracking-widest font-bold">
                                {user.role === 'teacher' ? 'Instructor (You)' : user.name}
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className="text-[10px] text-slate-400">{isMicOn ? 'MIC ON' : 'MIC OFF'}</span>
                            </div>
                        </div>

                        {isMicOn && (
                            <div className="flex items-end justify-center space-x-1 h-8 mb-3">
                                {[...Array(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-green-400 rounded-full animate-pulse"
                                        style={{
                                            height: `${Math.random() * 100}%`,
                                            animationDelay: `${i * 0.1}s`,
                                            animationDuration: `${0.4 + Math.random() * 0.4}s`
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-center space-x-3">
                            <button
                                onClick={toggleMic}
                                className={`w-11 h-11 ${isMicOn ? 'bg-green-500 hover:bg-green-600 ring-2 ring-green-400/50' : 'bg-slate-700 hover:bg-slate-600'} text-white rounded-full flex items-center justify-center shadow-lg transition-all`}
                                title={isMicOn ? 'Mute' : 'Unmute'}
                            >
                                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleRaiseHand}
                                className={`w-11 h-11 ${isHandRaised ? 'bg-orange-500 ring-2 ring-orange-400/50' : 'bg-slate-700 hover:bg-slate-600'} text-white rounded-full flex items-center justify-center shadow-lg transition-all`}
                            >
                                <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
                            </button>
                            {user.role === 'teacher' && (
                                <button
                                    onClick={toggleLabStream}
                                    className={`w-11 h-11 ${isStreaming ? 'bg-red-500 hover:bg-red-600 ring-2 ring-red-400/50' : 'bg-slate-700 hover:bg-slate-600'} text-white rounded-full flex items-center justify-center shadow-lg transition-all`}
                                    title={isStreaming ? 'Stop Streaming' : 'Stream Lab'}
                                >
                                    {isStreaming ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 px-2 pt-2">
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider ${activeTab === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Controls
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider relative ${activeTab === 'participants' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Audience ({onlineCount})
                            {raisedHands.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {activeTab === 'video' && (
                                <motion.div
                                    key="controls"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {user.role === 'teacher' ? (
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center uppercase tracking-tight">
                                                    <MonitorUp className="w-4 h-4 mr-2" /> Lab Streaming
                                                </h4>
                                                {isStreaming ? (
                                                    <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center">
                                                        <div className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse" />
                                                        Streaming to {studentParticipants.length} student{studentParticipants.length !== 1 ? 's' : ''}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-600">
                                                        Click "Stream to Students" in the lab header to broadcast your interactions. Students will see a live video feed of your lab.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <Monitor className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800">View Only Mode</h4>
                                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                                {receivingStream
                                                    ? 'You are watching the teacher\'s lab live. Observe and learn!'
                                                    : 'Waiting for teacher to start streaming the lab.'}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Session Info</h4>
                                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-green-100 text-green-600">
                                                <Zap className="w-3 h-3 fill-current" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-700">
                                                {onlineCount} connected • {studentParticipants.length} student{studentParticipants.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                                                <Settings className="w-3 h-3" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-700">
                                                Room: {roomId?.slice(-8)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'participants' && (
                                <motion.div
                                    key="audience"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {user.role === 'teacher' && raisedHands.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest px-1 flex items-center">
                                                <Hand className="w-3 h-3 mr-1" /> Questions ({raisedHands.length})
                                            </h4>
                                            {raisedHands.map(student => (
                                                <div key={student._id} className="flex items-center justify-between bg-orange-50 border border-orange-100 p-3 rounded-xl shadow-sm">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-orange-600 border border-orange-200">
                                                            {student.name?.[0] || '?'}
                                                        </div>
                                                        <span className="text-xs font-bold text-orange-900">{student.name}</span>
                                                    </div>
                                                    <button onClick={() => setRaisedHands(prev => prev.filter(h => h._id !== student._id))} className="text-orange-400 hover:text-orange-600 p-1">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                        Connected ({participants.length})
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {participants.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4">No participants yet...</p>
                                        ) : (
                                            participants.map((p) => (
                                                <div key={p.socketId} className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 relative">
                                                        {p.name?.[0] || '?'}
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-700 block">{p.name}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${p.role === 'teacher' ? 'text-blue-500' : 'text-slate-400'}`}>
                                                            {p.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default LiveSessionPage;
