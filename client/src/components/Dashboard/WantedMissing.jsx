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
  missing: { text: 'text-[#d4a853]', bg: 'bg-[#d4a853]/10', border: 'border-[#d4a853]/20', label: 'Missing' },
};

export default function WantedMissing({ activeRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const filteredData = wantedData.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.alias.toLowerCase().includes(searchQuery.toLowerCase()) && !p.district.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="bg-[#0a1628] border border-[#d4a853]/15 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/20">
              <UserCheck className="h-5 w-5 text-[#d4a853]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-50">Wanted / Missing Persons</h2>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.12em] mt-0.5">
                Statewide Tracking & Investigation
              </p>
            </div>
          </div>
          <span className="text-[8px] bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
            {wantedData.length} Records
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[#d4a853]/10 bg-[#0a1628]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Total Cases</span>
            <AlertCircle className="h-4 w-4 text-[#d4a853]" />
          </div>
          <p className="text-2xl font-black text-slate-50 mt-2">{wantedData.length}</p>
          <span className="text-[9px] text-slate-400">Active records</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-[#8b0000]/20 bg-[#0a1628]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Wanted</span>
            <UserCheck className="h-4 w-4 text-[#cc3333]" />
          </div>
          <p className="text-2xl font-black text-[#cc3333] mt-2">{wantedData.filter(p => p.status === 'wanted').length}</p>
          <span className="text-[9px] text-slate-400">Absconding offenders</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-[#d4a853]/20 bg-[#0a1628]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Missing</span>
            <User className="h-4 w-4 text-[#d4a853]" />
          </div>
          <p className="text-2xl font-black text-[#d4a853] mt-2">{wantedData.filter(p => p.status === 'missing').length}</p>
          <span className="text-[9px] text-slate-400">Unlocated persons</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-[#d4a853]/10 bg-[#0a1628]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Districts</span>
            <MapPin className="h-4 w-4 text-[#d4a853]" />
          </div>
          <p className="text-2xl font-black text-slate-50 mt-2">{new Set(wantedData.map(p => p.district)).size}</p>
          <span className="text-[9px] text-slate-400">Affected districts</span>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-[#d4a853]/10 bg-[#0a1628]/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-50 flex items-center">
            <Filter className="h-4 w-4 text-[#d4a853] mr-2" />
            Person Records
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                placeholder="Search name, alias, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 bg-[#060e1f] border border-[#1a2a4a] text-slate-50 text-[9px] rounded-lg py-1.5 pl-6 pr-2 focus:outline-none focus:border-[#d4a853] placeholder-slate-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#060e1f] border border-[#1a2a4a] text-slate-50 text-[9px] rounded-lg py-1.5 px-2 focus:outline-none focus:border-[#d4a853]"
            >
              <option value="all">All Status</option>
              <option value="wanted">Wanted</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-[10px]">No records match current filters.</div>
          ) : (
            filteredData.map(person => {
              const theme = statusColors[person.status];
              const isSelected = selectedPerson?.id === person.id;
              return (
                <div
                  key={person.id}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a1628] border-[#d4a853]/40'
                      : 'bg-[#060e1f] border-[#1a2a4a] hover:border-[#d4a853]/20'
                  }`}
                  onClick={() => setSelectedPerson(isSelected ? null : person)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')} shrink-0`} />
                      <span className="text-xs font-bold text-slate-50 truncate">{person.name}</span>
                      {person.alias !== '—' && (
                        <span className="text-[8px] text-slate-400 italic">aka {person.alias}</span>
                      )}
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} shrink-0`}>
                        {theme.label}
                      </span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-[#d4a853]/10 space-y-2 text-[10px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block">Age / Gender</span>
                          <span className="text-slate-50 font-medium">{person.age} yrs / {person.gender}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Last Seen</span>
                          <span className="text-slate-50 font-medium flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-[#d4a853]" />
                            {person.lastSeen}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Primary Crime</span>
                          <span className="text-slate-50 font-medium">{person.crime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">District</span>
                          <span className="text-slate-50 font-medium flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-[#d4a853]" />
                            {person.district}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Charges / Sections</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {person.charges.map((charge, i) => (
                            <span key={i} className="text-[8px] bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20 px-1.5 py-0.5 rounded font-medium">
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
  );
}
