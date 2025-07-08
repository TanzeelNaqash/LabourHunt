import React, { useState, useEffect } from 'react';

export default function PrivacyBanner() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      // Wait for full page load
      const onLoad = () => {
        setVisible(true);
        // Slight delay to trigger animation after mount
        setTimeout(() => setAnimate(true), 50);
      };
      if (document.readyState === 'complete') {
        onLoad();
      } else {
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setAnimate(false);
    setTimeout(() => setVisible(false), 300); // Wait for animation out
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] max-w-md
        bg-white/95 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-4
        flex flex-col md:flex-row items-center gap-4
        transition-all duration-300
        ${animate ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
      `}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex-1 text-gray-800 text-sm md:text-base">
        We use cookies to enhance your experience. By continuing to browse, you agree to our use of cookies.{' '}
        <a href="/privacy" className="text-blue-600 underline hover:text-blue-800 transition">Learn More</a>
      </div>
      <button
        onClick={handleAccept}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-2 shadow transition"
      >
        Accept
      </button>
    </div>
  );
}