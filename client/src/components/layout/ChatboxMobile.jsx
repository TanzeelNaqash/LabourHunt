import React, { useState, useEffect, useRef } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import useAuthStore from '@/store/authStore';
import { useLocation } from 'wouter';

export default function ChatboxMobile() {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileInput, setMobileInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);
  const [guestMobile, setGuestMobile] = useState("");
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [, navigate] = useLocation();
  const [guestDetails, setGuestDetails] = useState(null);
  const [unreadAdminReplies, setUnreadAdminReplies] = useState(0);

  const verifiedPhone = useAuthStore(s => s.verifiedPhone);
  const currentRole = useAuthStore(s => s.currentRole);
  const user = useAuthStore(s => s.user);
  const worker = useAuthStore(s => s.worker);

  // Determine current userType and details
  const isLoggedIn = !!verifiedPhone && (currentRole === 'client' || currentRole === 'worker');
  const canChat = isLoggedIn || (guestMobile && guestDetails);
  const chatUserType = isLoggedIn ? currentRole : guestDetails?.role;
  const chatUserId = isLoggedIn
    ? (currentRole === 'client' ? user?._id : worker?._id)
    : guestDetails?.id;

  // Get or create thread
  useEffect(() => {
    if (!canChat || !chatUserId || !chatUserType) return;
    setLoading(true);
    fetch('/api/v1/chat/thread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: chatUserId, userType: chatUserType }),
        credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setThread(data);
        setLoading(false);
      });
  }, [canChat, chatUserId, chatUserType]);

  // Fetch messages when thread changes
  useEffect(() => {
    if (!thread?._id) return;
    setLoading(true);
    fetch(`/api/v1/chat/messages?threadId=${thread._id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(msgs => {
        setMessages(msgs);
        setLoading(false);
      });
  }, [thread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Fetch unread count from backend when chat is closed
  useEffect(() => {
    if (!open && canChat && thread?._id) {
      fetch(`/api/v1/chat/unread-count?threadId=${thread._id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setUnreadAdminReplies(data.unreadCount || 0);
        });
    }
  }, [open, canChat, thread?._id]);

  // Reset unread count and notify backend when chat is opened
  useEffect(() => {
    if (open && thread?._id) {
      fetch(`/api/v1/chat/reset-unread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: thread._id }),
        credentials: 'include'
      });
      setUnreadAdminReplies(0);
    }
  }, [open, thread?._id]);

  // Handle send
  const handleSend = async () => {
    if (!input.trim() || !thread?._id) return;
    const sender = chatUserType;
    const senderId = chatUserId;
    await fetch("/api/v1/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: thread._id,
        sender,
        senderId,
        message: input
      }),
      credentials: 'include'
    });
    setInput("");
    // Fetch messages after sending
    fetch(`/api/v1/chat/messages?threadId=${thread._id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(msgs => {
        setMessages(msgs);
      });
  };

  // Handle mobile form submit for guest (no userType needed)
  const handleCheckMobile = async (e) => {
    e.preventDefault();
    setChecking(true);
    setNotRegistered(false);
    setGuestDetails(null);
    // Try both user and worker endpoints
    try {
      let res = await fetch('/api/v1/users/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileInput })
      });
      let data = await res.json();
      if (data.exists) {
        setGuestMobile(mobileInput);
        setGuestDetails(data.user || null);
        return;
      }
      // Try worker if not found as user
      res = await fetch('/api/v1/workers/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileInput })
      });
      data = await res.json();
      if (data.exists) {
        setGuestMobile(mobileInput);
        setGuestDetails(data.worker || null);
        return;
      }
      setNotRegistered(true);
    } catch {
      setNotRegistered(true);
    } finally {
      setChecking(false);
    }
  };

  // Floating trigger button
  if (!open) {
    return (
      <button
        className="fixed bottom-4 right-4 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-3 md:p-4 flex flex-col items-center group md:bottom-6 md:right-6"
        onClick={() => {
          setOpen(true);
          if (!isLoggedIn) {
            setGuestMobile("");
            setGuestDetails(null);
          }
        }}
        aria-label="Open support chat"
        style={{ position: 'fixed' }}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6 md:h-7 md:w-7" />
        {unreadAdminReplies > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse">
            {unreadAdminReplies}
          </span>
        )}
        <span className="text-xs mt-1 bg-white/90 text-green-700 px-2 py-0.5 rounded shadow group-hover:opacity-100 opacity-0 transition-opacity absolute bottom-14 right-0 whitespace-nowrap md:bottom-16">
          Chat with Support
        </span>
      </button>
    );
  }

  // Always show guest mobile form for guests when chatbox is open and not logged in
  if (open && !isLoggedIn && (!guestMobile || !guestDetails)) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col animate-fade-in  md:fixed md:bottom-6 md:right-6 md:left-auto md:w-[375px] md:max-h-[90vh] md:h-[600px] md:rounded-3xl md:shadow-2xl md:bg-white/90 md:backdrop-blur-lg md:border md:border-gray-200 w-full bg-white"
      >
        <div className="flex flex-col h-full w-full bg-white md:rounded-3xl shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-3 border-b bg-gradient-to-r from-green-500/80 to-green-700/80 md:rounded-t-3xl">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow" />
              <span className="font-semibold text-white text-base md:text-lg tracking-wide">Support Chat</span>
            </div>
            <button onClick={() => { setOpen(false); setGuestMobile(""); setGuestDetails(null); }} className="text-white hover:bg-white/20 rounded-full p-1">
              <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
          <form onSubmit={handleCheckMobile} className="flex-1 flex flex-col justify-center items-center p-6 space-y-4">
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered Mobile Number</label>
              <input
                type="tel"
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 bg-gray-100 text-sm shadow"
                value={mobileInput}
                onChange={e => setMobileInput(e.target.value)}
                placeholder="Enter your registered mobile number"
                required
              />
              <div className="text-xs text-gray-500 mt-1">Only registered users and workers can chat with support.</div>
            </div>
            <button
              type="submit"
              className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 shadow mt-2"
              disabled={checking}
            >
              {checking ? "Checking..." : "Continue"}
            </button>
            {notRegistered && (
              <div className="text-red-700 text-sm text-center font-semibold border border-red-200 bg-red-50 rounded p-2 mt-2">
                This mobile number is <b>not registered</b>.<br />
                <button
                  className="underline text-green-700 hover:text-green-900 mt-1"
                  onClick={() => { setOpen(false); navigate('/auth'); }}
                  type="button"
                >
                  Register now
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Chatbox UI
  return (
    <div
      className="fixed z-50 flex flex-col animate-fade-in"
      style={{
        bottom: 0,
        right: 0,
        left: 0,
        height: '100dvh',
        maxWidth: '100vw',
        borderRadius: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        background: 'transparent',
      }}
    >
      <div
        className="md:fixed md:bottom-6 md:right-6 md:left-auto md:w-[375px] md:max-h-[90vh] md:h-[600px] md:rounded-3xl md:shadow-2xl md:bg-white/95 md:backdrop-blur-lg md:border md:border-gray-200 md:p-0 md:overflow-hidden flex flex-col h-full w-full bg-white border border-gray-200 shadow-xl"
        style={{
          height: window.innerWidth < 768 ? '100dvh' : '600px',
          maxHeight: window.innerWidth < 768 ? '100dvh' : '90vh',
          borderRadius: window.innerWidth < 768 ? 0 : '1.5rem',
          boxShadow: window.innerWidth < 768 ? '0 2px 16px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.16)',
          background: window.innerWidth < 768 ? '#fff' : 'rgba(255,255,255,0.95)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-3 border-b bg-gradient-to-r from-green-500/80 to-green-700/80 md:rounded-t-3xl"
          style={{ minHeight: 56 }}
        >
          <div>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow" />
              <span className="font-semibold text-white text-base md:text-lg tracking-wide">Support Chat</span>
              {unreadAdminReplies > 0 && !open && (
                <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse">
                  {unreadAdminReplies} New
                </span>
              )}
             
            </div>
            <div className="text-xs md:text-xs text-white/90 mt-1">
              Need help? Chat with our admin team. Only registered users can use this chat to get support or ask questions.
            </div>
          </div>
          <button onClick={() => { setOpen(false); setGuestMobile(""); setGuestDetails(null); }} className="text-white hover:bg-white/20 rounded-full p-1">
            <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3 bg-gradient-to-br from-gray-50 via-white to-green-50"
          style={{
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: 80,
          }}
        >
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
        {messages.map((msg, idx) => (
          <div
            key={idx}
                  className={`flex flex-col items-${msg.sender === chatUserType ? "end" : "start"}`}
                  style={{ alignItems: msg.sender === chatUserType ? "flex-end" : "flex-start" }}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] px-3 py-2 md:px-4 md:py-2 rounded-2xl shadow text-sm ${
                      msg.sender === chatUserType
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                    style={{ alignSelf: msg.sender === chatUserType ? "flex-end" : "flex-start" }}
            >
              {msg.message}
                  </div>
                  <span
                    className="ml-2 text-xs text-gray-400 mt-1"
                    style={{ alignSelf: msg.sender === chatUserType ? "flex-end" : "flex-start" }}
                  >
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))}
            </>
          )}
        </div>
        <div ref={messagesEndRef} />
        {/* Input */}
        {thread?.status === "closed" ? (
          <div className="w-full flex flex-col items-center justify-center py-6">
            <div className="text-gray-500 mb-2 text-center">
              This conversation is closed.<br />
              Start a new conversation to contact support.
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 shadow"
              onClick={async () => {
                setLoading(true);
                // Always create a new thread (force new by adding timestamp)
                const res = await fetch('/api/v1/chat/thread', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: chatUserId, userType: chatUserType, forceNew: Date.now() }),
                  credentials: 'include'
                });
                const data = await res.json();
                setThread(data);
                setMessages([]);
                setInput('');
                setLoading(false);
              }}
              disabled={loading}
            >
              Start New Conversation
            </button>
          </div>
        ) : (
        <div
          className="p-2 md:p-3 border-t bg-white/80 md:rounded-b-3xl flex gap-2 items-center"
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            minHeight: 56,
          }}
        >
        <input
            className="flex-1 border-none rounded-full px-3 py-3 md:px-4 md:py-2 focus:ring-2 focus:ring-green-400 bg-gray-100 text-base shadow"
          value={input}
          onChange={e => setInput(e.target.value)}
            placeholder="Type your message…"
            onKeyDown={e => e.key === "Enter" && handleSend()}
              disabled={loading}
            style={{
              minHeight: 44,
              fontSize: 16,
              WebkitAppearance: 'none',
              outline: 'none',
            }}
        />
        <button
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 md:p-2.5 shadow transition flex items-center justify-center"
            onClick={handleSend}
              disabled={!input.trim() || loading}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 md:h-5 md:w-5" />
        </button>
        </div>
        )}
      </div>
    </div>
  );
}