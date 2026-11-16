// ================= DIVISIONS & INDUSTRIAL AREAS =================
// Sub-divisions = MIDC industrial areas (lat/lng used for map view)
export const divisions = [
  {
    id: 'DIV-MUM', name: 'Mumbai – Thane', nameMr: 'मुंबई – ठाणे',
    areas: [
      { id: 'AR-AND', name: 'Andheri MIDC', nameMr: 'अंधेरी एमआयडीसी', lat: 19.1176, lng: 72.8697 },
      { id: 'AR-TTC', name: 'TTC (Mahape)', nameMr: 'टीटीसी (महापे)', lat: 19.1170, lng: 73.0270 },
      { id: 'AR-DOM', name: 'Dombivli MIDC', nameMr: 'डोंबिवली एमआयडीसी', lat: 19.2120, lng: 73.0950 },
    ],
  },
  {
    id: 'DIV-RAI', name: 'Raigad', nameMr: 'रायगड',
    areas: [
      { id: 'AR-TAL', name: 'Taloja MIDC', nameMr: 'तळोजा एमआयडीसी', lat: 19.0670, lng: 73.1170 },
    ],
  },
  {
    id: 'DIV-PAL', name: 'Palghar', nameMr: 'पालघर',
    areas: [
      { id: 'AR-TAR', name: 'Tarapur MIDC', nameMr: 'तारापूर एमआयडीसी', lat: 19.8100, lng: 72.7000 },
    ],
  },
  {
    id: 'DIV-PUN', name: 'Pune', nameMr: 'पुणे',
    areas: [
      { id: 'AR-BHO', name: 'Bhosari MIDC', nameMr: 'भोसरी एमआयडीसी', lat: 18.6300, lng: 73.8410 },
      { id: 'AR-CHA', name: 'Chakan MIDC', nameMr: 'चाकण एमआयडीसी', lat: 18.7550, lng: 73.8300 },
      { id: 'AR-HIN', name: 'Hinjewadi IT Park', nameMr: 'हिंजवडी आयटी पार्क', lat: 18.5913, lng: 73.7389 },
    ],
  },
  {
    id: 'DIV-NAS', name: 'Nashik', nameMr: 'नाशिक',
    areas: [
      { id: 'AR-SAT', name: 'Satpur MIDC', nameMr: 'सातपूर एमआयडीसी', lat: 20.0000, lng: 73.7400 },
      { id: 'AR-AMB', name: 'Ambad MIDC', nameMr: 'अंबड एमआयडीसी', lat: 19.9650, lng: 73.7520 },
    ],
  },
  {
    id: 'DIV-CSN', name: 'Chh. Sambhajinagar', nameMr: 'छ. संभाजीनगर',
    areas: [
      { id: 'AR-WAL', name: 'Waluj MIDC', nameMr: 'वाळूज एमआयडीसी', lat: 19.8370, lng: 75.2400 },
      { id: 'AR-SHE', name: 'Shendra MIDC', nameMr: 'शेंद्रा एमआयडीसी', lat: 19.8850, lng: 75.4400 },
    ],
  },
  {
    id: 'DIV-NAG', name: 'Nagpur', nameMr: 'नागपूर',
    areas: [
      { id: 'AR-BUT', name: 'Butibori MIDC', nameMr: 'बुटीबोरी एमआयडीसी', lat: 20.9300, lng: 79.0000 },
      { id: 'AR-HNG', name: 'Hingna MIDC', nameMr: 'हिंगणा एमआयडीसी', lat: 21.1000, lng: 78.9800 },
    ],
  },
]

// ================= DEPARTMENTS =================
// icon = lucide-react icon name
export const departments = [
  { id: 'DEP-ENG', name: 'Engineering (Roads)',   nameMr: 'अभियांत्रिकी (रस्ते)',     icon: 'Construction' },
  { id: 'DEP-ELE', name: 'Electrical',            nameMr: 'विद्युत',                  icon: 'Zap' },
  { id: 'DEP-WAT', name: 'Water Supply',          nameMr: 'पाणीपुरवठा',               icon: 'Droplets' },
  { id: 'DEP-DRN', name: 'Drainage & Sewerage',   nameMr: 'मलनिस्सारण व गटार',        icon: 'Waves' },
  { id: 'DEP-SAN', name: 'Health & Sanitation',   nameMr: 'आरोग्य व स्वच्छता',        icon: 'Trash2' },
  { id: 'DEP-ENV', name: 'Environment',           nameMr: 'पर्यावरण',                 icon: 'Leaf' },
  { id: 'DEP-FIR', name: 'Fire Services',         nameMr: 'अग्निशमन सेवा',            icon: 'Flame' },
  { id: 'DEP-EST', name: 'Estate & Land',         nameMr: 'इस्टेट व भूमी',            icon: 'Landmark' },
]

