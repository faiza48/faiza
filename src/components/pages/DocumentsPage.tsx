import React, { useState } from 'react';
import {
  Folder,
  Upload,
  FileText,
  Download,
  Eye,
  Edit3,
  Trash2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import type { DailyraState, DocumentItem } from '../../types/dailyra';
import { Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface DocumentsPageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateDocument: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateDocument: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

const DOC_CATEGORIES: DocumentItem['category'][] = [
  'Personal',
  'Family',
  'Financial',
  'Health',
  'Other',
];

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  state,
  darkMode,
  onCreateDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [selectedCat, setSelectedCat] = useState<'All' | DocumentItem['category']>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('Personal');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);

  const openUpload = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('Personal');
    setFileName('');
    setFileSize('1.5 MB');
    setExpiryDate('');
    setNotes('');
    setDataUrl(undefined);
    setIsUploadOpen(true);
  };

  const openRename = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setFileName(doc.fileName);
    setFileSize(doc.fileSize);
    setExpiryDate(doc.expiryDate || '');
    setNotes(doc.notes);
    setDataUrl(doc.dataUrl);
    setIsUploadOpen(true);
  };

  const handleDownload = (doc: DocumentItem) => {
    const content =
      doc.dataUrl ||
      `data:text/plain;charset=utf-8,${encodeURIComponent(
        `DAILYRA AUTHENTICATED VAULT DOCUMENT\nTitle: ${doc.title}\nFile: ${doc.fileName}\nCategory: ${doc.category}\nUploaded: ${doc.uploadedAt}\nNotes: ${doc.notes}`
      )}`;
    const a = document.createElement('a');
    a.href = content;
    a.download = doc.fileName || 'document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredDocs = state.documents.filter(
    (d) => selectedCat === 'All' || d.category === selectedCat
  );

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
  }`;

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#234732] dark:text-[#8BD4A4] font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Single-Admin Document Vault</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Personal & Family Documents
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Store passports, IDs, insurance policies, school records, and certificates behind authenticated access.
          </p>
        </div>
        <button
          type="button"
          onClick={openUpload}
          className="px-4 py-2.5 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', ...DOC_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap ${
              selectedCat === cat
                ? 'bg-[#234732] text-white font-semibold'
                : 'bg-[#F2EFE9] dark:bg-[#18231D] text-[#5A625D] dark:text-[#A9B8AF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState
          title="Your document vault is empty."
          subtitle="Upload important personal, family, financial, or health documents for safe keeping."
          actionLabel="Upload Document"
          onAction={openUpload}
          icon={<Folder className="w-5 h-5" />}
          darkMode={darkMode}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`${cardSurface} rounded-2xl border p-5 flex flex-col justify-between gap-4`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#E4E9E1] text-[#234732] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{doc.title}</h3>
                  </div>
                  <p className="text-xs text-[#6E7671] mt-0.5 truncate">
                    {doc.fileName} · {doc.category} · {doc.fileSize}
                  </p>
                  <p className="text-xs text-[#7A827D] mt-2 leading-relaxed">
                    {doc.notes}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE3] dark:border-[#24332A] text-[11px] text-[#7A827D]">
                <span className="flex items-center gap-1 tabular-nums">
                  <Lock className="w-3 h-3 text-[#234732]" />
                  Uploaded {doc.uploadedAt}
                  {doc.expiryDate ? ` · Expires ${doc.expiryDate}` : ''}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="px-2.5 py-1 rounded-lg bg-[#F2EFE9] dark:bg-[#223129] text-[#1F2421] dark:text-white font-medium flex items-center gap-1 hover:bg-[#E5E0D5]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-lg hover:bg-[#F2EFE9]"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openRename(doc)}
                    className="p-1.5 rounded-lg hover:bg-[#F2EFE9]"
                    title="Rename or recategorize"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingDocId(doc.id)}
                    className="p-1.5 rounded-lg hover:text-[#B84A4A]"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={editingDoc ? 'Edit Document Metadata' : 'Upload to Private Vault'}
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              title,
              category,
              fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
              fileSize,
              expiryDate: expiryDate || undefined,
              notes,
              dataUrl,
            };
            if (editingDoc) {
              await onUpdateDocument(editingDoc.id, payload);
            } else {
              await onCreateDocument(payload);
            }
            setIsUploadOpen(false);
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={inputClass}
              >
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Expiry / Renewal Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Attach File</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setDataUrl(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
              className="w-full text-xs text-[#6E7671] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#E4E9E1] file:text-[#1E3F2B]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 rounded-xl text-xs border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white"
            >
              Save Document
            </button>
          </div>
        </form>
      </Modal>

      {/* Authenticated Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
        subtitle="Authenticated single-admin vault preview"
        darkMode={darkMode}
      >
        {previewDoc && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[#F8F6F1] dark:bg-[#121B16] border border-[#E2DDD2] dark:border-[#28382E] space-y-2 text-xs">
              <p>
                <strong>File Name:</strong> {previewDoc.fileName}
              </p>
              <p>
                <strong>Category:</strong> {previewDoc.category}
              </p>
              <p>
                <strong>Size:</strong> {previewDoc.fileSize}
              </p>
              <p>
                <strong>Uploaded:</strong> {previewDoc.uploadedAt}
              </p>
              {previewDoc.expiryDate && (
                <p>
                  <strong>Expiry Date:</strong> {previewDoc.expiryDate}
                </p>
              )}
              <p className="pt-2 border-t border-[#E2DDD2] dark:border-[#28382E]">
                {previewDoc.notes}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDownload(previewDoc)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Protected Copy</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingDocId)}
        title="Delete this document from your vault?"
        message="This action cannot be undone."
        onConfirm={() => {
          if (deletingDocId) onDeleteDocument(deletingDocId);
        }}
        onCancel={() => setDeletingDocId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
