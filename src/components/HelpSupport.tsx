import React, { useState } from 'react';
import { 
  MessageCircle, 
  PhoneCall, 
  Mail, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  FileQuestion,
  LifeBuoy,
  Clock,
  Send,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

interface HelpSupportProps {
  onBack: () => void;
}

export default function HelpSupport({ onBack }: HelpSupportProps) {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq', 'dispute', 'contact'
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [disputeStep, setDisputeStep] = useState('select'); // 'select', 'form', 'success'
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [complaint, setComplaint] = useState('');

  // Mock FAQs
  const faqs = [
    { id: 1, q: "I funded my wallet but it's not reflecting. What should I do?", a: "Auto-funding usually takes 1-3 minutes. If it delays beyond 10 minutes, it's a network issue from your bank. Your money is safe and will reflect automatically once the bank releases it." },
    { id: 2, q: "My data purchase was successful but I haven't received it.", a: "Sometimes network providers (MTN, Airtel) experience slight delays in delivering data. Please wait 5-10 minutes. If you still haven't received it, log a dispute and we will refund you." },
    { id: 3, q: "How do I upgrade to a Reseller account?", a: "Go to Profile > Upgrade Package. You will pay a one-time upgrade fee, and your account will automatically be switched to enjoy the cheapest wholesale rates." },
    { id: 4, q: "Can I retrieve a JAMB E-Pin I already bought?", a: "Yes! Go to your Transaction History, click on the specific JAMB payment, and your E-Pin will be displayed on the receipt." },
  ];

  // Mock Recent Transactions for Dispute
  const recentTransactions = [
    { id: 'TXN-849201', title: 'MTN 2GB Data', amount: 510, date: 'Today, 10:42 AM', status: 'success' },
    { id: 'TXN-849199', title: 'Airtel Airtime', amount: 200, date: 'Yesterday, 02:15 PM', status: 'success' },
    { id: 'TXN-849150', title: 'Electricity (AEDC)', amount: 2000, date: 'Feb 18, 09:30 AM', status: 'success' },
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const submitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    
    // Simulate API call to submit ticket
    setDisputeStep('success');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-slate-900 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (activeTab === 'dispute' && disputeStep !== 'select') setDisputeStep('select');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">Help & Support</h1>
        </header>

        {/* Tabs */}
        <div className="px-5 pt-4 pb-2 bg-white sticky top-[68px] z-10 border-b border-gray-100">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5 ${
                activeTab === 'faq' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileQuestion size={16} /> FAQs
            </button>
            <button
              onClick={() => { setActiveTab('dispute'); setDisputeStep('select'); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5 ${
                activeTab === 'dispute' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle size={16} /> Dispute
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5 ${
                activeTab === 'contact' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LifeBuoy size={16} /> Contact
            </button>
          </div>
        </div>

        {/* TAB 1: FAQs */}
        {activeTab === 'faq' && (
          <div className="p-5 animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-xl font-black text-gray-900 mb-2">Common Questions</h2>
            <p className="text-sm text-gray-500 mb-6">Find quick answers to the most frequent issues.</p>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-sm">
                  <button 
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <span className="font-bold text-sm text-gray-800 pr-4">{faq.q}</span>
                    <ChevronDown size={20} className={`text-gray-400 transform transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>
                  
                  {openFaq === faq.id && (
                    <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
              <p className="text-sm font-bold text-blue-900 mb-2">Still need help?</p>
              <p className="text-xs text-blue-700 mb-4">If you couldn't find your answer here, our support team is available 24/7.</p>
              <button 
                onClick={() => setActiveTab('contact')}
                className="bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DISPUTE RESOLUTION */}
        {activeTab === 'dispute' && (
          <div className="p-5 animate-in fade-in duration-300">
            
            {disputeStep === 'select' && (
              <>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3 mb-6">
                  <AlertTriangle size={24} className="text-rose-600 flex-shrink-0" />
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    Select a recent transaction below to report an issue. We usually resolve disputes and process refunds within <strong className="font-bold">5 - 15 minutes</strong>.
                  </p>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-3">Select Transaction to Report</h3>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <button 
                      key={tx.id}
                      onClick={() => { setSelectedTx(tx); setDisputeStep('form'); }}
                      className="w-full bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center hover:border-rose-300 hover:bg-rose-50/30 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{tx.title}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{tx.id} • {tx.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-gray-900">₦{tx.amount}</span>
                        <ChevronRight size={18} className="text-gray-400 group-hover:text-rose-500" />
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => alert('Showing all transactions. For disputes on older transactions, please contact support via WhatsApp.')}
                  className="w-full mt-4 py-3 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  View Older Transactions
                </button>
              </>
            )}

            {disputeStep === 'form' && selectedTx && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Transaction Details</p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{selectedTx.title}</span>
                    <span className="font-black text-slate-900">₦{selectedTx.amount}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mb-2">Ref: {selectedTx.id}</p>
                  <p className="text-xs text-slate-500">{selectedTx.date}</p>
                </div>

                <form onSubmit={submitDispute} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">What went wrong?</label>
                    <textarea 
                      placeholder="E.g. I was debited but the data was not delivered to the phone number."
                      rows={4}
                      required
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={!complaint.trim()}
                    className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    <Send size={18} /> Submit Ticket
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDisputeStep('select')}
                    className="w-full text-sm font-bold text-gray-500 py-3"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {disputeStep === 'success' && (
              <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500 pt-8 pb-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
                  <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Submitted!</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-[280px]">
                  Your complaint regarding <strong className="text-gray-800">{selectedTx?.title}</strong> has been received.
                </p>

                <div className="w-full bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3 mb-8">
                  <Clock size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-800 text-left font-medium">
                    Our team is reviewing your transaction. If it failed at the network level, your wallet will be refunded automatically shortly.
                  </p>
                </div>

                <button 
                  onClick={() => { setDisputeStep('select'); setComplaint(''); setActiveTab('faq'); }}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all"
                >
                  Return to Support
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT US */}
        {activeTab === 'contact' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-black text-gray-900 mb-2">Get in Touch</h2>
            <p className="text-sm text-gray-500 mb-8">We are available on multiple channels to assist you.</p>

            <div className="space-y-4">
              
              {/* WhatsApp (Primary for VTU) */}
              <a href="https://wa.me/2349068500544" target="_blank" rel="noopener noreferrer" className="bg-white border border-[#25D366]/30 p-5 rounded-2xl flex items-center gap-4 hover:shadow-md hover:border-[#25D366] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#25D366] opacity-5 rounded-full -mr-4 -mt-4"></div>
                <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">WhatsApp Support</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Fastest response (3-5 mins)</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#25D366]" />
              </a>

              {/* Phone */}
              <a href="tel:09068500544" className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center gap-4 hover:shadow-md hover:border-blue-400 transition-all group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <PhoneCall size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Call Us</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Mon - Sat (8AM to 6PM)</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500" />
              </a>

              {/* Email */}
              <a href="mailto:support@buydigital.ng" className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center gap-4 hover:shadow-md hover:border-purple-400 transition-all group">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Email Support</h3>
                  <p className="text-xs text-gray-500 mt-0.5">support@buydigital.ng</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-purple-500" />
              </a>

            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 font-medium">Head Office</p>
              <p className="text-sm font-bold text-gray-700 mt-1">123 Ahmadu Bello Way, Kaduna, Nigeria.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
