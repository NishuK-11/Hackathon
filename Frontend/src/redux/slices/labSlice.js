import { createSlice } from '@reduxjs/toolkit';

const initialTestCatalog = [
  {
    id: 'test_cbc',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 350,
    sampleType: 'Whole Blood (EDTA)',
    fastingRequired: false,
    tatHours: 4,
    description: 'Measures RBC, WBC, Platelets, Hemoglobin, Hematocrit, and differential count.'
  },
  {
    id: 'test_lipid',
    name: 'Lipid Profile Comprehensive',
    category: 'Biochemistry',
    price: 650,
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 6,
    description: 'Total Cholesterol, HDL, LDL, VLDL, and Triglycerides level screening.'
  },
  {
    id: 'test_lft',
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    price: 750,
    sampleType: 'Serum',
    fastingRequired: true,
    tatHours: 6,
    description: 'SGOT, SGPT, Bilirubin, Alkaline Phosphatase, Total Protein, Albumin.'
  },
  {
    id: 'test_kft',
    name: 'Kidney Function Test (KFT)',
    category: 'Biochemistry',
    price: 600,
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 4,
    description: 'Urea, Blood Urea Nitrogen (BUN), Serum Creatinine, Uric Acid, Electrolytes.'
  },
  {
    id: 'test_fbs',
    name: 'Fasting Blood Sugar (FBS) & HbA1c',
    category: 'Diabetes Care',
    price: 450,
    sampleType: 'Fluoride Plasma & Whole Blood',
    fastingRequired: true,
    tatHours: 3,
    description: 'Accurate plasma glucose measurement with 3-month glycation index.'
  },
  {
    id: 'test_thyroid',
    name: 'Thyroid Profile Total (T3, T4, TSH)',
    category: 'Endocrinology',
    price: 550,
    sampleType: 'Serum',
    fastingRequired: false,
    tatHours: 6,
    description: 'Diagnostic assessment of hyperthyroidism, hypothyroidism, and endocrine balance.'
  }
];

const initialOrders = [
  {
    id: 'order_lab_101',
    orderNumber: 'LAB-2026-8891',
    patientId: 'pat_01',
    patientName: 'Ishani Sharma',
    patientAge: 27,
    patientGender: 'Female',
    referringDoctor: 'Dr. Rajesh Sharma (Cardiology)',
    hospitalName: 'Apollo Spectra Multi-Speciality',
    tests: ['Complete Blood Count (CBC)', 'Lipid Profile Comprehensive'],
    urgency: 'ROUTINE',
    orderDate: '2026-09-19T09:30:00.000Z',
    status: 'SAMPLE_COLLECTED', // PENDING_SAMPLE | SAMPLE_COLLECTED | IN_TESTING | COMPLETED
    sampleBarcode: 'BC-8891-EDTA',
    sampleCollectedAt: '2026-09-19T10:15:00.000Z',
    technician: 'Vikram Joshi (Senior MLT)'
  },
  {
    id: 'order_lab_102',
    orderNumber: 'LAB-2026-8892',
    patientId: 'pat_02',
    patientName: 'Amit Verma',
    patientAge: 45,
    patientGender: 'Male',
    referringDoctor: 'Dr. Neha Kapoor (Neurology)',
    hospitalName: 'Ruby Hall Clinic Care',
    tests: ['Kidney Function Test (KFT)'],
    urgency: 'STAT',
    orderDate: '2026-09-19T10:00:00.000Z',
    status: 'IN_TESTING',
    sampleBarcode: 'BC-8892-SERUM',
    sampleCollectedAt: '2026-09-19T10:20:00.000Z',
    technician: 'Pooja Nair (Lab Officer)'
  },
  {
    id: 'order_lab_103',
    orderNumber: 'LAB-2026-8893',
    patientId: 'pat_03',
    patientName: 'Kavita Deshmukh',
    patientAge: 52,
    patientGender: 'Female',
    referringDoctor: 'Dr. Rajesh Sharma (Cardiology)',
    hospitalName: 'Lilavati Hospital & Research Centre',
    tests: ['Thyroid Profile Total (T3, T4, TSH)'],
    urgency: 'ROUTINE',
    orderDate: '2026-09-19T11:15:00.000Z',
    status: 'PENDING_SAMPLE',
    sampleBarcode: null,
    sampleCollectedAt: null,
    technician: null
  }
];

