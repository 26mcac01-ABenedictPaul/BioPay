import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  X, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  Store,
  User,
  Zap
} from 'lucide-react';
import { Contact } from '../types';
import { playBiometricScanChirp, playTouchTick } from '../utils/audio';

interface BiometricScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPayee: (contact: Contact, amountPreset?: number) => void;
  userBioId: string;
}

export const BiometricScannerModal: React.FC<BiometricScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectPayee,
  userBioId
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'my-bio'>('scan');
  const [scanMode, setScanMode] = useState<'sensor' | 'camera'>('sensor');
  const [isPressing, setIsPressing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready to scan. Place thumb or finger.');
  const [detectedPayee, setDetectedPayee] = useState<Contact | null>(null);
  const [copiedBioId, setCopiedBioId] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);

  // Preset merchant & contact fingerprint signatures available in the environment to scan
  const nearbyBioTerminals: { contact: Contact; presetAmount?: number; terminalType: string }[] = [
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
    },
    {
      contact: {
        id: 'term-metro',
        name: 'Metro Transit Smart Gate',
        phone: '+1 (800) 555-0144',
        bioId: 'citymetro.transit@biopay',
        avatar: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=150&auto=format&fit=crop&q=80',
        isMerchant: true,
        category: 'Transit',
        verified: true,
      },
      presetAmount: 45,
      terminalType: 'Tap & Ride Turnstile',
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
      terminalType: 'Peer Biometric Handshake',
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
      terminalType: 'Grocery Biometric Pad',
    },
  ];

  const [selectedTerminal, setSelectedTerminal] = useState(nearbyBioTerminals[0]);

  // Handle Camera stream when camera mode is active
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && scanMode === 'camera' && activeTab === 'scan') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
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
  }, [isOpen, scanMode, activeTab]);

  // Handle touch press progress
  useEffect(() => {
    if (isPressing) {
      if (soundEnabled) playTouchTick();
      setScanStatus('Analyzing papillary ridges & minutiae points...');
      
      pressTimerRef.current = window.setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 12;
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
        setScanStatus('Place and hold thumb or finger on the sensor');
      }
    }

    return () => {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    };
  }, [isPressing, selectedTerminal, soundEnabled]);

  const handleScanSuccess = (contact: Contact, amount?: number) => {
    if (soundEnabled) playBiometricScanChirp();
    setDetectedPayee(contact);
    setScanStatus(`Biometric verified! Connected to ${contact.name}`);
    setTimeout(() => {
      onSelectPayee(contact, amount);
      onClose();
      // Reset state for next scan
      setIsPressing(false);
      setScanProgress(0);
      setDetectedPayee(null);
    }, 800);
  };

  const copyBioIdToClipboard = () => {
    navigator.clipboard?.writeText(userBioId);
    setCopiedBioId(true);
    setTimeout(() => setCopiedBioId(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[92vh] max-h-[780px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl text-white">
        
        {/* Top Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Fingerprint className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                BioPay Scanner
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                  FIDO2 Biometrics
                </span>
              </h2>
              <p className="text-xs text-slate-400">Scan finger/thumb instead of QR code</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Scan Finger vs My Bio-ID */}
        <div className="px-4 pt-2 pb-1 bg-slate-900 z-10">
          <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('scan')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'scan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              Scan Finger / Thumb
            </button>
            <button
              onClick={() => setActiveTab('my-bio')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'my-bio'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              My Bio-ID Code
            </button>
          </div>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'scan' ? (
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3">
            {/* Mode Selector: Touch Sensor vs Optical Camera */}
            <div className="flex items-center justify-between text-xs mb-3 px-1">
              <span className="text-slate-400">Scanner Mode:</span>
              <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                <button
                  onClick={() => setScanMode('sensor')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    scanMode === 'sensor' ? 'bg-blue-500 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Touch Sensor
                </button>
                <button
                  onClick={() => setScanMode('camera')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    scanMode === 'camera' ? 'bg-blue-500 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  Optical Camera
                </button>
              </div>
            </div>

            {/* Biometric Viewfinder Area */}
            <div className="relative w-full aspect-square max-h-[300px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner group">
              
              {/* Camera background if active */}
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
                      <Camera className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
                      <p className="text-xs text-slate-300 font-medium">Position finger in front of lens</p>
                      <p className="text-[11px] text-slate-500 mt-1">Optical ridge detection active in preview</p>
                    </div>
                  )}
                </div>
              )}

              {/* HUD Corner Reticles (Google Pay style modernized for Biometrics) */}
              <div className="absolute inset-4 pointer-events-none z-10">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
              </div>

              {/* Laser Scanning Line */}
              <div className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bio-scan pointer-events-none z-10" />

              {/* Center Fingerprint Hologram / Interactive Touch Zone */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Expanding pulse waves during press */}
                {isPressing && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full border-2 border-cyan-400 animate-bio-wave" />
                    <div className="absolute w-44 h-44 rounded-full border border-blue-500 animate-bio-wave" style={{ animationDelay: '0.4s' }} />
                  </>
                )}

                {/* Interactive Touch Target */}
                <button
                  onMouseDown={() => setIsPressing(true)}
                  onMouseUp={() => setIsPressing(false)}
                  onTouchStart={() => setIsPressing(true)}
                  onTouchEnd={() => setIsPressing(false)}
                  className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    isPressing
                      ? 'scale-95 bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-900/90 hover:bg-slate-800/90 border-2 border-blue-500/40 hover:border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  <Fingerprint className={`w-14 h-14 transition-colors ${
                    isPressing ? 'text-cyan-300 animate-pulse' : 'text-blue-400'
                  }`} />

                  {/* Fingerprint Ridge dots simulation */}
                  <span className="text-[9px] font-mono tracking-widest uppercase mt-1 text-slate-300">
                    {isPressing ? `${scanProgress}% MATCH` : 'PRESS & HOLD'}
                  </span>
                </button>
              </div>

              {/* Biometric Security Badge in bottom center */}
              <div className="absolute bottom-2 z-10 flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-700/60 text-[10px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-spoofing live liveness check</span>
              </div>
            </div>

            {/* Scan Feedback Status */}
            <div className="mt-3 text-center">
              <p className={`text-xs font-medium transition-colors ${
                detectedPayee ? 'text-emerald-400' : isPressing ? 'text-cyan-300' : 'text-slate-300'
              }`}>
                {scanStatus}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Terminal / Payee Quick Switcher: Simulate what your thumb or finger touches */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Select Nearby Bio-Terminal to Scan:
                </span>
                <span className="text-[10px] text-blue-400">Instant Tap</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {nearbyBioTerminals.map((item) => {
                  const isSelected = selectedTerminal.contact.id === item.contact.id;
                  return (
                    <button
                      key={item.contact.id}
                      onClick={() => {
                        setSelectedTerminal(item);
                        // Instant quick trigger option
                        handleScanSuccess(item.contact, item.presetAmount);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.contact.avatar}
                          alt={item.contact.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-600"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate">{item.contact.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.terminalType}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-bold">${item.presetAmount}</span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                          Tap to scan
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction helper */}
            <div className="mt-3 p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 flex items-start gap-2 text-slate-400 text-[11px]">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                In BioPay, instead of pointing at a QR code, you simply touch or hold your thumb to any BioPay NFC/biometric sensor or camera reticle to pay instantly.
              </span>
            </div>
          </div>
        ) : (
          /* My Bio-ID Code Tab (Replaces "Show My QR Code" in GPay) */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 text-center overflow-y-auto">
            <div className="w-full max-w-xs bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col items-center">
              
              {/* Enrolled Fingerprint Visual Hologram */}
              <div className="relative w-36 h-36 rounded-2xl bg-slate-950 border-2 border-blue-500/40 flex items-center justify-center p-3 shadow-inner group">
                <div className="absolute inset-2 border border-dashed border-blue-400/40 rounded-xl animate-spin duration-1000" style={{ animationDuration: '24s' }} />
                
                {/* Stylized Hologram Fingerprint */}
                <Fingerprint className="w-24 h-24 text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
                
                {/* Security watermarks */}
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400">
                  BIO-SHA256
                </div>
              </div>

              {/* Bio Handle & User details */}
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Your Biometric Payment ID
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Alex Morgan</h3>
                <div className="mt-1 flex items-center justify-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-xs font-mono text-slate-200">{userBioId}</span>
                  <button
                    onClick={copyBioIdToClipboard}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Copy Bio-ID"
                  >
                    {copiedBioId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Linked Bank info */}
              <div className="mt-4 w-full bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🏦</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">HDFC Bank ••4829</p>
                    <p className="text-[10px] text-slate-400">Primary Biometric Debit Route</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-4 flex items-center gap-2">
                <button
                  onClick={copyBioIdToClipboard}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedBioId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBioId ? 'Copied!' : 'Copy Bio-ID'}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My BioPay ID',
                        text: `Pay me via BioPay using Biometric scan or Bio-ID: ${userBioId}`,
                      }).catch(() => {});
                    } else {
                      copyBioIdToClipboard();
                    }
                  }}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 max-w-xs">
              Merchants or friends can scan your registered thumb/finger or enter your Bio-ID to request payments.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