// ================= COMPLAINT CATEGORIES =================
// departments[0] = primary, rest = supporting (multi-department routing)
// keywords = used by mock AI to suggest category from text (EN + MR)
export const categories = [
  {
    id: 'CAT-POT', name: 'Pothole / Road damage', nameMr: 'खड्डे / रस्ता खराब',
    departments: ['DEP-ENG'], defaultPriority: 'medium',
    keywords: ['pothole', 'road', 'damage', 'crack', 'खड्डा', 'खड्डे', 'रस्ता'],
  },
  {
    id: 'CAT-STL', name: 'Streetlight not working', nameMr: 'पथदिवे बंद',
    departments: ['DEP-ELE'], defaultPriority: 'medium',
    keywords: ['streetlight', 'street light', 'light', 'pole', 'dark', 'पथदिवा', 'दिवा', 'लाईट'],
  },
  {
    id: 'CAT-WLK', name: 'Water leakage / Pipeline burst', nameMr: 'पाणी गळती / पाईपलाईन फुटली',
    departments: ['DEP-WAT'], defaultPriority: 'high',
    keywords: ['leak', 'leakage', 'pipeline', 'burst', 'water', 'गळती', 'पाईप', 'पाणी'],
  },
  {
    id: 'CAT-NWS', name: 'No / Low water supply', nameMr: 'पाणीपुरवठा बंद / कमी',
    departments: ['DEP-WAT'], defaultPriority: 'high',
    keywords: ['no water', 'low pressure', 'supply', 'पाणीपुरवठा', 'पाणी नाही'],
  },
  {
    id: 'CAT-DRN', name: 'Drainage blockage / Overflow', nameMr: 'गटार तुंबले / ओसंडून वाहणे',
    departments: ['DEP-DRN', 'DEP-SAN'], defaultPriority: 'high',
    keywords: ['drain', 'drainage', 'sewer', 'overflow', 'blocked', 'गटार', 'नाला', 'तुंबले'],
  },
  {
    id: 'CAT-GAR', name: 'Garbage / Waste dumping', nameMr: 'कचरा / कचरा टाकणे',
    departments: ['DEP-SAN'], defaultPriority: 'low',
    keywords: ['garbage', 'waste', 'dump', 'trash', 'कचरा', 'घाण'],
  },
  {
    id: 'CAT-POL', name: 'Air / Water pollution', nameMr: 'हवा / जल प्रदूषण',
    departments: ['DEP-ENV'], defaultPriority: 'high',
    keywords: ['pollution', 'smoke', 'effluent', 'chemical', 'smell', 'प्रदूषण', 'धूर', 'रसायन', 'वास'],
  },
  {
    id: 'CAT-FIR', name: 'Fire hazard / Safety', nameMr: 'आगीचा धोका / सुरक्षा',
    departments: ['DEP-FIR'], defaultPriority: 'high',
    keywords: ['fire', 'hazard', 'spark', 'gas', 'आग', 'धोका', 'स्फोट'],
  },
  {
    id: 'CAT-TRE', name: 'Fallen tree on road', nameMr: 'रस्त्यावर झाड पडले',
    departments: ['DEP-ENG', 'DEP-FIR'], defaultPriority: 'high',
    keywords: ['tree', 'fallen', 'branch', 'झाड', 'फांदी'],
  },
  {
    id: 'CAT-ENC', name: 'Encroachment on MIDC land', nameMr: 'एमआयडीसी जमिनीवर अतिक्रमण',
    departments: ['DEP-EST'], defaultPriority: 'medium',
    keywords: ['encroachment', 'illegal', 'occupy', 'hawker', 'अतिक्रमण', 'बेकायदेशीर'],
  },
]

