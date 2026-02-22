import React, { useState } from 'react';
import { 
  Wallet, 
  GraduationCap, 
  CheckCircle2, 
  Lock, 
  Copy, 
  Share2, 
  ChevronRight,
  ChevronLeft,
  FileText,
  Users,
  Info,
  Check,
  Clock
} from 'lucide-react';
import PinInput from './PinInput';

interface JambPinsProps {
  onBack: () => void;
}

type ServiceType = 'utme-no-mock' | 'utme-mock' | 'de' | 'trial';

export default function JambPins({ onBack }: JambPinsProps) {
  const [step, setStep] = useState<'select' | 'pin' | 'form' | 'success'>('select');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [numCandidates, setNumCandidates] = useState(1);
  const [profileCode, setProfileCode] = useState('');
  
  // Payment states
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingDetails, setIsAwaitingDetails] = useState(false);
  const [generatedPins, setGeneratedPins] = useState<{ serial: string, pin: string }[]>([]);

  const services = {
    'utme-no-mock': { 
      name: 'JAMB UTME Without Mock', 
      price: 7100, 
      icon: GraduationCap,
      desc: 'Standard UTME registration without the optional mock exam.'
    },
    'utme-mock': { 
      name: 'JAMB UTME With Mock', 
      price: 7700, 
      icon: GraduationCap,
      desc: 'Standard UTME registration including the optional mock exam.'
    },
    'de': { 
      name: 'JAMB Direct Entry', 
      price: 7100, 
      icon: FileText,
      desc: 'For candidates with A-level, ND, HND, or NCE qualifications.'
    },
    'trial': { 
      name: 'JAMB Trial Test', 
      price: 1000, 
      icon: CheckCircle2,
      desc: 'Practice test to prepare candidates for the actual examination.'
    }
  };

  const handleServiceSelect = (type: ServiceType) => {
    setSelectedService(type);
    setStep('pin');
  };

  const handlePinSubmit = () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);
    
    // Simulate Payment and Creation of ServiceRequest with 'Awaiting Details' status
    setTimeout(() => {
      setIsProcessing(false);
      setIsAwaitingDetails(true);
      setStep('form');
    }, 1500);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileCode || profileCode.length < 10) return;
    
    setIsProcessing(true);
    // Simulate status change to 'Pending' and generation of pins
    setTimeout(() => {
      setIsProcessing(false);
      const mockPins = Array.from({ length: numCandidates }).map((_, i) => ({
        serial: `JAMB${Math.floor(10000000 + Math.random() * 90000000)}`,
        pin: Math.floor(100000000000 + Math.random() * 900000000000).toString()
      }));
      setGeneratedPins(mockPins);
      setStep('success');
    }, 2000);
  };

  const handleCopyAll = () => {
    const textToCopy = generatedPins.map((p, i) => `JAMB Pin ${i+1}: ${p.pin} | S/N: ${p.serial}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
  };

  const currentService = selectedService ? services[selectedService] : null;
  const totalAmount = currentService ? currentService.price * numCandidates : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-slate-900 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('select'); setSelectedService(null); setNumCandidates(1); setIsAwaitingDetails(false); }
              else if (step === 'form') { setStep('select'); setSelectedService(null); setIsAwaitingDetails(false); }
              else if (step === 'pin') { setStep('select'); setSelectedService(null); }
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">JAMB PIN Vending</h1>
        </header>

        {/* STEP 1: SELECT SERVICE */}
        {step === 'select' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-6 text-slate-500">
              <GraduationCap size={20} />
              <h2 className="text-sm font-bold uppercase tracking-wider">Select JAMB Service</h2>
            </div>
            
            <div className="space-y-3">
              {(Object.entries(services) as [ServiceType, any][]).map(([type, service]) => (
                <button
                  key={type}
                  onClick={() => handleServiceSelect(type)}
                  className="w-full bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <service.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{service.name}</h3>
                    <p className="text-[10px] font-black text-emerald-600 mt-0.5">₦{service.price.toLocaleString()}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
              <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Ensure you have your 10-digit JAMB Profile Code ready before proceeding.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: PIN VERIFICATION (BUY) */}
        {step === 'pin' && currentService && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Purchase</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              You are paying <strong className="text-gray-800">₦{totalAmount.toLocaleString()}</strong> for <strong className="text-emerald-600">{numCandidates}x {currentService.name}</strong>.
            </p>

            <PinInput 
              pin={transactionPin} 
              setPin={setTransactionPin} 
              onComplete={handlePinSubmit}
              disabled={isProcessing}
            />

            <button 
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Pay & Continue'
              )}
            </button>
          </div>
        )}

        {/* STEP 3: FORM INTERFACE (Awaiting Details) */}
        {step === 'form' && currentService && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Status Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Status: Awaiting Details</p>
                <p className="text-[11px] text-orange-700">Payment successful. Please provide the required info below.</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">{currentService.name}</h2>
            
            <div className="space-y-6">
              <form onSubmit={handleDetailsSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
                {/* Number of Candidates */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Number Of Candidate</label>
                  <div className="relative">
                    <select 
                      value={numCandidates}
                      onChange={(e) => setNumCandidates(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronRight size={18} className="text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Profile Code (Added for functionality) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">JAMB Profile Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter 10-digit profile code"
                    maxLength={10}
                    value={profileCode}
                    onChange={(e) => setProfileCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all tracking-widest"
                  />
                </div>

                {/* Amount Display */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">₦</span>
                    </div>
                    <input 
                      type="text" 
                      value={totalAmount.toLocaleString()}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing || !profileCode || profileCode.length < 10}
                  className="w-full bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-medium py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Submitting...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Submit Details</>
                  )}
                </button>
              </form>

              {/* How It Works Section (Matches Screenshot) */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">How It Works</h3>
                
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3">JAMB e-PIN ({currentService.name}) Overview</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    JAMB e-PIN is a unique number that candidates must obtain to register for their Unified Tertiary Matriculation Examination (UTME).
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    It stands for Electronic Personal Identification Number and is a prepaid voucher for the JAMB registration. Acquiring an e-PIN has been streamlined to ensure ease and accessibility for all candidates.
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3">How To Register for 2026/2027 JAMB UTME Examination</h4>
                  <ul className="space-y-2">
                    {[
                      'Candidate should send his/her National Identification Number (NIN) by text (SMS) to 55019 or 66019.',
                      'A Profile Code of 10 characters will be received on the same telephone number.',
                      'Present the Profile Code at the point of procurement of form (Banks, Mobile Money Operators, etc).',
                      'The e-PIN will then be sent as a text message to the candidate.'
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                        <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PIN VERIFICATION */}
        {step === 'pin' && currentService && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              You are paying <strong className="text-gray-800">₦{totalAmount.toLocaleString()}</strong> for <strong className="text-emerald-600">{numCandidates}x {currentService.name}</strong>.
            </p>

            <div className="flex gap-4 mb-10">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  type="password"
                  maxLength={1}
                  value={transactionPin[index]}
                  onChange={(e) => {
                    const newPin = [...transactionPin];
                    newPin[index] = e.target.value.replace(/\D/g, '');
                    setTransactionPin(newPin);
                  }}
                  className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                />
              ))}
            </div>

            <button 
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Confirm & Pay'
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && currentService && (
          <div className="p-0 flex flex-col h-full animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-600 text-white pt-8 pb-6 px-6 text-center rounded-b-3xl shadow-md">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Request Submitted!</h2>
              <p className="text-emerald-100 text-sm">
                {numCandidates}x {currentService.name} (Pending)
              </p>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <div className="space-y-4 mb-6">
                {generatedPins.map((item, index) => (
                  <div key={index} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 relative">
                    <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                      #{index + 1}
                    </div>
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">JAMB E-PIN</p>
                      <p className="text-xl font-black text-emerald-700 tracking-widest">{item.pin}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Serial Number</p>
                      <p className="text-sm font-bold text-gray-800">{item.serial}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={handleCopyAll}
                  className="bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <Copy size={18} /> Copy All
                </button>
                <button className="bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                  <Share2 size={18} /> Share
                </button>
              </div>

              <button 
                onClick={() => { setStep('select'); setSelectedService(null); setNumCandidates(1); setGeneratedPins([]); setTransactionPin(['','','','']); setProfileCode(''); }}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all"
              >
                Buy More PINs
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
