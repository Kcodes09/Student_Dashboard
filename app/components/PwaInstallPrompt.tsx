"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function PwaInstallPrompt() {
  const { status } = useSession();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Update UI notify the user they can install the PWA
      // Only show if authenticated
      if (status === "authenticated") {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [status]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it up.
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="bg-[var(--bg-accent)] text-white px-4 py-3 flex items-center justify-between shadow-md z-50 relative">
      <div className="flex items-center gap-3">
        <span className="text-xl">📱</span>
        <div>
          <p className="font-bold text-sm">Install Student Dashboard</p>
          <p className="text-xs text-white/80">Add to your home screen for a better experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowPrompt(false)}
          className="px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 rounded-md transition"
        >
          Not Now
        </button>
        <button 
          onClick={handleInstallClick}
          className="px-3 py-1.5 text-xs font-bold bg-white text-[var(--bg-accent)] hover:bg-gray-100 rounded-md shadow-sm transition"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
