import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface ExamPinsProps {
  onBack: () => void;
}

export default function ExamPins({ onBack }: ExamPinsProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  const exams = [
    { id: 'waec', name: 'WAEC Result Checker', price: 3500, icon: GraduationCap },
    { id: 'neco', name: 'NECO Token', price: 1200, icon: BookOpen },
    { id: 'nabteb', name: 'NABTEB Pin', price: 1000, icon: Award },
    { id: 'nbais', name: 'NBAIS Result Pin', price: 1500, icon: FileCheck }
  ];

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setStep('pin');
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Use unified API for exam pins
      const res = await api.buyExamPin(selectedExam.id, Number(quantity), transactionPin.join(''));
      if (res.success) {
        setReceiptData(res.data);
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient">
      <div className="max-w-md mx-auto relative px-6 pb-12">
        <header className="py-8 flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center">
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
                  <p className="text-sm font-black text-white">₦{(user?.balance || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className={`p-5 rounded-2xl border transition-all flex items-center justify-between group ${selectedExam?.id === exam.id ? 'bg-[#66df75]/10 border-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedExam?.id === exam.id ? 'bg-[#66df75] text-[#111415]' : 'bg-white/5 text-[#e1e3e4]/40'}`}>
                      <exam.icon size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white mb-0.5">{exam.name}</p>
                      <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">₦{exam.price.toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedExam?.id === exam.id && <CheckCircle2 size={20} className="text-[#66df75]" />}
                </button>
              ))}
            </div>

            {selectedExam && (
              <form onSubmit={handleProcessForm} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg font-bold text-white mt-2"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-5 uppercase tracking-widest font-black text-sm">
                  Buy {selectedExam.name}
                </button>
              </form>
            )}
          </div>
        )}

        {step === 'pin' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                You are buying <span className="text-white font-bold">{quantity}x {selectedExam.name}</span> for <span className="text-[#66df75] font-black">₦{(selectedExam.price * Number(quantity)).toLocaleString()}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handleConfirmPurchase} disabled={isProcessing} />
            <button onClick={handleConfirmPurchase} disabled={isProcessing || transactionPin.join('').length !== 4} className="w-full btn-primary py-5 mt-12">
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin mx-auto"></div> : "Authorize Payment"}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center relative">
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Purchase Successful</h2>
              <div className="space-y-4 text-left my-8 bg-white/5 p-6 rounded-2xl">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">PIN(s)</span>
                  <span className="text-sm font-mono font-bold text-[#66df75]">{receiptData?.pin || (receiptData?.pins ? receiptData.pins.join(', ') : '9823-1123-0092')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Exam</span>
                  <span className="text-sm font-bold text-white">{selectedExam.name}</span>
                </div>
              </div>
              <button onClick={onBack} className="w-full btn-primary py-4">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
