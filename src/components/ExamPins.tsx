import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Share2, 
  Copy, 
  ArrowRight,
  Minus, 
  Plus, 
  RefreshCcw, 
  BookOpen, 
  Check,
  Zap,
  ExternalLink,
  Wallet,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface ExamPinsProps {
  onBack: () => void;
  onFund?: () => void;
}

interface ExamProvider {
  id: string | number;
  name: string;
  code: string;
  price: number;
  resellerPrice?: number;
  description?: string;
  status: boolean;
  icon: string;
  minQuantity: number;
  maxQuantity: number;
  portalUrl?: string;
}

interface GeneratedPinItem {
  pin: string;
  serial?: string;
}

export default function ExamPins({ onBack, onFund }: ExamPinsProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState<'form' | 'pin' | 'success'>('form');
  const [examsList, setExamsList] = useState<ExamProvider[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ExamProvider | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [copiedPinIndex, setCopiedPinIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    fetchExamProviders();
  }, []);

  // Normalize and load dynamic exam providers from admin API (WAEC, NECO, NBAIS, NABTEB)
  const fetchExamProviders = async () => {
    setIsLoadingExams(true);
    setError(null);
    try {
      const res = await api.getExamProviders();
      let rawList: any[] = [];
      if (res.success && Array.isArray(res.data)) {
        rawList = res.data;
      } else if (Array.isArray(res)) {
        rawList = res;
      }

      // Explicit target list of the 4 exams in order: WAEC, NECO, NBAIS, NABTEB
      const target4Exams = [
        { 
          code: 'WAEC', 
          name: 'WAEC Result Checker', 
          icon: '/icons/waec.png', 
          defaultPrice: 3500,
          portalUrl: 'https://www.waecdirect.org',
          description: 'Official WAEC scratch card PIN for May/June & GCE examination results.'
        },
        { 
          code: 'NECO', 
          name: 'NECO Token', 
          icon: '/icons/neco.png', 
          defaultPrice: 1200,
          portalUrl: 'https://result.neco.gov.ng',
          description: 'Official NECO result checker token for SSCE, BECE & NCEE candidates.'
        },
        { 
          code: 'NBAIS', 
          name: 'NBAIS Token', 
          icon: '/icons/nbaislogo.png', 
          defaultPrice: 1500,
          portalUrl: 'https://nbais.gov.ng',
          description: 'National Board for Arabic and Islamic Studies (SAISSCE) result PIN.'
        },
        { 
          code: 'NABTEB', 
          name: 'NABTEB Scratch Card', 
          icon: '/icons/nabteb.png', 
          defaultPrice: 1000,
          portalUrl: 'https://eworld.nabteb.gov.ng',
          description: 'NABTEB NBC, NTC and ANBC/ANTC candidate result checker PIN.'
        }
      ];

      // Build mapping from admin API response
      const matchedExams: ExamProvider[] = target4Exams.map((target, idx) => {
        const adminItem = rawList.find((item: any) => {
          const rawName = String(item.name || item.exam_name || item.title || item.code || '').toLowerCase();
          return rawName.includes(target.code.toLowerCase()) || rawName.includes(target.name.toLowerCase());
        });

        if (adminItem) {
          const unitPrice = Number(adminItem.price || adminItem.amount || adminItem.retail_price || adminItem.user_price || adminItem.cost || 0);
          const resellerP = adminItem.reseller_price || adminItem.resellerPrice ? Number(adminItem.reseller_price || adminItem.resellerPrice) : undefined;
          const isActive = adminItem.status !== undefined 
            ? (adminItem.status === '1' || adminItem.status === 1 || adminItem.status === true || adminItem.status === 'active' || adminItem.status === 'on') 
            : true;

          return {
            id: adminItem.id || adminItem.provider_id || adminItem.provider || adminItem.exam_id || idx + 1,
            name: adminItem.name || adminItem.exam_name || target.name,
            code: target.code,
            price: unitPrice > 0 ? unitPrice : target.defaultPrice,
            resellerPrice: resellerP,
            description: adminItem.description || adminItem.desc || adminItem.details || adminItem.instructions || target.description,
            status: isActive,
            icon: adminItem.icon || adminItem.image || adminItem.logo || target.icon,
            minQuantity: Number(adminItem.min_quantity || adminItem.minQuantity || 1),
            maxQuantity: Number(adminItem.max_quantity || adminItem.maxQuantity || 50),
            portalUrl: target.portalUrl
          };
        }

        // Fallback default if admin hasn't returned this provider yet
        return {
          id: idx + 1,
          name: target.name,
          code: target.code,
          price: target.defaultPrice,
          status: true,
          icon: target.icon,
          minQuantity: 1,
          maxQuantity: 50,
          description: target.description,
          portalUrl: target.portalUrl
        };
      });

      setExamsList(matchedExams);
      if (matchedExams.length > 0) {
        setSelectedExam(matchedExams[0]);
      }
    } catch (err) {
      setError('Could not connect to exam services. Please retry.');
    } finally {
      setIsLoadingExams(false);
    }
  };

  const getEffectivePrice = (exam: ExamProvider) => {
    if (user?.isReseller && exam.resellerPrice && exam.resellerPrice > 0) {
      return exam.resellerPrice;
    }
    return exam.price;
  };

  const currentUnitPrice = selectedExam ? getEffectivePrice(selectedExam) : 0;
  const totalAmount = currentUnitPrice * quantity;
  const hasSufficientBalance = (user?.balance || 0) >= totalAmount;

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || quantity < 1) return;
    if (!hasSufficientBalance) {
      setError('Insufficient wallet balance. Please fund your wallet to proceed.');
      return;
    }
    setError(null);
    setStep('pin');
  };

  const handleConfirmPurchase = async (pinParam?: string | React.MouseEvent) => {
    if (!selectedExam) return;
    setIsProcessing(true);
    setError(null);
    try {
      const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
      if (!finalPin || finalPin.length !== 4) {
        throw new Error('Please enter your 4-digit transaction PIN.');
      }
      const res = await api.buyExamPin(selectedExam.id, quantity, finalPin);
      if (res.success) {
        setReceiptData(res.data || res);
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message || 'Transaction failed. Please check your PIN and balance.');
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Purchase of exam PIN failed. Please retry.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract generated PINs dynamically from admin API response
  const extractGeneratedPins = (): GeneratedPinItem[] => {
    if (!receiptData) return [];

    const rawPins = receiptData.pins || receiptData.data?.pins || receiptData.pin_list || receiptData.data?.tokens || receiptData.tokens;
    if (Array.isArray(rawPins)) {
      return rawPins.map((item: any, i: number) => {
        if (typeof item === 'string') {
          return { pin: item, serial: receiptData.serials?.[i] || receiptData.serial };
        }
        return {
          pin: item.pin || item.token || item.code || String(item),
          serial: item.serial || item.serial_number || item.sn
        };
      });
    }

    const singlePin = receiptData.pin || receiptData.data?.pin || receiptData.token || receiptData.data?.token || receiptData.card_pin;
    if (singlePin) {
      const splitPins = String(singlePin).split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      return splitPins.map(p => ({
        pin: p,
        serial: receiptData.serial || receiptData.data?.serial
      }));
    }

    if (receiptData.reference || receiptData.trans_id) {
      return [{
        pin: receiptData.reference || receiptData.trans_id,
        serial: receiptData.serial
      }];
    }

    return [];
  };

  const generatedPins = extractGeneratedPins();

  const handleCopySinglePin = (pinText: string, index: number) => {
    navigator.clipboard.writeText(pinText).then(() => {
      setCopiedPinIndex(index);
      setTimeout(() => setCopiedPinIndex(null), 2000);
    });
  };

  const handleCopyAllPins = () => {
    if (generatedPins.length === 0) return;
    const textToCopy = generatedPins
      .map((item, idx) => `PIN ${idx + 1}: ${item.pin}${item.serial ? ` | S/N: ${item.serial}` : ''}`)
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  };

  const handleShareReceipt = () => {
    if (!selectedExam) return;
    const pinsText = generatedPins.map((p, idx) => `PIN ${idx + 1}: ${p.pin}`).join(', ');
    const shareMessage = `SaukiGlobal Exam PINs Receipt:\nExam: ${selectedExam.name}\nQuantity: ${quantity}\nTotal: ₦${totalAmount.toLocaleString()}\n${pinsText}`;

    if (navigator.share) {
      navigator.share({
        title: `${selectedExam.name} Receipt`,
        text: shareMessage,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareMessage).then(() => {
        alert('Receipt copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient relative overflow-x-hidden selection:bg-[#66df75] selection:text-[#111415]">
      <div className="max-w-md mx-auto relative px-5 pb-16 pt-3">
        
        {/* HEADER: SaukiGlobal Brand Theme */}
        <header className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={step === 'form' ? onBack : () => setStep('form')} 
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all border border-white/10 shadow-sm"
            >
              <ChevronLeft size={22} />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#66df75]/10 border border-[#66df75]/30 flex items-center justify-center text-[#66df75] shadow-[0_0_15px_rgba(102,223,117,0.15)]">
                <BookOpen size={20} />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-black text-white tracking-tight">Exam Result</h1>
                <p className="text-sm font-black text-[#66df75] tracking-tight">Pins</p>
              </div>
            </div>
          </div>

          {/* Wallet pill capsule */}
          <button 
            type="button"
            onClick={onFund}
            className="bg-[#66df75]/10 border border-[#66df75]/30 hover:border-[#66df75] text-[#66df75] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-black tracking-wide active:scale-95 shadow-sm"
          >
            <span className="text-[9px] text-[#e1e3e4]/60 font-black tracking-wider">WALLET:</span>
            <span className="font-mono font-black">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </button>
        </header>

        {/* STEP 1: FORM VIEW */}
        {step === 'form' && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {error && (
              <div className="mb-5 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-2xl animate-in shake flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {error.includes('Insufficient') && (
                  <button
                    type="button"
                    onClick={onFund}
                    className="px-3 py-1 bg-[#66df75] text-[#111415] text-[10px] font-black rounded-lg uppercase tracking-wider flex-shrink-0"
                  >
                    Top Up
                  </button>
                )}
              </div>
            )}

            {isLoadingExams ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCcw size={28} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Loading Exam Providers...</p>
              </div>
            ) : (
              <form onSubmit={handleProcessForm} className="space-y-5">
                
                {/* 1. EXAMS BODY SECTION: 4 Horizontal Cards (WAEC, NECO, NBAIS, NABTEB) */}
                <div>
                  {/* Horizontal 4-Cards Grid with Solid White Logo Squircles so all Official Colors POP */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {examsList.map((exam) => {
                      const isSelected = selectedExam?.code === exam.code;

                      return (
                        <button
                          key={exam.code}
                          type="button"
                          onClick={() => {
                            setSelectedExam(exam);
                            setError(null);
                          }}
                          className={`relative flex flex-col items-center justify-between p-2.5 pt-3 pb-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-[#66df75]/10 border-2 border-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.3)] scale-[1.03]'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 active:scale-95'
                          }`}
                        >
                          {/* Checkmark circular badge on top right of selected card */}
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#66df75] text-[#111415] flex items-center justify-center ring-2 ring-[#111415] shadow-md shadow-[#66df75]/40 z-10 animate-in zoom-in-50 duration-200">
                              <Check size={12} strokeWidth={3.5} />
                            </div>
                          )}

                          {/* Solid White Logo Squircle: Ensures WAEC, NECO, NBAIS, NABTEB Colors are 100% vibrant, never washed out */}
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 mb-2 shadow-sm ring-1 ring-black/5 overflow-hidden">
                            <img
                              src={exam.icon}
                              alt={exam.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/others.png';
                              }}
                            />
                          </div>

                          {/* Exam Title */}
                          <span className={`text-[11px] font-black tracking-wider uppercase text-center truncate w-full ${
                            isSelected ? 'text-[#66df75]' : 'text-white'
                          }`}>
                            {exam.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SELECTED EXAM DETAIL CARD: Rich UX Overview */}
                {selectedExam && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm flex-shrink-0">
                          <img 
                            src={selectedExam.icon} 
                            alt={selectedExam.name} 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white leading-snug">{selectedExam.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#66df75]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#66df75] animate-pulse"></span>
                              Instant Delivery
                            </span>
                            {user?.isReseller && selectedExam.resellerPrice && (
                              <span className="text-[9px] font-black uppercase text-[#66df75] bg-[#66df75]/10 px-1.5 py-0.5 rounded">
                                Wholesale Rate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#e1e3e4]/50 uppercase">Rate</p>
                        <p className="text-base font-black text-white">₦{currentUnitPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedExam.description && (
                      <p className="text-xs text-[#e1e3e4]/60 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                        {selectedExam.description}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. QUANTITY SECTION & QUICK PRESETS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-black text-[#e1e3e4]/60 uppercase tracking-widest">
                      QUANTITY
                    </span>
                    <span className="text-[11px] font-bold text-[#e1e3e4]/60">
                      Subtotal: <strong className="text-white font-mono font-black">₦{totalAmount.toLocaleString()}</strong>
                    </span>
                  </div>

                  {/* Quantity Stepper container in SaukiGlobal style */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-inner">
                    {/* Minus button */}
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center justify-center transition-all border border-white/5"
                    >
                      <Minus size={20} />
                    </button>

                    {/* Quantity counter text */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white font-mono">{quantity}</span>
                      <span className="text-sm font-bold text-[#e1e3e4]/60">{quantity === 1 ? 'Pin' : 'Pins'}</span>
                    </div>

                    {/* Plus button in Brand Green */}
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(selectedExam?.maxQuantity || 50, q + 1))}
                      disabled={quantity >= (selectedExam?.maxQuantity || 50)}
                      className="w-12 h-12 rounded-xl bg-[#66df75] hover:bg-[#58c766] active:scale-95 text-[#111415] font-black text-xl flex items-center justify-center transition-all shadow-md shadow-[#66df75]/30"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Quick Quantity Chips (Enhanced UX for fast selection) */}
                  <div className="flex gap-2 pt-1">
                    {[1, 2, 5, 10, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantity(num)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          quantity === num
                            ? 'bg-[#66df75] text-[#111415] shadow-sm font-black'
                            : 'bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {num} {num === 1 ? 'Pin' : 'Pins'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. FINANCIAL SUMMARY */}
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#e1e3e4]/60">
                    <span>Available Balance</span>
                    <span className="font-bold text-white">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#e1e3e4]/60">
                    <span>Total Cost ({quantity}x)</span>
                    <span className="font-bold text-white">₦{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="font-bold text-slate-300">Balance After Payment</span>
                    <span className={`font-mono font-bold ${hasSufficientBalance ? 'text-[#66df75]' : 'text-[#ef4444]'}`}>
                      ₦{((user?.balance || 0) - totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* 5. PRIMARY ACTION BUTTON */}
                <button
                  type="submit"
                  disabled={!selectedExam}
                  className="w-full py-4.5 rounded-2xl bg-[#66df75] hover:bg-[#58c766] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-[#111415] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(102,223,117,0.35)] transition-all cursor-pointer"
                >
                  <span>{!hasSufficientBalance ? 'INSUFFICIENT BALANCE' : `PAY ₦${totalAmount.toLocaleString()}`}</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>

                {!hasSufficientBalance && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={onFund}
                      className="text-xs font-bold text-[#66df75] hover:underline"
                    >
                      Click here to top up your wallet
                    </button>
                  </div>
                )}

              </form>
            )}
          </div>
        )}

        {/* STEP 2: PIN CONFIRMATION */}
        {step === 'pin' && selectedExam && (
          <div className="animate-in slide-in-from-bottom-6 duration-300 pt-4">
            <div className="glass-panel p-6 mb-6 shadow-xl border-white/10">
              <div className="w-16 h-16 bg-[#66df75]/10 border border-[#66df75]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#66df75]">
                <ShieldCheck size={36} />
              </div>
              <h2 className="text-xl font-black text-white text-center mb-1">Authorize Purchase</h2>
              <p className="text-xs text-[#e1e3e4]/50 text-center mb-6">
                Enter your 4-digit transaction PIN to generate exam tokens.
              </p>

              {/* Order breakdown */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-2.5 mb-6 text-xs">
                <div className="flex justify-between items-center text-[#e1e3e4]/60">
                  <span>Exam Provider</span>
                  <span className="font-bold text-white">{selectedExam.name}</span>
                </div>
                <div className="flex justify-between items-center text-[#e1e3e4]/60">
                  <span>Quantity</span>
                  <span className="font-bold text-white">{quantity} {quantity === 1 ? 'PIN' : 'PINs'}</span>
                </div>
                <div className="flex justify-between items-center text-[#e1e3e4]/60">
                  <span>Unit Rate</span>
                  <span className="font-bold text-white">₦{currentUnitPrice.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="font-bold text-slate-300">Total Payable</span>
                  <span className="text-base font-black text-[#66df75]">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl text-center">
                  {error}
                </div>
              )}

              <PinInput 
                pin={transactionPin} 
                setPin={setTransactionPin} 
                onComplete={handleConfirmPurchase} 
                disabled={isProcessing} 
              />

              <button 
                type="button"
                onClick={handleConfirmPurchase} 
                disabled={isProcessing || transactionPin.join('').length !== 4} 
                className="w-full py-4.5 rounded-2xl bg-[#66df75] hover:bg-[#58c766] active:scale-[0.98] disabled:opacity-40 text-[#111415] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-8 shadow-[0_4px_25px_rgba(102,223,117,0.35)] transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Confirm & Generate PIN'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setTransactionPin(['', '', '', '']);
                  setError(null);
                }}
                disabled={isProcessing}
                className="w-full py-3 mt-2 text-xs font-bold text-[#e1e3e4]/50 hover:text-white transition-colors text-center cursor-pointer"
              >
                Cancel & Modify Order
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & GENERATED PINS RECEIPT */}
        {step === 'success' && selectedExam && (
          <div className="animate-in zoom-in-95 duration-300 pt-4">
            <div className="glass-panel p-6 relative overflow-hidden shadow-2xl border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>

              <div className="w-16 h-16 bg-[#66df75]/10 border border-[#66df75]/30 text-[#66df75] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(102,223,117,0.25)]">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-xl font-black text-white text-center">Purchase Successful!</h2>
              <p className="text-[11px] text-[#66df75] font-black uppercase tracking-widest text-center mt-0.5 mb-6">
                Tokens Generated
              </p>

              {/* Dynamic PIN list from admin / backend */}
              <div className="space-y-3 mb-6 max-h-[35vh] overflow-y-auto pr-1">
                {generatedPins.length > 0 ? (
                  generatedPins.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-black/40 border border-white/10 rounded-2xl p-4 relative flex items-center justify-between group hover:border-[#66df75]/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#e1e3e4]/50 uppercase tracking-wider">
                            PIN #{index + 1}
                          </span>
                          {item.serial && (
                            <span className="text-[10px] font-mono text-[#e1e3e4]/50">
                              (S/N: {item.serial})
                            </span>
                          )}
                        </div>
                        <p className="text-base font-mono font-black text-[#66df75] tracking-wider select-all">
                          {item.pin}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopySinglePin(item.pin, index)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[#e1e3e4] hover:text-white transition-all border border-white/5"
                        title="Copy PIN"
                      >
                        {copiedPinIndex === index ? (
                          <Check size={16} className="text-[#66df75]" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-xs text-[#e1e3e4] font-bold">
                      {receiptData?.message || 'Exam token generated successfully.'}
                    </p>
                    {receiptData?.reference && (
                      <p className="text-[10px] font-mono text-[#e1e3e4]/50 mt-1">
                        Ref: {receiptData.reference}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Transaction Summary info */}
              <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center text-[#e1e3e4]/60">
                  <span>Exam Body</span>
                  <span className="font-bold text-white">{selectedExam.name}</span>
                </div>
                <div className="flex justify-between items-center text-[#e1e3e4]/60">
                  <span>Total Amount Paid</span>
                  <span className="font-bold text-white">₦{totalAmount.toLocaleString()}</span>
                </div>
                {receiptData?.reference && (
                  <div className="flex justify-between items-center text-[#e1e3e4]/60">
                    <span>Reference</span>
                    <span className="font-mono text-slate-300">{receiptData.reference}</span>
                  </div>
                )}
              </div>

              {/* Portal link if applicable */}
              {selectedExam.portalUrl && (
                <a
                  href={selectedExam.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-[#e1e3e4]/70 hover:text-white transition-colors"
                >
                  <span>Check Result on Official Portal</span>
                  <ExternalLink size={14} className="text-[#66df75]" />
                </a>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={handleCopyAllPins}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Copy size={16} />
                  <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setQuantity(1);
                  setTransactionPin(['', '', '', '']);
                  setReceiptData(null);
                  onBack();
                }}
                className="w-full py-4 rounded-2xl bg-[#66df75] hover:bg-[#58c766] text-[#111415] font-black text-xs uppercase tracking-widest shadow-md shadow-[#66df75]/20 transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
