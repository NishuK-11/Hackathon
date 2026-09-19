import React from 'react';
import { Modal } from './Modal';
import { Download, ExternalLink, FileText } from 'lucide-react';

export const DocumentViewerModal = ({
  isOpen,
  onClose,
  title,
  fileUrl,
  fileType,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="flex flex-col items-center">
        {fileType === 'image' ? (
          <div className="w-full max-h-[65vh] overflow-hidden rounded-xl border border-white/10 bg-black/40 flex items-center justify-center p-2">
            <img
              src={fileUrl}
              alt={title}
              className="max-h-[60vh] w-auto object-contain rounded-lg shadow-xl"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&fit=crop';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-[60vh] rounded-xl border border-white/10 overflow-hidden bg-slate-900">
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title={title}
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="w-full mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Format: {fileType ? fileType.toUpperCase() : 'PDF'}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tab</span>
            </a>
            <a
              href={fileUrl}
              download={title}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glow-btn-primary text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewerModal;
