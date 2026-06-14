import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  Share2, 
  Download,
  GraduationCap,
  BookOpen,
  Award,
  FileCheck,
  RefreshCcw
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface ExamPinsProps {
  onBack: () => void;
}

interface ExamProvider {
  id: string | number;
  name: string;
  price: number;
}

export default function ExamPins({ onBack }: ExamPinsProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form');
  const [examsList, setExamsList] = useState<ExamProvider[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ExamProvider | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchExamProviders();
  }, []);

  const fetchExamProviders = async () => {
    setIsLoadingExams(true);
    setError(null);
    try {
      const res = await api.getExamProviders();
      if (res.success && Array.isArray(res.data)) {
        setExamsList(res.data);
      } else {
        setError('Failed to load examination checking systems.');
      }
    } catch (err) {
      setError('Connection to educational node failed.');
    } finally {
      setIsLoadingExams(false);
    }
  };

  const getExamIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('waec')) return GraduationCap;
    if (lower.includes('neco')) return BookOpen;
    if (lower.includes('nabteb')) return Award;
    return FileCheck;
  };

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || Number(quantity) < 1) return;
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
        throw new Error('Please enter a valid 4-digit transaction PIN.');
      }
      const res = await api.buyExamPin(selectedExam.id, Number(quantity), finalPin);
      if (res.success) {
        setReceiptData(res.data || res);
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Purchase of exam PINs failed. Please check your balance and retry.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient">
      <div className="max-w-md mx-auto relative px-6 pb-12">
        <header className="py-8 flex items-center gap-4">
          <button onClick={step === 'form' ? onBack : () => setStep('form')} className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Education PINs</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-4 mb-8 flex items-center justify-between border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75]">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Balance</p>
                  <p className="text-sm font-black text-white">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Dynamic branding header */}
            {selectedExam && (() => {
              const lowerName = selectedExam.name.toLowerCase();
              let iconFile = 'others.png';
              if (lowerName.includes('waec')) iconFile = 'waec.png';
              else if (lowerName.includes('neco')) iconFile = 'neco.png';
              else if (lowerName.includes('nabteb')) iconFile = 'nabteb.png';
              return (
                <div className="glass-panel p-4 mb-6 flex items-center justify-between border-white/5 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-1.5 border border-white/10">
                      <img
                        src={`/icons/${iconFile}`}
                        alt={selectedExam.name}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/others.png';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Selected Exam</p>
                      <p className="text-sm font-black text-white">{selectedExam.name}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-[#66df75]/10 text-[#66df75] border border-[#66df75]/10">
                    Active
                  </span>
                </div>
              );
            })()}

            {error && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake">
                {error}
              </div>
            )}

            {isLoadingExams ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCcw size={24} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Loading dynamic pin nodes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-8">
                {examsList.map((exam) => {
                  const lowerName = exam.name.toLowerCase();
                  let iconFile = 'others.png';
                  if (lowerName.includes('waec')) iconFile = 'waec.png';
                  else if (lowerName.includes('neco')) iconFile = 'neco.png';
                  else if (lowerName.includes('nabteb')) iconFile = 'nabteb.png';
                  const isSelected = selectedExam?.id === exam.id;

                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => { setSelectedExam(exam); setError(null); }}
                      className={`p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-[#66df75]/10 border-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.1)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-1.5 border border-white/5">
                          <img
                            src={`/icons/${iconFile}`}
                            alt={exam.name}
                            className="w-full h-full object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/icons/others.png';
                            }}
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white mb-0.5">{exam.name}</p>
                          <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">₦{Number(exam.price).toLocaleString()}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={20} className="text-[#66df75]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedExam && (
              <form onSubmit={handleProcessForm} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg font-bold text-white mt-2 font-mono"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-5 uppercase tracking-widest font-black text-sm">
                  Buy {selectedExam.name}
                </button>
              </form>
            )}
          </div>
        )}

        {step === 'pin' && selectedExam && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                You are buying <span className="text-white font-bold">{quantity}x {selectedExam.name}</span> for <span className="text-[#66df75] font-black">₦{(Number(selectedExam.price) * Number(quantity)).toLocaleString()}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handleConfirmPurchase} disabled={isProcessing} />
            <button onClick={handleConfirmPurchase} disabled={isProcessing || transactionPin.join('').length !== 4} className="w-full btn-primary py-5 mt-12">
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin mx-auto"></div> : "Authorize Payment"}
            </button>
          </div>
        )}

        {step === 'success' && selectedExam && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>
              
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Purchase Successful</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-6">Tokens Generated</p>

              <div className="space-y-4 text-left my-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col gap-2 py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Checker PIN(s)</span>
                  <span className="text-sm font-mono font-bold text-[#66df75] tracking-wider break-all select-all">
                    {receiptData?.pin || (receiptData?.pins ? receiptData.pins.join(', ') : 'WAEC-9281-3847-1928')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Exam Type</span>
                  <span className="text-sm font-bold text-white">{selectedExam.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Total Amount</span>
                  <span className="text-sm font-bold text-white">₦{(Number(selectedExam.price) * Number(quantity)).toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setStep('form');
                  setSelectedExam(null);
                  setQuantity('1');
                  setTransactionPin(['', '', '', '']);
                  onBack();
                }} 
                className="w-full btn-primary py-4"
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
