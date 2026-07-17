import React, { useState, useEffect } from 'react';
import { Share, MoreVertical, PlusSquare, MonitorSmartphone, Download, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export function InstallPwaModal({ isOpen, onClose, deferredPrompt }: InstallPwaModalProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsStandalone(true);
      }
      const isMacLike = navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1;
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(isIOSDevice || isMacLike);
    }

    const handleAppInstalled = () => {
      onClose();
      alert("Successfully installed! Look for Sauna Map on your home screen or app drawer to launch it.");
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isOpen, onClose]);

  const handleNativeInstall = async () => {
    // Access the global window object directly to ensure we have the absolute latest event
    const promptEvent = (window as any).deferredPrompt || deferredPrompt;
    
    if (promptEvent) {
      try {
        // MUST be called synchronously on the very first line of the event handler
        // to guarantee Chrome accepts the user gesture!
        promptEvent.prompt();
        
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log("Accepted! Android is building the App in the background...");
        } else {
          console.log("Install prompt was dismissed.");
        }
        (window as any).deferredPrompt = null;
      } catch (err: any) {
        alert(`Install error: ${err.message}`);
      }
    } else {
      alert("No install prompt available. Your browser might not support it or it's already installed.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 size-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="size-5" />
          </button>

          <div className="bg-gradient-to-br from-primary to-sky p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 w-20 h-20 bg-white rounded-3xl mx-auto shadow-2xl flex items-center justify-center mb-4 p-3"
            >
              <img src="/logo.png" alt="Nordic Sauna Logo" className="w-full h-full object-contain" />
            </motion.div>
            <h2 className="relative z-10 text-2xl font-black uppercase tracking-widest">Install App</h2>
            <p className="relative z-10 text-white/90 mt-2 font-light text-sm">
              Get quick access, offline map capabilities, and a seamless cultural experience.
            </p>
          </div>

          <div className="p-6">
            {isStandalone ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">You're all set!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">You are already using the installed version of Sauna Map.</p>
                <button 
                  onClick={onClose} 
                  className="mt-6 w-full h-12 rounded-xl bg-slate-900 dark:bg-primary text-white font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Awesome!
                </button>
              </div>
            ) : deferredPrompt ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Install Nordic Sauna Map directly to your device's home screen for the best experience.
                </p>
                <button 
                  onClick={handleNativeInstall}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Install Automatically
                </button>
              </div>
            ) : (
              <div className="py-2">
                <h3 className="font-black text-slate-900 dark:text-white mb-6 text-center uppercase tracking-widest text-sm">
                  Manual Installation
                </h3>
                
                {isIOS ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="size-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center shrink-0 text-primary">
                        <Share className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-0.5 uppercase tracking-wider">Step 1</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tap <strong>Share</strong> in the bottom toolbar.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="size-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-0.5 uppercase tracking-wider">Step 2</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Scroll down the share sheet.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="size-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center shrink-0 text-slate-800 dark:text-slate-200">
                        <PlusSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-0.5 uppercase tracking-wider">Step 3</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tap <strong>Add to Home Screen</strong>.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="size-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center shrink-0 text-slate-800 dark:text-slate-200">
                        <MoreVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-0.5 uppercase tracking-wider">Step 1</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tap the <strong>Menu</strong> (three dots) top right.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="size-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center shrink-0 text-primary">
                        <MonitorSmartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-0.5 uppercase tracking-wider">Step 2</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                      </div>
                    </div>
                  </div>
                )}
                <button 
                  onClick={onClose} 
                  className="mt-6 w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
