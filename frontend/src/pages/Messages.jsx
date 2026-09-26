import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Bot, User, MessageSquare, Loader2, Paperclip, Video, PhoneOff } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { uploadFile } from '../services/upload';
import { io } from 'socket.io-client';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const Messages = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [videoRoom, setVideoRoom] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  // Connect to Socket.IO
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', user._id);
    });

    // Receive real-time messages
    socket.on('receiveMessage', (message) => {
      const senderId = message.sender?._id || message.sender;
      // Add to current conversation if active
      setMessages(prev => {
        // Only add if the message is from the active contact
        return [...prev, {
          _id: message._id || Date.now(),
          sender: message.sender,
          receiver: message.receiver,
          text: message.text,
          createdAt: message.createdAt || new Date().toISOString()
        }];
      });

      // Update contact's last message
      setContacts(prev => prev.map(c => {
        if (String(c.id) === String(senderId)) {
          return { ...c, lastMessage: message.text, lastMessageTime: new Date().toISOString(), unreadCount: (c.unreadCount || 0) + 1 };
        }
        return c;
      }));
    });

    socket.on('userTyping', ({ senderId }) => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('userStopTyping', () => {
      setIsTyping(false);
    });

    socket.on('videoOffer', async ({ offer, from }) => {
      await ensurePeer(false);
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit('videoAnswer', { roomId: from.roomId, answer, from: { userId: user._id, roomId: from.roomId } });
      setVideoRoom(from.roomId);
    });

    socket.on('videoAnswer', async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('iceCandidate', async ({ candidate }) => {
      if (peerRef.current && candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const ensurePeer = async (isCaller, roomId) => {
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    }

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    peerRef.current = peer;

    localStreamRef.current.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
    peer.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && (roomId || videoRoom)) {
        socketRef.current.emit('iceCandidate', {
          roomId: roomId || videoRoom,
          candidate: event.candidate,
          from: { userId: user._id },
        });
      }
    };

    if (isCaller) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current.emit('videoOffer', {
        roomId,
        offer,
        from: { userId: user._id, roomId },
      });
    }
  };

  const startVideoCall = async () => {
    if (!activeContact?.id || !socketRef.current) return;
    const roomId = [user._id, activeContact.id].sort().join('_');
    setVideoRoom(roomId);
    socketRef.current.emit('joinVideoRoom', { roomId, userId: user._id });
    await ensurePeer(true, roomId);
  };

  const endVideoCall = () => {
    if (socketRef.current && videoRoom) {
      socketRef.current.emit('leaveVideoRoom', { roomId: videoRoom, userId: user._id });
    }
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setVideoRoom(null);
  };

  // Load contacts: merge API contacts + ongoing project partners
  useEffect(() => {
    const loadContacts = async () => {
      if (!user) return;
      setLoadingContacts(true);
      try {
        // Load chat contacts from API
        const [contactsRes, ongoingRes] = await Promise.all([
          api.get('/messages/contacts').catch(() => ({ data: { data: [] } })),
          api.get('/jobs/ongoing').catch(() => ({ data: { data: [] } }))
        ]);

        const apiContacts = (contactsRes.data.data || []).map(c => ({
          ...c,
          id: String(c.id || c._id),
        }));

        // Extract partners from ongoing projects
        const ongoingPartners = [];
        (ongoingRes.data.data || []).forEach(contract => {
          const isClient = user.role === 'client';
          const otherParty = isClient ? contract.freelancer : contract.client;
          if (!otherParty) return;

          const partnerId = String(otherParty._id || otherParty.id);
          // Skip if already in API contacts
          if (apiContacts.find(c => c.id === partnerId)) return;

          ongoingPartners.push({
            id: partnerId,
            name: otherParty.name || 'User',
            email: otherParty.email || '',
            avatar: (otherParty.name || 'U').charAt(0).toUpperCase(),
            online: true,
            role: isClient ? 'Hired Freelancer' : 'Contracting Client',
            bio: otherParty.email || `Working on: ${contract.jobTitle || 'Project'}`,
            lastMessage: '',
            unreadCount: 0
          });
        });

        const allContacts = [...apiContacts, ...ongoingPartners];
        setContacts(allContacts);

        // Auto-select from navigation state or first contact
        if (location.state?.activeChatPartner) {
          const partner = location.state.activeChatPartner;
          const partnerId = String(partner.id);
          let found = allContacts.find(c => c.id === partnerId || (c.name || '').toLowerCase() === (partner.name || '').toLowerCase());
          if (!found) {
            // Add partner if not found
            found = { ...partner, id: partnerId };
            allContacts.unshift(found);
            setContacts([...allContacts]);
          }
          setActiveContact(found);
        } else if (allContacts.length > 0) {
          setActiveContact(allContacts[0]);
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [user]);

  // Load conversation when active contact changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!activeContact?.id) return;
      setLoadingMessages(true);
      try {
        const res = await api.get(`/messages/conversation/${activeContact.id}`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadConversation();
  }, [activeContact?.id]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if ((!text && attachments.length === 0) || !activeContact?.id) return;

    // Optimistic UI update
    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender: { _id: user._id, name: user.name },
      receiver: { _id: activeContact.id },
      text,
      attachments,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');
    setAttachments([]);

    try {
      const res = await api.post('/messages', {
        receiverId: activeContact.id,
        text,
        attachments
      });

      // Replace optimistic message with real one
      setMessages(prev => prev.map(m =>
        m._id === optimisticMsg._id ? res.data.data : m
      ));

      // Emit via socket for real-time delivery
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          receiverId: activeContact.id,
          message: res.data.data
        });
      }

      // Update contact's last message
      setContacts(prev => prev.map(c =>
        c.id === activeContact.id
          ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
    }
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file, 'skillsphere/chat');
      setAttachments(prev => [...prev, {
        name: file.name,
        url: uploaded.url,
        type: file.type,
        size: file.size,
      }]);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socketRef.current && activeContact?.id) {
      socketRef.current.emit('typing', { receiverId: activeContact.id, senderId: user._id });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return String(senderId) === String(user?._id);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/20">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-heading">Messages</h1>
          <p className="text-slate-400 mt-1 font-medium">Direct chats, negotiations, and interview sessions with your contacts.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact List */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border-white/5 space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 w-4 h-4 transition-colors z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs font-bold">
                  No contacts found. Accept a project to start chatting!
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <motion.button
                    key={contact.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 relative overflow-hidden group ${
                      activeContact?.id === contact.id
                        ? 'bg-primary-500 border-primary-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-lg border border-white/10 relative shrink-0">
                      {contact.avatar || (contact.name || 'U').charAt(0).toUpperCase()}
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                      )}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className={`text-sm font-bold truncate ${activeContact?.id === contact.id ? 'text-white' : 'text-slate-200'}`}>
                        {contact.name}
                      </p>
                      <p className={`text-[10px] truncate ${activeContact?.id === contact.id ? 'text-primary-200' : 'text-slate-500'}`}>
                        {contact.lastMessage || contact.role || contact.email}
                      </p>
                    </div>
                    {contact.unreadCount > 0 && activeContact?.id !== contact.id && (
                      <span className="w-5 h-5 bg-primary-500 rounded-full text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        {contact.unreadCount}
                      </span>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col h-[600px] relative">
            {activeContact ? (
              <>
                {/* Header info */}
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-lg border border-white/10 relative shrink-0">
                      {activeContact.avatar || (activeContact.name || 'U').charAt(0).toUpperCase()}
                      {activeContact.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading">{activeContact.name}</h3>
                      <p className="text-slate-500 text-xs font-semibold">{activeContact.bio || activeContact.email || activeContact.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={startVideoCall}
                    className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                    title="Start video call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </div>

                {videoRoom && (
                  <div className="p-4 border-b border-white/5 bg-slate-950/70 grid grid-cols-2 gap-3">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full aspect-video rounded-2xl bg-black object-cover" />
                    <div className="relative">
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full aspect-video rounded-2xl bg-black object-cover" />
                      <button
                        type="button"
                        onClick={endVideoCall}
                        className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Chats Container */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" data-lenis-prevent>
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.length > 0 ? (
                        messages.map(msg => {
                          const isMine = isMyMessage(msg);
                          return (
                            <motion.div
                              key={msg._id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex gap-4 max-w-[80%] ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                            >
                              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                                isMine ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-primary-500/10 border-primary-500/20 text-primary-400'
                              }`}>
                                {isMine ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </div>
                              <div className="space-y-1.5">
                                <div className={`p-4 rounded-[1.7rem] text-sm leading-relaxed font-medium shadow-xl ${
                                  isMine
                                    ? 'premium-gradient text-white rounded-tr-none'
                                    : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none'
                                }`}>
                                  {msg.text}
                                  {msg.attachments?.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {msg.attachments.map((file, idx) => (
                                        <a key={`${file.url}-${idx}`} href={file.url} target="_blank" rel="noreferrer" className="block text-xs underline">
                                          {file.name || 'Attachment'}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className={`text-[9px] font-bold text-slate-500 uppercase tracking-widest ${isMine ? 'pr-2 text-right' : 'pl-2'}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 space-y-2">
                          <MessageSquare className="w-12 h-12 text-slate-700" />
                          <p className="font-bold">No messages yet</p>
                          <p className="text-xs max-w-xs font-semibold">Start the conversation below! Send a hello to negotiate on your gigs.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  )}

                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%] mr-auto">
                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border bg-primary-500/10 border-primary-500/20 text-primary-400">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-slate-900/60 border border-white/5 p-4 rounded-[1.7rem] rounded-tl-none flex items-center gap-1 shadow-xl">
                        <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Footer Input */}
                <div className="p-6 border-t border-white/5 bg-[#0f172a]/50">
                  <form onSubmit={handleSend} className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-3xl p-2.5 focus-within:border-primary-500/50 transition-colors">
                    <label className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 cursor-pointer hover:text-white">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" className="hidden" onChange={handleAttachmentUpload} />
                    </label>
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent px-4 text-white text-sm focus:outline-none placeholder:text-slate-600"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary-500/30 transition-shadow shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                <MessageSquare className="w-16 h-16 text-slate-700" />
                <p className="font-bold text-lg">Select a contact to start chatting</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Messages;
