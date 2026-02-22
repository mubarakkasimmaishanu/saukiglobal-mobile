import React, { useState } from 'react';
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface PersonalInfoProps {
  onBack: () => void;
  user: any;
}

export default function PersonalInfo({ onBack, user }: PersonalInfoProps) {
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: "No 12, Kaduna Road, Zaria",
    dob: "1995-05-15"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="px-5 pt-8 pb-4 sticky top-0 z-20 flex items-center gap-4 bg-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-green-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Personal Information</h1>
      </header>

      <div className="px-5 pb-10">
        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl flex gap-3 items-center border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
              }`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Your official name as it appears on your ID.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  readOnly
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Phone number cannot be changed manually.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Residential Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2"
          >
            {isSaving ? (
              <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving Changes...</>
            ) : (
              'Save Profile Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
