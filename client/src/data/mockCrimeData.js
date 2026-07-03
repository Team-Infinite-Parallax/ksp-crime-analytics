// Mock Crime Data & Police Station Database for KSP-CIP Map
// Fully seedable for consistent, high-fidelity representations of planted database patterns

const SEED = 42;
function createRandom(seed) {
  let h = seed ^ 0xdeadbeef;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const random = createRandom(SEED);

export const districts = [
  { id: 1, name: 'Bengaluru Urban', center: [12.9716, 77.5946], zoom: 12 },
  { id: 2, name: 'Mysuru', center: [12.2958, 76.6394], zoom: 12 },
  { id: 3, name: 'Belagavi', center: [15.8497, 74.5089], zoom: 12 },
  { id: 4, name: 'Dakshina Kannada', center: [12.9141, 74.8560], zoom: 11 },
  { id: 5, name: 'Kalaburagi', center: [17.3297, 76.8344], zoom: 12 }
];

export const policeStations = [
  { id: 1, districtId: 1, name: 'Shivajinagar PS', lat: 12.97452, lon: 77.624424, staff: 42, vehicles: 5, status: 'High Alert' },
  { id: 2, districtId: 1, name: 'Indiranagar PS', lat: 12.973951, lon: 77.631614, staff: 38, vehicles: 4, status: 'Normal' },
  { id: 3, districtId: 1, name: 'Halasuru PS', lat: 12.973276, lon: 77.604772, staff: 45, vehicles: 4, status: 'High Alert' },
  { id: 4, districtId: 2, name: 'Devaraja PS', lat: 12.3088, lon: 76.6531, staff: 35, vehicles: 3, status: 'Normal' },
  { id: 5, districtId: 2, name: 'Lakshmipuram PS', lat: 12.2965, lon: 76.6432, staff: 30, vehicles: 3, status: 'Normal' },
  { id: 6, districtId: 3, name: 'Belagavi Town PS', lat: 15.8497, lon: 74.5089, staff: 40, vehicles: 4, status: 'Normal' },
  { id: 7, districtId: 4, name: 'Mangaluru South PS', lat: 12.8703, lon: 74.8436, staff: 50, vehicles: 5, status: 'Medium Alert' },
  { id: 8, districtId: 5, name: 'Kalaburagi City PS', lat: 17.3297, lon: 76.8344, staff: 36, vehicles: 3, status: 'Normal' }
];

const crimeCategories = [
  { head: 'Property Offences', subheads: ['Burglary by Night', 'House Theft', 'Vehicle Theft', 'Chain Snatching'] },
  { head: 'Cyber Crimes', subheads: ['Online Financial Fraud', 'Online Obscenity', 'Identity Theft', 'Phishing'] },
  { head: 'Crimes Against Body', subheads: ['Murder for Gain', 'Grievous Hurt', 'Assault', 'Kidnapping'] },
  { head: 'Narcotics NDPS', subheads: ['Cannabis/Ganja Possession', 'Synthetic Drug Sale', 'Contraband Transport'] },
  { head: 'Public Nuisance', subheads: ['Drunken Brawl', 'Traffic Disruption', 'Vandalism'] }
];

const statuses = ['Under Investigation', 'Chargesheeted', 'Disposed'];

const moPhrases = [
  'posed as bank official via mobile phone and extracted OTP',
  'gained entry through rear window after removing iron grille',
  'created fake matrimonial profile online and defrauded multiple victims',
  'waylaid victim near ATM and snatched gold chain and mobile phone',
  'pushed parked motorcycle silently and departed using hotwire ignition technique',
  'transporting commercial quantity of contraband across district borders in concealed vehicle compartments'
];

// Generate dynamic incidents array
const generateIncidents = () => {
  const incidents = [];
  let baseId = 10001;

  // 1. Planted Pattern 1: Burglary Hotspot (Bengaluru East - Stations 1, 2, 3)
  // Centroid 12.975, 77.625, ~2km radius, time window 23:00 to 04:00, Burglary by Night
  const burglaryHotspotStationIds = [1, 2, 3];
  for (let i = 0; i < 65; i++) {
    const station = policeStations[Math.floor(random() * burglaryHotspotStationIds.length)];
    // Random coordinate within ~1.5km of centroid 12.975, 77.625
    const lat = 12.975 + (random() - 0.5) * 0.02;
    const lon = 77.625 + (random() - 0.5) * 0.02;
    // Hour is in 23, 0, 1, 2, 3, 4
    const hours = [23, 0, 1, 2, 3, 4];
    const hour = hours[Math.floor(random() * hours.length)];
    const month = Math.floor(random() * 6) + 1; // Jan to June 2026
    const day = Math.floor(random() * 28) + 1;
    const dateStr = `2026-0${month}-${day < 10 ? '0' + day : day}`;
    const timeStr = `${hour < 10 ? '0' + hour : hour}:${Math.floor(random() * 60).toString().padStart(2, '0')}`;

    incidents.push({
      id: baseId++,
      crimeNo: `100412026${baseId}`,
      registrationDate: dateStr,
      time: timeStr,
      crimeHeadName: 'Property Offences',
      crimeSubHeadName: random() > 0.3 ? 'Burglary by Night' : 'House Theft',
      unitId: station.id,
      unitName: station.name,
      districtId: 1,
      districtName: 'Bengaluru Urban',
      latitude: lat,
      longitude: lon,
      gravity: '1', // Heinous
      caseStatusName: random() > 0.6 ? 'Under Investigation' : 'Chargesheeted',
      isAnomaly: random() > 0.8,
      briefFacts: 'House break-in reported during late night hours. Locked residential premises targeted.',
      moPhrase: moPhrases[1] // Gained entry through rear window after removing iron grille
    });
  }

  // 2. Planted Pattern 5: Seasonal Coastal Tourism Spike (Dakshina Kannada - Station 7)
  // Public Nuisance/Drunken Brawl peaking in Nov-Jan (specifically Dec)
  const coastalStation = policeStations.find(s => s.id === 7); // Mangaluru South PS
  for (let i = 0; i < 45; i++) {
    // Dates in Nov, Dec, Jan
    const monthOptions = [11, 12, 1];
    const month = monthOptions[Math.floor(random() * monthOptions.length)];
    const year = month === 1 ? 2026 : 2025;
    const day = Math.floor(random() * 28) + 1;
    const dateStr = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    const lat = coastalStation.lat + (random() - 0.5) * 0.03;
    const lon = coastalStation.lon + (random() - 0.5) * 0.03;

    incidents.push({
      id: baseId++,
      crimeNo: `10044202${year % 10}${baseId}`,
      registrationDate: dateStr,
      time: `${Math.floor(random() * 24).toString().padStart(2, '0')}:${Math.floor(random() * 60).toString().padStart(2, '0')}`,
      crimeHeadName: 'Public Nuisance',
      crimeSubHeadName: random() > 0.2 ? 'Drunken Brawl' : 'Vandalism',
      unitId: coastalStation.id,
      unitName: coastalStation.name,
      districtId: 4,
      districtName: 'Dakshina Kannada',
      latitude: lat,
      longitude: lon,
      gravity: '2', // Non-heinous
      caseStatusName: random() > 0.5 ? 'Disposed' : 'Under Investigation',
      isAnomaly: random() > 0.8,
      briefFacts: 'Altercation in public space involving tourist groups under influence of alcohol near beach resort.',
      moPhrase: 'created nuisance in public place under the influence of liquor'
    });
  }

  // 3. General crimes across all stations & districts
  // Covering Mysuru, Belagavi, Kalaburagi, and others
  policeStations.forEach(station => {
    // Generate ~15-20 crimes per station
    const count = 12 + Math.floor(random() * 10);
    const district = districts.find(d => d.id === station.districtId);

    for (let i = 0; i < count; i++) {
      const cat = crimeCategories[Math.floor(random() * crimeCategories.length)];
      const sub = cat.subheads[Math.floor(random() * cat.subheads.length)];
      
      // Let's filter out burglary by night from other stations to keep Bengaluru hotspot clean
      if (sub === 'Burglary by Night' && !burglaryHotspotStationIds.includes(station.id)) {
        continue;
      }

      const year = random() > 0.4 ? 2026 : 2025;
      const month = Math.floor(random() * 12) + 1;
      const day = Math.floor(random() * 28) + 1;
      const dateStr = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;

      // Spread around station coordinates
      const lat = station.lat + (random() - 0.5) * 0.015;
      const lon = station.lon + (random() - 0.5) * 0.015;
      
      const gravity = (cat.head === 'Crimes Against Body' || (cat.head === 'Property Offences' && sub === 'Burglary by Night')) ? '1' : '2';

      incidents.push({
        id: baseId++,
        crimeNo: `1004${station.id}202${year % 10}${baseId}`,
        registrationDate: dateStr,
        time: `${Math.floor(random() * 24).toString().padStart(2, '0')}:${Math.floor(random() * 60).toString().padStart(2, '0')}`,
        crimeHeadName: cat.head,
        crimeSubHeadName: sub,
        unitId: station.id,
        unitName: station.name,
        districtId: station.districtId,
        districtName: district.name,
        latitude: lat,
        longitude: lon,
        gravity: gravity,
        caseStatusName: statuses[Math.floor(random() * statuses.length)],
        isAnomaly: random() > 0.9,
        briefFacts: `Reported incident of ${sub} under the jurisdiction of ${station.name}. Legal action initiated.`,
        moPhrase: moPhrases[Math.floor(random() * moPhrases.length)]
      });
    }
  });

  // Sort incidents by date descending
  return incidents.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
};

export const crimeIncidents = generateIncidents();
