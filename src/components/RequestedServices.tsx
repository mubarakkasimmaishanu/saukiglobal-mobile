import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Filter,
  ExternalLink,
  FileText,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { ServiceRequest } from '../types';

interface RequestedServicesProps {
  onBack: () => void;
}

export default function RequestedServices({ onBack }: RequestedServicesProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.getRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={14} />;
      case 'Processing': return <Clock size={14} className="animate-pulse" />;
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'Error': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes('jamb')) return GraduationCap;
    return FileText;
  };

  const getServiceColor = (service: string) => {
    if (service.toLowerCase().includes('jamb')) return 'text-purple-600 bg-purple-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-slate-900 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">Requested Services</h1>
        </header>

        <div className="p-5">
          {/* Search & Filter */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-500 transition-all"
              />
            </div>
            <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
              <Filter size={20} />
            </button>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : (
              <>
                {requests.map((req) => {
                  const Icon = getServiceIcon(req.service);
                  return (
                    <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${getServiceColor(req.service)}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">{req.service}</h3>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{req.date}</p>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          req.status === 'Error' ? 'bg-red-100 text-red-700' :
                          req.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {getStatusIcon(req.status)}
                          {req.status}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                          {req.details}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-xs font-bold text-slate-900">₦{req.price.toLocaleString()}</span>
                        <button className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:text-slate-900 transition-colors">
                          View Receipt <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {requests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <FileText size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Requests Yet</h3>
                    <p className="text-sm text-gray-500 max-w-[200px]">Your manual service requests will appear here.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
