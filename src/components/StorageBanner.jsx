import { useState } from 'react';
import { HardDrive, Shield, X } from 'lucide-react';

const CONSENT_KEY = 'timesheet_storage_consent';

export const useStorageConsent = () => {
  const [consent, setConsent] = useState(() => {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  });

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setConsent(true);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'false');
    setConsent(false);
  };

  const hasAnswered = localStorage.getItem(CONSENT_KEY) !== null;

  return { consent, accept, decline, hasAnswered };
};

export const StorageConsentBanner = ({ onAccept, onDecline }) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const dismiss = (fn) => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      fn();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-300 no-print ${
        leaving ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon + Text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-mandiri-blue/10 dark:bg-blue-900/30 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-mandiri-blue dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Simpan data Anda secara lokal?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                Kami menggunakan <strong>localStorage</strong> untuk menyimpan informasi dasar (nama karyawan, jabatan, dll.) dan gambar lampiran (logo, tanda tangan)
                sehingga Anda tidak perlu mengisinya kembali setiap membuka aplikasi ini.{' '}
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Shield className="w-3 h-3" />
                  Data tersimpan hanya di perangkat Anda.
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => dismiss(onDecline)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Tolak
            </button>
            <button
              onClick={() => dismiss(onAccept)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-mandiri-blue text-white hover:bg-mandiri-blue/90 transition-colors shadow-sm"
            >
              Terima &amp; Simpan
            </button>
            <button
              onClick={() => dismiss(onDecline)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
