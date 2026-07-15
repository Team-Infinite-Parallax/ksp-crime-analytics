import React, { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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
        return 'text-[var(--color-trading-up)]';
      case 'under investigation':
      case 'pending':
        return 'text-[var(--color-primary)]';
      case 'chargesheeted':
        return 'text-[var(--color-info)]';
      default:
        return 'text-[var(--color-muted)]';
    }
  };

  return (
    <div className="card-dark p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/6 via-transparent to-transparent backdrop-blur-sm pointer-events-none" />
      <div className="relative z-10">
      <div>
        <div className="flex items-center justify-between mb-6 pb-4">
          <div>
            <h3 className="text-[20px] font-semibold text-[var(--color-on-dark)]">Recent FIR Register</h3>
            <p className="text-[14px] text-[var(--color-muted)] font-medium mt-0.5">Live case log</p>
          </div>
          <span className="text-[12px] font-medium text-[var(--color-muted)]">
            Showing {paginatedItems.length} of {crimes.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse markets-table">
            <thead>
              <tr className="border-b border-[var(--color-hairline-dark)] text-[var(--color-muted)] text-[12px] font-medium whitespace-nowrap">
                <th className="py-3 px-4 font-medium">Case / FIR No</th>
                <th className="py-3 px-4 font-medium">Registration Date</th>
                <th className="py-3 px-4 font-medium">Crime Category</th>
                <th className="py-3 px-4 font-medium">Location (PS)</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-hairline-dark)]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--color-muted)] font-medium">
                    No matching FIR records found. Adjust filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((crime) => (
                  <tr key={crime.id} className="hover:bg-[var(--color-surface-elevated-dark)] transition-colors group markets-row">
                    <td className="py-4 px-4 font-medium text-[var(--color-on-dark)] font-plex whitespace-nowrap">
                      {crime.crimeNo}
                      {crime.isAnomaly && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[var(--color-trading-down)]/10 text-[var(--color-trading-down)] uppercase">
                          Flag
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[var(--color-muted)] font-plex whitespace-nowrap text-[14px]">
                      {crime.registrationDate}
                    </td>
                    <td className="py-4 px-4 text-[var(--color-on-dark)] font-medium text-[14px]">
                      {crime.crimeHeadName}
                      <span className="block text-[12px] text-[var(--color-muted)] mt-0.5">{crime.crimeSubHeadName}</span>
                    </td>
                    <td className="py-4 px-4 text-[var(--color-muted)] text-[14px]">
                      {crime.unitName}
                      <span className="block text-[12px] text-[var(--color-muted)] font-medium uppercase mt-0.5">{crime.districtName}</span>
                    </td>
                    <td className="py-4 px-4 text-[14px]">
                      <span className={`inline-flex items-center font-medium ${getStatusBadge(crime.caseStatusName)}`}>
                        {crime.caseStatusName}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                        <Eye className="h-5 w-5" />
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
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-[var(--color-hairline-dark)]">
          <span className="text-[12px] text-[var(--color-muted)] font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-sm text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-sm text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
