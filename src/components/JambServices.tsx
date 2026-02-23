import React, { useState } from 'react';
import { 
  Wallet, 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  Lock, 
  Clock, 
  AlertCircle,
  FileImage,
  MessageSquare,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';

interface JambServicesProps {
  onBack: () => void;
}

export default function JambServices({ onBack }: JambServicesProps) {
  const [step, setStep] = useState('select'); // 'select', 'pin', 'form', 'success'
  
  // States
  const [selectedService, setSelectedService] = useState<any>(null);
  const [profileCode, setProfileCode] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingDetails, setIsAwaitingDetails] = useState(false);

  // Available Manual Services
  const services = [
    { 
      id: 'original-result', 
      name: "JAMB Original Result", 
      price: 3500, 
      desc: "Print your official original JAMB result slip with passport.",
      requiresUpload: false
    },
    { 
      id: 'admission-letter', 
      name: "JAMB Admission Letter", 
      price: 3500, 
      desc: "Print your official JAMB admission letter for university clearance.",
      requiresUpload: false
    },
    { 
      id: 'reprinting', 
      name: "JAMB Reprinting", 
      price: 1500, 
      desc: "Reprint your JAMB examination slip to see your center and date.",
      requiresUpload: false
    },
    { 
      id: 'admission-status', 
      name: "JAMB Check Admission Status", 
      price: 1000, 
      desc: "Check your admission status on JAMB CAPS portal.",
      requiresUpload: false
    },
    { 
      id: 'profile-code-retrieval', 
      name: "JAMB Profile Code Retrieval", 
      price: 500, 
      desc: "Retrieve your 10-digit JAMB profile code if lost.",
      requiresUpload: false
    },
    { 
      id: 'olevel-screenshot', 
      name: "JAMB O Level Result Screenshot", 
      price: 1000, 
      desc: "Get a screenshot of your uploaded O'Level results on JAMB portal.",
      requiresUpload: false
    },
    { 
      id: 'reg-no-retrieval', 
      name: "JAMB Registration Number Retrieval", 
      price: 1500, 
      desc: "Retrieve your JAMB registration number using your details.",
      requiresUpload: false
    },
    { 
      id: 'change-course', 
      name: "Payment for Change of Course/Institution", 
      price: 3500, 
      desc: "Switch your university or course of choice on JAMB portal.",
      requiresUpload: false,
      extraFields: true
    },
    { 
      id: 'olevel-upload', 
      name: "JAMB O'Level Result Upload", 
      price: 1500, 
      desc: "Upload your WAEC/NECO result to your JAMB portal.",
      requiresUpload: true,
      uploadLabel: "Snap or upload your WAEC/NECO result"
    },
    { 
      id: 'regularization', 
      name: "JAMB Regularization", 
      price: 6500, 
      desc: "For ND/HND/NCE students securing late admissions.",
      requiresUpload: true,
      uploadLabel: "Upload your ND/NCE result and admission letter"
    }
  ];

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep('pin');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
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
    if (profileCode.length < 5) return;
    if (selectedService.requiresUpload && !uploadedFile) return;
    
    setIsProcessing(true);
    // Simulate status change to 'Pending'
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-purple-700 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('select'); setProfileCode(''); setUploadedFile(null); setIsAwaitingDetails(false); }
              else if (step === 'form') { setStep('select'); setSelectedService(null); setIsAwaitingDetails(false); }
              else if (step === 'pin') { setStep('select'); setSelectedService(null); }
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-purple-600 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">JAMB Services</h1>
        </header>

        {/* STEP 1: SELECT A SERVICE */}
        {step === 'select' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Choose a Service</h2>
            
            <div className="space-y-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="w-full bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
                >
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{service.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.desc}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-black text-purple-700 text-sm">₦{service.price.toLocaleString()}</span>
                    <ChevronRight size={18} className="text-gray-400 mt-1" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
              <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                These are <strong className="font-bold">Manual Admin Services</strong>. Requests are processed during standard working hours (8AM - 6PM).
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: PIN VERIFICATION (BUY) */}
        {step === 'pin' && selectedService && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Purchase</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              You are paying <strong className="text-gray-800">₦{selectedService.price.toLocaleString()}</strong> for <strong className="text-gray-800">{selectedService.name}</strong>.
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
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Pay & Continue'
              )}
            </button>
          </div>
        )}

        {/* STEP 3: FILL DETAILS (Awaiting Details) */}
        {step === 'form' && selectedService && (
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

            <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedService.name}</h2>
            <p className="text-sm text-gray-500 mb-6 tracking-tight">Order ID: <span className="font-mono text-purple-700">#JAMB-{Math.floor(Math.random() * 90000) + 10000}</span></p>

            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              
              {/* Mandatory Profile Code */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">JAMB Profile Code / Reg No</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter 10-digit code or Reg Number"
                    value={profileCode}
                    onChange={(e) => setProfileCode(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all tracking-wide"
                  />
                </div>
              </div>

              {/* Extra Info for Change of Course */}
              {selectedService.extraFields && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Choice of Institution/Course</label>
                  <textarea 
                    placeholder="E.g., 1st Choice: ABU Zaria (Computer Science)&#10;2nd Choice: KASU (Cyber Security)"
                    rows={3}
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>
              )}

              {/* Document Upload Area */}
              {selectedService.requiresUpload && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Document</label>
                  
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${uploadedFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-purple-50 hover:border-purple-300'}`}>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {uploadedFile ? (
                      <div className="flex flex-col items-center">
                        <FileImage size={32} className="text-emerald-500 mb-2" />
                        <p className="text-sm font-bold text-emerald-700 mb-1">File Attached</p>
                        <p className="text-xs text-emerald-600 truncate max-w-[200px]">{uploadedFile}</p>
                        <p className="text-[10px] text-gray-500 mt-2 underline">Tap to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm font-bold text-gray-700 mb-1">Tap to Upload</p>
                        <p className="text-xs text-gray-500">{selectedService.uploadLabel}</p>
                        <p className="text-[10px] text-gray-400 mt-2">Supports JPG, PNG, PDF (Max 2MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Optional Message Field (Kept from original architecture) */}
              {!selectedService.extraFields && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Additional Instructions (Optional)</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                      <MessageSquare size={18} className="text-gray-400" />
                    </div>
                    <textarea 
                      placeholder="Any specific instructions for the admin?"
                      rows={2}
                      value={additionalNote}
                      onChange={(e) => setAdditionalNote(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isProcessing || profileCode.length < 5 || (selectedService.requiresUpload && !uploadedFile)}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:text-purple-100 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Submitting...</>
                  ) : (
                    'Submit Details'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS / PENDING ADMIN */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center animate-in zoom-in-95 duration-500 pt-8">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-orange-400 opacity-20"></span>
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-[280px]">
              Your payment of <strong>₦{selectedService.price.toLocaleString()}</strong> was successful. Our admin is now reviewing your request.
            </p>

            <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Service Type</span>
                <span className="font-bold text-gray-900 text-right max-w-[60%] leading-tight">{selectedService.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Profile Code</span>
                <span className="font-bold text-gray-900 tracking-widest">{profileCode}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Task Status</span>
                <span className="font-bold text-orange-600 flex items-center gap-1">
                  <Clock size={14} /> In Queue
                </span>
              </div>
            </div>

            <div className="w-full bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 flex gap-3 items-start">
               <AlertCircle size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
               <p className="text-xs text-purple-800 font-medium leading-relaxed">
                 You will receive a notification and a proof of completion (e.g., printed slip) in your <strong>History tab</strong> once the admin completes this task.
               </p>
            </div>

            <button 
              onClick={() => { setStep('select'); setProfileCode(''); setUploadedFile(null); setAdditionalNote(''); setTransactionPin(['','','','']); onBack(); }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
