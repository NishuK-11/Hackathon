import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  updateOrderStatus,
  dispatchReport,
  addCatalogTest,
} from '../redux/slices/labSlice';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import {
  FlaskConical,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  FileCheck2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Plus,
  Send,
  Download,
  Eye,
  LogOut,
  Calendar,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export const LabDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const { orders, dispatchedReports, testCatalog } = useSelector((state) => state.lab);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'builder' | 'dispatched' | 'catalog'
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Report Builder Form State
  const [builderParams, setBuilderParams] = useState([
    { name: 'Hemoglobin (Hb)', value: 13.8, unit: 'g/dL', normalRange: '12.0 - 17.5', flag: 'NORMAL' },
    { name: 'Total Leukocyte (WBC) Count', value: 7200, unit: 'cells/mcL', normalRange: '4,000 - 11,000', flag: 'NORMAL' },
    { name: 'Platelet Count', value: 2.4, unit: 'lakh/mcL', normalRange: '1.5 - 4.5', flag: 'NORMAL' },
    { name: 'Fasting Plasma Glucose', value: 92, unit: 'mg/dL', normalRange: '70 - 99', flag: 'NORMAL' },
    { name: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', normalRange: '0.7 - 1.3', flag: 'NORMAL' },
    { name: 'Total Cholesterol', value: 185, unit: 'mg/dL', normalRange: '< 200', flag: 'NORMAL' },
  ]);

  const [clinicalNotes, setClinicalNotes] = useState('All biological parameters within normal physiological thresholds. Recommended routine 6-month follow-up.');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    category: 'Biochemistry',
    price: '',
    sampleType: 'Serum',
    tatHours: 4,
    description: '',
  });

  // Calculate Metrics
  const totalOrders = orders.length;
  const pendingCollection = orders.filter((o) => o.status === 'PENDING_SAMPLE').length;
  const inTesting = orders.filter((o) => o.status === 'IN_TESTING' || o.status === 'SAMPLE_COLLECTED').length;
  const completedToday = dispatchedReports.length + orders.filter((o) => o.status === 'COMPLETED').length;

  const handleParamChange = (index, field, val) => {
    const updated = [...builderParams];
    updated[index][field] = val;

    // Check abnormal flags automatically
    if (field === 'value') {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (updated[index].name.includes('Hemoglobin') && (numVal < 12.0 || numVal > 17.5)) {
          updated[index].flag = numVal < 12.0 ? 'LOW' : 'HIGH';
        } else if (updated[index].name.includes('Glucose') && (numVal > 100 || numVal < 70)) {
          updated[index].flag = numVal > 125 ? 'CRITICAL' : 'HIGH';
        } else if (updated[index].name.includes('Platelet') && (numVal < 1.5 || numVal > 4.5)) {
          updated[index].flag = numVal < 1.0 ? 'CRITICAL' : 'LOW';
        } else if (updated[index].name.includes('Creatinine') && numVal > 1.3) {
          updated[index].flag = 'HIGH';
        } else {
          updated[index].flag = 'NORMAL';
        }
      }
    }

    setBuilderParams(updated);
  };

  const handleAdvanceStatus = (orderId, currentStatus) => {
    let nextStatus = 'SAMPLE_COLLECTED';
    if (currentStatus === 'PENDING_SAMPLE') nextStatus = 'SAMPLE_COLLECTED';
    else if (currentStatus === 'SAMPLE_COLLECTED') nextStatus = 'IN_TESTING';
    else if (currentStatus === 'IN_TESTING') nextStatus = 'COMPLETED';

    dispatch(updateOrderStatus({ orderId, status: nextStatus }));
    toast.info(`Order status updated to: ${nextStatus.replace('_', ' ')}`);
  };

  const handleAuthorizeAndDispatch = (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Please select an active order to authorize');
      return;
    }

    const reportPayload = {
      orderId: selectedOrder.id,
      patientId: selectedOrder.patientId,
      patientName: selectedOrder.patientName,
      testName: selectedOrder.tests?.join(' + ') || 'Comprehensive Diagnostic Panel',
      referringDoctor: selectedOrder.referringDoctor,
      hospitalName: selectedOrder.hospitalName,
      parameters: builderParams,
      clinicalNotes: clinicalNotes,
      authorizedBy: user?.name || 'Dr. Ananya Ray, MD (Pathology)',
      licenseNo: 'NABL-LAB-2026-X88',
      barcode: selectedOrder.sampleBarcode || 'BC-LAB-9921',
    };

    dispatch(dispatchReport(reportPayload));
    toast.success('Report Authorized & Dispatched! Synced with Patient & Doctor Portals.');
    setActiveTab('dispatched');
  };

  const handleAddCatalogSubmit = (e) => {
    e.preventDefault();
    if (!newTest.name || !newTest.price) {
      toast.error('Please fill required test fields');
      return;
    }

    dispatch(
      addCatalogTest({
        id: 'test_' + Date.now(),
        ...newTest,
        price: Number(newTest.price),
      })
    );
    toast.success('New diagnostic test added to catalog!');
    setIsCatalogModalOpen(false);
    setNewTest({
      name: '',
      category: 'Biochemistry',
      price: '',
      sampleType: 'Serum',
      tatHours: 4,
      description: '',
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.patientName && o.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.sampleBarcode && o.sampleBarcode.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && o.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A101D]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 shadow-lg shadow-rose-500/25">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  MediReach <span className="text-rose-400">Pathology & Diagnostic Lab</span>
                </h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  NABL ACCREDITED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Hospital Diagnostic LIMS • Automated Specimen Tracking & Digital Dispatch
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-xl">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-slate-300 font-medium">Analyzer: Sysmex XN-1000 Online</span>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="text-right hidden md:block">
                <span className="text-xs font-bold text-white block">{user?.name || 'Lab Technician Officer'}</span>
                <span className="text-[10px] text-rose-400 font-semibold">Senior Pathologist MLT</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="medical-card p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Total Test Orders</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{totalOrders}</h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] text-blue-300 font-medium mt-3 block">From OPD & Inpatient Doctor orders</span>
          </div>

          <div className="medical-card p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Sample Queue / Phlebotomy</span>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCollection}</h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-3 block">Awaiting barcode scan & tube prep</span>
          </div>

          <div className="medical-card p-5 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Under Analysis (In-Testing)</span>
                <h3 className="text-2xl font-extrabold text-rose-400 mt-1">{inTesting}</h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] text-rose-300 font-medium mt-3 block">Centrifuge / Spectrometry running</span>
          </div>

          <div className="medical-card p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Dispatched Reports Today</span>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{completedToday}</h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] text-emerald-300 font-medium mt-3 block">Sent to Patient & Doctor Portals</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Specimen & Order Queue ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'builder'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Digital Parameter Builder</span>
              {selectedOrder && (
                <span className="ml-1 px-2 py-0.5 rounded-md bg-white/20 text-[10px]">
                  {selectedOrder.patientName}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dispatched')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dispatched'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Dispatched Archive ({dispatchedReports.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Test Catalog & Tariffs ({testCatalog.length})</span>
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Test</span>
            </button>
          )}
        </div>

        {/* TAB 1: SPECIMEN & ORDER QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="medical-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patient, order #, or sample barcode..."
                  className="w-full rounded-xl bg-slate-900 border border-white/10 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Status:
                </span>
                {['ALL', 'PENDING_SAMPLE', 'SAMPLE_COLLECTED', 'IN_TESTING', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      filterStatus === st
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="medical-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-4">Order ID / Barcode</th>
                      <th className="p-4">Patient Details</th>
                      <th className="p-4">Referring Doctor / Hospital</th>
                      <th className="p-4">Tests Ordered</th>
                      <th className="p-4">Urgency</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Workflow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No laboratory test orders match current criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-bold text-white">{order.orderNumber}</div>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-rose-400 mt-1">
                              <QrCode className="w-3.5 h-3.5" />
                              <span>{order.sampleBarcode}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-white">{order.patientName}</div>
                            <div className="text-[11px] text-slate-400">
                              {order.patientAge} yrs • {order.patientGender}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="text-slate-200">{order.referringDoctor}</div>
                            <div className="text-[11px] text-slate-400">{order.hospitalName}</div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {order.tests?.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 text-[10px] font-medium"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-4">
                            {order.urgency === 'STAT' ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> STAT (Urgent)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium text-[10px]">
                                Routine
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                order.status === 'COMPLETED'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : order.status === 'IN_TESTING'
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                  : order.status === 'SAMPLE_COLLECTED'
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              }`}
                            >
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-4 text-right space-x-2">
                            {order.status !== 'COMPLETED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStatus(order.id, order.status);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-white/10"
                              >
                                {order.status === 'PENDING_SAMPLE'
                                  ? 'Mark Sample Collected'
                                  : order.status === 'SAMPLE_COLLECTED'
                                  ? 'Start In-Testing'
                                  : 'Advance'}
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setActiveTab('builder');
                              }}
                              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-md"
                            >
                              Enter Results
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL PARAMETER BUILDER */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selected Order Summary Card */}
            <div className="medical-card p-5 space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-sm">Specimen Details</h3>
                <span className="font-mono text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {selectedOrder?.sampleBarcode || 'N/A'}
                </span>
              </div>

              {selectedOrder ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Patient Name</span>
                    <span className="text-white font-bold text-sm">{selectedOrder.patientName}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {selectedOrder.patientAge} yrs • {selectedOrder.patientGender} • ID: {selectedOrder.patientId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Tests Prescribed</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedOrder.tests?.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Referring Physician</span>
                    <span className="text-slate-200 font-medium">{selectedOrder.referringDoctor}</span>
                    <span className="text-slate-400 block text-[11px]">{selectedOrder.hospitalName}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <span className="text-slate-400 block text-[11px]">Urgency / Priority</span>
                    <span className={`font-bold ${selectedOrder.urgency === 'STAT' ? 'text-rose-400' : 'text-slate-300'}`}>
                      {selectedOrder.urgency}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Please select an order from the queue to process parameters.</p>
              )}
            </div>

            {/* Parameter Entry & Normal Range Table */}
            <div className="lg:col-span-2 medical-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Pathology Result Formulator</h2>
                  <p className="text-xs text-slate-400">
                    Enter clinical test readings. Abnormal biological values are dynamically flagged.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Ready for Signature
                </span>
              </div>

              {/* Parameter Rows */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-2">
                  <span className="col-span-5">Biomarker / Test Name</span>
                  <span className="col-span-3">Measured Value</span>
                  <span className="col-span-2">Biological Reference</span>
                  <span className="col-span-2 text-right">Diagnostic Flag</span>
                </div>

                {builderParams.map((param, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-900/70 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors"
                  >
                    <div className="col-span-5">
                      <span className="font-semibold text-white text-xs block truncate">{param.name}</span>
                      <span className="text-[10px] text-slate-400">Unit: {param.unit}</span>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.01"
                        value={param.value}
                        onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                        className="w-full rounded-lg bg-black/60 border border-white/15 px-2.5 py-1.5 text-xs text-white font-mono font-bold outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="col-span-2 text-slate-300 font-mono text-[11px]">
                      {param.normalRange}
                    </div>

                    <div className="col-span-2 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          param.flag === 'NORMAL'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : param.flag === 'CRITICAL'
                            ? 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {param.flag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pathologist Clinical Impression / Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pathologist Clinical Impression & Comments
                </label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Dispatch Action */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span>Authorizer: </span>
                  <span className="text-white font-bold">{user?.name || 'Dr. Ananya Ray, MD Path'}</span>
                  <span className="text-rose-400 block text-[10px]">Verified NABL Electronic Signature</span>
                </div>

                <button
                  onClick={handleAuthorizeAndDispatch}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Authorize & Dispatch to Patient & Hospital</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISPATCHED ARCHIVE */}
        {activeTab === 'dispatched' && (
          <div className="space-y-4">
            <div className="medical-card p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Dispatched Laboratory Certificates</h3>
                <p className="text-xs text-slate-400">
                  Archive of verified lab reports uploaded directly to the patient's record
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Total Dispatched: {dispatchedReports.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dispatchedReports.map((report) => (
                <div
                  key={report.id}
                  className="medical-card p-5 border-rose-500/30 bg-gradient-to-b from-rose-950/15 to-slate-900/80 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {report.barcode}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Dispatched
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2">{report.testName}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Patient: {report.patientName}</p>
                    <p className="text-[11px] text-slate-400">Ref: {report.referringDoctor}</p>

                    <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Biomarkers</span>
                      {report.parameters?.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className="text-slate-300 truncate max-w-[140px]">{p.name}</span>
                          <span className={`font-mono font-bold ${p.flag === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {p.value} {p.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => toast.success(`Viewing Certificate for ${report.patientName}`)}
                      className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TEST CATALOG & TARIFFS */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="medical-card p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Laboratory Test Directory & Pricing</h3>
                <p className="text-xs text-slate-400">
                  Standardized pathology test offerings, specimen tube requirements, and turnaround times (TAT)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testCatalog.map((test) => (
                <div key={test.id} className="medical-card p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/25">
                        {test.category}
                      </span>
                      <span className="text-base font-extrabold text-white">₹{test.price}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2">{test.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{test.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sample Tube:</span>
                      <span className="font-medium text-slate-200">{test.sampleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Turnaround Time:</span>
                      <span className="font-medium text-teal-400">{test.tatHours} Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fasting Needed:</span>
                      <span className="font-medium text-amber-400">{test.fastingRequired ? 'Yes (8-10 hrs)' : 'No'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add New Test Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0D1424] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Add Test to Laboratory Catalog</h3>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCatalogSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Test Name</label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="E.g., Serum Vitamin D (25-OH)"
                  required
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newTest.category}
                    onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-white outline-none focus:border-rose-500"
                  >
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Endocrinology">Endocrinology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={newTest.price}
                    onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                    placeholder="E.g., 900"
                    required
                    className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Specimen Tube</label>
                  <input
                    type="text"
                    value={newTest.sampleType}
                    onChange={(e) => setNewTest({ ...newTest, sampleType: e.target.value })}
                    placeholder="E.g., Serum / EDTA"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Turnaround (Hrs)</label>
                  <input
                    type="number"
                    value={newTest.tatHours}
                    onChange={(e) => setNewTest({ ...newTest, tatHours: Number(e.target.value) })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brief Description</label>
                <textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  placeholder="Primary diagnostic indications and clinical utility..."
                  rows={2}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md"
                >
                  Add Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDashboard;
