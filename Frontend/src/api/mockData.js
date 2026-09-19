export const mockUser = {
  id: 'user_pat_01',
  name: 'Sweta Sharma',
  email: 'Sweta@example.com',
  role: 'PATIENT',
  patientId: 'pat_01',
  token: 'mock_jwt_token_for_Sweta_12345'
};

export const mockPatientProfile = {
  id: 'pat_01',
  user: mockUser,
  dob: '1998-05-14',
  gender: 'FEMALE',
  bloodGroup: 'B+',
  phone: '+91 98765 43210',
  profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  createdAt: '2025-01-10T10:00:00.000Z'
};

export const mockHospitals = [
  {
    id: 'hosp_01',
    name: 'Apollo Spectra Multi-Speciality',
    state: 'Maharashtra',
    city: 'Pune',
    address: 'Plot 12, Senapati Bapat Road, Shivajinagar',
    pincode: '411016',
    phoneNumber: '+91 20 6602 3300',
    email: 'contact@apollospectrapune.com',
    description: 'Apollo Spectra is a state-of-the-art super specialty hospital delivering world-class medical outcomes with 24x7 emergency and trauma care, modular OT suites, and advanced diagnostics.',
    coverImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop',
    isActive: true,
    rating: 4.8,
    distanceKm: 1.8,
    galleryImages: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&fit=crop',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&fit=crop',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&fit=crop'
    ],
    facilities: ['24/7 Emergency', 'Modular OT', 'ICU & NICU', 'Digital X-Ray', 'In-house Pharmacy', 'Ambulance GPS', 'Cafeteria']
  },
  {
    id: 'hosp_02',
    name: 'Ruby Hall Clinic Care',
    state: 'Maharashtra',
    city: 'Pune',
    address: '40, Sassoon Road, Sangamvadi',
    pincode: '411001',
    phoneNumber: '+91 20 6645 5100',
    email: 'info@rubyhall.com',
    description: 'Renowned hospital offering advanced cardiac surgery, organ transplant, cancer care, and neurosciences with NABH & NABL accreditations.',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=200&h=200&fit=crop',
    isActive: true,
    rating: 4.7,
    distanceKm: 3.4,
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&fit=crop',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&fit=crop'
    ],
    facilities: ['Cardiac Care', 'Trauma Center', 'Dialysis Unit', 'MRI & CT Scan', 'Automated Pharmacy']
  },
  {
    id: 'hosp_03',
    name: 'Lilavati Hospital & Research Centre',
    state: 'Maharashtra',
    city: 'Mumbai',
    address: 'A-791, Bandra Reclamation, Bandra West',
    pincode: '400050',
    phoneNumber: '+91 22 2675 1000',
    email: 'support@lilavatihospital.com',
    description: 'Premier multi-specialty healthcare institution recognized globally for clinical excellence, compassionate patient care, and modern healthcare technology.',
    coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&h=200&fit=crop',
    isActive: true,
    rating: 4.9,
    distanceKm: 6.2,
    galleryImages: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&fit=crop'
    ],
    facilities: ['Telemedicine', 'Robotic Surgery', 'Pediatric ICU', 'Blood Bank', '24/7 Pharmacy']
  }
];

export const mockDepartments = {
  hosp_01: [
    { id: 'dept_cardio', name: 'Cardiology', hospitalId: 'hosp_01', doctorCount: 4, description: 'Heart diseases, angioplasty, and cardiac rehabilitation' },
    { id: 'dept_ortho', name: 'Orthopedics', hospitalId: 'hosp_01', doctorCount: 3, description: 'Joint replacement, spine care, and fracture treatments' },
    { id: 'dept_neuro', name: 'Neurology', hospitalId: 'hosp_01', doctorCount: 2, description: 'Brain, nervous system, and stroke interventions' },
    { id: 'dept_pedia', name: 'Pediatrics', hospitalId: 'hosp_01', doctorCount: 5, description: 'Child care, neonatal health, and immunizations' },
    { id: 'dept_derma', name: 'Dermatology', hospitalId: 'hosp_01', doctorCount: 2, description: 'Skin, hair, allergies, and cosmetic therapies' },
    { id: 'dept_genmed', name: 'General Medicine', hospitalId: 'hosp_01', doctorCount: 6, description: 'Primary health consultations, fever, hypertension, and diabetes' }
  ],
  hosp_02: [
    { id: 'dept_cardio_2', name: 'Cardiology', hospitalId: 'hosp_02', doctorCount: 3 },
    { id: 'dept_ortho_2', name: 'Orthopedics', hospitalId: 'hosp_02', doctorCount: 4 },
    { id: 'dept_genmed_2', name: 'General Medicine', hospitalId: 'hosp_02', doctorCount: 5 }
  ],
  hosp_03: [
    { id: 'dept_cardio_3', name: 'Cardiology', hospitalId: 'hosp_03', doctorCount: 6 },
    { id: 'dept_neuro_3', name: 'Neurology', hospitalId: 'hosp_03', doctorCount: 4 },
    { id: 'dept_pedia_3', name: 'Pediatrics', hospitalId: 'hosp_03', doctorCount: 4 }
  ]
};

