import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Camera, 
  ShieldCheck, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Store, 
  User, 
  Zap, 
  Check, 
  Copy, 
  CheckCircle2,
  RefreshCw,
  Sliders,
  Laptop
} from 'lucide-react';
import { Contact } from '../types';
import { playBiometricScanChirp, playTouchTick } from '../utils/audio';

interface DesktopBiometricTerminalProps {
  onSelectPayee: (contact: Contact, amountPreset?: number) => void;
  userBioId: string;
}

export const DesktopBiometricTerminal: React.FC<DesktopBiometricTerminalProps> = ({
  onSelectPayee,
  userBioId,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'my-bio'>('terminal');
  const [scanMode, setScanMode] = useState<'touch' | 'camera'>('touch');
  const [isPressing, setIsPressing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready for biometric input. Click & hold thumb pad.');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [copiedBioId, setCopiedBioId] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);

  // Preset merchant & contact fingerprint signatures available in the environment to scan
  const nearbyBioTerminals = [
    {
      contact: {
        id: 'term-cafe',
        name: 'Blue Tokai Coffee POS',
        phone: '+1 (800) 555-0199',
        bioId: 'bluetokai.store@biopay',
        avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
        isMerchant: true,
        category: 'Coffee & Drinks',
        verified: true,
      },
      presetAmount: 320,
      terminalType: 'Merchant Biometric POS #04',
      badge: 'Popular',
    },
    {
      contact: {
        id: 'term-mart',
        name: 'Green Grocers Counter',
        phone: '+1 (800) 555-0122',
        bioId: 'greengrocers@biopay',
        avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
        isMerchant: true,
        category: 'Groceries',
        verified: true,
      },
      presetAmount: 840,
      terminalType: 'Biometric Checkout Terminal',
      badge: '5% Cashback',
    },
    {
      contact: {
        id: 'term-metro',
        name: 'City Metro Smart Gate',
        phone: '+1 (800) 555-0144',
        bioId: 'citymetro.transit@biopay',
        avatar: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=150&auto=format&fit=crop&q=80',
        isMerchant: true,
        category: 'Transit',
        verified: true,
      },
      presetAmount: 45,
      terminalType: 'Rapid Turnstile Sensor',
      badge: 'Instant Pass',
    },
    {
      contact: {
        id: 'term-friend',
        name: 'Priya Sharma (Peer)',
        phone: '+1 (555) 234-8901',
        bioId: 'priya.sharma@biopay',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
      },
      presetAmount: 500,
      terminalType: 'Peer-to-Peer Bio Handshake',
      badge: 'Split Bill',
    },
  ];

  const [selectedTerminal, setSelectedTerminal] = useState(nearbyBioTerminals[0]);

  // Camera stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (scanMode === 'camera' && activeTab === 'terminal') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraActive(true);
        })
        .catch(() => {
          setCameraActive(false);
        });
    } else {
      setCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanMode, activeTab]);

  // Handle touch press progress
  useEffect(() => {
    if (isPressing) {
      if (soundEnabled) playTouchTick();
      setScanStatus(`Analyzing ridge structure on ${selectedTerminal.contact.name}...`);
      
      pressTimerRef.current = window.setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 15;
          if (next >= 100) {
            clearInterval(pressTimerRef.current!);
            handleScanSuccess(selectedTerminal.contact, selectedTerminal.presetAmount);
            return 100;
          }
          return next;
        });
      }, 90);
    } else {
      if (pressTimerRef.current) {
        clearInterval(pressTimerRef.current);
      }
      if (scanProgress < 100) {
        setScanProgress(0);
        setScanStatus('Hold thumb or finger on sensor pad to scan');
      }
    }

    return () => {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    };
  }, [isPressing, selectedTerminal, soundEnabled]);

  const handleScanSuccess = (contact: Contact, amount?: number) => {
    if (soundEnabled) playBiometricScanChirp();
    setScanStatus(`Biometric verified! Connected to ${contact.name}`);
    setTimeout(() => {
      onSelectPayee(contact, amount);
      setIsPressing(false);
      setScanProgress(0);
    }, 700);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px] tracking-wide uppercase border border-blue-500/30">
              Desktop Biometric Terminal
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Replaces QR Scanning
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 tracking-tight">
            Scan for Thumb or Fingers to Pay Anywhere
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            No smartphone camera or QR code required. Use USB sensor, webcam optical scan, or hold touch pad to authenticate instantly.
          </p>
        </div>

        {/* Tab & Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'terminal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Scan Terminal
            </button>
            <button
              onClick={() => setActiveTab('my-bio')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'my-bio' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              My Bio-ID Code
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700/80 rounded-xl transition-colors"
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        /* Terminal View: 2 Columns (Interactive Scanner Pad + Merchant Stations) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          {/* Column 1: The Biometric Sensor Pad / Camera Scanner Viewfinder (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            {/* Mode switch */}
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400 font-medium">Input Device:</span>
              <div className="flex space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => setScanMode('touch')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    scanMode === 'touch' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  Touch / Sensor Pad
                </button>
                <button
                  onClick={() => setScanMode('camera')}
                  className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    scanMode === 'camera' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  Webcam Optical
                </button>
              </div>
            </div>

            {/* Viewfinder frame */}
            <div className="relative w-full aspect-video max-h-[260px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner group">
              
              {/* Webcam view if active */}
              {scanMode === 'camera' && (
                <div className="absolute inset-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-60"
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/80">
                      <Camera className="w-8 h-8 text-slate-500 mb-2 animate-bounce" />
                      <p className="text-xs text-slate-300 font-medium">Position finger or hand in front of webcam</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">High-res optical biometric scanner active</p>
                    </div>
                  )}
                </div>
              )}

              {/* Laser Scanning Line */}
              <div className="absolute left-4 right-4 h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bio-scan pointer-events-none z-10" />

              {/* HUD Reticle Corners */}
              <div className="absolute inset-3 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-md" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-md" />
              </div>

              {/* Center Fingerprint Pad */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {isPressing && (
                  <>
                    <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-400 animate-bio-wave" />
                    <div className="absolute w-40 h-40 rounded-full border border-blue-400 animate-bio-wave" style={{ animationDelay: '0.3s' }} />
                  </>
                )}

                <button
                  onMouseDown={() => setIsPressing(true)}
                  onMouseUp={() => setIsPressing(false)}
                  onTouchStart={() => setIsPressing(true)}
                  onTouchEnd={() => setIsPressing(false)}
                  className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer ${
                    isPressing
                      ? 'scale-95 bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-2 border-blue-500/50 hover:border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  <Fingerprint className={`w-12 h-12 transition-colors ${
                    isPressing ? 'text-cyan-300 animate-pulse' : 'text-blue-400'
                  }`} />
                  <span className="text-[8px] font-mono tracking-widest text-slate-300 mt-1 uppercase">
                    {isPressing ? `${scanProgress}% SCAN` : 'CLICK & HOLD'}
                  </span>
                </button>
              </div>

              {/* Bottom security pill */}
              <div className="absolute bottom-2 z-10 flex items-center gap-1.5 px-3 py-0.5 bg-slate-900/90 rounded-full border border-slate-700/60 text-[10px] text-slate-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Anti-spoofing live liveness check</span>
              </div>
            </div>

            {/* Progress Status */}
            <div className="w-full mt-3 text-center">
              <p className={`text-xs font-medium transition-colors ${
                isPressing ? 'text-cyan-300' : 'text-slate-300'
              }`}>
                {scanStatus}
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

          </div>

          {/* Column 2: Available Bio-Terminals & Fast-Scan Stations (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Select Nearby Terminal to Authenticate & Pay:
                </h4>
                <span className="text-[11px] text-blue-400 font-semibold">1-Click Scan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyBioTerminals.map((item) => {
                  const isSelected = selectedTerminal.contact.id === item.contact.id;
                  return (
                    <div
                      key={item.contact.id}
                      onClick={() => {
                        setSelectedTerminal(item);
                        handleScanSuccess(item.contact, item.presetAmount);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-blue-950/50 border-blue-500 shadow-lg ring-1 ring-blue-500/50'
                          : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.contact.avatar}
                            alt={item.contact.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {item.contact.name}
                            </h5>
                            <p className="text-[11px] text-slate-400">{item.terminalType}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {item.badge}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Due Amount</span>
                          <span className="text-sm font-black text-emerald-400">${item.presetAmount.toFixed(2)}</span>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors">
                          <Fingerprint className="w-3.5 h-3.5" />
                          Scan Thumb
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Helper Note */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  On Desktop BioPay, your browser connects to WebAuthn / FIDO2 biometric keys or optical sensor.
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                Encrypted
              </span>
            </div>

          </div>

        </div>
      ) : (
        /* My Bio-ID Code Tab (Replaces Show My QR Code) */
        <div className="py-6 flex flex-col md:flex-row items-center justify-center gap-8">
          
          <div className="relative w-44 h-44 rounded-3xl bg-slate-950 border-2 border-blue-500/50 flex items-center justify-center p-4 shadow-2xl group">
            <div className="absolute inset-2 border border-dashed border-blue-400/30 rounded-2xl animate-spin duration-1000" style={{ animationDuration: '30s' }} />
            <Fingerprint className="w-28 h-28 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-cyan-400">
              FIDO2-TOKEN
            </div>
          </div>

          <div className="max-w-md space-y-3 text-center md:text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Your Personal Bio-ID Handle
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">Alex Morgan</h3>
              <p className="text-xs text-slate-400">Share your Bio-ID or have peers scan your registered thumb/fingerprint</p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <span className="text-xs font-mono text-slate-200 flex-1">{userBioId}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(userBioId);
                  setCopiedBioId(true);
                  setTimeout(() => setCopiedBioId(false), 2000);
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copiedBioId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBioId ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Linked to HDFC Bank ••4829 for direct zero-fee settlement.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
