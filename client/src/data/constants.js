export const districts = [
    { id: 1, name: 'Bengaluru Urban' },
    { id: 2, name: 'Mysuru' },
    { id: 3, name: 'Belagavi' },
    { id: 4, name: 'Dakshina Kannada' },
    { id: 5, name: 'Kalaburagi' }
];

export const units = [
    { id: 1, districtId: 1, name: 'Shivajinagar PS' },
    { id: 2, districtId: 1, name: 'Indiranagar PS' },
    { id: 3, districtId: 1, name: 'Halasuru PS' },
    { id: 4, districtId: 2, name: 'Devaraja PS' },
    { id: 5, districtId: 2, name: 'Lakshmipuram PS' },
    { id: 6, districtId: 3, name: 'Belagavi Town PS' },
    { id: 7, districtId: 4, name: 'Mangaluru South PS' },
    { id: 8, districtId: 5, name: 'Kalaburagi City PS' }
];

export const getUserDetailsByRole = (role) => {
    switch (role) {
        case 'SCRB_ADMIN':
            return {
                employeeID: 100,
                firstName: 'Prashant',
                lastName: 'Kumar',
                email: 'prashant.kumar@ksp.gov.in',
                designation: 'Director General, SCRB',
                districtName: 'State Headquarters',
                unitName: 'SCRB HQ, Bengaluru'
            };
        case 'DISTRICT_OFFICER':
            return {
                employeeID: 9,
                firstName: 'Praveen',
                lastName: 'Verma',
                email: 'praveen.verma@ksp.gov.in',
                designation: 'Superintendent of Police',
                districtName: 'Bengaluru Urban',
                unitName: 'District Office'
            };
        case 'INVESTIGATION_OFFICER':
            return {
                employeeID: 1,
                firstName: 'Mohammed',
                lastName: 'Puttaiah',
                email: 'mohammed.puttaiah@ksp.gov.in',
                designation: 'Sub-Inspector',
                districtName: 'Bengaluru Urban',
                unitName: 'Shivajinagar PS'
            };
        default:
            return {};
    }
};

export const repeatOffenders = [
    { id: 1, name: 'Rajesh Choudhary', age: 30, gender: 'Male', riskScore: 92, caseCount: 11, distinctDistricts: 3, moPhrase: 'posed as bank official via mobile phone and extracted OTP', districtId: 1, unitId: 1 },
    { id: 2, name: 'Imran Basappa', age: 29, gender: 'Male', riskScore: 84, caseCount: 8, distinctDistricts: 2, moPhrase: 'gained entry through rear window after removing iron grille', districtId: 1, unitId: 2 },
    { id: 3, name: 'Sneha Yellappa', age: 41, gender: 'Female', riskScore: 78, caseCount: 6, distinctDistricts: 2, moPhrase: 'created fake matrimonial profile online and defrauded multiple victims', districtId: 2, unitId: 4 },
    { id: 4, name: 'Vikas Gupta', age: 35, gender: 'Male', riskScore: 65, caseCount: 5, distinctDistricts: 1, moPhrase: 'waylaid victim near ATM and snatched gold chain and mobile phone', districtId: 3, unitId: 6 },
    { id: 5, name: 'Anil Deshpande', age: 38, gender: 'Male', riskScore: 49, caseCount: 4, distinctDistricts: 1, moPhrase: 'pushed parked motorcycle silently and departed using hotwire ignition technique', districtId: 4, unitId: 7 }
];

export const rawCrimesLog = [
    { id: 101, crimeNo: '10041202600001', registrationDate: '2026-07-01', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Burglary by Night', unitName: 'Shivajinagar PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 1, caseStatusName: 'Under Investigation', gravity: '1', isAnomaly: true },
    { id: 102, crimeNo: '10041202600002', registrationDate: '2026-06-29', crimeHeadName: 'Cyber Crimes', crimeSubHeadName: 'Online Financial Fraud', unitName: 'Indiranagar PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 2, caseStatusName: 'Chargesheeted', gravity: '2', isAnomaly: false },
    { id: 103, crimeNo: '10042202600003', registrationDate: '2026-06-28', crimeHeadName: 'Crimes Against Body', crimeSubHeadName: 'Murder for Gain', unitName: 'Shivajinagar PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 1, caseStatusName: 'Under Investigation', gravity: '1', isAnomaly: false },
    { id: 104, crimeNo: '10043202600004', registrationDate: '2026-06-25', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Vehicle Theft', unitName: 'Devaraja PS', districtName: 'Mysuru', districtId: 2, unitId: 4, caseStatusName: 'Disposed', gravity: '2', isAnomaly: false },
    { id: 105, crimeNo: '10044202600005', registrationDate: '2026-06-20', crimeHeadName: 'Narcotics NDPS', crimeSubHeadName: 'Cannabis/Ganja Possession', unitName: 'Mangaluru South PS', districtName: 'Dakshina Kannada', districtId: 4, unitId: 7, caseStatusName: 'Chargesheeted', gravity: '1', isAnomaly: true },
    { id: 106, crimeNo: '10045202600006', registrationDate: '2026-06-18', crimeHeadName: 'Cyber Crimes', crimeSubHeadName: 'Online Obscenity', unitName: 'Belagavi Town PS', districtName: 'Belagavi', districtId: 3, unitId: 6, caseStatusName: 'Under Investigation', gravity: '2', isAnomaly: false },
    { id: 107, crimeNo: '10046202600007', registrationDate: '2026-06-15', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Theft (Other)', unitName: 'Kalaburagi City PS', districtName: 'Kalaburagi', districtId: 5, unitId: 8, caseStatusName: 'Disposed', gravity: '2', isAnomaly: false },
    { id: 108, crimeNo: '10041202600008', registrationDate: '2026-06-12', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Burglary by Night', unitName: 'Halasuru PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 3, caseStatusName: 'Under Investigation', gravity: '1', isAnomaly: false }
];
