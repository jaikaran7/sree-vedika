import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { toErrorMessage } from '../../lib/api';
import {
  captureElementToPdf,
  downloadPdf,
  printDocumentPreview,
  shareDocumentViaWhatsApp,
  type DocumentType,
} from './documentActions';

const A4_WIDTH_PX = 794;

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  docType: DocumentType;
  customerName: string;
  phone: string;
  filename: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

export function DocumentPreviewModal({
  open,
  onClose,
  title,
  docType,
  customerName,
  phone,
  filename,
  loading = false,
  error = null,
  onRetry,
  children,
}: DocumentPreviewModalProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState<'whatsapp' | 'print' | 'download' | null>(null);

  const updateScale = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const padding = 32;
    const available = container.clientWidth - padding;
    setScale(Math.min(1, available / A4_WIDTH_PX));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, [open, updateScale, loading, error]);

  const getPdf = useCallback(async () => {
    const element = documentRef.current;
    if (!element) throw new Error('Document preview is not ready');
    return captureElementToPdf(element, filename);
  }, [filename]);

  const handleDownload = async () => {
    setBusy('download');
    try {
      const pdf = await getPdf();
      downloadPdf(pdf);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error(toErrorMessage(err, 'Could not generate PDF'));
    } finally {
      setBusy(null);
    }
  };

  const handlePrint = async () => {
    setBusy('print');
    try {
      printDocumentPreview();
    } finally {
      setBusy(null);
    }
  };

  const handleWhatsApp = async () => {
    setBusy('whatsapp');
    try {
      const pdf = await getPdf();
      await shareDocumentViaWhatsApp({ phone, customerName, docType, pdf });
      toast.info('PDF downloaded. Tap the attachment icon in WhatsApp to attach it.', { duration: 6000 });
    } catch (err) {
      toast.error(toErrorMessage(err, 'Could not prepare WhatsApp share'));
    } finally {
      setBusy(null);
    }
  };

  if (!open) return null;

  const actionDisabled = loading || !!error || busy !== null;

  return createPortal(
    <div className="document-preview-portal fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={`${title} preview`}>
      <div
        className="document-preview-chrome absolute inset-0 bg-ink/50 backdrop-blur-[3px] animate-pop dark:bg-black/70"
        onClick={onClose}
      />

      <div className="document-preview-chrome relative ml-auto flex h-full w-full animate-rise flex-col bg-[#e5e0d8] shadow-2xl dark:bg-[#1a1410] lg:max-w-[min(920px,92vw)]">
        <header className="document-preview-chrome flex shrink-0 items-center justify-between border-b border-line/80 bg-ivory/95 px-4 py-3 backdrop-blur-sm dark:border-line-dark dark:bg-bg-dark/95">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500">Document Preview</p>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
          >
            ✕
          </button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
          {loading && <LoadingState message={`Loading ${title.toLowerCase()}…`} />}
          {error && <ErrorState message={error} onRetry={onRetry} />}
          {!loading && !error && (
            <div className="flex justify-center">
              <div
                className="document-print-area origin-top shadow-[0_8px_40px_rgba(36,26,18,0.18)]"
                style={{
                  transform: `scale(${scale})`,
                  width: A4_WIDTH_PX,
                  marginBottom: scale < 1 ? -(1123 * (1 - scale)) : 0,
                }}
              >
                <div ref={documentRef}>{children}</div>
              </div>
            </div>
          )}
        </div>

        <footer className="document-preview-chrome sticky bottom-0 shrink-0 border-t border-line bg-ivory/95 px-3 py-3 backdrop-blur-md dark:border-line-dark dark:bg-bg-dark/95 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto grid max-w-lg grid-cols-2 gap-2 sm:max-w-none sm:flex sm:flex-wrap sm:justify-center">
            <Button
              variant="primary"
              className="col-span-2 sm:col-span-1 sm:min-w-[10.5rem]"
              disabled={actionDisabled}
              onClick={handleWhatsApp}
            >
              {busy === 'whatsapp' ? 'Preparing…' : 'Send via WhatsApp'}
            </Button>
            <Button variant="secondary" disabled={actionDisabled} onClick={handlePrint}>
              {busy === 'print' ? 'Preparing…' : 'Print'}
            </Button>
            <Button variant="secondary" disabled={actionDisabled} onClick={handleDownload}>
              {busy === 'download' ? 'Generating…' : 'Download PDF'}
            </Button>
            <Button variant="ghost" disabled={busy !== null} onClick={onClose}>
              Close
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
