import React from 'react';
import { MandiriLogo, DefaultCompanyLogo } from './Icons';
import { formatIndonesianDate } from '../utils/dateHelpers';
import { FileDown } from 'lucide-react';

export const OvertimePreview = ({ 
  state, 
  onGeneratePdf,
  companyLogoUrl
}) => {
  const { 
    employeeName, 
    roleName, 
    supervisorName, 
    supervisorRole, 
    formTitle, 
    formDescription, 
    overtimeList = [] 
  } = state;

  // Calculate totals
  const totalDays = overtimeList.length;
  const totalHours = overtimeList.reduce((acc, row) => acc + Number(row.overtimeHours || 0), 0);

  // Unit Kerja falls back to role or a standard unit like "DDL" (Digital Development Lab)
  // Let's display Role or a standard "DDL / Back End Developer"
  const unitKerja = roleName || "Digital Development Lab (DDL)";

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Action panel */}
      <div className="flex justify-end bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/80 p-3 rounded-2xl backdrop-blur-md no-print">
        <button 
          onClick={onGeneratePdf}
          className="text-xs font-bold bg-mandiri-blue text-white dark:bg-mandiri-yellow dark:text-gray-900 px-4 py-2 rounded-xl hover:bg-mandiri-blue/90 dark:hover:bg-mandiri-yellow/90 flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95"
        >
          <FileDown className="w-4 h-4" /> Export Overtime PDF
        </button>
      </div>

      {/* PDF Viewport Scroll Wrapper */}
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-xl relative min-w-0">
        
        {/* Overtime Document (Target of Portrait PDF) */}
        <div id="overtime-pdf-area" className="print-area font-sans text-black w-[720px] mx-auto bg-white p-6 leading-relaxed">
          
          {/* Top Header Banner */}
          <div className="flex justify-between items-center border-b border-black pb-3 mb-6">
            <MandiriLogo className="h-8 w-44 object-contain" />
            <div className="flex items-center gap-2">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt="Company" className="max-h-8 object-contain" />
              ) : (
                <DefaultCompanyLogo className="h-8 object-contain" />
              )}
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black border-b border-black pb-1 inline-block">
              {formTitle}
            </h2>
          </div>

          {/* Description Block */}
          <div className="text-xs text-justify text-black mb-4 leading-relaxed font-medium">
            {formDescription}
          </div>

          {/* Main Overtime Table */}
          <table className="w-full border-collapse border border-black text-center text-xs mb-8 excel-table select-none">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-black">
                <th className="border border-black p-2 w-[16%]">Nama</th>
                <th className="border border-black p-2 w-[22%]">Hari / Tanggal</th>
                <th className="border border-black p-2 w-[18%]">Unit Kerja</th>
                <th className="border border-black p-2 w-[16%]">Waktu Lembur</th>
                <th className="border border-black p-2 w-[20%] text-left">Pekerjaan Yang Dikerjakan</th>
                <th className="border border-black p-2 w-[8%]">Total (Jam)</th>
              </tr>
            </thead>
            <tbody>
              {overtimeList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-black p-4 text-center text-gray-400 italic">
                    Belum ada jadwal lembur yang ditambahkan.
                  </td>
                </tr>
              ) : (
                overtimeList.map((row, idx) => {
                  const isFirst = idx === 0;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/40">
                      {/* Vertically Merged Nama cell */}
                      {isFirst && (
                        <td 
                          rowSpan={totalDays} 
                          className="border border-black p-2 font-bold align-middle bg-white break-words"
                        >
                          {employeeName}
                        </td>
                      )}
                      
                      {/* Hari / Tanggal */}
                      <td className="border border-black p-2 font-medium">
                        {formatIndonesianDate(row.overtimeDate, true)}
                      </td>
                      
                      {/* Vertically Merged Unit Kerja cell */}
                      {isFirst && (
                        <td 
                          rowSpan={totalDays} 
                          className="border border-black p-2 align-middle bg-white break-words"
                        >
                          {unitKerja}
                        </td>
                      )}
                      
                      {/* Waktu Lembur */}
                      <td className="border border-black p-2 font-medium">
                        {row.timeRange}
                      </td>
                      
                      {/* Pekerjaan yang harus dikerjakan (auto wraps text) */}
                      <td className="border border-black p-2 text-left font-medium break-words max-w-[150px]">
                        {row.task}
                      </td>
                      
                      {/* Total Lembur (Jam) */}
                      <td className="border border-black p-2 font-bold">
                        {row.overtimeHours}
                      </td>
                    </tr>
                  );
                })
              )}
              
              {/* Bottom Summary Row */}
              <tr className="bg-gray-100 font-bold border-t border-black">
                <td className="border border-black p-2 text-left" colSpan="3">
                  TOTAL
                </td>
                <td className="border border-black p-2 text-center" colSpan="2">
                  {totalDays} Hari
                </td>
                <td className="border border-black p-2 text-center">
                  {totalHours}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer & Signature Section */}
          <div className="grid grid-cols-2 gap-4 mt-12 text-xs">
            {/* Pemohon Sign Block */}
            <div className="flex flex-col items-center text-center">
              <span className="mb-1">Pemohon,</span>
              <span className="text-[10px] text-gray-400 font-medium italic">(Tanda Tangan)</span>
              
              {/* Signature spacer */}
              <div className="h-16 my-2"></div>
              
              <span className="font-bold border-b border-black px-4 pb-0.5">{employeeName}</span>
              <span className="text-[10px] font-medium text-gray-500 mt-0.5">{roleName}</span>
            </div>

            {/* Supervisor Approval Block */}
            <div className="flex flex-col items-center text-center">
              <span className="mb-1">Disetujui Oleh,</span>
              <span className="text-[10px] text-gray-400 font-medium italic">(Tanda Tangan)</span>
              
              {/* Signature spacer */}
              <div className="h-16 my-2"></div>
              
              <span className="font-bold border-b border-black px-4 pb-0.5">{supervisorName}</span>
              <span className="text-[10px] font-medium text-gray-500 mt-0.5">{supervisorRole}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
