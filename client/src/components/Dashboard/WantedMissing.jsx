import React, { useState } from 'react';
import { UserCheck, Search, Filter, AlertCircle, MapPin, Calendar, User, ChevronRight } from 'lucide-react';

const wantedData = [
  { id: 1, name: 'Rajesh Kumar', alias: 'Raja', crime: 'Armed Robbery', district: 'Bengaluru Urban', lastSeen: '2026-06-28', status: 'wanted', risk: 'high', age: 34, gender: 'Male', charges: ['Armed Robbery Sec 397 IPC', 'Criminal Conspiracy Sec 120B'], photo: null },
  { id: 2, name: 'Sneha Patil', alias: '—', crime: 'Fraud', district: 'Mysuru', lastSeen: '2026-06-15', status: 'missing', risk: 'medium', age: 22, gender: 'Female', charges: ['Missing Person Report'], photo: null },
  { id: 3, name: 'Vikram Singh', alias: 'Vicky', crime: 'Homicide', district: 'Belagavi', lastSeen: '2026-06-20', status: 'wanted', risk: 'high', age: 41, gender: 'Male', charges: ['Murder Sec 302 IPC', 'Evidence Tampering Sec 201 IPC'], photo: null },
  { id: 4, name: 'Ananya Reddy', alias: '—', crime: 'Kidnapping', district: 'Dakshina Kannada', lastSeen: '2026-06-25', status: 'missing', risk: 'high', age: 16, gender: 'Female', charges: ['Kidnapping Sec 363 IPC'], photo: null },
  { id: 5, name: 'Mohammed Irfan', alias: 'Irfu', crime: 'Cyber Crime', district: 'Kalaburagi', lastSeen: '2026-06-10', status: 'wanted', risk: 'medium', age: 28, gender: 'Male', charges: ['Identity Theft Sec 66C IT Act', 'Cyber Fraud Sec 420 IPC'], photo: null },
  { id: 6, name: 'Priya Sharma', alias: '—', crime: 'Human Trafficking', district: 'Bengaluru Urban', lastSeen: '2026-05-30', status: 'missing', risk: 'high', age: 19, gender: 'Female', charges: ['Human Trafficking Sec 370 IPC'], photo: null },
  { id: 7, name: 'Arun Pandey', alias: 'Pandit', crime: 'Dacoity', district: 'Mysuru', lastSeen: '2026-06-22', status: 'wanted', risk: 'high', age: 38, gender: 'Male', charges: ['Dacoity Sec 395 IPC', 'Armed Robbery Sec 397 IPC'], photo: null },
  { id: 8, name: 'Kavita Joshi', alias: '—', crime: 'Domestic Violence', district: 'Belagavi', lastSeen: '2026-06-18', status: 'missing', risk: 'medium', age: 30, gender: 'Female', charges: ['Missing Person Report'], photo: null },
];

const statusColors = {
  wanted: { text: 'text-[#cc3333]', bg: 'bg-[#8b0000]/10', border: 'border-[#8b0000]/30', label: 'Wanted' },
  missing: { text: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', border: 'border-[var(--color-primary)]/20', label: 'Missing' },
};

export default function WantedMissing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const filteredData = wantedData.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.alias.toLowerCase().includes(searchQuery.toLowerCase()) && !p.district.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/6 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 space-y-4 sm:space-y-6">
      <div className="bg-[var(--color-surface-card-dark)] border border-[var(--color-primary)]/15 rounded-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
              <UserCheck className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-on-dark)]">Wanted / Missing Persons</h2>
              <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
                Statewide Tracking & Investigation
              </p>
            </div>
          </div>
          <span className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
            {wantedData.length} Records
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dark p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Total Cases</span>
            <AlertCircle className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-black text-[var(--color-on-dark)] mt-2">{wantedData.length}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Active records</span>
        </div>
        <div className="card-dark p-4 rounded-sm border border-[#8b0000]/20 bg-[var(--color-surface-card-dark)]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Wanted</span>
            <UserCheck className="h-4 w-4 text-[#cc3333]" />
          </div>
          <p className="text-2xl font-black text-[#cc3333] mt-2">{wantedData.filter(p => p.status === 'wanted').length}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Absconding offenders</span>
        </div>
        <div className="card-dark p-4 rounded-sm border border-[var(--color-primary)]/20 bg-[var(--color-surface-card-dark)]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Missing</span>
            <User className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-black text-[var(--color-primary)] mt-2">{wantedData.filter(p => p.status === 'missing').length}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Unlocated persons</span>
        </div>
        <div className="card-dark p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Districts</span>
            <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-black text-[var(--color-on-dark)] mt-2">{new Set(wantedData.map(p => p.district)).size}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Affected districts</span>
        </div>
      </div>

      <div className="card-dark p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] flex items-center">
            <Filter className="h-4 w-4 text-[var(--color-primary)] mr-2" />
            Person Records
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[var(--color-muted)]">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                placeholder="Search name, alias, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[9px] rounded-sm py-1.5 pl-6 pr-2 focus:outline-none focus:border-[var(--color-primary)] placeholder-slate-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[9px] rounded-sm py-1.5 px-2 focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="all">All Status</option>
              <option value="wanted">Wanted</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto min-h-[300px] pr-1">
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-[var(--color-muted)] text-[10px]">No records match current filters.</div>
          ) : (
            filteredData.map(person => {
              const theme = statusColors[person.status];
              const isSelected = selectedPerson?.id === person.id;
              return (
                <div
                  key={person.id}
                  className={`p-3 rounded-sm border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-surface-card-dark)] border-[var(--color-primary)]/40'
                      : 'bg-[var(--color-canvas-dark)] border-[var(--color-hairline-dark)] hover:border-[var(--color-primary)]/20'
                  }`}
                  onClick={() => setSelectedPerson(isSelected ? null : person)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')} shrink-0`} />
                      <span className="text-xs font-bold text-[var(--color-on-dark)] truncate">{person.name}</span>
                      {person.alias !== '—' && (
                        <span className="text-[8px] text-[var(--color-muted)] italic">aka {person.alias}</span>
                      )}
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} shrink-0`}>
                        {theme.label}
                      </span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 text-[var(--color-muted)] transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-primary)]/10 space-y-2 text-[10px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[var(--color-muted)] block">Age / Gender</span>
                          <span className="text-[var(--color-on-dark)] font-medium">{person.age} yrs / {person.gender}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-muted)] block">Last Seen</span>
                          <span className="text-[var(--color-on-dark)] font-medium flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-[var(--color-primary)]" />
                            {person.lastSeen}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--color-muted)] block">Primary Crime</span>
                          <span className="text-[var(--color-on-dark)] font-medium">{person.crime}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-muted)] block">District</span>
                          <span className="text-[var(--color-on-dark)] font-medium flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-[var(--color-primary)]" />
                            {person.district}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted)] block">Charges / Sections</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {person.charges.map((charge, i) => (
                            <span key={i} className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-1.5 py-0.5 rounded font-medium">
                              {charge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
