import React from 'react';
import { FileDown, RefreshCw } from 'lucide-react';
import defaultCompanyLogo from '../assets/images/company-logo.png';
import defaultVendorLogo from '../assets/images/vendor-logo.png';
import { TEXTS } from '../utils/constants';

export const PreviewActionPanel = ({ 
  onExportPdf, 
  exportLabel = "Export PDF", 
  onResetEdits, 
  resetLabel = "Reset Edits" 
}) => {
  return (
    <div className="flex justify-between items-center bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/80 p-3 rounded-2xl backdrop-blur-md no-print">
      <div className="flex items-center gap-2">
        {onResetEdits ? (
          <>
            <span className="text-xs font-bold text-gray-500">Sheet Options:</span>
            <button 
              onClick={onResetEdits}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-all shadow-sm"
              title="Reset all edited spreadsheet cell hours"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {resetLabel}
            </button>
          </>
        ) : (
          <div />
        )}
      </div>
      <button 
        onClick={onExportPdf}
        className="text-xs font-bold bg-mandiri-blue text-white dark:bg-mandiri-yellow dark:text-gray-900 px-4 py-2 rounded-xl hover:bg-mandiri-blue/90 dark:hover:bg-mandiri-yellow/90 flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95"
      >
        <FileDown className="w-4 h-4" /> {exportLabel}
      </button>
    </div>
  );
};

export const PreviewViewport = ({ children }) => {
  return (
    <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-xl relative min-w-0">
      {children}
    </div>
  );
};

export const PreviewBrandingHeader = ({ type, companyLogoUrl, vendorLogoUrl }) => {
  if (type === 'overtime') {
    return (
      <div className="flex justify-end items-center pb-3 mb-6">
        <img 
          src={companyLogoUrl || defaultCompanyLogo} 
          alt="Company Logo" 
          className="h-8 object-contain" 
        />
      </div>
    );
  }

  // Default to 'timesheet'
  return (
    <div className="flex items-center gap-4 mb-3">
      {[
        { src: companyLogoUrl || defaultCompanyLogo, alt: "Company Logo" },
        { src: vendorLogoUrl || defaultVendorLogo, alt: "Vendor Logo" }
      ].map((logo, index) => (
        <img
          key={index}
          src={logo.src}
          alt={logo.alt}
          className="h-7 max-w-[120px] object-contain"
        />
      ))}
    </div>
  );
};

export const SignatureBox = ({ title, name, role, signatureUrl, subtitle = TEXTS.TANDA_TANGAN }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-1">{title}</span>
      {signatureUrl ? (
        <div className="h-16 my-2 flex items-center justify-center">
          <img src={signatureUrl} alt={title} className="max-h-12 object-contain" />
        </div>
      ) : (
        <>
          <span className="text-[10px] text-gray-400 font-medium italic">{subtitle}</span>
          <div className="h-16 my-2" />
        </>
      )}
      <span className="font-bold border-b border-black px-4 pb-0.5">{name}</span>
      <span className="text-[10px] font-medium text-gray-500 mt-0.5">{role}</span>
    </div>
  );
};
