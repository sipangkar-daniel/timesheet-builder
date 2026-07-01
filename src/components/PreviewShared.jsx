import { FileDown, ZoomIn, ZoomOut } from 'lucide-react';
import defaultCompanyLogo from '../assets/images/company-logo.png';
import defaultVendorLogo from '../assets/images/vendor-logo.png';
import {TEXTS} from "../utils/constants.js";

export const UnduhButton = ({ onClick, label }) => {
  return (
    <button 
      onClick={onClick}
      className="text-xs font-bold bg-mandiri-blue text-white dark:bg-mandiri-yellow dark:text-gray-900 px-4 py-2 rounded-xl hover:bg-mandiri-blue/90 dark:hover:bg-mandiri-yellow/90 flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
    >
      <FileDown className="w-4 h-4" /> {label}
    </button>
  );
};

export const FloatingControls = ({ 
  onExportPdf, 
  exportLabel = TEXTS.DOWNLOAD_PDF,
  zoom = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomReset
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 no-print flex items-center gap-3">
      {/* Zoom Controls */}
      {onZoomIn && onZoomOut && onZoomReset && (
        <div className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-800/60 rounded-xl px-2 py-1 bg-white dark:bg-gray-900 shadow-md select-none opacity-90 hover:opacity-100 transition-opacity">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 disabled:opacity-30 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span 
            onClick={onZoomReset}
            className="text-xs font-bold text-gray-600 dark:text-gray-400 min-w-[36px] text-center cursor-pointer hover:text-mandiri-blue dark:hover:text-mandiri-yellow transition-colors"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 2.0}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 disabled:opacity-30 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <UnduhButton onClick={onExportPdf} label={exportLabel} />
    </div>
  );
};


export const PreviewViewport = ({ children }) => {
  return (
    <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-xl relative min-w-0 custom-scrollbar">
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

export const SignatureBox = ({ title, name, role, signatureUrl }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-1">{title}</span>
      {signatureUrl ? (
        <div className="h-16 my-2 flex items-center justify-center overflow-hidden">
          <img
            src={signatureUrl}
            alt={title}
            style={{ maxHeight: '48px', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>
      ) : (
        <>
          <span className="text-[10px] text-gray-400 font-medium italic">{}</span>
          <div className="h-16 my-2" />
        </>
      )}
      <span className="font-bold px-4">{name}</span>
      <span className="text-[10px] font-medium text-gray-500 mt-0.5">{role}</span>
    </div>
  );
};