export const mockDoctors = {
  dept_cardio: [
    {
      id: 'doc_01',
      name: 'Dr. Rajesh Deshmukh',
      email: 'dr.rajesh@apollospectra.com',
      specialization: 'Senior Interventional Cardiologist',
      experienceYears: 16,
      qualification: 'MBBS, MD, DM (Cardiology), FACC',
      profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
      consultationFee: 900,
      isAvailable: true,
      hospitalId: 'hosp_01',
      departmentId: 'dept_cardio',
      hospitalName: 'Apollo Spectra Multi-Speciality',
      departmentName: 'Cardiology'
    },
    {
      id: 'doc_02',
      name: 'Dr. Ananya Kulkarni',
      email: 'dr.ananya@apollospectra.com',
      specialization: 'Consultant Clinical Cardiologist',
      experienceYears: 9,
      qualification: 'MBBS, DNB (Cardiology)',
      profilePhoto: 'https://images.unsplash.com/photo-1594824813689-7cfc02b1f3c3?w=300&h=300&fit=crop&crop=face',
      consultationFee: 750,
      isAvailable: true,
      hospitalId: 'hosp_01',
      departmentId: 'dept_cardio',
      hospitalName: 'Apollo Spectra Multi-Speciality',
      departmentName: 'Cardiology'
    }
  ],
  dept_ortho: [
    {
      id: 'doc_03',
      name: 'Dr. Vikramaditya Patil',
      email: 'dr.vikram@apollospectra.com',
      specialization: 'Joint Replacement & Spine Surgeon',
      experienceYears: 14,
      qualification: 'MBBS, MS (Ortho), MCh',
      profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
      consultationFee: 850,
      isAvailable: true,
      hospitalId: 'hosp_01',
      departmentId: 'dept_ortho',
      hospitalName: 'Apollo Spectra Multi-Speciality',
      departmentName: 'Orthopedics'
    }
  ],
  dept_genmed: [
    {
      id: 'doc_04',
      name: 'Dr. Sneha Joshi',
      email: 'dr.sneha@apollospectra.com',
      specialization: 'Internal Medicine Specialist',
      experienceYears: 11,
      qualification: 'MBBS, MD (Medicine)',
      profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      consultationFee: 600,
      isAvailable: true,
      hospitalId: 'hosp_01',
      departmentId: 'dept_genmed',
      hospitalName: 'Apollo Spectra Multi-Speciality',
      departmentName: 'General Medicine'
    }
  ]
};

export const mockAppointments = [
  {
    id: 'appt_101',
    doctorId: 'doc_01',
    doctorName: 'Dr. Rajesh Deshmukh',
    doctorProfilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    hospitalName: 'Apollo Spectra Multi-Speciality',
    departmentName: 'Cardiology',
    date: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    appointmentType: 'offline',
    status: 'CONFIRMED',
    token: 18,
    reason: 'Quarterly heart routine checkup and blood pressure monitoring'
  },
  {
    id: 'appt_102',
    doctorId: 'doc_04',
    doctorName: 'Dr. Sneha Joshi',
    doctorProfilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    hospitalName: 'Apollo Spectra Multi-Speciality',
    departmentName: 'General Medicine',
    date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    appointmentType: 'online',
    status: 'CONFIRMED',
    token: 5,
    roomId: 'room_telecon_sneha_102',
    reason: 'Follow up on laboratory blood test results'
  },
  {
    id: 'appt_103',
    doctorId: 'doc_03',
    doctorName: 'Dr. Vikramaditya Patil',
    doctorProfilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
    hospitalName: 'Apollo Spectra Multi-Speciality',
    departmentName: 'Orthopedics',
    date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    appointmentType: 'offline',
    status: 'COMPLETED',
    token: 12,
    reason: 'Left knee sprain examination'
  }
];

export const mockActiveQueue = {
  hasActiveQueue: true,
  appointmentId: 'appt_101',
  doctorId: 'doc_01',
  doctorName: 'Dr. Rajesh Deshmukh',
  department: 'Cardiology',
  currentToken: 14,
  yourToken: 18,
  patientsAhead: 4,
  isPaused: false,
  isOpdClosed: false,
  notification: 'The OPD is ongoing. Doctor is currently consulting Token #14.'
};