const initialDispatchedReports = [
  {
    id: 'rep_dispatched_01',
    orderId: 'order_lab_100',
    reportNumber: 'REP-2026-0412',
    patientId: 'pat_01',
    patientName: 'Ishani Sharma',
    testName: 'Complete Blood Count (CBC)',
    labName: 'Apex Diagnostic & Pathology Center',
    dispatchedDate: '2026-09-18T16:00:00.000Z',
    technicianName: 'Vikram Joshi (Senior MLT)',
    pathologistName: 'Dr. S. K. Roy, MD (Pathology)',
    parameters: [
      { name: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', normalRange: '12.0 - 15.5', status: 'NORMAL' },
      { name: 'Total Leukocyte Count (WBC)', value: '6800', unit: '/mcL', normalRange: '4500 - 11000', status: 'NORMAL' },
      { name: 'Platelet Count', value: '245,000', unit: '/mcL', normalRange: '150,000 - 450,000', status: 'NORMAL' },
      { name: 'Hematocrit (PCV)', value: '41.2', unit: '%', normalRange: '37.0 - 48.0', status: 'NORMAL' },
      { name: 'RBC Count', value: '4.65', unit: 'million/mcL', normalRange: '4.2 - 5.4', status: 'NORMAL' }
    ],
    clinicalImpression: 'Hematological parameters are within normal biological limits. No immediate abnormalities detected.',
    criticalFlag: false
  }
];

const initialState = {
  catalog: initialTestCatalog,
  testCatalog: initialTestCatalog,
  orders: initialOrders,
  dispatchedReports: initialDispatchedReports,
  activeFilter: 'ALL',
  selectedOrder: null,
};

export const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setLabOrdersFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    setSelectedLabOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    collectSample: (state, action) => {
      const { orderId, barcode, technician } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'SAMPLE_COLLECTED';
        order.sampleBarcode = barcode || `BC-${Date.now().toString().slice(-6)}`;
        order.sampleCollectedAt = new Date().toISOString();
        order.technician = technician || 'Lab Technician';
      }
    },
    setTestingInProgress: (state, action) => {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.status = 'IN_TESTING';
      }
    },
    dispatchLabReport: (state, action) => {
      const { orderId, testName, parameters, clinicalImpression, criticalFlag, pathologistName } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'COMPLETED';
      }
      const newReport = {
        id: `rep_dispatched_${Date.now()}`,
        orderId,
        reportNumber: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: order ? order.patientId : 'pat_unknown',
        patientName: order ? order.patientName : 'Patient',
        testName: testName || (order ? order.tests.join(', ') : 'Diagnostic Test'),
        labName: 'Apex Diagnostic & Pathology Center',
        dispatchedDate: new Date().toISOString(),
        technicianName: (order && order.technician) || 'Vikram Joshi (Senior MLT)',
        pathologistName: pathologistName || 'Dr. S. K. Roy, MD (Pathology)',
        parameters: parameters || [],
        clinicalImpression: clinicalImpression || 'Parameters verified and within normal limits.',
        criticalFlag: !!criticalFlag,
      };
      state.dispatchedReports.unshift(newReport);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
      }
    },
    dispatchReport: (state, action) => {
      const {
        orderId,
        patientId,
        patientName,
        testName,
        referringDoctor,
        hospitalName,
        parameters,
        clinicalNotes,
        authorizedBy,
        licenseNo,
        barcode,
      } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'COMPLETED';
      }
      const newReport = {
        id: `rep_dispatched_${Date.now()}`,
        orderId,
        reportNumber: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: patientId || (order ? order.patientId : 'pat_01'),
        patientName: patientName || (order ? order.patientName : 'Patient'),
        testName: testName || (order ? order.tests.join(', ') : 'Comprehensive Diagnostic Panel'),
        referringDoctor: referringDoctor || (order ? order.referringDoctor : 'Attending Physician'),
        hospitalName: hospitalName || (order ? order.hospitalName : 'Hospital Clinic'),
        labName: 'MediReach Pathology & Diagnostic Center',
        dispatchedAt: new Date().toISOString(),
        technicianName: authorizedBy || 'Lab Officer',
        pathologistName: authorizedBy || 'Dr. S. K. Roy, MD',
        licenseNo: licenseNo || 'NABL-LAB-2026-X88',
        barcode: barcode || (order ? order.sampleBarcode : 'BC-LAB-9901'),
        parameters: parameters || [],
        clinicalNotes: clinicalNotes || 'Biological parameters analyzed and verified.',
      };
      state.dispatchedReports.unshift(newReport);
    },
    addCatalogTest: (state, action) => {
      const test = {
        id: `test_${Date.now()}`,
        ...action.payload,
      };
      state.catalog.push(test);
      if (!state.testCatalog) state.testCatalog = [];
      state.testCatalog.push(test);
    },
    updateCatalogTest: (state, action) => {
      const idx = state.catalog.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.catalog[idx] = { ...state.catalog[idx], ...action.payload };
      }
    },
  },
});

export const {
  setLabOrdersFilter,
  setSelectedLabOrder,
  collectSample,
  setTestingInProgress,
  dispatchLabReport,
  updateOrderStatus,
  dispatchReport,
  addCatalogTest,
  updateCatalogTest,
} = labSlice.actions;

export default labSlice.reducer;