// ================= OFFICERS =================
export const officers = [
  { id: 'OFF-01', name: 'Sandeep Patil',    designation: 'JE – Civil',      departmentId: 'DEP-ENG', divisionId: 'DIV-MUM', phone: '98200 11001' },
  { id: 'OFF-02', name: 'Meera Kulkarni',   designation: 'AE – Electrical', departmentId: 'DEP-ELE', divisionId: 'DIV-MUM', phone: '98200 11002' },
  { id: 'OFF-03', name: 'Rajesh Shinde',    designation: 'JE – Water',      departmentId: 'DEP-WAT', divisionId: 'DIV-MUM', phone: '98200 11003' },
  { id: 'OFF-04', name: 'Anil Jadhav',      designation: 'JE – Drainage',   departmentId: 'DEP-DRN', divisionId: 'DIV-RAI', phone: '98200 11004' },
  { id: 'OFF-05', name: 'Priya Deshpande',  designation: 'Sanitary Inspector', departmentId: 'DEP-SAN', divisionId: 'DIV-PUN', phone: '98200 11005' },
  { id: 'OFF-06', name: 'Vikas More',       designation: 'Field Officer – Env', departmentId: 'DEP-ENV', divisionId: 'DIV-PAL', phone: '98200 11006' },
  { id: 'OFF-07', name: 'Suresh Gaikwad',   designation: 'Fire Officer',    departmentId: 'DEP-FIR', divisionId: 'DIV-PUN', phone: '98200 11007' },
  { id: 'OFF-08', name: 'Kavita Pawar',     designation: 'Area Manager – Estate', departmentId: 'DEP-EST', divisionId: 'DIV-NAS', phone: '98200 11008' },
  { id: 'OFF-09', name: 'Nitin Wagh',       designation: 'JE – Civil',      departmentId: 'DEP-ENG', divisionId: 'DIV-CSN', phone: '98200 11009' },
  { id: 'OFF-10', name: 'Ashok Bhagat',     designation: 'AE – Electrical', departmentId: 'DEP-ELE', divisionId: 'DIV-NAG', phone: '98200 11010' },
]

// ================= INDUSTRIAL UNITS / FACTORIES =================
export const industrialUnits = [
  { id: 'UNT-01', areaId: 'AR-AND', name: 'Tata Steel Processing Ltd', sector: 'Metallurgy' },
  { id: 'UNT-02', areaId: 'AR-AND', name: 'Sun Pharma Laboratory Unit-4', sector: 'Pharmaceuticals' },
  { id: 'UNT-03', areaId: 'AR-TTC', name: 'Reliance Petrochem Terminal', sector: 'Chemicals' },
  { id: 'UNT-04', areaId: 'AR-TTC', name: 'Siemens Precision Eng Works', sector: 'Electrical' },
  { id: 'UNT-05', areaId: 'AR-DOM', name: 'Kalyan Chemical Synthesis Ltd', sector: 'Chemicals' },
  { id: 'UNT-06', areaId: 'AR-DOM', name: 'Gharda Chemicals Plot B-12', sector: 'Agrochemicals' },
  { id: 'UNT-07', areaId: 'AR-TAL', name: 'Deepak Fertilisers & Petrochem', sector: 'Chemicals' },
  { id: 'UNT-08', areaId: 'AR-TAL', name: 'Hindalco Extrusions Plant', sector: 'Aluminium' },
  { id: 'UNT-09', areaId: 'AR-TAR', name: 'Aarti Industries Specialities', sector: 'Chemicals' },
  { id: 'UNT-10', areaId: 'AR-TAR', name: 'Jindal Polyfilms Extrusion', sector: 'Polymers' },
  { id: 'UNT-11', areaId: 'AR-BHO', name: 'Bharat Forge Precision Forge', sector: 'Automotive' },
  { id: 'UNT-12', areaId: 'AR-BHO', name: 'Thermax Boilers Unit 1', sector: 'Heavy Eng' },
  { id: 'UNT-13', areaId: 'AR-CHA', name: 'Bajaj Auto Assembly Plant 3', sector: 'Automotive' },
  { id: 'UNT-14', areaId: 'AR-CHA', name: 'Mahindra Heavy Vehicles Division', sector: 'Automotive' },
  { id: 'UNT-15', areaId: 'AR-HIN', name: 'Infosys Hinjewadi Phase 1 SEZ', sector: 'IT/ITES' },
  { id: 'UNT-16', areaId: 'AR-HIN', name: 'Wipro Technologies Campus', sector: 'IT/ITES' },
  { id: 'UNT-17', areaId: 'AR-SAT', name: 'Bosch Automotive Components', sector: 'Automotive' },
  { id: 'UNT-18', areaId: 'AR-AMB', name: 'VIP Industries Luggage Plant', sector: 'Consumer Goods' },
  { id: 'UNT-19', areaId: 'AR-WAL', name: 'Endurance Technologies Casting', sector: 'Automotive' },
  { id: 'UNT-20', areaId: 'AR-BUT', name: 'Indorama Synthetics Yarn Unit', sector: 'Textiles' },
  { id: 'UNT-21', areaId: 'AR-HNG', name: 'Mahindra & Mahindra Tractors', sector: 'Automotive' },
]