export const mockReports = [
  {
    id: 'rep_01',
    title: 'Comprehensive Lipid & Blood Profile',
    type: 'Lab Report',
    file: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&fit=crop',
    fileType: 'image',
    createdAt: '2026-02-14T08:30:00.000Z'
  },
  {
    id: 'rep_02',
    title: 'Digital Chest X-Ray PA View',
    type: 'Scan',
    file: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&fit=crop',
    fileType: 'image',
    createdAt: '2026-01-20T14:15:00.000Z'
  },
  {
    id: 'rep_03',
    title: 'Prescription - Cardiology Consultation',
    type: 'Prescription',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'pdf',
    createdAt: '2025-12-05T11:00:00.000Z'
  }
];

export const mockPharmacies = [
  {
    id: 'pharm_01',
    shopName: 'Apollo 24|7 MedStore',
    address: 'Shop 4, Ground Floor, Senapati Bapat Road',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+91 20 2567 8899',
    licenseNumber: 'MH-PUN-104928',
    isAvailable: true,
    openingHours: '24 Hours Open'
  },
  {
    id: 'pharm_02',
    shopName: 'Wellness Forever Pharmacy',
    address: '14, FC Road, Deccan Gymkhana',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+91 20 2553 4411',
    licenseNumber: 'MH-PUN-992310',
    isAvailable: true,
    openingHours: '24 Hours Open'
  },
  {
    id: 'pharm_03',
    shopName: 'MedPlus Chemist & Druggist',
    address: 'Near Ruby Hall Clinic, Sassoon Road',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+91 20 2612 0033',
    licenseNumber: 'MH-PUN-812034',
    isAvailable: true,
    openingHours: '8:00 AM - 11:00 PM'
  }
];

export const mockMedicines = {
  pharm_01: [
    {
      id: 'med_01',
      pharmacyId: 'pharm_01',
      medicineName: 'Atorvastatin (Lipitor)',
      genericName: 'Atorvastatin Calcium',
      strength: '20 mg',
      price: 145,
      stock: 64,
      manufacturer: 'Sun Pharma',
      prescriptionRequired: true
    },
    {
      id: 'med_02',
      pharmacyId: 'pharm_01',
      medicineName: 'Telmisartan (Telma)',
      genericName: 'Telmisartan',
      strength: '40 mg',
      price: 98,
      stock: 45,
      manufacturer: 'Glenmark Pharmaceuticals',
      prescriptionRequired: true
    },
    {
      id: 'med_03',
      pharmacyId: 'pharm_01',
      medicineName: 'Paracetamol (Dolo 650)',
      genericName: 'Paracetamol IP',
      strength: '650 mg',
      price: 32,
      stock: 120,
      manufacturer: 'Micro Labs',
      prescriptionRequired: false
    },
    {
      id: 'med_04',
      pharmacyId: 'pharm_01',
      medicineName: 'Amoxicillin (Augmentin)',
      genericName: 'Amoxicillin + Potassium Clavulanate',
      strength: '625 mg',
      price: 210,
      stock: 28,
      manufacturer: 'GSK India',
      prescriptionRequired: true
    },
    {
      id: 'med_05',
      pharmacyId: 'pharm_01',
      medicineName: 'Pantoprazole (Pan 40)',
      genericName: 'Pantoprazole Gastro-resistant',
      strength: '40 mg',
      price: 115,
      stock: 80,
      manufacturer: 'Alkem Laboratories',
      prescriptionRequired: false
    }
  ],
  pharm_02: [
    {
      id: 'med_06',
      pharmacyId: 'pharm_02',
      medicineName: 'Metformin (Glycomet 500)',
      genericName: 'Metformin Hydrochloride',
      strength: '500 mg',
      price: 45,
      stock: 90,
      manufacturer: 'USV Ltd',
      prescriptionRequired: true
    },
    {
      id: 'med_07',
      pharmacyId: 'pharm_02',
      medicineName: 'Paracetamol (Dolo 650)',
      genericName: 'Paracetamol IP',
      strength: '650 mg',
      price: 32,
      stock: 150,
      manufacturer: 'Micro Labs',
      prescriptionRequired: false
    }
  ]
};

export const mockReviews = {
  hosp_01: [
    {
      id: 'rev_01',
      patientName: 'Kavita Menon',
      rating: 5,
      feedback: 'Excellent cardiac emergency team! The live queue system on the app saved us at least 2 hours of waiting time.',
      createdAt: '2026-02-18T12:30:00.000Z'
    },
    {
      id: 'rev_02',
      patientName: 'Rohan Deshmukh',
      rating: 4,
      feedback: 'Very clean facility and polite nursing staff. Doctor Rajesh explained the treatment plan with great clarity.',
      createdAt: '2026-02-05T09:15:00.000Z'
    },
    {
      id: 'rev_03',
      patientName: 'Sweta Sharma',
      rating: 5,
      feedback: 'Consultation was on time as per token #18. Modern OPD queue display inside the waiting area is super helpful!',
      createdAt: '2026-01-28T16:40:00.000Z',
      isMine: true
    }
  ]
};
