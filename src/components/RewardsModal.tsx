import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Gift, 
  Trophy, 
  Check, 
  Copy, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScratchCard } from '../types';
import { playRewardRevealSound } from '../utils/audio';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scratchCards: ScratchCard[];
  onScratchCardCompleted: (id: string, amount?: number) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  scratchCards,
  onScratchCardCompleted,
}) => {
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Set default selected card
  useEffect(() => {
    if (scratchCards.length > 0 && !selectedCard) {
      const unscratched = scratchCards.find(c => !c.isScratched);
      setSelectedCard(unscratched || scratchCards[0]);
    }
  }, [scratchCards, selectedCard]);

  // Set up canvas scratch effect
  useEffect(() => {
    if (!selectedCard || selectedCard.isScratched) {
      setRevealed(true);
      return;
    }

    setRevealed(false);
    setScratchPercent(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    canvas.width = 280;
    canvas.height = 280;

    // Draw opaque metallic gradient cover
    const grad = ctx.createLinearGradient(0, 0, 280, 280);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(0.5, '#6366f1');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 280, 280);

    // Decorative patterns on the scratch card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 280; i += 24) {
      ctx.beginPath();
      ctx.arc(i, i, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text on top
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIOPAY REWARD', 140, 130);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Scratch here with mouse/finger', 140, 160);

  }, [selectedCard]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratched percentage
    const currentPercent = scratchPercent + 5;
    setScratchPercent(currentPercent);

    if (currentPercent > 45 && !revealed && selectedCard) {
      setRevealed(true);
      playRewardRevealSound();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
      });
      onScratchCardCompleted(selectedCard.id, selectedCard.amount);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const totalCashback = scratchCards
    .filter(c => c.isScratched && c.rewardType === 'CASHBACK' && c.amount)
    .reduce((sum, c) => sum + (c.amount || 0), 125); // Baseline rewards

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">BioPay Rewards</h3>
              <p className="text-[11px] text-slate-400">Total earned: <span className="text-emerald-400 font-bold">${totalCashback}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
          
          {/* Active Card Viewer */}
          {selectedCard && (
            <div className="w-full flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                {selectedCard.title}
              </span>

              {/* Scratch Arena Container */}
              <div className="relative w-[280px] h-[280px] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-950 flex flex-col items-center justify-center p-4">
                
                {/* Background Reward Content (revealed underneath) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 select-none">
                  {selectedCard.rewardType === 'CASHBACK' && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2 animate-bounce">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                        Cashback Won
                      </span>
                      <h2 className="text-4xl font-black text-white mt-1">
                        ${selectedCard.amount}
                      </h2>
                      <p className="text-xs text-slate-300 mt-2">
                        {selectedCard.subtitle}
                      </p>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2 border border-emerald-500/20">
                        Credited to HDFC Bank ••4829
                      </span>
                    </>
                  )}

                  {selectedCard.rewardType === 'VOUCHER' && (
                    <>
                      <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-2">
                        <Gift className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                        {selectedCard.merchant}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {selectedCard.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <span className="font-mono text-sm font-bold text-amber-400">{selectedCard.code}</span>
                        <button
                          onClick={() => {
                            if (selectedCard.code) navigator.clipboard?.writeText(selectedCard.code);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">{selectedCard.subtitle}</p>
                    </>
                  )}

                  {selectedCard.rewardType === 'BETTER_LUCK' && (
                    <>
                      <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-300">Better Luck Next Time</h3>
                      <p className="text-xs text-slate-400 mt-1">{selectedCard.subtitle}</p>
                    </>
                  )}
                </div>

                {/* Canvas Overlay if card has not been scratched yet */}
                {!selectedCard.isScratched && !revealed && (
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute inset-0 z-10 cursor-pointer touch-none"
                  />
                )}
              </div>

              {/* Reveal trigger button if user wants to instantly reveal */}
              {!selectedCard.isScratched && !revealed && (
                <button
                  onClick={() => {
                    setRevealed(true);
                    playRewardRevealSound();
                    confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
                    onScratchCardCompleted(selectedCard.id, selectedCard.amount);
                  }}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
                >
                  Quick Reveal Card
                </button>
              )}
            </div>
          )}

          {/* All Scratch Cards Grid */}
          <div className="w-full mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Your Scratch Cards
            </h4>
            
            <div className="grid grid-cols-2 gap-2.5">
              {scratchCards.map((card) => {
                const isSelected = selectedCard?.id === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`relative p-3 rounded-2xl border text-left transition-all overflow-hidden ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    } ${
                      card.isScratched
                        ? 'bg-slate-800/60'
                        : 'bg-gradient-to-br from-indigo-900/60 to-purple-900/60'
                    }`}
                  >
                    {!card.isScratched && (
                      <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}

                    <div className="flex items-center space-x-2">
                      <Gift className={`w-4 h-4 ${card.isScratched ? 'text-slate-400' : 'text-amber-400'}`} />
                      <span className="text-[11px] font-bold text-white truncate">
                        {card.isScratched ? (card.amount ? `$${card.amount} Won` : 'Claimed') : 'Tap to scratch'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{card.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
