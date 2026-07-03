import React, { useState } from 'react';
import { Eye, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecentCrimesTable({ crimes }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(crimes.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = crimes.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'closed':
      case 'disposed':
        return 'bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/20';
      case 'under investigation':
      case 'pending':
        return 'bg-blue-900/50 text-blue-400 border-slate-700';
      case 'chargesheeted':
        return 'bg-[#2b5f9e]/10 text-[#2b5f9e] border-[#2b5f9e]/20';
      default:
        return 'bg-[#8a887e]/10 text-slate-400 border-[#8a887e]/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 bg-slate-800/50 p-6 flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-50">Recent FIR Register</h3>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.12em] mt-0.5">Live case log</p>
          </div>
          <span className="text-[9px] font-bold bg-slate-950 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-xl">
            Showing {paginatedItems.length} of {crimes.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-[0.12em]">
                <th className="py-3 px-4">Case / FIR No</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Crime Category</th>
                <th className="py-3 px-4">Location (PS)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4a853]/5 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No matching FIR records found. Adjust filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((crime) => (
                  <tr key={crime.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-slate-50">
                      {crime.crimeNo}
                      {crime.isAnomaly && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#8b0000]/10 text-[#cc3333] border border-[#8b0000]/20 uppercase tracking-widest animate-pulse">
                          Flag
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{crime.registrationDate}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-50 font-semibold">
                      {crime.crimeHeadName}
                      <span className="block text-[9px] text-slate-400 font-medium mt-0.5">{crime.crimeSubHeadName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{crime.unitName}</span>
                      </div>
                      <span className="block text-[9px] text-slate-400 font-semibold uppercase mt-0.5">{crime.districtName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-[9px] font-bold tracking-wide ${getStatusBadge(crime.caseStatusName)}`}>
                        {crime.caseStatusName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-slate-700 hover:bg-blue-900/40 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
          <span className="text-[9px] text-slate-400 font-bold uppercase">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-50 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900'
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-50 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900'
                }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
