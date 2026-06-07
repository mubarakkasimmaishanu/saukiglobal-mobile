import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Mail, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  FileQuestion,
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface HelpSupportProps {
  onBack: () => void;
}

export default function HelpSupport({ onBack }: HelpSupportProps) {
  const [activeTab, setActiveTab] = useState<'contact' | 'dispute' | 'faq'>('contact');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Contact Form State
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Dispute Form State
  const [disputeRef, setDisputeRef] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeFeedback, setDisputeFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Transaction History for Dispute Helper
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch transactions on mount for easy auto-filling
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txs = await api.getTransactions(10);
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to load transactions for dispute', err);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, []);

  // FAQs
  const faqs = [
    { id: 1, q: "I funded my wallet but it's not reflecting. What should I do?", a: "Auto-funding usually takes 1-3 minutes. If it delays beyond 10 minutes, it's a network issue from your bank. Your money is safe and will reflect automatically once the bank releases it." },
    { id: 2, q: "My data purchase was successful but I haven't received it.", a: "Sometimes network providers (MTN, Airtel) experience slight delays in delivering data. Please wait 5-10 minutes. If you still haven't received it, log a dispute and we will refund you." },
    { id: 3, q: "Can I retrieve a WAEC E-Pin I already bought?", a: "Yes! Go to your Transaction History, click on the specific WAEC payment, and your E-Pin will be displayed on the receipt." },
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageText.trim()) return;

    setIsSending(true);
    setContactFeedback(null);

    try {
      const res = await api.addRequest({
        service: 'Support: ' + subject,
        price: 0,
        details: messageText
      });

      if (res.success) {
        setContactFeedback({
          type: 'success',
          text: 'Thank you! Your message has been sent successfully. We will reply to your email shortly.'
        });
        setSubject('');
        setMessageText('');
      } else {
        setContactFeedback({
          type: 'error',
          text: res.message || 'Failed to submit contact message. Please try again.'
        });
      }
    } catch (err: any) {
      setContactFeedback({
        type: 'error',
        text: err.message || 'Connection error. Please check your network and try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeRef.trim() || !disputeCategory || !disputeDescription.trim()) return;

    setIsSubmittingDispute(true);
    setDisputeFeedback(null);

    try {
      const res = await api.addRequest({
        service: 'Dispute: ' + disputeRef,
        price: 0,
        details: `Category: ${disputeCategory}\nDescription: ${disputeDescription}`
      });

      if (res.success) {
        setDisputeFeedback({
          type: 'success',
          text: `Dispute logged successfully for Reference ID: ${disputeRef}. Our support team will review it and update you soon.`
        });
        setDisputeRef('');
        setDisputeCategory('');
        setDisputeDescription('');
      } else {
        setDisputeFeedback({
          type: 'error',
          text: res.message || 'Failed to submit dispute. Please try again.'
        });
      }
    } catch (err: any) {
      setDisputeFeedback({
        type: 'error',
        text: err.message || 'Connection error. Please check your network and try again.'
      });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient animate-in fade-in duration-300">
      <div className="max-w-md mx-auto relative px-6 pb-12 flex flex-col">
        
        {/* Header */}
        <header className="py-8 flex items-center gap-4 bg-transparent">
          <button 
            onClick={onBack}
            className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Help & Support</h1>
        </header>

        {/* Tab Controls */}
        <div className="mb-8">
          <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 ${
                activeTab === 'contact' ? 'bg-[#66df75] text-[#111415] shadow-lg shadow-[#66df75]/20' : 'text-[#e1e3e4]/60 hover:text-white'
              }`}
            >
              <LifeBuoy size={14} /> Contact
            </button>
            <button
              onClick={() => setActiveTab('dispute')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 ${
                activeTab === 'dispute' ? 'bg-[#66df75] text-[#111415] shadow-lg shadow-[#66df75]/20' : 'text-[#e1e3e4]/60 hover:text-white'
              }`}
            >
              <AlertTriangle size={14} /> Dispute
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 ${
                activeTab === 'faq' ? 'bg-[#66df75] text-[#111415] shadow-lg shadow-[#66df75]/20' : 'text-[#e1e3e4]/60 hover:text-white'
              }`}
            >
              <FileQuestion size={14} /> FAQs
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            {/* WhatsApp Card */}
            <a 
              href="https://wa.me/2349068500544" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="glass-panel p-5 flex items-center gap-4 hover:bg-white/5 transition-all group border-emerald-500/10"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">WhatsApp Support</h3>
                <p className="text-[10px] text-[#e1e3e4]/50 mt-0.5">Fastest response (3-5 mins) • +234 906 850 0544</p>
              </div>
              <ChevronRight size={18} className="text-[#e1e3e4]/30 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Email Card */}
            <a 
              href="mailto:info@saukiglobal.com" 
              className="glass-panel p-5 flex items-center gap-4 hover:bg-white/5 transition-all group border-purple-500/10"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Mail size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">Email Support</h3>
                <p className="text-[10px] text-[#e1e3e4]/50 mt-0.5">info@saukiglobal.com • We reply within 1 hour</p>
              </div>
              <ChevronRight size={18} className="text-[#e1e3e4]/30 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Contact Form */}
            <div className="glass-panel p-6 border-white/5 flex flex-col gap-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Send us a Message</h3>
              
              {contactFeedback && (
                <div className={`p-4 rounded-xl flex gap-3 items-center border ${
                  contactFeedback.type === 'success' ? 'bg-[#66df75]/10 border-[#66df75]/20 text-[#66df75]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
                } text-xs font-bold animate-in zoom-in-95`}>
                  {contactFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <p>{contactFeedback.text}</p>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2 px-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What do you need help with?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2 px-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message details here..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !subject.trim() || !messageText.trim()}
                  className="w-full btn-primary py-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={16} />
                      <span className="uppercase tracking-wider text-xs font-black">Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center pt-4">
              <p className="text-[10px] text-[#e1e3e4]/30 font-black uppercase tracking-widest">Head Office</p>
              <p className="text-xs font-bold text-[#e1e3e4]/60 mt-1">123 Ahmadu Bello Way, Kaduna, Nigeria.</p>
            </div>
          </div>
        )}

        {activeTab === 'dispute' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Notice */}
            <div className="glass-panel p-4 flex gap-3 border-rose-500/15 bg-rose-500/5">
              <AlertTriangle size={20} className="text-[#ef4444] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#e1e3e4]/60 leading-relaxed font-bold uppercase tracking-wider">
                Select a recent transaction from the list below or manually enter your transaction reference ID to log a dispute. We resolve disputes within 5-15 minutes.
              </p>
            </div>

            {/* Dispute Form */}
            <div className="glass-panel p-6 border-white/5 flex flex-col gap-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Log a Dispute</h3>

              {disputeFeedback && (
                <div className={`p-4 rounded-xl flex gap-3 items-center border ${
                  disputeFeedback.type === 'success' ? 'bg-[#66df75]/10 border-[#66df75]/20 text-[#66df75]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
                } text-xs font-bold animate-in zoom-in-95`}>
                  {disputeFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <p>{disputeFeedback.text}</p>
                </div>
              )}

              <form onSubmit={handleDisputeSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2 px-1">Transaction Reference</label>
                  <input
                    type="text"
                    required
                    value={disputeRef}
                    onChange={(e) => setDisputeRef(e.target.value)}
                    placeholder="E.g. TXN-123456"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2 px-1">Dispute Category</label>
                  <div className="relative">
                    <select
                      required
                      value={disputeCategory}
                      onChange={(e) => setDisputeCategory(e.target.value)}
                      className="w-full bg-[#111415] border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all cursor-pointer appearance-none"
                    >
                      <option value="" disabled className="bg-[#111415]">Select a category</option>
                      <option value="Wallet Funding Delay" className="bg-[#111415]">Delay in Wallet Funding</option>
                      <option value="Failed Data Purchase" className="bg-[#111415]">Failed Data Purchase</option>
                      <option value="Failed Airtime Purchase" className="bg-[#111415]">Failed Airtime Purchase</option>
                      <option value="Electricity Token Issue" className="bg-[#111415]">Electricity Token Issue</option>
                      <option value="Cable TV Bill Issue" className="bg-[#111415]">Cable TV Bill Issue</option>
                      <option value="Others" className="bg-[#111415]">Others</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#e1e3e4]/30">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2 px-1">Describe Issue</label>
                  <textarea
                    required
                    rows={4}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Describe what went wrong in detail..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDispute || !disputeRef.trim() || !disputeCategory || !disputeDescription.trim()}
                  className="w-full btn-primary py-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  {isSubmittingDispute ? (
                    <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={16} />
                      <span className="uppercase tracking-wider text-xs font-black">Submit Dispute</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Transactions Helper */}
            <div>
              <h4 className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1 mb-3">Recent Transactions (Tap to auto-fill)</h4>
              
              {isLoadingTransactions ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#66df75]"></div>
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-xs text-[#e1e3e4]/40 text-center py-4 bg-white/5 rounded-2xl border border-white/5">No recent transactions found.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {transactions.slice(0, 5).map((tx) => (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => setDisputeRef(tx.id)}
                      className="w-full glass-panel p-4 border-white/5 flex justify-between items-center hover:bg-white/5 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-white text-xs">{tx.type} — {tx.details}</p>
                        <p className="text-[9px] text-[#e1e3e4]/50 font-mono mt-0.5">{tx.id} • {tx.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-xs">₦{tx.amount}</span>
                        <ChevronRight size={14} className="text-[#e1e3e4]/30 group-hover:text-[#66df75] transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-4 px-1">
              <h2 className="text-base font-black text-white uppercase tracking-wider mb-1">Common Questions</h2>
              <p className="text-xs text-[#e1e3e4]/50 font-medium">Find quick answers to the most frequent issues.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="glass-panel border-white/5 overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-white/5 focus:outline-none"
                  >
                    <span className="font-bold text-sm text-white pr-4">{faq.q}</span>
                    <ChevronDown size={18} className={`text-[#e1e3e4]/40 transform transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180 text-[#66df75]' : ''}`} />
                  </button>
                  
                  {openFaq === faq.id && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 bg-white/[0.01]">
                      <p className="text-xs text-[#e1e3e4]/70 leading-relaxed font-medium">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 glass-panel border-emerald-500/10 p-6 text-center">
              <p className="text-sm font-bold text-white mb-2">Still need help?</p>
              <p className="text-xs text-[#e1e3e4]/50 mb-6 px-4 leading-relaxed">If you couldn't find your answer here, our support team is available 24/7 on WhatsApp or Email.</p>
              <button 
                onClick={() => setActiveTab('contact')}
                className="btn-primary text-xs uppercase font-black tracking-wider px-8 py-3.5"
              >
                Get in Touch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
