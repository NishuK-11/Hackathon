import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { reportApi } from '../../api/reportApi';
import { appointmentApi } from '../../api/appointmentApi';
import { DocumentViewerModal } from '../../components/patient/DocumentViewerModal';
import { Modal } from '../../components/patient/Modal';
import { showToast } from '../../redux/slices/uiSlice';
import { useTranslation } from '../../hooks/useTranslation';
import {
  FileText,
  UploadCloud,
  FileImage,
  Eye,
  Activity,
  Calendar,
  CheckCircle2,
  FolderOpen,
  FlaskConical,
  Award,
  Sparkles,
  Share2,
  Stethoscope,
  X,
  Check
} from 'lucide-react';

export const MyReportsScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const dispatchedLabReports = useSelector((state) => state.lab?.dispatchedReports || []);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all | lab | patient

  // Share Form States
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

  // Upload Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');
  const [file, setFile] = useState(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['medical-reports'],
    queryFn: () => reportApi.fetchMyReports(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['my-appointments-for-sharing'],
    queryFn: () => appointmentApi.getMyAppointments(),
  });

  const doctorsList = appointments
    .map((a) => {
      const docId = a.doctorId || (typeof a.doctor === 'object' ? a.doctor?._id : a.doctor);
      const docName = a.doctorName || a.doctor?.userId?.name || 'Dr. Specialist';
      const hosp = a.hospitalName || a.hospital?.name || '';
      return { id: docId, name: docName, hospital: hosp };
    })
    .filter((doc, idx, arr) => doc.id && arr.findIndex((d) => d.id === doc.id) === idx);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return reportApi.uploadReport(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-reports'] });
      dispatch(showToast({ message: 'Medical document uploaded successfully!', type: 'success' }));
      setIsUploadOpen(false);
      setTitle('');
      setFile(null);
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to upload document', type: 'error' }));
    },
  });

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      dispatch(showToast({ message: 'Please select a doctor to share reports with.', type: 'error' }));
      return;
    }
    if (selectedReportIds.length === 0) {
      dispatch(showToast({ message: 'Please select at least one report to share.', type: 'error' }));
      return;
    }

    try {
      setIsSharing(true);
      await reportApi.shareReports(selectedDoctorId, selectedReportIds);
      dispatch(showToast({ message: 'Reports successfully shared with the doctor!', type: 'success' }));
      queryClient.invalidateQueries({ queryKey: ['medical-reports'] });
      setIsShareModalOpen(false);
      setSelectedReportIds([]);
    } catch (err) {
      dispatch(showToast({ message: 'Failed to share reports.', type: 'error' }));
    } finally {
      setIsSharing(false);
    }
  };

  const toggleReportSelection = (id) => {
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    if (file) {
      formData.append('file', file);
    }

    uploadMutation.mutate(formData);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsViewerOpen(true);
  };

  const getReportTypeIcon = (reportType) => {
    const lower = (reportType || '').toLowerCase();
    if (lower.includes('lab') || lower.includes('blood') || lower.includes('pathology')) {
      return <Activity className="w-7 h-7 text-rose-400" />;
    }
    if (lower.includes('scan') || lower.includes('x-ray') || lower.includes('mri')) {
      return <FileImage className="w-7 h-7 text-teal-400" />;
    }
    return <FileText className="w-7 h-7 text-blue-400" />;
  };

  const reportCategories = ['Lab Report', 'Prescription', 'Scan / X-Ray', 'Discharge Summary', 'Other'];

  // Combine fetched patient reports with real-time dispatched lab reports
  const labReportsFormatted = dispatchedLabReports.map((lr) => ({
    id: lr.id,
    title: `${lr.testName} (Lab Result)`,
    type: 'Diagnostic Pathology Report',
    file: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop',
    fileType: 'pdf',
    createdAt: lr.dispatchedAt,
    isOfficialLab: true,
    labDetails: lr,
  }));

  const allReports = [...labReportsFormatted, ...reports];

  const filteredReports = allReports.filter((r) => {
    if (activeTab === 'lab') return r.isOfficialLab;
    if (activeTab === 'patient') return !r.isOfficialLab;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            {t.reports || 'My Reports & Records'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access digital pathology results, lab test values, and verified doctor prescriptions
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Share with Doctor</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glow-btn-primary text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t.uploadReport || 'Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          All Records ({allReports.length})
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'lab'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Diagnostic Lab ({labReportsFormatted.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'patient'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Uploaded by You ({reports.length})
        </button>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="medical-card p-6 h-48 animate-pulse bg-slate-900/50" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center">
          <FolderOpen className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Reports in this Section</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Uploaded prescriptions and authorized lab test results will automatically appear here.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl glow-btn-primary text-xs font-semibold"
          >
            Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleViewReport(report)}
              className={`medical-card medical-card-interactive p-5 flex flex-col justify-between group transition-all ${
                report.isOfficialLab
                  ? 'border-rose-500/30 hover:border-rose-500/60 bg-gradient-to-b from-rose-950/20 to-slate-900/80'
                  : 'hover:border-blue-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 border border-white/10 group-hover:scale-105 transition-transform">
                    {getReportTypeIcon(report.type)}
                  </div>
                  {report.isOfficialLab ? (
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                      <Award className="w-3 h-3" />
                      NABL Lab
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/20">
                      {(report.fileType || 'PDF').toUpperCase()}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {report.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {report.type}
                </p>

                {report.isOfficialLab && report.labDetails?.parameters && (
                  <div className="mt-3 p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Key Biomarkers</span>
                    {report.labDetails.parameters.slice(0, 2).map((p, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[130px]">{p.name}</span>
                        <span className={`font-mono font-bold ${p.flag === 'HIGH' || p.flag === 'LOW' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.value} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="flex items-center gap-1 text-blue-400 font-semibold group-hover:underline">
                  <Eye className="w-3 h-3" />
                  View
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Medical Report" maxWidth="md">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Report Title / Description
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Complete Blood Count (CBC) Report"
              required
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              {reportCategories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Attach File (PDF or Image)
            </label>
            <div className="rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/60 p-5 text-center hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                id="report-file-input"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="report-file-input" className="cursor-pointer">
                <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  {file ? file.name : 'Click to select or drag and drop document'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Supported formats: PDF, JPG, PNG (Max 15MB)
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl glow-btn-primary font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadMutation.isPending ? 'Uploading File...' : 'Upload Document'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Share Reports with Doctor Modal */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Records with Doctor" maxWidth="md">
        <form onSubmit={handleShareSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Select Doctor</span>
            </label>
            {doctorsList.length > 0 ? (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="">-- Choose Doctor from your consultations --</option>
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-slate-900">
                    {doc.name} {doc.hospital ? `(${doc.hospital})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                No previous doctor consultations found. Book an appointment to link doctors.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Reports to Share ({selectedReportIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
              {reports.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No uploaded reports available to share.</p>
              ) : (
                reports.map((r) => {
                  const reportId = r.id || r._id;
                  const isChecked = selectedReportIds.includes(reportId);
                  return (
                    <div
                      key={reportId}
                      onClick={() => toggleReportSelection(reportId)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isChecked
                          ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                          : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                          isChecked ? 'bg-teal-500 border-teal-500 text-black font-bold' : 'border-slate-500'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium truncate">{r.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{r.type}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSharing || !selectedDoctorId || selectedReportIds.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSharing ? 'Sharing Reports...' : `Share ${selectedReportIds.length} Selected Reports`}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Viewer Modal */}
      {selectedReport && (
        <DocumentViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          title={selectedReport.title}
          fileUrl={selectedReport.file}
          fileType={selectedReport.fileType}
        />
      )}
    </div>
  );
};
export default MyReportsScreen;
